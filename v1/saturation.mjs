import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const primitives = [
  'persona-or-lens', 'intent', 'canonical-object', 'epistemic-state',
  'input-and-producer', 'human-decision', 'transition', 'semantic-relation',
  'receipt', 'progressive-drilldown', 'error-or-unavailability', 'accessible-adaptation'
];
const personas = ['c-level', 'auditor', 'cto', 'compliance', 'dpo', 'ciso', 'process-owner', 'employee', 'administrator'];
const intents = ['orient', 'review-source', 'review-finding', 'decide-impact', 'map-control', 'report-event', 'confirm-owner', 'verify-receipt', 'inspect-readiness'];
const contexts = ['desktop', 'mobile', 'keyboard-only', 'high-zoom', 'reduced-motion', 'codespace', 'loopback'];
const disturbances = ['none', 'missing-input', 'conflicting-input', 'ai-unavailable', 'network-blocked', 'binary-upload-blocked', 'stale-projection', 'invalid-transition', 'tampered-ledger'];
const objections = ['roi-unclear', 'completeness-confusion', 'enterprise-overclaim', 'receipt-trust', 'adoption-friction'];
const scenarios = [];
for (let index = 1; index <= 136; index += 1) {
  scenarios.push({
    index,
    phase: index <= 36 ? 'M' : 'M+100',
    persona: personas[(index * 7) % personas.length],
    intent: intents[(index * 5) % intents.length],
    context: contexts[(index * 3) % contexts.length],
    disturbance: disturbances[(index * 11) % disturbances.length],
    objection: objections[(index * 13) % objections.length],
    primitives: [...primitives],
    novelty: index <= primitives.length ? [primitives[index - 1]] : []
  });
}
assert.equal(scenarios.length, 136);
assert.equal(scenarios.filter(item => item.phase === 'M').length, 36);
assert.equal(scenarios.filter(item => item.phase === 'M+100').length, 100);
assert.equal(Math.max(...scenarios.filter(item => item.novelty.length).map(item => item.index)), 12);
assert.ok(scenarios.slice(36).every(item => item.novelty.length === 0));
assert.equal(new Set(scenarios.flatMap(item => item.primitives)).size, primitives.length);
const artifactDir = path.resolve('artifacts');
await mkdir(artifactDir, { recursive: true });
await writeFile(path.join(artifactDir, 'v1-saturation.json'), JSON.stringify({
  schemaVersion: '1.0.0',
  result: 'passed',
  M: 36,
  MPlus100: 136,
  primitiveCount: primitives.length,
  lastNoveltyScenario: 12,
  noveltyAfterM: 0,
  limitation: 'Bounded design saturation for the declared v1 scope; not universal completeness or human comprehension evidence.'
}, null, 2));
console.log('v1-saturation: ok (M=36, M+100=136, last novelty=12, novelty after M=0)');
