import { canonicalDecisionProjection } from './decision-projection.mjs';

function canReadIncident(actor, incident) { return actor.role === 'admin' || actor.role === 'auditor' || incident.createdBy === actor.id; }
function aiProposed(value) { return Boolean(value?.aiTrace || value?.analysisTrace || value?.draftTrace || (value?.observations || []).some(item => item.aiTrace)); }
function sourceCheckpoint(source) {
  if (source.state === 'verified') return 'human-verified';
  if (source.state === 'rejected') return 'human-rejected';
  if (source.state === 'superseded') return 'superseded';
  return 'awaiting-human-decision';
}
function sourceAvailability(source) { return source.sourceUrl || source.identifier || source.internalReference?.masterId ? 'available' : 'unavailable'; }
function decisionRefs(decisions, type, id) { return decisions.records.filter(item => item.subject.type === type && item.subject.id === id).map(item => item.id); }
function sourceRecord(source, decisions) {
  return {
    schemaVersion: '1.0.0', id: `epistemic:catalog:${source.id}`, subject: { type: 'catalog', id: source.id },
    authorityMode: source.internalReference ? 'external-master' : 'external-source',
    facets: { original: (source.observations || []).length ? 'observed' : 'unavailable', proposal: aiProposed(source) ? 'ai-proposed' : 'none', checkpoint: sourceCheckpoint(source), availability: sourceAvailability(source), assessment: 'not-assessed' },
    decisionRefs: decisionRefs(decisions, 'catalog', source.id),
    limitations: ['Una fonte verificata registra una decisione umana ICTC sulla versione osservata; non determina applicabilità o conformità.']
  };
}
function incidentCheckpoint(incident) {
  if (incident.state === 'submitted' || incident.state === 'closed') return 'human-reviewed';
  if (Object.keys(incident.answers || {}).length || (incident.formulationVersions || []).some(item => String(item.source || '').startsWith('human'))) return 'human-reviewed';
  return 'awaiting-human-decision';
}
function incidentRecord(incident, decisions) {
  return {
    schemaVersion: '1.0.0', id: `epistemic:incident:${incident.id}`, subject: { type: 'incident', id: incident.id }, authorityMode: 'human-organizational',
    facets: { original: incident.originalNarrative ? 'preserved-original' : 'unavailable', proposal: aiProposed(incident) ? 'ai-proposed' : 'none', checkpoint: incidentCheckpoint(incident), availability: incident.originalNarrative ? 'available' : 'unavailable', assessment: 'not-assessed' },
    decisionRefs: decisionRefs(decisions, 'incident', incident.id),
    limitations: ['Human-reviewed descrive adozioni, formulazioni o conferme registrate; non equivale a qualificazione giuridica o obbligo di notifica.']
  };
}
export function canonicalEpistemicProjection(state, actor) {
  const decisions = canonicalDecisionProjection(state, actor);
  const records = [...(state.catalog || []).map(item => sourceRecord(item, decisions)), ...(state.incidents || []).filter(item => canReadIncident(actor, item)).map(item => incidentRecord(item, decisions))];
  return {
    schemaVersion: '1.0.0', authority: 'runtime-epistemic-projection', records,
    grammar: {
      original: ['preserved-original', 'observed', 'unavailable'],
      proposal: ['none', 'ai-proposed'],
      checkpoint: ['awaiting-human-decision', 'human-reviewed', 'human-verified', 'human-rejected', 'superseded'],
      availability: ['available', 'unavailable'],
      assessment: ['not-assessed']
    },
    invariants: ['ai-proposed never implies human-reviewed or human-verified', 'unknown, unavailable and not-assessed are not interchangeable', 'epistemic state is derived and does not mutate authoritative records']
  };
}
