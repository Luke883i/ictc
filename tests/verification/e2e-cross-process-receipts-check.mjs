/** Real HTTP cross-process E2E: RN + EC + AO -> MC -> AP -> RC -> AR.
 * Scoped witness over all seven processes, not every journey step or browser.
 */
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {runtimeHarness} from './runtime-test-harness.mjs';
import {procedureAdapters} from '../../src/runtime/procedure-adapters.mjs';

const h=await runtimeHarness('ictc-e2e-cross-receipts');
const actions=[];
const record=(process,operation,r)=>{
 assert.equal(r.status>=200&&r.status<300,true,`${process} ${operation}: ${JSON.stringify(r.body)}`);
 const payload=r.body.raw||r.body;
 assert.match(payload.receipt?.hash||'',/^[0-9a-f]{64}$/,`${process} ${operation} missing hashed receipt`);
 assert.equal(typeof payload.receipt.revision,'number');
 actions.push({process,operation,status:r.status,receiptHash:payload.receipt.hash,revision:payload.receipt.revision,id:payload.result?.id||null});
 return payload.result;
};
const get=async(path,role='admin')=>{
 const response=await fetch(`${h.base}${path}`,{headers:h.identity(role,`test-${role}`)});
 const data=await response.json();assert.equal(response.status,200,`${path}: ${JSON.stringify(data)}`);return data;
};
try{
 const seed=await h.bootstrap('admin','local-admin');
 assert.equal(seed.status,200);
 await h.onboard('admin','local-admin');
 await h.onboard('auditor','local-auditor');
 await h.onboard('user','alice');
 await h.onboard('user','bob');
 const contribution=record('RN-01','contribute-source',await h.ok('POST','/api/contributions',
  {text:'RN evidence: source observed, no legal applicability automatically decided'},'user','alice'));
 const incident=record('EC-01','incident-intake',await h.ok('POST','/api/incidents/intake',
  {eventKind:'incident',operationalSeverity:'not-assessed',originalNarrative:'EC observation pending human assessment',awarenessAt:'2026-11-10T09:00:00.000Z'},'user','alice'));
 const own=await h.bootstrap('user','alice'),foreign=await h.bootstrap('user','bob');
 assert.ok(own.body.contributions.some(x=>x.id===contribution.id));
 assert.ok(own.body.incidents.some(x=>x.id===incident.id));
 assert.equal(foreign.body.contributions.some(x=>x.id===contribution.id),false,'contributor privacy');
 assert.equal(foreign.body.incidents.some(x=>x.id===incident.id),false,'incident privacy');
 const object=record('AO-01','create',await h.ok('POST','/api/grc/objects',
  {type:'server',name:'E2E ERP application',criticality:'high',owner:'IT',sourceAuthority:'CMDB'},'admin','local-admin'));
 const objectId=object.id;
 record('AO-01','activate-with-human-reason',await h.ok('POST',`/api/grc/objects/${objectId}/review`,
  {decision:'active',reason:'CMDB owner confirmed by test operator'},'admin','local-admin'));
 const mapping=record('MC-01','map-object-to-requirement',await h.ok('POST','/api/grc/mappings',
  {requirementRef:'E2E-REQ-1',requirementLabel:'Privileged MFA',targetIds:[objectId]},'admin','local-admin'));
 record('MC-01','review-gap-with-reason',await h.ok('POST',`/api/grc/mappings/${mapping.id}/decision`,
  {decision:'gap',reason:'No MFA on source record'},'admin','local-admin'));
 const action=record('AP-01','create-remediation',await h.ok('POST','/api/grc/actions',
  {title:'Enable privileged MFA',originType:'mapping',originId:mapping.id,owner:'local-admin',dueAt:'2099-01-01'},'admin','local-admin'));
 record('AP-01','adopt-with-reason',await h.ok('POST',`/api/grc/actions/${action.id}/adopt`,
  {priority:5,reason:'Risk owner approves remediation',owner:'local-admin',dueAt:'2099-01-01'},'admin','local-admin'));
 record('AP-01','progress-with-note',await h.ok('POST',`/api/grc/actions/${action.id}/progress`,
  {state:'in-progress',note:'Remediation underway'},'admin','local-admin'));
 const risk=record('RC-01','create-risk-linked-to-action',await h.ok('POST','/api/grc/risks',
  {title:'Privileged access without MFA',likelihood:5,impact:5,objectIds:[objectId],actionIds:[action.id]},'admin','local-admin'));
 record('RC-01','human-risk-review',await h.ok('POST',`/api/grc/risks/${risk.id}/review`,
  {likelihood:4,impact:5,reason:'Risk owner confirms current exposure'},'admin','local-admin'));
 const assurance=record('AR-01','intake-original-request',await h.ok('POST','/api/grc/assurance',
  {title:'MFA customer questionnaire',requestText:'Describe MFA control',source:'Customer'},'admin','local-admin'));
 assert.equal(assurance.state,'intake');
 const state=await get('/api/grc');
 assert.equal(state.objects.counts.active,1);
 assert.equal(state.coverage.gaps,1);
 assert.equal(state.actions.counts.open,1);
 assert.equal(state.risks.heatmap[3][4],1);
 assert.equal(state.assurance.counts.intake,1);
 assert.equal(state.risks.aiOverlay.length,0);
 const evidence=await get(`/api/evidence/grc-object/${objectId}`);
 assert.equal(evidence.subject.id,objectId);
 const exported=await get('/api/export/current.json');
 assert.ok(exported.rows.some(x=>x.type==='grc-object'&&x.id===objectId));
 const auditor=await h.request('POST','/api/grc/objects',
  {type:'server',name:'Forbidden auditor write',criticality:'high',owner:'auditor'},'auditor','local-auditor');
 assert.equal(auditor.status,403,`auditor write must be denied: ${JSON.stringify(auditor.body)}`);
 const after=await get('/api/grc');assert.equal(after.objects.counts.active,1,'denied write must leave objects unchanged');
 const health=await get('/api/health');assert.equal(health.integrity.ok,true,'audit head must match persisted snapshot');
 const expected=procedureAdapters().map(x=>x.id);assert.deepEqual(expected,['monitoring','incidents','objects','coverage','actions','risks','assurance']);
 const processList=['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01'];
 assert.deepEqual([...new Set(actions.map(x=>x.process))],processList,'seven native procedure mutations');
 assert.equal(new Set(actions.map(x=>x.revision)).size,actions.length,'each HTTP mutation has one distinct persisted revision');
 const receipt={schema:'ictc-e2e-7process-real-write/v2',authority:'HTTP server + isolated SQLite + immutable hashed receipts',
  processes:processList,runtimeCommands:actions.length,commandReceipts:actions,
  asserts:{sevenProcesses:true,allWritesHadHashedReceipts:true,grcReadback:true,contributionReadback:true,incidentReadback:true,privateActorIsolation:true,objectEvidence:true,objectExport:true,deniedAuditorWrite:true,noMutationAfterDenial:true,integrityBinding:true},
  negative:{endpoint:'POST /api/grc/objects',actor:'auditor',status:auditor.status},
  journeyStepCoverage:null,globalProductE2ECoverage:null,
  claimBoundary:'Actual seven-process HTTP mutations, readback, receipts, actor isolation and auditor denial; not native browser, not every workflow step, not independent human judgement, not external deployment.'};
 await mkdir(new URL('../../artifacts/',import.meta.url),{recursive:true});
 await writeFile(new URL('../../artifacts/e2e-cross-process-receipts.json',import.meta.url),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({ok:true,processes:receipt.processes.length,writes:receipt.runtimeCommands,receiptHashes:receipt.commandReceipts.length,negative:auditor.status,globalProductE2ECoverage:null}));
}finally{await h.close();}
