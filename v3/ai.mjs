import { asArray, asString, normalizeDocumentType } from './domain.mjs';

function extractJson(text) {
  const value = asString(text, 200_000).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const firstObject = value.indexOf('{'); const lastObject = value.lastIndexOf('}');
  if (firstObject < 0 || lastObject <= firstObject) throw Object.assign(new Error('La risposta AI non contiene JSON'), { status: 502, code: 'invalid-ai-response' });
  return JSON.parse(value.slice(firstObject, lastObject + 1));
}
async function callCompatibleChat(settings, system, payload, env = process.env) {
  const endpoint = asString(settings.llm.endpoint, 2_000); const model = asString(settings.llm.model, 300); const keyName = asString(settings.llm.apiKeyEnv, 120);
  if (!endpoint || !model) throw Object.assign(new Error('Configura endpoint e modello AI'), { status: 409, code: 'ai-not-configured' });
  const key = keyName ? env[keyName] : '';
  if (keyName && !key) throw Object.assign(new Error(`Variabile ${keyName} non disponibile nel runtime`), { status: 409, code: 'ai-secret-missing' });
  const headers = { 'content-type': 'application/json' }; if (key) headers.authorization = `Bearer ${key}`;
  const response = await fetch(endpoint, {
    method: 'POST', headers,
    body: JSON.stringify({ model, temperature: Number(settings.llm.temperature ?? 0.1), response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify(payload) }] }),
    signal: AbortSignal.timeout(Number(process.env.ICTC_AI_TIMEOUT_MS || 45_000))
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body?.error?.message || body?.error || `Errore provider AI: ${response.status}`), { status: 502, code: 'ai-provider-error' });
  return extractJson(body?.choices?.[0]?.message?.content);
}
export async function discoverCompliance(settings, job, contributions, env = process.env) {
  const raw = await callCompatibleChat(settings, asString(job.prompt, 30_000) || settings.prompts.complianceDiscovery, {
    task: 'compliance-discovery', organizationScope: settings.organization.scope,
    job: { name: job.name, scope: job.scope, jurisdictions: job.jurisdictions, authorities: job.authorities, documentTypes: job.documentTypes, sourceUrls: job.sourceUrls },
    userContributions: contributions.map(item => ({ id: item.id, kind: item.kind, title: item.title, url: item.url, text: item.text, attachments: item.attachments }))
  }, env);
  return asArray(raw.items, 500).map(item => ({
    documentType: normalizeDocumentType(item.documentType), title: asString(item.title, 1_000), authority: asString(item.authority, 500),
    jurisdiction: asString(item.jurisdiction, 200), identifier: asString(item.identifier, 300), sourceUrl: asString(item.sourceUrl, 2_000),
    canonicalUri: asString(item.canonicalUri, 2_000), status: asString(item.status, 120) || 'unknown', datePublished: asString(item.datePublished, 80),
    dateEffective: asString(item.dateEffective, 80), language: asString(item.language, 30) || 'it', summary: asString(item.summary, 8_000),
    confidence: Math.max(0, Math.min(1, Number(item.confidence ?? 0))), relations: asArray(item.relations, 50).map(value => asString(value, 500)).filter(Boolean)
  })).filter(item => item.title && (item.sourceUrl || item.identifier));
}
export async function draftIncident(settings, incident, env = process.env) {
  const raw = await callCompatibleChat(settings, settings.prompts.incidentDraft, { task: 'incident-draft', incident: {
    kind: incident.kind, title: incident.title, awarenessAt: incident.awarenessAt, detectedAt: incident.detectedAt, facts: incident.facts,
    affectedServices: incident.affectedServices, impact: incident.impact, indicators: incident.indicators, mitigations: incident.mitigations,
    maliciousSuspected: incident.maliciousSuspected, crossBorder: incident.crossBorder, contacts: incident.contacts, attachments: incident.attachments
  } }, env);
  return {
    summary: asString(raw.summary, 10_000), chronology: asArray(raw.chronology, 100).map(item => asString(item, 1_000)).filter(Boolean),
    affectedServices: asArray(raw.affectedServices, 100).map(item => asString(item, 500)).filter(Boolean), impact: asString(raw.impact, 10_000),
    indicators: asArray(raw.indicators, 100).map(item => asString(item, 500)).filter(Boolean), mitigations: asArray(raw.mitigations, 100).map(item => asString(item, 1_000)).filter(Boolean),
    rootCause: asString(raw.rootCause, 5_000), openQuestions: asArray(raw.openQuestions, 100).map(item => asString(item, 1_000)).filter(Boolean),
    notificationData: raw.notificationData && typeof raw.notificationData === 'object' ? raw.notificationData : {}
  };
}
