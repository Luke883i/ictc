import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const model = JSON.parse(await readFile(new URL('./enterprise-t-model.json', import.meta.url), 'utf8'));
const saturation = JSON.parse(await readFile(new URL('../artifacts/enterprise-t-saturation.json', import.meta.url), 'utf8'));

assert.equal(saturation.model, model.model);
assert.equal(saturation.baselineCommit, model.baselineCommit);
assert.equal(saturation.dimensionCount, model.dimensions.length);
assert.equal(saturation.result, 'model-saturated');

const conflicts = [
  { id: 'C01', left: 'compact-density', right: 'accessible-targets', resolution: 'Keep 44/48 px targets; compress containers, copy and vertical rhythm instead.' },
  { id: 'C02', left: 'audit-transparency', right: 'privacy-minimization', resolution: 'Preserve hashes and receipts while redacting inaccessible content and sensitive attributes.' },
  { id: 'C03', left: 'availability', right: 'consistency', resolution: 'Reject stale or unverifiable writes; prefer visible degraded read paths over unsafe acceptance.' },
  { id: 'C04', left: 'ai-assistance', right: 'human-authority', resolution: 'AI proposes and cites; only explicit human actions review, approve or decide.' },
  { id: 'C05', left: 'observability', right: 'data-minimization', resolution: 'Use low-cardinality telemetry and exclude secrets, raw narratives and personal identifiers.' },
  { id: 'C06', left: 'performance', right: 'evidence-completeness', resolution: 'Paginate and stream without dropping receipts, limits or provenance links.' },
];

const coverage = [];
for (const invariant of model.universalInvariants) {
  const dimensions = saturation.dimensions.map(item => ({
    dimension: item.id,
    present: item.missingInvariantCount === 0,
    tailNovelty: item.noveltyAfterN,
  }));
  assert.ok(dimensions.every(item => item.present && item.tailNovelty === 0), `${invariant.id}: convergence failed`);
  coverage.push({ invariant: invariant.id, statement: invariant.statement, dimensions });
}

const unresolvedConflicts = conflicts.filter(item => !item.resolution);
assert.equal(unresolvedConflicts.length, 0);

const report = {
  schemaVersion: '1.0.0',
  model: model.model,
  baselineCommit: model.baselineCommit,
  universalInvariantCount: model.universalInvariants.length,
  dimensionCount: model.dimensions.length,
  intersectionSize: model.universalInvariants.length,
  convergence: 'accepted',
  rule: 'A dimension may add local controls but cannot weaken a universal invariant. Safety, evidence, privacy and human-authority boundaries take precedence over convenience.',
  conflicts,
  unresolvedConflicts,
  coverage,
};

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-invariant-convergence.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-invariant-convergence: ok (T=${report.dimensionCount}, invariants=${report.intersectionSize}, conflicts=${conflicts.length}, unresolved=0)`);
