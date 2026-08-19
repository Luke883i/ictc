import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('.',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const contract=JSON.parse(await read('./procedure-record-contract-2-4.json'));
const [ui,css,incident,seqDom,seqAoMc,seqAp,seqUx]=await Promise.all(['./public/ui/procedure-ui-ux-1-6.js','./public/procedure-record-primitives-2-4.css','./runtime/incident-market-handler.mjs','./public/ui/procedure-sequential-dom.js','./public/ui/procedure-sequential-ao-mc.js','./public/ui/procedure-sequential-ap.js','./public/ui/procedure-sequential-ux-2-2.js'].map(read));
assert.equal(contract.schemaVersion,'2.4.0');
assert.deepEqual(contract.scope,['monitoring','incidents','objects','coverage','actions','risks','assurance']);
assert.equal(contract.invariants.cardFamiliesMax,1);assert.equal(contract.invariants.primaryActionsMax,1);assert.equal(contract.invariants.factsMax,4);assert.equal(contract.invariants.routineActionsInsideDisclosureMax,0);assert.equal(contract.invariants.evidenceMixedWithDecisionMax,0);assert.equal(contract.invariants.minimumControlPx,44);assert.equal(contract.invariants.listItemsBeforeSearchFacet,12);
for(const id of contract.scope){const p=contract.procedures[id];assert.ok(p?.code&&p.titleField&&p.primaryIntent&&p.localInvariant,`${id}: incomplete procedure adapter contract`);assert.ok(p.titleAuthority.length>=1);assert.ok(p.facts.length>=3&&p.facts.length<=4);}
for(const token of ['procedure-record-card','procedure-record-facts','procedure-action-rail','procedure-evidence-action','data-seq-ao-search','data-seq-ao-filter','Materiali acquisiti','Risultati dei monitoraggi e dei materiali acquisiti','Confronta con originale','caseTitle','tuneRisks','tuneAssurance'])assert.ok(ui.includes(token),`UI missing ${token}`);
for(const token of ['procedure-action-overflow-body','oldSlot?.children','for(const generated of',"applicable:'Nel perimetro'","unknown:'Informazioni insufficienti'"])assert.ok(ui.includes(token),`UI idempotence/localization guard missing ${token}`);
for(const forbidden of ['Gestisci e consulta prove','Azioni eccezionali e prove','Alternative e prove','Frequenza e versione'])assert.equal(ui.includes(forbidden),false,`generic legacy disclosure survived: ${forbidden}`);
assert.match(css,/\.procedure-record-card/);assert.match(css,/\.procedure-action-rail/);assert.match(css,/\.procedure-record-facts/);assert.match(css,/\.procedure-linear-review/);assert.match(css,/\.executive-boundary>summary\{min-height:44px/);
assert.match(incident,/caseTitle=asString\(input\.caseTitle,160\)/);assert.match(incident,/titleAuthority:caseTitle\?'human':'derived-legacy'/);assert.match(incident,/providedCaseTitle\?'human':'derived-legacy'/);
assert.match(ui,/phase:'presentation',authority:'decision-presentation',exclusive:true/);assert.match(ui,/const OWNER='procedure-ui-ux-1-6'/);
assert.match(seqDom,/export function ensureQueueWindow/);assert.match(seqDom,/data-seq-queue-more/);assert.match(seqDom,/restoreLegacyOverflow/);assert.match(seqDom,/filter-queue-text/);assert.match(seqDom,/filter-queue-state/);
assert.match(seqAoMc,/ensureQueueWindow/);assert.match(seqAp,/ensureQueueWindow/);assert.doesNotMatch(seqAoMc,/compactList/);assert.doesNotMatch(seqAp,/compactList/);assert.match(seqUx,/renderExtendedGrcQueue/);assert.match(seqUx,/\['risks','assurance'\]/);
console.log(JSON.stringify({ok:true,contract:'2.4.0',procedures:contract.scope.length,primitive:contract.primitive,invariants:Object.keys(contract.invariants).length,queuePrimitive:'search+facet+window'}));
