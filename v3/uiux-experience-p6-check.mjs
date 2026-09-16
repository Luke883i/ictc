import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRODUCT_PROPOSITION, PROCEDURE_WORKSPACE, SURFACE_ARCHETYPE_FAMILY } from './public/ui/native-semantic-lattice-3-2.js';
import { NATIVE_GATES } from './current-gate-registry.mjs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const contract = JSON.parse(read('./uiux-experience-p6-contract.json'));
const tokens = read('./public/design-tokens.css');
const globalTools = read('./public/ui/global-tools.js');
const icons = read('./public/ui/ui-icons.js');
const workflow = read('../.github/workflows/uiux-experience-p6.yml');

assert.equal(contract.modelId, 'UIUX-EXPERIENCE-P6');
assert.equal(contract.baseObservation.mainSha, 'ebba9c7e0bb57077c507a12c8be6e8dd04aae5ae');
assert.equal(contract.baseObservation.mergedThroughPr, 158);
assert.equal(contract.invariants.canonicalSurfaceCount, 13);
assert.equal(contract.invariants.businessProcedureCount, 7);
assert.equal(Object.keys(SURFACE_ARCHETYPE_FAMILY).length, 13, 'canonical surface census drift');
assert.equal(Object.keys(PROCEDURE_WORKSPACE).length, 7, 'business procedure census drift');
for (const [key, expected] of Object.entries({
  newPresentationOwnerAllowed:false,
  newBusinessRouteAllowed:false,
  writeAuthorityChangeAllowed:false,
  globalFinalResolverAllowed:false,
  newBeautyStylesheetAllowed:false,
  humanDecisionAuthorityRequired:true,
  aiAssistOnlyRequired:true,
  p5SemanticBeautyMustRemainBlocking:true,
  exactHeadCiRequired:true
})) assert.equal(contract.invariants[key], expected, `P6 invariant drift: ${key}`);

for (const fragment of [
  '--color-bg:#eef2f6',
  '--chrome-header-start:#24415f',
  '--chrome-header-mid:#315b7c',
  '--chrome-header-end:#3f7092',
  '--chrome-footer-start:#1b324b',
  '--chrome-footer-mid:#274966',
  '--chrome-footer-end:#365f7f',
  '--landing-start:#f7f9fc',
  '--landing-end:#edf2f7',
  '--ui-action-inline:9.5rem'
]) assert.ok(tokens.includes(fragment), `P6 token missing: ${fragment}`);
for (const preserved of ['--color-success:#087a5b','--color-warning:#9a6500','--color-danger:#a12638','--color-info:#245ba7']) assert.ok(tokens.includes(preserved), `semantic status color drift: ${preserved}`);

for (const term of contract.experienceDelta.productProposition.requiredTerms) assert.ok(PRODUCT_PROPOSITION.includes(term), `product proposition lost ${term}`);
assert.ok(PRODUCT_PROPOSITION.includes(contract.experienceDelta.productProposition.requiredDecisionBoundary), 'human-decision boundary lost');
assert.ok(PRODUCT_PROPOSITION.includes(contract.experienceDelta.productProposition.requiredAiBoundary), 'AI assist-only boundary lost');
assert.ok(PRODUCT_PROPOSITION.length <= contract.experienceDelta.productProposition.maxCharacters, 'product proposition exceeds P6 first-plane budget');
assert.ok(!/Vedi ciò che richiede|Continua il lavoro assegnato|Apri il lavoro da ricostruire/.test(PRODUCT_PROPOSITION), 'product proposition regressed to UI instruction');

for (const fragment of [
  "import { uiIcon } from './ui-icons.js'",
  "nav:'Vista',procedure:'Processo'",
  "mapping:'Requisito'",
  "'assurance-case':'Richiesta'",
  '<p class="eyebrow">Ricerca e navigazione</p>',
  '<h2 id="globalCommandTitle">Vai a</h2>',
  'placeholder="Cerca processo, oggetto, fonte o evento"',
  "uiIcon('search','ui-icon')",
  '<span>Vai a</span>',
  "event.key==='ArrowDown'",
  "event.key==='ArrowUp'",
  "event.key==='Enter'",
  "event.key==='Escape'"
]) assert.ok(globalTools.includes(fragment), `global navigation regression: ${fragment}`);
assert.ok(globalTools.includes('aria-label="Vai a"'), 'global navigation trigger lacks accessible name');
assert.ok(globalTools.includes("detail:stateDetail(x.state)") && globalTools.includes("detail:stateDetail(x.status)"), 'result state detail is not normalized');

for (const icon of contract.experienceDelta.iconVocabulary) assert.ok(icons.includes(`'${icon}':`), `P6 icon missing: ${icon}`);

const p5 = 'v3/uiux-beauty-semantic-p5-new-main-mutation-1m.mjs';
const p6Check = contract.nativeRail.check;
const p6Mutation = contract.nativeRail.saturation;
assert.equal(NATIVE_GATES.filter(x => x === p6Check).length, 1, 'P6 check missing/duplicated in native rail');
assert.equal(NATIVE_GATES.filter(x => x === p6Mutation).length, 1, 'P6 saturation missing/duplicated in native rail');
assert.ok(NATIVE_GATES.indexOf(p5) < NATIVE_GATES.indexOf(p6Check), 'P6 must execute after P5 new-main protection');
assert.ok(NATIVE_GATES.indexOf(p6Check) < NATIVE_GATES.indexOf(p6Mutation), 'P6 contract must execute before P6 mutation campaign');

for (const command of [
  'node v3/uiux-experience-p6-check.mjs',
  'node v3/uiux-experience-p6-saturation-10m.mjs',
  'node v3/uiux-beauty-semantic-p5-check.mjs',
  'node v3/uiux-converge-0-check.mjs'
]) assert.ok(workflow.includes(command), `P6 exact-head workflow missing: ${command}`);
assert.ok(workflow.includes("ref: ${{ github.event.pull_request.head.sha || github.sha }}"), 'P6 workflow is not exact-head bound');

console.log(JSON.stringify({
  ok:true,
  suite:'uiux-experience-p6-check',
  base:contract.baseObservation,
  surfaces:Object.keys(SURFACE_ARCHETYPE_FAMILY).length,
  procedures:Object.keys(PROCEDURE_WORKSPACE).length,
  propositionCharacters:PRODUCT_PROPOSITION.length,
  nativeOrder:{p5:NATIVE_GATES.indexOf(p5),p6Check:NATIVE_GATES.indexOf(p6Check),p6Mutation:NATIVE_GATES.indexOf(p6Mutation)},
  authorityChange:false,
  claimBoundary:contract.claimBoundary
}));
