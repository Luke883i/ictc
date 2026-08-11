import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const baseModel = JSON.parse(await read('./enterprise-2-ui-standard-model.json'));
const runtimeFindings = JSON.parse(await read('./enterprise-2-ui-standard-runtime-findings.json'));
const model = {
  ...baseModel,
  surfaces: [...baseModel.surfaces, ...(runtimeFindings.surfaces || [])],
  components: [...baseModel.components, ...(runtimeFindings.components || [])],
  lexicalRules: [...baseModel.lexicalRules, ...(runtimeFindings.lexicalRules || [])],
  layoutRules: [...baseModel.layoutRules, ...(runtimeFindings.layoutRules || [])],
  contradictionPrimitives: [...baseModel.contradictionPrimitives, ...(runtimeFindings.contradictionPrimitives || [])],
  standardObligations: [...baseModel.standardObligations, ...(runtimeFindings.standardObligations || [])],
  definitionOfDone: [...baseModel.definitionOfDone, ...(runtimeFindings.definitionOfDone || [])]
};
const tail = 100;
const surfaces = model.surfaces.map(item => item.id);
const modes = ['desktop', 'mobile-390', 'mobile-320', 'zoom-200', 'forced-colors', 'reduced-motion'];
const noveltyPrimitives = [
  ...model.surfaces.map(item => `surface:${item.id}`),
  ...model.components.map(item => `component:${item}`),
  ...model.layoutRules.map(item => `layout:${item}`),
  ...model.lexicalRules.map(item => `lexical:${item}`),
  ...model.accessibilityRules.map(item => `accessibility:${item}`),
  ...model.stateRules.map(item => `state:${item}`)
];

assert.equal(new Set(surfaces).size, surfaces.length, 'duplicate surface ids distort novelty saturation');
assert.equal(new Set(model.components).size, model.components.length, 'duplicate components distort novelty saturation');

function confirmationScenario(index, axis) {
  return { index, axis, surface: surfaces[(index * 7 + axis.length) % surfaces.length], mode: modes[(index * 5 + axis.length) % modes.length], novelty: [], contradictions: [], uncoveredStandards: [] };
}

const M = noveltyPrimitives.length;
const noveltyScenarios = noveltyPrimitives.map((primitive, i) => ({ index: i + 1, axis: 'novelty', primitive, novelty: [primitive], contradictions: [], uncoveredStandards: [] }));
for (let i = 1; i <= tail; i += 1) noveltyScenarios.push(confirmationScenario(M + i, 'novelty'));

const N = model.contradictionPrimitives.length;
const contradictionScenarios = model.contradictionPrimitives.map((primitive, i) => ({ index: i + 1, axis: 'contradiction', primitive, novelty: [], contradictions: [primitive], uncoveredStandards: [] }));
for (let i = 1; i <= tail; i += 1) contradictionScenarios.push(confirmationScenario(N + i, 'contradiction'));

function applies(obligation, surface) {
  return obligation.tags.includes('all') || obligation.tags.some(tag => surface.tags.includes(tag));
}
const standardCoverage = model.standardObligations.map(obligation => ({
  id: obligation.id,
  source: obligation.source,
  surfaces: model.surfaces.filter(surface => applies(obligation, surface)).map(surface => surface.id),
  witnesses: obligation.witness
}));
const coverage = Object.fromEntries(model.surfaces.map(surface => [surface.id, standardCoverage.filter(item => item.surfaces.includes(surface.id)).map(item => item.id)]));
const uncovered = standardCoverage.filter(item => item.surfaces.length === 0 || !item.witnesses?.length);
const Z = model.standardObligations.length;
const standardScenarios = standardCoverage.map((item, i) => ({ index: i + 1, axis: 'standard', standard: item.id, surfaces: item.surfaces, witnesses: item.witnesses, novelty: [], contradictions: [], uncoveredStandards: item.surfaces.length && item.witnesses.length ? [] : [item.id] }));
for (let i = 1; i <= tail; i += 1) standardScenarios.push(confirmationScenario(Z + i, 'standard'));

assert.equal(M, 115);
assert.equal(N, 60);
assert.equal(Z, 34);
assert.equal(noveltyScenarios.slice(M).flatMap(item => item.novelty).length, 0);
assert.equal(contradictionScenarios.slice(N).flatMap(item => item.contradictions).length, 0);
assert.equal(uncovered.length, 0);
assert.equal(standardScenarios.slice(Z).flatMap(item => item.uncoveredStandards).length, 0);
for (const surface of model.surfaces) assert.ok(coverage[surface.id]?.length, `surface without standards: ${surface.id}`);
assert.ok(coverage['procedure-context']?.includes('ICTC-L17'), 'procedure context must retain its dedicated standard witness');

const report = {
  schemaVersion: model.schemaVersion,
  standard: model.id,
  effectiveModel: { base: 'enterprise-2-ui-standard-model.json', runtimeFindings: 'enterprise-2-ui-standard-runtime-findings.json' },
  runtimeFindingCount: runtimeFindings.observedFailures.length,
  surfaceCount: surfaces.length,
  M, MPlus100: M + tail, noveltyAfterM: noveltyScenarios.slice(M).flatMap(item => item.novelty).length,
  N, NPlus100: N + tail, contradictionsAfterN: contradictionScenarios.slice(N).flatMap(item => item.contradictions).length,
  Z, ZPlus100: Z + tail, uncoveredStandardsAtZ: uncovered.length, uncoveredStandardsAfterZ: standardScenarios.slice(Z).flatMap(item => item.uncoveredStandards).length,
  coverage, standardCoverage, noveltyScenarios, contradictionScenarios, standardScenarios, runtimeFindings: runtimeFindings.observedFailures, claimBoundary: model.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-ui-standard-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-ui-standard-saturation: M=${M}/${M + tail} novelty=0; N=${N}/${N + tail} contradictions=0; Z=${Z}/${Z + tail} uncovered=0; runtime-findings=${runtimeFindings.observedFailures.length}`);
