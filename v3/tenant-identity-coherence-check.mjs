import assert from 'node:assert/strict';
import { createTenantAuthority } from './runtime/tenant-authority.mjs';
import { actorFrom, routeMatch } from './runtime/http.mjs';

const secret='p'.repeat(64),saved={mode:process.env.ICTC_IDENTITY_MODE,secret:process.env.ICTC_TRUSTED_PROXY_SECRET};
const restore=(name,value)=>{if(value==null)delete process.env[name];else process.env[name]=value;};
const permissions={admin:new Set(['read','manage-enterprise']),user:new Set(['read']),auditor:new Set(['read'])};
const env={ICTC_MULTI_TENANT:'1',ICTC_IDENTITY_MODE:'trusted-header',ICTC_TRUSTED_PROXY_SECRET:secret,ICTC_TENANT_DIRECTORY_JSON:JSON.stringify({defaultTenantId:'alpha',tenants:[{id:'alpha',subjects:['alice'],groups:['alpha']},{id:'beta',subjects:['bob'],groups:['beta']}]})};
const request=headers=>({headers:{'x-ictc-proxy-secret':secret,...headers},socket:{remoteAddress:'10.0.0.10'}});
let authority;
try{
  process.env.ICTC_IDENTITY_MODE='trusted-header';process.env.ICTC_TRUSTED_PROXY_SECRET=secret;
  authority=await createTenantAuthority({runtimeRoot:'/tmp/ictc-tenant-coherence',env,createStore:async()=>({close(){}})});
  const valid=request({'x-ictc-subject':'alice','x-ictc-actor-id':'alice','x-ictc-role':'user','x-ictc-tenant':'alpha'});await authority.runRequest(valid,async()=>{const actor=actorFrom(valid,permissions);assert.equal(actor.id,'alice');assert.equal(actor.role,'user');});
  const mismatch=request({'x-ictc-subject':'alice','x-ictc-actor-id':'mallory','x-ictc-role':'admin','x-ictc-tenant':'alpha'});await assert.rejects(()=>authority.runRequest(mismatch,async()=>actorFrom(mismatch,permissions)),error=>error.code==='tenant-actor-membership-mismatch');
  const shibbolethMismatch=request({'x-ictc-subject':'alice','x-auth-subject':'mallory','x-auth-groups':'ops','x-ictc-tenant':'alpha'}),shibboleth={strategy:'shibboleth',headers:{subject:'x-auth-subject',displayName:'x-auth-name',email:'x-auth-email',groups:'x-auth-groups'},groupDelimiter:';',userRules:[{user:'mallory',role:'admin'}],groupRules:[]};await assert.rejects(()=>authority.runRequest(shibbolethMismatch,async()=>actorFrom(shibbolethMismatch,permissions,shibboleth)),error=>error.code==='tenant-actor-membership-mismatch');
  const groupValid=request({'x-ictc-subject':'mallory','x-ictc-groups':'alpha','x-auth-subject':'mallory','x-auth-groups':'alpha','x-ictc-tenant':'alpha'}),groupIdentity={strategy:'shibboleth',headers:{subject:'x-auth-subject',displayName:'x-auth-name',email:'x-auth-email',groups:'x-auth-groups'},groupDelimiter:';',groupRules:[{group:'alpha',role:'admin'}],userRules:[]};await authority.runRequest(groupValid,async()=>{const actor=actorFrom(groupValid,permissions,groupIdentity);assert.equal(actor.id,'mallory');assert.deepEqual(actor.groups,['alpha']);});
  assert.throws(()=>routeMatch('/api/attachments/%E0%A4%A','/api/attachments/:id'),error=>error.code==='route-param-invalid');assert.throws(()=>routeMatch('/api/attachments/a%2Fb','/api/attachments/:id'),error=>error.code==='route-param-invalid');
  console.log('tenant-identity-coherence-check: ok (routing identity == authorized tenant membership; malformed/encoded-separator route params fail closed)');
}finally{await authority?.closeAll?.();restore('ICTC_IDENTITY_MODE',saved.mode);restore('ICTC_TRUSTED_PROXY_SECRET',saved.secret);}
