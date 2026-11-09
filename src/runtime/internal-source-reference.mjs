import { DOCUMENT_TYPES, asString, id, normalizeUrl, now } from '../domain.mjs';
import { httpError } from './http.mjs';
import { normalizeRnDiscoveredItem } from './rn-monitoring-policy.mjs';

function requiredText(value, field, max = 1000) {
  const normalized = asString(value, max);
  if (!normalized) throw httpError(400, `Campo obbligatorio: ${field}`, 'internal-reference-field-required', { field });
  return normalized;
}

function sha256Text(value) {
  const normalized = asString(value, 64).toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    throw httpError(400, 'Il digest SHA-256 della versione master deve contenere 64 caratteri esadecimali', 'internal-reference-digest-invalid');
  }
  return normalized;
}

function requiredUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) throw httpError(400, 'Indica un URL http(s) del sistema master', 'internal-reference-url-required');
  return normalized;
}

export function normalizeInternalSourceReference(input, actor) {
  const documentType = asString(input.documentType, 80).toLowerCase();
  const recordedAt = now();
  const source = {
    title: requiredText(input.title, 'title', 1000),
    documentType: DOCUMENT_TYPES.includes(documentType) ? documentType : 'other',
    authority: asString(input.authority, 500),
    jurisdiction: asString(input.jurisdiction, 500),
    identifier: asString(input.identifier, 500),
    sourceUrl: normalizeUrl(input.publicSourceUrl),
    publicationDate: asString(input.publicationDate, 80),
    effectiveDate: asString(input.effectiveDate, 80),
    relevance: asString(input.note, 3000)
  };
  const eligible = normalizeRnDiscoveredItem(source, { sourceClasses: null });
  if (!eligible) {
    throw httpError(
      400,
      'Il riferimento interno può entrare in RN-01 solo se il contenuto referenziato appartiene a una delle quattro classi di fonte ammesse.',
      'internal-reference-outside-rn-universe'
    );
  }
  return {
    ...source,
    sourceClass: eligible.sourceClass,
    rnClassificationEvidence: eligible.rnClassificationEvidence,
    internalReference: {
      masterSystem: requiredText(input.masterSystem, 'masterSystem', 300),
      masterId: requiredText(input.masterId, 'masterId', 500),
      masterVersion: requiredText(input.masterVersion, 'masterVersion', 300),
      contentSha256: sha256Text(input.contentSha256),
      referenceUrl: requiredUrl(input.referenceUrl),
      authorityMode: 'external-master',
      recordedAt,
      recordedBy: actor.id
    }
  };
}

export function internalReferenceVersionKey(reference) {
  return [reference?.masterSystem, reference?.masterId, reference?.masterVersion]
    .map(value => asString(value, 500).toLowerCase())
    .join('|');
}

export async function recordInternalSourceReference(store, actor, input, command = {}) {
  const normalized = normalizeInternalSourceReference(input, actor);
  const versionKey = internalReferenceVersionKey(normalized.internalReference);
  const sourceId = id('source');
  const observedAt = normalized.internalReference.recordedAt;
  const origin = {
    kind: 'internal-reference',
    observedAt,
    masterSystem: normalized.internalReference.masterSystem,
    masterId: normalized.internalReference.masterId,
    masterVersion: normalized.internalReference.masterVersion,
    submittedBy: actor.id
  };
  const observation = {
    observedAt,
    origin: structuredClone(origin),
    title: normalized.title,
    documentType: normalized.documentType,
    authority: normalized.authority,
    jurisdiction: normalized.jurisdiction,
    identifier: normalized.identifier,
    sourceUrl: normalized.sourceUrl,
    publicationDate: normalized.publicationDate,
    effectiveDate: normalized.effectiveDate,
    summary: '',
    relevance: normalized.relevance,
    confidence: 0,
    sourceClass: normalized.sourceClass,
    rnClassificationEvidence: structuredClone(normalized.rnClassificationEvidence),
    aiTrace: null,
    internalReference: structuredClone(normalized.internalReference)
  };
  const candidate = {
    id: sourceId,
    title: normalized.title,
    documentType: normalized.documentType,
    authority: normalized.authority,
    jurisdiction: normalized.jurisdiction,
    identifier: normalized.identifier,
    sourceUrl: normalized.sourceUrl,
    publicationDate: normalized.publicationDate,
    effectiveDate: normalized.effectiveDate,
    summary: '',
    relevance: normalized.relevance,
    confidence: 0,
    sourceClass: normalized.sourceClass,
    rnClassificationEvidence: structuredClone(normalized.rnClassificationEvidence),
    state: 'candidate',
    origin,
    internalReference: structuredClone(normalized.internalReference),
    aiTrace: null,
    decisions: [],
    observations: [observation],
    createdAt: observedAt,
    updatedAt: observedAt
  };

  return store.mutate(
    actor,
    'catalog.internal-reference.recorded',
    { type: 'catalog', id: sourceId },
    {
      masterSystem: normalized.internalReference.masterSystem,
      masterId: normalized.internalReference.masterId,
      masterVersion: normalized.internalReference.masterVersion,
      contentSha256: normalized.internalReference.contentSha256,
      referenceUrl: normalized.internalReference.referenceUrl,
      title: normalized.title,
      publicSourceUrl: normalized.sourceUrl,
      sourceClass: normalized.sourceClass
    },
    draft => {
      const duplicate = draft.catalog.find(item => item.internalReference && internalReferenceVersionKey(item.internalReference) === versionKey);
      if (duplicate) {
        throw httpError(409, 'Questa versione della fonte interna è già registrata', 'internal-reference-version-exists', {
          existingCatalogId: duplicate.id,
          masterSystem: normalized.internalReference.masterSystem,
          masterId: normalized.internalReference.masterId,
          masterVersion: normalized.internalReference.masterVersion
        });
      }
      draft.catalog.push(candidate);
      return candidate;
    },
    command
  );
}
