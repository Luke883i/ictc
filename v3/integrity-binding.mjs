import { canonicalJson, id, now, sha256 } from './domain.mjs';

export const INTEGRITY_BINDING_SCOPE = Object.freeze({
  excludes: ['audit', 'commandResults'],
  historicalStateReconstructible: false,
  claim: 'current-canonical-state-bound-to-audit-head'
});

export function canonicalStatePayload(state) {
  const payload = structuredClone(state || {});
  delete payload.audit;
  delete payload.commandResults;
  return payload;
}

export function canonicalStateSha256(state) {
  return sha256(canonicalJson(canonicalStatePayload(state)));
}

export function auditEventHash(event) {
  const { hash, ...unsigned } = event || {};
  return sha256(canonicalJson(unsigned));
}

export function verifyStateIntegrity(state) {
  const audit = Array.isArray(state?.audit) ? state.audit : [];
  const revision = Number(state?.revision || 0);
  let previousHash = 'GENESIS';
  let expectedRevision = 1;

  for (const event of audit) {
    if (event.revision !== expectedRevision || event.previousHash !== previousHash || event.hash !== auditEventHash(event)) {
      return {
        ok: false,
        chainOk: false,
        stateBound: false,
        reason: 'audit-chain-invalid',
        atRevision: event.revision,
        expectedRevision,
        expectedPreviousHash: previousHash,
        revision,
        events: audit.length
      };
    }
    previousHash = event.hash;
    expectedRevision += 1;
  }

  if (revision !== audit.length) {
    return {
      ok: false,
      chainOk: false,
      stateBound: false,
      reason: 'revision-audit-length-mismatch',
      revision,
      events: audit.length,
      head: previousHash
    };
  }

  const stateSha256 = canonicalStateSha256(state);
  if (!audit.length) {
    return {
      ok: true,
      chainOk: true,
      stateBound: false,
      bindingMode: 'genesis-unbound',
      events: 0,
      head: 'GENESIS',
      revision,
      canonicalStateSha256: stateSha256,
      headStateSha256: null,
      scope: INTEGRITY_BINDING_SCOPE
    };
  }

  const head = audit.at(-1);
  if (!head.stateSha256) {
    return {
      ok: true,
      chainOk: true,
      stateBound: false,
      bindingMode: 'legacy-unbound',
      events: audit.length,
      head: previousHash,
      revision,
      canonicalStateSha256: stateSha256,
      headStateSha256: null,
      scope: INTEGRITY_BINDING_SCOPE
    };
  }

  if (head.stateSha256 !== stateSha256) {
    return {
      ok: false,
      chainOk: true,
      stateBound: false,
      bindingMode: 'head-state-mismatch',
      reason: 'state-head-mismatch',
      events: audit.length,
      head: previousHash,
      revision,
      canonicalStateSha256: stateSha256,
      headStateSha256: head.stateSha256,
      scope: INTEGRITY_BINDING_SCOPE
    };
  }

  return {
    ok: true,
    chainOk: true,
    stateBound: true,
    bindingMode: 'current-head-bound',
    events: audit.length,
    head: previousHash,
    revision,
    canonicalStateSha256: stateSha256,
    headStateSha256: head.stateSha256,
    scope: INTEGRITY_BINDING_SCOPE
  };
}

export function appendStateBindingEvent(state, options = {}) {
  const preliminary = verifyStateIntegrity(state);
  if (!preliminary.chainOk) {
    throw Object.assign(new Error('Audit chain non valida: impossibile creare un binding dello stato'), {
      status: 500,
      code: 'integrity-chain-invalid',
      details: preliminary
    });
  }

  const draft = structuredClone(state);
  draft.audit = Array.isArray(draft.audit) ? draft.audit : [];
  draft.revision = Number(draft.revision || 0) + 1;
  const previousHash = draft.audit.at(-1)?.hash || 'GENESIS';
  const reason = String(options.reason || 'explicit-binding').slice(0, 200);
  const stateSha256 = canonicalStateSha256(draft);
  const event = {
    id: id('event'),
    revision: draft.revision,
    at: now(),
    actorId: String(options.actorId || 'system:integrity'),
    role: String(options.role || 'system'),
    action: 'integrity.state-bound',
    subject: { type: 'state', id: 'canonical' },
    inputSha256: sha256({ reason, priorRevision: Number(state?.revision || 0), priorHead: previousHash }),
    resultSha256: stateSha256,
    stateSha256,
    previousHash,
    metadata: { control: 'W0-INTEGRITY', reason }
  };
  event.hash = auditEventHash(event);
  draft.audit.push(event);
  return { draft, event, stateSha256 };
}

export function verifyReceiptAgainstState(state, receipt) {
  const integrity = verifyStateIntegrity(state);
  if (!integrity.chainOk) return { ok: false, reason: 'audit-chain-invalid', integrity };
  if (!receipt || typeof receipt !== 'object') return { ok: false, reason: 'receipt-invalid', integrity };

  const event = (state.audit || []).find(item => item.id === receipt.eventId);
  if (!event) return { ok: false, reason: 'receipt-event-missing', integrity };
  const scalarFields = ['revision', 'at', 'action', 'actorId', 'previousHash', 'hash', 'inputSha256', 'resultSha256', 'stateSha256'];
  for (const field of scalarFields) {
    if ((event[field] ?? null) !== (receipt[field] ?? null)) {
      return { ok: false, reason: 'receipt-event-mismatch', field, integrity };
    }
  }
  if (canonicalJson(event.subject ?? null) !== canonicalJson(receipt.subject ?? null)) {
    return { ok: false, reason: 'receipt-event-mismatch', field: 'subject', integrity };
  }

  const currentHead = event.hash === integrity.head;
  return {
    ok: true,
    eventBound: event.hash === auditEventHash(event),
    stateBoundAtIssue: Boolean(event.stateSha256),
    currentHead,
    currentStateBound: currentHead && integrity.stateBound,
    historicalStateReconstructible: false,
    stateSha256: event.stateSha256 || null,
    integrity
  };
}
