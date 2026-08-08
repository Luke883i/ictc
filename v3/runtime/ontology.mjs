import { processKernelProjection } from './process-kernel.mjs';
function frozen(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; for (const item of Object.values(value)) frozen(item); return Object.freeze(value); }
const kernel = processKernelProjection();
const processTerms = Object.fromEntries(kernel.processes.map(item => [item.id, { id: item.id, code: item.code, label: item.label, kind: item.kind, service: item.service, archetype: item.archetype, parent: item.parent || null, surface: Boolean(item.surface) }]));
const ctas = Object.fromEntries(kernel.processes.map(item => [item.id, Object.fromEntries(Object.entries(item.roleModes || {}).map(([role, mode]) => [role, mode.actionLabel]))]));
const ONTOLOGY = frozen({
  schemaVersion: '1.3.0', locale: 'it', authority: 'runtime', archetypes: kernel.archetypes, processes: processTerms, relations: kernel.relations,
  objects: { monitoring: { singular: 'Monitoraggio', plural: 'Monitoraggi' }, source: { singular: 'Fonte', plural: 'Fonti' }, material: { singular: 'Materiale', plural: 'Materiali' }, incident: { singular: 'Evento', plural: 'Eventi' }, evidence: { singular: 'Evidenza', plural: 'Evidenze' }, identity: { singular: 'Identità', plural: 'Identità' }, aiService: { singular: 'Servizio AI', plural: 'Servizi AI' } },
  epistemicStates: {
    original: { 'preserved-original': 'Originale preservato', observed: 'Osservato', unavailable: 'Non disponibile' },
    proposal: { none: 'Nessuna proposta AI', 'ai-proposed': 'Proposto dall’AI' },
    checkpoint: { 'awaiting-human-decision': 'In attesa di decisione umana', 'human-reviewed': 'Rivisto da una persona', 'human-verified': 'Verificato da una persona', 'human-rejected': 'Respinto da una persona', superseded: 'Superato' },
    availability: { available: 'Disponibile', unavailable: 'Non disponibile' }, assessment: { 'not-assessed': 'Non valutato' }
  },
  states: { source: { candidate: 'Da valutare', verified: 'Accettata nel catalogo', rejected: 'Esclusa dal catalogo', superseded: 'Superata' }, monitoring: { planning: 'Pianificazione in corso', 'needs-plan': 'Pianificazione non riuscita', draft: 'Da approvare', active: 'Attivo', paused: 'In pausa' }, contribution: { intake: 'Registrato', 'needs-enrichment': 'Analisi da completare', enriched: 'Arricchito' }, incident: { intake: 'Registrato', clarifying: 'Informazioni richieste', review: 'Da approvare', submitted: 'Inviato', closed: 'Chiuso' }, procedure: { ready: 'Operativa', attention: 'Richiede attenzione' } },
  ctas,
  boundary: ['Le etichette descrivono il vocabolario operativo dell’interfaccia e non modificano gli identificativi persistiti.', 'ProcessDefinition e relation grammar sono runtime semantics; non attestano validità normativa, applicabilità, conformità o certificazione.']
});
function requireTerm(group, id) { const term = ONTOLOGY[group]?.[id]; if (!term) { const error = new Error(`Ontologia runtime incompleta: ${group}.${id}`); error.code = 'runtime-ontology-missing-term'; throw error; } return term; }
export function processTerm(id) { return requireTerm('processes', id); }
export function objectTerm(id) { return requireTerm('objects', id); }
export function stateTerm(family, id) { const familyTerms = requireTerm('states', family); const label = familyTerms[id]; if (!label) { const error = new Error(`Ontologia runtime incompleta: states.${family}.${id}`); error.code = 'runtime-ontology-missing-term'; throw error; } return label; }
export function procedureActionLabel(id, role) { const terms = requireTerm('ctas', id); const label = terms[role] || terms.default; if (!label) { const error = new Error(`Ontologia runtime incompleta: ctas.${id}.${role}`); error.code = 'runtime-ontology-missing-term'; throw error; } return label; }
export function runtimeOntologyProjection() { return JSON.parse(JSON.stringify(ONTOLOGY)); }
