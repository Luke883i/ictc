import { strict as assert } from 'node:assert';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const runtime = await mkdtemp(path.join(os.tmpdir(), 'ictc-tenants-'));
process.env.ICTC_RUNTIME_DIR = runtime;
const store = await import(`./lib/store.mjs?test=${Date.now()}`);
const tenantA = { id: 'tenant-a', label: 'Tenant A', organizationType: 'enterprise', seedProfile: 'empty' };
const tenantB = { id: 'tenant-b', label: 'Tenant B', organizationType: 'public-administration', seedProfile: 'empty' };
const actorA = { tenant: tenantA, actor: { id: 'alice', label: 'Alice' }, role: 'owner' };
const actorB = { tenant: tenantB, actor: { id: 'bob', label: 'Bob' }, role: 'analyst' };

try {
  await Promise.all(Array.from({ length: 20 }, (_, index) => store.append(actorA, 'source.proposed', { source: { id: `a-${index}`, title: `A ${index}` }, finding: null }, 'test')));
  await Promise.all(Array.from({ length: 20 }, (_, index) => store.append(actorB, 'source.proposed', { source: { id: `b-${index}`, title: `B ${index}` }, finding: null }, 'test')));
  const [eventsA, eventsB] = await Promise.all([store.readLedger(tenantA.id), store.readLedger(tenantB.id)]);
  assert.equal(eventsA.length, 20);
  assert.equal(eventsB.length, 20);
  assert.equal(store.verify(eventsA, tenantA.id).ok, true);
  assert.equal(store.verify(eventsB, tenantB.id).ok, true);
  assert.equal(eventsA.every(event => event.tenantId === tenantA.id && event.actor.id === 'alice'), true);
  assert.equal(eventsB.every(event => event.tenantId === tenantB.id && event.actor.id === 'bob'), true);
  const stateA = store.apply(eventsA, tenantA);
  const stateB = store.apply(eventsB, tenantB);
  assert.equal(stateA.sources.some(item => item.id.startsWith('b-')), false);
  assert.equal(stateB.sources.some(item => item.id.startsWith('a-')), false);
  const receipt = await store.append(actorA, 'matter.reported', { matter: { id: 'case-a', title: 'Caso A', state: 'facts-to-confirm', timeline: [], phaseEvidence: {} } }, 'test');
  assert.equal(receipt.receipt.tenantId, tenantA.id);
  assert.equal(receipt.receipt.actorRole, 'owner');
  console.log('tenant-store-check: ok (40 concurrent writes, 2 isolated ledgers)');
} finally {
  await rm(runtime, { recursive: true, force: true });
}
