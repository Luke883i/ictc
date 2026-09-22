import {existsSync,readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const HERE=path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT=path.resolve(HERE,'..');
export const RECONCILE_CONTRACT='v3/trama-reconcile-contract.json';
const TERMINAL=new Set(['done','not-required','resolved','closed','complete','pass','accepted','evidence-bounded']);

const text=(root,rel)=>readFileSync(path.join(root,rel),'utf8');
const json=(root,rel)=>JSON.parse(text(root,rel));
const terminal=value=>TERMINAL.has(String(value||'').toLowerCase());
const norm=value=>String(value||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

export const loadReconcileContract=(root=DEFAULT_ROOT)=>json(root,RECONCILE_CONTRACT);

export function validateReconcileContract(c){
 const f=[],ck=(v,code,detail='')=>{if(!v)f.push({code,detail});};
 ck(c?.schemaVersion==='1.0.0'&&c?.sliceId==='GOV-TRAMA-RECONCILE-1','ID');
 ck(c?.classification==='trama-owned-zero-authority-reconciliation-profile'&&c?.authorityEffect==='NONE','AUTHORITY');
 ck(c?.createsNewSot===false&&c?.createsNewRoadmapCursor===false,'NO_SECOND_SOT');
 ck(c?.method?.parent==='TRAMA'&&c?.method?.profile==='TRAMA-RECONCILE'&&c?.method?.canonicalFamilies===24,'METHOD');
 const campaigns=c?.campaigns||[];ck(campaigns.length===8&&campaigns.every(x=>x.failureFamilies===8),'CAMPAIGNS');
 ck((c?.sourcePrecedence||[]).length===5&&c.sourcePrecedence[0]==='live-git-exact-head','SOURCE_PRECEDENCE');
 ck(JSON.stringify(c?.stateVocabulary?.conditional)==='["todo","in-progress","done","not-required"]','CONDITIONAL_STATES');
 ck(JSON.stringify(c?.stateVocabulary?.serial)==='["eligible","done","blocked"]','SERIAL_STATES');
 const gp=c?.genericContinuationProtocol||{};ck(gp.mode==='GLOBAL_ACT'&&gp.horizons?.join('|')==='LOCAL|INTERMEDIATE|GLOBAL','GENERIC_PROTOCOL');
 ck((gp.output||[]).includes('exactly-one-next-action-or-stop'),'GENERIC_OUTPUT');
 const legacy=c?.legacy||{},classes=legacy.classes||[],rules=legacy.rules||[];
 ck(legacy.censusSource==='git-ls-files','LEGACY_CENSUS_SOURCE');
 ck(classes.length===6&&new Set(classes).size===6&&classes.includes('blocking-unclassified'),'LEGACY_CLASSES');
 ck(rules.length>=20&&rules.every(x=>x.pattern&&classes.includes(x.classification)&&typeof x.blocking==='boolean'),'LEGACY_RULES');
 ck((legacy.contentSites||[]).length>=6&&legacy.contentSites.every(x=>x.path&&x.token&&classes.includes(x.classification)),'LEGACY_CONTENT');
 ck((c?.reconciliationRules||[]).length===8,'RECON_RULES');
 const cp=c?.criticalPathPolicy||{};ck(cp.oneNextAction===true&&cp.next==='C2-DELIVERY-PROVENANCE','CRITICAL_PATH');
 ck(JSON.stringify(cp.reconciledPath)==='["C2-DELIVERY-PROVENANCE","C1-COMPAT-CONTRACTION","C3-CAPACITY-CONTRACT","C4-AI-EVAL-DRIFT"]','CRITICAL_PATH_ORDER');
 for(const level of ['global','intermediate','local'])ck((c?.dod?.[level]||[]).length>=12,'DOD_'+level.toUpperCase());
 const receipt=c?.localModelReceipt||{};ck(receipt.cases===3000000&&receipt.campaigns===8&&receipt.rootFailureFamilies===64&&receipt.rootPairs===2016&&receipt.survivors===0&&receipt.deletionKilled===64&&receipt.noNoveltyTail===100000&&receipt.novelFamilies===0,'MODEL_RECEIPT');
 return f;
}

function trackedRepositoryFiles(root){
 const git=spawnSync('git',['-C',root,'ls-files','-z'],{encoding:'utf8',maxBuffer:64*1024*1024});
 if(git.status!==0||git.error)throw Object.assign(new Error('TRAMA reconciliation requires a Git worktree to census repository legacy'),{code:'TRAMA_GIT_CENSUS_UNAVAILABLE',detail:git.error?.message||git.stderr||''});
 return git.stdout.split('\0').filter(Boolean).map(x=>x.replaceAll('\\','/'));
}


export function legacyCensus(root=DEFAULT_ROOT,contract=loadReconcileContract(root)){
 const legacy=contract.legacy,candidate=new RegExp(legacy.candidatePathRegex,'i'),rules=legacy.rules.map(row=>({...row,re:new RegExp(row.pattern,'i')}));
 const files=trackedRepositoryFiles(root);
 const candidates=files.filter(file=>candidate.test(file)||rules.some(rule=>rule.re.test(file)));
 const pathRows=candidates.map(file=>{
  const rule=rules.find(item=>item.re.test(file));
  return Object.freeze({kind:'path',path:file,classification:rule?.classification||legacy.unknownClass,blocking:rule?.blocking??true,target:rule?.target||null,reason:rule?.reason||null});
 });
 const contentRows=(legacy.contentSites||[]).map(site=>{
  const present=existsSync(path.join(root,site.path));
  const contains=present&&text(root,site.path).includes(site.token);
  return Object.freeze({kind:'content',path:site.path,token:site.token,present,contains,classification:site.classification,blocking:Boolean(site.blocking),target:site.target||null});
 });
 return Object.freeze({
  pathRows,
  contentRows,
  unknown:pathRows.filter(x=>x.classification===legacy.unknownClass),
  blocking:[...pathRows.filter(x=>x.blocking),...contentRows.filter(x=>x.blocking&&x.contains)],
  counts:Object.freeze(Object.fromEntries(legacy.classes.map(k=>[k,pathRows.filter(x=>x.classification===k).length]))),
  censusSource:'git-ls-files',
  contentMissing:contentRows.filter(x=>!x.present||!x.contains)
 });
}

function finding(map,id){return map.find(x=>x.id===id)||null;}
export function deriveExpectedReconciliation(root=DEFAULT_ROOT,contract=loadReconcileContract(root)){
 const remediation=json(root,'audit/remediation-registry.json').findings||[];
 const semantic=json(root,'v3/semantic-owner-contract.json');
 const registry=text(root,'v3/current-gate-registry.mjs');
 const legacy=legacyCensus(root,contract);
 const drsc=semantic?.repositoryCoherenceDebt?.findings||[];
 const f7=finding(drsc,'F7'),f06=finding(remediation,'F-06'),f13=finding(remediation,'F-13'),f15=finding(remediation,'F-15');
 const c5Ready=Array.isArray(semantic?.surfaceOwners)&&semantic.surfaceOwners.length===13&&
  ['v3/c5-semantic-owner-check.mjs','v3/c5-semantic-owner-saturation.mjs','v3/c5-needs-audit-saturation.mjs'].every(g=>registry.includes("'"+g+"'"));
 const uiuxRequired=['v3/capability-closure-e2-check.mjs','v3/capability-closure-e2-saturation.mjs','v3/uiux-converge-0-check.mjs','v3/uiux-runtime-contraction-check.mjs','v3/uiux-ontoepistemic-convergence-3-check.mjs','v3/uiux-ontoepistemic-convergence-3-saturation-10m.mjs'];
 const uiuxReady=uiuxRequired.every(g=>registry.includes("'"+g+"'"));
 const c3Evidence=existsSync(path.join(root,'v3/c3-enterprise-runtime-closure.json'))&&existsSync(path.join(root,'v3/c3-enterprise-bench-dod-check.mjs'));
 const c1Blocked=!terminal(f7?.status)||legacy.blocking.length>0;
 const conditionals={
  'C1-COMPAT-CONTRACTION':c1Blocked?'todo':'done',
  'C2-DELIVERY-PROVENANCE':terminal(f06?.status)?'done':f06?'in-progress':'todo',
  'C3-CAPACITY-CONTRACT':terminal(f13?.status)?(c3Evidence?'done':'todo'):(c3Evidence?'in-progress':'todo'),
  'C4-AI-EVAL-DRIFT':terminal(f15?.status)?'done':f15?'in-progress':'todo',
  'C5-SEMANTIC-OWNER-COMPRESSION':c5Ready?'done':'todo'
 };
 const serial={
  'UIUX-CONVERGE-0':uiuxReady&&conditionals['C5-SEMANTIC-OWNER-COMPRESSION']==='done'?'done':'eligible',
  'S4-A6-CLOSE':'blocked',
  'S5-CANDIDATE-SEAL':'blocked'
 };
 const pathOrder=(contract.criticalPathPolicy?.reconciledPath||[]).filter(id=>!terminal(conditionals[id]));
 const nextConditional=pathOrder[0]||null;
 return Object.freeze({
  schema:'ictc-trama-reconcile-expected/v1',
  conditionals:Object.freeze(conditionals),
  serial:Object.freeze(serial),
  planning:Object.freeze({
   completedThrough:serial['UIUX-CONVERGE-0']==='done'?'UIUX-CONVERGE-0':'DECIDE-0',
   nextSerialSlice:serial['UIUX-CONVERGE-0']==='done'?'S4-A6-CLOSE':'UIUX-CONVERGE-0',
   nextSerialState:serial['UIUX-CONVERGE-0']==='done'?'blocked':'eligible',
   nextConditionalSlice:nextConditional,
   criticalPath:pathOrder
  }),
  evidence:Object.freeze({c5Ready,uiuxReady,c3Evidence,f7:f7?.status||null,f06:f06?.status||null,f13:f13?.status||null,f15:f15?.status||null}),
  legacy,
  externalRails:['E3-HUMAN','E3-GOV','E4-DEPLOY'],
  claimBoundary:'Expected repository planning only. External rails remain separate and cannot be closed by this reducer.'
 });
}

export function reconcileAuthority(root=DEFAULT_ROOT,authority=json(root,'docs/convergence/convergence-authority.json'),contract=loadReconcileContract(root)){
 const expected=deriveExpectedReconciliation(root,contract),debt=[];
 const conditionalMap=Object.fromEntries((authority.conditionalSlices||[]).map(x=>[x.id,x.state]));
 for(const [id,state] of Object.entries(expected.conditionals))if(conditionalMap[id]!==state)debt.push({id:'COND:'+id,expected:state,observed:conditionalMap[id]??null});
 const serialMap=Object.fromEntries((authority.serialChain||[]).map(x=>[x.id,x.state]));
 for(const [id,state] of Object.entries(expected.serial))if(serialMap[id]!==state)debt.push({id:'SERIAL:'+id,expected:state,observed:serialMap[id]??null});
 for(const key of ['completedThrough','nextSerialSlice','nextSerialState','nextConditionalSlice'])if((authority.planningState||{})[key]!==expected.planning[key])debt.push({id:'PLAN:'+key,expected:expected.planning[key],observed:(authority.planningState||{})[key]??null});
 if(expected.legacy.unknown.length)debt.push({id:'LEGACY:UNCLASSIFIED',expected:0,observed:expected.legacy.unknown.length});
 if(expected.legacy.contentMissing.length)debt.push({id:'LEGACY:CONTENT_SITE_DRIFT',expected:0,observed:expected.legacy.contentMissing.length});
 return Object.freeze({schema:'ictc-trama-reconciliation-audit/v1',coherent:debt.length===0,debt,expected,authorityRevision:authority.governanceRevision||null,projectionIsSot:false});
}

export function isGenericContinuationIntent(value,contract=loadReconcileContract()){
 const n=norm(value);
 if(!n)return false;
 return (contract.genericContinuationProtocol?.phrases||[]).some(phrase=>norm(phrase)===n);
}

export function interactionMode(value,contract=loadReconcileContract()){
 return isGenericContinuationIntent(value,contract)?'GLOBAL_ACT':'INTENT_SCOPED';
}

export function nextGovernedAction(root=DEFAULT_ROOT){
 const c=loadReconcileContract(root),audit=reconcileAuthority(root,undefined,c);
 if(!audit.coherent)return Object.freeze({state:'RECONCILE_FIRST',slice:'GOV-TRAMA-RECONCILE-1',why:'Observed repository evidence and durable convergence planning disagree.',debt:audit.debt});
 const next=audit.expected.planning.nextConditionalSlice;
 if(next)return Object.freeze({state:'READY_TO_PLAN',slice:next,why:c.criticalPathPolicy.nextWhy,criticalPath:audit.expected.planning.criticalPath});
 return Object.freeze({state:'STOP_OR_PARENT_SEAL',slice:'S4-A6-CLOSE',why:'All applicable conditional slices are terminal; evaluate the parent seal without skipping its own DoD.'});
}
