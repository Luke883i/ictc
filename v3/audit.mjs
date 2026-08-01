import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const root = path.resolve(new URL('.', import.meta.url).pathname);
const runtime = await mkdtemp(path.join(os.tmpdir(), 'ictc-v1-'));
const port = 4567;
const child = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, PORT: String(port), ICTC_HOST: '127.0.0.1', ICTC_RUNTIME_DIR: runtime }, stdio: 'ignore' });
const base = `http://127.0.0.1:${port}`;
const sleep = n => new Promise(resolve => setTimeout(resolve, n));
async function req(pathname, options = {}, status) {
  const response = await fetch(base + pathname, { headers: { 'content-type': 'application/json' }, ...options });
  const body = (response.headers.get('content-type') || '').includes('json') ? await response.json() : await response.text();
  if (status) assert.equal(response.status, status); else assert.ok(response.ok, `${pathname} ${response.status}`);
  return body;
}
try {
  for (let index = 0; index < 50; index += 1) { try { if ((await req('/api/health')).ok) break; } catch {} await sleep(100); }
  const release = await req('/api/release');
  assert.equal(release.version, '1.0.0');
  assert.equal(release.readiness, 'ready');
  const state = await req('/api/bootstrap');
  assert.equal(state.meta.version, '1.0.0');
  assert.equal(state.release.stabilityClass, 'stable-local-single-user');
  assert.ok(state.views.jobs.length && state.views.matters.length && state.views.semanticGraph.edges.length >= 10 && state.views.traces.length === 4);
  await req('/api/sources', { method: 'POST', body: JSON.stringify({ title: 'Blocked', fileName: 'sample.txt', contentBase64: Buffer.from('sample').toString('base64') }) }, 503);
  const source = await req('/api/sources', { method: 'POST', body: JSON.stringify({ title: 'Fonte audit', url: 'https://example.invalid/audit' }) });
  assert.equal(source.receipt.readbackVerified, true);
  await req(`/api/sources/${source.source.id}/review`, { method: 'POST', body: JSON.stringify({ outcome: 'accepted' }) });
  const finding = state.findings[0];
  await req(`/api/findings/${finding.id}/review`, { method: 'POST', body: JSON.stringify({ outcome: 'relevant' }) });
  const state2 = await req('/api/bootstrap');
  const change = state2.changes.find(item => item.findingId === finding.id);
  assert.ok(change);
  await req(`/api/changes/${change.id}/decide`, { method: 'POST', body: JSON.stringify({ outcome: 'action-required', rationale: 'audit' }) });
  await req(`/api/changes/${change.id}/map-control`, { method: 'POST', body: JSON.stringify({ controlId: 'control-monitor', rationale: 'mapping astratto' }) });
  const matter = await req('/api/matters', { method: 'POST', body: JSON.stringify({ summary: 'Accesso anomalo del fornitore con dati personali' }) });
  await req(`/api/matters/${matter.matter.id}/confirm-owner`, { method: 'POST', body: JSON.stringify({ owner: matter.matter.owner, raci: matter.matter.raci }) });
  await req(`/api/matters/${matter.matter.id}/transition`, { method: 'POST', body: JSON.stringify({ to: 'assessing', evidence: { classification: 'event', severity: 'medium', scope: 'Account e portale fornitore.', impact: 'Possibile esposizione di dati personali.', confidence: 'medium' } }) });
  const session = await req('/api/session', { method: 'POST', body: '{}' });
  const ai = await req('/api/assistant', { method: 'POST', body: JSON.stringify({ sessionId: session.sessionId, objectId: state.views.findings[0].id, question: 'Siamo conformi?' }) });
  assert.equal(ai.capsule.writeAuthority, false);
  assert.match(ai.answer, /^No\./);
  const ledger = await req('/api/runtime/ledger');
  assert.equal(ledger.integrity.ok, true);
  assert.ok(ledger.events.every(item => !item.payload));
  console.log(`v1-runtime-audit: ok (${Object.keys(state2.objectIndex).length} objects, ${state2.views.semanticGraph.edges.length} relations, 2 services)`);
} finally {
  child.kill('SIGTERM');
  await rm(runtime, { recursive: true, force: true });
}
