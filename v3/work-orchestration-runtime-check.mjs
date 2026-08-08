import assert from 'node:assert/strict';
import { runtimeHarness } from './runtime-test-harness.mjs';

const runtime=await runtimeHarness('ictc-v3-work');
try{
  const admin=await runtime.bootstrap('admin','test-admin');
  assert.equal(admin.status,200);
  assert.equal(admin.body.work.authority,'runtime-work-orchestration');
  assert.equal(admin.body.work.queue.authority,'runtime-work-queue');
  assert.equal(admin.body.homeNextAction.kind,'create-object');
  assert.equal(admin.body.homeNextAction.processId,'objects');
  assert.equal(admin.body.work.routing.humanLaunchRequired,true);
  assert.ok(admin.body.work.procedures.some(item=>item.processId==='monitoring'));
  const route=await runtime.ok('POST','/api/work/route',{objective:'Abbiamo un possibile data breach da registrare',inputType:'natural-language-objective'});
  assert.equal(route.body.candidates[0].processId,'incidents');
  assert.equal(route.body.requiresHumanSelection,true);
  const guide=await runtime.ok('GET','/api/work/procedures/incidents');
  assert.equal(guide.body.process.code,'EC-01');
  assert.equal(guide.body.steps.some(step=>step.humanRequired),true);
  const created=await runtime.ok('POST','/api/grc/objects',{type:'server',name:'Server ERP',criticality:'high',owner:'IT'});
  assert.ok(created.body.receipt);
  const withCandidate=await runtime.bootstrap('admin','test-admin');
  assert.equal(withCandidate.body.work.queue.items.some(item=>item.kind==='review-object'),true);
  const traces=await runtime.ok('GET','/api/work/traces');
  assert.ok(traces.body.traces.some(item=>item.subject.id===created.body.result.id));
  const user=await runtime.bootstrap('user','local-user');
  assert.equal(user.body.work.queue.items.some(item=>item.service==='administration'),false,'user queue must not expose administration');
  const auditor=await runtime.bootstrap('auditor','local-auditor');
  assert.ok(auditor.body.work.queue.items.every(item=>item.readOnly===true));
  assert.equal(auditor.body.work.routing.humanLaunchRequired,true);
  console.log(`work-orchestration-runtime-check: ok (adminQueue=${withCandidate.body.work.queue.items.length}, traces=${traces.body.counts.subjects})`);
}finally{await runtime.close();}
