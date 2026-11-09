import crypto from 'node:crypto';

const DEFAULT_STUDY_QUESTION = 'Individua variazioni da sottoporre a review umana.';
const DEFAULT_CONTEXT = 'enterprise';

const clamp = (value, maximum) => String(value ?? '').replaceAll('\u0000', '').trim().slice(0, maximum);
const interval = value => Math.max(15, Math.min(43_200, Number(value) || 1440));

function validateHttpUrl(value) {
  if (!value) return null;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Sono ammessi URL HTTP o HTTPS.');
  url.hash = '';
  return url.toString();
}

function classifyEcosystem(value) {
  const text = JSON.stringify(value);
  if (/privacy|garante/i.test(text)) return 'Garante Privacy';
  if (/acn|nis2|cyber/i.test(text)) return 'ACN e CSIRT Italia';
  return 'Da classificare';
}

function defaultGovernance(context, text) {
  if (context === 'public-administration') {
    return {
      owner: /cyber|access|anom/i.test(text) ? 'Responsabile sicurezza ICT' : 'Responsabile del procedimento',
      raci: {
        accountable: 'Dirigente responsabile',
        responsible: 'Ufficio competente',
        consulted: [...new Set(['Legal', /dati|privacy/i.test(text) ? 'DPO' : null, 'RPCT'].filter(Boolean))],
        informed: ['Responsabile del servizio']
      }
    };
  }
  return {
    owner: /cyber|access|anom/i.test(text) ? 'Cybersecurity Incident Manager' : 'Compliance Intake',
    raci: {
      accountable: 'Compliance Owner',
      responsible: 'Triage Team',
      consulted: [...new Set(['Legal', /dati|privacy/i.test(text) ? 'DPO' : null, /fornitor/i.test(text) ? 'Procurement' : null].filter(Boolean))],
      informed: ['Process Owner']
    }
  };
}

export function createRuntimeModel(contract, options = {}) {
  if (!contract?.incidentPhases || !contract?.operatingScenarios) throw new Error('Contratto core incompleto.');
  const id = options.id || (prefix => `${prefix}-${crypto.randomUUID().slice(0, 8)}`);
  const clock = options.now || (() => new Date());
  const contexts = new Set(contract.operatingScenarios.map(item => item.id));
  const phaseByTransition = new Map(contract.incidentPhases.map(item => [`${item.from}->${item.to}`, item]));

  function normalizeOperatingContext(value, fallback = DEFAULT_CONTEXT) {
    const context = String(value || fallback);
    if (!contexts.has(context)) throw new Error('Contesto operativo non valido.');
    return context;
  }

  function createMonitoring(input) {
    const label = clamp(input.label, 300);
    const locator = validateHttpUrl(input.url);
    if (!label || !locator) throw new Error('Nome e URL del monitoraggio sono obbligatori.');
    const operatingContext = normalizeOperatingContext(input.operatingContext);
    const ecosystem = classifyEcosystem(input);
    const source = {
      id: id('src'),
      title: clamp(input.sourceTitle || label, 400),
      ecosystem,
      kind: 'monitored-web',
      locator,
      lifecycle: 'candidate',
      reviewState: 'candidate-awaiting-review',
      owner: 'Compliance Intake',
      operatingContext,
      lastCheckedAt: null,
      checksum: crypto.createHash('sha256').update(locator).digest('hex')
    };
    const job = {
      id: id('job'),
      label,
      sourceId: source.id,
      ecosystem,
      state: 'awaiting-source-review',
      enabled: false,
      schedule: { intervalMinutes: interval(input.intervalMinutes) },
      nextRunAt: null,
      studyQuestion: clamp(input.studyQuestion || DEFAULT_STUDY_QUESTION, 1000),
      operatingContext
    };
    return { source, job };
  }

  function scheduleMonitoring(job, input = {}) {
    const intervalMinutes = interval(input.intervalMinutes || job.schedule?.intervalMinutes);
    const enabled = input.enabled !== false;
    return {
      ...job,
      enabled,
      schedule: { intervalMinutes },
      state: enabled ? 'scheduled' : 'disabled',
      nextRunAt: enabled ? new Date(clock().getTime() + intervalMinutes * 60_000).toISOString() : null
    };
  }

  function createManualSource(input, blob = null) {
    const locator = blob?.locator || validateHttpUrl(input.url);
    if (!locator) throw new Error('Inserire un link o un contenuto persistito.');
    const operatingContext = normalizeOperatingContext(input.operatingContext);
    const kind = blob ? (input.binary ? 'user-file' : 'user-text') : 'user-link';
    const source = {
      id: id('src'),
      title: clamp(input.title || input.fileName || input.url || 'Contenuto aggiunto', 400),
      ecosystem: classifyEcosystem(input),
      kind,
      locator,
      lifecycle: 'candidate',
      reviewState: 'candidate-awaiting-review',
      owner: 'Compliance Intake',
      operatingContext,
      lastCheckedAt: clock().toISOString(),
      checksum: blob?.checksum || crypto.createHash('sha256').update(locator).digest('hex'),
      byteLength: blob?.byteLength ?? null,
      mediaType: blob?.mediaType ?? null
    };
    const finding = {
      id: id('finding'),
      sourceId: source.id,
      type: kind === 'user-text' ? 'user-content' : 'new-source',
      statement: kind === 'user-text' ? 'Una persona ha aggiunto un contenuto da qualificare.' : 'Una persona ha proposto una nuova fonte.',
      humanState: 'awaiting-review',
      materiality: 'undetermined',
      aiProposal: 'Classificazione e rilevanza restano da revisionare.'
    };
    return { source, finding };
  }

  function createIncident(input) {
    const narrative = clamp(input.summary, 8000);
    if (!narrative) throw new Error('Fatti osservati obbligatori.');
    const operatingContext = normalizeOperatingContext(input.operatingContext);
    const governance = defaultGovernance(operatingContext, narrative);
    return {
      id: id('matter'),
      title: clamp(input.title || 'Nuova segnalazione', 300),
      kind: clamp(input.kind || 'event', 40),
      operatingContext,
      narrative,
      state: 'facts-to-confirm',
      owner: governance.owner,
      raci: governance.raci,
      timeline: [],
      phaseEvidence: {}
    };
  }

  function validateIncidentTransition(matter, to, evidence) {
    const phase = phaseByTransition.get(`${matter.state}->${to}`);
    if (!phase) throw new Error(`Transizione non descritta da ${matter.state} a ${to}.`);
    const clean = {};
    for (const field of phase.fields) {
      const value = clamp(evidence?.[field.id], 4000);
      if (field.required && !value) throw new Error(`${field.label}: valore obbligatorio.`);
      if (field.options && value && !field.options.some(option => option[0] === value)) {
        throw new Error(`${field.label}: valore non valido.`);
      }
      clean[field.id] = value;
    }
    return { phase, clean };
  }

  return Object.freeze({
    normalizeOperatingContext,
    createMonitoring,
    scheduleMonitoring,
    createManualSource,
    createIncident,
    validateIncidentTransition
  });
}

export const runtimeModelInternals = Object.freeze({ validateHttpUrl, classifyEcosystem, interval });
