import { spawnSync } from 'node:child_process';
import { runCurrentReleaseSuite } from './current-release-suite.mjs';
const GATES=Object.freeze(['v3/native-semantic-lattice-3-2-check.mjs','v3/native-semantic-lattice-3-2-ui-check.mjs','v3/native-semantic-lattice-3-2-saturation.mjs','v3/native-semantic-lattice-3-2-stress.mjs']);
runCurrentReleaseSuite('semantic');
for(const gate of GATES){const started=Date.now();console.log(`current-semantic-3.2:start ${gate}`);const child=spawnSync(process.execPath,[gate],{stdio:'inherit',env:process.env,timeout:120_000,killSignal:'SIGKILL'});const elapsed=Date.now()-started;if(child.error){console.error(`::error title=current-semantic-3.2::${gate} ${child.error.code||'spawn-error'} after ${elapsed}ms`);process.exit(1);}if(child.signal||child.status!==0){console.error(`::error title=current-semantic-3.2::${gate} failed after ${elapsed}ms`);process.exit(child.status??1);}console.log(`current-semantic-3.2:pass ${gate} ${elapsed}ms`);}
console.log(JSON.stringify({ok:true,suite:'current-semantic-3.2',extensionOf:'current-release-suite semantic',gates:GATES,releaseProfile:'semantic_composition_3_1+native_semantic_lattice_3_2'}));
