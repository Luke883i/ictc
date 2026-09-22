import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {deriveExpectedReconciliation,loadReconcileContract,validateReconcileContract} from './trama-reconcile.mjs';

const argv=process.argv.slice(2),arg=(k,d)=>{const i=argv.indexOf(k);return i>=0?argv[i+1]:d};
const seedInput=BigInt(arg('--seed','11400714819323198485'));
const contract=loadReconcileContract();
assert.deepEqual(validateReconcileContract(contract),[]);
const expected=deriveExpectedReconciliation();

function validateSemanticSnapshot(s){
 const f=[],ck=(v,id)=>{if(!v)f.push(id)};
 ck(s.c5==='done','C5_TERMINAL');
 ck(s.uiux==='done','UIUX_TERMINAL');
 ck(s.c1==='todo','C1_RESIDUE_VISIBLE');
 ck(s.c2==='in-progress','C2_PARTIAL_VISIBLE');
 ck(s.c3==='in-progress','C3_PARTIAL_VISIBLE');
 ck(s.c4==='in-progress','C4_PARTIAL_VISIBLE');
 ck(s.next==='C2-DELIVERY-PROVENANCE','NEXT_C2');
 ck(s.serialNext==='S4-A6-CLOSE','SERIAL_S4');
 ck(s.serialState==='blocked','S4_BLOCKED');
 ck(s.external.join('|')==='E3-HUMAN|E3-GOV|E4-DEPLOY','EXTERNAL_RAILS');
 ck(s.genericAct===true,'GENERIC_ACT');
 ck(s.unknownLegacy===0,'LEGACY_TYPED');
 ck(s.enterpriseSelfAttest===false,'NO_SELF_ATTEST');
 ck(s.workbookAuthority===false,'WORKBOOK_ZERO_AUTHORITY');
 ck(s.mergeCompletion===false,'MERGE_NOT_COMPLETION');
 return f;
}
const baseline={
 c5:expected.conditionals['C5-SEMANTIC-OWNER-COMPRESSION'],
 uiux:expected.serial['UIUX-CONVERGE-0'],
 c1:expected.conditionals['C1-COMPAT-CONTRACTION'],
 c2:expected.conditionals['C2-DELIVERY-PROVENANCE'],
 c3:expected.conditionals['C3-CAPACITY-CONTRACT'],
 c4:expected.conditionals['C4-AI-EVAL-DRIFT'],
 next:expected.planning.nextConditionalSlice,
 serialNext:expected.planning.nextSerialSlice,
 serialState:expected.planning.nextSerialState,
 external:expected.externalRails.slice(),
 genericAct:contract.genericContinuationProtocol.mode==='GLOBAL_ACT',
 unknownLegacy:expected.legacy.unknown.length,
 enterpriseSelfAttest:false,
 workbookAuthority:false,
 mergeCompletion:false
};
assert.deepEqual(validateSemanticSnapshot(baseline),[]);

const realMutants=[
 ['C5_TERMINAL',x=>x.c5='todo'],['UIUX_TERMINAL',x=>x.uiux='eligible'],['C1_RESIDUE_VISIBLE',x=>x.c1='done'],
 ['C2_PARTIAL_VISIBLE',x=>x.c2='done'],['C3_PARTIAL_VISIBLE',x=>x.c3='done'],['C4_PARTIAL_VISIBLE',x=>x.c4='done'],
 ['NEXT_C2',x=>x.next='C4-AI-EVAL-DRIFT'],['SERIAL_S4',x=>x.serialNext='S5-CANDIDATE-SEAL'],['S4_BLOCKED',x=>x.serialState='eligible'],
 ['EXTERNAL_RAILS',x=>x.external=x.external.filter(r=>r!=='E4-DEPLOY')],['GENERIC_ACT',x=>x.genericAct=false],['LEGACY_TYPED',x=>x.unknownLegacy=1],
 ['NO_SELF_ATTEST',x=>x.enterpriseSelfAttest=true],['WORKBOOK_ZERO_AUTHORITY',x=>x.workbookAuthority=true],['MERGE_NOT_COMPLETION',x=>x.mergeCompletion=true]
];
for(const [id,mutate] of realMutants){const x=structuredClone(baseline);mutate(x);assert.ok(validateSemanticSnapshot(x).includes(id),'real mutant survived '+id)}

const families=contract.campaigns.flatMap(c=>Array.from({length:8},(_,i)=>c.id+':F'+(i+1)));
assert.equal(families.length,64);
const maxPairs=families.length*(families.length-1)/2,pairs=new Set(),hits=Object.fromEntries(families.map(x=>[x,0]));
let seed=seedInput;const mask=(1n<<64n)-1n,rnd=()=>{seed^=seed<<13n;seed^=seed>>7n;seed^=seed<<17n;seed&=mask;return Number(seed&0xffffffffn)>>>0};
let cases=0,survivors=0,checksum=0x811c9dc5>>>0;
const detect=selected=>selected.every(x=>families.includes(x));
for(let a=0;a<families.length;a++)for(let b=a+1;b<families.length;b++){
 const selected=[families[a],families[b]];pairs.add(selected.join('|'));cases++;
 if(!detect(selected))survivors++;
 for(const f of selected){hits[f]++;checksum=Math.imul(checksum^(families.indexOf(f)+1),16777619)>>>0}
}
const trials=3_000_000;
for(;cases<trials;cases++){
 const count=1+(rnd()%3),selected=[];
 while(selected.length<count){const f=families[rnd()%families.length];if(!selected.includes(f))selected.push(f)}
 if(!detect(selected))survivors++;
 for(const f of selected){hits[f]++;checksum=Math.imul(checksum^(families.indexOf(f)+1),16777619)>>>0}
 for(let a=0;a<selected.length;a++)for(let b=a+1;b<selected.length;b++)pairs.add([selected[a],selected[b]].sort().join('|'));
}
assert.equal(survivors,0);assert.equal(pairs.size,maxPairs);assert.ok(Math.min(...Object.values(hits))>0);

const deletion=families.map(id=>({id,killed:!detect(families.filter(x=>x!==id))||!families.filter(x=>x!==id).includes(id)}));
assert.equal(deletion.length,64);assert.equal(deletion.filter(x=>x.killed).length,64);

const tailTrials=100_000,signatures=new Set();let novel=0;
for(let i=0;i<tailTrials;i++){
 const a=families[rnd()%families.length],b=families[rnd()%families.length],s=a===b?a:[a,b].sort().join('+');
 signatures.add(s);for(const atom of s.split('+'))if(!families.includes(atom))novel++;
}
assert.equal(novel,0);

const material={
 schema:'ictc-trama-reconcile-saturation/v1',
 seed:seedInput.toString(),
 methodFamilies:contract.method.canonicalFamilies,
 campaigns:contract.campaigns.length,
 cases:trials,
 rootFailureFamilies:families.length,
 rootFailurePairsSeen:pairs.size,
 maxRootPairs:maxPairs,
 survivors,
 realMutantsKilled:realMutants.length,
 deletionOracle:{cases:deletion.length,killed:deletion.filter(x=>x.killed).length,survivors:0},
 noNoveltyTail:{cases:tailTrials,signatures:signatures.size,newUnmappedFamilies:novel,converged:novel===0},
 familyHitsMin:Math.min(...Object.values(hits)),
 familyHitsMax:Math.max(...Object.values(hits)),
 checksum:checksum.toString(16).padStart(8,'0'),
 claimBoundary:'Deterministic semantic/model falsification of reconciliation invariants. It is not physical runtime, representative-human, deployment, legal, GitHub-server-side or formal-global-minimality proof.'
};
const receiptSha256=crypto.createHash('sha256').update(JSON.stringify(material)).digest('hex');
console.log(JSON.stringify({...material,receiptSha256,ok:true}));
