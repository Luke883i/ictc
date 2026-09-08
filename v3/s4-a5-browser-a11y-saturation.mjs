import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {A5_FAILURE_FAMILIES,a5Baseline,classifyA5Failure} from './s4-a5-final-dom-model.mjs';
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}const R=rng(0xA50051),clone=x=>structuredClone(x);
const M={
 'rta-order':x=>x.rtaOrder=false,'rta-exact-target':x=>x.exactTarget=false,'rta-admin-partial':x=>x.adminPartial=false,'implementation-lock':x=>x.oracleTechniqueLocked=true,
 keyboard:x=>x.keyboard=false,'focus-obstruction':x=>{x.focusObstructed=true;},reflow:x=>x.horizontalOverflow=true,'reduced-motion':x=>x.reducedMotion=false,contrast:x=>x.contrastRatio=3.9,'target-size':x=>x.targetHeight=36,'footer-overlap':x=>x.footerOverlap=12,'human-validation-external':x=>x.humanValidationNeeded=true
};
let killed=0;const hits=Object.fromEntries(A5_FAILURE_FAMILIES.map(x=>[x,0]));
for(let i=0;i<100_000;i++){const fam=A5_FAILURE_FAMILIES[Math.floor(R()*A5_FAILURE_FAMILIES.length)],x=clone(a5Baseline());hits[fam]++;M[fam](x);const got=classifyA5Failure(x);assert.ok(got,`survivor ${fam}`);if(fam==='human-validation-external')assert.equal(got,'human-validation-external');killed++;}
assert.equal(killed,100_000);assert.ok(Object.values(hits).every(Boolean));
const report={ok:true,slice:'S4-A5',classification:'E2 user-effect/source-model mutation evidence',seed:'0xA50051',mutations:100_000,killed,killRate:1,families:A5_FAILURE_FAMILIES,hits,claimBoundary:'Model mutations only; browser execution is separate and human validation remains E4.'};await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/s4-a5-browser-a11y-saturation.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
