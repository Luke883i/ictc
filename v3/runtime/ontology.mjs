function frozen(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const item of Object.values(value)) frozen(item);
  return Object.freeze(value);
}

const ONTOLOGY = frozen({
  schemaVersion: '1.0.0',
  locale: 'it',
  authority: 'runtime',
  processes: {
    monitoring: { id: 'monitoring', code: 'RN-01', label: 'Monitoraggio normativo', kind: 'service', service: 'monitoring' },
    incidents: { id: 'incidents', code: 'EC-01', label: 'Gestione eventi e segnalazioni', kind: 'service', service: 'incidents' },
    evidence: { id: 'evidence', code: 'EV-01', label: 'Evidenze e controlli', kind: 'assurance', service: 'proof' },
    administration: { id: 'administration', code: null, label: 'Amministrazione', kind: 'control-plane', service: null },
    identity: { id: 'identity', code: 'IA-01', label: 'Identità e accessi', kind: 'subprocess', service: 'administration' },
    ai: { id: 'ai', code: 'GA-01', label: 'Governo dei servizi AI', kind: 'subprocess', service: 'administration' }
  },
  objects: {
    monitoring: { singular: 'Monitoraggio', plural: 'Monitoraggi' },
    source: { singular: 'Fonte', plural: 'Fonti' },
    material: { singular: 'Materiale', plural: 'Materiali' },
    incident: { singular: 'Evento', plural: 'Eventi' },
    evidence: { singular: 'Evidenza', plural: 'Evidenze' },
    identity: { singular: 'Identità', plural: 'Identità' },
    aiService: { singular: 'Servizio AI', plural: 'Servizi AI' }
  },
  states: {
    source: {
      candidate: 'Da valutare', verified: 'Accettata nel catalogo', rejected: 'Esclusa dal catalogo', superseded: 'Superata'
    },
    monitoring: {
      planning: 'Pianificazione in corso', 'needs-plan': 'Pianificazione non riuscita', draft: 'Da approvare', active: 'Attivo', paused: 'In pausa'
    },
    contribution: {
      intake: 'Registrato', 'needs-enrichment': 'Analisi da completare', enriched: 'Arricchito'
    },
    incident: {
      intake: 'Registrato', clarifying: 'Informazioni richieste', review: 'Da approvare', submitted: 'Inviato', closed: 'Chiuso'
    },
    procedure: {
      ready: 'Operativa', attention: 'Richiede attenzione'
    }
  },
  ctas: {
    monitoring: { admin: 'Apri monitoraggio', user: 'Consulta e contribuisci', auditor: 'Consulta monitoraggio' },
    incidents: { admin: 'Apri eventi', user: 'Registra o continua', auditor: 'Consulta eventi' },
    evidence: { default: 'Apri evidenze' },
    administration: { admin: 'Apri amministrazione' }
  },
  boundary: [
    'Le etichette descrivono il vocabolario operativo dell’interfaccia e non modificano gli identificativi persistiti.',
    'I nomi e gli stati non attestano validità normativa, applicabilità, conformità o certificazione.'
  ]
});

function requireTerm(group, id) {
  const term = ONTOLOGY[group]?.[id];
  if (!term) {
    const error = new Error(`Ontologia runtime incompleta: ${group}.${id}`);
    error.code = 'runtime-ontology-missing-term';
    throw error;
  }
  return term;
}

export function processTerm(id) {
  return requireTerm('processes', id);
}

export function objectTerm(id) {
  return requireTerm('objects', id);
}

export function stateTerm(family, id) {
  const familyTerms = requireTerm('states', family);
  const label = familyTerms[id];
  if (!label) {
    const error = new Error(`Ontologia runtime incompleta: states.${family}.${id}`);
    error.code = 'runtime-ontology-missing-term';
    throw error;
  }
  return label;
}

export function procedureActionLabel(id, role) {
  const terms = requireTerm('ctas', id);
  const label = terms[role] || terms.default;
  if (!label) {
    const error = new Error(`Ontologia runtime incompleta: ctas.${id}.${role}`);
    error.code = 'runtime-ontology-missing-term';
    throw error;
  }
  return label;
}

export function runtimeOntologyProjection() {
  return JSON.parse(JSON.stringify(ONTOLOGY));
}
