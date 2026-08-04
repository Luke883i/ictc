import { strict as assert } from 'node:assert';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createICTCServer } from './server.mjs';
import { createMockAIProvider } from './mock-ai-provider.mjs';

const stateRoot=await mkdtemp(path.join(os.tmpdir(),'ictc-e2e-'));
const mock=createMockAIProvider(); await new Promise(resolve=>mock.listen(0,'127.0.0.1',resolve));
const mockPort=mock.address().port;
const env={...process.env};
async function start(){const runtime=await createICTCServer({stateRoot,env,schedulerMs:999999}); await new Promise(resolve=>runtime.server.listen(0,'127.0.0.1',resolve)); return runtime;}
let runtime=await start();
let base=`http://127.0.0.1:${runtime.server.address().port}`;
const headers=(role='user',actor=`e2e-${role}`)=>({'content-type':'application/json','x-ictc-role':role,'x-ictc-actor-id':actor});
async function request(route,{method='GET',role='user',actor,body}={}){const response=await fetch(base+route,{method,headers:headers(role,actor),body:body===undefined?undefined:JSON.stringify(body)}); const data=await response.json(); return {status:response.status,data};}
try{
  let result=await request('/api/health'); assert.equal(result.status,200); assert.equal(result.data.readiness,'needs-ai-configuration'); assert.deepEqual(result.data.services,['monitoring','incidents']); assert.deepEqual(result.data.roles,['admin','user']);
  result=await request('/api/admin/settings',{method:'PUT',body:{}}); assert.equal(result.status,403);
  result=await request('/api/admin/settings',{method:'PUT',role:'admin',body:{organization:{name:'ICTC Test',scope:'Sicurezza delle informazioni in Italia e UE'},llm:{endpoint:`http://127.0.0.1:${mockPort}/v1/chat/completions`,model:'mock',apiKeyEnv:'',temperature:.1},prompts:{complianceDiscovery:'Censisci fonti e restituisci JSON.',incidentDraft:'Consolida fatti e restituisci JSON.'}}}); assert.equal(result.status,200); assert.equal(result.data.settings.llm.ready,true);
  result=await request('/api/jobs',{method:'POST',body:{name:'vietato',scope:'x'}}); assert.equal(result.status,403);
  result=await request('/api/jobs',{method:'POST',role:'admin',body:{name:'Fonti cyber Italia UE',scope:'Norme, determine, regolamenti e linee guida cyber',jurisdictions:['Italia','Unione europea'],authorities:['ACN','EUR-Lex'],documentTypes:['law','decision','regulation','guideline'],sourceUrls:['https://eur-lex.europa.eu'],enabled:false,intervalHours:24}}); assert.equal(result.status,201); const jobId=result.data.job.id;
  const fileData=Buffer.from('evidenza test').toString('base64');
  result=await request('/api/contributions',{method:'POST',body:{kind:'mixed',title:'Contributo utente',url:'https://example.test/fonte',text:'Fonte da verificare',attachments:[{name:'fonte.txt',mime:'text/plain',dataBase64:fileData}]}}); assert.equal(result.status,201); assert.equal(result.data.contribution.attachments.length,1); const attachment=result.data.contribution.attachments[0]; assert.equal(attachment.bytes,13); assert.equal(attachment.sha256.length,64);
  const parallel=await Promise.all(Array.from({length:8},(_,index)=>request('/api/contributions',{method:'POST',actor:`u-${index}`,body:{kind:'text',title:`Fonte ${index}`,text:`testo ${index}`}}))); assert.ok(parallel.every(item=>item.status===201));
  result=await request(`/api/jobs/${jobId}/run`,{method:'POST',role:'admin',body:{}}); assert.equal(result.status,200); assert.equal(result.data.result.discovered,2); assert.equal(result.data.result.inserted,2);
  result=await request('/api/bootstrap'); assert.equal(result.data.complianceItems.length,2); assert.deepEqual(new Set(result.data.complianceItems.map(item=>item.documentType)),new Set(['law','decision'])); assert.ok(result.data.complianceItems.every(item=>item.reviewState==='candidate'));
  result=await request('/api/incidents',{method:'POST',actor:'reporter',body:{kind:'near-miss',title:'Accesso anomalo',awarenessAt:'2026-08-04T10:00:00.000Z',detectedAt:'2026-08-04T09:50:00.000Z',facts:'Tentativo di accesso non riuscito osservato sui log.',affectedServices:['Portale clienti'],impact:'Nessuna indisponibilità osservata',indicators:['198.51.100.8'],mitigations:['Account bloccato'],maliciousSuspected:true,crossBorder:false,contacts:['SOC'],attachments:[]}}); assert.equal(result.status,201); const incidentId=result.data.incident.id; assert.equal(result.data.incident.state,'draft'); assert.equal(result.data.incident.reminders.earlyWarning24h,'2026-08-05T10:00:00.000Z');
  result=await request(`/api/incidents/${incidentId}`,{method:'PATCH',actor:'other-user',body:{impact:'modifica'}}); assert.equal(result.status,403);
  result=await request(`/api/incidents/${incidentId}/draft`,{method:'POST',actor:'reporter',body:{}}); assert.equal(result.status,200); assert.equal(result.data.incident.state,'ready'); assert.match(result.data.incident.standardDraft.summary,/Segnalazione near-miss/);
  result=await request(`/api/incidents/${incidentId}/submit`,{method:'POST',actor:'reporter',body:{narrative:'Formulazione verificata e inviata.'}}); assert.equal(result.status,200); assert.equal(result.data.incident.state,'submitted');
  result=await request(`/api/incidents/${incidentId}/close`,{method:'POST',body:{}}); assert.equal(result.status,403);
  result=await request(`/api/incidents/${incidentId}/close`,{method:'POST',role:'admin',body:{}}); assert.equal(result.status,200); assert.equal(result.data.incident.state,'closed');
  const snapshot=runtime.store.snapshot(); assert.equal(snapshot.jobs.length,1); assert.equal(snapshot.contributions.length,9); assert.equal(snapshot.complianceItems.length,2); assert.equal(snapshot.incidents.length,1); assert.ok(snapshot.audit.length>=16);
  await new Promise(resolve=>runtime.server.close(resolve));
  runtime=await start(); base=`http://127.0.0.1:${runtime.server.address().port}`;
  result=await request('/api/bootstrap',{role:'admin'}); assert.equal(result.data.jobs.length,1); assert.equal(result.data.contributions.length,9); assert.equal(result.data.incidents[0].state,'closed');
  const stored=JSON.parse(await readFile(path.join(stateRoot,'state.json'),'utf8')); assert.equal(stored.revision,snapshot.revision); assert.ok(stored.audit.every(item=>item.actorId&&item.role&&item.action));
  console.log(`e2e-check: ok (${stored.audit.length} audited writes, 2 roles, 2 services, persistence restart)`);
} finally {
  if(runtime?.server?.listening) await new Promise(resolve=>runtime.server.close(resolve));
  if(mock.listening) await new Promise(resolve=>mock.close(resolve));
  await rm(stateRoot,{recursive:true,force:true});
}
