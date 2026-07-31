import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const runtimeDir = await mkdtemp(path.join(os.tmpdir(), 'ictc-e2e-'));
const port = 4317;
const child = spawn(process.execPath, ['server.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: String(port), ICTC_RUNTIME_DIR: runtimeDir },
  stdio: ['ignore', 'pipe', 'pipe']
});
let stderr = '';
child.stderr.on('data', chunk => { stderr += chunk; });
const base = `http://127.0.0.1:${port}`;
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function request(url, options = {}, expectedStatus = 200) {
  const response = await fetch(base + url, { headers: { 'content-type': 'application/json' }, ...options });
  const body = await response.json();
  assert.equal(response.status, expectedStatus, `${url}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      if ((await request('/api/health')).ok) { ready = true; break; }
    } catch { await sleep(100); }
  }
  assert.equal(ready, true, `server non pronto: ${stderr}`);

  const bootstrap = await request('/api/bootstrap');
  assert.ok(bootstrap.views.headline);
  assert.ok(bootstrap.views.proofTiles.every(item => item.limitations.length));
  assert.ok(bootstrap.views.traceCards.length >= 4);
  assert.equal((await request('/api/runtime/info')).runtimeIsolated, true);

  const session = await request('/api/session', { method: 'POST', body: '{}' }, 201);
  assert.equal(session.writeAuthority, false);

  const sourceResult = await request('/api/sources', {
    method: 'POST',
    body: JSON.stringify({ title: 'Documento ACN demo', url: 'https://example.invalid/acn-nis2', notes: 'Possibile aggiornamento', submittedBy: 'e2e-user' })
  }, 201);
  assert.equal(sourceResult.epistemicStatus, 'candidate');
  assert.equal(sourceResult.receipt.readbackVerified, true);

  const review = await request(`/api/sources/${sourceResult.source.id}/review`, {
    method: 'POST', body: JSON.stringify({ outcome: 'accepted', reviewedBy: 'e2e-reviewer', note: 'Accettato per test' })
  }, 201);
  assert.equal(review.epistemicStatus, 'human-reviewed');
  assert.ok((await request('/api/bootstrap')).sources.some(item => item.id === sourceResult.source.id && item.lifecycle === 'active'));

  const job = await request('/api/scout-jobs/job-acn-daily/run', {
    method: 'POST', body: JSON.stringify({ simulateChange: true, actor: 'e2e-scheduler' })
  }, 201);
  assert.equal(job.epistemicStatus, 'ai-proposed');
  assert.equal(job.finding.materiality, 'undetermined');

  const findingReview = await request(`/api/findings/${job.finding.id}/review`, {
    method: 'POST', body: JSON.stringify({ outcome: 'relevant', reviewedBy: 'e2e-reviewer', note: 'Rilevante per test' })
  }, 201);
  assert.equal(findingReview.epistemicStatus, 'human-reviewed');

  const matter = await request('/api/matters', {
    method: 'POST', body: JSON.stringify({ title: 'E2E incident', summary: 'Accesso anomalo a sistema fornitore con dati personali', kind: 'incident', severity: 'high', reportedBy: 'e2e-user' })
  }, 201);
  assert.equal(matter.epistemicStatus, 'reported');

  const owner = await request(`/api/matters/${matter.matter.id}/confirm-owner`, {
    method: 'POST', body: JSON.stringify({ owner: matter.matter.owner, raci: matter.matter.raci, actor: 'e2e-owner' })
  }, 201);
  assert.equal(owner.epistemicStatus, 'human-owned');

  const assistant = await request('/api/assistant', {
    method: 'POST', body: JSON.stringify({ sessionId: session.sessionId, scope: 'radar', question: 'Come lo sappiamo?' })
  });
  assert.equal(assistant.epistemicStatus, 'ai-proposed');
  assert.equal(assistant.capsule.writeAuthority, false);
  assert.ok(assistant.citedItemIds.length > 0);

  const integrity = await request('/api/runtime/integrity');
  assert.equal(integrity.ok, true);
  assert.ok(integrity.eventCount >= 6);
  console.log('e2e: ok');
} finally {
  child.kill('SIGTERM');
  await Promise.race([new Promise(resolve => child.once('exit', resolve)), sleep(3000)]);
  await rm(runtimeDir, { recursive: true, force: true });
  if (stderr) process.stderr.write(stderr);
}
