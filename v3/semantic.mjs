import { asArray, asString, canonicalJson, sha256, uniqueStrings } from './domain.mjs';
import { FIRST_RUN_GUIDE, JOB_TEMPLATES, SEMANTIC_TAXONOMY, taxonomyCatalog } from './semantic-taxonomy.mjs';

const DIMENSIONS = Object.freeze(Object.keys(SEMANTIC_TAXONOMY));
const validIds = Object.fromEntries(DIMENSIONS.map(dimension => [dimension, new Set(SEMANTIC_TAXONOMY[dimension].map(item => item.id))]));

function textOf(value, seen = new Set()) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value !== 'object' || seen.has(value)) return '';
  seen.add(value);
  if (Array.isArray(value)) return value.map(item => textOf(item, seen)).join(' ');
  return Object.values(value).map(item => textOf(item, seen)).join(' ');
}

function normalizeText(value) {
  return textOf(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function evidenceFor(source, term) {
  const normalizedSource = normalizeText(source);
  const normalizedTerm = normalizeText(term);
  const index = normalizedSource.indexOf(normalizedTerm);
  if (index < 0) return null;
  const start = Math.max(0, index - 45);
  const end = Math.min(normalizedSource.length, index + normalizedTerm.length + 45);
  return normalizedSource.slice(start, end);
}

function fallbackFor(dimension) {
  const values = SEMANTIC_TAXONOMY[dimension];
  return values.find(item => item.id.startsWith('UNKNOWN_'))?.id || values.find(item => item.id.startsWith('OTHER_'))?.id || null;
}

export function detectSemanticLabels(value, { includeFallbacks = true, source = 'runtime-lexical' } = {}) {
  const normalized = normalizeText(value);
  const labels = {};
  const evidence = [];
  for (const dimension of DIMENSIONS) {
    const matched = [];
    for (const item of SEMANTIC_TAXONOMY[dimension]) {
      if (item.id.startsWith('OTHER_') || item.id.startsWith('UNKNOWN_')) continue;
      const terms = [item.label, ...item.aliases].map(normalizeText).filter(term => term.length >= 3);
      const term = terms.find(candidate => normalized.includes(candidate));
      if (!term) continue;
      matched.push(item.id);
      evidence.push({ dimension, labelId: item.id, method: 'lexical', term, excerpt: evidenceFor(normalized, term), source });
    }
    labels[dimension] = [...new Set(matched)];
    if (!labels[dimension].length && includeFallbacks) {
      const fallback = fallbackFor(dimension);
      if (fallback) labels[dimension] = [fallback];
    }
  }
  return {
    schemaVersion: '1.0.0',
    labels,
    evidence,
    evidenceSha256: sha256(evidence),
    method: 'deterministic-lexical',
    limitations: [
      'Le etichette derivano da corrispondenze testuali e non determinano applicabilità.',
      'Fallback UNKNOWN e OTHER preservano l’incertezza e rendono il vocabolario estensibile.',
      'Le proposte AI, quando presenti, restano separate da queste etichette runtime.'
    ]
  };
}

function normalizeLabelSelection(value = {}) {
  return Object.fromEntries(DIMENSIONS.map(dimension => {
    const requested = uniqueStrings(asArray(value?.[dimension]), 100, 100);
    return [dimension, requested.filter(id => validIds[dimension].has(id))];
  }));
}

export function normalizeJobConfig(input = {}, current = {}) {
  const scheduleInput = input.schedule || {};
  const miningInput = input.mining || {};
  const filterInput = input.filters || {};
  const currentSchedule = current.schedule || {};
  const currentMining = current.mining || {};
  const currentFilters = current.filters || {};
  const cadenceHours = Math.max(1, Math.min(8760, Math.round(Number(scheduleInput.cadenceHours ?? input.cadenceHours ?? currentSchedule.cadenceHours ?? current.cadenceHours ?? 168))));
  const weekdays = asArray(scheduleInput.weekdays ?? currentSchedule.weekdays ?? [1, 2, 3, 4, 5])
    .map(Number).filter(day => Number.isInteger(day) && day >= 0 && day <= 6);
  const mode = ['new-only', 'changes-only', 'new-and-changed', 'all-observed'].includes(miningInput.mode ?? currentMining.mode)
    ? (miningInput.mode ?? currentMining.mode) : 'new-and-changed';
  return {
    title: asString(input.title ?? current.title, 300),
    description: asString(input.description ?? current.description, 2000),
    objective: asString(input.objective ?? current.objective, 10000),
    schedule: {
      cadenceHours,
      timezone: asString(scheduleInput.timezone ?? currentSchedule.timezone, 100) || 'Europe/Rome',
      weekdays: [...new Set(weekdays.length ? weekdays : [1, 2, 3, 4, 5])].sort(),
      windowStart: asString(scheduleInput.windowStart ?? currentSchedule.windowStart, 5) || '06:00',
      windowEnd: asString(scheduleInput.windowEnd ?? currentSchedule.windowEnd, 5) || '22:00'
    },
    mining: {
      mode,
      lookbackDays: Math.max(1, Math.min(3650, Math.round(Number(miningInput.lookbackDays ?? currentMining.lookbackDays ?? 30)))),
      maxItems: Math.max(1, Math.min(200, Math.round(Number(miningInput.maxItems ?? currentMining.maxItems ?? 50)))),
      officialOnly: (miningInput.officialOnly ?? currentMining.officialOnly) !== false,
      detectChanges: (miningInput.detectChanges ?? currentMining.detectChanges) !== false,
      languages: uniqueStrings(miningInput.languages ?? currentMining.languages ?? ['it', 'en'], 20, 20)
    },
    filters: {
      include: normalizeLabelSelection(filterInput.include ?? currentFilters.include),
      exclude: normalizeLabelSelection(filterInput.exclude ?? currentFilters.exclude),
      sourceHints: uniqueStrings(filterInput.sourceHints ?? input.sourceHints ?? currentFilters.sourceHints, 100, 1000),
      queryHints: uniqueStrings(filterInput.queryHints ?? currentFilters.queryHints, 100, 1000)
    },
    promptOverride: asString(input.promptOverride ?? current.promptOverride, 40000)
  };
}

function minutes(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || ''));
  if (!match) return null;
  const total = Number(match[1]) * 60 + Number(match[2]);
  return total >= 0 && total < 1440 ? total : null;
}

export function nextJobRunAt(from, job, immediate = false) {
  const base = new Date(from);
  if (Number.isNaN(base.valueOf())) return null;
  const schedule = normalizeJobConfig(job).schedule;
  let candidate = new Date(base.getTime() + (immediate ? 1000 : schedule.cadenceHours * 3600000));
  const start = minutes(schedule.windowStart) ?? 360;
  const end = minutes(schedule.windowEnd) ?? 1320;
  for (let guard = 0; guard < 14 * 24 * 4; guard += 1) {
    const day = candidate.getDay();
    const minute = candidate.getHours() * 60 + candidate.getMinutes();
    if (schedule.weekdays.includes(day) && minute >= start && minute <= end) return candidate.toISOString();
    candidate = new Date(candidate.getTime() + 15 * 60000);
  }
  return candidate.toISOString();
}

function selectedIncludes(selection, detected) {
  const selected = Object.values(selection || {}).flat().filter(Boolean);
  if (!selected.length) return true;
  const actual = new Set(Object.values(detected || {}).flat());
  return selected.some(id => actual.has(id));
}

function selectedExcludes(selection, detected) {
  const selected = Object.values(selection || {}).flat().filter(Boolean);
  if (!selected.length) return false;
  const actual = new Set(Object.values(detected || {}).flat());
  return selected.some(id => actual.has(id));
}

export function itemMatchesJob(item, job) {
  const normalized = normalizeJobConfig(job);
  const semantic = item.semantic || detectSemanticLabels(item);
  if (!selectedIncludes(normalized.filters.include, semantic.labels)) return false;
  if (selectedExcludes(normalized.filters.exclude, semantic.labels)) return false;
  if (normalized.mining.officialOnly && !item.sourceUrl && !item.identifier) return false;
  return true;
}

function addNode(nodes, id, type, label, data = {}) {
  if (!id || nodes.has(id)) return;
  nodes.set(id, { id, type, label: asString(label, 300) || id, ...data });
}

function addEdge(edges, from, to, relation, evidence = null) {
  if (!from || !to) return;
  const id = sha256({ from, to, relation }).slice(0, 24);
  if (edges.has(id)) return;
  edges.set(id, { id, from, to, relation, evidence });
}

export function semanticGraph(state, actor = { role: 'admin', id: 'local-admin' }) {
  const nodes = new Map();
  const edges = new Map();
  const jobs = state.monitoringJobs || [];
  const proposals = (state.jobProposals || []).filter(item => actor.role === 'admin' || item.createdBy === actor.id);
  const contributions = (state.contributions || []).filter(item => actor.role === 'admin' || item.createdBy === actor.id);
  const incidents = (state.incidents || []).filter(item => ['admin', 'auditor'].includes(actor.role) || item.createdBy === actor.id);
  for (const job of jobs) {
    addNode(nodes, job.id, 'monitoring-job', job.title || job.objective, { state: job.state });
    for (const [dimension, ids] of Object.entries(job.filters?.include || {})) for (const labelId of ids) {
      const labelNode = `label:${dimension}:${labelId}`;
      addNode(nodes, labelNode, 'label', labelId, { dimension, labelId });
      addEdge(edges, job.id, labelNode, 'includes-label');
    }
  }
  for (const proposal of proposals) addNode(nodes, proposal.id, 'job-proposal', proposal.title || proposal.objective, { status: proposal.status });
  for (const item of state.catalog || []) {
    addNode(nodes, item.id, 'source', item.title, { state: item.state, sourceUrl: item.sourceUrl || null });
    const semantic = item.semantic || detectSemanticLabels(item);
    for (const [dimension, ids] of Object.entries(semantic.labels || {})) for (const labelId of ids) {
      const labelNode = `label:${dimension}:${labelId}`;
      addNode(nodes, labelNode, 'label', labelId, { dimension, labelId });
      const proof = semantic.evidence?.find(entry => entry.dimension === dimension && entry.labelId === labelId) || null;
      addEdge(edges, item.id, labelNode, 'has-label', proof);
    }
    for (const observation of item.observations || []) {
      if (observation.origin?.jobId) addEdge(edges, observation.origin.jobId, item.id, 'observed-source');
      if (observation.origin?.missionId) addEdge(edges, observation.origin.missionId, item.id, 'observed-source');
      if (observation.origin?.contributionId) addEdge(edges, observation.origin.contributionId, item.id, 'enriched-into');
    }
  }
  for (const contribution of contributions) {
    addNode(nodes, contribution.id, 'knowledge', contribution.title || contribution.note || contribution.links?.[0] || 'Contributo', { state: contribution.state });
    const semantic = contribution.semantic || detectSemanticLabels(contribution);
    for (const [dimension, ids] of Object.entries(semantic.labels || {})) for (const labelId of ids) {
      const labelNode = `label:${dimension}:${labelId}`;
      addNode(nodes, labelNode, 'label', labelId, { dimension, labelId });
      addEdge(edges, contribution.id, labelNode, 'has-label');
    }
  }
  for (const incident of incidents) {
    addNode(nodes, incident.id, 'incident', incident.originalNarrative?.slice(0, 120) || incident.id, { state: incident.state });
    const semantic = incident.semantic || detectSemanticLabels(incident.originalNarrative);
    for (const [dimension, ids] of Object.entries(semantic.labels || {})) for (const labelId of ids) {
      const labelNode = `label:${dimension}:${labelId}`;
      addNode(nodes, labelNode, 'label', labelId, { dimension, labelId });
      addEdge(edges, incident.id, labelNode, 'has-label');
    }
  }
  return {
    schemaVersion: '1.0.0', generatedAt: new Date().toISOString(),
    nodes: [...nodes.values()], edges: [...edges.values()],
    counts: { nodes: nodes.size, edges: edges.size },
    limitations: ['Il grafo è derivato dai record accessibili al ruolo corrente e non inventa entità mancanti.']
  };
}

export function workbenchMetrics(state, actor) {
  const graph = semanticGraph(state, actor);
  const jobs = state.monitoringJobs || [];
  const proposals = (state.jobProposals || []).filter(item => actor.role === 'admin' || item.createdBy === actor.id);
  const contributions = (state.contributions || []).filter(item => actor.role === 'admin' || item.createdBy === actor.id);
  const incidents = (state.incidents || []).filter(item => ['admin', 'auditor'].includes(actor.role) || item.createdBy === actor.id);
  const classified = graph.nodes.filter(node => ['source', 'knowledge', 'incident'].includes(node.type));
  const linked = new Set(graph.edges.filter(edge => edge.relation === 'has-label').map(edge => edge.from));
  return {
    jobs: { total: jobs.length, active: jobs.filter(item => item.state === 'active').length, needsPlan: jobs.filter(item => item.state === 'needs-plan').length },
    proposals: { total: proposals.length, open: proposals.filter(item => item.status === 'proposed').length },
    knowledge: { total: contributions.length, needsEnrichment: contributions.filter(item => item.state === 'needs-enrichment').length },
    incidents: { total: incidents.length, open: incidents.filter(item => !['submitted', 'closed'].includes(item.state)).length },
    graph: { ...graph.counts, classified: classified.length, linked: linked.size, coveragePercent: classified.length ? Number((linked.size / classified.length * 100).toFixed(2)) : null },
    honesty: { syntheticOperationalRecords: 0, emptyCoverageIsNull: classified.length === 0 }
  };
}

export function applicationGuide() {
  return { guide: FIRST_RUN_GUIDE, templates: JOB_TEMPLATES, taxonomy: taxonomyCatalog(), dimensions: DIMENSIONS, digest: sha256(canonicalJson({ FIRST_RUN_GUIDE, JOB_TEMPLATES, SEMANTIC_TAXONOMY })) };
}
