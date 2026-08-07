import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const baselineUrl = new URL('../.github/ci-truth-baseline.json', import.meta.url);
const runtimeUrl = new URL('../artifacts/enterprise-t-runtime-stress.json', import.meta.url);
const auditUrl = new URL('../artifacts/enterprise-t-audit.json', import.meta.url);
const outputUrl = new URL('../artifacts/ci-truth.json', import.meta.url);

const ids = entries => new Set((entries || []).map(item => item.id));
const addedIds = (current, previous) => [...current].filter(id => !previous.has(id)).sort();

function evaluate({ baseline, runtime, audit }) {
  const allowedRuntime = ids(baseline.allowedRuntimeGaps);
  const allowedAudit = ids(baseline.allowedAuditFindings);
  const runtimeGaps = new Set((runtime.cases || []).filter(item => item.status === 'detected-gap').map(item => item.id));
  const auditGaps = new Set((audit.findings || [])
    .filter(item => ['critical', 'high'].includes(item.severity) && item.status !== 'resolved')
    .map(item => item.id));
  return {
    runtimeGaps: [...runtimeGaps].sort(),
    auditGaps: [...auditGaps].sort(),
    newRuntimeGaps: addedIds(runtimeGaps, allowedRuntime),
    newAuditGaps: addedIds(auditGaps, allowedAudit),
    staleRuntimeAllowances: addedIds(allowedRuntime, runtimeGaps),
    staleAuditAllowances: addedIds(allowedAudit, auditGaps),
  };
}

function compareBaseline(current, previous) {
  return {
    runtimeAllowanceAdditions: addedIds(ids(current.allowedRuntimeGaps), ids(previous.allowedRuntimeGaps)),
    auditAllowanceAdditions: addedIds(ids(current.allowedAuditFindings), ids(previous.allowedAuditFindings)),
  };
}

function readBaseBaseline(baseSha) {
  if (!baseSha || !/^[0-9a-f]{40}$/i.test(baseSha)) return { state: 'not-requested', baseline: null };
  try {
    const text = execFileSync('git', ['show', `${baseSha}:.github/ci-truth-baseline.json`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { state: 'present', baseline: JSON.parse(text) };
  } catch (error) {
    const stderr = String(error.stderr || '');
    if (/does not exist|exists on disk, but not in|path .* not in/i.test(stderr)) return { state: 'absent', baseline: null };
    throw error;
  }
}

function selfTest() {
  const baseline = {
    allowedRuntimeGaps: [{ id: 'S1' }],
    allowedAuditFindings: [{ id: 'A1' }],
  };
  const clean = evaluate({
    baseline,
    runtime: { cases: [{ id: 'S1', status: 'detected-gap' }, { id: 'S2', status: 'passed' }] },
    audit: { findings: [{ id: 'A1', severity: 'critical', status: 'open' }, { id: 'A2', severity: 'medium', status: 'open' }] },
  });
  assert.deepEqual(clean.newRuntimeGaps, []);
  assert.deepEqual(clean.newAuditGaps, []);
  const regression = evaluate({
    baseline,
    runtime: { cases: [{ id: 'S1', status: 'detected-gap' }, { id: 'S3', status: 'detected-gap' }] },
    audit: { findings: [{ id: 'A1', severity: 'critical', status: 'open' }, { id: 'A3', severity: 'high', status: 'open' }] },
  });
  assert.deepEqual(regression.newRuntimeGaps, ['S3']);
  assert.deepEqual(regression.newAuditGaps, ['A3']);
  const expansion = compareBaseline(
    { allowedRuntimeGaps: [{ id: 'S1' }, { id: 'S4' }], allowedAuditFindings: [{ id: 'A1' }, { id: 'A4' }] },
    baseline,
  );
  assert.deepEqual(expansion.runtimeAllowanceAdditions, ['S4']);
  assert.deepEqual(expansion.auditAllowanceAdditions, ['A4']);
  console.log('ci-truth-check self-test: ok');
}

if (process.argv.includes('--self-test')) {
  selfTest();
  process.exit(0);
}

const [baseline, runtime, audit] = await Promise.all([
  readFile(baselineUrl, 'utf8').then(JSON.parse),
  readFile(runtimeUrl, 'utf8').then(JSON.parse),
  readFile(auditUrl, 'utf8').then(JSON.parse),
]);
assert.equal(baseline.controlId, 'GOV-CI-TRUTH');
assert.equal(baseline.mode, 'RATCHET');

const baseSha = String(process.env.ICTC_CI_TRUTH_BASE_SHA || '').trim();
const base = readBaseBaseline(baseSha);
let ratchet = { state: base.state, runtimeAllowanceAdditions: [], auditAllowanceAdditions: [] };
if (base.state === 'absent') {
  assert.equal(baseline.bootstrapBaseSha, baseSha, 'Initial CI-truth baseline must be anchored to the exact preimage SHA');
  ratchet.state = 'bootstrap-authorized';
} else if (base.state === 'present') {
  const comparison = compareBaseline(baseline, base.baseline);
  ratchet = { state: 'compared', ...comparison };
  assert.deepEqual(comparison.runtimeAllowanceAdditions, [], `Runtime debt baseline may not expand: ${comparison.runtimeAllowanceAdditions.join(', ')}`);
  assert.deepEqual(comparison.auditAllowanceAdditions, [], `Audit debt baseline may not expand: ${comparison.auditAllowanceAdditions.join(', ')}`);
}

const evaluation = evaluate({ baseline, runtime, audit });
const report = {
  schemaVersion: '1.0.0',
  controlId: 'GOV-CI-TRUTH',
  mode: 'RATCHET',
  baseSha: baseSha || null,
  ratchet,
  ...evaluation,
  result: evaluation.newRuntimeGaps.length || evaluation.newAuditGaps.length ? 'blocked' : 'pass',
  boundary: 'PASS means no newly detected runtime gap and no new open critical/high audit finding outside the immutable-or-shrinking bootstrap debt set. It does not resolve baseline debt.'
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(outputUrl, JSON.stringify(report, null, 2));
if (report.result !== 'pass') {
  throw new Error(`CI truth regression: runtime=[${evaluation.newRuntimeGaps.join(', ')}] audit=[${evaluation.newAuditGaps.join(', ')}]`);
}
console.log(`ci-truth-check: pass (runtime-gaps=${evaluation.runtimeGaps.length}, audit-high-critical=${evaluation.auditGaps.length}, ratchet=${ratchet.state})`);
