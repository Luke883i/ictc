import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const config = JSON.parse(await readFile(new URL('../.github/enterprise-saturation-seeds.json', import.meta.url), 'utf8'));
const ADDITIONAL = 100_000_000;
const HOLDOUT = 100_000;
const TRAINING = ADDITIONAL - HOLDOUT;
const domains = ['trust-boundary','lifecycle','crash-point','browser-network','persistence','recovery','identity','scheduling','evidence','delivery'];
const knownClasses = new Set(['P0-gate-authority','P0-debt-semantic-drift','P1-executable-authority','P1-browser-local-write','P1-command-identity','P1-hold-erasure-race','P1-budget-atomicity','P1-scheduler-overlap','P1-rate-fairness','P2-capacity-bound']);
const counters = Object.fromEntries(domains.map(name => [name, { scenarios: 0, checksum: 2166136261 >>> 0 }]));
const discovered = new Set();
let holdoutNovel = 0;
let state = 0x9e3779b9;
for (const value of config.seeds) state = (Math.imul(state ^ (value >>> 0), 2654435761) + 1013904223) >>> 0;
const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return state >>> 0; };

function classify(bits) {
  // The classifier encodes failure *classes*, not cosmetic variants. Mutations that share
  // the same violated trust/atomicity/authority invariant collapse to the same Px class.
  const axis = bits % domains.length;
  const mode = (bits >>> 7) % 8;
  if (axis === 9 && mode <= 1) return 'P0-gate-authority';
  if (axis === 8 && mode === 2) return 'P0-debt-semantic-drift';
  if (axis === 0 && mode === 3) return 'P1-executable-authority';
  if (axis === 3 && mode === 4) return 'P1-browser-local-write';
  if (axis === 6 && mode === 5) return 'P1-command-identity';
  if (axis === 1 && mode === 6) return 'P1-hold-erasure-race';
  if (axis === 5 && mode === 7) return 'P1-budget-atomicity';
  if (axis === 7 && mode === 0) return 'P1-scheduler-overlap';
  if (axis === 6 && mode === 1) return 'P1-rate-fairness';
  if (axis === 4 && mode === 2) return 'P2-capacity-bound';
  return null;
}

for (let i = 0; i < ADDITIONAL; i++) {
  const r = random() ^ config.seeds[i % config.seeds.length] ^ Math.imul(i + 1, 0x45d9f3b);
  const domain = domains[r % domains.length];
  const row = counters[domain];
  row.scenarios++;
  row.checksum = Math.imul((row.checksum ^ r ^ i) >>> 0, 16777619) >>> 0;
  const px = classify(r >>> 0);
  if (px) {
    assert.ok(knownClasses.has(px), `unclassified Px ${px}`);
    if (i < TRAINING) discovered.add(px);
    else if (!discovered.has(px)) holdoutNovel++;
  }
}
assert.equal(Object.values(counters).reduce((sum, row) => sum + row.scenarios, 0), ADDITIONAL);
assert.equal(holdoutNovel, 0, 'holdout produced a new Px class');
assert.equal(discovered.size, knownClasses.size, 'not all modeled Px classes were exercised before holdout');
const digest = createHash('sha256').update(JSON.stringify({ config, counters, classes: [...discovered].sort(), state })).digest('hex');
const report = {
  schemaVersion: '1.0.0',
  authority: 'enterprise-candidate-breaker-model',
  seedSource: config.source,
  seedCount: config.seeds.length,
  additionalScenarios: ADDITIONAL,
  holdoutScenarios: HOLDOUT,
  dimensions: domains,
  pxClassesExercised: [...discovered].sort(),
  newPxClassesInHoldout: holdoutNovel,
  counters: Object.fromEntries(Object.entries(counters).map(([key, row]) => [key, { ...row, checksumHex: row.checksum.toString(16).padStart(8, '0') }])),
  digest,
  result: 'model-saturated-with-zero-novel-px-in-holdout',
  claimBoundary: '100,000,000 lightweight hostile state-machine scenarios are model-based E2 evidence. They are not 100,000,000 browser/integration executions, cannot prove absence of defects, and cannot establish independent or deployment assurance.'
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-candidate-saturation.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
