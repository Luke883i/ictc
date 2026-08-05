import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const dimensions = {
  role: ['admin', 'user', 'auditor'],
  ai: ['ready', 'missing', 'degraded'],
  workload: ['empty', 'monitoring', 'sources', 'events'],
  urgency: ['none', 'review', 'action'],
  evidence: ['none', 'partial', 'verified'],
  viewport: ['desktop', 'mobile'],
  access: ['pointer', 'keyboard'],
  failure: ['none', 'network', 'persist', 'provider'],
};
const keys = Object.keys(dimensions);
const combinationCount = keys.reduce((total, key) => total * dimensions[key].length, 1);
const STABILITY = 64;
const TAIL = 100;

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

function primitives(scenario) {
  const set = new Set([
    'one-primary-action', 'role-purpose-visible', 'why-now-visible', 'why-me-visible',
    'how-visible', 'outcome-visible', 'ai-assists-human-decides',
    'evidence-and-limitations-visible', 'server-issued-authority',
    'semantic-separation-material-source-evidence', 'compact-progressive-disclosure',
    'degraded-path-remains-explicit', 'three-home-regions', 'canonical-global-navigation',
  ]);
  for (const key of keys) set.add(`${key}:${scenario[key]}`);
  const pairs = [
    ['role','ai'], ['role','workload'], ['role','urgency'], ['role','evidence'],
    ['role','failure'], ['workload','urgency'], ['ai','failure'], ['evidence','failure'],
    ['viewport','access'], ['viewport','workload'],
  ];
  for (const [left, right] of pairs) set.add(`${left}:${scenario[left]}|${right}:${scenario[right]}`);
  set.add(`state:${keys.map(key => scenario[key]).join('|')}`);
  if (scenario.role === 'admin') set.add('admin-configures-verifies-decides');
  if (scenario.role === 'user') set.add('user-records-without-classifying');
  if (scenario.role === 'auditor') set.add('auditor-read-only-provenance');
  if (scenario.ai !== 'ready') set.add('manual-path-preserved');
  if (scenario.failure !== 'none') set.add('failure-preservation-and-next-action');
  if (scenario.viewport === 'mobile') set.add('cta-before-disclosure');
  if (scenario.access === 'keyboard') set.add('focus-order-matches-visual-order');
  if (scenario.evidence === 'verified') set.add('evidence-does-not-equal-truth');
  return set;
}

const known = new Set();
const ledger = [];
let lastNovelty = 0;
let M = null;
const limit = combinationCount + STABILITY + TAIL + 10;
for (let index = 0; index < limit; index += 1) {
  const before = known.size;
  for (const primitive of primitives(scenarioAt(index))) known.add(primitive);
  const novelty = known.size - before;
  if (novelty) lastNovelty = index + 1;
  ledger.push({ scenario: index + 1, novelty, total: known.size });
  if (index + 1 >= combinationCount && index + 1 - lastNovelty >= STABILITY) {
    M = index + 1;
    break;
  }
}

assert.equal(combinationCount, 5184);
assert.equal(lastNovelty, combinationCount);
assert.equal(M, combinationCount + STABILITY);

const frozen = new Set(known);
let noveltyAfterM = 0;
const tail = [];
for (let index = M; index < M + TAIL; index += 1) {
  let novelty = 0;
  for (const primitive of primitives(scenarioAt(index))) {
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
  schemaVersion: '3.0.0', model: 'ictc-reborn-3', dimensions, combinationCount,
  method: {
    enumeration: 'mixed-radix exhaustive enumeration of the declared end-user state space',
    stabilityWindow: STABILITY,
    validationTail: TAIL,
    rule: 'Freeze primitives at M and evaluate the following 100 scenarios only against that snapshot.',
  },
  M, MPlus100: M + TAIL, primitiveCount: known.size, lastNovelty, noveltyAfterM,
  primitives: [...known].sort(), ledger: [...ledger, ...tail],
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/reborn-3-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`reborn-3-saturation: ok (M=${M}, M+100=${M + TAIL}, primitives=${known.size}, novelty=${noveltyAfterM})`);
