import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { evidencePdf } from './runtime/evidence-formats.mjs';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [proof, epistemic, evidenceUi, journeyCss, primitiveCss, copy] = await Promise.all([
  read('./public/ui/proof-surface.js'),
  read('./public/ui/epistemic-lattice.js'),
  read('./public/ui/evidence-download-ui.js'),
  read('./public/procedure-journey-2-1.css'),
  read('./public/surface-primitives.css'),
  read('./public/ui/product-copy.js')
]);

assert.ok(proof.includes('SURFACE_LABELS.proof'), 'Postura title must consume product-copy authority');
for (const label of ['Osservabile', 'Da completare', 'Confine', 'Decisioni e tracciabilità', 'Runtime e integrità', 'Deployment e requisiti esterni', 'Standard e riferimenti', 'Export della vista corrente']) {
  assert.ok(proof.includes(label), `Postura progressive section missing: ${label}`);
}
assert.ok(!proof.includes('<h1 id="proofTitle">Evidenze e tracciabilità</h1>'), 'stale proof title returned');
assert.ok(proof.includes('non la sufficienza sostanziale'), 'Postura must keep evidence/conclusion boundary visible');
assert.ok(proof.includes('non amplia i permessi'), 'first-view authorization language should be understandable without same-as-read jargon');
assert.ok(!proof.includes('Deployment e gap'), 'end-user Postura should not expose internal gap shorthand');
assert.ok(!proof.includes('Decisioni e lineage'), 'end-user Postura should prefer tracciabilità to lineage');
assert.ok(proof.includes("ictc:projection-committed"), 'Postura must refresh from projection commits rather than generic renders');
assert.ok(!proof.includes("document.addEventListener('ictc:rendered'"), 'Postura must not force network refresh on every generic render');
assert.ok(proof.includes('requestSequence') && proof.includes('cachedRevision'), 'Postura stale-response and revision cache ownership missing');

for (const level of ['Quadro', 'Gruppi', 'Relazioni', 'Atomo']) assert.ok(epistemic.includes(level), `EP progressive level missing ${level}`);
assert.ok(epistemic.includes("epistemicStatus==='proposed'"), 'proposed AI readings must stay distinguishable');
assert.ok(epistemic.includes('Flat / raw') && epistemic.includes('Proto-grafo'), 'alternate epistemic representations missing');

for (const label of ['Fascicolo', 'PDF stampabile', 'XML strutturato', 'Markdown', 'ZIP completo']) assert.ok(evidenceUi.includes(label), `evidence disclosure missing ${label}`);
assert.equal((evidenceUi.match(/document\.addEventListener\('click'/g) || []).length, 1, 'evidence formats should share one delegated click owner');
assert.ok(evidenceUi.includes("event.key !== 'Escape'"), 'evidence disclosure should close with Escape');

for (const token of ['.proof-snapshot', '.proof-reading-grid', '.proof-section', '.evidence-export-menu', '@media(max-width:420px)', 'prefers-reduced-motion']) assert.ok(journeyCss.includes(token), `2.1 polish css missing ${token}`);
assert.doesNotMatch(journeyCss, /min-height:(?:32|40|42)px/, '2.1 interactive presentation must not locally undercut the 44px target contract');
assert.ok(primitiveCss.includes('--surface-control-min:44px'), 'canonical minimum control target missing');
assert.ok(primitiveCss.includes(':where(button,summary,[role="button"])'), 'new surface controls must inherit the 44px target grammar');
assert.ok(copy.includes("proof:'Postura Standard & Security ICTC'"), 'canonical proof label drift');

const printableDoc = {
  subject: { type: 'catalog', id: 'long-token', label: 'X'.repeat(240) },
  generatedAt: '2026-08-10T00:00:00Z', generatedBy: 'audit', generatedForRole: 'auditor',
  integrity: {}, lineage: [], limitations: [], boundary: 'bounded receipt'
};
const printablePdf = evidencePdf(printableDoc).toString('latin1');
assert.match(printablePdf, /^%PDF-1\.4/);
assert.doesNotMatch(printablePdf, /X{100}/, 'PDF renderer must split unbroken user-provided tokens before line emission');
assert.match(printablePdf, /%%EOF/);

const forbidden = [/Postura[^\n]{0,80}\bconforme\b/i, /Reticolo[^\n]{0,80}\bcertezza\b/i, /Fascicolo[^\n]{0,80}\bprova definitiva\b/i];
for (const pattern of forbidden) {
  assert.doesNotMatch(proof, pattern);
  assert.doesNotMatch(epistemic, pattern);
}

console.log(JSON.stringify({
  ok: true,
  check: 'ux-language-polish',
  surfaces: ['posture', 'epistemic', 'evidence-download'],
  hardening: ['revision-bound-proof-refresh', '44px-control-grammar', 'escape-disclosure', 'long-token-print-wrap'],
  boundary: 'lexical/structural and bounded renderer audit; not a human visual review or legal assessment'
}));
