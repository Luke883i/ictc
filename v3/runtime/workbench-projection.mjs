import { applicationGuide, detectSemanticLabels } from '../semantic.mjs';
import { json, requirePermission } from './http.mjs';
import { assertRelation, processDefinition, surfaceProcessDefinitions } from './process-kernel.mjs';

function canReadPrivate(actor, item) {
  if (actor.role === 'admin') return true;
  if (actor.role === 'auditor') return item.kind === 'incident';
  return item.createdBy === actor.id;
}
function addNode(nodes, id, type, label, data = {}) {
  if (!id || nodes.has(id)) return;
  nodes.set(id, { id, type, label: String(label || id).slice(0, 300), ...data });
}
function addEdge(edges, from, to, relation, evidence = null, endpoints = {}) {
  if (typeof from !== 'string' || !from || typeof to !== 'string' || !to) return;
  const canonicalRelation = assertRelation(relation, endpoints.fromType || null, endpoints.toType || null);
  const id = `${canonicalRelation}:${from}:${to}`;
  if (!edges.has(id)) edges.set(id, { id, from, to, relation: canonicalRelation, evidence });
}
function byOldestActionable(items) {
  return [...items].sort((a, b) => String(a.updatedAt || a.createdAt || '').localeCompare(String(b.updatedAt || b.createdAt || '')) || String(a.id || '').localeCompare(String(b.id || '')));
}
function nextAction({ kind, title, label, reason, action, service, targetType = null, targetId = null, readOnly = false }) {
  return { schemaVersion: '1.0.0', kind, title, label, reason, action, service, targetType, targetId, readOnly };
}
function blockerCount(readiness, predicate = () => true) {
  return (readiness?.controls || []).filter(item => item.status !== 'verified' && predicate(item)).length;
}
function runtimeContext(state, actor, readiness) {
  const missions = state.missions || [];
  const catalog = state.catalog || [];
  const contributions = state.contributions || [];
  const visibleIncidents = (state.incidents || []).filter(item => canReadPrivate(actor, { ...item, kind: 'incident' }));
  return {
    state, actor, readiness, missions, catalog, contributions, visibleIncidents,
    activeMissions: missions.filter(item => item.state === 'active').length,
    missionExceptions: missions.filter(item => item.state === 'needs-plan' || item.lastError || item.aiError).length,
    candidates: catalog.filter(item => item.state === 'candidate').length,
    ownContributionExceptions: contributions.filter(item => item.createdBy === actor.id && item.state === 'needs-enrichment').length,
    openIncidents: visibleIncidents.filter(item => !['submitted', 'closed'].includes(item.state)).length,
    runtimeBlockers: blockerCount(readiness, item => item.scope !== 'deployment'),
    allBlockers: blockerCount(readiness),
    activeUsers: (state.users || []).filter(item => item.status === 'active').length
  };
}
const PROCEDURE_ADAPTERS = Object.freeze({
  monitoring: (context, role) => ({
    attentionCount: role === 'user' ? context.ownContributionExceptions : context.missionExceptions + context.candidates,
    metrics: [{ value: context.activeMissions, label: 'ricerche attive' }, { value: context.candidates, label: 'fonti da verificare' }]
  }),
  incidents: context => ({
    attentionCount: context.openIncidents,
    metrics: [{ value: context.openIncidents, label: 'eventi aperti' }, { value: context.visibleIncidents.length, label: 'eventi visibili' }]
  }),
  evidence: context => ({
    attentionCount: context.allBlockers,
    metrics: [{ value: Number(context.readiness?.verified || 0), label: 'controlli verificati' }, { value: context.allBlockers, label: 'controlli non verificati' }]
  }),
  administration: context => ({
    attentionCount: context.runtimeBlockers,
    metrics: [{ value: context.activeUsers, label: 'identità attive' }, { value: context.runtimeBlockers, label: 'controlli runtime aperti' }]
  })
});
function procedureFromDefinition(definition, actor, context) {
  const roleMode = definition.roleModes?.[actor.role];
  if (!roleMode) return null;
  const adapter = PROCEDURE_ADAPTERS[definition.runtimeAdapter] || (() => ({ attentionCount: 0, metrics: [] }));
  const runtime = adapter(context, actor.role) || {};
  const attentionCount = Math.max(0, Number(runtime.attentionCount || 0));
  return {
    schemaVersion: '1.1.0',
    id: definition.id, code: definition.code, kind: definition.kind, archetype: definition.archetype,
    label: definition.label, description: roleMode.description,
    action: definition.kind === 'control-plane' ? 'open-administration' : 'open-service',
    actionLabel: roleMode.actionLabel, service: definition.service,
    readOnly: roleMode.mode === 'read-only', state: attentionCount > 0 ? 'attention' : 'ready', attentionCount,
    metrics: (runtime.metrics || []).slice(0, 2).map(item => ({ value: item.value, label: String(item.label || '').slice(0, 120) })),
    claimBoundary: definition.claimBoundary
  };
}
export function canonicalProcedureHub(state, actor, { readiness = null } = {}) {
  const permissions = new Set(actor.permissions || []);
  if (!permissions.has('read')) return [];
  const context = runtimeContext(state, actor, readiness);
  return surfaceProcessDefinitions()
    .filter(definition => definition.id !== 'administration' || (actor.role === 'admin' && permissions.has('manage-enterprise')))
    .map(definition => procedureFromDefinition(definition, actor, context))
    .filter(Boolean);
}
export function canonicalHomeNextAction(state, actor, { llmReady = false } = {}) {
  const permissions = new Set(actor.permissions || []);
  const candidates = byOldestActionable((state.catalog || []).filter(item => item.state === 'candidate')).sort((a, b) => Number(Boolean(b.internalReference)) - Number(Boolean(a.internalReference)) || String(a.updatedAt || a.createdAt || '').localeCompare(String(b.updatedAt || b.createdAt || '')) || String(a.id || '').localeCompare(String(b.id || '')));
  const openIncidents = byOldestActionable((state.incidents || []).filter(item => !['submitted', 'closed'].includes(item.state)));

  if (actor.role === 'admin') {
    const candidate = candidates[0];
    if (candidate) return nextAction({
      kind: candidate.internalReference ? 'verify-internal-source' : 'verify-source',
      title: candidate.internalReference ? `Verifica il riferimento interno ${candidate.title}` : `Verifica la fonte ${candidate.title}`,
      label: 'Apri la fonte da verificare',
      reason: candidate.internalReference ? 'Identità, versione e digest sono registrati; serve una decisione umana prima dello stato verificato.' : 'La fonte è candidate e non diventa verificata senza una decisione motivata.',
      action: 'monitoring-catalog', service: 'monitoring', targetType: 'catalog', targetId: candidate.id
    });
    const incident = openIncidents[0];
    if (incident) return nextAction({ kind: 'review-incident', title: 'Gestisci il prossimo evento aperto', label: 'Apri evento', reason: 'Esiste un fascicolo aperto che richiede prosecuzione o decisione.', action: 'incidents', service: 'incidents', targetType: 'incident', targetId: incident.id });
    if (!(state.missions || []).length) return nextAction({ kind: 'create-monitoring', title: 'Definisci il primo obiettivo', label: 'Crea un monitoraggio', reason: llmReady?'Descrivi cosa sorvegliare; ICTC proporrà un piano da approvare.':'Descrivi cosa sorvegliare. Il lavoro può iniziare senza AI; la configurazione AI resta disponibile in Amministrazione.', action: 'monitoring', service: 'monitoring' });
    if (!llmReady) return nextAction({ kind: 'monitor-activity', title: 'Controlla l’attività corrente', label: 'Apri il monitoraggio', reason: 'Il lavoro manuale resta disponibile; configura l’AI solo se vuoi usare pianificazione e analisi assistite.', action: 'monitoring', service: 'monitoring' });
    return nextAction({ kind: 'monitor-activity', title: 'Controlla l’attività corrente', label: 'Apri il monitoraggio', reason: 'Verifica stato dei piani, prossime esecuzioni ed evidenze.', action: 'monitoring', service: 'monitoring' });
  }
  if (actor.role === 'user') {
    const incident = openIncidents.find(item => item.createdBy === actor.id);
    if (incident) return nextAction({ kind: 'continue-own-incident', title: 'Completa il tuo evento aperto', label: 'Apri evento', reason: 'Il fascicolo è già registrato: completa il prossimo passo invece di crearne uno nuovo.', action: 'incidents', service: 'incidents', targetType: 'incident', targetId: incident.id });
    if (permissions.has('report-incident')) return nextAction({ kind: 'record-incident', title: 'Registra ciò che è accaduto', label: 'Registra un evento', reason: 'Parti dai fatti disponibili. Non serve classificare l’evento.', action: 'incident', service: 'incidents' });
    if (permissions.has('contribute-source')) return nextAction({ kind: 'contribute-material', title: 'Aggiungi materiale utile', label: 'Aggiungi materiale', reason: 'ICTC conserva l’originale e propone metadati da verificare.', action: 'contribution', service: 'monitoring' });
    return nextAction({ kind: 'read-only-home', title: 'Consulta lo stato disponibile', label: 'Resta in panoramica', reason: 'Il ruolo corrente non ha un’azione di scrittura disponibile.', action: 'home', service: 'home', readOnly: true });
  }
  const candidate = candidates[0];
  if (candidate) return nextAction({ kind: candidate.internalReference ? 'inspect-internal-source' : 'inspect-source', title: candidate.internalReference ? `Consulta il riferimento interno ${candidate.title}` : `Consulta la fonte ${candidate.title}`, label: 'Apri la fonte', reason: 'La fonte è in attesa di decisione; l’auditor può ricostruire provenienza e stato senza modificarla.', action: 'monitoring-catalog', service: 'monitoring', targetType: 'catalog', targetId: candidate.id, readOnly: true });
  const incident = openIncidents[0];
  if (incident) return nextAction({ kind: 'inspect-incident', title: 'Consulta il prossimo evento aperto', label: 'Apri evento', reason: 'Il fascicolo è aperto ed è disponibile in sola lettura per la ricostruzione.', action: 'incidents', service: 'incidents', targetType: 'incident', targetId: incident.id, readOnly: true });
  return nextAction({ kind: 'inspect-evidence', title: 'Consulta le evidenze disponibili', label: 'Apri le evidenze', reason: 'Controlla fonti, decisioni e provenienza senza modificare il fascicolo.', action: 'monitoring-catalog', service: 'monitoring', readOnly: true });
}
export function canonicalWorkbenchGraph(state, actor) {
  const nodes = new Map(); const edges = new Map();
  const visibleContributions = (state.contributions || []).filter(item => canReadPrivate(actor, { ...item, kind: 'contribution' }));
  const visibleIncidents = (state.incidents || []).filter(item => canReadPrivate(actor, { ...item, kind: 'incident' }));
  const visibleContributionIds = new Set(visibleContributions.map(item => item.id));
  for (const mission of state.missions || []) addNode(nodes, mission.id, 'monitoring', mission.objective, { state: mission.state });
  for (const source of state.catalog || []) {
    addNode(nodes, source.id, 'source', source.title, { state: source.state, sourceUrl: source.sourceUrl || null });
    const semantic = source.semantic || detectSemanticLabels(source);
    for (const [dimension, ids] of Object.entries(semantic.labels || {})) for (const labelId of ids) {
      const labelNode = `label:${dimension}:${labelId}`;
      addNode(nodes, labelNode, 'label', labelId, { dimension, labelId });
      addEdge(edges, source.id, labelNode, 'object-has-label', semantic.evidence?.find(item => item.dimension === dimension && item.labelId === labelId) || null, { fromType: 'source', toType: 'label' });
    }
    for (const observation of source.observations || []) {
      if (observation.origin?.missionId) addEdge(edges, observation.origin.missionId, source.id, 'monitoring-observed-source', null, { fromType: 'monitoring', toType: 'source' });
      if (observation.origin?.contributionId && visibleContributionIds.has(observation.origin.contributionId)) addEdge(edges, observation.origin.contributionId, source.id, 'material-enriched-into-source', null, { fromType: 'knowledge', toType: 'source' });
    }
  }
  for (const item of visibleContributions) addNode(nodes, item.id, 'knowledge', item.note || item.links?.[0] || item.attachments?.[0]?.name || 'Contributo', { state: item.state });
  for (const incident of visibleIncidents) addNode(nodes, incident.id, 'incident', incident.originalNarrative, { state: incident.state });
  return {
    schemaVersion: '1.1.0', generatedAt: new Date().toISOString(),
    nodes: [...nodes.values()], edges: [...edges.values()], counts: { nodes: nodes.size, edges: edges.size },
    relationGrammar: { authority: 'runtime-process-kernel' },
    limitations: [
      'Il reticolo deriva esclusivamente dai record accessibili al ruolo corrente.',
      'Le relazioni appartengono alla grammatica runtime e non determinano applicabilità o conformità.'
    ]
  };
}
export function canonicalWorkbenchMetrics(state, actor) {
  const graph = canonicalWorkbenchGraph(state, actor);
  const classified = graph.nodes.filter(node => ['source', 'knowledge', 'incident'].includes(node.type));
  const linked = new Set(graph.edges.filter(edge => edge.relation === 'object-has-label').map(edge => edge.from));
  return {
    monitoring: { total: (state.missions || []).length, active: (state.missions || []).filter(item => item.state === 'active').length, needsPlan: (state.missions || []).filter(item => item.state === 'needs-plan').length },
    sources: { total: (state.catalog || []).length, candidates: (state.catalog || []).filter(item => item.state === 'candidate').length },
    graph: { ...graph.counts, classified: classified.length, linked: linked.size, coveragePercent: classified.length ? Number((linked.size / classified.length * 100).toFixed(2)) : null },
    honesty: { syntheticOperationalRecords: 0, emptyCoverageIsNull: classified.length === 0 }
  };
}
export function createWorkbenchProjection({ store, permissions }) {
  return async function handle(request, response, pathname, actor) {
    if ((request.method || 'GET') !== 'GET') return false;
    requirePermission(actor, 'read', permissions);
    if (pathname === '/api/workbench/meta') { json(response, 200, applicationGuide()); return true; }
    if (pathname === '/api/workbench/graph') { json(response, 200, canonicalWorkbenchGraph(store.snapshot(), actor)); return true; }
    if (pathname === '/api/workbench/metrics') { json(response, 200, canonicalWorkbenchMetrics(store.snapshot(), actor)); return true; }
    return false;
  };
}
