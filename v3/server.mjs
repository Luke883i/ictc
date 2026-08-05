import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from './store.mjs';
import { ROLES, VERSION, now, publicSettings } from './domain.mjs';
import { actorFrom, assertSafeRuntimeBinding, bodyJson, commandFrom, httpError, json, requirePermission, serveStatic } from './runtime/http.mjs';
import { validateSettings, visibleState } from './runtime/model.mjs';
import { createMonitoringRuntime } from './runtime/monitoring.mjs';
import { createContributionHandler } from './runtime/contributions.mjs';
import { createIncidentHandler } from './runtime/incidents.mjs';
import { createEvidenceHandler } from './runtime/evidence.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(here, 'public');
const contract = JSON.parse(await readFile(path.join(here, 'product-contract.json'), 'utf8'));
const permissions = Object.fromEntries(contract.roles.map(role => [role.id, new Set(role.permissions)]));
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'], ['.json', 'application/json; charset=utf-8'], ['.svg', 'image/svg+xml']
]);
const runtimeRoot = process.env.ICTC_RUNTIME_DIR || path.join(here, 'runtime');
const store = await new Store(runtimeRoot).init();
const port = Number(process.env.PORT || process.env.ICTC_PORT || 4173);
const host = process.env.ICTC_HOST || '127.0.0.1';
assertSafeRuntimeBinding(host);
const schedulerMs = Math.max(10_000, Number(process.env.ICTC_SCHEDULER_TICK_MS || 60_000));
const runningMissions = new Set();
const monitoring = createMonitoringRuntime({ store, permissions, runningMissions });
const handlers = [
  monitoring.handle,
  createContributionHandler({ store, permissions }),
  createIncidentHandler({ store, permissions }),
  createEvidenceHandler({ store, permissions })
];

async function handleApi(request, response, url, actor) {
  const pathname = url.pathname;
  const method = request.method || 'GET';
  if (method === 'GET' && pathname === '/api/health') {
    json(response, 200, { ok: true, service: 'ictc', version: VERSION, readiness: 'ready', services: ['monitoring', 'incidents'], roles: ROLES, integrity: store.verifyChain() });
    return;
  }
  if (method === 'GET' && pathname === '/api/bootstrap') {
    json(response, 200, visibleState(actor, store, VERSION));
    return;
  }
  if (method === 'PUT' && pathname === '/api/admin/settings') {
    requirePermission(actor, 'configure-ai', permissions);
    const input = await bodyJson(request);
    const normalized = validateSettings(input, store.snapshot().settings);
    const envelope = await store.mutate(actor, 'settings.updated', { type: 'settings', id: 'global' }, normalized, draft => {
      draft.settings = { ...draft.settings, ...normalized, updatedAt: now(), updatedBy: actor.id };
      return publicSettings(draft.settings);
    }, commandFrom(request));
    json(response, 200, envelope);
    return;
  }
  for (const handler of handlers) if (await handler(request, response, pathname, actor)) return;
  throw httpError(404, 'Endpoint non trovato', 'not-found');
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const actor = actorFrom(request, permissions);
    if (url.pathname.startsWith('/api/')) await handleApi(request, response, url, actor);
    else await serveStatic(response, url.pathname, publicRoot, mime);
  } catch (error) {
    if (!response.headersSent) json(response, error.status || 500, { error: error.message || 'Errore interno', code: error.code || 'internal-error', details: error.details || null });
    else response.end();
  }
});

async function schedulerTick() {
  const state = store.snapshot();
  const due = state.missions.filter(item => item.state === 'active' && item.nextRunAt && new Date(item.nextRunAt) <= new Date());
  for (const mission of due) {
    try {
      await monitoring.runMission(mission.id, { id: 'scheduler', role: 'admin', identityMode: 'system', permissions: [...permissions.admin] }, { id: `scheduler-${mission.id}-${mission.nextRunAt}` });
    } catch (error) {
      console.error('scheduler', mission.id, error.message);
    }
  }
}
const scheduler = setInterval(() => schedulerTick().catch(error => console.error('scheduler tick', error)), schedulerMs);
scheduler.unref();
server.listen(port, host, () => console.log(`ICTC ${VERSION} http://${host}:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  clearInterval(scheduler);
  server.close(() => process.exit(0));
});

export { server, store, monitoring as monitoringRuntime };
