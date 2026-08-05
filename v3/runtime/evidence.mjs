import { routeMatch, httpError, requirePermission, sendEvidence } from './http.mjs';
import { canAccessContribution, canAccessIncident } from './model.mjs';
import { safeFilename } from '../domain.mjs';

export function createEvidenceHandler({ store, permissions }) {
  return async function handle(request, response, pathname, actor) {
    const method = request.method || 'GET';
    let params = routeMatch(pathname, '/api/evidence/:type/:id');
    if (method === 'GET' && params) {
      requirePermission(actor, 'read', permissions);
      const evidenceActor = actor.role === 'auditor' ? { ...actor, role: 'admin' } : actor;
      const bundle = store.evidenceBundle(params.type, params.id, evidenceActor);
      if (!bundle) throw httpError(404, 'Fascicolo non disponibile', 'not-found');
      bundle.generatedBy = actor.id;
      bundle.generatedForRole = actor.role;
      sendEvidence(response, bundle, params.type, params.id);
      return true;
    }
    params = routeMatch(pathname, '/api/attachments/:id');
    if (method === 'GET' && params) {
      requirePermission(actor, 'read', permissions);
      const item = await store.attachment(params.id);
      if (!item) throw httpError(404, 'Allegato non trovato', 'not-found');
      const snapshot = store.snapshot();
      const incident = snapshot.incidents.find(entry => (entry.attachments || []).some(file => file.id === params.id));
      if (incident && actor.role !== 'auditor' && !canAccessIncident(actor, incident)) throw httpError(403, 'Allegato non accessibile', 'forbidden');
      const contribution = snapshot.contributions.find(entry => (entry.attachments || []).some(file => file.id === params.id));
      if (contribution && !canAccessContribution(actor, contribution)) throw httpError(403, 'Allegato non accessibile', 'forbidden');
      response.writeHead(200, {
        'content-type': item.metadata.mime,
        'content-length': item.buffer.length,
        'content-disposition': `attachment; filename="${safeFilename(item.metadata.name)}"`,
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      });
      response.end(item.buffer);
      return true;
    }
    return false;
  };
}
