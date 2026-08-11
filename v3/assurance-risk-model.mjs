export const ASSURANCE_COVERAGE_CONTRACT = Object.freeze({
  syntax: Object.freeze({ mode: 'semantic', candidates: Object.freeze(['scripts/syntax-check.mjs']) }),
  productContract: Object.freeze({ mode: 'semantic', candidates: Object.freeze(['v3/product-contract-check.mjs']) }),
  procedureAuthority: Object.freeze({ mode: 'semantic', candidates: Object.freeze(['v3/procedure-contracts-check.mjs','v3/procedure-policy-check.mjs','v3/write-authority-census-check.mjs']) }),
  epistemicCausality: Object.freeze({ mode: 'semantic', candidates: Object.freeze(['v3/epistemic-lattice-check.mjs','v3/epistemic-causality-check.mjs','v3/semantic-integrity-authority-dod.mjs']) }),
  experience: Object.freeze({ mode: 'semantic', candidates: Object.freeze(['v3/procedure-journey-2-1-check.mjs','v3/ui-active-experience-audit.mjs']) }),
  securityBoundary: Object.freeze({ mode: 'semantic', candidates: Object.freeze(['v3/security-boundary-check.mjs','v3/ai-network-policy-check.mjs','v3/security-static-analysis-posture.mjs']) }),
  documentationAuthority: Object.freeze({ mode: 'semantic', candidates: Object.freeze(['v3/documentation-authority-check.mjs']) }),
  falsification: Object.freeze({ mode: 'semantic', candidates: Object.freeze(['v3/semantic-falsification-check.mjs','v3/semantic-closure-saturation.mjs']) }),
  persistence: Object.freeze({ mode: 'runtime', candidates: Object.freeze(['v3/store-durability-check.mjs','v3/semantic-integrity-root-check.mjs']) }),
  authorization: Object.freeze({ mode: 'runtime', candidates: Object.freeze(['v3/evidence-export-auth-check.mjs','v3/procedure-policy-check.mjs']) }),
  runtimeE2e: Object.freeze({ mode: 'runtime', candidates: Object.freeze(['v3/v15-e2e.mjs','v3/semantic-closure-runtime-check.mjs']) }),
  evidence: Object.freeze({ mode: 'runtime', candidates: Object.freeze(['v3/evidence-check.mjs','v3/attachment-replay-check.mjs']) }),
  deliveryAssurance: Object.freeze({ mode: 'semantic', candidates: Object.freeze(['v3/assurance-risk-check.mjs']) })
});

export const ASSURANCE_RISK_CODES = Object.freeze({
  PREVENTIVE_GOVERNANCE_GAP: 'preventive-governance-gap',
  INDEPENDENT_REVIEW_GAP: 'independent-review-gap',
  CORRELATED_ASSURANCE_GAP: 'correlated-assurance-gap',
  REVIEW_BANDWIDTH_GAP: 'review-bandwidth-gap',
  COMPLEXITY_RATCHET: 'complexity-ratchet',
  COVERAGE_REGRESSION: 'coverage-regression',
  EXACT_HEAD_GAP: 'exact-head-gap',
  CLAIM_TRUTH_GAP: 'claim-truth-gap',
  MUTATION_SENSITIVITY_GAP: 'mutation-sensitivity-gap',
  INPUT_CONTRACT_GAP: 'input-contract-gap',
  POST_ACCEPTANCE_DETECTION_GAP: 'post-acceptance-detection-gap',
  DIRECT_PUSH_PATH: 'direct-push-path'
});

const LARGE_SURFACES = new Set(['large','massive']);
const BOOLEAN_FIELDS = Object.freeze(['branchProtection','independentReviewer','externalStaticAnalysis','exactHeadEvidence','postMergeEvidence','coveragePreserved','mutationSensitivity','skippedExternalTruthful']);
const ENUM_FIELDS = Object.freeze({
  changeSurface: Object.freeze(['small','medium','large','massive']),
  modelOracleCoupling: Object.freeze(['independent','partial','same-circuit']),
  suiteChange: Object.freeze(['contraction','flat','expansion']),
  coverageContract: Object.freeze(['coverage','minimum-count']),
  deliveryMode: Object.freeze(['pr','direct-push'])
});
const ALLOWED_FIELDS = new Set([...BOOLEAN_FIELDS,...Object.keys(ENUM_FIELDS)]);
const ENUM_FALLBACKS = Object.freeze({ changeSurface:'massive', modelOracleCoupling:'same-circuit', suiteChange:'contraction', coverageContract:'minimum-count', deliveryMode:'direct-push' });

function normalizeScenario(input) {
  const raw = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const issues = [];
  if (raw !== input) issues.push('input:plain-object-required');
  for (const key of Object.keys(raw)) if (!ALLOWED_FIELDS.has(key)) issues.push(`${key}:unknown-field`);
  const scenario = {};
  for (const key of BOOLEAN_FIELDS) {
    if (typeof raw[key] !== 'boolean') {
      issues.push(`${key}:boolean-required`);
      scenario[key] = false;
    } else scenario[key] = raw[key];
  }
  for (const [key,domain] of Object.entries(ENUM_FIELDS)) {
    if (!domain.includes(raw[key])) {
      issues.push(`${key}:enum-required`);
      scenario[key] = ENUM_FALLBACKS[key];
    } else scenario[key] = raw[key];
  }
  return { scenario:Object.freeze(scenario), validationIssues:Object.freeze(issues.sort()) };
}

export function evaluateAssuranceScenario(input) {
  const { scenario, validationIssues } = normalizeScenario(input);
  const risks = new Set();

  if (validationIssues.length) risks.add(ASSURANCE_RISK_CODES.INPUT_CONTRACT_GAP);
  if (!scenario.branchProtection) risks.add(ASSURANCE_RISK_CODES.PREVENTIVE_GOVERNANCE_GAP);
  if (!scenario.independentReviewer) risks.add(ASSURANCE_RISK_CODES.INDEPENDENT_REVIEW_GAP);
  if (scenario.modelOracleCoupling === 'same-circuit' && !scenario.externalStaticAnalysis) risks.add(ASSURANCE_RISK_CODES.CORRELATED_ASSURANCE_GAP);
  if (LARGE_SURFACES.has(scenario.changeSurface) && !scenario.independentReviewer) risks.add(ASSURANCE_RISK_CODES.REVIEW_BANDWIDTH_GAP);
  if (scenario.suiteChange === 'contraction' && scenario.coveragePreserved && scenario.coverageContract === 'minimum-count') risks.add(ASSURANCE_RISK_CODES.COMPLEXITY_RATCHET);
  if (!scenario.coveragePreserved) risks.add(ASSURANCE_RISK_CODES.COVERAGE_REGRESSION);
  if (!scenario.exactHeadEvidence) risks.add(ASSURANCE_RISK_CODES.EXACT_HEAD_GAP);
  if (!scenario.skippedExternalTruthful) risks.add(ASSURANCE_RISK_CODES.CLAIM_TRUTH_GAP);
  if (!scenario.mutationSensitivity) risks.add(ASSURANCE_RISK_CODES.MUTATION_SENSITIVITY_GAP);
  if (!scenario.branchProtection && !scenario.postMergeEvidence) risks.add(ASSURANCE_RISK_CODES.POST_ACCEPTANCE_DETECTION_GAP);
  if (scenario.deliveryMode === 'direct-push') risks.add(ASSURANCE_RISK_CODES.DIRECT_PUSH_PATH);

  return Object.freeze({
    scenario,
    validationIssues,
    risks: Object.freeze([...risks].sort()),
    containment: Object.freeze({
      preventionExternal: !scenario.branchProtection,
      reviewExternal: !scenario.independentReviewer,
      independentOracleNeeded: scenario.modelOracleCoupling === 'same-circuit' && !scenario.externalStaticAnalysis,
      safeSuiteContraction: scenario.suiteChange === 'contraction' && scenario.coveragePreserved && scenario.coverageContract === 'coverage'
    })
  });
}
