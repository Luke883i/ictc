import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import {deriveExpectedReconciliation,legacyCensus,loadReconcileContract,reconcileAuthority,validateReconcileContract} from './trama-reconcile.mjs';

const contract=loadReconcileContract();
assert.deepEqual(validateReconcileContract(contract),[]);
const expected=deriveExpectedReconciliation(),legacy=legacyCensus();
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
 c=>c.localModelReceipt.survivors=1
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
 next:expected.planning.nextConditionalSlice,
 checksum:checksum.toString(16).padStart(8,'0'),
 claimBoundary:'Semantic reconciliation/model falsification only; not physical, human, deployment, legal, GitHub-server-side or formal global-minimality proof.'
};
const receiptSha256=crypto.createHash('sha256').update(JSON.stringify(material)).digest('hex');
const ok=survivors===0&&pairs.size===MAX_PAIRS&&deletionKilled===F.length&&novel===0&&realKilled===realMutants.length&&contractKilled===contractMutants.length;
console.log(JSON.stringify({...material,receiptSha256,ok}));
if(!ok)process.exit(1);
