import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canonicalHomeNextAction } from './runtime/workbench-projection.mjs';
import { canonicalWorkQueue } from './runtime/work-orchestration.mjs';

const base = { catalog: [], incidents: [], missions: [], grcObjects: [], grcMappings: [], grcActions: [], grcRisks: [], grcAssurance: [] };
const admin = { id: 'admin-test', role: 'admin', permissions: ['read','configure-ai','manage-monitoring','manage-grc','contribute-grc'] };
const user = { id: 'alice', role: 'user', permissions: ['read','report-incident','contribute-source','contribute-grc'] };
const auditor = { id: 'audit-test', role: 'auditor', permissions: ['read'] };

// Preserve the V1/V2 procedure-local semantics: the canonical legacy projector remains valid and testable.
const setup = canonicalHomeNextAction(base, admin, { llmReady: false });
assert.equal(setup.kind, 'configure-ai');
assert.equal(setup.targetId, null);

const sourceState = {
  ...base,
  catalog: [
    { id: 'source-regular', title: 'Regular source', state: 'candidate', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'source-internal', title: 'Policy 7', state: 'candidate', updatedAt: '2026-08-02T00:00:00Z', internalReference: { masterSystem: 'DMS', masterId: 'POL-7', masterVersion: '7' } }
  ]
};
const adminSource = canonicalHomeNextAction(sourceState, admin, { llmReady: false });
assert.equal(adminSource.kind, 'verify-internal-source');
assert.equal(adminSource.action, 'monitoring-catalog');
assert.equal(adminSource.targetType, 'catalog');
assert.equal(adminSource.targetId, 'source-internal');
assert.equal(adminSource.readOnly, false);
const auditorSource = canonicalHomeNextAction(sourceState, auditor);
assert.equal(auditorSource.kind, 'inspect-internal-source');
assert.equal(auditorSource.targetId, 'source-internal');
assert.equal(auditorSource.readOnly, true);

const userOwn = canonicalHomeNextAction({ ...base, incidents: [
  { id: 'foreign', state: 'review', createdBy: 'bob', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 'own', state: 'clarifying', createdBy: 'alice', updatedAt: '2026-08-02T00:00:00Z' }
]}, user);
assert.equal(userOwn.kind, 'continue-own-incident');
assert.equal(userOwn.targetId, 'own');
const userForeignOnly = canonicalHomeNextAction({ ...base, incidents: [{ id: 'foreign', state: 'review', createdBy: 'bob' }] }, user);
assert.equal(userForeignOnly.kind, 'record-incident');
assert.equal(userForeignOnly.targetId, null);
const userClosed = canonicalHomeNextAction({ ...base, incidents: [{ id: 'closed-own', state: 'closed', createdBy: 'alice' }] }, user);
assert.equal(userClosed.kind, 'record-incident');

// V3 composes all process-local work into one deterministic cross-process queue.
const emptyQueue = canonicalWorkQueue(base, admin, { llmReady: false });
assert.equal(emptyQueue.authority, 'runtime-work-queue');
assert.equal(emptyQueue.nextAction.kind, 'configure-ai');
const queueWithSource = canonicalWorkQueue(sourceState, admin, { llmReady: false });
assert.equal(queueWithSource.nextAction.kind, 'verify-internal-source');
assert.equal(queueWithSource.nextAction.processId, 'monitoring');
assert.equal(queueWithSource.nextAction.targetId, 'source-internal');
const auditorQueue = canonicalWorkQueue(sourceState, auditor, { llmReady: true });
assert.equal(auditorQueue.items.every(item => item.readOnly), true);

const server = await readFile(new URL('./server.mjs', import.meta.url), 'utf8');
const render = await readFile(new URL('./public/ui/render.js', import.meta.url), 'utf8');
const actions = await readFile(new URL('./public/ui/actions.js', import.meta.url), 'utf8');
assert.match(server, /workProjection\(snapshot,actor/);
assert.match(server, /projected\.homeNextAction=projected\.work\.queue\.nextAction/);
assert.match(render, /state\.data\.homeNextAction/);
assert.doesNotMatch(render, /function homeAction\(/);
assert.match(render, /homeTargetType/);
assert.match(render, /homeTargetId/);
assert.match(actions, /next\.targetType\s*===\s*'catalog'/);
assert.match(actions, /next\.targetType\s*===\s*'incident'/);
assert.match(actions, /state\.activeSourceId\s*=\s*next\.targetId/);
assert.match(actions, /state\.activeIncidentId\s*=\s*next\.targetId/);
assert.match(actions, /announceTargetSurface\('source-dialog'\)/);
assert.match(actions, /announceTargetSurface\('incident-workspace'\)/);
console.log('home-next-action-check: ok (V3 unified queue + V1/V2 RBAC/FI-01 fallthrough + UI terminal propagation)');
