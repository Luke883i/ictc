import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Store } from './store.mjs';
import { sha256 } from './domain.mjs';
import { normalizeDecisionContext, decisionContextSha256, DECISION_CONTEXT_CLAIM_BOUNDARY } from './runtime/decision-context.mjs';
import { applyCatalogDecision } from './runtime/model.mjs';
import { recordSourceImpact } from './runtime/process-handoffs.mjs';
import { normalizeGrcObject, reviewGrcObject, attestGrcObject, normalizeMapping, decideMapping } from './runtime/grc-model.mjs';
import { normalizeAction, adoptAction, progressAction, verifyAction } from './runtime/grc-actions.mjs';
import { normalizeRisk, reviewRisk, decideRiskTreatment } from './runtime/grc-risks.mjs';
import { normalizeAssuranceCase, attachAssuranceHumanDraft, approveAssurance } from './runtime/grc-assurance.mjs';
import { decideRequirementScope } from './runtime/requirement-scope.mjs';
import { decideStandardScope, standardLibraryProjection } from './runtime/standard-library.mjs';
import { canonicalDecisionProjection } from './runtime/decision-projection.mjs';

const contract=JSON.parse(await readFile(new URL('./human-reality-runtime-contract.json',import.meta.url),'utf8'));
const actor={id:'human-admin',role:'admin',displayName:'Human Admin'};
const idFactory=prefix=>`${prefix}-hr1`;
const rawContext={
  operativeIntent:'Prendere una decisione utile senza nascondere ciò che non sappiamo.',
  uncertainties:[{kind:'unknown',statement:'Il vendor non ha ancora confermato la portata.',sourceRefs:['vendor-ticket-17']},{kind:'conflict',statement:'Security e Legal leggono diversamente la materialità.'}],
  positions:[{stance:'dissent',statement:'Legal ritiene prematura la chiusura.',actorRef:{type:'role',id:'legal'},basisRefs:['memo-42']}],
  constraints:[{kind:'time',statement:'Finestra di notifica in corso.',expiresAt:'2026-09-29T10:00:00Z'},{kind:'dependency',statement:'Collector esterno indisponibile.'}],
  handoffs:[{fromRef:{type:'team',id:'security'},toRef:{type:'team',id:'legal'},note:'Trasferiti fatti e clock, decisione ancora aperta.'}],
  escalation:{status:'requested',targetRef:{type:'role',id:'dpo'},reason:'Dissenso sulla qualificazione.'},
  exception:{kind:'temporary-deviation',rationale:'Controllo primario indisponibile.',expiresAt:'2026-09-30T10:00:00Z',compensatingControlRefs:['control-alt-1']},
  urgency:{reason:'Clock normativo potenziale in corso.',triggerAt:'2026-09-28T10:00:00Z',dueAt:'2026-09-29T10:00:00Z'},
  limitations:['Il contesto è dichiarato dagli attori e non prova la verità dei fatti.'],
  recovery:{kind:'reopen',priorDecisionRef:'decision-previous',reason:'Nuova evidenza ricevuta.'}
};
const ctx=normalizeDecisionContext(rawContext);
assert.equal(contract.contractId,'HUMAN-REALITY-RUNTIME-1');
assert.equal(contract.authorityEffect,'NONE');assert.equal(contract.sourceOfTruth,false);assert.equal(contract.writer,false);
assert.equal(contract.humanPrimitives.length,20);assert.equal(new Set(contract.humanPrimitives.map(x=>x.id)).size,20);
assert.equal(contract.contextAxes.length,10);assert.equal(contract.developerDoD.length,60);assert.equal(contract.metrics.length,20);assert.equal(contract.checklist.length,20);assert.equal(contract.failureFamilies.length,32);
const covered=new Set(contract.contextAxes.flatMap(x=>x.humanPrimitives));assert.equal(covered.size,20);for(let i=1;i<=20;i++)assert.ok(covered.has(`H${String(i).padStart(2,'0')}`));
assert.equal(ctx.authorityEffect,'NONE');assert.equal(ctx.claimBoundary,DECISION_CONTEXT_CLAIM_BOUNDARY);assert.equal(ctx.uncertainties.length,2);assert.equal(ctx.positions[0].stance,'dissent');assert.equal(ctx.exception.kind,'temporary-deviation');assert.equal(ctx.recovery.kind,'reopen');
assert.equal(decisionContextSha256(ctx),sha256(ctx));
assert.equal(normalizeDecisionContext(null),null);
assert.throws(()=>normalizeDecisionContext({uncertainties:[{kind:'certain',statement:'x'}]}),e=>e.code==='decision-context-uncertainty-kind-invalid');
assert.throws(()=>normalizeDecisionContext({positions:[{stance:'winner',statement:'x'}]}),e=>e.code==='decision-context-position-stance-invalid');
assert.throws(()=>normalizeDecisionContext({constraints:[{kind:'money',statement:'x'}]}),e=>e.code==='decision-context-constraint-kind-invalid');
assert.throws(()=>normalizeDecisionContext({positions:[{stance:'dissent',statement:'x',actorRef:{type:'magic',id:'x'}}]}),e=>e.code==='decision-context-ref-type-invalid');
assert.throws(()=>normalizeDecisionContext({urgency:{reason:'x',triggerAt:'2026-09-30T00:00:00Z',dueAt:'2026-09-29T00:00:00Z'}}),e=>e.code==='decision-context-urgency-order-invalid');
assert.throws(()=>normalizeDecisionContext({operativeIntent:'x'.repeat(4001)}),e=>e.code==='decision-context-text-too-long');
assert.throws(()=>normalizeDecisionContext({limitations:Array.from({length:21},(_,i)=>String(i))}),e=>e.code==='decision-context-list-too-long');

// Existing decision owners retain their outcome semantics while carrying optional context.
const sourceBase={id:'source-1',title:'Fonte',state:'candidate',decisions:[],observations:[{title:'Fonte',observedAt:'2026-09-28T08:00:00Z'}]};
const sourcePlain=applyCatalogDecision(structuredClone(sourceBase),'verified','Verificata',actor.id);
const sourceCtx=applyCatalogDecision(structuredClone(sourceBase),'verified','Verificata',actor.id,rawContext);
assert.equal(sourcePlain.state,sourceCtx.state);assert.equal(sourceCtx.decisions.at(-1).decisionContext.operativeIntent,ctx.operativeIntent);assert.equal(sourcePlain.decisions.at(-1).decisionContext,undefined);
const impactSource={...structuredClone(sourceCtx),impactAssessments:[]};const impact=recordSourceImpact(impactSource,{outcome:'needs-analysis',reason:'Serve analisi',decisionContext:rawContext},actor);assert.equal(impact.decisionContext.escalation.status,'requested');

const object=normalizeGrcObject({type:'system',name:'ERP',owner:'owner-1',sourceAuthority:'CMDB'},actor,{idFactory});reviewGrcObject(object,{decision:'active',reason:'Owner e fonte verificati',decisionContext:rawContext},actor);assert.equal(object.reviews.at(-1).decisionContext.positions[0].stance,'dissent');attestGrcObject(object,{reason:'Riesame versione',decisionContext:rawContext},actor);assert.equal(object.attestations.at(-1).decisionContext.recovery.kind,'reopen');
const mapping=normalizeMapping({requirementLabel:'Requirement X',targetIds:['obj-1']},actor,{idFactory});decideMapping(mapping,{decision:'gap',reason:'Gap confermato',decisionContext:rawContext},actor);assert.equal(mapping.decisions.at(-1).decisionContext.constraints[0].kind,'time');
const action=normalizeAction({title:'Correggere gap',proposedPriority:3},actor,{idFactory});adoptAction(action,{priority:2,reason:'Priorità umana',decisionContext:rawContext},actor);assert.equal(action.decisions.at(-1).decisionContext.operativeIntent,ctx.operativeIntent);progressAction(action,{state:'ready-for-review',note:'Completato'},actor);verifyAction(action,{decision:'rework',reason:'Evidenza insufficiente',decisionContext:rawContext},actor);assert.equal(action.verifications.at(-1).decisionContext.limitations.length,1);
const cancel=normalizeAction({title:'Azione cancellabile'},actor,{idFactory:prefix=>`${prefix}-cancel`});adoptAction(cancel,{reason:'Adotta'},actor);progressAction(cancel,{state:'cancelled',note:'Non più necessaria',decisionContext:rawContext},actor);assert.equal(cancel.decisions.at(-1).kind,'cancellation');assert.equal(cancel.decisions.at(-1).decisionContext.exception.kind,'temporary-deviation');
const risk=normalizeRisk({title:'Scenario',likelihood:3,impact:4},actor,{idFactory});reviewRisk(risk,{assessmentType:'inherent',likelihood:3,impact:4,reason:'Valutazione',decisionContext:rawContext},actor);assert.equal(risk.reviews.at(-1).decisionContext.uncertainties[0].kind,'unknown');decideRiskTreatment(risk,{decision:'mitigate',reason:'Mitigare',owner:'owner-1',decisionContext:rawContext},actor);assert.equal(risk.treatments.at(-1).decisionContext.handoffs.length,1);
const assurance=normalizeAssuranceCase({title:'Q',requestText:'Confermare il controllo'},actor,{idFactory});attachAssuranceHumanDraft(assurance,{questions:[{id:'q1',question:'Controllo?',draftAnswer:'Da verificare'}]},actor);approveAssurance(assurance,{reason:'Approvazione umana',answers:[{questionId:'q1',disposition:'answered',answer:'Sì, con limite'}],decisionContext:rawContext},actor);assert.equal(assurance.approvals.at(-1).decisionContext.escalation.status,'requested');
const standards={settings:{organization:{name:'Org',scope:'',jurisdictions:[],sectors:[]}}};const lib=standardLibraryProjection(standards,actor);const frameworkId=lib.frameworks[0].id;const standardDecision=decideStandardScope(standards,{frameworkId,decision:'tracked',reason:'Rilevante per il perimetro',decisionContext:rawContext},actor);assert.equal(standardDecision.decisionContext.exception.kind,'temporary-deviation');
const reqState={};const req=decideRequirementScope(reqState,{requirementRef:'declared:REQ-1',decision:'applicable',reason:'Applicabile',decisionContext:rawContext},actor);assert.equal(req.decisionContext.urgency.reason,ctx.urgency.reason);

// Canonical human decision projection carries context but preserves the same human authority.
const projected=canonicalDecisionProjection({catalog:[sourceCtx],incidents:[],grcObjects:[object],grcMappings:[mapping],grcActions:[action,cancel],grcRisks:[risk],grcAssurance:[assurance]},actor);
assert.equal(projected.authority,'human-decision-projection');assert.ok(projected.records.some(r=>r.decisionContext?.authorityEffect==='NONE'));assert.ok(projected.records.every(r=>r.authority==='human'));

// Store binds normalized context into the hashed audit event and the append-only epistemic step.
const root=await mkdtemp(path.join(os.tmpdir(),'ictc-human-reality-'));
try{
  const store=await new Store(root).init();
  const envelope=await store.mutateDecided(actor,'human-reality.test-decided',{type:'catalog',id:'source-test'},{decision:'verified',reason:'test',decisionContext:rawContext},draft=>({id:'source-test',decision:'verified'}),{id:'hr-command-1'});
  assert.equal(envelope.result.decision,'verified');
  const state=store.snapshot(),event=state.audit.at(-1),digest=decisionContextSha256(ctx);
  assert.equal(event.metadata.decisionContextSha256,digest);assert.deepEqual(event.metadata.decisionContext,ctx);assert.ok(event.hash);assert.equal(store.verifyChain().ok,true);
  const steps=store.persistence.epistemicSteps();const step=steps.at(-1);assert.equal(step.command.decisionContextSha256,digest);assert.deepEqual(step.command.decisionContext,ctx);assert.ok(step.stepSha256);
  store.close();
}finally{await rm(root,{recursive:true,force:true});}

// Static coverage guards every intended existing checkpoint owner and prevents a parallel owner/store.
const sources=Object.fromEntries(await Promise.all([
  'runtime/model.mjs','runtime/process-handoffs.mjs','runtime/grc-model.mjs','runtime/grc-actions.mjs','runtime/grc-risks.mjs','runtime/grc-assurance.mjs','runtime/requirement-scope.mjs','runtime/standard-library-current.mjs','runtime/incidents.mjs','runtime/incident-market-handler.mjs','runtime/decision-projection.mjs','runtime/procedure-trace.mjs','store.mjs','runtime/epistemic-step.mjs'
].map(async rel=>[rel,await readFile(new URL(`./${rel}`,import.meta.url),'utf8')])));
for(const rel of ['runtime/model.mjs','runtime/process-handoffs.mjs','runtime/grc-model.mjs','runtime/grc-actions.mjs','runtime/grc-risks.mjs','runtime/grc-assurance.mjs','runtime/requirement-scope.mjs','runtime/standard-library-current.mjs','runtime/incidents.mjs'])assert.ok(sources[rel].includes('DecisionContext')||sources[rel].includes('decisionContext'),`context owner not instrumented: ${rel}`);
assert.ok(sources['runtime/incident-market-handler.mjs'].includes('closureDecisionContext'));
assert.ok(sources['store.mjs'].includes('decisionContextSha256'));assert.ok(sources['runtime/epistemic-step.mjs'].includes('decisionContextSha256'));assert.ok(sources['runtime/decision-projection.mjs'].includes('decisionContext'));assert.ok(sources['runtime/procedure-trace.mjs'].includes('decisionContext'));
for(const forbidden of ['HumanRealityStore','DecisionContextStore','humanRealityRegistry','decisionContextRegistry'])for(const [rel,src] of Object.entries(sources))assert.ok(!src.includes(forbidden),`parallel authority/store token ${forbidden} in ${rel}`);

console.log(JSON.stringify({ok:true,contract:contract.contractId,primitives:contract.humanPrimitives.length,contextAxes:contract.contextAxes.length,developerDoD:contract.developerDoD.length,metrics:contract.metrics.length,checklist:contract.checklist.length,checkpointActions:contract.instrumentedCheckpointActions.length,authorityEffect:contract.authorityEffect,claimBoundary:contract.claimBoundary}));
