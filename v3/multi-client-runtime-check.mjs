import { strict as assert } from 'node:assert';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const runtime = await mkdtemp(path.join(os.tmpdir(), 'ictc-multi-runtime-'));
process.env.ICTC_RUNTIME_DIR = runtime;
process.env.ICTC_MONITORING_SCHEDULER = '0';
process.env.ICTC_IDENTITY_MODE = 'local-directory';
const api = await import(`./lib/api.mjs?test=${Date.now()}`);
const store = await import(`./lib/store.mjs?check=${Date.now()}`);

function fakeRequest(method, pathname, headers = {}, body = null) {
  const raw = body == null ? '' : JSON.stringify(body);
  return {
    method,
    headers,
    async *[Symbol.asyncIterator]() { if (raw) yield Buffer.from(raw); }
  };
}

async function call(method, pathname, headers = {}, body = null) {
  const req = fakeRequest(method, pathname, headers, body);
  let status = null;
  let responseHeaders = null;
  let raw = '';
  const res = {
    writeHead(value, headersValue) { status = value; responseHeaders = headersValue; },
    end(value = '') { raw = Buffer.isBuffer(value) ? value.toString('utf8') : String(value); }
  };
  const handled = await api.handleApi(req, res, new URL(pathname, 'http://localhost'));
  assert.notEqual(handled, false);
  const parsed = responseHeaders?.['content-type']?.includes('json') && raw ? JSON.parse(raw) : raw;
  return { status, body: parsed };
}

const analystA = { 'x-ictc-actor-id': 'local-analyst', 'x-ictc-tenant-id': 'tenant-demo-company' };
const reviewerA = { 'x-ictc-actor-id': 'local-reviewer', 'x-ictc-tenant-id': 'tenant-demo-company' };
const ownerA = { 'x-ictc-actor-id': 'local-owner', 'x-ictc-tenant-id': 'tenant-demo-company' };
const ownerB = { 'x-ictc-actor-id': 'local-owner', 'x-ictc-tenant-id': 'tenant-demo-public' };

try {
  const access = await call('GET', '/api/access', ownerA);
  assert.equal(access.status, 200);
  assert.equal(access.body.current.tenant.id, 'tenant-demo-company');
  assert.equal(access.body.tenants.length, 2);

  const created = await call('POST', '/api/sources', analystA, { title: 'Fonte tenant A', url: 'https://example.test/a', by: 'spoofed', tenantId: 'tenant-demo-public' });
  assert.equal(created.status, 201);
  assert.equal(created.body.receipt.tenantId, 'tenant-demo-company');
  assert.equal(created.body.receipt.actorId, 'local-analyst');

  const deniedReview = await call('POST', `/api/sources/${created.body.source.id}/review`, analystA, { outcome: 'accepted' });
  assert.equal(deniedReview.status, 403);
  assert.equal(deniedReview.body.code, 'permission-required');

  const reviewed = await call('POST', `/api/sources/${created.body.source.id}/review`, reviewerA, { outcome: 'accepted' });
  assert.equal(reviewed.status, 201);
  assert.equal(reviewed.body.receipt.actorRole, 'reviewer');

  const crossTenant = await call('POST', `/api/sources/${created.body.source.id}/review`, ownerB, { outcome: 'accepted' });
  assert.equal(crossTenant.status, 404);

  const matterB = await call('POST', '/api/matters', ownerB, { title: 'Caso B', kind: 'incident', summary: 'Fatto osservato nel tenant B.', operatingContext: 'enterprise' });
  assert.equal(matterB.status, 201);
  assert.equal(matterB.body.matter.operatingContext, 'public-administration');

  const bootstrapA = await call('GET', '/api/bootstrap', ownerA);
  const bootstrapB = await call('GET', '/api/bootstrap', ownerB);
  assert.equal(bootstrapA.body.matters.some(item => item.id === matterB.body.matter.id), false);
  assert.equal(bootstrapB.body.matters.some(item => item.id === matterB.body.matter.id), true);

  const sessionA = await call('POST', '/api/session', ownerA, {});
  const assistantCross = await call('POST', '/api/assistant', ownerB, { sessionId: sessionA.body.sessionId, objectId: 'headline-attention', question: 'Che cosa vedo?' });
  assert.equal(assistantCross.status, 401);

  const eventsA = await store.readLedger('tenant-demo-company');
  const eventsB = await store.readLedger('tenant-demo-public');
  assert.equal(eventsA.every(event => event.tenantId === 'tenant-demo-company'), true);
  assert.equal(eventsB.every(event => event.tenantId === 'tenant-demo-public'), true);
  assert.equal(eventsA.some(event => event.actor.id === 'spoofed'), false);
  console.log('multi-client-runtime-check: ok (tenant isolation, RBAC, actor binding, session scope)');
} finally {
  await rm(runtime, { recursive: true, force: true });
}
