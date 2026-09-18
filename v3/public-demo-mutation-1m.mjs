import assert from 'node:assert/strict';
import { publicDemoConfiguration, PUBLIC_DEMO_RUNTIME_BASENAME } from './runtime/public-demo.mjs';

const publicDemo=['1','0','true','yes',''];
const suites=['3.0','2.2','3','4.0','',' 3.0 '];
const runtimes=[`/tmp/a/${PUBLIC_DEMO_RUNTIME_BASENAME}`,'/tmp/a/runtime','/tmp/a/demo-runtime-2-2','','demo-runtime-3-0-extra'];
const binds=['1','0','true','yes',''];
const identities=['','trusted-header','local','public-demo',' shibboleth '];
const secrets=['','x','x'.repeat(31),'x'.repeat(32),'x'.repeat(64),'   '];
const toggles=['','0','1','true'];
function oracle(env){
  if(env.ICTC_PUBLIC_DEMO!=='1')return[false,true,[]];
  const errors=[];
  if(String(env.ICTC_DEMO_SUITE??'').trim().slice(0,40)!=='3.0')errors.push('public-demo-requires-suite-3-0');
  const runtime=String(env.ICTC_RUNTIME_DIR??'').trim().slice(0,2000).replace(/\\/g,'/').split('/').filter(Boolean).at(-1)||'';
  if(runtime!==PUBLIC_DEMO_RUNTIME_BASENAME)errors.push('public-demo-runtime-dir-required');
  if(env.ICTC_ALLOW_NETWORK_BIND!=='1')errors.push('public-demo-network-opt-in-required');
  if(String(env.ICTC_IDENTITY_MODE??'').trim().slice(0,80))errors.push('public-demo-identity-mode-must-be-unset');
  if(String(env.ICTC_TRUSTED_PROXY_SECRET??'').trim().slice(0,1000))errors.push('public-demo-proxy-secret-must-be-unset');
  if(String(env.ICTC_MULTI_TENANT??'').trim().slice(0,40))errors.push('public-demo-single-tenant-only');
  if(String(env.ICTC_ALLOW_LOCAL_ACTOR_SWITCH??'').trim().slice(0,40))errors.push('public-demo-actor-switch-forbidden');
  if(String(env.ICTC_ALLOW_LOCAL_TENANT_SWITCH??'').trim().slice(0,40))errors.push('public-demo-tenant-switch-forbidden');
  return[true,errors.length===0,errors];
}
let seed=0x9e3779b9,validRequested=0,invalidRequested=0,disabled=0,mismatches=0;
const next=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const pick=a=>a[next()%a.length];
for(let i=0;i<1_000_000;i++){
  const env=i%10000===0?{ICTC_PUBLIC_DEMO:'1',ICTC_DEMO_SUITE:'3.0',ICTC_RUNTIME_DIR:`/tmp/a/${PUBLIC_DEMO_RUNTIME_BASENAME}`,ICTC_ALLOW_NETWORK_BIND:'1',ICTC_IDENTITY_MODE:'',ICTC_TRUSTED_PROXY_SECRET:'',ICTC_MULTI_TENANT:'',ICTC_ALLOW_LOCAL_ACTOR_SWITCH:'',ICTC_ALLOW_LOCAL_TENANT_SWITCH:''}:{ICTC_PUBLIC_DEMO:pick(publicDemo),ICTC_DEMO_SUITE:pick(suites),ICTC_RUNTIME_DIR:pick(runtimes),ICTC_ALLOW_NETWORK_BIND:pick(binds),ICTC_IDENTITY_MODE:pick(identities),ICTC_TRUSTED_PROXY_SECRET:pick(secrets),ICTC_MULTI_TENANT:pick(toggles),ICTC_ALLOW_LOCAL_ACTOR_SWITCH:pick(toggles),ICTC_ALLOW_LOCAL_TENANT_SWITCH:pick(toggles)};
  const [enabled,valid,errors]=oracle(env),got=publicDemoConfiguration(env);
  if(got.enabled!==enabled||got.valid!==valid||got.errors.length!==errors.length||got.errors.some((x,j)=>x!==errors[j])){mismatches++;if(mismatches<5)console.error({i,env,expected:{enabled,valid,errors},got});}
  if(!enabled)disabled++;else if(valid)validRequested++;else invalidRequested++;
}
assert.equal(mismatches,0);assert.equal(validRequested>0,true);assert.equal(invalidRequested>0,true);assert.equal(disabled>0,true);
console.log(JSON.stringify({ok:true,suite:'public-demo-mutation-1m',trials:1_000_000,mismatches,validRequested,invalidRequested,disabled,seed:'xorshift32:0x9e3779b9',claimBoundary:'model-level environment semantics; not one million process launches or browser sessions'}));
