import { enrichContribution } from '../ai.mjs';
import { asString, id, normalizeUrl, now, uniqueStrings } from '../domain.mjs';
import { bodyJson, commandFrom, httpError, json, requirePermission } from './http.mjs';
import { catalogKey, normalizeCatalogItem } from './model.mjs';

export function createContributionHandler({ store, permissions }) {
  return async function handle(request, response, pathname, actor) {
    if ((request.method || 'GET') !== 'POST' || pathname !== '/api/contributions') return false;
    requirePermission(actor, 'contribute-source', permissions);
    const input = await bodyJson(request);
    const links = uniqueStrings(input.links).map(normalizeUrl).filter(Boolean);
    const text = asString(input.text, 50_000);
    const note = asString(input.note, 5_000);
    const attachments = await store.saveAttachments(input.attachments || []);
    if (!links.length && !text && !attachments.length) throw httpError(400, 'Aggiungi almeno un link, un testo o un documento', 'material-required');
    const contributionId = id('contribution');
    const rawEnvelope = await store.mutate(actor, 'contribution.recorded', { type: 'contribution', id: contributionId }, {
      links, text, note, attachmentDigests: attachments.map(item => item.sha256)
    }, draft => {
      const item = {
        id: contributionId, links, text, note, attachments, state: 'recorded', createdAt: now(), createdBy: actor.id,
        enrichedAt: null, aiTrace: null, aiError: null
      };
      draft.contributions.push(item);
      return item;
    }, commandFrom(request));

    let enrichmentEnvelope = null;
    let warning = null;
    try {
      const current = store.snapshot().contributions.find(item => item.id === contributionId);
      const ai = await enrichContribution(store.snapshot().settings, current);
      enrichmentEnvelope = await store.mutate(actor, 'contribution.enriched', { type: 'contribution', id: contributionId }, { trace: ai.trace }, draft => {
        const contribution = draft.contributions.find(item => item.id === contributionId);
        const items = Array.isArray(ai.output.items) ? ai.output.items : [];
        contribution.state = 'enriched';
        contribution.enrichedAt = now();
        contribution.aiTrace = ai.trace;
        contribution.aiError = null;
        let inserted = 0;
        for (const raw of items.slice(0, 50)) {
          const normalized = normalizeCatalogItem(raw, { kind: 'contribution', contributionId, observedAt: now() }, ai.trace, id);
          const key = catalogKey(normalized);
          if (!draft.catalog.some(entry => catalogKey(entry) === key && key !== '||')) {
            draft.catalog.push(normalized);
            inserted += 1;
          }
        }
        return { contribution, inserted };
      }, { id: `${asString(request.headers['x-ictc-command-id'], 160)}-enrich` });
    } catch (error) {
      warning = error.message;
      await store.mutate(actor, 'contribution.enrichment.deferred', { type: 'contribution', id: contributionId }, { error: error.message }, draft => {
        const contribution = draft.contributions.find(item => item.id === contributionId);
        contribution.state = 'needs-enrichment';
        contribution.aiError = error.message;
        return contribution;
      });
    }
    json(response, 201, { raw: rawEnvelope, enrichment: enrichmentEnvelope, warning });
    return true;
  };
}
