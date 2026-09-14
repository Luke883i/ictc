import assert from 'node:assert/strict';
import { convergeSemanticMutation } from './uiux-semantic-runtime-closure-p3-model.mjs';

const ITERATIONS=100_000_000;
// Independent oracle: low 16 bits encode every forbidden screenshot-derived mutation;
// bits 16..21 encode the six mandatory closure capabilities.
const ORACLE_FORBIDDEN=0x0000ffff;
const ORACLE_REQUIRED=0x003f0000;
let x=0x9e3779b9>>>0,killed=0,escaped=0,checksum=0;
for(let i=0;i<ITERATIONS;i++){
  x^=x<<13;x>>>=0;x^=x>>>17;x>>>=0;x^=x<<5;x>>>=0;
  const mutant=(x^(i*2654435761))>>>0;
  const converged=convergeSemanticMutation(mutant);
  const forbiddenClear=(converged&ORACLE_FORBIDDEN)===0;
  const requiredPresent=(converged&ORACLE_REQUIRED)===ORACLE_REQUIRED;
  if(forbiddenClear&&requiredPresent)killed++;else escaped++;
  checksum=(checksum+((converged^x)&0xffff))>>>0;
}
assert.equal(escaped,0,'at least one semantic mutation escaped the independent P3 oracle');
assert.equal(killed,ITERATIONS);
console.log(JSON.stringify({ok:true,slice:'UIUX-P3',mutations:ITERATIONS,killed,escaped,oracle:'independent forbidden-low16 + required-bits16-21',checksum,claimBoundary:'Semantic model saturation; final DOM/runtime/browser gates remain separate evidence.'}));
