import assert from 'node:assert/strict';
import { runtimeHarness } from './runtime-test-harness.mjs';

const runtime = await runtimeHarness('ictc-enterprise-admin');
try {
  const bootstrap = await runtime.bootstrap('admin', 'local-admin');
  assert.equal(bootstrap.status, 200);
  assert.equal(bootstrap.body.version, '1.7.0-rc.1');
  assert.equal(bootstrap.body.experience.roles, 3);

  const usersBefore = await runtime.request('GET', '/api/admin/users', {}, 'admin', 'local-admin', { refresh: false });
  assert.equal(usersBefore.status, 200);
  assert.ok(usersBefore.body.users.some(user => user.role === 'auditor'));

  const created = await runtime.ok('POST', '/api/admin/users', {
    id: 'enterprise-auditor', displayName: 'Enterprise Auditor', email: 'auditor@example.test', role: 'auditor'
  }, 'admin', 'local-admin');
  assert.equal(created.body.result.role, 'auditor');
  assert.equal(created.body.receipt.action, 'admin.user.created');

  const disabled = await runtime.ok('PATCH', '/api/admin/users/enterprise-auditor', { status: 'disabled' }, 'admin', 'local-admin');
  assert.equal(disabled.body.result.status, 'disabled');
  assert.equal(disabled.body.receipt.action, 'admin.user.updated');

  const governance = await runtime.ok('PUT', '/api/admin/governance', {
    environment: { name: 'enterprise-eu', classification: 'confidential', owner: 'Compliance Operations' },
    monthlyBudgetUsd: 800, warningPercent: 75, retentionDays: 730, incidentSlaHours: 12,
    allowedModels: ['test-model'], requireHumanApproval: true
  }, 'admin', 'local-admin');
  assert.equal(governance.body.result.governance.monthlyBudgetUsd, 800);
  assert.equal(governance.body.result.environment.name, 'enterprise-eu');

  const usage = await runtime.request('GET', '/api/admin/usage', {}, 'admin', 'local-admin', { refresh: false });
  assert.equal(usage.status, 200);
  assert.equal(typeof usage.body.estimatedCostUsd, 'number');

  const readiness = await runtime.request('GET', '/api/admin/readiness', {}, 'admin', 'local-admin', { refresh: false });
  assert.equal(readiness.status, 200);
  assert.ok(readiness.body.dimensions.identity >= 99);
  assert.ok(readiness.body.dimensions.aiGovernance >= 99);

  const forbidden = await runtime.request('GET', '/api/admin/users', {}, 'user', 'local-user', { refresh: false });
  assert.equal(forbidden.status, 403);
  console.log('enterprise-runtime-check: ok (users, governance, usage, readiness, least privilege)');
} finally {
  await runtime.close();
}
