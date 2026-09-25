import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const contract=JSON.parse(read('./seed-prepr-contract.json'));
const demoSource=read('./runtime/demo-suite-3-0.mjs');
const standardSource=read('./runtime/standard-public-source-pack.mjs');
const browserSource=read('./public/ui/standard-browser.js');
const epSource=read('./public/ui/epistemic-workspace-3-2.js');
const adminSource=read('./public/ui/admin-workspace-3-2.js');
const homeSource=read('./public/ui/stable-shell.js');
const copySource=read('./public/ui/product-copy.js');
let gateSource='';try{gateSource=read('./current-gate-registry.mjs');}catch{}

const ALL_SEEDS=Object.freeze(['UI-OBJECT-TYPE-COMPRESSION-1','DEMO-TRUTH-METADATA-1','STANDARD-KNOWLEDGE-PACK-UX-1','EP-ADMIN-LANDING-1','HOMEBOARDING-1']);
const PR_SEEDS=Object.freeze(['DEMO-TRUTH-METADATA-1','STANDARD-KNOWLEDGE-PACK-UX-1','EP-ADMIN-LANDING-1','HOMEBOARDING-1']);
const byId=new Map(contract.seeds.map(seed=>[seed.id,seed]));
assert.deepEqual(contract.seeds.map(seed=>seed.id),ALL_SEEDS,'seed census must remain exactly five');
assert.deepEqual(byId.get('UI-OBJECT-TYPE-COMPRESSION-1').requires,[],'typing must remain the root prerequisite');
for(const id of ['DEMO-TRUTH-METADATA-1','STANDARD-KNOWLEDGE-PACK-UX-1','EP-ADMIN-LANDING-1'])assert.deepEqual(byId.get(id).requires,['UI-OBJECT-TYPE-COMPRESSION-1'],`${id} dependency drift`);
assert.deepEqual(byId.get('HOMEBOARDING-1').requires,['UI-OBJECT-TYPE-COMPRESSION-1','DEMO-TRUTH-METADATA-1','STANDARD-KNOWLEDGE-PACK-UX-1'],'Home dependency closure drift');

const canonicalJson=value=>{if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return `[${value.map(canonicalJson).join(',')}]`;return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;};
const sha256=value=>createHash('sha256').update(Buffer.from(typeof value==='string'?value:canonicalJson(value))).digest('hex');
async function injectedModule(source,prefix){const body=source.replace(/^import[^\n]*\n/gm,'');return import(`data:text/javascript;base64,${Buffer.from(`${prefix}\n${body}`).toString('base64')}`);}

const demo=await injectedModule(demoSource,`
import { createHash } from 'node:crypto';
function canonicalJson(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(canonicalJson).join(',')+']';return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonicalJson(value[key])).join(',')+'}';}
const now=()=>new Date(0).toISOString();
const sha256=value=>createHash('sha256').update(Buffer.from(typeof value==='string'?value:canonicalJson(value))).digest('hex');
const DEMO_SUITE_22_ID='ictc-demo-suite-2-2-candidate';
const DEMO_SUITE_22_MANIFEST={company:{name:'Synthetic',business:'Test',employees:10,declaredContext:{jurisdictions:[],sectors:[]}},expectedCounts:{monitoring:1,incidents:1,objects:1,coverage:1,actions:1,risks:1,assurance:1},stressRecordCount:0,totalModelTarget:7};
const DEMO_SUITE_22_SCENARIO={id:DEMO_SUITE_22_ID,version:'2.2'};
const buildDemoSuite22State=async()=>({state:{},counters:{constructors:0,checkpoints:0,events:0},runtimeDerived:{},findings:[],stateDigest:'stub'});
`);
const samples={
  monitoring:{id:'m1',jobName:'Vigilanza',objective:'Fonti',state:'active',cadenceHours:24,nextRunAt:'2026-09-26T00:00:00Z',planVersion:2},
  incidents:{id:'i1',caseTitle:'Evento',originalNarrative:'Fatto',state:'review',eventKind:'incident',operationalSeverity:'medium',awarenessAt:'2026-09-25T10:00:00Z'},
  objects:{id:'o1',name:'ERP',status:'active',type:'system',criticality:'high',owner:'Ops'},
  coverage:{id:'c1',requirementRef:'Art. 32',requirementLabel:'Security',state:'mapped',universe:'declared',targetIds:['o1'],proposalSource:'human'},
  actions:{id:'a1',title:'Rotate keys',state:'open',priority:'high',owner:'Sec',dueAt:'2026-10-01',nextStep:'verify'},
  risks:{id:'r1',title:'Credential loss',reviewState:'review',humanRating:'high',reviewAt:'2026-10-01',owner:'Risk'},
  assurance:{id:'q1',title:'Questionnaire',state:'draft',source:'customer',questionCount:12,owner:'GRC'}
};
const collectionByProcedure={monitoring:'missions',incidents:'incidents',objects:'grcObjects',coverage:'grcMappings',actions:'grcActions',risks:'grcRisks',assurance:'grcAssurance'};
const demoState={};
for(const [procedureId,record] of Object.entries(samples)){
  const metadata=demo.deriveDemoSuite30Metadata(record,procedureId);
  assert.deepEqual(Object.keys(metadata),['L0-shell','L1-procedure','L2-list','L3-detail','L4-provenance','L5-technical']);
  assert.equal(metadata['L2-list'].primitive,'RecordRow');
  assert.equal(metadata['L5-technical'].metadataAuthority,'mechanically-derived');
  assert.equal(metadata['L4-provenance'].datasetId,'ictc-demo-suite-3-0');
  demoState[collectionByProcedure[procedureId]]=[record];
}
const demoDigest=demo.demoSuite30MetadataDigest(demoState),basis=demo.demoSuite30LearningBasis(demoState);
assert.equal(demoDigest.length,64);assert.equal(basis.businessRecords,7);assert.equal(basis.processCount,7);assert.equal(basis.metadataDigest,demoDigest);assert.equal(basis.datasetAuthority,'demo-suite-3-0');
const changed=structuredClone(demoState);changed.grcActions[0].title='Rotate signing keys';assert.notEqual(demo.demoSuite30MetadataDigest(changed),demoDigest,'material record mutation must invalidate metadata digest');
assert.ok(!/demoSuite30LearningScenarios|Scenario BAD|Scenario WORST/.test(demoSource),'DEMO must expose facts/basis, never educational copy authority');

const standard=await injectedModule(standardSource,`import { createHash } from 'node:crypto'; const standardCatalog=()=>({frameworks:[]});`);
const licensed={id:'licensed-demo',shortName:'L',title:'Licensed Demo',issuer:'Issuer',edition:'1',sourceAuthority:'Issuer',sourceUrl:'https://example.test/l',contentPolicy:'licensed-reference-index',nodes:[
  {id:'s1',ref:'1',kind:'clause',text:'MUST NOT LEAK'},
  {id:'s2',ref:'1.1',kind:'clause',parentSectionId:'s1'},
  {id:'s3',ref:'1.1.1',kind:'clause',parentSectionId:'s2'}
]};
const pack=standard.standardKnowledgePackProjection(licensed,{});
assert.equal(pack.documentModel,'hierarchical-sections-v1');assert.equal(pack.documentRoot.depth,0);assert.equal(pack.sectionCount,3);assert.equal(pack.sections[0].depth,1);assert.equal(pack.sections[1].depth,2);assert.equal(pack.sections[2].depth,3);assert.equal(pack.sections[0].normativeTextIncluded,false,'licensed reference must not launder supplied text as authorized content');assert.equal(pack.sections[0].body,'');assert.equal(pack.sourceDigest.length,64);assert.equal(pack.hierarchyDigest.length,64);assert.equal(pack.packDigest.length,64);
const packEdition=standard.standardKnowledgePackProjection({...licensed,edition:'2'},{});assert.notEqual(packEdition.sourceDigest,pack.sourceDigest);assert.notEqual(packEdition.packDigest,pack.packDigest);
const authorized=standard.standardKnowledgePackProjection({...licensed,id:'authorized-demo',contentPolicy:'authorized-user-pack',nodes:[{id:'a1',ref:'A',contentMode:'authorized-import',text:'Authorized customer content'}]},{});assert.equal(authorized.rightsMode,'authorized-user');assert.equal(authorized.sections[0].normativeTextIncluded,true);assert.equal(authorized.sections[0].bodyMode,'authorized-content');
const cycle=standard.standardKnowledgePackProjection({...licensed,id:'cycle-demo',nodes:[{id:'a',ref:'A',parentSectionId:'b'},{id:'b',ref:'B',parentSectionId:'a'}]},{});for(const section of cycle.sections){assert.equal(section.parentSectionId,cycle.documentRoot.sectionId);assert.equal(section.depth,1);assert.equal(section.repairedParent,true);}
const deepNodes=[];for(let i=1;i<=14;i++)deepNodes.push({id:`d${i}`,ref:`D${i}`,...(i>1?{parentSectionId:`d${i-1}`}:{})});const deep=standard.standardKnowledgePackProjection({...licensed,id:'deep-demo',nodes:deepNodes},{});assert.ok(Math.max(...deep.sections.map(x=>x.depth))<=12);assert.ok(deep.sections.some(x=>x.repairedParent));
assert.match(browserSource,/data-standard-document-model="word-like"/);assert.match(browserSource,/current\?\.knowledgePack\?\.sections/);assert.match(browserSource,/standard-wordlike-page/);

assert.match(epSource,/enduserGrammar='progressive-knowledge-explorer'/);assert.match(epSource,/epistemicAuthority='read-explore-only'/);assert.match(epSource,/epistemicWriteAuthority='none'/);assert.match(epSource,/epistemicFirstPlane='knowledge-explorer'/);assert.ok(!epSource.includes("document.createElement('section')"),'EP seed must type the existing first plane, not add a tutorial plane');
assert.match(adminSource,/enduserGrammar='configuration-console'/);assert.match(adminSource,/adminAuthority='configuration-only'/);assert.match(adminSource,/adminEpistemicAuthority='none'/);assert.match(adminSource,/adminWriteAuthority='server-routes-only'/);assert.match(adminSource,/adminFirstPlane='configuration-console'/);assert.ok(!adminSource.includes("document.createElement('section')"),'Admin seed must type the existing first plane, not add a tutorial plane');

assert.match(copySource,/export const HOMEBOARDING=/);assert.match(copySource,/bad-fragmented-compliance/);assert.match(copySource,/worst-untraceable-decisions/);assert.match(homeSource,/demo\?\.learningBasis/);assert.match(homeSource,/item\?\.knowledgePack/);assert.ok(!homeSource.includes('learningScenarios'),'Home must consume factual DEMO basis, not DEMO-authored teaching copy');assert.match(homeSource,/detail\.open=false/);assert.ok(!/api\(|fetch\(|method:\s*['"]POST/.test(homeSource),'HomeBoarding must introduce no writer/network authority');
assert.equal((copySource.match(/bad-fragmented-compliance/g)||[]).length,1);assert.equal((demoSource.match(/bad-fragmented-compliance/g)||[]).length,0,'BAD/WORST copy must have exactly one authority');

const globalGates=['v3/seed-runtime-supply-chain-check.mjs','v3/seed-runtime-supply-chain-saturation-10m.mjs'];
if(gateSource){for(const gate of globalGates)assert.ok(gateSource.includes(gate),`current semantic rail missing ${gate}`);}

const localDoD={
  demo:{mechanicalL0L5:true,recordDigest:true,aggregateDigest:true,factualLearningBasis:true,copyAuthorityLeak:false},
  standards:{provenanceDigest:true,rightsBoundary:true,hierarchicalModel:true,cycleFailClosed:true,depthBounded:true,wordLikeProjection:true},
  epistemic:{typedExistingFirstPlane:true,readExploreOnly:true,writeAuthority:'none',newTutorialPlane:false},
  admin:{typedExistingFirstPlane:true,configurationOnly:true,epistemicAuthority:'none',writeAuthority:'server-routes-only',newTutorialPlane:false},
  home:{progressive:true,singleCopyOwner:true,consumesDemoBasis:true,consumesKnowledgePackSummary:true,newWriter:false}
};
const intermediateDoD={supplyChain:'UI typing -> {DEMO truth, Standard pack, EP/Admin} -> HomeBoarding',acceptedPrerequisite:'UI-OBJECT-TYPE-COMPRESSION-1',prSeeds:PR_SEEDS,parallelRuntimeAuthority:0,parallelWriter:0,educationalCopyOwners:1,externalEvidenceSynthesized:false};
const report={ok:true,control:'SEED-RUNTIME-SUPPLY-CHAIN-1',allSeeds:ALL_SEEDS,prSeeds:PR_SEEDS,localDoD,intermediateDoD,globalDoD:{runtimeReadback:true,global10mGate:gateSource?globalGates.every(g=>gateSource.includes(g)):null,exactHead:'requires candidate CI after remote materialization',postMergeMain:'requires merge'},runtimeEvidence:{demoProcedures:Object.keys(samples).length,demoMetadataDigest:demoDigest,standardPackDigest:pack.packDigest,standardHierarchyDigest:pack.hierarchyDigest},claimBoundary:'Repository-bounded semantic/runtime evidence. This check does not establish representative-human usability, external evidence truth, deployment assurance, legal compliance or post-merge acceptance.'};
mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});writeFileSync(new URL('../artifacts/seed-runtime-supply-chain-check.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
