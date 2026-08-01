const list = value => Array.isArray(value) ? value : [];
const count = (value, predicate = () => true) => list(value).filter(predicate).length;
const raw = item => item?.data || item || {};
const statusOf = item => item?.epistemicStatus || raw(item).status || raw(item).state || raw(item).workflowState || 'unavailable';
const collection = (data, key) => {
  const projected = data?.views?.[key];
  if (Array.isArray(projected)) return { known: true, items: projected };
  const domain = data?.[key];
  if (Array.isArray(domain)) return { known: true, items: domain };
  return { known: false, items: [] };
};

const known = value => Number.isFinite(value);

function envelope(seed) {
  const inputs = list(seed.inputs).filter(Boolean).map(id => ({ type: 'runtime-projection-input', id }));
  return {
    id: `ux-projection-${seed.id}`,
    claimClass: 'ux-sot-projection',
    epistemicStatus: seed.epistemicStatus,
    label: seed.label,
    statement: seed.statement,
    metric: seed.metric,
    producer: { type: 'deterministic-view-model', id: 'advanced-ux-projector' },
    inputs,
    limitations: [
      'Questa rappresentazione comprime oggetti runtime; non aggiunge autorità o nuovi fatti.',
      'Lo stato visuale non è un verdetto di conformità, rischio o completezza.',
      ...list(seed.limitations)
    ],
    nextAction: seed.nextAction,
    target: seed.target,
    detail: seed.detail,
    order: seed.order
  };
}

function sourceCounts(data) {
  const sources = collection(data, 'sources');
  const findings = collection(data, 'findings');
  return {
    known: sources.known && findings.known,
    sources: sources.known ? sources.items.length : null,
    openFindings: findings.known ? count(findings.items, item => statusOf(item) === 'awaiting-human-review' || raw(item).humanState === 'awaiting-review') : null
  };
}

function decisionCounts(data) {
  const sources = collection(data, 'sources');
  const findings = collection(data, 'findings');
  const changes = collection(data, 'changes');
  const candidates = sources.known ? count(sources.items, item => raw(item).lifecycle === 'candidate' || statusOf(item) === 'candidate') : null;
  const reviews = findings.known ? count(findings.items, item => statusOf(item) === 'awaiting-human-review' || raw(item).humanState === 'awaiting-review') : null;
  const decisions = changes.known ? count(changes.items, item => raw(item).state === 'impact-to-assess') : null;
  const isKnown = [candidates, reviews, decisions].every(Number.isFinite);
  return { known: isKnown, candidates, reviews, decisions, total: isKnown ? candidates + reviews + decisions : null };
}

function actionCounts(data) {
  const changes = collection(data, 'changes');
  const matters = collection(data, 'matters');
  const controlMappings = changes.known ? count(changes.items, item => raw(item).state === 'controls-to-map') : null;
  const openMatters = matters.known ? count(matters.items, item => !['closed', undefined, null].includes(raw(item).state || raw(item).workflowState)) : null;
  const unownedMatters = matters.known ? count(matters.items, item => ['facts-to-confirm', 'attention-required'].includes(raw(item).state || statusOf(item))) : null;
  const isKnown = [controlMappings, openMatters, unownedMatters].every(Number.isFinite);
  return { known: isKnown, controlMappings, openMatters, unownedMatters, total: isKnown ? controlMappings + openMatters : null };
}
function evidenceCounts(data) {
  const integrity = data?.meta?.integrity || data?.integrity || null;
  const traces = collection(data, 'traces');
  return {
    integrityKnown: Boolean(integrity && typeof integrity.ok === 'boolean'),
    integrityOk: integrity?.ok === true,
    eventCount: Number.isFinite(integrity?.eventCount) ? integrity.eventCount : null,
    traceCount: traces.known ? traces.items.length : null
  };
}

export function deriveProjectionStack(data, view = 'home', lens = 'everyday') {
  const observation = sourceCounts(data);
  const decision = decisionCounts(data);
  const action = actionCounts(data);
  const evidence = evidenceCounts(data);

  const stages = [
    envelope({
      id: 'observe', order: 10, label: 'Osserva',
      epistemicStatus: observation.known ? (observation.openFindings > 0 ? 'attention-required' : 'observed') : 'unavailable',
      statement: observation.known ? `${observation.sources} fonti proiettate; ${observation.openFindings} differenze attendono review.` : 'Fonti o finding non disponibili nel bootstrap corrente.',
      metric: { value: observation.known ? observation.openFindings : null, label: observation.known ? 'differenze da valutare' : 'dati non disponibili', unit: observation.known ? 'oggetti' : 'stato' },
      inputs: ['views.sources', 'views.findings'],
      limitations: ['Il conteggio non misura copertura normativa o priorità aziendale.'],
      nextAction: !observation.known ? 'Verificare il bootstrap e la disponibilità delle proiezioni.' : observation.openFindings > 0 ? 'Aprire le novità da valutare.' : 'Esaminare fonti e limiti del perimetro.',
      target: { kind: 'view', value: observation.known && observation.openFindings > 0 ? 'changes' : 'sources' },
      detail: 'Rende visibili segnali e differenze senza trasformarli in decisioni.'
    }),
    envelope({
      id: 'decide', order: 20, label: 'Decidi',
      epistemicStatus: decision.known ? (decision.total > 0 ? 'awaiting-human-review' : 'observed') : 'unavailable',
      statement: decision.known ? `${decision.candidates} fonti candidate, ${decision.reviews} review di finding e ${decision.decisions} decisioni d’impatto.` : 'Coda decisionale non disponibile nel bootstrap corrente.',
      metric: { value: decision.total, label: decision.known ? 'decisioni locali aperte' : 'dati non disponibili', unit: decision.known ? 'azioni' : 'stato' },
      inputs: ['views.sources', 'views.findings', 'views.changes'],
      limitations: ['La coda non implica materialità, urgenza o non conformità.'],
      nextAction: !decision.known ? 'Verificare le proiezioni di fonti, finding e change.' : decision.total > 0 ? 'Aprire la prima decisione esplicita.' : 'Nessuna decisione aperta nella proiezione corrente.',
      target: { kind: 'view', value: decision.known && (decision.reviews + decision.decisions) > 0 ? 'changes' : 'sources' },
      detail: 'Raggruppa soltanto azioni che richiedono una scelta umana già prevista dal runtime.'
    }),
    envelope({
      id: 'act', order: 30, label: 'Agisci',
      epistemicStatus: action.known ? (action.total > 0 ? (action.unownedMatters > 0 ? 'attention-required' : 'human-owned') : 'observed') : 'unavailable',
      statement: action.known ? `${action.openMatters} casi aperti; ${action.controlMappings} mapping astratti da completare.` : 'Attività operative non disponibili nel bootstrap corrente.',
      metric: { value: action.total, label: action.known ? 'attività operative' : 'dati non disponibili', unit: action.known ? 'oggetti' : 'stato' },
      inputs: ['views.matters', 'views.changes'],
      limitations: ['Owner, mapping e transizioni non provano efficacia del controllo o chiusura del rischio.'],
      nextAction: !action.known ? 'Verificare le proiezioni di casi e change.' : action.unownedMatters > 0 ? 'Confermare owner e RACI.' : action.controlMappings > 0 ? 'Registrare il mapping astratto.' : 'Esaminare la catena operativa.',
      target: { kind: 'view', value: action.known && action.openMatters > 0 ? 'matters' : 'changes' },
      detail: 'Distingue responsabilità, transizione e mapping dalle conclusioni normative.'
    }),
    envelope({
      id: 'verify', order: 40, label: 'Verifica',
      epistemicStatus: evidence.integrityKnown ? (evidence.integrityOk ? 'verified' : 'failed') : 'unavailable',
      statement: evidence.integrityKnown
        ? `${evidence.eventCount} eventi nella catena locale; ${evidence.traceCount ?? '—'} tracce proiettate.`
        : `${evidence.traceCount ?? '—'} tracce disponibili; integrità non presente nel bootstrap.`,
      metric: { value: evidence.eventCount, label: evidence.integrityKnown ? 'eventi verificati' : 'integrità non disponibile', unit: evidence.integrityKnown ? 'eventi' : 'stato' },
      inputs: ['meta.integrity', 'views.traces'],
      limitations: ['Hash coerente e readback non provano verità sostanziale, completezza o conformità.'],
      nextAction: evidence.integrityKnown ? 'Aprire receipt, eventi sanitizzati e derivazione.' : 'Verificare la disponibilità dell’integrità runtime.',
      target: { kind: 'view', value: 'evidence' },
      detail: 'Espone prove tecniche e limiti senza promuoverli a prova legale universale.'
    })
  ];

  return {
    id: `projection-stack-${view}-${lens}`,
    claimClass: 'ux-projection-stack',
    epistemicStatus: 'derived-guidance',
    producer: { type: 'deterministic-view-model', id: 'advanced-ux-projector' },
    inputs: stages.flatMap(stage => stage.inputs),
    limitations: [
      'La sequenza Osserva → Decidi → Agisci → Verifica è una mappa cognitiva, non un workflow obbligatorio.',
      'Ogni valore deriva dal bootstrap corrente e può cambiare dopo una scrittura o un refresh.'
    ],
    view,
    lens,
    stages
  };
}

export function chooseInitialLayer(stack) {
  const attention = stack.stages.find(stage => ['attention-required', 'awaiting-human-review', 'failed', 'unavailable'].includes(stage.epistemicStatus));
  return attention?.id || stack.stages[0]?.id || null;
}
