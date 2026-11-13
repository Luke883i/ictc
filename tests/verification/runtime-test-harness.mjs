import { mkdtemp } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeChildProcess, prepareChildProcess } from '../../src/lib/runtime-child-lifecycle.mjs';
import { cleanupTempDir } from '../../src/lib/runtime-temp-cleanup.mjs';

export async function runtimeHarness(prefix='ictc-test') {
  const root=path.resolve(fileURLToPath(new URL('../..',import.meta.url)));
  const dir=await mkdtemp(path.join(os.tmpdir(),`${prefix}-`));
  const apiPort=5400+(process.pid%200), aiPort=5700+(process.pid%200);
  const base=`http://127.0.0.1:${apiPort}`; let server,mock,revision=0,seq=0;
  const spawnOne=(args,env)=>prepareChildProcess(spawn(process.execPath,args,{cwd:root,env:{...process.env,...env},stdio:['ignore','pipe','pipe'],windowsHide:true}));
  const wait=async url=>{for(let i=0;i<120;i++){try{if((await fetch(url)).ok)return;}catch{}await new Promise(r=>setTimeout(r,60));}throw new Error(`timeout ${url}`);};
  const identity=(role='admin',actor=`test-${role}`)=>({'x-ictc-role':role,'x-ictc-actor-id':actor});
  const bootstrap=async(role='admin',actor=`test-${role}`)=>{const r=await fetch(`${base}/api/bootstrap`,{headers:identity(role,actor)});const body=await r.json();revision=body.revision;return {status:r.status,body,headers:r.headers};};
  const request=async(method,url,body={},role='admin',actor=`test-${role}`,opts={})=>{if(opts.refresh!==false)await bootstrap(role,actor);const r=await fetch(`${base}${url}`,{method,headers:{'content-type':'application/json',...identity(role,actor),'x-ictc-command-id':opts.commandId||`${prefix}-${++seq}`,'x-ictc-expected-revision':String(opts.expectedRevision??revision)},body:JSON.stringify(body)});return {status:r.status,body:await r.json().catch(()=>({})),headers:r.headers};};
  const ok=async(...args)=>{const r=await request(...args);if(r.status<200||r.status>=300)throw Object.assign(new Error(`${args[0]} ${args[1]}: ${r.body.error}`),r);return r;};
  mock=spawnOne(['tests/helpers/mock-ai-provider.mjs'],{MOCK_AI_PORT:String(aiPort)});await wait(`http://127.0.0.1:${aiPort}`);
  const serverEnv={PORT:String(apiPort),ICTC_HOST:'127.0.0.1',ICTC_RUNTIME_DIR:dir,ICTC_ALLOW_LOCAL_ACTOR_SWITCH:'1',ICTC_ALLOW_PRIVATE_AI:'1',ICTC_ALLOW_INSECURE_AI:'1',ICTC_LLM_API_KEY:'test-key',ICTC_SCHEDULER_TICK_MS:'100000',ICTC_RATE_LIMIT_BURST:'100000',ICTC_RATE_LIMIT_PER_SECOND:'10000'};
  const startServer=async()=>{server=spawnOne(['src/server.mjs'],serverEnv);await wait(`${base}/api/health`);};
  await startServer();
  const restart=async()=>{await closeChildProcess(server);await startServer();};
  // Test-only preparation via existing user-administration and onboarding Store routes.
  // No bypass, synthetic acceptance or business writer is introduced.
  const onboard=async(role='admin',actor=`test-${role}`)=>{
    const usersResponse=await fetch(`${base}/api/admin/users`,{headers:identity('admin','local-admin')});
    if(!usersResponse.ok)throw Error('Existing user directory read failed: '+usersResponse.status);
    const usersBody=await usersResponse.json();
    const found=(usersBody.users||[]).find(x=>x.id===actor);
    if(!found){
      if(actor==='local-admin')throw Error('Canonical local admin missing');
      await onboard('admin','local-admin');
      const created=await request('POST','/api/admin/users',{id:actor,role,displayName:'Test actor '+actor},'admin','local-admin');
      if(created.status!==201)throw Error('Actor provisioning failed '+created.status+': '+JSON.stringify(created.body));
    }else if(found.role!==role)throw Error('Actor role mismatch: '+actor);
    const seed=await bootstrap(role,actor);
    if(seed.status!==200)throw Error('Actor bootstrap failed '+seed.status);
    let value=seed.body?.experience?.onboarding;
    if(value?.accepted)return value;
    for(let i=0;i<5;i++){
      if(value?.chapter?.id!=='C'+(i+1)||!value?.chapter?.contentDigest)throw Error('Unexpected onboarding chapter for '+actor+': '+JSON.stringify(value?.chapter));
      const acknowledged=await request('PATCH','/api/profile/onboarding',
        {chapterId:value.chapter.id,contentDigest:value.chapter.contentDigest,explicitAcknowledgement:true},role,actor);
      if(acknowledged.status!==200||!acknowledged.body?.result)throw Error('Onboarding failed '+actor+' '+acknowledged.status+': '+JSON.stringify(acknowledged.body));
      value=acknowledged.body.result;
    }
    if(value.accepted!==true||value.completedChapters!==5||value.readOnly!==true)throw Error('Incomplete onboarding attestation for '+actor);
    return value;
  };
  return {base,aiPort,identity,bootstrap,request,ok,onboard,restart,close:async()=>{await closeChildProcess(server);await closeChildProcess(mock);await cleanupTempDir(dir);}};
}
