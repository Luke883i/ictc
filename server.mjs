import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import {
  buildState,
  appendEvent,
  readLedger,
  verifyLedger,
  proposeSourceMetadata,
  createMatter,
  buildCapsule,
  answerFromCapsule,
  selfDocumentationManifest,
  nowIso,
  sha256
} from './lib/domain.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(ROOT, 'app');
const RUNTIME = path.resolve(process.env.ICTC_RUNTIME_DIR || path.join(ROOT, 'runtime'));
const BLOB_DIR = path.join(RUNTIME, 'blobs');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.ICTC_HOST || '127.0.0.1';
const JSON_LIMIT = 14_000_000;
const BLOB_LIMIT = 10_000_000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error(`PORT non valida: ${process.env.PORT}`);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

function responseHeaders(contentType) {
  return {
    'content-type': contentType,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-resource-policy': 'same-origin',
    'content-security-policy': "default-src 'self'; base-uri 'none'; form-action 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'"
  };
}

function send(response, status, body, contentType = 'application/json; charset=utf-8') {
  response.writeHead(status, responseHeaders(contentType));
  response.end(contentType.startsWith('application/json') ? JSON.stringify(body) : body);
}

async function readJson(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (Buffer.byteLength(raw) > JSON_LIMIT) throw new Error('Payload oltre il limite beta');
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('Payload JSON non valido');
    error.statusCode = 400;
    throw error;
  }
}

async function storeBlob(input) {
  let bytes;
  try {
    bytes = Buffer.from(input.contentBase64, 'base64');
  } catch {
    const error = new Error('Contenuto file non valido');
    error.statusCode = 400;
    throw error;
  }
  if (!bytes.length) {
    const error = new Error('Il file è vuoto');
    error.statusCode = 400;
    throw error;
  }
  if (bytes.length > BLOB_LIMIT) {
    const error = new Error('Il file supera il limite beta di 10 MB');
    error.statusCode = 413;
    throw error;
  }
  const checksum = sha256(bytes);
  await mkdir(BLOB_DIR, { recursive: true });
  const location = path.join(BLOB_DIR, checksum);
  await writeFile(location, bytes, { flag: 'wx' }).catch(error => {
    if (error.code !== 'EEXIST') throw error;
  });
  return { checksum, location: `runtime/blobs/${checksum}`, size: bytes.length };
}

function getSession(id) {
  const session = sessions.get(id);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(id);
    return null;
  }
  return session;
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    return send(response, 200, {
      ok: true,
      service: 'ictc',
      version: '2.0.0-beta.3',
      localSot: true,
      host: HOST
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/bootstrap') {
    return send(response, 200, await buildState());
  }

  if (request.method === 'GET' && url.pathname === '/api/runtime/integrity') {
    return send(response, 200, verifyLedger(await readLedger()));
  }

  if (request.method === 'GET' && url.pathname === '/api/runtime/info') {
    return send(response, 200, {
      mode: 'local',
      runtimeIsolated: Boolean(process.env.ICTC_RUNTIME_DIR),
      blobLimitBytes: BLOB_LIMIT,
      sessionTtlSeconds: SESSION_TTL_MS / 1000
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/traces') {
    const state = await buildState();
    return send(response, 200, { traces: state.views.traceCards, generatedAt: nowIso() });
  }

  if (request.method === 'GET' && url.pathname === '/api/self/manifest') {
    return send(response, 200, { writeAuthority: false, files: await selfDocumentationManifest() });
  }

  if (request.method === 'POST' && url.pathname === '/api/session') {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, { createdAt: Date.now(), turns: [], writeAuthority: false });
    return send(response, 201, {
      sessionId,
      expiresOnClose: true,
      expiresAfterSeconds: SESSION_TTL_MS / 1000,
      writeAuthority: false,
      scopeExpansion: 'ui-only'
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/sources') {
    const input = await readJson(request);
    if (!input.url && !input.contentBase64) return send(response, 400, { error: 'Inserire un link o un file' });
    const blob = input.contentBase64 ? await storeBlob(input) : null;
    const proposal = proposeSourceMetadata(input);
    const sourceId = `src-user-${crypto.randomUUID().slice(0, 8)}`;
    const at = nowIso();
    const source = {
      id: sourceId,
      ecosystemId: proposal.ecosystemId,
      title: input.title || input.fileName || input.url,
      kind: blob ? 'user-file' : 'user-link',
      locator: input.url || blob.location,
      authorityClass: 'candidate-unreviewed',
      lifecycle: 'candidate',
      lastCheckedAt: at,
      lastContentChangeAt: at,
      reviewState: 'candidate-awaiting-review',
      reviewOwner: 'Compliance Intake',
      checksum: blob?.checksum || null,
      size: blob?.size || null,
      submittedBy: input.submittedBy || 'current-user',
      notes: input.notes || '',
      aiProposal: proposal
    };
    const finding = {
      id: `finding-user-${crypto.randomUUID().slice(0, 8)}`,
      sourceId,
      jobId: null,
      findingType: 'new-source-proposal',
      detectedAt: at,
      statement: 'Una persona ha proposto una nuova fonte per ampliare il perimetro conoscitivo.',
      materiality: 'undetermined',
      aiProposal: proposal,
      humanState: 'awaiting-review'
    };
    const result = await appendEvent('source.proposed', { source, finding }, input.submittedBy || 'human-user', 'human-submission-plus-ai-proposal');
    return send(response, 201, { source, proposal, epistemicStatus: 'candidate', receipt: result.receipt });
  }

  let match = url.pathname.match(/^\/api\/sources\/([^/]+)\/review$/);
  if (request.method === 'POST' && match) {
    const input = await readJson(request);
    const current = await buildState();
    if (!current.sources.some(item => item.id === match[1])) return send(response, 404, { error: 'Fonte non trovata' });
    if (!['accepted', 'rejected'].includes(input.outcome)) return send(response, 400, { error: 'Esito review non valido' });
    const result = await appendEvent('source.reviewed', {
      sourceId: match[1], outcome: input.outcome, note: input.note || ''
    }, input.reviewedBy || 'human-reviewer', 'human-review');
    return send(response, 201, { sourceId: match[1], outcome: input.outcome, epistemicStatus: 'human-reviewed', receipt: result.receipt });
  }

  match = url.pathname.match(/^\/api\/findings\/([^/]+)\/review$/);
  if (request.method === 'POST' && match) {
    const input = await readJson(request);
    const current = await buildState();
    if (!current.findings.some(item => item.id === match[1])) return send(response, 404, { error: 'Esito non trovato' });
    if (!['relevant', 'not-relevant'].includes(input.outcome)) return send(response, 400, { error: 'Esito review non valido' });
    const result = await appendEvent('finding.reviewed', {
      findingId: match[1], outcome: input.outcome, note: input.note || ''
    }, input.reviewedBy || 'human-reviewer', 'human-review');
    return send(response, 201, { findingId: match[1], outcome: input.outcome, epistemicStatus: 'human-reviewed', receipt: result.receipt });
  }

  match = url.pathname.match(/^\/api\/scout-jobs\/([^/]+)\/run$/);
  if (request.method === 'POST' && match) {
    const input = await readJson(request);
    const current = await buildState();
    const existing = current.scoutJobs.find(item => item.id === match[1]);
    if (!existing) return send(response, 404, { error: 'Job non trovato' });
    const at = nowIso();
    const job = {
      ...existing,
      lastRunAt: at,
      nextRunAt: new Date(Date.now() + 86_400_000).toISOString(),
      lastRunState: input.simulateChange === false ? 'completed-no-change' : 'proposal-created'
    };
    const finding = {
      id: `finding-job-${crypto.randomUUID().slice(0, 8)}`,
      sourceId: current.sources.find(item => item.ecosystemId === existing.ecosystemId)?.id || null,
      jobId: match[1],
      findingType: input.simulateChange === false ? 'no-change' : 'content-change',
      detectedAt: at,
      statement: input.simulateChange === false
        ? 'Il controllo deterministico non ha rilevato differenze rispetto alla versione locale.'
        : 'Il controllo deterministico ha rilevato una differenza rispetto alla versione locale.',
      materiality: 'undetermined',
      aiProposal: input.simulateChange === false ? null : {
        themes: ['tema proposto dal job'],
        summary: 'Differenza sintetizzata per la review; impatto non determinato.',
        confidenceBand: 'low'
      },
      humanState: input.simulateChange === false ? 'not-required' : 'awaiting-review'
    };
    const result = await appendEvent('scout.run.completed', { job, finding }, input.actor || 'scheduler', finding.aiProposal ? 'deterministic-job-plus-ai-proposal' : 'deterministic-job');
    return send(response, 201, { job, finding, epistemicStatus: finding.aiProposal ? 'ai-proposed' : 'observed', receipt: result.receipt });
  }

  if (request.method === 'POST' && url.pathname === '/api/matters') {
    const input = await readJson(request);
    if (!input.summary?.trim()) return send(response, 400, { error: 'Descrivere cosa è successo' });
    const matter = createMatter(input);
    const result = await appendEvent('matter.reported', { matter }, input.reportedBy || 'human-user', 'human-report');
    return send(response, 201, { matter, epistemicStatus: 'reported', receipt: result.receipt });
  }

  match = url.pathname.match(/^\/api\/matters\/([^/]+)\/confirm-owner$/);
  if (request.method === 'POST' && match) {
    const input = await readJson(request);
    const current = await buildState();
    if (!current.matters.some(item => item.id === match[1])) return send(response, 404, { error: 'Evento non trovato' });
    if (!input.owner || !input.raci?.accountable || !input.raci?.responsible) {
      return send(response, 400, { error: 'Owner e RACI minimi sono obbligatori' });
    }
    const result = await appendEvent('matter.owner.confirmed', {
      matterId: match[1], owner: input.owner, raci: input.raci
    }, input.actor || 'human-owner', 'human-decision');
    return send(response, 201, { matterId: match[1], epistemicStatus: 'human-owned', receipt: result.receipt });
  }

  if (request.method === 'POST' && url.pathname === '/api/assistant') {
    const input = await readJson(request);
    const session = getSession(input.sessionId);
    if (!session) return send(response, 401, { error: 'Sessione locale assente o scaduta' });
    const capsule = buildCapsule(await buildState(), input);
    const result = answerFromCapsule(capsule, input.question);
    session.turns.push({ capsuleId: capsule.id, question: input.question, result, at: nowIso() });
    return send(response, 200, { capsule, ...result });
  }

  return false;
}

async function handler(request, response) {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      if (await handleApi(request, response, url) !== false) return;
      return send(response, 404, { error: 'API non trovata' });
    }

    const name = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.replace(/^\//, ''));
    const target = path.resolve(APP, name);
    const relative = path.relative(APP, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return send(response, 403, 'Forbidden', 'text/plain; charset=utf-8');
    await stat(target);
    return send(response, 200, await readFile(target), mimeTypes[path.extname(target)] || 'application/octet-stream');
  } catch (error) {
    if (error.code === 'ENOENT') return send(response, 404, 'Not found', 'text/plain; charset=utf-8');
    const status = error.statusCode || 500;
    if (status >= 500) console.error(error);
    return send(response, status, { error: error.message });
  }
}

const server = http.createServer(handler);
server.listen(PORT, HOST, () => console.log(`ICTC ready on http://${HOST}:${PORT}`));

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, shutdown);
