import { $, $$, dateLabel, esc, labels, state } from './common.js';
export function renderIdentity() {
  $('#roleSelect').value = state.role;
  const ai = state.data.settings.llm.ready ? 'AI pronta' : state.data.settings.llm.configured ? 'Chiave AI assente' : 'AI da configurare';
  $('#runtimeStatus').textContent = `${state.data.actor.role === 'admin' ? 'Amministratore' : 'Utente'} · ${ai}`;
  $$('.admin-only').forEach(node => { node.hidden = state.data.actor.role !== 'admin'; });
  $('#aiSetup').hidden = state.data.actor.role !== 'admin' || state.data.settings.llm.ready;
  $('#missionForm').querySelector('button[type="submit"]').disabled = state.data.actor.role !== 'admin' || !state.data.settings.llm.ready;
}
export function renderNavigation() {
  $$('[data-service]').forEach(button => button.setAttribute('aria-current', button.dataset.service === state.service ? 'page' : 'false'));
  $('#monitoringView').hidden = state.service !== 'monitoring'; $('#incidentsView').hidden = state.service !== 'incidents';
}
export function renderMissions() {
  const missions = [...state.data.missions].sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  $('#missionCount').textContent = missions.length;
  $('#missionsList').innerHTML = missions.map(item => {
    const result = item.lastRun ? `${item.lastRun.inserted} nuove · ${item.lastRun.updated} aggiornate` : item.state === 'draft' ? 'Piano da attivare' : 'In attesa del primo run';
    const primary = item.state === 'draft' ? `<button class="primary" data-open-plan="${esc(item.id)}">Rivedi e attiva</button>` : item.state === 'active' && state.data.actor.role === 'admin' ? `<button class="secondary" data-run-mission="${esc(item.id)}">Esegui ora</button>` : '';
    return `<article class="mission-card"><div class="card-head"><div><span class="pill ${esc(item.state)}">${esc(labels[item.state] || item.state)}</span><h3>${esc(item.objective)}</h3></div></div><div class="card-meta"><span>${esc(result)}</span><span>Ritmo: ${esc(item.cadenceHours)}h</span><span>Prossimo: ${esc(dateLabel(item.nextRunAt))}</span></div>${item.lastError ? `<p class="boundary">${esc(item.lastError)}</p>` : ''}<div class="card-actions"><a class="secondary" href="${esc(item.evidenceUrl)}">Fascicolo</a>${primary}</div></article>`;
  }).join('') || '<div class="empty">Nessun monitoraggio. Descrivi sopra ciò che deve essere sorvegliato.</div>';
}
export function renderCatalog() {
  const query = $('#catalogSearch').value.trim().toLowerCase(); const filter = $('#catalogState').value;
  const items = [...state.data.catalog].filter(item => (!filter || item.state === filter) && (!query || `${item.title} ${item.authority} ${item.identifier}`.toLowerCase().includes(query))).sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  $('#catalogCount').textContent = state.data.catalog.length;
  $('#catalogList').innerHTML = items.map(item => `<button class="catalog-card" type="button" data-open-source="${esc(item.id)}"><div><div class="card-head"><div><span class="pill ${esc(item.state)}">${esc(labels[item.state] || item.state)}</span><h3>${esc(item.title)}</h3></div></div><p>${esc(item.relevance || item.summary || 'Nessuna motivazione disponibile')}</p><div class="origin-row"><span class="origin-tag">${esc(item.authority || 'Autorità non indicata')}</span><span class="origin-tag">${esc(item.jurisdiction || 'Giurisdizione non indicata')}</span><span class="origin-tag">Origine: ${esc(item.origin?.kind || 'sconosciuta')}</span></div></div><span aria-hidden="true">→</span></button>`).join('') || '<div class="empty">Nessuna fonte corrisponde ai filtri.</div>';
}
export function renderIncidents() {
  const incidents = [...state.data.incidents].sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  $('#incidentCount').textContent = incidents.length;
  $('#incidentList').innerHTML = incidents.map(item => {
    const kind = item.answers?.classification?.unknown ? 'Da definire' : labels[item.answers?.classification?.value || item.analysis?.proposedKind || 'unknown'];
    const next = item.nextQuestion ? item.nextQuestion.label : item.state === 'review' ? 'Formulazione da confermare' : item.state === 'submitted' ? 'Inviata' : item.state === 'closed' ? 'Chiusa' : 'Pronta per la formulazione';
    return `<article class="incident-card"><div class="card-head"><div><span class="pill ${esc(item.state)}">${esc(labels[item.state] || item.state)}</span><h3>${esc(item.originalNarrative.slice(0,110))}${item.originalNarrative.length > 110 ? '…' : ''}</h3></div></div><div class="card-meta"><span>${esc(kind)}</span><span>Conoscenza: ${esc(dateLabel(item.awarenessAt))}</span></div><p>${esc(next)}</p><div class="card-actions"><a class="secondary" href="${esc(item.evidenceUrl)}">Fascicolo</a><button class="primary" data-open-incident="${esc(item.id)}">Apri</button></div></article>`;
  }).join('') || '<div class="empty">Nessuna segnalazione. Registra il racconto quando accade qualcosa o quasi accade.</div>';
}
export function render() { renderIdentity(); renderNavigation(); renderMissions(); renderCatalog(); renderIncidents(); }

