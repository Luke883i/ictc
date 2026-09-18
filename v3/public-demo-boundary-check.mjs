import assert from 'node:assert/strict';
import {
  assertPublicDemoConfiguration,
  assertPublicDemoRequestBoundary,
  publicDemoActor,
  publicDemoConfiguration,
  publicDemoRequested,
  PUBLIC_DEMO_ACTOR_ID,
  PUBLIC_DEMO_ROLE,
  PUBLIC_DEMO_RUNTIME_BASENAME,
  PUBLIC_DEMO_SUITE
} from './runtime/public-demo.mjs';

const valid=()=>({
  ICTC_PUBLIC_DEMO:'1',
  ICTC_DEMO_SUITE:'3.0',
  ICTC_RUNTIME_DIR:`/tmp/ictc/${PUBLIC_DEMO_RUNTIME_BASENAME}`,
  ICTC_ALLOW_NETWORK_BIND:'1'
});
const permissions={
  admin:new Set(['read','manage-enterprise']),
  user:new Set(['read','contribute-grc']),
  auditor:new Set(['read','read-all-incidents','verify-integrity','view-ai-usage'])
};
let checks=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const ok=(v,m)=>{assert.ok(v,m);checks++;};
const throws=(fn,code,status=null)=>{assert.throws(fn,e=>e?.code===code&&(status==null||e?.status===status),`expected ${code}`);checks++;};

eq(publicDemoRequested({}),false);
eq(publicDemoRequested({ICTC_PUBLIC_DEMO:'true'}),false);
eq(publicDemoRequested(valid()),true);
const off=publicDemoConfiguration({});
eq(off.enabled,false);eq(off.valid,true);eq(off.readOnly,false);eq(off.anonymous,false);eq(off.syntheticOnly,false);eq(off.errors.length,0);
const posture=publicDemoConfiguration(valid());
eq(posture.enabled,true);eq(posture.valid,true);eq(posture.suite,PUBLIC_DEMO_SUITE);eq(posture.runtimeDir,`/tmp/ictc/${PUBLIC_DEMO_RUNTIME_BASENAME}`);eq(posture.role,PUBLIC_DEMO_ROLE);eq(posture.actorId,PUBLIC_DEMO_ACTOR_ID);eq(posture.readOnly,true);eq(posture.anonymous,true);eq(posture.syntheticOnly,true);eq(posture.errors.length,0);
ok(assertPublicDemoConfiguration(valid()).valid);
const actor=publicDemoActor(permissions,valid());
eq(actor.id,'local-auditor');eq(actor.role,'auditor');eq(actor.identityMode,'public-demo');eq(actor.identityStrategy,'fixed-public-demo');eq(actor.permissions,[...permissions.auditor]);ok(Object.isFrozen(actor));ok(Object.isFrozen(actor.permissions));ok(!actor.permissions.includes('manage-enterprise'));ok(!actor.permissions.includes('contribute-grc'));
for(const method of ['GET','get','HEAD','head'])ok(assertPublicDemoRequestBoundary({method},valid()).valid,method);
for(const method of ['POST','PUT','PATCH','DELETE','OPTIONS','CONNECT','TRACE'])throws(()=>assertPublicDemoRequestBoundary({method},valid()),'public-demo-read-only',405);

for(const [name,value,code] of [
  ['ICTC_DEMO_SUITE',undefined,'public-demo-requires-suite-3-0'],
  ['ICTC_DEMO_SUITE','2.2','public-demo-requires-suite-3-0'],
  ['ICTC_RUNTIME_DIR',undefined,'public-demo-runtime-dir-required'],
  ['ICTC_RUNTIME_DIR','/tmp/ictc/runtime','public-demo-runtime-dir-required'],
  ['ICTC_ALLOW_NETWORK_BIND',undefined,'public-demo-network-opt-in-required'],
  ['ICTC_ALLOW_NETWORK_BIND','true','public-demo-network-opt-in-required'],
  ['ICTC_IDENTITY_MODE','trusted-header','public-demo-identity-mode-must-be-unset'],
  ['ICTC_IDENTITY_MODE','local','public-demo-identity-mode-must-be-unset'],
  ['ICTC_TRUSTED_PROXY_SECRET','x'.repeat(64),'public-demo-proxy-secret-must-be-unset'],
  ['ICTC_MULTI_TENANT','1','public-demo-single-tenant-only'],
  ['ICTC_MULTI_TENANT','0','public-demo-single-tenant-only'],
  ['ICTC_ALLOW_LOCAL_ACTOR_SWITCH','1','public-demo-actor-switch-forbidden'],
  ['ICTC_ALLOW_LOCAL_ACTOR_SWITCH','0','public-demo-actor-switch-forbidden'],
  ['ICTC_ALLOW_LOCAL_TENANT_SWITCH','1','public-demo-tenant-switch-forbidden'],
  ['ICTC_ALLOW_LOCAL_TENANT_SWITCH','0','public-demo-tenant-switch-forbidden']
]){
  const env=valid();if(value===undefined)delete env[name];else env[name]=value;throws(()=>assertPublicDemoConfiguration(env),code,503);
}
const aggregate={...valid(),ICTC_IDENTITY_MODE:'trusted-header',ICTC_TRUSTED_PROXY_SECRET:'z'.repeat(64),ICTC_MULTI_TENANT:'1',ICTC_ALLOW_LOCAL_ACTOR_SWITCH:'1',ICTC_ALLOW_LOCAL_TENANT_SWITCH:'1'};
const aggregatePosture=publicDemoConfiguration(aggregate);eq(aggregatePosture.valid,false);eq(aggregatePosture.errors,[
  'public-demo-identity-mode-must-be-unset','public-demo-proxy-secret-must-be-unset','public-demo-single-tenant-only','public-demo-actor-switch-forbidden','public-demo-tenant-switch-forbidden'
]);
for(const env of [
  {ICTC_IDENTITY_MODE:'trusted-header',ICTC_TRUSTED_PROXY_SECRET:'x'.repeat(64),ICTC_ALLOW_NETWORK_BIND:'1'},
  {ICTC_DEMO_SUITE:'3.0',ICTC_RUNTIME_DIR:'/tmp/ictc/demo-runtime-3-0'},
  {ICTC_MULTI_TENANT:'1'},
  {ICTC_ALLOW_LOCAL_ACTOR_SWITCH:'1'}
]){
  eq(publicDemoConfiguration(env).enabled,false);eq(publicDemoConfiguration(env).valid,true);eq(assertPublicDemoRequestBoundary({method:'POST'},env).enabled,false);
}
throws(()=>publicDemoActor({auditor:['read']},valid()),'public-demo-auditor-permissions-missing',503);

console.log(JSON.stringify({ok:true,suite:'public-demo-boundary',checks,contract:{optIn:'ICTC_PUBLIC_DEMO=1',suite:'3.0',runtimeBasename:PUBLIC_DEMO_RUNTIME_BASENAME,networkOptIn:'ICTC_ALLOW_NETWORK_BIND=1',actor:'local-auditor',identityMode:'public-demo',anonymous:true,syntheticOnly:true,readOnly:true,multiTenant:false,proxySecret:'forbidden'}}));
