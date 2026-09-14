import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

async function browserPath(){
  if(process.env.ICTC_CHROMIUM){await access(process.env.ICTC_CHROMIUM);return process.env.ICTC_CHROMIUM;}
  for(const candidate of ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser']){try{await access(candidate);return candidate;}catch{}}
  throw new Error('No supported Chromium executable found');
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitForDevTools(profile,child,getStderr){
  const activePort=path.join(profile,'DevToolsActivePort');let last;
  for(let i=0;i<150;i++){
    if(child.exitCode!==null)throw new Error(`Chromium exited before CDP became ready (code ${child.exitCode}): ${getStderr().slice(-4000)}`);
    try{
      const lines=(await readFile(activePort,'utf8')).trim().split(/\r?\n/);const port=Number(lines[0]);
      if(Number.isInteger(port)&&port>0){
        const r=await fetch(`http://127.0.0.1:${port}/json/version`);if(r.ok)return {port,version:await r.json()};
      }
    }catch(e){last=e;}
    await sleep(100);
  }
  throw new Error(`Chromium DevTools endpoint unavailable after 15s: ${last?.message||'no active port'}; stderr=${getStderr().slice(-4000)}`);
}
async function newTarget(port){const r=await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'});if(!r.ok)throw new Error(`Cannot create CDP target: ${r.status}`);return r.json();}
function connect(wsUrl){
  const ws=new WebSocket(wsUrl);let seq=0;const pending=new Map();
  ws.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id&&pending.has(msg.id)){const {resolve,reject}=pending.get(msg.id);pending.delete(msg.id);if(msg.error)reject(Object.assign(new Error(msg.error.message),{cdp:msg.error}));else resolve(msg.result);}};
  const ready=new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=()=>reject(new Error('CDP websocket failed'));});
  return {ready,call:async(method,params={})=>{await ready;const id=++seq;const p=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));ws.send(JSON.stringify({id,method,params}));return p;},close:()=>ws.close()};
}

const executable=await browserPath(),profile=await mkdtemp(path.join(tmpdir(),'ictc-security-cdp-'));
const child=spawn(executable,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-allow-origins=*','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});let stderr='';child.stderr.on('data',d=>stderr+=d);
let report;
try{
  const devtools=await waitForDevTools(profile,child,()=>stderr);const target=await newTarget(devtools.port);const cdp=connect(target.webSocketDebuggerUrl);await cdp.ready;await cdp.call('Runtime.enable');
  const moduleSource=await readFile(new URL('public/ui/security-encoding.js',import.meta.url),'utf8');
  const payload={masterSystem:'<img src=x onerror=alert(1)>',masterId:'"><svg/onload=alert(1)>',masterVersion:"' onclick='x",contentSha256:'<script>alert(1)</script>',referenceUrl:'javascript:alert(1)'};
  const expression=`(async()=>{const source=${JSON.stringify(moduleSource)};const moduleUrl='data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(source)));const m=await import(moduleUrl);document.body.innerHTML='<div id="root"></div>';const root=document.querySelector('#root');const payload=${JSON.stringify(payload)};root.innerHTML=m.internalReferencePanelMarkup(payload);const dangerous=[...root.querySelectorAll('img,svg,script,iframe,object,embed,[onerror],[onload],[onclick]')].map(n=>n.outerHTML);const links=[...root.querySelectorAll('a')].map(a=>a.getAttribute('href'));return{dangerous,links,text:root.textContent||'',html:root.innerHTML};})()`;
  const out=await cdp.call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(out.exceptionDetails)throw new Error(out.exceptionDetails.text||'Runtime.evaluate failed');const result=out.result.value;
  assert.deepEqual(result.dangerous,[],JSON.stringify(result));assert.ok(!result.links.some(x=>String(x).toLowerCase().startsWith('javascript:')),JSON.stringify(result));for(const field of ['masterSystem','masterId','masterVersion','contentSha256'])assert.ok(result.text.includes(payload[field]),field);
  report={schemaVersion:'1.1.0',authority:'chromium-cdp-fi01-production-renderer-dom',baseSha:'c35ed3479eff20826bb49d8280c3ea1e37be2fdc',result:'passed',browserProduct:devtools.version.Browser||null,payloadClasses:['event-handler-html','svg-event-handler','script-tag','javascript-url'],assertions:{noExecutableDomNodes:true,noJavascriptHref:true,hostileValuesRenderedAsText:true},claimBoundary:'Actual Chromium DOM execution over the production FI-01 renderer bytes via CDP. Automated isolated-browser evidence; not a full application journey, human review, or independent penetration test.'};
  console.log(JSON.stringify(report));cdp.close();
}catch(error){
  report={schemaVersion:'1.1.0',authority:'chromium-cdp-fi01-production-renderer-dom',baseSha:'c35ed3479eff20826bb49d8280c3ea1e37be2fdc',result:'failed',error:String(error?.stack||error),browserStderr:stderr.slice(-4000),claimBoundary:'Diagnostic receipt only; a failed harness is not evidence that the production renderer is unsafe.'};
  console.error(JSON.stringify(report));throw error;
}finally{
  await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});if(report)await writeFile(new URL('../artifacts/security-fi01-dom-browser.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  child.kill('SIGTERM');await Promise.race([new Promise(r=>child.once('close',r)),sleep(1500)]);if(child.exitCode==null)child.kill('SIGKILL');await rm(profile,{recursive:true,force:true}).catch(()=>{});
}
