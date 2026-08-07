import { $, $$, state } from './common.js';

const PROCESS_LABELS = Object.freeze({
  monitoring: Object.freeze({ code: 'RN-01', name: 'Monitoraggio normativo' }),
  incidents: Object.freeze({ code: 'EC-01', name: 'Gestione eventi e segnalazioni' }),
  evidence: Object.freeze({ code: 'EV-01', name: 'Evidenze e controlli' }),
  identity: Object.freeze({ code: 'IA-01', name: 'Identità e accessi' }),
  ai: Object.freeze({ code: 'GA-01', name: 'Governo dei servizi AI' })
});

const ROLE_COPY = Object.freeze({
  admin: Object.freeze({
    homeTitle: 'Governa attività e controlli',
    homeLead: 'Controlla le attività operative, intervieni sulle eccezioni e conserva un’evidenza per ogni decisione.',
    monitoringLead: 'Configura le ricerche, approva i piani, avvia le esecuzioni e valuta le fonti proposte.',
    eventsLead: 'Registra o governa gli eventi aperti. Analisi e bozze assistono il lavoro; le decisioni restano umane.',
    monitoringLane: 'Configura ricerche, approva piani e valuta le fonti.',
    eventLane: 'Governa chiarimenti, versioni, invii e chiusure.'
  }),
  user: Object.freeze({
    homeTitle: 'Continua le attività',
    homeLead: 'Scegli un’attività, registra ciò che sai e segui lo stato senza formulare conclusioni premature.',
    monitoringLead: 'Consulta le ricerche disponibili e registra materiale originale da sottoporre a valutazione.',
    eventsLead: 'Registra un evento o continua una segnalazione aperta partendo dai fatti disponibili.',
    monitoringLane: 'Consulta gli esiti e registra materiale originale.',
    eventLane: 'Registra un evento o continua una segnalazione.'
  }),
  auditor: Object.freeze({
    homeTitle: 'Consulta attività ed evidenze',
    homeLead: 'Ricostruisci origine, versioni, decisioni ed effetti senza modificare i dati.',
    monitoringLead: 'Consulta ricerche, esecuzioni, fonti, decisioni ed evidenze in sola lettura.',
    eventsLead: 'Consulta eventi, versioni, decisioni ed evidenze in sola lettura.',
    monitoringLane: 'Consulta ricerche, esecuzioni, fonti e decisioni.',
    eventLane: 'Consulta originali, versioni, decisioni ed evidenze.'
  })
});

const EXACT_REPLACEMENTS = Object.freeze({
  'Guida e prove': 'Evidenze e controlli',
  'Guida e prova': 'Evidenze e controlli',
  'Guida operativa e prove': 'Evidenze, controlli e limiti',
  'Apri dettagli': 'Apri dettagli tecnici',
  'Tre risposte essenziali': 'Sintesi essenziale',
  'Enterprise clarity': 'Sintesi applicativa',
  'Postura e confini': 'Stato e limiti',
  'Release attiva': 'Versione applicativa',
  'Controlli runtime': 'Controlli applicativi',
  'Gap deployment': 'Requisiti esterni aperti',
  'Catena evidenze': 'Integrità delle evidenze',
  'Stato dei controlli': 'Controlli applicativi',
  'Azioni richieste': 'Azioni necessarie',
  'Governance AI': 'Governo AI',
  'Controlli verificati': 'Controlli con evidenza',
  'Verificato': 'Con evidenza',
  'Bloccante': 'Da completare',
  'Pronto': 'Controlli completi',
  'Bloccato': 'Azioni necessarie',
  'Esito': 'Stato dei controlli applicativi',
  'Verificate': 'Accettate nel catalogo',
  'Verificata': 'Accettata nel catalogo',
  'Esclusa': 'Esclusa dal catalogo',
  'Da verificare': 'Da valutare',
  'Verifica fonte': 'Accetta nel catalogo',
  'Escludi': 'Escludi dal catalogo',
  'Stato umano': 'Esito della valutazione',
  'Confidenza AI': 'Punteggio indicativo del modello',
  'Traccia AI': 'Traccia del modello',
  'Suggerimento AI da verificare': 'Proposta del modello da valutare',
  'Riprova AI': 'Riprova analisi',
  'Scarica prova': 'Scarica evidenza',
  'Scarica evidenze': 'Scarica evidenza',
  'Metodo e confini': 'Metodo e limiti',
  'Policy globali e prompt tecnici': 'Istruzioni globali',
  'Connessione e policy del provider': 'Provider AI e istruzioni globali',
  'Identità LDAP / Shibboleth': 'Accesso federato',
  'Utenti locali e legacy': 'Identità locali',
  'Aggiungi utente': 'Aggiungi identità',
  'Directory e ciclo di vita degli accessi': 'Identità locali e stato degli accessi'
});

const STANDARD_SUMMARIES = Object.freeze({
  'WCAG 2.2': 'Interazione operabile e comprensibile, con focus visibile, reflow e controlli di dimensione adeguata.',
  'WAI-ARIA APG': 'Semantica nativa e comportamento prevedibile per navigazione, dialoghi e disclosure.',
  'EN 301 549': 'Requisiti di accessibilità da verificare nel perimetro e nell’ambiente di esercizio applicabili.',
  'Directive (EU) 2019/882': 'Contesto normativo europeo sull’accessibilità; applicabilità e conformità richiedono valutazione esterna.',
  'ISO 9241-210:2019': 'Progettazione iterativa centrata su utenti, attività e contesto d’uso.',
  'ISO 37301:2021': 'Governance, proporzionalità, trasparenza e miglioramento continuo nei processi di conformità.',
  'NIST CSF 2.0': 'Governance e gestione del rischio organizzate per risultati osservabili.',
  'NIST SSDF 1.1': 'Pratiche di sviluppo sicuro integrate nel ciclo di rilascio e nelle evidenze del software.',
  'Regulation (EU) 2024/1689': 'Trasparenza, supervisione umana e tracciabilità nell’uso dei servizi AI.',
  'GOV.UK Design System and USWDS': 'Azioni chiare, componenti prevedibili e dettaglio secondario disponibile su richiesta.',
  'NASA HIDH and FAA HFDS': 'Etichette significative, salienza controllata e gestione del carico informativo.',
  'Site Reliability Engineering practices': 'Stato azionabile, recupero esplicito e separazione tra sintomo, causa e controllo.'
});

function role() {
  return state.data?.actor?.role || state.role || 'user';
}

function copy() {
  return ROLE_COPY[role()] || ROLE_COPY.user;
}

function setText(node, value) {
  if (node && value != null && node.textContent !== String(value)) node.textContent = String(value);
}

function replaceExactText(root = document) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) continue;
    const raw = node.textContent || '';
    const trimmed = raw.trim();
    const replacement = EXACT_REPLACEMENTS[trimmed];
    if (!replacement) continue;
    node.textContent = raw.replace(trimmed, replacement);
  }
}

function canonicalProcessLabel(key) {
  const process = PROCESS_LABELS[key];
  return `${process.code} · ${process.name}`;
}

function normalizeShell() {
  document.title = 'ICTC · Attività, evidenze e controlli';
  setText($('.brand small'), 'Attività, evidenze e controlli');
  setText($('.role-control span'), 'Ruolo');
  const nav = {
    home: 'Panoramica',
    monitoring: 'Monitoraggio normativo',
    incidents: 'Eventi e segnalazioni'
  };
  for (const [surface, label] of Object.entries(nav)) setText($(`[data-service="${surface}"]`), label);
  setText($('[data-proof-service]'), 'Evidenze e controlli');
}

function normalizeHome() {
  const root = $('#homeView');
  if (!root) return;
  const roleCopy = copy();
  setText($('#workbenchHomeTitle'), roleCopy.homeTitle);
  setText($('#homeSummary'), roleCopy.homeLead);
  setText($('.workbench-home-rule'), 'Apri un’area o riprendi l’attività prioritaria.');

  const monitoring = $('.process-lane[data-lane="monitoring"]');
  const incidents = $('.process-lane[data-lane="incidents"]');
  if (monitoring) {
    monitoring.dataset.processName = PROCESS_LABELS.monitoring.name;
    setText(monitoring.querySelector(':scope > .eyebrow'), canonicalProcessLabel('monitoring'));
    setText($('#homeMonitoringTitle'), PROCESS_LABELS.monitoring.name);
    setText($('#homeMonitoringCopy'), roleCopy.monitoringLane);
    setText($('#homeMonitoringAction'), 'Apri monitoraggio');
    monitoring.setAttribute('aria-label', `${canonicalProcessLabel('monitoring')}. ${roleCopy.monitoringLane}`);
  }
  if (incidents) {
    incidents.dataset.processName = PROCESS_LABELS.incidents.name;
    setText(incidents.querySelector(':scope > .eyebrow'), canonicalProcessLabel('incidents'));
    setText($('#homeIncidentTitle'), 'Eventi e segnalazioni');
    setText($('#homeIncidentCopy'), roleCopy.eventLane);
    setText($('#homeIncidentAction'), 'Apri eventi');
    incidents.setAttribute('aria-label', `${canonicalProcessLabel('incidents')}. ${roleCopy.eventLane}`);
  }

  setText($('.home-recommendation .eyebrow'), 'Attività prioritaria');
  const method = $('[data-home-disclosure="method"]');
  const proof = $('[data-home-disclosure="proof"]');
  setText(method?.querySelector('summary b'), 'Metodo operativo');
  setText(proof?.querySelector('summary b'), 'Evidenze e responsabilità');
  setText(method?.querySelector('summary small'), role() === 'auditor'
    ? 'Criteri di lettura e ricostruzione'
    : role() === 'admin'
      ? 'Passaggi, checkpoint e responsabilità'
      : 'Istruzioni per registrare fatti e contribuire');
  setText(proof?.querySelector('summary small'), role() === 'auditor'
    ? 'Origine, versioni, accesso e limiti'
    : 'Tracce disponibili, autorità e limiti');
  setText($('#homeAuthority summary span'), 'Accesso, autorità e limiti');
  root.dataset.editorialDensity = 'minimal-first';
}

function ensureRecordDisclosure(card, kind) {
  if (!card || card.querySelector(':scope > .editorial-record-details')) return;
  const meta = card.querySelector(':scope > .card-meta');
  const boundary = card.querySelector(':scope > .boundary');
  if (!meta && !boundary) return;
  const details = document.createElement('details');
  details.className = 'editorial-record-details';
  details.innerHTML = `<summary><span>Dettagli</span><small>${kind === 'mission' ? 'Frequenza, versione e prossima esecuzione' : 'Tipo, data e versioni'}</small></summary><div class="editorial-record-details-body"></div>`;
  const body = details.querySelector('.editorial-record-details-body');
  if (meta) body.append(meta);
  if (boundary) body.append(boundary);
  const actions = card.querySelector(':scope > .card-actions');
  if (actions) card.insertBefore(details, actions);
  else card.append(details);
}

function normalizeMonitoring() {
  const root = $('#monitoringView');
  if (!root) return;
  root.dataset.processName = PROCESS_LABELS.monitoring.name;
  root.dataset.editorialDensity = 'minimal-first';
  setText(root.querySelector('.core-title > .eyebrow'), canonicalProcessLabel('monitoring'));
  setText(root.querySelector('.core-title h1'), PROCESS_LABELS.monitoring.name);
  setText($('#monitoringRoleDescription'), copy().monitoringLead);
  setText($('#openJobConfig'), 'Nuova ricerca');
  setText($('#monitoringContributionAction'), 'Registra materiale');
  setText($('#monitoringContext'), 'Metodo e limiti');
  const heading = $('#missionsList')?.closest('.section-block')?.querySelector('h2');
  setText(heading, role() === 'admin' ? 'Ricerche configurate' : 'Ricerche disponibili');
  setText(heading?.closest('.section-head')?.querySelector('.eyebrow'), 'Ricerche');
  setText($('#materialRecent18 > summary'), 'Materiali recenti');
  setText($('#catalogList')?.closest('.section-block')?.querySelector('h2'), 'Fonti da valutare');
  const catalogState = $('#catalogState');
  if (catalogState) {
    const labels = { '': 'Tutti gli stati', candidate: 'Da valutare', verified: 'Accettate nel catalogo', rejected: 'Escluse dal catalogo' };
    for (const option of catalogState.options) setText(option, labels[option.value] || option.textContent);
  }
  for (const card of $$('.mission-card', root)) {
    card.dataset.editorialRecord = 'monitoring';
    ensureRecordDisclosure(card, 'mission');
    const evidence = card.querySelector('[data-download-evidence]');
    if (evidence) {
      setText(evidence, 'Scarica evidenza');
      evidence.setAttribute('aria-label', 'Scarica evidenza della ricerca');
    }
    const plan = card.querySelector('[data-open-plan]');
    if (plan) setText(plan, role() === 'admin' ? 'Rivedi piano' : 'Apri dettagli');
    setText(card.querySelector('[data-edit-job-profile]'), 'Configura ricerca');
  }
  const empty = $('#missionsList .empty');
  if (empty) setText(empty, role() === 'admin' ? 'Nessuna ricerca configurata. Crea la prima ricerca.' : 'Nessuna ricerca disponibile.');
}

function normalizeEvents() {
  const root = $('#incidentsView');
  if (!root) return;
  root.dataset.processName = PROCESS_LABELS.incidents.name;
  root.dataset.editorialDensity = 'minimal-first';
  setText(root.querySelector('.core-title > .eyebrow'), canonicalProcessLabel('incidents'));
  setText(root.querySelector('.core-title h1'), 'Eventi e segnalazioni');
  setText($('#eventsRoleDescription'), copy().eventsLead);
  setText($('#openIncident'), 'Registra evento');
  setText($('#eventsContext'), 'Metodo e limiti');
  const heading = root.querySelector('.section-head h2');
  setText(heading, 'Eventi registrati');
  setText(heading?.closest('.section-head')?.querySelector('.eyebrow'), 'Registro');
  setText(heading?.parentElement?.querySelector('p:not(.eyebrow)'), 'Apri un evento per consultare originale, informazioni mancanti, versioni, decisioni ed evidenze.');
  for (const card of $$('.incident-card', root)) {
    card.dataset.editorialRecord = 'event';
    ensureRecordDisclosure(card, 'incident');
    const evidence = card.querySelector('[data-download-evidence]');
    if (evidence) {
      setText(evidence, 'Scarica evidenza');
      evidence.setAttribute('aria-label', 'Scarica evidenza dell’evento');
    }
    const open = card.querySelector('[data-open-incident]');
    if (open) {
      setText(open, 'Apri evento');
      open.setAttribute('aria-label', 'Apri evento');
    }
  }
  const empty = $('#incidentList .empty');
  if (empty) setText(empty, $('#openIncident')?.hidden ? 'Nessun evento disponibile.' : 'Nessun evento registrato. Usa “Registra evento” per iniziare.');
}

function disclosureFromSection(section, title, description) {
  if (!section || section.matches('details') || section.dataset.editorialDisclosure === 'true') return;
  const details = document.createElement('details');
  details.className = `${section.className} editorial-secondary-disclosure`.trim();
  details.dataset.editorialDisclosure = 'true';
  details.innerHTML = `<summary><span><b>${title}</b><small>${description}</small></span></summary><div class="editorial-secondary-body"></div>`;
  const body = details.querySelector('.editorial-secondary-body');
  while (section.firstChild) body.append(section.firstChild);
  section.replaceWith(details);
}

function normalizeSourceDialog() {
  const dialog = $('#sourceDialog');
  if (!dialog) return;
  setText(dialog.querySelector('header .eyebrow'), 'Fonte osservata');
  setText($('#sourceMeta')?.previousElementSibling, $('#sourceMeta')?.previousElementSibling?.textContent);
  setText($('#sourceActions [data-download-evidence]'), 'Scarica evidenza');
  const body = $('#sourceBody');
  if (!body) return;
  for (const section of [...body.querySelectorAll(':scope > .lens-panel')]) {
    const label = section.querySelector('.eyebrow')?.textContent?.trim();
    if (label === 'Cronologia fonte') disclosureFromSection(section, 'Cronologia della fonte', 'Origine e osservazioni registrate');
    if (label === 'Decisioni registrate') disclosureFromSection(section, 'Decisioni registrate', 'Esiti, motivazioni, attori e date');
    if (label === 'Traccia del modello' || label === 'Traccia AI') disclosureFromSection(section, 'Traccia del modello', 'Modello e digest tecnici');
  }
  const facts = body.querySelector(':scope > .source-facts');
  if (facts) facts.setAttribute('aria-label', 'Dati sintetici della fonte');
  body.dataset.editorialDensity = 'minimal-first';
}

function normalizePlanDialog() {
  const dialog = $('#planDialog');
  if (!dialog) return;
  setText(dialog.querySelector('header .eyebrow'), 'Piano della ricerca');
  setText(dialog.querySelector('header p:not(.eyebrow)'), 'Controlla perimetro, criteri e limiti prima di approvare o modificare il piano.');
  const body = $('#planBody');
  if (!body) return;
  for (const section of [...body.querySelectorAll(':scope > .lens-panel')]) {
    const label = section.querySelector('.eyebrow')?.textContent?.trim();
    if (label === 'Traccia del modello' || label === 'Traccia AI') disclosureFromSection(section, 'Traccia del modello', 'Modello e digest tecnici');
  }
  body.dataset.editorialDensity = 'minimal-first';
}

function normalizeIncidentWorkspace() {
  const dialog = $('#incidentWorkspace');
  const body = $('#workspaceBody');
  if (!dialog || !body) return;
  setText(dialog.querySelector('header p:not(.eyebrow)'), 'Originale, analisi assistita, chiarimenti, versioni ed evidenze restano distinti.');
  for (const section of [...body.querySelectorAll('.lens-panel')]) {
    const label = section.querySelector(':scope > .eyebrow')?.textContent?.trim();
    if (label === 'Analisi AI') disclosureFromSection(section, 'Analisi assistita', 'Fatti estratti, ipotesi e limiti del modello');
    if (label === 'Conferme umane') disclosureFromSection(section, 'Conferme umane', 'Risposte, adozioni e attribuzione');
    if (label === 'Versioni') disclosureFromSection(section, 'Versioni', 'Cronologia e digest delle formulazioni');
    if (label === 'Cronologia') disclosureFromSection(section, 'Cronologia', 'Conoscenza organizzativa e aggiornamenti');
    if (label === 'Promemoria') disclosureFromSection(section, 'Promemoria', 'Scadenze indicative; nessuna determinazione automatica');
    if (label === 'Traccia del modello' || label === 'Traccia AI') disclosureFromSection(section, 'Traccia del modello', 'Modello e digest tecnici');
  }
  body.dataset.editorialDensity = 'minimal-first';
}

function normalizeDialogs() {
  const contribution = $('#contributionDialog');
  if (contribution) {
    setText(contribution.querySelector('header .eyebrow'), 'Materiale originale');
    setText(contribution.querySelector('header h2'), 'Registra materiale originale');
    setText(contribution.querySelector('header p:not(.eyebrow)'), 'L’originale viene conservato prima di qualsiasi analisi assistita.');
    setText(contribution.querySelector('button[type="submit"]'), 'Registra materiale');
  }
  const incident = $('#incidentDialog');
  if (incident) {
    setText(incident.querySelector('header .eyebrow'), 'Nuovo evento');
    setText(incident.querySelector('header h2'), 'Registra un evento');
    setText(incident.querySelector('header p:not(.eyebrow)'), 'Descrivi i fatti disponibili. La classificazione può essere completata in seguito.');
  }
  const job = $('#jobDialog');
  if (job) {
    setText(job.querySelector('.dialog-head .eyebrow'), PROCESS_LABELS.monitoring.name);
    setText($('#jobDialogTitle'), $('#missionForm')?.dataset.missionId ? 'Modifica la ricerca' : 'Configura una ricerca');
    setText(job.querySelector('.dialog-head p:not(.eyebrow)'), 'Definisci scopo, perimetro, riferimento temporale e cambiamenti da cercare. Il piano richiede approvazione umana.');
    const form = $('#missionForm');
    const relabel = (name, value) => {
      const first = form?.elements[name]?.closest('label')?.childNodes?.[0];
      if (first && first.nodeType === Node.TEXT_NODE) first.textContent = `${value} `;
    };
    relabel('jobName', 'Nome della ricerca');
    relabel('objective', 'Obiettivo');
    relabel('miningMode', 'Strategia');
    relabel('noveltyBaseline', 'Riferimento temporale');
    relabel('baselineAt', 'Data di riferimento');
    relabel('resultLimit', 'Risultati per esecuzione');
    setText(form?.querySelector('button[type="submit"]'), form?.dataset.missionId ? 'Aggiorna e rigenera il piano' : 'Genera piano');
    const microcopy = form?.querySelector('[data-job-profile-fields] .microcopy');
    setText(microcopy, 'La ricerca usa il modello per proporre query e candidati. Il riferimento temporale delimita il confronto; non dimostra completezza, vigenza o applicabilità.');
  }
  normalizePlanDialog();
  normalizeSourceDialog();
  normalizeIncidentWorkspace();
}

function normalizeProof() {
  const root = $('#proofView');
  if (!root) return;
  root.dataset.processName = PROCESS_LABELS.evidence.name;
  root.dataset.editorialDensity = 'minimal-first';
  setText(root.querySelector('.proof-hero .eyebrow'), canonicalProcessLabel('evidence'));
  setText($('#proofTitle'), 'Evidenze, controlli e limiti');
  setText($('#proofLead'), 'Consulta ciò che l’applicazione dimostra, ciò che richiede evidenze esterne e i limiti della valutazione.');
  setText($('#openProofDetails'), 'Apri dettagli tecnici');
  setText($('#proofStartTitle'), 'Sintesi essenziale');
  const labels = ['Versione applicativa', 'Ruolo e accesso', 'Controlli applicativi', 'Requisiti esterni', 'Integrità delle evidenze', 'Metodo di lettura'];
  $$('.proof-verdict span').forEach((node, index) => setText(node, labels[index] || node.textContent));
  for (const standard of $$('.proof-standard')) {
    if (standard.dataset.editorialBound !== 'true') {
      standard.dataset.editorialBound = 'true';
      standard.open = false;
      standard.addEventListener('toggle', event => {
        if (event.isTrusted) standard.dataset.userState = standard.open ? 'open' : 'closed';
      });
    }
    if (standard.dataset.userState !== 'open') standard.open = false;
    const name = standard.querySelector('summary b')?.textContent?.trim();
    const summary = STANDARD_SUMMARIES[name];
    const body = standard.querySelector('.proof-standard-body');
    if (summary && body) {
      let editorial = body.querySelector(':scope > .editorial-standard-summary');
      if (!editorial) {
        editorial = document.createElement('p');
        editorial.className = 'editorial-standard-summary';
        body.prepend(editorial);
      }
      setText(editorial, summary);
      for (const paragraph of body.querySelectorAll(':scope > p:not(.editorial-standard-summary)')) paragraph.hidden = true;
    }
  }
}

function normalizeAdmin() {
  const dialog = $('#adminCenter');
  if (!dialog) return;
  dialog.dataset.editorialDensity = 'minimal-first';
  setText($('#adminCenterTitle'), 'Amministrazione');
  setText(dialog.querySelector('.admin-head p:not(.eyebrow)'), 'Gestisci controlli applicativi, servizi AI, identità e accessi. Ogni modifica resta tracciata.');
  const labels = {
    '.admin-proof-panel': ['EV-01', 'Sintesi'],
    '[data-admin-section="stato-dei-controlli"]': ['EV-01', 'Controlli applicativi'],
    '[data-admin-section="azioni-richieste"]': ['EV-01', 'Azioni necessarie'],
    '[data-admin-section="utilizzo-ai"]': ['GA-01', 'Utilizzo AI'],
    '[data-admin-section="governance-ai"]': ['GA-01', 'Governo AI'],
    '[data-identity-admin]': ['IA-01', 'Accesso federato'],
    '[data-enterprise2-local-users]': ['IA-01', 'Identità locali']
  };
  for (const button of $$('.admin-section-nav [data-admin-target]', dialog)) {
    const config = labels[button.dataset.adminTarget];
    if (!config) continue;
    const value = `${config[0]} · ${config[1]}`;
    setText(button, value);
    button.setAttribute('aria-label', value);
  }
  setText($('#adminProofTitle'), 'Stato e limiti');
  setText($('#adminProofPanel .admin-proof-head p:not(.eyebrow)'), 'Sintesi dei controlli applicativi e dei requisiti esterni ancora aperti.');
  setText($('#openProofFromAdmin'), 'Apri evidenze e controlli');
  const governance = $('#governanceForm');
  if (governance) {
    const allowed = governance.elements.allowedModels?.closest('label')?.childNodes?.[0];
    if (allowed && allowed.nodeType === Node.TEXT_NODE) allowed.textContent = 'Modelli AI autorizzati, uno per riga ';
    setText(governance.querySelector('button[type="submit"]'), 'Salva impostazioni AI');
  }
  setText($('.local-user-disclosure summary b'), 'Aggiungi identità locale');
  setText($('#userForm button[type="submit"]'), 'Aggiungi identità');
}

function normalizeSettings() {
  const dialog = $('#settingsDialog');
  if (!dialog) return;
  setText($('#settingsTitle'), 'Provider AI e istruzioni globali');
  setText(dialog.querySelector('header p:not(.eyebrow)'), 'Configura il provider globale. Strategia, perimetro e riferimento temporale appartengono alle singole ricerche.');
  const policy = dialog.querySelector('[data-settings-section="policy"] summary b');
  setText(policy, 'Istruzioni globali');
  const boundary = dialog.querySelector('.settings-job-boundary');
  setText(boundary, 'Strategia, riferimento temporale, giurisdizioni, autorità e tipi di cambiamento si configurano nella singola ricerca.');
  setText(dialog.querySelector('button[type="submit"]'), 'Salva configurazione');
}

function normalizeContextDialog() {
  const dialog = $('#workbenchContext18');
  if (!dialog) return;
  const title = $('#workbenchContextTitle');
  if (title?.textContent.includes('ricerca normativa')) {
    setText(title, 'Metodo del monitoraggio normativo');
    setText($('#workbenchContextIntro'), 'Ricerca, piano assistito, esecuzione e valutazione delle fonti sono passaggi distinti.');
    const body = $('#workbenchContextBody');
    const sections = body ? [...body.querySelectorAll('section')] : [];
    const content = [
      ['1 · Configura', 'Definisci obiettivo, riferimento temporale, giurisdizioni, autorità, cambiamenti e frequenza.'],
      ['2 · Approva', 'Il modello propone query e criteri; una persona corregge e attiva il piano.'],
      ['3 · Esegui', 'L’applicazione confronta i candidati con gli identificativi e il riferimento disponibili.'],
      ['4 · Valuta', 'Trovato non significa applicabile. Accettazione ed esclusione richiedono una motivazione umana.']
    ];
    sections.forEach((section, index) => {
      setText(section.querySelector('h3'), content[index]?.[0]);
      setText(section.querySelector('p'), content[index]?.[1]);
    });
  } else if (title?.textContent.includes('evento')) {
    setText(title, 'Metodo di gestione dell’evento');
    setText($('#workbenchContextIntro'), 'Originale, analisi assistita, chiarimenti e formulazione restano oggetti distinti.');
  }
}

let scheduled = false;
function applyEditorialSystem() {
  if (!state.data?.actor || scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    normalizeShell();
    normalizeHome();
    normalizeMonitoring();
    normalizeEvents();
    normalizeProof();
    normalizeAdmin();
    normalizeSettings();
    normalizeDialogs();
    normalizeContextDialog();
    replaceExactText(document.body);
    document.documentElement.dataset.editorialSystem = 'professional-1';
    document.documentElement.dataset.informationDensity = 'minimal-progressive';
  });
}

export function installEnterprise2EditorialSystem() {
  document.addEventListener('ictc:rendered', applyEditorialSystem);
  document.addEventListener('ictc:surface-changed', applyEditorialSystem);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-service], [data-proof-service], #openAdminCenter, #openProofDetails, #openJobConfig, [data-edit-job-profile], [data-open-plan], [data-open-source], [data-open-incident], #monitoringContext, #eventsContext')) {
      setTimeout(applyEditorialSystem, 0);
      setTimeout(applyEditorialSystem, 300);
    }
  }, true);
  if (state.data?.actor) applyEditorialSystem();
}
