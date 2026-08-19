import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('.',import.meta.url);
const contract=JSON.parse(await readFile(new URL('./procedure-record-contract-2-4.json',root),'utf8'));
const ui=await readFile(new URL('./public/ui/procedure-ui-ux-1-6.js',root),'utf8');
const css=await readFile(new URL('./public/procedure-record-primitives-2-4.css',root),'utf8');
const incident=await readFile(new URL('./runtime/incident-market-handler.mjs',root),'utf8');
assert.equal(contract.schemaVersion,'2.4.0');
assert.deepEqual(contract.scope,['monitoring','incidents','objects','coverage','actions','risks','assurance']);
assert.equal(contract.invariants.cardFamiliesMax,1);assert.equal(contract.invariants.primaryActionsMax,1);assert.equal(contract.invariants.factsMax,4);assert.equal(contract.invariants.routineActionsInsideDisclosureMax,0);assert.equal(contract.invariants.evidenceMixedWithDecisionMax,0);assert.equal(contract.invariants.minimumControlPx,44);
for(const id of contract.scope){const p=contract.procedures[id];assert.ok(p?.code&&p.titleField&&p.primaryIntent&&p.localInvariant,`${id}: incomplete procedure adapter contract`);assert.ok(p.titleAuthority.length>=1);assert.ok(p.facts.length>=3&&p.facts.length<=4);}
for(const token of ['procedure-record-card','procedure-record-facts','procedure-action-rail','procedure-evidence-action','data-seq-ao-search','data-seq-ao-filter','Materiali acquisiti','Risultati dei monitoraggi e dei materiali acquisiti','Confronta con originale','caseTitle','tuneRisks','tuneAssurance'])assert.ok(ui.includes(token),`UI missing ${token}`);
for(const forbidden of ['Gestisci e consulta prove','Azioni eccezionali e prove','Alternative e prove','Frequenza e versione'])assert.equal(ui.includes(forbidden),false,`generic legacy disclosure survived: ${forbidden}`);
assert.match(css,/\.procedure-record-card/);assert.match(css,/\.procedure-action-rail/);assert.match(css,/\.procedure-record-facts/);assert.match(css,/\.procedure-linear-review/);
assert.match(incident,/caseTitle=asString\(input\.caseTitle,160\)/);assert.match(incident,/titleAuthority:caseTitle\?'human':'derived-legacy'/);
assert.match(ui,/phase:'presentation',authority:'decision-presentation',exclusive:true/);assert.match(ui,/const OWNER='procedure-ui-ux-1-6'/);
console.log(JSON.stringify({ok:true,contract:'2.4.0',procedures:contract.scope.length,primitive:contract.primitive,invariants:Object.keys(contract.invariants).length}));
