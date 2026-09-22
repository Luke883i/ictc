export const CANONICAL_SURFACES=Object.freeze(['home','processes','monitoring','incidents','objects','coverage','actions','risks','assurance','admin','epistemic','proof','ai-settings']);
export const CANONICAL_PROCEDURES=Object.freeze(['monitoring','incidents','objects','coverage','actions','risks','assurance']);
export const EXPECTED_OWNERS=Object.freeze({
  home:'stable-shell.js',processes:'procedure-frame.js',monitoring:'procedure-frame.js',incidents:'procedure-frame.js',
  objects:'grc-workspace-3-2.js',coverage:'grc-workspace-3-2.js',actions:'grc-workspace-3-2.js',risks:'grc-workspace-3-2.js',assurance:'grc-workspace-3-2.js',
  admin:'admin-workspace-3-2.js',epistemic:'epistemic-workspace-3-2.js',proof:'proof-workspace-3-2.js','ai-settings':'actions.js/admin'
});
const PROCEDURE_SET=new Set(CANONICAL_PROCEDURES);
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
    internalApprovalNotIndependentAssurance:true
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
  return {ok:errors.length===0,errors};
}
