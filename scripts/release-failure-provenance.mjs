import { spawnSync } from 'node:child_process';
import path from 'node:path';

const rail=String(process.env.RAIL||'semantic').trim();
const outcome=String(process.env.RAIL_OUTCOME||'failure').trim();
const failedCheck=String(process.env.FAILED_CHECK||'').trim();
const token=process.env.GH_TOKEN||'';
const headSha=process.env.HEAD_SHA||'';
const repository=process.env.GITHUB_REPOSITORY||'';

function slug(value,max=44){return String(value||'unknown').replace(/[^A-Za-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,max)||'unknown';}
async function post(context,state,description){
  if(!token||headSha.length!==40||!repository){console.warn(`release-failure-provenance: skip status ${context}; exact-head credentials unavailable`);return;}
  const response=await fetch(`https://api.github.com/repos/${repository}/statuses/${headSha}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:JSON.stringify({state,context,description:String(description||'').slice(0,140)})});
  if(!response.ok)throw new Error(`status-post-failed:${response.status}:${context}`);
}
function failureDetail(output){
  const lines=String(output||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  const assertion=lines.find(line=>/^AssertionError\b.*?:/.test(line));
  if(assertion)return assertion.replace(/^AssertionError\b(?:\s*\[[^\]]+\])?\s*:\s*/,'');
  const explicit=lines.find(line=>/^(?:Error|TypeError|ReferenceError|RangeError|SyntaxError)\s*:/.test(line));
  if(explicit)return explicit.replace(/^[^:]+:\s*/,'');
  return [...lines].reverse().find(line=>/hardcode|unclassified|duplicate|outside|missing|drift|failed|must|remain|invalid|mismatch/i.test(line))||lines.at(-1)||'checker failed without diagnostic output';
}

if(outcome==='success'){
  await post(`ictc/${rail}-diagnostic`,'success',`${rail} release rail passed`);
  process.exit(0);
}
await post(`ictc/${rail}-diagnostic`,'failure',`${rail} release rail failed`);
if(failedCheck){
  const checker=slug(path.basename(failedCheck,path.extname(failedCheck)),40);
  await post(`ictc/${rail}-failure/${checker}`,'failure',`failed checker: ${failedCheck}`);
  const rerun=spawnSync(process.execPath,[failedCheck],{encoding:'utf8',env:process.env,timeout:90_000,killSignal:'SIGKILL'});
  const output=`${rerun.stdout||''}\n${rerun.stderr||''}`;
  if(output.trim())process.stdout.write(output.endsWith('\n')?output:`${output}\n`);
  const detail=failureDetail(output||rerun.error?.message||rerun.signal||`exit ${rerun.status}`);
  await post(`ictc/${rail}-detail/${checker}/${slug(detail,46)}`,'failure',detail);
}
process.exit(1);
