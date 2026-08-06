import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFile(path.join(root, file), 'utf8');
const manifest = JSON.parse(await read('v3/enterprise-claims.json'));

assert.equal(manifest.schemaVersion, '1.0.0');
assert.match(manifest.release, /^\d+\.\d+\.\d+(?:-rc\.\d+)?$/);
assert.ok(Array.isArray(manifest.claims) && manifest.claims.length >= 2);

for (const claim of manifest.claims) {
  assert.match(claim.id, /^[a-z0-9-]+$/);
  assert.ok(['implemented', 'external-evidence-required', 'planned'].includes(claim.status));
  assert.ok(Array.isArray(claim.paths) && claim.paths.length > 0, `${claim.id}: missing paths`);
  assert.ok(Array.isArray(claim.checks) && claim.checks.length > 0, `${claim.id}: missing checks`);
  for (const file of [...claim.paths, ...claim.checks]) await read(file);
  if (claim.status === 'implemented') assert.ok(claim.statement && claim.statement.length > 20);
}

const server = await read('v3/server.mjs');
assert.doesNotMatch(server, /createWorkbenchRuntime|monitoringJobs|jobRuns/,
  'The experimental parallel monitoring source of truth must not be registered');

console.log(`enterprise-convergence-check: ok (${manifest.claims.length} claims, release ${manifest.release})`);
