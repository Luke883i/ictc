import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveGuidedWorkspace, permissionForTask } from './public/js/journey-guidance.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const contract = JSON.parse(await readFile(path.join(root, 'v3/public/core-workspaces.json'), 'utf8'));
const matter = {
  id: 'matter-matter-1', label: 'Accesso anomalo', statement: 'Accesso anomalo osservato.', epistemicStatus: 'attention-required',
  data: { id: 'matter-1', state: 'facts-to-confirm', owner: 'Incident manager', phaseEvidence: {} }
};
const sample = permissions => ({
  meta: { access: { current: { permissions } } },
  views: { sources: [], jobs: [], findings: [], changes: [], matters: [matter], semanticGraph: { edges: [] } },
  matters: [matter.data], sources: [], jobs: [], objectIndex: { [matter.id]: matter }
});

const viewerWorkspace = deriveGuidedWorkspace(sample(['read']), 'incidents', null, contract);
assert.equal(viewerWorkspace.activeTask, null);
assert.equal(viewerWorkspace.actionableTasks.length, 0);
assert.equal(viewerWorkspace.waitingTasks.length, 1);

const ownerWorkspace = deriveGuidedWorkspace(sample(['read','observe','run','report','review','decide','manage-case']), 'incidents', null, contract);
assert.ok(ownerWorkspace.activeTask);
assert.equal(ownerWorkspace.activeTask.readOnly, false);
assert.equal(ownerWorkspace.waitingTasks.length, 0);

const blockedId = viewerWorkspace.waitingTasks[0].id;
assert.equal(deriveGuidedWorkspace(sample(['read']), 'incidents', blockedId, contract).activeTask, null);
assert.equal(permissionForTask(ownerWorkspace.tasks[0], contract), 'manage-case');
console.log('guided-journey-check: ok (actionable focus, waiting queue, contract permissions)');
