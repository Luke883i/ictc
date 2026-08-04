import { strict as assert } from 'node:assert';
import { mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os'; import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname); const runtime=await mkdtemp(path.join(os.tmpdir(),'ictc-e2e-'));
const apiPort=4807 + (process.pid % 100); const aiPort=4907 + (process.pid % 100); const base=`http://127.0.0.1:${apiPort}`;
let server; let mock; let revision=0;
function start(command,args,env){const child=spawn(command,args,{cwd:root,env:{...process.env,...env},stdio:['ignore','pipe','pipe']}); child.stdout.on('data',d=>process.env.ICTC_E2E_VERBOSE&&process.stdout.write(d)); child.stderr.on('data',d=>process.env.ICTC_E2E_VERBOSE&&process.stderr.write(d)); return child;}
async function wait(url){for(let i=0;i<100;i++){try{const r=await fetch(url);if(r.ok)return;}catch{} await new Promise(r=>setTimeout(r,80));}throw new Error(`timeout ${url}`);}
async function get(role='admin',actor=`e2e-${role}`){const r=await fetch(`${base}/api/bootstrap`,{headers:{'x-ictc-role':role,'x-ictc-actor-id':actor}}); assert.equal(r.status,200); const body=await r.json(); revision=body.revision; return body;}
async function write(pathname,body,role='admin',actor=`e2e-${role}`){const r=await fetch(`${base}${pathname}`,{method:'POST',headers:{'content-type':'application/json','x-ictc-role':role,'x-ictc-actor-id':actor,'x-ictc-command-id':`e2e-${Date.now()}-${Math.random()}`,'x-ictc-expected-revision':String(revision)},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Object.assign(new Error(`${pathname}: ${data.error}`),{data,status:r.status});return data;}
async function put(pathname,body,role='admin',actor=`e2e-${role}`){const r=await fetch(`${base}${pathname}`,{method:'PUT',headers:{'content-type':'application/json','x-ictc-role':role,'x-ictc-actor-id':actor,'x-ictc-command-id':`e2e-${Date.now()}-${Math.random()}`,'x-ictc-expected-revision':String(revision)},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(`${pathname}: ${data.error}`);return data;}
async function stop(child){if(!child||child.killed)return; child.kill('SIGTERM'); await new Promise(resolve=>{child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve();},1500).unref();});}
try{
  mock=start(process.execPath,['v3/mock-ai-provider.mjs'],{MOCK_AI_PORT:String(aiPort)}); await wait(`http://127.0.0.1:${aiPort}`);
  const serverEnv={PORT:String(apiPort),ICTC_HOST:'127.0.0.1',ICTC_RUNTIME_DIR:runtime,ICTC_ALLOW_PRIVATE_AI:'1',ICTC_LLM_API_KEY:'test-key',ICTC_SCHEDULER_TICK_MS:'100000'};
  server=start(process.execPath,['v3/server.mjs'],serverEnv); await wait(`${base}/api/health`);
  let state=await get(); assert.deepEqual(state.actor.role,'admin'); assert.equal(state.integrity.ok,true);
  const settings=await put('/api/admin/settings',{organization:{name:'Azienda E2E',scope:'Sicurezza informazioni Italia UE',jurisdictions:['Italia','UE']},llm:{endpoint:`http://127.0.0.1:${aiPort}/v1/chat/completions`,model:'mock',apiKeyEnv:'ICTC_LLM_API_KEY',temperature:.1}}); assert.equal(settings.receipt.action,'settings.updated');
  state=await get(); const missionDraft=await write('/api/missions/draft',{objective:'Fonti ufficiali su sicurezza delle informazioni per sanità',cadence:168,sourceHints:['ACN','EUR-Lex']}); const missionId=missionDraft.result.id; assert.ok(missionDraft.result.plan.queries.length);
  state=await get(); await write(`/api/missions/${missionId}/activate`,{}); state=await get(); const run=await write(`/api/missions/${missionId}/run`,{}); assert.equal(run.result.state,'completed');
  state=await get(); assert.ok(state.catalog.length>=2); const sourceId=state.catalog[0].id; const decision=await write(`/api/catalog/${sourceId}/decision`,{decision:'verified',reason:'URL e identificativo verificati'}); assert.equal(decision.result.state,'verified');
  state=await get('user','alice'); const contribution=await write('/api/contributions',{links:['https://example.org/source'],text:'Materiale di esempio',note:'Potrebbe integrare il perimetro',attachments:[{name:'memo.txt',mime:'text/plain',dataBase64:Buffer.from('memo').toString('base64')}]},'user','alice'); assert.equal(contribution.raw.result.attachments[0].sha256.length,64);
  state=await get('user','alice'); const intake=await write('/api/incidents/intake',{originalNarrative:'Un alert nei log indica un possibile attacco phishing ancora in corso su account email clienti.',awarenessAt:new Date().toISOString(),attachments:[{name:'log.txt',mime:'text/plain',dataBase64:Buffer.from('alert').toString('base64')}]},'user','alice'); const incidentId=intake.incident.id; assert.ok(intake.raw.receipt.hash); assert.equal(intake.incident.originalNarrative.includes('phishing'),true);
  for(let guard=0;guard<20;guard++){
    state=await get('user','alice'); const incident=state.incidents.find(x=>x.id===incidentId); if(!incident.nextQuestion)break;
    const q=incident.nextQuestion; const values={classification:'incident',affectedServices:'Posta elettronica e CRM',impact:'Possibile accesso non autorizzato',actionsTaken:'Account sospeso e password reimpostata',ongoing:'unknown',personalData:'yes',maliciousActivity:'yes',crossBorder:'unknown',detectedAt:new Date().toISOString()};
    await write(`/api/incidents/${incidentId}/answers`,{answers:[{id:q.id,value:values[q.id] || 'unknown'}]},'user','alice');
  }
  state=await get('user','alice'); assert.equal(state.incidents.find(x=>x.id===incidentId).nextQuestion,null);
  const drafted=await write(`/api/incidents/${incidentId}/draft`,{},'user','alice'); assert.ok(drafted.result.finalNarrative);
  state=await get('user','alice'); const finalNarrative=state.incidents.find(x=>x.id===incidentId).finalNarrative; const submitted=await write(`/api/incidents/${incidentId}/submit`,{finalNarrative,confirmed:true},'user','alice'); assert.equal(submitted.result.state,'submitted');
  state=await get('admin','admin-e2e'); const closed=await write(`/api/incidents/${incidentId}/close`,{note:'Chiusura amministrativa di test'},'admin','admin-e2e'); assert.equal(closed.result.state,'closed');
  const evidence=await fetch(`${base}/api/evidence/incident/${incidentId}`,{headers:{'x-ictc-role':'admin','x-ictc-actor-id':'admin-e2e'}}); assert.equal(evidence.status,200); const bundle=await evidence.json(); assert.equal(bundle.integrity.ok,true); assert.ok(bundle.events.length>=5);
  const oldHead=bundle.integrity.head; await stop(server); server=start(process.execPath,['v3/server.mjs'],serverEnv); await wait(`${base}/api/health`); state=await get('admin','admin-e2e'); assert.equal(state.integrity.head,oldHead); assert.equal(state.incidents.find(x=>x.id===incidentId).state,'closed');
  console.log(`e2e-check: ok (${state.integrity.events} audited writes, 2 services, AI gaps, evidence restart)`);
}finally{await stop(server);await stop(mock);await rm(runtime,{recursive:true,force:true});}
