import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const dir=await mkdtemp(join(tmpdir(),'ictc-release-gate-'));
const witness=join(dir,'runtime-witness.json');
try{
  const env={...process.env,ICTC_RELEASE_RUNTIME_WITNESS:witness};
  for(const name of ['v3/release-readiness-e2-runtime.mjs','v3/release-readiness-e2-check.mjs']){
    const r=spawnSync(process.execPath,[name],{env,stdio:'inherit',timeout:60_000});
    if(r.error||r.status!==0||r.signal){console.error(`release-readiness-E2: FAIL ${name} ${r.error?.message||r.signal||r.status}`);process.exitCode=2;break;}
  }
}finally{await rm(dir,{recursive:true,force:true});}
