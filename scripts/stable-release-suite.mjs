import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
export const STABLE=Object.freeze([
  'tests/verification/v1-stable-release-contract-check.mjs',
  'tests/verification/v1-stable-ui-contract-check.mjs',
  'tests/verification/visual-epistemic-runtime-check.mjs',
  'tests/verification/visual-epistemic-runtime-saturation.mjs',
  'tests/verification/procedure-finetuning-intent-coverage-check.mjs',
  'tests/verification/procedure-finetuning-check.mjs',
  'tests/verification/procedure-compliance-onto-epistemic-check.mjs',
  'tests/verification/procedure-finetuning-saturation.mjs',
  'tests/verification/procedure-compliance-onto-epistemic-saturation.mjs',
  'tests/verification/procedure-executive-harmonization-check.mjs',
  'tests/verification/procedure-executive-harmonization-saturation.mjs',
  'tests/verification/demo-procedure-ontology-check.mjs',
  'tests/verification/demo-operating-year-check.mjs',
  'tests/verification/demo-operating-year-saturation.mjs',
  'tests/verification/procedure-ui-ux-finetuning-check-1-6-1.mjs',
  'tests/verification/procedure-ui-ux-finetuning-saturation.mjs',
  'tests/verification/procedure-intent-convergence-check.mjs',
  'tests/verification/rn-contribution-boundary-check.mjs',
  'tests/verification/procedure-intent-convergence-saturation.mjs',
  'tests/verification/v1-stable-experience-saturation.mjs',
  'tests/verification/v1-stable-process-hardening-check.mjs'
]);
function publishFailure(file){const output=process.env.GITHUB_OUTPUT;if(!output)return;try{appendFileSync(output,`failed_check=${file}\n`);}catch{}}
for(const file of STABLE){const started=Date.now();console.log(`stable-release-suite:start ${file}`);const child=spawnSync(process.execPath,[file],{stdio:'inherit',env:process.env,timeout:60_000,killSignal:'SIGKILL'});const elapsed=Date.now()-started;if(child.error){publishFailure(file);console.error(`::error title=stable-release-suite::${file} ${child.error.code||'spawn-error'} after ${elapsed}ms`);process.exit(1);}if(child.signal){publishFailure(file);console.error(`::error title=stable-release-suite::${file} terminated by ${child.signal} after ${elapsed}ms`);process.exit(1);}if(child.status!==0){publishFailure(file);console.error(`::error title=stable-release-suite::${file} failed with exit code ${child.status??1} after ${elapsed}ms`);process.exit(child.status??1);}console.log(`stable-release-suite:pass ${file} ${elapsed}ms`);}console.log(JSON.stringify({ok:true,suite:'stable',checks:STABLE.length}));
