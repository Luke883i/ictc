import { strict as assert } from 'node:assert';
import { loadAccessDirectory, resolveAccessContext, requirePermission, AccessError, serviceContext } from './lib/access-context.mjs';

const directory = await loadAccessDirectory();
const owner = resolveAccessContext({ headers: { 'x-ictc-actor-id': 'local-owner', 'x-ictc-tenant-id': 'tenant-demo-public' } }, directory);
assert.equal(owner.tenant.id, 'tenant-demo-public');
assert.equal(owner.role, 'owner');
assert.equal(requirePermission(owner, 'decide'), owner);

const analyst = resolveAccessContext({ headers: { 'x-ictc-actor-id': 'local-analyst', 'x-ictc-tenant-id': 'tenant-demo-company' } }, directory);
assert.equal(analyst.permissions.includes('observe'), true);
assert.throws(() => requirePermission(analyst, 'review'), AccessError);

assert.throws(
  () => resolveAccessContext({ headers: { 'x-ictc-actor-id': 'local-analyst', 'x-ictc-tenant-id': 'tenant-demo-public' } }, directory),
  error => error instanceof AccessError && error.code === 'tenant-membership-required'
);
assert.throws(
  () => resolveAccessContext({ headers: {} }, directory, { ICTC_IDENTITY_MODE: 'trusted-header' }),
  error => error instanceof AccessError && error.status === 401
);
const scheduler = serviceContext(directory.tenants[0]);
assert.equal(scheduler.role, 'system');
assert.equal(scheduler.permissions.includes('run'), true);
console.log('access-context-check: ok (5 checks, 2 tenants, 4 principals)');
