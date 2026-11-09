const list = value => Array.isArray(value) ? value : [];
const first = (items, predicate = () => true) => list(items).find(predicate) || null;
const statusOf = item => item?.epistemicStatus || item?.status || item?.workflowState || 'unavailable';
const rawId = item => item?.data?.id || item?.id || null;

function frame(seed) {
  const inputId = seed.objectRef || seed.processRef;
  return {
    id: `action-frame-${seed.id}`,
    claimClass: 'action-frame',
    epistemicStatus: seed.availability === 'blocked' ? 'unavailable' : 'derived-guidance',
    label: seed.label,
    statement: seed.statement,
    userQuestion: seed.userQuestion,
    objectRef: seed.objectRef || null,
    processRef: seed.processRef,
    action: seed.action,
    prerequisites: list(seed.prerequisites),
    consequence: seed.consequence,
    doesNotMean: list(seed.doesNotMean),
    evidenceAfter: list(seed.evidenceAfter),
    producer: { id: 'action-frame-projector', type: 'deterministic-view-model' },
    inputs: inputId ? [{ id: inputId, type: seed.objectRef ? 'runtime-object' : 'process-context' }] : [],
    limitations: [
      'Questa guida non modifica stato, autorità o priorità dell’oggetto.',
      ...(seed.limitations || [])
    ],
    nextAction: seed.action?.label || 'Nessuna azione disponibile.',
    availability: seed.availability || 'available',
    priority: seed.priority || 50,
    writeActionId: seed.writeActionId || null
  };
}

function inspectAttention(data) {
  const item = first(data?.views?.balloons);
  if (!item) return null;
  return frame({
    id: 'inspect-attention',
    label: 'Capire perché richiede attenzione',
    statement: item.label,
    userQuestion: 'Che cosa devo capire prima di agire?',
    objectRef: item.envelopeId,
    processRef: 'attention-triage',
    action: { kind: 'object', value: item.envelopeId, label: 'Apri l’oggetto' },
    consequence: 'Vedi significato locale, derivazione, limiti e prossima azione.',
    doesNotMean: ['Il balloon non è un punteggio di rischio.', 'L’attenzione non equivale a materialità.'],
    evidenceAfter: ['Nessuna scrittura; sola navigazione contestuale.'],
    priority: 10
  });
}

function addSource() {
  return frame({
    id: 'add-source',
    label: 'Aggiungere conoscenza candidata',
    statement: 'Registra un link o un file senza promuoverlo automaticamente nel perimetro attivo.',
    userQuestion: 'Devo aggiungere una fonte che ancora manca?',
    processRef: 'source-intake',
    action: { kind: 'dialog', value: 'sourceDialog', label: 'Aggiungi fonte' },
    prerequisites: ['Titolo e link oppure file locale.'],
    consequence: 'Nascono una fonte candidata, un checksum e una receipt; serve review umana.',
    doesNotMean: ['Fonte applicabile.', 'Fonte autorevole.', 'Perimetro completo.'],
    evidenceAfter: ['Receipt di acquisizione.', 'Checksum quando disponibile.'],
    writeActionId: 'source-propose',
    priority: 20
  });
}

function addMatter() {
  return frame({
    id: 'add-matter',
    label: 'Raccontare un evento',
    statement: 'Conserva il racconto originale prima di assegnare ownership o classificazioni.',
    userQuestion: 'Devo segnalare qualcosa che richiede valutazione?',
    processRef: 'matter-intake',
    action: { kind: 'dialog', value: 'matterDialog', label: 'Segnala evento' },
    prerequisites: ['Racconto osservabile dell’accaduto.'],
    consequence: 'Viene creato un caso in stato “fatti da confermare” con receipt.',
    doesNotMean: ['Incidente legalmente qualificato.', 'Obbligo di notifica.', 'Owner già confermato.'],
    evidenceAfter: ['Receipt di segnalazione.', 'Oggetto caso navigabile.'],
    writeActionId: 'matter-create',
    priority: 30
  });
}

function reviewSource(data) {
  const item = first(data?.views?.sources, value => value?.data?.lifecycle === 'candidate');
  if (!item) return null;
  const id = rawId(item);
  return frame({
    id: `review-source-${id}`,
    label: 'Decidere se includere una fonte',
    statement: item.label,
    userQuestion: 'Questa candidata entra nel perimetro attivo?',
    objectRef: item.id,
    processRef: 'source-review',
    action: { kind: 'selector', value: `[data-source="${id}"]`, label: 'Vai alla scelta' },
    prerequisites: ['Leggere provenienza, proposta e limiti.', 'Scegliere includi oppure escludi.'],
    consequence: 'La review viene registrata; soltanto l’esito “includi” attiva la fonte.',
    doesNotMean: ['Applicabilità normativa.', 'Completezza del perimetro.', 'Conformità.'],
    evidenceAfter: ['Receipt della review.', 'Stato prima e dopo.'],
    writeActionId: 'source-review',
    priority: 10
  });
}

function reviewFinding(data) {
  const item = first(data?.views?.findings, value => statusOf(value) === 'awaiting-human-review');
  if (!item) return null;
  const id = rawId(item);
  return frame({
    id: `review-finding-${id}`,
    label: 'Valutare una differenza osservata',
    statement: item.label,
    userQuestion: 'La differenza è rilevante nel nostro contesto?',
    objectRef: item.id,
    processRef: 'finding-review',
    action: { kind: 'selector', value: `[data-finding="${id}"]`, label: 'Vai alla valutazione' },
    prerequisites: ['Confrontare fonte, differenza e limiti.', 'Separare rilevanza locale da materialità legale.'],
    consequence: 'La review può aprire una change story oppure archiviare la differenza come non rilevante.',
    doesNotMean: ['Materialità legale automatica.', 'Obbligo di notifica.'],
    evidenceAfter: ['Receipt della review.', 'Change story solo se pertinente.'],
    writeActionId: 'finding-review',
    priority: 10
  });
}

function decideChange(data) {
  const item = first(data?.views?.changes, value => value?.data?.state === 'impact-to-assess');
  if (!item) return null;
  const id = rawId(item);
  return frame({
    id: `decide-change-${id}`,
    label: 'Registrare una decisione d’impatto',
    statement: item.label,
    userQuestion: 'Quale conseguenza operativa registriamo?',
    objectRef: item.id,
    processRef: 'change-decision',
    action: { kind: 'selector', value: `[data-decision="${id}"]`, label: 'Vai alla decisione' },
    prerequisites: ['Esito esplicito.', 'Motivazione osservabile.'],
    consequence: 'La decisione viene persistita e determina il passo successivo della change story.',
    doesNotMean: ['Parere legale universale.', 'Conformità automatica.'],
    evidenceAfter: ['Receipt della decisione.', 'Motivazione e attore registrati.'],
    writeActionId: 'change-decision',
    priority: 20
  });
}

function mapControl(data) {
  const item = first(data?.views?.changes, value => value?.data?.state === 'controls-to-map');
  if (!item) return null;
  const id = rawId(item);
  return frame({
    id: `map-control-${id}`,
    label: 'Collegare una famiglia di controllo',
    statement: item.label,
    userQuestion: 'Quale presidio astratto deve essere considerato?',
    objectRef: item.id,
    processRef: 'control-mapping',
    action: { kind: 'selector', value: `[data-control="${id}"]`, label: 'Vai al mapping' },
    prerequisites: ['Famiglia di controllo.', 'Motivazione del collegamento.'],
    consequence: 'Viene registrata una relazione di copertura astratta.',
    doesNotMean: ['Controllo progettato.', 'Controllo operativo.', 'Controllo efficace.'],
    evidenceAfter: ['Receipt del mapping.', 'Relazione semantica navigabile.'],
    writeActionId: 'control-map',
    priority: 30
  });
}

function reviewMatter(data) {
  const item = first(data?.views?.matters, value => value?.data?.state === 'facts-to-confirm') ||
    first(data?.views?.matters, value => value?.data?.state && value.data.state !== 'closed');
  if (!item) return null;
  const matter = item.data;
  const needsOwner = matter.state === 'facts-to-confirm';
  return frame({
    id: `${needsOwner ? 'confirm-owner' : 'advance-matter'}-${matter.id}`,
    label: needsOwner ? 'Confermare owner e RACI' : 'Valutare il prossimo passaggio',
    statement: item.label,
    userQuestion: needsOwner ? 'Chi assume responsabilità qui?' : 'Il caso può avanzare allo stato successivo?',
    objectRef: item.id,
    processRef: 'matter-workflow',
    action: { kind: 'selector', value: needsOwner ? `[data-owner="${matter.id}"]` : `[data-transition="${matter.id}"]`, label: needsOwner ? 'Vai alla conferma' : 'Vai alla transizione' },
    prerequisites: needsOwner ? ['Owner, Accountable e Responsible espliciti.'] : ['Fatti aggiornati e responsabilità già confermata.'],
    consequence: needsOwner ? 'Ownership e RACI diventano decisioni umane registrate.' : 'Il workflow avanza soltanto lungo una transizione consentita.',
    doesNotMean: ['Classificazione normativa definitiva.', 'Assenza di rischio residuo.', 'Caso automaticamente risolto.'],
    evidenceAfter: ['Receipt dell’azione.', 'Timeline del caso aggiornata.'],
    writeActionId: needsOwner ? 'matter-owner' : 'matter-transition',
    priority: 10
  });
}

function runJob(data) {
  const item = first(data?.views?.jobs);
  if (!item) return null;
  const id = rawId(item);
  return frame({
    id: `run-job-${id}`,
    label: 'Eseguire uno scouting dimostrativo',
    statement: item.label,
    userQuestion: 'Devo simulare un nuovo confronto locale?',
    objectRef: item.id,
    processRef: 'scouting-simulation',
    action: { kind: 'selector', value: `[data-job="${id}"]`, label: 'Vai alla simulazione' },
    prerequisites: ['Scegliere se il confronto produce o non produce una differenza.'],
    consequence: 'Il job registra un esito locale e, se indicato, crea un finding da revisionare.',
    doesNotMean: ['Acquisizione istituzionale reale.', 'Aggiornamento remoto.', 'Materialità.'],
    evidenceAfter: ['Receipt del job.', 'Finding candidato quando simulato.'],
    writeActionId: 'job-run',
    priority: 40
  });
}

function verifyEvidence() {
  return frame({
    id: 'verify-evidence',
    label: 'Seguire una decisione fino alla receipt',
    statement: 'Apri la traccia e carica il ledger sanitizzato soltanto quando serve verificare.',
    userQuestion: 'Devo ricostruire come è stato prodotto questo esito?',
    processRef: 'evidence-review',
    action: { kind: 'view', value: 'evidence', label: 'Apri prove e catene' },
    consequence: 'Vedi eventi, hash e relazioni senza esporre payload sensibili.',
    doesNotMean: ['Hash uguale a verità del contenuto.', 'Completezza dell’audit.'],
    evidenceAfter: ['Traccia runtime.', 'Ledger sanitizzato su richiesta.'],
    priority: 50
  });
}

function createSupportBundle() {
  return frame({
    id: 'create-support-bundle',
    label: 'Creare un support bundle sanitizzato',
    statement: 'Raccoglie soltanto salute, conteggi e capacità tecniche dichiarate.',
    userQuestion: 'Devo condividere una diagnosi senza esportare contenuti di dominio?',
    processRef: 'operational-diagnostics',
    action: { kind: 'selector', value: '#supportBundleCreate', label: 'Vai al support bundle' },
    consequence: 'Viene scaricato un JSON locale con correlation ID, integrità e conteggi.',
    doesNotMean: ['Telemetria centralizzata.', 'Raccolta forense.', 'Assenza assoluta di dati sensibili.'],
    evidenceAfter: ['File JSON sanitizzato generato nel browser.'],
    priority: 10
  });
}

function viewFallback(view) {
  const labels = {
    atlas: ['Esplorare un oggetto collegato', 'Quale oggetto devo aprire per capire la relazione?', 'object'],
    journeys: ['Continuare il percorso guidato', 'Qual è il prossimo passo della scena corrente?', 'selector'],
    evidence: ['Caricare gli eventi sanitizzati', 'Devo verificare eventi e hash?', 'selector'],
    system: ['Esaminare una capacità e il suo limite', 'Questa capacità è operativa, delimitata o assente?', 'view']
  };
  const value = labels[view];
  if (!value) return null;
  const target = view === 'journeys' ? '[data-scene-action]' : view === 'evidence' ? '#ledgerLoad' : view === 'atlas' ? '.node[data-object]' : 'system';
  return frame({
    id: `${view}-local-action`,
    label: value[0],
    statement: 'La guida porta al controllo già presente; non esegue scritture al posto dell’utente.',
    userQuestion: value[1],
    processRef: `${view}-navigation`,
    action: { kind: value[2], value: target, label: view === 'system' ? 'Resta nel sistema' : 'Vai al controllo' },
    consequence: 'Il contesto viene ristretto al punto operativo pertinente.',
    doesNotMean: ['La navigazione non costituisce decisione.'],
    evidenceAfter: ['Nessuna scrittura.'],
    priority: 50
  });
}

export function deriveActionFrames(data, view = 'home') {
  const byView = {
    home: [inspectAttention(data), addSource(), addMatter(), verifyEvidence()],
    sources: [reviewSource(data), addSource(), runJob(data)],
    changes: [reviewFinding(data), decideChange(data), mapControl(data)],
    matters: [reviewMatter(data), addMatter(), verifyEvidence()],
    atlas: [inspectAttention(data), viewFallback('atlas')],
    journeys: [viewFallback('journeys')],
    evidence: [viewFallback('evidence')],
    system: [createSupportBundle(), viewFallback('system'), verifyEvidence()]
  };
  return (byView[view] || byView.home)
    .filter(Boolean)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}

export function validateActionFrame(frameValue) {
  const required = ['id','claimClass','epistemicStatus','label','statement','userQuestion','processRef','action','consequence','producer','inputs','limitations','nextAction','availability'];
  return required.every(key => frameValue && frameValue[key] !== undefined) &&
    frameValue.claimClass === 'action-frame' &&
    ['object','dialog','view','selector'].includes(frameValue.action.kind) &&
    typeof frameValue.action.label === 'string' && frameValue.action.label.length > 0;
}
