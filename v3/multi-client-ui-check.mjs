import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveCoreWorkspace, validateCoreTask } from './public/js/journey-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = relative => readFile(path.join(root, relative), 'utf8');
const [html, common, actions, render, contractText] = await Promise.all([
  read('v3/public/index.html'), read('v3/public/js/journey-shell-common.js'),
  read('v3/public/js/journey-shell-actions.js'), read('v3/public/js/journey-shell-render.js'),
  read('v3/public/core-workspaces.json')
]);
const contract = JSON.parse(contractText);

assert.deepEqual(contract.workspaces.map(item => item.id), ['monitoring', 'incidents']);
assert.equal(contract.visibleObjects.find(item => item.id === 'tenant-context')?.usedBy.length, 3);
assert.ok(contract.actions.every(item => item.permission));
assert.match(html, /id="actorSelect"/);
assert.match(html, /id="tenantSelect"/);
assert.doesNotMatch(html, /name="operatingContext"|id="monitorContext"|id="sourceContext"|id="matterContext"/);
assert.match(common, /x-ictc-actor-id/);
assert.match(common, /x-ictc-tenant-id/);
assert.match(actions, /loadAccess/);
assert.match(actions, /switchAccess/);
assert.doesNotMatch(actions, /operatingContext\s*:/);
assert.doesNotMatch(actions, /\bby\s*:/);
assert.match(render, /Monitora URL/);
assert.match(render, /Aggiungi contenuto/);
assert.match(render, />Segnala</);
assert.doesNotMatch(render, /Monitoraggi programmati|Collegamenti tra fonti e decisioni/);

const taskEnvelope = (id, data, status = 'attention-required') => ({ id, label: id, statement: 'stato', epistemicStatus: status, data, inputs: [], limitations: [] });
function fixture(role, permissions) {
  const source = { id:'src-1', lifecycle:'candidate', reviewState:'candidate-awaiting-review', operatingContext:'enterprise' };
  const sourceView = taskEnvelope('source-src-1', source, 'candidate');
  const matter = { id:'matter-1', state:'facts-to-confirm', owner:'Owner', phaseEvidence:{}, operatingContext:'enterprise' };
  const matterView = taskEnvelope('matter-matter-1', matter);
  return {
    meta:{ access:{ current:{ role, permissions } }, monitoring:{ scheduler:'active', remoteFetch:'disabled', aiStudy:'unavailable' } },
    sources:[source], findings:[], jobs:[], changes:[], matters:[matter], controls:[], coverage:[],
    views:{ sources:[sourceView], findings:[], jobs:[], changes:[], matters:[matterView], semanticGraph:{edges:[]} },
    objectIndex:{'source-src-1':sourceView,'matter-matter-1':matterView}
  };
}
const viewerMonitoring = deriveCoreWorkspace(fixture('viewer', ['read']), 'monitoring', null, contract);
const reviewerMonitoring = deriveCoreWorkspace(fixture('reviewer', ['read','review']), 'monitoring', null, contract);
const viewerIncident = deriveCoreWorkspace(fixture('viewer', ['read']), 'incidents', null, contract);
const ownerIncident = deriveCoreWorkspace(fixture('owner', ['read','manage-case']), 'incidents', null, contract);
assert.ok(viewerMonitoring.activeTask.readOnly);
assert.equal(reviewerMonitoring.activeTask.readOnly, false);
assert.ok(viewerIncident.activeTask.readOnly);
assert.equal(ownerIncident.activeTask.readOnly, false);
for (const value of [viewerMonitoring.activeTask, reviewerMonitoring.activeTask, viewerIncident.activeTask, ownerIncident.activeTask]) assert.ok(validateCoreTask(value));

console.log('multi-client-ui-check: ok (2 services, tenant selector, permission-aware tasks, minimal labels)');
