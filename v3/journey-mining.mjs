import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';

const roles = ['admin', 'user'];
const services = ['monitoring', 'incidents'];
const aiStates = ['ready', 'down'];
const materials = ['none', 'link', 'file'];
const concurrencyStates = ['clean', 'retry', 'stale'];
const signals = ['none', 'personal-data', 'malicious', 'cross-border', 'ongoing'];
const MINIMUM_SCENARIOS = 32;
const STABILITY_WINDOW = 24;
const VALIDATION_TAIL = 100;
const SEARCH_LIMIT = 600;

function scenarioAt(index) {
  return {
    role: roles[index % roles.length],
    service: services[Math.floor(index / roles.length) % services.length],
    ai: aiStates[Math.floor(index / (roles.length * services.length)) % aiStates.length],
    material: materials[index % materials.length],
    concurrency: concurrencyStates[Math.floor(index / materials.length) % concurrencyStates.length],
    signal: signals[index % signals.length]
  };
}

function primitives(scenario) {
  const result = new Set([
    'two-services', 'two-roles', 'one-primary-action', 'progressive-disclosure',
    'raw-input-first', 'human-confirmation', 'receipt', 'evidence-export', 'integrity-chain'
  ]);
  if (scenario.service === 'monitoring') {
    ['objective-entry', 'ai-plan', 'plan-reveal', 'mission-activation', 'automatic-run', 'catalog-candidate', 'source-provenance', 'human-source-decision'].forEach(value => result.add(value));
  } else {
    ['minimal-incident-intake', 'ai-lens', 'adaptive-question', 'why-now', 'evidence-use', 'unknown-answer', 'origin-diff', 'incident-submit'].forEach(value => result.add(value));
  }
  result.add(scenario.role === 'admin' ? 'admin-global-ai' : 'user-own-records');
  result.add(scenario.ai === 'down' ? 'ai-failure-safe' : 'ai-trace');
  if (scenario.material === 'file') result.add('attachment-digest');
  if (scenario.material === 'link') result.add('official-link');
  if (scenario.concurrency === 'retry') result.add('idempotent-retry');
  if (scenario.concurrency === 'stale') result.add('optimistic-conflict');
  if (scenario.signal !== 'none') result.add(`signal-${scenario.signal}`);
  return result;
}

const known = new Set();
const ledger = [];
let lastNovelty = 0;
let M = null;

for (let index = 0; index < SEARCH_LIMIT; index += 1) {
  const scenarioNumber = index + 1;
  const before = known.size;
  for (const primitive of primitives(scenarioAt(index))) known.add(primitive);
  const novelty = known.size - before;
  if (novelty > 0) lastNovelty = scenarioNumber;
  ledger.push({ scenario: scenarioNumber, novelty, total: known.size });

  if (
    M === null &&
    scenarioNumber >= MINIMUM_SCENARIOS &&
    scenarioNumber - lastNovelty >= STABILITY_WINDOW
  ) {
    M = scenarioNumber;
    break;
  }
}

assert.ok(M !== null, `saturazione non raggiunta entro ${SEARCH_LIMIT} scenari`);

const primitivesAtM = new Set(known);
const tailLedger = [];
let noveltyAfterM = 0;
for (let index = M; index < M + VALIDATION_TAIL; index += 1) {
  let novelty = 0;
  for (const primitive of primitives(scenarioAt(index))) {
    if (!primitivesAtM.has(primitive)) {
      primitivesAtM.add(primitive);
      novelty += 1;
    }
  }
  noveltyAfterM += novelty;
  tailLedger.push({ scenario: index + 1, novelty, total: primitivesAtM.size });
}

assert.equal(noveltyAfterM, 0, `trovate ${noveltyAfterM} nuove primitive dopo M=${M}`);
assert.ok(known.size >= 35, 'copertura delle primitive insufficiente');
assert.equal(ledger.at(-1).scenario, M);
assert.equal(tailLedger.length, VALIDATION_TAIL);

const report = {
  schemaVersion: '2.0.0',
  method: {
    minimumScenarios: MINIMUM_SCENARIOS,
    stabilityWindow: STABILITY_WINDOW,
    validationTail: VALIDATION_TAIL,
    searchLimit: SEARCH_LIMIT,
    rule: 'M is selected online after the stability window; M+100 is evaluated only against primitives frozen at M.'
  },
  M,
  MPlus100: M + VALIDATION_TAIL,
  primitiveCount: known.size,
  lastNovelty,
  noveltyAfterM,
  primitives: [...known].sort(),
  ledger: [...ledger, ...tailLedger]
};

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/journey-mining.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`journey-mining: ok (M=${M}, M+100=${M + VALIDATION_TAIL}, primitives=${known.size}, last novelty=${lastNovelty}, validation novelty=${noveltyAfterM})`);
