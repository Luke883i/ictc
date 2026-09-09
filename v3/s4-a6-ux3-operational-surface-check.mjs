import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateOperationalSurface} from './s4-a6-ux3-operational-surface-model.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [bootstrap,operational,standardBrowser,css,styles,finetuningBrowser,browserUx3,registry,workflow,authority,contract]=await Promise.all([
  read('./public/ui/visual-epistemic-runtime.js'),read('./public/ui/operational-surface-a6-ux3.js'),read('./public/ui/standard-browser.js'),read('./public/a6-ux3-operational-surface.css'),read('./public/styles.css'),read('./browser-procedure-finetuning-1-4-base.py'),read('./browser-s4-a6-ux3-operational-surface.py'),read('./current-gate-registry.mjs'),read('../.github/workflows/s4-a6-ux3-operational-surface.yml'),read('../docs/convergence/convergence-authority.json'),read('./s4-a6-ux3-operational-surface-contract.json')
]);
const failures=validateOperationalSurface({bootstrap,operational,standardBrowser,css,styles,finetuningBrowser,browserUx3,registry,workflow,authority,contract});
assert.deepEqual(failures,[],JSON.stringify(failures,null,2));
const parsed=JSON.parse(contract);assert.equal(parsed.slice,'S4-A6');assert.equal(parsed.executionUnit,'A6-UX3');assert.equal(parsed.parentRemainsOpen,true);assert.equal(parsed.evidence.mutationTrials,100000);
console.log(JSON.stringify({ok:true,slice:'S4-A6',executionUnit:'A6-UX3',contract:'operational surface convergence',invariants:parsed.invariants.length,parentRemainsOpen:true,claimBoundary:parsed.claimBoundary}));
