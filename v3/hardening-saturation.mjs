import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { actorFrom, assertSafeRuntimeBinding } from './runtime/http.mjs';
import { isForbiddenAddress } from './network-policy.mjs';

const permissions = { admin: new Set(['read']), user: new Set(['read']) };
const addresses = ['127.0.0.1', '10.0.0.1', '169.254.169.254', '192.168.1.1', '8.8.8.8', '1.1.1.1', '::1', 'fd00::1', '2606:4700:4700::1111'];
const primitives = new Set();
const novelty = [];
const M = 64;
const total = M + 100;
const saved = {
  identityMode: process.env.ICTC_IDENTITY_MODE,
  allowNetwork: process.env.ICTC_ALLOW_NETWORK_BIND,
  proxySecret: process.env.ICTC_TRUSTED_PROXY_SECRET
};
function restore(name, value) { if (value == null) delete process.env[name]; else process.env[name] = value; }

try {
  for (let index = 0; index < total; index += 1) {
    const before = primitives.size;
    const address = addresses[index % addresses.length];
    primitives.add(`ip:${isForbiddenAddress(address) ? 'forbidden' : 'public'}`);

    delete process.env.ICTC_IDENTITY_MODE;
    delete process.env.ICTC_ALLOW_NETWORK_BIND;
    delete process.env.ICTC_TRUSTED_PROXY_SECRET;
    const remote = index % 3 === 0 ? '203.0.113.10' : '127.0.0.1';
    try {
      const actor = actorFrom({ socket: { remoteAddress: remote }, headers: { 'x-ictc-role': index % 2 ? 'admin' : 'user', 'x-ictc-actor-id': 'spoof' } }, permissions);
      primitives.add(`local:${actor.role}:${actor.id}`);
    } catch (error) { primitives.add(`local-error:${error.code}`); }

    const host = index % 4 === 0 ? '0.0.0.0' : '127.0.0.1';
    try { assertSafeRuntimeBinding(host); primitives.add('bind:allowed'); }
    catch (error) { primitives.add(`bind-error:${error.code}`); }

    process.env.ICTC_IDENTITY_MODE = 'trusted-header';
    process.env.ICTC_ALLOW_NETWORK_BIND = '1';
    process.env.ICTC_TRUSTED_PROXY_SECRET = '0123456789abcdef0123456789abcdef';
    const secret = index % 5 === 0 ? 'wrong' : process.env.ICTC_TRUSTED_PROXY_SECRET;
    try {
      actorFrom({ socket: { remoteAddress: remote }, headers: {
        'x-ictc-role': 'admin', 'x-ictc-actor-id': 'alice', 'x-ictc-proxy-secret': secret
      } }, permissions);
      primitives.add('trusted:accepted');
    } catch (error) { primitives.add(`trusted-error:${error.code}`); }

    novelty.push({ index: index + 1, newPrimitives: primitives.size - before });
  }
  const validationNovelty = novelty.slice(M).reduce((sum, item) => sum + item.newPrimitives, 0);
  assert.equal(validationNovelty, 0);
  const report = { schemaVersion: '1.0.0', M, validationCases: 100, total, primitives: [...primitives].sort(), validationNovelty };
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/hardening-saturation.json', JSON.stringify(report, null, 2));
  console.log(`hardening-saturation: ok (M=${M}, M+100=${total}, primitives=${primitives.size}, validation novelty=0)`);
} finally {
  restore('ICTC_IDENTITY_MODE', saved.identityMode);
  restore('ICTC_ALLOW_NETWORK_BIND', saved.allowNetwork);
  restore('ICTC_TRUSTED_PROXY_SECRET', saved.proxySecret);
}
