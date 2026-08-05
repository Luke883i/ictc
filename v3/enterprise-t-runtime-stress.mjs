import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Store } from './store.mjs';
import { MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS } from './domain.mjs';
import { authorizeEnterpriseActor } from './enterprise.mjs';
import { assertSafeRuntimeBinding } from './runtime/http.mjs';
import { fetchAiEndpoint, validateAiEndpoint } from './network-policy.mjs';
import { VERSION } from './version.mjs';

const report = [];
const record = (id, profile, status, evidence, dimensions) => report.push({ id, profile, status, evidence, dimensions });
const root = await mkdtemp(path.join(tmpdir(), 'ictc-enterprise-t-'));
const actor = { id: 'local-admin', role: 'admin', identityMode: 'local', permissions: [] };

try {
  const store = await new Store(root).init();

  const savedIdentityMode = process.env.ICTC_IDENTITY_MODE;
  const savedAllowNetwork = process.env.ICTC_ALLOW_NETWORK_BIND;
  const savedProxySecret = process.env.ICTC_TRUSTED_PROXY_SECRET;
  delete process.env.ICTC_IDENTITY_MODE;
  delete process.env.ICTC_ALLOW_NETWORK_BIND;
  delete process.env.ICTC_TRUSTED_PROXY_SECRET;
  assert.doesNotThrow(() => assertSafeRuntimeBinding('127.0.0.1'));
  assert.throws(() => assertSafeRuntimeBinding('0.0.0.0'), error => error.code === 'unsafe-network-bind');
  if (savedIdentityMode == null) delete process.env.ICTC_IDENTITY_MODE; else process.env.ICTC_IDENTITY_MODE = savedIdentityMode;
  if (savedAllowNetwork == null) delete process.env.ICTC_ALLOW_NETWORK_BIND; else process.env.ICTC_ALLOW_NETWORK_BIND = savedAllowNetwork;
  if (savedProxySecret == null) delete process.env.ICTC_TRUSTED_PROXY_SECRET; else process.env.ICTC_TRUSTED_PROXY_SECRET = savedProxySecret;

  const state = {
    users: [
      { id: 'active-user', role: 'user', status: 'active' },
      { id: 'disabled-user', role: 'user', status: 'disabled' },
    ]
  };
  assert.throws(
    () => authorizeEnterpriseActor({ id: 'active-user', role: 'admin', identityMode: 'trusted-header', permissions: [] }, state),
    error => error.code === 'identity-role-mismatch'
  );
  assert.throws(
    () => authorizeEnterpriseActor({ id: 'disabled-user', role: 'user', identityMode: 'trusted-header', permissions: [] }, state),
    error => error.code === 'identity-disabled'
  );
  record('S01', 'identity-spoof-and-role-mismatch', 'passed', 'Mismatched and disabled identities are denied.', ['T02', 'T03']);

  const first = await store.mutate(actor, 'stress.command', { type: 'stress', id: 'command' }, { value: 1 }, draft => {
    draft.settings.organization.name = 'Stress 1';
    return { value: 1 };
  }, { id: 'stress-command-1' });
  const replay = await store.mutate(actor, 'stress.command', { type: 'stress', id: 'command' }, { value: 1 }, draft => {
    draft.settings.organization.name = 'Should not run';
    return { value: 1 };
  }, { id: 'stress-command-1' });
  assert.equal(first.replayed, false);
  assert.equal(replay.replayed, true);
  await assert.rejects(
    store.mutate(actor, 'stress.other', { type: 'stress', id: 'command' }, {}, () => ({}), { id: 'stress-command-1' }),
    error => error.code === 'command-id-conflict'
  );
  await assert.rejects(
    store.mutate(actor, 'stress.stale', { type: 'stress', id: 'stale' }, {}, () => ({}), { expectedRevision: 0 }),
    error => error.code === 'revision-conflict'
  );
  record('S02', 'stale-revision-and-duplicate-command', 'passed', 'Replay is stable; command reuse and stale revisions are rejected.', ['T05', 'T11', 'T18']);

  const beforeConcurrent = store.snapshot().revision;
  await Promise.all(Array.from({ length: 64 }, (_, index) => store.mutate(
    actor,
    'stress.concurrent',
    { type: 'stress', id: `concurrent-${index}` },
    { index },
    draft => ({ index, observedRevision: draft.revision }),
    { id: `stress-concurrent-${index}` }
  )));
  assert.equal(store.snapshot().revision, beforeConcurrent + 64);
  assert.equal(store.verifyChain().ok, true);
  record('S03', 'concurrent-writers-at-capacity', 'passed-local-only', '64 concurrent in-process writes serialize and preserve the audit chain; cross-process behavior remains unproven.', ['T05', 'T12']);

  const beforeDiskFailure = store.snapshot();
  const originalPersist = store.persist.bind(store);
  store.persist = async () => { const error = new Error('simulated disk full'); error.code = 'ENOSPC'; throw error; };
  await assert.rejects(
    store.mutate(actor, 'stress.disk-full', { type: 'stress', id: 'disk' }, {}, draft => {
      draft.settings.organization.name = 'Unpersisted';
      return { changed: true };
    }, { id: 'stress-disk-full' }),
    error => error.code === 'ENOSPC'
  );
  const memoryAdvancedAfterPersistFailure = store.snapshot().revision !== beforeDiskFailure.revision;
  store.state = beforeDiskFailure;
  store.persist = originalPersist;
  await store.persist();
  record(
    'S04',
    'disk-full-during-persist',
    memoryAdvancedAfterPersistFailure ? 'detected-gap' : 'passed',
    memoryAdvancedAfterPersistFailure
      ? 'A failed persist leaves the in-memory state advanced until restart or explicit rollback.'
      : 'A failed persist rolls memory back to the last durable revision.',
    ['T05', 'T06', 'T09']
  );

  const clean = store.snapshot();
  const corrupted = structuredClone(clean);
  corrupted.audit[0].action = 'tampered';
  store.state = corrupted;
  assert.equal(store.verifyChain().ok, false);
  store.state = clean;
  assert.equal(store.verifyChain().ok, true);
  const statePath = path.join(root, 'state.json');
  const diskState = JSON.parse(await readFile(statePath, 'utf8'));
  if (diskState.audit.length) diskState.audit[0].action = 'tampered-on-disk';
  await writeFile(statePath, JSON.stringify(diskState));
  await assert.rejects(new Store(root).init(), /Audit chain non valida/);
  await store.persist();
  record('S05', 'corrupted-state-and-audit-chain', 'passed', 'In-memory and restart-time audit corruption is detected.', ['T05', 'T08', 'T18']);

  let timeoutClassified = false;
  try {
    await fetchAiEndpoint('https://public.test/v1', { signal: AbortSignal.abort() }, {
      lookup: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchImpl: async (_url, init) => {
        if (init.signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
        throw new Error('expected an aborted signal');
      }
    });
  } catch (error) {
    timeoutClassified = error.name === 'AbortError';
  }
  assert.equal(timeoutClassified, true);
  record('S06', 'ai-timeout-and-malformed-output', 'partial', 'Abort propagation is deterministic; strict AI output schema validation remains a separate open control.', ['T06', 'T13']);

  await assert.rejects(
    validateAiEndpoint('https://private.test/v1', { lookup: async () => [{ address: '127.0.0.1', family: 4 }] }),
    error => error.code === 'private-ai-endpoint'
  );
  const redirectCalls = [];
  await fetchAiEndpoint('https://one.test/v1', { headers: { authorization: 'Bearer secret' } }, {
    lookup: async () => [{ address: '93.184.216.34', family: 4 }],
    fetchImpl: async (url, init) => {
      redirectCalls.push({ url, authorization: init.headers?.authorization || null });
      return redirectCalls.length === 1
        ? new Response('', { status: 302, headers: { location: 'https://two.test/v1' } })
        : new Response('{}', { status: 200 });
    }
  });
  const authorizationLeakedAcrossOrigin = Boolean(redirectCalls[1]?.authorization);
  record(
    'S07',
    'dns-rebinding-and-redirect-chain',
    authorizationLeakedAcrossOrigin ? 'detected-gap' : 'passed',
    authorizationLeakedAcrossOrigin
      ? 'Private destinations are denied, but Authorization is retained across a cross-origin redirect.'
      : 'Private destinations are denied and credentials are stripped on cross-origin redirects.',
    ['T03', 'T13']
  );

  await assert.rejects(
    store.saveAttachments([{ name: 'too-large.bin', mime: 'application/octet-stream', dataBase64: Buffer.alloc(MAX_ATTACHMENT_BYTES + 1).toString('base64') }]),
    error => error.code === 'attachment-too-large'
  );
  const saved = await store.saveAttachments(Array.from({ length: MAX_ATTACHMENTS + 3 }, (_, index) => ({
    name: `small-${index}.txt`, mime: 'text/plain', dataBase64: Buffer.from(`item-${index}`).toString('base64')
  })));
  assert.equal(saved.length, MAX_ATTACHMENTS);
  await store.deleteAttachments(saved);
  record('S08', 'oversized-or-malicious-attachment', 'partial', 'Size and count are bounded; content scanning and quarantine are not implemented.', ['T03', 'T04', 'T08']);

  const packageText = await readFile(new URL('../package.json', import.meta.url), 'utf8');
  const telemetryPresent = /opentelemetry|traceparent/i.test(packageText);
  record('S09', 'telemetry-backpressure-and-high-cardinality', telemetryPresent ? 'partial' : 'detected-gap', telemetryPresent ? 'Telemetry exists but still requires a cardinality stress profile.' : 'No telemetry pipeline exists to backpressure or bound cardinality.', ['T07', 'T12']);

  const workflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const mutableActions = /uses:\s+[^\s]+@v\d+/g.test(workflow);
  record('S10', 'dependency-compromise-and-untrusted-build-input', mutableActions ? 'detected-gap' : 'partial', mutableActions ? 'Workflow actions are referenced by mutable major tags.' : 'Action references are immutable; signed provenance still requires verification.', ['T10', 'T18']);

  let partitionObserved = false;
  try {
    await fetchAiEndpoint('https://partition.test/v1', {}, {
      lookup: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchImpl: async () => { throw Object.assign(new Error('simulated network partition'), { code: 'ENETUNREACH' }); }
    });
  } catch (error) {
    partitionObserved = error.code === 'ENETUNREACH';
  }
  assert.equal(partitionObserved, true);
  record('S11', 'network-partition-and-partial-response', 'passed-boundary', 'Network failure propagates without a silent success; retry and circuit-breaker policy remains open.', ['T06', 'T11']);

  const restarted = await new Store(root).init();
  assert.equal(restarted.verifyChain().ok, true);
  assert.equal(restarted.snapshot().revision, store.snapshot().revision);
  record('S12', 'restore-from-last-known-good', 'passed-local-restart', 'A clean local state restarts consistently; backup restore and RTO/RPO remain external.', ['T05', 'T09']);

  const html = await readFile(new URL('./public/index.html', import.meta.url), 'utf8');
  const css = await readFile(new URL('./public/styles.css', import.meta.url), 'utf8');
  assert.ok(html.includes('class="skip-link"'));
  assert.ok(css.includes('[hidden]'));
  record('S13', 'keyboard-only-at-320px-viewport', 'covered-by-browser-suite', 'Skip navigation and fail-closed hidden semantics are present; the actor browser suite supplies runtime evidence.', ['T15', 'T16', 'T17']);

  const hasLiveRegions = /aria-live="polite"/.test(html) && /role="status"/.test(html);
  record('S14', 'assistive-technology-with-dynamic-updates', hasLiveRegions ? 'partial' : 'detected-gap', hasLiveRegions ? 'Live regions exist; human screen-reader evidence is still required.' : 'Dynamic status has no live-region contract.', ['T17']);

  const packageVersion = JSON.parse(packageText).version;
  assert.equal(packageVersion, VERSION);
  record('S15', 'partial-deployment-and-version-skew', 'passed-repository', `Package and runtime version agree at ${VERSION}; mixed deployment instances are not exercised.`, ['T10', 'T11', 'T18']);

  assert.equal(report.length, 15);
  assert.ok(report.every(item => item.status && item.evidence && item.dimensions.length));

  const output = {
    schemaVersion: '1.0.0',
    model: 'ictc-enterprise-t-assurance',
    runtimeVersion: VERSION,
    stressCount: report.length,
    passedOrBounded: report.filter(item => item.status.startsWith('passed') || item.status === 'covered-by-browser-suite').length,
    detectedGapCount: report.filter(item => item.status === 'detected-gap').length,
    partialCount: report.filter(item => item.status === 'partial').length,
    result: 'completed-with-explicit-gaps',
    cases: report,
    limitations: [
      'These tests exercise selected local runtime mechanisms, not a production cluster.',
      'Detected gaps remain blockers or roadmap inputs; passing this script does not waive them.'
    ]
  };
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(new URL('../artifacts/enterprise-t-runtime-stress.json', import.meta.url), JSON.stringify(output, null, 2));
  console.log(`enterprise-t-runtime-stress: ok (cases=${output.stressCount}, detected-gaps=${output.detectedGapCount}, result=${output.result})`);
} finally {
  await rm(root, { recursive: true, force: true });
}
