import assert from 'node:assert/strict';
import { runtimeHarness } from './runtime-test-harness.mjs';

const runtime=await runtimeHarness('ictc-v3-insights');
try{
  await runtime.ok('PUT','/api/admin/settings',{organization:{name:'Insight Test',scope:'Compliance',jurisdictions:['Italia']},llm:{endpoint:`http://127.0.0.1:${runtime.aiPort}/v1/chat/completions`,model:'mock-v3',apiKeyEnv:'ICTC_LLM_API_KEY',temperature:0.1}});
  const before=await runtime.bootstrap('admin','test-admin');const digest=before.body.insights.base.basisSha256;const values=before.body.insights.base.metrics.map(x=>[x.id,x.value]);
  const proposed=await runtime.ok('POST','/api/insights/propose',{});assert.equal(proposed.status,201);assert.ok(proposed.body.receipt);assert.equal(proposed.body.result.envelope.authority,'ai-assist-only');assert.equal(proposed.body.result.envelope.adoption,null);assert.equal(proposed.body.result.basisSha256,digest);
  const mid=await runtime.bootstrap('admin','test-admin');assert.deepEqual(mid.body.insights.base.metrics.map(x=>[x.id,x.value]),values,'AI proposal must not change deterministic metrics');const record=mid.body.insights.proposals[0];assert.equal(record.envelope.humanAdoptionRequired,true);
  const validated=await runtime.ok('POST',`/api/insights/${record.id}/validate`,{reason:'Lettura verificata rispetto ai KPI correnti'});assert.ok(validated.body.receipt);assert.equal(validated.body.result.envelope.adoption.authority,'human');
  const after=await runtime.bootstrap('admin','test-admin');assert.deepEqual(after.body.insights.base.metrics.map(x=>[x.id,x.value]),values,'human narrative validation must not mutate metrics');assert.equal(after.body.insights.latestValidated.id,record.id);assert.ok(after.body.reviewInbox);
  console.log(`insight-runtime-check: ok (metrics=${values.length}, proposal=${record.id})`);
}finally{await runtime.close();}
