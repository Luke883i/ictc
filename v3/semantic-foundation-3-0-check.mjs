import { readFile } from 'node:fs/promises';
import { BUSINESS_GLOSSARY, IMPORTANCE_DIMENSIONS, PROTO_LEGAL_RULE } from './public/ui/semantic-foundation-model.js';
import { HUMAN_ACTIONS, HUMAN_ACTION_BINDINGS, MATERIAL_ACTION_COUNT } from './public/ui/semantic-foundation-actions.js';
import { PROCEDURE_LANGUAGE, AUDIT_CLOSURE } from './public/ui/semantic-foundation-processes.js';
const failures=[];const check=(condition,message)=>{if(!condition)failures.push(message);};
const importance=new Set(IMPORTANCE_DIMENSIONS.map(x=>x.id));
const canonical=JSON.parse(await readFile(new URL('./procedure-contracts-1-3.json',import.meta.url),'utf8'));
const canonicalById=new Map((canonical.procedures||[]).map(x=>[x.id,x]));
check(Object.keys(BUSINESS_GLOSSARY).length>=15,'shared business glossary too small');
check(Object.keys(PROCEDURE_LANGUAGE).length===7,'semantic foundation must cover exactly seven business processes');
check(MATERIAL_ACTION_COUNT===19,'material human-action contract drift');
check(Object.keys(HUMAN_ACTION_BINDINGS).length===MATERIAL_ACTION_COUNT,'every material action must have a runtime binding');
for(const id of Object.keys(HUMAN_ACTIONS))check(Boolean(HUMAN_ACTION_BINDINGS[id]),`human action ${id} missing runtime binding`);
check(AUDIT_CLOSURE.visualFindings===528&&AUDIT_CLOSURE.codeDerivedFindings===378&&AUDIT_CLOSURE.totalFindings===906,'audit closure census drift');
check(AUDIT_CLOSURE.invariantFamilies===21&&AUDIT_CLOSURE.refactorNodes===25,'audit convergence lattice drift');
check(PROTO_LEGAL_RULE.requiredContext.length===7,'proto-legal context must keep seven bounded qualifiers');
const forbidden=/\b(certificat[oa]|pienamente conforme|nessun rischio|prova definitiva|obbligo certo|conforme automaticamente)\b/i;
const boundaryGuard=/\b(non|nessun[oa]|restano|distint[ioe]|non equivale|non significa)\b/i;
for(const [id,spec] of Object.entries(HUMAN_ACTIONS)){
  for(const field of ['procedure','label','object','effect','authority','evidence','boundary'])check(Boolean(spec[field]),`human action ${id} missing ${field}`);
  check(spec.procedure==='admin'||Object.hasOwn(PROCEDURE_LANGUAGE,spec.procedure),`human action ${id} has unknown procedure ${spec.procedure}`);
  check(Array.isArray(spec.importance)&&spec.importance.length>0,`human action ${id} missing importance`);
  for(const dimension of spec.importance||[])check(importance.has(dimension),`human action ${id} unknown importance dimension ${dimension}`);
  check(typeof spec.reversible==='boolean',`human action ${id} missing reversibility`);
  check(boundaryGuard.test(spec.boundary||''),`human action ${id} boundary is not explicit`);
  check(!forbidden.test(`${spec.label} ${spec.effect} ${spec.boundary}`),`human action ${id} uses legal-collapse language`);
}
for(const [id,p] of Object.entries(PROCEDURE_LANGUAGE)){
  for(const field of ['code','label','governs','question','evidence','boundary'])check(Boolean(p[field]),`procedure ${id} missing ${field}`);
  check(boundaryGuard.test(p.boundary),`procedure ${id} boundary is not explicit`);
  const authority=canonicalById.get(id);check(Boolean(authority),`procedure ${id} missing canonical registry authority`);
  if(authority){check(p.code===authority.code,`procedure ${id} code diverges from canonical registry`);check(p.label===authority.label,`procedure ${id} label diverges from canonical registry`);}
}
check(/non significa giuridicamente non applicabile/i.test(HUMAN_ACTIONS['mapping.na'].boundary),'work-scope vs legal applicability separation drift');
check(/non equivale a notifica/i.test(HUMAN_ACTIONS['incident.submit'].boundary),'internal incident submit vs external notification separation drift');
check(/non sospende obblighi/i.test(HUMAN_ACTIONS['admin.procedures.apply'].boundary),'procedure availability vs organizational obligations separation drift');
const active=await readFile(new URL('./public/ui/active-experience.js',import.meta.url),'utf8');
const runtime=await readFile(new URL('./public/ui/semantic-foundation-runtime.js',import.meta.url),'utf8');
const controls=await readFile(new URL('./public/ui/procedure-control-anchors-1-4.js',import.meta.url),'utf8');
const admin=await readFile(new URL('./public/ui/procedure-admin.js',import.meta.url),'utf8');
const composition=await readFile(new URL('./public/ui/semantic-composition-runtime.js',import.meta.url),'utf8');
const order=active.match(/const INSTALL_ORDER=Object\.freeze\(\[([^\]]+)\]\);/)?.[1]||'';
const requiredOrder=['installProcedureUiUxFinetuning','installProcedureUiUxIntegrity','installSequentialProcedureUx','installBusinessSurfaceConvergence27','installSemanticFoundation','installSemanticComposition'];
const positions=requiredOrder.map(name=>order.indexOf(name));
check(positions.every(x=>x>=0)&&positions.every((x,i)=>i===0||positions[i-1]<x),'semantic foundation/composition must preserve final enhancer order before lifecycle');
check(order.indexOf('installProcedureControlAnchors')>=0&&order.indexOf('installProcedureControlAnchors')<order.indexOf('installSemanticFoundation'),'constitutional annotation participant must register before semantic foundation schedules');
check(!runtime.includes('registerExperienceParticipant'),'semantic foundation must not create a sixth C0.1 participant');
check(!composition.includes('registerExperienceParticipant'),'semantic composition must not create a sixth C0.1 participant');
check(controls.includes("phase:'annotation'")&&controls.includes('annotateSemanticActions();'),'human-action semantics must converge through existing annotation participant');
check(controls.includes('control-annotation-change'),'conditional decision binding must replay annotation on selection change');
check(runtime.includes('[data-uiux-action-quick][data-next-state="done"]')||JSON.stringify(HUMAN_ACTION_BINDINGS).includes('data-uiux-action-quick'),'AP-01 final generated CTA binding missing');
check(!/annotateNode\([^}]+textContent\s*=/.test(runtime),'annotation metadata must not compete with exclusive visible presentation');
check(!runtime.includes("label(frame.querySelector('h1')"),'semantic foundation must not rewrite canonical procedure identity');
check(!runtime.includes("label(root.querySelector('#proofTitle')"),'semantic foundation must not rewrite canonical Evidenze ICTC identity');
check(admin.includes('#adminCenter [data-admin-view="overview"]'),'procedure policy panel must belong to one Admin view');
check(admin.includes('loadedPolicy=new Map')&&admin.includes('loadedPolicy=new Map(procedures.map'),'procedure policy diff must bind to loaded response');
check(admin.includes('if(renderImpact()===0)'),'procedure policy no-op write must fail closed');
check(!admin.includes('window.confirm'),'procedure policy impact must use structured in-UI confirmation');
if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}console.log(JSON.stringify({ok:true,glossaryTerms:Object.keys(BUSINESS_GLOSSARY).length,processes:Object.keys(PROCEDURE_LANGUAGE).length,materialActions:MATERIAL_ACTION_COUNT,importanceDimensions:IMPORTANCE_DIMENSIONS.length,auditFindings:AUDIT_CLOSURE.totalFindings,uiTopology:'constitutional-annotation+semantic-composition',identityAuthority:'canonical-procedure-registry+Evidenze-ICTC'}));
