import { $, $$, api, closeDialog, esc, notify, openDialog, showReceipt, splitList, state } from './common.js';
import { refresh } from './controller.js';

const roleLabels = { admin: 'Amministratore', user: 'Utente', auditor: 'Auditor' };
const laneCopy = {
  admin: {
    monitoring: ['Ricerca normativa', 'Configura job, approva piani e verifica le fonti candidate.', 'Apri ricerca normativa'],
    incidents: ['Eventi e incidenti', 'Governa chiarimenti, formulazioni, invii e chiusure.', 'Apri eventi e incidenti']
  },
  user: {
    monitoring: ['Ricerca normativa', 'Contribuisci materiale originale senza classificarlo come fonte.', 'Contribuisci alla ricerca'],
    incidents: ['Eventi e incidenti', 'Registra fatti e materiali senza formulare conclusioni premature.', 'Registra o segui un evento']
  },
  auditor: {
    monitoring: ['Ricerca normativa', 'Ricostruisci job, esecuzioni, fonti e decisioni in sola lettura.', 'Consulta la ricerca'],
    incidents: ['Eventi e incidenti', 'Segui originale, versioni, decisioni ed evidenze in sola lettura.', 'Consulta i fascicoli']
  }
};

function capability(name) {
  return Array.isArray(state.data?.capabilities) && state.data.capabilities.includes(name);
}
function text(selector) { return $(selector)?.textContent?.trim() || ''; }
function list(selector, values) {
  const node = $(selector);
  if (node) node.innerHTML = (values || []).map(value => `<li>${esc(value)}</li>`).join('');
}
function role() { return state.data?.actor?.role || state.role || 'user'; }

function captureHome() {
  const primary = $('#homePrimaryAction');
  return {
    nextTitle: text('#homeNextTitle') || 'Controlla la prossima attività',
    summary: text('#homeSummary'),
    reason: text('#homeReason'),
    whyMe: text('#homeWhyMe'),
    how: text('#homeHow'),
    outcome: text('#homeOutcome'),
    ai: text('#homeAiNote'),
    human: text('#homeHumanGate'),
    evidence: text('#homeEvidence'),
    action: primary?.dataset.homeAction || 'home',
    actionLabel: primary?.textContent?.trim() || 'Apri priorità'
  };
}

function ensureHome() {
  const root = $('#homeView');
  if (!root || root.dataset.enterprise18 === 'true') return;
  const captured = captureHome();
  root.dataset.enterprise18 = 'true';
  root.innerHTML = `
    <section class="workbench-home" aria-labelledby="workbenchHomeTitle">
      <header class="workbench-home-head">
        <div><p id="homeRole" class="eyebrow">Ruolo</p><h1 id="workbenchHomeTitle">Scegli dove lavorare</h1><p id="homeSummary"></p></div>
        <p class="workbench-home-rule">Due processi distinti. La priorità suggerita non nasconde l'altra area.</p>
      </header>
      <div class="process-lanes" aria-label="Processi ICTC">
        <article class="process-lane" data-lane="monitoring">
          <p class="eyebrow">Processo 1</p><h2 id="homeMonitoringTitle"></h2><p id="homeMonitoringCopy"></p>
          <div class="lane-status" id="homeMonitoringStatus"></div>
          <button class="secondary" type="button" data-service="monitoring" id="homeMonitoringAction"></button>
        </article>
        <article class="process-lane" data-lane="incidents">
          <p class="eyebrow">Processo 2</p><h2 id="homeIncidentTitle"></h2><p id="homeIncidentCopy"></p>
          <div class="lane-status" id="homeIncidentStatus"></div>
          <button class="secondary" type="button" data-service="incidents" id="homeIncidentAction"></button>
        </article>
      </div>
      <aside class="home-recommendation" aria-labelledby="homeNextTitle">
        <div><p class="eyebrow">Priorità suggerita</p><h2 id="homeNextTitle"></h2><p id="homeReason"></p></div>
        <button id="homePrimaryAction" class="primary" type="button"></button>
      </aside>
      <details class="home-context-18 trust-brief">
        <summary>Perché, metodo, AI, responsabilità ed evidenze</summary>
        <div class="home-context-grid">
          <section><h3>Perché tu</h3><p id="homeWhyMe"></p></section>
          <section><h3>Come</h3><p id="homeHow"></p></section>
          <section><h3>Effetto atteso</h3><p id="homeOutcome"></p></section>
          <section><h3>AI</h3><p id="homeAiNote"></p></section>
          <section><h3>Checkpoint umano</h3><p id="homeHumanGate"></p></section>
          <section><h3>Evidenza</h3><p id="homeEvidence"></p></section>
        </div>
        <ol id="homeJourney" class="journey-strip" aria-label="Metodo operativo"></ol>
        <div id="homeMetrics" class="home-metrics"></div>
        <details id="homeAuthority" class="authority-brief">
          <summary><span>Accesso e responsabilità</span><b id="homeAuthorityMode"></b></summary>
          <div class="authority-grid">
            <section><h3>Identità attiva</h3><p id="homeAuthorityIdentity"></p></section>
            <section><h3>Puoi</h3><ul id="homeAuthorityCan"></ul></section>
            <section><h3>Non puoi</h3><ul id="homeAuthorityCannot"></ul></section>
            <section><h3>Effetti</h3><ul id="homeAuthorityEffects"></ul></section>
            <section><h3>Tracce disponibili</h3><ul id="homeAuthorityEvidence"></ul></section>
          </div>
        </details>
      </details>
    </section>`;
  $('#homeNextTitle').textContent = captured.nextTitle;
  $('#homeSummary').textContent = captured.summary;
  $('#homeReason').textContent = captured.reason;
  $('#homeWhyMe').textContent = captured.whyMe;
  $('#homeHow').textContent = captured.how;
  $('#homeOutcome').textContent = captured.outcome;
  $('#homeAiNote').textContent = captured.ai;
  $('#homeHumanGate').textContent = captured.human;
  $('#homeEvidence').textContent = captured.evidence;
  const primary = $('#homePrimaryAction');
  primary.textContent = captured.actionLabel;
  primary.dataset.homeAction = captured.action;
}

function renderHome18() {
  ensureHome();
  const actorRole = role();
  const copy = laneCopy[actorRole] || laneCopy.user;
  const missions = state.data?.missions || [];
  const catalog = state.data?.catalog || [];
  const incidents = state.data?.incidents || [];
  const active = missions.filter(item => item.state === 'active').length;
  const candidates = catalog.filter(item => item.state === 'candidate').length;
  const openIncidents = incidents.filter(item => !['submitted', 'closed'].includes(item.state)).length;
  $('#homeRole').textContent = roleLabels[actorRole] || actorRole;
  $('#homeSummary').textContent = actorRole === 'admin'
    ? 'Governa due processi: ricerca normativa ed eventi. Ogni azione che cambia stato resta umana e tracciata.'
    : actorRole === 'auditor'
      ? 'Consulta i due processi in sola lettura e ricostruisci origine, decisioni, effetti e limiti.'
      : 'Scegli fra contribuire alla ricerca normativa e registrare o completare un evento.';
  $('#homeMonitoringTitle').textContent = copy.monitoring[0];
  $('#homeMonitoringCopy').textContent = copy.monitoring[1];
  $('#homeMonitoringAction').textContent = copy.monitoring[2];
  $('#homeIncidentTitle').textContent = copy.incidents[0];
  $('#homeIncidentCopy').textContent = copy.incidents[1];
  $('#homeIncidentAction').textContent = copy.incidents[2];
  $('#homeMonitoringStatus').innerHTML = `<b>${active}</b><span>job attivi</span><b>${candidates}</b><span>fonti da verificare</span>`;
  $('#homeIncidentStatus').innerHTML = `<b>${openIncidents}</b><span>fascicoli aperti</span><b>${incidents.length}</b><span>totali</span>`;
  const profile = state.data?.accessProfile;
  if (profile) {
    $('#homeAuthorityMode').textContent = profile.modeLabel || profile.mode;
    $('#homeAuthorityIdentity').textContent = `${profile.actorId} · ${profile.label} · autorità emessa dal server`;
    list('#homeAuthorityCan', profile.can);
    list('#homeAuthorityCannot', profile.cannot);
    list('#homeAuthorityEffects', profile.effects);
    list('#homeAuthorityEvidence', profile.evidence);
  }
  if (actorRole === 'auditor') $('#homeAuthority').open = true;
}

function appendJobFields(form) {
  if (form.querySelector('[data-job-profile-fields]')) return;
  const objective = form.elements.objective?.closest('label');
  objective?.insertAdjacentHTML('beforebegin', `
    <div data-job-profile-fields class="job-profile-fields">
      <label>Nome del job<input name="jobName" maxlength="500" placeholder="Es. Novelty NIS2 e DORA" required></label>
      <div class="job-field-grid">
        <label>Modalità di ricerca<select name="miningMode"><option value="novelty">Novelty rispetto alla baseline</option><option value="coverage">Copertura del perimetro</option><option value="watchlist">Watchlist di autorità e fonti</option></select></label>
        <label>Baseline<select name="noveltyBaseline"><option value="last-run">Ultima esecuzione</option><option value="activation">Attivazione del job</option><option value="fixed-date">Data fissa</option></select></label>
      </div>
      <label data-baseline-date hidden>Data della baseline<input name="baselineAt" type="datetime-local"></label>
      <label>Giurisdizioni<input name="jurisdictions" placeholder="Italia, Unione europea"></label>
      <label>Autorità prioritarie<input name="authorities" placeholder="EUR-Lex, ACN, Garante"></label>
      <fieldset class="change-types"><legend>Tipi di cambiamento</legend>
        <label><input type="checkbox" name="changeTypes" value="new-law" checked> Nuovo atto</label>
        <label><input type="checkbox" name="changeTypes" value="amendment" checked> Modifica</label>
        <label><input type="checkbox" name="changeTypes" value="repeal" checked> Abrogazione</label>
        <label><input type="checkbox" name="changeTypes" value="guidance" checked> Linea guida</label>
        <label><input type="checkbox" name="changeTypes" value="case-law"> Giurisprudenza</label>
        <label><input type="checkbox" name="changeTypes" value="effective-date" checked> Entrata in vigore</label>
      </fieldset>
      <label>Limite candidati per esecuzione<input name="resultLimit" type="number" min="1" max="200" value="50"></label>
      <p class="microcopy">Il job usa l'AI per proporre query e candidati. La baseline limita il confronto; non dimostra completezza, vigenza o applicabilità.</p>
    </div>`);
  form.elements.noveltyBaseline.addEventListener('change', () => {
    const fixed = form.elements.noveltyBaseline.value === 'fixed-date';
    form.querySelector('[data-baseline-date]').hidden = !fixed;
    form.elements.baselineAt.required = fixed;
  });
  form.querySelector('button[type="submit"]').textContent = 'Genera piano del job';
}

function ensureJobDialog() {
  if ($('#jobDialog')) return;
  const form = $('#missionForm');
  if (!form) return;
  appendJobFields(form);
  const dialog = document.createElement('dialog');
  dialog.id = 'jobDialog';
  dialog.className = 'job-dialog';
  dialog.innerHTML = `<div class="dialog-head"><div><p class="eyebrow">Ricerca normativa</p><h2 id="jobDialogTitle">Configura un job di ricerca</h2><p>Definisci perimetro, baseline e tipi di cambiamento. ICTC genera un piano AI da approvare.</p></div><button type="button" data-workbench-close="jobDialog" aria-label="Chiudi configurazione job">×</button></div><div class="dialog-body job-dialog-body"></div>`;
  document.body.append(dialog);
  dialog.querySelector('.job-dialog-body').append(form);
  form.classList.remove('focus-card');
}

function jobPayload(form) {
  const data = new FormData(form);
  return {
    jobName: data.get('jobName'),
    objective: data.get('objective'),
    cadenceHours: data.get('cadence'),
    sourceHints: splitList(data.get('sourceHints')),
    promptOverride: data.get('promptOverride'),
    miningMode: data.get('miningMode'),
    noveltyBaseline: data.get('noveltyBaseline'),
    baselineAt: data.get('baselineAt') || null,
    jurisdictions: splitList(data.get('jurisdictions')),
    authorities: splitList(data.get('authorities')),
    changeTypes: data.getAll('changeTypes'),
    resultLimit: Number(data.get('resultLimit') || 50)
  };
}

function clearJobForm(form) {
  form.reset();
  form.dataset.missionId = '';
  form.elements.miningMode.value = 'novelty';
  form.elements.noveltyBaseline.value = 'last-run';
  form.elements.resultLimit.value = '50';
  form.querySelector('[data-baseline-date]').hidden = true;
  form.querySelector('button[type="submit"]').textContent = 'Genera piano del job';
  $('#jobDialogTitle').textContent = 'Configura un job di ricerca';
}

function fillJobForm(mission) {
  const form = $('#missionForm');
  form.dataset.missionId = mission.id;
  form.elements.jobName.value = mission.jobName || mission.objective || '';
  form.elements.objective.value = mission.objective || '';
  form.elements.cadence.value = String(mission.cadenceHours || 168);
  form.elements.sourceHints.value = (mission.sourceHints || []).join(', ');
  form.elements.promptOverride.value = mission.promptOverride || '';
  form.elements.miningMode.value = mission.miningMode || 'novelty';
  form.elements.noveltyBaseline.value = mission.noveltyBaseline || 'last-run';
  form.elements.baselineAt.value = mission.baselineAt ? new Date(mission.baselineAt).toISOString().slice(0, 16) : '';
  form.elements.jurisdictions.value = (mission.jurisdictions || []).join(', ');
  form.elements.authorities.value = (mission.authorities || []).join(', ');
  form.elements.resultLimit.value = String(mission.resultLimit || 50);
  for (const input of form.querySelectorAll('[name="changeTypes"]')) input.checked = (mission.changeTypes || []).includes(input.value);
  form.querySelector('[data-baseline-date]').hidden = form.elements.noveltyBaseline.value !== 'fixed-date';
  form.querySelector('button[type="submit"]').textContent = 'Aggiorna e rigenera piano';
  $('#jobDialogTitle').textContent = mission.jobName || 'Modifica profilo job';
}

function ensureMonitoring() {
  const root = $('#monitoringView');
  if (!root || root.dataset.enterprise18 === 'true') return;
  root.dataset.enterprise18 = 'true';
  ensureJobDialog();
  const hero = root.querySelector('.hero');
  if (hero) hero.innerHTML = `
    <div class="core-title"><p class="eyebrow">Ricerca normativa</p><h1>Job di ricerca e novelty</h1><p id="monitoringRoleDescription"></p></div>
    <div class="core-actions"><button id="openJobConfig" class="primary admin-only" type="button">Configura job</button><button id="monitoringContributionAction" class="primary" type="button">Contribuisci materiale</button><button id="monitoringContext" class="secondary" type="button">Metodo e confini</button></div>`;
  $('#userMonitoringIntro')?.setAttribute('hidden', '');
  const missionHeading = root.querySelector('#missionsList')?.closest('.section-block')?.querySelector('h2');
  if (missionHeading) missionHeading.textContent = 'Job configurati';
  const catalogSection = $('#catalogList')?.closest('.section-block');
  const catalogHeading = catalogSection?.querySelector('h2');
  if (catalogHeading) catalogHeading.textContent = 'Fonti candidate';
  const contributionList = $('#contributionList');
  if (catalogSection && contributionList) {
    const recent = document.createElement('details');
    recent.id = 'materialRecent18';
    recent.className = 'material-recent-18';
    recent.innerHTML = '<summary>Materiali registrati di recente</summary><div class="material-recent-body"></div>';
    recent.querySelector('.material-recent-body').append(contributionList);
    catalogSection.insertAdjacentElement('beforebegin', recent);
  }
  const legacyCard = root.querySelector('.contribute-card');
  if (legacyCard) legacyCard.hidden = true;
}

function renderMonitoring18() {
  ensureMonitoring();
  const actorRole = role();
  const description = $('#monitoringRoleDescription');
  if (description) description.textContent = actorRole === 'admin'
    ? 'Configura job governati, approva il piano AI, esegui il mining e verifica le fonti candidate.'
    : actorRole === 'auditor'
      ? 'Consulta job, esecuzioni, fonti e decisioni in sola lettura.'
      : 'Consulta gli esiti e contribuisci materiale originale. Configurazione e verifica restano amministrative.';
  $('#openJobConfig').hidden = !capability('manage-monitoring');
  $('#monitoringContributionAction').hidden = !capability('contribute-source');
  for (const card of $$('.mission-card')) {
    const missionId = card.querySelector('[data-open-plan]')?.dataset.openPlan;
    if (!missionId || card.querySelector('[data-edit-job-profile]') || !capability('manage-monitoring')) continue;
    const actionRow = card.querySelector('.card-actions');
    actionRow?.insertAdjacentHTML('afterbegin', `<button class="secondary" type="button" data-edit-job-profile="${esc(missionId)}">Configura job</button>`);
    const mission = state.data.missions.find(item => item.id === missionId);
    const meta = card.querySelector('.card-meta');
    if (mission && meta) meta.insertAdjacentHTML('beforeend', `<span>${esc(mission.miningMode || 'novelty')} · ${esc(mission.noveltyBaseline || 'last-run')}</span>`);
  }
}

function ensureContributionModes() {
  const form = $('#contributionForm');
  if (!form || form.dataset.enterprise18 === 'true') return;
  form.dataset.enterprise18 = 'true';
  form.insertAdjacentHTML('afterbegin', `
    <fieldset class="intake-mode"><legend>Cosa stai registrando?</legend>
      <label><input type="radio" name="intakeMode" value="link" checked> Link</label>
      <label><input type="radio" name="intakeMode" value="text"> Testo o nota</label>
      <label><input type="radio" name="intakeMode" value="document"> Documento</label>
    </fieldset>
    <p class="microcopy">ICTC conserva l'originale. L'eventuale arricchimento AI resta separato e non rende il materiale una fonte verificata.</p>`);
  const link = form.elements.links?.closest('label');
  const content = form.elements.text?.closest('label');
  const files = form.elements.files?.closest('label');
  link?.setAttribute('data-intake-group', 'link');
  content?.setAttribute('data-intake-group', 'text');
  files?.setAttribute('data-intake-group', 'document');
  const sync = () => {
    const selected = form.elements.intakeMode.value;
    for (const group of form.querySelectorAll('[data-intake-group]')) group.hidden = group.dataset.intakeGroup !== selected;
  };
  form.addEventListener('change', event => { if (event.target.name === 'intakeMode') sync(); });
  sync();
  const title = $('#contributionDialogTitle');
  if (title) title.textContent = 'Registra materiale originale';
}

function ensureEvents() {
  const root = $('#incidentsView');
  if (!root || root.dataset.enterprise18 === 'true') return;
  root.dataset.enterprise18 = 'true';
  const action = $('#openIncident');
  const hero = root.querySelector('.hero');
  if (hero) {
    hero.innerHTML = `<div class="core-title"><p class="eyebrow">Eventi e incidenti</p><h1>Registra e completa i fascicoli</h1><p id="eventsRoleDescription"></p></div><div class="core-actions" id="eventsActions"><button id="eventsContext" class="secondary" type="button">Metodo e confini</button></div>`;
    if (action) $('#eventsActions').prepend(action);
  }
  const heading = root.querySelector('.section-head h2');
  if (heading) heading.textContent = 'Fascicoli';
}

function renderEvents18() {
  ensureEvents();
  const actorRole = role();
  $('#eventsRoleDescription').textContent = actorRole === 'auditor'
    ? 'Consulta originale, chiarimenti, versioni e decisioni senza modificare il fascicolo.'
    : actorRole === 'admin'
      ? 'Registra o governa i fascicoli aperti. L’AI prepara analisi e bozze, mai la decisione finale.'
      : 'Registra i fatti disponibili e completa le informazioni richieste senza classificazioni premature.';
  $('#openIncident').hidden = !capability('report-incident');
  if ($('#openIncident')) $('#openIncident').textContent = 'Registra un evento';
  for (const card of $$('.incident-card')) {
    const evidence = card.querySelector('[data-download-evidence]');
    if (evidence) { evidence.textContent = 'Scarica evidenze'; evidence.setAttribute('aria-label', 'Scarica evidenze del fascicolo'); }
    const open = card.querySelector('[data-open-incident]');
    if (open) { open.textContent = 'Apri fascicolo'; open.setAttribute('aria-label', 'Apri fascicolo evento'); }
  }
}

function ensureSettings() {
  const form = $('#settingsForm');
  if (!form || form.dataset.enterprise18 === 'true') return;
  form.dataset.enterprise18 = 'true';
  $('#settingsTitle').textContent = 'Connessione e policy del provider';
  const meta = $('#settingsDialog .dialog-head p:not(.eyebrow)');
  if (meta) meta.textContent = 'Configura il provider globale. Baseline, autorità e tipi di cambiamento appartengono ai singoli job di ricerca.';
  const groups = [...form.children].filter(node => node.tagName === 'DIV').slice(0, 2);
  const names = [
    ['Organizzazione e perimetro', 'Contesto usato dai processi ICTC.'],
    ['Connessione al provider AI', 'Endpoint, modello, chiave e temperatura globali.']
  ];
  groups.forEach((group, index) => {
    const details = document.createElement('details');
    details.className = 'settings-section-18';
    details.open = index === 1;
    details.innerHTML = `<summary><span><b>${names[index][0]}</b><small>${names[index][1]}</small></span></summary><div class="settings-section-body"></div>`;
    group.before(details);
    details.querySelector('.settings-section-body').append(group);
  });
  const prompts = [...form.querySelectorAll(':scope > details')].find(node => !node.classList.contains('settings-section-18'));
  if (prompts) {
    prompts.classList.add('settings-section-18');
    const summary = prompts.querySelector('summary');
    if (summary) summary.textContent = 'Policy globali e prompt tecnici';
  }
  form.insertAdjacentHTML('beforeend', '<p class="settings-job-boundary">La configurazione del singolo job — modalità, baseline, giurisdizioni, autorità e change types — si gestisce in Ricerca normativa.</p>');
}

function ensureContextDialog() {
  if ($('#workbenchContext18')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="workbenchContext18" class="workbench-context-dialog">
      <div class="dialog-head"><div><p class="eyebrow">Metodo e confini</p><h2 id="workbenchContextTitle">Contesto</h2><p id="workbenchContextIntro"></p></div><button type="button" data-workbench-close="workbenchContext18" aria-label="Chiudi contesto">×</button></div>
      <div id="workbenchContextBody" class="dialog-body context-matrix"></div>
    </dialog>`);
}

function openContext(kind) {
  ensureContextDialog();
  const monitoring = kind === 'monitoring';
  $('#workbenchContextTitle').textContent = monitoring ? 'Come funziona la ricerca normativa' : 'Come viene trattato un evento';
  $('#workbenchContextIntro').textContent = monitoring
    ? 'Job, piano AI, esecuzione e decisione sulle fonti sono passaggi distinti.'
    : 'Originale, analisi AI, chiarimenti e formulazione restano oggetti distinti.';
  $('#workbenchContextBody').innerHTML = monitoring
    ? '<section><h3>1 · Configura</h3><p>Definisci obiettivo, baseline, giurisdizioni, autorità, cambiamenti e frequenza.</p></section><section><h3>2 · Approva</h3><p>L’AI propone query e criteri; una persona corregge e attiva il piano.</p></section><section><h3>3 · Esegui</h3><p>Il runtime confronta i candidati con identificativi e baseline disponibili.</p></section><section><h3>4 · Decidi</h3><p>Trovato non significa applicabile. Verifica ed esclusione richiedono motivazione umana.</p></section>'
    : '<section><h3>1 · Preserva</h3><p>Il racconto originale e gli allegati non vengono riscritti.</p></section><section><h3>2 · Analizza</h3><p>L’AI estrae fatti, ipotesi e lacune in sezioni separate.</p></section><section><h3>3 · Completa</h3><p>La persona risponde o registra che un dato non è disponibile.</p></section><section><h3>4 · Conferma</h3><p>Versione, invio e chiusura restano checkpoint umani tracciati.</p></section>';
  openDialog('workbenchContext18');
}

async function submitJob(event) {
  const form = event.currentTarget;
  event.preventDefault();
  event.stopImmediatePropagation();
  const missionId = form.dataset.missionId;
  try {
    const body = await api(missionId ? `/api/monitoring-jobs/${missionId}/profile` : '/api/monitoring-jobs/draft', {
      method: missionId ? 'PUT' : 'POST', body: JSON.stringify(jobPayload(form))
    });
    showReceipt(body);
    notify(missionId ? 'Profilo job aggiornato e piano rigenerato' : 'Job registrato; piano AI disponibile per la verifica');
    closeDialog('jobDialog');
    clearJobForm(form);
    await refresh({ keepDialog: false });
  } catch (error) { notify(error.message, true); }
}

function bind() {
  const form = $('#missionForm');
  if (form && form.dataset.enterprise18Bound !== 'true') {
    form.dataset.enterprise18Bound = 'true';
    form.addEventListener('submit', submitJob, true);
  }
  document.addEventListener('click', event => {
    const close = event.target.closest('[data-workbench-close]');
    if (close) { closeDialog(close.dataset.workbenchClose); return; }
    if (event.target.closest('#openJobConfig')) { clearJobForm($('#missionForm')); openDialog('jobDialog'); return; }
    if (event.target.closest('#monitoringContributionAction')) { openDialog('contributionDialog'); return; }
    if (event.target.closest('#monitoringContext')) { openContext('monitoring'); return; }
    if (event.target.closest('#eventsContext')) { openContext('events'); return; }
    const edit = event.target.closest('[data-edit-job-profile]');
    if (edit) {
      const mission = state.data.missions.find(item => item.id === edit.dataset.editJobProfile);
      if (mission) { fillJobForm(mission); openDialog('jobDialog'); }
    }
  });
}

function normalizeLabels() {
  const nav = { home: 'Panoramica', monitoring: 'Ricerca normativa', incidents: 'Eventi e incidenti' };
  for (const [surface, label] of Object.entries(nav)) {
    const button = $(`[data-service="${surface}"]`);
    if (button) button.textContent = label;
  }
  const proof = $('[data-proof-service]');
  if (proof) proof.textContent = 'Guida e prove';
  const brand = $('.brand small');
  if (brand) brand.textContent = 'Ricerca normativa, eventi ed evidenze';
  document.title = 'ICTC 1.8 · Enterprise Workbench';
}

function render18() {
  if (!state.data?.actor) return;
  normalizeLabels();
  renderHome18();
  renderMonitoring18();
  ensureContributionModes();
  renderEvents18();
  ensureSettings();
  ensureContextDialog();
  bind();
  document.documentElement.dataset.ictcRelease = '1.8.0';
}

export function installEnterpriseWorkbench18() {
  document.addEventListener('ictc:rendered', render18);
  if (state.data?.actor) render18();
}
