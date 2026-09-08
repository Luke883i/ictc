import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {a5Baseline,classifyA5Failure,A5_FAILURE_FAMILIES} from './s4-a5-final-dom-model.mjs';
function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1103515245)+12345)>>>0;return x/4294967296;};}const R=rng(0xA510000),clone=x=>structuredClone(x);
const mods=[x=>x.rtaOrder=false,x=>x.exactTarget=false,x=>x.adminPartial=false,x=>x.oracleTechniqueLocked=true,x=>x.keyboard=false,x=>x.focusVisible=false,x=>x.horizontalOverflow=true,x=>x.reducedMotion=false,x=>x.contrastRatio=2.7,x=>x.targetHeight=20,x=>x.footerOverlap=8,x=>x.humanValidationNeeded=true];
let unclassified=0,detected=0;const observed=new Set();for(let i=0;i<10_000;i++){const x=clone(a5Baseline()),n=1+Math.floor(R()*4);for(let j=0;j<n;j++)mods[Math.floor(R()*mods.length)](x);const fam=classifyA5Failure(x);if(fam){detected++;observed.add(fam);}else unclassified++;}
assert.equal(detected,10_000);assert.equal(unclassified,0);for(const fam of observed)assert.ok(A5_FAILURE_FAMILIES.includes(fam));
const report={ok:true,slice:'S4-A5',classification:'E2 declared-family holdout',seed:'0xA510000',trials:10_000,detected,unclassified,observed:[...observed].sort(),claimBoundary:'Novelty holdout over declared automated failure-family model; not browser or human evidence.'};await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/s4-a5-holdout-10k.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
