import { createMonitoringPlan, discoverCompliance } from '../ai.mjs';
import { asString, cadenceHours, id, nextRunAt, now, uniqueStrings } from '../domain.mjs';
import { bodyJson, commandFrom, httpError, json, requirePermission, routeMatch } from './http.mjs';
import {
  applyCatalogDecision, catalogKey, findCatalog, findMission, mergeCatalogObservation, normalizeCatalogItem
} from './model.mjs';

function derivedCommand(command, suffix) {
  return command.id ? { ...command, id: `${command.id}-${suffix}`, expectedRevision: null } : {};
}
function candidateFrom(input, previous = {}) {
  return {
    objective: asString(input.objective ?? previous.objective, 10_000),
    cadenceHours: cadenceHours(input.cadence ?? input.cadenceHours ?? previous.cadenceHours),
    sourceHints: uniqueStrings(input.sourceHints ?? previous.sourceHints),
    promptOverride: asString(input.promptOverride ?? previous.promptOverride, 40_000)
  };
}

export function createMonitoringRuntime({ store, permissions, runningMissions }) {
  async function completePlan(missionId, actor, command = {}) {
    const before = store.snapshot();
    const mission = findMission(before, missionId);
    const ai = await createMonitoringPlan(before.settings, mission);
    return store.mutate(actor, 'monitoring.mission.planned', { type: 'mission', id: missionId }, { trace: ai.trace }, draft => {
      const current = findMission(draft, missionId);
      current.plan = ai.output;
      current.planTrace = ai.trace;
      current.planVersion = Number(current.planVersion || 0) + 1;
      current.state = current.planningReturnState === 'paused' ? 'paused' : 'draft';
      current.planningReturnState = null;
      current.plannedAt = now();
      current.updatedAt = now();
      current.aiError = null;
      return current;
    }, command);
  }

  async function deferPlan(missionId, actor, error, command = {}) {
    return store.mutate(actor, 'monitoring.mission.plan.deferred', { type: 'mission', id: missionId }, { error: error.message }, draft => {
      const current = findMission(draft, missionId);
      current.state = 'needs-plan';
      current.aiError = error.message;
      current.updatedAt = now();
      return current;
    }, command);
  }

  async function runMission(missionId, actor, command = {}) {
    if (runningMissions.has(missionId)) throw httpError(409, 'Monitoraggio già in esecuzione', 'already-running');
    runningMissions.add(missionId);
    try {
      const before = store.snapshot();
      const mission = findMission(before, missionId);
      if (mission.state !== 'active') throw httpError(409, 'Attiva prima il monitoraggio', 'mission-not-active');
      if (!mission.plan) throw httpError(409, 'Il piano AI non è disponibile', 'mission-plan-missing');
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
            mergeCatalogObservation(existing, normalized);
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
      const candidate = candidateFrom(input);
      if (!candidate.objective) throw httpError(400, 'Descrivi che cosa deve sorvegliare ICTC', 'objective-required');
      const command = commandFrom(request);
      const requestedId = id('mission');
      const rawEnvelope = await store.mutate(actor, 'monitoring.mission.intent.recorded', { type: 'mission', id: requestedId }, candidate, draft => {
        const mission = {
          id: requestedId,
          ...candidate,
          plan: null,
          planTrace: null,
          planHistory: [],
          planVersion: 0,
          state: 'planning',
          createdAt: now(),
          createdBy: actor.id,
          updatedAt: now(),
          nextRunAt: null,
          lastRunAt: null,
          lastError: null,
          aiError: null,
          pausedAt: null,
          planningReturnState: 'draft'
        };
        draft.missions.push(mission);
        return mission;
      }, command);
      const missionId = rawEnvelope.result.id;
      let planningEnvelope = null;
      let warning = null;
      try {
        planningEnvelope = await completePlan(missionId, actor, derivedCommand(command, 'plan'));
      } catch (error) {
        warning = error.message;
        await deferPlan(missionId, actor, error, derivedCommand(command, 'plan-deferred'));
      }
      json(response, 201, {
        raw: rawEnvelope,
        planning: planningEnvelope,
        warning,
        mission: findMission(store.snapshot(), missionId)
      });
      return true;
    }

    let params = routeMatch(pathname, '/api/missions/:id/revise');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions);
      const input = await bodyJson(request);
      const command = commandFrom(request);
      const before = store.snapshot();
      const mission = findMission(before, params.id);
      if (!['draft', 'paused', 'needs-plan'].includes(mission.state)) throw httpError(409, 'Puoi revisionare solo un monitoraggio in bozza, in pausa o senza piano', 'state-conflict');
      const candidate = candidateFrom(input, mission);
      if (!candidate.objective) throw httpError(400, 'Descrivi che cosa deve sorvegliare ICTC', 'objective-required');
      const requestEnvelope = await store.mutate(actor, 'monitoring.mission.revision.requested', { type: 'mission', id: params.id }, candidate, draft => {
        const current = findMission(draft, params.id);
        current.planHistory = [...(current.planHistory || []), current.plan ? {
          version: current.planVersion,
          plan: current.plan,
          trace: current.planTrace,
          archivedAt: now(),
          archivedBy: actor.id
        } : null].filter(Boolean).slice(-50);
        Object.assign(current, candidate);
        current.planningReturnState = current.state === 'paused' ? 'paused' : 'draft';
        current.state = 'planning';
        current.updatedAt = now();
        return current;
      }, command);
      let planningEnvelope = null;
      let warning = null;
      try {
        planningEnvelope = await completePlan(params.id, actor, derivedCommand(command, 'plan'));
      } catch (error) {
        warning = error.message;
        await deferPlan(params.id, actor, error, derivedCommand(command, 'plan-deferred'));
      }
      json(response, 200, { request: requestEnvelope, planning: planningEnvelope, warning, mission: findMission(store.snapshot(), params.id) });
      return true;
    }

    params = routeMatch(pathname, '/api/missions/:id/activate');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions);
      const input = await bodyJson(request);
      const envelope = await store.mutate(actor, 'monitoring.mission.activated', { type: 'mission', id: params.id }, input, draft => {
        const mission = findMission(draft, params.id);
        if (!['draft', 'paused'].includes(mission.state) || !mission.plan) throw httpError(409, 'Monitoraggio non attivabile: verifica prima il piano', 'state-conflict');
        mission.state = 'active';
        mission.updatedAt = now();
        mission.nextRunAt = now();
        return mission;
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }

    params = routeMatch(pathname, '/api/missions/:id/pause');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions);
      const input = await bodyJson(request);
      const reason = asString(input.reason, 5_000);
      if (!reason) throw httpError(400, 'Indica perché il monitoraggio viene sospeso', 'reason-required');
      const envelope = await store.mutate(actor, 'monitoring.mission.paused', { type: 'mission', id: params.id }, { reason }, draft => {
        const mission = findMission(draft, params.id);
        if (mission.state !== 'active') throw httpError(409, 'Puoi sospendere solo un monitoraggio attivo', 'state-conflict');
        mission.state = 'paused';
        mission.pausedAt = now();
        mission.pauseReason = reason;
        mission.nextRunAt = null;
        mission.updatedAt = now();
        return mission;
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }

    params = routeMatch(pathname, '/api/missions/:id/resume');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions);
      const input = await bodyJson(request);
      const envelope = await store.mutate(actor, 'monitoring.mission.resumed', { type: 'mission', id: params.id }, input, draft => {
        const mission = findMission(draft, params.id);
        if (mission.state !== 'paused') throw httpError(409, 'Puoi riprendere solo un monitoraggio sospeso', 'state-conflict');
        mission.state = 'active';
        mission.pausedAt = null;
        mission.nextRunAt = now();
        mission.updatedAt = now();
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
      if (!reason) throw httpError(400, 'Motiva la decisione sulla fonte', 'reason-required');
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
