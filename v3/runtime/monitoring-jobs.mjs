import { createMonitoringPlan } from '../ai.mjs';
import { asString, cadenceHours, id, now, uniqueStrings } from '../domain.mjs';
import { bodyJson, commandFrom, httpError, json, requirePermission, routeMatch } from './http.mjs';
import { findMission } from './model.mjs';
import { assertRnClosedUniverse } from './rn-monitoring-policy.mjs';

const MINING_MODES = new Set(['novelty', 'coverage', 'watchlist']);
const BASELINES = new Set(['last-run', 'activation', 'fixed-date']);
const CHANGE_TYPES = new Set(['new-law', 'amendment', 'repeal', 'guidance', 'case-law', 'effective-date']);

function enumValue(value, allowed, fallback) { const normalized = asString(value, 80).toLowerCase(); return allowed.has(normalized) ? normalized : fallback; }
function isoDate(value) { const raw = asString(value, 80); if (!raw) return null; const date = new Date(raw); if (Number.isNaN(date.valueOf())) throw httpError(400, 'Data baseline non valida', 'invalid-baseline-date'); return date.toISOString(); }

export function monitoringJobCandidate(input = {}, previous = {}) {
  const objective = asString(input.objective ?? previous.objective, 10_000);
  const miningMode = enumValue(input.miningMode ?? previous.miningMode, MINING_MODES, 'novelty');
  const noveltyBaseline = enumValue(input.noveltyBaseline ?? previous.noveltyBaseline, BASELINES, 'last-run');
  const changeTypes = uniqueStrings(input.changeTypes ?? previous.changeTypes).map(value => value.toLowerCase()).filter(value => CHANGE_TYPES.has(value));
  const requestedClasses = Object.prototype.hasOwnProperty.call(input,'sourceClasses') ? input.sourceClasses : previous.sourceClasses;
  const sourceClasses = assertRnClosedUniverse(requestedClasses);
  return {
    jobName: asString(input.jobName ?? previous.jobName, 500) || objective.slice(0, 120) || 'Job di ricerca normativa',
    objective,
    cadenceHours: cadenceHours(input.cadence ?? input.cadenceHours ?? previous.cadenceHours),
    sourceHints: uniqueStrings(input.sourceHints ?? previous.sourceHints),
    promptOverride: asString(input.promptOverride ?? previous.promptOverride, 40_000),
    miningMode,
    noveltyBaseline,
    baselineAt: noveltyBaseline === 'fixed-date' ? isoDate(input.baselineAt ?? previous.baselineAt) : null,
    jurisdictions: uniqueStrings(input.jurisdictions ?? previous.jurisdictions),
    authorities: uniqueStrings(input.authorities ?? previous.authorities),
    changeTypes: changeTypes.length ? changeTypes : ['new-law', 'amendment', 'repeal', 'guidance', 'effective-date'],
    sourceClasses,
    sourceUniverse: 'RN-01-closed-public-source-universe',
    resultLimit: Math.max(1, Math.min(200, Number(input.resultLimit ?? previous.resultLimit ?? 50) || 50))
  };
}

function commandPart(command, suffix) { return command.id ? { ...command, id: `${command.id}-${suffix}`, expectedRevision: null } : {}; }
async function planJob(store, missionId, actor, command) { const mission = findMission(store.snapshot(), missionId); const ai = await createMonitoringPlan(store.snapshot().settings, mission); return store.mutateProposed(actor, 'monitoring.job.planned', { type: 'mission', id: missionId }, { trace: ai.trace, sourceClasses: mission.sourceClasses }, draft => { const current = findMission(draft, missionId); current.plan = ai.output; current.planTrace = ai.trace; current.planVersion = Number(current.planVersion || 0) + 1; current.state = current.planningReturnState === 'paused' ? 'paused' : 'draft'; current.planningReturnState = null; current.plannedAt = now(); current.updatedAt = now(); current.aiError = null; return current; }, commandPart(command, 'plan')); }
async function markPlanFailure(store, missionId, actor, error, command) { return store.mutate(actor, 'monitoring.job.plan.deferred', { type: 'mission', id: missionId }, { error: error.message }, draft => { const current = findMission(draft, missionId); current.state = 'needs-plan'; current.aiError = error.message; current.updatedAt = now(); return current; }, commandPart(command, 'plan-deferred')); }

export function createMonitoringJobHandler({ store, permissions }) {
  return async function handleMonitoringJobs(request, response, pathname, actor) {
    const method = request.method || 'GET';
    if (method === 'POST' && pathname === '/api/monitoring-jobs/draft') {
      requirePermission(actor, 'manage-monitoring', permissions); const input = await bodyJson(request); const candidate = monitoringJobCandidate(input);
      if (!candidate.objective) throw httpError(400, 'Descrivi il risultato atteso dal job', 'objective-required');
      if (candidate.noveltyBaseline === 'fixed-date' && !candidate.baselineAt) throw httpError(400, 'Indica la data della baseline', 'baseline-required');
      const command = commandFrom(request), missionId = id('mission');
      const raw = await store.mutate(actor, 'monitoring.job.intent.recorded', { type: 'mission', id: missionId }, candidate, draft => { const mission = { id: missionId, ...candidate, plan: null, planTrace: null, planHistory: [], planVersion: 0, state: 'planning', createdAt: now(), createdBy: actor.id, updatedAt: now(), nextRunAt: null, lastRunAt: null, lastError: null, aiError: null, pausedAt: null, planningReturnState: 'draft' }; draft.missions.push(mission); return mission; }, command);
      let planning = null, warning = null; try { planning = await planJob(store, missionId, actor, command); } catch (error) { warning = error.message; await markPlanFailure(store, missionId, actor, error, command); }
      json(response, 201, { raw, planning, warning, mission: findMission(store.snapshot(), missionId) }); return true;
    }
    const params = routeMatch(pathname, '/api/monitoring-jobs/:id/profile');
    if (method === 'PUT' && params) {
      requirePermission(actor, 'manage-monitoring', permissions); const input = await bodyJson(request), command = commandFrom(request), before = findMission(store.snapshot(), params.id);
      if (!['draft', 'paused', 'needs-plan'].includes(before.state)) throw httpError(409, 'Sospendi il job prima di modificarne il profilo', 'state-conflict');
      const candidate = monitoringJobCandidate(input, before); if (!candidate.objective) throw httpError(400, 'Descrivi il risultato atteso dal job', 'objective-required'); if (candidate.noveltyBaseline === 'fixed-date' && !candidate.baselineAt) throw httpError(400, 'Indica la data della baseline', 'baseline-required');
      const updated = await store.mutate(actor, 'monitoring.job.profile.updated', { type: 'mission', id: params.id }, candidate, draft => { const current = findMission(draft, params.id); current.planHistory = [...(current.planHistory || []), current.plan ? { version: current.planVersion, plan: current.plan, trace: current.planTrace, archivedAt: now(), archivedBy: actor.id } : null].filter(Boolean).slice(-50); Object.assign(current, candidate); current.planningReturnState = current.state === 'paused' ? 'paused' : 'draft'; current.state = 'planning'; current.updatedAt = now(); return current; }, command);
      let planning = null, warning = null; try { planning = await planJob(store, params.id, actor, command); } catch (error) { warning = error.message; await markPlanFailure(store, params.id, actor, error, command); }
      json(response, 200, { updated, planning, warning, mission: findMission(store.snapshot(), params.id) }); return true;
    }
    return false;
  };
}
