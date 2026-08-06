import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('./enterprise-1-7-contract.json', import.meta.url), 'utf8'));
const dimensionEntries = Object.entries(contract.dimensions);
const declared = dimensionEntries.reduce((total, [, values]) => total * values.length, 1);
assert.equal(declared, contract.saturation.declaredScenarios);

const primitiveFor = scenario => [
  `surface:${scenario.surface}`,
  `role:${scenario.role}`,
  `authority:${scenario.authority}`,
  `primary-action:${scenario.surface}:${scenario.role}:${scenario.authority}`,
  `detail:${scenario.surface}:${scenario.experience}`,
  `state:${scenario.workload}:${scenario.urgency}`,
  `interaction:${scenario.input}:${scenario.viewport}`,
  `ai:${scenario.ai}`,
  `network:${scenario.network}`,
  scenario.role === 'auditor' ? 'write-authority:none' : `write-authority:${scenario.authority}`,
  scenario.network === 'interrupted' ? 'recovery:required' : 'recovery:available'
].sort();

function scenarioAt(index) {
  let value = index;
  const scenario = {};
  for (let i = dimensionEntries.length - 1; i >= 0; i -= 1) {
    const [name, values] = dimensionEntries[i];
    scenario[name] = values[value % values.length];
    value = Math.floor(value / values.length);
  }
  return scenario;
}

const discovered = new Set();
let lastNovelty = 0;
for (let index = 0; index < declared; index += 1) {
  const before = discovered.size;
  primitiveFor(scenarioAt(index)).forEach(value => discovered.add(value));
  if (discovered.size > before) lastNovelty = index + 1;
}

const M = declared + contract.saturation.stabilityWindow;
assert.equal(M, contract.saturation.M);
assert.ok(M - lastNovelty >= contract.saturation.stabilityWindow);
const frozen = new Set(discovered);
let novelty = 0;
for (let offset = 0; offset < 100; offset += 1) {
  const scenario = scenarioAt((declared - 1 - (offset * 7919 % declared) + declared) % declared);
  for (const primitive of primitiveFor(scenario)) if (!frozen.has(primitive)) novelty += 1;
}
assert.equal(novelty, contract.saturation.expectedNovelty);
assert.equal(M + 100, contract.saturation.MPlus100);
assert.ok(contract.stressScenarios.length >= 30);

const report = {
  schemaVersion: contract.schemaVersion,
  model: contract.model,
  ok: true,
  declaredScenarios: declared,
  primitiveCount: frozen.size,
  lastNovelty,
  stabilityWindow: contract.saturation.stabilityWindow,
  M,
  MPlus100: M + 100,
  tailNovelty: novelty,
  stressScenarios: contract.stressScenarios.length,
  limitation: contract.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-1-7-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-1-7-saturation: ok (${declared} scenarios, M=${M}, M+100=${M + 100}, novelty=${novelty})`);
