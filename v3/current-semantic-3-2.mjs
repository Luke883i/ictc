import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { CURRENT_SEMANTIC } from './current-release-suite.mjs';
const POLICY_GATES=Object.freeze(['v3/runtime-temp-cleanup-contract-check.mjs','v3/ci-topology-contract-check.mjs']);
export const LEGACY_DEMO_GATES=Object.freeze(['v3/demo-seed-contract-check.mjs','v3/demo-seed-saturation.mjs','v3/demo-outcome-audit-check.mjs','v3/demo-outcome-saturation.mjs','v3/demo-reality-context-check.mjs','v3/demo-procedure-ontology-check.mjs','v3/demo-operating-year-check.mjs','v3/demo-operating-year-saturation.mjs']);
export const DEMO_SUITE_GATES=Object.freeze(['v3/demo-suite-2-2-module-load-check.mjs','v3/demo-suite-2-2-runtime-semantic-check.mjs','v3/demo-suite-2-2-runtime-store-check.mjs','v3/demo-suite-2-2-projection-closure-check.mjs']);
const NATIVE_GATES=Object.freeze(['v3/native-semantic-lattice-3-2-check.mjs','v3/native-semantic-lattice-3-2-ui-check.mjs','v3/semantic-workspace-closure-3-2-1-saturation.mjs','v3/workspace-chrome-3-3-saturation.mjs','v3/ui-finetuning-3-4-check.mjs','v3/ui-finetuning-3-4-saturation.mjs','v3/native-semantic-lattice-3-2-saturation.mjs','v3/native-semantic-lattice-3-2-stress.mjs','v3/experience-readiness-3-2-saturation.mjs','v3/product-ci-coevolution-3-2.mjs','v3/surface-commit-3-2-v2-saturation.mjs','v3/grc-canonical-render-3-2-saturation.mjs','v3/grc-coverage-handoff-3-2-saturation.mjs','v3/ci-verdict-fanout-3-2-saturation.mjs']);
const legacyDemo=new Set(LEGACY_DEMO_GATES);
export const CURRENT_SEMANTIC_ACTIVE=Object.freeze(CURRENT_SEMANTIC.filter(gate=>!legacyDemo.has(gate)));
function publishFailure(gate){const output=process.env.GITHUB_OUTPUT;if(!output)return;try{appendFileSync(output,`failed_check=${gate}\n`);}catch{}}
function runGate(gate,label,timeout=120_000){const started=Date.now();console.log(`${label}:start ${gate}`);const child=spawnSync(process.execPath,[gate],{stdio:'inherit',env:process.env,timeout,killSignal:'SIGKILL'}),elapsed=Date.now()-started;if(child.error){publishFailure(gate);console.error(`::error title=${label}::${gate} ${child.error.code||'spawn-error'} after ${elapsed}ms`);process.exit(1);}if(child.signal||child.status!==0){publishFailure(gate);console.error(`::error title=${label}::${gate} failed after ${elapsed}ms`);process.exit(child.status??1);}console.log(`${label}:pass ${gate} ${elapsed}ms`);}
for(const gate of POLICY_GATES)runGate(gate,'current-semantic-policy');
for(const gate of CURRENT_SEMANTIC_ACTIVE)runGate(gate,'current-semantic-base',gate==='v3/runtime-stabilization-command-ledger-check.mjs'?180_000:120_000);
for(const gate of DEMO_SUITE_GATES)runGate(gate,'current-semantic-demo-2.2',240_000);
for(const gate of NATIVE_GATES)runGate(gate,'current-semantic-3.2.1');
console.log(JSON.stringify({ok:true,suite:'current-semantic-3.2.1',baseChecks:CURRENT_SEMANTIC_ACTIVE.length,replacedLegacyDemoGates:LEGACY_DEMO_GATES.length,demoSuiteGates:DEMO_SUITE_GATES.length,policyGates:POLICY_GATES,nativeGates:NATIVE_GATES,releaseProfile:'semantic_foundation_3_0+demo_suite_2_2_projection_closure+native_semantic_lattice_3_2+semantic_workspace_closure_3_2_1+workspace_chrome_3_3+ui_finetuning_3_4'}));
