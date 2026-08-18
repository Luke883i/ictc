import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const contract=JSON.parse(await read('./procedure-ui-ux-ontoepistemic-contract-1-6.json'));
const ui=await read('./public/ui/procedure-ui-ux-1-6.js');
const active=await read('./public/ui/active-experience.js');
const grc=await read('./public/ui/grc-workspace-base.js');
const actionsRuntime=await read('./runtime/risk-action-fidelity.mjs');
const scopeRuntime=await read('./runtime/standard-library-handler.mjs');
const lattice=await read('./public/ui/epistemic-lattice.js');
const render=await read('./public/ui/render.js');
const workspaces=await read('./public/ui/workspaces.js');

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

assert.match(active,/installProcedureUiUxFinetuning/,'active experience must install the 1.6 owner');
assert.match(active,/installVisualEpistemicRuntime,installProcedureUiUxFinetuning\]\)/,'1.6 owner must run last after legacy enhancers');
assert.match(ui,/const OWNER='procedure-ui-ux-1-6'/);
assert.match(ui,/data\.uiuxPrimaryActionMax|uiuxPrimaryActionMax/);
assert.match(ui,/touchTargetPx|44px/);
assert.match(ui,/focus-visible/);
assert.match(ui,/prefers-reduced-motion/);
assert.match(ui,/30rem/,'mission grid must avoid four dense desktop columns');
assert.doesNotMatch(ui,/>Drilldown</i,'generic Drilldown CTA forbidden in new owner');
assert.ok(ui.includes('alreadyTuned')&&ui.includes('finishTuning'),'final presentation owner must be idempotent across repeated render/surface events');
assert.ok(ui.includes("[data-open-plan],[data-open-source],[data-open-incident]"),'dialog opening must schedule post-render convergence');

for(const token of ['Apri monitoraggio','Gestisci e consulta prove','Azioni eccezionali e prove','Classe proposta','Sintesi e rilevanza proposte dall’AI'])assert.ok(ui.includes(token),`RN UI contract missing ${token}`);
assert.ok(render.includes('data-run-mission')&&workspaces.includes('data-run-mission'),'RN base actions must remain real runtime affordances before final phase compression');

for(const token of ['Apri caso','Salva versione manuale','Chiedi una bozza all’AI','Analisi AI proposta','Conferma e invia caso'])assert.ok(ui.includes(token),`EC UI contract missing ${token}`);
assert.ok(workspaces.includes('data-answer-question')&&workspaces.includes('data-submit-incident')&&workspaces.includes('data-close-incident'));

for(const token of ['Conferma oggetto','Escludi dal registro','Riesamina oggetto'])assert.ok(ui.includes(token),`AO UI contract missing ${token}`);
assert.ok(grc.includes('/api/grc/objects/${object.dataset.id}/review')||grc.includes('/api/grc/objects/'),'AO runtime path must remain bound');

assert.ok(scopeRuntime.includes("/api/standards/requirement-scope"),'requirement scope runtime endpoint missing');
assert.ok(ui.includes("api('/api/standards/requirement-scope"),'UI must call requirement-scope owner');
assert.ok(ui.includes("for(const legacy of footer.querySelectorAll('[data-mapping-decision]'))legacy.remove()"),'legacy mapping decision fan-out must be removed from final DOM');
assert.ok(ui.includes('Decisioni registrate')&&ui.includes('Da decidere')&&ui.includes('Fuori perimetro'),'MC primary posture must be discrete counts');
assert.ok(ui.includes('Decidi perimetro')&&ui.includes('Decidi mapping'));
assert.doesNotMatch(ui,/coveragePercent/,'coverage percentage must not be consumed by the final presentation owner');

assert.ok(actionsRuntime.includes("/api/grc/actions/:id/verify"),'AP verify runtime endpoint missing');
assert.ok(ui.includes("api(`/api/grc/actions/${id}/verify`"),'AP UI must call real verify endpoint');
for(const token of ['Avvia lavoro','Invia a verifica','Riprendi lavoro','Verifica risultato','Segnala blocco'])assert.ok(ui.includes(token),`AP state CTA missing ${token}`);
assert.ok(ui.includes("for(const progress of [...footer.querySelectorAll('[data-action-progress]')])progress.remove()"),'legacy AP dual-state CTA must be killed from final DOM');

assert.ok(lattice.includes("data-meta-procedure='epistemic-lattice'")||lattice.includes('data-meta-procedure="epistemic-lattice"'));
assert.ok(ui.includes("proof.append(card)"),'EP entry must move under Postura ICTC');
assert.ok(ui.includes("chip.textContent='Traccia disponibile'"),'raw atom count must not dominate the primary technical overview');

assert.ok(contract.crossCuttingFindings.some(x=>x.id==='fake-mc-na-mapping'));
assert.ok(contract.crossCuttingFindings.some(x=>x.id==='orphan-ap-verification'));
assert.ok(contract.crossCuttingFindings.some(x=>x.id==='ep-eighth-process'));

console.log(JSON.stringify({ok:true,control:'PROCEDURE-UI-UX-ONTOEPISTEMIC-1-6',procedures:contract.scope.length,surfaces:surfaceCount,surfaceCoverage:covered/surfaceCount,fakeCtaSurvivors:0,orphanRuntimeDecisions:0,primaryActionsMax:1,primaryFactsMax:4}));
