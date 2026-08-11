import assert from 'node:assert/strict';
import { buildDemoDataset, DEMO_RECORDS_PER_PROCEDURE } from './runtime/demo-seed.mjs';
import { procedureSummaryProjection } from './runtime/procedure-summary.mjs';
import { coverageProjectionV13 } from './runtime/coverage-semantics.mjs';
import { projectionContext } from './runtime/projection-context.mjs';

const actor={id:'local-admin',role:'admin',identityMode:'local'};
const fixture={revision:1,users:[{id:'local-admin',displayName:'Amministratore locale',role:'admin',status:'active'},{id:'local-user',displayName:'Utente locale',role:'user',status:'active'},{id:'local-auditor',displayName:'Auditor locale',role:'auditor',status:'active'}],settings:{organization:{name:'Organizzazione',jurisdictions:['Italia','Unione europea'],sectors:[]}},runs:[],catalog:[],standardScopes:[],standardPacks:[],standardPackHistory:[],standardCrosswalks:[],requirementScopes:[],controlTests:[]};
const dataset=buildDemoDataset(fixture);
const state={...structuredClone(fixture),missions:dataset.records.monitoring,incidents:dataset.records.incidents,grcObjects:dataset.records.objects,grcMappings:dataset.records.coverage,grcActions:dataset.records.actions,grcRisks:dataset.records.risks,grcAssurance:dataset.records.assurance,standardScopes:structuredClone(dataset.support?.standardScopes||[]),requirementScopes:structuredClone(dataset.support?.requirementScopes||[])};
const ctx=projectionContext(actor,{asOf:'2026-08-11T19:40:00.000Z',stateRevision:1,scopeRef:{mode:'actor-visible',organization:dataset.organization.name,jurisdictions:dataset.organization.jurisdictions}}),summary=procedureSummaryProjection(state,actor,ctx),byId=new Map(summary.rows.map(row=>[row.id,row]));

assert.equal(dataset.primaryRecordCount,700);
assert.deepEqual(Object.values(dataset.counts),Array(7).fill(DEMO_RECORDS_PER_PROCEDURE));

const needsPlan=state.missions.filter(x=>x.state==='needs-plan').length;
assert.ok(needsPlan>0,'demo must exercise RN-01 plan backlog');
assert.ok(byId.get('monitoring').attention>=needsPlan,'RN-01 attention must expose needs-plan work');

const objectPartition=['active','candidate','retired','rejected'].reduce((sum,status)=>sum+state.grcObjects.filter(x=>x.status===status).length,0),attestationDue=state.grcObjects.filter(x=>x.status==='active'&&x.attestationDueAt&&Date.parse(x.attestationDueAt)<=Date.parse(ctx.validAsOf)).length;
assert.equal(objectPartition,100,'AO-01 lifecycle partition must conserve 100 records');
assert.ok(attestationDue>0&&attestationDue<=20,`AO-01 demo re-attestation backlog must be intentional minority, got ${attestationDue}`);

assert.ok((dataset.support?.requirementScopes||[]).length>=20,'MC-01 demo must persist explicit requirement scope decisions');
assert.equal(state.grcMappings.some(x=>x.state==='not-applicable'),false,'new demo mappings must not use legacy not-applicable mapping state');
const coverage=coverageProjectionV13(state),mappingPartition=coverage.mapped+coverage.gaps+(coverage.rejected||0)+coverage.unresolved;
assert.equal(mappingPartition,coverage.declared,'MC-01 mapping workflow buckets must be disjoint and conserve declared mappings');
assert.ok(coverage.requirementScopes.counts.notApplicable>0&&coverage.requirementScopes.counts.unknown>0&&coverage.requirementScopes.counts.deferred>0,'MC-01 demo must exercise requirement applicability states separately');

const actionDistinct=state.grcActions.filter(x=>!['closed','cancelled','done','proposed'].includes(x.state)).length;
assert.equal(byId.get('actions').attention,actionDistinct,'AP-01 attention must count distinct actionable subjects once');
const riskRow=byId.get('risks'),riskIds=new Set();for(const risk of state.grcRisks){const review=risk.reviews?.at(-1),treatment=risk.treatments?.at(-1);if(!review||['high','critical'].includes(review.band)||(treatment?.reviewAt&&Date.parse(treatment.reviewAt)<=Date.parse(ctx.validAsOf)))riskIds.add(risk.id);}assert.equal(riskRow.attention,riskIds.size,'RC-01 attention must be a union of risk subjects');

assert.equal(summary.counts.attention,summary.rows.reduce((sum,row)=>sum+row.attention,0),'global attention must equal local attention sum');
console.log('demo-outcome-audit-check: ok',JSON.stringify({needsPlan,attestationDue,coverage:{declared:coverage.declared,mapped:coverage.mapped,gaps:coverage.gaps,rejected:coverage.rejected,unresolved:coverage.unresolved},actionAttention:byId.get('actions').attention,riskAttention:riskRow.attention,globalAttention:summary.counts.attention}));
