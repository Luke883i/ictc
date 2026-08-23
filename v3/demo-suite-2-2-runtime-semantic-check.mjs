import assert from 'node:assert/strict';
import { objectRegistryProjection, coverageProjection } from './runtime/grc-model.mjs';
import { actionPlanProjection } from './runtime/grc-actions.mjs';
import { riskPortfolioProjection } from './runtime/grc-risks.mjs';
import { assuranceProjection } from './runtime/grc-assurance.mjs';
import { bindingsNeedReview } from './runtime/reference-contract.mjs';
import {
  DEMO_SUITE_22_EXPECTED_DIGEST,
  DEMO_SUITE_22_SCENARIO,
  buildDemoSuite22State,
  demoSuite22Projection,
  demoSuite22Violations,
  ensureDemoSuite22
} from './runtime/demo-suite-2-2.mjs';

const built=await buildDemoSuite22State();
const materialized=built.state;
const expected=DEMO_SUITE_22_SCENARIO.expectedCounts;
assert.equal(built.stateDigest,DEMO_SUITE_22_EXPECTED_DIGEST,'native replay digest');
assert.deepEqual(built.counters,{events:612,constructors:188,checkpoints:385},'native replay event/checkpoint census');
assert.deepEqual(Object.fromEntries([['monitoring',materialized.missions.length],['incidents',materialized.incidents.length],['objects',materialized.grcObjects.length],['coverage',materialized.grcMappings.length],['actions',materialized.grcActions.length],['risks',materialized.grcRisks.length],['assurance',materialized.grcAssurance.length]]),expected,'positive counts');
assert.equal(demoSuite22Violations(materialized).length,0,'materialized semantic violations');

const actor={id:'local-admin',displayName:'Amministratore locale',role:'admin',identityMode:'local'};
const RealDate=globalThis.Date,snapshotMs=RealDate.parse(DEMO_SUITE_22_SCENARIO.narrativeClock);
class SnapshotDate extends RealDate{constructor(...args){super(...(args.length?args:[snapshotMs]));}static now(){return snapshotMs;}}
globalThis.Date=SnapshotDate;
let objectProjection,coverage,actions,risks,assurance;
try{objectProjection=objectRegistryProjection(materialized,actor);coverage=coverageProjection(materialized);actions=actionPlanProjection(materialized,actor);risks=riskPortfolioProjection(materialized,actor);assurance=assuranceProjection(materialized,actor);}finally{globalThis.Date=RealDate;}
assert.deepEqual(objectProjection.counts,{total:63,candidate:3,active:59,critical:17,attestationDue:13},'AO native projection');
assert.deepEqual({declared:coverage.declared,mapped:coverage.mapped,gaps:coverage.gaps,unresolved:coverage.unresolved},{declared:36,mapped:25,gaps:6,unresolved:5},'MC native projection');
assert.deepEqual(actions.counts,{total:27,proposed:2,open:10,blocked:2,readyForReview:2,overdue:2,done:2,closed:15,cancelled:0},'AP native projection');
assert.deepEqual(risks.counts,{total:21,reviewed:18,unreviewed:3,untreated:5,reviewDue:6,mitigate:11,high:12},'RC native projection');
assert.deepEqual(assurance.counts,{total:14,intake:3,review:5,approved:6},'AR native projection');
assert.equal(objectProjection.objects.some(item=>item.type==='requirement'),false,'AO positive cohort excludes requirement nodes');
assert.equal(objectProjection.objects.some(item=>/^Due fattori\s*· DEMO$/i.test(item.name||'')),false,'AO excludes mechanism-only pseudo object');
assert.ok(objectProjection.objects.some(item=>/MFA account amministrativi Microsoft 365 · DEMO$/i.test(item.name||'')),'AO includes governed MFA control identity');
assert.ok((materialized.grcActions||[]).filter(item=>item.state==='closed').every(item=>(item.verifications||[]).some(v=>v.decision==='closed'&&(v.evidenceBindings||[]).length&&(v.evidenceBindings||[]).every(e=>e.usable))),'closed actions preserve usable evidence-backed verification');
assert.ok((materialized.grcAssurance||[]).filter(item=>item.state==='approved').every(item=>(item.approvals||[]).length&&(item.approvedAnswers||[]).length),'approved assurance preserves explicit response set');
const reviewNeededRisks=(materialized.grcRisks||[]).flatMap(item=>bindingsNeedReview([...(item.objectBindings||[]),...(item.controlBindings||[]),...(item.actionBindings||[])],materialized).map(binding=>({riskId:item.id,...binding})));
assert.ok(reviewNeededRisks.some(item=>item.riskId==='RC-021'&&item.reason==='version-changed'),'expected review-needed edge remains visible');

class MemoryStore{
  constructor(){this.state={settings:{organization:{}},users:[{id:'local-admin',displayName:'Amministratore locale',role:'admin',status:'active'},{id:'local-user',displayName:'Utente locale',role:'user',status:'active'},{id:'local-auditor',displayName:'Auditor locale',role:'auditor',status:'active'}],missions:[],catalog:[],incidents:[],grcObjects:[],grcMappings:[],grcActions:[],grcRisks:[],grcAssurance:[],controlTests:[]};}
  snapshot(){return structuredClone(this.state);}
  async mutate(_actor,_event,_subject,_payload,fn){const draft=structuredClone(this.state);const result=fn(draft);this.state=draft;return{result};}
}
const store=new MemoryStore();
const seeded=await ensureDemoSuite22(store,{enabled:true});
assert.equal(seeded.enabled,true);assert.equal(seeded.seeded,true);assert.equal(seeded.positiveRecords,188);
assert.equal(demoSuite22Violations(store.snapshot()).length,0,'seeded state semantic violations');
const again=await ensureDemoSuite22(store,{enabled:true});assert.equal(again.seeded,false,'idempotent bootstrap');
const posture=demoSuite22Projection(store.snapshot());assert.equal(posture.enabled,true);assert.equal(posture.suiteVersion,'2.2');assert.equal(posture.stressFixtures,512);
const noOp=new MemoryStore();const disabled=await ensureDemoSuite22(noOp,{enabled:false});assert.equal(disabled.enabled,false);assert.equal(noOp.snapshot().missions.length,0,'default runtime unchanged');
const conflict=new MemoryStore();conflict.state.grcObjects.push({id:'real-object'});await assert.rejects(()=>ensureDemoSuite22(conflict,{enabled:true}),error=>error?.code==='demo-suite-2-2-state-not-empty');
const legacy=new MemoryStore();legacy.state.settings.demoSeed={status:'complete'};await assert.rejects(()=>ensureDemoSuite22(legacy,{enabled:true}),error=>error?.code==='demo-suite-2-2-legacy-seed-conflict');

console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-2.2-RUNTIME-SEMANTIC',stateDigest:DEMO_SUITE_22_EXPECTED_DIGEST,positiveRecords:188,stressFixturesTestOnly:512,counts:expected,replay:built.counters,projections:{objects:objectProjection.counts,coverage:{declared:coverage.declared,mapped:coverage.mapped,gaps:coverage.gaps,unresolved:coverage.unresolved},actions:actions.counts,risks:risks.counts,assurance:assurance.counts},reviewNeededRisks:reviewNeededRisks.filter(item=>item.riskId==='RC-021'),bootstrap:{idempotent:true,defaultUnchanged:true,legacyConflictGuard:true,nonEmptyGuard:true}},null,2));
