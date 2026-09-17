import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { closeChildProcess, prepareChildProcess } from './runtime-child-lifecycle.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const headers={'x-ictc-role':'admin','x-ictc-actor-id':'demo-suite-3-0-e2e'};
const {PORT:_runnerPort,ICTC_DEMO_SUITE:_runnerSuite,...baseEnv}=process.env;
const phase=String(process.env.ICTC_DEMO_E2E_PHASE||'restart').trim();
const phases=['start','health-enabled','health-version','health-authority','bootstrap','procedures','lattice','restart'];
if(!phases.includes(phase))throw new Error(`unknown DEMO Suite 3.0 E2E phase: ${phase}`);
const reaches=name=>phases.indexOf(phase)>=phases.indexOf(name);

async function freePort(){
  return await new Promise((resolve,reject)=>{
    const server=net.createServer();server.unref();server.once('error',reject);
    server.listen({host:'127.0.0.1',port:0,exclusive:true},()=>{const address=server.address(),port=typeof address==='object'&&address?address.port:0;server.close(error=>error?reject(error):port>0?resolve(port):reject(new Error('ephemeral port allocation failed')));});
  });
}
async function start(runtime){
  const port=await freePort();
  const child=spawn(process.execPath,[path.join(here,'bootstrap.mjs'),'demo'],{env:{...baseEnv,ICTC_RUNTIME_DIR:runtime,ICTC_PORT:String(port),ICTC_HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`;let stdout='',stderr='';const append=(current,chunk)=>`${current}${chunk}`.slice(-32768);
  child.stdout.on('data',chunk=>{stdout=append(stdout,chunk);});child.stderr.on('data',chunk=>{stderr=append(stderr,chunk);});prepareChildProcess(child,{drainStdout:false,drainStderr:false});
  async function get(url){const response=await fetch(base+url,{headers}),text=await response.text();let data;try{data=JSON.parse(text);}catch{data=text;}if(!response.ok)throw new Error(`${url} ${response.status}: ${text}`);return data;}
  for(let i=0;i<900;i++){
    if(child.exitCode!=null)throw new Error(`server exited ${child.exitCode} pid=${child.pid} port=${port}:\nstdout:\n${stdout}\nstderr:\n${stderr}`);
    try{await get('/api/health');return{child,get};}catch(error){if(i===899)throw new Error(`server not ready after 90000ms pid=${child.pid} port=${port}:\nstdout:\n${stdout}\nstderr:\n${stderr}\n${error.message}`);await new Promise(resolve=>setTimeout(resolve,100));}
  }
  throw new Error('unreachable');
}

const runtime=await mkdtemp(path.join(tmpdir(),'ictc-demo-suite-3-0-'));let live;
try{
  live=await start(runtime);
  if(phase==='start')console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-RUNTIME-E2E',phase:'start'},null,2));
  else{
    const health=await live.get('/api/health');
    assert.equal(health.demo?.enabled,true,'health.demo.enabled');
    if(phase==='health-enabled')console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-RUNTIME-E2E',phase:'health-enabled'},null,2));
    else{
      assert.equal(health.demo?.suiteVersion,'3.0','health.demo.suiteVersion');
      if(phase==='health-version')console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-RUNTIME-E2E',phase:'health-version'},null,2));
      else{
        assert.equal(health.demo?.projectionAuthority,'demo-suite-3-0','health.demo.projectionAuthority');
        if(phase==='health-authority')console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-RUNTIME-E2E',phase:'health-authority'},null,2));
        else{
          const boot=await live.get('/api/bootstrap'),demo=boot.experience?.demo;
          assert.equal(demo?.suiteVersion,'3.0','bootstrap.demo.suiteVersion');assert.equal(demo?.profile,'suite-3.0','bootstrap.demo.profile');assert.equal(demo?.positiveRecords,188,'bootstrap.demo.positiveRecords');assert.equal(demo?.stressFixtures,512,'bootstrap.demo.stressFixtures');assert.equal(demo?.stressVisible,false,'bootstrap.demo.stressVisible');assert.equal(demo?.deprecatedSuite,'2.2','bootstrap.demo.deprecatedSuite');assert.equal(demo?.coherent,true,'bootstrap.demo.coherent');
          if(phase==='bootstrap')console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-RUNTIME-E2E',phase:'bootstrap',revision:boot.revision,digest:demo.stateDigest},null,2));
          else{
            const grc=await live.get('/api/grc');
            assert.deepEqual({monitoring:boot.missions.length,incidents:boot.incidents.length,objects:grc.objects.objects.length,coverage:grc.coverage.mappings.length,actions:grc.actions.actions.length,risks:grc.risks.risks.length,assurance:grc.assurance.cases.length},{monitoring:9,incidents:18,objects:63,coverage:36,actions:27,risks:21,assurance:14},'native-procedure-projection-counts');
            assert.ok(boot.missions.every(record=>record.demo?.datasetAuthority==='demo-suite-3-0'&&record.demo?.scenarioId==='ictc-demo-suite-3-0'),'RN Suite 3.0 provenance');assert.ok(boot.incidents.every(record=>record.demo?.datasetAuthority==='demo-suite-3-0'&&record.demo?.scenarioId==='ictc-demo-suite-3-0'),'EC Suite 3.0 provenance');
            if(phase==='procedures')console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-RUNTIME-E2E',phase:'procedures',revision:boot.revision},null,2));
            else{
              const lattice=await live.get('/api/demo/evidence-lattice');assert.equal(lattice.enabled,true,'lattice.enabled');assert.equal(lattice.ok,true,'lattice.ok');assert.equal(lattice.sourceSuite,'3.0','lattice.sourceSuite');assert.equal(lattice.datasetAuthority,'demo-suite-3-0','lattice.datasetAuthority');assert.equal(lattice.summary?.subjects,188,'lattice.summary.subjects');assert.equal(lattice.closure?.closed,true,'lattice.closure.closed');
              if(phase==='lattice')console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-RUNTIME-E2E',phase:'lattice',revision:boot.revision,latticeDigest:lattice.digest},null,2));
              else{
                const revision=boot.revision,digest=demo.stateDigest;await closeChildProcess(live.child,{graceMs:5000,timeoutMs:10000});live=null;live=await start(runtime);const boot2=await live.get('/api/bootstrap');assert.equal(boot2.revision,revision,'restart-idempotent-revision');assert.equal(boot2.experience?.demo?.stateDigest,digest,'restart-demo-digest');console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-RUNTIME-E2E',phase:'restart',revision,digest,businessRecords:188,latticeDigest:lattice.digest,legacy22:'deprecated'},null,2));
              }
            }
          }
        }
      }
    }
  }
}catch(error){console.error(`::error title=demo-suite-3-0-runtime-e2e-${phase}::${String(error?.stack||error).replace(/\r?\n/g,'%0A')}`);throw error;}
finally{if(live?.child)await closeChildProcess(live.child,{graceMs:5000,timeoutMs:10000}).catch(()=>{});await rm(runtime,{recursive:true,force:true,maxRetries:20,retryDelay:100});}
