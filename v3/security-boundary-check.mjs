import assert from 'node:assert/strict';
import { actorFrom, assertSafeRuntimeBinding } from './runtime/http.mjs';

const permissions = {
  admin: new Set(['read', 'configure-ai']),
  user: new Set(['read'])
};
const previous = { ...process.env };
function resetEnv() {
  for (const key of ['ICTC_IDENTITY_MODE', 'ICTC_ALLOW_NETWORK_BIND', 'ICTC_TRUSTED_PROXY_SECRET']) delete process.env[key];
}
function request(address, headers = {}) { return { socket: { remoteAddress: address }, headers }; }

try {
  resetEnv();
  const local = actorFrom(request('127.0.0.1', { 'x-ictc-role': 'admin', 'x-ictc-actor-id': 'spoofed' }), permissions);
  assert.equal(local.id, 'local-admin');
  assert.equal(local.role, 'admin');
  assert.throws(() => actorFrom(request('203.0.113.5', { 'x-ictc-role': 'admin' }), permissions), error => error.code === 'local-identity-loopback-only');
  assert.doesNotThrow(() => assertSafeRuntimeBinding('127.0.0.1'));
  assert.throws(() => assertSafeRuntimeBinding('0.0.0.0'), error => error.code === 'unsafe-network-bind');

  process.env.ICTC_IDENTITY_MODE = 'trusted-header';
  process.env.ICTC_ALLOW_NETWORK_BIND = '1';
  process.env.ICTC_TRUSTED_PROXY_SECRET = '0123456789abcdef0123456789abcdef';
  assert.doesNotThrow(() => assertSafeRuntimeBinding('0.0.0.0'));
  assert.throws(() => actorFrom(request('10.0.0.2', {
    'x-ictc-role': 'admin', 'x-ictc-actor-id': 'alice'
  }), permissions), error => error.code === 'trusted-proxy-required');
  const trusted = actorFrom(request('10.0.0.2', {
    'x-ictc-role': 'admin',
    'x-ictc-actor-id': 'alice',
    'x-ictc-proxy-secret': process.env.ICTC_TRUSTED_PROXY_SECRET
  }), permissions);
  assert.deepEqual({ id: trusted.id, role: trusted.role, identityMode: trusted.identityMode }, {
    id: 'alice', role: 'admin', identityMode: 'trusted-header'
  });
  console.log('security-boundary-check: ok');
} finally {
  process.env = previous;
}
