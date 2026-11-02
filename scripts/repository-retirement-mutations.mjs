/** Seeded adversarial model for file-retirement proof obligations; not source-code mutations. */
import {writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {root} from './repository-inventory.mjs';

const OBLIGATIONS=Object.freeze(['manifestLifecycle','ownerApproval','staticImports','dynamicImports','publicUrls','configsAndCi','fixturesAndTests','runtimeReachability','prHistoryUniqueness','externalConsumerReview','semanticPreservation','isolatedRemovalRollback']);
export const deletionDecision=(facts)=>OBLIGATIONS.every(k=>facts[k]===true)?'REVIEWABLE_REMOVE_CANDIDATE':'HOLD_UNKNOWN';
let seed=0x1c7c2026;
const next=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
const cases=Number(process.argv.find(x=>x.startsWith('--cases='))?.split('=')[1]||1_000_000);
const negatives=Number(process.argv.find(x=>x.startsWith('--negatives='))?.split('=')[1]||1_000_000);
if(!Number.isSafeInteger(cases)||cases<1||cases>10_000_000||!Number.isSafeInteger(negatives)||negatives<1||negatives>1_000_000)throw new Error('bounds 1..10M cases, 1..1M negatives');
let killed=0,escaped=0,incorrectPromotion=0;
const full=Object.fromEntries(OBLIGATIONS.map(k=>[k,true]));
for(let i=0;i<cases;i++){
 // Each trial is a complete file-retirement evidence scenario with 12 independent obligations.
 const mutant={...full};const m=next()%OBLIGATIONS.length;
 mutant[OBLIGATIONS[m]]=(next()&1)?false:undefined;
 if(next()%7===0)mutant[OBLIGATIONS[next()%OBLIGATIONS.length]]=null;
 const baseline=deletionDecision(full),observed=deletionDecision(mutant);
 if(baseline==='REVIEWABLE_REMOVE_CANDIDATE'&&observed==='HOLD_UNKNOWN')killed++;else escaped++;
}
// Independent negative family: never permit a removal when any consumer channel is unknown.
for(let i=0;i<negatives;i++){
 const facts={...full};
 const hole=next()%OBLIGATIONS.length;
 facts[OBLIGATIONS[hole]]=[false,null,'unverified','PASS',0][next()%5];
 if(deletionDecision(facts)!=='HOLD_UNKNOWN')incorrectPromotion++;
}
const output={seed:'0x1c7c2026',cases,negatives,obligations:OBLIGATIONS,killed,escaped,incorrectPromotion,modelOnly:true,claimBoundary:'12-dimensional semantic evidence-gate mutations in memory; not edits to 10M files, not 10M real runtime tests, not proof of safe deletion.'};
if(!process.argv.includes('--exhaustive-proof')){
 mkdirSync(join(root,'artifacts'),{recursive:true});
 writeFileSync(join(root,'artifacts/repository-retirement-mutations.json'),JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify(output));
}
if(escaped||incorrectPromotion)process.exit(1);

// Exhaustive, finite certificate. Only this fixed 12-axis three-state domain
// can be saturated. A 20-bit base-3 index is information-theoretically minimal
// for lossless encoding of its complete diagnostic state (3^12 profiles).
if(process.argv.includes('--exhaustive-proof')){
 const n=OBLIGATIONS.length,total=3**n,bits=Math.ceil(Math.log2(total)),seen=new Uint8Array(total);
 const decode=index=>{const v=[];for(let i=0;i<n;i++){v.push(index%3);index=Math.floor(index/3);}return v;};
 const encode=v=>v.reduceRight((a,x)=>a*3+x,0);
 const outcome=v=>({decision:v.every(x=>x===1)?'REVIEWABLE_REMOVE_CANDIDATE':'HOLD_UNKNOWN',
   diagnostics:v.map((x,i)=>x===1?null:{obligation:OBLIGATIONS[i],status:x===0?'FAILED':'UNKNOWN'}).filter(Boolean)});
 let checked=0,roundTripErrors=0,promotionErrors=0,diagnosticErrors=0;
 for(let index=0;index<total;index++){
  const v=decode(index),roundTrip=encode(v);
  if(roundTrip!==index)roundTripErrors++;
  if(seen[roundTrip])diagnosticErrors++;
  seen[roundTrip]=1;
  const fact=Object.fromEntries(OBLIGATIONS.map((name,i)=>[name,v[i]===1?true:v[i]===0?false:null]));
  const expected=deletionDecision(fact),actual=outcome(v);
  if(expected!==actual.decision)promotionErrors++;
  if(actual.diagnostics.length!==v.filter(x=>x!==1).length)diagnosticErrors++;
  checked++;
 }
 // A single omitted axis always merges two different diagnostic profiles.
 const axisCounterexamples=OBLIGATIONS.map((name,i)=>{
  const a=Array(n).fill(1),b=[...a];b[i]=2;
  const reduced=x=>x.filter((_,k)=>k!==i);
  if(encode(reduced(a))!==encode(reduced(b))||JSON.stringify(outcome(a))===JSON.stringify(outcome(b)))throw Error('axis proof failed '+name);
  return {obligation:name,baselineDecision:outcome(a).decision,mutantDecision:outcome(b).decision,
    fullDiagnosticsDiffer:true,compressedAfterDroppingAxisEqual:true};
 });
 const wouldCollideAt19Bits=total>(2**(bits-1));
 const collision=[0,2**(bits-1)];
 if(!wouldCollideAt19Bits||collision[1]>=total||checked!==total||roundTripErrors||promotionErrors||diagnosticErrors||seen.some(x=>x!==1))throw Error('exhaustive finite certificate failed');
 const certificate={schema:'ictc-bounded-retirement-minimality/v1',obligations:OBLIGATIONS,
  alphabet:['FAILED','VERIFIED','UNKNOWN'],profiles:total,exhaustivelyChecked:checked,
  roundTripErrors,promotionErrors,diagnosticErrors,
  naiveFixedWidthBits:2*n,minimumFixedWidthBits:bits,
  minimumProvenByPigeonhole:total>2**(bits-1)&&total<=2**bits,
  lowerBitCollisionExample:collision,axisCounterexamples,
  claimBoundary:'Lossless 20-bit fixed-width encoding of ALL 3^12 diagnostic profiles, exhaustively verified; optimal only for this finite 12-axis three-state contract. Does not imply repository, runtime, text, CI, AI or open-world semantic minimality.'};
 writeFileSync(join(root,'artifacts/retirement-minimality-certificate.json'),JSON.stringify(certificate,null,2)+'\n');
 console.log(JSON.stringify({ok:true,profiles:checked,bits,axisCounterexamples:axisCounterexamples.length,claimBoundary:certificate.claimBoundary}));
}
