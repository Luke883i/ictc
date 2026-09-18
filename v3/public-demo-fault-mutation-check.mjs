import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';import os from'node:os';import path from'node:path';import{pathToFileURL,fileURLToPath}from'node:url';
const sourcePath=new URL('./runtime/public-demo.mjs',import.meta.url),source=await readFile(sourcePath,'utf8');
const mutations=[
 ['roles',"PUBLIC_DEMO_ROLES=Object.freeze(['admin','user','auditor'])","PUBLIC_DEMO_ROLES=Object.freeze(['auditor'])"],
 ['default-role',"PUBLIC_DEMO_DEFAULT_ROLE='auditor'","PUBLIC_DEMO_DEFAULT_ROLE='root'"],
 ['suite',"PUBLIC_DEMO_SUITE='3.0'","PUBLIC_DEMO_SUITE='2.2'"],
 ['runtime',"PUBLIC_DEMO_RUNTIME_BASENAME='demo-runtime-3-0'","PUBLIC_DEMO_RUNTIME_BASENAME='runtime'"],
 ['optin',"env.ICTC_PUBLIC_DEMO==='1'","env.ICTC_PUBLIC_DEMO!=='1'"],
 ['bind',"env.ICTC_ALLOW_NETWORK_BIND!=='1'","env.ICTC_ALLOW_NETWORK_BIND==='1'"],
 ['identity','if(identityMode)errors.push','if(false&&identityMode)errors.push'],
 ['secret','if(proxySecret)errors.push','if(false&&proxySecret)errors.push'],
 ['multi','if(multiTenant)errors.push','if(false&&multiTenant)errors.push'],
 ['actor-switch','if(actorSwitch)errors.push','if(false&&actorSwitch)errors.push'],
 ['tenant-switch','if(tenantSwitch)errors.push','if(false&&tenantSwitch)errors.push'],
 ['role-bounding',"PUBLIC_DEMO_ROLES.includes(text(value,20).toLowerCase())","true"],
 ['actor-id',"id:`local-${role}`","id:'attacker'"],
 ['actor-role',"id:`local-${role}`,role","id:`local-${role}`,role:'admin'"],
 ['identity-mode',"identityMode:'public-demo'","identityMode:'local'"],
 ['identity-strategy',"identityStrategy:'synthetic-demo-role'","identityStrategy:'client-role'"],
 ['permissions',"permissions:Object.freeze([...permissionSet])","permissions:Object.freeze([...permissions.admin])"],
 ['allow-post',"['GET','HEAD'].includes(method)","['GET','HEAD','POST'].includes(method)"],
 ['deny-head',"['GET','HEAD'].includes(method)","['GET'].includes(method)"],
 ['read-only','readOnly:true,anonymous:true','readOnly:false,anonymous:true']
];
const valid=()=>({ICTC_PUBLIC_DEMO:'1',ICTC_DEMO_SUITE:'3.0',ICTC_RUNTIME_DIR:'/tmp/ictc/demo-runtime-3-0',ICTC_ALLOW_NETWORK_BIND:'1'}),permissions={admin:new Set(['read','manage-enterprise']),user:new Set(['read','contribute-grc']),auditor:new Set(['read','verify-integrity'])};
function rejects(fn,code){try{fn();return false}catch(e){return e?.code===code}}
function oracle(m){try{const p=m.publicDemoConfiguration(valid());if(!p.enabled||!p.valid||!p.readOnly||p.roles?.join(',')!=='admin,user,auditor'||p.defaultRole!=='auditor'||p.actorStrategy!=='server-derived-by-role')return false;for(const role of['admin','user','auditor']){const a=m.publicDemoActor(permissions,valid(),role);if(a.id!==`local-${role}`||a.role!==role||a.identityMode!=='public-demo'||a.identityStrategy!=='synthetic-demo-role'||JSON.stringify(a.permissions)!==JSON.stringify([...permissions[role]]))return false;}const invalid=m.publicDemoActor(permissions,valid(),'root');if(invalid.role!=='auditor'||invalid.id!=='local-auditor')return false;if(!m.assertPublicDemoRequestBoundary({method:'GET'},valid()).valid||!m.assertPublicDemoRequestBoundary({method:'HEAD'},valid()).valid||!rejects(()=>m.assertPublicDemoRequestBoundary({method:'POST'},valid()),'public-demo-read-only'))return false;for(const [env,code] of[[{...valid(),ICTC_IDENTITY_MODE:'trusted-header'},'public-demo-identity-mode-must-be-unset'],[{...valid(),ICTC_TRUSTED_PROXY_SECRET:'x'},'public-demo-proxy-secret-must-be-unset'],[{...valid(),ICTC_MULTI_TENANT:'1'},'public-demo-single-tenant-only']])if(!rejects(()=>m.assertPublicDemoConfiguration(env),code))return false;return true}catch{return false}}
const baseline=await import(`${pathToFileURL(fileURLToPath(sourcePath)).href}?base=1`);assert.equal(oracle(baseline),true);
const dir=await mkdtemp(path.join(os.tmpdir(),'ictc-public-demo-mutants-'));let killed=0;const survivors=[];try{for(let i=0;i<mutations.length;i++){const[id,from,to]=mutations[i];assert.ok(source.includes(from),id);const file=path.join(dir,`m-${i}.mjs`);await writeFile(file,source.replace(from,to));let survived=false;try{survived=oracle(await import(`${pathToFileURL(file).href}?m=${i}`))}catch{}if(survived)survivors.push(id);else killed++;}}finally{await rm(dir,{recursive:true,force:true})}assert.deepEqual(survivors,[]);assert.equal(killed,mutations.length);console.log(JSON.stringify({ok:true,suite:'public-demo-fault-mutation',generated:mutations.length,killed,survivors:0}));
