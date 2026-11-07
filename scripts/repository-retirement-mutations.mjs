/** Seeded adversarial model for file-retirement proof obligations; not source-code mutations. */
import {writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {root,census} from './repository-inventory.mjs';
import {qualifyObservedUse,USE_CLASSES,assessMigrationGateVector,MIGRATION_CLOSURE_GATES} from './repository-migration-frontier.mjs';

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


// Optional source-bound liveness attack campaign, retaining the existing retirement gates.
// Each trial mutates a compact profile sampled from the actual observed v3 inventory.
// Results are semantic model attacks, NOT physical changes to ten million source files.
const livenessCasesArg=process.argv.find(x=>x.startsWith('--liveness-cases='));
if(livenessCasesArg){
 const livenessCases=Number(livenessCasesArg.split('=')[1]);
 if(!Number.isSafeInteger(livenessCases)||livenessCases<1||livenessCases>10_000_000)
  throw new Error('liveness-cases must be 1..10M');
 const source=census().migrationFrontier;
 const hist=new Set(['lineage-only','deprecated-test','migration-only','retirement-candidate']);
 const profiles=source.nodes.map(x=>({
  runtimeRoot:x.useEvidence.runtimeRoot,runtimePath:x.useEvidence.runtimeLiteralPath,
  httpMounted:x.useEvidence.httpStaticMount,ciPath:x.useEvidence.ciOrPackagePath,
  sourceConsumer:x.useEvidence.otherSourceConsumers>0,
  historicalPurpose:hist.has(x.useEvidence.historicalPurpose)
 }));
 if(!profiles.length||source.nodes.some((row,i)=>qualifyObservedUse(profiles[i])!==row.observedUse))
  throw new Error('observed file liveness model not reproducible');
 let semanticSeed=0x1c7c2026;
 const step=()=>{semanticSeed^=semanticSeed<<13;semanticSeed^=semanticSeed>>>17;semanticSeed^=semanticSeed<<5;return semanticSeed>>>0;};
 const axes=['runtimeRoot','runtimePath','httpMounted','ciPath','sourceConsumer','historicalPurpose'];
 const attacks=['strip-runtime-root','forge-runtime-root','erase-static-import','forge-static-import',
  'reroute-http-static','forge-http-static','erase-ci-consumer','forge-ci-consumer',
  'erase-code-reader','forge-code-reader','historical-laundering','purpose-stale',
  'replace-all-witnesses','false-runtime-revival','mixed-evidence-drift','independent-channel-loss'];
 const totals=Object.fromEntries(attacks.map(x=>[x,0]));
 const observedSignatures=new Set();let lastNovel=-1,detectable=0,masked=0,oracleErrors=0,illegal=0;
 // Independent bitmask oracle for all 2^6 profiles, with explicit precedence.
 const oracle=f=>{
  const bits=(f.runtimeRoot?1:0)|(f.runtimePath?2:0)|(f.httpMounted?4:0)|
   (f.ciPath?8:0)|(f.sourceConsumer?16:0)|(f.historicalPurpose?32:0);
  return bits===0?USE_CLASSES[6]:USE_CLASSES[Math.log2(bits&-bits)];
 };
 for(let i=0;i<livenessCases;i++){
  const base=profiles[step()%profiles.length],facts={...base},attack=step()%attacks.length;
  switch(attack){
   case 0:facts.runtimeRoot=false;break;
   case 1:facts.runtimeRoot=true;break;
   case 2:facts.runtimePath=false;break;
   case 3:facts.runtimePath=true;break;
   case 4:facts.httpMounted=false;break;
   case 5:facts.httpMounted=true;break;
   case 6:facts.ciPath=false;break;
   case 7:facts.ciPath=true;break;
   case 8:facts.sourceConsumer=false;break;
   case 9:facts.sourceConsumer=true;break;
   case 10:facts.historicalPurpose=false;break;
   case 11:facts.historicalPurpose=true;break;
   case 12:for(const k of axes)facts[k]=false;break;
   case 13:facts.runtimeRoot=true;facts.historicalPurpose=false;break;
   case 14:{const mask=step();for(let j=0;j<axes.length;j++)if((mask>>>j)&1)facts[axes[j]]=!facts[axes[j]];break;}
   case 15:facts.runtimePath=false;facts.ciPath=false;facts.httpMounted=false;break;
  }
  const actual=qualifyObservedUse(facts),expected=oracle(facts);
  totals[attacks[attack]]++;
  if(actual!==expected)oracleErrors++;
  if(actual!==qualifyObservedUse(base))detectable++;else masked++;
  if(actual==='SAFE_DELETE'||actual==='REVIEWABLE_REMOVE_CANDIDATE')illegal++;
  const signature=attack+'|'+actual+'|'+expected;
  if(!observedSignatures.has(signature)){observedSignatures.add(signature);lastNovel=i;}
 }
 // Exhaustive bounded proof of the six-source-signal decision vocabulary.
 // All 2^6 profiles remain distinct diagnostics; class-only compression would discard witnesses.
 const finiteProfiles=2**axes.length,finiteUses=new Set();
 let finiteErrors=0;
 for(let mask=0;mask<finiteProfiles;mask++){
  const facts=Object.fromEntries(axes.map((key,i)=>[key,Boolean(mask&(1<<i))]));
  const result=qualifyObservedUse(facts);
  finiteUses.add(result);
  if(result!==oracle(facts))finiteErrors++;
 }
 const allFalse=Object.fromEntries(axes.map(key=>[key,false]));
 const axisCounterexamples=axes.map(axis=>{
  const changed={...allFalse,[axis]:true};
  return {axis,changesUseClass:qualifyObservedUse(allFalse)!==qualifyObservedUse(changed)};
 });
 const fixedWidthDiagnosticBits=Math.ceil(Math.log2(finiteProfiles));
 const fixedWidthClassBits=Math.ceil(Math.log2(finiteUses.size));
 const axisMinimal=axisCounterexamples.every(x=>x.changesUseClass)&&
  fixedWidthDiagnosticBits===6&&fixedWidthClassBits===3;
 const model={schema:'ictc-v3-liveness-attack-model/v1',seed:'0x1c7c2026',
  gitTrackedV3:profiles.length,cases:livenessCases,attackFamilies:attacks.length,
  detectedSemanticClassChanges:detectable,maskedByHigherPriorityEvidence:masked,oracleErrors,illegalClearances:illegal,
  observedSignatures:observedSignatures.size,lastNovelIndex:lastNovel,
  finalNoNoveltyWindow:livenessCases-lastNovel-1,
  attackDistribution:totals,
  finiteMinimality:{profiles:finiteProfiles,allClassifications:finiteUses.size,errors:finiteErrors,
   diagnosticBits:fixedWidthDiagnosticBits,classOnlyBits:fixedWidthClassBits,
   axisCounterexamples,claimBoundary:'6-bit bound is only for a 6-boolean diagnostic profile; class-only output loses evidence.'},
  modelOnly:true,sourceMutantsPhysicallyExecuted:0,
  claimBoundary:'Actual Git-derived v3 source profiles under 16 seeded evidence mutations; no claim of 10M physical edits, runtime executions, independent consumer closure or safe retirement.'};
 if(oracleErrors||illegal||!detectable||!masked||finiteErrors||!axisMinimal||
    (livenessCases>=1_000_000 && model.finalNoNoveltyWindow<1_000_000))
  throw new Error('liveness adversarial evidence / bounded saturation check failed: '+JSON.stringify(model));
 mkdirSync(join(root,'artifacts'),{recursive:true});
 writeFileSync(join(root,'artifacts/repository-liveness-mutations.json'),JSON.stringify(model,null,2)+'\n');
 console.log(JSON.stringify({liveness:model}));
}


const closureArg=process.argv.find(x=>x.startsWith('--closure-cases='));
if(closureArg){
 const cases=Number(closureArg.split('=')[1]),gateCount=MIGRATION_CLOSURE_GATES.length;
 if(!Number.isSafeInteger(cases)||cases<1||cases>10_000_000||gateCount!==12)throw Error('cutover model bounds');
 const actual=census().migrationFrontier;
 if(actual.nodes.length!==actual.closureReticulum.trackedV3||
  actual.closureReticulum.directedDependencies.length!==19||
  actual.closureReticulum.automaticDeleteAuthorized!==false)throw Error('source K0 closure projection inconsistent');
 const families=['git-denominator','duplicate-owner','dynamic-target','workflow-reader','static-url',
  'scc-leak','rbac-escalation','sqlite-readback','browser-boot','external-caller','ci-mutant-rollback',
  'v3-resurrection','http-browser-cascade','sqlite-rbac-cascade','ci-external-cascade','owner-dynamic-cascade'];
 let seed=0x1c7c2026;
 const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 const baseline=Array(12).fill(1);
 if(!assessMigrationGateVector(baseline).candidate)throw Error('satisfiable counterfactual should be reviewable');
 let killed=0,escaped=0,lastNovel=-1,withUnknown=0;
 const byFamily=Array(16).fill(0),signatures=new Set();
 for(let i=0;i<cases;i++){
  const family=rand()%16,vector=baseline.slice(),gate=family<12?family:[4,7,10,1][family-12];
  vector[gate]=(rand()&1)?0:2;
  if(family>=12){vector[[8,6,9,2][family-12]]=(rand()&1)?0:2;}
  else if((rand()&7)===0){vector[rand()%12]=(rand()&1)?0:2;}
  const result=assessMigrationGateVector(vector),oracle=vector.every(x=>x===1);
  if(result.candidate===oracle&&!result.automaticDeleteAuthorized&&!oracle)killed++;else escaped++;
  if(vector.includes(2))withUnknown++;
  byFamily[family]++;
  const signature=family+'|'+vector.join('');
  if(!signatures.has(signature)){signatures.add(signature);lastNovel=i;}
 }
 const total=3**12;let exhaustiveErrors=0,candidates=0;
 for(let idx=0;idx<total;idx++){
  let n=idx;const v=Array(12);
  for(let k=0;k<12;k++){v[k]=n%3;n=Math.floor(n/3);}
  const result=assessMigrationGateVector(v);
  if(result.candidate!==v.every(x=>x===1)||result.automaticMoveAuthorized||
   result.automaticDeleteAuthorized)exhaustiveErrors++;
  if(result.candidate)candidates++;
 }
 const axisCounterexamples=MIGRATION_CLOSURE_GATES.map((g,i)=>{
  const v=baseline.slice();v[i]=2;
  const r=assessMigrationGateVector(v);
  if(r.candidate||r.blocking.length!==1||r.blocking[0]!==g.id)exhaustiveErrors++;
  return {gate:g.id,missingGateVeto:!r.candidate};
 });
 const bits=Math.ceil(Math.log2(total)),noNoveltyWindow=cases-lastNovel-1;
 const report={schema:'ictc-cutover-closure-adversarial/v1',source:'K0 real tracked path census',
  seed:'0x1c7c2026',cases,trackedV3:actual.nodes.length,families,
  familyRuns:byFamily,mutantsKilled:killed,mutantsEscaped:escaped,
  withUnknownGate:withUnknown,distinctProfileSignatures:signatures.size,lastNovelIndex:lastNovel,noNoveltyWindow,
  exhaustive:{completeThreeStateProfiles:total,checked:total,errors:exhaustiveErrors,
   reviewableHypotheticals:candidates,necessaryGateCounterexamples:axisCounterexamples,
   lowerBoundFixedWidthBits:bits,losslessFiniteMinimum:total>2**(bits-1)&&total<=2**bits},
  runtimeEquivalenceAttested:false,physicalSourceMutationCount:0,tenLocalCiCyclesAttested:false,
  claimBoundary:'10M source-anchored semantic EVIDENCE mutations, not 10M physical repository rewrites. 3^12 gate-proof saturation is closed-world only; source profile cannot prove runtime, external callers or merge authorization.'};
 if(killed!==cases||escaped||exhaustiveErrors||candidates!==1||bits!==20||
  (cases>=1_000_000&&noNoveltyWindow<1_000_000))throw Error('cutover reticulum counterexample '+JSON.stringify(report));
 mkdirSync(join(root,'artifacts'),{recursive:true});
 writeFileSync(join(root,'artifacts/repository-migration-closure-falsification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({cutoverClosure:report}));
}

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
