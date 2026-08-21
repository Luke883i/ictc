import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const script=String(process.env.FAILED_BROWSER_SCRIPT||'').trim();
const token=process.env.GH_TOKEN||'';
const headSha=process.env.HEAD_SHA||'';
const repository=process.env.GITHUB_REPOSITORY||'';
const artifacts=path.resolve('artifacts');
function slug(value,max=40){return String(value||'unknown').replace(/[^A-Za-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,max)||'unknown';}
async function post(context,description){
  if(!token||headSha.length!==40||!repository){console.warn(`browser-failure-provenance: skip status ${context}; exact-head credentials unavailable`);return;}
  const response=await fetch(`https://api.github.com/repos/${repository}/statuses/${headSha}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:JSON.stringify({state:'failure',context,description:String(description||'').slice(0,140)})});
  if(!response.ok)throw new Error(`status-post-failed:${response.status}:${context}`);
}
async function candidateArtifact(base){
  let names=[];try{names=await readdir(artifacts);}catch{return null;}
  const candidates=names.filter(name=>name.endsWith('-error.json')&&(name===`${base}-error.json`||name.startsWith(`${base}-`)));
  if(!candidates.length)return null;
  const ranked=await Promise.all(candidates.map(async name=>({name,mtime:(await stat(path.join(artifacts,name))).mtimeMs})));
  ranked.sort((a,b)=>b.mtime-a.mtime);return path.join(artifacts,ranked[0].name);
}
const base=path.basename(script,path.extname(script))||'browser';
const artifact=await candidateArtifact(base);
if(!artifact){await post(`ictc/browser-detail/${slug(base)}/no-artifact`,'browser failed; no structured error artifact found');process.exit(0);}
let payload={};try{payload=JSON.parse(await readFile(artifact,'utf8'));}catch(error){await post(`ictc/browser-detail/${slug(base)}/invalid-artifact`,error.message);process.exit(0);}
const phase=slug(payload.phase||'unknown',34),type=slug(payload.type||'Error',28),message=String(payload.message||`${type} in ${phase}`);
await post(`ictc/browser-detail/${slug(base,34)}/${phase}/${type}`,`${phase}: ${type}: ${message}`);
console.log(JSON.stringify({browser:base,artifact,phase,type,message:message.slice(0,180)}));
