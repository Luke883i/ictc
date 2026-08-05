import { createHash, randomUUID } from 'node:crypto';

export const VERSION = '1.6.0-rc.1';
export const ROLES = Object.freeze(['admin', 'user']);
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS = 10;
export const DOCUMENT_TYPES = Object.freeze([
  'constitution', 'treaty', 'regulation', 'directive', 'decision', 'law',
  'legislative-decree', 'decree', 'authority-decision', 'guideline',
  'circular', 'standard', 'case-law', 'other'
]);
export const CATALOG_STATES = Object.freeze(['candidate', 'verified', 'rejected', 'superseded']);
export const INCIDENT_STATES = Object.freeze(['intake', 'clarifying', 'review', 'submitted', 'closed']);
export const INCIDENT_KINDS = Object.freeze(['event', 'near-miss', 'incident', 'unknown']);

export const DEFAULT_PROMPTS = Object.freeze({
  monitoringPlan: `ICTC_PURPOSE:monitoring-plan\nProgetta un piano di ricerca di fonti ufficiali per il perimetro dichiarato. Restituisci JSON con queries, preferredSources, inclusionCriteria, exclusionCriteria e rationale. Non dichiarare applicabilità o conformità.`,
  complianceDiscovery: `ICTC_PURPOSE:compliance-discovery\nIdentifica fonti normative e para-normative ufficiali pertinenti al perimetro e al piano forniti. Restituisci JSON con items. Ogni item deve contenere title, documentType, authority, jurisdiction, identifier, sourceUrl, publicationDate, effectiveDate, summary, relevance, confidence. Non inventare URL o identificativi e non concludere applicabilità.`,
  contributionEnrichment: `ICTC_PURPOSE:contribution-enrichment\nClassifica il materiale fornito come fonte candidata. Restituisci JSON con items usando gli stessi campi del catalogo. Mantieni separati dati osservati, inferenze e dati mancanti.`,
  incidentAnalysis: `ICTC_PURPOSE:incident-analysis\nAnalizza il racconto originale senza riscriverlo. Restituisci JSON con proposedKind, kindConfidence, extractedFacts, assumptions, signals, timeline, affectedServices, impact, mitigations, indicators e suggestedQuestions. Non concludere obblighi di notifica.`,
  incidentDraft: `ICTC_PURPOSE:incident-draft\nCrea una formulazione amministrativa chiara usando soltanto racconto originale, allegati, fatti estratti e risposte umane. Restituisci JSON con narrative, factsUsed, unresolvedPoints e limitations. Distingui fatti, informazioni non disponibili e ipotesi.`
});

export function now() { return new Date().toISOString(); }
export function id(prefix) { return `${prefix}_${randomUUID()}`; }
export function asString(value, max = 20_000) { return String(value ?? '').trim().slice(0, max); }
export function asArray(value) { return Array.isArray(value) ? value : value == null ? [] : [value]; }
export function uniqueStrings(value, maxItems = 100, maxLength = 1_000) {
  return [...new Set(asArray(value).map(item => asString(item, maxLength)).filter(Boolean))].slice(0, maxItems);
}
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}
export function sha256(value) {
  const input = Buffer.isBuffer(value) ? value : Buffer.from(typeof value === 'string' ? value : canonicalJson(value));
  return createHash('sha256').update(input).digest('hex');
}
export function publicSettings(settings) {
  const keyEnv = asString(settings.llm.apiKeyEnv, 200);
  return {
    organization: structuredClone(settings.organization),
    llm: {
      endpoint: settings.llm.endpoint,
      model: settings.llm.model,
      apiKeyEnv: keyEnv,
      temperature: settings.llm.temperature,
      configured: Boolean(settings.llm.endpoint && settings.llm.model),
      ready: Boolean(settings.llm.endpoint && settings.llm.model && (!keyEnv || process.env[keyEnv]))
    },
    prompts: structuredClone(settings.prompts),
    updatedAt: settings.updatedAt,
    updatedBy: settings.updatedBy
  };
}
export function cadenceHours(value) {
  const aliases = { daily: 24, weekly: 168, monthly: 720 };
  if (typeof value === 'string' && aliases[value]) return aliases[value];
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.min(8_760, Math.round(number))) : 168;
}
export function nextRunAt(from, hours) { return new Date(new Date(from).getTime() + hours * 3_600_000).toISOString(); }
export function reminderDates(awarenessAt) {
  const base = new Date(awarenessAt);
  if (Number.isNaN(base.valueOf())) return null;
  return {
    earlyWarning24h: new Date(base.getTime() + 24 * 3_600_000).toISOString(),
    notification72h: new Date(base.getTime() + 72 * 3_600_000).toISOString(),
    finalReportOneMonth: new Date(base.getTime() + 30 * 24 * 3_600_000).toISOString()
  };
}
export function normalizeUrl(value) {
  const raw = asString(value, 4_000);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    url.hash = '';
    return url.toString();
  } catch { return ''; }
}
export function redactEndpoint(value) {
  try { const url = new URL(value); return `${url.protocol}//${url.host}${url.pathname}`; }
  catch { return asString(value, 500); }
}
export function safeFilename(value, fallback = 'file') {
  return asString(value, 240).replace(/[\r\n"\\/]/g, '_') || fallback;
}
