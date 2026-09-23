import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EPISTEMIC_PROFESSIONAL_LENSES, professionalLensProjection } from './runtime/epistemic-professional-lenses.mjs';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [ui,lensUi,browser,suite,lattice,active] = await Promise.all([
  read('./public/ui/epistemic-lattice.js'),
  read('./public/ui/epistemic-professional-lenses.js'),
  read('./browser-epistemic-professional-demo.py'),
  read('./runtime/demo-suite-3-0.mjs'),
  read('./runtime/epistemic-lattice.mjs'),
  read('./public/ui/active-experience.js'),
]);

assert.equal(EPISTEMIC_PROFESSIONAL_LENSES.length, 12, 'declared professional-use taxonomy must stay twelve bounded lenses');
const expected = ['compliance-lead','internal-auditor','dpo-privacy','security-manager','risk-manager','control-owner','assurance-reviewer','legal-231-reviewer','it-operations','supplier-procurement','quality-manager','executive-sme'];
assert.deepEqual(EPISTEMIC_PROFESSIONAL_LENSES.map(item => item.id), expected);
for (const lens of EPISTEMIC_PROFESSIONAL_LENSES) {
  assert.ok(lens.label && lens.professionalRole && lens.purpose && lens.workingQuestion && lens.guardrail, `${lens.id}: incomplete lens semantics`);
  assert.ok(['explore','flat','graph'].includes(lens.preferredMode), `${lens.id}: invalid preferred mode`);
  assert.ok(Array.isArray(lens.procedures) && lens.procedures.length >= 1, `${lens.id}: procedure scope missing`);
  assert.ok(lens.procedures.every(id => ['monitoring','incidents','objects','coverage','actions','risks','assurance'].includes(id)), `${lens.id}: unknown procedure`);
  assert.deepEqual(lens.allowedRoles, ['admin','auditor'], `${lens.id}: lens cannot expand RBAC`);
  assert.match(lens.guardrail, /non|not|never|non determina|non prova|non infer/i, `${lens.id}: weak claim boundary`);
}

const projection = professionalLensProjection();
assert.equal(projection.schemaVersion, '1.0.0');
assert.equal(projection.lenses.length, 12);
assert.match(projection.claimBoundary, /non.*autor|not.*author|non.*decision/i);

const productText = [ui,lensUi,lattice].join('\n');
for (const token of ['data-epistemic-lens','epistemicLensContext','Lente professionale','Contesto PMI','businessThread','professionalLenses','conteggi, non score']) {
  assert.ok(productText.includes(token), `professional EP-01 product contract missing ${token}`);
}
assert.ok(active.includes('installEpistemicProfessionalLenses'), 'professional lens enhancer must be in active experience');
assert.ok(lensUi.includes('installed=true;ensureLensUi();bind();sync();'), 'professional lens structure must mount deterministically after canonical EP-01 view creation, before lazy data load');

assert.ok(browser.includes('LENSES') && browser.includes('for lens_id in LENSES'), 'browser must iterate the bounded professional lens taxonomy');
for (const lensId of expected) assert.ok(browser.includes(`'${lensId}'`), `professional browser taxonomy missing ${lensId}`);
assert.ok(browser.includes("shot(page, f'epistemic-lens-{lens_id}.png')") || browser.includes("shot(page,f'epistemic-lens-{lens_id}.png')"), 'browser must materialize one screenshot per enumerated lens');

for (const token of ['DEMO_SUITE_30_VERSION','demoSuite30Projection','projectionAuthority','stressVisible:false','positiveRecords:marker.positiveRecords||0','datasetId:DEMO_SUITE_30_ID']) {
  assert.ok(suite.includes(token), `Suite 3.0 professional DEMO contract missing ${token}`);
}
assert.ok(suite.includes("from './demo-suite-2-2-fixture.mjs'") && suite.includes("from './demo-suite-2-2-replay.mjs'") && suite.includes("status:'deprecated-generator'"), 'Suite 3.0 must retain Suite 2.2 only as explicit deprecated generator lineage');
for (const token of ["demo['suiteVersion']", "'3.0'", "demo['projectionAuthority']", "'demo-suite-3-0'", "demo['datasetId']", "'ictc-demo-suite-3-0'", "demo['positiveRecords']", '188', "demo['stressVisible']", 'False', "demo['coherent']", "demo['violations']"]) {
  assert.ok(browser.includes(token), `professional browser Suite 3.0 projection assertion missing ${token}`);
}

assert.ok(browser.includes('wait_canonical_evidence_entry'), 'professional browser must synchronize on the canonical Evidence entry');
assert.ok(browser.includes('details[data-proof-workspace=\\"epistemic-investigation\\"]') || browser.includes('details[data-proof-workspace="epistemic-investigation"]'), 'professional browser must bind EP-01 to the canonical progressive Evidence disclosure');
assert.ok(browser.includes("root.dataset.proofReadingOrder===expected") && browser.includes("PROOF_READING_ORDER='facts>decisions>trace>evidence-basis>epistemic>external>integrity>method>export'"), 'professional browser must require A3 evidence-meaning-first Proof order before entering EP-01');
assert.ok(!browser.includes('firstElementChild===entry'), 'professional browser must not restore the retired first-row EP-01 authority');
assert.match(browser, /#proofView #epistemicMetaCard['"]?\)\.count\(\)\s*==\s*0/, 'professional browser must reject duplicate Proof-local meta entry');
assert.ok(!browser.includes('#epistemicMetaCard [data-service="epistemic"]'), 'professional browser must not navigate through retired duplicate meta entry');
assert.ok(browser.includes("'duplicateProofMetaEntry':False") || browser.includes("'duplicateProofMetaEntry': False"), 'professional evidence must declare duplicate Proof entry absent');

assert.ok(lensUi.includes('currentThread') && lensUi.includes('data-epistemic-basis') && lensUi.includes('epistemicContextSearch'), 'EP-01 professional context search must route back through canonical atom navigation');
assert.ok(lattice.includes("schemaVersion:'1.3.0'") && lattice.includes('epistemicProfessionalDiagnostics') && lattice.includes('rnSemanticAtoms'), 'lattice projection v1.3 must expose diagnostics plus bounded RN semantic atoms without changing decision authority');
assert.ok(browser.includes('sameProjectionDigestAcrossLenses') && browser.includes('demoProjectionAuthority'), 'browser must prove lens digest conservation and Suite 3.0 projection authority');

console.log('epistemic-professional-use-check: ok (12 bounded lenses / A3 progressive EP-01 authority after evidence meaning / EP-01 v1.3 / deterministic lens mount / Suite 3.0 canonical synthetic projection / deprecated 2.2 generator lineage / screenshot matrix contract)');