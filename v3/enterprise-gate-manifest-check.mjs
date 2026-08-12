import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readJson = async url => JSON.parse(await readFile(url, 'utf8'));
const manifest = await readJson(new URL('../.github/enterprise-gate-manifest.json', import.meta.url));
const policy = await readJson(new URL('../.github/gov-01f-policy.json', import.meta.url));
const workflow = await readFile(new URL('../.github/workflows/enterprise-candidate.yml', import.meta.url), 'utf8');

assert.equal(manifest.posture, 'enterprise-candidate');
assert.equal(manifest.authority, 'single-composite-gate');
assert.deepEqual(policy.requiredPreMergeChecks, manifest.requiredPreMergeChecks, 'GOV pre-merge checks drifted from gate manifest');
assert.deepEqual(policy.requiredPostMergeChecks, manifest.requiredPostMergeChecks, 'GOV post-merge checks drifted from gate manifest');
assert.deepEqual(manifest.requiredPreMergeChecks, ['enterprise-candidate']);
assert.deepEqual(manifest.requiredPostMergeChecks, ['enterprise-candidate']);
assert.ok(Array.isArray(manifest.localGates) && manifest.localGates.length >= 8);
const ids = manifest.localGates.map(item => item.id);
assert.equal(new Set(ids).size, ids.length, 'duplicate gate ids');
for (const gate of manifest.localGates) {
  assert.match(gate.command, /^(npm|node) /);
  assert.ok(workflow.includes(gate.command), `workflow does not execute ${gate.id}: ${gate.command}`);
  assert.equal(gate.grade, 'E2');
}
assert.ok(manifest.externalBlockers.length >= 5);
assert.match(manifest.claimBoundary, /never establishes enterprise-ready/i);
console.log(`enterprise-gate-manifest: ok (${manifest.localGates.length} local gates, posture=${manifest.posture})`);
