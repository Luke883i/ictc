import { sha256 } from '../domain.mjs';

function humanActor(id, role = null) {
  return { id: String(id || 'unknown-human'), role: role || null, authority: 'human' };
}
function decisionId(core) { return `decision-${sha256(core).slice(0, 24)}`; }
function record({ kind, checkpoint, outcome, reason = '', at, actorId, actorRole = null, subjectType, subjectId, versionKind, versionSha256, proposalSha256 = null, legacy = false }) {
  const core = {
    schemaVersion: '1.0.0', kind, checkpoint, outcome, reason: String(reason || ''), at: at || null,
    actor: humanActor(actorId, actorRole), authority: 'human',
    subject: { type: subjectType, id: subjectId },
    subjectVersion: { kind: versionKind, sha256: String(versionSha256 || '') },
    proposalSha256: proposalSha256 || null,
    legacyProjection: Boolean(legacy)
  };
  return { id: decisionId(core), ...core };
}
function answerDigest(answer) { return sha256({ value: answer?.value || '', unknown: Boolean(answer?.unknown) }); }
function canReadIncident(actor, incident) { return actor.role === 'admin' || actor.role === 'auditor' || incident.createdBy === actor.id; }

export function sourceDecisionRecords(source) {
  return (source.decisions || []).map(item => record({
    kind: 'source-review', checkpoint: 'source-review', outcome: item.decision,
    reason: item.reason, at: item.at, actorId: item.by,
    subjectType: 'catalog', subjectId: source.id,
    versionKind: 'source-observation-sha256', versionSha256: item.observationSha256,
    legacy: !item.schemaVersion
  }));
}
export function incidentDecisionRecords(incident) {
  const records = [];
  for (const [questionId, answer] of Object.entries(incident.answers || {})) {
    if (!answer?.answeredBy) continue;
    records.push(record({
      kind: 'incident-answer-adoption', checkpoint: 'case-review', outcome: answer.adoption || 'human-entered',
      reason: answer.evidenceUse || '', at: answer.answeredAt, actorId: answer.answeredBy,
      subjectType: 'incident', subjectId: incident.id,
      versionKind: `answer:${questionId}:sha256`, versionSha256: answerDigest(answer),
      proposalSha256: answer.suggestedValue ? sha256(answer.suggestedValue) : null,
      legacy: true
    }));
  }
  const submission = incident.submissionConfirmation;
  if (submission?.by && submission?.formulationSha256) records.push(record({
    kind: 'incident-submission', checkpoint: 'case-submit', outcome: 'submitted', reason: 'Explicit human confirmation of the current formulation digest.',
    at: submission.at || incident.submittedAt, actorId: submission.by,
    subjectType: 'incident', subjectId: incident.id,
    versionKind: 'formulation-sha256', versionSha256: submission.formulationSha256,
    legacy: true
  }));
  if (incident.closedBy && incident.closedAt) records.push(record({
    kind: 'incident-closure', checkpoint: 'case-close', outcome: 'closed', reason: incident.closureNote || '',
    at: incident.closedAt, actorId: incident.closedBy,
    subjectType: 'incident', subjectId: incident.id,
    versionKind: 'formulation-sha256', versionSha256: submission?.formulationSha256 || incident.formulationVersions?.at(-1)?.sha256 || '',
    legacy: true
  }));
  return records;
}
export function canonicalDecisionProjection(state, actor) {
  const sources = (state.catalog || []).flatMap(sourceDecisionRecords);
  const incidents = (state.incidents || []).filter(item => canReadIncident(actor, item)).flatMap(incidentDecisionRecords);
  return {
    schemaVersion: '1.0.0', authority: 'human-decision-projection',
    records: [...sources, ...incidents].sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')) || a.id.localeCompare(b.id)),
    limitations: [
      'DecisionRecord normalizza checkpoint e version binding senza fondere il significato specifico delle decisioni di fonte, adozione, invio o chiusura.',
      'La projection ricostruisce anche record storici; legacyProjection=true segnala che il record è derivato da campi persistiti preesistenti.'
    ]
  };
}
