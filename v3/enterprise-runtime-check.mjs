import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { ROLES, VERSION } from './domain.mjs';
import { runtimeHarness } from './runtime-test-harness.mjs';

const runtime = await runtimeHarness('ictc-enterprise-admin');
const checks = [];
const mark = (name, detail) => checks.push({ name, status: 'passed', detail });
const get = async (path, role = 'admin', actor = `local-${role}`) => {
  const response = await fetch(`${runtime.base}${path}`, { headers: runtime.identity(role, actor) });
  return { status: response.status, body: await response.json().catch(() => ({})) };
};
try {
  const bootstrap = await runtime.bootstrap('admin', 'local-admin');
  assert.equal(bootstrap.status, 200);
  assert.equal(bootstrap.body.version, VERSION);
  assert.equal(bootstrap.body.experience.roles, ROLES.length);
  mark('bootstrap', `runtime ${VERSION} con ${ROLES.length} ruoli`);

  const usersBefore = await get('/api/admin/users');
  assert.equal(usersBefore.status, 200);
  assert.ok(usersBefore.body.users.some(user => user.role === 'auditor'));
  mark('directory', 'auditor predefinito presente');

  const created = await runtime.ok('POST', '/api/admin/users', {
    id: 'enterprise-auditor', displayName: 'Enterprise Auditor', email: 'auditor@example.test', role: 'auditor'
  }, 'admin', 'local-admin');
  assert.equal(created.body.result.role, 'auditor');
  assert.equal(created.body.receipt.action, 'admin.user.created');
  mark('provisioning', 'creazione utente con ricevuta');

  const disabled = await runtime.ok('PATCH', '/api/admin/users/enterprise-auditor', { status: 'disabled' }, 'admin', 'local-admin');
  assert.equal(disabled.body.result.status, 'disabled');
  assert.equal(disabled.body.receipt.action, 'admin.user.updated');
  mark('disable-user', 'disabilitazione con ricevuta');

  const governance = await runtime.ok('PUT', '/api/admin/governance', {
    environment: { name: 'enterprise-eu', classification: 'confidential', owner: 'Compliance Operations' },
    monthlyBudgetUsd: 800, warningPercent: 75,
    allowedModels: ['test-model'], requireHumanApproval: true
  }, 'admin', 'local-admin');
  assert.equal(governance.body.result.governance.monthlyBudgetUsd, 800);
  assert.equal(governance.body.result.environment.name, 'enterprise-eu');
  assert.equal('retentionDays' in governance.body.result.governance, false);
  assert.equal('incidentSlaHours' in governance.body.result.governance, false);
  mark('honest-governance', 'rimossi controlli non operativi');

  const usage = await get('/api/admin/usage');
  assert.equal(usage.status, 200);
  assert.equal(typeof usage.body.estimatedCostUsd, 'number');
  mark('usage', 'consumo derivato dalle trace');

  const readiness = await get('/api/admin/readiness');
  assert.equal(readiness.status, 200);
  assert.equal(readiness.body.level, 'enterprise-blocked');
  assert.ok(readiness.body.controls.every(item => item.evidence && (item.status === 'verified' || item.action)));
  assert.ok(readiness.body.controls.some(item => item.id === 'durable-storage' && item.status === 'blocker'));
  assert.ok(readiness.body.controls.some(item => item.id === 'identity-directory' && item.status === 'verified'));
  mark('honest-posture', `${readiness.body.verified}/${readiness.body.total} controlli verificati`);

  const lastAdmin = await runtime.request('PATCH', '/api/admin/users/local-admin', { status: 'disabled' }, 'admin', 'local-admin');
  assert.equal(lastAdmin.status, 409);
  assert.equal(lastAdmin.body.code, 'last-admin-required');
  mark('last-admin', 'auto-lockout impedito');

  const forbidden = await get('/api/admin/users', 'user', 'local-user');
  assert.equal(forbidden.status, 403);
  mark('least-privilege', 'utente operativo escluso dal control plane');

  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(new URL('../artifacts/enterprise-runtime-check.json', import.meta.url), JSON.stringify({ ok: true, generatedAt: new Date().toISOString(), checks }, null, 2));
  console.log('enterprise-runtime-check: ok (users, honest governance, posture blockers, last-admin safety, least privilege)');
} finally {
  await runtime.close();
}
