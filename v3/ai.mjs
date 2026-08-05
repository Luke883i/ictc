import { asString, canonicalJson, now, redactEndpoint, sha256 } from './domain.mjs';
import { fetchAiEndpoint } from './network-policy.mjs';

function parseJsonContent(content) {
  const text = asString(content, 200_000);
  const unfenced = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try { return JSON.parse(unfenced); }
  catch {
    const start = unfenced.indexOf('{'); const end = unfenced.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(unfenced.slice(start, end + 1));
    throw new Error('Il provider AI non ha restituito JSON valido');
  }
}

export async function callJson(settings, purpose, systemPrompt, payload, options = {}) {
  const endpoint = asString(settings.llm.endpoint, 4_000); const model = asString(settings.llm.model, 500);
  if (!endpoint || !model) throw Object.assign(new Error('Provider AI non configurato'), { status: 409, code: 'ai-not-configured' });
  const keyEnv = asString(settings.llm.apiKeyEnv, 200); const key = keyEnv ? process.env[keyEnv] : '';
  if (keyEnv && !key) throw Object.assign(new Error(`Variabile ${keyEnv} non disponibile`), { status: 409, code: 'ai-key-missing' });
  const requestedAt = now(); const prompt = `${systemPrompt}\n\nICTC_PURPOSE_RUNTIME:${purpose}`; const inputJson = canonicalJson(payload);
  const body = {
    model, temperature: Number(settings.llm.temperature ?? 0.1), response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: prompt }, { role: 'user', content: inputJson }]
  };
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), Number(options.timeoutMs || 45_000));
  let response; let responseText = '';
  try {
    response = await fetchAiEndpoint(endpoint, {
      method: 'POST', headers: { 'content-type': 'application/json', ...(key ? { authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify(body), signal: controller.signal
    });
    responseText = await response.text();
  } catch (error) {
    if (error.status) throw error;
    const message = error.name === 'AbortError' ? 'Timeout del provider AI' : `Provider AI non raggiungibile: ${error.message}`;
    throw Object.assign(new Error(message), { status: 502, code: error.name === 'AbortError' ? 'ai-timeout' : 'ai-unavailable' });
  } finally { clearTimeout(timeout); }
  if (!response.ok) throw Object.assign(new Error(`Provider AI: ${response.status}`), { status: 502, code: 'ai-provider-error', details: responseText.slice(0, 1_000) });
  let envelope; try { envelope = JSON.parse(responseText); } catch { throw Object.assign(new Error('Risposta del provider AI non valida'), { status: 502, code: 'ai-response-invalid' }); }
  const content = envelope.choices?.[0]?.message?.content ?? envelope.output_text ?? envelope.content;
  const output = typeof content === 'object' ? content : parseJsonContent(content);
  return {
    output,
    trace: {
      purpose, endpoint: redactEndpoint(endpoint), model, requestedAt, completedAt: now(),
      promptSha256: sha256(prompt), inputSha256: sha256(inputJson), outputSha256: sha256(output),
      providerRequestId: asString(response.headers.get('x-request-id') || envelope.id, 500),
      limitations: ['Output generato da AI e non verificato automaticamente.']
    }
  };
}
export function createMonitoringPlan(settings, mission) {
  return callJson(settings, 'monitoring-plan', settings.prompts.monitoringPlan, {
    organization: settings.organization, objective: mission.objective, cadenceHours: mission.cadenceHours,
    sourceHints: mission.sourceHints, promptOverride: mission.promptOverride || null
  });
}
export function discoverCompliance(settings, mission, plan, context = {}) {
  const prompt = mission.promptOverride || settings.prompts.complianceDiscovery;
  return callJson(settings, 'compliance-discovery', prompt, {
    organization: settings.organization, objective: mission.objective, plan,
    previousIdentifiers: context.previousIdentifiers || [], contributionContext: context.contributionContext || null,
    outputContract: { items: [{ title: 'string', documentType: 'controlled string', authority: 'string', jurisdiction: 'string', identifier: 'string', sourceUrl: 'official http(s) URL', publicationDate: 'ISO date or empty', effectiveDate: 'ISO date or empty', summary: 'string', relevance: 'string', confidence: '0..1' }] }
  });
}
export function enrichContribution(settings, contribution) {
  return callJson(settings, 'contribution-enrichment', settings.prompts.contributionEnrichment, {
    organization: settings.organization,
    contribution: { note: contribution.note, links: contribution.links, text: contribution.text, attachments: contribution.attachments.map(item => ({ name: item.name, mime: item.mime, bytes: item.bytes, sha256: item.sha256 })) }
  });
}
export function analyzeIncident(settings, incident) {
  return callJson(settings, 'incident-analysis', settings.prompts.incidentAnalysis, {
    organization: settings.organization, originalNarrative: incident.originalNarrative, awarenessAt: incident.awarenessAt,
    attachments: incident.attachments.map(item => ({ name: item.name, mime: item.mime, bytes: item.bytes, sha256: item.sha256 })),
    outputContract: { proposedKind: 'event|near-miss|incident|unknown', kindConfidence: '0..1', extractedFacts: ['string'], assumptions: ['string'], signals: ['ongoing|personal-data|malicious|cross-border|technical-detection'], timeline: [{ at: 'ISO date or empty', event: 'string', source: 'user|attachment|inference' }], affectedServices: ['string'], impact: 'string', mitigations: ['string'], indicators: ['string'], suggestedQuestions: [{ label: 'string', reason: 'string' }] }
  });
}
export function draftIncident(settings, incident, questions) {
  return callJson(settings, 'incident-draft', settings.prompts.incidentDraft, {
    organization: settings.organization, originalNarrative: incident.originalNarrative, awarenessAt: incident.awarenessAt,
    attachments: incident.attachments.map(item => ({ name: item.name, mime: item.mime, sha256: item.sha256 })),
    analysis: incident.analysis, answers: incident.answers, unresolvedQuestions: questions,
    outputContract: { narrative: 'string', factsUsed: ['string'], unresolvedPoints: ['string'], limitations: ['string'] }
  });
}
