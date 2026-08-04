import { createMonitoringPlan, discoverCompliance } from '../ai.mjs';
import { asString, cadenceHours, id, nextRunAt, now, uniqueStrings } from '../domain.mjs';
import { bodyJson, commandFrom, httpError, json, requirePermission, routeMatch } from './http.mjs';
import {
  applyCatalogDecision, catalogKey, findCatalog, findMission, normalizeCatalogItem
} from './model.mjs';

export function createMonitoringRuntime({ store, permissions, runningMissions }) {
  async function runMission(missionId, actor, command = {}) {
    if (runningMissions.has(missionId)) throw httpError(409, 'Monitoraggio già in esecuzione', 'already-running');
    runningMissions.add(missionId);
    try {
      const before = store.snapshot();
      const mission = findMission(before, missionId);
      if (mission.state !== 'active') throw httpError(409, 'Attiva prima il monitoraggio', 'mission-not-active');
      const runId = id('run');
      const startedAt = now();
      let discovery;
      try {
        discovery = await discoverCompliance(before.settings, mission, mission.plan, {
          previousIdentifiers: before.catalog.map(item => item.identifier).filter(Boolean)
        });
      } catch (error) {
        await store.mutate(actor, 'monitoring.run.failed', { type: 'run', id: runId }, { missionId, error: error.message }, draft => {
          const current = findMission(draft, missionId);
          current.lastError = error.message;
          current.lastRunAt = startedAt;
          current.nextRunAt = nextRunAt(startedAt, current.cadenceHours);
          const run = { id: runId, missionId, state: 'failed', startedAt, completedAt: now(), error: error.message, discovered: 0, inserted: 0, updated: 0 };
          draft.runs.push(run);
          return run;
        }, command);
        throw error;
      }
      const items = Array.isArray(discovery.output.items) ? discovery.output.items : [];
      return store.mutate(actor, 'monitoring.run.completed', { type: 'run', id: runId }, { missionId, trace: discovery.trace }, draft => {
        const current = findMission(draft, missionId);
        let inserted = 0;
        let updated = 0;
        for (const raw of items.slice(0, 200)) {
          const normalized = normalizeCatalogItem(raw, { kind: 'mission-run', missionId, runId, observedAt: now() }, discovery.trace, id);
          const key = catalogKey(normalized);
          const existing = draft.catalog.find(entry => catalogKey(entry) === key && key !== '||');
          if (existing) {
            Object.assign(existing, { ...normalized, id: existing.id, state: existing.state, decisions: existing.decisions, createdAt: existing.createdAt, updatedAt: now() });
            updated += 1;
          } else {
            draft.catalog.push(normalized);
            inserted += 1;
          }
        }
        const completedAt = now();
        const run = { id: runId, missionId, state: 'completed', startedAt, completedAt, discovered: items.length, inserted, updated, aiTrace: discovery.trace };
        draft.runs.push(run);
        current.lastRunAt = completedAt;
        current.nextRunAt = nextRunAt(completedAt, current.cadenceHours);
        current.lastError = null;
        return run;
      }, command);
    } finally {
      runningMissions.delete(missionId);
    }
  }

  async function handle(request, response, pathname, actor) {
    const method = request.method || 'GET';
    if (method === 'POST' && pathname === '/api/missions/draft') {
      requirePermission(actor, 'manage-monitoring', permissions);
      const input = await bodyJson(request);
      const objective = asString(input.objective, 10_000);
      if (!objective) throw httpError(400, 'Descrivi che cosa deve sorvegliare ICTC', 'objective-required');
      const missionId = id('mission');
      const candidate = {
        id: missionId,
        objective,
        cadenceHours: cadenceHours(input.cadence),
        sourceHints: uniqueStrings(input.sourceHints),
        promptOverride: asString(input.promptOverride, 40_000)
      };
      const ai = await createMonitoringPlan(store.snapshot().settings, candidate);
      const envelope = await store.mutate(actor, 'monitoring.mission.drafted', { type: 'mission', id: missionId }, {
        objective, cadence: candidate.cadenceHours, sourceHints: candidate.sourceHints, trace: ai.trace
      }, draft => {
        const mission = {
          ...candidate, plan: ai.output, planTrace: ai.trace, state: 'draft', createdAt: now(), createdBy: actor.id,
          updatedAt: now(), nextRunAt: null, lastRunAt: null, lastError: null
        };
        draft.missions.push(mission);
        return mission;
      }, commandFrom(request));
      json(response, 201, envelope);
      return true;
    }

    let params = routeMatch(pathname, '/api/missions/:id/activate');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions);
      const input = await bodyJson(request);
      const envelope = await store.mutate(actor, 'monitoring.mission.activated', { type: 'mission', id: params.id }, input, draft => {
        const mission = findMission(draft, params.id);
        if (!['draft', 'paused'].includes(mission.state)) throw httpError(409, 'Monitoraggio non attivabile nello stato corrente', 'state-conflict');
        mission.state = 'active';
        mission.updatedAt = now();
        mission.nextRunAt = now();
        return mission;
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }

    params = routeMatch(pathname, '/api/missions/:id/run');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions);
      await bodyJson(request);
      const envelope = await runMission(params.id, actor, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }

    params = routeMatch(pathname, '/api/catalog/:id/decision');
    if (method === 'POST' && params) {
      requirePermission(actor, 'review-source', permissions);
      const input = await bodyJson(request);
      const decision = asString(input.decision, 40);
      if (!['verified', 'rejected'].includes(decision)) throw httpError(400, 'Decisione non valida', 'invalid-decision');
      const reason = asString(input.reason, 5_000);
      const envelope = await store.mutate(actor, 'catalog.source.decided', { type: 'catalog', id: params.id }, { decision, reason }, draft => {
        return applyCatalogDecision(findCatalog(draft, params.id), decision, reason, actor.id);
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }
    return false;
  }

  return { runMission, handle };
}
