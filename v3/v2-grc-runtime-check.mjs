import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { closeChildProcess, prepareChildProcess } from './runtime-child-lifecycle.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const runtime = await mkdtemp(path.join(tmpdir(), 'ictc-v2-grc-'));
const headers = { 'content-type': 'application/json', 'x-ictc-role': 'admin' };
const { PORT: _ignoredRunnerPort, ...runtimeEnv } = process.env;

async function freePort() {
  return await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.once('error', reject);
    probe.listen({ host: '127.0.0.1', port: 0, exclusive: true }, () => {
      const address = probe.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      probe.close(error => error ? reject(error) : port > 0 ? resolve(port) : reject(new Error('ephemeral port allocation failed')));
    });
  });
}

async function startOnPort(port) {
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, [path.join(root, 'server.mjs')], {
    env: { ...runtimeEnv, ICTC_RUNTIME_DIR: runtime, ICTC_PORT: String(port), ICTC_HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let stdout = '';
  let stderr = '';
  const append = (current, chunk) => `${current}${chunk}`.slice(-32_768);
  child.stdout.on('data', data => { stdout = append(stdout, data); });
  child.stderr.on('data', data => { stderr = append(stderr, data); });
  prepareChildProcess(child, { drainStdout: false, drainStderr: false });

  async function request(url, { method = 'GET', body } = {}) {
    const response = await fetch(base + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!response.ok) throw new Error(`${method} ${url} ${response.status}: ${text}`);
    return data;
  }

  const attempts = process.platform === 'win32' ? 100 : 50;
  for (let index = 0; index < attempts; index++) {
    if (child.exitCode != null) {
      throw new Error(`server exited ${child.exitCode} pid=${child.pid} port=${port}:\nstdout:\n${stdout}\nstderr:\n${stderr}`);
    }
    try {
      await request('/api/health');
      return { child, request, diagnostics: () => ({ pid: child.pid, port, stdout, stderr }) };
    } catch (error) {
      if (index === attempts - 1) {
        throw new Error(`server not ready after ${attempts * 100}ms pid=${child.pid} port=${port}:\nstdout:\n${stdout}\nstderr:\n${stderr}\n${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  throw new Error('unreachable');
}

async function start() {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt++) {
    const port = await freePort();
    try {
      return await startOnPort(port);
    } catch (error) {
      lastError = error;
      if (!/EADDRINUSE/.test(String(error?.stack || error))) throw error;
    }
  }
  throw lastError || new Error('server start failed after collision retries');
}

async function stop(handle) {
  if (!handle?.child) return;
  await closeChildProcess(handle.child, { graceMs: 5000, timeoutMs: 10000 });
}

let server;
try {
  server = await start();
  const { request } = server;
  const boot0 = await request('/api/bootstrap');
  assert.equal(boot0.experience.productEdition, '1.2 Market Candidate', '1.2 successor must preserve V2 GRC capability rail');
  for (const id of ['objects', 'coverage', 'actions', 'risks', 'assurance']) assert.ok(boot0.procedures.some(x => x.id === id), id);
  assert.equal(boot0.procedures.find(x => x.id === 'coverage').label, 'Standard e Controlli');
  assert.ok(boot0.standards?.counts?.available >= 21);

  const created = await request('/api/grc/objects', { method: 'POST', body: { type: 'laptop', name: 'Notebook CFO', criticality: 'high', owner: 'Finance', sourceAuthority: 'Intune' } });
  assert.match(created.receipt.hash, /^[a-f0-9]{64}$/);
  const objectId = created.result.id;
  await request(`/api/grc/objects/${objectId}/review`, { method: 'POST', body: { decision: 'active', reason: 'Owner confirmed' } });

  const mapping = await request('/api/grc/mappings', { method: 'POST', body: { requirementRef: 'R1', requirementLabel: 'MFA privilegiata', targetIds: [objectId] } });
  await request(`/api/grc/mappings/${mapping.result.id}/decision`, { method: 'POST', body: { decision: 'gap', reason: 'MFA assente' } });

  const action = await request('/api/grc/actions', { method: 'POST', body: { title: 'Abilitare MFA', originType: 'mapping', originId: mapping.result.id, owner: 'local-admin', dueAt: '2099-01-01' } });
  await request(`/api/grc/actions/${action.result.id}/adopt`, { method: 'POST', body: { priority: 5, reason: 'Gap critico', owner: 'local-admin', dueAt: '2099-01-01' } });
  await request(`/api/grc/actions/${action.result.id}/progress`, { method: 'POST', body: { state: 'in-progress', note: 'avviata' } });

  const risk = await request('/api/grc/risks', { method: 'POST', body: { title: 'Accesso privilegiato senza MFA', likelihood: 5, impact: 5, objectIds: [objectId], actionIds: [action.result.id] } });
  await request(`/api/grc/risks/${risk.result.id}/review`, { method: 'POST', body: { likelihood: 4, impact: 5, reason: 'Risk owner review' } });

  const assurance = await request('/api/grc/assurance', { method: 'POST', body: { title: 'Questionario cliente', requestText: 'Descrivere MFA e logging', source: 'Cliente' } });
  assert.equal(assurance.result.state, 'intake');

  const grc = await request('/api/grc');
  assert.equal(grc.objects.counts.active, 1);
  assert.equal(grc.coverage.gaps, 1);
  assert.equal(grc.actions.counts.open, 1);
  assert.equal(grc.risks.heatmap[3][4], 1);
  assert.equal(grc.risks.aiOverlay.length, 0);
  assert.equal(grc.assurance.counts.intake, 1);

  const dossier = await request(`/api/evidence/grc-object/${objectId}`);
  assert.equal(dossier.subject.id, objectId);
  const exported = await request('/api/export/current.json');
  assert.ok(exported.rows.some(x => x.type === 'grc-object' && x.id === objectId));
  console.log(`v2-grc-runtime-check: ok (V2 capabilities preserved under ${boot0.experience.productEdition}; Standard e Controlli extends MC without removing mapping, AO/AP/RC/AR, receipts, evidence and export)`);
} catch (error) {
  const diagnostics = server?.diagnostics?.();
  if (diagnostics) console.error(`v2-grc-runtime-check diagnostics: ${JSON.stringify(diagnostics)}`);
  console.error(`::error title=v2-grc-runtime-check::${String(error?.stack || error).replace(/\r?\n/g, '%0A')}`);
  throw error;
} finally {
  await stop(server).catch(() => {});
  await rm(runtime, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
}
