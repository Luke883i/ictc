import { lookup as dnsLookup } from 'node:dns/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import net from 'node:net';
import { asString } from './domain.mjs';

const DEFAULT_MAX_RESPONSE_BYTES = 2_000_000;

function forbiddenIpv4(address) {
  const octets = address.split('.').map(Number);
  const [a, b, c] = octets;
  return a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224;
}

function forbiddenIpv6(address) {
  const normalized = address.toLowerCase().split('%')[0];
  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('::ffff:')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (/^fe[89ab]/.test(normalized)) return true;
  if (normalized.startsWith('ff')) return true;
  const first = Number.parseInt(normalized.split(':')[0] || '0', 16);
  if (!Number.isFinite(first) || first < 0x2000 || first > 0x3fff) return true;
  if (/^2001:(?:0|0000):/i.test(normalized)) return true;
  if (/^2001:(?:2|0002):/i.test(normalized)) return true;
  if (/^2001:(?:20|0020):/i.test(normalized)) return true;
  if (/^2001:db8:/i.test(normalized)) return true;
  if (/^2002:/i.test(normalized)) return true;
  if (/^3fff:/i.test(normalized)) return true;
  return false;
}

export function isForbiddenAddress(address) {
  const version = net.isIP(address);
  if (version === 4) return forbiddenIpv4(address);
  if (version === 6) return forbiddenIpv6(address);
  return true;
}

export function aiNetworkOptIns(env=process.env){
  return Object.freeze({allowPrivate:env.ICTC_ALLOW_PRIVATE_AI==='1',allowInsecure:env.ICTC_ALLOW_INSECURE_AI==='1'});
}

async function resolveAiEndpoint(endpoint, options = {}) {
  const url = new URL(asString(endpoint, 4_000));
  if (!['https:', 'http:'].includes(url.protocol)) throw Object.assign(new Error('Protocollo endpoint AI non consentito'), { status: 400, code: 'ai-endpoint-protocol' });
  if (url.username || url.password) throw Object.assign(new Error('Credenziali nell’URL endpoint AI non consentite'), { status: 400, code: 'ai-endpoint-credentials' });
  const optIns=aiNetworkOptIns(process.env);
  if (url.protocol !== 'https:' && !optIns.allowInsecure) {
    throw Object.assign(new Error('Endpoint AI non cifrato non consentito senza opt-in esplicito'), { status: 400, code: 'insecure-ai-endpoint' });
  }
  const lookup = options.lookup || dnsLookup;
  const records = await lookup(url.hostname, { all: true, verbatim: true });
  if (!records.length) throw Object.assign(new Error('Endpoint AI senza indirizzi risolti'), { status: 400, code: 'ai-endpoint-unresolved' });
  const forbidden = records.filter(record => isForbiddenAddress(record.address));
  if (forbidden.length && !optIns.allowPrivate) {
    throw Object.assign(new Error('Endpoint AI risolto verso rete privata o riservata'), {
      status: 400,
      code: 'private-ai-endpoint',
      details: { addresses: forbidden.map(record => record.address) }
    });
  }
  return { url, records };
}

export async function validateAiEndpoint(endpoint, options = {}) {
  return (await resolveAiEndpoint(endpoint, options)).url;
}

function pinnedLookup(target) {
  return (_hostname, options, callback) => {
    if (options?.all) return callback(null, [{ address: target.address, family: target.family }]);
    return callback(null, target.address, target.family);
  };
}

function responseHeaders(raw = {}) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(raw)) {
    if (Array.isArray(value)) for (const item of value) headers.append(name, String(item));
    else if (value != null) headers.set(name, String(value));
  }
  return headers;
}

async function pinnedFetch(urlValue, init = {}, target, transport = {}) {
  const url = new URL(urlValue);
  const requestImpl = url.protocol === 'https:' ? httpsRequest : httpRequest;
  const maxResponseBytes = Math.max(1_024, Math.min(20_000_000, Number(transport.maxResponseBytes) || DEFAULT_MAX_RESPONSE_BYTES));
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = error => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    const request = requestImpl(url, {
      method: init.method || 'GET',
      headers: init.headers,
      signal: init.signal,
      lookup: pinnedLookup(target)
    }, response => {
      const declared = Number(response.headers['content-length']);
      if (Number.isFinite(declared) && declared > maxResponseBytes) {
        const error = Object.assign(new Error('Risposta del provider AI troppo grande'), { status: 502, code: 'ai-response-too-large', details: { maxResponseBytes, declaredBytes: declared } });
        response.destroy(error);
        fail(error);
        return;
      }
      const chunks = [];
      let received = 0;
      response.on('data', chunk => {
        if (settled) return;
        const buffer = Buffer.from(chunk);
        received += buffer.length;
        if (received > maxResponseBytes) {
          const error = Object.assign(new Error('Risposta del provider AI troppo grande'), { status: 502, code: 'ai-response-too-large', details: { maxResponseBytes, receivedBytes: received } });
          response.destroy(error);
          fail(error);
          return;
        }
        chunks.push(buffer);
      });
      response.on('error', fail);
      response.on('end', () => {
        if (settled) return;
        settled = true;
        const status = Number(response.statusCode || 502);
        resolve(new Response(Buffer.concat(chunks), {
          status,
          statusText: response.statusMessage || '',
          headers: responseHeaders(response.headers)
        }));
      });
    });
    request.on('error', fail);
    if (init.body != null) {
      if (typeof init.body === 'string' || Buffer.isBuffer(init.body) || init.body instanceof Uint8Array) request.write(init.body);
      else {
        request.destroy();
        fail(Object.assign(new Error('Body richiesta AI non supportato dal transport pinning'), { status: 500, code: 'ai-request-body-unsupported' }));
        return;
      }
    }
    request.end();
  });
}

function sanitizedCrossOriginInit(init = {}) {
  const headers = new Headers(init.headers || {});
  for (const name of ['authorization', 'proxy-authorization', 'cookie']) headers.delete(name);
  return { ...init, headers };
}

function hasReplayableBody(init = {}) {
  const method = String(init.method || 'GET').toUpperCase();
  return init.body != null && !['GET', 'HEAD'].includes(method);
}

export async function fetchAiEndpoint(endpoint, init = {}, options = {}) {
  const fetchImpl = options.fetchImpl || pinnedFetch;
  const maxResponseBytes = Math.max(1_024, Math.min(20_000_000, Number(options.maxResponseBytes || process.env.ICTC_AI_MAX_RESPONSE_BYTES) || DEFAULT_MAX_RESPONSE_BYTES));
  let current = asString(endpoint, 4_000);
  let currentInit = { ...init };
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const resolved = await resolveAiEndpoint(current, options);
    const target = resolved.records[0];
    const response = await fetchImpl(resolved.url.toString(), { ...currentInit, redirect: 'manual' }, target, { maxResponseBytes });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get('location');
    if (!location) throw Object.assign(new Error('Redirect AI senza destinazione'), { status: 502, code: 'ai-redirect-invalid' });
    if (redirect === 3) throw Object.assign(new Error('Troppi redirect dal provider AI'), { status: 502, code: 'ai-redirect-limit' });
    const next = new URL(location, resolved.url);
    if (next.origin !== resolved.url.origin) {
      if (hasReplayableBody(currentInit)) {
        throw Object.assign(new Error('Redirect AI cross-origin con body non consentito'), { status: 502, code: 'ai-redirect-cross-origin-body' });
      }
      currentInit = sanitizedCrossOriginInit(currentInit);
    }
    current = next.toString();
  }
  throw Object.assign(new Error('Redirect AI non valido'), { status: 502, code: 'ai-redirect-invalid' });
}
