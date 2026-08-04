import { asString, uniqueStrings } from './domain.mjs';

const definitions = Object.freeze([
  {
    id: 'classification', phase: 'clarifying', type: 'select', options: ['event', 'near-miss', 'incident', 'unknown'], requiredForSubmission: true,
    label: 'Come descriveresti oggi questo episodio?',
    whyNow: 'Il racconto originale è già al sicuro. Ora serve una classificazione umana distinta dalla proposta AI.',
    evidenceUse: 'Registra la classificazione scelta dalla persona senza modificare il racconto originario.',
    trigger: incident => !answerPresent(incident, 'classification')
  },
  {
    id: 'affectedServices', phase: 'clarifying', type: 'text', requiredForSubmission: true,
    label: 'Che cosa potrebbe essere coinvolto?',
    whyNow: 'Nel racconto non è ancora chiaro il perimetro operativo interessato.',
    evidenceUse: 'Collega i fatti a servizi, sistemi o processi indicati dalla persona.',
    trigger: incident => !answerPresent(incident, 'affectedServices') && !(incident.analysis?.affectedServices || []).length
  },
  {
    id: 'impact', phase: 'clarifying', type: 'textarea', requiredForSubmission: true,
    label: 'Quali conseguenze sono note o possibili?',
    whyNow: 'La formulazione deve distinguere ciò che è già accaduto da ciò che potrebbe accadere.',
    evidenceUse: 'Conserva la valutazione umana dell’impatto senza decidere la significatività normativa.',
    trigger: incident => !answerPresent(incident, 'impact') && !asString(incident.analysis?.impact)
  },
  {
    id: 'actionsTaken', phase: 'clarifying', type: 'textarea', requiredForSubmission: true,
    label: 'Che cosa è già stato fatto?',
    whyNow: 'Serve a separare i fatti dalle attività di verifica, contenimento o recupero già avviate.',
    evidenceUse: 'Costruisce la cronologia delle azioni dichiarate.',
    trigger: incident => !answerPresent(incident, 'actionsTaken') && !(incident.analysis?.mitigations || []).length
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

export function deriveQuestions(incident) {
  if (!incident?.originalNarrative || !incident?.awarenessAt || ['submitted', 'closed'].includes(incident.state)) return [];
  return definitions.filter(definition => definition.trigger(incident)).map(({ trigger, ...question }) => question);
}
export function nextQuestion(incident) { return deriveQuestions(incident)[0] || null; }
export function allQuestionDefinitions() { return definitions.map(({ trigger, ...question }) => question); }
export function applyAnswers(incident, input, actor) {
  const available = new Map(deriveQuestions(incident).map(item => [item.id, item]));
  const updates = Array.isArray(input.answers) ? input.answers : [];
  for (const raw of updates) {
    const id = asString(raw.id, 80);
    const definition = available.get(id);
    if (!definition) continue;
    const unknown = Boolean(raw.unknown);
    const value = unknown ? '' : asString(raw.value, 10_000);
    if (!unknown && !value) continue;
    if (definition.type === 'select' && !unknown && !definition.options.includes(value)) continue;
    incident.answers[id] = {
      value, unknown, answeredAt: new Date().toISOString(), answeredBy: actor.id,
      whyNow: definition.whyNow, evidenceUse: definition.evidenceUse
    };
  }
  return deriveQuestions(incident);
}
export function submissionReadiness(incident) {
  const required = definitions.filter(item => item.requiredForSubmission);
  const missing = required.filter(item => item.trigger(incident) && !answerPresent(incident, item.id)).map(item => item.id);
  return { ready: missing.length === 0 && Boolean(asString(incident.finalNarrative || incident.draft?.narrative)), missing };
}
export const questionInternals = Object.freeze({ definitions, answerPresent, hasSignal });
