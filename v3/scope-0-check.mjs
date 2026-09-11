import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_MODEL=path.join(HERE,'scope-0-model.json');
export const TARGET_MAIN='3307a3b02e331f15d2b00f66b6fb41e709b090c6';
export const TARGET_PROCESS_CODES=Object.freeze(['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01']);
export const TARGET_DIMENSIONS=Object.freeze(Array.from({length:13},(_,i)=>`SCOPE-${String(i+1).padStart(2,'0')}`));
const TARGET_EXPECTED=Object.freeze({"operatorPrimary":"compliance-grc-lead-or-small-central-team","buyerTarget":"accountable-compliance-grc-internal-control-function-owner","contributorsModel":"distributed-domain-contributors","assuranceReader":"read-oriented-internal-assurance","personaComplianceLead":true,"personaProcessOwner":true,"personaControlOwner":true,"personaMarketValidation":"not-assessed","jobsCount":7,"jobNames":"triage|preserve-original-basis|human-decision|cross-process-routing|verified-closure-review|bounded-evidence|ai-assist-without-authority-transfer","jobsTriage":true,"jobsPreserveBasis":true,"jobsHumanDecision":true,"jobsCrossProcess":true,"jobsVerifiedClosure":true,"jobsBoundedEvidence":true,"nonJobLegalDetermination":true,"processCount":7,"processCodes":"RN-01|EC-01|AO-01|MC-01|AP-01|RC-01|AR-01","policyDefault":"all-enabled","minimumEnabled":1,"disablePreservesHistory":true,"disableBlocksNewWrites":true,"epCrossCuttingOnly":true,"processStandalonePeers":true,"processGlobalStatusForbidden":true,"topologyPrimary":"customer-controlled-single-node","defaultBind":"127.0.0.1","tenantMode":"bounded-optional-multi-tenant","tenantIsolation":"per-tenant-runtime-directory-and-db","networkedMode":"conditional-trusted-header-opt-in","directPublicBind":false,"activeActiveTarget":false,"managedSaasTarget":false,"topologyExternalIdentityRequiredForNetworked":true,"topologyExternalScannerRequiredForAttachments":true,"topologyHaNotImplied":true,"scaleClass":"workgroup","namedUsersPerTenant":50,"sessionsPerTenant":10,"tenantsPerNode":5,"activeRecordsPerTenant":10000,"writeBurstConcurrency":5,"svLimit":5000,"writeSerialized":true,"capacityState":"target-unverified","noSilentLoss":true,"primaryClient":"evergreen-chromium-desktop","authoringWidthMin":1024,"responsiveWidthMin":390,"secondaryReviewMobile":true,"a11yAutomationE2":true,"crossEngineSupport":false,"nativeApps":false,"offlineMode":false,"legacyBrowserSupport":false,"launcher":"ictc.sh","engineMin":"22.16.0","installMode":"versioned-bundle-local-runtime","preRecoveryForSchemaChange":true,"rollbackCode":"compatibility-aware","rollbackData":"recovery-point","blindRollback":false,"autoUpdater":false,"zeroDowntimeUpdate":false,"provenanceGate":"C2-DELIVERY-PROVENANCE","dataClass":"internal-confidential-compliance-plus-personal-data","secretsInBusinessState":false,"residencyPrimary":"customer-controlled-local","residencyAiEgressChangesBoundary":true,"aiOptInByOrgPolicy":true,"aiNoLegalAuthority":true,"universalRegulatedSuitability":false,"dataExternalMasterAuthorityPreserved":true,"dataRetentionDeploymentPolicy":true,"dataErasureRuntimeBounded":true,"serviceClass":"business-hours-workbench","haRequired":false,"downtimePlannedAllowed":true,"availabilitySlaUniversal":false,"universalRto":false,"universalRpo":false,"recoveryEncryptedRequired":true,"recoveryE4Objectives":true,"capacityNoSilentTruncation":true,"safetyFailClosedForUnsupportedHistoricalQuery":true,"inboundManual":true,"inboundSourcePack":true,"inboundExternalReference":true,"identityUpstream":"trusted-header-or-local-dev-boundary","aiOptional":true,"outboundSameAsRead":true,"masterExternalAuthority":true,"bidirSyncRequired":false,"marketplaceTarget":false,"vendorCoreDependency":false,"scopeRoles":"admin|user|auditor","roleExpansionInScope":false,"delegationModel":"ownership-assignee-tenant-membership","auditorMutationDefault":false,"aiAuthority":false,"identityTraceRequired":true,"hardMakerCheckerUniversal":false,"sodOrgSpecific":true,"adminConfigAuthority":true,"humanBusinessDecisionAuthority":true,"metricPolicy":"metric-spec-plus-e2-e3-separation","timeTargetState":"baseline-required-in-e3","completionTargetState":"baseline-required-in-e3","comprehensionTargetState":"baseline-required-in-e3","receiptTarget":1,"processTarget":7,"surfaceTarget":13,"atTargetState":"zero-critical-blockers-before-broad-claim","forbiddenProxies":"compliance-score|maturity-score|market-fit-from-ci","marketFitInferenceForbidden":true,"preserveArchNode":true,"preserveArchVanilla":true,"preserveArchStore":true,"preserveArchSqlite":true,"preserveArchOneRoot":true,"changeAuthority":"REALITY-0-plus-DECIDE-0","forbiddenArchSecondBusinessStore":true,"forbiddenArchGlobalUiResolver":true,"forbiddenArchGenericBpm":true,"allowedGrowth":"only-target-justified","ownerBudget":"one-authority-per-semantic-slot"});
const OBS_EXPECTED=Object.freeze({"obsProductServices":7,"obsProductRoles":3,"obsShellItems":3,"obsProcedurePolicyMinimum":1,"obsProcedureDisableHistory":true,"obsProcedureDisableBlocksWrites":true,"obsHumanLaunchRequired":true,"obsAiRanking":false,"obsSyntheticComplianceScore":false,"obsServerHost":"127.0.0.1","obsServerProductEdition":"1.2 Market Candidate","obsServerStabilityProfile":"1.2_market_candidate","obsServerTenantAuthority":true,"obsServerAbuseBudget":true,"obsServerAiGovernance":true,"obsServerSafeBinding":true,"obsServerTenantRequestContext":true,"obsRuntimeSqlite":true,"obsRuntimeFullEventStore":false,"obsRuntimeHistoricalTransactionTime":false,"obsRuntimeStoreSerialized":true,"obsRuntimeOneCompositionRoot":true,"obsOpsMultiTenant":true,"obsOpsPerTenantIsolation":true,"obsOpsNonLoopbackGuard":true,"obsOpsRecoveryEncrypted":true,"obsOpsUniversalRto":false,"obsOpsUniversalRpo":false,"obsOpsHaProven":false,"obsOpsIdentityEnterpriseProven":false,"obsOpsScannerEfficacyProven":false,"obsOpsObservabilityExternalProven":false,"obsUiSurfaces":13,"obsUiInstallers":45,"obsUiParticipants":5,"obsUiRowFirst":true,"obsUiOneIdentity":true,"obsUiHumanRail":"E3-HUMAN","obsPersonaComplianceLead":true,"obsPersonaInternalAuditor":true,"obsSubjectVersionProjectionLimit":5000,"obsEngineMin":"22.16.0","obsAuthorityOneCompositionRoot":true,"obsAuthorityNoSecondBusinessStore":true});
const EXPECTED=Object.freeze({...TARGET_EXPECTED,...OBS_EXPECTED});
const EXPECTED_ENTRIES=Object.freeze(Object.entries(EXPECTED));

const read=(root,rel)=>readFileSync(path.join(root,rel),'utf8');
const json=(root,rel)=>JSON.parse(read(root,rel));
const has=(text,re)=>re.test(text);
const engineValue=value=>String(value||'').replace(/^>=/,'');

export function collectRuntimeObservation(root=path.resolve(HERE,'..')){
  const product=json(root,'v3/product-contract.json');
  const server=read(root,'v3/server.mjs');
  const arch=read(root,'docs/11_ARCHITECTURE.md');
  const ops=read(root,'docs/OPERATIONS.md');
  const uiux=json(root,'v3/uiux-scope-model.json');
  const personas=read(root,'v3/procedure-guidance-scenario-model.mjs');
  const subjectVersion=read(root,'v3/runtime/subject-version.mjs');
  const pkg=json(root,'package.json');
  const authority=read(root,'docs/authority-matrix.yaml');
  const disabled=new Set(product.procedurePolicy?.disabledBehavior||[]);
  return {
    obsProductServices:(product.services||[]).length,
    obsProductRoles:(product.roles||[]).length,
    obsShellItems:(product.permanentShell||[]).length,
    obsProcedurePolicyMinimum:product.procedurePolicy?.minimumEnabled,
    obsProcedureDisableHistory:disabled.has('retain-history-and-evidence'),
    obsProcedureDisableBlocksWrites:disabled.has('block-new-writes'),
    obsHumanLaunchRequired:product.orchestration?.intentRouting?.humanLaunchRequired===true,
    obsAiRanking:product.orchestration?.workQueue?.aiRanking===true,
    obsSyntheticComplianceScore:product.orchestration?.procedureSummary?.syntheticComplianceScore===true,
    obsServerHost:(server.match(/const host=process\.env\.ICTC_HOST\|\|'([^']+)'/)||[])[1]||'',
    obsServerProductEdition:(server.match(/const PRODUCT_EDITION='([^']+)'/)||[])[1]||'',
    obsServerStabilityProfile:(server.match(/const STABILITY_PROFILE='([^']+)'/)||[])[1]||'',
    obsServerTenantAuthority:has(server,/createTenantAuthority\s*\(/),
    obsServerAbuseBudget:has(server,/createAbuseBudget\s*\(/),
    obsServerAiGovernance:has(server,/configureAiGovernance\s*\(/),
    obsServerSafeBinding:has(server,/assertSafeRuntimeBinding\s*\(host\)/),
    obsServerTenantRequestContext:has(server,/tenantAuthority\.runRequest\s*\(/),
    obsRuntimeSqlite:has(arch,/persistence nativa `node:sqlite`/i)&&has(arch,/SqliteStatePersistence/),
    obsRuntimeFullEventStore:!has(arch,/non [èe] oggi un event store completo/i),
    obsRuntimeHistoricalTransactionTime:!has(arch,/selezione storica transaction-time non [èe] implementata/i),
    obsRuntimeStoreSerialized:has(arch,/`Store` serializza la mutazione/i),
    obsRuntimeOneCompositionRoot:has(arch,/installActiveExperience\(\).*unico composition root/i),
    obsOpsMultiTenant:has(ops,/ICTC_MULTI_TENANT=1/),
    obsOpsPerTenantIsolation:has(ops,/database, quarantine e attachment fisicamente distinti/i),
    obsOpsNonLoopbackGuard:has(ops,/bind non-loopback [èe] rifiutato/i),
    obsOpsRecoveryEncrypted:has(ops,/AES-256-GCM/i)&&has(ops,/recovery point cifrati/i),
    obsOpsUniversalRto:!has(ops,/Non sono RTO\/RPO approvati/i),
    obsOpsUniversalRpo:!has(ops,/Non sono RTO\/RPO approvati/i),
    obsOpsHaProven:!(has(ops,/Restano \*\*non dimostrati dal repository\*\*/i)&&has(ops,/alta disponibilit/i)),
    obsOpsIdentityEnterpriseProven:!(has(ops,/Restano \*\*non dimostrati dal repository\*\*/i)&&has(ops,/identit[àa] enterprise/i)),
    obsOpsScannerEfficacyProven:!(has(ops,/Restano \*\*non dimostrati dal repository\*\*/i)&&has(ops,/efficacia dello scanner/i)),
    obsOpsObservabilityExternalProven:!(has(ops,/Restano \*\*non dimostrati dal repository\*\*/i)&&has(ops,/alert drill esterno/i)),
    obsUiSurfaces:(uiux.surfaceInventory||[]).length,
    obsUiInstallers:uiux.mountGraph?.directInstallerCount,
    obsUiParticipants:uiux.mountGraph?.constitutionalParticipantCount,
    obsUiRowFirst:uiux.commonGrammar?.repeatedRecordDefault==='row-or-list',
    obsUiOneIdentity:(uiux.surfaceInventory||[]).every(x=>x.identityMax===1),
    obsUiHumanRail:uiux.humanEvidenceBoundary?.rail,
    obsPersonaComplianceLead:has(personas,/compliance-lead/),
    obsPersonaInternalAuditor:has(personas,/internal-auditor/),
    obsSubjectVersionProjectionLimit:Number((subjectVersion.match(/SUBJECT_VERSION_PROJECTION_LIMIT=(\d+)/)||[])[1]||0),
    obsEngineMin:engineValue(pkg.engines?.node),
    obsAuthorityOneCompositionRoot:has(authority,/ui_composition_root:[\s\S]*?authority: v3\/public\/ui\/active-experience\.js[\s\S]*?classification: exclusive/),
    obsAuthorityNoSecondBusinessStore:has(authority,/runtime_store_adapter may add runtime-only persistence\/storage hardening but must extend runtime_state and may not become a second business write authority/)
  };
}

export function semanticState(model,observation){return {...(model?.contract||{}),...observation};}
export function validateSemanticState(state){
  const failures=[];
  for(const [key,value] of EXPECTED_ENTRIES)if(state?.[key]!==value)failures.push({code:`FIELD_${key}`,expected:value,actual:state?.[key]});
  if(Object.keys(state||{}).length!==171)failures.push({code:'FIELD_COUNT',expected:171,actual:Object.keys(state||{}).length});
  if(state.processCount!==state.obsProductServices)failures.push({code:'PROCESS_TARGET_OBS_RELATION'});
  if(state.scopeRoles.split('|').length!==state.obsProductRoles)failures.push({code:'ROLE_TARGET_OBS_RELATION'});
  if(state.svLimit!==state.obsSubjectVersionProjectionLimit)failures.push({code:'SUBJECT_VERSION_BOUND_RELATION'});
  if(state.surfaceTarget!==state.obsUiSurfaces)failures.push({code:'UI_SURFACE_RELATION'});
  if(state.defaultBind!==state.obsServerHost)failures.push({code:'DEFAULT_BIND_RELATION'});
  return failures;
}

export function validateScope0(model,observation){
  const failures=[];const ck=(ok,code,detail='')=>{if(!ok)failures.push({code,detail});};
  ck(model?.schemaVersion==='1.0.0','MODEL_SCHEMA');
  ck(model?.modelId==='SCOPE-0','MODEL_ID');
  ck(model?.classification==='repository-product-operating-model-target-envelope','MODEL_CLASS');
  ck(model?.evidenceGrade==='E2-repository-target-decision-with-runtime-observation','MODEL_GRADE');
  ck(model?.observedMainSha===TARGET_MAIN&&model?.observedMergedPr===138,'MODEL_BASE');
  ck(model?.stateOnPullRequest==='candidate'&&model?.nextAfterMerge==='REALITY-0','MODEL_EXECUTION');
  ck(/does not prove/i.test(model?.claimBoundary||'')&&/REALITY-0/.test(model?.claimBoundary||''),'MODEL_BOUNDARY');
  const sources=model?.sourceAuthorities||[]; const sourcePaths=sources.map(x=>x.path);
  for(const p of ['v3/product-contract.json','v3/server.mjs','docs/11_ARCHITECTURE.md','docs/OPERATIONS.md','v3/uiux-scope-model.json','v3/procedure-guidance-scenario-model.mjs','v3/runtime/subject-version.mjs','package.json','docs/authority-matrix.yaml'])ck(sourcePaths.includes(p),'MODEL_SOURCE',p);
  const dims=model?.dimensions||[];ck(dims.length===13,'DIM_COUNT');ck(JSON.stringify(dims.map(x=>x.id))===JSON.stringify(TARGET_DIMENSIONS),'DIM_IDS');
  ck(dims.every(x=>x.state==='defined-target'&&x.claimClass==='target-not-as-is-proof'&&String(x.decision||'').length>40),'DIM_DEFINED');
  const dimensionKeys=dims.flatMap(x=>x.contractKeys||[]);ck(dimensionKeys.length===127&&new Set(dimensionKeys).size===127,'DIM_KEY_COVERAGE');
  ck(Object.keys(model?.contract||{}).length===127,'CONTRACT_COUNT');ck(dimensionKeys.every(k=>Object.hasOwn(model.contract,k)),'CONTRACT_DIM_BINDING');
  const ux=model?.uiuxInheritance||{};ck(ux.source==='UIUX-SCOPE-0/#138'&&ux.surfaceCount===13&&ux.repeatedRecordDefault==='row-or-list'&&ux.primaryActionMax===1&&ux.semanticOrderInvariant===true&&ux.pleasantnessEvidenceRail==='E3-HUMAN','UIUX_INHERITANCE');
  const rh=model?.realityHandoff||{};ck(rh.nextSlice==='REALITY-0'&&(rh.requiredOutputs||[]).length===7&&/DECIDE-0/.test(rh.failurePolicy||''),'REALITY_HANDOFF');
  const me=model?.mutationEvidence||{};ck(me.trials===1000000&&me.semanticFields===171&&me.runtimeObservedFields===44&&me.materialFamilies===171&&me.materialKilled===171&&me.survivors===0&&me.harnessErrors===0,'MUTATION_DECLARATION');
  ck((model?.nonGoals||[]).includes('enterprise-ready claim')&&(model?.nonGoals||[]).includes('second business write store')&&(model?.nonGoals||[]).includes('global UI final resolver'),'NON_GOALS');
  ck((model?.externalEvidenceBoundaries?.['E3-HUMAN']||[]).length>=4&&(model?.externalEvidenceBoundaries?.['E4-DEPLOY']||[]).length>=5,'EXTERNAL_BOUNDARIES');
  failures.push(...validateSemanticState(semanticState(model,observation)));
  return failures;
}

export function loadScope0(file=DEFAULT_MODEL){return JSON.parse(readFileSync(file,'utf8'));}
export function runScope0(root=path.resolve(HERE,'..'),file=DEFAULT_MODEL){
  const model=loadScope0(file),observation=collectRuntimeObservation(root),state=semanticState(model,observation),failures=validateScope0(model,observation);
  return {ok:failures.length===0,failures,modelId:model.modelId,observedMainSha:model.observedMainSha,dimensions:model.dimensions.length,targetFields:Object.keys(model.contract).length,runtimeObservedFields:Object.keys(observation).length,semanticFields:Object.keys(state).length,nextAfterMerge:model.nextAfterMerge,claimBoundary:'Repository/runtime-semantic target validation only; no deployment, human or market assurance.'};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){const r=runScope0(path.resolve(process.argv[3]||path.join(HERE,'..')),process.argv[2]||DEFAULT_MODEL);console.log(JSON.stringify(r,null,2));if(!r.ok)process.exit(1);assert.equal(r.semanticFields,171);}
