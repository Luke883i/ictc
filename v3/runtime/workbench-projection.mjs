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
