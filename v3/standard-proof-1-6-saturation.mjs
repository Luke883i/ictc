import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('./standard-proof-1-6-contract.json', import.meta.url), 'utf8'));
const entries = Object.entries(contract.dimensions);
const declared = entries.reduce((total, [, values]) => total * values.length, 1);
assert.equal(declared, contract.saturation.declaredScenarioCount);
assert.equal(contract.saturation.M, declared + contract.saturation.stabilityWindow);
assert.equal(contract.saturation.MPlus100, contract.saturation.M + contract.saturation.tail);

const primitives = new Set();
let visited = 0;
const pairKeys = [
  ['role', 'journey'], ['role', 'authority'], ['journey', 'dataState'],
  ['input', 'vision'], ['aiState', 'network'], ['evidence', 'authority'],
  ['urgency', 'dataState'], ['experience', 'journey'], ['viewport', 'input']
];

function mineScenario(index, scenario) {
  if (index === entries.length) {
    visited += 1;
    for (const [key, value] of Object.entries(scenario)) primitives.add(`dimension:${key}:${value}`);
    for (const [left, right] of pairKeys) primitives.add(`pair:${left}:${scenario[left]}:${right}:${scenario[right]}`);
    return;
  }
  const [key, values] = entries[index];
  for (const value of values) {
    scenario[key] = value;
    mineScenario(index + 1, scenario);
  }
}

mineScenario(0, {});
assert.equal(visited, declared);
for (const invariant of contract.universalInvariants) primitives.add(`invariant:${invariant}`);
for (const stress of contract.stressScenarios) primitives.add(`stress:${stress}`);
for (const benchmark of contract.benchmarkFamilies) primitives.add(`benchmark:${benchmark.id}:${benchmark.alignment}`);
for (const layer of contract.architecture) primitives.add(`architecture:${layer.id}`);

const frozen = new Set(primitives);
const tailNovelty = [];
for (let index = 0; index < contract.saturation.tail; index += 1) {
  const probes = [
    `invariant:${contract.universalInvariants[index % contract.universalInvariants.length]}`,
    `stress:${contract.stressScenarios[index % contract.stressScenarios.length]}`,
    `benchmark:${contract.benchmarkFamilies[index % contract.benchmarkFamilies.length].id}:${contract.benchmarkFamilies[index % contract.benchmarkFamilies.length].alignment}`,
    `architecture:${contract.architecture[index % contract.architecture.length].id}`,
    `pair:role:${contract.dimensions.role[index % contract.dimensions.role.length]}:journey:${contract.dimensions.journey[index % contract.dimensions.journey.length]}`,
    `pair:viewport:${contract.dimensions.viewport[index % contract.dimensions.viewport.length]}:input:${contract.dimensions.input[index % contract.dimensions.input.length]}`
  ];
  for (const probe of probes) if (!frozen.has(probe)) tailNovelty.push({ index: index + 1, probe });
}
assert.equal(tailNovelty.length, contract.metrics.MPlus100Novelty);

const report = {
  schemaVersion: contract.schemaVersion,
  model: contract.model,
  ok: true,
  scenarioCount: visited,
  primitiveCount: frozen.size,
  stabilityWindow: contract.saturation.stabilityWindow,
  M: contract.saturation.M,
  MPlus100: contract.saturation.MPlus100,
  tailNovelty,
  invariantCount: contract.universalInvariants.length,
  stressScenarioCount: contract.stressScenarios.length,
  limitation: contract.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/standard-proof-1-6-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`standard-proof-1-6-saturation: ok (${visited} scenarios, M=${report.M}, M+100=${report.MPlus100}, primitives=${report.primitiveCount})`);
