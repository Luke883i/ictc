/** R8 metric provenance: source-level/runtime graph assertion, bounded to fixture and exact JS owners. */
import assert from 'node:assert/strict';
import {procedureSummaryProjection} from '../../src/runtime/procedure-summary.mjs';
import {procedureWorklistProjection} from '../../src/runtime/procedure-worklist.mjs';
import {metricCatalogProjection} from '../../src/runtime/metric-spec.mjs';
const actors=[{id:'admin',role:'admin'},{id:'alice',role:'user'},{id:'auditor',role:'auditor'}];
const times={transactionAsOf:'2026-11-13T10:00:00.000Z',validAsOf:'2026-11-13T09:00:00.000Z'};
const state={revision:13,settings:{},missions:[{id:'m1',state:'needs-plan',createdBy:'alice'},{id:'m2',state:'needs-plan',createdBy:'bob'}],runs:[],catalog:[{id:'s1',state:'candidate'}],incidents:[{id:'i1',state:'review',createdBy:'alice'},{id:'i2',state:'review',createdBy:'bob'}],grcObjects:[],grcMappings:[],grcActions:[{id:'a1',createdBy:'alice',state:'proposed'},{id:'a2',createdBy:'bob',state:'proposed'}],grcRisks:[],grcAssurance:[],standardScopes:[],standardPacks:[],standardPackHistory:[],standardCrosswalks:[],requirementScopes:[],controlTests:[]};
const catalog=metricCatalogProjection();
function assertMatching(summary,worklist,actor){
 assert.equal(summary.rows.length,7);assert.equal(summary.projection.actorRole,actor.role);
 assert.equal(summary.projection.actorId,actor.id);
 assert.equal(summary.projection.stateRevision,13);
 for(const row of summary.rows){
  const native=worklist.procedures.find(p=>p.id===row.id),specs=catalog.metrics.filter(m=>m.procedureId===row.id);
  assert.ok(native&&specs.length,`missing owner or metrics: ${row.id}`);
  assert.equal(row.attention,native.counts.actionable);
  assert.deepEqual(row.metrics,native.metrics,`metric read projection changed producer: ${row.id}`);
  assert.ok(row.metrics.length<=4);
  for(const metric of row.metrics){
   const spec=specs.find(x=>x.id===metric.id);assert.ok(spec,`missing catalog metric: ${row.id}/${metric.id}`);
   assert.equal(metric.label,spec.label);assert.equal(metric.basis.denominator,spec.denominator||null);
   assert.equal(metric.basis.computationVersion,`${row.id}:${metric.id}@1`);
   assert.equal(metric.basis.stateRevision,summary.projection.stateRevision);
   assert.equal(metric.basis.scope,summary.projection.scope);
   assert.deepEqual(metric.basis.scopeRef,summary.projection.scopeRef);
   assert.equal(metric.basis.transactionAsOf,summary.projection.transactionAsOf);
   assert.equal(metric.basis.validAsOf,summary.projection.validAsOf);
   assert.equal(metric.basis.drilldown,spec.drilldown);
   assert.equal(metric.basis.claimBoundary,spec.claimBoundary);
  }
 }
}
const evaluations=[];
for(const actor of actors){
 const summary=procedureSummaryProjection(state,actor,times),worklist=procedureWorklistProjection(state,actor,times);
 assertMatching(summary,worklist,actor);
 evaluations.push({actor:actor.role,count:summary.rows.length,metrics:summary.rows.reduce((n,x)=>n+x.metrics.length,0),attention:summary.counts.attention});
}
const admin=procedureSummaryProjection(state,actors[0],times),user=procedureSummaryProjection(state,actors[1],times);
const act=row=>row.rows.find(x=>x.id==='actions').attention;
assert.ok(act(user)<act(admin),'actor-visible records must not match the admin universe blindly');
const changed=structuredClone(admin);changed.rows[0].metrics[0].value+=1;
assert.throws(()=>assertMatching(changed,procedureWorklistProjection(state,actors[0],times),actors[0]),/metric read projection changed producer/);
const stale=structuredClone(admin);stale.rows[0].metrics[0].basis.stateRevision=12;
assert.throws(()=>assertMatching(stale,procedureWorklistProjection(state,actors[0],times),actors[0]),/metric read projection changed producer/);
console.log(JSON.stringify({ok:true,gate:'ux-r8-metric-provenance',actors:evaluations,crossRoleEqualityForbidden:true,negativeMutationsKilled:2,claimLimit:'fixture-scoped cross-projection identity; no claim of global equal denominators or UI metric geometry'}));
