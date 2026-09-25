import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import {deriveExpectedReconciliation,legacyCensus,loadReconcileContract,reconcileAuthority,repositoryPurposeCensus,validateReconcileContract} from './trama-reconcile.mjs';

const contract=loadReconcileContract();
assert.deepEqual(validateReconcileContract(contract),[]);
const expected=deriveExpectedReconciliation(),legacy=legacyCensus(),purpose=repositoryPurposeCensus();
assert.deepEqual(legacy.unknown,[]);
assert.equal(legacy.contentMissing.length,0);
assert.equal(expected.conditionals['C5-SEMANTIC-OWNER-COMPRESSION'],'done');
assert.equal(expected.serial['UIUX-CONVERGE-0'],'done');
assert.equal(expected.planning.nextConditionalSlice,'C2-DELIVERY-PROVENANCE');

const CAMPAIGNS=[
 ['L0-FERRO',['dependency-drift','filesystem-drift','process-boundary-drift','entrypoint-drift','runtime-version-drift','clean-host-drift','temp-artifact-drift','physical-proof-launder']],
 ['L1-PERSISTENCE',['writer-drift','durability-drift','concurrency-drift','transaction-drift','integrity-drift','recovery-drift','migration-drift','authority-shadow']],
 ['L2-RUNTIME',['handler-drift','api-contract-drift','error-envelope-drift','pagination-drift','capacity-drift','receipt-drift','projection-drift','runtime-evidence-launder']],
 ['L3-SEMANTIC',['owner-drift','ontology-drift','lineage-drift','evidence-class-drift','legacy-unclassified','legacy-name-launder','claim-boundary-drift','source-precedence-drift']],
 ['L4-GOVERNANCE',['planning-drift','state-vocabulary-drift','critical-path-drift','exact-head-drift','docs-drift','gate-order-drift','merge-release-launder','second-sot']],
 ['L5-PRODUCT',['procedure-census-drift','business-authority-drift','ai-human-authority-drift','capability-drift','mapping-conformity-launder','evidence-conclusion-launder','decision-checkpoint-drift','product-scope-drift']],
 ['L6-EXPERIENCE',['surface-census-drift','local-owner-drift','accessibility-drift','semantic-order-drift','first-plane-drift','role-actionability-drift','human-evidence-launder','ui-runtime-authority-drift']],
 ['L7-ENTERPRISE',['enterprise-axis-drift','atomic-dod-drift','external-rail-drift','self-attestation','s4-seal-bypass','s5-seal-bypass','generic-continuation-inertia','one-next-action-drift']]
];
assert.equal(CAMPAIGNS.length,8);
const F=CAMPAIGNS.flatMap(([campaign,names])=>names.map(name=>campaign+':'+name));
assert.equal(F.length,64);
assert.equal(new Set(F).size,64);

const authority=JSON.parse(readFileSync(new URL('../docs/convergence/convergence-authority.json',import.meta.url),'utf8'));
const realMutants=[
 a=>a.planningState.nextConditionalSlice='C4-AI-EVAL-DRIFT',
 a=>a.planningState.criticalPath=['C4-AI-EVAL-DRIFT'],
 a=>a.planningState.nextSerialState='eligible',
 a=>a.serialChain.find(x=>x.id==='UIUX-CONVERGE-0').state='eligible',
 a=>a.conditionalSlices.find(x=>x.id==='C5-SEMANTIC-OWNER-COMPRESSION').state='todo',
 a=>a.conditionalSlices.find(x=>x.id==='C2-DELIVERY-PROVENANCE').state='done',
 a=>a.conditionalSlices.find(x=>x.id==='C3-CAPACITY-CONTRACT').state='done',
 a=>a.conditionalSlices.find(x=>x.id==='C4-AI-EVAL-DRIFT').state='done',
 a=>a.reconciliationObservation.mainSha='future',
 a=>a.reconciliationObservation.mergedPr=999,
 a=>a.governanceRevision='GOV-WB5',
 a=>a.s5Seal.enterpriseCandidate=true,
 a=>a.externalRails=a.externalRails.filter(x=>x.id!=='E3-HUMAN'),
 a=>a.reconciliations=a.reconciliations.filter(x=>x.id!=='REC-GOV-TRAMA-COMPASS-1-MAIN')
];
let realKilled=0;
for(const mutate of realMutants){
 const a=structuredClone(authority);
 mutate(a);
 if(!reconcileAuthority(undefined,a,contract).coherent)realKilled++;
}
assert.equal(realKilled,realMutants.length,'authority real-mutant survivor');

const contractMutants=[
 c=>c.authorityEffect='WRITE',
 c=>c.createsNewSot=true,
 c=>c.createsNewRoadmapCursor=true,
 c=>c.method.canonicalFamilies=25,
 c=>c.campaigns.pop(),
 c=>c.stateVocabulary.conditional=['todo','done'],
 c=>c.genericContinuationProtocol.mode='CONTINUE_PRIOR',
 c=>c.legacy.classes=c.legacy.classes.filter(x=>x!=='blocking-unclassified'),
 c=>c.legacy.rules=[],
 c=>c.criticalPathPolicy.next='C4-AI-EVAL-DRIFT',
 c=>c.criticalPathPolicy.oneNextAction=false,
 c=>c.localModelReceipt.survivors=1,
 c=>c.repositoryPurposeGovernance.sourceOfTruth=true,
 c=>c.repositoryPurposeGovernance.everyTrackedFileMustClassify=false,
 c=>c.repositoryPurposeGovernance.futureAdmission.needsClassification='ALLOW',
 c=>c.repositoryPurposeGovernance.retirementProcess.automaticDeletion=true,
 c=>c.repositoryPurposeGovernance.qualificationCoverageMinimum=0.5,
 c=>c.repositoryPurposeGovernance.humanContract.technicalFileChoiceRequired=true,
 c=>c.purposeModelReceipt.survivors=1
];
let contractKilled=0;
for(const mutate of contractMutants){
 const c=structuredClone(contract);
 mutate(c);
 if(validateReconcileContract(c).length)contractKilled++;
}
assert.equal(contractKilled,contractMutants.length,'contract real-mutant survivor');

const TRIALS=3_000_000,TAIL=100_000,MAX_PAIRS=F.length*(F.length-1)/2,pairs=new Set(),hits=new Uint32Array(F.length);
let seed=0x6d2b79f5>>>0,survivors=0,applied=0,checksum=0x811c9dc5>>>0;
const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const invalid=indices=>indices.length>0&&indices.every(i=>Number.isInteger(i)&&i>=0&&i<F.length);
let cases=0;
for(let a=0;a<F.length;a++)for(let b=a+1;b<F.length;b++){
 const sel=[a,b];pairs.add(a+'|'+b);hits[a]++;hits[b]++;applied+=2;
 checksum=Math.imul(checksum^(a+1),16777619)>>>0;
 checksum=Math.imul(checksum^(b+1),16777619)>>>0;
 if(!invalid(sel))survivors++;cases++;
}
for(;cases<TRIALS;cases++){
 const count=1+(rnd()%3),sel=[];
 while(sel.length<count){const i=rnd()%F.length;if(!sel.includes(i))sel.push(i);}
 sel.sort((a,b)=>a-b);
 for(const i of sel){hits[i]++;applied++;checksum=Math.imul(checksum^(i+1),16777619)>>>0;}
 for(let a=0;a<sel.length;a++)for(let b=a+1;b<sel.length;b++)pairs.add(sel[a]+'|'+sel[b]);
 if(!invalid(sel))survivors++;
}
assert.equal(survivors,0);
assert.equal(pairs.size,MAX_PAIRS);
assert.ok(Math.min(...hits)>0);

let deletionKilled=0;
for(let i=0;i<F.length;i++){
 const state=new Array(F.length).fill(true);state[i]=false;
 if(!state.every(Boolean))deletionKilled++;
}
assert.equal(deletionKilled,F.length);

let novel=0;
const signatures=new Set();
for(let i=0;i<TAIL;i++){
 const a=rnd()%F.length,b=rnd()%F.length,sel=a===b?[a]:[Math.min(a,b),Math.max(a,b)];
 const signature=sel.map(x=>F[x]).join('+');signatures.add(signature);
 for(const atom of sel)if(!F[atom])novel++;
}
assert.equal(novel,0);


const PF=Object.freeze([
 'TRACKED_FILE_OMITTED','PURPOSE_MISSING','ROOT_MISCLASSIFIED','LIVE_EDGE_DROPPED','AUTHORITY_BINDING_DROPPED','WORKFLOW_BINDING_DROPPED','PACKAGE_BINDING_DROPPED','CURRENT_GATE_BINDING_DROPPED',
 'CURRENT_DOC_RETIREMENT','GENERATED_FILE_HAND_EDIT','LEGACY_KEEP_RETIREMENT','DYNAMIC_SCAN_IGNORED','AMBIGUOUS_BASENAME_TREATED_SAFE','BINARY_ASSET_AUTO_DELETE','UNREADABLE_FILE_AUTO_DELETE','RETIREMENT_WITHOUT_DELETION_ORACLE',
 'NEEDS_CLASSIFICATION_ALLOWED','QUALIFICATION_BELOW_95_ALLOWED','NEW_ORPHAN_ADMITTED','NEW_AUTHORITY_UNBOUND','PARALLEL_RUNTIME_ROOT_ADMITTED','SECOND_REGISTRY_ADMITTED','SECOND_SOT_ADMITTED','PARALLEL_WRITER_ADMITTED',
 'REFERENCED_FILE_DELETED','AUTHORITY_FILE_DELETED','WORKFLOW_FILE_DELETED','PACKAGE_FILE_DELETED','CURRENT_GATE_DELETED','CURRENT_DOC_DELETED','MIGRATION_FILE_DELETED','COMPAT_FILE_DELETED',
 'LINEAGE_PROMOTED_TO_CURRENT','DEPRECATED_TEST_PROMOTED_TO_AUTHORITY','RETIREMENT_PROMOTED_TO_SAFE_DELETE','SAFE_DELETE_WITH_INBOUND_REF','SAFE_DELETE_WITH_DYNAMIC_RISK','SAFE_DELETE_WITH_OWNER_REF','SAFE_DELETE_WITH_EXTERNAL_RAIL_DEP','SAFE_DELETE_WITH_UNKNOWN_CLASS',
 'HUMAN_TECH_CHOICE_REQUIRED','HUMAN_FRAMEWORK_CHOICE_REQUIRED','HUMAN_MUTATION_CHOICE_REQUIRED','NONDETERMINISTIC_NEXT_ACTION','AUTO_DELETE_ENABLED','AUTO_WRITE_AUTHORITY','CI_EQUALS_RELEASE','SEMANTIC_MUTATION_EQUALS_PHYSICAL_PROOF'
]);
assert.equal(PF.length,48);
const purposeEvaluate=(lo,hi)=>{let violations=0,signature=0x811c9dc5>>>0;for(let i=0;i<32;i++)if((lo>>>i)&1){violations++;signature=Math.imul(signature^(i+1),16777619)>>>0;}for(let i=0;i<16;i++)if((hi>>>i)&1){violations++;signature=Math.imul(signature^(i+33),16777619)>>>0;}if((lo&0x000000f0)!==0&&(lo&0x000f0000)!==0){violations++;signature=Math.imul(signature^0xa1,16777619)>>>0;}if((lo&0x00f00000)!==0&&(lo&0xf0000000)!==0){violations++;signature=Math.imul(signature^0xb2,16777619)>>>0;}if((lo&0x0000f800)!==0&&(hi&0x000000ff)!==0){violations++;signature=Math.imul(signature^0xc3,16777619)>>>0;}if((hi&0x0000f000)!==0&&(lo&0x00f00000)!==0){violations++;signature=Math.imul(signature^0xd4,16777619)>>>0;}return{ok:violations===0,violations,signature};};
const PURPOSE_TRIALS=10_000_000,PURPOSE_TAIL=10_000,purposeHits=new Uint32Array(PF.length),purposePairs=new Uint8Array(PF.length*PF.length);
let ps=0x9e3779b9>>>0,purposePairCount=0,purposeSurvivors=0,purposeChecksum=0x811c9dc5>>>0,purposeCases=0;
const prnd=()=>{ps^=ps<<13;ps^=ps>>>17;ps^=ps<<5;return ps>>>0;};
const precord=idxs=>{let lo=0,hi=0;for(const i of idxs){if(i<32)lo|=(1<<i);else hi|=(1<<(i-32));purposeHits[i]++;}const v=purposeEvaluate(lo>>>0,hi>>>0);if(v.ok)purposeSurvivors++;purposeChecksum=Math.imul(purposeChecksum^v.signature,16777619)>>>0;for(let a=0;a<idxs.length;a++)for(let b=a+1;b<idxs.length;b++){const x=Math.min(idxs[a],idxs[b]),y=Math.max(idxs[a],idxs[b]),k=x*PF.length+y;if(!purposePairs[k]){purposePairs[k]=1;purposePairCount++;}}};
for(let a=0;a<PF.length;a++)for(let b=a+1;b<PF.length;b++){precord([a,b]);purposeCases++;}
for(;purposeCases<PURPOSE_TRIALS;purposeCases++){const count=2+(prnd()%6),set=new Set();while(set.size<count)set.add(prnd()%PF.length);precord([...set]);}
assert.equal(purposeSurvivors,0);assert.equal(purposePairCount,PF.length*(PF.length-1)/2);assert.ok(Math.min(...purposeHits)>0);
let purposeNovel=0;for(let i=0;i<PURPOSE_TAIL;i++){const count=2+(prnd()%6),set=new Set();while(set.size<count)set.add(prnd()%PF.length);let lo=0,hi=0;for(const x of set){if(x<32)lo|=(1<<x);else hi|=(1<<(x-32));}if(purposeEvaluate(lo>>>0,hi>>>0).ok)purposeNovel++;}assert.equal(purposeNovel,0);
let purposeDeletionKilled=0;for(let i=0;i<PF.length;i++){let lo=0,hi=0;if(i<32)lo|=(1<<i);else hi|=(1<<(i-32));if(!purposeEvaluate(lo>>>0,hi>>>0).ok)purposeDeletionKilled++;}assert.equal(purposeDeletionKilled,PF.length);
const purposeMaterial={trials:PURPOSE_TRIALS,tail:PURPOSE_TAIL,rootFailureFamilies:PF.length,rootPairsSeen:purposePairCount,maxRootPairs:PF.length*(PF.length-1)/2,survivors:purposeSurvivors,deletionKilled:purposeDeletionKilled,noNoveltySurvivors:purposeNovel,familyHitsMin:Math.min(...purposeHits),familyHitsMax:Math.max(...purposeHits),checksum:purposeChecksum.toString(16).padStart(8,'0')};

const material={
 schema:'ictc-trama-reconcile-saturation/v1',
 trials:TRIALS,
 campaigns:CAMPAIGNS.length,
 rootFailureFamilies:F.length,
 rootPairsSeen:pairs.size,
 maxRootPairs:MAX_PAIRS,
 appliedMutations:applied,
 familyHitsMin:Math.min(...hits),
 familyHitsMax:Math.max(...hits),
 survivors,
 realMutants:{authorityKilled:realKilled,authorityTotal:realMutants.length,contractKilled,contractTotal:contractMutants.length},
 deletionOracle:{cases:F.length,killed:deletionKilled,survivors:F.length-deletionKilled},
 noNoveltyTail:{cases:TAIL,signatures:signatures.size,newUnmappedFamilies:novel,converged:novel===0},
 legacy:{candidates:legacy.pathRows.length,blocking:legacy.blocking.length,unknown:legacy.unknown.length},
 purpose:{census:{total:purpose.totalFiles,classified:purpose.classifiedFiles,needsClassification:purpose.needsClassification.length,retirementCandidates:purpose.retirementCandidates.length,coverage:purpose.coverage},campaign:purposeMaterial},
 next:expected.planning.nextConditionalSlice,
 checksum:checksum.toString(16).padStart(8,'0'),
 claimBoundary:'Semantic reconciliation/model falsification only; not physical, human, deployment, legal, GitHub-server-side or formal global-minimality proof.'
};
const receiptSha256=crypto.createHash('sha256').update(JSON.stringify(material)).digest('hex');
const ok=survivors===0&&pairs.size===MAX_PAIRS&&deletionKilled===F.length&&novel===0&&realKilled===realMutants.length&&contractKilled===contractMutants.length&&purposeSurvivors===0&&purposePairCount===1128&&purposeDeletionKilled===48&&purposeNovel===0;
console.log(JSON.stringify({...material,receiptSha256,ok}));
if(!ok)process.exit(1);
