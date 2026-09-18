import assert from 'node:assert/strict';
import { publicDemoConfiguration, PUBLIC_DEMO_RUNTIME_BASENAME } from './runtime/public-demo.mjs';

const values={
  publicDemo:['1','0','true',''],suite:['3.0','2.2','','4.0'],runtime:[`/srv/${PUBLIC_DEMO_RUNTIME_BASENAME}`,'/srv/runtime','/srv/demo-runtime-2-2',''],bind:['1','0','true',''],identity:['','trusted-header','local','public-demo'],secret:['','short','s'.repeat(32),'s'.repeat(64)],toggle:['','1','0','true']
};
function expected(env){
  if(env.ICTC_PUBLIC_DEMO!=='1')return{enabled:false,valid:true,errors:[]};
  const errors=[];
  if(String(env.ICTC_DEMO_SUITE||'').trim()!=='3.0')errors.push('public-demo-requires-suite-3-0');
  const runtime=String(env.ICTC_RUNTIME_DIR||'').trim().replace(/\\/g,'/').split('/').filter(Boolean).at(-1)||'';
  if(runtime!==PUBLIC_DEMO_RUNTIME_BASENAME)errors.push('public-demo-runtime-dir-required');
  if(env.ICTC_ALLOW_NETWORK_BIND!=='1')errors.push('public-demo-network-opt-in-required');
  if(String(env.ICTC_IDENTITY_MODE||'').trim())errors.push('public-demo-identity-mode-must-be-unset');
  if(String(env.ICTC_TRUSTED_PROXY_SECRET||'').trim())errors.push('public-demo-proxy-secret-must-be-unset');
  if(String(env.ICTC_MULTI_TENANT||'').trim())errors.push('public-demo-single-tenant-only');
  if(String(env.ICTC_ALLOW_LOCAL_ACTOR_SWITCH||'').trim())errors.push('public-demo-actor-switch-forbidden');
  if(String(env.ICTC_ALLOW_LOCAL_TENANT_SWITCH||'').trim())errors.push('public-demo-tenant-switch-forbidden');
  return{enabled:true,valid:errors.length===0,errors};
}
let seed=0x51f15e,validRequested=0,invalidRequested=0,disabled=0;
function next(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const pick=a=>a[(next()>>>8)%a.length];
for(let i=0;i<1000;i++){
  const env=i<25?{ICTC_PUBLIC_DEMO:'1',ICTC_DEMO_SUITE:'3.0',ICTC_RUNTIME_DIR:`/srv/${PUBLIC_DEMO_RUNTIME_BASENAME}`,ICTC_ALLOW_NETWORK_BIND:'1',ICTC_IDENTITY_MODE:'',ICTC_TRUSTED_PROXY_SECRET:'',ICTC_MULTI_TENANT:'',ICTC_ALLOW_LOCAL_ACTOR_SWITCH:'',ICTC_ALLOW_LOCAL_TENANT_SWITCH:''}:i<50?{ICTC_PUBLIC_DEMO:'1',ICTC_DEMO_SUITE:'2.2',ICTC_RUNTIME_DIR:`/srv/${PUBLIC_DEMO_RUNTIME_BASENAME}`,ICTC_ALLOW_NETWORK_BIND:'1',ICTC_IDENTITY_MODE:'',ICTC_TRUSTED_PROXY_SECRET:'',ICTC_MULTI_TENANT:'',ICTC_ALLOW_LOCAL_ACTOR_SWITCH:'',ICTC_ALLOW_LOCAL_TENANT_SWITCH:''}:i<75?{ICTC_PUBLIC_DEMO:'0',ICTC_DEMO_SUITE:'3.0',ICTC_RUNTIME_DIR:`/srv/${PUBLIC_DEMO_RUNTIME_BASENAME}`,ICTC_ALLOW_NETWORK_BIND:'1'}:{ICTC_PUBLIC_DEMO:pick(values.publicDemo),ICTC_DEMO_SUITE:pick(values.suite),ICTC_RUNTIME_DIR:pick(values.runtime),ICTC_ALLOW_NETWORK_BIND:pick(values.bind),ICTC_IDENTITY_MODE:pick(values.identity),ICTC_TRUSTED_PROXY_SECRET:pick(values.secret),ICTC_MULTI_TENANT:pick(values.toggle),ICTC_ALLOW_LOCAL_ACTOR_SWITCH:pick(values.toggle),ICTC_ALLOW_LOCAL_TENANT_SWITCH:pick(values.toggle)};
  const exp=expected(env),got=publicDemoConfiguration(env);
  assert.equal(got.enabled,exp.enabled,`enabled @${i}`);assert.equal(got.valid,exp.valid,`valid @${i}`);assert.deepEqual([...got.errors],exp.errors,`errors @${i}`);
  if(!exp.enabled)disabled++;else if(exp.valid)validRequested++;else invalidRequested++;
}
assert.ok(validRequested>0);assert.ok(invalidRequested>0);assert.ok(disabled>0);
console.log(JSON.stringify({ok:true,suite:'public-demo-deployment-matrix',worlds:1000,validRequested,invalidRequested,disabled,seed:'0x51f15e'}));
