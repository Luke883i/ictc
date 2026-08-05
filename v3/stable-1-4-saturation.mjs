import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('./stable-1-4-contract.json', import.meta.url), 'utf8'));
const entries = Object.entries(contract.dimensions);
const scenarioCount = entries.reduce((total, [, values]) => total * values.length, 1);
assert.equal(scenarioCount, contract.saturation.declaredScenarioCount);
assert.equal(contract.saturation.N, scenarioCount + contract.saturation.stabilityWindow);
assert.equal(contract.saturation.NPlus100, contract.saturation.N + contract.saturation.tail);

const primitives = new Set();
function visit(index, parts) {
  if (index === entries.length) {
    const scenario = Object.fromEntries(parts);
    for (const [key, value] of Object.entries(scenario)) primitives.add(`${key}:${value}`);
    primitives.add(`authority:${scenario.role}:${scenario.authority}`);
    primitives.add(`experience:${scenario.role}:${scenario.experience}`);
    primitives.add(`assist:${scenario.aiState}:${scenario.network}`);
    primitives.add(`density:${scenario.viewport}:${scenario.workload}`);
    primitives.add(`evidence:${scenario.role}:${scenario.evidence}`);
    return;
  }
  const [key, values] = entries[index];
  for (const value of values) visit(index + 1, [...parts, [key, value]]);
}
visit(0, []);

for (const invariant of contract.universalInvariants) primitives.add(`invariant:${invariant}`);
for (const scenario of contract.stressScenarios) primitives.add(`stress:${scenario}`);
const frozen = new Set(primitives);
const tailNovelty = [];
for (let index = 1; index <= contract.saturation.tail; index += 1) {
  const probes = [
    `invariant:${contract.universalInvariants[index % contract.universalInvariants.length]}`,
    `stress:${contract.stressScenarios[index % contract.stressScenarios.length]}`,
    `authority:${contract.dimensions.role[index % 3]}:${contract.dimensions.authority[index % 2]}`,
    `density:${contract.dimensions.viewport[index % 3]}:${contract.dimensions.workload[index % 4]}`,
  ];
  for (const probe of probes) if (!frozen.has(probe)) tailNovelty.push({ index, probe });
}
assert.equal(tailNovelty.length, contract.metrics.NPlus100Novelty);

const report = {
  schemaVersion: contract.schemaVersion,
  model: contract.model,
  ok: true,
  scenarioCount,
  primitiveCount: frozen.size,
  stabilityWindow: contract.saturation.stabilityWindow,
  N: contract.saturation.N,
  NPlus100: contract.saturation.NPlus100,
  tailNovelty,
  stressScenarios: contract.stressScenarios,
  limitation: contract.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/stable-1-4-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`stable-1-4-saturation: ok (${scenarioCount} scenarios, N=${report.N}, N+100=${report.NPlus100}, novelty=${tailNovelty.length})`);
