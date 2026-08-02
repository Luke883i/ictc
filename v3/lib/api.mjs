import crypto from 'node:crypto';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { append, apply, readLedger, RUNTIME, tenantPaths, transitions, verify } from './store.mjs';
import { createBlobStore } from './blob-store.mjs';
import { monitoringCapabilities, runMonitoringJob } from './monitoring-runtime.mjs';
import { createRuntimeModel } from './runtime-model.mjs';
import { project } from './project.mjs';
import { AccessError, accessView, loadAccessDirectory, requirePermission, resolveAccessContext } from './access-context.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const PUBLIC = path.join(ROOT, 'public');
const sessions = new Map();
const coreContract = JSON.parse(await readFile(path.join(PUBLIC, 'core-workspaces.json'), 'utf8'));
const model = createRuntimeModel(coreContract);
export const accessDirectory = await loadAccessDirectory();

const headers = type => ({
  'content-type': type,
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'"
});

function send(res, status, value, type = 'application/json; charset=utf-8') {
  res.writeHead(status, headers(type));
  const body = Buffer.isBuffer(value) ? value : type.includes('json') ? JSON.stringify(value) : value;
  res.end(body);
}

async function input(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 8_000_000) throw new Error('Payload oltre limite.');
  }
  return raw ? JSON.parse(raw) : {};
}

function requestError(res, error, status = 400) {
  const resolvedStatus = error instanceof AccessError ? error.status : status;
  return send(res, resolvedStatus, { error: error.message, code: error.code || 'invalid-request' });
}

export function requestContext(req, env = process.env) {
  return resolveAccessContext(req, accessDirectory, env);
}

const blobStoreFor = context => createBlobStore({
  root: tenantPaths(context).blobs,
  publicPrefix: `runtime/tenants/${context.tenant.id}/blobs`
});

export async function buildState(context = requestContext({ headers: {} })) {
  requirePermission(context, 'read');
  const events = await readLedger(context);
  const domain = apply(events, context.tenant);
  const integrity = verify(events, context);
  const views = project(domain, integrity);
  return {
    ...domain,
    meta: {
      ...domain.meta,
      integrity,
      runtime: tenantPaths(context).root,
      monitoring: monitoringCapabilities(),
      access: accessView(context, accessDirectory)
    },
    views,
    objectIndex: views.index
  };
}

function scopedInput(value, context) {
  const clean = { ...value };
  delete clean.by;
  delete clean.actor;
  delete clean.actorId;
  delete clean.tenant;
  delete clean.tenantId;
  clean.operatingContext = context.tenant.organizationType;
  return clean;
}

function sessionMatches(session, context) {
  return session && session.tenantId === context.tenant.id && session.actorId === context.actor.id;
}

async function handleApiInner(req, res, url) {
  let context;
  try {
    context = requestContext(req);
  } catch (error) {
    return requestError(res, error, 401);
  }

  if (req.method === 'GET' && url.pathname === '/api/access') {
    return send(res, 200, accessView(context, accessDirectory));
  }
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return send(res, 200, {
      ok: true,
      service: 'ictc-v3',
      version: '3.1.0-readiness',
      localSot: true,
      runtime: RUNTIME,
      access: { tenantAware: true, identityMode: context.identityMode, tenantId: context.tenant.id },
      monitoring: monitoringCapabilities()
    });
  }
  if (req.method === 'GET' && url.pathname === '/api/bootstrap') return send(res, 200, await buildState(context));
  if (req.method === 'GET' && url.pathname === '/api/runtime/integrity') {
    requirePermission(context, 'read');
    return send(res, 200, verify(await readLedger(context), context));
  }
  if (req.method === 'GET' && url.pathname === '/api/runtime/ledger') {
    requirePermission(context, 'read');
    const events = await readLedger(context);
    return send(res, 200, {
      events: events.slice(-100).reverse().map(({ payload, ...event }) => event),
      integrity: verify(events, context)
    });
  }
  if (req.method === 'GET' && url.pathname === '/api/self/manifest') {
    return send(res, 200, {
      writeAuthority: false,
      tenantAware: true,
      identityBoundary: context.identityMode,
      files: [
        'v3/access-control.json',
        'v3/server.mjs',
        'v3/lib/access-context.mjs',
        'v3/lib/store.mjs',
        'v3/lib/blob-store.mjs',
        'v3/lib/runtime-model.mjs',
        'v3/lib/network-policy.mjs',
        'v3/lib/monitoring-runtime.mjs',
        'v3/lib/project.mjs',
        'v3/lib/api.mjs',
        'v3/public/index.html',
        'v3/public/js/journey-shell.js',
        'v3/public/js/journey-shell-common.js',
        'v3/public/js/journey-shell-render.js',
        'v3/public/js/journey-shell-actions.js'
      ]
    });
  }

  let match = url.pathname.match(/^\/api\/objects\/([^/]+)$/);
  if (req.method === 'GET' && match) {
    requirePermission(context, 'read');
    const state = await buildState(context);
    const object = state.objectIndex[decodeURIComponent(match[1])];
    if (!object) return send(res, 404, { error: 'Oggetto non trovato nel tenant selezionato.' });
    const edges = state.views.semanticGraph.edges.filter(edge => edge.from === object.id || edge.to === object.id);
    const ids = [...new Set(edges.flatMap(edge => [edge.from, edge.to]).filter(id => id !== object.id))];
    return send(res, 200, { object, edges, related: ids.map(id => state.objectIndex[id]).filter(Boolean) });
  }

  if (req.method === 'POST' && url.pathname === '/api/session') {
    requirePermission(context, 'read');
    const id = crypto.randomUUID();
    sessions.set(id, { createdAt: Date.now(), writeAuthority: false, tenantId: context.tenant.id, actorId: context.actor.id });
    return send(res, 201, { sessionId: id, writeAuthority: false, tenantId: context.tenant.id, scopeExpansion: 'selected-object-plus-neighbors' });
  }

  if (req.method === 'POST' && url.pathname === '/api/jobs') {
    requirePermission(context, 'observe');
    const value = scopedInput(await input(req), context);
    try {
      const { source, job } = model.createMonitoring(value);
      const result = await append(context, 'job.created', { source, job }, 'human-monitoring-configuration');
      return send(res, 201, { source, job, epistemicStatus: 'candidate', receipt: result.receipt });
    } catch (error) { return requestError(res, error); }
  }

  match = url.pathname.match(/^\/api\/jobs\/([^/]+)\/schedule$/);
  if (req.method === 'POST' && match) {
    requirePermission(context, 'run');
    const value = scopedInput(await input(req), context);
    const state = await buildState(context);
    const job = state.jobs.find(item => item.id === match[1]);
    if (!job) return send(res, 404, { error: 'Monitoraggio non trovato nel tenant selezionato.' });
    const source = state.sources.find(item => item.id === job.sourceId);
    if (!source || source.lifecycle !== 'active') return send(res, 409, { error: 'Includere la fonte prima di attivare il monitoraggio.' });
    const updated = model.scheduleMonitoring(job, value);
    const result = await append(context, 'job.scheduled', { id: job.id, job: updated }, 'human-monitoring-configuration');
    return send(res, 201, { job: updated, epistemicStatus: updated.enabled ? 'human-reviewed' : 'observed', receipt: result.receipt });
  }

  match = url.pathname.match(/^\/api\/jobs\/([^/]+)\/run$/);
  if (req.method === 'POST' && match) {
    requirePermission(context, 'run');
    const value = scopedInput(await input(req), context);
    try {
      const result = await runMonitoringJob(context, match[1], { trigger: 'manual', contentText: value.contentText });
      return send(res, 201, { ...result, epistemicStatus: result.finding ? 'ai-proposed' : 'observed' });
    } catch (error) {
      return send(res, 409, { error: error.message, capability: 'monitoring-run', state: 'unavailable' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/sources') {
    requirePermission(context, 'observe');
    const value = scopedInput(await input(req), context);
    if (!value.url && !value.contentBase64 && !String(value.contentText || '').trim()) return send(res, 400, { error: 'Inserire un link o un contenuto testuale.' });
    try {
      let blob = null;
      const blobs = blobStoreFor(context);
      if (String(value.contentText || '').trim()) blob = await blobs.putText(value.contentText);
      else if (value.contentBase64) {
        const bytes = Buffer.from(value.contentBase64, 'base64');
        const candidateExtension = path.extname(String(value.fileName || '')).toLowerCase();
        const extension = /^\.[a-z0-9]{1,12}$/.test(candidateExtension) ? candidateExtension : '';
        blob = await blobs.putBytes(bytes, { maxBytes: 5_000_000, extension, mediaType: value.mediaType || 'application/octet-stream' });
      }
      const { source, finding } = model.createManualSource({ ...value, binary: Boolean(value.contentBase64) }, blob);
      const result = await append(context, 'source.proposed', { source, finding }, 'human-input');
      return send(res, 201, { source, finding, epistemicStatus: 'candidate', receipt: result.receipt });
    } catch (error) { return requestError(res, error); }
  }

  match = url.pathname.match(/^\/api\/sources\/([^/]+)\/review$/);
  if (req.method === 'POST' && match) {
    requirePermission(context, 'review');
    const value = scopedInput(await input(req), context);
    const state = await buildState(context);
    if (!state.sources.some(item => item.id === match[1])) return send(res, 404, { error: 'Fonte non trovata nel tenant selezionato.' });
    if (!['accepted', 'rejected'].includes(value.outcome)) return send(res, 400, { error: 'Esito non valido.' });
    const result = await append(context, 'source.reviewed', { id: match[1], outcome: value.outcome }, 'human-review');
    return send(res, 201, { epistemicStatus: 'human-reviewed', receipt: result.receipt });
  }

  match = url.pathname.match(/^\/api\/findings\/([^/]+)\/review$/);
  if (req.method === 'POST' && match) {
    requirePermission(context, 'review');
    const value = scopedInput(await input(req), context);
    const state = await buildState(context);
    if (!state.findings.some(item => item.id === match[1])) return send(res, 404, { error: 'Differenza non trovata nel tenant selezionato.' });
    if (!['relevant', 'not-relevant'].includes(value.outcome)) return send(res, 400, { error: 'Esito non valido.' });
    const result = await append(context, 'finding.reviewed', { id: match[1], outcome: value.outcome }, 'human-review');
    return send(res, 201, { epistemicStatus: 'human-reviewed', receipt: result.receipt });
  }

  match = url.pathname.match(/^\/api\/changes\/([^/]+)\/decide$/);
  if (req.method === 'POST' && match) {
    requirePermission(context, 'decide');
    const value = scopedInput(await input(req), context);
    const state = await buildState(context);
    if (!state.changes.some(item => item.id === match[1])) return send(res, 404, { error: 'Decisione non trovata nel tenant selezionato.' });
    if (!['monitor', 'action-required', 'not-applicable'].includes(value.outcome) || !String(value.rationale || '').trim()) return send(res, 400, { error: 'Decisione e motivazione obbligatorie.' });
    const result = await append(context, 'change.decided', { id: match[1], outcome: value.outcome, rationale: String(value.rationale).slice(0, 3000) }, 'human-decision');
    return send(res, 201, { epistemicStatus: 'human-reviewed', receipt: result.receipt });
  }

  match = url.pathname.match(/^\/api\/changes\/([^/]+)\/map-control$/);
  if (req.method === 'POST' && match) {
    requirePermission(context, 'decide');
    const value = scopedInput(await input(req), context);
    const state = await buildState(context);
    if (!state.changes.some(item => item.id === match[1])) return send(res, 404, { error: 'Decisione non trovata nel tenant selezionato.' });
    if (!state.controls.some(item => item.id === value.controlId)) return send(res, 404, { error: 'Controllo non trovato.' });
    const result = await append(context, 'change.control.mapped', { id: match[1], controlId: value.controlId, rationale: String(value.rationale || '').slice(0, 3000) }, 'human-mapping');
    return send(res, 201, { epistemicStatus: 'mapped', receipt: result.receipt });
  }

  if (req.method === 'POST' && url.pathname === '/api/matters') {
    requirePermission(context, 'report');
    const value = scopedInput(await input(req), context);
    try {
      const matter = model.createIncident(value);
      const result = await append(context, 'matter.reported', { matter }, 'human-report');
      return send(res, 201, { matter, epistemicStatus: 'observed', receipt: result.receipt });
    } catch (error) { return requestError(res, error); }
  }

  match = url.pathname.match(/^\/api\/matters\/([^/]+)\/confirm-owner$/);
  if (req.method === 'POST' && match) {
    requirePermission(context, 'manage-case');
    const value = scopedInput(await input(req), context);
    const state = await buildState(context);
    if (!state.matters.some(item => item.id === match[1])) return send(res, 404, { error: 'Caso non trovato nel tenant selezionato.' });
    if (!value.owner || !value.raci?.accountable || !value.raci?.responsible) return send(res, 400, { error: 'Owner e RACI obbligatori.' });
    const result = await append(context, 'matter.owner.confirmed', { id: match[1], owner: value.owner, raci: value.raci }, 'human-decision');
    return send(res, 201, { epistemicStatus: 'human-owned', receipt: result.receipt });
  }

  match = url.pathname.match(/^\/api\/matters\/([^/]+)\/transition$/);
  if (req.method === 'POST' && match) {
    requirePermission(context, 'manage-case');
    const value = scopedInput(await input(req), context);
    const state = await buildState(context);
    const matter = state.matters.find(item => item.id === match[1]);
    if (!matter) return send(res, 404, { error: 'Caso non trovato nel tenant selezionato.' });
    if (!transitions[matter.state]?.includes(value.to)) return send(res, 409, { error: `Transizione non consentita da ${matter.state} a ${value.to}.` });
    try {
      const { phase, clean } = model.validateIncidentTransition(matter, value.to, value.evidence);
      const result = await append(context, 'matter.transitioned', { id: match[1], to: value.to, phase: phase.phase, label: phase.label, evidence: clean }, 'human-transition');
      return send(res, 201, { epistemicStatus: value.to === 'closed' ? 'human-reviewed' : 'human-owned', phase: phase.phase, receipt: result.receipt });
    } catch (error) { return requestError(res, error); }
  }

  if (req.method === 'POST' && url.pathname === '/api/assistant') {
    requirePermission(context, 'read');
    const value = scopedInput(await input(req), context);
    const session = sessions.get(value.sessionId);
    if (!sessionMatches(session, context)) return send(res, 401, { error: 'Sessione assente, scaduta o appartenente a un altro tenant.' });
    const state = await buildState(context);
    const object = state.objectIndex[value.objectId] || state.views.headline;
    const edges = state.views.semanticGraph.edges.filter(edge => edge.from === object.id || edge.to === object.id);
    const ids = [...new Set([object.id, ...edges.flatMap(edge => [edge.from, edge.to])])].slice(0, 12);
    const items = ids.map(id => state.objectIndex[id]).filter(Boolean);
    const question = String(value.question || '').toLowerCase();
    const answer = /conform|certificat|sicuri/.test(question) ? 'No. Gli esiti attestano operazioni e decisioni nel tenant selezionato, non una conclusione generale di conformità.' : `L’oggetto “${object.label}” deriva da ${object.producer.id}. Limiti: ${(object.limitations || []).join(' ')}`;
    return send(res, 200, { answer, epistemicStatus: 'ai-proposed', citedItemIds: items.map(item => item.id), limitations: ['Capsula confinata al tenant e alla sessione.', 'Nessuna scrittura autonoma.'], capsule: { id: crypto.randomUUID(), tenantId: context.tenant.id, writeAuthority: false, items } });
  }
  return false;
}

export async function handleApi(req, res, url) {
  try { return await handleApiInner(req, res, url); }
  catch (error) { if (error instanceof AccessError) return requestError(res, error, error.status); throw error; }
}

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };
export async function handleStatic(req, res, url) {
  const name = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const target = path.resolve(PUBLIC, name);
  if (!target.startsWith(PUBLIC + path.sep) && target !== path.join(PUBLIC, 'index.html')) return send(res, 403, 'Forbidden', 'text/plain');
  await stat(target);
  return send(res, 200, await readFile(target), mime[path.extname(target)] || 'application/octet-stream');
}
export function errorResponse(res, error) {
  if (error.code === 'ENOENT') return send(res, 404, 'Not found', 'text/plain');
  if (error instanceof AccessError) return requestError(res, error, error.status);
  console.error(error);
  return send(res, 500, { error: error.message });
}

export const apiInternals = Object.freeze({ scopedInput, sessionMatches, blobStoreFor });
