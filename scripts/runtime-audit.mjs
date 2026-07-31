import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const runtimeDir = await mkdtemp(path.join(os.tmpdir(), 'ictc-runtime-audit-'));
const artifactDir = path.join(root, 'artifacts');
await mkdir(artifactDir, { recursive: true });

const checks = [];
const mark = (name, detail = 'ok') => checks.push({ name, status: 'passed', detail });
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
let child;
let base;
let stderr = '';

async function start(port) {
  stderr = '';
  child = spawn(process.execPath, ['server.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), ICTC_HOST: '127.0.0.1', ICTC_RUNTIME_DIR: runtimeDir },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stderr.on('data', chunk => { stderr += chunk; });
  base = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return;
    } catch {}
    await sleep(100);
  }
  throw new Error(`Server non disponibile. ${stderr}`);
}

async function stop() {
  if (!child || child.killed) return;
  child.kill('SIGTERM');
  await Promise.race([
    new Promise(resolve => child.once('exit', resolve)),
    sleep(5000).then(() => child.kill('SIGKILL'))
  ]);
}

async function request(pathname, options = {}, expectedStatus = 200) {
  const response = await fetch(base + pathname, {
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();
  assert.equal(response.status, expectedStatus, `${pathname}: atteso ${expectedStatus}, ottenuto ${response.status}: ${JSON.stringify(body)}`);
  return { response, body };
}

function assertEnvelope(item) {
  for (const key of ['id', 'label', 'statement', 'claimClass', 'epistemicStatus', 'producer', 'inputs', 'limitations']) {
    assert.ok(item[key] !== undefined, `OutcomeEnvelope senza ${key}: ${item.id}`);
  }
  assert.ok(Array.isArray(item.limitations) && item.limitations.length > 0, `Limiti assenti: ${item.id}`);
}

try {
  await start(4467);

  const health = (await request('/api/health')).body;
  assert.equal(health.ok, true);
  assert.equal(health.localSot, true);
  mark('health', health.version);

  const index = await request('/', {}, 200);
  assert.match(index.response.headers.get('content-security-policy') || '', /script-src 'self'/);
  assert.equal(index.response.headers.get('x-content-type-options'), 'nosniff');
  assert.match(index.body, /<main id="main"/);
  mark('static-ui-and-security-headers');

  const bootstrap = (await request('/api/bootstrap')).body;
  const viewArrays = ['proofTiles', 'sourceCards', 'findingCards', 'jobCards', 'coverageCards', 'matterCards', 'traceCards'];
  assertEnvelope(bootstrap.views.headline);
  for (const key of viewArrays) {
    assert.ok(Array.isArray(bootstrap.views[key]) && bootstrap.views[key].length > 0, `Vista vuota: ${key}`);
    bootstrap.views[key].forEach(assertEnvelope);
  }
  mark('bootstrap-and-outcome-envelopes', `${1 + viewArrays.reduce((total, key) => total + bootstrap.views[key].length, 0)} esiti`);

  const runtimeInfo = (await request('/api/runtime/info')).body;
  assert.equal(runtimeInfo.runtimeIsolated, true);
  mark('isolated-runtime-directory');

  const initialIntegrity = (await request('/api/runtime/integrity')).body;
  assert.equal(initialIntegrity.ok, true);
  assert.equal(initialIntegrity.eventCount, 0);
  mark('initial-ledger-integrity');

  await request('/api/sources', { method: 'POST', body: '{}' }, 400);
  await request('/api/matters', { method: 'POST', body: JSON.stringify({ summary: '   ' }) }, 400);
  await request('/api/assistant', { method: 'POST', body: JSON.stringify({ sessionId: 'missing', question: 'test' }) }, 401);
  mark('negative-input-contracts');

  const session = (await request('/api/session', { method: 'POST', body: '{}' }, 201)).body;
  assert.equal(session.writeAuthority, false);
  assert.equal(session.scopeExpansion, 'ui-only');
  mark('local-ai-session-boundary');

  const source = (await request('/api/sources', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Fonte ACN audit',
      url: 'https://example.invalid/acn-audit',
      notes: 'Verifica runtime',
      submittedBy: 'runtime-auditor'
    })
  }, 201)).body;
  assert.equal(source.epistemicStatus, 'candidate');
  assert.equal(source.receipt.readbackVerified, true);
  let projected = (await request('/api/bootstrap')).body;
  assert.ok(projected.sources.some(item => item.id === source.source.id && item.lifecycle === 'candidate'));
  mark('manual-source-persist-readback-receipt');

  const sourceReview = (await request(`/api/sources/${source.source.id}/review`, {
    method: 'POST',
    body: JSON.stringify({ outcome: 'accepted', reviewedBy: 'runtime-reviewer' })
  }, 201)).body;
  assert.equal(sourceReview.epistemicStatus, 'human-reviewed');
  projected = (await request('/api/bootstrap')).body;
  assert.ok(projected.sources.some(item => item.id === source.source.id && item.lifecycle === 'active'));
  mark('source-human-review-projection');

  const job = (await request('/api/scout-jobs/job-acn-daily/run', {
    method: 'POST',
    body: JSON.stringify({ simulateChange: true, actor: 'runtime-scheduler' })
  }, 201)).body;
  assert.equal(job.finding.materiality, 'undetermined');
  assert.equal(job.epistemicStatus, 'ai-proposed');
  mark('scheduled-scouting-proposal-boundary');

  const findingReview = (await request(`/api/findings/${job.finding.id}/review`, {
    method: 'POST',
    body: JSON.stringify({ outcome: 'relevant', reviewedBy: 'runtime-reviewer' })
  }, 201)).body;
  assert.equal(findingReview.epistemicStatus, 'human-reviewed');
  mark('finding-human-review');

  const matter = (await request('/api/matters', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Accesso anomalo audit',
      summary: 'Accesso anomalo al portale fornitore con possibile presenza di dati personali',
      kind: 'incident',
      severity: 'high',
      reportedBy: 'runtime-auditor'
    })
  }, 201)).body;
  assert.equal(matter.epistemicStatus, 'reported');
  assert.ok(matter.matter.raci.consulted.includes('DPO'));
  assert.ok(matter.matter.raci.consulted.includes('Cybersecurity'));
  mark('matter-intake-and-raci-proposal');

  const owner = (await request(`/api/matters/${matter.matter.id}/confirm-owner`, {
    method: 'POST',
    body: JSON.stringify({ owner: matter.matter.owner, raci: matter.matter.raci, actor: 'runtime-owner' })
  }, 201)).body;
  assert.equal(owner.epistemicStatus, 'human-owned');
  projected = (await request('/api/bootstrap')).body;
  assert.ok(projected.matters.some(item => item.id === matter.matter.id && item.workflowState === 'owned'));
  mark('matter-owner-readback');

  const assistant = (await request('/api/assistant', {
    method: 'POST',
    body: JSON.stringify({ sessionId: session.sessionId, scope: 'radar', question: 'Possiamo dire che siamo conformi?' })
  })).body;
  assert.equal(assistant.epistemicStatus, 'ai-proposed');
  assert.equal(assistant.capsule.writeAuthority, false);
  assert.match(assistant.answer, /No:/);
  assert.ok(assistant.citedItemIds.length > 0);
  mark('assistant-local-capsule-no-write');

  const manifest = (await request('/api/self/manifest')).body;
  assert.equal(manifest.writeAuthority, false);
  assert.ok(manifest.files.includes('server.mjs'));
  mark('assistant-self-documentation-manifest');

  const integrity = (await request('/api/runtime/integrity')).body;
  assert.equal(integrity.ok, true);
  assert.ok(integrity.eventCount >= 6);
  const eventCountBeforeRestart = integrity.eventCount;
  mark('ledger-integrity-after-writes', `${integrity.eventCount} eventi`);

  await stop();
  await start(4468);
  const afterRestart = (await request('/api/bootstrap')).body;
  const restartIntegrity = (await request('/api/runtime/integrity')).body;
  assert.equal(restartIntegrity.ok, true);
  assert.equal(restartIntegrity.eventCount, eventCountBeforeRestart);
  assert.ok(afterRestart.sources.some(item => item.id === source.source.id && item.lifecycle === 'active'));
  assert.ok(afterRestart.matters.some(item => item.id === matter.matter.id && item.workflowState === 'owned'));
  mark('restart-persistence-and-reconstruction');

  const payload = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    result: 'passed',
    runtime: 'isolated-local-sot',
    checks,
    limitations: [
      'Il test dimostra il runtime locale della beta, non requisiti enterprise come SSO, multi-tenancy o alta disponibilità.',
      'La navigazione assistita da browser è verificata da un gate separato quando il browser è consentito dall’ambiente.'
    ]
  };
  await writeFile(path.join(artifactDir, 'runtime-audit.json'), JSON.stringify(payload, null, 2));
  console.log(`runtime-audit: ok (${checks.length} checks)`);
} catch (error) {
  const payload = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    result: 'failed',
    checks,
    error: error.stack || error.message,
    stderr
  };
  await writeFile(path.join(artifactDir, 'runtime-audit.json'), JSON.stringify(payload, null, 2));
  throw error;
} finally {
  await stop();
  await rm(runtimeDir, { recursive: true, force: true });
}
