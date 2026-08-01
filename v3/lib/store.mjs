import crypto from 'node:crypto';
import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
export const RUNTIME = path.resolve(process.env.ICTC_RUNTIME_DIR || path.join(ROOT, 'runtime'));
export const BLOBS = path.join(RUNTIME, 'blobs');
const LEDGER = path.join(RUNTIME, 'ledger.jsonl');
export const now = () => new Date().toISOString();
export const digest = value => crypto.createHash('sha256').update(value).digest('hex');
export const transitions = {'facts-to-confirm':['owned'],owned:['assessing'],assessing:['responding'],responding:['closure-review'],'closure-review':['closed'],closed:[]};
const future = minutes => new Date(Date.now() + minutes * 60_000).toISOString();
export const seed = {
  meta:{tenant:'Azienda Demo',version:'3.0.0-beta.1',disclaimer:'ICTC attesta operazioni locali e decisioni registrate; non certifica automaticamente applicabilità o conformità.'},
  sources:[
    {id:'src-acn',title:'ACN — area NIS2',ecosystem:'ACN e CSIRT Italia',kind:'official-web',locator:'https://www.acn.gov.it/',lifecycle:'active',reviewState:'change-awaiting-review',owner:'Compliance e Cybersecurity',lastCheckedAt:'2026-07-31T09:20:00Z'},
    {id:'src-garante',title:'Garante — violazioni di dati personali',ecosystem:'Garante Privacy',kind:'official-web',locator:'https://www.garanteprivacy.it/',lifecycle:'active',reviewState:'change-awaiting-review',owner:'DPO Office',lastCheckedAt:'2026-07-31T09:10:00Z'},
    {id:'src-eurlex',title:'EUR-Lex — Regolamento (UE) 2016/679',ecosystem:'Unione europea',kind:'official-law',locator:'https://eur-lex.europa.eu/',lifecycle:'active',reviewState:'observed',owner:'Legal e Privacy',lastCheckedAt:'2026-07-31T05:10:00Z'}
  ],
  findings:[
    {id:'finding-acn',sourceId:'src-acn',jobId:'job-acn',type:'content-change',statement:'Il contenuto osservato differisce dalla versione locale.',humanState:'awaiting-review',materiality:'undetermined',aiProposal:'Possibile aggiornamento operativo; contenuto da qualificare.'},
    {id:'finding-garante',sourceId:'src-garante',jobId:'job-garante',type:'new-document',statement:'Un nuovo documento è stato osservato nel canale.',humanState:'awaiting-review',materiality:'undetermined',aiProposal:'Possibile rilevanza per il processo data breach.'}
  ],
  jobs:[
    {id:'job-acn',label:'Monitoraggio ACN',sourceId:'src-acn',ecosystem:'ACN e CSIRT Italia',state:'change-awaiting-review',enabled:true,schedule:{intervalMinutes:1440},nextRunAt:future(720),studyQuestion:'Individua variazioni da sottoporre a review umana.'},
    {id:'job-garante',label:'Monitoraggio Garante',sourceId:'src-garante',ecosystem:'Garante Privacy',state:'completed-no-change',enabled:true,schedule:{intervalMinutes:1440},nextRunAt:future(780),studyQuestion:'Individua variazioni da sottoporre a review umana.'}
  ],
  controls:[{id:'control-monitor',label:'Monitoraggio normativo',state:'evidence-available'},{id:'control-incident',label:'Gestione incidenti',state:'operating-declared'},{id:'control-privacy',label:'Valutazione privacy',state:'mapped'},{id:'control-vendor',label:'Gestione fornitori',state:'mapped'}],
  matters:[
    {id:'matter-near',title:'Allegato errato intercettato',kind:'near-miss',narrative:'Un allegato è stato bloccato prima della consegna esterna.',state:'facts-to-confirm',owner:'Privacy Operations',raci:{accountable:'DPO Office',responsible:'Privacy Operations',consulted:['Legal','IT Security'],informed:['Process Owner']},timeline:[],phaseEvidence:{}},
    {id:'matter-supplier',title:'Accessi anomali a un portale',kind:'incident',narrative:'Accessi anomali a un portale fornitore con possibile esposizione di dati.',state:'owned',owner:'Cybersecurity Incident Manager',raci:{accountable:'CISO',responsible:'Incident Response Team',consulted:['DPO','Legal','Procurement'],informed:['Executive Sponsor']},timeline:[],phaseEvidence:{}}
  ],changes:[],coverage:[]
};
export async function readLedger(){try{return(await readFile(LEDGER,'utf8')).split('\n').filter(Boolean).map(JSON.parse)}catch(error){if(error.code==='ENOENT')return[];throw error}}
export function verify(events){let previous='GENESIS';for(const event of events){const{hash,...base}=event;if(event.previousHash!==previous||digest(JSON.stringify(base))!==hash)return{ok:false,eventCount:events.length,reason:`invalid ${event.id}`};previous=hash}return{ok:true,eventCount:events.length,head:previous}}
export async function append(type,payload,actor='system',producer='runtime'){await mkdir(RUNTIME,{recursive:true});const events=await readLedger();const previousHash=events.at(-1)?.hash||'GENESIS';const base={id:crypto.randomUUID(),type,actor,producer,at:now(),previousHash,payload};const event={...base,hash:digest(JSON.stringify(base))};events.push(event);await writeFile(LEDGER,events.map(JSON.stringify).join('\n')+'\n');if((await readLedger()).at(-1).hash!==event.hash)throw new Error('readback non verificato');return{event,receipt:{eventId:event.id,eventType:type,hash:event.hash,previousHash,persistedAt:event.at,readbackVerified:true,ledgerHead:event.hash}}}
export function apply(events){const state=structuredClone(seed);for(const event of events){const payload=event.payload;switch(event.type){
case'source.proposed':state.sources.push(payload.source);if(payload.finding)state.findings.push(payload.finding);break;
case'job.created':state.sources.push(payload.source);state.jobs.push(payload.job);break;
case'source.reviewed':{const source=state.sources.find(item=>item.id===payload.id);if(source){source.reviewState=payload.outcome==='accepted'?'reviewed':'rejected';source.lifecycle=payload.outcome==='accepted'?'active':'candidate';source.receipt=event.hash}}break;
case'job.scheduled':{const job=state.jobs.find(item=>item.id===payload.id);if(job)Object.assign(job,payload.job,{receipt:event.hash})}break;
case'finding.reviewed':{const finding=state.findings.find(item=>item.id===payload.id);if(finding){finding.humanState=payload.outcome==='relevant'?'reviewed-relevant':'reviewed-not-relevant';finding.receipt=event.hash;if(payload.outcome==='relevant'&&!state.changes.some(change=>change.findingId===finding.id))state.changes.push({id:`change-${finding.id}`,findingId:finding.id,sourceId:finding.sourceId,title:'Valutare la variazione osservata',state:'impact-to-assess',owner:'Compliance Decision Owner',decision:null,controlIds:[],receipt:event.hash})}}break;
case'change.decided':{const change=state.changes.find(item=>item.id===payload.id);if(change){change.decision={outcome:payload.outcome,rationale:payload.rationale,by:event.actor,at:event.at};change.state=payload.outcome==='action-required'?'controls-to-map':'decision-recorded';change.receipt=event.hash}}break;
case'change.control.mapped':{const change=state.changes.find(item=>item.id===payload.id);if(change&&!change.controlIds.includes(payload.controlId)){change.controlIds.push(payload.controlId);change.state='coverage-mapped';change.receipt=event.hash}state.coverage.push({id:`coverage-${event.id}`,changeId:payload.id,controlId:payload.controlId,state:'mapped',receipt:event.hash})}break;
case'matter.reported':state.matters.push(payload.matter);break;
case'matter.owner.confirmed':{const matter=state.matters.find(item=>item.id===payload.id);if(matter){matter.owner=payload.owner;matter.raci=payload.raci;matter.state='owned';matter.receipt=event.hash;matter.timeline.push({at:event.at,phase:'ownership',label:'Responsabilità confermata',evidence:{owner:payload.owner,raci:payload.raci},receipt:event.hash})}}break;
case'matter.transitioned':{const matter=state.matters.find(item=>item.id===payload.id);if(matter){matter.state=payload.to;matter.receipt=event.hash;matter.phaseEvidence||={};matter.phaseEvidence[payload.phase]=payload.evidence;matter.timeline.push({at:event.at,phase:payload.phase,label:payload.label,evidence:payload.evidence,receipt:event.hash})}}break;
case'job.completed':{const job=state.jobs.find(item=>item.id===payload.job.id);if(job)Object.assign(job,payload.job,{receipt:event.hash});if(payload.finding)state.findings.push(payload.finding)}break;
case'job.failed':{const job=state.jobs.find(item=>item.id===payload.job.id);if(job)Object.assign(job,payload.job,{receipt:event.hash})}break;
default:break}}return state}
