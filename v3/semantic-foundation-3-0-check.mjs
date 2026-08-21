import { BUSINESS_GLOSSARY, IMPORTANCE_DIMENSIONS, PROTO_LEGAL_RULE } from './public/ui/semantic-foundation-model.js';
import { HUMAN_ACTIONS, HUMAN_ACTION_BINDINGS, MATERIAL_ACTION_COUNT } from './public/ui/semantic-foundation-actions.js';
import { PROCEDURE_LANGUAGE, AUDIT_CLOSURE } from './public/ui/semantic-foundation-processes.js';

const failures=[];const check=(condition,message)=>{if(!condition)failures.push(message);};
const importance=new Set(IMPORTANCE_DIMENSIONS.map(x=>x.id));
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
}
check(/non significa giuridicamente non applicabile/i.test(HUMAN_ACTIONS['mapping.na'].boundary),'work-scope vs legal applicability separation drift');
check(/non equivale a notifica/i.test(HUMAN_ACTIONS['incident.submit'].boundary),'internal incident submit vs external notification separation drift');
check(/non sospende obblighi/i.test(HUMAN_ACTIONS['admin.procedures.apply'].boundary),'procedure availability vs organizational obligations separation drift');
if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}console.log(JSON.stringify({ok:true,glossaryTerms:Object.keys(BUSINESS_GLOSSARY).length,processes:Object.keys(PROCEDURE_LANGUAGE).length,materialActions:MATERIAL_ACTION_COUNT,importanceDimensions:IMPORTANCE_DIMENSIONS.length,auditFindings:AUDIT_CLOSURE.totalFindings}));
