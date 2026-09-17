import { now, sha256 } from '../domain.mjs';
import { DEMO_SUITE_22_ID, DEMO_SUITE_22_MANIFEST, DEMO_SUITE_22_SCENARIO } from './demo-suite-2-2-fixture.mjs';
import { buildDemoSuite22State } from './demo-suite-2-2-replay.mjs';

export const DEMO_SUITE_30_VERSION='3.0';
export const DEMO_SUITE_30_ENV='ICTC_DEMO_SUITE';
export const DEMO_SUITE_30_ID='ictc-demo-suite-3-0';
export const DEMO_SUITE_30_LEGACY_SOURCE=Object.freeze({suiteVersion:'2.2',scenarioId:DEMO_SUITE_22_ID,status:'deprecated-generator'});
export const DEMO_SUITE_30_SCENARIO=Object.freeze({...structuredClone(DEMO_SUITE_22_SCENARIO),id:DEMO_SUITE_30_ID,version:DEMO_SUITE_30_VERSION,sourceScenarioId:DEMO_SUITE_22_ID,sourceSuite:'2.2-deprecated-generator'});

const BATCH_SIZE=25,clone=value=>structuredClone(value);
const PROCEDURES=Object.freeze([['monitoring','mission','missions','RN-01'],['incidents','incident','incidents','EC-01'],['objects','grc-object','grcObjects','AO-01'],['coverage','mapping','grcMappings','MC-01'],['actions','action','grcActions','AP-01'],['risks','risk','grcRisks','RC-01'],['assurance','assurance-case','grcAssurance','AR-01']]);
const LIMITATIONS=Object.freeze([
  'Scenario sintetico DEMO real-like: non rappresenta fatti, persone, sistemi o decisioni di una organizzazione reale.',
  'Suite 3.0 e la sola identita DEMO attiva; la Suite 2.2 resta una dipendenza di generazione deprecata e non e una runtime authority.',
  'I 188 record business sono gli unici record business DEMO persistiti; i 512 mutanti di stress restano test-only e non sono persistiti o mostrati come record UI.',
  'Evidence Lattice 3.0 e una proiezione read-only dei medesimi record nativi e non introduce una seconda popolazione business.',
  'Nessun record dimostra applicabilita legale, conformita, efficacia di controllo o assurance indipendente.'
]);
const ADMIN=Object.freeze({id:'local-admin',role:'admin',identityMode:'local',displayName:'Amministratore locale'});
const businessCount=state=>PROCEDURES.reduce((sum,[,,collection])=>sum+(state?.[collection]||[]).length,0);
const mergeUsers=(existing=[],incoming=[])=>{const byId=new Map((existing||[]).map(item=>[item.id,item]));for(const user of incoming||[])if(user?.id&&!byId.has(user.id))byId.set(user.id,clone(user));return[...byId.values()];};
const datasetTag=Object.freeze({id:DEMO_SUITE_30_ID,version:DEMO_SUITE_30_VERSION,authority:'demo-suite-3-0',synthetic:true});

export function demoSuite30Enabled(env=process.env){return String(env?.[DEMO_SUITE_30_ENV]||'').trim()==='3.0';}
function allBusinessRecords(state){return PROCEDURES.flatMap(([procedureId,,collection])=>(state?.[collection]||[]).map(record=>({procedureId,record})));}
function promoteMeta(meta={}){const out=clone(meta||{});out.scenarioVersion='3.0';out.datasetAuthority='demo-suite-3-0';out.sourceScenarioVersion=meta?.scenarioVersion||'2.2';out.granular={...(out.granular||{}),contractVersion:'3.0'};return out;}
function promoteBusinessRecord(record,procedureId){const out=clone(record),legacyDemo=clone(out.demo||{});out.demo={...legacyDemo,synthetic:true,tag:'synthetic-demo',scenarioId:DEMO_SUITE_30_ID,scenarioVersion:'3.0-runtime',datasetId:DEMO_SUITE_30_ID,datasetVersion:DEMO_SUITE_30_VERSION,datasetAuthority:'demo-suite-3-0',sourceScenarioId:legacyDemo.scenarioId||DEMO_SUITE_22_ID,procedureId:legacyDemo.procedureId||procedureId,legacySource:clone(DEMO_SUITE_30_LEGACY_SOURCE),meta:promoteMeta(legacyDemo.meta||{}),claimBoundary:legacyDemo.claimBoundary||'Dati sintetici DEMO: nessuna conclusione legale o di conformita.'};return out;}
function promoteSupport(record,kind){return{...clone(record),demoDataset:{...datasetTag,kind},legacySource:clone(DEMO_SUITE_30_LEGACY_SOURCE)};}
export const demoSuite30StateDigest=state=>sha256({datasetId:DEMO_SUITE_30_ID,datasetVersion:DEMO_SUITE_30_VERSION,missions:state.missions||[],catalog:state.catalog||[],incidents:state.incidents||[],grcObjects:state.grcObjects||[],grcMappings:state.grcMappings||[],grcActions:state.grcActions||[],grcRisks:state.grcRisks||[],grcAssurance:state.grcAssurance||[],controlTests:state.controlTests||[]});

export async function buildDemoSuite30State(){
  const legacy=await buildDemoSuite22State(),state=clone(legacy.state);
  for(const[procedureId,,collection]of PROCEDURES)state[collection]=(state[collection]||[]).map(record=>promoteBusinessRecord(record,procedureId));
  state.catalog=(state.catalog||[]).map(record=>promoteSupport(record,'catalog'));
  state.controlTests=(state.controlTests||[]).map(record=>promoteSupport(record,'control-test'));
  state.users=(state.users||[]).map(record=>promoteSupport(record,'principal'));
  state.settings=state.settings||{};
  state.settings.organization={...(state.settings.organization||{}),scope:`Scenario sintetico DEMO Suite 3.0 — ${DEMO_SUITE_22_MANIFEST.company.business}; ${DEMO_SUITE_22_MANIFEST.company.employees} addetti; nessuna inferenza automatica di applicabilita o conformita.`};
  const stateDigest=demoSuite30StateDigest(state);
  return{state,counters:clone(legacy.counters),runtimeDerived:clone(legacy.runtimeDerived),findings:clone(legacy.findings),stateDigest,legacySourceDigest:legacy.stateDigest};
}

export function demoSuite30Violations(state={}){
  const manifest=DEMO_SUITE_22_MANIFEST,out=[],ids=new Set(),records=allBusinessRecords(state);
  if(state?.settings?.demoSuite22)out.push('legacy-marker:demoSuite22');
  for(const[procedureId,,collection]of PROCEDURES){const expected=manifest.expectedCounts[procedureId],items=state?.[collection]||[],actual=items.filter(x=>x?.demo?.datasetId===DEMO_SUITE_30_ID).length;if(items.length!==expected)out.push(`count:${procedureId}:${items.length}/${expected}`);if(actual!==expected)out.push(`dataset-count:${procedureId}:${actual}/${expected}`);}
  if(records.length!==188)out.push(`business-count:${records.length}/188`);
  for(const{procedureId,record}of records){
    if(!record?.id||ids.has(record.id))out.push(`id:${record?.id||procedureId}`);else ids.add(record.id);
    const demo=record?.demo||{},meta=demo.meta||{},ui=meta?.granular?.uiProjection;
    if(demo.synthetic!==true||demo.scenarioId!==DEMO_SUITE_30_ID||demo.datasetId!==DEMO_SUITE_30_ID||demo.datasetVersion!==DEMO_SUITE_30_VERSION||demo.datasetAuthority!=='demo-suite-3-0'||demo.scenarioVersion!=='3.0-runtime')out.push(`provenance:${record?.id||procedureId}`);
    if(demo.sourceScenarioId!==DEMO_SUITE_22_ID||demo.legacySource?.suiteVersion!=='2.2'||demo.legacySource?.status!=='deprecated-generator')out.push(`legacy-source:${record?.id||procedureId}`);
    if(meta.scenarioVersion!=='3.0'||meta.datasetAuthority!=='demo-suite-3-0'||meta?.granular?.contractVersion!=='3.0')out.push(`metadata:${record.id}`);
    if(ui?.['L5-technical']?.runtimeAuthority!=='native-procedure-runtime'||ui?.['L5-technical']?.stressVisible!==false)out.push(`authority:${record.id}`);
    if(demo?.operatingYear?.stressOnly===true)out.push(`stress:${record.id}`);
  }
  for(const item of state.catalog||[])if(item?.demoDataset?.id!==DEMO_SUITE_30_ID||item?.demoDataset?.authority!=='demo-suite-3-0')out.push(`support:catalog:${item?.id||'unknown'}`);
  for(const item of state.controlTests||[])if(item?.demoDataset?.id!==DEMO_SUITE_30_ID||item?.demoDataset?.authority!=='demo-suite-3-0')out.push(`support:control-test:${item?.id||'unknown'}`);
  const activeObjects=new Set((state.grcObjects||[]).filter(x=>x.status==='active').map(x=>x.id)),allObjects=new Set((state.grcObjects||[]).map(x=>x.id));
  for(const mapping of state.grcMappings||[]){for(const id of mapping.targetIds||[])if(!allObjects.has(id))out.push(`mapping-target-missing:${mapping.id}:${id}`);if(mapping.state==='mapped'&&!(mapping.targetIds||[]).every(id=>activeObjects.has(id)))out.push(`mapping-target-not-active:${mapping.id}`);}
  for(const action of(state.grcActions||[]).filter(x=>x.state==='closed'))if(!(action.verifications||[]).some(v=>v.decision==='closed'&&(v.evidenceBindings||[]).length&&(v.evidenceBindings||[]).every(e=>e.usable)))out.push(`action-verification:${action.id}`);
  for(const item of(state.grcAssurance||[]).filter(x=>x.state==='approved'))if(!(item.approvals||[]).length)out.push(`assurance-approval:${item.id}`);
  return[...new Set(out)];
}

export function demoSuite30Projection(state={}){
  const marker=state?.settings?.demoSuite30,manifest=DEMO_SUITE_22_MANIFEST;
  if(!marker)return{enabled:false,suiteVersion:DEMO_SUITE_30_VERSION,profile:'suite-3.0',projectionAuthority:'demo-suite-3-0',deprecatedSuite:'2.2'};
  const violations=marker.status==='complete'?demoSuite30Violations(state):[];
  return{enabled:marker.status==='complete',status:marker.status,suiteVersion:DEMO_SUITE_30_VERSION,profile:'suite-3.0',projectionAuthority:'demo-suite-3-0',datasetId:DEMO_SUITE_30_ID,scenarioId:DEMO_SUITE_30_ID,sourceScenarioId:DEMO_SUITE_22_ID,deprecatedSuite:'2.2',legacySourceStatus:'deprecated-generator-only',stateDigest:marker.stateDigest,organizationName:state?.settings?.organization?.name||manifest.company.name,positiveRecords:marker.positiveRecords||0,primaryRecords:marker.positiveRecords||0,supportRecords:marker.supportRecords||0,uiBusinessRecords:marker.positiveRecords||0,stressFixtures:manifest.stressRecordCount,stressVisible:false,totalModelTarget:manifest.totalModelTarget,counts:clone(marker.counts||{}),metadataStages:['L0-shell','L1-procedure','L2-list','L3-detail','L4-provenance','L5-technical'],synthetic:true,coherent:marker.status==='complete'&&violations.length===0,violations,claimBoundary:'Suite 3.0 sintetica: i record business persistiti sono esattamente il corpus DEMO canonico; stress e mutazioni restano test-only; nessuna conclusione legale, prova di conformita o assurance indipendente.',limitations:[...LIMITATIONS]};
}

export async function ensureDemoSuite30(store,{enabled=demoSuite30Enabled()}={}){
  if(!enabled)return{enabled:false,seeded:false,suiteVersion:DEMO_SUITE_30_VERSION,projectionAuthority:'demo-suite-3-0'};
  let snapshot=store.snapshot(),marker=snapshot.settings?.demoSuite30;
  if(marker?.status==='complete'){
    if(marker.datasetId!==DEMO_SUITE_30_ID)throw Object.assign(new Error('Marker DEMO 3.0 incompatibile'),{code:'demo-suite-3-0-marker-mismatch'});
    const actualDigest=demoSuite30StateDigest(snapshot);if(marker.stateDigest!==actualDigest)throw Object.assign(new Error('Digest runtime DEMO 3.0 non coerente'),{code:'demo-suite-3-0-digest-drift',details:{actual:actualDigest,expected:marker.stateDigest}});
    const violations=demoSuite30Violations(snapshot);if(violations.length)throw Object.assign(new Error(`Drift runtime DEMO 3.0: ${violations.slice(0,8).join('; ')}`),{code:'demo-suite-3-0-runtime-drift',details:{violations}});
    return{...demoSuite30Projection(snapshot),seeded:false};
  }
  if(snapshot.settings?.demoSuite22?.status)throw Object.assign(new Error('DEMO 3.0 richiede una runtime directory nuova: marker Suite 2.2 deprecato presente'),{code:'demo-suite-3-0-legacy-runtime-conflict'});
  if(snapshot.settings?.demoSeed?.status==='complete')throw Object.assign(new Error('DEMO 3.0 richiede una runtime directory nuova: seed legacy presente'),{code:'demo-suite-3-0-legacy-seed-conflict'});
  if(marker)throw Object.assign(new Error('Marker DEMO 3.0 parziale: usa una runtime directory nuova'),{code:'demo-suite-3-0-partial-marker'});
  if(businessCount(snapshot)>0)throw Object.assign(new Error('DEMO 3.0 rifiutata: runtime business non vuota'),{code:'demo-suite-3-0-state-not-empty'});
  const built=await buildDemoSuite30State(),manifest=DEMO_SUITE_22_MANIFEST;
  await store.mutate(ADMIN,'demo.suite-3-0.started',{type:'settings',id:'demo-suite-3-0'},{datasetId:DEMO_SUITE_30_ID,stateDigest:built.stateDigest},draft=>{draft.settings=draft.settings||{};delete draft.settings.demoSuite22;draft.settings.organization={...(draft.settings.organization||{}),name:manifest.company.name,scope:`Scenario sintetico DEMO Suite 3.0 — ${manifest.company.business}; ${manifest.company.employees} addetti; nessuna inferenza automatica di applicabilita o conformita.`,jurisdictions:clone(manifest.company.declaredContext?.jurisdictions||[]),sectors:clone(manifest.company.declaredContext?.sectors||[])};draft.settings.demoSuite30={schemaVersion:'3.0.0',status:'seeding',suiteVersion:DEMO_SUITE_30_VERSION,datasetId:DEMO_SUITE_30_ID,sourceScenarioId:DEMO_SUITE_22_ID,deprecatedSourceSuite:'2.2',stateDigest:built.stateDigest,synthetic:true,startedAt:now(),completedAt:null,positiveRecords:0,supportRecords:0,counts:{},limitations:[...LIMITATIONS]};return clone(draft.settings.demoSuite30);},{id:`${DEMO_SUITE_30_ID}:start`,metadata:{demoSuite:'3.0',synthetic:true,legacySource:'2.2-deprecated-generator'}});
  await store.mutate(ADMIN,'demo.suite-3-0.support',{type:'settings',id:'demo-suite-3-0-support'},{datasetId:DEMO_SUITE_30_ID},draft=>{draft.users=mergeUsers(draft.users,built.state.users);draft.controlTests=clone(built.state.controlTests);draft.catalog=clone(built.state.catalog);return{users:built.state.users.length,controlTests:draft.controlTests.length,catalog:draft.catalog.length};},{id:`${DEMO_SUITE_30_ID}:support`,metadata:{demoSuite:'3.0',synthetic:true}});
  for(const[procedureId,subjectType,collection,code]of PROCEDURES){const records=built.state[collection]||[];for(let offset=0;offset<records.length;offset+=BATCH_SIZE){const batch=records.slice(offset,offset+BATCH_SIZE),batchNo=offset/BATCH_SIZE+1,primary=batch[0];await store.mutate(ADMIN,'demo.suite-3-0.batch',{type:subjectType,id:primary.id},{datasetId:DEMO_SUITE_30_ID,procedureId,code,batch:batchNo,count:batch.length},draft=>{draft[collection]=draft[collection]||[];for(const record of batch)draft[collection].push(clone(record));return clone(primary);},{id:`${DEMO_SUITE_30_ID}:${procedureId}:${batchNo}`,semanticSubjects:batch.slice(1).map(record=>({type:subjectType,id:record.id})),metadata:{demoSuite:'3.0',synthetic:true,procedureId,batch:batchNo}});}}
  await store.mutate(ADMIN,'demo.suite-3-0.completed',{type:'settings',id:'demo-suite-3-0'},{datasetId:DEMO_SUITE_30_ID,stateDigest:built.stateDigest},draft=>{const violations=demoSuite30Violations(draft);if(violations.length)throw Object.assign(new Error(`DEMO 3.0 incompleta: ${violations.slice(0,8).join('; ')}`),{code:'demo-suite-3-0-semantic-mismatch',details:{violations}});const counts=Object.fromEntries(PROCEDURES.map(([id,,collection])=>[id,(draft[collection]||[]).length]));const stateDigest=demoSuite30StateDigest(draft);if(stateDigest!==built.stateDigest)throw Object.assign(new Error('DEMO 3.0 digest cambiato durante la materializzazione'),{code:'demo-suite-3-0-materialization-digest-mismatch',details:{actual:stateDigest,expected:built.stateDigest}});draft.settings.demoSuite30={...draft.settings.demoSuite30,status:'complete',completedAt:now(),positiveRecords:188,supportRecords:(draft.catalog||[]).length+(draft.controlTests||[]).length,counts,constructors:built.counters.constructors,checkpoints:built.counters.checkpoints,events:built.counters.events};return clone(draft.settings.demoSuite30);},{id:`${DEMO_SUITE_30_ID}:complete`,metadata:{demoSuite:'3.0',synthetic:true}});
  return{...demoSuite30Projection(store.snapshot()),seeded:true};
}

export const demoSuite30Internals=Object.freeze({PROCEDURES,LIMITATIONS,manifest:DEMO_SUITE_22_MANIFEST,businessCount,datasetTag,legacySource:DEMO_SUITE_30_LEGACY_SOURCE,stateDigest:demoSuite30StateDigest});
