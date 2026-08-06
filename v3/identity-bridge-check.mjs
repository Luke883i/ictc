import assert from 'node:assert/strict';
import {
  DEFAULT_IDENTITY_SETTINGS, assertIdentityConfiguration, claimsFromHeaders,
  evaluateIdentityClaims, identityRoleCoverage, identityRuntimeProjection,
  normalizeIdentitySettings, parseGroups, resolveIdentityClaims
} from './runtime/identity.mjs';

const permissions = {
  admin: new Set(['read', 'manage-users']),
  user: new Set(['read']),
  auditor: new Set(['read', 'export-evidence'])
};
const config = assertIdentityConfiguration({
  strategy: 'shibboleth',
  providerLabel: 'Shibboleth SP',
  headers: {
    subject: 'x-shib-eppn', displayName: 'x-shib-display-name',
    email: 'x-shib-mail', groups: 'x-shib-groups'
  },
  groupDelimiter: ';',
  defaultRole: null,
  groupRules: [
    { group: 'cn=ictc-admins,ou=groups,dc=example,dc=org', role: 'admin' },
    { group: 'cn=ictc-auditors,ou=groups,dc=example,dc=org', role: 'auditor' },
    { group: 'cn=ictc-users,ou=groups,dc=example,dc=org', role: 'user' }
  ],
  userRules: [
    { user: 'breakglass@example.org', effect: 'allow', role: 'admin' },
    { user: 'former.user@example.org', effect: 'deny' }
  ]
});

assert.deepEqual(parseGroups('A; B ;A', ';'), ['A', 'B']);
assert.deepEqual(claimsFromHeaders({
  'x-shib-eppn': 'alice@example.org',
  'x-shib-display-name': 'Alice Example',
  'x-shib-mail': 'alice@example.org',
  'x-shib-groups': 'cn=ictc-users,ou=groups,dc=example,dc=org;cn=ictc-admins,ou=groups,dc=example,dc=org'
}, config), {
  subject: 'alice@example.org', displayName: 'Alice Example', email: 'alice@example.org',
  groups: ['cn=ictc-users,ou=groups,dc=example,dc=org', 'cn=ictc-admins,ou=groups,dc=example,dc=org']
});

const ordered = evaluateIdentityClaims({
  subject: 'alice@example.org', groups: [
    'cn=ictc-users,ou=groups,dc=example,dc=org',
    'cn=ictc-admins,ou=groups,dc=example,dc=org'
  ]
}, config);
assert.equal(ordered.allowed, true);
assert.equal(ordered.role, 'admin');
assert.equal(ordered.matchedBy.type, 'group');

const override = evaluateIdentityClaims({
  subject: 'breakglass@example.org', groups: ['cn=ictc-users,ou=groups,dc=example,dc=org']
}, config);
assert.equal(override.role, 'admin');
assert.equal(override.matchedBy.type, 'user');

const denied = evaluateIdentityClaims({
  subject: 'FORMER.USER@example.org', groups: ['cn=ictc-admins,ou=groups,dc=example,dc=org']
}, config);
assert.equal(denied.allowed, false);
assert.equal(denied.code, 'identity-denied');

const unmapped = evaluateIdentityClaims({ subject: 'nobody@example.org', groups: [] }, config);
assert.equal(unmapped.allowed, false);
assert.equal(unmapped.code, 'identity-unmapped');

const defaultUser = evaluateIdentityClaims({ subject: 'nobody@example.org', groups: [] }, { ...config, defaultRole: 'user' });
assert.equal(defaultUser.role, 'user');
assert.equal(defaultUser.matchedBy.type, 'default');

const actor = resolveIdentityClaims({
  subject: 'auditor@example.org', displayName: 'Auditor', groups: ['CN=ICTC-AUDITORS,OU=GROUPS,DC=EXAMPLE,DC=ORG']
}, config, permissions);
assert.equal(actor.role, 'auditor');
assert.ok(actor.permissions.includes('export-evidence'));
assert.equal(actor.identityStrategy, 'shibboleth');

assert.throws(() => assertIdentityConfiguration({ strategy: 'shibboleth', groupRules: [], userRules: [] }), error => error.code === 'identity-admin-path-required');
assert.throws(() => normalizeIdentitySettings({ headers: { subject: 'x-ictc-proxy-secret' } }), error => error.code === 'identity-header-invalid');
assert.deepEqual([...identityRoleCoverage(config)].sort(), ['admin', 'auditor', 'user']);

const runtime = identityRuntimeProjection(config, {
  ICTC_IDENTITY_MODE: 'trusted-header',
  ICTC_TRUSTED_PROXY_SECRET: '0123456789abcdef0123456789abcdef',
  ICTC_ALLOW_NETWORK_BIND: '1'
});
assert.equal(runtime.activeStrategy, 'shibboleth');
assert.equal(runtime.proxySecretConfigured, true);
assert.equal(runtime.adminPath, true);
assert.equal(runtime.auditorPath, true);
assert.equal(DEFAULT_IDENTITY_SETTINGS.strategy, 'legacy-role-header');
console.log('identity-bridge-check: ok (ordered groups, user overrides, deny-by-default, deployment boundary)');
