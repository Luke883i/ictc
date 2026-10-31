// An isolated loopback runtime witness. Does not establish deployment assurance.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:net';
import {readFileSync} from 'node:fs';
import {validateRuntimeHealth} from './release-readiness-e2-health.mjs';
import {procedureAdapterIds} from './runtime/procedure-adapters.mjs';
const dir=await mkdtemp(join(tmpdir(),'ictc-release-e2-'));
function freePort(){return new Promise((resolve,reject)=>{const s=createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});}
let child;let output='';try{
  const port=await freePort();
  child=spawn(process.execPath,['v3/bootstrap.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,ICTC_HOST:'127.0.0.1',PORT:String(port),ICTC_RUNTIME_DIR:dir,ICTC_PUBLIC_DEMO:'0',ICTC_ALLOW_NETWORK_BIND:'0'},stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',x=>{output+=String(x).slice(0,1000)});child.stderr.on('data',x=>{output+=String(x).slice(0,1000)});
  let payload;let httpStatus=0;
  const deadline=Date.now()+20_000;
  while(Date.now()<deadline){if(child.exitCode!==null)break;try{const r=await fetch(`http://127.0.0.1:${port}/api/health`,{signal:AbortSignal.timeout(1500)});httpStatus=r.status;payload=await r.json();if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
  const ids=procedureAdapterIds();
  const expectedVersion=JSON.parse(readFileSync(new URL('./release-identity.json',import.meta.url),'utf8')).productVersion;
  const health=validateRuntimeHealth(payload,ids,expectedVersion);
  const integrityOK=health.integrityOK;
  const procedureCount=health.procedureCount;
  const witness={schemaVersion:'1.0.0',classification:'E2-loopback-runtime-readback',healthHttp:httpStatus,integrityOK,procedureCount,portScope:'127.0.0.1',externalAttestation:false};
  console.log(JSON.stringify(witness));
  assert.equal(witness.healthHttp,200,'real HTTP health');assert.equal(payload?.ok,true,'health body');
  assert.equal(witness.integrityOK,true,'audit integrity');assert.equal(witness.procedureCount,7,'seven DISTINCT business services');
  assert.equal(health.ok,true,`health contract: ${health.failures.join(',')}`);
  if(process.env.ICTC_RELEASE_RUNTIME_WITNESS)await writeFile(process.env.ICTC_RELEASE_RUNTIME_WITNESS,JSON.stringify(witness)+'\n');
}finally{
  if(child&&child.exitCode===null){child.kill('SIGTERM');await Promise.race([new Promise(r=>child.once('exit',r)),new Promise(r=>setTimeout(r,1500))]);if(child.exitCode===null)child.kill('SIGKILL');}
  await rm(dir,{recursive:true,force:true});
}
