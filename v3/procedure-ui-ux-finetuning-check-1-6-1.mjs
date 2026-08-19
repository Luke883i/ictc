import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const contract=JSON.parse(await read('./procedure-ui-ux-ontoepistemic-contract-1-6.json'));
const ui=await read('./public/ui/procedure-ui-ux-1-6.js');
const integrity=await read('./public/ui/procedure-ui-ux-integrity-1-6.js');
const active=await read('./public/ui/active-experience.js');
const constitution=await read('./public/ui/experience-constitution.js');
const lifecycle=await read('./public/ui/experience-lifecycle.js');
const css=await read('./public/ui-convergence.css');
const grc=await read('./public/ui/grc-workspace-base.js');
const actionsRuntime=await read('./runtime/risk-action-fidelity.mjs');
const actionModel=await read('./runtime/grc-actions.mjs');
const scopeRuntime=await read('./runtime/standard-library-handler.mjs');
const lattice=await read('./public/ui/epistemic-lattice.js');
const render=await read('./public/ui/render.js');
const workspaces=await read('./public/ui/workspaces.js');
const common=await read('./public/ui/common.js');

assert.equal(contract.schemaVersion,'1.6.0');
assert.deepEqual(contract.scope,['RN-01','EC-01','AO-01','MC-01','AP-01']);
assert.equal(contract.globalDoD.totalMutations,600000);
assert.equal(contract.globalDoD.perProcedureMutations,100000);
assert.equal(contract.globalDoD.crossProcedureMutations,100000);
assert.equal(contract.globalDoD.surfaceInventoryCoverageMin,0.99);
assert.equal(contract.globalDoD.primaryActionsMax,1);
assert.equal(contract.globalDoD.materialQuestionsMax,1);
assert.equal(contract.globalDoD.primaryFactsMax,4);
assert.equal(contract.globalDoD.fakeCtaSurvivors,0);
assert.equal(contract.globalDoD.orphanRuntimeDecisions,0);

let surfaceCount=0,covered=0;
for(const code of contract.scope){
  const p=contract.procedures[code];assert.ok(p?.id&&p.businessProcess&&p.governedObject,`${code}: missing ontology`);assert.ok(p.stages.length>=5,`${code}: process stages too shallow`);assert.ok(p.surfaces.length>=5,`${code}: surface census too shallow`);
  for(const s of p.surfaces){surfaceCount++;if(s.id&&s.selector&&s.purpose&&s.phase&&s.primaryQuestion&&s.runtimeRead&&Array.isArray(s.writes)&&s.proof&&s.necessity)covered++;}
}
assert.ok(covered/surfaceCount>=0.99,`surface census ${covered}/${surfaceCount}`);
assert.equal(new Set(contract.crossCuttingFindings.map(x=>x.id)).size,contract.crossCuttingFindings.length,'finding ids must be unique');

// C0 preserves the 1.6 decision owner but removes temporal authority. The stable
// contract now follows the explicit presentation -> integrity -> journey phases.
assert.match(active,/installProcedureUiUxFinetuning/,'active experience must install the 1.6 presentation owner');
assert.match(active,/installProcedureUiUxIntegrity/,'active experience must install the 1.6 integrity guard');
assert.match(active,/installVisualEpistemicRuntime,installProcedureUiUxFinetuning,installProcedureUiUxIntegrity,installSequentialProcedureUx\]\)/,'C0 must compose current procedure UI participants under the active root');
assert.match(constitution,/Object\.freeze\(\['presentation','integrity','journey'\]\)/,'C0 phase order must be explicit');
assert.match(ui,/phase:'presentation',authority:'decision-presentation',exclusive:true/,'1.6 presentation must declare exclusive decision-presentation authority');
assert.match(integrity,/phase:'integrity',authority:'integrity-observer',exclusive:false/,'1.6 integrity must be a non-exclusive observer');
assert.doesNotMatch(ui,/queueMicrotask|setTimeout\(schedule/,'presentation authority must not depend on event-loop depth');
assert.doesNotMatch(integrity,/queueMicrotask|setTimeout\(enforce|setTimeout\(schedule/,'integrity authority must not depend on event-loop depth');
assert.equal((lifecycle.match(/queueMicrotask\(/g)||[]).length,1,'only the lifecycle may coalesce a render with one microtask');
assert.match(ui,/const OWNER='procedure-ui-ux-1-6'/);
assert.match(integrity,/const OWNER='procedure-ui-ux-1-6'/,'integrity guard must retain the same logical presentation family for DOM markers');
assert.match(ui,/uiuxPrimaryActionMax/);
assert.match(css,/Procedure UI\/UX 1\.6: CSP-safe final presentation geometry/);
assert.match(css,/44px/);
assert.match(css,/focus-visible/);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/30rem/,'mission grid must avoid four dense desktop columns');
assert.doesNotMatch(ui,/document\.createElement\('style'\)|document\.createElement\("style"\)/,'1.6 must not inject CSP-blocked inline style');
assert.doesNotMatch(integrity,/document\.createElement\('style'\)|document\.createElement\("style"\)/,'integrity must not inject CSP-blocked inline style');
assert.doesNotMatch(ui,/>Drilldown</i,'generic Drilldown CTA forbidden in new owner');
assert.ok(ui.includes('alreadyTuned')&&ui.includes('finishTuning'),'presentation owner must be idempotent across repeated lifecycle runs');
assert.ok(ui.includes("[data-open-plan],[data-open-source],[data-open-incident]"),'dialog opening must request lifecycle convergence');
assert.ok(ui.includes("requestExperienceLifecycle('procedure-dialog-open')"),'dialog convergence must use the constitutional lifecycle');

for(const token of ['Apri monitoraggio','Gestisci e consulta prove','Azioni eccezionali e prove','Classe proposta','Sintesi e rilevanza proposte dall’AI'])assert.ok(ui.includes(token),`RN UI contract missing ${token}`);
assert.ok(render.includes('data-run-mission')&&workspaces.includes('data-run-mission'),'RN base actions remain real runtime affordances before phase compression');

for(const token of ['Apri caso','Salva versione manuale','Chiedi una bozza all’AI','Analisi AI proposta','Conferma e invia caso'])assert.ok(ui.includes(token),`EC UI contract missing ${token}`);
assert.ok(workspaces.includes('data-answer-question')&&workspaces.includes('data-submit-incident')&&workspaces.includes('data-close-incident'));

for(const token of ['Conferma oggetto','Escludi dal registro','Riesamina oggetto'])assert.ok(ui.includes(token),`AO UI contract missing ${token}`);
assert.ok(grc.includes('/api/grc/objects/'),'AO runtime path must remain bound');

assert.ok(scopeRuntime.includes('/api/standards/requirement-scope'),'requirement scope runtime endpoint missing');
assert.ok(ui.includes("api('/api/standards/requirement-scope"),'UI must call requirement-scope owner');
assert.ok(ui.includes("for(const legacy of footer.querySelectorAll('[data-mapping-decision]'))legacy.remove()"),'legacy mapping decision fan-out must be removed from final DOM');
assert.ok(ui.includes('Decisioni registrate')&&ui.includes('Da decidere')&&ui.includes('Fuori perimetro'),'MC primary posture must be discrete counts');
assert.ok(ui.includes('Decidi perimetro')&&ui.includes('Decidi mapping'));
assert.doesNotMatch(ui,/coveragePercent/,'coverage percentage must not be consumed by the final presentation owner');
assert.ok(integrity.includes('input.required=true'),'new mapping proposals must require an explicit requirementRef');
assert.ok(integrity.includes('Rifiuta proposta incompleta'),'legacy proposal without requirementRef must not expose a fake scope CTA');
assert.ok(integrity.includes("decision:'rejected'"),'incomplete proposal repair must stay on the mapping decision runtime owner');

assert.ok(actionsRuntime.includes('/api/grc/actions/:id/verify'),'AP verify runtime endpoint missing');
assert.ok(ui.includes("api(`/api/grc/actions/${id}/verify`"),'AP UI must call real verify endpoint');
for(const token of ['Avvia lavoro','Invia a verifica','Riprendi lavoro','Verifica risultato','Segnala blocco'])assert.ok(ui.includes(token),`AP state CTA missing ${token}`);
assert.ok(ui.includes("for(const progress of [...footer.querySelectorAll('[data-action-progress]')])progress.remove()"),'legacy AP dual-state CTA must be killed from final DOM');
assert.ok(common.includes("'x-ictc-actor-id':`local-${state.role}`"),'client actor identity convention changed unexpectedly');
assert.ok(integrity.includes('id:`local-${state.role}`'),'UI actor guard must match the runtime request identity');
assert.ok(actionModel.includes("completedBy===actor.id")&&actionModel.includes('action-self-review-ack-required'),'self-review semantics must remain enforced by runtime');

assert.ok(lattice.includes("card.dataset.metaProcedure='epistemic-lattice'"),'EP-01 must remain explicitly meta-procedure, not eighth business process');
assert.ok(ui.includes('proof.append(card)'),'EP entry must move under Postura ICTC');
assert.ok(ui.includes("chip.textContent='Traccia disponibile'"),'raw atom count must not dominate the primary technical overview');

for(const id of ['fake-mc-na-mapping','orphan-ap-verification','ep-eighth-process'])assert.ok(contract.crossCuttingFindings.some(x=>x.id===id),`missing falsifier ${id}`);

console.log(JSON.stringify({ok:true,control:'PROCEDURE-UI-UX-ONTOEPISTEMIC-1-6-1+C0',procedures:contract.scope.length,surfaces:surfaceCount,surfaceCoverage:covered/surfaceCount,fakeCtaSurvivors:0,orphanRuntimeDecisions:0,primaryActionsMax:1,primaryFactsMax:4,runtimeIntegrityGuards:2,compositionRoot:'active-experience',phaseOrder:['presentation','integrity','journey']}));
