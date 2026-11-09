import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SHA_RE=/^[0-9a-f]{40}$/i;
export const EVIDENCE_REPO_ROOT=path.resolve(fileURLToPath(new URL('../..',import.meta.url)));

function git(root,args){
  const r=spawnSync('git',['-C',root,...args],{encoding:'utf8',maxBuffer:1024*1024});
  if(r.status!==0)throw Object.assign(new Error(`git ${args.join(' ')} failed: ${String(r.stderr||'').trim()}`),{code:'evidence-git-failed',status:r.status});
  return String(r.stdout||'').trim();
}
function normalizedSha(value){
  const raw=String(value??'').trim().toLowerCase();
  if(!raw)return null;
  if(!SHA_RE.test(raw))throw Object.assign(new Error('Expected evidence SHA must be 40 hex characters'),{code:'evidence-expected-sha-invalid'});
  return raw;
}
export function evidenceCheckoutIdentity({root=EVIDENCE_REPO_ROOT,env=process.env,requireExpected=Boolean(env.ICTC_EXPECTED_SHA)}={}){
  const executionSha=normalizedSha(git(root,['rev-parse','HEAD']));
  const dirty=git(root,['status','--porcelain','--untracked-files=no']).length>0;
  const expectedSha=normalizedSha(env.ICTC_EXPECTED_SHA);
  const exactHeadBound=Boolean(executionSha)&&!dirty&&(!expectedSha||expectedSha===executionSha);
  if(requireExpected&&!expectedSha)throw Object.assign(new Error('CI evidence requires ICTC_EXPECTED_SHA'),{code:'evidence-expected-sha-required'});
  if(expectedSha&&expectedSha!==executionSha)throw Object.assign(new Error(`Evidence checkout mismatch expected=${expectedSha} execution=${executionSha}`),{code:'evidence-checkout-sha-mismatch',expectedSha,executionSha});
  if(requireExpected&&dirty)throw Object.assign(new Error('CI evidence checkout has tracked modifications'),{code:'evidence-checkout-dirty',executionSha});
  return Object.freeze({schemaVersion:'1.0.0',source:'git-checkout',executionSha,expectedSha,dirty,exactHeadBound,binding:expectedSha?'expected+git':'git-only'});
}
