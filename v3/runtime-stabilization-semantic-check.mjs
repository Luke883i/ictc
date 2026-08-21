import assert from 'node:assert/strict';
import { sha256 } from './domain.mjs';
import { buildEpistemicStep, COMPATIBILITY_ACTION_SEMANTICS } from './runtime/epistemic-step.mjs';

const version={id:'sv-1',revision:1,subject:{type:'risk',id:'r1'},predecessorId:null,payloadSha256:sha256({id:'r1'}),payload:{id:'r1'}};
const event=(action,metadata={})=>({id:`event-${action}`,revision:1,at:'2026-08-21T17:00:00.000Z',actorId:'human-1',role:'admin',action,subject:version.subject,inputSha256:sha256({action}),metadata:{semanticManifestSha256:sha256({action}),...metadata}});
const effect=(action,metadata={})=>buildEpistemicStep(event(action,metadata),[version],[]).effects[0];

assert.deepEqual(effect('arbitrary.reviewed').families,['observed'],'unknown review-like names must never mint human decision authority');
assert.deepEqual(effect('arbitrary.approved').families,['observed'],'unknown approval-like names must fail safe');
assert.deepEqual(effect('arbitrary.attested').families,['observed'],'unknown attestation-like names must fail safe');
assert.deepEqual(effect('monitoring.job.planned').families,['proposed']);
assert.equal(effect('monitoring.job.planned').producerRef.id,'ai-provider');
assert.deepEqual(effect('workbench.job.run.completed').families,['proposed']);
assert.deepEqual(effect('contribution.enriched').families,['proposed']);
assert.deepEqual(effect('grc.risk.treatment.decided').families,['decided']);
assert.deepEqual(effect('grc.object.reattested').families,['attested']);
assert.deepEqual(effect('insight.human.validated').families,['observed'],'2.9 must not widen authority for names that pre-2.9 fallback did not promote');
assert.deepEqual(effect('review.need.resolved').families,['observed'],'compatibility registry preserves, not invents, authority');
assert.deepEqual(effect('catalog.source.impact.assessed').families,['observed'],'assessment wording alone is not a decision authority');
assert.deepEqual(effect('future.ai.generated').families,['proposed'],'AI-looking compatibility fallback may only lower-bound to proposed');
const declared=effect('future.workflow.transitioned',{epistemicEffects:[{subject:version.subject,families:['decided'],producerRef:{type:'principal',id:'human-1'},basisRefs:[{type:'evidence',id:'e-1'}]}]});
assert.deepEqual(declared.families,['decided']);
assert.equal(declared.classificationSource,'declared-effect');
assert.ok(Object.keys(COMPATIBILITY_ACTION_SEMANTICS).length>=20,'compatibility registry is bounded and explicit');
console.log(`runtime-stabilization-semantic-check: ok (compatibilityActions=${Object.keys(COMPATIBILITY_ACTION_SEMANTICS).length}, unknownPromotion=0, authorityWidening=0)`);
