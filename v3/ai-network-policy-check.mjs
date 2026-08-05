import assert from 'node:assert/strict';
import { fetchAiEndpoint, isForbiddenAddress, validateAiEndpoint } from './network-policy.mjs';

const saved = {
  allowPrivate: process.env.ICTC_ALLOW_PRIVATE_AI,
  allowInsecure: process.env.ICTC_ALLOW_INSECURE_AI
};
function restore(name, value) { if (value == null) delete process.env[name]; else process.env[name] = value; }

try {
  delete process.env.ICTC_ALLOW_PRIVATE_AI;
  delete process.env.ICTC_ALLOW_INSECURE_AI;
  assert.equal(isForbiddenAddress('127.0.0.1'), true);
  assert.equal(isForbiddenAddress('169.254.169.254'), true);
  assert.equal(isForbiddenAddress('10.1.2.3'), true);
  assert.equal(isForbiddenAddress('8.8.8.8'), false);
  assert.equal(isForbiddenAddress('::1'), true);
  assert.equal(isForbiddenAddress('fd00::1'), true);
  await assert.rejects(
    validateAiEndpoint('https://provider.example/v1', { lookup: async () => [{ address: '127.0.0.1', family: 4 }] }),
    error => error.code === 'private-ai-endpoint'
  );
  await assert.rejects(
    validateAiEndpoint('http://provider.example/v1', { lookup: async () => [{ address: '8.8.8.8', family: 4 }] }),
    error => error.code === 'insecure-ai-endpoint'
  );
  const calls = [];
  const headers = value => ({ get: name => name.toLowerCase() === 'location' ? value : null });
  const response = await fetchAiEndpoint('https://provider.example/v1', { method: 'POST' }, {
    lookup: async hostname => [{ address: hostname === 'provider.example' ? '8.8.8.8' : '1.1.1.1', family: 4 }],
    fetchImpl: async url => {
      calls.push(url);
      if (calls.length === 1) return { status: 307, headers: headers('https://second.example/v1') };
      return { status: 200, headers: headers(null) };
    }
  });
  assert.equal(response.status, 200);
  assert.deepEqual(calls, ['https://provider.example/v1', 'https://second.example/v1']);
  await assert.rejects(
    fetchAiEndpoint('https://provider.example/v1', {}, {
      lookup: async hostname => [{ address: hostname === 'provider.example' ? '8.8.8.8' : '127.0.0.1', family: 4 }],
      fetchImpl: async () => ({ status: 302, headers: headers('http://localhost/internal') })
    }),
    error => ['insecure-ai-endpoint', 'private-ai-endpoint'].includes(error.code)
  );
  console.log('ai-network-policy-check: ok');
} finally {
  restore('ICTC_ALLOW_PRIVATE_AI', saved.allowPrivate);
  restore('ICTC_ALLOW_INSECURE_AI', saved.allowInsecure);
}
