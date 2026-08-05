import { asString, now } from './domain.mjs';

export const ENTERPRISE_ROLES = Object.freeze(['admin', 'user', 'auditor']);

const DEFAULT_GOVERNANCE = Object.freeze({
  monthlyBudgetUsd: 250,
  warningPercent: 80,
  inputCostPerMillion: 2.5,
  outputCostPerMillion: 10,
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
  for (const [key, value] of Object.entries(DEFAULT_GOVERNANCE)) if (state.settings.governance[key] == null) {
    state.settings.governance[key] = structuredClone(value); changed = true;
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
    month, calls: current.length, inputTokens, outputTokens, totalTokens: inputTokens + outputTokens,
    estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)), budgetUsd: budget,
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

function control(id, label, ok, evidence, action, scope = 'runtime') {
  return { id, label, status: ok ? 'verified' : 'blocker', evidence, action: ok ? null : action, scope };
}

export function attentionItems(state) {
  const usage = usageSummary(state);
  const warning = Number(state.settings?.governance?.warningPercent || 80);
  const items = [];
  for (const mission of state.missions || []) if (mission.state === 'needs-plan' || mission.lastError) items.push({ type: 'monitoring', severity: 'high', id: mission.id, label: mission.objective, reason: mission.aiError || mission.lastError });
  for (const source of state.catalog || []) if (source.state === 'candidate') items.push({ type: 'source', severity: 'medium', id: source.id, label: source.title, reason: 'Decisione umana richiesta' });
  for (const incident of state.incidents || []) if (!['submitted', 'closed'].includes(incident.state)) items.push({ type: 'incident', severity: 'high', id: incident.id, label: incident.originalNarrative.slice(0, 120), reason: incident.aiError || 'Fascicolo non ancora inviato' });
  if (usage.budgetUsd > 0 && usage.utilizationPercent >= warning) items.push({ type: 'ai-budget', severity: 'high', id: usage.month, label: 'Budget AI', reason: `${usage.utilizationPercent}% utilizzato` });
  return items.slice(0, 100);
}

export function enterpriseReadiness(state, runtime = {}) {
  const usage = usageSummary(state);
  const activeUsers = (state.users || []).filter(item => item.status === 'active');
  const controls = [
    control('identity-directory', 'Directory identità', activeUsers.some(item => item.role === 'admin') && activeUsers.some(item => item.role === 'auditor'), `${activeUsers.length} identità attive`, 'Provisiona almeno un amministratore e un auditor'),
    control('trusted-identity', 'Identità enterprise', runtime.identityProvider === true, runtime.identityProvider ? 'trusted-header attivo' : 'modalità locale', 'Configura un IdP/proxy trusted-header', 'deployment'),
    control('ai-provider', 'Provider AI', Boolean(state.settings?.llm?.endpoint && state.settings?.llm?.model), state.settings?.llm?.model || 'non configurato', 'Configura endpoint e modello'),
    control('ai-budget', 'Budget AI', Number(state.settings?.governance?.monthlyBudgetUsd) > 0, `$${state.settings?.governance?.monthlyBudgetUsd || 0}/mese`, 'Imposta un budget mensile positivo'),
    control('ai-allowlist', 'Allowlist modelli', (state.settings?.governance?.allowedModels || []).length > 0, `${(state.settings?.governance?.allowedModels || []).length} modelli`, 'Definisci almeno un modello autorizzato'),
    control('human-authority', 'Autorità umana', state.settings?.governance?.requireHumanApproval === true, 'adozione e conferma obbligatorie', 'Abilita approvazione umana'),
    control('evidence-integrity', 'Integrità fascicoli', runtime.integrity?.ok === true, runtime.integrity?.head || 'catena non verificata', 'Ripristina una catena audit coerente'),
    control('safe-binding', 'Binding sicuro', runtime.safeBinding === true, runtime.safeBinding ? 'policy verificata' : 'non verificato', 'Usa loopback o trusted-header fail-closed', 'deployment'),
    control('tls', 'TLS', runtime.tls === true, runtime.tls ? 'attestato dal deployment' : 'nessuna attestazione', 'Termina TLS e imposta ICTC_TLS_ATTESTED=1', 'deployment'),
    control('durable-storage', 'Storage durevole', runtime.durableStorage === true, runtime.durableStorage ? 'attestato dal deployment' : 'JSON locale', 'Configura storage transazionale e imposta ICTC_DURABLE_STORAGE=1', 'deployment'),
    control('backup', 'Backup verificato', runtime.backupVerified === true, runtime.backupVerified ? 'restore test attestato' : 'nessuna attestazione', 'Esegui restore test e imposta ICTC_BACKUP_VERIFIED_AT', 'deployment'),
    control('malware-scan', 'Scansione allegati', runtime.malwareScanning === true, runtime.malwareScanning ? 'scanner esterno attestato' : 'solo validazione formato', 'Integra scanner/quarantena e imposta ICTC_MALWARE_SCAN_MODE=external', 'deployment'),
    control('observability', 'Osservabilità', runtime.observability === true, runtime.observability ? 'telemetria attestata' : 'console locale', 'Integra log, metriche e alert', 'deployment'),
    control('dependency-audit', 'Audit dipendenze', runtime.dependencyAudit === true, runtime.dependencyAuditAt || 'nessuna attestazione runtime', 'Propaga l’esito CI con ICTC_DEPENDENCY_AUDIT_AT', 'deployment'),
    control('accessibility-audit', 'Audit accessibilità', runtime.accessibilityAudit === true, runtime.accessibilityAuditAt || 'baseline tecnica soltanto', 'Esegui audit umano/AT e imposta ICTC_ACCESSIBILITY_AUDIT_AT', 'deployment')
  ];
  const verified = controls.filter(item => item.status === 'verified').length;
  const overall = Number((verified / controls.length * 100).toFixed(2));
  const dimensions = Object.fromEntries(controls.map(item => [item.id, item.status === 'verified' ? 100 : 0]));
  return {
    level: controls.every(item => item.status === 'verified') ? 'enterprise-ready' : 'enterprise-blocked',
    overall, verified, total: controls.length, controls, dimensions, usage,
    attention: attentionItems(state),
    limitations: ['La postura è derivata da evidenze runtime e attestazioni esplicite; un controllo senza evidenza è un blocker.']
  };
}

export function normalizeGovernance(input, current = {}) {
  const allowedModels = Array.isArray(input.allowedModels) ? input.allowedModels.map(value => asString(value, 500)).filter(Boolean).slice(0, 50) : current.allowedModels || [];
  return {
    monthlyBudgetUsd: Math.max(0, Math.min(1_000_000, Number(input.monthlyBudgetUsd ?? current.monthlyBudgetUsd ?? 250))),
    warningPercent: Math.max(1, Math.min(100, Number(input.warningPercent ?? current.warningPercent ?? 80))),
    inputCostPerMillion: Math.max(0, Number(input.inputCostPerMillion ?? current.inputCostPerMillion ?? 2.5)),
    outputCostPerMillion: Math.max(0, Number(input.outputCostPerMillion ?? current.outputCostPerMillion ?? 10)),
    allowedModels,
    requireHumanApproval: input.requireHumanApproval !== false
  };
}
