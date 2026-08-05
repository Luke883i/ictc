import { $, $$, dateLabel, esc, labels, state } from './common.js';

function evidenceButton(url, label = 'Fascicolo') {
  return `<button class="secondary" type="button" data-download-evidence="${esc(url)}">${esc(label)}</button>`;
}

export function renderIdentity() {
  $('#roleSelect').value = state.role;
  const ai = state.data.settings.llm.ready ? 'AI pronta' : state.data.settings.llm.configured ? 'AI configurata, chiave assente' : 'AI da configurare';
  const roleLabels = { admin: 'Amministratore', user: 'Utente', auditor: 'Auditor' };
  const roleLabel = roleLabels[state.data.actor.role] || 'Ruolo non riconosciuto';
  const status = $('#runtimeStatus');
  status.textContent = `${roleLabel} · ${ai}`;
  status.dataset.actorRole = state.data.actor.role;
  $$('.admin-only').forEach(node => { node.hidden = state.data.actor.role !== 'admin'; });
  $('#aiSetup').hidden = state.data.actor.role !== 'admin' || state.data.settings.llm.ready;
  const missionSubmit = $('#missionForm')?.querySelector('button[type="submit"]');
  if (missionSubmit) missionSubmit.disabled = state.data.actor.role !== 'admin';
  const intro = $('#userMonitoringIntro');
  if (intro) intro.hidden = state.data.actor.role === 'admin';
}

export function renderNavigation() {
  $$('[data-service]').forEach(button => button.setAttribute('aria-current', button.dataset.service === state.service ? 'page' : 'false'));
  $('#monitoringView').hidden = state.service !== 'monitoring';
  $('#incidentsView').hidden = state.service !== 'incidents';
}

export function renderMissions() {
  const missions = [...state.data.missions].sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  $('#missionCount').textContent = missions.length;
  $('#missionsList').innerHTML = missions.map(item => {
    let result = 'Obiettivo preservato; piano non ancora disponibile';
    if (item.lastRun) result = `${item.lastRun.inserted} nuove · ${item.lastRun.updated} aggiornate`;
    else if (item.state === 'draft') result = 'Piano da verificare';
    else if (item.state === 'active') result = 'In attesa del prossimo controllo';
    else if (item.state === 'paused') result = `Sospeso: ${item.pauseReason || 'motivazione registrata nel fascicolo'}`;
    else if (item.state === 'needs-plan') result = `Obiettivo salvo; AI da riprovare: ${item.aiError || 'provider non disponibile'}`;
    const actions = [evidenceButton(item.evidenceUrl)];
    if (state.data.actor.role === 'admin') {
      actions.push(`<button class="secondary" type="button" data-open-plan="${esc(item.id)}">Apri piano</button>`);
      if (item.state === 'active') actions.push(`<button class="secondary" type="button" data-pause-mission="${esc(item.id)}">Sospendi</button><button class="primary" type="button" data-run-mission="${esc(item.id)}">Esegui ora</button>`);
      if (item.state === 'paused') actions.push(`<button class="primary" type="button" data-resume-mission="${esc(item.id)}">Riprendi</button>`);
      if (item.state === 'needs-plan') actions.push(`<button class="primary" type="button" data-open-plan="${esc(item.id)}">Riprova piano</button>`);
    }
    return `<article class="mission-card"><div class="card-head"><div><span class="pill ${esc(item.state)}">${esc(labels[item.state] || item.state)}</span><h3>${esc(item.objective)}</h3></div></div><div class="card-meta"><span>${esc(result)}</span><span>v${esc(item.planVersion || 0)}</span><span>Ritmo: ${esc(item.cadenceHours)}h</span><span>Prossimo: ${esc(dateLabel(item.nextRunAt))}</span></div>${item.lastError ? `<p class="boundary">Ultimo run: ${esc(item.lastError)}</p>` : ''}<div class="card-actions">${actions.join('')}</div></article>`;
  }).join('') || `<div class="empty">${state.data.actor.role === 'admin' ? 'Nessun monitoraggio. Descrivi il risultato da sorvegliare.' : 'Nessun monitoraggio disponibile. Puoi comunque aggiungere materiale.'}</div>`;
}

export function renderCatalog() {
  const query = $('#catalogSearch').value.trim().toLowerCase();
  const filter = $('#catalogState').value;
  const items = [...state.data.catalog]
    .filter(item => (!filter || item.state === filter) && (!query || `${item.title} ${item.authority} ${item.identifier}`.toLowerCase().includes(query)))
    .sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  $('#catalogCount').textContent = state.data.catalog.length;
  $('#catalogList').innerHTML = items.map(item => `<button class="catalog-card" type="button" data-open-source="${esc(item.id)}"><div><div class="card-head"><div><span class="pill ${esc(item.state)}">${esc(labels[item.state] || item.state)}</span><h3>${esc(item.title)}</h3></div></div><p>${esc(item.relevance || item.summary || 'Motivazione non disponibile')}</p><div class="origin-row"><span class="origin-tag">${esc(item.authority || 'Autorità non indicata')}</span><span class="origin-tag">${esc(item.jurisdiction || 'Giurisdizione non indicata')}</span><span class="origin-tag">${(item.observations || []).length || 1} osservazioni</span></div></div><span aria-hidden="true">→</span></button>`).join('') || '<div class="empty">Nessuna fonte corrisponde ai filtri.</div>';
}

export function renderContributions() {
  const root = $('#contributionList');
  if (!root) return;
  const items = [...(state.data.contributions || [])].sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,5);
  root.innerHTML = items.length ? `<p class="eyebrow">I tuoi ultimi contributi</p>${items.map(item => `<div class="contribution-row"><div><b>${esc(item.note || item.links?.[0] || item.attachments?.[0]?.name || 'Materiale registrato')}</b><small>${item.state === 'needs-enrichment' ? 'Originale salvo · AI da riprovare' : item.state === 'enriched' ? 'Originale e metadati AI registrati' : 'Originale registrato'}</small></div><div>${evidenceButton(item.evidenceUrl, 'Prova')}${item.state === 'needs-enrichment' ? `<button type="button" data-retry-contribution="${esc(item.id)}">Riprova AI</button>` : ''}</div></div>`).join('')}` : '';
}

export function renderIncidents() {
  const incidents = [...state.data.incidents].sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  $('#incidentCount').textContent = incidents.length;
  $('#incidentList').innerHTML = incidents.map(item => {
    const kind = item.answers?.classification?.unknown ? 'Da definire' : labels[item.answers?.classification?.value || item.analysis?.proposedKind || 'unknown'];
    let next = item.nextQuestion ? item.nextQuestion.label : item.state === 'review' ? 'Formulazione salvata da confermare' : item.state === 'submitted' ? 'Inviata' : item.state === 'closed' ? 'Chiusa' : 'Pronta per la formulazione';
    if (item.aiError) next = 'Racconto salvo; analisi AI da riprovare';
    return `<article class="incident-card"><div class="card-head"><div><span class="pill ${esc(item.state)}">${esc(labels[item.state] || item.state)}</span><h3>${esc(item.originalNarrative.slice(0,110))}${item.originalNarrative.length > 110 ? '…' : ''}</h3></div></div><div class="card-meta"><span>${esc(kind)}</span><span>Conoscenza: ${esc(dateLabel(item.awarenessAt))}</span><span>${(item.formulationVersions || []).length} versioni</span></div><p>${esc(next)}</p><div class="card-actions">${evidenceButton(item.evidenceUrl)}<button class="primary" type="button" data-open-incident="${esc(item.id)}">Apri</button></div></article>`;
  }).join('') || '<div class="empty">Nessuna segnalazione. Registra un racconto quando accade qualcosa o quasi accade.</div>';
}

export function render() {
  renderIdentity();
  renderNavigation();
  renderMissions();
  renderCatalog();
  renderContributions();
  renderIncidents();
}
