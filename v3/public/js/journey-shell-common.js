import { deriveCoreWorkspace } from './journey-model.js';
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export class ApiError extends Error {
  constructor(message, status, code = 'request-failed', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const statusLabels = {
  observed: 'Osservato', candidate: 'Da rivedere', 'awaiting-human-review': 'Da rivedere', 'human-reviewed': 'Registrato',
  'human-owned': 'Assegnato', verified: 'Verificato', failed: 'Errore', unavailable: 'Non disponibile', bounded: 'Limitato',
  mapped: 'Collegato', 'attention-required': 'Da completare', 'ai-proposed': 'Proposta AI', operational: 'Attivo'
};
export const eventLabels = {
  'source.proposed': 'Contenuto registrato', 'source.reviewed': 'Review fonte',
  'job.created': 'Monitoraggio configurato', 'job.scheduled': 'Monitoraggio pianificato',
  'job.completed': 'Monitoraggio eseguito', 'job.failed': 'Monitoraggio non completato',
  'finding.reviewed': 'Review differenza', 'change.decided': 'Decisione registrata',
  'change.control.mapped': 'Controllo collegato', 'matter.reported': 'Segnalazione registrata',
  'matter.owner.confirmed': 'Responsabilità confermata', 'matter.transitioned': 'Fase del caso registrata'
};
export const aiStatusLabels = { completed: 'Completato', failed: 'Errore', unavailable: 'Non configurato' };
export const schedulerLabels = { active: 'Pianificazione attiva', disabled: 'Pianificazione disattivata', 'not-started': 'Pianificazione non avviata' };
export const roleLabels = { viewer: 'Lettore', analyst: 'Analista', reviewer: 'Reviewer', owner: 'Owner', admin: 'Admin', system: 'Servizio' };
export const permissionLabels = { read: 'lettura', observe: 'inserimento', run: 'esecuzione', report: 'segnalazione', review: 'review', decide: 'decisione', 'manage-case': 'gestione caso', admin: 'amministrazione' };
export const phaseLabels = {
  'facts-to-confirm': 'Segnalazione', owned: 'Triage', assessing: 'Analisi', responding: 'Risposta',
  'closure-review': 'Ripristino', closed: 'Chiuso'
};

const dialogReturnFocus = new Map();
function savedAccess() {
  try { return JSON.parse(localStorage.getItem('ictc-access') || '{}'); } catch { return {}; }
}
export const state = {
  data: null,
  contract: null,
  access: null,
  accessSelection: savedAccess(),
  mode: localStorage.getItem('ictc-core-mode') || 'monitoring',
  selectedTaskId: null,
  activeObject: null,
  detailTab: 'meaning',
  sessionId: null,
  sessionExpiresAt: null,
  lastReceipt: null,
  choiceTask: null,
  phaseTask: null
};

export function setAccessSelection(actorId, tenantId) {
  state.accessSelection = { actorId, tenantId };
  localStorage.setItem('ictc-access', JSON.stringify(state.accessSelection));
}
export function clearAccessSelection() {
  state.accessSelection = {};
  localStorage.removeItem('ictc-access');
}
export function accessHeaders() {
  const values = {};
  if (state.accessSelection.actorId) values['x-ictc-actor-id'] = state.accessSelection.actorId;
  if (state.accessSelection.tenantId) values['x-ictc-tenant-id'] = state.accessSelection.tenantId;
  return values;
}
export async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'content-type': 'application/json', ...accessHeaders(), ...(options.headers || {}) }
  });
  const type = response.headers.get('content-type') || '';
  const body = type.includes('json') ? await response.json() : await response.text();
  if (!response.ok) throw new ApiError(body?.error || body || `${response.status}`, response.status, body?.code || 'request-failed', body);
  return body;
}
let announceTimer;
export function announce(message, kind = 'idle') {
  const node = $('#operationStatus');
  clearTimeout(announceTimer);
  node.textContent = `${kind === 'error' ? 'Errore · ' : kind === 'saved' ? 'Registrato · ' : ''}${message}`;
  node.dataset.visible = kind === 'error' ? 'true' : 'false';
  if (kind === 'error') announceTimer = setTimeout(() => { node.dataset.visible = 'false'; }, 5000);
}
export function openDialog(id) {
  const dialog = $(`#${id}`);
  if (!dialog) throw new Error(`Finestra non disponibile: ${id}`);
  dialogReturnFocus.set(dialog, document.activeElement instanceof HTMLElement ? document.activeElement : null);
  dialog.showModal();
}
export function closeDialog(id) {
  const dialog = $(`#${id}`);
  if (!dialog?.open) return;
  const target = dialogReturnFocus.get(dialog);
  dialog.close();
  dialogReturnFocus.delete(dialog);
  if (target instanceof HTMLElement && target.isConnected) target.focus();
}
export function applyPreferences() {
  const defaults = { text: 'default', density: 'comfortable', contrast: 'system', motion: 'system' };
  let preferences = defaults;
  try { preferences = { ...defaults, ...JSON.parse(localStorage.getItem('ictc-comfort') || '{}') }; } catch {}
  for (const [key, value] of Object.entries(preferences)) document.documentElement.dataset[key] = value;
  $('#textScale').value = preferences.text;
  $('#density').value = preferences.density;
  $('#contrast').value = preferences.contrast;
  $('#motion').value = preferences.motion;
}
export function savePreferences() {
  const preferences = { text: $('#textScale').value, density: $('#density').value, contrast: $('#contrast').value, motion: $('#motion').value };
  localStorage.setItem('ictc-comfort', JSON.stringify(preferences));
  applyPreferences();
  announce('Visualizzazione aggiornata.');
}
export function currentWorkspace() { return deriveCoreWorkspace(state.data, state.mode, state.selectedTaskId, state.contract); }
export function currentTask(id) { const workspace = currentWorkspace(); return workspace.tasks.find(item => item.id === id) || workspace.activeTask; }
export function workspaceContract() { return state.contract.workspaces.find(item => item.id === state.mode); }
export function can(permission) { return Boolean(state.data?.meta?.access?.current?.permissions?.includes(permission)); }
export function actionPermission(actionId) { return state.contract?.actions?.find(item => item.id === actionId)?.permission || 'read'; }
export function canAction(actionId) { return can(actionPermission(actionId)); }
export function statusBadge(status) { return `<span class="status-badge status-${esc(status)}">${esc(statusLabels[status] || status)}</span>`; }
export function objectButton(item, fallback = 'Apri') {
  if (!item?.id) return '<span class="cell-empty">—</span>';
  return `<button type="button" class="object-link" data-open-object="${esc(item.id)}">${esc(item.label || fallback)}</button>`;
}
export function formatDate(value) {
  if (!value) return 'non pianificata';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? String(value) : new Intl.DateTimeFormat('it', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}
export function renderReceipt() {
  if (!state.lastReceipt) return '';
  const tenant = state.lastReceipt.tenantId ? ` · ${state.lastReceipt.tenantId}` : '';
  const actor = state.lastReceipt.actorId ? ` · ${state.lastReceipt.actorId}` : '';
  return `<aside class="receipt-strip" role="status"><b>Registrato</b><span>${esc(eventLabels[state.lastReceipt.eventType] || 'Operazione')}${esc(tenant)}${esc(actor)}</span><code>${esc(String(state.lastReceipt.hash || '').slice(0, 16))}</code></aside>`;
}
