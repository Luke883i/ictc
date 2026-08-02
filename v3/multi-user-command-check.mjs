import { strict as assert } from 'node:assert';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const runtime = await mkdtemp(path.join(os.tmpdir(), 'ictc-command-'));
process.env.ICTC_RUNTIME_DIR = runtime;
process.env.ICTC_MONITORING_SCHEDULER = '0';
process.env.ICTC_IDENTITY_MODE = 'local-directory';
process.env.ICTC_SESSION_LIMIT_PER_ACTOR = '2';
const api = await import(`./lib/api.mjs?command=${Date.now()}`);
const store = await import(`./lib/store.mjs?command=${Date.now()}`);

function request(method, pathname, headers = {}, body = null) {
  const raw = body == null ? '' : JSON.stringify(body);
  return { method, headers, async *[Symbol.asyncIterator]() { if (raw) yield Buffer.from(raw); } };
}
async function call(method, pathname, headers = {}, body = null) {
  let status = null; let responseHeaders = null; let raw = '';
  const res = { writeHead(value, values) { status = value; responseHeaders = values; }, end(value = '') { raw = Buffer.isBuffer(value) ? value.toString('utf8') : String(value); } };
  await api.handleApi(request(method, pathname, headers, body), res, new URL(pathname, 'http://localhost'));
  const parsed = responseHeaders?.['content-type']?.includes('json') && raw ? JSON.parse(raw) : raw;
  return { status, body: parsed };
}

const analyst = { 'x-ictc-actor-id': 'local-analyst', 'x-ictc-tenant-id': 'tenant-demo-company' };
const reviewer = { 'x-ictc-actor-id': 'local-reviewer', 'x-ictc-tenant-id': 'tenant-demo-company' };
const commandHeaders = (base, commandId, expectedHead) => ({ ...base, 'x-ictc-command-id': commandId, 'x-ictc-expected-head': expectedHead });

try {
  let state = await call('GET', '/api/bootstrap', analyst);
  const head0 = state.body.meta.integrity.head;
  const createHeaders = commandHeaders(analyst, 'command-create-source-0001', head0);
  const first = await call('POST', '/api/sources', createHeaders, { title: 'Fonte idempotente', url: 'https://example.test/idempotent' });
  assert.equal(first.status, 201);
  assert.equal(first.body.receipt.replayed, false);
  assert.equal(first.body.receipt.actionId, 'source-propose');
  const countAfterFirst = (await store.readLedger('tenant-demo-company')).length;

  const replay = await call('POST', '/api/sources', createHeaders, { title: 'Fonte idempotente', url: 'https://example.test/idempotent' });
  assert.equal(replay.status, 201);
  assert.equal(replay.body.receipt.replayed, true);
  assert.equal(replay.body.source.id, first.body.source.id);
  assert.equal((await store.readLedger('tenant-demo-company')).length, countAfterFirst);

  state = await call('GET', '/api/bootstrap', reviewer);
  const reviewHead = state.body.meta.integrity.head;
  const route = `/api/sources/${first.body.source.id}/review`;
  const results = await Promise.all([
    call('POST', route, commandHeaders(reviewer, 'command-review-source-0001', reviewHead), { outcome: 'accepted' }),
    call('POST', route, commandHeaders(reviewer, 'command-review-source-0002', reviewHead), { outcome: 'rejected' })
  ]);
  assert.deepEqual(results.map(item => item.status).sort(), [201, 409]);
  assert.ok(results.find(item => item.status === 409).body.code === 'ledger-head-changed' || results.find(item => item.status === 409).body.code === 'state-conflict');

  const successful = results.find(item => item.status === 201);
  const successfulCommand = successful.body.receipt.commandId;
  const successfulOutcome = successfulCommand.endsWith('0001') ? 'accepted' : 'rejected';
  const replayReview = await call('POST', route, commandHeaders(reviewer, successfulCommand, reviewHead), { outcome: successfulOutcome });
  assert.equal(replayReview.status, 201);
  assert.equal(replayReview.body.receipt.replayed, true);

  api.apiInternals.sessions.clear();
  const context = api.requestContext({ headers: reviewer });
  const s1 = api.apiInternals.createSession(context, 1_000);
  const s2 = api.apiInternals.createSession(context, 2_000);
  const s3 = api.apiInternals.createSession(context, 3_000);
  assert.equal(api.apiInternals.sessions.has(s1.id), false);
  assert.equal(api.apiInternals.sessions.has(s2.id), true);
  assert.equal(api.apiInternals.sessions.has(s3.id), true);
  assert.equal(api.apiInternals.sessionMatches(s3.session, context, s3.session.expiresAt + 1), false);

  console.log('multi-user-command-check: ok (idempotent retry, stale-write conflict, bounded sessions)');
} finally {
  await rm(runtime, { recursive: true, force: true });
}
