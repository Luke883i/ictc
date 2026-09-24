import { $, esc, state } from './common.js';

const roleLabels = { admin: 'Amministratore', user: 'Utente', auditor: 'Auditor' };
const roleSummaries = {
  admin: 'Governi configurazione, verifiche e decisioni. ICTC prepara il contesto; tu autorizzi i passaggi che cambiano stato.',
  user: 'Registri fatti e materiali disponibili. Non devi classificare né concludere prima di avere le informazioni.',
  auditor: 'Ricostruisci origine, decisioni e limiti in sola lettura. Il fascicolo dimostra operazioni registrate, non verità sostanziale.',
};
const roleJourneys = {
  admin: [
    ['Inquadra', 'Definisci l’obiettivo o il fatto da gestire.'],
    ['Valuta proposta', 'Controlla piano o analisi preparati dall’AI.'],
    ['Decidi', 'Approva, correggi, escludi, invia o chiudi.'],
    ['Verifica evidenza', 'Controlla receipt, versioni, origine e limiti.'],
  ],
  user: [
    ['Registra', 'Conserva fatti, tempo e materiali originali.'],
    ['Completa', 'Aggiungi ciò che sai o indica ciò che non è disponibile.'],
    ['Conferma', 'Verifica la formulazione prima dell’invio.'],
    ['Segui', 'Controlla stato, richieste ed evidenze accessibili.'],
  ],
  auditor: [
    ['Individua', 'Apri il fascicolo o la fonte da esaminare.'],
    ['Ricostruisci', 'Segui origine, versioni e decisioni registrate.'],
    ['Valuta limiti', 'Distingui evidenza runtime e verità sostanziale.'],
    ['Esporta', 'Scarica il fascicolo con l’identità attiva.'],
  ],
};

function capability(name) {
  return Array.isArray(state.data?.capabilities) && state.data.capabilities.includes(name);
}

function counts() {
  const missions = state.data?.missions || [];
  const catalog = state.data?.catalog || [];
  const incidents = state.data?.incidents || [];
  return {
    missions: missions.length,
    active: missions.filter(item => item.state === 'active').length,
    candidates: catalog.filter(item => item.state === 'candidate').length,
    openIncidents: incidents.filter(item => !['submitted', 'closed'].includes(item.state)).length,
    incidents: incidents.length,
  };
}

function decision(role, workload, llm) {
  if (role === 'admin' && !llm.ready) return {
    title: 'Completa la configurazione AI', label: 'Apri configurazione', action: 'settings',
    whyNow: 'Piani e analisi assistite non possono partire finché endpoint, modello e chiave non sono disponibili.',
    whyMe: 'Solo l’amministratore può configurare il provider e registrare questa modifica.',
    how: 'Verifica perimetro, endpoint, modello e variabile della chiave; poi salva la configurazione.',
    outcome: 'Il supporto AI diventa disponibile. Monitoraggi, originali ed evidenze restano governati dal runtime.',
    ai: 'Dopo la configurazione l’AI può proporre piani, estrarre fatti e preparare bozze delimitate.',
    human: 'Tu verifichi ogni proposta prima di attivare, adottare, inviare o chiudere.',
    evidence: 'La configurazione produce una scrittura tracciata con receipt, revisione e identità.',
  };
  if (role === 'admin' && !workload.missions) return {
    title: 'Definisci il primo obiettivo', label: 'Crea un monitoraggio', action: 'monitoring',
    whyNow: 'Non esiste ancora un perimetro operativo di monitoraggio.',
    whyMe: 'L’amministratore definisce l’obiettivo e approva il piano prima dell’attivazione.',
    how: 'Descrivi il risultato atteso, indica frequenza e fonti note, quindi verifica il piano proposto.',
    outcome: 'Un monitoraggio versionato può essere attivato, sospeso, eseguito e riesaminato.',
    ai: 'L’AI propone query, fonti preferite e criteri di inclusione o esclusione.',
    human: 'Tu correggi e approvi il piano; nessuna fonte viene considerata verificata automaticamente.',
    evidence: 'Obiettivo, versioni del piano, attivazioni, esecuzioni e decisioni restano nel fascicolo.',
  };
  if (role === 'admin' && workload.candidates) return {
    title: 'Verifica le fonti candidate', label: `Verifica ${workload.candidates} ${workload.candidates === 1 ? 'fonte' : 'fonti'}`, action: 'monitoring-catalog',
    whyNow: 'Esistono risultati osservati che attendono una decisione motivata.',
    whyMe: 'Solo un ruolo con autorità di review può verificare o escludere una fonte.',
    how: 'Apri ogni candidata, controlla origine e identificativi, poi registra decisione e motivazione.',
    outcome: 'Ogni candidata passa a verificata o esclusa senza perdere osservazioni e provenienza.',
    ai: 'L’AI può proporre metadati e rilevanza; non determina applicabilità o validità.',
    human: 'Tu registri la decisione e la motivazione che modificano lo stato.',
    evidence: 'Origine, osservazioni, decisione, motivazione e receipt restano collegate.',
  };
  if (role === 'admin' && workload.openIncidents) return {
    title: 'Gestisci gli eventi aperti', label: `Apri ${workload.openIncidents} ${workload.openIncidents === 1 ? 'evento' : 'eventi'}`, action: 'incidents',
    whyNow: 'Uno o più fascicoli richiedono informazioni, conferma, invio o chiusura.',
    whyMe: 'L’amministratore può vedere tutti gli eventi e completare le decisioni di governance.',
    how: 'Apri il fascicolo, verifica originale e analisi, completa i dati e registra il passaggio umano.',
    outcome: 'Il fascicolo avanza senza cancellare originale, versioni o punti non risolti.',
    ai: 'L’AI estrae fatti, segnala lacune e prepara una bozza da controllare.',
    human: 'Una persona adotta o corregge i dati e conferma invio o chiusura.',
    evidence: 'Originale, allegati, analisi, risposte, versioni, decisioni e receipt restano esportabili.',
  };
  if (role === 'admin') return {
    title: 'Controlla l’attività corrente', label: 'Apri il monitoraggio', action: 'monitoring',
    whyNow: 'Non risultano decisioni urgenti; resta utile verificare esecuzioni, errori e prossime scadenze.',
    whyMe: 'L’amministratore mantiene il perimetro operativo e interviene sugli stati che richiedono autorità.',
    how: 'Controlla piani attivi, prossime esecuzioni, fonti osservate ed eventuali errori.',
    outcome: 'La situazione operativa rimane leggibile e pronta per la prossima decisione.',
    ai: 'L’AI assiste le esecuzioni configurate e registra trace e limiti.',
    human: 'Tu mantieni autorità su piani, fonti ed eventi.',
    evidence: 'Stato, esecuzioni, decisioni e integrità restano verificabili.',
  };
  if (role === 'user' && capability('report-incident')) return {
    title: 'Registra ciò che è accaduto', label: 'Registra un evento', action: 'incident',
    whyNow: 'Un fatto utile va preservato quando è ancora disponibile, anche se la classificazione non è chiara.',
    whyMe: 'Chi osserva o riceve la segnalazione può registrare il racconto originale senza formulare conclusioni.',
    how: 'Descrivi i fatti, indica quando ne hai avuto conoscenza e allega gli elementi disponibili.',
    outcome: 'Nasce un fascicolo con originale preservato e domande successive esplicite.',
    ai: 'L’AI può estrarre fatti e proporre domande o una bozza; non modifica l’originale.',
    human: 'Tu completi, correggi e confermi la versione prima dell’invio.',
    evidence: 'Originale, allegati, risposte, versioni e receipt restano collegati.',
  };
  if (role === 'user') return {
    title: 'Aggiungi materiale utile', label: 'Aggiungi materiale', action: 'contribution',
    whyNow: 'Un link, testo o documento può ampliare il perimetro senza essere classificato subito come fonte.',
    whyMe: 'Gli utenti possono contribuire materiale grezzo senza esercitare autorità di verifica.',
    how: 'Inserisci link, testo, allegati e una nota facoltativa sul possibile interesse.',
    outcome: 'L’originale viene preservato e può generare candidati da verificare.',
    ai: 'L’AI può proporre metadati separando osservazioni, inferenze e dati mancanti.',
    human: 'Un amministratore decide successivamente se verificare o escludere la fonte candidata.',
    evidence: 'Materiale originale, digest, arricchimento e decisioni restano distinguibili.',
  };
  return {
    title: 'Consulta le evidenze disponibili', label: 'Apri le evidenze', action: 'monitoring-catalog',
    whyNow: 'Le evidenze permettono di ricostruire attività e decisioni senza modificare il runtime.',
    whyMe: 'Il ruolo auditor verifica provenienza, coerenza e limiti in sola lettura.',
    how: 'Apri una fonte o un fascicolo, segui versioni e decisioni, quindi scarica l’evidenza protetta.',
    outcome: 'Ottieni una ricostruzione verificabile delle operazioni accessibili al tuo ruolo.',
    ai: 'Le trace AI mostrano scopo, input, output e limiti; non sono decisioni umane.',
    human: 'Le decisioni restano attribuite alle persone che le hanno registrate.',
    evidence: 'Il fascicolo dimostra coerenza interna e operazioni registrate, non completezza o verità sostanziale.',
  };
}

function ensureHomeStructure() {
  const root = $('#homeView');
  if (!root || root.dataset.reborn3 === 'true') return;
  root.dataset.reborn3 = 'true';
  root.innerHTML = `
    <section class="reborn-decision" aria-labelledby="homeNextTitle">
      <div class="reborn-action">
        <p id="homeRole" class="eyebrow">Ruolo</p>
        <h1 id="homeNextTitle">Priorità</h1>
        <p id="homeSummary" class="reborn-summary"></p>
        <button id="homePrimaryAction" class="primary" type="button" data-home-action="home">Apri</button>
      </div>
      <aside class="reborn-brief" aria-label="Spiegazione della priorità">
        <dl class="decision-grid">
          <div><dt>Perché ora</dt><dd id="homeReason"></dd></div>
          <div><dt>Perché tu</dt><dd id="homeWhyMe"></dd></div>
          <div><dt>Come</dt><dd id="homeHow"></dd></div>
          <div><dt>Esito</dt><dd id="homeOutcome"></dd></div>
        </dl>
        <details class="trust-brief">
          <summary>AI, controllo umano ed evidenza</summary>
          <div><b>AI</b><p id="homeAiNote"></p></div>
          <div><b>Checkpoint umano</b><p id="homeHumanGate"></p></div>
          <div><b>Evidenza</b><p id="homeEvidence"></p></div>
        </details>
      </aside>
    </section>
    <section class="home-journey-panel reborn-method" aria-labelledby="journeyTitle">
      <header class="section-head compact-head"><div><p class="eyebrow">Metodo del ruolo</p><h2 id="journeyTitle">Quattro passaggi, sempre verificabili</h2></div></header>
      <ol id="homeJourney" class="journey-strip" aria-label="Metodo operativo"></ol>
    </section>
    <section class="home-status-strip" aria-labelledby="homeStatusTitle">
      <header><p class="eyebrow">Stato</p><h2 id="homeStatusTitle">Situazione corrente</h2></header>
      <div id="homeMetrics" class="home-metrics"></div>
    </section>`;
}

function ensureOperationalGuides() {
  const guides = [
    ['#monitoringView .hero-copy', 'monitoringGuide', 'Prima di creare un monitoraggio', [
      ['Serve', 'Un obiettivo comprensibile, una frequenza e le eventuali fonti già note.'],
      ['AI', 'Propone il piano; non decide quali fonti siano applicabili o verificate.'],
      ['Tu', 'Rivedi il piano, lo attivi e motivi ogni decisione sulle fonti.'],
      ['Resta', 'Obiettivo, versioni, esecuzioni, decisioni e receipt.'],
    ]],
    ['#incidentsView .hero-copy', 'eventsGuide', 'Prima di registrare un evento', [
      ['Serve', 'Il racconto disponibile, il momento di conoscenza e gli elementi già raccolti.'],
      ['AI', 'Estrae fatti e propone domande; non determina obblighi o classificazioni definitive.'],
      ['Tu', 'Completi, correggi e confermi la formulazione prima dell’invio.'],
      ['Resta', 'Originale, allegati, risposte, versioni, decisioni e receipt.'],
    ]],
  ];
  for (const [selector, id, title, rows] of guides) {
    const host = $(selector);
    if (!host || $(`#${id}`)) continue;
    host.insertAdjacentHTML('beforeend', `<details id="${id}" class="context-guide"><summary>${esc(title)}</summary>${rows.map(([label, text]) => `<div><b>${esc(label)}</b><p>${esc(text)}</p></div>`).join('')}</details>`);
  }
  const eventsHeading = $('#incidentsView .section-head h2');
  if (eventsHeading) eventsHeading.textContent = 'Eventi registrati';
}

function renderRebornHome() {
  if (!state.data?.actor) return;
  ensureHomeStructure();
  ensureOperationalGuides();
  const role = state.data.actor.role;
  const workload = counts();
  const llm = state.data.settings.llm;
  const next = decision(role, workload, llm);
  $('#homeView').dataset.role = role;
  $('#homeRole').textContent = roleLabels[role] || 'Ruolo';
  $('#homeNextTitle').textContent = next.title;
  $('#homeSummary').textContent = roleSummaries[role] || '';
  $('#homeReason').textContent = next.whyNow;
  $('#homeWhyMe').textContent = next.whyMe;
  $('#homeHow').textContent = next.how;
  $('#homeOutcome').textContent = next.outcome;
  $('#homeAiNote').textContent = next.ai;
  $('#homeHumanGate').textContent = next.human;
  $('#homeEvidence').textContent = next.evidence;
  const primary = $('#homePrimaryAction');
  primary.textContent = next.label;
  primary.dataset.homeAction = next.action;
  $('#homeJourney').innerHTML = (roleJourneys[role] || roleJourneys.user).map((step, index) => `
    <li class="journey-step"><span>${index + 1}</span><div><b>${esc(step[0])}</b><p>${esc(step[1])}</p></div></li>`).join('');
  const metrics = [
    [workload.active, 'Monitoraggi attivi', workload.missions ? `${workload.missions} totali` : 'Nessun piano'],
    [workload.candidates, 'Fonti da verificare', workload.candidates ? 'Decisione richiesta' : 'Nessuna verifica aperta'],
    [workload.openIncidents, 'Eventi aperti', workload.incidents ? `${workload.incidents} totali` : 'Nessun evento'],
    [llm.ready ? 'Pronta' : llm.configured ? 'Chiave assente' : 'Non configurata', 'AI', llm.ready ? 'Supporto disponibile' : 'Percorsi manuali preservati'],
  ];
  $('#homeMetrics').innerHTML = metrics.map(([value, label, detail]) => `<div class="home-metric"><b>${esc(value)}</b><span>${esc(label)}</span><small>${esc(detail)}</small></div>`).join('');
  const settings = $('#openSettings');
  if (settings) { settings.hidden = true; settings.dataset.legacyControl='admin-ai-entry'; settings.setAttribute('aria-hidden','true'); settings.tabIndex=-1; }
}

export function installReborn3Experience() {
  document.addEventListener('ictc:rendered', renderRebornHome);
  if (state.data?.actor) renderRebornHome();
}
