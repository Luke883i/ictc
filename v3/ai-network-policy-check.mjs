import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { fetchAiEndpoint, isForbiddenAddress, validateAiEndpoint } from './network-policy.mjs';

const saved = {
  allowPrivate: process.env.ICTC_ALLOW_PRIVATE_AI,
  allowInsecure: process.env.ICTC_ALLOW_INSECURE_AI
};
function restore(name, value) { if (value == null) delete process.env[name]; else process.env[name] = value; }
const headers = value => ({ get: name => name.toLowerCase() === 'location' ? value : null });

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

  const sameOriginCalls = [];
  const sameOrigin = await fetchAiEndpoint('https://provider.example/v1', {
    method: 'POST',
    headers: { authorization: 'Bearer secret', 'content-type': 'application/json' },
    body: '{"x":1}'
  }, {
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    fetchImpl: async (url, init, target) => {
      sameOriginCalls.push({ url, init, target });
      if (sameOriginCalls.length === 1) return { status: 307, headers: headers('/v2') };
      return { status: 200, headers: headers(null) };
    }
  });
  assert.equal(sameOrigin.status, 200);
  assert.equal(sameOriginCalls.length, 2);
  assert.equal(sameOriginCalls[1].init.headers.authorization, 'Bearer secret');
  assert.equal(sameOriginCalls[1].init.body, '{"x":1}');
  assert.equal(sameOriginCalls[0].target.address, '8.8.8.8');

  const crossOriginCalls = [];
  const crossOrigin = await fetchAiEndpoint('https://one.example/v1', { headers: { authorization: 'Bearer secret', cookie: 'sid=1' } }, {
    lookup: async hostname => [{ address: hostname === 'one.example' ? '8.8.8.8' : '1.1.1.1', family: 4 }],
    fetchImpl: async (url, init, target) => {
      crossOriginCalls.push({ url, init, target });
      if (crossOriginCalls.length === 1) return { status: 302, headers: headers('https://two.example/v1') };
      return { status: 200, headers: headers(null) };
    }
  });
  assert.equal(crossOrigin.status, 200);
  assert.equal(crossOriginCalls.length, 2);
  const forwardedHeaders = new Headers(crossOriginCalls[1].init.headers);
  assert.equal(forwardedHeaders.has('authorization'), false);
  assert.equal(forwardedHeaders.has('cookie'), false);
  assert.equal(crossOriginCalls[1].target.address, '1.1.1.1');

  let bodyForwardAttempted = false;
  await assert.rejects(
    fetchAiEndpoint('https://one.example/v1', { method: 'POST', headers: { authorization: 'Bearer secret' }, body: 'sensitive-prompt' }, {
      lookup: async () => [{ address: '8.8.8.8', family: 4 }],
      fetchImpl: async () => {
        if (bodyForwardAttempted) throw new Error('cross-origin body must never be sent');
        bodyForwardAttempted = true;
        return { status: 307, headers: headers('https://two.example/v1') };
      }
    }),
    error => error.code === 'ai-redirect-cross-origin-body'
  );
  assert.equal(bodyForwardAttempted, true);

  let lookupCount = 0;
  let secondRequest = false;
  await assert.rejects(
    fetchAiEndpoint('https://provider.example/v1', {}, {
      lookup: async () => {
        lookupCount += 1;
        return lookupCount === 1
          ? [{ address: '8.8.8.8', family: 4 }]
          : [{ address: '127.0.0.1', family: 4 }];
      },
      fetchImpl: async () => {
        if (secondRequest) throw new Error('private rebound target must not be contacted');
        secondRequest = true;
        return { status: 307, headers: headers('/v2') };
      }
    }),
    error => error.code === 'private-ai-endpoint'
  );
  assert.equal(lookupCount, 2);

  process.env.ICTC_ALLOW_PRIVATE_AI = '1';
  process.env.ICTC_ALLOW_INSECURE_AI = '1';
  const server = createServer((request, response) => {
    assert.match(request.headers.host || '', /^provider\.example:/);
    response.writeHead(200, { 'content-type': 'application/json', 'x-request-id': 'pinned-local' });
    response.end('{"ok":true}');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    const pinned = await fetchAiEndpoint(`http://provider.example:${address.port}/v1`, {}, {
      lookup: async hostname => {
        assert.equal(hostname, 'provider.example');
        return [{ address: '127.0.0.1', family: 4 }];
      }
    });
    assert.equal(pinned.status, 200);
    assert.equal(pinned.headers.get('x-request-id'), 'pinned-local');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  console.log('ai-network-policy-check: ok (pinned DNS, safe redirects)');
} finally {
  restore('ICTC_ALLOW_PRIVATE_AI', saved.allowPrivate);
  restore('ICTC_ALLOW_INSECURE_AI', saved.allowInsecure);
}
