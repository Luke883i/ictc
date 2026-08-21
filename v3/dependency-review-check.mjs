import assert from 'node:assert/strict';
import { dependencyReviewProjection } from './runtime/dependency-review.mjs';
import { canonicalReviewInbox } from './runtime/review-inbox.mjs';
import { reconcileReviewNeeds } from './runtime/review-need-ledger.mjs';
import { sha256 } from './domain.mjs';
const actor={id:'admin',role:'admin'},past='2026-01-01T00:00:00.000Z',future='2099-01-01T00:00:00.000Z',asOf='2026-08-10T11:00:00.000Z';
const object={id:'obj-1',type:'application',name:'ERP',status:'active',criticality:'high',versionSha256:'v2',attestationDueAt:past,lastAttestedAt:past,relations:[],reviews:[],attestations:[]};
const control={id:'ctrl-1',type:'control',name:'MFA',status:'active',criticality:'high',versionSha256:'c2',attestationDueAt:future,relations:[],reviews:[],attestations:[]};
const mapping={id:'map-1',requirementLabel:'MFA required',targetIds:['obj-1'],targetBindings:[{type:'grc-object',id:'obj-1',versionSha256:'v1'}],state:'mapped',decisions:[{decision:'mapped',at:'2026-02-01T00:00:00.000Z',targetBindings:[{type:'grc-object',id:'obj-1',versionSha256:'v1'}],evidenceBindings:[]}]};
const action={id:'act-1',title:'Enable MFA',originType:'risk',originId:'risk-1',state:'closed',closedAt:'2026-04-01T00:00:00.000Z',decisions:[],updates:[],verifications:[{decision:'closed',at:'2026-04-01T00:00:00.000Z',evidenceBindings:[{scope:'internal',type:'grc-object',id:'obj-1',subjectVersionSha256:'v1'}]}]};
const risk={id:'risk-1',title:'Access risk',state:'reviewed',objectIds:['obj-1'],controlIds:['ctrl-1'],actionIds:['act-1'],reviews:[{assessmentType:'inherent',likelihood:4,impact:4,score:16,band:'high',reason:'review',at:'2026-03-01T00:00:00.000Z',objectBindings:[{type:'grc-object',id:'obj-1',versionSha256:'v2'}],controlBindings:[{type:'grc-object',id:'ctrl-1',versionSha256:'c2'}]}],treatments:[{decision:'mitigate',reason:'action',at:'2026-03-02T00:00:00.000Z',reviewAt:future}],proposal:{likelihood:4,impact:4}};
const assurance={id:'assure-1',title:'Customer assurance',state:'approved',requestSha256:'req',approvedAnswers:[{questionId:'q1',answer:'yes',evidenceBindings:[{scope:'internal',type:'grc-object',id:'obj-1',subjectVersionSha256:'v1'}]}],approvals:[{at:'2026-02-15T00:00:00.000Z'}]};
const source={id:'src-1',title:'Regulatory update',state:'verified',observations:[{text:'new version'}],impactAssessments:[{id:'imp-1',outcome:'relevant',reason:'impact',at:'2026-03-01T00:00:00.000Z',sourceObservationSha256:'stale',affectedObjectBindings:[{type:'grc-object',id:'obj-1',versionSha256:'v2'}],requirementBindings:[]} ]};
const state={revision:0,grcObjects:[object,control],grcMappings:[mapping],grcActions:[action],grcRisks:[risk],grcAssurance:[assurance],catalog:[source],incidents:[],missions:[],contributions:[],reviewNeeds:[],settings:{},users:[]};
let p=dependencyReviewProjection(state,actor,{validAsOf:asOf,stateRevision:0});assert.equal(p.total,6);for(const processId of['objects','coverage','actions','risks','assurance','monitoring'])assert.equal(p.counts[processId],1,processId);assert.ok(p.items.every(x=>x.derived&&x.checkpoint==='dependency-review'));
const business=reconcileReviewNeeds(state,{at:asOf,revision:1,context:{validAsOf:asOf,stateRevision:1},causeMode:'business',causation:'business-state-change'}),clock=reconcileReviewNeeds(state,{at:asOf,revision:1,context:{validAsOf:asOf,stateRevision:1},causeMode:'clock',causation:'clock-sweep'});assert.equal(business.created.length,5,'business reconciliation must materialize only dependency changes');assert.equal(clock.created.length,1,'clock sweep must materialize the due attestation separately');assert.equal(state.reviewNeeds.length,6);
let inbox=canonicalReviewInbox(state,actor);assert.equal(inbox.dependencyReviewAuthority,'persisted-review-need-ledger');assert.equal(inbox.counts.reviewNeeded,6);const materialized=new Set(inbox.items.filter(x=>x.derived).map(x=>`${x.processId}:${x.subject.id}`));for(const key of['objects:obj-1','coverage:map-1','actions:act-1','risks:risk-1','assurance:assure-1','monitoring:src-1'])assert.ok(materialized.has(key),key);assert.ok(inbox.items.filter(x=>x.derived).every(x=>x.authority==='persisted-review-need-ledger'));
object.attestationDueAt=future;mapping.decisions.at(-1).targetBindings=[{type:'grc-object',id:'obj-1',versionSha256:'v2'}];action.verifications.at(-1).evidenceBindings=[{scope:'internal',type:'grc-object',id:'obj-1',subjectVersionSha256:'v2'}];risk.reviews.at(-1).at='2026-05-01T00:00:00.000Z';assurance.approvedAnswers[0].evidenceBindings=[{scope:'internal',type:'grc-object',id:'obj-1',subjectVersionSha256:'v2'}];source.impactAssessments.at(-1).sourceObservationSha256=sha256(source.observations.at(-1));p=dependencyReviewProjection(state,actor,{validAsOf:asOf,stateRevision:1});assert.equal(p.total,0,'candidate derivation clears when the current basis no longer triggers review');inbox=canonicalReviewInbox(state,actor);assert.equal(inbox.counts.reviewNeeded,6,'materialized review work remains open until a later human decision resolves it');

// The March legacy treatment belongs to the prior assessment cycle and must not leak into the May review.
risk.treatments.at(-1).reviewAt=past;
p=dependencyReviewProjection(state,actor,{validAsOf:asOf,stateRevision:1});
assert.equal(p.total,0,'treatment preceding the current risk review must not create a scheduled review in the new cycle');

// Legacy treatments without assessmentSha256 remain compatible only when they are temporally subsequent to the effective review.
risk.treatments.push({decision:'mitigate',reason:'legacy current-cycle treatment',at:'2026-05-02T00:00:00.000Z',reviewAt:past});
p=dependencyReviewProjection(state,actor,{validAsOf:asOf,stateRevision:1});
assert.equal(p.total,1);
assert.equal(p.items[0].processId,'risks');
assert.equal(p.items[0].causes[0].kind,'scheduled-review-due');
risk.treatments.at(-1).reviewAt=future;
assert.equal(dependencyReviewProjection(state,actor,{validAsOf:asOf,stateRevision:1}).total,0);

console.log('dependency-review-check: ok (candidate derivation + persisted ReviewNeed authority + cycle-bound legacy treatment compatibility)');
