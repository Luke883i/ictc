import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const ledgerPath = path.join(root, 'runtime', 'ledger.jsonl');
const originalLedger = await readFile(ledgerPath, 'utf8').catch(() => '');
const port = 4317;
const child = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
let stderr = '';
child.stderr.on('data', chunk => { stderr += chunk; });
const base = `http://127.0.0.1:${port}`;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function request(url, options = {}) {
  const response = await fetch(base + url, { headers: { 'content-type': 'application/json' }, ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(`${url}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}
try {
  for (let i = 0; i < 30; i += 1) {
    try { if ((await request('/api/health')).ok) break; } catch { await sleep(100); }
  }
  const bootstrap = await request('/api/bootstrap');
  assert.ok(bootstrap.views.headline);
  assert.ok(bootstrap.views.proofTiles.every(item => item.limitations.length));
  assert.ok(bootstrap.views.traceCards.length >= 4);
  const traces = await request('/api/traces');
  assert.equal(traces.traces.length, bootstrap.views.traceCards.length);

  const session = await request('/api/session', { method: 'POST', body: '{}' });
  assert.equal(session.writeAuthority, false);

  const sourceResult = await request('/api/sources', { method: 'POST', body: JSON.stringify({ title: 'Documento ACN demo', url: 'https://example.invalid/acn-nis2', notes: 'Possibile aggiornamento', submittedBy: 'e2e-user' }) });
  assert.equal(sourceResult.epistemicStatus, 'candidate');
  assert.equal(sourceResult.receipt.readbackVerified, true);

  const review = await request(`/api/sources/${sourceResult.source.id}/review`, { method: 'POST', body: JSON.stringify({ outcome: 'accepted', reviewedBy: 'e2e-reviewer', note: 'Accettato per test' }) });
  assert.equal(review.epistemicStatus, 'human-reviewed');

  const job = await request('/api/scout-jobs/job-acn-daily/run', { method: 'POST', body: JSON.stringify({ simulateChange: true, actor: 'e2e-scheduler' }) });
  assert.equal(job.epistemicStatus, 'ai-proposed');
  assert.equal(job.finding.materiality, 'undetermined');

  const findingReview = await request(`/api/findings/${job.finding.id}/review`, { method: 'POST', body: JSON.stringify({ outcome: 'relevant', reviewedBy: 'e2e-reviewer', note: 'Rilevante per test' }) });
  assert.equal(findingReview.epistemicStatus, 'human-reviewed');

  const matter = await request('/api/matters', { method: 'POST', body: JSON.stringify({ title: 'E2E incident', summary: 'Accesso anomalo a sistema fornitore con dati personali', kind: 'incident', severity: 'high', reportedBy: 'e2e-user' }) });
  assert.equal(matter.epistemicStatus, 'reported');

  const owner = await request(`/api/matters/${matter.matter.id}/confirm-owner`, { method: 'POST', body: JSON.stringify({ owner: matter.matter.owner, raci: matter.matter.raci, actor: 'e2e-owner' }) });
  assert.equal(owner.epistemicStatus, 'human-owned');

  const assistant = await request('/api/assistant', { method: 'POST', body: JSON.stringify({ sessionId: session.sessionId, scope: 'radar', question: 'Come lo sappiamo?' }) });
  assert.equal(assistant.epistemicStatus, 'ai-proposed');
  assert.equal(assistant.capsule.writeAuthority, false);
  assert.ok(assistant.citedItemIds.length > 0);

  const integrity = await request('/api/runtime/integrity');
  assert.equal(integrity.ok, true);
  assert.ok(integrity.eventCount >= 5);
  console.log('e2e: ok');
} finally {
  child.kill('SIGTERM');
  await writeFile(ledgerPath, originalLedger, 'utf8');
  if (stderr) process.stderr.write(stderr);
}
