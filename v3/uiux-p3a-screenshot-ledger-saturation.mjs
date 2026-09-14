import assert from 'node:assert/strict';
import { readScreenshotLedger, validateScreenshotLedger } from './uiux-p3-screenshot-ledger.mjs';
const base=readScreenshotLedger(),TRIALS=100000;let killed=0,seed=0x50334115;
const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
for(let i=0;i<TRIALS;i++){
  const mutant=structuredClone(base),family=next()%6,index=next()%mutant.findings.length;
  if(family===0)mutant.sourceCorpus.screenshotCount=14;
  if(family===1)mutant.findings.splice(index,1);
  if(family===2)mutant.findings[index].id=mutant.findings[(index+1)%mutant.findings.length].id;
  if(family===3)mutant.findings[index].owner='NONE';
  if(family===4)mutant.findings[index].groups=[];
  if(family===5)mutant.split.totalFindings=27;
  let rejected=false;try{validateScreenshotLedger(mutant);}catch{rejected=true;}
  assert.equal(rejected,true,`surviving ledger mutant family=${family} trial=${i}`);killed++;
}
console.log(JSON.stringify({ok:true,suite:'uiux-p3a-screenshot-ledger-saturation',trials:TRIALS,killed,survivors:TRIALS-killed,classification:'deterministic allocation-model mutation; not browser sessions, code mutants or human evidence'}));
