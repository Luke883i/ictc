import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { RuntimeStore } from './runtime-store.mjs';
import { ensureEnterpriseState } from './enterprise.mjs';
import { ensurePrivacyState } from './runtime/privacy-lifecycle.mjs';
import { ensureDemoSuite30, demoSuite30Projection } from './runtime/demo-suite-3-0.mjs';
import { createTenantAuthority } from './runtime/tenant-authority.mjs';

const phase=String(process.env.ICTC_DEMO_INIT_PHASE||'tenant').trim();
const phases=['store','enterprise','privacy','demo','tenant'];
if(!phases.includes(phase))throw new Error(`unknown init phase ${phase}`);
const reaches=name=>phases.indexOf(phase)>=phases.indexOf(name);
const root=await mkdtemp(path.join(tmpdir(),'ictc-demo-init-'));
let store,authority;
async function init(candidate){
  await candidate.init();
  if(reaches('enterprise'))await ensureEnterpriseState(candidate);
  if(reaches('privacy'))await ensurePrivacyState(candidate);
  if(reaches('demo'))await ensureDemoSuite30(candidate,{enabled:true});
  return candidate;
}
try{
  if(phase==='tenant'){
    authority=await createTenantAuthority({runtimeRoot:root,createStore:async runtime=>new RuntimeStore(runtime),initializeStore:init,env:{...process.env,ICTC_DEMO_SUITE:'3.0'}});
    const projection=demoSuite30Projection(authority.store.snapshot());
    assert.equal(projection.enabled,true);
    assert.equal(projection.positiveRecords,188);
  }else{
    store=new RuntimeStore(root);await init(store);
    if(reaches('demo'))assert.equal(demoSuite30Projection(store.snapshot()).enabled,true);
  }
  console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-SERVER-INIT',phase},null,2));
}finally{
  if(authority)await authority.closeAll();
  if(store)store.close();
  await rm(root,{recursive:true,force:true,maxRetries:20,retryDelay:100});
}
