import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildDemoSuite22State, DEMO_SUITE_22_ID, DEMO_SUITE_22_SCENARIO, ensureDemoSuite22 } from './runtime/demo-suite-2-2.mjs';
import { buildClosedDemoEvidenceLattice30, DEMO_SME_CLOSED_ONTOLOGY, ICTC_CANONICAL_EPISTEMIC_FAMILIES } from './runtime/demo-evidence-lattice-3-0-closure.mjs';
import { DEMO_EVIDENCE_LEVELS } from './runtime/demo-evidence-lattice-3-0.mjs';

const built=await buildDemoSuite22State();
const graph=buildClosedDemoEvidenceLattice30(built.state,{asOf:`${DEMO_SUITE_22_SCENARIO.operatingYear?.referenceDate||'2026-06-30'}T23:59:59.999Z`});
assert.equal(graph.enabled,true);assert.equal(graph.ok,true,`closed lattice violations: ${[...(graph.violations||[]),...(graph.closure?.reasons||[])].slice(0,30).join('; ')}`);
assert.equal(graph.closure.closed,true);assert.equal(graph.summary.subjects,188);assert.equal(graph.summary.period.months,12);assert.equal(graph.summary.period.quarters,4);assert.equal(graph.closure.danglingEdges,0);assert.ok(graph.closure.crossProcedureRelations>0,'real lattice requires cross-procedure semantic relations');
for(const dimension of DEMO_SME_CLOSED_ONTOLOGY)assert.equal(graph.summary.ontologyCoverage[dimension],true,`SME ontology dimension missing: ${dimension}`);
for(const family of ICTC_CANONICAL_EPISTEMIC_FAMILIES)assert.equal(graph.summary.epistemicSupport[family],true,`ICTC epistemic family unsupported: ${family}`);
for(const [family,present] of Object.entries(graph.summary.epistemicCoverage))if(present)assert.equal(graph.summary.epistemicSupport[family],true,`instantiated unsupported epistemic family: ${family}`);
for(const level of DEMO_EVIDENCE_LEVELS)assert.equal(graph.summary.evidenceCoverage[level],true,`evidence abstraction level missing: ${level}`);
assert.ok(graph.nodes.some(node=>node.kind==='portfolio'&&node.evidenceLevel==='E5-portfolio-view'),'annual E5 portfolio node missing');
assert.ok(graph.nodes.some(node=>node.kind==='claim'&&node.claimType==='unknown'&&node.epistemicStatus==='unknown'),'explicit unknowns must remain first-class');
assert.ok(graph.edges.filter(edge=>edge.kind==='correlation').every(edge=>edge.causal===false&&edge.authorityTransfer==='none'&&edge.basis),'correlation must remain non-causal and non-authority-transferring');
assert.ok(graph.nodes.filter(node=>node.kind==='event').some(node=>node.worldAt&&node.knownAt),'event-time and knowledge-time must coexist');

const PROCEDURE_COLLECTIONS=['missions','incidents','grcObjects','grcMappings','grcActions','grcRisks','grcAssurance'];
class MemoryStore{
  constructor(){this.state={settings:{organization:{}},users:[],missions:[],catalog:[],incidents:[],grcObjects:[],grcMappings:[],grcActions:[],grcRisks:[],grcAssurance:[],controlTests:[],audit:[]};}
  snapshot(){return structuredClone(this.state);}
  async mutate(actor,event,subject,payload,fn){const draft=structuredClone(this.state);const result=fn(draft);draft.audit=[...(draft.audit||[]),{event,action:event,actor:actor.id,subject,payload}];draft.revision=(draft.revision||0)+1;this.state=draft;return{result};}
}
const clean=new MemoryStore(),seeded=await ensureDemoSuite22(clean,{enabled:true}),snapshot=clean.snapshot();assert.equal(seeded.seeded,true);assert.equal(snapshot.settings.demoSeed,undefined,'legacy demo marker must not survive');
for(const collection of PROCEDURE_COLLECTIONS){assert.deepEqual(snapshot[collection],built.state[collection],`exclusive business load drift: ${collection}`);assert.ok(snapshot[collection].every(record=>record.demo?.scenarioId===DEMO_SUITE_22_ID),`non-Suite-2.2 record leaked into ${collection}`);}
assert.deepEqual(snapshot.catalog,built.state.catalog,'catalog must be replaced by Suite 2.2 support corpus, not appended');assert.deepEqual(snapshot.controlTests,built.state.controlTests,'control tests must be replaced by Suite 2.2 support corpus, not appended');assert.deepEqual(snapshot.users,built.state.users,'clean isolated runtime must contain only Suite 2.2 principals');
const again=await ensureDemoSuite22(clean,{enabled:true});assert.equal(again.seeded,false,'exclusive load must be idempotent after completion');
const dirtyBusiness=new MemoryStore();dirtyBusiness.state.grcObjects.push({id:'pre-existing-business'});await assert.rejects(()=>ensureDemoSuite22(dirtyBusiness,{enabled:true}),error=>error?.code==='demo-suite-2-2-state-not-empty');
const legacy=new MemoryStore();legacy.state.settings.demoSeed={status:'complete'};await assert.rejects(()=>ensureDemoSuite22(legacy,{enabled:true}),error=>error?.code==='demo-suite-2-2-legacy-seed-conflict');
const partial=new MemoryStore();partial.state.settings.demoSuite22={status:'seeding'};await assert.rejects(()=>ensureDemoSuite22(partial,{enabled:true}),error=>error?.code==='demo-suite-2-2-partial-marker');

const [handler,registry,workflow,launcher]=await Promise.all([readFile(new URL('./runtime/demo-evidence-lattice-handler.mjs',import.meta.url),'utf8'),readFile(new URL('./runtime/runtime-handler-registry.mjs',import.meta.url),'utf8'),readFile(new URL('../.github/workflows/demo-evidence-lattice-3-0.yml',import.meta.url),'utf8'),readFile(new URL('../ictc.sh',import.meta.url),'utf8')]);
assert.ok(handler.includes('buildClosedDemoEvidenceLattice30'));assert.equal(handler.includes('store.mutate'),false,'lattice endpoint must remain read-only');assert.ok(registry.includes("'demo-evidence-lattice'"));assert.ok(workflow.includes('demo-evidence-lattice-3-0-completeness-check.mjs'));assert.ok(workflow.includes('demo-evidence-lattice-3-0-mutation-10m.mjs'));assert.ok(launcher.includes('demo-runtime-2-2'),'launcher must retain isolated Suite 2.2 runtime directory');
console.log(JSON.stringify({ok:true,control:'DEMO-EVIDENCE-LATTICE-3.0-COMPLETENESS',sourceScenarioId:DEMO_SUITE_22_ID,subjects:graph.summary.subjects,ontologyCoverage:graph.summary.ontologyCoverage,epistemicSupport:graph.summary.epistemicSupport,epistemicCoverage:graph.summary.epistemicCoverage,evidenceCoverage:graph.summary.evidenceCoverage,crossProcedureRelations:graph.closure.crossProcedureRelations,exclusiveLoad:{businessCollections:PROCEDURE_COLLECTIONS.length,supportReplacement:true,noLegacyMarker:true,dirtyBusinessRejected:true,legacyRejected:true,partialMarkerRejected:true,idempotent:true},claimBoundary:graph.closure.claimBoundary},null,2));
