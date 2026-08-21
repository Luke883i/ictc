import { access, readFile } from 'node:fs/promises';
import { CURRENT_RUNTIME, CURRENT_SEMANTIC } from './current-release-suite.mjs';
import { ASSURANCE_COVERAGE_CONTRACT } from './assurance-risk-model.mjs';
await import('./semantic-closure-2-8-runtime-check.mjs');
await import('./semantic-closure-2-8-causality-check.mjs');
await import('./semantic-closure-2-8-ui-check.mjs');
await import('./semantic-closure-2-8-saturation.mjs');
await import('./procedure-finetuning-2-3-check.mjs');
await import('./procedure-finetuning-2-3-saturation.mjs');
await import('./procedure-record-contract-2-4-check.mjs');
await import('./procedure-record-saturation-2-4.mjs');
await import('./surface-truth-contract-2-5-check.mjs');
await import('./surface-truth-saturation-2-5.mjs');
await import('./shell-admin-demo-check-2-6.mjs');
await import('./shell-admin-demo-saturation-2-6.mjs');
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const ci=await readFile(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const postMerge=await readFile(new URL('../.github/workflows/post-merge-evidence.yml',import.meta.url),'utf8');
const failures=[];const check=(condition,message)=>{if(!condition)failures.push(message);};
check(pkg.scripts?.test==='npm run test:current','package.json test must resolve to test:current');
check(pkg.scripts?.['test:current:semantic']==='node v3/current-release-suite.mjs semantic','semantic current suite script drift');
check(pkg.scripts?.['test:current:runtime']==='node v3/current-release-suite.mjs runtime','runtime current suite script drift');
check(pkg.scripts?.['test:current']==='npm run test:current:semantic && npm run test:current:runtime','current suite aggregator drift');
check(postMerge.includes('npm run test:current'),'post-merge evidence must execute the current suite');
check(!postMerge.includes('- run: npm test'),'post-merge evidence must not execute the historical npm test alias directly');
check(ci.includes('npm run test:current:semantic'),'PR CI must consume the canonical semantic current suite');
check(ci.includes('npm run test:current:runtime'),'PR CI must consume the canonical runtime current suite');
const paths=[...new Set([...CURRENT_SEMANTIC,...CURRENT_RUNTIME])];for(const path of paths){try{await access(new URL(`../${path}`,import.meta.url));}catch{failures.push(`current suite path missing: ${path}`);}}
check(new Set(CURRENT_SEMANTIC).size===CURRENT_SEMANTIC.length,'semantic suite contains duplicate check paths');
check(new Set(CURRENT_RUNTIME).size===CURRENT_RUNTIME.length,'runtime suite contains duplicate check paths');
for(const [family,contract] of Object.entries(ASSURANCE_COVERAGE_CONTRACT)){const suite=contract.mode==='runtime'?CURRENT_RUNTIME:CURRENT_SEMANTIC;check(contract.candidates.some(path=>suite.includes(path)),`assurance coverage family missing from ${contract.mode} suite: ${family}`);}
if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,semanticChecks:CURRENT_SEMANTIC.length,runtimeChecks:CURRENT_RUNTIME.length,uniqueChecks:paths.length,coverageFamilies:Object.keys(ASSURANCE_COVERAGE_CONTRACT).length,procedureFineTuningContract:'2.4.0',surfaceTruthContract:'2.5.0',shellAdminDemoContract:'2.6.0',semanticClosureContract:'2.8.0'}));
