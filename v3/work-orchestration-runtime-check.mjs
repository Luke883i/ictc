import assert from 'node:assert/strict';
import { runtimeHarness } from './runtime-test-harness.mjs';

const runtime=await runtimeHarness('ictc-v3-work');
try{
  const admin=await runtime.bootstrap('admin','test-admin');
  assert.equal(admin.status,200);
  assert.equal(admin.body.work.authority,undefined);
  assert.equal(admin.body.work.queue.authority,'runtime-work-queue');
  assert.equal(admin.body.homeNextAction.kind,'create-object');
  assert.equal(admin.body.homeNextAction.processId,'objects');
  const route=await runtime.ok('POST','/api/work/route',{objective:'Abbiamo un possibile data breach da registrare',inputType:'natural-language-objective'});
  assert.equal(route.body.candidates[0].processId,'incidents');
  assert.equal(route.body.requiresHumanSelection,true);
  const created=await runtime.ok('POST','/api/grc/objects',{type:'server',name:'Server ERP',criticality:'high',owner:'IT'});
  assert.ok(created.body.receipt);
  const withCandidate=await runtime.bootstrap('admin','test-admin');
  assert.equal(withCandidate.body.work.queue.items.some(item=>item.kind==='review-object'),true);
  const user=await runtime.bootstrap('user','local-user');
  assert.ok(user.body.work.queue.items.every(item=>item.readOnly===false||item.readOnly===true));
  const auditor=await runtime.bootstrap('auditor','local-auditor');
  assert.ok(auditor.body.work.queue.items.every(item=>item.readOnly===true));
  console.log(`work-orchestration-runtime-check: ok (adminQueue=${withCandidate.body.work.queue.items.length})`);
}finally{await runtime.close();}
