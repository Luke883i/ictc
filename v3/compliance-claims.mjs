const POLICIES = Object.freeze({
  'implemented-baseline': Object.freeze({ level: 'implemented-practice', label: 'Pratica implementata', evidenceState: 'repository-evidence', externalAssessmentRequired: true }),
  'aligned-and-evidenced': Object.freeze({ level: 'evidenced-practice', label: 'Pratica con evidenze', evidenceState: 'repository-evidence', externalAssessmentRequired: true }),
  'external-validation-required': Object.freeze({ level: 'external-assessment-required', label: 'Valutazione esterna richiesta', evidenceState: 'external-evidence-required', externalAssessmentRequired: true }),
  'practice-inspired': Object.freeze({ level: 'practice-reference', label: 'Pratica di riferimento', evidenceState: 'design-reference', externalAssessmentRequired: true }),
  'context-only': Object.freeze({ level: 'context-only', label: 'Solo contesto', evidenceState: 'context-only', externalAssessmentRequired: true })
});

export const COMPLIANCE_SEMANTICS = Object.freeze({
  model: 'selected-practice-evidence-v1',
  mappingScope: 'selected-practice',
  standardConclusion: 'not-assessed',
  rule: 'Il mapping prova solo la pratica selezionata entro le evidenze elencate; l esito sullo standard nel suo complesso resta non valutato.'
});

export function complianceClaimFor(item) {
  const policy = POLICIES[item?.alignment];
  if (!policy) throw new Error(`unknown-standard-alignment:${item?.alignment || 'missing'}`);
  const evidenceRefs = Array.isArray(item?.evidence) ? item.evidence.filter(Boolean) : [];
  if (!evidenceRefs.length) throw new Error('standard-mapping-without-evidence');
  const limitation = String(item?.limit || '').trim();
  if (limitation.length < 20) throw new Error('standard-mapping-without-limitation');
  return Object.freeze({
    scope: COMPLIANCE_SEMANTICS.mappingScope,
    level: policy.level,
    label: policy.label,
    evidenceState: policy.evidenceState,
    evidenceRefs,
    externalAssessmentRequired: policy.externalAssessmentRequired,
    standardConclusion: COMPLIANCE_SEMANTICS.standardConclusion,
    limitation,
    statement: COMPLIANCE_SEMANTICS.rule
  });
}

export function projectBenchmarkFamily(item) {
  return Object.freeze({
    ...structuredClone(item),
    sourceAlignment: item.alignment,
    complianceClaim: complianceClaimFor(item)
  });
}
