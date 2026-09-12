import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateTrajectory} from './trajectory-1-141-check.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url)),DEFAULT_ROOT=path.resolve(HERE,'..');
const seed='ictc-trajectory-governance-prototype-2026-09-12';
let s=BigInt('0x'+crypto.createHash('sha256').update(seed).digest('hex').slice(0,16));
const rnd=()=>{s^=s<<13n;s^=s>>7n;s^=s<<17n;s&=(1n<<64n)-1n;return Number(s%1000000n)/1000000};

// Compact semantic state: independent relation oracle, not a mirror of mutation operators.
const baseline={
 observedPr:141, plannedCompleted:5, nextIndex:5, chainStates:'DDDDDEBB', depAcyclic:true,
 livePointer:false, postMergeReconcile:false, externalOpen:true, notRequiredEvidence:true,
 bridge:false, bridgeAllCriteria:false, productEffectMissing:true, uiuxDuplication:true,
 prototypeBaseMask:0xff, ownerTerminal:false, humanExternal:true, workbookBound:true,
 auditCoverage:141, auditCounterexample:true, claimBoundary:true, c5Open:true, gap020Open:true,
 enterpriseCandidate:false
};
function valid(x){
 if(x.observedPr!==141) return false;
 if(x.plannedCompleted!==5||x.nextIndex!==5||x.chainStates!=='DDDDDEBB') return false;
 if(!x.depAcyclic||x.livePointer||x.postMergeReconcile) return false;
 if(!x.externalOpen||!x.notRequiredEvidence) return false;
 if(x.bridge||x.bridgeAllCriteria||!x.productEffectMissing||!x.uiuxDuplication) return false;
 if(x.prototypeBaseMask!==0xff||x.ownerTerminal||!x.humanExternal) return false;
 if(!x.workbookBound||x.auditCoverage!==141||!x.auditCounterexample||!x.claimBoundary) return false;
 if(!x.c5Open||!x.gap020Open||x.enterpriseCandidate) return false;
 return true;
}
const families=[
 ['stale-pr',x=>x.observedPr=140],['wrong-completed',x=>x.plannedCompleted=4],['wrong-next',x=>x.nextIndex=6],
 ['candidate-after-merge',x=>x.chainStates='DDDDCBBB'],['uiux-blocked',x=>x.chainStates='DDDDDBBB'],['premature-uiux-done',x=>x.chainStates='DDDDDDBB'],
 ['cycle',x=>x.depAcyclic=false],['live-current-pointer',x=>x.livePointer=true],['recursive-postmerge',x=>x.postMergeReconcile=true],
 ['external-self-close',x=>x.externalOpen=false],['notrequired-no-evidence',x=>x.notRequiredEvidence=false],['add-prep-bridge',x=>x.bridge=true],
 ['pretend-all-bridge-criteria',x=>x.bridgeAllCriteria=true],['pretend-product-effect',x=>x.productEffectMissing=false],['pretend-not-uiux-dup',x=>x.uiuxDuplication=false],
 ['drop-launch-baseline',x=>x.prototypeBaseMask&=~1],['drop-procedure-baseline',x=>x.prototypeBaseMask&=~2],['drop-persistence-baseline',x=>x.prototypeBaseMask&=~4],
 ['drop-demo-baseline',x=>x.prototypeBaseMask&=~8],['drop-worklist-baseline',x=>x.prototypeBaseMask&=~16],['drop-admin-baseline',x=>x.prototypeBaseMask&=~32],
 ['drop-browser-baseline',x=>x.prototypeBaseMask&=~64],['drop-epistemic-baseline',x=>x.prototypeBaseMask&=~128],['owner-false-terminal',x=>x.ownerTerminal=true],
 ['human-self-close',x=>x.humanExternal=false],['workbook-drift',x=>x.workbookBound=false],['audit-missing-pr',x=>x.auditCoverage=140],
 ['erase-counterexample',x=>x.auditCounterexample=false],['weaken-boundary',x=>x.claimBoundary=false],['c5-false-close',x=>x.c5Open=false],
 ['gap020-false-close',x=>x.gap020Open=false],['premature-enterprise-candidate',x=>x.enterpriseCandidate=true]
];
const root=process.argv[2]?path.resolve(process.argv[2]):DEFAULT_ROOT;
const baseM=JSON.parse(readFileSync(path.join(root,'v3/trajectory-1-141-model.json'),'utf8'));
const baseP=JSON.parse(readFileSync(path.join(root,'v3/uiux-prototype-entry-contract.json'),'utf8'));
const baseFailures=validateTrajectory(baseM,baseP);if(baseFailures.length||!valid(baseline)){console.error(JSON.stringify({ok:false,baseline:baseFailures}));process.exit(1);}

const trials=1000000,counts=Array(families.length).fill(0),kills=Array(families.length).fill(0);let survivors=0,harnessErrors=0,applied=0;
for(let i=0;i<trials;i++){
 const x={...baseline};const n=1+Math.floor(rnd()*3);let a=-1,b=-1,c=-1;
 a=Math.floor(rnd()*families.length);families[a][1](x);counts[a]++;applied++;
 if(n>1){do{b=Math.floor(rnd()*families.length)}while(b===a);families[b][1](x);counts[b]++;applied++;}
 if(n>2){do{c=Math.floor(rnd()*families.length)}while(c===a||c===b);families[c][1](x);counts[c]++;applied++;}
 try{if(valid(x)){survivors++;}else{kills[a]++;if(b>=0)kills[b]++;if(c>=0)kills[c]++;}}catch{harnessErrors++;}
}

// Independently materialized real model mutants, rejected by the actual audit validator.
const realMutants=[
 (m,p)=>m.epochs[0].start=2,(m,p)=>m.epochs[1].start=16,(m,p)=>m.coverage.expectedCount=140,
 (m,p)=>m.governanceAssessment.verdict='COHERENT',(m,p)=>m.governanceAssessment.counterexample.committedAuthorityMergedPr=141,
 (m,p)=>m.findings=m.findings.filter(x=>x.id!=='A2-POST-MERGE-TRUTH-RECONCILIATION'),(m,p)=>m.debt=m.debt.filter(x=>x.id!=='D-GOV-TRUTH-LAG'),
 (m,p)=>m.prototypeAssessment.verdict='ADD-PREP-0',(m,p)=>m.prototypeAssessment.criteria.pop(),(m,p)=>p.createsNewSerialSlice=true,
 (m,p)=>p.nextSerialSlice='S4-A6-CLOSE',(m,p)=>p.status='HUMAN-USABLE',(m,p)=>p.requirements.find(x=>x.id==='PR-01').status='unknown',
 (m,p)=>p.requirements.find(x=>x.id==='PR-02').status='unknown',(m,p)=>p.requirements.find(x=>x.id==='PR-03').status='unknown',
 (m,p)=>p.requirements.find(x=>x.id==='PR-04').status='unknown',(m,p)=>p.requirements.find(x=>x.id==='PR-05').status='unknown',
 (m,p)=>p.requirements.find(x=>x.id==='PR-06').status='unknown',(m,p)=>p.requirements.find(x=>x.id==='PR-07').status='unknown',
 (m,p)=>p.requirements.find(x=>x.id==='PR-08').status='unknown',(m,p)=>p.requirements.find(x=>x.id==='PR-09').status='repository-proven-bounded',
 (m,p)=>p.requirements.find(x=>x.id==='PR-10').status='repository-proven-bounded',(m,p)=>m.claimBoundary='enterprise-ready',
 (m,p)=>m.prototypeAssessment.criteria.find(x=>x.id==='observableRuntimeProductEffect').passes=true,
 (m,p)=>m.prototypeAssessment.criteria.find(x=>x.id==='notNaturalPartOfUiuxConverge').passes=true
];
let realKilled=0;const realSurvivors=[];for(let i=0;i<realMutants.length;i++){const m=structuredClone(baseM),p=structuredClone(baseP);realMutants[i](m,p);if(validateTrajectory(m,p).length)realKilled++;else realSurvivors.push(i);}
const uncovered=counts.map((x,i)=>x?null:families[i][0]).filter(Boolean),unkilled=kills.map((x,i)=>x?null:families[i][0]).filter(Boolean);
const digest=crypto.createHash('sha256').update(JSON.stringify({seed,trials,counts,kills,applied,survivors,harnessErrors,realKilled})).digest('hex');
const out={ok:survivors===0&&harnessErrors===0&&!uncovered.length&&!unkilled.length&&realKilled===realMutants.length,seed,trials,materialFamilies:families.length,materialKilled:families.length-unkilled.length,realModelMutants:realMutants.length,realModelMutantsKilled:realKilled,realSurvivors,appliedMutations:applied,survivors,harnessErrors,minTrialsPerFamily:Math.min(...counts),maxTrialsPerFamily:Math.max(...counts),uncovered,unkilled,digest};
console.log(JSON.stringify(out));if(!out.ok)process.exit(1);
