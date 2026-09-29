import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { evidenceCheckoutIdentity } from './runtime/evidence-checkout-identity.mjs';

async function browserPath(){
  if(process.env.ICTC_CHROMIUM){await access(process.env.ICTC_CHROMIUM);return process.env.ICTC_CHROMIUM;}
  for(const candidate of ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser']){try{await access(candidate);return candidate;}catch{}}
  throw Object.assign(new Error('No supported Chromium executable found'),{stage:'browser-resolve'});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function staged(stage,error){
  const e=new Error(`${stage}: ${error?.message||error}`,{cause:error});
  e.stage=stage;e.code=error?.code||'fi01-stage-failed';return e;
}
async function waitForDevTools(profile,child,getStderr){
  const activePort=path.join(profile,'DevToolsActivePort');let last;
  for(let i=0;i<250;i++){
    if(child.exitCode!==null)throw Object.assign(new Error(`Chromium exited before CDP became ready (code ${child.exitCode}): ${getStderr().slice(-4000)}`),{stage:'browser-start'});
    try{
      const lines=(await readFile(activePort,'utf8')).trim().split(/\r?\n/),port=Number(lines[0]);
      if(Number.isInteger(port)&&port>0){
        const r=await fetch(`http://127.0.0.1:${port}/json/version`,{signal:AbortSignal.timeout(1500)});
        if(r.ok)return {port,version:await r.json()};
      }
    }catch(e){last=e;}
    await sleep(100);
  }
  throw Object.assign(new Error(`Chromium DevTools endpoint unavailable after 25s: ${last?.message||'no active port'}; stderr=${getStderr().slice(-4000)}`),{stage:'browser-ready'});
}
async function newTarget(port){
  const r=await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT',signal:AbortSignal.timeout(2000)});
  if(!r.ok)throw new Error(`Cannot create CDP target: ${r.status} ${(await r.text()).slice(0,300)}`);
  return r.json();
}
function connect(wsUrl){
  const ws=new WebSocket(wsUrl);let seq=0;const pending=new Map();
  ws.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id&&pending.has(msg.id)){const {resolve,reject}=pending.get(msg.id);pending.delete(msg.id);if(msg.error)reject(Object.assign(new Error(msg.error.message),{cdp:msg.error}));else resolve(msg.result);}};
  const ready=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{try{ws.close();}catch{}reject(new Error('CDP websocket open timeout'));},5000);
    ws.onopen=()=>{clearTimeout(timer);resolve();};
    ws.onerror=()=>{clearTimeout(timer);reject(new Error('CDP websocket failed'));};
  });
  return {ready,call:async(method,params={})=>{await ready;const id=++seq;const p=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));ws.send(JSON.stringify({id,method,params}));return p;},close:()=>{try{ws.close();}catch{}}};
}
async function transportRetry(stage,attempts,fn,onAttempt){
  let last;
  for(let i=1;i<=attempts;i++){
    onAttempt?.(i);
    try{return await fn(i);}catch(error){last=error;if(i<attempts)await sleep(100*i);}
  }
  throw staged(stage,last);
}

const checkout=evidenceCheckoutIdentity(),executable=await browserPath(),profile=await mkdtemp(path.join(tmpdir(),'ictc-security-cdp-'));
const child=spawn(executable,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--remote-allow-origins=*','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let stderr='',report,transportAttempts=0,semanticAttempts=0,cdp;
child.stderr.on('data',d=>stderr+=d);
try{
  const devtools=await waitForDevTools(profile,child,()=>stderr);
  cdp=await transportRetry('cdp-transport',3,async()=>{
    const target=await newTarget(devtools.port),candidate=connect(target.webSocketDebuggerUrl);
    try{await candidate.ready;await candidate.call('Runtime.enable');return candidate;}catch(error){candidate.close();throw error;}
  },n=>{transportAttempts=n;});
  const moduleSource=await readFile(new URL('public/ui/security-encoding.js',import.meta.url),'utf8');
  const payload={masterSystem:'<img src=x onerror=alert(1)>',masterId:'"><svg/onload=alert(1)>',masterVersion:"' onclick='x",contentSha256:'<script>alert(1)</script>',referenceUrl:'javascript:alert(1)'};
  const expression=`(async()=>{const source=${JSON.stringify(moduleSource)};const moduleUrl='data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(source)));const m=await import(moduleUrl);document.body.innerHTML='<div id="root"></div>';const root=document.querySelector('#root');const payload=${JSON.stringify(payload)};root.innerHTML=m.internalReferencePanelMarkup(payload);const dangerous=[...root.querySelectorAll('img,svg,script,iframe,object,embed,[onerror],[onload],[onclick]')].map(n=>n.outerHTML);const links=[...root.querySelectorAll('a')].map(a=>a.getAttribute('href'));return{dangerous,links,text:root.textContent||'',html:root.innerHTML};})()`;
  semanticAttempts=1;
  const out=await cdp.call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(out.exceptionDetails)throw Object.assign(new Error(out.exceptionDetails.text||'Runtime.evaluate failed'),{stage:'semantic-evaluate'});
  const result=out.result.value;
  try{
    assert.deepEqual(result.dangerous,[],JSON.stringify(result));
    assert.ok(!result.links.some(x=>String(x).toLowerCase().startsWith('javascript:')),JSON.stringify(result));
    for(const field of ['masterSystem','masterId','masterVersion','contentSha256'])assert.ok(result.text.includes(payload[field]),field);
  }catch(error){throw staged('semantic-oracle',error);}
  report={schemaVersion:'1.2.0',authority:'chromium-cdp-fi01-production-renderer-dom',checkout,result:'passed',browserProduct:devtools.version.Browser||null,transportAttempts,semanticAttempts,payloadClasses:['event-handler-html','svg-event-handler','script-tag','javascript-url'],assertions:{noExecutableDomNodes:true,noJavascriptHref:true,hostileValuesRenderedAsText:true},claimBoundary:'Actual Chromium DOM execution over production FI-01 renderer bytes on the recorded checkout. Transport setup may retry up to three times; the semantic oracle executes once and is never retried. Automated isolated-browser evidence; not a full application journey, human review, or independent penetration test.'};
  console.log(JSON.stringify(report));
}catch(error){
  const stage=error?.stage||'unknown',failureClass=String(stage).startsWith('semantic-')?'SEMANTIC_ORACLE':'HARNESS_TRANSPORT';
  report={schemaVersion:'1.2.0',authority:'chromium-cdp-fi01-production-renderer-dom',checkout,result:'failed',failureClass,stage,transportAttempts,semanticAttempts,error:String(error?.stack||error),browserStderr:stderr.slice(-4000),claimBoundary:'Diagnostic receipt only. HARNESS_TRANSPORT does not imply renderer unsafety; SEMANTIC_ORACLE is a security regression candidate and is never retried.'};
  console.error(JSON.stringify(report));throw error;
}finally{
  await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});if(report)await writeFile(new URL('../artifacts/security-fi01-dom-browser.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  cdp?.close();child.kill('SIGTERM');await Promise.race([new Promise(r=>child.once('close',r)),sleep(1500)]);if(child.exitCode==null)child.kill('SIGKILL');await rm(profile,{recursive:true,force:true}).catch(()=>{});
}
