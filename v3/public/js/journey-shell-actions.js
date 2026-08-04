import {
  $, $$, esc, state, statusLabels, roleLabels, api, announce, openDialog, closeDialog,
  applyPreferences, savePreferences, currentWorkspace, currentTask, setAccessSelection, clearAccessSelection, ApiError
} from './journey-shell-common.js';
import { render } from './journey-shell-render.js';

function currentPrincipal() {
  return state.access?.principals?.find(item => item.id === state.access?.current?.actor?.id) || null;
}

function populateAccessSelectors() {
  const actorField = $('#actorField');
  const actorSelect = $('#actorSelect');
  const tenantSelect = $('#tenantSelect');
  const principals = state.access?.principals || [];
  actorField.hidden = !principals.length;
  actorSelect.innerHTML = principals.map(item => `<option value="${esc(item.id)}">${esc(item.label)}</option>`).join('');
  actorSelect.value = state.access.current.actor.id;
  const principal = currentPrincipal();
  const memberships = principal?.memberships || state.access.tenants.map(item => ({ tenantId: item.id, tenantLabel: item.label, role: item.role }));
  tenantSelect.innerHTML = memberships.map(item => `<option value="${esc(item.tenantId)}">${esc(item.tenantLabel || item.tenantId)}</option>`).join('');
  tenantSelect.value = state.access.current.tenant.id;
}

export async function loadAccess() {
  try { state.access = await api('/api/access'); }
  catch (error) {
    if (!state.accessSelection.actorId && !state.accessSelection.tenantId) throw error;
    clearAccessSelection();
    state.access = await api('/api/access');
  }
  setAccessSelection(state.access.current.actor.id, state.access.current.tenant.id);
  populateAccessSelectors();
}

function populateSelects() {
  $('#controlSelect').innerHTML = (state.data.controls || []).map(item => `<option value="${esc(item.id)}">${esc(item.label)}</option>`).join('');
  const activeJobs = (state.data.jobs || []).filter(item => item.enabled);
  $('#runSelect').innerHTML = activeJobs.map(item => `<option value="${esc(item.id)}">${esc(item.label)}</option>`).join('');
}

function updateRuntimeState() {
  const access = state.data?.meta?.access?.current || state.access?.current;
  const version = state.data?.release?.version || state.data?.meta?.version || '';
  $('#runtimeState').textContent = `${access?.tenant?.label || 'Cliente'} · ${roleLabels[access?.role] || access?.role || ''}${version ? ` · ${version}` : ''}`;
}

export async function refresh() {
  state.data = await api('/api/bootstrap');
  state.access = state.data.meta.access;
  populateAccessSelectors();
  populateSelects();
  updateRuntimeState();
  render();
}

export async function renewSession() {
  const session = await api('/api/session', { method: 'POST', body: '{}' });
  state.sessionId = session.sessionId;
  state.sessionExpiresAt = session.expiresAt;
}

export async function switchAccess(actorId, tenantId) {
  setAccessSelection(actorId, tenantId);
  state.selectedTaskId = null;
  state.activeObject = null;
  state.lastReceipt = null;
  await loadAccess();
  await refresh();
  await renewSession();
  announce(`Cliente attivo: ${state.access.current.tenant.label}.`);
}

export async function checkpoint(task, summary, execute) {
  $('#checkpointSummary').textContent = summary || task.consequence;
  $('#checkpointBefore').textContent = task.before;
  $('#checkpointAfter').textContent = task.after;
  $('#checkpointEvidence').textContent = task.evidenceAfter.join(' · ');
  $('#checkpointLimits').innerHTML = task.doesNotMean.map(item => `<li>${esc(item)}</li>`).join('');
  const dialog = $('#checkpointDialog');
  dialog.returnValue = 'cancel';
  const confirmed = await new Promise(resolve => {
    const onClose = () => { dialog.removeEventListener('close', onClose); resolve(dialog.returnValue === 'confirm'); };
    dialog.addEventListener('close', onClose);
    openDialog('checkpointDialog');
  });
  if (!confirmed) return null;
  return execute();
}


function createCommandId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if (globalThis.crypto?.getRandomValues) {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(value => value.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
  }
  return `cmd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

export async function mutate(path, payload, label) {
  announce(`${label}: registrazione in corso`);
  const commandId = createCommandId();
  const expectedHead = state.data?.meta?.integrity?.head || 'GENESIS';
  const options = { method: 'POST', headers: { 'x-ictc-command-id': commandId, 'x-ictc-expected-head': expectedHead }, body: JSON.stringify(payload) };
  const send = () => api(path, options);
  try {
    let result;
    try { result = await send(); }
    catch (error) { if (error instanceof TypeError) result = await send(); else throw error; }
    state.lastReceipt = result.receipt || null;
    state.selectedTaskId = null;
    announce(`${label}: ricevuta ${String(result.receipt?.hash || '').slice(0, 10)}`, 'saved');
    await refresh();
    return result;
  } catch (error) {
    if (error instanceof ApiError && ['ledger-head-changed', 'state-conflict'].includes(error.code)) {
      state.selectedTaskId = null;
      await refresh();
      announce('Attività aggiornata da un’altra persona. Controlla il nuovo prossimo passo.', 'error');
      return null;
    }
    announce(error.message, 'error');
    throw error;
  }
}

function openChoice(task) {
  state.choiceTask = task;
  const isSource = task.action.kind === 'source-review';
  $('#choiceTitle').textContent = isSource ? 'Includere la fonte?' : 'La differenza è rilevante?';
  $('#choiceContext').textContent = task.summary;
  const choices = isSource
    ? [['accepted', 'Includi', 'La fonte entra nel perimetro del cliente.'], ['rejected', 'Escludi', 'La review resta registrata.']]
    : [['relevant', 'Rilevante', 'Apre una decisione di impatto.'], ['not-relevant', 'Non rilevante', 'Conserva la review senza decisione.']];
  $('#choiceOptions').innerHTML = choices.map(([value, label, detail], index) => `<label class="choice-option"><input type="radio" name="outcome" value="${value}" ${index === 0 ? 'checked' : ''}><span><b>${label}</b><small>${detail}</small></span></label>`).join('');
  openDialog('choiceDialog');
}

function fieldHtml(field) {
  const required = field.required ? 'required' : '';
  if (field.type === 'select') return `<label for="phase-${esc(field.id)}">${esc(field.label)}<select id="phase-${esc(field.id)}" name="${esc(field.id)}" ${required}>${field.options.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join('')}</select></label>`;
  if (field.type === 'textarea') return `<label for="phase-${esc(field.id)}">${esc(field.label)}<textarea id="phase-${esc(field.id)}" name="${esc(field.id)}" rows="4" ${required}></textarea></label>`;
  return `<label for="phase-${esc(field.id)}">${esc(field.label)}<input id="phase-${esc(field.id)}" name="${esc(field.id)}" ${required}></label>`;
}

function openIncidentPhase(task) {
  state.phaseTask = task;
  const phase = task.action.phase;
  $('#incidentPhaseTitle').textContent = phase.label;
  $('#incidentPhaseSummary').textContent = phase.summary;
  $('#incidentPhaseForm').elements.id.value = task.action.value;
  $('#incidentPhaseForm').elements.to.value = phase.to;
  $('#incidentPhaseFields').innerHTML = phase.fields.map(fieldHtml).join('');
  openDialog('incidentPhaseDialog');
}

export async function performTask(task) {
  if (!task) return;
  if (task.readOnly) { announce(`Il ruolo corrente non può eseguire: ${task.permission}.`, 'error'); return; }
  const { kind, value } = task.action;
  if (kind === 'source-review' || kind === 'finding-review') return openChoice(task);
  if (kind === 'job-schedule') { $('#scheduleForm').elements.id.value = value; return openDialog('scheduleDialog'); }
  if (kind === 'change-decision') { $('#decisionForm').elements.id.value = value; return openDialog('decisionDialog'); }
  if (kind === 'control-map') { $('#controlForm').elements.id.value = value; return openDialog('controlDialog'); }
  if (kind === 'matter-owner') {
    const matter = state.data.matters.find(item => item.id === value);
    return checkpoint(task, `Confermare ${matter.owner} come owner?`, () => mutate(`/api/matters/${value}/confirm-owner`, { owner: matter.owner, raci: matter.raci }, 'Responsabilità'));
  }
  if (kind === 'matter-transition') return openIncidentPhase(task);
}

export async function openObject(id) {
  state.activeObject = await api(`/api/objects/${encodeURIComponent(id)}`);
  state.detailTab = 'meaning';
  renderDetail();
  openDialog('detailDialog');
}
function renderPhaseEvidence(data) {
  const entries = Object.entries(data?.phaseEvidence || {});
  if (!entries.length) return '';
  return `<div class="detail-row"><b>Prove di fase</b>${entries.map(([phase, evidence]) => `<details><summary>${esc(phase)}</summary><dl class="compact-detail">${Object.entries(evidence).map(([key, value]) => `<dt>${esc(key)}</dt><dd>${esc(value)}</dd>`).join('')}</dl></details>`).join('')}</div>`;
}
export function renderDetail() {
  const detail = state.activeObject;
  if (!detail) return;
  const { object, related, edges } = detail;
  $('#detailTitle').textContent = object.label;
  $('#detailStatus').textContent = statusLabels[object.epistemicStatus] || object.epistemicStatus;
  $$('[data-detail-tab]').forEach(button => { const selected = button.dataset.detailTab === state.detailTab; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
  $('#detailBody').setAttribute('aria-labelledby', `detailTab${state.detailTab[0].toUpperCase()}${state.detailTab.slice(1)}`);
  if (state.detailTab === 'meaning') $('#detailBody').innerHTML = `<div class="detail-row"><b>Sintesi</b><span>${esc(object.statement)}</span></div><div class="detail-row"><b>Prossimo passo</b><span>${esc(object.nextAction || 'Nessuna azione automatica.')}</span></div><div class="detail-row"><b>Limiti</b><ul>${(object.limitations || []).map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>${renderPhaseEvidence(object.data)}`;
  else if (state.detailTab === 'provenance') $('#detailBody').innerHTML = `<div class="detail-row"><b>Prodotto da</b><span>${esc(object.producer?.id || 'non disponibile')}</span></div><div class="detail-row"><b>Input</b><span>${esc((object.inputs || []).map(item => item.id).join(', ') || 'non disponibili')}</span></div><div class="detail-row"><b>Collegamenti</b><span>${esc((edges || []).map(edge => edge.label).join(', ') || 'nessuno')}</span></div><div class="related-list">${(related || []).map(item => `<button type="button" data-open-object="${esc(item.id)}">${esc(item.label)}</button>`).join('')}</div>`;
  else $('#detailBody').innerHTML = `<div class="detail-row"><b>Ricevuta</b><code>${esc(object.receiptRef || 'non disponibile')}</code></div><div class="detail-row"><b>Cliente</b><span>${esc(state.access.current.tenant.label)}</span></div><div class="detail-row"><b>Identificativo</b><code>${esc(object.id)}</code></div><p class="note">La prova tecnica non aggiunge autorità al contenuto.</p>`;
  $('#assistantCapsule').textContent = `${object.label} e ${(related || []).length} oggetti collegati · ${state.access.current.tenant.label}`;
}
export function search() {
  const query = $('#searchInput').value.trim().toLowerCase();
  const items = Object.values(state.data?.objectIndex || {}).filter(item => `${item.label} ${item.statement}`.toLowerCase().includes(query)).slice(0, 20);
  $('#searchResults').innerHTML = items.map(item => `<button type="button" class="search-result" data-search-object="${esc(item.id)}"><b>${esc(item.label)}</b><small>${esc(statusLabels[item.epistemicStatus] || item.epistemicStatus)}</small></button>`).join('') || '<div class="empty-state">Nessun risultato.</div>';
}
export async function askAssistant(event) {
  event.preventDefault();
  const question = $('#assistantQuestion').value.trim();
  if (!question || !state.activeObject) return;
  const result = await api('/api/assistant', { method: 'POST', body: JSON.stringify({ sessionId: state.sessionId, objectId: state.activeObject.object.id, question }) });
  $('#assistantMessages').insertAdjacentHTML('beforeend', `<article class="message"><b>Tu</b><p>${esc(question)}</p></article><article class="message"><b>Assistente · proposta</b><p>${esc(result.answer)}</p><small>${esc(result.limitations.join(' · '))}</small></article>`);
  $('#assistantQuestion').value = '';
}

