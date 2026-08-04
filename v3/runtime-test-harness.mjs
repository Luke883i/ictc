import { mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

export async function runtimeHarness(prefix='ictc-test') {
  const root=path.resolve(new URL('..',import.meta.url).pathname);
  const dir=await mkdtemp(path.join(os.tmpdir(),`${prefix}-`));
  const apiPort=5400+(process.pid%200), aiPort=5700+(process.pid%200);
  const base=`http://127.0.0.1:${apiPort}`; let server,mock,revision=0,seq=0;
  const spawnOne=(args,env)=>spawn(process.execPath,args,{cwd:root,env:{...process.env,...env},stdio:['ignore','pipe','pipe']});
  const wait=async url=>{for(let i=0;i<120;i++){try{if((await fetch(url)).ok)return;}catch{}await new Promise(r=>setTimeout(r,60));}throw new Error(`timeout ${url}`);};
  const stop=async child=>{if(!child||child.killed)return;child.kill('SIGTERM');await new Promise(resolve=>{child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve();},1200).unref();});};
  const identity=(role='admin',actor=`test-${role}`)=>({'x-ictc-role':role,'x-ictc-actor-id':actor});
  const bootstrap=async(role='admin',actor=`test-${role}`)=>{const r=await fetch(`${base}/api/bootstrap`,{headers:identity(role,actor)});const body=await r.json();revision=body.revision;return {status:r.status,body,headers:r.headers};};
  const request=async(method,url,body={},role='admin',actor=`test-${role}`,opts={})=>{if(opts.refresh!==false)await bootstrap(role,actor);const r=await fetch(`${base}${url}`,{method,headers:{'content-type':'application/json',...identity(role,actor),'x-ictc-command-id':opts.commandId||`${prefix}-${++seq}`,'x-ictc-expected-revision':String(opts.expectedRevision??revision)},body:JSON.stringify(body)});return {status:r.status,body:await r.json().catch(()=>({})),headers:r.headers};};
  const ok=async(...args)=>{const r=await request(...args);if(r.status<200||r.status>=300)throw Object.assign(new Error(`${args[0]} ${args[1]}: ${r.body.error}`),r);return r;};
  mock=spawnOne(['v3/mock-ai-provider.mjs'],{MOCK_AI_PORT:String(aiPort)});await wait(`http://127.0.0.1:${aiPort}`);
  server=spawnOne(['v3/server.mjs'],{PORT:String(apiPort),ICTC_HOST:'127.0.0.1',ICTC_RUNTIME_DIR:dir,ICTC_ALLOW_PRIVATE_AI:'1',ICTC_LLM_API_KEY:'test-key',ICTC_SCHEDULER_TICK_MS:'100000'});await wait(`${base}/api/health`);
  return {base,aiPort,identity,bootstrap,request,ok,close:async()=>{await stop(server);await stop(mock);await rm(dir,{recursive:true,force:true});}};
}
