import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const script=String(process.env.FAILED_BROWSER_SCRIPT||'').trim(),artifacts=path.resolve('artifacts');
function blockerFrom(message){const match=String(message||'').match(/covered-by=([^;]+)/);return match?.[1]||'';}
function anomalyFrom(payload){const value=Array.isArray(payload?.anomalies)?payload.anomalies[0]:null;return value&&typeof value==='object'?value:null;}
function callsiteFrom(payload){const trace=String(payload?.traceback||'');if(trace.includes("click_mode(m,'graph')"))return'mobile';if(trace.includes("click_mode(page,'graph')"))return'desktop';return'';}
async function candidateArtifact(base){let names=[];try{names=await readdir(artifacts);}catch{return null;}const candidates=names.filter(name=>name.endsWith('-error.json')&&(name===`${base}-error.json`||name.startsWith(`${base}-`)));if(!candidates.length)return null;const ranked=await Promise.all(candidates.map(async name=>({name,mtime:(await stat(path.join(artifacts,name))).mtimeMs})));ranked.sort((a,b)=>b.mtime-a.mtime);return path.join(artifacts,ranked[0].name);}
const base=path.basename(script,path.extname(script))||'browser',artifact=await candidateArtifact(base);
if(!artifact){console.error(`::error title=browser-provenance::${base}: no structured error artifact found`);process.exit(0);}
let payload={};try{payload=JSON.parse(await readFile(artifact,'utf8'));}catch(error){console.error(`::error title=browser-provenance::${base}: invalid artifact: ${error.message}`);process.exit(0);}
const phase=String(payload.phase||'unknown'),type=String(payload.type||'Error'),message=String(payload.message||`${type} in ${phase}`),blocker=blockerFrom(message),anomaly=anomalyFrom(payload),callsite=callsiteFrom(payload);
console.error(`::error title=browser-provenance ${base}::${phase}: ${type}: ${message}`);
console.log(JSON.stringify({browser:base,artifact,phase,type,blocker:blocker||null,callsite:callsite||null,anomaly:anomaly?{kind:anomaly.kind||null,surface:anomaly.surface||null,role:anomaly.role||null,viewport:anomaly.viewport||null,measured:anomaly.measured??null}:null,message:message.slice(0,300)}));
