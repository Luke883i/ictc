import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('./enterprise-1-8-contract.json', import.meta.url), 'utf8'));
const axes = Object.entries(contract.dimensions);
const expectedPerT = axes.reduce((total, [, values]) => total * values.length, 1);
const primitive = (...parts) => parts.filter(Boolean).join(':');

function enumerate(index = 0, current = {}, output = []) {
  if (index === axes.length) {
    output.push({ ...current });
    return output;
  }
  const [name, values] = axes[index];
  for (const value of values) enumerate(index + 1, { ...current, [name]: value }, output);
  return output;
}

function constructionPrimitives(t, scenario) {
  const values = [
    primitive('T', t.id),
    ...t.invariants.map(value => primitive('invariant', value)),
    ...Object.entries(scenario).map(([axis, value]) => primitive(axis, value)),
    primitive('role-surface', scenario.role, scenario.surface),
    primitive('surface-state', scenario.surface, scenario.state),
    primitive('ai-state', scenario.ai, scenario.state),
    primitive('workload-urgency', scenario.workload, scenario.urgency),
    primitive('viewport-input', scenario.viewport, scenario.input),
  ];
  return new Set(values);
}

function tailProbe(t, index) {
  const stress = contract.stressScenarios[index % contract.stressScenarios.length];
  const scenario = Object.fromEntries(axes.map(([axis, values], axisIndex) => [axis, values[(index + axisIndex) % values.length]]));
  return {
    id: `${t.id}-tail-${String(index + 1).padStart(3, '0')}`,
    stress,
    scenario,
    primitives: constructionPrimitives(t, scenario),
  };
}

assert.equal(contract.schemaVersion, '1.8.0');
assert.equal(contract.T.length, 12);
assert.equal(expectedPerT, contract.saturation.perTDeclaredScenarios);
assert.equal(contract.stressScenarios.length, 50);
assert.equal(contract.saturation.tailPerT, 100);

const scenarios = enumerate();
const results = [];
let constructionScenarios = 0;
let tailScenarios = 0;
let noveltyAfterM = 0;

for (const t of contract.T) {
  const frozen = new Set();
  for (const scenario of scenarios) {
    for (const value of constructionPrimitives(t, scenario)) frozen.add(value);
    constructionScenarios += 1;
  }

  const atDeclaredEnd = scenarios.length;
  for (let index = 0; index < contract.saturation.perTStabilityWindow; index += 1) {
    const scenario = scenarios[index % scenarios.length];
    for (const value of constructionPrimitives(t, scenario)) frozen.add(value);
  }
  const M = atDeclaredEnd + contract.saturation.perTStabilityWindow;
  assert.equal(M, contract.saturation.perTM);

  const frozenAtM = new Set(frozen);
  let tNovelty = 0;
  for (let index = 0; index < contract.saturation.tailPerT; index += 1) {
    const probe = tailProbe(t, index);
    for (const value of probe.primitives) if (!frozenAtM.has(value)) tNovelty += 1;
    tailScenarios += 1;
  }
  noveltyAfterM += tNovelty;
  results.push({
    id: t.id,
    name: t.name,
    declaredScenarios: scenarios.length,
    stabilityWindow: contract.saturation.perTStabilityWindow,
    M,
    MPlus100: M + contract.saturation.tailPerT,
    primitiveCount: frozenAtM.size,
    noveltyAfterM: tNovelty,
  });
}

assert.equal(constructionScenarios, contract.saturation.constructionScenarios);
assert.equal(tailScenarios, contract.saturation.tailScenarios);
assert.equal(constructionScenarios + tailScenarios, contract.saturation.totalScenarios);
assert.equal(noveltyAfterM, contract.saturation.expectedNoveltyAfterM);
assert.ok(results.every(item => item.MPlus100 === contract.saturation.perTMPlus100));

const report = {
  schemaVersion: '1.8.0',
  model: contract.model,
  ok: true,
  TCount: contract.T.length,
  axes: Object.fromEntries(axes.map(([name, values]) => [name, values.length])),
  constructionScenarios,
  tailScenarios,
  totalScenarios: constructionScenarios + tailScenarios,
  noveltyAfterM,
  results,
  limitation: contract.claimBoundary,
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-1-8-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-1-8-saturation: ok (${contract.T.length} T, ${constructionScenarios} construction, ${tailScenarios} tail, novelty ${noveltyAfterM})`);
