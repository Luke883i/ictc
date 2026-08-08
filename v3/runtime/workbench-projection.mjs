import { applicationGuide, detectSemanticLabels } from '../semantic.mjs';
import { json, requirePermission } from './http.mjs';

function canReadPrivate(actor, item) {
  if (actor.role === 'admin') return true;
  if (actor.role === 'auditor') return item.kind === 'incident';
  return item.createdBy === actor.id;
}
function addNode(nodes, id, type, label, data = {}) {
  if (!id || nodes.has(id)) return;
  nodes.set(id, { id, type, label: String(label || id).slice(0, 300), ...data });
}
function addEdge(edges, from, to, relation, evidence = null) {
  if (typeof from !== 'string' || !from || typeof to !== 'string' || !to) return;
  const id = `${relation}:${from}:${to}`;
  if (!edges.has(id)) edges.set(id, { id, from, to, relation, evidence });
}
function byOldestActionable(items) {
  return [...items].sort((a, b) => String(a.updatedAt || a.createdAt || '').localeCompare(String(b.updatedAt || b.createdAt || '')) || String(a.id || '').localeCompare(String(b.id || '')));
}
function nextAction({ kind, title, label, reason, action, service, targetType = null, targetId = null, readOnly = false }) {
  return { schemaVersion: '1.0.0', kind, title, label, reason, action, service, targetType, targetId, readOnly };
}
function procedure({ id, code = null, kind = 'service', label, description, action, actionLabel, service = null, readOnly = false, attentionCount = 0, metrics = [] }) {
  return {
    schemaVersion: '1.0.0', id, code, kind, label, description, action, actionLabel, service, readOnly,
    state: Number(attentionCount || 0) > 0 ? 'attention' : 'ready',
    attentionCount: Math.max(0, Number(attentionCount || 0)),
    metrics: metrics.slice(0, 2).map(item => ({ value: item.value, label: String(item.label || '').slice(0, 120) }))
  };
}
function blockerCount(readiness, predicate = () => true) {
  return (readiness?.controls || []).filter(item => item.status !== 'verified' && predicate(item)).length;
}
export function canonicalProcedureHub(state, actor, { readiness = null } = {}) {
  const permissions = new Set(actor.permissions || []);
  if (!permissions.has('read')) return [];
  const missions = state.missions || [];
  const catalog = state.catalog || [];
  const contributions = state.contributions || [];
  const visibleIncidents = (state.incidents || []).filter(item => canReadPrivate(actor, { ...item, kind: 'incident' }));
  const activeMissions = missions.filter(item => item.state === 'active').length;
  const missionExceptions = missions.filter(item => item.state === 'needs-plan' || item.lastError || item.aiError).length;
  const candidates = catalog.filter(item => item.state === 'candidate').length;
  const ownContributionExceptions = contributions.filter(item => item.createdBy === actor.id && item.state === 'needs-enrichment').length;
  const openIncidents = visibleIncidents.filter(item => !['submitted', 'closed'].includes(item.state)).length;
  const runtimeBlockers = blockerCount(readiness, item => item.scope !== 'deployment');
  const allBlockers = blockerCount(readiness);
  const activeUsers = (state.users || []).filter(item => item.status === 'active').length;

  const procedures = [procedure({
    id: 'monitoring', code: 'RN-01', label: 'Monitoraggio normativo', service: 'monitoring', action: 'open-service',
    actionLabel: actor.role === 'auditor' ? 'Consulta monitoraggio' : actor.role === 'admin' ? 'Apri monitoraggio' : 'Consulta e contribuisci',
    description: actor.role === 'auditor'
      ? 'Ricostruisci ricerche, fonti e decisioni in sola lettura.'
      : actor.role === 'admin'
        ? 'Approva piani e verifica le fonti candidate.'
        : 'Consulta le ricerche e aggiungi materiale originale.',
    readOnly: actor.role === 'auditor',
    attentionCount: actor.role === 'user' ? ownContributionExceptions : missionExceptions + candidates,
    metrics: [{ value: activeMissions, label: 'ricerche attive' }, { value: candidates, label: 'fonti da verificare' }]
  }), procedure({
    id: 'incidents', code: 'EC-01', label: 'Eventi e segnalazioni', service: 'incidents', action: 'open-service',
    actionLabel: actor.role === 'auditor' ? 'Consulta eventi' : actor.role === 'admin' ? 'Apri eventi' : 'Registra o continua',
    description: actor.role === 'auditor'
      ? 'Ricostruisci originali, versioni e decisioni in sola lettura.'
      : actor.role === 'admin'
        ? 'Gestisci eventi aperti, invii e chiusure.'
        : 'Registra i fatti o continua un evento aperto.',
    readOnly: actor.role === 'auditor', attentionCount: openIncidents,
    metrics: [{ value: openIncidents, label: 'eventi aperti' }, { value: visibleIncidents.length, label: 'eventi visibili' }]
  }), procedure({
    id: 'evidence', code: 'EV-01', kind: 'assurance', label: 'Evidenze e controlli', service: 'proof', action: 'open-service',
    actionLabel: 'Apri evidenze',
    description: 'Consulta controlli, prove, limiti e attestazioni esterne richieste.',
    readOnly: true, attentionCount: allBlockers,
    metrics: [{ value: Number(readiness?.verified || 0), label: 'controlli verificati' }, { value: allBlockers, label: 'controlli non verificati' }]
  })];

  if (actor.role === 'admin' && permissions.has('manage-enterprise')) procedures.push(procedure({
    id: 'administration', kind: 'control-plane', label: 'Amministrazione', action: 'open-administration', actionLabel: 'Apri amministrazione',
    description: 'Governa identità, AI e readiness del sistema.',
    attentionCount: runtimeBlockers,
    metrics: [{ value: activeUsers, label: 'identità attive' }, { value: runtimeBlockers, label: 'controlli runtime aperti' }]
  }));

  return procedures;
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
      reason: candidate.internalReference
        ? 'Identità, versione e digest sono registrati; serve una decisione umana prima dello stato verificato.'
        : 'La fonte è candidate e non diventa verificata senza una decisione motivata.',
      action: 'monitoring-catalog', service: 'monitoring', targetType: 'catalog', targetId: candidate.id
    });
    const incident = openIncidents[0];
    if (incident) return nextAction({ kind: 'review-incident', title: 'Gestisci il prossimo evento aperto', label: 'Apri evento', reason: 'Esiste un fascicolo aperto che richiede prosecuzione o decisione.', action: 'incidents', service: 'incidents', targetType: 'incident', targetId: incident.id });
    if (!llmReady) return nextAction({ kind: 'configure-ai', title: 'Completa la configurazione AI', label: 'Configura AI', reason: 'Serve per creare piani e analisi. Le decisioni restano comunque umane.', action: 'settings', service: 'administration' });
    if (!(state.missions || []).length) return nextAction({ kind: 'create-monitoring', title: 'Definisci il primo obiettivo', label: 'Crea un monitoraggio', reason: 'Descrivi cosa sorvegliare; ICTC proporrà un piano da approvare.', action: 'monitoring', service: 'monitoring' });
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
  const nodes = new Map();
  const edges = new Map();
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
      addEdge(edges, source.id, labelNode, 'has-label', semantic.evidence?.find(item => item.dimension === dimension && item.labelId === labelId) || null);
    }
    for (const observation of source.observations || []) {
      if (observation.origin?.missionId) addEdge(edges, observation.origin.missionId, source.id, 'observed-source');
      if (observation.origin?.contributionId && visibleContributionIds.has(observation.origin.contributionId)) addEdge(edges, observation.origin.contributionId, source.id, 'enriched-into');
    }
  }
  for (const item of visibleContributions) addNode(nodes, item.id, 'knowledge', item.note || item.links?.[0] || item.attachments?.[0]?.name || 'Contributo', { state: item.state });
  for (const incident of visibleIncidents) addNode(nodes, incident.id, 'incident', incident.originalNarrative, { state: incident.state });
  return {
    schemaVersion: '1.0.0', generatedAt: new Date().toISOString(),
    nodes: [...nodes.values()], edges: [...edges.values()], counts: { nodes: nodes.size, edges: edges.size },
    limitations: [
      'Il reticolo deriva esclusivamente dai record accessibili al ruolo corrente.',
      'Le etichette descrivono corrispondenze lessicali e non determinano applicabilità o conformità.'
    ]
  };
}
export function canonicalWorkbenchMetrics(state, actor) {
  const graph = canonicalWorkbenchGraph(state, actor);
  const classified = graph.nodes.filter(node => ['source', 'knowledge', 'incident'].includes(node.type));
  const linked = new Set(graph.edges.filter(edge => edge.relation === 'has-label').map(edge => edge.from));
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
