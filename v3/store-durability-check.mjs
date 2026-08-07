import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Store } from './store.mjs';

const root = await mkdtemp(path.join(tmpdir(), 'ictc-store-durability-'));
const actor = { id: 'durability-check', role: 'admin', permissions: [] };
const cases = [];
const record = (id, status, evidence) => cases.push({ id, status, evidence });

try {
  const store = await new Store(root).init();
  const baseline = store.snapshot();

  let releasePersist;
  let persistEnteredResolve;
  const persistEntered = new Promise(resolve => { persistEnteredResolve = resolve; });
  const persistBarrier = new Promise(resolve => { releasePersist = resolve; });
  const originalPersist = store.persist.bind(store);
  store.persist = async state => {
    persistEnteredResolve();
    await persistBarrier;
    return originalPersist(state);
  };

  let mutationSettled = false;
  const mutation = store.mutate(
    actor,
    'durability.visibility',
    { type: 'durability-check', id: 'visibility' },
    { value: 1 },
    draft => {
      draft.settings.organization.name = 'Persisted before visible';
      return { changed: true };
    },
    { id: 'durability-visibility' }
  ).finally(() => { mutationSettled = true; });

  await persistEntered;
  assert.equal(mutationSettled, false, 'mutation must remain pending while persistence is pending');
  assert.deepEqual(store.snapshot(), baseline, 'candidate state must not be visible before persistence completes');
  releasePersist();
  const envelope = await mutation;
  store.persist = originalPersist;
  assert.equal(envelope.replayed, false);
  assert.equal(store.snapshot().revision, baseline.revision + 1);
  record('D01', 'passed', 'Snapshot remains at the last durable revision while persistence is in flight.');

  const diskAfterSuccess = JSON.parse(await readFile(path.join(root, 'state.json'), 'utf8'));
  assert.equal(diskAfterSuccess.revision, store.snapshot().revision);
  assert.equal(diskAfterSuccess.settings.organization.name, store.snapshot().settings.organization.name);
  record('D02', 'passed', 'Successful mutation is read back from state.json before becoming visible.');

  const beforeFailure = store.snapshot();
  store.persist = async () => {
    const error = new Error('simulated disk full');
    error.code = 'ENOSPC';
    throw error;
  };
  await assert.rejects(
    store.mutate(
      actor,
      'durability.failure',
      { type: 'durability-check', id: 'failure' },
      {},
      draft => {
        draft.settings.organization.name = 'Ghost state';
        return { changed: true };
      },
      { id: 'durability-failure' }
    ),
    error => error.code === 'ENOSPC'
  );
  store.persist = originalPersist;
  assert.deepEqual(store.snapshot(), beforeFailure, 'failed persistence must not advance visible state');
  const diskAfterFailure = JSON.parse(await readFile(path.join(root, 'state.json'), 'utf8'));
  assert.equal(diskAfterFailure.revision, beforeFailure.revision);
  assert.equal(diskAfterFailure.settings.organization.name, beforeFailure.settings.organization.name);
  record('D03', 'passed', 'ENOSPC leaves both visible memory and durable revision unchanged.');

  const replay = await store.mutate(
    actor,
    'durability.visibility',
    { type: 'durability-check', id: 'visibility' },
    { value: 1 },
    () => { throw new Error('replay change must not execute'); },
    { id: 'durability-visibility' }
  );
  assert.equal(replay.replayed, true);
  assert.equal(replay.receipt.revision, envelope.receipt.revision);
  record('D04', 'passed', 'Command replay still resolves to the already-durable receipt.');

  const report = {
    schemaVersion: '1.0.0',
    control: 'W0-PERSIST',
    invariant: 'persist-readback-before-visible',
    caseCount: cases.length,
    result: 'passed',
    cases,
    limitations: [
      'This check proves single-process persist-before-visible semantics for the local JSON store.',
      'It does not claim multi-process transactions, HA, backup/restore, RTO/RPO or enterprise durability.'
    ]
  };
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(new URL('../artifacts/store-durability.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(`store-durability-check: ok (cases=${cases.length}, invariant=${report.invariant})`);
} finally {
  await rm(root, { recursive: true, force: true });
}
