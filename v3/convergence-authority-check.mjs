import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {validateUiuxScope} from './uiux-scope-check.mjs';
import {collectRuntimeObservation,loadScope0,validateScope0} from './scope-0-check.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const MAIN='3307a3b02e331f15d2b00f66b6fb41e709b090c6';
const TRUTH='255cb9363efd10b46c8ccb3c323427b8e222199a';
const GOV='5d129a49d0d7907847ff59a3c5fa7d85edb8b66a';
const RUN='f766fc064b0f8552f4821776755d72b56b757205';
const A='docs/convergence/convergence-authority.json';
const W='docs/convergence/ICTC_CONVERGENCE_AUTHORITY_ACTIVE.xlsx';
const U='v3/uiux-scope-model.json';
const M='v3/scope-0-model.json';
const R='artifacts/convergence-authority-receipt.json';
const S='artifacts/convergence-authority-saturation.json';
const CHAIN=['GOV-WB4','TRUTH-0','SCOPE-0','REALITY-0','DECIDE-0','UIUX-CONVERGE-0','S4-A6-CLOSE','S5-CANDIDATE-SEAL'];
const STATES=['done','done','candidate','blocked','blocked','blocked','blocked','blocked'];
const CS=[
 ['C1-COMPAT-CONTRACTION','DECIDE-0','GAP-020'],
 ['C2-DELIVERY-PROVENANCE','TRUTH-0','F-06'],
 ['C3-CAPACITY-CONTRACT','DECIDE-0','F-13'],
 ['C4-AI-EVAL-DRIFT','DECIDE-0','F-15'],
 ['C5-SEMANTIC-OWNER-COMPRESSION','TRUTH-0','GAP-020']
];
const WU=['UXW-01-COMMON-SHELL-AND-MOUNT-COMPRESSION','UXW-02-HOME','UXW-03-PROCESS-HUB','UXW-04-RN-01','UXW-05-EC-01','UXW-06-AO-01','UXW-07-MC-01','UXW-08-AP-01','UXW-09-RC-01','UXW-10-AR-01','UXW-11-ADMIN','UXW-12-EPISTEMIC','UXW-13-PROOF','UXW-14-CROSS-SURFACE-FALSIFICATION'];
const SCOPE_IDS=Array.from({length:13},(_,i)=>`SCOPE-${String(i+1).padStart(2,'0')}`);
const SOT=['SOT-GIT','SOT-PRODUCT','SOT-TARGET-SCOPE','SOT-ARCH','SOT-RUNTIME','SOT-CAPABILITY','SOT-GAPS','SOT-REMEDIATION','SOT-CONVERGENCE','SOT-EXTERNAL'];
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');

export const binding=a=>({
  schemaVersion:a.schemaVersion,
  governanceRevision:a.governanceRevision,
  authorityPath:A,
  projectionVersion:a.projection?.version,
  baseMainSha:a.baseAnchor?.mainSha,
  baseMergedPr:a.baseAnchor?.mergedPr,
  currentSlice:a.currentExecution?.currentSlice,
  nextAfterMerge:a.currentExecution?.nextAfterMerge,
  serialChain:a.serialChain?.map(x=>({id:x.id,state:x.state})),
  conditionalSlices:a.conditionalSlices?.map(x=>({id:x.id,eligibleAfter:x.eligibleAfter,mustResolveBefore:x.mustResolveBefore,debtRefs:x.debtRefs})),
  scopeProgram:{id:a.scopeProgram?.id,modelPath:a.scopeProgram?.modelPath,dimensionCount:a.scopeProgram?.dimensionCount,semanticFieldCount:a.scopeProgram?.semanticFieldCount,realityHandoff:a.scopeProgram?.realityHandoff},
  scopeDimensions:a.scopeDimensions?.map(x=>({id:x.id,state:x.state})),
  experienceProgram:{planningSlice:a.experienceProgram?.planningSlice,planningState:a.experienceProgram?.planningState,implementationBarrier:a.experienceProgram?.implementationBarrier?.id,workUnits:a.experienceProgram?.implementationBarrier?.workUnits},
  sotIds:a.sourceOfTruth?.map(x=>x.id),
  externalRailIds:a.externalRails?.map(x=>x.id),
  receiptPath:a.receipt?.path
});

function wbxml(p){
  const n=spawnSync('unzip',['-Z1',p],{encoding:'utf8'});if(n.status)throw Error('unzip-list');
  let text='';for(const x of n.stdout.split(/\r?\n/).filter(x=>x.startsWith('xl/')&&x.endsWith('.xml'))){const r=spawnSync('unzip',['-p',p,x],{encoding:'utf8',maxBuffer:32e6});if(!r.status)text+=r.stdout;}
  const r=spawnSync('unzip',['-p',p,'xl/workbook.xml'],{encoding:'utf8'});if(r.status)throw Error('unzip-workbook');
  return{text,sheets:[...r.stdout.matchAll(/<(?:\w+:)?sheet\b[^>]*\bname="([^"]+)"/g)].map(x=>x[1])};
}

export function validateAuthority(a,x={}){
  const f=[];const ck=(v,c,d='')=>{if(!v)f.push({code:c,detail:d});};
  ck(a?.schemaVersion==='2.3.0','SCHEMA');
  ck(a?.governanceRevision==='GOV-WB4','GOV');
  ck(a?.baseAnchor?.mainSha===MAIN&&a?.baseAnchor?.mergedPr===138,'BASE');
  ck(a?.observedContext?.latestMergedPr?.number===138&&a?.observedContext?.latestMergedPr?.mergeSha===MAIN,'OBS_TRUTH');
  ck(a?.observedContext?.latestRuntimePr?.number===135&&a?.observedContext?.latestRuntimePr?.mergeSha===RUN,'OBS_RUNTIME');
  ck(a?.observedContext?.branchProtection?.protected===false,'BRANCH_BOUNDARY');
  const c=a?.currentExecution||{};ck(c.trajectoryImpact==='planned'&&c.currentSlice==='SCOPE-0'&&c.stateOnPullRequest==='candidate'&&c.nextAfterMerge==='REALITY-0'&&c.parentS4A6RemainsOpen===true,'CURRENT');
  const ch=a?.serialChain||[];ck(eq(ch.map(z=>z.id),CHAIN),'CHAIN');ch.forEach((z,i)=>{ck(z.order===i+1&&z.dependsOn===(i?CHAIN[i-1]:null)&&z.state===STATES[i],'CHAIN_NODE',z.id);ck(String(z.purpose||'').length>35&&String(z.userEffect||'').length>35,'CHAIN_NARRATIVE',z.id);});
  const cs=a?.conditionalSlices||[];ck(eq(cs.map(z=>z.id),CS.map(z=>z[0])),'CS_IDS');CS.forEach(([id,e,d])=>{const z=cs.find(q=>q.id===id);ck(z?.state==='todo'&&z?.executionMode==='conditional'&&z?.eligibleAfter===e&&z?.mustResolveBefore==='S4-A6-CLOSE'&&eq(z?.debtRefs,[d]),'CS',id);});
  ck((a?.conditionalResolutionPolicy?.rule||'').includes('C5')&&(a?.conditionalResolutionPolicy?.rule||'').includes('UIUX-CONVERGE-0'),'C5_POLICY');
  const ep=a?.experienceProgram||{};ck(ep.planningSlice==='UIUX-SCOPE-0'&&ep.planningState==='done-observed-as-PR-138','UX_HISTORY');ck(ep.observedSurfaceCount===13&&ep.observedDirectInstallerCount===45&&ep.constitutionalParticipantCount===5,'UX_CENSUS');ck(ep.implementationBarrier?.id==='UIUX-CONVERGE-0'&&ep.implementationBarrier?.dependsOn==='DECIDE-0'&&eq(ep.implementationBarrier?.workUnits,WU),'UX_BARRIER');ck((ep.implementationBarrier?.ownerCompressionGate||'').includes('C5-SEMANTIC-OWNER-COMPRESSION'),'UX_C5');
  const sp=a?.scopeProgram||{};ck(sp.id==='SCOPE-0'&&sp.classification==='repository-target-operating-model-contract'&&sp.modelPath===M&&sp.checkerPath==='v3/scope-0-check.mjs'&&sp.saturationPath==='v3/scope-0-saturation.mjs','SCOPE_PROGRAM');ck(sp.observedMainSha===MAIN&&sp.dimensionCount===13&&sp.targetFieldCount===127&&sp.runtimeObservedFieldCount===44&&sp.semanticFieldCount===171&&sp.realityHandoff==='REALITY-0','SCOPE_COUNTS');
  ck(sp.mutationEvidence?.trials===1000000&&sp.mutationEvidence?.materialFamilies===171&&sp.mutationEvidence?.materialKilled===171&&sp.mutationEvidence?.totalAppliedMutations===2499816&&sp.mutationEvidence?.runtimeObservationMutations===643803&&sp.mutationEvidence?.survivors===0&&sp.mutationEvidence?.harnessErrors===0,'SCOPE_MUTATION_DECLARATION');
  const dims=a?.scopeDimensions||[];ck(eq(dims.map(z=>z.id),SCOPE_IDS)&&dims.every(z=>z.state==='defined-target'&&z.ownerSlice==='SCOPE-0'&&z.modelPath===M&&z.claimClass==='target-not-as-is-proof'&&String(z.decision||'').length>40),'SCOPE_DIMENSIONS');
  ck(eq(a?.sourceOfTruth?.map(z=>z.id),SOT)&&a.sourceOfTruth.every(z=>String(z.topic||'').length>5&&String(z.authority||'').length>3&&String(z.rule||'').length>20),'SOT_LOSSLESS');
  const debt=Object.fromEntries((a?.internalDebt||[]).map(z=>[z.id,z]));ck(debt['TRUTH-POST135']?.status==='resolved'&&debt['UIUX-SCOPE-POST137']?.status==='resolved'&&debt['SCOPE-TARGET-REALITY-DEBT']?.status==='open'&&debt['UIUX-STRUCTURAL-COMPRESSION']?.status==='open'&&debt['GAP-020']?.status==='open'&&debt['GAP-021']?.status==='open','DEBT');
  const rails=a?.externalRails||[];ck(eq(rails.map(z=>z.id),['E3-HUMAN','E3-GOV','E4-DEPLOY'])&&rails.every(z=>z.state==='external'&&Array.isArray(z.items)&&z.items.length>0),'RAILS');ck(rails.find(z=>z.id==='E3-GOV')?.items?.length>=2&&rails.find(z=>z.id==='E4-DEPLOY')?.items?.length>=5,'RAIL_DETAIL');
  ck(a?.reconciliations?.every(z=>z.kind==='reconciliation'&&z.historyPreserved===true&&String(z.reconciledSubSlice||'').length>2),'RECON_LINEAGE');ck(a?.reconciliations?.some(z=>z.id==='REC-UIUX-SCOPE-0-MAIN'&&z.mergedPr===138&&z.mergeSha===MAIN),'REC_UIUX');ck(a?.reconciliations?.some(z=>z.id==='REC-TRUTH-0-MAIN'&&z.mergeSha===TRUTH),'REC_TRUTH');ck(a?.reconciliations?.some(z=>z.id==='REC-GOV-WB4-MAIN'&&z.mergeSha===GOV),'REC_GOV');ck(a?.reconciliations?.some(z=>z.id==='REC-A6-UX4-MAIN'&&z.mergeSha===RUN),'REC_RUN');
  ck(a?.s5Seal?.enterpriseCandidate===false&&a?.s5Seal?.enterpriseReady===false,'NO_PROMOTION');
  ck(a?.projection?.path===W&&a?.projection?.version==='SCOPE-0'&&a?.projection?.bindingSheet==='BINDING','PROJ');
  const bs=sha(Buffer.from(JSON.stringify(binding(a))));ck(a?.projection?.bindingSha256===bs,'BIND_SHA',`${a?.projection?.bindingSha256} != ${bs}`);
  if(x.workbookSha)ck(a.projection.sha256===x.workbookSha,'WB_SHA');
  if(x.sheets)ck(eq(x.sheets,['ROADMAP','SCOPE','AUTHORITY','BINDING']),'WB_SHEETS',JSON.stringify(x.sheets));
  if(x.text)for(const t of [bs,'SCOPE-0','REALITY-0','UIUX-CONVERGE-0',...SCOPE_IDS,...WU])ck(x.text.includes(t),'WB_TOKEN',t);
  if(x.uiux){const u=validateUiuxScope(x.uiux);ck(!u.length&&x.uiux.observedMainSha===TRUTH&&eq(x.uiux.trajectoryDecision?.serialChainTarget,CHAIN),'UX_MODEL',JSON.stringify(u));}
  if(x.scope){const sf=validateScope0(x.scope,x.scopeObservation);ck(!sf.length&&x.scope.observedMainSha===MAIN&&x.scope.nextAfterMerge==='REALITY-0','SCOPE_MODEL',JSON.stringify(sf));}
  if(x.cap){ck(x.cap.latestReconciliation?.mainSha===GOV&&x.cap.latestRuntimeMain?.mainSha===RUN&&x.cap.s4Progress?.nextConvergenceSlice==='SCOPE-0'&&x.cap.releaseClaim?.enterpriseReady===false,'CAP_X');}
  if(x.gaps){const o=x.gaps.gaps.filter(z=>z.status==='open');ck(o.length===7&&o.find(z=>z.id==='GAP-020')?.targetSlice==='S4-A6-CLOSE'&&o.find(z=>z.id==='GAP-022')?.targetSlice==='E3-GOV','GAP_X');if(x.pub)ck(eq(x.pub.gaps,o),'PUB_X');}
  const cb=String(a?.claimBoundary||'');ck(cb.includes('changes no business write authority')&&cb.includes('hypotheses for REALITY-0/C3')&&cb.includes('E3-HUMAN')&&cb.includes('E3-GOV')&&cb.includes('E4-DEPLOY')&&cb.includes('no enterprise-ready'),'BOUNDARY');
  return f;
}

function load(root,rel){return JSON.parse(readFileSync(path.join(root,rel),'utf8'));}
function run(root=ROOT){
  const a=load(root,A),uiux=load(root,U),scope=loadScope0(path.join(root,M)),scopeBytes=readFileSync(path.join(root,M)),scopeObservation=collectRuntimeObservation(root),p=path.join(root,W),bytes=readFileSync(p),w=wbxml(p),ctx={uiux,scope,scopeBytes,scopeObservation,cap:load(root,'v3/capability-truth.json'),gaps:load(root,'v3/gaps.json'),pub:load(root,'v3/public/gap-registry.json'),workbookSha:sha(bytes),...w};
  const failures=validateAuthority(a,ctx);
  const sat=spawnSync(process.execPath,[path.join(root,'v3/scope-0-saturation.mjs'),path.join(root,M),root],{encoding:'utf8',maxBuffer:32e6,timeout:120000});let s={ok:false};try{s=JSON.parse(sat.stdout||'{}');}catch{}
  if(sat.status||sat.signal||!s.ok||s.trials!==1000000||s.semanticFields!==171||s.runtimeObservedFields!==44||s.materialKilled!==171||s.totalAppliedMutations!==2499816||s.abstractionCounts?.['runtime-observation']!==643803||s.survivors||s.harnessErrors)failures.push({code:'SCOPE_SATURATION',detail:(sat.stderr||'').slice(-1000)});
  const uxSat=spawnSync(process.execPath,[path.join(root,'v3/uiux-scope-saturation.mjs'),path.join(root,U)],{encoding:'utf8',maxBuffer:16e6,timeout:120000});let u={ok:false};try{u=JSON.parse(uxSat.stdout||'{}');}catch{}
  if(uxSat.status||uxSat.signal||!u.ok||u.trials!==1000000||u.survivors||u.harnessErrors)failures.push({code:'UIUX_SATURATION'});
  const mutants=[
    x=>x.currentExecution.currentSlice='REALITY-0',
    x=>x.scopeDimensions[0].state='undefined',
    x=>x.internalDebt.find(d=>d.id==='SCOPE-TARGET-REALITY-DEBT').status='resolved',
    x=>x.s5Seal.enterpriseCandidate=true,
    x=>x.serialChain.splice(5,1),
    x=>x.conditionalResolutionPolicy.rule='C5 may remain open while UIUX convergence is done'
  ];
  let killed=0;for(const m of mutants){const q=structuredClone(a);m(q);if(validateAuthority(q,ctx).length)killed++;}assert.equal(killed,mutants.length);
  mkdirSync(path.join(root,'artifacts'),{recursive:true});
  writeFileSync(path.join(root,R),JSON.stringify({schemaVersion:'2.3.0',projectionVersion:a.projection.version,baseMainSha:a.baseAnchor.mainSha,workbookSha256:ctx.workbookSha,bindingSha256:a.projection.bindingSha256,bindingSheet:'BINDING',selfTests:killed,scopeSaturation:{trials:s.trials,semanticFields:s.semanticFields,runtimeObservedFields:s.runtimeObservedFields,materialKilled:s.materialKilled,totalAppliedMutations:s.totalAppliedMutations,runtimeObservationMutations:s.abstractionCounts?.['runtime-observation'],survivors:s.survivors,harnessErrors:s.harnessErrors},ok:!failures.length,claimBoundary:'Repository-local SCOPE/convergence receipt only; no external assurance.'},null,2)+'\n');
  writeFileSync(path.join(root,S),JSON.stringify(s,null,2)+'\n');
  return{ok:!failures.length,failures,selfTests:killed,workbookSha256:ctx.workbookSha,workbookSheets:w.sheets,scopeSaturation:s,uiuxSaturation:{ok:u.ok,trials:u.trials,families:u.families,survivors:u.survivors,harnessErrors:u.harnessErrors}};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){const r=run(path.resolve(process.argv[2]||ROOT));console.log(JSON.stringify(r,null,2));if(!r.ok)process.exit(1);}
