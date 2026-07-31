import http from 'node:http';
import { buildState, errorResponse, handleApi, handleStatic } from './lib/api.mjs';
import { RUNTIME } from './lib/store.mjs';
import { assertSafeBind, releaseSnapshot } from '../v1/release.mjs';

const HOST = process.env.ICTC_HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || process.env.ICTC_PORT || 4173);
const policy = assertSafeBind({ ...process.env, ICTC_HOST: HOST });
const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'"
};
const sendJson = (res, status, value) => {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(value));
};
const readRaw = async req => {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 8_000_000) throw new Error('Payload oltre limite');
  }
  return raw;
};
const replayRequest = (req, raw) => ({
  method: req.method,
  headers: req.headers,
  async *[Symbol.asyncIterator]() {
    if (raw) yield Buffer.from(raw);
  }
});

async function handleReleaseBoundary(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/health') {
    const release = await releaseSnapshot({ ...process.env, ICTC_HOST: HOST });
    sendJson(res, 200, {
      ok: release.readiness !== 'blocked',
      service: 'ictc',
      version: release.version,
      stabilityClass: release.stabilityClass,
      readiness: release.readiness,
      localSot: true,
      runtime: RUNTIME
    });
    return true;
  }
  if (req.method === 'GET' && url.pathname === '/api/release') {
    sendJson(res, 200, await releaseSnapshot({ ...process.env, ICTC_HOST: HOST }));
    return true;
  }
  if (req.method === 'GET' && url.pathname === '/api/bootstrap') {
    const [state, release] = await Promise.all([
      buildState(),
      releaseSnapshot({ ...process.env, ICTC_HOST: HOST })
    ]);
    state.meta = { ...state.meta, version: release.version, releaseChannel: 'stable', stabilityClass: release.stabilityClass };
    state.release = release;
    sendJson(res, 200, state);
    return true;
  }
  if (req.method === 'GET' && url.pathname === '/api/self/manifest') {
    sendJson(res, 200, {
      writeAuthority: false,
      version: '1.0.0',
      releaseBoundary: 'v1',
      files: ['v1/release.json', 'v1/release.mjs', 'v3/server.mjs', 'v3/lib/store.mjs', 'v3/lib/project.mjs', 'v3/lib/api.mjs', 'v3/public/index.html']
    });
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/api/sources') {
    const raw = await readRaw(req);
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch {}
    if (body.contentBase64 && !policy.binaryUploadEnabled) {
      sendJson(res, 503, {
        error: 'Upload binario disabilitato nel profilo stabile: manca una catena di quarantena e scansione.',
        capability: 'binary-upload',
        state: 'unavailable',
        nextAction: 'Usare un link oppure configurare un ambiente di laboratorio con ICTC_ENABLE_UNSCANNED_UPLOADS=1 assumendone esplicitamente il rischio.',
        doesNotMean: ['Il file non è stato valutato.', 'Il rifiuto non implica che il file sia malevolo.']
      });
      return true;
    }
    return await handleApi(replayRequest(req, raw), res, url) !== false;
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      if (await handleReleaseBoundary(req, res, url)) return;
      if (await handleApi(req, res, url) !== false) return;
      return sendJson(res, 404, { error: 'API non trovata' });
    }
    return await handleStatic(req, res, url);
  } catch (error) {
    return errorResponse(res, error);
  }
});
server.listen(PORT, HOST, () => console.log(`ICTC v1 stable ready on http://${HOST}:${PORT} (${policy.deploymentClass})`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
