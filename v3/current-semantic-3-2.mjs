import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { CURRENT_SEMANTIC } from './current-release-suite.mjs';
import { POLICY_GATES,LEGACY_DEMO_GATES,DEMO_SUITE_GATES,NATIVE_GATES,CURRENT_BASE_GATE_REGISTRY,CURRENT_REQUIRED_BASE,COMPATIBILITY_REGRESSION_BASE,CURRENT_AUTHORITY_VECTOR } from './current-gate-registry.mjs';

export { POLICY_GATES,LEGACY_DEMO_GATES,DEMO_SUITE_GATES,NATIVE_GATES };
export const CURRENT_SEMANTIC_ACTIVE=Object.freeze(CURRENT_BASE_GATE_REGISTRY.filter(entry=>entry.class!=='replaced').map(entry=>entry.gate));
const TOPOLOGY_REQUIRED_NATIVE_GATES=Object.freeze(['v3/experience-readiness-3-2-saturation.mjs','v3/product-ci-coevolution-3-2.mjs']);
for(const gate of TOPOLOGY_REQUIRED_NATIVE_GATES){if(!NATIVE_GATES.includes(gate)){console.error(`current-semantic-native:missing ${gate}`);process.exit(1);}}
function publishFailure(gate){const output=process.env.GITHUB_OUTPUT;if(!output)return;try{appendFileSync(output,`failed_check=${gate}\n`);}catch{}}
function runGate(gate,label,timeout=120_000){const started=Date.now();console.log(`${label}:start ${gate}`);const child=spawnSync(process.execPath,[gate],{stdio:'inherit',env:process.env,timeout,killSignal:'SIGKILL'}),elapsed=Date.now()-started;if(child.error){publishFailure(gate);console.error(`::error title=${label}::${gate} ${child.error.code||'spawn-error'} after ${elapsed}ms`);process.exit(1);}if(child.signal||child.status!==0){publishFailure(gate);console.error(`::error title=${label}::${gate} failed after ${elapsed}ms`);process.exit(child.status??1);}console.log(`${label}:pass ${gate} ${elapsed}ms`);}
for(const gate of POLICY_GATES)runGate(gate,'current-semantic-policy');
for(const entry of CURRENT_BASE_GATE_REGISTRY){if(entry.class==='replaced')continue;runGate(entry.gate,entry.class==='compatibility-regression'?'current-semantic-compatibility':'current-semantic-required',entry.gate==='v3/runtime-stabilization-command-ledger-check.mjs'?180_000:120_000);}
for(const gate of DEMO_SUITE_GATES)runGate(gate,'current-semantic-demo-2.2',240_000);
for(const gate of NATIVE_GATES)runGate(gate,'current-semantic-native');
console.log(JSON.stringify({ok:true,suite:'current-semantic',baseRegistered:CURRENT_SEMANTIC.length,baseActive:CURRENT_SEMANTIC_ACTIVE.length,currentRequiredBase:CURRENT_REQUIRED_BASE.length,compatibilityRegressionBase:COMPATIBILITY_REGRESSION_BASE.length,replacedLegacyDemoGates:LEGACY_DEMO_GATES.length,demoSuiteGates:DEMO_SUITE_GATES.length,policyGates:POLICY_GATES,nativeGates:NATIVE_GATES,executionOrder:'preserves CURRENT_SEMANTIC order across current-required and compatibility-regression classes',currentAuthorityVector:CURRENT_AUTHORITY_VECTOR,claimBoundary:'Compatibility regressions remain blocking in this slice; classification changes observability, never dependency order or execution semantics.'}));
