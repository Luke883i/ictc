const list = value => Array.isArray(value) ? value : [];
const hasList = (root, path) => {
  let value = root;
  for (const key of path) value = value?.[key];
  return Array.isArray(value);
};
const rawId = item => item?.data?.id || item?.id || null;
const statusOf = item => item?.epistemicStatus || item?.status || item?.data?.state || 'unavailable';

function task(seed) {
  return {
    id: seed.id,
    personaId: seed.personaId,
    step: seed.step,
    objectId: seed.objectId || null,
    title: seed.title,
    statement: seed.statement,
    status: seed.status || 'observed',
    whyHere: seed.whyHere,
    objectPurpose: seed.objectPurpose || (seed.objectId ? seed.whyHere : 'L’azione nasce da un intento umano esplicito e crea il primo oggetto SOT della journey.'),
    sotRef: seed.sotRef || (seed.objectId ? { kind: 'runtime-object', id: seed.objectId } : { kind: 'human-intent', id: seed.action?.kind || 'unknown' }),
    action: seed.action,
    inputs: list(seed.inputs),
    producer: seed.producer || 'persona-journey-projector',
    consequence: seed.consequence,
    doesNotMean: list(seed.doesNotMean),
    evidenceAfter: list(seed.evidenceAfter),
    priority: seed.priority ?? 50,
    availability: seed.availability || 'available',
    readOnly: Boolean(seed.readOnly)
  };
}

const noWork = (personaId, reason, availability = 'available') => task({
  id: `${personaId}-no-work`, personaId, step: 0,
  title: availability === 'unavailable' ? 'Coda non disponibile' : 'Nessun incarico immediato',
  statement: reason,
  status: availability === 'unavailable' ? 'unavailable' : 'observed',
  whyHere: availability === 'unavailable'
    ? 'Il bootstrap non contiene la collezione necessaria per derivare la coda.'
    : 'La SOT corrente non espone oggetti compatibili con questa journey.',
  action: { kind: 'section', value: 'records', label: 'Esamina tutti gli oggetti' },
  inputs: [], consequence: 'Apre l’elenco completo senza creare o modificare stati.',
  doesNotMean: ['Conformità raggiunta.', 'Perimetro completo.', 'Assenza di rischio o attività.'],
  evidenceAfter: ['Nessuna scrittura.'], availability
});

function regulatory(data) {
  const tasks = [];
  for (const item of list(data?.views?.sources).filter(value => value?.data?.lifecycle === 'candidate')) {
    const id = rawId(item);
    tasks.push(task({ id: `source-review-${id}`, personaId: 'regulatory-analyst', step: 1, objectId: item.id,
      title: `Revisiona: ${item.label}`, statement: item.statement, status: statusOf(item), priority: 10,
      whyHere: 'La fonte è candidata e non può entrare nel perimetro attivo senza una review umana.',
      action: { kind: 'source-review', value: id, label: 'Inizia la review' }, inputs: [item.id],
      consequence: 'Registra inclusione o esclusione e produce una receipt.',
      doesNotMean: ['Fonte applicabile.', 'Fonte autorevole.', 'Perimetro completo.'],
      evidenceAfter: ['Esito umano.', 'Stato prima/dopo.', 'Receipt con readback.'] }));
  }
  for (const item of list(data?.views?.findings).filter(value => statusOf(value) === 'awaiting-human-review')) {
    const id = rawId(item);
    tasks.push(task({ id: `finding-review-${id}`, personaId: 'regulatory-analyst', step: 2, objectId: item.id,
      title: `Valuta: ${item.label}`, statement: item.statement, status: statusOf(item), priority: 20,
      whyHere: 'Una differenza è stata osservata ma la rilevanza nel contesto resta indeterminata.',
      action: { kind: 'finding-review', value: id, label: 'Valuta la differenza' },
      inputs: [item.id, ...(item.inputs || []).map(input => input.id)],
      consequence: 'Una review rilevante apre una change story; una review non rilevante conserva l’esito.',
      doesNotMean: ['Materialità legale automatica.', 'Obbligo di notifica.', 'Non conformità.'],
      evidenceAfter: ['Review umana.', 'Receipt.', 'Change story soltanto se pertinente.'] }));
  }
  for (const item of list(data?.views?.changes)) {
    const id = rawId(item);
    if (item?.data?.state === 'impact-to-assess') tasks.push(task({ id: `change-decision-${id}`, personaId: 'regulatory-analyst', step: 3, objectId: item.id,
      title: `Decidi l’impatto: ${item.label}`, statement: item.statement, status: statusOf(item), priority: 30,
      whyHere: 'La change story esiste, ma manca una decisione contestuale e motivata.',
      action: { kind: 'change-decision', value: id, label: 'Registra la decisione' }, inputs: [item.id],
      consequence: 'Registra esito e motivazione e determina il prossimo stato della change story.',
      doesNotMean: ['Parere legale universale.', 'Conformità automatica.'], evidenceAfter: ['Decisione umana.', 'Motivazione.', 'Receipt.'] }));
    if (item?.data?.state === 'controls-to-map') tasks.push(task({ id: `control-map-${id}`, personaId: 'regulatory-analyst', step: 4, objectId: item.id,
      title: `Collega un presidio: ${item.label}`, statement: item.statement, status: statusOf(item), priority: 40,
      whyHere: 'La decisione richiede un collegamento esplicito a una famiglia di controllo.',
      action: { kind: 'control-map', value: id, label: 'Collega il presidio' }, inputs: [item.id],
      consequence: 'Crea una relazione di copertura astratta.',
      doesNotMean: ['Controllo progettato.', 'Controllo operativo.', 'Controllo efficace.'],
      evidenceAfter: ['Relazione navigabile.', 'Motivazione.', 'Receipt.'] }));
  }
  tasks.push(task({ id: 'source-propose', personaId: 'regulatory-analyst', step: 0,
    title: 'Aggiungi una fonte mancante', statement: 'Registra un link come conoscenza candidata.', status: 'observed', priority: 90,
    whyHere: 'L’acquisizione è disponibile come attività volontaria, non come priorità inferita.',
    action: { kind: 'dialog', value: 'sourceDialog', label: 'Aggiungi un link' }, inputs: ['human-input'],
    consequence: 'Crea una fonte candidata e un finding da revisionare.',
    doesNotMean: ['Fonte attiva.', 'Applicabilità.', 'Completezza.'], evidenceAfter: ['Receipt di acquisizione.', 'Checksum del locator.'] }));
  return tasks;
}

function incident(data) {
  const tasks = [];
  for (const item of list(data?.views?.matters)) {
    const matter = item.data || {};
    if (matter.state === 'closed') continue;
    if (matter.state === 'facts-to-confirm') tasks.push(task({ id: `matter-owner-${matter.id}`, personaId: 'incident-lead', step: 1, objectId: item.id,
      title: `Conferma la responsabilità: ${item.label}`, statement: item.statement, status: statusOf(item), priority: 10,
      whyHere: 'Il racconto è conservato, ma owner e RACI non sono ancora decisioni confermate.',
      action: { kind: 'matter-owner', value: matter.id, label: 'Conferma owner e RACI' }, inputs: [item.id],
      consequence: 'Owner, Accountable e Responsible diventano decisioni registrate.',
      doesNotMean: ['Qualificazione normativa definitiva.', 'Obbligo di notifica.', 'Caso risolto.'],
      evidenceAfter: ['Timeline aggiornata.', 'Receipt.', 'Stato owned.'] }));
    else {
      const stepByState = { owned: 2, assessing: 3, responding: 4, 'closure-review': 4 };
      tasks.push(task({ id: `matter-transition-${matter.id}`, personaId: 'incident-lead', step: stepByState[matter.state] ?? 2, objectId: item.id,
        title: `Prosegui: ${item.label}`, statement: item.statement, status: statusOf(item), priority: 20,
        whyHere: `Il caso è nello stato “${matter.state}” e può avanzare soltanto lungo una transizione consentita.`,
        action: { kind: 'matter-transition', value: matter.id, label: matter.state === 'closure-review' ? 'Registra la chiusura' : 'Valuta il passaggio' },
        inputs: [item.id], consequence: 'Registra una sola transizione e aggiorna la timeline.',
        doesNotMean: ['Assenza di rischio residuo.', 'Classificazione normativa definitiva.', 'Efficacia della risposta.'],
        evidenceAfter: ['Timeline aggiornata.', 'Stato prima/dopo.', 'Receipt.'] }));
    }
  }
  tasks.push(task({ id: 'matter-create', personaId: 'incident-lead', step: 0,
    title: 'Racconta un nuovo evento', statement: 'Conserva i fatti osservati prima di classificarli.', status: 'observed', priority: 90,
    whyHere: 'La segnalazione è una possibilità sempre disponibile e non una priorità inferita.',
    action: { kind: 'dialog', value: 'matterDialog', label: 'Segnala un evento' }, inputs: ['human-report'],
    consequence: 'Crea un caso con fatti da confermare.',
    doesNotMean: ['Incidente legalmente qualificato.', 'Urgenza automatica.', 'Owner confermato.'],
    evidenceAfter: ['Racconto originale.', 'Caso navigabile.', 'Receipt.'] }));
  return tasks;
}

function auditor(data) {
  const objects = Object.values(data?.objectIndex || {}).filter(item => item?.receiptRef);
  const tasks = objects.slice(0, 12).map((item, index) => task({ id: `audit-${item.id}`, personaId: 'auditor', step: Math.min(index, 3), objectId: item.id,
    title: `Ricostruisci: ${item.label}`, statement: item.statement, status: statusOf(item), priority: index,
    whyHere: 'L’oggetto espone una receipt o un riferimento di persistenza verificabile.',
    action: { kind: 'object', value: item.id, label: 'Apri provenienza e receipt' },
    inputs: [item.id, ...(item.inputs || []).map(input => input.id)], consequence: 'Apre il dettaglio senza modificare la SOT.',
    doesNotMean: ['Verità sostanziale.', 'Completezza dell’audit.', 'Conformità.'],
    evidenceAfter: ['Produttore.', 'Input.', 'Relazioni.', 'Receipt.'], readOnly: true }));
  tasks.push(task({ id: 'auditor-ledger', personaId: 'auditor', step: 3,
    title: 'Verifica la sequenza degli eventi', statement: 'Carica il ledger sanitizzato e il risultato della hash-chain.',
    status: data?.meta?.integrity?.ok === false ? 'failed' : data?.meta?.integrity ? 'verified' : 'unavailable', priority: 80,
    whyHere: 'La sequenza tecnica è una prova distinta dal contenuto degli eventi.',
    action: { kind: 'ledger', value: null, label: 'Carica il ledger sanitizzato' }, inputs: ['runtime-ledger'],
    consequence: 'Mostra eventi senza payload e stato della catena.',
    doesNotMean: ['Contenuto vero.', 'Perimetro completo.', 'Non ripudio.'],
    evidenceAfter: ['Hash.', 'Previous hash.', 'Conteggio eventi.'], readOnly: true }));
  return tasks;
}

function executive(data) {
  const tasks = [];
  for (const item of list(data?.views?.changes).filter(value => ['impact-to-assess', 'controls-to-map'].includes(value?.data?.state))) tasks.push(task({
    id: `executive-change-${rawId(item)}`, personaId: 'executive', step: 1, objectId: item.id,
    title: `Decisione aperta: ${item.label}`, statement: item.statement, status: statusOf(item), priority: 10,
    whyHere: 'La change story richiede una decisione o un presidio esplicito da parte del relativo owner.',
    action: { kind: 'object', value: item.id, label: 'Leggi decisione, responsabile e limite' }, inputs: [item.id],
    consequence: 'Apre il contesto in sola lettura.', doesNotMean: ['Priorità economica automatica.', 'Non conformità.', 'Decisione già approvata.'],
    evidenceAfter: ['Input e produttore.', 'Stato decisionale.', 'Receipt quando presente.'], readOnly: true }));
  for (const item of list(data?.views?.matters).filter(value => value?.data?.state !== 'closed')) tasks.push(task({
    id: `executive-matter-${rawId(item)}`, personaId: 'executive', step: 2, objectId: item.id,
    title: `Responsabilità aperta: ${item.label}`, statement: item.statement, status: statusOf(item), priority: 20,
    whyHere: 'Il caso è aperto e rende visibili owner, RACI e stato corrente.',
    action: { kind: 'object', value: item.id, label: 'Leggi responsabilità e stato' }, inputs: [item.id],
    consequence: 'Apre il contesto senza avanzare il workflow.',
    doesNotMean: ['Severità normativa.', 'Obbligo di notifica.', 'Rischio aggregato.'],
    evidenceAfter: ['Owner e RACI.', 'Timeline.', 'Receipt quando presente.'], readOnly: true }));
  return tasks;
}

function operator(data) {
  const release = data?.release;
  const integrity = data?.meta?.integrity;
  return [
    task({ id: 'operator-release', personaId: 'platform-operator', step: 0,
      title: release ? `ICTC ${release.version} · ${release.readiness}` : 'Manifest di release non disponibile',
      statement: release?.claim || 'Il runtime non ha pubblicato il release boundary.',
      status: !release ? 'unavailable' : release.readiness === 'ready' ? 'verified' : release.readiness === 'blocked' ? 'failed' : 'bounded', priority: 10,
      whyHere: 'Readiness e scope devono essere verificati prima di diagnosticare il dominio.',
      action: { kind: 'section', value: 'system', label: 'Apri release e guardrail' }, inputs: ['release-manifest'],
      consequence: 'Mostra scope, esclusioni e guardrail senza modificare il runtime.',
      doesNotMean: ['Conformità del cliente.', 'Enterprise readiness.', 'Disponibilità multiutente.'],
      evidenceAfter: ['Versione.', 'Readiness.', 'Hash del manifest.'], readOnly: true }),
    task({ id: 'operator-integrity', personaId: 'platform-operator', step: 1,
      title: integrity?.ok === true ? 'Catena locale coerente' : integrity?.ok === false ? 'Verifica della catena fallita' : 'Integrità non disponibile',
      statement: integrity ? `${integrity.eventCount} eventi; head ${integrity.head || 'non disponibile'}.` : 'Nessuna risposta di integrità nel bootstrap.',
      status: integrity?.ok === true ? 'verified' : integrity?.ok === false ? 'failed' : 'unavailable', priority: 20,
      whyHere: 'La disponibilità tecnica della SOT è un prerequisito per interpretare le proiezioni.',
      action: { kind: 'ledger', value: null, label: 'Ispeziona il ledger' }, inputs: ['runtime-integrity'],
      consequence: 'Carica eventi sanitizzati e risultato della hash-chain.',
      doesNotMean: ['Contenuto vero.', 'Completezza.', 'Assenza di manomissioni esterne al perimetro locale.'],
      evidenceAfter: ['Event count.', 'Hash head.', 'Eventi senza payload.'], readOnly: true }),
    task({ id: 'operator-support', personaId: 'platform-operator', step: 3,
      title: 'Prepara una diagnosi sanitizzata', statement: 'Raccoglie release, integrità e conteggi senza contenuti di dominio.',
      status: 'bounded', priority: 30, whyHere: 'Serve un artefatto condivisibile senza esportare il ledger o i documenti.',
      action: { kind: 'support-bundle', value: null, label: 'Crea support bundle' }, inputs: ['release', 'integrity', 'counts'],
      consequence: 'Scarica un JSON locale nel browser.',
      doesNotMean: ['Telemetria centralizzata.', 'Raccolta forense.', 'Assenza assoluta di dati sensibili.'],
      evidenceAfter: ['Correlation ID locale.', 'Conteggi.', 'Guardrail.'], readOnly: true })
  ];
}

export function validateJourneyTask(value) {
  return Boolean(value && value.id && value.personaId && Number.isInteger(value.step) && value.title && value.statement && value.whyHere && value.objectPurpose && value.sotRef?.kind && value.sotRef?.id && value.action?.kind && value.action?.label && value.consequence && Array.isArray(value.doesNotMean) && value.doesNotMean.length && Array.isArray(value.evidenceAfter) && value.producer);
}

export function deriveJourneyWorkspace(data, contract, personaId, selectedTaskId = null) {
  const persona = list(contract?.personas).find(item => item.id === personaId) || null;
  if (!persona) return { persona: null, tasks: [], activeTask: null, journey: [], availability: 'persona-required' };
  const requiredPaths = {
    'regulatory-analyst': [['views', 'sources'], ['views', 'findings'], ['views', 'changes']],
    'incident-lead': [['views', 'matters']], auditor: [['objectIndex']],
    executive: [['views', 'changes'], ['views', 'matters']], 'platform-operator': [['meta', 'integrity']]
  }[personaId] || [];
  const unavailable = requiredPaths.some(path => path.length > 1 ? !hasList(data, path) : data?.[path[0]] == null);
  let tasks = ({ 'regulatory-analyst': regulatory, 'incident-lead': incident, auditor, executive, 'platform-operator': operator }[personaId] || (() => []))(data)
    .filter(validateJourneyTask).sort((a, b) => a.priority - b.priority);
  if (unavailable) tasks = [noWork(personaId, 'Non è possibile derivare questa journey dal bootstrap corrente.', 'unavailable')];
  else if (!tasks.length) tasks = [noWork(personaId, 'La SOT non espone incarichi compatibili con questa lente.')];
  const activeTask = tasks.find(item => item.id === selectedTaskId) || tasks[0];
  return {
    persona, tasks, activeTask,
    journey: persona.journey.map((label, index) => ({ index, label, state: index < activeTask.step ? 'past-context' : index === activeTask.step ? 'current' : 'not-reached' })),
    availability: unavailable ? 'unavailable' : 'available',
    counts: {
      tasks: tasks.filter(item => !item.id.endsWith('-no-work')).length,
      objectTasks: tasks.filter(item => item.objectId).length,
      voluntaryTasks: tasks.filter(item => item.sotRef?.kind === 'human-intent').length,
      writeTasks: tasks.filter(item => !item.readOnly && item.action.kind !== 'section' && item.action.kind !== 'object').length,
      readOnlyTasks: tasks.filter(item => item.readOnly).length
    }, boundary: contract.boundary
  };
}
