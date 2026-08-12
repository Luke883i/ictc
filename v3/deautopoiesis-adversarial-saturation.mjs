import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { evaluateClosure, scenarioSeed } from './deautopoiesis-assurance.mjs';

const N=1_000_000;const families=new Map();let falseClosures=0,legitClosures=0;
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
for(let i=0;i<N;i++){
  const seed=scenarioSeed(`deautopoiesis:${i}`),r=rng(parseInt(seed.slice(0,8),16));
  const family=r()%8,external=['independent-review','branch-protection','deployment-evidence','external-security','human-at'][r()%5];
  let sample={severity:(r()%3===0?'critical':'high'),requiredGrade:'E3',observedGrade:'E2',gate:external,author:'same-circuit',oracleAuthor:'same-circuit',independentReviewer:'same-circuit',independentChannel:false,deploymentEnvelopeValid:false,serverSidePrevention:false,synthetic:false,exactHead:seed.slice(0,40),negativeWitness:true};
  if(family===0)sample={...sample,observedGrade:'E5'};
  if(family===1)sample={...sample,synthetic:true,observedGrade:'E5'};
  if(family===2)sample={...sample,independentChannel:true,independentReviewer:'same-circuit'};
  if(family===3)sample={...sample,gate:'branch-protection',serverSidePrevention:false,observedGrade:'E5'};
  if(family===4)sample={...sample,gate:'deployment-evidence',deploymentEnvelopeValid:false,observedGrade:'E5'};
  if(family===5)sample={...sample,negativeWitness:false,observedGrade:'E5'};
  if(family===6)sample={...sample,exactHead:'unbound',observedGrade:'E5'};
  if(family===7)sample={...sample,gate:'independent-review',observedGrade:'E3',independentChannel:true,independentReviewer:'external-reviewer',negativeWitness:true};
  const result=evaluateClosure(sample);families.set(family,(families.get(family)||0)+1);
  if(family===7){assert.equal(result.resolved,true);legitClosures++;}else{if(result.resolved)falseClosures++;assert.equal(result.resolved,false);}
}
assert.equal(falseClosures,0);assert.ok(legitClosures>100_000);assert.equal(families.size,8);
const artifact={ok:true,scenarios:N,uniqueSeedContract:'sha256(deautopoiesis:index)',families:Object.fromEntries(families),falseClosures,legitClosures,claimBoundary:'One million deterministic hostile scenarios falsify declared governance invariants only. They do not create independent review, branch protection, deployment evidence, accessibility evidence, security assessment, or certification.'};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/deautopoiesis-adversarial-saturation.json',import.meta.url),JSON.stringify(artifact,null,2));console.log(JSON.stringify(artifact));
