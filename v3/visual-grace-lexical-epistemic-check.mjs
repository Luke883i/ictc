import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [doc,index,copy,frame,router,primitives,proof,css,anatomy,contractsRaw,meta,epistemic,controller,stableShell] = await Promise.all([
  read('../docs/VISUAL_GRACE_LEXICAL_EPISTEMIC_AUDIT.md'),
  read('./public/index.html'),
  read('./public/ui/product-copy.js'),
  read('./public/ui/procedure-frame.js'),
  read('./public/ui/surface-router.js'),
  read('./public/ui/surface-primitives.js'),
  read('./public/ui/proof-surface.js'),
  read('./public/onto-compliance-v1.css'),
  read('./public/ui/procedure-anatomy.js'),
  read('./procedure-contracts-1-2.json'),
  read('./runtime/meta-procedure-contracts.mjs'),
  read('./public/ui/epistemic-lattice.js'),
  read('./public/ui/controller.js'),
  read('./public/ui/stable-shell.js')
]);

const contracts = JSON.parse(contractsRaw);
const codes = contracts.procedures.map(item => item.code);
assert.deepEqual(codes, ['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01'], 'canonical seven Processi di Compliance drifted');
assert.equal(contracts.procedures.length, 7, 'business process count must remain seven');
assert.ok(meta.includes("code:'EP-01'") && meta.includes('businessProcess:false') && meta.includes('crossCutting:true'), 'EP-01 must remain cross-cutting and outside the seven business processes');

for (const token of ['Processi di Compliance','Processo di Compliance','Postura ICTC','M+10000','Practice','Evidence','Limit']) assert.ok(doc.includes(token), `audit contract missing ${token}`);
for (const token of ['>Processi di Compliance</button>','>Postura ICTC</button>','<h1>Processi di Compliance</h1>','Apri Processi di Compliance']) assert.ok(index.includes(token), `shell canonical language missing ${token}`);
assert.ok(copy.includes("processes:'Processi di Compliance'") && copy.includes("proof:'Postura ICTC'"), 'product-copy must own canonical surface labels');

for (const token of ['<span>Processo di Compliance</span>','<b>Scopo del processo</b>','aria-label="Segnali del processo"','Consulta registrazioni','Nessun Processo di Compliance disponibile']) assert.ok(frame.includes(token), `process frame language missing ${token}`);
for (const forbidden of ['<span>Procedura</span>','<b>Scopo della procedura</b>','aria-label="Segnali della procedura"',"textContent='Procedure'",'Consulta record']) assert.equal(frame.includes(forbidden), false, `retired active process wording returned: ${forbidden}`);

for (const token of ["EXPERIENCE_EDITION='1.9-experience-candidate'",'ictcExperienceEdition=EXPERIENCE_EDITION','SURFACE_LABELS.processes','SURFACE_LABELS.proof','Processi di Compliance','senza attenzione aperta']) assert.ok(stableShell.includes(token), `stable shell identity/fallback contract missing ${token}`);
for (const forbidden of ['processi in ordine','Tutte le procedure','Apri Processi</button>','<span>procedure</span>','entra nella procedura','nella procedura corretta','Ricostruisci procedure']) assert.equal(stableShell.includes(forbidden), false, `stable shell retains retired fallback wording: ${forbidden}`);

assert.ok(router.includes('SURFACE_LABELS.processes') && router.includes('Torna al processo precedente'), 'router must derive Processi di Compliance navigation language from canonical copy');
assert.ok(primitives.includes('Processi di Compliance') && !primitives.includes("aria-current=\"page\">Procedure"), 'context strip must use Processi di Compliance');

for (const token of ['Come ICTC dimostra la propria postura','proofEvidenceKinds','proofBenchmarkMappings','Pratica ICTC.','Evidenza.','<b>Limite.</b>','data.proof?.evidenceKinds','data.proof?.rule','data.benchmarkFamilies']) assert.ok(proof.includes(token), `Postura proof method missing ${token}`);
assert.equal(proof.includes('Procedure con decisioni'), false, 'Postura must not expose retired Procedure naming');
assert.equal(proof.includes('7 procedure operative'), false, 'Postura must use Processi di Compliance');

for (const token of ['commonSubstrate?.epistemicFamilies','c.claimBoundary','anchor.after(box)','Decisioni umane visibili','Versioni registrate']) assert.ok(anatomy.includes(token), `per-process epistemic trace missing ${token}`);
for (const token of ['Letture proposte','loadedStateRevision','requestedRevision','loadSequence','Vista trasversale','Scopo della vista','Tutti i Processi di Compliance','<small>Processo di Compliance</small>','<th>Processo di Compliance</th>']) assert.ok(epistemic.includes(token), `EP-01 convergence/language contract missing ${token}`);
for (const forbidden of ['<span>Meta-procedura</span>','<b>Scopo della procedura</b>','sr-only">Procedura</span>','>Tutte le procedure</option>','<small>Procedura</small>','<th>Procedura</th>']) assert.equal(epistemic.includes(forbidden), false, `EP-01 retains retired user-facing procedure wording: ${forbidden}`);
assert.ok(controller.includes('ictc:projection-committed') && controller.includes('ictcProjectionRevision'), 'single projection commit authority missing');

for (const token of ['max-width:68ch','min-height:44px','.procedure-frame::after{display:none}','transform:none','grid-template-columns:repeat(2,minmax(0,1fr))','grid-template-columns:1fr','.proof-method-list']) assert.ok(css.includes(token), `visual grace contract missing ${token}`);
assert.equal(css.includes('body{overflow-x:hidden}'), false, 'visual polish must not mask document overflow');
for (const retiredTiny of ['font-size:.58rem','font-size:.59rem']) assert.equal(css.includes(retiredTiny), false, `final visual layer must not reintroduce micro typography ${retiredTiny}`);

for (const item of contracts.procedures) {
  assert.ok(item.claimBoundary, `${item.code} missing claim boundary`);
  assert.ok(Array.isArray(item.humanCheckpoints) && item.humanCheckpoints.length, `${item.code} missing human checkpoints`);
  assert.ok(Array.isArray(item.evidence) && item.evidence.length, `${item.code} missing evidence model`);
}

console.log('visual-grace-lexical-epistemic-check: ok (7 Processi di Compliance / canonical shell and EP-01 language / proof method / actual revision guards / visual restraint / epistemic boundaries)');
