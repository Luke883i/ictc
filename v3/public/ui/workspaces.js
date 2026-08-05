import { $, dateLabel, esc, labels, state } from './common.js';

function evidenceButton(url, label = 'Scarica evidenze') {
  return `<button class="secondary" type="button" data-download-evidence="${esc(url)}">${esc(label)}</button>`;
}
function traceBlock(trace) {
  if (!trace) return '<p>Traccia AI non disponibile.</p>';
  return `<div class="provenance-list"><div class="provenance-row"><span class="origin-tag">Modello</span><span>${esc(trace.model || 'non indicato')}</span></div><div class="provenance-row"><span class="origin-tag">Prompt</span><span class="hash">${esc(trace.promptSha256 || '—')}</span></div><div class="provenance-row"><span class="origin-tag">Input</span><span class="hash">${esc(trace.inputSha256 || '—')}</span></div><div class="provenance-row"><span class="origin-tag">Output</span><span class="hash">${esc(trace.outputSha256 || '—')}</span></div></div>`;
}

export function populateSettings() {
  const form = $('#settingsForm');
  const settings = state.data.settings;
  form.elements.organizationName.value = settings.organization.name || '';
  form.elements.organizationScope.value = settings.organization.scope || '';
  form.elements.jurisdictions.value = (settings.organization.jurisdictions || []).join(', ');
  form.elements.endpoint.value = settings.llm.endpoint || '';
  form.elements.model.value = settings.llm.model || '';
  form.elements.apiKeyEnv.value = settings.llm.apiKeyEnv || '';
  form.elements.temperature.value = settings.llm.temperature ?? .1;
  for (const key of ['monitoringPlan','complianceDiscovery','contributionEnrichment','incidentAnalysis','incidentDraft']) form.elements[key].value = settings.prompts?.[key] || '';
}

export function renderPlanDialog() {
  const mission = state.data.missions.find(item => item.id === state.activeMissionId);
  if (!mission) return;
  const plan = mission.plan || {};
  $('#planTitle').textContent = mission.objective;
  const noPlan = !mission.plan;
  const planCards = noPlan
    ? `<section class="reveal-card"><p class="eyebrow">Obiettivo registrato</p><h3>Il piano AI non è disponibile</h3><p>${esc(mission.aiError || 'Configura o ripristina il provider e riprova.')}</p></section>`
    : `<div class="plan-reveal"><section class="reveal-card"><p class="eyebrow">Perimetro</p><h3>Cosa è stato compreso</h3><p>${esc(plan.rationale || mission.objective)}</p></section><section class="reveal-card"><p class="eyebrow">Ricerca</p><h3>Query e fonti</h3><ul>${[...(plan.queries || []),...(plan.preferredSources || [])].slice(0,12).map(item=>`<li>${esc(item)}</li>`).join('') || '<li>Nessun dettaglio proposto.</li>'}</ul></section><section class="reveal-card"><p class="eyebrow">Inclusioni</p><h3>Criteri</h3><ul>${(plan.inclusionCriteria || []).map(item=>`<li>${esc(item)}</li>`).join('') || '<li>Pertinenza al perimetro dichiarato.</li>'}</ul></section><section class="reveal-card"><p class="eyebrow">Esclusioni</p><h3>Rumore da evitare</h3><ul>${(plan.exclusionCriteria || []).map(item=>`<li>${esc(item)}</li>`).join('') || '<li>Fonti non verificabili.</li>'}</ul></section></div>`;
  const editable = state.data.actor.role === 'admin' && ['draft','paused','needs-plan'].includes(mission.state);
  $('#planBody').innerHTML = `${planCards}<div class="boundary">Il piano è un suggerimento AI da verificare. Attivazione, revisione, sospensione e decisioni sulle fonti restano atti umani distinti.</div><div class="source-facts"><div class="fact-box"><b>v${esc(mission.planVersion || 0)}</b><span>Versione</span></div><div class="fact-box"><b>${mission.cadenceHours} ore</b><span>Frequenza</span></div><div class="fact-box"><b>${esc(labels[mission.state] || mission.state)}</b><span>Stato</span></div></div><section class="lens-panel"><p class="eyebrow">Traccia AI</p>${traceBlock(mission.planTrace)}</section>${editable ? `<section class="lens-panel"><p class="eyebrow">Revisione umana</p><label>Obiettivo<textarea id="missionObjective" rows="4">${esc(mission.objective)}</textarea></label><label>Fonti note<input id="missionHints" value="${esc((mission.sourceHints || []).join(', '))}"></label><label>Istruzioni specifiche<textarea id="missionPrompt" rows="4">${esc(mission.promptOverride || '')}</textarea></label><p class="microcopy">La revisione conserva la versione precedente del piano.</p></section>` : ''}${mission.state === 'active' && state.data.actor.role === 'admin' ? `<section class="lens-panel"><label>Motivo della sospensione<textarea id="pauseReason" rows="3" placeholder="Perché il monitoraggio deve fermarsi ora?"></textarea></label></section>` : ''}`;
  const actions = [evidenceButton(mission.evidenceUrl)];
  if (editable) {
    actions.push(`<button type="button" data-revise-mission="${esc(mission.id)}">${mission.state === 'needs-plan' ? 'Riprova' : 'Rigenera piano'}</button>`);
    if (mission.plan) actions.push(mission.state === 'paused'
      ? `<button class="primary" type="button" data-resume-mission="${esc(mission.id)}">Riprendi monitoraggio</button>`
      : `<button class="primary" type="button" data-activate-mission="${esc(mission.id)}">Attiva monitoraggio</button>`);
  }
  if (mission.state === 'active' && state.data.actor.role === 'admin') actions.push(`<button type="button" data-pause-mission="${esc(mission.id)}">Sospendi</button><button class="primary" type="button" data-run-mission="${esc(mission.id)}">Esegui ora</button>`);
  $('#planActions').innerHTML = actions.join('');
}

export function renderSourceDialog() {
  const item = state.data.catalog.find(entry => entry.id === state.activeSourceId);
  if (!item) return;
  $('#sourceTitle').textContent = item.title;
  $('#sourceMeta').textContent = `${item.authority || 'Autorità non indicata'} · ${item.jurisdiction || 'Giurisdizione non indicata'}`;
  const observations = item.observations?.length ? item.observations : [{ observedAt:item.createdAt, origin:item.origin, aiTrace:item.aiTrace, title:item.title, sourceUrl:item.sourceUrl }];
  const decisions = item.decisions || [];
  $('#sourceBody').innerHTML = `<div class="source-facts"><div class="fact-box"><b>${esc(item.documentType || 'Non determinato')}</b><span>Tipo proposto</span></div><div class="fact-box"><b>${Math.round(Number(item.confidence || 0)*100)}%</b><span>Confidenza AI</span></div><div class="fact-box"><b>${esc(labels[item.state] || item.state)}</b><span>Stato umano</span></div></div><div class="lens-grid"><section class="lens-panel"><p class="eyebrow">Suggerimento AI da verificare</p><h3>Rilevanza</h3><p>${esc(item.relevance || 'Non disponibile')}</p><h3>Sintesi</h3><p>${esc(item.summary || 'Non disponibile')}</p>${item.sourceUrl ? `<a class="secondary" target="_blank" rel="noreferrer" href="${esc(item.sourceUrl)}">Apri fonte ufficiale</a>` : ''}</section><section class="lens-panel"><p class="eyebrow">Cronologia fonte</p><div class="provenance-list">${observations.slice().reverse().slice(0,20).map((obs,index)=>`<div class="provenance-row"><span class="origin-tag">${index ? 'Osservazione precedente' : 'Ultima osservazione'}</span><span>${esc(dateLabel(obs.observedAt))} · ${esc(obs.origin?.kind || 'origine sconosciuta')}<br><small>${esc(obs.origin?.missionId || obs.origin?.contributionId || '')}</small></span></div>`).join('')}</div></section></div><section class="lens-panel"><p class="eyebrow">Decisioni registrate</p>${decisions.length ? `<div class="provenance-list">${decisions.slice().reverse().map(decision=>`<div class="provenance-row"><span class="origin-tag">${esc(labels[decision.decision] || decision.decision)}</span><span>${esc(decision.reason || 'Motivazione non disponibile')}<br><small>${esc(decision.by)} · ${esc(dateLabel(decision.at))}</small></span></div>`).join('')}</div>` : '<p>Nessuna decisione umana.</p>'}</section><section class="lens-panel"><p class="eyebrow">Traccia AI</p>${traceBlock(item.aiTrace)}</section><div class="boundary">Fonte trovata non significa fonte applicabile. Verifica testo ufficiale, vigenza, autorità e perimetro.</div>${item.state === 'candidate' && state.data.actor.role === 'admin' ? `<label>Motivazione della decisione<textarea id="sourceDecisionReason" rows="4" placeholder="Indica verifiche svolte, elementi osservati e limiti residui"></textarea></label>` : ''}`;
  const actions = [evidenceButton(item.evidenceUrl)];
  if (item.state === 'candidate' && state.data.actor.role === 'admin') actions.push('<button type="button" data-source-decision="rejected">Escludi</button><button class="primary" type="button" data-source-decision="verified">Verifica fonte</button>');
  $('#sourceActions').innerHTML = actions.join('');
}

function answerValue(question) {
  const value = question.suggestedValue || '';
  if (question.type === 'select') return `<select id="questionValue">${question.options.map(option=>`<option value="${esc(option)}" ${option === value ? 'selected' : ''}>${esc(labels[option] || option)}</option>`).join('')}</select>`;
  if (question.type === 'datetime-local') return `<input id="questionValue" type="datetime-local" value="${esc(value)}">`;
  return `<textarea id="questionValue" rows="4" placeholder="Rispondi con ciò che è noto">${esc(value)}</textarea>`;
}
export function addedDiff(original, finalText) {
  const base = new Set(String(original).toLowerCase().split(/\s+/).filter(Boolean));
  return String(finalText || '').split(/(\s+)/).map(token => !token.trim() || base.has(token.toLowerCase()) ? esc(token) : `<mark class="diff-added">${esc(token)}</mark>`).join('');
}

export function renderIncidentWorkspace() {
  const incident = state.data.incidents.find(item => item.id === state.activeIncidentId);
  if (!incident) return;
  const proposedKind = incident.answers?.classification?.unknown ? 'Non determinato' : labels[incident.answers?.classification?.value || incident.analysis?.proposedKind || 'unknown'];
  $('#workspaceMeta').textContent = `${labels[incident.state] || incident.state} · ${proposedKind}`;
  $('#workspaceTitle').textContent = incident.originalNarrative.slice(0,100);
  const facts = incident.analysis?.extractedFacts || [];
  const assumptions = incident.analysis?.assumptions || [];
  const analysis = `<div class="lens-grid"><section class="lens-panel"><p class="eyebrow">Originale registrato</p><h3>Racconto</h3><p>${esc(incident.originalNarrative)}</p><div class="origin-row"><span class="origin-tag">Dichiarato dall’utente</span><span class="origin-tag">${incident.attachments.length} allegati</span></div></section><section class="lens-panel"><p class="eyebrow">Analisi AI</p>${incident.aiError ? `<div class="boundary"><b>Analisi non disponibile</b><p>${esc(incident.aiError)}</p><button type="button" data-retry-incident="${esc(incident.id)}">Riprova analisi AI</button></div>` : `<h3>Fatti estratti</h3><div class="provenance-list">${facts.map(item=>`<div class="provenance-row"><span class="origin-tag">Estratto AI</span><span>${esc(item)}</span></div>`).join('') || '<p>Nessuna estrazione disponibile.</p>'}</div>${assumptions.length ? `<h3>Ipotesi, non fatti</h3><div class="provenance-list">${assumptions.map(item=>`<div class="provenance-row"><span class="origin-tag">Ipotesi AI</span><span>${esc(item)}</span></div>`).join('')}</div>` : ''}${traceBlock(incident.analysisTrace)}`}</section></div>`;
  const question = incident.nextQuestion;
  const nextQuestion = question ? `<section class="question-compass"><p class="eyebrow">Domanda successiva · ${incident.questions.length} informazioni mancanti</p><h3>${esc(question.label)}</h3>${question.suggestedValue ? `<div class="ai-suggestion"><b>Suggerimento AI da verificare</b><p>${esc(question.suggestedValue)}</p><small>Viene registrato solo dopo la tua conferma o correzione.</small></div>` : ''}<div class="why-grid"><div><b>Perché serve ora</b><br>${esc(question.whyNow)}</div><div><b>Come sarà usata</b><br>${esc(question.evidenceUse)}</div></div>${answerValue(question)}<div class="question-actions"><button class="unknown" type="button" data-answer-unknown="${esc(question.id)}">Non disponibile</button><button class="primary" type="button" data-answer-question="${esc(question.id)}">Conferma o correggi</button></div></section>` : '';
  const answerHistory = Object.entries(incident.answers || {});
  const versions = incident.formulationVersions || [];
  const history = `<div class="lens-grid"><section class="lens-panel"><p class="eyebrow">Conferme umane</p>${answerHistory.length ? `<div class="provenance-list">${answerHistory.map(([key,answer])=>`<div class="provenance-row"><span class="origin-tag">${esc(key)}</span><span>${answer.unknown ? 'Non disponibile' : esc(answer.value)}<br><small>${esc(answer.adoption || 'human-recorded')} · ${esc(answer.answeredBy)} · ${esc(dateLabel(answer.answeredAt))}</small></span></div>`).join('')}</div>` : '<p>Nessuna risposta registrata.</p>'}</section><section class="lens-panel"><p class="eyebrow">Versioni</p>${versions.length ? `<div class="provenance-list">${versions.slice().reverse().map(version=>`<div class="provenance-row"><span class="origin-tag">${esc(version.source)}</span><span>${esc(dateLabel(version.at))} · ${esc(version.by)}<br><small class="hash">${esc(version.sha256)}</small></span></div>`).join('')}</div>` : '<p>Nessuna versione salvata.</p>'}</section></div>`;
  const current = versions.at(-1);
  const review = current ? `<section><p class="eyebrow">Confronto con l’originale</p><h3>Verifica la versione corrente</h3><div class="draft-review"><section><h4>Parole aggiunte</h4><p>${addedDiff(incident.originalNarrative, incident.finalNarrative || current.narrative)}</p></section><section><label>Formulazione finale<textarea id="finalNarrative" rows="12" ${['submitted','closed'].includes(incident.state) ? 'disabled' : ''}>${esc(incident.finalNarrative || current.narrative)}</textarea></label>${!['submitted','closed'].includes(incident.state) ? '<label class="confirm-row"><input id="confirmIncident" type="checkbox"> Confermo di aver verificato fatti, informazioni non disponibili e formulazione corrente.</label>' : ''}</section></div></section>` : !question ? `<section class="lens-panel"><p class="eyebrow">Formulazione</p><h3>Le informazioni minime sono disponibili</h3><p>Puoi chiedere una bozza all’AI oppure scrivere una versione umana. Entrambe saranno salvate prima dell’invio.</p><label>Versione manuale<textarea id="manualNarrative" rows="8"></textarea></label></section>` : '';
  $('#workspaceBody').innerHTML = `${analysis}${nextQuestion}${history}<div class="lens-grid"><section class="lens-panel"><p class="eyebrow">Cronologia</p><div class="timeline"><div class="timeline-item"><b>Conoscenza organizzativa</b><small>${esc(dateLabel(incident.awarenessAt))}</small></div>${(incident.analysis?.timeline || []).slice(0,10).map(item=>`<div class="timeline-item"><b>${esc(item.event)}</b><small>${esc(dateLabel(item.at))} · ${esc(item.source || 'AI')}</small></div>`).join('')}<div class="timeline-item"><b>Ultimo aggiornamento</b><small>${esc(dateLabel(incident.updatedAt))}</small></div></div></section><section class="lens-panel"><p class="eyebrow">Promemoria</p><p>24 ore: <b>${esc(dateLabel(incident.reminders?.earlyWarning24h))}</b></p><p>72 ore: <b>${esc(dateLabel(incident.reminders?.notification72h))}</b></p><p>Un mese: <b>${esc(dateLabel(incident.reminders?.finalReportOneMonth))}</b></p><div class="boundary">ICTC non determina significatività o obblighi di notifica.</div></section></div>${review}`;
  const actions = [evidenceButton(incident.evidenceUrl)];
  if (!question && !current && ['intake','clarifying','review'].includes(incident.state)) {
    if (state.data.settings.llm.ready && !incident.aiError) actions.push(`<button class="primary" type="button" data-generate-draft="${esc(incident.id)}">Genera bozza AI</button>`);
    actions.push(`<button type="button" data-save-manual="${esc(incident.id)}">Salva versione manuale</button>`);
  }
  if (current && ['clarifying','review'].includes(incident.state)) {
    actions.push(`<button type="button" data-save-formulation="${esc(incident.id)}">Salva nuova versione</button>`);
    actions.push(`<button class="primary" type="button" data-submit-incident="${esc(incident.id)}" data-formulation-sha="${esc(current.sha256)}">Invia versione corrente</button>`);
  }
  if (incident.state === 'submitted' && state.data.actor.role === 'admin') actions.push(`<label class="closure-inline">Motivo chiusura<input id="closureNote" placeholder="Esito amministrativo e limiti residui"></label><button class="primary" type="button" data-close-incident="${esc(incident.id)}">Chiudi evento</button>`);
  $('#workspaceActions').innerHTML = actions.join('');
}
