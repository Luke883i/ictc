import path from 'node:path';
import { readFile } from 'node:fs/promises';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const DEFAULT_DIRECTORY = path.join(ROOT, 'access-control.json');
const SAFE_ID = /^[a-z0-9][a-z0-9-]{1,63}$/;

export const permissionsByRole = Object.freeze({
  viewer: Object.freeze(['read']),
  analyst: Object.freeze(['read', 'observe', 'run', 'report']),
  reviewer: Object.freeze(['read', 'observe', 'run', 'report', 'review']),
  owner: Object.freeze(['read', 'observe', 'run', 'report', 'review', 'decide', 'manage-case']),
  admin: Object.freeze(['read', 'observe', 'run', 'report', 'review', 'decide', 'manage-case', 'admin'])
});

export class AccessError extends Error {
  constructor(message, status = 403, code = 'access-denied') {
    super(message);
    this.name = 'AccessError';
    this.status = status;
    this.code = code;
  }
}

const headerValue = (headers, name) => {
  if (!headers) return '';
  if (typeof headers.get === 'function') return String(headers.get(name) || '');
  return String(headers[name] || headers[name.toLowerCase()] || '');
};

function validateDirectory(directory) {
  if (!directory || directory.schemaVersion !== '1.0.0') throw new Error('Directory accessi non valida.');
  if (!Array.isArray(directory.tenants) || !directory.tenants.length) throw new Error('Directory priva di tenant.');
  if (!Array.isArray(directory.principals) || !directory.principals.length) throw new Error('Directory priva di principal.');
  const tenantIds = new Set();
  for (const tenant of directory.tenants) {
    if (!SAFE_ID.test(String(tenant.id || ''))) throw new Error(`Tenant id non valido: ${tenant.id || 'mancante'}.`);
    if (tenantIds.has(tenant.id)) throw new Error(`Tenant duplicato: ${tenant.id}.`);
    tenantIds.add(tenant.id);
    if (!tenant.label || !tenant.organizationType) throw new Error(`Tenant incompleto: ${tenant.id}.`);
  }
  const principalIds = new Set();
  for (const principal of directory.principals) {
    if (!SAFE_ID.test(String(principal.id || ''))) throw new Error(`Principal id non valido: ${principal.id || 'mancante'}.`);
    if (principalIds.has(principal.id)) throw new Error(`Principal duplicato: ${principal.id}.`);
    principalIds.add(principal.id);
    if (!Array.isArray(principal.memberships) || !principal.memberships.length) throw new Error(`Principal senza membership: ${principal.id}.`);
    for (const membership of principal.memberships) {
      if (!tenantIds.has(membership.tenantId)) throw new Error(`Membership verso tenant inesistente: ${membership.tenantId}.`);
      if (!permissionsByRole[membership.role]) throw new Error(`Ruolo non valido: ${membership.role}.`);
    }
  }
  if (!tenantIds.has(directory.defaultTenantId)) throw new Error('Tenant predefinito non valido.');
  if (!principalIds.has(directory.defaultPrincipalId)) throw new Error('Principal predefinito non valido.');
  return directory;
}

export async function loadAccessDirectory(options = {}) {
  const value = options.data || JSON.parse(await readFile(options.filePath || process.env.ICTC_ACCESS_FILE || DEFAULT_DIRECTORY, 'utf8'));
  const directory = validateDirectory(structuredClone(value));
  return Object.freeze({
    ...directory,
    tenants: Object.freeze(directory.tenants.map(item => Object.freeze({ ...item }))),
    principals: Object.freeze(directory.principals.map(item => Object.freeze({
      ...item,
      memberships: Object.freeze(item.memberships.map(value => Object.freeze({ ...value })))
    })))
  });
}

export function tenantById(directory, tenantId) {
  return directory.tenants.find(item => item.id === tenantId) || null;
}

export function principalById(directory, principalId) {
  return directory.principals.find(item => item.id === principalId) || null;
}

export function resolveAccessContext(request, directory, env = process.env) {
  const headers = request?.headers || request;
  const identityMode = String(env.ICTC_IDENTITY_MODE || directory.identityMode || 'local-directory');
  const requestedActor = headerValue(headers, 'x-ictc-actor-id').trim();
  const requestedTenant = headerValue(headers, 'x-ictc-tenant-id').trim();
  if (!['local-directory', 'trusted-header'].includes(identityMode)) {
    throw new AccessError('Modalità identità non supportata.', 503, 'identity-mode-unavailable');
  }
  if (identityMode === 'trusted-header' && !requestedActor) {
    throw new AccessError('Identità richiesta dal trusted identity boundary.', 401, 'identity-required');
  }
  const principalId = requestedActor || directory.defaultPrincipalId;
  const principal = principalById(directory, principalId);
  if (!principal) throw new AccessError('Identità non riconosciuta.', 401, 'identity-unknown');
  const membership = requestedTenant
    ? principal.memberships.find(item => item.tenantId === requestedTenant)
    : principal.memberships.find(item => item.tenantId === directory.defaultTenantId) || principal.memberships[0];
  if (!membership) throw new AccessError('Il principal non appartiene al tenant richiesto.', 403, 'tenant-membership-required');
  const tenant = tenantById(directory, membership.tenantId);
  if (!tenant) throw new AccessError('Tenant non disponibile.', 403, 'tenant-unknown');
  return Object.freeze({
    identityMode,
    tenant: Object.freeze({ ...tenant }),
    actor: Object.freeze({ id: principal.id, label: principal.label }),
    role: membership.role,
    permissions: permissionsByRole[membership.role]
  });
}

export function requirePermission(context, permission) {
  if (!context?.permissions?.includes(permission)) {
    throw new AccessError(`Permesso richiesto: ${permission}.`, 403, 'permission-required');
  }
  return context;
}

export function serviceContext(tenant, actorId = 'scheduler') {
  return Object.freeze({
    identityMode: 'service',
    tenant: Object.freeze({ ...tenant }),
    actor: Object.freeze({ id: actorId, label: actorId === 'scheduler' ? 'Scheduler' : actorId }),
    role: 'system',
    permissions: Object.freeze(['read', 'observe', 'run', 'report', 'review', 'decide', 'manage-case', 'admin'])
  });
}

export function accessView(context, directory) {
  const memberships = principalById(directory, context.actor.id)?.memberships || [];
  const allowedTenantIds = new Set(memberships.map(item => item.tenantId));
  const tenants = directory.tenants
    .filter(item => allowedTenantIds.has(item.id))
    .map(item => ({ ...item, role: memberships.find(value => value.tenantId === item.id)?.role }));
  const result = {
    identityMode: context.identityMode,
    current: {
      tenant: context.tenant,
      actor: context.actor,
      role: context.role,
      permissions: [...context.permissions]
    },
    tenants
  };
  if (context.identityMode === 'local-directory') {
    result.principals = directory.principals.map(principal => ({
      id: principal.id,
      label: principal.label,
      memberships: principal.memberships.map(item => ({
        ...item,
        tenantLabel: tenantById(directory, item.tenantId)?.label || item.tenantId
      }))
    }));
  }
  return result;
}

export const accessContextInternals = Object.freeze({ validateDirectory, headerValue, SAFE_ID });
