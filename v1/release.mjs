import crypto from 'node:crypto';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
export const RELEASE_PATH = path.join(ROOT, 'v1', 'release.json');
const LOOPBACKS = new Set(['127.0.0.1', 'localhost', '::1']);

export const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

export async function readReleaseManifest() {
  return JSON.parse(await readFile(RELEASE_PATH, 'utf8'));
}

export function deploymentPolicy(env = process.env) {
  const host = String(env.ICTC_HOST || env.HOST || '127.0.0.1').trim();
  const loopback = LOOPBACKS.has(host);
  const codespace = String(env.CODESPACES || '').toLowerCase() === 'true';
  const explicitNetworkOverride = env.ICTC_ALLOW_UNAUTHENTICATED_BIND === '1';
  const binaryUploadEnabled = env.ICTC_ENABLE_UNSCANNED_UPLOADS === '1';
  const networkAllowed = loopback || codespace || explicitNetworkOverride;
  return {
    host,
    loopback,
    codespace,
    explicitNetworkOverride,
    networkAllowed,
    binaryUploadEnabled,
    deploymentClass: loopback ? 'local-loopback' : codespace ? 'private-codespace' : explicitNetworkOverride ? 'explicit-unsafe-network-override' : 'blocked-network-bind'
  };
}

export function assertSafeBind(env = process.env) {
  const policy = deploymentPolicy(env);
  if (!policy.networkAllowed) {
    throw new Error(`ICTC v1 rifiuta il bind non autenticato su ${policy.host}. Usa loopback, un Codespace con porta privata o ICTC_ALLOW_UNAUTHENTICATED_BIND=1 assumendone esplicitamente il rischio.`);
  }
  return policy;
}

export async function releaseSnapshot(env = process.env) {
  const manifest = await readReleaseManifest();
  const canonical = JSON.stringify(manifest);
  const policy = deploymentPolicy(env);
  const warnings = [];
  const blockers = [];
  if (!policy.networkAllowed) blockers.push('Bind non-loopback privo di autenticazione e senza override esplicito.');
  if (policy.binaryUploadEnabled) warnings.push('Upload binari non scansionati abilitati tramite override; fuori dallo scope stabile.');
  if (policy.explicitNetworkOverride && !policy.codespace) warnings.push('Esposizione di rete non autenticata autorizzata esplicitamente; fuori dallo scope stabile.');
  const readiness = blockers.length ? 'blocked' : warnings.length ? 'bounded' : 'ready';
  return {
    product: manifest.product,
    version: manifest.productVersion,
    releaseName: manifest.releaseName,
    attestationType: manifest.attestationType,
    stabilityClass: manifest.stabilityClass,
    readiness,
    manifestSha256: sha256(canonical),
    stableScope: manifest.stableScope,
    excludedScope: manifest.excludedScope,
    guardrails: {
      deployment: policy,
      binaryUpload: policy.binaryUploadEnabled ? 'override-enabled-unscanned' : 'disabled-by-default',
      assistantWriteAuthority: false
    },
    blockers,
    warnings,
    claim: manifest.claim
  };
}
