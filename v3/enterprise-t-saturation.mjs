import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const model = JSON.parse(await readFile(new URL('./enterprise-t-model.json', import.meta.url), 'utf8'));
const axes = model.saturationMethod.constructionAxes;
const axisNames = Object.keys(axes);

function cartesian(index) {
  let cursor = index;
  const scenario = {};
  for (const name of axisNames) {
    const values = axes[name];
    scenario[name] = values[cursor % values.length];
    cursor = Math.floor(cursor / values.length);
  }
  return scenario;
}

function disposition(scenario) {
  if (scenario.operatingMode === 'adversarial') return 'deny-or-escalate';
  if (scenario.evidence === 'conflicting') return 'escalate';
  if (scenario.operatingMode === 'recovery' || scenario.lifecycle === 'recover') return 'recover';
  if (scenario.operatingMode === 'degraded' || scenario.evidence === 'partial') return 'degrade-visible';
  if (scenario.actor === 'anonymous' && scenario.lifecycle !== 'read') return 'deny';
  return 'allow-with-evidence';
}

function primitives(dimension, scenario, stressId) {
  const set = new Set([
    `dimension:${dimension.id}`,
    `status:${dimension.status}`,
    `stress:${stressId}`,
    `disposition:${disposition(scenario)}`,
    ...model.universalInvariants.map(item => `invariant:${item.id}`),
    ...dimension.standardRefs.map(item => `standard:${item}`),
    ...dimension.blockers.map((_, index) => `blocker:${dimension.id}:${index + 1}`),
  ]);
  for (const name of axisNames) set.add(`${name}:${scenario[name]}`);
  const pairs = [
    ['actor', 'lifecycle'],
    ['actor', 'operatingMode'],
    ['lifecycle', 'evidence'],
    ['operatingMode', 'load'],
    ['load', 'evidence'],
  ];
  for (const [left, right] of pairs) set.add(`${left}:${scenario[left]}|${right}:${scenario[right]}`);
  set.add(`state:${axisNames.map(name => scenario[name]).join('|')}`);
  return set;
}

const expectedConstruction = axisNames.reduce((total, name) => total * axes[name].length, 1);
assert.equal(expectedConstruction, model.saturationMethod.constructionScenarioCountPerDimension);
assert.equal(model.dimensions.length, 18);
assert.equal(model.stressProfiles.length, 15);

const results = [];
for (const dimension of model.dimensions) {
  const known = new Set();
  let lastNovelty = 0;
  let totalNovelty = 0;
  for (let index = 0; index < expectedConstruction; index += 1) {
    const scenario = cartesian(index);
    const stressId = model.stressProfiles[index % model.stressProfiles.length];
    const before = known.size;
    for (const primitive of primitives(dimension, scenario, stressId)) known.add(primitive);
    const novelty = known.size - before;
    if (novelty > 0) lastNovelty = index + 1;
    totalNovelty += novelty;
  }
  const N = expectedConstruction;
  assert.equal(lastNovelty, N, `${dimension.id}: expected the exhaustive final state to introduce the last full-state primitive`);

  const frozen = new Set(known);
  const tail = [];
  let noveltyAfterN = 0;
  let missingInvariantCount = 0;
  for (let offset = 0; offset < model.saturationMethod.tailScenarioCount; offset += 1) {
    const scenarioIndex = (N - 1 - offset * 97 + N * 4) % N;
    const scenario = cartesian(scenarioIndex);
    const stressId = model.stressProfiles[offset];
    const expected = primitives(dimension, scenario, stressId);
    const missingInvariants = model.universalInvariants
      .map(item => `invariant:${item.id}`)
      .filter(item => !expected.has(item));
    missingInvariantCount += missingInvariants.length;
    let novelty = 0;
    for (const primitive of expected) {
      if (!frozen.has(primitive)) {
        frozen.add(primitive);
        novelty += 1;
      }
    }
    noveltyAfterN += novelty;
    tail.push({
      scenario: N + offset + 1,
      constructionScenario: scenarioIndex + 1,
      stress: stressId,
      disposition: disposition(scenario),
      novelty,
      missingInvariants,
    });
  }
  assert.equal(noveltyAfterN, 0, `${dimension.id}: novelty found in N+15 tail`);
  assert.equal(missingInvariantCount, 0, `${dimension.id}: universal invariant missing in tail`);
  results.push({
    id: dimension.id,
    title: dimension.title,
    status: dimension.status,
    N,
    NPlus15: N + model.saturationMethod.tailScenarioCount,
    primitiveCount: known.size,
    totalNovelty,
    lastNovelty,
    noveltyAfterN,
    missingInvariantCount,
    tail,
  });
}

const report = {
  schemaVersion: '1.0.0',
  model: model.model,
  baselineCommit: model.baselineCommit,
  dimensionCount: model.dimensions.length,
  constructionScenarioCountPerDimension: expectedConstruction,
  constructionScenarioCountTotal: expectedConstruction * model.dimensions.length,
  tailScenarioCountPerDimension: model.saturationMethod.tailScenarioCount,
  tailScenarioCountTotal: model.saturationMethod.tailScenarioCount * model.dimensions.length,
  universalInvariantCount: model.universalInvariants.length,
  result: results.every(item => item.noveltyAfterN === 0 && item.missingInvariantCount === 0) ? 'model-saturated' : 'failed',
  limitations: model.saturationMethod.limitations,
  dimensions: results,
};

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-t-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-t-saturation: ok (T=${report.dimensionCount}, N=${expectedConstruction}, N+15=${expectedConstruction + 15}, scenarios=${report.constructionScenarioCountTotal + report.tailScenarioCountTotal}, novelty=0)`);
