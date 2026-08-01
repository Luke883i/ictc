import { deriveJourneyWorkspace } from './journey-model.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const statusLabels = { observed: 'Osservato', candidate: 'Candidata', 'awaiting-human-review': 'Da valutare', 'human-reviewed': 'Review registrata', 'human-owned': 'Responsabilità confermata', verified: 'Verifica deterministica', failed: 'Verifica fallita', unavailable: 'Non disponibile', bounded: 'Delimitato', mapped: 'Mappato', 'attention-required': 'Richiede attenzione', 'ai-proposed': 'Proposta AI' };
const symbols = { verified: '✓', failed: '×', unavailable: '—', bounded: '◐', 'awaiting-human-review': '?', 'attention-required': '!', candidate: '○', 'human-owned': '◇', 'human-reviewed': '✓', mapped: '↔', observed: '•' };
const matterStates = ['facts-to-confirm', 'owned', 'assessing', 'responding', 'closure-review', 'closed'];
const matterNames = { 'facts-to-confirm': 'Fatti da confermare', owned: 'Owner confermato', assessing: 'Valutazione', responding: 'Risposta', 'closure-review': 'Review di chiusura', closed: 'Chiuso' };
const dialogReturnFocus = new Map();

export const state = { data: null, contract: null, personaId: localStorage.getItem('ictc-persona') || null, section: 'work', selectedTaskId: null, activeObject: null, detailTab: 'meaning', sessionId: null, lastReceipt: null, choiceTask: null, ledger: null };

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { 'content-type': 'application/json' }, ...options });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('json') ? await response.json() : await response.text();
  if (!response.ok) throw new Error(body?.error || body || `${response.status}`);
  return body;
}

let announceTimer;
function announce(message, kind = 'idle') {
  const node = $('#operationStatus');
  clearTimeout(announceTimer);
  node.textContent = `${kind === 'error' ? 'Errore · ' : kind === 'saved' ? 'Registrato · ' : ''}${message}`;
  node.dataset.visible = 'true';
  if (kind !== 'error') announceTimer = setTimeout(() => { node.dataset.visible = 'false'; }, 3600);
}

function openDialog(id) {
  const dialog = $(`#${id}`);
  if (!dialog) throw new Error(`Dialog non disponibile: ${id}`);
  dialogReturnFocus.set(dialog, document.activeElement instanceof HTMLElement ? document.activeElement : null);
  dialog.showModal();
}
function closeDialog(id) {
  const dialog = $(`#${id}`);
  if (!dialog?.open) return;
  const returnTarget = dialogReturnFocus.get(dialog);
  dialog.close(); dialogReturnFocus.delete(dialog);
  if (returnTarget instanceof HTMLElement && returnTarget.isConnected) returnTarget.focus();
}

function applyPreferences() {
  const defaults = { text: 'default', density: 'comfortable', contrast: 'system', motion: 'system' };
  let preferences = defaults;
  try { preferences = { ...defaults, ...JSON.parse(localStorage.getItem('ictc-comfort') || '{}') }; } catch {}
  document.documentElement.dataset.text = preferences.text;
  document.documentElement.dataset.density = preferences.density;
  document.documentElement.dataset.contrast = preferences.contrast;
  document.documentElement.dataset.motion = preferences.motion;
  $('#textScale').value = preferences.text; $('#density').value = preferences.density; $('#contrast').value = preferences.contrast; $('#motion').value = preferences.motion;
}
function savePreferences() {
  const preferences = { text: $('#textScale').value, density: $('#density').value, contrast: $('#contrast').value, motion: $('#motion').value };
  localStorage.setItem('ictc-comfort', JSON.stringify(preferences)); applyPreferences(); announce('Preferenze di lettura applicate.');
}

function personaCard(persona) { return `<button type="button" class="persona-card" data-persona="${esc(persona.id)}"><small>${esc(persona.label)}</small><b>${esc(persona.entryQuestion)}</b><span>${esc(persona.mandate)}</span></button>`; }
function renderWelcome() {
  $('#headerContext').hidden = true;
  $('#main').innerHTML = `<section class="welcome" aria-labelledby="welcomeTitle"><span class="eyebrow">Parti dal tuo incarico</span><h1 id="welcomeTitle">Che cosa devi completare adesso?</h1><p>ICTC non ti chiede di conoscere la sua architettura. Scegli la lente di lavoro: vedrai una sola journey, gli oggetti SOT che la alimentano e la prossima scelta registrabile.</p><div class="persona-grid">${state.contract.personas.map(personaCard).join('')}</div><p class="boundary-note">${esc(state.contract.boundary)}</p></section>`;
  $('#main').focus({ preventScroll: true });
}
const sectionLabels = { work: 'Incarico corrente', records: 'Tutti gli oggetti', evidence: 'Prove', system: 'Sistema' };

function renderJourneyRail(workspace) {
  const current = workspace.journey.find(step => step.state === 'current') || workspace.journey[0];
  const completed = Math.max(0, current.index);
  return `<section class="journey-progress" aria-labelledby="journeyProgressTitle"><div class="journey-progress-head"><div><span class="eyebrow">Percorso della lente</span><h2 id="journeyProgressTitle">Passo ${current.index + 1} di ${workspace.journey.length} · ${esc(current.label)}</h2></div><span>${completed} passaggi contestuali precedenti</span></div><progress value="${current.index + 1}" max="${workspace.journey.length}">${current.index + 1} di ${workspace.journey.length}</progress><details><summary>Mostra il percorso completo</summary><ol class="journey-rail" aria-label="Passi della journey">${workspace.journey.map(step => `<li class="journey-step ${step.state}" ${step.state === 'current' ? 'aria-current="step"' : ''}><span class="step-number">${step.index + 1}</span><span>${esc(step.label)}</span></li>`).join('')}</ol></details></section>`;
}
function taskStatus(task) { return `<div class="task-status"><span class="status-symbol" aria-hidden="true">${symbols[task.status] || '•'}</span><span>${esc(statusLabels[task.status] || task.status)}</span>${task.readOnly ? '<span>· sola lettura</span>' : ''}</div>`; }
function renderReceipt() { if (!state.lastReceipt) return ''; return `<div class="receipt-banner" role="status"><b>Scrittura verificata</b><p>Evento ${esc(state.lastReceipt.eventType || '')} · readback ${state.lastReceipt.readbackVerified ? 'verificato' : 'non verificato'}.</p><code>${esc(state.lastReceipt.hash || '')}</code></div>`; }
function renderActiveTask(task) {
  const disabled = task.availability === 'unavailable' ? 'disabled' : '';
  return `<article class="task-card" aria-labelledby="activeTaskTitle">${taskStatus(task)}<h2 id="activeTaskTitle" tabindex="-1">${esc(task.title)}</h2><p class="task-statement">${esc(task.statement)}</p><p class="task-question">Che cosa devi fare qui?</p><button type="button" id="primaryTaskAction" class="primary" data-task-action="${esc(task.id)}" ${disabled}>${esc(task.action.label)}</button><div class="task-secondary">${task.objectId ? `<button type="button" data-open-object="${esc(task.objectId)}">Apri l’oggetto SOT</button>` : ''}<button type="button" data-section="records">Vedi gli oggetti pertinenti</button></div><details class="task-explanation"><summary>Perché questa attività e quali sono i limiti</summary><div class="task-explanation-grid"><section><h3>Scopo nella journey</h3><p>${esc(task.objectPurpose)}</p><small>Sorgente: ${esc(task.sotRef.kind)} · ${esc(task.sotRef.id)}</small></section><section><h3>Perché è qui</h3><p>${esc(task.whyHere)}</p></section><section class="boundary"><h3>Che cosa non significa</h3><ul>${task.doesNotMean.map(item => `<li>${esc(item)}</li>`).join('')}</ul></section><section class="evidence"><h3>Che cosa potrai verificare dopo</h3><ul>${task.evidenceAfter.map(item => `<li>${esc(item)}</li>`).join('')}</ul></section></div></details>${renderReceipt()}</article>`;
}
function renderQueue(workspace) {
  const otherTasks = workspace.tasks.filter(task => task.id !== workspace.activeTask.id);
  if (!otherTasks.length) return '';
  const rows = otherTasks.map(task => `<button type="button" class="queue-row" data-task="${esc(task.id)}"><span><b>${esc(task.title)}</b><small>${esc(task.objectPurpose)}</small></span><span class="queue-meta"><span>${esc(statusLabels[task.status] || task.status)}</span><span>Passo ${task.step + 1}</span></span></button>`).join('');
  return `<details class="queue-disclosure"><summary>Altri incarichi compatibili (${otherTasks.length})</summary><div class="queue-section"><div class="section-heading"><div><span class="eyebrow">Dalla stessa SOT</span><h2>Seleziona solo quando serve</h2></div><p>${workspace.counts.objectTasks} incarichi legati a oggetti · ${workspace.counts.voluntaryTasks} azioni volontarie</p></div><div class="queue-list">${rows}</div></div></details>`;
}

function recordSetForPersona(personaId) {
  const views = state.data?.views || {};
  if (personaId === 'regulatory-analyst') return [...(views.sources || []), ...(views.findings || []), ...(views.changes || []), ...(views.controls || [])];
  if (personaId === 'incident-lead') return [...(views.matters || [])];
  if (personaId === 'platform-operator') return [...(views.supply || [])];
  return Object.values(state.data?.objectIndex || {});
}
function renderRecords(workspace) {
  const records = recordSetForPersona(workspace.persona.id);
  return `<section aria-labelledby="recordsTitle"><div class="section-heading"><div><span class="eyebrow">Oggetti runtime</span><h2 id="recordsTitle">Tutti gli oggetti pertinenti</h2></div><p>${records.length} oggetti · ordine non prioritario</p></div>${records.length ? `<div class="record-grid">${records.slice(0, 60).map(item => `<article class="record-card">${taskStatus({ status: item.epistemicStatus || item.status || 'observed', readOnly: true })}<h3>${esc(item.label || item.id)}</h3><p>${esc(item.statement || item.data?.narrative || '')}</p><button type="button" data-open-object="${esc(item.id)}">Apri significato e provenienza</button></article>`).join('')}</div>` : '<div class="empty-state">La collezione è disponibile ma non contiene oggetti. Questo non prova completezza o assenza di attività.</div>'}</section>`;
}
function renderLedger() {
  if (!state.ledger) return '';
  if (!state.ledger.events?.length) return '<div class="empty-state">Nessun evento persistito.</div>';
  return `<div class="ledger-list">${state.ledger.events.slice(0, 30).map(event => `<div class="ledger-row"><span><b>${esc(event.type)}</b><small>${esc(event.at || '')}</small></span><code>${esc(String(event.hash || '').slice(0, 20))}</code></div>`).join('')}</div>`;
}
function renderEvidence() {
  const integrity = state.data?.meta?.integrity; const traces = state.data?.views?.traces || [];
  return `<section aria-labelledby="evidenceTitle"><div class="section-heading"><div><span class="eyebrow">Sola lettura</span><h2 id="evidenceTitle">Prove e ricostruzione</h2></div><p>${integrity ? `${integrity.eventCount} eventi dichiarati` : 'Integrità non disponibile'}</p></div><div class="evidence-layout"><article class="evidence-card"><h2>Integrità locale</h2><p>${integrity?.ok === true ? 'La hash-chain locale è coerente.' : integrity?.ok === false ? 'La verifica della hash-chain è fallita.' : 'Il bootstrap non espone un esito di integrità.'}</p><p class="note">Integrità tecnica ≠ verità, completezza o non ripudio.</p><button type="button" class="primary" data-ledger-load>Carica eventi sanitizzati</button><div id="ledgerContainer">${renderLedger()}</div></article><article class="evidence-card"><h2>Tracce disponibili</h2>${traces.map(trace => `<button type="button" class="queue-row" data-open-object="${esc(trace.id)}"><span><b>${esc(trace.label)}</b><small>${esc(trace.statement)}</small></span><span>Apri</span></button>`).join('') || '<div class="empty-state">Nessuna traccia proiettata.</div>'}</article></div></section>`;
}
function renderSystem() {
  const release = state.data?.release; const supply = state.data?.views?.supply || [];
  return `<section aria-labelledby="systemTitle"><div class="section-heading"><div><span class="eyebrow">Runtime, non dominio</span><h2 id="systemTitle">Stato della piattaforma</h2></div><p>${release?.readiness || 'non disponibile'}</p></div><div class="system-layout"><article class="system-card"><h2>Release boundary</h2>${release ? `<dl class="release-list"><dt>Versione</dt><dd>${esc(release.version)}</dd><dt>Classe</dt><dd>${esc(release.stabilityClass)}</dd><dt>Readiness</dt><dd>${esc(release.readiness)}</dd><dt>Manifest</dt><dd><code>${esc(String(release.manifestSha256).slice(0, 20))}</code></dd></dl><p>${esc(release.claim)}</p><details><summary>Fuori scope</summary><ul>${(release.excludedScope || []).map(item => `<li>${esc(item)}</li>`).join('')}</ul></details>` : '<div class="empty-state">Manifest non disponibile.</div>'}</article><article class="system-card"><h2>Catena tecnica</h2>${supply.map(item => `<button type="button" class="queue-row" data-open-object="${esc(item.id)}"><span><b>${esc(item.label)}</b><small>${esc(item.statement)}</small></span><span>${esc(statusLabels[item.epistemicStatus] || item.epistemicStatus)}</span></button>`).join('')}</article></div></section>`;
}

function renderWorkspace() {
  const workspace = deriveJourneyWorkspace(state.data, state.contract, state.personaId, state.selectedTaskId);
  state.selectedTaskId = workspace.activeTask?.id || null;
  const persona = workspace.persona;
  $('#headerContext').hidden = false; $('#personaLabel').textContent = persona.label;
  const release = state.data?.release; $('#runtimeState').textContent = release ? `ICTC ${release.version} · ${release.readiness}` : 'Release non disponibile';
  const nav = persona.sections.map(section => `<button type="button" data-section="${section}" aria-current="${state.section === section ? 'page' : 'false'}">${sectionLabels[section]}</button>`).join('');
  let content;
  if (state.section === 'records') content = renderRecords(workspace); else if (state.section === 'evidence') content = renderEvidence(); else if (state.section === 'system') content = renderSystem(); else content = `${renderJourneyRail(workspace)}${renderActiveTask(workspace.activeTask)}${renderQueue(workspace)}`;
  $('#main').innerHTML = `<header class="workspace-head"><div><span class="eyebrow">${esc(persona.label)}</span><h1>${esc(persona.entryQuestion)}</h1><p>${esc(persona.mandate)}</p></div><aside class="boundary-note"><b>Confine decisionale</b><br>${esc(persona.decisionBoundary)}</aside></header><nav class="workspace-nav" aria-label="Sezioni della lente">${nav}</nav>${content}`;
  $('#main').focus({ preventScroll: true });
}
export function render() { if (!state.personaId) return renderWelcome(); renderWorkspace(); }
async function refresh() { state.data = await api('/api/bootstrap'); $('#controlSelect').innerHTML = (state.data.controls || []).map(item => `<option value="${esc(item.id)}">${esc(item.label)}</option>`).join(''); render(); }

async function checkpoint(task, summary, before, after, execute) {
  $('#checkpointTitle').textContent = task.title; $('#checkpointSummary').textContent = summary || task.consequence;
  $('#checkpointBefore').textContent = before || statusLabels[task.status] || task.status; $('#checkpointAfter').textContent = after || 'Nuovo stato determinato dalla route di dominio.';
  $('#checkpointEvidence').textContent = task.evidenceAfter.join(' · '); $('#checkpointLimits').innerHTML = task.doesNotMean.map(item => `<li>${esc(item)}</li>`).join('');
  const dialog = $('#checkpointDialog'); dialog.returnValue = 'cancel';
  const confirmed = await new Promise(resolve => { const onClose = () => { dialog.removeEventListener('close', onClose); resolve(dialog.returnValue === 'confirm'); }; dialog.addEventListener('close', onClose); dialog.showModal(); });
  if (!confirmed) return null; return execute();
}
async function mutate(path, payload, label) {
  announce(`${label}: registrazione in corso`); const result = await api(path, { method: 'POST', body: JSON.stringify(payload) });
  state.lastReceipt = result.receipt || null; announce(`${label}: receipt ${String(result.receipt?.hash || '').slice(0, 10) || 'registrata'}`, 'saved'); await refresh(); return result;
}
function currentWorkspace() { return deriveJourneyWorkspace(state.data, state.contract, state.personaId, state.selectedTaskId); }
function currentTask(id) { return currentWorkspace().tasks.find(item => item.id === id) || currentWorkspace().activeTask; }

function openChoice(task) {
  state.choiceTask = task; $('#choiceTitle').textContent = task.action.kind === 'source-review' ? 'La fonte entra nel perimetro attivo?' : 'La differenza è rilevante nel contesto?'; $('#choiceContext').textContent = task.statement;
  const choices = task.action.kind === 'source-review' ? [['accepted', 'Includi', 'Attiva la fonte nel perimetro locale.'], ['rejected', 'Escludi', 'Conserva la review senza attivare la fonte.']] : [['relevant', 'Rilevante', 'Apre una change story da decidere.'], ['not-relevant', 'Non rilevante', 'Conserva la review senza aprire una change story.']];
  $('#choiceOptions').innerHTML = choices.map(([value, label, detail], index) => `<label class="choice-option"><input type="radio" name="outcome" value="${value}" ${index === 0 ? 'checked' : ''}><span><b>${label}</b><br><small>${detail}</small></span></label>`).join(''); openDialog('choiceDialog');
}
async function performTask(task) {
  if (!task || task.availability === 'unavailable') return;
  const { kind, value } = task.action;
  if (kind === 'section') { state.section = value; render(); return; }
  if (kind === 'dialog') { openDialog(value); return; }
  if (kind === 'object') { await openObject(value); return; }
  if (kind === 'ledger') { state.section = 'evidence'; await loadLedger(); render(); return; }
  if (kind === 'support-bundle') { createSupportBundle(); return; }
  if (kind === 'source-review' || kind === 'finding-review') { openChoice(task); return; }
  if (kind === 'change-decision') { $('#decisionForm').elements.id.value = value; openDialog('decisionDialog'); return; }
  if (kind === 'control-map') { $('#controlForm').elements.id.value = value; openDialog('controlDialog'); return; }
  if (kind === 'matter-owner') { const matter = state.data.matters.find(item => item.id === value); await checkpoint(task, `Owner proposto: ${matter.owner}`, 'Fatti da confermare', 'Owner e RACI confermati', () => mutate(`/api/matters/${value}/confirm-owner`, { owner: matter.owner, raci: matter.raci }, 'Responsabilità')); return; }
  if (kind === 'matter-transition') { const matter = state.data.matters.find(item => item.id === value); const target = matterStates[matterStates.indexOf(matter.state) + 1]; await checkpoint(task, `${matterNames[matter.state]} → ${matterNames[target]}`, matterNames[matter.state], matterNames[target], () => mutate(`/api/matters/${value}/transition`, { to: target }, 'Transizione')); }
}

async function openObject(id) { state.activeObject = await api(`/api/objects/${encodeURIComponent(id)}`); state.detailTab = 'meaning'; renderDetail(); openDialog('detailDialog'); }
function renderDetail() {
  const detail = state.activeObject; if (!detail) return; const { object, related, edges } = detail;
  $('#detailTitle').textContent = object.label; $('#detailStatus').textContent = statusLabels[object.epistemicStatus] || object.epistemicStatus;
  $$('[data-detail-tab]').forEach(button => { const selected = button.dataset.detailTab === state.detailTab; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
  $('#detailBody').setAttribute('aria-labelledby', `detailTab${state.detailTab[0].toUpperCase()}${state.detailTab.slice(1)}`);
  let content;
  if (state.detailTab === 'meaning') content = `<section class="detail-body-section"><div class="detail-row"><b>Che cosa dice</b><span>${esc(object.statement)}</span></div><div class="detail-row"><b>Che cosa fare dopo</b><span>${esc(object.nextAction || 'Nessuna azione automatica.')}</span></div><div class="detail-row"><b>Che cosa non conclude</b><ul>${(object.limitations || []).map(item => `<li>${esc(item)}</li>`).join('')}</ul></div></section>`;
  else if (state.detailTab === 'provenance') content = `<section class="detail-body-section"><div class="detail-row"><b>Produttore</b><span>${esc(object.producer?.id || 'non disponibile')}</span></div><div class="detail-row"><b>Input</b><span>${esc((object.inputs || []).map(item => item.id).join(', ') || 'non disponibili')}</span></div><div class="detail-row"><b>Relazioni</b><span>${esc((edges || []).map(edge => edge.label).join(', ') || 'nessuna')}</span></div><div class="detail-row"><b>Oggetti collegati</b>${(related || []).map(item => `<button type="button" class="plain-button" data-open-object="${esc(item.id)}">${esc(item.label)}</button>`).join(' ') || '<span>nessuno</span>'}</div></section>`;
  else content = `<section class="detail-body-section"><div class="detail-row"><b>Receipt</b><code>${esc(object.receiptRef || 'non disponibile')}</code></div><div class="detail-row"><b>Claim class</b><span>${esc(object.claimClass)}</span></div><div class="detail-row"><b>Identificativo</b><code>${esc(object.id)}</code></div><p class="note">Questi dati aiutano la verifica tecnica; non aggiungono autorità al contenuto.</p></section>`;
  $('#detailBody').innerHTML = content; $('#assistantCapsule').textContent = `${object.label} + ${(related || []).length} relazioni deterministiche · nessuna write authority`;
}
async function loadLedger() { state.ledger = await api('/api/runtime/ledger'); announce(`Ledger caricato: ${state.ledger.events.length} eventi sanitizzati.`); }
function createSupportBundle() {
  const payload = { schemaVersion: '1.0.0', generatedAt: new Date().toISOString(), correlationId: crypto.randomUUID(), release: state.data.release ? { version: state.data.release.version, readiness: state.data.release.readiness, stabilityClass: state.data.release.stabilityClass, manifestSha256: state.data.release.manifestSha256 } : null, integrity: state.data.meta?.integrity || null, counts: { sources: state.data.sources?.length ?? null, findings: state.data.findings?.length ?? null, changes: state.data.changes?.length ?? null, matters: state.data.matters?.length ?? null }, limitations: ['Nessun payload del ledger.', 'Nessun contenuto di file o nota libera.', 'Non è telemetria centralizzata né raccolta forense.'] };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `ictc-support-${payload.correlationId}.json`; link.click(); URL.revokeObjectURL(link.href); announce('Support bundle sanitizzato creato.');
}
function search() { const query = $('#searchInput').value.trim().toLowerCase(); const items = Object.values(state.data?.objectIndex || {}).filter(item => `${item.label} ${item.statement} ${item.claimClass} ${item.epistemicStatus}`.toLowerCase().includes(query)).slice(0, 20); $('#searchResults').innerHTML = items.map(item => `<button type="button" class="search-result" data-search-object="${esc(item.id)}"><b>${esc(item.label)}</b><small>${esc(statusLabels[item.epistemicStatus] || item.epistemicStatus)} · ${esc(item.claimClass)}</small></button>`).join('') || '<div class="empty-state">Nessun oggetto corrispondente.</div>'; }
async function askAssistant(event) { event.preventDefault(); const question = $('#assistantQuestion').value.trim(); if (!question || !state.activeObject) return; const result = await api('/api/assistant', { method: 'POST', body: JSON.stringify({ sessionId: state.sessionId, objectId: state.activeObject.object.id, question }) }); $('#assistantMessages').insertAdjacentHTML('beforeend', `<article class="message"><b>Tu</b><p>${esc(question)}</p></article><article class="message"><b>ICTC AI · proposta</b><p>${esc(result.answer)}</p><small>${esc(result.limitations.join(' · '))}</small></article>`); $('#assistantQuestion').value = ''; }

function bindStatic() {
  $('#homeButton').addEventListener('click', () => { state.personaId = null; state.section = 'work'; localStorage.removeItem('ictc-persona'); render(); });
  $('#personaButton').addEventListener('click', () => openDialog('personaDialog')); $('#searchOpen').addEventListener('click', () => { openDialog('searchDialog'); $('#searchInput').focus(); }); $('#comfortOpen').addEventListener('click', () => openDialog('comfortDialog'));
  $('#comfortDialog').addEventListener('close', () => { if ($('#comfortDialog').returnValue === 'save') savePreferences(); }); $$('[data-dialog-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.dataset.dialogClose)));
  $('#searchInput').addEventListener('input', search); $('#assistantForm').addEventListener('submit', askAssistant); $('#assistantOpen').addEventListener('click', () => { closeDialog('detailDialog'); openDialog('assistantDialog'); $('#assistantQuestion').focus(); });
  $('.detail-tabs').addEventListener('keydown', event => { const tabs = $$('[data-detail-tab]'); const current = tabs.indexOf(document.activeElement); if (current < 0 || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; state.detailTab = tabs[next].dataset.detailTab; renderDetail(); tabs[next].focus(); });
  $('#choiceForm').addEventListener('submit', async event => { event.preventDefault(); const task = state.choiceTask; const outcome = new FormData(event.currentTarget).get('outcome'); closeDialog('choiceDialog'); const isSource = task.action.kind === 'source-review'; await checkpoint(task, `Esito scelto: ${outcome}`, statusLabels[task.status] || task.status, isSource ? 'Review registrata' : outcome === 'relevant' ? 'Change story aperta' : 'Review conservata', () => mutate(isSource ? `/api/sources/${task.action.value}/review` : `/api/findings/${task.action.value}/review`, { outcome }, isSource ? 'Review fonte' : 'Review differenza')); });
  $('#sourceForm').addEventListener('submit', async event => { event.preventDefault(); const form = new FormData(event.currentTarget); const task = currentWorkspace().tasks.find(item => item.id === 'source-propose'); const payload = { title: form.get('title'), url: form.get('url'), notes: form.get('notes') }; closeDialog('sourceDialog'); const result = await checkpoint(task, `Link: ${payload.url}`, 'Fonte assente', 'Fonte candidata', () => mutate('/api/sources', payload, 'Nuova fonte')); if (result) event.currentTarget.reset(); });
  $('#matterForm').addEventListener('submit', async event => { event.preventDefault(); const form = new FormData(event.currentTarget); const task = currentWorkspace().tasks.find(item => item.id === 'matter-create'); const payload = { title: form.get('title'), kind: form.get('kind'), summary: form.get('summary') }; closeDialog('matterDialog'); const result = await checkpoint(task, `Tipo iniziale: ${payload.kind}`, 'Racconto non registrato', 'Fatti da confermare', () => mutate('/api/matters', payload, 'Nuovo evento')); if (result) event.currentTarget.reset(); });
  $('#decisionForm').addEventListener('submit', async event => { event.preventDefault(); const form = new FormData(event.currentTarget); const task = currentWorkspace().tasks.find(item => item.action.kind === 'change-decision' && item.action.value === form.get('id')); const payload = { outcome: form.get('outcome'), rationale: form.get('rationale') }; closeDialog('decisionDialog'); await checkpoint(task, `Esito: ${payload.outcome}`, 'Impatto da decidere', payload.outcome, () => mutate(`/api/changes/${form.get('id')}/decide`, payload, 'Decisione')); });
  $('#controlForm').addEventListener('submit', async event => { event.preventDefault(); const form = new FormData(event.currentTarget); const task = currentWorkspace().tasks.find(item => item.action.kind === 'control-map' && item.action.value === form.get('id')); const payload = { controlId: form.get('controlId'), rationale: form.get('rationale') }; closeDialog('controlDialog'); await checkpoint(task, `Famiglia: ${payload.controlId}`, 'Presidio da collegare', 'Relazione astratta registrata', () => mutate(`/api/changes/${form.get('id')}/map-control`, payload, 'Mapping')); });
  window.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#searchOpen').click(); } });
}
function bindDelegated() {
  document.addEventListener('click', async event => {
    const persona = event.target.closest('[data-persona]'); if (persona) { state.personaId = persona.dataset.persona; state.section = 'work'; state.selectedTaskId = null; state.lastReceipt = null; localStorage.setItem('ictc-persona', state.personaId); if ($('#personaDialog').open) closeDialog('personaDialog'); render(); return; }
    const section = event.target.closest('[data-section]'); if (section) { state.section = section.dataset.section; render(); return; }
    const taskButton = event.target.closest('[data-task]'); if (taskButton) { state.selectedTaskId = taskButton.dataset.task; state.section = 'work'; render(); $('#activeTaskTitle')?.focus?.(); return; }
    const action = event.target.closest('[data-task-action]'); if (action) { await performTask(currentTask(action.dataset.taskAction)); return; }
    const object = event.target.closest('[data-open-object]'); if (object) { await openObject(object.dataset.openObject); return; }
    const searchObject = event.target.closest('[data-search-object]'); if (searchObject) { closeDialog('searchDialog'); await openObject(searchObject.dataset.searchObject); return; }
    if (event.target.closest('[data-ledger-load]')) { await loadLedger(); render(); return; }
    const detailTab = event.target.closest('[data-detail-tab]'); if (detailTab) { state.detailTab = detailTab.dataset.detailTab; renderDetail(); }
  });
}
export async function startJourneyShell() {
  applyPreferences(); bindStatic(); bindDelegated();
  [state.contract, state.data] = await Promise.all([fetch('/persona-journeys.json').then(response => { if (!response.ok) throw new Error('Contratto journey non disponibile'); return response.json(); }), api('/api/bootstrap')]);
  state.sessionId = (await api('/api/session', { method: 'POST', body: '{}' })).sessionId;
  $('#personaChoices').innerHTML = state.contract.personas.map(personaCard).join(''); $('#controlSelect').innerHTML = (state.data.controls || []).map(item => `<option value="${esc(item.id)}">${esc(item.label)}</option>`).join(''); render(); announce(`Runtime pronto · ICTC ${state.data.release?.version || state.data.meta?.version || ''}`);
}
