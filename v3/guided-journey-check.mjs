import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveGuidedWorkspace, permissionForTask, guidanceInternals } from './public/js/journey-guidance.js';

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

let focusWrites = 0;
const focus = {
  dataset: {},
  classList: { add() {} },
  value: '',
  get innerHTML() { return this.value; },
  set innerHTML(value) { focusWrites += 1; this.value = value; }
};
let summaryWrites = 0;
const summary = {
  value: '',
  get textContent() { return this.value; },
  set textContent(value) { summaryWrites += 1; this.value = value; }
};
let tailWrites = 0;
const tail = {
  value: '',
  get textContent() { return this.value; },
  set textContent(value) { tailWrites += 1; this.value = value; }
};
const attributes = new Map();
const button = {
  dataset: { task: blockedId }, disabled: false, lastElementChild: tail,
  getAttribute: name => attributes.get(name) || null,
  setAttribute: (name, value) => attributes.set(name, value)
};
const disclosure = {
  querySelector: selector => selector === 'summary' ? summary : null,
  querySelectorAll: selector => selector === '[data-task]' ? [button] : []
};
const previousDocument = globalThis.document;
globalThis.document = {
  querySelector: selector => selector === '.focus-line' ? focus : selector === '.task-disclosure' ? disclosure : null
};
try {
  guidanceInternals.waitingFocus(viewerWorkspace);
  guidanceInternals.waitingFocus(viewerWorkspace);
  guidanceInternals.labelQueues(viewerWorkspace);
  guidanceInternals.labelQueues(viewerWorkspace);
} finally {
  if (previousDocument === undefined) delete globalThis.document;
  else globalThis.document = previousDocument;
}
assert.equal(focusWrites, 1, 'waiting focus must be rendered once');
assert.equal(summaryWrites, 1, 'queue label must change once');
assert.equal(tailWrites, 1, 'permission label must change once');
assert.equal(button.disabled, true);
assert.equal(attributes.get('aria-disabled'), 'true');

console.log('guided-journey-check: ok (actionable focus, waiting queue, contract permissions, idempotent reconciliation)');
