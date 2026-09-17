import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveBootstrap } from './bootstrap-contract.mjs';
import { DEMO_SUITE_30_ID, DEMO_SUITE_30_SCENARIO, buildDemoSuite30State, demoSuite30Projection, demoSuite30Violations, ensureDemoSuite30 } from './runtime/demo-suite-3-0.mjs';
import { buildDemoSuite30EvidenceLattice } from './runtime/demo-suite-3-0-lattice.mjs';

const COLLECTIONS=['missions','incidents','grcObjects','grcMappings','grcActions','grcRisks','grcAssurance'];
class MemoryStore{
  constructor(){this.state={settings:{organization:{}},users:[],missions:[],catalog:[],runs:[],incidents:[],grcObjects:[],grcMappings:[],grcActions:[],grcRisks:[],grcAssurance:[],controlTests:[],audit:[],revision:0};}
  snapshot(){return structuredClone(this.state);}
  async mutate(actor,event,subject,payload,fn){const draft=structuredClone(this.state),result=fn(draft);draft.audit=[...(draft.audit||[]),{event,action:event,actorId:actor.id,subject,payload}];draft.revision=(draft.revision||0)+1;this.state=draft;return{result};}
}

const resolved=resolveBootstrap({requested:'demo',env:{},root:'/repo'});assert.equal(resolved.demoSuite,'3.0');assert.equal(resolved.runtimeDir,'/repo/.ictc/demo-runtime-3-0');
const legacyExplicit=resolveBootstrap({requested:'auto',env:{ICTC_DEMO_SUITE:'2.2'},root:'/repo'});assert.equal(legacyExplicit.demoSuite,'2.2');assert.equal(legacyExplicit.runtimeDir,'/repo/.ictc/demo-runtime-2-2');

const built=await buildDemoSuite30State();assert.equal(demoSuite30Violations(built.state).length,0);assert.deepEqual(DEMO_SUITE_30_SCENARIO.expectedCounts,{monitoring:9,incidents:18,objects:63,coverage:36,actions:27,risks:21,assurance:14});
let business=0;for(const collection of COLLECTIONS){const records=built.state[collection]||[];business+=records.length;assert.ok(records.every(record=>record.demo?.scenarioId===DEMO_SUITE_30_ID&&record.demo?.datasetId===DEMO_SUITE_30_ID&&record.demo?.datasetAuthority==='demo-suite-3-0'&&record.demo?.sourceScenarioId&&record.demo?.legacySource?.status==='deprecated-generator'),`3.0 provenance drift in ${collection}`);assert.equal(records.some(record=>record.demo?.operatingYear?.stressOnly===true),false,`stress leaked into ${collection}`);}assert.equal(business,188);
assert.ok((built.state.catalog||[]).every(item=>item.demoDataset?.id===DEMO_SUITE_30_ID));assert.ok((built.state.controlTests||[]).every(item=>item.demoDataset?.id===DEMO_SUITE_30_ID));

const store=new MemoryStore(),seeded=await ensureDemoSuite30(store,{enabled:true});assert.equal(seeded.enabled,true);assert.equal(seeded.seeded,true);assert.equal(seeded.suiteVersion,'3.0');assert.equal(seeded.projectionAuthority,'demo-suite-3-0');assert.equal(seeded.positiveRecords,188);assert.equal(seeded.stressFixtures,512);assert.equal(seeded.stressVisible,false);assert.equal(seeded.coherent,true);const snapshot=store.snapshot();assert.equal(snapshot.settings.demoSuite22,undefined);assert.equal(snapshot.settings.demoSuite30.status,'complete');assert.equal(demoSuite30Violations(snapshot).length,0);const projection=demoSuite30Projection(snapshot);assert.equal(projection.datasetId,DEMO_SUITE_30_ID);assert.equal(projection.deprecatedSuite,'2.2');
const again=await ensureDemoSuite30(store,{enabled:true});assert.equal(again.seeded,false);assert.equal(store.snapshot().revision,snapshot.revision,'3.0 bootstrap must be idempotent');

const graph=buildDemoSuite30EvidenceLattice(snapshot);assert.equal(graph.enabled,true);assert.equal(graph.ok,true,JSON.stringify(graph.violations||[]));assert.equal(graph.sourceSuite,'3.0');assert.equal(graph.sourceScenarioId,DEMO_SUITE_30_ID);assert.equal(graph.datasetAuthority,'demo-suite-3-0');assert.equal(graph.summary.subjects,188);assert.equal(graph.summary.sourceSuite,'3.0');assert.equal(graph.closure.closed,true);assert.equal(graph.closure.legacyGeneratorSuite,'2.2-deprecated');

const dirty=new MemoryStore();dirty.state.grcObjects.push({id:'not-demo'});await assert.rejects(()=>ensureDemoSuite30(dirty,{enabled:true}),error=>error?.code==='demo-suite-3-0-state-not-empty');const old=new MemoryStore();old.state.settings.demoSuite22={status:'complete'};await assert.rejects(()=>ensureDemoSuite30(old,{enabled:true}),error=>error?.code==='demo-suite-3-0-legacy-runtime-conflict');

const [launcher,handler]=await Promise.all([readFile(new URL('../ictc.sh',import.meta.url),'utf8'),readFile(new URL('./runtime/demo-evidence-lattice-handler.mjs',import.meta.url),'utf8')]);assert.ok(launcher.includes('demo) COMMAND="start"; DEMO_SUITE=3.0'));assert.ok(launcher.includes('demo-runtime-3-0'));assert.ok(launcher.includes('Suite 2.2 è deprecata'));assert.ok(handler.includes('buildDemoSuite30EvidenceLattice'));assert.equal(handler.includes('store.mutate'),false);
console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-CUTOVER',datasetId:DEMO_SUITE_30_ID,businessRecords:188,stressFixturesTestOnly:512,projectionAuthority:'demo-suite-3-0',latticeDigest:graph.digest,legacy22:'deprecated-generator-only',claimBoundary:projection.claimBoundary},null,2));
