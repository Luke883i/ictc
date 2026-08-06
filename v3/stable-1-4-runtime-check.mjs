import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { accessProfileFor } from './access-profile.mjs';

const actors = {
  admin: { id: 'local-admin', role: 'admin', identityMode: 'local', permissions: ['manage-users', 'read', 'configure-ai', 'read'] },
  user: { id: 'local-user', role: 'user', identityMode: 'local', permissions: ['report-incident', 'read', 'contribute-source'] },
  auditor: { id: 'local-auditor', role: 'auditor', identityMode: 'local', permissions: ['verify-integrity', 'read-all-incidents', 'read', 'view-ai-usage'] }
};
const profiles = Object.fromEntries(Object.entries(actors).map(([role, actor]) => [role, accessProfileFor(actor)]));

assert.equal(profiles.admin.mode, 'read-write');
assert.equal(profiles.user.mode, 'contribute');
assert.equal(profiles.auditor.mode, 'read-only');
for (const profile of Object.values(profiles)) {
  assert.equal(profile.authoritySource, 'server-issued');
  assert.ok(profile.actorId);
  assert.ok(profile.label);
  assert.ok(profile.can.length);
  assert.ok(profile.cannot.length);
  assert.ok(profile.effects.length);
  assert.ok(profile.evidence.length);
  assert.deepEqual(profile.capabilities, [...new Set(profile.capabilities)].sort());
}
assert.ok(profiles.admin.capabilities.includes('manage-users'));
assert.ok(profiles.user.capabilities.includes('report-incident'));
assert.deepEqual(profiles.auditor.capabilities, ['read', 'read-all-incidents', 'verify-integrity', 'view-ai-usage']);
assert.match(profiles.auditor.modeLabel, /Sola lettura/);
assert.match(profiles.auditor.effects.join(' '), /non cambiano lo stato/);
assert.match(profiles.auditor.evidence.join(' '), /Limiti espliciti/);
assert.doesNotMatch(profiles.auditor.capabilities.join(' '), /manage|configure|submit|close|contribute|report/);

const report = { schemaVersion: '1.4.0', release: '1.4.0', ok: true, profiles };
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/stable-1-4-runtime.json', import.meta.url), JSON.stringify(report, null, 2));
console.log('stable-1-4-runtime-check: ok (3 server-issued actor profiles)');
