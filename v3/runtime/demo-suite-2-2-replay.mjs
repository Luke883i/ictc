import { sha256 } from '../domain.mjs';
import { DEMO_SUITE_22_EXPECTED_DIGEST, DEMO_SUITE_22_MANIFEST } from './demo-suite-2-2-fixture.mjs';
import { scheduleDemoSuite22Foundation } from './demo-suite-2-2-replay-foundation.mjs';
import { scheduleDemoSuite22Work } from './demo-suite-2-2-replay-work.mjs';

const clone=value=>structuredClone(value);
function refType(id){if(/^AO-/.test(id))return'grc-object';if(/^MC-/.test(id))return'mapping';if(/^AP-/.test(id))return'action';if(/^RC-/.test(id))return'risk';if(/^AR-/.test(id))return'assurance-case';if(/^EC-/.test(id))return'incident';if(/^RN-/.test(id))return'mission';return null;}
function originTypeForId(id){const t=refType(id);return t==='grc-object'?'grc-object':t==='mapping'?'mapping':t==='incident'?'incident':t==='mission'?'mission':t==='action'?'action':t==='risk'?'risk':t==='assurance-case'?'assurance-case':'manual';}
function eventKindForCross(id){const type=originTypeForId(id);return({'grc-object':'objects',mapping:'coverage',incident:'incidents',mission:'monitoring',action:'actions',risk:'risks','assurance-case':'assurance'})[type]||'manual';}
function evidenceRefForId(id){const type=refType(id);return type?`ictc:${type}:${id}`:id;}
export const demoSuite22StateDigest=state=>sha256({missions:state.missions,catalog:state.catalog,incidents:state.incidents,grcObjects:state.grcObjects,grcMappings:state.grcMappings,grcActions:state.grcActions,grcRisks:state.grcRisks,grcAssurance:state.grcAssurance,controlTests:state.controlTests});

export async function buildDemoSuite22State(){
  const manifest=DEMO_SUITE_22_MANIFEST,rows=manifest.records,byId=new Map(rows.map(row=>[row.id,row])),events=[],runtimeDerived={activationAt:{},relationAt:{},actionWorkStartAt:{},actionReadyAt:{},assuranceDraftAt:{}},findings=[],counters={events:0,constructors:0,checkpoints:0};
  const roleByDisplay=new Map(manifest.actors.map(actor=>[actor.displayName,actor]));
  const users=manifest.actors.map(actor=>({id:actor.id,displayName:actor.displayName,role:actor.id==='demo-compliance'?'admin':actor.id==='demo-auditor'?'auditor':'user',status:'active'}));
  const actorByDisplay=display=>{const a=roleByDisplay.get(display);if(!a)throw Object.assign(new Error(`Attore DEMO sconosciuto: ${display}`),{code:'demo-suite-2-2-actor-missing'});const user=users.find(u=>u.id===a.id);return{id:user.id,displayName:user.displayName,role:user.role,identityMode:'local'};};
  const admin=actorByDisplay('Responsabile Compliance/Qualità · DEMO');
  const state={users,missions:[],catalog:[],runs:[],incidents:[],grcObjects:[],grcMappings:[],grcActions:[],grcRisks:[],grcAssurance:[],controlTests:[],settings:{organization:{name:manifest.company.name,jurisdictions:manifest.company.declaredContext?.jurisdictions||[],sectors:[]}}};
  const RealDate=globalThis.Date;
  const withClock=async(at,fn)=>{const ms=RealDate.parse(at);if(!Number.isFinite(ms))throw new Error(`Invalid DEMO clock: ${at}`);class FrozenDate extends RealDate{constructor(...args){super(...(args.length?args:[ms]));}static now(){return ms;}}globalThis.Date=FrozenDate;try{return await fn();}finally{globalThis.Date=RealDate;}};
  const schedule=(at,priority,label,fn)=>events.push({at,ms:RealDate.parse(at),priority,label,fn});
  const plus=(iso,{days=0,hours=0,minutes=0}={})=>new RealDate(RealDate.parse(iso)+days*86400000+hours*3600000+minutes*60000).toISOString();
  const before=(iso,{hours=0,minutes=0}={})=>new RealDate(RealDate.parse(iso)-hours*3600000-minutes*60000).toISOString();
  const maxIso=(...values)=>new RealDate(Math.max(...values.filter(Boolean).map(value=>RealDate.parse(value)))).toISOString();
  const midpoint=(a,b)=>new RealDate((RealDate.parse(a)+RealDate.parse(b))/2).toISOString();
  const ensureBefore=(candidate,limit,fallbackMinutes=60)=>RealDate.parse(candidate)<RealDate.parse(limit)?candidate:before(limit,{minutes:fallbackMinutes});
  const idFactory=id=>()=>id,toZ=value=>new RealDate(value).toISOString();
  const attachDemo=(item,row)=>{item.demo={synthetic:true,tag:'synthetic-demo',scenarioId:manifest.id,scenarioVersion:'2.2-runtime',procedureId:row.code,operatingYear:{cohort:'operating-year',showcase:true,stressOnly:false,referenceDate:manifest.operatingYear.referenceDate},meta:clone(row.demoMeta),claimBoundary:row.claimBoundary};return item;};
  const ctx={rows,manifest,byId,state,schedule,plus,before,maxIso,midpoint,ensureBefore,idFactory,toZ,attachDemo,actorByDisplay,admin,runtimeDerived,counters,originTypeForId,eventKindForCross,evidenceRefForId};
  scheduleDemoSuite22Foundation(ctx);scheduleDemoSuite22Work(ctx);
  events.sort((a,b)=>a.ms-b.ms||a.priority-b.priority||a.label.localeCompare(b.label));
  for(const event of events)await withClock(event.at,async()=>{try{await event.fn();counters.events++;}catch(error){findings.push({event:event.label,at:event.at,code:error.code||null,message:error.message});throw error;}});
  state.catalog.push({id:'DEMO-CAT-001',missionId:'RN-005',title:'Provvedimento Garante da verificare · DEMO',state:'candidate',createdAt:'2026-06-18T08:30:00.000Z',impactAssessments:[],syntheticDemo:true},{id:'DEMO-CAT-002',missionId:'RN-002',title:'Aggiornamento UE verificato, impatto da valutare · DEMO',state:'verified',createdAt:'2026-06-19T08:30:00.000Z',impactAssessments:[],syntheticDemo:true},{id:'DEMO-CAT-003',missionId:'RN-007',title:'Pronuncia pubblica da verificare · DEMO',state:'candidate',createdAt:'2026-06-22T08:30:00.000Z',impactAssessments:[],syntheticDemo:true});
  const digest=demoSuite22StateDigest(state);if(digest!==DEMO_SUITE_22_EXPECTED_DIGEST)throw Object.assign(new Error(`Digest DEMO 2.2 inatteso: ${digest}`),{code:'demo-suite-2-2-state-digest-mismatch',details:{actual:digest,expected:DEMO_SUITE_22_EXPECTED_DIGEST}});
  return{state,counters,runtimeDerived,findings,stateDigest:digest};
}
