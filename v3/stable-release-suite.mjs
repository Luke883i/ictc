import { spawnSync } from 'node:child_process';
const STABLE=Object.freeze([
  'v3/v1-stable-release-contract-check.mjs',
  'v3/v1-stable-ui-contract-check.mjs',
  'v3/visual-epistemic-runtime-check.mjs',
  'v3/visual-epistemic-runtime-saturation.mjs',
  'v3/procedure-finetuning-intent-coverage-check.mjs',
  'v3/procedure-finetuning-check.mjs',
  'v3/procedure-compliance-onto-epistemic-check.mjs',
  'v3/procedure-finetuning-saturation.mjs',
  'v3/procedure-compliance-onto-epistemic-saturation.mjs',
  'v3/procedure-executive-harmonization-check.mjs',
  'v3/procedure-executive-harmonization-saturation.mjs',
  'v3/demo-procedure-ontology-check.mjs',
  'v3/procedure-intent-convergence-check.mjs',
  'v3/procedure-intent-convergence-saturation.mjs',
  'v3/v1-stable-experience-saturation.mjs',
  'v3/v1-stable-process-hardening-check.mjs'
]);
for(const file of STABLE){const started=Date.now();console.log(`stable-release-suite:start ${file}`);const child=spawnSync(process.execPath,[file],{stdio:'inherit',env:process.env,timeout:60_000,killSignal:'SIGKILL'});const elapsed=Date.now()-started;if(child.error){console.error(`::error title=stable-release-suite::${file} ${child.error.code||'spawn-error'} after ${elapsed}ms`);process.exit(1);}if(child.signal){console.error(`::error title=stable-release-suite::${file} terminated by ${child.signal} after ${elapsed}ms`);process.exit(1);}if(child.status!==0){console.error(`::error title=stable-release-suite::${file} failed with exit code ${child.status??1} after ${elapsed}ms`);process.exit(child.status??1);}console.log(`stable-release-suite:pass ${file} ${elapsed}ms`);}console.log(JSON.stringify({ok:true,suite:'stable',checks:STABLE.length}));
