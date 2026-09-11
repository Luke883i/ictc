import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
export const TARGET_MAIN='508ac901ea9d9ab60dba8438340b7ef9db9c08c7';
export const SCOPE_IDS=Object.freeze(Array.from({length:13},(_,i)=>`SCOPE-${String(i+1).padStart(2,'0')}`));
export const EXPECTED_VERDICTS=Object.freeze(['partial-fit','fit','fit','bounded-fit','unverified-envelope','bounded-fit','partial-fit','bounded-fit','partial-fit','fit','fit','external-dependent','fit']);
export const PROCEDURES=Object.freeze(['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01']);
export const ROLES=Object.freeze(['admin','user','auditor']);
export const OPERATIONS=Object.freeze(['observe','create','propose','review','decide','verify','export','recover']);
export const EVIDENCE=Object.freeze(['absent','declared-reference','version-bound','receipt-bound']);
export const TOPOLOGIES=Object.freeze(['loopback-single','networked-single','bounded-multitenant']);
export const AI=Object.freeze(['off','assistive']);
export const PRESSURES=Object.freeze(['nominal','stale-or-conflict','burst-or-failure']);
export const CASE_COUNT=PROCEDURES.length*ROLES.length*OPERATIONS.length*EVIDENCE.length*TOPOLOGIES.length*AI.length*PRESSURES.length;
const EXPECTED_SUMMARY=Object.freeze({dimensionCount:13,fit:5,boundedFit:3,partialFit:3,unverifiedEnvelope:1,externalDependent:1,contradiction:0,hardStructuralContradictions:0});
const UNIVERSAL_KEYS=Object.freeze(['observedDoesNotBecomeTrue','proposedDoesNotBecomeDecided','mappingDoesNotBecomeConformity','completedDoesNotBecomeClosedVerified','evidenceDoesNotBecomeConclusion','ratingDoesNotBecomeProbability','internalApprovalDoesNotBecomeIndependentAssurance','greenCiDoesNotBecomeDeploymentAssurance','aiHasNoDecisionAuthority','tenantSelectorDoesNotGrantMembership','staleOrFailedWriteDoesNotBecomeVisible','exportRemainsSameAsRead']);

const read=(root,rel)=>readFileSync(path.join(root,rel),'utf8');
const json=(root,rel)=>JSON.parse(read(root,rel));
export function loadReality0(p=path.join(HERE,'reality-0-model.json')){return JSON.parse(readFileSync(p,'utf8'));}

export function collectRealityObservation(root=path.resolve(HERE,'..')){
  const product=json(root,'v3/product-contract.json');
  const arch=read(root,'docs/11_ARCHITECTURE.md');
  const ops=read(root,'docs/OPERATIONS.md');
  const server=read(root,'v3/server.mjs');
  const gates=read(root,'v3/current-gate-registry.mjs');
  const uiux=json(root,'v3/uiux-scope-model.json');
  const authority=read(root,'docs/authority-matrix.yaml');
  const scenario=read(root,'v3/procedure-guidance-scenario-model.mjs');
  return {
    sevenProcedures:(product.services||[]).length===7,
    threeRoles:(product.roles||[]).map(x=>x.id).join('|')==='admin|user|auditor',
    humanLaunchRequired:product.orchestration?.intentRouting?.humanLaunchRequired===true,
    noAiRanking:product.orchestration?.workQueue?.aiRanking===false,
    noSyntheticComplianceScore:product.orchestration?.procedureSummary?.syntheticComplianceScore===false,
    disabledPreservesHistory:(product.procedurePolicy?.disabledBehavior||[]).includes('retain-history-and-evidence'),
    disabledBlocksWrites:(product.procedurePolicy?.disabledBehavior||[]).includes('block-new-writes'),
    auditorReadOnly:!((product.roles||[]).find(x=>x.id==='auditor')?.permissions||[]).some(x=>/manage|edit|submit|close|contribute|configure/.test(x)),
    sqliteAsIs:arch.includes('persistence nativa `node:sqlite`')&&arch.includes('SqliteStatePersistence'),
    storeSerialized:arch.includes('Il `Store` serializza la mutazione'),
    notFullEventStore:arch.includes('ICTC non è oggi un event store completo'),
    noHistoricalTransactionTime:arch.includes('selezione storica transaction-time non è implementata'),
    oneCompositionRoot:arch.includes('`installActiveExperience()` è l\'unico composition root'),
    exportSameAsRead:arch.includes('`same-as-read`')&&server.includes("authorization:'same-as-read'"),
    loopbackDefault:server.includes("const host=process.env.ICTC_HOST||'127.0.0.1';assertSafeRuntimeBinding(host)"),
    tenantAuthority:server.includes('createTenantAuthority')&&server.includes('tenantAuthority.runRequest'),
    aiGovernance:server.includes('configureAiGovernance'),
    abuseBudget:server.includes('createAbuseBudget'),
    multiTenantOptional:ops.includes('ICTC_MULTI_TENANT=1'),
    tenantPhysicalIsolation:ops.includes('database, quarantine e attachment fisicamente distinti'),
    nonLoopbackGuard:ops.includes('Un bind non-loopback è rifiutato'),
    recoveryEncrypted:ops.includes('AES-256-GCM')&&/recovery point cifrati/i.test(ops),
    noApprovedRtoRpo:ops.includes('Non sono RTO/RPO approvati'),
    haNotProven:ops.includes('alta disponibilità')&&ops.includes('Restano **non dimostrati dal repository**'),
    identityNotProven:ops.includes('identità enterprise')&&ops.includes('Restano **non dimostrati dal repository**'),
    scannerNotProven:ops.includes('efficacia dello scanner di produzione')&&ops.includes('Restano **non dimostrati dal repository**'),
    alertingNotProven:ops.includes('alert drill esterno')&&ops.includes('Restano **non dimostrati dal repository**'),
    uiSurfaceCount:(uiux.surfaceInventory||[]).length===13,
    uiInstallerCount:uiux.mountGraph?.directInstallerCount===45,
    uiParticipantCount:uiux.mountGraph?.constitutionalParticipantCount===5,
    rowFirst:uiux.commonGrammar?.repeatedRecordDefault==='row-or-list',
    humanEvidenceRail:uiux.humanEvidenceBoundary?.rail==='E3-HUMAN',
    complianceLeadScenario:scenario.includes('compliance-lead'),
    internalAuditorScenario:scenario.includes('internal-auditor'),
    convergenceNativeGate:gates.includes('v3/convergence-authority-check.mjs'),
    s3ReliabilityNativeGate:gates.includes('v3/s3-runtime-reliability-saturation.mjs'),
    oneRootAuthority:/ui_composition_root:[\s\S]*?authority: v3\/public\/ui\/active-experience\.js[\s\S]*?classification: exclusive/.test(authority),
    noSecondBusinessStore:authority.includes('may not become a second business write authority')
  };
}

export const OBSERVATION_KEYS=Object.freeze(Object.keys(collectRealityObservationFromFixture()));
function collectRealityObservationFromFixture(){return {
  sevenProcedures:true,threeRoles:true,humanLaunchRequired:true,noAiRanking:true,noSyntheticComplianceScore:true,disabledPreservesHistory:true,disabledBlocksWrites:true,auditorReadOnly:true,
  sqliteAsIs:true,storeSerialized:true,notFullEventStore:true,noHistoricalTransactionTime:true,oneCompositionRoot:true,exportSameAsRead:true,loopbackDefault:true,tenantAuthority:true,aiGovernance:true,abuseBudget:true,
  multiTenantOptional:true,tenantPhysicalIsolation:true,nonLoopbackGuard:true,recoveryEncrypted:true,noApprovedRtoRpo:true,haNotProven:true,identityNotProven:true,scannerNotProven:true,alertingNotProven:true,
  uiSurfaceCount:true,uiInstallerCount:true,uiParticipantCount:true,rowFirst:true,humanEvidenceRail:true,complianceLeadScenario:true,internalAuditorScenario:true,convergenceNativeGate:true,s3ReliabilityNativeGate:true,oneRootAuthority:true,noSecondBusinessStore:true
};}

export function *generateUseCases(){let id=0;for(const procedure of PROCEDURES)for(const role of ROLES)for(const operation of OPERATIONS)for(const evidenceState of EVIDENCE)for(const topology of TOPOLOGIES)for(const aiMode of AI)for(const pressure of PRESSURES)yield {id:++id,procedure,role,operation,evidenceState,topology,aiMode,pressure};}

export function expectedCaseSemantics(c){
  const writeLike=['create','propose','decide','verify','recover'].includes(c.operation);
  const decisionLike=['decide','verify'].includes(c.operation);
  const evidenceSufficient=['version-bound','receipt-bound'].includes(c.evidenceState);
  return {
    roleDisposition:c.role==='auditor'&&writeLike?'deny-read-only':c.operation==='recover'&&c.role!=='admin'?'deny-ops-admin':decisionLike&&c.role==='user'?'procedure-policy-dependent':'allowed-by-bounded-role-policy',
    aiDisposition:c.aiMode==='assistive'&&['propose','review'].includes(c.operation)?'assistive-proposal-only':'no-authority-transfer',
    verificationDisposition:c.operation==='verify'&&!evidenceSufficient?'blocked-insufficient-evidence':'not-auto-promoted',
    topologyDisposition:c.topology==='loopback-single'?'repository-bounded':c.topology==='networked-single'?'requires-trusted-header-plus-e4':'tenant-directory-plus-e4-boundary',
    pressureDisposition:c.pressure==='nominal'?'normal':c.pressure==='stale-or-conflict'?'reject-stale-or-fence':'serialize-fail-closed-no-silent-loss',
    observedDoesNotBecomeTrue:true,proposedDoesNotBecomeDecided:true,mappingDoesNotBecomeConformity:true,completedDoesNotBecomeClosedVerified:true,evidenceDoesNotBecomeConclusion:true,ratingDoesNotBecomeProbability:true,internalApprovalDoesNotBecomeIndependentAssurance:true,greenCiDoesNotBecomeDeploymentAssurance:true,aiHasNoDecisionAuthority:true,tenantSelectorDoesNotGrantMembership:true,staleOrFailedWriteDoesNotBecomeVisible:true,exportRemainsSameAsRead:true
  };
}

export function validateUseCase(c,s=expectedCaseSemantics(c)){
  const f=[];const ck=(v,code)=>{if(!v)f.push(code);};
  ck(PROCEDURES.includes(c.procedure),'CASE_PROCEDURE');ck(ROLES.includes(c.role),'CASE_ROLE');ck(OPERATIONS.includes(c.operation),'CASE_OPERATION');ck(EVIDENCE.includes(c.evidenceState),'CASE_EVIDENCE');ck(TOPOLOGIES.includes(c.topology),'CASE_TOPOLOGY');ck(AI.includes(c.aiMode),'CASE_AI');ck(PRESSURES.includes(c.pressure),'CASE_PRESSURE');
  for(const k of UNIVERSAL_KEYS)ck(s[k]===true,`CASE_${k}`);
  if(c.role==='auditor'&&['create','propose','decide','verify','recover'].includes(c.operation))ck(s.roleDisposition==='deny-read-only','CASE_AUDITOR_WRITE');
  if(c.operation==='recover'&&c.role!=='admin')ck(s.roleDisposition==='deny-ops-admin'||s.roleDisposition==='deny-read-only','CASE_RECOVERY_AUTH');
  if(c.aiMode==='assistive'&&['decide','verify'].includes(c.operation))ck(s.aiDisposition==='no-authority-transfer','CASE_AI_DECISION');
  if(c.operation==='verify'&&['absent','declared-reference'].includes(c.evidenceState))ck(s.verificationDisposition==='blocked-insufficient-evidence','CASE_VERIFY_EVIDENCE');
  if(c.topology!=='loopback-single')ck(s.topologyDisposition.includes('e4'),'CASE_NETWORK_BOUNDARY');
  if(c.pressure==='stale-or-conflict')ck(s.pressureDisposition==='reject-stale-or-fence','CASE_STALE');
  if(c.pressure==='burst-or-failure')ck(s.pressureDisposition==='serialize-fail-closed-no-silent-loss','CASE_BURST');
  return f;
}


export function validateAssessmentVector(verdicts){const f=[];for(let i=0;i<EXPECTED_VERDICTS.length;i++)if(verdicts?.[i]!==EXPECTED_VERDICTS[i])f.push(`ASSESSMENT_${i+1}`);return f;}
export function validateObservationVector(observation){const f=[];for(const k of OBSERVATION_KEYS)if(observation?.[k]!==true)f.push(`OBS_${k}`);return f;}

export function validateReality0(model,observation){
  const f=[];const ck=(v,c,d='')=>{if(!v)f.push({code:c,detail:d});};
  ck(model?.schemaVersion==='1.0.0','MODEL_SCHEMA');ck(model?.modelId==='REALITY-0','MODEL_ID');ck(model?.classification==='repository-target-as-is-rehearsal','MODEL_CLASS');ck(model?.evidenceGrade==='E2-repository-runtime-semantic-rehearsal','MODEL_GRADE');
  ck(model?.observedMainSha===TARGET_MAIN&&model?.observedMergedPr===139,'MODEL_BASE');ck(model?.stateOnPullRequest==='candidate'&&model?.nextAfterMerge==='DECIDE-0','MODEL_EXECUTION');ck(model?.targetAuthority==='v3/scope-0-model.json','TARGET_AUTHORITY');
  ck(/not deployment assurance/i.test(model?.claimBoundary||'')&&/DECIDE-0/.test(model?.claimBoundary||''),'MODEL_BOUNDARY');
  const uc=model?.useCaseModel||{};ck(uc.expectedCases===CASE_COUNT&&CASE_COUNT===12096,'CASE_COUNT');ck(JSON.stringify(uc.axes?.procedures)===JSON.stringify(PROCEDURES)&&JSON.stringify(uc.axes?.roles)===JSON.stringify(ROLES)&&JSON.stringify(uc.axes?.operations)===JSON.stringify(OPERATIONS),'CASE_AXES');ck((uc.layers||[]).length===9,'CASE_LAYERS');for(const k of UNIVERSAL_KEYS)ck(uc.universalInvariants?.[k]===true,'UNIVERSAL_INVARIANT',k);
  const a=model?.assessments||[];ck(a.length===13&&JSON.stringify(a.map(x=>x.scopeId))===JSON.stringify(SCOPE_IDS),'ASSESSMENT_IDS');ck(validateAssessmentVector(a.map(x=>x.verdict)).length===0,'ASSESSMENT_VERDICTS');ck(a.every(x=>String(x.asIs||'').length>60&&String(x.decisionInput||'').length>35&&(x.evidenceRefs||[]).length>=2),'ASSESSMENT_DETAIL');
  ck(JSON.stringify(model?.summary)===JSON.stringify(EXPECTED_SUMMARY),'SUMMARY');ck(model?.summary?.hardStructuralContradictions===0,'NO_FORCED_REPLATFORM');
  const dh=model?.decisionHandoff||{};ck(dh.nextSlice==='DECIDE-0'&&(dh.inputs||[]).length===7&&/may not itself authorize structural implementation/i.test(dh.policy||''),'DECISION_HANDOFF');
  ck(model?.mutationEvidence?.useCases===12096&&model?.mutationEvidence?.trials===1000000&&model?.mutationEvidence?.materialFamilies===63&&model?.mutationEvidence?.materialKilled===63&&model?.mutationEvidence?.survivors===0&&model?.mutationEvidence?.harnessErrors===0,'MUTATION_DECLARATION');
  for(const code of validateObservationVector(observation))f.push({code:'OBSERVATION',detail:code});
  let n=0;for(const c of generateUseCases()){n++;const cf=validateUseCase(c);if(cf.length){f.push({code:'USE_CASE_BASELINE',detail:`${c.id}:${cf.join(',')}`});break;}}ck(n===CASE_COUNT,'USE_CASE_ENUMERATION',String(n));
  return f;
}

function run(){const root=process.argv[3]?path.resolve(process.argv[3]):path.resolve(HERE,'..');const model=loadReality0(process.argv[2]?path.resolve(process.argv[2]):undefined);const observation=collectRealityObservation(root);const failures=validateReality0(model,observation);assert.deepEqual(failures,[]);console.log(JSON.stringify({ok:true,suite:'reality-0',observedMainSha:model.observedMainSha,useCases:CASE_COUNT,layers:model.useCaseModel.layers.length,assessmentSummary:model.summary,observationSignals:OBSERVATION_KEYS.length,next:model.nextAfterMerge,claimBoundary:model.claimBoundary}));}
if(import.meta.url===`file://${process.argv[1]}`)run();
