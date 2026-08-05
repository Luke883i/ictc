import { asString, uniqueStrings, sha256 } from './domain.mjs';

const definitions = Object.freeze([
  {
    id: 'classification', phase: 'clarifying', type: 'select', options: ['event', 'near-miss', 'incident', 'unknown'], requiredForSubmission: true,
    label: 'Come descriveresti oggi questo episodio?',
    whyNow: 'Il racconto originale è già al sicuro. Ora serve una classificazione umana distinta dalla proposta AI.',
    evidenceUse: 'Registra la classificazione scelta dalla persona senza modificare il racconto originario.',
    trigger: incident => !answerPresent(incident, 'classification'),
    suggestion: incident => asString(incident.analysis?.proposedKind, 80)
  },
  {
    id: 'affectedServices', phase: 'clarifying', type: 'text', requiredForSubmission: true,
    label: 'Che cosa potrebbe essere coinvolto?',
    whyNow: 'L’AI può proporre un perimetro, ma una persona deve confermarlo o correggerlo prima che diventi dato del fascicolo.',
    evidenceUse: 'Registra servizi, sistemi o processi adottati dalla persona e conserva separatamente la proposta AI.',
    trigger: incident => !answerPresent(incident, 'affectedServices'),
    suggestion: incident => uniqueStrings(incident.analysis?.affectedServices || []).join(', ')
  },
  {
    id: 'impact', phase: 'clarifying', type: 'textarea', requiredForSubmission: true,
    label: 'Quali conseguenze sono note o possibili?',
    whyNow: 'La proposta AI sull’impatto non può diventare prova senza una conferma o una correzione umana esplicita.',
    evidenceUse: 'Conserva la valutazione adottata dalla persona senza decidere la significatività normativa.',
    trigger: incident => !answerPresent(incident, 'impact'),
    suggestion: incident => asString(incident.analysis?.impact, 10_000)
  },
  {
    id: 'actionsTaken', phase: 'clarifying', type: 'textarea', requiredForSubmission: true,
    label: 'Che cosa è già stato fatto?',
    whyNow: 'Le mitigazioni estratte dall’AI devono essere confermate o corrette da chi conosce le attività realmente eseguite.',
    evidenceUse: 'Costruisce la cronologia delle azioni dichiarate e distingue la proposta AI dall’adozione umana.',
    trigger: incident => !answerPresent(incident, 'actionsTaken'),
    suggestion: incident => uniqueStrings(incident.analysis?.mitigations || []).join(', ')
  },
  {
    id: 'ongoing', phase: 'clarifying', type: 'select', options: ['yes', 'no', 'unknown'], requiredForSubmission: false,
    label: 'Sta ancora accadendo?',
    whyNow: 'L’analisi ha rilevato segnali di attività non conclusa.',
    evidenceUse: 'Contestualizza lo stato temporale senza sostituire il triage tecnico.',
    trigger: incident => hasSignal(incident, 'ongoing') && !answerPresent(incident, 'ongoing')
  },
  {
    id: 'personalData', phase: 'clarifying', type: 'select', options: ['yes', 'no', 'unknown'], requiredForSubmission: false,
    label: 'Potrebbero esserci dati personali?',
    whyNow: 'Nel racconto o negli allegati compaiono elementi compatibili con dati personali.',
    evidenceUse: 'Registra un’indicazione da valutare; non determina un data breach.',
    trigger: incident => hasSignal(incident, 'personal-data') && !answerPresent(incident, 'personalData')
  },
  {
    id: 'maliciousActivity', phase: 'clarifying', type: 'select', options: ['yes', 'no', 'unknown'], requiredForSubmission: false,
    label: 'Ci sono indizi di un’azione intenzionale?',
    whyNow: 'L’analisi ha rilevato indicatori compatibili con attività intenzionale.',
    evidenceUse: 'Conserva la valutazione umana separata dall’ipotesi AI.',
    trigger: incident => hasSignal(incident, 'malicious') && !answerPresent(incident, 'maliciousActivity')
  },
  {
    id: 'crossBorder', phase: 'clarifying', type: 'select', options: ['yes', 'no', 'unknown'], requiredForSubmission: false,
    label: 'Potrebbe riguardare più paesi?',
    whyNow: 'Sono emersi riferimenti a servizi, utenti o infrastrutture in più giurisdizioni.',
    evidenceUse: 'Documenta la possibile dimensione transfrontaliera senza concludere obblighi.',
    trigger: incident => hasSignal(incident, 'cross-border') && !answerPresent(incident, 'crossBorder')
  },
  {
    id: 'detectedAt', phase: 'clarifying', type: 'datetime-local', requiredForSubmission: false,
    label: 'Quando è stato rilevato tecnicamente?',
    whyNow: 'La data di conoscenza è nota, ma la sequenza tecnica richiede un secondo riferimento.',
    evidenceUse: 'Distingue rilevazione tecnica e conoscenza organizzativa.',
    trigger: incident => hasSignal(incident, 'technical-detection') && !answerPresent(incident, 'detectedAt')
  }
]);

function answerPresent(incident, id) {
  const answer = incident.answers?.[id];
  return Boolean(answer && (answer.unknown || String(answer.value ?? '').trim()));
}
function hasSignal(incident, signal) { return uniqueStrings(incident.analysis?.signals || []).includes(signal); }
function suggestionValue(definition, incident) {
  return typeof definition.suggestion === 'function' ? asString(definition.suggestion(incident), 10_000) : '';
}
function publicQuestion(definition, incident = null) {
  const { trigger, suggestion, ...question } = definition;
  const suggestedValue = incident ? suggestionValue(definition, incident) : '';
  return suggestedValue ? { ...question, suggestedValue } : question;
}

export function deriveQuestions(incident) {
  if (!incident?.originalNarrative || !incident?.awarenessAt || ['submitted', 'closed'].includes(incident.state)) return [];
  return definitions.filter(definition => definition.trigger(incident)).map(definition => publicQuestion(definition, incident));
}
export function nextQuestion(incident) { return deriveQuestions(incident)[0] || null; }
export function allQuestionDefinitions() { return definitions.map(definition => publicQuestion(definition)); }
export function applyAnswers(incident, input, actor) {
  const available = new Map(definitions.filter(item => item.trigger(incident)).map(item => [item.id, item]));
  const updates = Array.isArray(input.answers) ? input.answers : [];
  for (const raw of updates) {
    const id = asString(raw.id, 80);
    const definition = available.get(id);
    if (!definition) continue;
    const unknown = Boolean(raw.unknown);
    const value = unknown ? '' : asString(raw.value, 10_000);
    if (!unknown && !value) continue;
    if (definition.type === 'select' && !unknown && !definition.options.includes(value)) continue;
    const suggestedValue = suggestionValue(definition, incident);
    incident.answers[id] = {
      value, unknown, answeredAt: new Date().toISOString(), answeredBy: actor.id,
      whyNow: definition.whyNow, evidenceUse: definition.evidenceUse,
      suggestedValue: suggestedValue || null,
      adoption: unknown ? 'unknown' : suggestedValue && value === suggestedValue ? 'ai-suggestion-confirmed' : 'human-corrected-or-entered'
    };
  }
  incident.formulationDirty = true;
  return deriveQuestions(incident);
}
export function currentFormulation(incident) {
  return (incident.formulationVersions || []).at(-1) || null;
}
export function formulationRecord(text, source, actor, trace = null) {
  const narrative = asString(text, 50_000);
  return { id: `form-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, narrative, source, at: new Date().toISOString(), by: actor.id, sha256: sha256(narrative), trace };
}
export function submissionReadiness(incident) {
  const required = definitions.filter(item => item.requiredForSubmission);
  const missing = required.filter(item => !answerPresent(incident, item.id)).map(item => item.id);
  const formulation = currentFormulation(incident);
  if (!formulation || incident.formulationDirty) missing.push('formulation');
  return { ready: missing.length === 0, missing };
}
export const questionInternals = Object.freeze({ definitions, answerPresent, hasSignal, suggestionValue });
