import { enrichContribution } from '../ai.mjs';
import { asString, id, normalizeUrl, now, uniqueStrings } from '../domain.mjs';
import { bodyJson, commandFrom, httpError, json, requirePermission, routeMatch } from './http.mjs';
import {
  catalogKey, ensureContributionOwner, findContribution, mergeCatalogObservation, normalizeCatalogItem
} from './model.mjs';

function derivedCommand(command, suffix) {
  return command.id ? { ...command, id: `${command.id}-${suffix}`, expectedRevision: null } : {};
}

export function createContributionHandler({ store, permissions }) {
  async function enrichOne(contributionId, actor, command = {}) {
    const current = findContribution(store.snapshot(), contributionId);
    ensureContributionOwner(actor, current);
    const ai = await enrichContribution(store.snapshot().settings, current);
    return store.mutate(actor, 'contribution.enriched', { type: 'contribution', id: contributionId }, { trace: ai.trace }, draft => {
      const contribution = findContribution(draft, contributionId);
      ensureContributionOwner(actor, contribution);
      const items = Array.isArray(ai.output.items) ? ai.output.items : [];
      contribution.state = 'enriched';
      contribution.enrichedAt = now();
      contribution.aiTrace = ai.trace;
      contribution.aiError = null;
      contribution.enrichmentAttempts = Number(contribution.enrichmentAttempts || 0) + 1;
      let inserted = 0;
      let updated = 0;
      for (const raw of items.slice(0, 50)) {
        const normalized = normalizeCatalogItem(raw, { kind: 'contribution', contributionId, observedAt: now() }, ai.trace, id);
        const key = catalogKey(normalized);
        const existing = draft.catalog.find(entry => catalogKey(entry) === key && key !== '||');
        if (existing) {
          mergeCatalogObservation(existing, normalized);
          updated += 1;
        } else {
          draft.catalog.push(normalized);
          inserted += 1;
        }
      }
      return { contribution, inserted, updated };
    }, command);
  }

  return async function handle(request, response, pathname, actor) {
    const method = request.method || 'GET';
    if (method === 'POST' && pathname === '/api/contributions') {
      requirePermission(actor, 'contribute-source', permissions);
      const input = await bodyJson(request);
      const links = uniqueStrings(input.links).map(normalizeUrl).filter(Boolean);
      const text = asString(input.text, 50_000);
      const note = asString(input.note, 5_000);
      const attachments = await store.saveAttachments(input.attachments || []);
      if (!links.length && !text && !attachments.length) {
        await store.deleteAttachments(attachments);
        throw httpError(400, 'Aggiungi almeno un link, un testo o un documento', 'material-required');
      }
      const contributionId = id('contribution');
      const command = commandFrom(request);
      let rawEnvelope;
      try {
        rawEnvelope = await store.mutate(actor, 'contribution.recorded', { type: 'contribution', id: contributionId }, {
          links, text, note, attachmentDigests: attachments.map(item => item.sha256)
        }, draft => {
          const item = {
            id: contributionId, links, text, note, attachments, state: 'recorded', createdAt: now(), createdBy: actor.id,
            enrichedAt: null, aiTrace: null, aiError: null, enrichmentAttempts: 0
          };
          draft.contributions.push(item);
          return item;
        }, command);
        if (rawEnvelope.replayed) await store.deleteAttachments(attachments);
      } catch (error) {
        await store.deleteAttachments(attachments);
        throw error;
      }

      const recordedId = rawEnvelope.result.id;
      let enrichmentEnvelope = null;
      let warning = null;
      try {
        enrichmentEnvelope = await enrichOne(recordedId, actor, derivedCommand(command, 'enrich'));
      } catch (error) {
        warning = error.message;
        await store.mutate(actor, 'contribution.enrichment.deferred', { type: 'contribution', id: recordedId }, { error: error.message }, draft => {
          const contribution = findContribution(draft, recordedId);
          contribution.state = 'needs-enrichment';
          contribution.aiError = error.message;
          contribution.enrichmentAttempts = Number(contribution.enrichmentAttempts || 0) + 1;
          return contribution;
        }, derivedCommand(command, 'deferred'));
      }
      json(response, rawEnvelope.replayed ? 200 : 201, { raw: rawEnvelope, enrichment: enrichmentEnvelope, warning });
      return true;
    }

    const params = routeMatch(pathname, '/api/contributions/:id/enrich');
    if (method === 'POST' && params) {
      requirePermission(actor, 'contribute-source', permissions);
      await bodyJson(request);
      const current = findContribution(store.snapshot(), params.id);
      ensureContributionOwner(actor, current);
      if (current.state !== 'needs-enrichment') throw httpError(409, 'Il contributo non richiede un nuovo tentativo', 'state-conflict');
      const envelope = await enrichOne(params.id, actor, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }
    return false;
  };
}
