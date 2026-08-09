import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { canonicalJson, sha256 } from './domain.mjs';
import { auditEventHash } from './integrity-binding.mjs';
import { Store } from './store.mjs';

const root = await mkdtemp(path.join(tmpdir(), 'ictc-integrity-binding-'));
const tamperRoot = await mkdtemp(path.join(tmpdir(), 'ictc-integrity-sqlite-tamper-'));
const legacyRoot = await mkdtemp(path.join(tmpdir(), 'ictc-integrity-legacy-'));
const actor = { id: 'integrity-check', role: 'admin', permissions: [] };
const cases = [];
const record = (id, status, evidence) => cases.push({ id, status, evidence });

try {
  const store = await new Store(root).init();
  assert.equal(store.verifyChain().chainOk, true);
  assert.equal(store.verifyChain().bindingMode, 'genesis-unbound');

  store.state.settings.organization.name = 'Direct persisted normalization';
  await store.persist();
  let integrity = store.verifyChain();
  assert.equal(integrity.ok, true);
  assert.equal(integrity.stateBound, true);
  assert.equal(store.snapshot().audit.at(-1).action, 'integrity.state-bound');
  assert.equal(store.snapshot().audit.at(-1).metadata.reason, 'direct-state-persist');
  record('I01', 'passed', 'A direct post-init state persist is converted into an explicit state-binding audit event.');

  const missionId = 'mission-integrity-check';
  const envelope = await store.mutate(
    actor,
    'integrity.mission-created',
    { type: 'mission', id: missionId },
    { objective: 'Binding check' },
    draft => {
      const mission = { id: missionId, objective: 'Binding check', state: 'draft', createdBy: actor.id };
      draft.missions.push(mission);
      return mission;
    },
    { id: 'integrity-mission-create' }
  );
  integrity = store.verifyChain();
  assert.equal(integrity.ok, true);
  assert.equal(integrity.stateBound, true);
  assert.equal(envelope.receipt.stateSha256, integrity.canonicalStateSha256);
  assert.equal(integrity.headStateSha256, integrity.canonicalStateSha256);
  record('I02', 'passed', 'A normal mutation receipt carries the canonical state digest bound into the audit HEAD.');

  const receiptProof = store.verifyReceipt(envelope.receipt);
  assert.equal(receiptProof.ok, true);
  assert.equal(receiptProof.eventBound, true);
  assert.equal(receiptProof.currentStateBound, true);
  const alteredReceipt = { ...envelope.receipt, stateSha256: '0'.repeat(64) };
  assert.equal(store.verifyReceipt(alteredReceipt).ok, false);
  record('I03', 'passed', 'Receipt verification binds event fields and state digest; a modified receipt is rejected.');

  const clean = store.snapshot();
  store.state.settings.organization.name = 'Tampered without audit event';
  const tamperedMemory = store.verifyChain();
  assert.equal(tamperedMemory.chainOk, true);
  assert.equal(tamperedMemory.ok, false);
  assert.equal(tamperedMemory.reason, 'state-head-mismatch');
  store.state = clean;
  assert.equal(store.verifyChain().ok, true);

  const tamperStore = await new Store(tamperRoot).init();
  await tamperStore.mutate(
    actor,
    'integrity.sqlite-tamper-baseline',
    { type: 'integrity-check', id: 'sqlite' },
    { value: 1 },
    draft => {
      draft.settings.organization.name = 'SQLite baseline';
      return { changed: true };
    },
    { id: 'integrity-sqlite-tamper-baseline' }
  );
  assert.equal(tamperStore.verifyChain().ok, true);
  tamperStore.close();
  const db = new DatabaseSync(path.join(tamperRoot, 'state.sqlite'));
  const row = db.prepare('SELECT payload FROM snapshot WHERE id=1').get();
  const payload = JSON.parse(row.payload);
  payload.settings.organization.name = 'Tampered SQLite snapshot';
  db.prepare('UPDATE snapshot SET payload=? WHERE id=1').run(JSON.stringify(payload));
  db.close();
  await assert.rejects(async () => {
    const reopened = new Store(tamperRoot);
    try { await reopened.init(); }
    finally { reopened.close(); }
  }, error => error.code === 'state-head-mismatch');
  record('I04', 'passed', 'Canonical SQLite snapshot tampering is detected while the append-only audit ledger remains structurally valid.');

  const legacyEvent = {
    id: 'event_legacy', revision: 1, at: '2026-01-01T00:00:00.000Z', actorId: 'legacy-user', role: 'admin',
    action: 'legacy.action', subject: { type: 'mission', id: 'legacy-mission' },
    inputSha256: sha256({ legacy: true }), resultSha256: sha256({ ok: true }), previousHash: 'GENESIS', metadata: {}
  };
  legacyEvent.hash = auditEventHash(legacyEvent);
  const legacyState = {
    schemaVersion: '2.1.0', revision: 1,
    settings: { organization: { name: 'Legacy' }, llm: {}, prompts: {} },
    missions: [{ id: 'legacy-mission', objective: 'Legacy', state: 'draft' }], runs: [], contributions: [], catalog: [], incidents: [],
    audit: [legacyEvent], commandResults: {}
  };
  await mkdir(legacyRoot, { recursive: true });
  await writeFile(path.join(legacyRoot, 'state.json'), JSON.stringify(legacyState, null, 2));
  const legacy = await new Store(legacyRoot).init();
  const migrated = legacy.verifyChain();
  assert.equal(migrated.ok, true);
  assert.equal(migrated.stateBound, true);
  assert.equal(legacy.snapshot().revision, 2);
  assert.equal(legacy.snapshot().audit.at(-1).action, 'integrity.state-bound');
  assert.equal(legacy.snapshot().audit.at(-1).metadata.reason, 'legacy-head-migration');
  legacy.close();
  record('I05', 'passed', 'A valid legacy state.json chain is imported once and receives a checkpoint; historical revisions are not retroactively reconstructed.');

  const bundle = store.evidenceBundle('mission', missionId, actor);
  assert.ok(bundle);
  assert.equal(bundle.manifest.stateBoundToAuditHead, true);
  assert.equal(bundle.manifest.canonicalStateSha256, store.canonicalStateSha256());
  assert.equal(bundle.manifest.auditHeadStateSha256, store.verifyChain().headStateSha256);
  assert.ok(bundle.limitations.some(item => /revisioni storiche|record legacy/i.test(item)));
  record('I06', 'passed', 'Evidence bundles expose the current state-to-audit-head binding and its historical limitation.');

  assert.equal(canonicalJson(store.snapshot()).length > 0, true);
  const report = {
    schemaVersion: '2.1.0',
    control: 'W0-INTEGRITY',
    backend: 'sqlite-snapshot-plus-subject-version-plus-audit-ledger',
    invariant: 'current-canonical-state-bound-to-audit-head',
    result: 'passed',
    caseCount: cases.length,
    cases,
    limitations: [
      'The audit chain does not reconstruct historical canonical states that predate SubjectVersion materialization.',
      'New governed business mutations can materialize content-addressed SubjectVersion snapshots; this does not retroactively reconstruct legacy history.',
      'The binding is an application integrity control, not a qualified signature, trusted timestamp or non-repudiation mechanism.',
      'The canonical state digest excludes audit and commandResults; attachment bytes are represented through metadata digests stored in canonical state.',
      'Actors or code with authority to rewrite both snapshot and audit ledger and recompute the entire chain remain outside this local control boundary.'
    ]
  };
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(new URL('../artifacts/integrity-binding.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(`integrity-binding-check: ok (cases=${cases.length}, invariant=${report.invariant})`);
  store.close();
} finally {
  await rm(root, { recursive: true, force: true });
  await rm(tamperRoot, { recursive: true, force: true });
  await rm(legacyRoot, { recursive: true, force: true });
}
