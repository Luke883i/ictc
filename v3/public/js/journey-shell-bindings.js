import { $, $$, state, announce, openDialog, closeDialog, applyPreferences, savePreferences, currentWorkspace, currentTask } from './journey-shell-common.js';
import { render } from './journey-shell-render.js';
import { loadAccess, refresh, renewSession, switchAccess, checkpoint, mutate, performTask, openObject, renderDetail, search, askAssistant } from './journey-shell-actions.js';

function bindStatic() {
  $('#actorSelect').addEventListener('change', async event => {
    const principal = state.access.principals.find(item => item.id === event.target.value);
    const membership = principal?.memberships?.[0];
    if (membership) await switchAccess(principal.id, membership.tenantId);
  });
  $('#tenantSelect').addEventListener('change', async event => { await switchAccess(state.access.current.actor.id, event.target.value); });
  $('#searchOpen').addEventListener('click', () => { openDialog('searchDialog'); $('#searchInput').focus(); });
  $('#comfortOpen').addEventListener('click', () => openDialog('comfortDialog'));
  $('#comfortDialog').addEventListener('close', () => { if ($('#comfortDialog').returnValue === 'save') savePreferences(); });
  $$('[data-dialog-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.dataset.dialogClose)));
  $('#searchInput').addEventListener('input', search);
  $('#assistantForm').addEventListener('submit', askAssistant);
  $('#assistantOpen').addEventListener('click', () => { closeDialog('detailDialog'); openDialog('assistantDialog'); $('#assistantQuestion').focus(); });
  $('.detail-tabs').addEventListener('keydown', event => {
    const tabs = $$('[data-detail-tab]');
    const current = tabs.indexOf(document.activeElement);
    if (current < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    state.detailTab = tabs[next].dataset.detailTab; renderDetail(); tabs[next].focus();
  });
  $('#monitorForm').addEventListener('submit', async event => {
    event.preventDefault(); const payload = Object.fromEntries(new FormData(event.currentTarget).entries()); closeDialog('monitorDialog');
    const task = { before: 'Non configurato', after: 'Fonte candidata e monitoraggio disattivato', consequence: 'Registra fonte, frequenza e domanda dello studio.', doesNotMean: ['Fonte inclusa.', 'AI disponibile.', 'Monitoraggio attivo.'], evidenceAfter: ['Fonte candidata.', 'Configurazione.', 'Ricevuta.'] };
    const result = await checkpoint(task, payload.url, () => mutate('/api/jobs', payload, 'Monitoraggio')); if (result) event.currentTarget.reset();
  });
  $('#runForm').addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const job = state.data.jobs.find(item => item.id === form.get('jobId')); const payload = { contentText: form.get('contentText') }; closeDialog('runDialog');
    const task = { before: job?.state || 'Stato corrente', after: 'Baseline o confronto registrato', consequence: 'Calcola impronta e studio AI se disponibile.', doesNotMean: ['Rilevanza decisa.', 'Applicabilità.', 'Completezza.'], evidenceAfter: ['Blob.', 'Digest.', 'Esito AI o indisponibilità.', 'Ricevuta.'] };
    await checkpoint(task, job?.label || form.get('jobId'), () => mutate(`/api/jobs/${form.get('jobId')}/run`, payload, 'Esecuzione'));
  });
  $('#scheduleForm').addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const task = currentWorkspace().tasks.find(item => item.action.kind === 'job-schedule' && item.action.value === form.get('id')); closeDialog('scheduleDialog');
    await checkpoint(task, `Frequenza: ${form.get('intervalMinutes')} minuti`, () => mutate(`/api/jobs/${form.get('id')}/schedule`, { enabled: true, intervalMinutes: Number(form.get('intervalMinutes')) }, 'Attivazione'));
  });
  $('#choiceForm').addEventListener('submit', async event => {
    event.preventDefault(); const task = state.choiceTask; const outcome = new FormData(event.currentTarget).get('outcome'); closeDialog('choiceDialog'); const isSource = task.action.kind === 'source-review';
    await checkpoint(task, `Esito: ${outcome}`, () => mutate(isSource ? `/api/sources/${task.action.value}/review` : `/api/findings/${task.action.value}/review`, { outcome }, 'Review'));
  });
  $('#sourceForm').addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const payload = { title: form.get('title'), url: form.get('url'), contentText: form.get('contentText') };
    if (!String(payload.url || '').trim() && !String(payload.contentText || '').trim()) { announce('Inserisci un URL oppure un testo.', 'error'); return; }
    closeDialog('sourceDialog'); const task = { before: 'Contenuto non registrato', after: 'Fonte candidata e review aperta', consequence: 'Conserva origine, impronta e testo.', doesNotMean: ['Fonte attiva.', 'Applicabilità.', 'Completezza.'], evidenceAfter: ['Fonte.', 'Digest.', 'Ricevuta.'] };
    const result = await checkpoint(task, payload.url || 'Contenuto testuale', () => mutate('/api/sources', payload, 'Contenuto')); if (result) event.currentTarget.reset();
  });
  $('#matterForm').addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const payload = { title: form.get('title'), kind: form.get('kind'), summary: form.get('summary') }; closeDialog('matterDialog');
    const task = { before: 'Fatti non registrati', after: 'Segnalazione da qualificare', consequence: 'Crea un caso e conserva i fatti.', doesNotMean: ['Incidente qualificato.', 'Urgenza automatica.', 'Owner confermato.'], evidenceAfter: ['Caso.', 'Fatti.', 'Ricevuta.'] };
    const result = await checkpoint(task, `Tipo iniziale: ${payload.kind}`, () => mutate('/api/matters', payload, 'Segnalazione')); if (result) event.currentTarget.reset();
  });
  $('#incidentPhaseForm').addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const task = state.phaseTask; const evidence = {}; for (const field of task.action.phase.fields) evidence[field.id] = form.get(field.id); closeDialog('incidentPhaseDialog');
    await checkpoint(task, task.action.phase.summary, () => mutate(`/api/matters/${form.get('id')}/transition`, { to: form.get('to'), evidence }, task.action.phase.label)); event.currentTarget.reset();
  });
  $('#decisionForm').addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const task = currentWorkspace().tasks.find(item => item.action.kind === 'change-decision' && item.action.value === form.get('id')); const payload = { outcome: form.get('outcome'), rationale: form.get('rationale') }; closeDialog('decisionDialog');
    await checkpoint(task, `Esito: ${payload.outcome}`, () => mutate(`/api/changes/${form.get('id')}/decide`, payload, 'Decisione'));
  });
  $('#controlForm').addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const task = currentWorkspace().tasks.find(item => item.action.kind === 'control-map' && item.action.value === form.get('id')); const payload = { controlId: form.get('controlId'), rationale: form.get('rationale') }; closeDialog('controlDialog');
    await checkpoint(task, `Controllo: ${payload.controlId}`, () => mutate(`/api/changes/${form.get('id')}/map-control`, payload, 'Controllo'));
  });
  window.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#searchOpen').click(); } });
}

function bindDelegated() {
  document.addEventListener('click', async event => {
    const mode = event.target.closest('[data-mode]');
    if (mode) { state.mode = mode.dataset.mode; state.selectedTaskId = null; state.lastReceipt = null; localStorage.setItem('ictc-core-mode', state.mode); render(); return; }
    const dialog = event.target.closest('[data-open-dialog]'); if (dialog) { openDialog(dialog.dataset.openDialog); return; }
    const task = event.target.closest('[data-task]'); if (task) { state.selectedTaskId = task.dataset.task; render(); $('#focusTitle')?.focus(); return; }
    const action = event.target.closest('[data-task-action]'); if (action) { await performTask(currentTask(action.dataset.taskAction)); return; }
    const object = event.target.closest('[data-open-object]'); if (object) { await openObject(object.dataset.openObject); return; }
    const searchObject = event.target.closest('[data-search-object]'); if (searchObject) { closeDialog('searchDialog'); await openObject(searchObject.dataset.searchObject); return; }
    const tab = event.target.closest('[data-detail-tab]'); if (tab) { state.detailTab = tab.dataset.detailTab; renderDetail(); }
  });
}

export async function startJourneyShell() {
  applyPreferences();
  bindStatic();
  bindDelegated();
  state.contract = await fetch('/core-workspaces.json').then(response => { if (!response.ok) throw new Error('Configurazione UI non disponibile'); return response.json(); });
  await loadAccess();
  await refresh();
  await renewSession();
  announce('Servizio pronto.');
}
