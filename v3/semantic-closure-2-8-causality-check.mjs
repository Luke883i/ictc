import assert from 'node:assert/strict';
import { MEANINGFUL_HANDOFFS } from './procedure-dod.mjs';
import { buildEpistemicStep } from './runtime/epistemic-step.mjs';
import { MAX_CROSS_PROCEDURE_LINEAGE_DEPTH } from './runtime/cross-procedure-create.mjs';

const version={id:'sv-1',subject:{type:'mission',id:'m1'},payloadSha256:'a'.repeat(64),revision:2,predecessorId:'sv-0'};
for(const action of ['monitoring.mission.planned','monitoring.run.completed','incident.analyzed','incident.draft.generated']){
  const step=buildEpistemicStep({id:`e-${action}`,revision:2,at:'2026-08-21T00:00:00.000Z',action,actorId:'local-admin',role:'admin',subject:version.subject,inputSha256:'b'.repeat(64)},[version],[]);
  assert.deepEqual(step.effects[0].families,['proposed']);
  assert.deepEqual(step.effects[0].producerRef,{type:'service',id:'ai-provider'});
  assert.equal(step.effects[0].classificationSource,'legacy-action-registry');
  assert.deepEqual(step.effects[0].basisRefs,[{subjectVersionId:'sv-0'}],'legacy AI proposal must retain a recorded predecessor basis when available');
}
const firstOccurrence=buildEpistemicStep({id:'e-first-ai',revision:1,at:'2026-08-21T00:00:00.000Z',action:'incident.analyzed',actorId:'local-admin',role:'admin',subject:{type:'incident',id:'i1'},inputSha256:'c'.repeat(64)},[{id:'sv-first',subject:{type:'incident',id:'i1'},payloadSha256:'d'.repeat(64),revision:1}],[]);
assert.deepEqual(firstOccurrence.effects[0].basisRefs,[{type:'command-input-digest',id:'c'.repeat(64)}],'first-occurrence AI proposal must retain technical input provenance');
const human=buildEpistemicStep({id:'e-human',revision:1,at:'2026-08-21T00:00:00.000Z',action:'monitoring.mission.activated',actorId:'local-admin',role:'admin',subject:version.subject,inputSha256:'e'.repeat(64)},[version],[]);
assert.deepEqual(human.effects[0].families,['observed']);
assert.equal(human.effects[0].producerRef.type,'principal');
assert.deepEqual(human.effects[0].basisRefs,[],'non-proposed fallback must not invent a basis relation');
assert.equal(MEANINGFUL_HANDOFFS.length,24);
assert.ok(MEANINGFUL_HANDOFFS.every(edge=>edge.predicate&&edge.predicate!=='cross-procedure-draft-from'),'handoffs must carry intent-specific predicates');
assert.equal(new Set(MEANINGFUL_HANDOFFS.map(edge=>edge.predicate)).size>=12,true);
assert.equal(MAX_CROSS_PROCEDURE_LINEAGE_DEPTH,8);
console.log('semantic-closure-2-8-causality-check: ok (AI producer+basis compatibility registry + typed handoffs + bounded lineage contract)');
