import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canonicalHomeNextAction } from './runtime/workbench-projection.mjs';

const base = { catalog: [], incidents: [], missions: [] };
const admin = { id: 'admin-test', role: 'admin', permissions: ['read','configure-ai','manage-monitoring'] };
const user = { id: 'alice', role: 'user', permissions: ['read','report-incident','contribute-source'] };
const auditor = { id: 'audit-test', role: 'auditor', permissions: ['read'] };

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

const server = await readFile(new URL('./server.mjs', import.meta.url), 'utf8');
const render = await readFile(new URL('./public/ui/render.js', import.meta.url), 'utf8');
const actions = await readFile(new URL('./public/ui/actions.js', import.meta.url), 'utf8');
assert.match(server, /canonicalHomeNextAction/);
assert.match(server, /grcNextAction\(snapshot,actor\)\|\|canonicalHomeNextAction\(snapshot,actor/);
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
console.log('home-next-action-check: ok (V2 GRC composition + V1 RBAC/FI-01 fallthrough + UI terminal propagation)');
