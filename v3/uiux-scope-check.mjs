import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const here=path.dirname(fileURLToPath(import.meta.url));
const DEFAULT=path.join(here,'uiux-scope-model.json');
export const REQUIRED_SURFACES=['home','processes','monitoring','incidents','objects','coverage','actions','risks','assurance','proof','epistemic','admin','ai-settings'];
export const PROCEDURES=['monitoring','incidents','objects','coverage','actions','risks','assurance'];
export const EXPECTED_ROOTS={home:'#homeView',processes:'#processesView',monitoring:'#monitoringView',incidents:'#incidentsView',objects:'#grcWorkspace',coverage:'#grcWorkspace',actions:'#grcWorkspace',risks:'#grcWorkspace',assurance:'#grcWorkspace',proof:'#proofView',epistemic:'#epistemicView',admin:'#adminCenter','ai-settings':'#settingsDialog'};
export const REQUIRED_EPISTEMIC=['observed-not-equal-true','proposed-not-equal-decided','mapping-not-equal-conformity','completed-not-equal-closed-and-verified','evidence-not-equal-conclusion','rating-not-equal-objective-probability','internal-approval-not-equal-independent-assurance','green-ci-not-equal-deployment-assurance','ai-never-human-decision-authority','terminal-negative-states-remain-revealable'];
export const TARGET_CHAIN=['GOV-WB4','TRUTH-0','SCOPE-0','REALITY-0','DECIDE-0','UIUX-CONVERGE-0','S4-A6-CLOSE','S5-CANDIDATE-SEAL'];
const REQUIRED_WORK_UNITS=Array.from({length:14},(_,i)=>`UXW-${String(i+1).padStart(2,'0')}`);
const uniq=a=>new Set(a).size===a.length;

export function validateUiuxScope(m){
  const failures=[];const check=(ok,code,detail='')=>{if(!ok)failures.push({code,detail});};
  check(m?.schemaVersion==='1.0.0','SCHEMA');
  check(m?.modelId==='UIUX-SCOPE-0','MODEL_ID');
  check(m?.classification==='repository-uiux-scope-and-rationalization-contract','CLASSIFICATION');
  check(m?.evidenceGrade==='E2-repository-source-and-deterministic-model','EVIDENCE_GRADE');
  check(/^[0-9a-f]{40}$/.test(m?.observedMainSha||''),'MAIN_SHA');
  check(/does not prove aesthetic quality/i.test(m?.claimBoundary||''),'AESTHETIC_BOUNDARY');
  const mg=m?.mountGraph||{};
  check(mg.compositionRoot==='v3/public/ui/active-experience.js','ROOT_OWNER');
  check(mg.directInstallerCount===45,'INSTALLER_CENSUS');
  check(mg.constitutionalParticipantCount===5,'CONSTITUTION_CENSUS');
  check(/diagnostic, not a quality KPI/i.test(mg.diagnosticRule||''),'INSTALLER_COUNT_NOT_KPI');

  const surfaces=m?.surfaceInventory||[];const ids=surfaces.map(x=>x.id);
  check(JSON.stringify(ids)===JSON.stringify(REQUIRED_SURFACES),'SURFACE_CENSUS',ids);
  check(uniq(ids),'SURFACE_UNIQUE');
  for(const s of surfaces){
    check(s.root===EXPECTED_ROOTS[s.id],'SURFACE_ROOT',`${s.id}:${s.root}`);
    check(s.identityMax===1,'ONE_IDENTITY',s.id);
    check(s.purposeMax===1,'ONE_PURPOSE',s.id);
    check([0,1].includes(s.primaryActionMax),'PRIMARY_ACTION_BOUND',s.id);
    check(Boolean(s.defaultDensity),'DENSITY_DEFINED',s.id);
  }
  check(surfaces.find(x=>x.id==='processes')?.primaryActionMax===0,'PROCESS_HUB_NO_GLOBAL_PRIMARY');
  for(const p of PROCEDURES)check(surfaces.find(x=>x.id===p)?.ownerClass==='procedure-specific','PROCEDURE_SPECIFIC_OWNER',p);
  for(const p of ['objects','coverage','actions','risks','assurance'])check(surfaces.find(x=>x.id===p)?.root==='#grcWorkspace','GRC_SHARED_ROOT',p);

  const g=m?.commonGrammar||{};
  check(g.repeatedRecordDefault==='row-or-list','LIST_BEFORE_CARDS');
  check(/reserved for a single decision\/narrative object/i.test(g.cardUsePolicy||''),'CARD_EXCEPTION_NARROW');
  check(/never by deleting epistemically material fields/i.test(g.singleRowRule||''),'LOSSLESS_COMPRESSION');
  check(/semantic order remains invariant/i.test(g.responsiveRule||''),'RESPONSIVE_SEMANTIC_ORDER');
  check(/centrally owned/i.test(g.tokenRule||'')&&/may not fork the design system/i.test(g.tokenRule||''),'COMMON_TOKEN_OWNER');
  const mandatory=g.mandatoryVisibleWhenMaterial||[];
  for(const x of ['state','subject','authority-or-owner','next-action','boundary'])check(mandatory.includes(x),'MATERIAL_FIELD',x);
  for(const x of ['basis','version','due-date','provenance'])check((g.conditionallyVisible||[]).includes(x),'CONDITIONAL_FIELD',x);

  const strategy=m?.surfaceStrategy||{};
  for(const id of REQUIRED_SURFACES)check(Array.isArray(strategy[id])&&strategy[id].length>=2,'SURFACE_STRATEGY',id);
  check(strategy['ai-settings']?.some(x=>/advanced AI instructions remain behind disclosure/i.test(x)),'AI_SETTINGS_PROGRESSIVE');
  check(strategy['ai-settings']?.some(x=>/no visual treatment implies AI decision authority/i.test(x)),'AI_SETTINGS_NO_AUTHORITY');
  check(strategy.monitoring?.some(x=>/only page identity/i.test(x)),'RN_NO_DUPLICATE_HERO');
  check(strategy.incidents?.some(x=>/only page identity/i.test(x)),'EC_NO_DUPLICATE_HERO');
  check(strategy.coverage?.some(x=>/never render coverage as conformity score/i.test(x)),'NO_CONFORMITY_SCORE');
  check(strategy.risks?.some(x=>/rating is not status/i.test(x)),'RATING_NOT_STATUS');
  check(strategy.proof?.some(x=>/external evidence boundaries stay explicit/i.test(x)),'PROOF_EXTERNAL_BOUNDARY');

  const epi=m?.epistemicInvariants||[];
  check(JSON.stringify(epi)===JSON.stringify(REQUIRED_EPISTEMIC),'EPISTEMIC_INVARIANTS');
  check(uniq(epi),'EPISTEMIC_UNIQUE');

  const t=m?.trajectoryDecision||{};
  check(JSON.stringify(t.serialChainTarget)===JSON.stringify(TARGET_CHAIN),'TARGET_CHAIN');
  check(/embed UIUX obligations into SCOPE-0\/REALITY-0\/DECIDE-0/i.test(t.strategy||''),'NO_DUPLICATE_DISCOVERY_BARRIERS');
  check(/one post-DECIDE implementation barrier UIUX-CONVERGE-0/i.test(t.strategy||''),'ONE_UIUX_BARRIER');
  check(/C5-SEMANTIC-OWNER-COMPRESSION/.test(t.conditionalRelationship||'')&&/terminal before UIUX-CONVERGE-0/.test(t.conditionalRelationship||''),'C5_OWNER_GATE');
  const units=t.workUnits||[];check(units.length===14&&uniq(units),'WORK_UNIT_COUNT');
  for(const p of REQUIRED_WORK_UNITS)check(units.some(x=>x.startsWith(p)),'WORK_UNIT_MISSING',p);
  const rejected=new Set((t.rejectedAlternatives||[]).map(x=>x.id));
  for(const id of ['three-extra-discovery-barriers','seven-serial-procedure-slices','fold-all-uiux-into-c5','defer-uiux-to-s4-a6-close','redesign-before-scope-and-reality'])check(rejected.has(id),'REJECTED_ALTERNATIVE',id);

  const h=m?.humanEvidenceBoundary||{};
  check(h.rail==='E3-HUMAN','HUMAN_RAIL');
  for(const x of ['perceived pleasantness','representative comprehension','representative task efficiency','assistive-technology usability'])check((h.requiredFor||[]).includes(x),'HUMAN_EVIDENCE_REQUIRED',x);
  check((h.repositoryCanProve||[]).includes('density-contract conformance'),'REPO_DENSITY_E2');
  return failures;
}

export function loadUiuxScope(file=DEFAULT){return JSON.parse(readFileSync(file,'utf8'));}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const model=loadUiuxScope(process.argv[2]||DEFAULT);const failures=validateUiuxScope(model);
  if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
  assert.equal(failures.length,0);console.log(JSON.stringify({ok:true,surfaces:model.surfaceInventory.length,installers:model.mountGraph.directInstallerCount,constitutionalParticipants:model.mountGraph.constitutionalParticipantCount,serialTarget:model.trajectoryDecision.serialChainTarget},null,2));
}
