import { readFile } from 'node:fs/promises';
import { CURRENT_RUNTIME } from './current-release-suite.mjs';

const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message);};
const helper=await readFile(new URL('./runtime-temp-cleanup.mjs',import.meta.url),'utf8');
check(helper.includes('maxRetries'),'temp cleanup helper must use bounded native retries');
check(helper.includes('retryDelay'),'temp cleanup helper must define retry delay');

for(const file of [...CURRENT_RUNTIME,'v3/runtime-test-harness.mjs']){
  const source=await readFile(new URL(`../${file}`,import.meta.url),'utf8');
  if(!source.includes('mkdtemp('))continue;
  check(source.includes('cleanupTempDir('),`${file}: mkdtemp users must use cleanupTempDir`);
  check(!/\brm\s*\([^\n]*recursive\s*:\s*true/.test(source),`${file}: raw recursive rm bypasses the bounded cleanup policy`);
}

if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,policy:'bounded-temp-cleanup',runtimeChecks:CURRENT_RUNTIME.length,harness:'v3/runtime-test-harness.mjs'}));
