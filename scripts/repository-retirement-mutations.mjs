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
mkdirSync(join(root,'artifacts'),{recursive:true});writeFileSync(join(root,'artifacts/repository-retirement-mutations.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output));if(escaped||incorrectPromotion)process.exit(1);
