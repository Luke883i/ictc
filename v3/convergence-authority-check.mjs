import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import process from 'node:process';
import {loadDecide0,validateDecide0,WORK_UNITS as DECIDE_WORK_UNITS} from './decide-0-check.mjs';
import {validateTrajectory} from './trajectory-1-141-check.mjs';
import {deriveExpectedReconciliation,reconcileAuthority} from './trama-reconcile.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'..');
const BASELINE_MAIN='122b18e8bb672774a0380492eb27580c255f9458';
const RECON_MAIN='a261ac1eda47dec254d824b373b5706f54483d0b';
const A='docs/convergence/convergence-authority.json',W='docs/convergence/ICTC_CONVERGENCE_AUTHORITY_ACTIVE.xlsx';
const CHAIN=['GOV-WB4','TRUTH-0','SCOPE-0','REALITY-0','DECIDE-0','UIUX-CONVERGE-0','S4-A6-CLOSE','S5-CANDIDATE-SEAL'];
const STATES=['done','done','done','done','done','done','blocked','blocked'];
const CS=['C1-COMPAT-CONTRACTION','C2-DELIVERY-PROVENANCE','C3-CAPACITY-CONTRACT','C4-AI-EVAL-DRIFT','C5-SEMANTIC-OWNER-COMPRESSION'];
const CS_STATES=['todo','in-progress','in-progress','in-progress','done'];
const HISTORY_RECONCILIATIONS=[['REC-A6-UX2-MAIN',132,'A6-UX2'],['REC-A6-UX3-MAIN',134,'A6-UX3'],['REC-A6-UX4-MAIN',135,'A6-UX4'],['REC-GOV-WB4-MAIN',136,'GOV-WB4'],['REC-TRUTH-0-MAIN',137,'TRUTH-0'],['REC-UIUX-SCOPE-0-MAIN',138,'UIUX-SCOPE-0'],['REC-SCOPE-0-MAIN',139,'SCOPE-0'],['REC-REALITY-0-MAIN',140,'REALITY-0']];
const WORK_UNITS=['UXW-01-COMMON-SHELL-AND-MOUNT-COMPRESSION','UXW-02-HOME','UXW-03-PROCESS-HUB','UXW-04-RN-01','UXW-05-EC-01','UXW-06-AO-01','UXW-07-MC-01','UXW-08-AP-01','UXW-09-RC-01','UXW-10-AR-01','UXW-11-ADMIN','UXW-12-EPISTEMIC','UXW-13-PROOF','UXW-14-CROSS-SURFACE-FALSIFICATION'];
const DECIDE_DIGEST='74190cb8e1053515cf763a2db73af6ef3777c9fa68db134295cfa71388fe99b2';
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),sha=b=>crypto.createHash('sha256').update(b).digest('hex'),load=(r,p)=>JSON.parse(readFileSync(path.join(r,p),'utf8'));

function bindingSha(a,p){
 return sha(Buffer.from([
  a.schemaVersion,a.governanceRevision,a.baselineObservation.mainSha,String(a.baselineObservation.mergedPr),
  a.planningState.completedThrough,a.planningState.nextSerialSlice,
  a.trajectoryAudit.governanceVerdict,a.trajectoryAudit.bridgeDecision,p.status
 ].join('|')));
}
function wbxml(p){
 const n=spawnSync('unzip',['-Z1',p],{encoding:'utf8'});
 if(n.status)throw Error('unzip-list');
 let text='';
 for(const f of n.stdout.split(/\r?\n/).filter(x=>x.startsWith('xl/')&&x.endsWith('.xml'))){
  const r=spawnSync('unzip',['-p',p,f],{encoding:'utf8',maxBuffer:32e6});
  if(!r.status)text+=r.stdout;
 }
 const r=spawnSync('unzip',['-p',p,'xl/workbook.xml'],{encoding:'utf8'});
 return {text,sheets:[...r.stdout.matchAll(/<(?:\w+:)?sheet\b[^>]*\bname="([^"]+)"/g)].map(x=>x[1])};
}

export function validateAuthority(a,ctx){
 const f=[],ck=(v,c,d='')=>{if(!v)f.push({code:c,detail:d});};
 ck(a?.schemaVersion==='3.0.0'&&a?.governanceRevision==='GOV-WB6'&&a?.classification==='repository-convergence-planning-authority','SCHEMA');
 const ss=a?.stateSemantics||{};
 ck(ss.gitOwnsLiveFacts===true&&ss.committedRefsAreObservations===true&&ss.planningIsDependencyDerived===true&&ss.postMergeReconciliationRequired===true,'STATE_SEMANTICS');
 ck((ss.forbiddenLiveFields||[]).includes('currentExecution'),'FORBIDDEN_LIVE_FIELDS');
 ck(!('currentExecution' in a)&&!('observedContext' in a),'NO_LIVE_SHADOW');
 ck(a?.baselineObservation?.mainSha===BASELINE_MAIN&&a?.baselineObservation?.mergedPr===141&&String(a?.baselineObservation?.meaning).includes('not a live pointer'),'BASELINE');
 ck(a?.reconciliationObservation?.mainSha===RECON_MAIN&&a?.reconciliationObservation?.mergedPr===183&&String(a?.reconciliationObservation?.meaning).includes('not a live pointer'),'RECON_OBSERVATION');

 const p=a?.planningState||{};
 ck(p.completedThrough==='UIUX-CONVERGE-0'&&p.nextSerialSlice==='S4-A6-CLOSE'&&p.nextSerialState==='blocked'&&p.nextConditionalSlice==='C2-DELIVERY-PROVENANCE'&&p.parentS4A6RemainsOpen===true&&p.noNewSerialBridge===true,'PLAN');
 ck(eq(p.criticalPath,['C2-DELIVERY-PROVENANCE','C1-COMPAT-CONTRACTION','C3-CAPACITY-CONTRACT','C4-AI-EVAL-DRIFT']),'CRITICAL_PATH');

 ck(eq(a?.serialChain?.map(x=>x.id),CHAIN)&&eq(a?.serialChain?.map(x=>x.state),STATES),'CHAIN');
 ck(a?.serialChain?.every((x,i)=>x.order===i+1&&x.dependsOn===(i?CHAIN[i-1]:null)),'CHAIN_DEP');
 const cs=a?.conditionalSlices||[];
 ck(eq(cs.map(x=>x.id),CS)&&eq(cs.map(x=>x.state),CS_STATES),'CS');
 ck(cs.find(x=>x.id==='C5-SEMANTIC-OWNER-COMPRESSION')?.mustResolveBefore==='UIUX-CONVERGE-0+S4-A6-CLOSE','C5_GATE');
 ck(a?.conditionalResolutionPolicy?.notRequiredRequires?.length===3,'NOT_REQUIRED_EVIDENCE');

 const ep=a?.experienceProgram||{},ib=ep.implementationBarrier||{},pe=ep.prototypeEntryContract||{};
 ck(ib.id==='UIUX-CONVERGE-0'&&eq(ib.workUnits,WORK_UNITS)&&eq(WORK_UNITS,DECIDE_WORK_UNITS),'UX_HISTORY');
 ck(pe.path==='v3/uiux-prototype-entry-contract.json'&&pe.status==='READY-TO-CONVERGE-BOUNDED'&&pe.createsNewSerialSlice===false&&pe.humanEvidenceRail==='E3-HUMAN','PROTO_ENTRY');
 ck(a?.trajectoryAudit?.coveredCount===141&&eq(a?.trajectoryAudit?.coveredPrRange,[1,141])&&a?.trajectoryAudit?.governanceVerdict==='INCOHERENT-AS-LIVE-STATE-MODEL'&&a?.trajectoryAudit?.bridgeDecision==='NO-NEW-SERIAL-BRIDGE'&&a?.trajectoryAudit?.mutationTrials===1000000,'TRAJECTORY_HISTORY');
 ck(a?.decideProgram?.mergedPr===141&&a?.decideProgram?.mergeSha===BASELINE_MAIN&&a?.decideProgram?.candidateHead==='39831b46eb2ee8260ab1f2fccbc92a7d9469f1ab','DECIDE_HISTORY');

 ck(a?.sourceOfTruth?.some(x=>x.id==='SOT-GIT'&&String(x.rule).includes('immutable observations')),'SOT_GIT');
 ck(a?.sourceOfTruth?.some(x=>x.id==='SOT-CAPABILITY'&&String(x.rule).includes('never development sequencing')),'SOT_CAP');
 ck(a?.sourceOfTruth?.some(x=>x.id==='SOT-TRAJECTORY'&&String(x.rule).includes('derived audit')),'SOT_AUDIT');

 const debt=Object.fromEntries((a?.internalDebt||[]).map(x=>[x.id,x]));
 ck(debt['GOV-MERGE-TRUTH-LAG']?.status==='resolved'&&debt['UIUX-STRUCTURAL-COMPRESSION']?.status==='resolved-in-reconciliation'&&debt['F-13']?.status==='open'&&debt['GAP-020']?.status==='open'&&debt['GAP-021']?.status==='open','DEBT');
 ck(eq(a?.externalRails?.map(x=>x.id),['E3-HUMAN','E3-GOV','E4-DEPLOY'])&&a.externalRails.every(x=>x.state==='external'),'RAILS');
 ck(a?.s5Seal?.enterpriseCandidate===false&&a?.s5Seal?.enterpriseReady===false,'NO_PROMOTION');

 const rec=a?.reconciliations||[];
 const history=rec.filter(x=>x.historyPreserved===true&&x.finalForPlanState!==true).map(x=>[x.id,x.mergedPr,x.reconciledSubSlice]);
 ck(eq(history,HISTORY_RECONCILIATIONS),'REC_HISTORY');
 const decideObs=rec.find(x=>x.id==='REC-DECIDE-0-MAIN');
 ck(decideObs?.mergedPr===141&&decideObs?.mergeSha===BASELINE_MAIN&&decideObs?.finalForPlanState===false,'REC_DECIDE_HISTORY');
 const finalRecs=rec.filter(x=>x.finalForPlanState===true);
 ck(finalRecs.length===1&&finalRecs[0].id==='REC-GOV-TRAMA-COMPASS-1-MAIN'&&finalRecs[0].mergedPr===183&&finalRecs[0].mergeSha===RECON_MAIN&&finalRecs[0].reconciledSubSlice==='GOV-TRAMA-COMPASS-1','REC_FINAL');

 ck(a?.projection?.version==='GOV-WB6-TRAJECTORY-183'&&String(a?.projection?.integrityRule).includes('never self-references'),'PROJECTION');
 ck(eq(ctx.sheets,['ROADMAP','TRAJECTORY','DECIDE','AUTHORITY','BINDING']),'WB_SHEETS');
 for(const t of ['GOV-WB6',RECON_MAIN,'UIUX-CONVERGE-0','S4-A6-CLOSE','C2-DELIVERY-PROVENANCE','C5-SEMANTIC-OWNER-COMPRESSION','E3-HUMAN','E3-GOV','E4-DEPLOY',ctx.binding])ck(ctx.text.includes(t),'WB_TOKEN',t);
 ck(validateTrajectory(ctx.trajectory,ctx.prototype).length===0,'AUDIT_MODEL');

 const expected=deriveExpectedReconciliation(ctx.root);
 ck(eq(expected.conditionals,Object.fromEntries(CS.map((id,i)=>[id,CS_STATES[i]]))),'RECON_EXPECTED_CONDITIONAL');
 ck(expected.serial['UIUX-CONVERGE-0']==='done'&&expected.planning.nextConditionalSlice==='C2-DELIVERY-PROVENANCE','RECON_EXPECTED_PLAN');
 const audit=reconcileAuthority(ctx.root,a);
 ck(audit.coherent===true,'RECON_COHERENCE',JSON.stringify(audit.debt));

 const cb=String(a?.claimBoundary||'').toLowerCase();
 for(const t of ['c1','c2/c3/c4','gap-020/gap-021','e3-human','e3-gov','e4-deploy','no enterprise-ready','representative-human-usability'])ck(cb.includes(t),'BOUNDARY',t);
 return f;
}

function run(root=ROOT){
 const a=load(root,A),trajectory=load(root,'v3/trajectory-1-141-model.json'),prototype=load(root,'v3/uiux-prototype-entry-contract.json'),capability=load(root,'v3/capability-truth.json'),scope=load(root,'v3/scope-0-model.json'),reality=load(root,'v3/reality-0-model.json'),uiux=load(root,'v3/uiux-scope-model.json'),decide=loadDecide0(path.join(root,'v3/decide-0-model.json')),wb=readFileSync(path.join(root,W)),wx=wbxml(path.join(root,W));
 const ctx={root,trajectory,prototype,workbookSha:sha(wb),binding:bindingSha(a,prototype),...wx};
 const failures=validateAuthority(a,ctx);
 if(capability?.s4Progress?.sequencingAuthority!=='docs/convergence/convergence-authority.json'||capability?.s4Progress?.nextConvergenceSliceSemantics!=='historical-TRUTH-0-baseline-only-not-live-planning'||String(capability?.releaseClaim?.claimBoundary||'').includes('SCOPE-0 is next'))failures.push({code:'CAPABILITY_SEQUENCE_SHADOW',detail:'capability truth must not own live development sequencing'});
 const df=validateDecide0(decide,scope,reality,uiux);
 if(df.length)failures.push({code:'DECIDE_MODEL',detail:JSON.stringify(df)});

 const mutants=[
  x=>x.planningState.nextConditionalSlice='C4-AI-EVAL-DRIFT',
  x=>x.planningState.nextSerialState='eligible',
  x=>x.serialChain.find(y=>y.id==='UIUX-CONVERGE-0').state='eligible',
  x=>x.conditionalSlices.find(y=>y.id==='C5-SEMANTIC-OWNER-COMPRESSION').state='todo',
  x=>x.conditionalSlices.find(y=>y.id==='C2-DELIVERY-PROVENANCE').state='done',
  x=>x.stateSemantics.postMergeReconciliationRequired=false,
  x=>x.reconciliationObservation.mainSha='future',
  x=>x.externalRails=x.externalRails.filter(r=>r.id!=='E3-HUMAN'),
  x=>x.s5Seal.enterpriseCandidate=true,
  x=>x.reconciliations=x.reconciliations.filter(r=>r.id!=='REC-GOV-TRAMA-COMPASS-1-MAIN'),
  x=>x.projection.version='GOV-WB5-TRAJECTORY-141'
 ];
 let killed=0;const survived=[];
 for(let i=0;i<mutants.length;i++){const q=structuredClone(a);mutants[i](q);if(validateAuthority(q,ctx).length)killed++;else survived.push(i);}
 if(killed!==mutants.length)failures.push({code:'SELF_MUTANTS',detail:`${killed}/${mutants.length} survived=${survived.join(',')}`});

 if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
 console.log(JSON.stringify({ok:true,suite:'convergence-authority',schemaVersion:a.schemaVersion,governanceRevision:a.governanceRevision,baselineMainSha:a.baselineObservation.mainSha,reconciliationPreimage:a.reconciliationObservation.mainSha,completedThrough:a.planningState.completedThrough,nextSerialSlice:a.planningState.nextSerialSlice,nextConditionalSlice:a.planningState.nextConditionalSlice,workbookSha256:ctx.workbookSha,bindingSha256:ctx.binding,saturationLeaves:['v3/decide-0-saturation.mjs','v3/trajectory-governance-saturation.mjs'],selfMutants:{killed,total:mutants.length},claimBoundary:a.claimBoundary}));
}
if(import.meta.url===`file://${process.argv[1]}`)run(process.argv[2]?path.resolve(process.argv[2]):ROOT);
