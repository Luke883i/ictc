import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { RuntimeStore } from './runtime-store.mjs';
import { DEMO_SUITE_22_EXPECTED_DIGEST, demoSuite22Projection, demoSuite22Violations, ensureDemoSuite22 } from './runtime/demo-suite-2-2.mjs';

const root=await mkdtemp(path.join(tmpdir(),'ictc-demo-suite-2-2-'));
let stage='bootstrap',store=null,restarted=null;
const slug=value=>String(value||'error').toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50)||'error';
async function publishFailure(error){
  const token=process.env.GH_TOKEN||'',repository=process.env.GITHUB_REPOSITORY||'',sha=process.env.HEAD_SHA||'';
  if(!token||!repository||!/^[0-9a-f]{40}$/i.test(sha))return;
  const code=slug(error?.code||error?.name||'error'),context=`ictc/demo-store-failure-${slug(stage)}-${code}`.slice(0,100),description=`stage=${stage}; code=${error?.code||error?.name||'error'}`.slice(0,140);
  const response=await fetch(`https://api.github.com/repos/${repository}/statuses/${sha}`,{method:'POST',headers:{authorization:`Bearer ${token}`,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28','content-type':'application/json'},body:JSON.stringify({state:'failure',context,description})});
  if(!response.ok)throw new Error(`status publish failed: ${response.status}`);
}
try{
  stage='init-first';store=new RuntimeStore(root);await store.init();
  stage='seed';const seeded=await ensureDemoSuite22(store,{enabled:true});
  assert.equal(seeded.enabled,true);assert.equal(seeded.seeded,true);assert.equal(seeded.positiveRecords,188);
  stage='persisted-assertions';const first=store.snapshot(),firstRevision=first.revision;
  assert.equal(demoSuite22Violations(first).length,0,'persisted semantic graph');
  assert.equal(first.settings.demoSuite22.stateDigest,DEMO_SUITE_22_EXPECTED_DIGEST,'persisted digest marker');
  assert.ok((first.audit||[]).some(entry=>entry.event==='demo.suite-2-2.started'||entry.action==='demo.suite-2-2.started'),'seed start is ledgered');
  assert.ok((first.audit||[]).some(entry=>entry.event==='demo.suite-2-2.completed'||entry.action==='demo.suite-2-2.completed'),'seed completion is ledgered');

  stage='close-first';store.close();store=null;
  stage='restart-init';restarted=new RuntimeStore(root);await restarted.init();
  stage='restart-idempotence';const beforeIdempotent=restarted.snapshot().revision;
  const again=await ensureDemoSuite22(restarted,{enabled:true});
  assert.equal(again.seeded,false,'restart bootstrap idempotent');
  assert.equal(restarted.snapshot().revision,beforeIdempotent,'idempotent restart does not append ledger mutations');
  assert.equal(restarted.snapshot().revision,firstRevision,'revision stable across restart');
  assert.equal(demoSuite22Violations(restarted.snapshot()).length,0,'restart semantic graph');
  stage='projection';const posture=demoSuite22Projection(restarted.snapshot());
  assert.equal(posture.enabled,true);assert.equal(posture.positiveRecords,188);assert.equal(posture.stressFixtures,512);
  stage='complete';console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-2.2-RUNTIME-STORE',revision:firstRevision,stateDigest:DEMO_SUITE_22_EXPECTED_DIGEST,positiveRecords:posture.positiveRecords,stressFixturesTestOnly:posture.stressFixtures,idempotentRestart:true},null,2));
}catch(error){await publishFailure(error).catch(()=>{});throw error;}finally{
  if(restarted)restarted.close();
  if(store)store.close();
  await rm(root,{recursive:true,force:true,maxRetries:20,retryDelay:100});
}
