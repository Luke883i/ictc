const AXES=Object.freeze(['declared','built','wired','projected-authorized','ui-exposed','actionable','durable-readback','evidenced']);
const SURFACES=Object.freeze(['home','processes','monitoring','incidents','objects','coverage','actions','risks','assurance','admin','epistemic','proof','ai-settings']);
const PROCEDURES=Object.freeze(['monitoring','incidents','objects','coverage','actions','risks','assurance']);
const CODES=Object.freeze({monitoring:'RN-01',incidents:'EC-01',objects:'AO-01',coverage:'MC-01',actions:'AP-01',risks:'RC-01',assurance:'AR-01'});
const EXTERNAL=Object.freeze(['E3-HUMAN','E3-GOV','E4-DEPLOY']);
const INTERNAL=Object.freeze(['C5-SEMANTIC-OWNER-COMPRESSION','UIUX-CONVERGE-0','GAP-020','GAP-021']);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sameSet=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&a.every(x=>b.includes(x));
export const CAPABILITY_CLOSURE_AXES=AXES;
export const CAPABILITY_CLOSURE_SURFACES=SURFACES;
export const CAPABILITY_CLOSURE_PROCEDURES=PROCEDURES;

export function validateClosureModel(model,ctx={}){
  const failures=[];const ck=(v,code,detail='')=>{if(!v)failures.push({code,detail});};
  ck(model?.schemaVersion==='1.0.0'&&model?.modelId==='CAPABILITY-CLOSURE-E2','SCHEMA');
  ck(model?.classification==='uiux-entry-gate-not-a-serial-slice'&&model?.createsNewSerialSlice===false,'NO_SERIAL_BRIDGE');
  ck(model?.evidenceGrade==='E2-repository-runtime-ui-closure'&&model?.status==='E2-CLOSED-CANONICAL-13','STATUS');
  ck(eq(model?.closureAxes,AXES),'AXES');
  const units=model?.surfaceUnits||[];ck(units.length===13,'SURFACE_COUNT',String(units.length));
  ck(sameSet(units.map(x=>x.id),SURFACES),'SURFACE_CENSUS');
  ck(new Set(units.map(x=>x.id)).size===units.length&&new Set(units.map(x=>x.identityKey)).size===units.length,'UNIT_UNIQUENESS');
  ck(units.every(x=>x.terminal==='E2-CLOSED'&&x.root&&x.mode),'TERMINAL');
  const inventory=ctx.surfaceInventory||[];
  if(inventory.length){ck(sameSet(inventory.map(x=>x.id),SURFACES),'UIUX_CENSUS');for(const u of units){const i=inventory.find(x=>x.id===u.id);ck(Boolean(i)&&i.root===u.root,'ROOT_BINDING',u.id);}}
  const adapters=ctx.adapters||[];const handlerPlan=new Set(ctx.handlerPlan||[]),handlerMap=ctx.handlerMap||{};
  const procUnits=units.filter(x=>x.kind==='procedure');ck(eq(procUnits.map(x=>x.id),PROCEDURES),'PROCEDURE_CENSUS');
  for(const id of PROCEDURES){const u=units.find(x=>x.id===id),a=adapters.find(x=>x.id===id);ck(Boolean(u),'PROCEDURE_UNIT',id);if(!u)continue;ck(u.code===CODES[id]&&u.adapterId===id&&u.mode==='write','PROCEDURE_IDENTITY',id);if(a){ck(a.surface===u.adapterSurface,'ADAPTER_SURFACE',id);ck(eq(a.subjectTypes,u.subjectTypes),'SUBJECT_BINDING',id);ck(eq(a.writeRoutes,u.writeRoutePrefixes),'ROUTE_BINDING',id);}else if(adapters.length)ck(false,'ADAPTER_MISSING',id);ck(Array.isArray(u.handlerKeys)&&u.handlerKeys.length>0,'HANDLER_KEYS',id);if(handlerPlan.size)for(const key of u.handlerKeys)ck(handlerPlan.has(key),'HANDLER_PLAN',`${id}:${key}`);if(handlerMap[id])ck(eq(u.handlerKeys,handlerMap[id]),'HANDLER_BINDING',id);}
  for(const u of units){if(u.mode==='write')ck(Array.isArray(u.writeRoutePrefixes)&&u.writeRoutePrefixes.length>0,'WRITE_ROUTE_REQUIRED',u.id);else ck(Array.isArray(u.projectionRefs)&&u.projectionRefs.length>0,'PROJECTION_REQUIRED',u.id);for(const p of [...(u.runtimeEvidence||[]),...(u.uiEvidence||[]),...(u.journeyEvidence||[])])ck(typeof p==='string'&&p.length>4,'EVIDENCE_PATH',`${u.id}:${p}`);}
  const dod=model?.machineReadableDoD||{},rules=dod.rules||[];ck(dod.terminalState==='E2-CLOSED'&&rules.length===14,'DOD_RULE_COUNT');ck(new Set(rules.map(x=>x.id)).size===14&&rules.every(x=>x.required===true&&x.kind&&x.description),'DOD_RULE_SHAPE');ck(Object.values(dod.completion||{}).every(v=>v===true),'DOD_COMPLETION');
  const h=model?.historicalReconciliation||{};ck(h.scope==='current-canonical-user-facing-surface-inventory'&&h.surfaceCount===13&&h.closedCount===13&&h.procedureCount===7,'HISTORICAL_SCOPE');ck(eq(h.remainingInternal,INTERNAL),'HISTORICAL_INTERNAL');ck(eq(h.remainingExternal,EXTERNAL),'HISTORICAL_EXTERNAL');ck(String(h.claim||'').includes('current canonical 13-surface inventory')&&String(h.claim||'').includes('does not assert'),'HISTORICAL_CLAIM');
  const m=model?.mutationEvidence||{};ck(m.trials===10000000&&m.materialFamilies===64&&m.survivors===0&&m.harnessErrors===0&&/^[a-f0-9]{64}$/.test(m.digest||''),'MUTATION_EVIDENCE');
  const ub=model?.uiuxBinding||{};ck(ub.entryGate===true&&ub.rerunBeforeDone===true&&ub.crossSurfaceWorkUnit==='UXW-14-CROSS-SURFACE-FALSIFICATION'&&String(ub.ownerCompressionGate||'').includes('C5-SEMANTIC-OWNER-COMPRESSION'),'UIUX_BINDING');
  const source=ctx.sourceEvidence||{};for(const key of ['productBoundary','adapterRegistry','handlerRegistry','bootstrapProjection','compositionRoot','receiptSubject','persistBeforeVisible','projectionReadback','sevenProcedureBrowser','browserInCi','externalRails','c5Gate'])if(Object.keys(source).length)ck(source[key]===true,'SOURCE_EVIDENCE',key);
  if(ctx.authority){ck(ctx.authority?.planningState?.completedThrough==='UIUX-CONVERGE-0'&&ctx.authority?.planningState?.nextSerialSlice==='S4-A6-CLOSE'&&ctx.authority?.planningState?.nextSerialState==='blocked'&&ctx.authority?.planningState?.noNewSerialBridge===true,'AUTHORITY_PLAN');const c5=(ctx.authority?.conditionalSlices||[]).find(x=>x.id==='C5-SEMANTIC-OWNER-COMPRESSION');ck(Boolean(c5)&&c5.state==='done'&&String(c5.mustResolveBefore).includes('UIUX-CONVERGE-0'),'AUTHORITY_C5');}
  if(ctx.prototype){ck(ctx.prototype?.createsNewSerialSlice===false&&ctx.prototype?.nextSerialSlice==='UIUX-CONVERGE-0','PROTOTYPE_NO_BRIDGE');ck(ctx.prototype?.capabilityClosure?.status==='E2-CLOSED-CANONICAL-13'&&ctx.prototype?.capabilityClosure?.surfaceCount===13,'PROTOTYPE_CLOSURE');}
  const cb=String(model?.claimBoundary||'').toLowerCase();for(const t of ['representative-human usability','deployment effectiveness','protected-branch enforcement','enterprise-ready'])ck(cb.includes(t),'CLAIM_BOUNDARY',t);
  return failures;
}
