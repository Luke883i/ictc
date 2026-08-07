import { $, $$, esc, state } from './common.js';

const ROLE_LABELS = { admin: 'Amministratore', user: 'Utente', auditor: 'Auditor' };
const SURFACE_COPY = {
  admin: {
    homeTitle: 'Governa attività e accessi',
    homeLead: 'Controlla le attività operative, intervieni sulle eccezioni e conserva una prova per ogni decisione.',
    monitoringLead: 'Configura le ricerche, approva i piani, avvia le esecuzioni e verifica le fonti proposte.',
    eventsLead: 'Registra o governa gli eventi aperti. Analisi e bozze assistono; le decisioni restano umane.'
  },
  user: {
    homeTitle: 'Continua il lavoro',
    homeLead: 'Scegli un’attività, registra ciò che sai e segui lo stato senza dover formulare conclusioni premature.',
    monitoringLead: 'Consulta le ricerche disponibili e aggiungi materiale originale da sottoporre a verifica.',
    eventsLead: 'Registra un evento o continua una segnalazione aperta partendo dai fatti disponibili.'
  },
  auditor: {
    homeTitle: 'Consulta attività e prove',
    homeLead: 'Ricostruisci origine, versioni, decisioni ed effetti senza modificare i dati.',
    monitoringLead: 'Consulta ricerche, esecuzioni, fonti, decisioni e prove in sola lettura.',
    eventsLead: 'Consulta eventi, versioni, decisioni e prove in sola lettura.'
  }
};

function role() { return state.data?.actor?.role || state.role || 'user'; }
function capability(name) { return Array.isArray(state.data?.capabilities) && state.data.capabilities.includes(name); }
function text(node, value) { if (node && value != null && node.textContent !== String(value)) node.textContent = value; }
function setHidden(node, value) { if (node && node.hidden !== value) node.hidden = value; }
function closestSection(selector) { return $(selector)?.closest('section') || null; }

function normalizeShell() {
  const activeRole = role();
  const llm = state.data?.settings?.llm || {};
  text($('.brand small'), 'Ricerca normativa, eventi e prove');
  text($('.role-control span'), 'Ruolo');
  $('.role-control')?.setAttribute('aria-label', 'Ruolo attivo');
  const nav = { home: 'Panoramica', monitoring: 'Ricerca normativa', incidents: 'Eventi e incidenti' };
  for (const [surface, label] of Object.entries(nav)) text($(`[data-service="${surface}"]`), label);
  text($('[data-proof-service]'), 'Guida e prove');
  const status = $('#runtimeStatus');
  if (status) {
    const aiDetail = llm.ready ? 'AI disponibile' : llm.configured ? 'Chiave AI non disponibile' : 'AI non configurata';
    const visible = activeRole === 'auditor' ? 'Sola lettura' : activeRole === 'admin' ? (llm.ready ? 'AI disponibile' : 'AI da configurare') : (llm.ready ? 'AI disponibile' : 'Modalità manuale');
    text(status, visible);
    status.title = `${ROLE_LABELS[activeRole] || activeRole} · ${aiDetail}`;
    status.setAttribute('aria-label', `${ROLE_LABELS[activeRole] || activeRole}. ${aiDetail}`);
  }
}

function moveSections(target, selectors) {
  for (const selector of selectors) {
    const section = closestSection(selector);
    if (section) target.append(section);
  }
}

function transformHomeDisclosures() {
  const legacy = $('.home-context-18');
  if (!legacy || legacy.dataset.enterprise2 === 'true') return;
  legacy.dataset.enterprise2 = 'true';
  const stack = document.createElement('section');
  stack.className = 'home-disclosure-stack';
  stack.setAttribute('aria-label', 'Dettagli della panoramica');
  stack.innerHTML = `
    <details class="home-disclosure" data-home-disclosure="method">
      <summary><span><b>Come lavorare</b><small>Scopo, passaggi ed effetto atteso</small></span></summary>
      <div class="home-disclosure-body"><div class="home-context-grid home-context-method"></div></div>
    </details>
    <details class="home-disclosure" data-home-disclosure="proof">
      <summary><span><b>Prove e responsabilità</b><small>AI, tracce, accesso e limiti</small></span></summary>
      <div class="home-disclosure-body"><div class="home-context-grid home-context-proof"></div></div>
    </details>`;
  const methodBody = stack.querySelector('.home-context-method');
  const proofBody = stack.querySelector('.home-context-proof');
  moveSections(methodBody, ['#homeWhyMe', '#homeHow', '#homeOutcome', '#homeHumanGate']);
  moveSections(proofBody, ['#homeAiNote', '#homeEvidence']);
  const journey = $('#homeJourney');
  const metrics = $('#homeMetrics');
  const authority = $('#homeAuthority');
  if (journey) methodBody.after(journey);
  if (metrics) proofBody.after(metrics);
  if (authority) {
    authority.open = false;
    authority.querySelector('summary span') && text(authority.querySelector('summary span'), 'Accesso e limiti del ruolo');
    proofBody.parentElement.append(authority);
  }
  legacy.replaceWith(stack);
}

function normalizeHome() {
  const root = $('#homeView');
  if (!root) return;
  const activeRole = role();
  const copy = SURFACE_COPY[activeRole] || SURFACE_COPY.user;
  root.dataset.enterprise2 = 'true';
  text($('#workbenchHomeTitle'), copy.homeTitle);
  text($('#homeSummary'), copy.homeLead);
  text($('.workbench-home-rule'), 'Apri un’area oppure continua dalla prossima attività.');
  const laneLabels = {
    monitoring: activeRole === 'auditor'
      ? ['Ricerca normativa', 'Consulta ricerche, esecuzioni, fonti e decisioni.', 'Apri le ricerche']
      : activeRole === 'admin'
        ? ['Ricerca normativa', 'Configura ricerche, approva piani e verifica fonti.', 'Apri le ricerche']
        : ['Ricerca normativa', 'Consulta gli esiti e aggiungi materiale originale.', 'Apri le ricerche'],
    incidents: activeRole === 'auditor'
      ? ['Eventi e incidenti', 'Consulta originali, versioni, decisioni e prove.', 'Apri gli eventi']
      : activeRole === 'admin'
        ? ['Eventi e incidenti', 'Governa chiarimenti, versioni, invii e chiusure.', 'Apri gli eventi']
        : ['Eventi e incidenti', 'Registra un evento o continua una segnalazione.', 'Apri gli eventi']
  };
  text($('#homeMonitoringTitle'), laneLabels.monitoring[0]);
  text($('#homeMonitoringCopy'), laneLabels.monitoring[1]);
  text($('#homeMonitoringAction'), laneLabels.monitoring[2]);
  text($('#homeIncidentTitle'), laneLabels.incidents[0]);
  text($('#homeIncidentCopy'), laneLabels.incidents[1]);
  text($('#homeIncidentAction'), laneLabels.incidents[2]);
  text($('.home-recommendation .eyebrow'), 'Prossima attività');
  for (const status of $$('.lane-status span')) {
    const normalized = status.textContent.replace('job attivi', 'ricerche attive').replace('fascicoli aperti', 'eventi aperti').replace('totali', 'eventi totali');
    text(status, normalized);
  }
  transformHomeDisclosures();
  const authority = $('#homeAuthority');
  if (authority && authority.dataset.enterprise2Bound !== 'true') {
    authority.dataset.enterprise2Bound = 'true';
    authority.addEventListener('toggle', event => { if (event.isTrusted) authority.dataset.userState = authority.open ? 'open' : 'closed'; });
  }
  if (authority) authority.open = authority.dataset.userState === 'open';
}

function labelMissionCard(card, mission) {
  if (!mission) return;
  card.classList.add('enterprise2-record-card');
  const title = card.querySelector('h3');
  text(title, mission.jobName || mission.objective || 'Ricerca senza nome');
  let objective = card.querySelector('.mission-objective-20');
  if (!objective) {
    objective = document.createElement('p');
    objective.className = 'mission-objective-20';
    card.querySelector('.card-head')?.after(objective);
  }
  const showObjective = Boolean(mission.objective && mission.objective !== title?.textContent);
  setHidden(objective, !showObjective);
  if (showObjective) text(objective, mission.objective);
  const meta = card.querySelector('.card-meta');
  if (meta) {
    const next = mission.nextRunAt ? new Intl.DateTimeFormat('it', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(mission.nextRunAt)) : 'Non pianificata';
    const schedule = mission.cadenceHours ? `Ogni ${mission.cadenceHours} ore` : 'Frequenza non indicata';
    const version = `Piano v${mission.planVersion || 0}`;
    const markup = `<span><b>Frequenza</b>${esc(schedule)}</span><span><b>Prossima esecuzione</b>${esc(next)}</span><span><b>Versione</b>${esc(version)}</span>`;
    if (meta.innerHTML !== markup) meta.innerHTML = markup;
  }
  const evidence = card.querySelector('[data-download-evidence]');
  if (evidence) text(evidence, 'Scarica prova');
  const openPlan = card.querySelector('[data-open-plan]');
  if (openPlan) text(openPlan, role() === 'admin' ? (mission.state === 'needs-plan' ? 'Riprova pianificazione' : 'Rivedi piano') : 'Apri dettaglio');
  const edit = card.querySelector('[data-edit-job-profile]');
  if (edit) text(edit, 'Configura ricerca');
}

function normalizeMonitoring() {
  const root = $('#monitoringView');
  if (!root) return;
  root.dataset.enterprise2 = 'true';
  const activeRole = role();
  text(root.querySelector('.core-title h1'), 'Ricerche normative');
  text($('#monitoringRoleDescription'), (SURFACE_COPY[activeRole] || SURFACE_COPY.user).monitoringLead);
  text($('#openJobConfig'), 'Nuova ricerca');
  text($('#monitoringContributionAction'), 'Aggiungi materiale');
  text($('#monitoringContext'), 'Come funziona');
  const heading = $('#missionsList')?.closest('.section-block')?.querySelector('h2');
  text(heading, activeRole === 'admin' ? 'Ricerche configurate' : 'Ricerche disponibili');
  text(heading?.closest('.section-head')?.querySelector('.eyebrow'), 'Ricerche');
  text($('#materialRecent18 > summary'), 'Materiali recenti');
  const cards = $$('.mission-card');
  const ordered = [...(state.data?.missions || [])].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  cards.forEach((card, index) => {
    const missionId = card.querySelector('[data-open-plan]')?.dataset.openPlan || card.querySelector('[data-edit-job-profile]')?.dataset.editJobProfile;
    const mission = state.data?.missions?.find(item => item.id === missionId) || ordered[index];
    if (mission && !card.querySelector('[data-open-plan]')) {
      card.querySelector('.card-actions')?.insertAdjacentHTML('afterbegin', `<button class="secondary" type="button" data-open-plan="${esc(mission.id)}">Apri dettaglio</button>`);
    }
    labelMissionCard(card, mission);
  });
  const empty = $('#missionsList .empty');
  if (empty) text(empty, capability('manage-monitoring') ? 'Nessuna ricerca configurata. Crea la prima ricerca.' : 'Nessuna ricerca disponibile.');
  text($('#catalogList')?.closest('.section-block')?.querySelector('h2'), 'Fonti da verificare');
}

function normalizeEvents() {
  const root = $('#incidentsView');
  if (!root) return;
  root.dataset.enterprise2 = 'true';
  const activeRole = role();
  text(root.querySelector('.core-title h1'), 'Eventi e incidenti');
  text($('#eventsRoleDescription'), (SURFACE_COPY[activeRole] || SURFACE_COPY.user).eventsLead);
  text($('#openIncident'), 'Registra evento');
  text($('#eventsContext'), 'Come funziona');
  const heading = root.querySelector('.section-head h2');
  text(heading, 'Eventi registrati');
  text(heading?.closest('.section-head')?.querySelector('.eyebrow'), 'Registro');
  text(heading?.parentElement?.querySelector('p:not(.eyebrow)'), 'Apri un evento per vedere originale, informazioni mancanti, versioni, decisioni e prove.');
  for (const card of $$('.incident-card')) {
    card.classList.add('enterprise2-record-card');
    const evidence = card.querySelector('[data-download-evidence]');
    if (evidence) {
      text(evidence, 'Scarica prova');
      evidence.setAttribute('aria-label', 'Scarica prova dell’evento');
    }
    const open = card.querySelector('[data-open-incident]');
    if (open) {
      text(open, 'Apri evento');
      open.setAttribute('aria-label', 'Apri evento');
    }
  }
  const empty = $('#incidentList .empty');
  if (empty) text(empty, capability('report-incident') ? 'Nessun evento registrato. Usa “Registra evento” per iniziare.' : 'Nessun evento disponibile.');
}

function normalizeProof() {
  const root = $('#proofView');
  if (!root) return;
  root.dataset.enterprise2 = 'true';
  text($('#proofTitle'), 'Guida operativa e prove');
  text($('#proofLead'), 'Consulta capacità, controlli, evidenze e limiti. Il dettaglio tecnico resta disponibile su richiesta.');
  text($('#openProofDetails'), 'Apri dettagli');
  text($('#proofStartTitle'), 'Tre risposte essenziali');
  const replacements = ['Versione', 'Ruolo e accesso', 'Controlli applicativi', 'Requisiti di deployment', 'Integrità delle evidenze', 'Metodo di lettura'];
  $$('.proof-verdict span').forEach((node, index) => text(node, replacements[index] || node.textContent));
}

const ADMIN_SECTIONS = [
  ['Sintesi', '.admin-proof-panel'],
  ['Controlli', '[data-admin-section="stato-dei-controlli"]'],
  ['Azioni richieste', '[data-admin-section="azioni-richieste"]'],
  ['Utilizzo AI', '[data-admin-section="utilizzo-ai"]'],
  ['Governance AI', '[data-admin-section="governance-ai"]'],
  ['Accesso federato', '[data-identity-admin]'],
  ['Identità locali', '[data-enterprise2-local-users]']
];

function panelTitle(panel) {
  return panel?.querySelector(':scope > h3')?.textContent?.trim() || panel?.querySelector('.admin-disclosure > summary b')?.textContent?.trim() || '';
}

function prepareAdminPanels(grid) {
  for (const panel of [...grid.children]) {
    if (!panel.classList.contains('admin-panel')) continue;
    const title = panelTitle(panel);
    if (title === 'Utenti locali e legacy' || title === 'Utenti e ruoli') panel.dataset.enterprise2LocalUsers = 'true';
    const disclosure = panel.querySelector(':scope > .admin-disclosure');
    if (disclosure) disclosure.open = true;
  }
}

function activateAdminSection(dialog, selector) {
  const grid = dialog.querySelector('.admin-grid');
  for (const panel of [...grid.children].filter(node => node.classList.contains('admin-panel'))) setHidden(panel, true);
  const selected = dialog.querySelector(selector);
  if (selected) {
    setHidden(selected, false);
    selected.querySelector(':scope > .admin-disclosure')?.setAttribute('open', '');
  }
  for (const button of $$('.admin-section-nav button', dialog)) {
    const value = button.dataset.adminTarget === selector ? 'page' : 'false';
    if (button.getAttribute('aria-current') !== value) button.setAttribute('aria-current', value);
  }
  dialog.dataset.activeAdminSection = selector;
}

function normalizeAdminFields(dialog) {
  text($('#adminCenterTitle'), 'Amministrazione ICTC');
  text(dialog.querySelector('.admin-head p:not(.eyebrow)'), 'Controlli, AI, identità e accessi. Ogni modifica resta tracciata.');
  const governance = $('#governanceForm');
  if (governance) {
    const map = {
      'Ambiente': 'Nome ambiente', 'Classificazione': 'Classificazione dei dati', 'Responsabile': 'Responsabile del servizio',
      'Budget mensile USD': 'Budget mensile (USD)', 'Soglia avviso %': 'Soglia di avviso (%)',
      'Modelli consentiti, uno per riga': 'Modelli AI autorizzati, uno per riga'
    };
    for (const label of governance.querySelectorAll('label')) {
      const first = label.childNodes[0];
      const raw = first?.textContent?.trim();
      if (first && map[raw]) first.textContent = `${map[raw]} `;
    }
    const classification = governance.elements.classification;
    if (classification) {
      const labels = { internal: 'Uso interno', confidential: 'Riservato', restricted: 'Limitato' };
      for (const option of classification.options) text(option, labels[option.value] || option.textContent);
    }
  }
  const localPanel = dialog.querySelector('[data-enterprise2-local-users]');
  const userForm = $('#userForm');
  if (localPanel && userForm && !userForm.closest('.local-user-disclosure')) {
    const details = document.createElement('details');
    details.className = 'local-user-disclosure';
    details.innerHTML = '<summary><span><b>Aggiungi identità locale</b><small>Usa questa sezione solo per modalità locale o header ruolo legacy</small></span></summary><div class="local-user-disclosure-body"></div>';
    userForm.before(details);
    details.querySelector('.local-user-disclosure-body').append(userForm);
    const list = $('#adminUsers');
    if (list) details.before(list);
  }
}

function enhanceAdmin() {
  const dialog = $('#adminCenter');
  const grid = dialog?.querySelector('.admin-grid');
  if (!dialog || !grid) return;
  prepareAdminPanels(grid);
  normalizeAdminFields(dialog);
  if (!dialog.querySelector('.admin-section-nav')) {
    const nav = document.createElement('nav');
    nav.className = 'admin-section-nav';
    nav.setAttribute('aria-label', 'Sezioni amministrative');
    const resolved = ADMIN_SECTIONS.filter(([, selector]) => dialog.querySelector(selector));
    nav.innerHTML = resolved.map(([label, selector], index) => `<button type="button" data-admin-target="${esc(selector)}" aria-current="${index === 0 ? 'page' : 'false'}">${esc(label)}</button>`).join('');
    grid.before(nav);
    nav.addEventListener('click', event => {
      const button = event.target.closest('[data-admin-target]');
      if (button) activateAdminSection(dialog, button.dataset.adminTarget);
    });
    activateAdminSection(dialog, resolved[0]?.[1] || '.admin-proof-panel');
  } else {
    activateAdminSection(dialog, dialog.dataset.activeAdminSection || ADMIN_SECTIONS.find(([, selector]) => dialog.querySelector(selector))?.[1] || '.admin-proof-panel');
  }
}

function normalizeDialogs() {
  const contribution = $('#contributionDialog');
  if (contribution) {
    text(contribution.querySelector('.dialog-shell > header .eyebrow'), 'Materiale originale');
    text(contribution.querySelector('.dialog-shell > header h2'), 'Aggiungi materiale');
    text(contribution.querySelector('button[type="submit"]'), 'Registra materiale');
  }
  const incident = $('#incidentDialog');
  if (incident) {
    text(incident.querySelector('.dialog-shell > header .eyebrow'), 'Nuovo evento');
    text(incident.querySelector('.dialog-shell > header h2'), 'Registra un evento');
  }
  const job = $('#jobDialog');
  const jobForm = $('#missionForm');
  if (job && jobForm) {
    text($('#jobDialogTitle'), jobForm.dataset.missionId ? 'Modifica la ricerca normativa' : 'Configura una ricerca normativa');
    text(job.querySelector('.dialog-head p:not(.eyebrow)'), 'Definisci scopo, perimetro, riferimento temporale e cambiamenti da cercare. Il piano proposto richiede approvazione umana.');
    const relabel = (name, label) => {
      const first = jobForm.elements[name]?.closest('label')?.childNodes?.[0];
      if (first && first.nodeType === Node.TEXT_NODE && first.textContent.trim() !== label) first.textContent = `${label} `;
    };
    relabel('jobName', 'Nome della ricerca');
    relabel('miningMode', 'Strategia di ricerca');
    relabel('noveltyBaseline', 'Riferimento temporale');
    relabel('baselineAt', 'Data di riferimento');
    relabel('resultLimit', 'Risultati per esecuzione');
    const mining = jobForm.elements.miningMode;
    const baseline = jobForm.elements.noveltyBaseline;
    if (mining) {
      const labels = { novelty: 'Novità dal riferimento', coverage: 'Copertura del perimetro', watchlist: 'Fonti prioritarie' };
      for (const option of mining.options) text(option, labels[option.value] || option.textContent);
    }
    if (baseline) {
      const labels = { 'last-run': 'Ultima esecuzione', activation: 'Attivazione della ricerca', 'fixed-date': 'Data specifica' };
      for (const option of baseline.options) text(option, labels[option.value] || option.textContent);
    }
    text(jobForm.querySelector('button[type="submit"]'), jobForm.dataset.missionId ? 'Aggiorna e rigenera il piano' : 'Genera piano di ricerca');
  }
  for (const dialog of $$('dialog')) dialog.classList.add('enterprise2-dialog');
}

let scheduled = false;
function applyEnterprise2() {
  if (!state.data?.actor || scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    normalizeShell();
    normalizeHome();
    normalizeMonitoring();
    normalizeEvents();
    normalizeProof();
    normalizeDialogs();
    enhanceAdmin();
    document.documentElement.dataset.ictcCandidate = '2.0.0-enterprise';
  });
}

export function installEnterprise2Candidate() {
  document.addEventListener('ictc:rendered', applyEnterprise2);
  document.addEventListener('ictc:surface-changed', applyEnterprise2);
  document.addEventListener('click', event => {
    if (event.target.closest('#openAdminCenter, #openProofDetails, [data-proof-service], #openJobConfig, [data-edit-job-profile]')) {
      setTimeout(applyEnterprise2, 0);
      setTimeout(applyEnterprise2, 250);
    }
  }, true);
  if (state.data?.actor) applyEnterprise2();
}
