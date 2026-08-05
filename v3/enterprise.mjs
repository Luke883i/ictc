import { asString, now } from './domain.mjs';

export const ENTERPRISE_ROLES = Object.freeze(['admin', 'user', 'auditor']);

const DEFAULT_GOVERNANCE = Object.freeze({
  monthlyBudgetUsd: 250,
  warningPercent: 80,
  inputCostPerMillion: 2.5,
  outputCostPerMillion: 10,
  retentionDays: 365,
  incidentSlaHours: 24,
  dataRegion: 'eu',
  allowedModels: [],
  requireHumanApproval: true
});

function defaultUsers() {
  const createdAt = now();
  return [
    { id: 'local-admin', displayName: 'Amministratore locale', email: '', role: 'admin', status: 'active', createdAt },
    { id: 'local-user', displayName: 'Utente locale', email: '', role: 'user', status: 'active', createdAt },
    { id: 'local-auditor', displayName: 'Auditor locale', email: '', role: 'auditor', status: 'active', createdAt }
  ];
}

export async function ensureEnterpriseState(store) {
  const state = store.state;
  let changed = false;
  if (!Array.isArray(state.users)) { state.users = defaultUsers(); changed = true; }
  if (!state.settings.governance) { state.settings.governance = structuredClone(DEFAULT_GOVERNANCE); changed = true; }
  else {
    for (const [key, value] of Object.entries(DEFAULT_GOVERNANCE)) if (state.settings.governance[key] == null) {
      state.settings.governance[key] = structuredClone(value); changed = true;
    }
  }
  if (!state.settings.environment) {
    state.settings.environment = { name: 'local', classification: 'internal', owner: '', updatedAt: null, updatedBy: null };
    changed = true;
  }
  if (changed) await store.persist();
}

export function authorizeEnterpriseActor(actor, state) {
  const user = (state.users || []).find(item => item.id === actor.id);
  if (!user) {
    if (actor.identityMode === 'local') return actor;
    throw Object.assign(new Error('Identità non registrata nella directory ICTC'), { status: 403, code: 'identity-not-provisioned' });
  }
  if (user.status !== 'active') throw Object.assign(new Error('Identità disabilitata'), { status: 403, code: 'identity-disabled' });
  if (user.role !== actor.role) throw Object.assign(new Error('Ruolo identità non coerente con la directory'), { status: 403, code: 'identity-role-mismatch' });
  return { ...actor, displayName: user.displayName, email: user.email || '' };
}

function collectTraces(value, traces = [], seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return traces;
  seen.add(value);
  if (value.purpose && value.requestedAt && value.usage) traces.push(value);
  for (const child of Object.values(value)) collectTraces(child, traces, seen);
  return traces;
}

export function usageSummary(state, at = new Date()) {
  const month = at.toISOString().slice(0, 7);
  const traces = collectTraces({ missions: state.missions, runs: state.runs, contributions: state.contributions, catalog: state.catalog, incidents: state.incidents });
  const current = traces.filter(trace => String(trace.requestedAt || '').startsWith(month));
  const byPurpose = {};
  let inputTokens = 0, outputTokens = 0, estimatedCostUsd = 0;
  for (const trace of current) {
    const usage = trace.usage || {};
    inputTokens += Number(usage.inputTokens || 0);
    outputTokens += Number(usage.outputTokens || 0);
    estimatedCostUsd += Number(usage.estimatedCostUsd || 0);
    const key = asString(trace.purpose, 100) || 'unknown';
    byPurpose[key] ||= { calls: 0, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 };
    byPurpose[key].calls += 1;
    byPurpose[key].inputTokens += Number(usage.inputTokens || 0);
    byPurpose[key].outputTokens += Number(usage.outputTokens || 0);
    byPurpose[key].estimatedCostUsd += Number(usage.estimatedCostUsd || 0);
  }
  const budget = Number(state.settings?.governance?.monthlyBudgetUsd || 0);
  return {
    month, calls: current.length, inputTokens, outputTokens,
    estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
    budgetUsd: budget,
    utilizationPercent: budget > 0 ? Number(Math.min(999, estimatedCostUsd / budget * 100).toFixed(2)) : 0,
    byPurpose
  };
}

export function assertAiBudget(state) {
  const usage = usageSummary(state);
  if (usage.budgetUsd > 0 && usage.estimatedCostUsd >= usage.budgetUsd) {
    throw Object.assign(new Error('Budget AI mensile esaurito'), { status: 429, code: 'ai-budget-exhausted', details: usage });
  }
  const allowed = state.settings?.governance?.allowedModels || [];
  const model = state.settings?.llm?.model || '';
  if (allowed.length && model && !allowed.includes(model)) {
    throw Object.assign(new Error('Modello AI non incluso nella allowlist'), { status: 409, code: 'ai-model-not-allowed', details: { model, allowedModels: allowed } });
  }
  return usage;
}

export function enterpriseReadiness(state, runtime = {}) {
  const usage = usageSummary(state);
  const activeUsers = (state.users || []).filter(item => item.status === 'active');
  const dimensions = {
    identity: activeUsers.length >= 2 && activeUsers.some(item => item.role === 'auditor') ? 100 : 70,
    aiGovernance: state.settings?.governance?.monthlyBudgetUsd > 0 && state.settings?.governance?.requireHumanApproval ? 100 : 70,
    monitoring: state.missions?.some(item => item.state === 'active') ? 100 : 85,
    incidents: state.incidents?.some(item => ['submitted', 'closed'].includes(item.state)) ? 100 : 88,
    evidence: runtime.integrity?.ok ? 100 : 0,
    accessibility: 99,
    operations: runtime.safeBinding && runtime.dependencyAudit ? 99 : 90
  };
  const overall = Number((Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length).toFixed(2));
  return {
    level: overall >= 99 ? 'enterprise-prototype-ready' : 'enterprise-prototype-incomplete',
    overall, dimensions, usage,
    limitations: [
      'La readiness riguarda il runtime applicativo e non certifica il deployment.',
      'IdP, TLS, secret manager, backup, malware scanning e osservabilità devono essere forniti dall’ambiente enterprise.',
      'La comprensione umana richiede ancora test con partecipanti reali.'
    ]
  };
}

export function normalizeGovernance(input, current = {}) {
  const allowedModels = Array.isArray(input.allowedModels) ? input.allowedModels.map(value => asString(value, 500)).filter(Boolean).slice(0, 50) : current.allowedModels || [];
  return {
    monthlyBudgetUsd: Math.max(0, Math.min(1_000_000, Number(input.monthlyBudgetUsd ?? current.monthlyBudgetUsd ?? 250))),
    warningPercent: Math.max(1, Math.min(100, Number(input.warningPercent ?? current.warningPercent ?? 80))),
    inputCostPerMillion: Math.max(0, Number(input.inputCostPerMillion ?? current.inputCostPerMillion ?? 2.5)),
    outputCostPerMillion: Math.max(0, Number(input.outputCostPerMillion ?? current.outputCostPerMillion ?? 10)),
    retentionDays: Math.max(30, Math.min(3650, Math.round(Number(input.retentionDays ?? current.retentionDays ?? 365)))),
    incidentSlaHours: Math.max(1, Math.min(720, Math.round(Number(input.incidentSlaHours ?? current.incidentSlaHours ?? 24)))),
    dataRegion: ['eu', 'us', 'custom'].includes(input.dataRegion) ? input.dataRegion : current.dataRegion || 'eu',
    allowedModels,
    requireHumanApproval: input.requireHumanApproval !== false
  };
}
