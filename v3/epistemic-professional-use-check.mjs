import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EPISTEMIC_PROFESSIONAL_LENSES, professionalLensProjection } from './runtime/epistemic-professional-lenses.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [ui,browser,seed,lattice]=await Promise.all([read('./public/ui/epistemic-lattice.js'),read('./browser-v2-epistemic.py'),read('./runtime/demo-seed.mjs'),read('./runtime/epistemic-lattice.mjs')]);
assert.equal(EPISTEMIC_PROFESSIONAL_LENSES.length,12,'declared professional-use taxonomy must stay twelve bounded lenses');
const expected=['compliance-lead','internal-auditor','dpo-privacy','security-manager','risk-manager','control-owner','assurance-reviewer','legal-231-reviewer','it-operations','supplier-procurement','quality-manager','executive-sme'];
assert.deepEqual(EPISTEMIC_PROFESSIONAL_LENSES.map(x=>x.id),expected);
for(const lens of EPISTEMIC_PROFESSIONAL_LENSES){assert.ok(lens.label&&lens.professionalRole&&lens.purpose&&lens.workingQuestion&&lens.guardrail,`${lens.id}: incomplete lens semantics`);assert.ok(['explore','flat','graph'].includes(lens.preferredMode),`${lens.id}: invalid preferred mode`);assert.ok(Array.isArray(lens.procedures)&&lens.procedures.length>=1,`${lens.id}: procedure scope missing`);assert.ok(lens.procedures.every(id=>['monitoring','incidents','objects','coverage','actions','risks','assurance'].includes(id)),`${lens.id}: unknown procedure`);assert.match(lens.guardrail,/non|not|never|non determina|non prova|non infer/i,`${lens.id}: weak claim boundary`);}
const projection=professionalLensProjection();assert.equal(projection.schemaVersion,'1.0.0');assert.equal(projection.lenses.length,12);assert.match(projection.claimBoundary,/non.*autor|not.*author|non.*decision/i);
for(const token of ['data-epistemic-lens','epistemicLensContext','Lente professionale','Contesto PMI','businessThread','professionalLenses'])assert.ok(ui.includes(token)||lattice.includes(token),`professional EP-01 product contract missing ${token}`);
for(const id of expected)assert.ok(browser.includes(`epistemic-lens-${id}.png`),`browser screenshot missing professional lens ${id}`);
for(const token of ['pmi-italiana-officine-aurora-v3','BUSINESS_THREADS','evidenceState','operatingPressure','uncertainty','businessThread'])assert.ok(seed.includes(token),`demo v3 reality model missing ${token}`);
assert.ok(ui.includes('JSON.stringify(atom.raw?.payload?.demo')||ui.includes('businessThread'),'EP-01 search must include recorded demo business context');
console.log('epistemic-professional-use-check: ok (12 bounded lenses / realistic thread context / screenshot matrix contract)');
