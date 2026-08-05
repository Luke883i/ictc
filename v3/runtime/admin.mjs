import { asString, id, now, uniqueStrings } from '../domain.mjs';
import { bodyJson, commandFrom, httpError, json, requirePermission, routeMatch } from './http.mjs';
import { enterpriseReadiness, normalizeGovernance, usageSummary } from '../enterprise.mjs';

export function createAdminHandler({ store, permissions }) {
  return async function handle(request, response, pathname, actor) {
    const method = request.method || 'GET';
    if (method === 'GET' && pathname === '/api/admin/readiness') {
      requirePermission(actor, 'manage-enterprise', permissions);
      json(response, 200, enterpriseReadiness(store.snapshot(), { integrity: store.verifyChain(), safeBinding: true, dependencyAudit: true }));
      return true;
    }
    if (method === 'GET' && pathname === '/api/admin/usage') {
      requirePermission(actor, 'view-ai-usage', permissions);
      json(response, 200, usageSummary(store.snapshot()));
      return true;
    }
    if (method === 'GET' && pathname === '/api/admin/users') {
      requirePermission(actor, 'manage-users', permissions);
      json(response, 200, { users: store.snapshot().users || [] });
      return true;
    }
    if (method === 'POST' && pathname === '/api/admin/users') {
      requirePermission(actor, 'manage-users', permissions);
      const input = await bodyJson(request);
      const userId = asString(input.id, 160) || id('user');
      const role = ['admin', 'user', 'auditor'].includes(input.role) ? input.role : 'user';
      const envelope = await store.mutate(actor, 'admin.user.created', { type: 'user', id: userId }, input, draft => {
        if ((draft.users || []).some(item => item.id === userId)) throw httpError(409, 'Utente già esistente', 'user-exists');
        const user = { id: userId, displayName: asString(input.displayName, 300) || userId, email: asString(input.email, 320), role, status: 'active', groups: uniqueStrings(input.groups, 50, 120), createdAt: now(), createdBy: actor.id };
        draft.users ||= [];
        draft.users.push(user);
        return user;
      }, commandFrom(request));
      json(response, 201, envelope);
      return true;
    }
    let params = routeMatch(pathname, '/api/admin/users/:id');
    if (method === 'PATCH' && params) {
      requirePermission(actor, 'manage-users', permissions);
      const input = await bodyJson(request);
      const envelope = await store.mutate(actor, 'admin.user.updated', { type: 'user', id: params.id }, input, draft => {
        const user = (draft.users || []).find(item => item.id === params.id);
        if (!user) throw httpError(404, 'Utente non trovato', 'not-found');
        if (input.role && ['admin', 'user', 'auditor'].includes(input.role)) user.role = input.role;
        if (input.status && ['active', 'disabled'].includes(input.status)) user.status = input.status;
        if (input.displayName != null) user.displayName = asString(input.displayName, 300) || user.id;
        if (input.email != null) user.email = asString(input.email, 320);
        user.updatedAt = now();
        user.updatedBy = actor.id;
        return user;
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }
    if (method === 'PUT' && pathname === '/api/admin/governance') {
      requirePermission(actor, 'manage-enterprise', permissions);
      const input = await bodyJson(request);
      const envelope = await store.mutate(actor, 'admin.governance.updated', { type: 'settings', id: 'governance' }, input, draft => {
        draft.settings.governance = normalizeGovernance(input, draft.settings.governance);
        draft.settings.environment = {
          ...(draft.settings.environment || {}),
          name: asString(input.environment?.name ?? draft.settings.environment?.name, 200) || 'local',
          classification: asString(input.environment?.classification ?? draft.settings.environment?.classification, 100) || 'internal',
          owner: asString(input.environment?.owner ?? draft.settings.environment?.owner, 300),
          updatedAt: now(), updatedBy: actor.id
        };
        return { governance: draft.settings.governance, environment: draft.settings.environment };
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }
    return false;
  };
}
