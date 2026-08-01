import { strict as assert } from 'node:assert';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createBlobStore } from './lib/blob-store.mjs';
import { createRuntimeModel } from './lib/runtime-model.mjs';
import { isPrivateAddress } from './lib/network-policy.mjs';

const contract = {
  operatingScenarios: [{ id: 'enterprise' }, { id: 'public-administration' }, { id: 'regulated-enterprise' }],
  incidentPhases: [{
    from: 'owned', to: 'assessing', phase: 'triage', label: 'Registra il triage',
    fields: [
      { id: 'classification', label: 'Classificazione', required: true, options: [['event', 'Evento'], ['near-miss', 'Quasi incidente'], ['incident', 'Incidente']] },
      { id: 'scope', label: 'Perimetro', required: true }
    ]
  }]
};

const temporary = await mkdtemp(path.join(os.tmpdir(), 'ictc-kernel-'));
let sequence = 0;
const model = createRuntimeModel(contract, {
  id: prefix => `${prefix}-test-${++sequence}`,
  now: () => new Date('2026-08-01T12:00:00.000Z')
});
const blobs = createBlobStore({ root: path.join(temporary, 'blobs') });

try {
  const first = await blobs.putText('Clausola osservata');
  const second = await blobs.putText('Clausola osservata');
  assert.equal(first.checksum, second.checksum);
  assert.equal(second.created, false);
  assert.equal((await blobs.verify(first.locator)).ok, true);

  const monitoring = model.createMonitoring({ label: 'Monitoraggio', url: 'https://example.test/path#fragment', intervalMinutes: 5 });
  assert.equal(monitoring.source.locator, 'https://example.test/path');
  assert.equal(monitoring.job.schedule.intervalMinutes, 15);
  assert.equal(model.scheduleMonitoring(monitoring.job, { intervalMinutes: 60 }).nextRunAt, '2026-08-01T13:00:00.000Z');

  const manual = model.createManualSource({ title: 'Contenuto' }, first);
  assert.equal(manual.source.kind, 'user-text');
  assert.equal(manual.finding.sourceId, manual.source.id);

  const incident = model.createIncident({ summary: 'Accesso anomalo a dati del fornitore.', operatingContext: 'public-administration' });
  const transition = model.validateIncidentTransition({ ...incident, state: 'owned' }, 'assessing', { classification: 'incident', scope: 'Portale esterno' });
  assert.equal(transition.phase.phase, 'triage');
  assert.throws(() => model.validateIncidentTransition({ ...incident, state: 'owned' }, 'assessing', { classification: 'invalid', scope: 'x' }));

  assert.equal(isPrivateAddress('127.0.0.1'), true);
  assert.equal(isPrivateAddress('::1'), true);
  assert.equal(isPrivateAddress('2606:4700:4700::1111'), false);
  console.log('runtime-kernel-check: ok (5 checks)');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
