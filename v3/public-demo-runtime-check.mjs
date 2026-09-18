import assert from 'node:assert/strict';
import {actorFrom,assertSafeRuntimeBinding} from './runtime/http.mjs';
import {assertPublicDemoRequestBoundary} from './runtime/public-demo.mjs';
import {authorizeEnterpriseActor} from './enterprise.mjs';

const keys=['ICTC_PUBLIC_DEMO','ICTC_DEMO_SUITE','ICTC_RUNTIME_DIR','ICTC_ALLOW_NETWORK_BIND','ICTC_IDENTITY_MODE','ICTC_TRUSTED_PROXY_SECRET','ICTC_MULTI_TENANT','ICTC_ALLOW_LOCAL_ACTOR_SWITCH','ICTC_ALLOW_LOCAL_TENANT_SWITCH'];
const saved=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
const clear=()=>{for(const key of keys)delete process.env[key];};
const permissions={admin:new Set(['read','manage-enterprise']),user:new Set(['read','contribute-grc']),auditor:new Set(['read','read-all-incidents','verify-integrity','view-ai-usage'])};
const request=(remoteAddress,headers={})=>({socket:{remoteAddress},headers,method:'GET'});
let checks=0;const ok=fn=>{assert.doesNotThrow(fn);checks++;};const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};const throws=(fn,code)=>{assert.throws(fn,e=>e?.code===code,code);checks++;};
try{
  clear();Object.assign(process.env,{ICTC_PUBLIC_DEMO:'1',ICTC_DEMO_SUITE:'3.0',ICTC_RUNTIME_DIR:'/tmp/ictc/demo-runtime-3-0',ICTC_ALLOW_NETWORK_BIND:'1'});
  ok(()=>assertSafeRuntimeBinding('0.0.0.0'));
  const actor=actorFrom(request('10.0.0.7',{'x-ictc-role':'admin','x-ictc-actor-id':'attacker','x-ictc-proxy-secret':'attacker'}),permissions);
  eq(actor.id,'local-auditor');eq(actor.role,'auditor');eq(actor.identityMode,'public-demo');eq(actor.identityStrategy,'fixed-public-demo');eq(actor.permissions.includes('manage-enterprise'),false);eq(actor.permissions.includes('verify-integrity'),true);
  const provisioned=authorizeEnterpriseActor(actor,{users:[{id:'local-auditor',displayName:'Auditor locale',email:'',role:'auditor',status:'active'}]});
  eq(provisioned.id,'local-auditor');eq(provisioned.role,'auditor');eq(provisioned.displayName,'Auditor locale');
  ok(()=>assertPublicDemoRequestBoundary({method:'GET'},process.env));ok(()=>assertPublicDemoRequestBoundary({method:'HEAD'},process.env));throws(()=>assertPublicDemoRequestBoundary({method:'POST'},process.env),'public-demo-read-only');
  process.env.ICTC_RUNTIME_DIR='/tmp/ictc/runtime';throws(()=>assertSafeRuntimeBinding('0.0.0.0'),'public-demo-runtime-dir-required');

  clear();throws(()=>assertSafeRuntimeBinding('0.0.0.0'),'unsafe-network-bind');
  throws(()=>actorFrom(request('203.0.113.9',{'x-ictc-role':'admin'}),permissions),'local-identity-loopback-only');
  ok(()=>assertSafeRuntimeBinding('127.0.0.1'));

  clear();Object.assign(process.env,{ICTC_IDENTITY_MODE:'trusted-header',ICTC_ALLOW_NETWORK_BIND:'1',ICTC_TRUSTED_PROXY_SECRET:'s'.repeat(64)});
  ok(()=>assertSafeRuntimeBinding('0.0.0.0'));
  throws(()=>actorFrom(request('10.0.0.2',{'x-ictc-role':'auditor','x-ictc-actor-id':'alice'}),permissions),'trusted-proxy-required');
  const trusted=actorFrom(request('10.0.0.2',{'x-ictc-role':'auditor','x-ictc-actor-id':'alice','x-ictc-proxy-secret':'s'.repeat(64)}),permissions);
  eq(trusted.id,'alice');eq(trusted.role,'auditor');eq(trusted.identityMode,'trusted-header');
}finally{
  clear();for(const [key,value] of Object.entries(saved))if(value!==undefined)process.env[key]=value;
}
console.log(JSON.stringify({ok:true,suite:'public-demo-runtime',checks,proof:'actual runtime http + enterprise authorization; spoofed client identity ignored in explicit public demo; standard and trusted-header boundaries preserved'}));
