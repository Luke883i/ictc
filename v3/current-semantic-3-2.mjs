import { spawnSync } from 'node:child_process';
import { runCurrentReleaseSuite } from './current-release-suite.mjs';
const POLICY_GATES=Object.freeze(['v3/runtime-temp-cleanup-contract-check.mjs','v3/ci-topology-contract-check.mjs']);
const NATIVE_GATES=Object.freeze(['v3/native-semantic-lattice-3-2-check.mjs','v3/native-semantic-lattice-3-2-ui-check.mjs','v3/native-semantic-lattice-3-2-saturation.mjs','v3/native-semantic-lattice-3-2-stress.mjs']);
function runGate(gate,label){const started=Date.now();console.log(`${label}:start ${gate}`);const child=spawnSync(process.execPath,[gate],{stdio:'inherit',env:process.env,timeout:120_000,killSignal:'SIGKILL'}),elapsed=Date.now()-started;if(child.error){console.error(`::error title=${label}::${gate} ${child.error.code||'spawn-error'} after ${elapsed}ms`);process.exit(1);}if(child.signal||child.status!==0){console.error(`::error title=${label}::${gate} failed after ${elapsed}ms`);process.exit(child.status??1);}console.log(`${label}:pass ${gate} ${elapsed}ms`);}
for(const gate of POLICY_GATES)runGate(gate,'current-semantic-policy');
runCurrentReleaseSuite('semantic');
for(const gate of NATIVE_GATES)runGate(gate,'current-semantic-3.2');
console.log(JSON.stringify({ok:true,suite:'current-semantic-3.2',extensionOf:'current-release-suite semantic',policyGates:POLICY_GATES,nativeGates:NATIVE_GATES,releaseProfile:'semantic_foundation_3_0+native_semantic_lattice_3_2'}));
