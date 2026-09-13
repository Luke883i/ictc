import {mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {BOOTSTRAP_CONTRACT,resolveBootstrap} from './bootstrap-contract.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const resolved=resolveBootstrap({requested:process.argv[2]||'auto',env:process.env,root});
mkdirSync(resolved.runtimeDir,{recursive:true});
process.env.PORT=resolved.port;
process.env.ICTC_HOST=resolved.host;
process.env.ICTC_RUNTIME_DIR=resolved.runtimeDir;
process.env.ICTC_DEMO_SUITE=resolved.demoSuite;

let inGit=false;
try{
  inGit=execFileSync('git',['rev-parse','--is-inside-work-tree'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()==='true';
  if(inGit&&!process.env.ICTC_BUILD_SHA)process.env.ICTC_BUILD_SHA=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
}catch{}
if(inGit&&process.env.ICTC_BUILD_DIRTY==null){
  try{execFileSync('git',['diff','--quiet','HEAD','--'],{cwd:root,stdio:'ignore'});execFileSync('git',['diff','--cached','--quiet'],{cwd:root,stdio:'ignore'});process.env.ICTC_BUILD_DIRTY='0';}
  catch{process.env.ICTC_BUILD_DIRTY='1';}
}

await import('./server.mjs');
