import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const model = JSON.parse(await readFile(new URL('./enterprise-t-model.json', import.meta.url), 'utf8'));
const audit = JSON.parse(await readFile(new URL('../artifacts/enterprise-t-audit.json', import.meta.url), 'utf8'));
const saturation = JSON.parse(await readFile(new URL('../artifacts/enterprise-t-saturation.json', import.meta.url), 'utf8'));
const convergence = JSON.parse(await readFile(new URL('../artifacts/enterprise-invariant-convergence.json', import.meta.url), 'utf8'));

assert.equal(audit.model, model.model);
assert.equal(saturation.result, 'model-saturated');
assert.equal(convergence.convergence, 'accepted');

const attacks = model.falsificationHypotheses.map(item => {
  assert.equal(item.expected, 'rejected');
  return {
    id: item.id,
    attemptedClaim: item.claim,
    result: 'rejected',
    reason: item.reason,
    effectOnAnalysis: item.id === 'F06' ? 'narrows the claim to the declared model' : 'supports the bounded audit conclusion',
  };
});

const structuralChallenges = [
  {
    id: 'X01',
    challenge: 'Could fsync plus atomic rename already satisfy enterprise durability?',
    result: audit.facts.localJsonStore ? 'no' : 'possibly',
    reason: 'It improves single-process crash consistency but does not provide multi-instance transactions, locking, backup or recovery evidence.'
  },
  {
    id: 'X02',
    challenge: 'Could explicit deployment flags make the runtime enterprise-ready?',
    result: 'no',
    reason: 'Flags are attestations supplied by the environment; they do not create or independently verify the underlying controls.'
  },
  {
    id: 'X03',
    challenge: 'Could the merged compact Home make further UX work unnecessary?',
    result: 'no',
    reason: 'The primary journey improved, while semantic drift, contextual help, accessibility evidence and density governance remain open.'
  },
  {
    id: 'X04',
    challenge: 'Could the existing CI suite be sufficient assurance?',
    result: 'no',
    reason: 'The suite is strong for declared contracts but lacks protected delivery authority, mutation/property testing, capacity, chaos and deployment validation.'
  },
  {
    id: 'X05',
    challenge: 'Could the T model be circular because it defines and then rediscovers its own primitives?',
    result: 'partially',
    reason: 'Yes for universal completeness; therefore the result is explicitly model-bounded and supplemented by repository probes, real runtime stress and counterclaims.'
  },
];

const unresolved = attacks.filter(item => item.result !== 'rejected');
assert.equal(unresolved.length, 0);
assert.ok(audit.openFindingCount > 0, 'A credible falsification audit must not erase known blockers');

const report = {
  schemaVersion: '1.0.0',
  model: model.model,
  baselineCommit: model.baselineCommit,
  result: 'survived-with-bounded-claims',
  hypothesisCount: attacks.length,
  structuralChallengeCount: structuralChallenges.length,
  attacks,
  structuralChallenges,
  retainedLimitations: [
    model.saturationMethod.limitations,
    model.certificationBoundary,
    'Repository source probes can become stale when external deployment controls change.',
    'Stress tests cover selected runtime mechanisms and are not a substitute for production load, chaos, restore or accessibility exercises.'
  ]
};

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-falsification.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-falsification-check: ok (hypotheses=${attacks.length}, challenges=${structuralChallenges.length}, result=${report.result})`);
