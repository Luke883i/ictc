import { deriveCoreWorkspace } from './journey-model.js';

const taskActionIds = Object.freeze({
  'source-review': 'source-review',
  'finding-review': 'finding-review',
  'job-schedule': 'job-schedule',
  'change-decision': 'change-decision',
  'control-map': 'control-map',
  'matter-owner': 'matter-owner',
  'matter-transition': 'matter-transition'
});

export function permissionForTask(task, contract = {}) {
  const actionId = taskActionIds[task?.action?.kind];
  return contract.actions?.find(item => item.id === actionId)?.permission || task?.permission || 'read';
}

export function deriveGuidedWorkspace(data, mode = 'monitoring', selectedTaskId = null, contract = {}) {
  const base = deriveCoreWorkspace(data, mode, selectedTaskId, contract);
  const permissions = new Set(data?.meta?.access?.current?.permissions || ['read']);
  const tasks = base.tasks.map(item => {
    const permission = permissionForTask(item, contract);
    return { ...item, permission, readOnly: !permissions.has(permission), availability: permissions.has(permission) ? 'available' : 'permission-required' };
  });
  const actionableTasks = tasks.filter(item => !item.readOnly);
  const waitingTasks = tasks.filter(item => item.readOnly);
  const selected = tasks.find(item => item.id === selectedTaskId && !item.readOnly) || null;
  return { ...base, tasks, actionableTasks, waitingTasks, activeTask: selected || actionableTasks[0] || null };
}

function setTextIfChanged(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function waitingFocus(workspace) {
  const focus = document.querySelector('.focus-line');
  if (!focus || workspace.actionableTasks.length || !workspace.waitingTasks.length) return;
  if (focus.dataset.guidanceState === 'waiting') return;
  focus.dataset.guidanceState = 'waiting';
  focus.classList.add('empty-focus');
  focus.innerHTML = `<div><span class="eyebrow">Prossimo passo</span><h2>Nessuna azione per il tuo ruolo</h2><p>${workspace.waitingTasks.length} attività attendono un ruolo autorizzato.</p></div><button id="primaryTaskAction" type="button" hidden aria-hidden="true">Solo lettura</button><p class="boundary-note">Puoi leggere oggetti e prove. Non significa conformità, completezza o assenza di rischio.</p>`;
}

function labelQueues(workspace) {
  const disclosure = document.querySelector('.task-disclosure');
  if (!disclosure) return;
  const summary = disclosure.querySelector('summary');
  const summaryText = workspace.actionableTasks.length > 1
    ? `Da fare (${workspace.actionableTasks.length - 1})`
    : `In attesa di un altro ruolo (${workspace.waitingTasks.length})`;
  setTextIfChanged(summary, summaryText);
  for (const button of disclosure.querySelectorAll('[data-task]')) {
    const task = workspace.tasks.find(item => item.id === button.dataset.task);
    if (!task?.readOnly) continue;
    if (!button.disabled) button.disabled = true;
    if (button.getAttribute('aria-disabled') !== 'true') button.setAttribute('aria-disabled', 'true');
    setTextIfChanged(button.lastElementChild, `Richiede ${task.permission}`);
  }
}

export function reconcileGuidedJourney(state, contract) {
  if (!state?.data || !contract) return;
  const workspace = deriveGuidedWorkspace(state.data, state.mode, state.selectedTaskId, contract);
  const current = deriveCoreWorkspace(state.data, state.mode, state.selectedTaskId, contract);
  if (workspace.activeTask && current.activeTask?.id !== workspace.activeTask.id) {
    const button = document.querySelector(`[data-task="${CSS.escape(workspace.activeTask.id)}"]`);
    if (button) { button.click(); return; }
  }
  waitingFocus(workspace);
  labelQueues(workspace);
}

export function installGuidedJourney(state, contract) {
  const main = document.querySelector('#main');
  if (!main) return () => {};
  let scheduled = false;
  const reconcile = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; reconcileGuidedJourney(state, contract); });
  };
  const observer = new MutationObserver(reconcile);
  observer.observe(main, { childList: true, subtree: true });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-task]');
    if (!button) return;
    const workspace = deriveGuidedWorkspace(state.data, state.mode, state.selectedTaskId, contract);
    if (workspace.waitingTasks.some(item => item.id === button.dataset.task)) event.preventDefault();
  }, true);
  reconcile();
  return () => observer.disconnect();
}

export const guidanceInternals = Object.freeze({ taskActionIds, setTextIfChanged, waitingFocus, labelQueues });
