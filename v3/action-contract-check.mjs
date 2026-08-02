import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { journeyModelInternals } from './public/js/journey-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const publicContract = JSON.parse(await readFile(path.join(root, 'v3/public/core-workspaces.json'), 'utf8'));
const serverContract = JSON.parse(await readFile(path.join(root, 'v3/core-workspaces.json'), 'utf8'));
assert.deepEqual(serverContract, publicContract);

const ids = new Set();
const routes = new Set();
for (const action of publicContract.actions) {
  assert.ok(action.id && action.method && action.path && action.route && action.permission && action.userLabel && action.projection);
  assert.equal(action.route, `${action.method} ${action.path}`);
  assert.equal(ids.has(action.id), false, `azione duplicata: ${action.id}`);
  assert.equal(routes.has(action.route), false, `route duplicata: ${action.route}`);
  ids.add(action.id); routes.add(action.route);
  if (action.receiptExpected) assert.ok(action.event && action.producer, `${action.id}: evento o producer assente`);
  else assert.equal(action.event, null);
}

const api = await import(`./lib/api.mjs?action-contract=${Date.now()}`);
for (const action of publicContract.actions) assert.deepEqual(api.apiInternals.actionSpec(action.id), action);
for (const id of ['source-review','finding-review','job-schedule','change-decision','control-map','matter-owner','matter-transition']) {
  assert.equal(journeyModelInternals.permissionFor(publicContract, id), publicContract.actions.find(item => item.id === id).permission);
}
assert.equal(publicContract.actions.find(item => item.id === 'job-schedule').permission, 'run');
console.log(`action-contract-check: ok (${ids.size} actions, permission-route-event-projection wired)`);
