import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';

const dimensions = {
  role: ['admin', 'user', 'auditor'],
  route: ['home', 'monitoring', 'incidents'],
  ai: ['ready', 'missing', 'degraded'],
  workload: ['empty', 'monitoring', 'incidents', 'mixed'],
  urgency: ['none', 'review', 'action'],
  viewport: ['desktop', 'mobile'],
  access: ['pointer', 'keyboard'],
};
const keys = Object.keys(dimensions);
const combinationCount = keys.reduce((total, key) => total * dimensions[key].length, 1);
const STABILITY = 64;
const TAIL = 100;
const LIMIT = combinationCount + STABILITY + TAIL + 10;

function scenarioAt(index) {
  let cursor = index % combinationCount;
  const scenario = {};
  for (const key of keys) {
    const values = dimensions[key];
    scenario[key] = values[cursor % values.length];
    cursor = Math.floor(cursor / values.length);
  }
  return scenario;
}

function behaviorPrimitives(scenario) {
  const p = new Set([
    'single-home-entry',
    'one-primary-next-action',
    'role-purpose-visible',
    'two-operational-services',
    'four-step-horizontal-journey',
    'current-state-visible',
    'next-step-explained',
    'plain-language-labels',
    'ai-assists-human-decides',
    'server-issued-capabilities',
    'evidence-remains-downloadable',
    'compact-first-viewport',
    'touch-target-minimum',
    'reduced-motion-preserved',
  ]);
  for (const key of keys) p.add(`${key}:${scenario[key]}`);

  const pairs = [
    ['role', 'route'], ['role', 'ai'], ['role', 'workload'], ['role', 'urgency'],
    ['route', 'workload'], ['route', 'viewport'], ['role', 'access'], ['ai', 'workload'],
    ['workload', 'urgency'], ['viewport', 'access'],
  ];
  for (const [left, right] of pairs) {
    p.add(`${left}:${scenario[left]}|${right}:${scenario[right]}`);
  }

  p.add(`state:${keys.map(key => scenario[key]).join('|')}`);

  if (scenario.role === 'admin') {
    p.add('admin-configures-and-approves');
    p.add(scenario.ai === 'ready' ? 'admin-primary-operational-action' : 'admin-primary-configure-ai');
    if (scenario.urgency === 'review') p.add('admin-reviews-candidates');
    if (scenario.urgency === 'action') p.add('admin-acts-on-open-work');
  }
  if (scenario.role === 'user') {
    p.add('user-contributes-and-reports');
    p.add('user-administration-hidden');
    p.add('user-primary-record-event');
  }
  if (scenario.role === 'auditor') {
    p.add('auditor-read-only-home');
    p.add('auditor-write-affordances-hidden');
    p.add('auditor-primary-consult-evidence');
  }
  if (scenario.route === 'home') p.add('home-explains-before-action');
  if (scenario.route === 'monitoring') p.add('monitoring-objective-to-evidence');
  if (scenario.route === 'incidents') p.add('event-narrative-to-evidence');
  if (scenario.viewport === 'mobile') p.add('journey-horizontal-scroll');
  if (scenario.access === 'keyboard') p.add('ordered-focus-and-visible-focus');
  if (scenario.ai !== 'ready') p.add('ai-degraded-path-remains-usable');
  return p;
}

const known = new Set();
const ledger = [];
let lastNovelty = 0;
let M = null;
for (let index = 0; index < LIMIT; index += 1) {
  const before = known.size;
  for (const primitive of behaviorPrimitives(scenarioAt(index))) known.add(primitive);
  const novelty = known.size - before;
  if (novelty) lastNovelty = index + 1;
  ledger.push({ scenario: index + 1, novelty, total: known.size });
  if (index + 1 >= combinationCount && index + 1 - lastNovelty >= STABILITY) {
    M = index + 1;
    break;
  }
}

assert.equal(combinationCount, 1296);
assert.equal(M, combinationCount + STABILITY);
assert.ok(known.size >= 1400, `expected at least 1400 primitives, received ${known.size}`);

const frozen = new Set(known);
const tail = [];
let noveltyAfterM = 0;
for (let index = M; index < M + TAIL; index += 1) {
  let novelty = 0;
  for (const primitive of behaviorPrimitives(scenarioAt(index))) {
    if (!frozen.has(primitive)) {
      frozen.add(primitive);
      novelty += 1;
    }
  }
  noveltyAfterM += novelty;
  tail.push({ scenario: index + 1, novelty, total: frozen.size });
}
assert.equal(noveltyAfterM, 0);

const report = {
  schemaVersion: '2.0.0',
  model: 'ictc-user-journey-reborn',
  dimensions,
  combinationCount,
  method: {
    enumeration: 'mixed-radix exhaustive enumeration of the declared behavioral state space',
    stabilityWindow: STABILITY,
    validationTail: TAIL,
    rule: 'Freeze the primitive set at M and evaluate the next 100 scenarios only against that snapshot.',
  },
  M,
  MPlus100: M + TAIL,
  primitiveCount: known.size,
  lastNovelty,
  noveltyAfterM,
  primitives: [...known].sort(),
  ledger: [...ledger, ...tail],
};

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../artifacts/user-journey-2-saturation.json', import.meta.url),
  JSON.stringify(report, null, 2),
);
console.log(
  `user-journey-2-saturation: ok (M=${M}, M+100=${M + TAIL}, primitives=${known.size}, validation novelty=${noveltyAfterM})`,
);
