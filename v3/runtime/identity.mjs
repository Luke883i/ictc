import { ROLES, asString, uniqueStrings } from '../domain.mjs';

const STRATEGIES = new Set(['legacy-role-header', 'shibboleth']);
const DELIMITERS = new Set([';', '|', ',', ' ']);
const DEFAULT_HEADERS = Object.freeze({
  subject: 'x-ictc-subject',
  displayName: 'x-ictc-display-name',
  email: 'x-ictc-email',
  groups: 'x-ictc-groups'
});
const RESERVED_HEADERS = new Set(['x-ictc-proxy-secret', 'authorization', 'cookie', 'set-cookie']);

export const DEFAULT_IDENTITY_SETTINGS = Object.freeze({
  schemaVersion: '1.0',
  strategy: 'legacy-role-header',
  providerLabel: 'Trusted proxy',
  headers: DEFAULT_HEADERS,
  groupDelimiter: ';',
  defaultRole: null,
  groupRules: [],
  userRules: []
});

function identityError(status, message, code, details = null) {
  return Object.assign(new Error(message), { status, code, details });
}

function headerName(value, fallback) {
  const name = asString(value || fallback, 80).toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(name) || RESERVED_HEADERS.has(name)) {
    throw identityError(400, `Header identità non valido: ${name || '(vuoto)'}`, 'identity-header-invalid');
  }
  return name;
}

function normalizeGroupRules(value, current = []) {
  const input = Array.isArray(value) ? value : current;
  const seen = new Set();
  const result = [];
  for (const raw of input || []) {
    const group = asString(raw?.group, 500);
    const role = asString(raw?.role, 20).toLowerCase();
    const key = group.toLocaleLowerCase('en-US');
    if (!group || !ROLES.includes(role) || seen.has(key)) continue;
    seen.add(key);
    result.push({ group, role });
    if (result.length >= 200) break;
  }
  return result;
}

function normalizeUserRules(value, current = []) {
  const input = Array.isArray(value) ? value : current;
  const seen = new Set();
  const result = [];
  for (const raw of input || []) {
    const user = asString(raw?.user, 240);
    const effect = raw?.effect === 'deny' || asString(raw?.role, 20).toLowerCase() === 'deny' ? 'deny' : 'allow';
    const role = effect === 'allow' ? asString(raw?.role, 20).toLowerCase() : null;
    const key = user.toLocaleLowerCase('en-US');
    if (!user || (effect === 'allow' && !ROLES.includes(role)) || seen.has(key)) continue;
    seen.add(key);
    result.push(effect === 'deny' ? { user, effect: 'deny' } : { user, effect: 'allow', role });
    if (result.length >= 200) break;
  }
  return result;
}

export function normalizeIdentitySettings(input = {}, current = DEFAULT_IDENTITY_SETTINGS) {
  const prior = { ...DEFAULT_IDENTITY_SETTINGS, ...(current || {}) };
  const strategy = STRATEGIES.has(input.strategy) ? input.strategy : prior.strategy;
  const delimiter = DELIMITERS.has(input.groupDelimiter) ? input.groupDelimiter : prior.groupDelimiter;
  const requestedDefaultRole = input.defaultRole ?? prior.defaultRole;
  const defaultRole = requestedDefaultRole === 'user' ? 'user' : null;
  return {
    schemaVersion: '1.0',
    strategy,
    providerLabel: asString(input.providerLabel ?? prior.providerLabel, 200) || 'Shibboleth',
    headers: {
      subject: headerName(input.headers?.subject, prior.headers?.subject || DEFAULT_HEADERS.subject),
      displayName: headerName(input.headers?.displayName, prior.headers?.displayName || DEFAULT_HEADERS.displayName),
      email: headerName(input.headers?.email, prior.headers?.email || DEFAULT_HEADERS.email),
      groups: headerName(input.headers?.groups, prior.headers?.groups || DEFAULT_HEADERS.groups)
    },
    groupDelimiter: delimiter,
    defaultRole,
    groupRules: normalizeGroupRules(input.groupRules, prior.groupRules),
    userRules: normalizeUserRules(input.userRules, prior.userRules)
  };
}

export function identityRoleCoverage(settings) {
  const config = normalizeIdentitySettings(settings);
  const roles = new Set(config.groupRules.map(rule => rule.role));
  for (const rule of config.userRules) if (rule.effect === 'allow') roles.add(rule.role);
  if (config.defaultRole) roles.add(config.defaultRole);
  return roles;
}

export function assertIdentityConfiguration(settings) {
  const config = normalizeIdentitySettings(settings);
  if (config.strategy === 'shibboleth' && !identityRoleCoverage(config).has('admin')) {
    throw identityError(400, 'La policy Shibboleth deve conservare almeno un percorso amministratore', 'identity-admin-path-required');
  }
  return config;
}

function headerValue(headers, name) {
  const value = headers?.[name];
  return Array.isArray(value) ? value.join(';') : asString(value, 20_000);
}

export function parseGroups(value, delimiter = ';') {
  const raw = Array.isArray(value) ? value.join(delimiter) : asString(value, 20_000);
  if (!raw) return [];
  return uniqueStrings(raw.split(delimiter).map(item => item.trim()), 200, 500);
}

export function claimsFromHeaders(headers, settings) {
  const config = normalizeIdentitySettings(settings);
  return {
    subject: headerValue(headers, config.headers.subject),
    displayName: headerValue(headers, config.headers.displayName),
    email: headerValue(headers, config.headers.email),
    groups: parseGroups(headers?.[config.headers.groups], config.groupDelimiter)
  };
}

export function evaluateIdentityClaims(claims = {}, settings) {
  const config = normalizeIdentitySettings(settings);
  const subject = asString(claims.subject, 240);
  const displayName = asString(claims.displayName, 300) || subject;
  const email = asString(claims.email, 320);
  const groups = uniqueStrings(claims.groups, 200, 500);
  if (!subject) return { allowed: false, code: 'identity-required', reason: 'Identificativo Shibboleth assente', subject, displayName, email, groups };

  const subjectKey = subject.toLocaleLowerCase('en-US');
  const userRule = config.userRules.find(rule => rule.user.toLocaleLowerCase('en-US') === subjectKey);
  if (userRule?.effect === 'deny') {
    return { allowed: false, code: 'identity-denied', reason: 'Utente negato da una regola esplicita', subject, displayName, email, groups, matchedBy: { type: 'user-deny', value: userRule.user } };
  }
  if (userRule?.effect === 'allow') {
    return { allowed: true, role: userRule.role, subject, displayName, email, groups, matchedBy: { type: 'user', value: userRule.user } };
  }

  const groupKeys = new Set(groups.map(group => group.toLocaleLowerCase('en-US')));
  const groupRule = config.groupRules.find(rule => groupKeys.has(rule.group.toLocaleLowerCase('en-US')));
  if (groupRule) {
    return { allowed: true, role: groupRule.role, subject, displayName, email, groups, matchedBy: { type: 'group', value: groupRule.group } };
  }
  if (config.defaultRole === 'user') {
    return { allowed: true, role: 'user', subject, displayName, email, groups, matchedBy: { type: 'default', value: 'user' } };
  }
  return { allowed: false, code: 'identity-unmapped', reason: 'Nessuna regola utente o gruppo autorizza l’identità', subject, displayName, email, groups };
}

export function resolveIdentityClaims(claims, settings, permissions) {
  const result = evaluateIdentityClaims(claims, settings);
  if (!result.allowed) {
    const status = result.code === 'identity-required' ? 401 : 403;
    throw identityError(status, result.reason, result.code, { subject: result.subject || null });
  }
  return {
    id: result.subject,
    role: result.role,
    identityMode: 'trusted-header',
    identityStrategy: 'shibboleth',
    identityProvider: normalizeIdentitySettings(settings).providerLabel,
    displayName: result.displayName,
    email: result.email,
    groups: result.groups,
    matchedBy: result.matchedBy,
    permissions: [...(permissions[result.role] || [])]
  };
}

export function identityRuntimeProjection(settings, env = process.env) {
  const config = normalizeIdentitySettings(settings);
  const trustedHeader = env.ICTC_IDENTITY_MODE === 'trusted-header';
  return {
    configuredStrategy: config.strategy,
    activeStrategy: trustedHeader ? config.strategy : 'local',
    trustedHeader,
    proxySecretConfigured: asString(env.ICTC_TRUSTED_PROXY_SECRET, 1_000).length >= 32,
    networkBindAllowed: env.ICTC_ALLOW_NETWORK_BIND === '1',
    adminPath: identityRoleCoverage(config).has('admin'),
    auditorPath: identityRoleCoverage(config).has('auditor'),
    groupRuleCount: config.groupRules.length,
    userRuleCount: config.userRules.length,
    limitations: [
      'ICTC non esegue bind LDAP e non riceve password directory.',
      'Autenticazione e lettura attributi restano responsabilità di Shibboleth e del proxy attendibile.',
      'Il proxy secret e il binding di rete restano configurazioni di deployment, non campi UI.'
    ]
  };
}
