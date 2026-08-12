import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const contract=JSON.parse(await read('./procedure-finetuning-contract-1-4.json'));
const ui=await read('./public/ui/procedure-finetuning-1-4.js');
const css=await read('./public/procedure-finetuning-1-4.css');
const active=await read('./public/ui/active-experience.js');
const styles=await read('./public/styles.css');
const standards=await read('./runtime/standard-library-current.mjs');

assert.equal(contract.authority,'procedure-finetuning-contract');
assert.deepEqual(contract.scope,['RN-01','EC-01','AO-01','MC-01','AP-01']);
assert.deepEqual(contract.regressionOnly,['RC-01','AR-01']);
assert.equal(contract.globalDoD.seededScenariosPerProcess,1_000_000);
assert.equal(contract.globalDoD.operationalScenariosPerProcess,900_000);
assert.equal(contract.globalDoD.natureFalsificationHoldoutPerProcess,100_000);
assert.equal(contract.globalDoD.totalSeededScenarios,5_000_000);
assert.equal(contract.natureFalsification.holdoutPerProcess,100_000);
assert.equal(new Set(contract.natureFalsification.attacks).size,10);
assert.ok(contract.commonSubstrate.orientationOrder.join('|')==='object|why-here|epistemic-state|human-decision|evidence|next-action|handoff');
assert.ok(contract.commonSubstrate.cognitiveInvariants.length>=10);
for(const code of contract.scope){const p=contract.processes[code];assert.ok(p?.nature?.length>50,`${code} nature`);assert.ok(p?.ontologicalObject,`${code} object`);assert.ok(p?.purpose,`${code} purpose`);assert.ok(p?.claimBoundary,`${code} boundary`);assert.ok(p?.journey?.length>=6,`${code} journey`);for(const stage of p.journey){assert.ok(stage.stage&&stage.question&&stage.primaryIntent&&stage.evidence,`${code} stage contract`);}}
assert.deepEqual(contract.processes['RN-01'].sourceClasses,['binding-eu-law','binding-italian-law','competent-authority-decisions','public-jurisprudence-and-case-information-without-personal-data']);
assert.equal(contract.processes['RN-01'].contributors.length,2);
assert.ok(contract.processes['RN-01'].contributors.some(x=>x.kind==='scheduled-ai'));
assert.equal(contract.processes['RN-01'].schedulerUi.form,'internal-dialog');
assert.ok(contract.processes['AO-01'].auditorAcceptanceCriteria.length>=8);
assert.deepEqual(contract.processes['MC-01'].minimalAtom,['reference','concept','intent','expected-outcome','evidence-question','scope-status','source-authority','version']);
assert.match(contract.processes['AP-01'].claimBoundary,/completion is not verified closure/i);

for(const token of ['data.journeyProcess','data.journeyStage','data.journeyIntent','data.journeyAuthority','data.journeyEvidenceEffect']) assert.ok(ui.includes(token),token);
for(const id of ['monitoring','incidents','objects','coverage','actions']) assert.ok(ui.includes(`${id}:`),`runtime nature ${id}`);
for(const phrase of ['ICTC_RN01_MINING_POLICY','norme cogenti UE','giurisprudenza/casi pubblici senza dati personali','data-rn-open-scheduler','rnSchedulerDialog']) assert.ok(ui.includes(phrase),phrase);
for(const selector of ['data-object-review','data-object-attest','data-action-adopt','data-action-progress','data-mapping-decision','data-grc-evidence']) assert.ok(ui.includes(selector),selector);
assert.match(ui,/Completato non significa chiuso/);
assert.match(ui,/Posso dimostrare chi\/che cosa è questo oggetto/);
assert.match(ui,/una domanda alla volta/);
assert.match(ui,/Astrazioni neutrali ICTC/);
assert.ok(active.indexOf('installProcedureFinetuning')<active.indexOf('installVisualEpistemicRuntime'), 'finetuning must precede final visual normalizer');
assert.ok(styles.indexOf("procedure-finetuning-1-4.css")<styles.indexOf("visual-epistemic-runtime.css"));
assert.ok(styles.indexOf("visual-epistemic-runtime.css")<styles.indexOf("ui-convergence.css"));
assert.match(css,/min-height:44px/);
assert.match(css,/finetune-concept-drilldown[^}]*background:var\(--surface,#fff\)!important/);
assert.match(standards,/projectConceptAtoms/);
for(const field of ['reference','concept','intent','expectedOutcome','evidenceQuestion','scopeStatus','sourceAuthority','version']) assert.ok(standards.includes(field),`concept atom ${field}`);
assert.match(standards,/non è testo normativo/);
assert.match(standards,/non dimostrano applicabilità legale|does not validate|not be read as authoritative normative wording/i);
console.log(JSON.stringify({ok:true,authority:contract.authority,scope:contract.scope,journeyStages:Object.fromEntries(contract.scope.map(code=>[code,contract.processes[code].journey.length])),natureAttacks:contract.natureFalsification.attacks.length,controlAnchorFields:contract.commonSubstrate.controlAnchor.requiredAttributes}));
