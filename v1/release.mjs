import crypto from 'node:crypto';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
export const RELEASE_PATH = path.join(ROOT, 'v1', 'release.json');
const LOOPBACKS = new Set(['127.0.0.1', 'localhost', '::1']);
export const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
export async function readReleaseManifest() { return JSON.parse(await readFile(RELEASE_PATH, 'utf8')); }

export function deploymentPolicy(env = process.env) {
  const host = String(env.ICTC_HOST || env.HOST || '127.0.0.1').trim();
  const loopback = LOOPBACKS.has(host);
  const codespace = String(env.CODESPACES || '').toLowerCase() === 'true';
  const identityMode = String(env.ICTC_IDENTITY_MODE || 'local-directory');
  const trustedIdentityBoundary = identityMode === 'trusted-header' && env.ICTC_TRUSTED_IDENTITY_BOUNDARY === '1';
  const explicitNetworkOverride = env.ICTC_ALLOW_UNAUTHENTICATED_BIND === '1';
  const binaryUploadEnabled = env.ICTC_ENABLE_UNSCANNED_UPLOADS === '1';
  const networkAllowed = loopback || codespace || trustedIdentityBoundary || explicitNetworkOverride;
  return {
    host, loopback, codespace, identityMode, trustedIdentityBoundary, explicitNetworkOverride,
    networkAllowed, binaryUploadEnabled,
    deploymentClass: loopback ? 'local-loopback' : codespace ? 'private-codespace' : trustedIdentityBoundary ? 'trusted-identity-boundary' : explicitNetworkOverride ? 'explicit-unsafe-network-override' : 'blocked-network-bind'
  };
}

export function assertSafeBind(env = process.env) {
  const policy = deploymentPolicy(env);
  if (!policy.networkAllowed) throw new Error(`ICTC rifiuta il bind su ${policy.host} senza un identity boundary attendibile. Usa loopback, un Codespace privato oppure ICTC_IDENTITY_MODE=trusted-header con ICTC_TRUSTED_IDENTITY_BOUNDARY=1.`);
  if (policy.identityMode === 'trusted-header' && !policy.trustedIdentityBoundary && !policy.loopback && !policy.codespace) throw new Error('La modalità trusted-header richiede ICTC_TRUSTED_IDENTITY_BOUNDARY=1 fuori da loopback.');
  return policy;
}

export async function releaseSnapshot(env = process.env) {
  const manifest = await readReleaseManifest();
  const policy = deploymentPolicy(env);
  const warnings = [];
  const blockers = [];
  if (!policy.networkAllowed) blockers.push('Bind non-loopback privo di identity boundary attendibile.');
  if (policy.identityMode === 'trusted-header' && !policy.trustedIdentityBoundary) blockers.push('Trusted header dichiarato senza conferma del boundary amministrato.');
  if (policy.binaryUploadEnabled) warnings.push('Upload binari non scansionati abilitati tramite override.');
  if (policy.explicitNetworkOverride && !policy.codespace && !policy.trustedIdentityBoundary) warnings.push('Esposizione di rete autorizzata senza autenticazione: fuori dallo scope di readiness.');
  const readiness = blockers.length ? 'blocked' : warnings.length ? 'bounded' : 'ready';
  return {
    product: manifest.product,
    version: manifest.productVersion,
    releaseName: manifest.releaseName,
    attestationType: manifest.attestationType,
    stabilityClass: manifest.stabilityClass,
    readiness,
    manifestSha256: sha256(JSON.stringify(manifest)),
    stableScope: manifest.stableScope,
    excludedScope: manifest.excludedScope,
    guardrails: {
      deployment: policy,
      identity: policy.identityMode,
      trustedIdentityBoundary: policy.trustedIdentityBoundary,
      tenantIsolation: 'per-tenant-ledger-and-blob-root',
      binaryUpload: policy.binaryUploadEnabled ? 'override-enabled-unscanned' : 'disabled-by-default',
      assistantWriteAuthority: false
    },
    blockers, warnings, claim: manifest.claim
  };
}
