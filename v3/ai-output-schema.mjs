import { DOCUMENT_TYPES, INCIDENT_KINDS } from './domain.mjs';

const SIGNALS = new Set(['ongoing', 'personal-data', 'malicious', 'cross-border', 'technical-detection']);
const TIMELINE_SOURCES = new Set(['user', 'attachment', 'inference']);
const CHANGE_TYPES = new Set(['new-law', 'amendment', 'repeal', 'guidance', 'effective-date', '']);

function schemaError(purpose, path, reason, code = 'ai-output-schema-invalid', status = 502) {
  return Object.assign(new Error(`Output AI non conforme al contratto ${purpose}: ${path} ${reason}`), {
    status,
    code,
    details: { purpose, path, reason }
  });
}

function object(value, purpose, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw schemaError(purpose, path, 'deve essere un oggetto');
  return value;
}

function exactKeys(value, required, optional, purpose, path) {
  const record = object(value, purpose, path);
  for (const key of required) if (!Object.hasOwn(record, key)) throw schemaError(purpose, `${path}.${key}`, 'manca');
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(record)) if (!allowed.has(key)) throw schemaError(purpose, `${path}.${key}`, 'non e consentito');
  return record;
}

function text(value, purpose, path, max, { allowEmpty = true } = {}) {
  if (typeof value !== 'string') throw schemaError(purpose, path, 'deve essere una stringa');
  if (!allowEmpty && !value.trim()) throw schemaError(purpose, path, 'non puo essere vuoto');
  if (value.length > max) throw schemaError(purpose, path, `supera ${max} caratteri`);
  return value;
}

function number(value, purpose, path, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw schemaError(purpose, path, `deve essere un numero tra ${min} e ${max}`);
  }
  return value;
}

function list(value, purpose, path, maxItems, validate) {
  if (!Array.isArray(value)) throw schemaError(purpose, path, 'deve essere un array');
  if (value.length > maxItems) throw schemaError(purpose, path, `supera ${maxItems} elementi`);
  return value.map((item, index) => validate(item, `${path}[${index}]`));
}

function textList(value, purpose, path, maxItems = 100, maxLength = 4000) {
  return list(value, purpose, path, maxItems, (item, itemPath) => text(item, purpose, itemPath, maxLength));
}

function enumText(value, allowed, purpose, path) {
  const result = text(value, purpose, path, 200);
  if (!allowed.has(result)) throw schemaError(purpose, path, `valore non consentito: ${result}`);
  return result;
}

function dateText(value, purpose, path) {
  const result = text(value, purpose, path, 64);
  if (!result) return result;
  if (!/^\d{4}-\d{2}-\d{2}(?:T[^\s]+)?$/.test(result) || Number.isNaN(Date.parse(result))) {
    throw schemaError(purpose, path, 'deve essere una data ISO valida o vuota');
  }
  return result;
}

function httpUrl(value, purpose, path) {
  const result = text(value, purpose, path, 4000);
  if (!result) return result;
  let url;
  try { url = new URL(result); } catch { throw schemaError(purpose, path, 'deve essere un URL http(s) valido o vuoto'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw schemaError(purpose, path, 'deve essere un URL http(s) senza credenziali');
  }
  return result;
}

function catalogItem(value, purpose, path) {
  const record = exactKeys(
    value,
    ['title', 'documentType', 'authority', 'jurisdiction', 'identifier', 'sourceUrl', 'publicationDate', 'effectiveDate', 'summary', 'relevance', 'confidence'],
    ['changeType', 'noveltyReason'],
    purpose,
    path
  );
  const documentTypes = new Set(DOCUMENT_TYPES);
  const result = {
    title: text(record.title, purpose, `${path}.title`, 1000, { allowEmpty: false }),
    documentType: enumText(record.documentType, documentTypes, purpose, `${path}.documentType`),
    authority: text(record.authority, purpose, `${path}.authority`, 1000),
    jurisdiction: text(record.jurisdiction, purpose, `${path}.jurisdiction`, 500),
    identifier: text(record.identifier, purpose, `${path}.identifier`, 1000),
    sourceUrl: httpUrl(record.sourceUrl, purpose, `${path}.sourceUrl`),
    publicationDate: dateText(record.publicationDate, purpose, `${path}.publicationDate`),
    effectiveDate: dateText(record.effectiveDate, purpose, `${path}.effectiveDate`),
    summary: text(record.summary, purpose, `${path}.summary`, 12000),
    relevance: text(record.relevance, purpose, `${path}.relevance`, 12000),
    confidence: number(record.confidence, purpose, `${path}.confidence`, 0, 1)
  };
  if (Object.hasOwn(record, 'changeType')) result.changeType = enumText(record.changeType, CHANGE_TYPES, purpose, `${path}.changeType`);
  if (Object.hasOwn(record, 'noveltyReason')) result.noveltyReason = text(record.noveltyReason, purpose, `${path}.noveltyReason`, 12000);
  return result;
}

function monitoringPlan(value, purpose) {
  const record = exactKeys(value, ['queries', 'preferredSources', 'inclusionCriteria', 'exclusionCriteria', 'rationale'], [], purpose, '$');
  return {
    queries: textList(record.queries, purpose, '$.queries', 50, 4000),
    preferredSources: textList(record.preferredSources, purpose, '$.preferredSources', 50, 1000),
    inclusionCriteria: textList(record.inclusionCriteria, purpose, '$.inclusionCriteria', 50, 4000),
    exclusionCriteria: textList(record.exclusionCriteria, purpose, '$.exclusionCriteria', 50, 4000),
    rationale: text(record.rationale, purpose, '$.rationale', 12000)
  };
}

function discovery(value, purpose) {
  const record = exactKeys(value, ['items'], [], purpose, '$');
  return { items: list(record.items, purpose, '$.items', 100, (item, path) => catalogItem(item, purpose, path)) };
}

function incidentAnalysis(value, purpose) {
  const record = exactKeys(value, ['proposedKind', 'kindConfidence', 'extractedFacts', 'assumptions', 'signals', 'timeline', 'affectedServices', 'impact', 'mitigations', 'indicators', 'suggestedQuestions'], [], purpose, '$');
  const kinds = new Set(INCIDENT_KINDS);
  return {
    proposedKind: enumText(record.proposedKind, kinds, purpose, '$.proposedKind'),
    kindConfidence: number(record.kindConfidence, purpose, '$.kindConfidence', 0, 1),
    extractedFacts: textList(record.extractedFacts, purpose, '$.extractedFacts', 100, 20000),
    assumptions: textList(record.assumptions, purpose, '$.assumptions', 100, 12000),
    signals: list(record.signals, purpose, '$.signals', 20, (item, path) => enumText(item, SIGNALS, purpose, path)),
    timeline: list(record.timeline, purpose, '$.timeline', 200, (item, path) => {
      const row = exactKeys(item, ['at', 'event', 'source'], [], purpose, path);
      return { at: dateText(row.at, purpose, `${path}.at`), event: text(row.event, purpose, `${path}.event`, 12000), source: enumText(row.source, TIMELINE_SOURCES, purpose, `${path}.source`) };
    }),
    affectedServices: textList(record.affectedServices, purpose, '$.affectedServices', 100, 4000),
    impact: text(record.impact, purpose, '$.impact', 12000),
    mitigations: textList(record.mitigations, purpose, '$.mitigations', 100, 12000),
    indicators: textList(record.indicators, purpose, '$.indicators', 200, 4000),
    suggestedQuestions: list(record.suggestedQuestions, purpose, '$.suggestedQuestions', 50, (item, path) => {
      const row = exactKeys(item, ['label', 'reason'], [], purpose, path);
      return { label: text(row.label, purpose, `${path}.label`, 4000, { allowEmpty: false }), reason: text(row.reason, purpose, `${path}.reason`, 12000) };
    })
  };
}

function incidentDraft(value, purpose) {
  const record = exactKeys(value, ['narrative', 'factsUsed', 'unresolvedPoints', 'limitations'], [], purpose, '$');
  return {
    narrative: text(record.narrative, purpose, '$.narrative', 50000, { allowEmpty: false }),
    factsUsed: textList(record.factsUsed, purpose, '$.factsUsed', 200, 20000),
    unresolvedPoints: textList(record.unresolvedPoints, purpose, '$.unresolvedPoints', 100, 12000),
    limitations: textList(record.limitations, purpose, '$.limitations', 100, 12000)
  };
}

const VALIDATORS = Object.freeze({
  'monitoring-plan': monitoringPlan,
  'compliance-discovery': discovery,
  'contribution-enrichment': discovery,
  'incident-analysis': incidentAnalysis,
  'incident-draft': incidentDraft
});

export const AI_OUTPUT_PURPOSES = Object.freeze(Object.keys(VALIDATORS));

export function validateSchema(purpose, value) {
  const validator = VALIDATORS[purpose];
  if (!validator) throw schemaError(purpose || '(vuoto)', '$', 'purpose privo di schema registrato', 'ai-output-schema-unknown-purpose', 500);
  return validator(value, purpose);
}
