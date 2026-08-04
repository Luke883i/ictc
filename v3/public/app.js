const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const labels = {
  law:'Legge o direttiva', 'legislative-decree':'Decreto legislativo', decree:'Decreto', regulation:'Regolamento',
  decision:'Delibera o decisione', guideline:'Linea guida', circular:'Circolare', standard:'Standard', other:'Altro',
  event:'Evento', 'near-miss':'Quasi incidente', incident:'Possibile incidente', draft:'Bozza', ready:'Bozza AI pronta', submitted:'Inviata', closed:'Chiusa'
};
const documentTypes = ['law','legislative-decree','decree','regulation','decision','guideline','circular','standard','other'];
const state = { data:null, service:localStorage.getItem('ictc-service') || 'monitoring', role:localStorage.getItem('ictc-role') || 'admin', activeIncidentId:null };
let toastTimer;

function notify(message, error = false) {
  const toast = $('#toast');
  toast.textContent = `${error ? 'Errore · ' : ''}${message}`;
  toast.dataset.visible = 'true';
  toast.style.background = error ? '#991b1b' : '#172033';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.dataset.visible = 'false'; }, 4500);
}
function headers() { return {'content-type':'application/json','x-ictc-role':state.role,'x-ictc-actor-id':`local-${state.role}`}; }
async function api(path, options = {}) {
  const response = await fetch(path, {...options, headers:{...headers(),...(options.headers || {})}});
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Errore ${response.status}`);
  return body;
}
function splitList(value) { return [...new Set(String(value || '').split(/[\n,]/).map(item => item.trim()).filter(Boolean))]; }
function dateLabel(value) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat('it',{dateStyle:'short',timeStyle:'short'}).format(date); }
function localDateTimeValue(date = new Date()) { const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return shifted.toISOString().slice(0,16); }
async function filesPayload(input) {
  const files = [...(input?.files || [])];
  return Promise.all(files.map(file => new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) return reject(new Error(`${file.name}: massimo 5 MB`));
    const reader = new FileReader();
    reader.onload = () => resolve({name:file.name,mime:file.type || 'application/octet-stream',dataBase64:String(reader.result).split(',').pop()});
    reader.onerror = () => reject(reader.error); reader.readAsDataURL(file);
  })));
}
function openDialog(id) { const dialog = $(`#${id}`); if (!dialog.open) dialog.showModal(); }
function closeDialog(id) { const dialog = $(`#${id}`); if (dialog.open) dialog.close(); }

function renderIdentity() {
  $('#roleSelect').value = state.role;
  $('#runtimeStatus').textContent = `${state.data.actor.role === 'admin' ? 'Amministratore' : 'Utente'} · ${state.data.settings.llm.ready ? 'AI pronta' : 'AI da configurare'}`;
  $$('.admin-only').forEach(node => { node.hidden = state.data.actor.role !== 'admin'; });
  $('#aiSetup').hidden = state.data.actor.role !== 'admin' || state.data.settings.llm.ready;
}
function renderNavigation() {
  $$('[data-service]').forEach(button => button.setAttribute('aria-current', button.dataset.service === state.service ? 'page' : 'false'));
  $('#monitoringView').hidden = state.service !== 'monitoring';
  $('#incidentsView').hidden = state.service !== 'incidents';
}
function renderJobs() {
  const jobs = state.data.jobs;
  $('#jobCount').textContent = jobs.length;
  $('#jobsList').innerHTML = jobs.map(job => {
    const statusClass = job.status === 'error' ? 'error' : job.lastCompletedAt ? 'ready' : '';
    const result = job.lastResult ? `${job.lastResult.discovered} trovate · ${job.lastResult.inserted} nuove · ${job.lastResult.updated} aggiornate` : 'Mai eseguito';
    return `<article class="item"><div class="item-head"><div><h3>${escapeHtml(job.name)}</h3><p>${escapeHtml(job.scope)}</p></div><span class="pill ${statusClass}">${escapeHtml(job.status === 'running' ? 'In esecuzione' : job.status === 'error' ? 'Errore' : job.enabled ? 'Attivo' : 'In pausa')}</span></div><div class="meta"><span>${escapeHtml(result)}</span><span>Prossimo: ${escapeHtml(dateLabel(job.nextRunAt))}</span></div>${job.lastError ? `<p class="error-text">${escapeHtml(job.lastError)}</p>` : ''}<div class="item-actions admin-only" ${state.data.actor.role === 'admin' ? '' : 'hidden'}><button type="button" data-run-job="${escapeHtml(job.id)}" ${job.status === 'running' || !state.data.settings.llm.ready ? 'disabled' : ''}>Esegui ora</button></div></article>`;
  }).join('') || '<div class="empty">Nessun monitoraggio configurato.</div>';
}
function renderCatalog() {
  const items = [...state.data.complianceItems].sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  $('#catalogCount').textContent = items.length;
  $('#catalogEmpty').hidden = items.length > 0;
  $('#catalogBody').innerHTML = items.map(item => `<tr><td><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.identifier || item.sourceUrl)}</small>${item.sourceUrl ? `<br><a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">Apri fonte</a>` : ''}</td><td>${escapeHtml(labels[item.documentType] || item.documentType)}</td><td>${escapeHtml(item.authority || '—')}</td><td>${escapeHtml(item.jurisdiction || '—')}</td><td>${escapeHtml(item.status || '—')}</td><td>${Math.round(Number(item.confidence || 0) * 100)}%</td></tr>`).join('');
}
function renderIncidents() {
  const incidents = [...state.data.incidents].sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  $('#incidentCount').textContent = incidents.length;
  $('#incidentList').innerHTML = incidents.map(item => `<article class="item"><div class="item-head"><div><h3>${escapeHtml(item.title || labels[item.kind])}</h3><p>${escapeHtml(item.facts.slice(0,240))}${item.facts.length > 240 ? '…' : ''}</p></div><span class="pill ${item.state === 'closed' ? 'ready' : ''}">${escapeHtml(labels[item.state] || item.state)}</span></div><div class="meta"><span>${escapeHtml(labels[item.kind])}</span><span>Conoscenza: ${escapeHtml(dateLabel(item.awarenessAt))}</span><span>Creato da: ${escapeHtml(item.createdBy)}</span></div><div class="item-actions"><button type="button" data-open-incident="${escapeHtml(item.id)}">Apri</button></div></article>`).join('') || '<div class="empty">Nessuna segnalazione.</div>';
}
function render() { renderIdentity(); renderNavigation(); renderJobs(); renderCatalog(); renderIncidents(); }
async function refresh() { state.data = await api('/api/bootstrap'); state.role = state.data.actor.role; render(); }

function populateSettings() {
  const form = $('#settingsForm'); const settings = state.data.settings;
  form.elements.organizationName.value = settings.organization.name;
  form.elements.organizationScope.value = settings.organization.scope;
  form.elements.endpoint.value = settings.llm.endpoint;
  form.elements.model.value = settings.llm.model;
  form.elements.apiKeyEnv.value = settings.llm.apiKeyEnv;
  form.elements.temperature.value = settings.llm.temperature;
  form.elements.compliancePrompt.value = settings.prompts.complianceDiscovery;
  form.elements.incidentPrompt.value = settings.prompts.incidentDraft;
}
function renderDocumentTypes() {
  $('#documentTypes').innerHTML = documentTypes.map(type => `<label><input type="checkbox" name="documentType" value="${type}" checked> ${escapeHtml(labels[type])}</label>`).join('');
}
function incidentDetails(incident) {
  const attachments = incident.attachments.map(file => `<a href="/api/attachments/${escapeHtml(file.id)}">${escapeHtml(file.name)} (${Math.ceil(file.bytes/1024)} KB)</a>`).join('<br>') || 'Nessuno';
  const reminders = incident.reminders ? `<div class="deadline"><strong>Promemoria non legali</strong><br>24 ore: ${escapeHtml(dateLabel(incident.reminders.earlyWarning24h))}<br>72 ore: ${escapeHtml(dateLabel(incident.reminders.notification72h))}<br>Un mese: ${escapeHtml(dateLabel(incident.reminders.finalReportOneMonth))}</div>` : '';
  const draft = incident.standardDraft;
  return `<dl class="definition"><dt>Tipo</dt><dd>${escapeHtml(labels[incident.kind])}</dd><dt>Fatti</dt><dd>${escapeHtml(incident.facts)}</dd><dt>Servizi</dt><dd>${escapeHtml(incident.affectedServices.join(', ') || 'Non indicati')}</dd><dt>Impatto</dt><dd>${escapeHtml(incident.impact || 'Non indicato')}</dd><dt>Allegati</dt><dd>${attachments}</dd></dl>${reminders}${draft ? `<section><h3>Proposta AI</h3><p>${escapeHtml(draft.summary)}</p><p><strong>Domande aperte</strong><br>${escapeHtml(draft.openQuestions.join(' · ') || 'Nessuna')}</p></section>` : '<p class="hint">La proposta AI distingue fatti, ipotesi e dati mancanti. Resta sempre modificabile.</p>'}`;
}
function openIncidentDetail(id) {
  const incident = state.data.incidents.find(item => item.id === id); if (!incident) return;
  state.activeIncidentId = id;
  $('#incidentDetailMeta').textContent = `${labels[incident.kind]} · ${labels[incident.state]}`;
  $('#incidentDetailTitle').textContent = incident.title || labels[incident.kind];
  $('#incidentDetailBody').innerHTML = incidentDetails(incident);
  $('#incidentNarrative').value = incident.finalNarrative || incident.standardDraft?.summary || '';
  $('#incidentNarrative').disabled = ['submitted','closed'].includes(incident.state);
  const own = incident.createdBy === state.data.actor.id || state.data.actor.role === 'admin';
  const actions = [];
  if (own && ['draft','ready'].includes(incident.state)) actions.push(`<button type="button" data-generate-incident="${escapeHtml(id)}" ${state.data.settings.llm.ready ? '' : 'disabled'}>Genera bozza AI</button>`);
  if (own && ['draft','ready'].includes(incident.state)) actions.push(`<button class="primary" type="button" data-submit-incident="${escapeHtml(id)}">Invia segnalazione</button>`);
  if (state.data.actor.role === 'admin' && incident.state === 'submitted') actions.push(`<button class="primary" type="button" data-close-incident="${escapeHtml(id)}">Chiudi</button>`);
  $('#incidentActions').innerHTML = actions.join('') || '<span class="hint">Nessuna azione disponibile.</span>';
  openDialog('incidentDetailDialog');
}

$$('[data-service]').forEach(button => button.addEventListener('click', () => { state.service = button.dataset.service; localStorage.setItem('ictc-service', state.service); renderNavigation(); $('#content').focus(); }));
$('#roleSelect').addEventListener('change', async event => { state.role = event.target.value; localStorage.setItem('ictc-role', state.role); await refresh(); });
$$('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.dataset.close)));
$('#openSettings').addEventListener('click', () => { populateSettings(); openDialog('settingsDialog'); });
$('#setupNow').addEventListener('click', () => { populateSettings(); openDialog('settingsDialog'); });
$('#openJob').addEventListener('click', () => { $('#jobForm').reset(); renderDocumentTypes(); openDialog('jobDialog'); });
$('#openIncident').addEventListener('click', () => { $('#incidentForm').reset(); $('#incidentForm').elements.awarenessAt.value = localDateTimeValue(); openDialog('incidentDialog'); });

$('#settingsForm').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  try {
    await api('/api/admin/settings',{method:'PUT',body:JSON.stringify({organization:{name:form.get('organizationName'),scope:form.get('organizationScope')},llm:{endpoint:form.get('endpoint'),model:form.get('model'),apiKeyEnv:form.get('apiKeyEnv'),temperature:Number(form.get('temperature'))},prompts:{complianceDiscovery:form.get('compliancePrompt'),incidentDraft:form.get('incidentPrompt')}})});
    closeDialog('settingsDialog'); await refresh(); notify('Configurazione salvata');
  } catch(error) { notify(error.message,true); }
});
$('#jobForm').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  try {
    await api('/api/jobs',{method:'POST',body:JSON.stringify({name:form.get('name'),scope:form.get('scope'),jurisdictions:splitList(form.get('jurisdictions')),authorities:splitList(form.get('authorities')),documentTypes:form.getAll('documentType'),sourceUrls:splitList(form.get('sourceUrls')),prompt:form.get('prompt'),intervalHours:Number(form.get('intervalHours')),enabled:form.get('enabled') === 'on'})});
    closeDialog('jobDialog'); await refresh(); notify('Monitoraggio creato');
  } catch(error) { notify(error.message,true); }
});
$('#contributionForm').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  try {
    const attachments = await filesPayload(event.currentTarget.elements.files);
    await api('/api/contributions',{method:'POST',body:JSON.stringify({kind:attachments.length && (form.get('url') || form.get('text')) ? 'mixed' : attachments.length ? 'file' : form.get('url') ? 'link' : 'text',title:form.get('title'),url:form.get('url'),text:form.get('text'),attachments})});
    event.currentTarget.reset(); await refresh(); notify('Fonte aggiunta');
  } catch(error) { notify(error.message,true); }
});
$('#incidentForm').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  try {
    const attachments = await filesPayload(event.currentTarget.elements.files);
    const body = {kind:form.get('kind'),title:form.get('title'),awarenessAt:new Date(form.get('awarenessAt')).toISOString(),detectedAt:form.get('detectedAt') ? new Date(form.get('detectedAt')).toISOString() : '',facts:form.get('facts'),affectedServices:splitList(form.get('affectedServices')),impact:form.get('impact'),indicators:splitList(form.get('indicators')),mitigations:splitList(form.get('mitigations')),maliciousSuspected:form.get('maliciousSuspected') === 'on',crossBorder:form.get('crossBorder') === 'on',contacts:splitList(form.get('contacts')),attachments};
    const result = await api('/api/incidents',{method:'POST',body:JSON.stringify(body)});
    closeDialog('incidentDialog'); await refresh(); notify('Fatti registrati'); openIncidentDetail(result.incident.id);
  } catch(error) { notify(error.message,true); }
});

document.addEventListener('click', async event => {
  const run = event.target.closest('[data-run-job]');
  if (run) { run.disabled = true; try { await api(`/api/jobs/${run.dataset.runJob}/run`,{method:'POST',body:'{}'}); await refresh(); notify('Monitoraggio completato'); } catch(error) { await refresh(); notify(error.message,true); } return; }
  const open = event.target.closest('[data-open-incident]'); if (open) { openIncidentDetail(open.dataset.openIncident); return; }
  const generate = event.target.closest('[data-generate-incident]');
  if (generate) { generate.disabled = true; try { await api(`/api/incidents/${generate.dataset.generateIncident}/draft`,{method:'POST',body:'{}'}); await refresh(); openIncidentDetail(generate.dataset.generateIncident); notify('Bozza AI generata'); } catch(error) { notify(error.message,true); } return; }
  const submit = event.target.closest('[data-submit-incident]');
  if (submit) { try { await api(`/api/incidents/${submit.dataset.submitIncident}/submit`,{method:'POST',body:JSON.stringify({narrative:$('#incidentNarrative').value})}); closeDialog('incidentDetailDialog'); await refresh(); notify('Segnalazione inviata'); } catch(error) { notify(error.message,true); } return; }
  const close = event.target.closest('[data-close-incident]');
  if (close) { try { await api(`/api/incidents/${close.dataset.closeIncident}/close`,{method:'POST',body:'{}'}); closeDialog('incidentDetailDialog'); await refresh(); notify('Segnalazione chiusa'); } catch(error) { notify(error.message,true); } }
});

renderDocumentTypes();
refresh().catch(error => notify(error.message,true));
