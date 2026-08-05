import { lookup as dnsLookup } from 'node:dns/promises';
import net from 'node:net';
import { asString } from './domain.mjs';

function forbiddenIpv4(address) {
  const octets = address.split('.').map(Number);
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || b === 168)) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224;
}

function forbiddenIpv6(address) {
  const normalized = address.toLowerCase().split('%')[0];
  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (/^fe[89ab]/.test(normalized)) return true;
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? forbiddenIpv4(mapped[1]) : false;
}

export function isForbiddenAddress(address) {
  const version = net.isIP(address);
  if (version === 4) return forbiddenIpv4(address);
  if (version === 6) return forbiddenIpv6(address);
  return true;
}

export async function validateAiEndpoint(endpoint, options = {}) {
  const url = new URL(asString(endpoint, 4_000));
  if (!['https:', 'http:'].includes(url.protocol)) throw Object.assign(new Error('Protocollo endpoint AI non consentito'), { status: 400, code: 'ai-endpoint-protocol' });
  if (url.username || url.password) throw Object.assign(new Error('Credenziali nell’URL endpoint AI non consentite'), { status: 400, code: 'ai-endpoint-credentials' });
  if (url.protocol !== 'https:' && process.env.ICTC_ALLOW_INSECURE_AI !== '1') {
    throw Object.assign(new Error('Endpoint AI non cifrato non consentito senza ICTC_ALLOW_INSECURE_AI=1'), { status: 400, code: 'insecure-ai-endpoint' });
  }
  const lookup = options.lookup || dnsLookup;
  const records = await lookup(url.hostname, { all: true, verbatim: true });
  if (!records.length) throw Object.assign(new Error('Endpoint AI senza indirizzi risolti'), { status: 400, code: 'ai-endpoint-unresolved' });
  const forbidden = records.filter(record => isForbiddenAddress(record.address));
  if (forbidden.length && process.env.ICTC_ALLOW_PRIVATE_AI !== '1') {
    throw Object.assign(new Error('Endpoint AI risolto verso rete privata o riservata'), {
      status: 400,
      code: 'private-ai-endpoint',
      details: { addresses: forbidden.map(record => record.address) }
    });
  }
  return url;
}

export async function fetchAiEndpoint(endpoint, init, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  let current = endpoint;
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    await validateAiEndpoint(current, options);
    const response = await fetchImpl(current, { ...init, redirect: 'manual' });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get('location');
    if (!location) throw Object.assign(new Error('Redirect AI senza destinazione'), { status: 502, code: 'ai-redirect-invalid' });
    if (redirect === 3) throw Object.assign(new Error('Troppi redirect dal provider AI'), { status: 502, code: 'ai-redirect-limit' });
    current = new URL(location, current).toString();
  }
  throw Object.assign(new Error('Redirect AI non valido'), { status: 502, code: 'ai-redirect-invalid' });
}
