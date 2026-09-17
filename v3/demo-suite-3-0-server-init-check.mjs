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
const phases=['store','enterprise','privacy','demo-fresh','demo-after-enterprise','demo-after-privacy','demo-after-enterprise-privacy','tenant'];
if(!phases.includes(phase))throw new Error(`unknown init phase ${phase}`);
const root=await mkdtemp(path.join(tmpdir(),'ictc-demo-init-'));let store,authority;
async function open(){store=new RuntimeStore(root);await store.init();return store;}
async function assertDemo(candidate){const result=await ensureDemoSuite30(candidate,{enabled:true});assert.equal(result.enabled,true);const projection=demoSuite30Projection(candidate.snapshot());assert.equal(projection.enabled,true);assert.equal(projection.positiveRecords,188);}
try{
  if(phase==='store'){await open();}
  else if(phase==='enterprise'){await open();await ensureEnterpriseState(store);}
  else if(phase==='privacy'){await open();await ensurePrivacyState(store);}
  else if(phase==='demo-fresh'){await open();await assertDemo(store);}
  else if(phase==='demo-after-enterprise'){await open();await ensureEnterpriseState(store);await assertDemo(store);}
  else if(phase==='demo-after-privacy'){await open();await ensurePrivacyState(store);await assertDemo(store);}
  else if(phase==='demo-after-enterprise-privacy'){await open();await ensureEnterpriseState(store);await ensurePrivacyState(store);await assertDemo(store);}
  else if(phase==='tenant'){
    authority=await createTenantAuthority({runtimeRoot:root,createStore:async runtime=>new RuntimeStore(runtime),initializeStore:async candidate=>{await candidate.init();await ensureEnterpriseState(candidate);await ensurePrivacyState(candidate);await ensureDemoSuite30(candidate,{enabled:true});return candidate;},env:{...process.env,ICTC_DEMO_SUITE:'3.0'}});
    const projection=demoSuite30Projection(authority.store.snapshot());assert.equal(projection.enabled,true);assert.equal(projection.positiveRecords,188);
  }
  console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-SERVER-INIT',phase},null,2));
}finally{if(authority)await authority.closeAll();if(store)store.close();await rm(root,{recursive:true,force:true,maxRetries:20,retryDelay:100});}
