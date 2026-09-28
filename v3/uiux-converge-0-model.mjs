import { PROJECTED_OBJECT_TYPES, SURFACE_OBJECT_TYPE_PROFILE } from './public/ui/native-semantic-lattice-3-2.js';

export const CANONICAL_SURFACES=Object.freeze(['home','processes','monitoring','incidents','objects','coverage','actions','risks','assurance','admin','epistemic','proof','ai-settings']);
export const CANONICAL_PROCEDURES=Object.freeze(['monitoring','incidents','objects','coverage','actions','risks','assurance']);

export const UIUX_MINING_V2_COVERAGE=Object.freeze({
  classification:'derived-regression-evidence-not-authority',
  registerSha256:'43333a22d54533cad68aa398b093a8811cce9a9e1081aca194ec19e1145840e6',issueCount:352,
  globalDoD:Object.freeze(['G01','G02','G03','G04','G05','G06','G07','G08','G09','G10','G11','G12','G13','G14']),
  intermediateDoD:Object.freeze(['I01','I02','I03','I04','I05','I06','I07','I08','I09']),
  mechanisms:Object.freeze({
    M1:Object.freeze({commit:'C1-role-chrome-feedback',issues:Object.freeze(['01_HOME-01','02_HOME-DEMO-DIALOG-01','03_HOME-PROFILE-MENU-10','04_GLOBAL-COMMAND-10','05_PROCESSES-01','06_RN-01-01','07_RN-SOURCE-DETAIL-01','08_EC-01-01','10_AO-01-01','13_AP-01-01','14_RC-01-01','15_AR-01-01','16_PROOF-01','17_EPISTEMIC-01','19_ADMIN-OVERVIEW-01','20_ADMIN-AI-01','21_ADMIN-IDENTITY-01','22_USER-HOME-01','23_USER-PROCESSES-01','24_AUDITOR-HOME-01','25_AUDITOR-PROCESSES-01','26_AUDITOR-AP-01-03','27_MOBILE-HOME-01','28_MOBILE-PROCESSES-01','30_MOBILE-PROOF-01','31_RN-CONTRIBUTION-01','32_RN-PLAN-01','33_EC-INCIDENT-INTAKE-01','V2A-002'])}),
    M2:Object.freeze({commit:'C5-onboarding-persistence',issues:Object.freeze(['01_HOME-02','01_HOME-03','02_HOME-DEMO-DIALOG-02','03_HOME-PROFILE-MENU-01','03_HOME-PROFILE-MENU-02','03_HOME-PROFILE-MENU-08','04_GLOBAL-COMMAND-01','05_PROCESSES-02','22_USER-HOME-02','22_USER-HOME-03','22_USER-HOME-10','23_USER-PROCESSES-02','24_AUDITOR-HOME-02','24_AUDITOR-HOME-03','25_AUDITOR-PROCESSES-02','27_MOBILE-HOME-02','27_MOBILE-HOME-09','V2A-018','V2A-019'])}),
    M3:Object.freeze({commit:'C3-procedure-grammar',issues:Object.freeze(['06_RN-01-02','06_RN-01-03','08_EC-01-02','08_EC-01-03','10_AO-01-02','11_MC-01-02','13_AP-01-02','14_RC-01-02','15_AR-01-02','26_AUDITOR-AP-01-04','29_MOBILE-MC-01-03','V2A-021'])}),
    M4:Object.freeze({commit:'C3-procedure-grammar',issues:Object.freeze(['01_HOME-08','05_PROCESSES-07','06_RN-01-04','06_RN-01-05','06_RN-01-06','08_EC-01-04','08_EC-01-05','08_EC-01-06','08_EC-01-07','10_AO-01-03','10_AO-01-04','10_AO-01-05','11_MC-01-03','11_MC-01-08','11_MC-01-09','11_MC-01-10','13_AP-01-03','13_AP-01-04','13_AP-01-05','13_AP-01-10','14_RC-01-03','14_RC-01-04','15_AR-01-03','15_AR-01-07','16_PROOF-03','17_EPISTEMIC-07','18_EPISTEMIC-EXPANDED-10','20_ADMIN-AI-04','22_USER-HOME-06','22_USER-HOME-07','23_USER-PROCESSES-05','24_AUDITOR-HOME-06','25_AUDITOR-PROCESSES-06','26_AUDITOR-AP-01-05','26_AUDITOR-AP-01-06','26_AUDITOR-AP-01-07','28_MOBILE-PROCESSES-09','29_MOBILE-MC-01-09','30_MOBILE-PROOF-06','V2A-009'])}),
    M5:Object.freeze({commit:'C3-procedure-grammar',issues:Object.freeze(['01_HOME-07','01_HOME-09','02_HOME-DEMO-DIALOG-05','03_HOME-PROFILE-MENU-03','03_HOME-PROFILE-MENU-04','03_HOME-PROFILE-MENU-07','04_GLOBAL-COMMAND-03','04_GLOBAL-COMMAND-04','04_GLOBAL-COMMAND-05','04_GLOBAL-COMMAND-09','05_PROCESSES-04','05_PROCESSES-06','05_PROCESSES-08','05_PROCESSES-09','06_RN-01-08','06_RN-01-09','07_RN-SOURCE-DETAIL-02','07_RN-SOURCE-DETAIL-05','07_RN-SOURCE-DETAIL-06','07_RN-SOURCE-DETAIL-10','08_EC-01-08','08_EC-01-09','08_EC-01-10','09_EC-INCIDENT-WORKSPACE-08','09_EC-INCIDENT-WORKSPACE-09','10_AO-01-06','10_AO-01-07','10_AO-01-08','10_AO-01-09','10_AO-01-10','11_MC-01-06','11_MC-01-07','13_AP-01-06','13_AP-01-07','13_AP-01-08','13_AP-01-09','14_RC-01-05','14_RC-01-06','14_RC-01-07','14_RC-01-08','14_RC-01-09','15_AR-01-04','15_AR-01-05','15_AR-01-06','15_AR-01-08','15_AR-01-09','15_AR-01-10','17_EPISTEMIC-06','19_ADMIN-OVERVIEW-03','19_ADMIN-OVERVIEW-05','20_ADMIN-AI-05','22_USER-HOME-05','23_USER-PROCESSES-06','23_USER-PROCESSES-08','23_USER-PROCESSES-09','25_AUDITOR-PROCESSES-07','25_AUDITOR-PROCESSES-08','25_AUDITOR-PROCESSES-09','26_AUDITOR-AP-01-08','26_AUDITOR-AP-01-09','27_MOBILE-HOME-07','27_MOBILE-HOME-08','28_MOBILE-PROCESSES-05','28_MOBILE-PROCESSES-06','28_MOBILE-PROCESSES-07','28_MOBILE-PROCESSES-08','29_MOBILE-MC-01-10','V2A-010'])}),
    M6:Object.freeze({commit:'C2-dialog-lifecycle',issues:Object.freeze(['02_HOME-DEMO-DIALOG-08','02_HOME-DEMO-DIALOG-09','02_HOME-DEMO-DIALOG-10','04_GLOBAL-COMMAND-02','04_GLOBAL-COMMAND-06','04_GLOBAL-COMMAND-07','07_RN-SOURCE-DETAIL-03','07_RN-SOURCE-DETAIL-04','07_RN-SOURCE-DETAIL-07','07_RN-SOURCE-DETAIL-08','07_RN-SOURCE-DETAIL-09','09_EC-INCIDENT-WORKSPACE-01','09_EC-INCIDENT-WORKSPACE-02','09_EC-INCIDENT-WORKSPACE-03','09_EC-INCIDENT-WORKSPACE-04','09_EC-INCIDENT-WORKSPACE-05','09_EC-INCIDENT-WORKSPACE-06','09_EC-INCIDENT-WORKSPACE-07','09_EC-INCIDENT-WORKSPACE-10','12_MC-STANDARD-BROWSER-02','12_MC-STANDARD-BROWSER-10','19_ADMIN-OVERVIEW-08','19_ADMIN-OVERVIEW-09','20_ADMIN-AI-10','21_ADMIN-IDENTITY-06','21_ADMIN-IDENTITY-07','31_RN-CONTRIBUTION-03','31_RN-CONTRIBUTION-04','31_RN-CONTRIBUTION-05','31_RN-CONTRIBUTION-06','31_RN-CONTRIBUTION-08','31_RN-CONTRIBUTION-09','31_RN-CONTRIBUTION-10','32_RN-PLAN-06','32_RN-PLAN-07','33_EC-INCIDENT-INTAKE-02','33_EC-INCIDENT-INTAKE-03','33_EC-INCIDENT-INTAKE-05','33_EC-INCIDENT-INTAKE-06','33_EC-INCIDENT-INTAKE-07','33_EC-INCIDENT-INTAKE-08','33_EC-INCIDENT-INTAKE-09','33_EC-INCIDENT-INTAKE-10','V2A-001','V2A-016'])}),
    M7:Object.freeze({commit:'C4-specialized-surfaces',issues:Object.freeze(['06_RN-01-07','06_RN-01-10','32_RN-PLAN-02','32_RN-PLAN-03','32_RN-PLAN-05','32_RN-PLAN-08','32_RN-PLAN-09'])}),
    M8:Object.freeze({commit:'C4-specialized-surfaces',issues:Object.freeze(['11_MC-01-01','11_MC-01-04','11_MC-01-05','12_MC-STANDARD-BROWSER-01','12_MC-STANDARD-BROWSER-03','12_MC-STANDARD-BROWSER-04','12_MC-STANDARD-BROWSER-06','12_MC-STANDARD-BROWSER-07','12_MC-STANDARD-BROWSER-08','12_MC-STANDARD-BROWSER-09','29_MOBILE-MC-01-01','29_MOBILE-MC-01-04','29_MOBILE-MC-01-05','29_MOBILE-MC-01-06','29_MOBILE-MC-01-07','29_MOBILE-MC-01-08','V2A-022'])}),
    M9:Object.freeze({commit:'C4-specialized-surfaces',issues:Object.freeze(['02_HOME-DEMO-DIALOG-06','02_HOME-DEMO-DIALOG-07','03_HOME-PROFILE-MENU-06','16_PROOF-02','16_PROOF-04','16_PROOF-06','16_PROOF-07','16_PROOF-08','16_PROOF-09','16_PROOF-10','17_EPISTEMIC-02','17_EPISTEMIC-03','17_EPISTEMIC-04','17_EPISTEMIC-08','17_EPISTEMIC-09','17_EPISTEMIC-10','18_EPISTEMIC-EXPANDED-03','18_EPISTEMIC-EXPANDED-04','18_EPISTEMIC-EXPANDED-05','18_EPISTEMIC-EXPANDED-07','18_EPISTEMIC-EXPANDED-08','19_ADMIN-OVERVIEW-02','19_ADMIN-OVERVIEW-04','19_ADMIN-OVERVIEW-06','19_ADMIN-OVERVIEW-07','19_ADMIN-OVERVIEW-10','20_ADMIN-AI-02','20_ADMIN-AI-03','20_ADMIN-AI-06','20_ADMIN-AI-07','20_ADMIN-AI-08','20_ADMIN-AI-09','21_ADMIN-IDENTITY-03','21_ADMIN-IDENTITY-04','21_ADMIN-IDENTITY-05','21_ADMIN-IDENTITY-08','21_ADMIN-IDENTITY-09','22_USER-HOME-08','24_AUDITOR-HOME-09','30_MOBILE-PROOF-04','30_MOBILE-PROOF-05','30_MOBILE-PROOF-07','30_MOBILE-PROOF-08','30_MOBILE-PROOF-10'])}),
    M10:Object.freeze({commit:'C1-role-chrome-feedback',issues:Object.freeze(['01_HOME-04','01_HOME-05','01_HOME-06','01_HOME-10','02_HOME-DEMO-DIALOG-03','02_HOME-DEMO-DIALOG-04','03_HOME-PROFILE-MENU-05','03_HOME-PROFILE-MENU-09','04_GLOBAL-COMMAND-08','05_PROCESSES-03','05_PROCESSES-05','05_PROCESSES-10','12_MC-STANDARD-BROWSER-05','14_RC-01-10','16_PROOF-05','17_EPISTEMIC-05','18_EPISTEMIC-EXPANDED-01','18_EPISTEMIC-EXPANDED-02','18_EPISTEMIC-EXPANDED-06','18_EPISTEMIC-EXPANDED-09','21_ADMIN-IDENTITY-02','21_ADMIN-IDENTITY-10','22_USER-HOME-04','22_USER-HOME-09','23_USER-PROCESSES-03','23_USER-PROCESSES-04','23_USER-PROCESSES-07','23_USER-PROCESSES-10','24_AUDITOR-HOME-04','24_AUDITOR-HOME-05','24_AUDITOR-HOME-07','24_AUDITOR-HOME-08','24_AUDITOR-HOME-10','25_AUDITOR-PROCESSES-03','25_AUDITOR-PROCESSES-04','25_AUDITOR-PROCESSES-05','25_AUDITOR-PROCESSES-10','26_AUDITOR-AP-01-01','26_AUDITOR-AP-01-02','26_AUDITOR-AP-01-10','27_MOBILE-HOME-03','27_MOBILE-HOME-04','27_MOBILE-HOME-05','27_MOBILE-HOME-06','27_MOBILE-HOME-10','28_MOBILE-PROCESSES-02','28_MOBILE-PROCESSES-03','28_MOBILE-PROCESSES-04','28_MOBILE-PROCESSES-10','29_MOBILE-MC-01-02','30_MOBILE-PROOF-02','30_MOBILE-PROOF-03','30_MOBILE-PROOF-09','31_RN-CONTRIBUTION-02','31_RN-CONTRIBUTION-07','32_RN-PLAN-04','32_RN-PLAN-10','33_EC-INCIDENT-INTAKE-04','V2A-011','V2A-012','V2A-013','V2A-017','V2A-020'])}),
    M11:Object.freeze({commit:'C1-role-chrome-feedback',issues:Object.freeze(['V2A-003','V2A-004','V2A-005','V2A-006','V2A-007','V2A-008','V2A-014','V2A-015'])}),
  }),
  proofCommit:'C6-coverage-oracle'
});
export function validateUiuxMiningV2Coverage(){const errors=[],entries=Object.entries(UIUX_MINING_V2_COVERAGE.mechanisms),ids=entries.flatMap(([,value])=>value.issues);if(ids.length!==UIUX_MINING_V2_COVERAGE.issueCount)errors.push(`ISSUE_COUNT:${ids.length}`);if(new Set(ids).size!==ids.length)errors.push('ISSUE_DUPLICATE');if(entries.length!==11)errors.push(`MECHANISM_COUNT:${entries.length}`);for(const [id,value] of entries){if(!value.commit||!value.issues.length)errors.push(`MECHANISM_UNCOVERED:${id}`);}if(UIUX_MINING_V2_COVERAGE.globalDoD.length!==14)errors.push('GLOBAL_DOD');if(UIUX_MINING_V2_COVERAGE.intermediateDoD.length!==9)errors.push('INTERMEDIATE_DOD');return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),issueCount:ids.length,mechanisms:entries.length});}
export const EXPECTED_OWNERS=Object.freeze({
  home:'stable-shell.js',processes:'procedure-frame.js',monitoring:'procedure-frame.js',incidents:'procedure-frame.js',
  objects:'grc-workspace-3-2.js',coverage:'grc-workspace-3-2.js',actions:'grc-workspace-3-2.js',risks:'grc-workspace-3-2.js',assurance:'grc-workspace-3-2.js',
  admin:'admin-workspace-3-2.js',epistemic:'epistemic-workspace-3-2.js',proof:'proof-workspace-3-2.js','ai-settings':'actions.js/admin'
});
const PROCEDURE_SET=new Set(CANONICAL_PROCEDURES);
export const CANONICAL_OBJECT_TYPE_PROFILE=SURFACE_OBJECT_TYPE_PROFILE;
const sameSet=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&a.every(value=>b.includes(value));
const fail=(errors,id,detail)=>errors.push(`${id}:${detail}`);

export function validateUiuxConvergeContract(model){
  const errors=[];
  if(model?.modelId!=='UIUX-CONVERGE-0')fail(errors,'MODEL','wrong model id');
  if(model?.serialSlice!=='UIUX-CONVERGE-0')fail(errors,'SLICE','wrong serial slice');
  if(model?.sliceTerminal!==true)fail(errors,'BOUNDARY','reconciled top-level slice must be repository-terminal');
  const levels=(model?.abstractionMatrix||[]).map(row=>row.level);
  if(!sameSet(levels,['L0','L1','L2','L3','L4','L5','L6']))fail(errors,'LEVELS','style abstraction matrix must cover L0-L6 exactly');
  const surfaces=model?.surfaceProgram||[];
  const ids=surfaces.map(row=>row.id);
  if(!sameSet(ids,CANONICAL_SURFACES))fail(errors,'CENSUS','canonical 13-surface set mismatch');
  for(const row of surfaces){
    if(EXPECTED_OWNERS[row.id]!==row.owner)fail(errors,'OWNER',`${row.id} owner ${row.owner}`);
    if(row.firstPlane==='technical')fail(errors,'FIRST_PLANE',`${row.id} technical-first`);
    if(Number(row.primaryMax)>1)fail(errors,'PRIMARY',`${row.id} primaryMax ${row.primaryMax}`);
    if(PROCEDURE_SET.has(row.id)&&row.kind!=='procedure')fail(errors,'PROCEDURE_KIND',row.id);
    if(PROCEDURE_SET.has(row.id)&&!String(row.workUnit||'').startsWith('UXW-0')&&!String(row.workUnit||'').startsWith('UXW-10'))fail(errors,'WORK_UNIT',row.id);
  }
  for(const id of CANONICAL_SURFACES){const profile=CANONICAL_OBJECT_TYPE_PROFILE[id];if(!Array.isArray(profile)||!profile.length)fail(errors,'OBJECT_PROFILE',`${id} missing profile`);for(const role of profile||[])if(!PROJECTED_OBJECT_TYPES[role])fail(errors,'OBJECT_ROLE',`${id}:${role}`);}
  const metrics=model?.styleMetrics||{};
  if(Number(metrics.desktopCompactRowTargetPx)>Number(metrics.desktopCompactRowMaxPx))fail(errors,'DENSITY','row target exceeds max');
  if(Number(metrics.desktopCompactRowMaxPx)>64)fail(errors,'DENSITY','row max exceeds 64px');
  if(Number(metrics.controlMinPx)<44)fail(errors,'CONTROL','critical control min below 44px');
  if(Number(metrics.descriptionWeightMax)>500)fail(errors,'TYPE','description too bold');
  if(Number(metrics.motionMaxMs)>240)fail(errors,'MOTION','motion budget above 240ms');
  if(metrics.statusColorOnlyAllowed!==false)fail(errors,'STATUS','color-only status allowed');
  if(metrics.mobileHorizontalOverflowAllowed!==false)fail(errors,'RESPONSIVE','horizontal overflow allowed');
  const min=model?.minimalityRules||{};
  if(min.singleLineWhenLegible!==true)fail(errors,'MINIMAL','single-line rule missing');
  if(min.longDescriptionBoldForbidden!==true)fail(errors,'TYPE','long description bold not forbidden');
  if(min.repeatedRecordsDefault!=='row-or-list')fail(errors,'DENSITY','repeated records not row/list');
  if(min.firstPlaneMaxPrimaryActions!==1)fail(errors,'PRIMARY','first plane primary max not one');
  if(min.firstPlaneTechnicalDefault!==false)fail(errors,'FIRST_PLANE','technical default enabled');
  if(min.materialBoundaryMustRemainVisible!==true)fail(errors,'BOUNDARY','material boundary may hide');
  if(min.icons!=='inline-lucide-compatible-svg')fail(errors,'ICON','icon system not canonical');
  if(min.asciiDirectionalGlyphsInCanonicalTouchedActions!==false)fail(errors,'ICON','ASCII directional glyphs allowed');
  if(!model?.reconciliation||model.reconciliation.id!=='GOV-TRAMA-RECONCILE-1'||!Array.isArray(model.reconciliation.externalBoundary)||!model.reconciliation.externalBoundary.includes('E3-HUMAN'))fail(errors,'RECONCILIATION','terminal reconciliation/external boundary missing');
  const global=model?.globalDoD||[];
  for(const needle of ['no second business write authority','CAPABILITY-CLOSURE-E2','C5','44px'])if(!global.some(line=>String(line).includes(needle)))fail(errors,'GLOBAL_DOD',`missing ${needle}`);
  const falsification=model?.falsification||{};
  if(falsification?.style?.trials!==100000)fail(errors,'STYLE_TRIALS','must be 100000');
  if(falsification?.e2e?.trials!==1000000)fail(errors,'E2E_TRIALS','must be 1000000');
  if(falsification?.e2e?.mode!=='source-derived-real-bundle')fail(errors,'E2E_MODE','must be source-derived-real-bundle');
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function makeBaselineState(model){
  return {
    surfaceIds:model.surfaceProgram.map(x=>x.id),
    owners:Object.fromEntries(model.surfaceProgram.map(x=>[x.id,x.owner])),
    firstPlanes:Object.fromEntries(model.surfaceProgram.map(x=>[x.id,x.firstPlane])),
    primaryMax:Object.fromEntries(model.surfaceProgram.map(x=>[x.id,x.primaryMax])),
    densities:Object.fromEntries(model.surfaceProgram.map(x=>[x.id,x.density])),
    repeatedRecordsDefault:model.minimalityRules.repeatedRecordsDefault,
    longDescriptionBoldForbidden:model.minimalityRules.longDescriptionBoldForbidden,
    iconSystem:model.minimalityRules.icons,
    asciiDirectional:model.minimalityRules.asciiDirectionalGlyphsInCanonicalTouchedActions,
    materialBoundary:model.minimalityRules.materialBoundaryMustRemainVisible,
    globalResolver:false,
    secondBusinessAuthority:false,
    capabilityClosure:true,
    c5CompletionGate:true,
    semanticOrderInvariant:true,
    reducedMotion:true,
    focusVisible:true,
    statusColorOnly:model.styleMetrics.statusColorOnlyAllowed,
    overflow:model.styleMetrics.mobileHorizontalOverflowAllowed,
    rowMax:model.styleMetrics.desktopCompactRowMaxPx,
    controlMin:model.styleMetrics.controlMinPx,
    descriptionWeightMax:model.styleMetrics.descriptionWeightMax,
    motionMax:model.styleMetrics.motionMaxMs,
    procedureIds:CANONICAL_PROCEDURES.slice(),
    humanAuthority:true,
    evidenceNotConclusion:true,
    mappingNotConformity:true,
    completedNotVerified:true,
    ratingNotProbability:true,
    internalApprovalNotIndependentAssurance:true,
    projectedObjectProfiles:Object.fromEntries(CANONICAL_SURFACES.map(id=>[id,[...CANONICAL_OBJECT_TYPE_PROFILE[id]]])),
    projectedObjectRoles:Object.keys(PROJECTED_OBJECT_TYPES),
    legacyPresentationRetired:true
  };
}

export function validateSemanticState(state){
  const errors=[];
  if(!sameSet(state.surfaceIds,CANONICAL_SURFACES))fail(errors,'CENSUS','surface set mismatch');
  if(!sameSet(state.procedureIds,CANONICAL_PROCEDURES))fail(errors,'PROCEDURES','procedure set mismatch');
  for(const id of CANONICAL_SURFACES){
    if(state.owners?.[id]!==EXPECTED_OWNERS[id])fail(errors,'OWNER',id);
    if(state.firstPlanes?.[id]==='technical')fail(errors,'FIRST_PLANE',id);
    if(Number(state.primaryMax?.[id])>1)fail(errors,'PRIMARY',id);
  }
  if(state.repeatedRecordsDefault!=='row-or-list')fail(errors,'DENSITY','repeated records');
  if(state.longDescriptionBoldForbidden!==true)fail(errors,'TYPE','long bold description');
  if(state.iconSystem!=='inline-lucide-compatible-svg'||state.asciiDirectional!==false)fail(errors,'ICON','non canonical icon');
  if(state.materialBoundary!==true)fail(errors,'BOUNDARY','hidden material boundary');
  if(state.globalResolver!==false)fail(errors,'OWNER','global resolver');
  if(state.secondBusinessAuthority!==false)fail(errors,'AUTHORITY','second business authority');
  if(state.capabilityClosure!==true)fail(errors,'E2','capability closure disabled');
  if(state.c5CompletionGate!==true)fail(errors,'C5','completion gate disabled');
  if(state.semanticOrderInvariant!==true)fail(errors,'RESPONSIVE','semantic order changed');
  if(state.reducedMotion!==true)fail(errors,'MOTION','reduced motion missing');
  if(state.focusVisible!==true)fail(errors,'A11Y','focus missing');
  if(state.statusColorOnly!==false)fail(errors,'STATUS','color only status');
  if(state.overflow!==false)fail(errors,'RESPONSIVE','horizontal overflow');
  if(Number(state.rowMax)>64)fail(errors,'DENSITY','row too tall');
  if(Number(state.controlMin)<44)fail(errors,'CONTROL','critical control too small');
  if(Number(state.descriptionWeightMax)>500)fail(errors,'TYPE','description too bold');
  if(Number(state.motionMax)>240)fail(errors,'MOTION','motion too slow');
  for(const invariant of ['humanAuthority','evidenceNotConclusion','mappingNotConformity','completedNotVerified','ratingNotProbability','internalApprovalNotIndependentAssurance'])if(state[invariant]!==true)fail(errors,'EPISTEMIC',invariant);
  if(state.legacyPresentationRetired!==true)fail(errors,'OBJECT_TYPE','legacy presentation not retired');
  if(!Array.isArray(state.projectedObjectRoles)||state.projectedObjectRoles.length!==Object.keys(PROJECTED_OBJECT_TYPES).length)fail(errors,'OBJECT_TYPE','role lattice drift');
  for(const id of CANONICAL_SURFACES){const profile=state.projectedObjectProfiles?.[id]||[];if(profile.join('|')!==(CANONICAL_OBJECT_TYPE_PROFILE[id]||[]).join('|'))fail(errors,'OBJECT_PROFILE',id);}
  return {ok:errors.length===0,errors};
}
