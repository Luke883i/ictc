import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
const root=path.dirname(new URL(import.meta.url).pathname),runtime=await mkdtemp(path.join(tmpdir(),'ictc-v2-grc-')),port=45000+(process.pid%1000),base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,[path.join(root,'server.mjs')],{env:{...process.env,ICTC_RUNTIME_DIR:runtime,ICTC_PORT:String(port),ICTC_HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});let stderr='';child.stderr.on('data',d=>stderr+=d);const headers={'content-type':'application/json','x-ictc-role':'admin'};
async function request(url,{method='GET',body}={}){const r=await fetch(base+url,{method,headers,body:body?JSON.stringify(body):undefined}),text=await r.text();let data;try{data=JSON.parse(text);}catch{data=text;}if(!r.ok)throw new Error(`${method} ${url} ${r.status}: ${text}`);return data;}
try{
  for(let i=0;i<50;i++){try{await request('/api/health');break;}catch{if(i===49)throw new Error(`server not ready: ${stderr}`);await new Promise(r=>setTimeout(r,100));}}
  const boot0=await request('/api/bootstrap');
  assert.ok(['V2 Experimental','V3 Experimental'].includes(boot0.experience.productEdition));
  assert.equal(boot0.experience.productEdition,'V3 Experimental','successor edition must preserve V2 GRC capability rail');
  for(const id of['objects','coverage','actions','risks','assurance'])assert.ok(boot0.procedures.some(x=>x.id===id),id);
  const created=await request('/api/grc/objects',{method:'POST',body:{type:'laptop',name:'Notebook CFO',criticality:'high',owner:'Finance',sourceAuthority:'Intune'}});assert.match(created.receipt.hash,/^[a-f0-9]{64}$/);const objectId=created.result.id;
  await request(`/api/grc/objects/${objectId}/review`,{method:'POST',body:{decision:'active',reason:'Owner confirmed'}});
  const mapping=await request('/api/grc/mappings',{method:'POST',body:{requirementRef:'R1',requirementLabel:'MFA privilegiata',targetIds:[objectId]}});await request(`/api/grc/mappings/${mapping.result.id}/decision`,{method:'POST',body:{decision:'gap',reason:'MFA assente'}});
  const action=await request('/api/grc/actions',{method:'POST',body:{title:'Abilitare MFA',originType:'mapping',originId:mapping.result.id,owner:'local-admin',dueAt:'2099-01-01'}});await request(`/api/grc/actions/${action.result.id}/adopt`,{method:'POST',body:{priority:5,reason:'Gap critico',owner:'local-admin',dueAt:'2099-01-01'}});await request(`/api/grc/actions/${action.result.id}/progress`,{method:'POST',body:{state:'in-progress',note:'avviata'}});
  const risk=await request('/api/grc/risks',{method:'POST',body:{title:'Accesso privilegiato senza MFA',likelihood:5,impact:5,objectIds:[objectId],actionIds:[action.result.id]}});await request(`/api/grc/risks/${risk.result.id}/review`,{method:'POST',body:{likelihood:4,impact:5,reason:'Risk owner review'}});
  const assurance=await request('/api/grc/assurance',{method:'POST',body:{title:'Questionario cliente',requestText:'Descrivere MFA e logging',source:'Cliente'}});assert.equal(assurance.result.state,'intake');
  const grc=await request('/api/grc');assert.equal(grc.objects.counts.active,1);assert.equal(grc.coverage.gaps,1);assert.equal(grc.actions.counts.open,1);assert.equal(grc.risks.heatmap[3][4],1);assert.equal(grc.risks.aiOverlay.length,0);assert.equal(grc.assurance.counts.intake,1);
  const dossier=await request(`/api/evidence/grc-object/${objectId}`);assert.equal(dossier.subject.id,objectId);const exported=await request('/api/export/current.json');assert.ok(exported.rows.some(x=>x.type==='grc-object'&&x.id===objectId));
  console.log(`v2-grc-runtime-check: ok (V2 capabilities preserved under ${boot0.experience.productEdition}; AO/MC/AP/RC/AR, receipts, evidence, dashboard, export)`);
}finally{child.kill('SIGTERM');await new Promise(r=>setTimeout(r,100));await rm(runtime,{recursive:true,force:true});}
