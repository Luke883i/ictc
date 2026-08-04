import {
  CATALOG_STATES, DOCUMENT_TYPES, asString, normalizeUrl, now, publicSettings, uniqueStrings
} from '../domain.mjs';
import { deriveQuestions, submissionReadiness } from '../question-engine.mjs';
import { httpError } from './http.mjs';

export function findMission(state, id) {
  const item = state.missions.find(entry => entry.id === id);
  if (!item) throw httpError(404, 'Monitoraggio non trovato', 'not-found');
  return item;
}
export function findCatalog(state, id) {
  const item = state.catalog.find(entry => entry.id === id);
  if (!item) throw httpError(404, 'Fonte non trovata', 'not-found');
  return item;
}
export function findContribution(state, id) {
  const item = state.contributions.find(entry => entry.id === id);
  if (!item) throw httpError(404, 'Contributo non trovato', 'not-found');
  return item;
}
export function findIncident(state, id) {
  const item = state.incidents.find(entry => entry.id === id);
  if (!item) throw httpError(404, 'Segnalazione non trovata', 'not-found');
  return item;
}
export function canAccessIncident(actor, incident) {
  return actor.role === 'admin' || incident.createdBy === actor.id;
}
export function ensureIncidentOwner(actor, incident) {
  if (incident.createdBy !== actor.id) throw httpError(403, 'Puoi modificare soltanto le segnalazioni che hai creato', 'not-owner');
}
export function canAccessContribution(actor, contribution) {
  return actor.role === 'admin' || contribution.createdBy === actor.id;
}
export function ensureContributionOwner(actor, contribution) {
  if (contribution.createdBy !== actor.id) throw httpError(403, 'Puoi elaborare soltanto i contributi che hai creato', 'not-owner');
}
export function catalogKey(item) {
  return `${item.identifier || ''}|${item.sourceUrl || ''}|${item.title || ''}`.toLowerCase();
}
function observationFrom(item) {
  return {
    observedAt: item.origin?.observedAt || now(),
    origin: structuredClone(item.origin || null),
    title: item.title,
    documentType: item.documentType,
    authority: item.authority,
    jurisdiction: item.jurisdiction,
    identifier: item.identifier,
    sourceUrl: item.sourceUrl,
    publicationDate: item.publicationDate,
    effectiveDate: item.effectiveDate,
    summary: item.summary,
    relevance: item.relevance,
    confidence: item.confidence,
    aiTrace: structuredClone(item.aiTrace || null)
  };
}
export function normalizeCatalogItem(raw, origin, trace, idFactory) {
  const documentType = asString(raw.documentType, 80).toLowerCase();
  const item = {
    id: idFactory('source'),
    title: asString(raw.title, 1_000) || 'Fonte senza titolo',
    documentType: DOCUMENT_TYPES.includes(documentType) ? documentType : 'other',
    authority: asString(raw.authority, 500),
    jurisdiction: asString(raw.jurisdiction, 500),
    identifier: asString(raw.identifier, 500),
    sourceUrl: normalizeUrl(raw.sourceUrl),
    publicationDate: asString(raw.publicationDate, 80),
    effectiveDate: asString(raw.effectiveDate, 80),
    summary: asString(raw.summary, 5_000),
    relevance: asString(raw.relevance, 3_000),
    confidence: Math.max(0, Math.min(1, Number(raw.confidence || 0))),
    state: 'candidate', origin, aiTrace: trace, decisions: [], observations: [], createdAt: now(), updatedAt: now()
  };
  item.observations.push(observationFrom(item));
  return item;
}
export function mergeCatalogObservation(existing, normalized) {
  const preserved = {
    id: existing.id,
    state: existing.state,
    decisions: existing.decisions || [],
    observations: existing.observations || [],
    createdAt: existing.createdAt
  };
  Object.assign(existing, normalized, preserved, { updatedAt: now() });
  existing.observations = [...preserved.observations, observationFrom(normalized)].slice(-250);
  return existing;
}
export function missionProjection(mission, state) {
  const runs = state.runs.filter(run => run.missionId === mission.id);
  return { ...mission, runCount: runs.length, lastRun: runs.at(-1) || null, evidenceUrl: `/api/evidence/mission/${mission.id}` };
}
export function incidentProjection(incident) {
  const questions = deriveQuestions(incident);
  return {
    ...incident,
    questions,
    nextQuestion: questions[0] || null,
    readiness: submissionReadiness(incident),
    evidenceUrl: `/api/evidence/incident/${incident.id}`
  };
}
function userSettings(settings) {
  return {
    organization: structuredClone(settings.organization),
    llm: {
      configured: Boolean(settings.llm.endpoint && settings.llm.model),
      ready: Boolean(settings.llm.endpoint && settings.llm.model && (!settings.llm.apiKeyEnv || process.env[settings.llm.apiKeyEnv])),
      model: settings.llm.model || ''
    },
    prompts: null,
    updatedAt: settings.updatedAt,
    updatedBy: settings.updatedBy
  };
}
export function visibleState(actor, store, version) {
  const state = store.snapshot();
  const visibleContributions = state.contributions.filter(item => canAccessContribution(actor, item));
  const visibleIncidents = state.incidents.filter(item => canAccessIncident(actor, item));
  const privateIds = new Set([
    ...visibleContributions.map(item => item.id),
    ...visibleIncidents.map(item => item.id)
  ]);
  const recentEvents = state.audit.filter(event => {
    if (actor.role === 'admin') return true;
    if (!event.subject) return event.actorId === actor.id;
    if (['incident', 'contribution'].includes(event.subject.type)) return privateIds.has(event.subject.id);
    return true;
  }).slice(-8).reverse();
  return {
    version,
    revision: state.revision,
    actor,
    settings: actor.role === 'admin' ? publicSettings(state.settings) : userSettings(state.settings),
    missions: state.missions.map(item => missionProjection(item, state)),
    catalog: state.catalog.map(item => ({ ...item, evidenceUrl: `/api/evidence/catalog/${item.id}` })),
    contributions: visibleContributions.map(item => ({ ...item, evidenceUrl: `/api/evidence/contribution/${item.id}` })),
    incidents: visibleIncidents.map(incidentProjection),
    integrity: store.verifyChain(),
    recentEvents,
    experience: {
      services: 2,
      roles: 2,
      maxPrimaryActionsPerContext: 1,
      aiAuthority: 'assist-only',
      evidenceMode: 'receipt-and-bundle'
    }
  };
}
export function validateSettings(input, current) {
  const organization = input.organization || {};
  const llm = input.llm || {};
  const prompts = input.prompts || {};
  const endpoint = normalizeUrl(llm.endpoint ?? current.llm.endpoint);
  if (endpoint) {
    const parsed = new URL(endpoint);
    const privateHost = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname) || /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(parsed.hostname);
    if (privateHost && process.env.ICTC_ALLOW_PRIVATE_AI !== '1') throw httpError(400, 'Endpoint privato non consentito', 'private-ai-endpoint');
  }
  return {
    organization: {
      name: asString(organization.name ?? current.organization.name, 500) || 'Organizzazione',
      scope: asString(organization.scope ?? current.organization.scope, 10_000),
      jurisdictions: uniqueStrings(organization.jurisdictions ?? current.organization.jurisdictions),
      sectors: uniqueStrings(organization.sectors ?? current.organization.sectors)
    },
    llm: {
      endpoint,
      model: asString(llm.model ?? current.llm.model, 500),
      apiKeyEnv: asString(llm.apiKeyEnv ?? current.llm.apiKeyEnv, 200),
      temperature: Math.max(0, Math.min(2, Number(llm.temperature ?? current.llm.temperature ?? 0.1)))
    },
    prompts: {
      monitoringPlan: asString(prompts.monitoringPlan ?? current.prompts.monitoringPlan, 40_000),
      complianceDiscovery: asString(prompts.complianceDiscovery ?? current.prompts.complianceDiscovery, 40_000),
      contributionEnrichment: asString(prompts.contributionEnrichment ?? current.prompts.contributionEnrichment, 40_000),
      incidentAnalysis: asString(prompts.incidentAnalysis ?? current.prompts.incidentAnalysis, 40_000),
      incidentDraft: asString(prompts.incidentDraft ?? current.prompts.incidentDraft, 40_000)
    }
  };
}
export function applyCatalogDecision(item, decision, reason, actorId) {
  if (!CATALOG_STATES.includes(decision)) throw httpError(400, 'Stato non valido');
  item.state = decision;
  item.updatedAt = now();
  item.decisions.push({ decision, reason, at: now(), by: actorId });
  return item;
}
