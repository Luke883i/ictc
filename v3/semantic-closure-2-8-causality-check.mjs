import assert from 'node:assert/strict';
import { MEANINGFUL_HANDOFFS } from './procedure-dod.mjs';
import { buildEpistemicStep } from './runtime/epistemic-step.mjs';
import { MAX_CROSS_PROCEDURE_LINEAGE_DEPTH } from './runtime/cross-procedure-create.mjs';
const version={id:'sv-1',subject:{type:'mission',id:'m1'},payloadSha256:'a'.repeat(64),revision:1};
for(const action of ['monitoring.mission.planned','monitoring.run.completed','incident.analyzed','incident.draft.generated']){const step=buildEpistemicStep({id:`e-${action}`,revision:1,at:'2026-08-21T00:00:00.000Z',action,actorId:'local-admin',role:'admin',subject:version.subject},[version],[]);assert.deepEqual(step.effects[0].families,['proposed']);assert.deepEqual(step.effects[0].producerRef,{type:'service',id:'ai-provider'});assert.equal(step.effects[0].classificationSource,'legacy-action-registry');}
const human=buildEpistemicStep({id:'e-human',revision:1,at:'2026-08-21T00:00:00.000Z',action:'monitoring.mission.activated',actorId:'local-admin',role:'admin',subject:version.subject},[version],[]);assert.deepEqual(human.effects[0].families,['observed']);assert.equal(human.effects[0].producerRef.type,'principal');
assert.equal(MEANINGFUL_HANDOFFS.length,25);assert.ok(MEANINGFUL_HANDOFFS.every(edge=>edge.predicate&&edge.predicate!=='cross-procedure-draft-from'),'handoffs must carry intent-specific predicates');assert.equal(new Set(MEANINGFUL_HANDOFFS.map(edge=>edge.predicate)).size>=12,true);assert.equal(MAX_CROSS_PROCEDURE_LINEAGE_DEPTH,8);
console.log('semantic-closure-2-8-causality-check: ok (AI producer compatibility registry + typed handoffs + bounded lineage contract)');
