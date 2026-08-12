import { AsyncLocalStorage } from 'node:async_hooks';
import { timingSafeEqual } from 'node:crypto';
import path from 'node:path';

const TENANT_ID=/^[a-z0-9][a-z0-9-]{0,62}$/;
const text=(value,max=1000)=>String(value??'').trim().slice(0,max);
const list=(value,max=500)=>[...new Set((Array.isArray(value)?value:[]).map(item=>text(item,max)).filter(Boolean))];
const loopback=value=>{const address=text(value,200).toLowerCase();return address==='::1'||address==='localhost'||address==='127.0.0.1'||address.startsWith('127.')||address.startsWith('::ffff:127.');};
function fail(status,code,message,details=null){throw Object.assign(new Error(message),{status,code,details});}
function sameSecret(received,expected){const a=Buffer.from(text(received,1000)),b=Buffer.from(text(expected,1000));return a.length===b.length&&a.length>0&&timingSafeEqual(a,b);}
export function normalizeTenantId(value){const id=text(value,63).toLowerCase();if(!TENANT_ID.test(id))fail(400,'tenant-id-invalid','Identificativo tenant non valido');return id;}
export function tenantDirectory(env=process.env){
  const enabled=env.ICTC_MULTI_TENANT==='1';
  if(!enabled)return Object.freeze({schemaVersion:'1.0.0',enabled:false,defaultTenantId:'local-default',tenants:[{id:'local-default',enabled:true,subjects:[],groups:[]}],limitations:['Single-tenant compatibility mode: runtime authority remains bound to the canonical runtime root.']});
  let raw;try{raw=JSON.parse(env.ICTC_TENANT_DIRECTORY_JSON||'{}');}catch{fail(503,'tenant-directory-invalid','Directory tenant non valida');}
  const tenants=[];const seen=new Set();
  for(const item of Array.isArray(raw.tenants)?raw.tenants:[]){
    const id=normalizeTenantId(item?.id);if(seen.has(id))fail(503,'tenant-directory-duplicate','Tenant duplicato nella directory',{tenantId:id});seen.add(id);
    tenants.push({id,enabled:item?.enabled!==false,subjects:list(item?.subjects,240),groups:list(item?.groups,500)});if(tenants.length>=500)break;
  }
  if(!tenants.length)fail(503,'tenant-directory-empty','Multi-tenancy abilitata senza tenant configurati');
  const requestedDefault=text(raw.defaultTenantId,63).toLowerCase();const defaultTenantId=requestedDefault&&seen.has(requestedDefault)?requestedDefault:tenants[0].id;
  return Object.freeze({schemaVersion:'1.0.0',enabled:true,defaultTenantId,tenants:Object.freeze(tenants),limitations:['Tenant routing is deployment configuration and does not itself prove external identity assurance.']});
}
function groupValues(headers,env){const name=text(env.ICTC_TENANT_GROUPS_HEADER||'x-ictc-groups',80).toLowerCase();const raw=headers?.[name];const joined=Array.isArray(raw)?raw.join(';'):text(raw,20000);return new Set(joined.split(/[;,|\s]+/).map(v=>v.trim()).filter(Boolean));}
function subjectValue(headers,env){const configured=text(env.ICTC_TENANT_SUBJECT_HEADER||'x-ictc-subject',80).toLowerCase();return text(headers?.[configured]||headers?.['x-ictc-actor-id'],240);}
export function resolveRequestTenant(request,env=process.env,directory=tenantDirectory(env)){
  if(!directory.enabled)return{tenantId:directory.defaultTenantId,routing:'single-tenant'};
  const mode=env.ICTC_IDENTITY_MODE==='trusted-header'?'trusted-header':'local';
  if(mode==='local'){
    if(!loopback(request?.socket?.remoteAddress))fail(403,'tenant-local-loopback-only','Tenant locale disponibile solo da loopback');
    const requested=text(request?.headers?.['x-ictc-tenant'],63).toLowerCase();
    if(requested&&env.ICTC_ALLOW_LOCAL_TENANT_SWITCH==='1'){
      const tenant=directory.tenants.find(item=>item.id===requested&&item.enabled);if(!tenant)fail(403,'tenant-unavailable','Tenant locale non disponibile');
      return{tenantId:tenant.id,routing:'local-explicit-dev'};
    }
    const tenant=directory.tenants.find(item=>item.id===directory.defaultTenantId&&item.enabled);if(!tenant)fail(503,'tenant-default-unavailable','Tenant di default non disponibile');
    return{tenantId:tenant.id,routing:'local-default'};
  }
  const expected=text(env.ICTC_TRUSTED_PROXY_SECRET,1000);if(expected.length<32)fail(503,'trusted-proxy-not-configured','Proxy di identità non configurato');
  if(!sameSecret(request?.headers?.['x-ictc-proxy-secret'],expected))fail(401,'trusted-proxy-required','Richiesta non proveniente dal proxy attendibile');
  const subject=subjectValue(request?.headers||{},env),groups=groupValues(request?.headers||{},env);if(!subject&&!groups.size)fail(401,'tenant-identity-required','Identità necessaria per risolvere il tenant');
  const matches=directory.tenants.filter(item=>item.enabled&&((subject&&item.subjects.includes(subject))||item.groups.some(group=>groups.has(group))));
  const requested=text(request?.headers?.['x-ictc-tenant'],63).toLowerCase();
  if(requested){const selected=matches.find(item=>item.id===requested);if(!selected)fail(403,'tenant-membership-required','L’identità non appartiene al tenant richiesto');return{tenantId:selected.id,routing:'trusted-membership-explicit'};}
  if(matches.length===1)return{tenantId:matches[0].id,routing:'trusted-membership'};
  if(!matches.length)fail(403,'tenant-unmapped','Identità non associata ad alcun tenant');
  fail(409,'tenant-ambiguous','Identità associata a più tenant: il proxy deve selezionare un tenant autorizzato',{tenantIds:matches.map(item=>item.id)});
}
export function tenantRuntimePath(runtimeRoot,tenantId,directory=tenantDirectory()){
  return directory.enabled?path.join(runtimeRoot,'tenants',normalizeTenantId(tenantId)):runtimeRoot;
}
export async function createTenantAuthority({runtimeRoot,createStore,initializeStore=async store=>store,env=process.env,maxOpenStores=Number(env.ICTC_MAX_OPEN_TENANT_STORES||32)}){
  if(typeof createStore!=='function')throw new TypeError('createStore required');
  const directory=tenantDirectory(env),storage=new AsyncLocalStorage(),stores=new Map(),pending=new Map(),limit=Math.max(1,Math.min(1024,Number(maxOpenStores)||32));
  const tenantById=id=>{const tenant=directory.tenants.find(item=>item.id===id&&item.enabled);if(!tenant)fail(403,'tenant-unavailable','Tenant non disponibile',{tenantId:id});return tenant;};
  async function open(id){
    const tenant=tenantById(id);let entry=stores.get(id);if(entry){entry.lastUsed=Date.now();return entry;}
    if(pending.has(id))return pending.get(id);
    const task=(async()=>{const root=tenantRuntimePath(runtimeRoot,id,directory),store=await initializeStore(await createStore(root,tenant));const created={tenant,root,store,active:0,lastUsed:Date.now()};stores.set(id,created);return created;})().finally(()=>pending.delete(id));pending.set(id,task);return task;
  }
  async function evict(){while(stores.size>limit){const candidates=[...stores.entries()].filter(([id,e])=>id!==directory.defaultTenantId&&e.active===0).sort((a,b)=>a[1].lastUsed-b[1].lastUsed);if(!candidates.length)return;const[id,entry]=candidates[0];entry.store?.close?.();stores.delete(id);}}
  const defaultEntry=await open(directory.defaultTenantId);
  async function runTenant(id,fn){const entry=await open(normalizeTenantId(id));entry.active+=1;entry.lastUsed=Date.now();try{return await storage.run({tenantId:entry.tenant.id,tenant:entry.tenant,store:entry.store,root:entry.root},fn);}finally{entry.active-=1;entry.lastUsed=Date.now();await evict();}}
  async function runRequest(request,fn){const resolved=resolveRequestTenant(request,env,directory);return runTenant(resolved.tenantId,()=>fn({...resolved,tenant:tenantById(resolved.tenantId)}));}
  const facade=new Proxy({}, {get(_target,property){const active=storage.getStore()?.store||defaultEntry.store;const value=Reflect.get(active,property,active);return typeof value==='function'?value.bind(active):value;},set(_target,property,value){const active=storage.getStore()?.store||defaultEntry.store;return Reflect.set(active,property,value,active);},has(_target,property){const active=storage.getStore()?.store||defaultEntry.store;return property in active;}});
  return Object.freeze({schemaVersion:'1.0.0',directory,store:facade,defaultStore:defaultEntry.store,runTenant,runRequest,current:()=>storage.getStore()||{tenantId:directory.defaultTenantId,tenant:tenantById(directory.defaultTenantId),store:defaultEntry.store,root:defaultEntry.root},tenantIds:()=>directory.tenants.filter(item=>item.enabled).map(item=>item.id),projection:()=>({schemaVersion:'1.0.0',enabled:directory.enabled,currentTenantId:(storage.getStore()?.tenantId)||directory.defaultTenantId,configuredTenants:directory.tenants.filter(item=>item.enabled).length,openStores:stores.size,maxOpenStores:limit,isolation:directory.enabled?'sqlite-per-tenant':'single-runtime-root'}),closeAll:async()=>{for(const entry of stores.values())entry.store?.close?.();stores.clear();}});
}
