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

async function freePort(){
  return await new Promise((resolve,reject)=>{
    const probe=net.createServer();
    probe.unref();
    probe.once('error',reject);
    probe.listen({host:'127.0.0.1',port:0,exclusive:true},()=>{
      const address=probe.address();
      const port=typeof address==='object'&&address?address.port:0;
      probe.close(error=>error?reject(error):port>0?resolve(port):reject(new Error('ephemeral port allocation failed')));
    });
  });
}

async function startOnPort(runtime,port){
  const child=spawn(process.execPath,[path.join(here,'bootstrap.mjs'),'demo'],{
    env:{...baseEnv,ICTC_RUNTIME_DIR:runtime,ICTC_PORT:String(port),ICTC_HOST:'127.0.0.1'},
    stdio:['ignore','pipe','pipe']
  });
  const base=`http://127.0.0.1:${port}`;
  let stdout='',stderr='';
  const append=(current,chunk)=>`${current}${chunk}`.slice(-32_768);
  child.stdout.on('data',chunk=>{stdout=append(stdout,chunk);});
  child.stderr.on('data',chunk=>{stderr=append(stderr,chunk);});
  prepareChildProcess(child,{drainStdout:false,drainStderr:false});

  async function get(url){
    const response=await fetch(base+url,{headers});
    const text=await response.text();
    let data;
    try{data=JSON.parse(text);}catch{data=text;}
    if(!response.ok)throw new Error(`${url} ${response.status}: ${text}`);
    return data;
  }

  try{
    for(let i=0;i<900;i++){
      if(child.exitCode!=null)throw new Error(`server exited ${child.exitCode} pid=${child.pid} port=${port}:\nstdout:\n${stdout}\nstderr:\n${stderr}`);
      try{
        await get('/api/health');
        return {child,get,diagnostics:()=>({stdout,stderr,pid:child.pid,port})};
      }catch(error){
        if(i===899)throw new Error(`server not ready after 90000ms pid=${child.pid} port=${port}:\nstdout:\n${stdout}\nstderr:\n${stderr}\n${error.message}`);
        await new Promise(resolve=>setTimeout(resolve,100));
      }
    }
  }catch(error){
    await closeChildProcess(child,{graceMs:5000,timeoutMs:10000}).catch(()=>{});
    throw error;
  }
  throw new Error('unreachable');
}

async function start(runtime){
  let lastError;
  for(let attempt=0;attempt<4;attempt++){
    const port=await freePort();
    try{return await startOnPort(runtime,port);}
    catch(error){
      lastError=error;
      if(!/EADDRINUSE/.test(String(error?.stack||error)))throw error;
    }
  }
  throw lastError||new Error('server start failed after collision retries');
}

const runtime=await mkdtemp(path.join(tmpdir(),'ictc-demo-suite-3-0-'));
let live;
try{
  live=await start(runtime);
  const health=await live.get('/api/health');
  const boot=await live.get('/api/bootstrap');
  const grc=await live.get('/api/grc');
  const lattice=await live.get('/api/demo/evidence-lattice');
  const demo=boot.experience.demo;

  assert.equal(health.demo.enabled,true);
  assert.equal(health.demo.suiteVersion,'3.0');
  assert.equal(health.demo.projectionAuthority,'demo-suite-3-0');
  assert.equal(demo.suiteVersion,'3.0');
  assert.equal(demo.profile,'suite-3.0');
  assert.equal(demo.positiveRecords,188);
  assert.equal(demo.stressFixtures,512);
  assert.equal(demo.stressVisible,false);
  assert.equal(demo.deprecatedSuite,'2.2');
  assert.equal(demo.coherent,true);
  assert.deepEqual({
    monitoring:boot.missions.length,
    incidents:boot.incidents.length,
    objects:grc.objects.objects.length,
    coverage:grc.coverage.mappings.length,
    actions:grc.actions.actions.length,
    risks:grc.risks.risks.length,
    assurance:grc.assurance.cases.length
  },{monitoring:9,incidents:18,objects:63,coverage:36,actions:27,risks:21,assurance:14});
  assert.ok(boot.missions.every(record=>record.demo?.datasetAuthority==='demo-suite-3-0'&&record.demo?.scenarioId==='ictc-demo-suite-3-0'));
  assert.ok(boot.incidents.every(record=>record.demo?.datasetAuthority==='demo-suite-3-0'&&record.demo?.scenarioId==='ictc-demo-suite-3-0'));
  assert.equal(lattice.enabled,true);
  assert.equal(lattice.ok,true);
  assert.equal(lattice.sourceSuite,'3.0');
  assert.equal(lattice.datasetAuthority,'demo-suite-3-0');
  assert.equal(lattice.summary.subjects,188);
  assert.equal(lattice.closure.closed,true);

  const revision=boot.revision;
  const digest=demo.stateDigest;
  await closeChildProcess(live.child,{graceMs:5000,timeoutMs:10000});
  live=null;
  live=await start(runtime);
  const boot2=await live.get('/api/bootstrap');
  assert.equal(boot2.revision,revision);
  assert.equal(boot2.experience.demo.stateDigest,digest);
  console.log(JSON.stringify({ok:true,control:'DEMO-SUITE-3.0-RUNTIME-E2E',revision,digest,businessRecords:188,latticeDigest:lattice.digest,legacy22:'deprecated'},null,2));
}catch(error){
  console.error(`::error title=demo-suite-3-0-runtime-e2e-check::${String(error?.stack||error).replace(/\r?\n/g,'%0A')}`);
  throw error;
}finally{
  if(live?.child)await closeChildProcess(live.child,{graceMs:5000,timeoutMs:10000}).catch(()=>{});
  await rm(runtime,{recursive:true,force:true,maxRetries:20,retryDelay:100});
}
