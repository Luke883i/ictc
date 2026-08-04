import { analyzeIncident, draftIncident } from '../ai.mjs';
import { asString, id, now, reminderDates } from '../domain.mjs';
import { applyAnswers, deriveQuestions, submissionReadiness } from '../question-engine.mjs';
import { bodyJson, commandFrom, httpError, json, requirePermission, routeMatch } from './http.mjs';
import { ensureIncidentOwner, findIncident, incidentProjection } from './model.mjs';

export function createIncidentHandler({ store, permissions }) {
  return async function handle(request, response, pathname, actor) {
    const method = request.method || 'GET';
    if (method === 'POST' && pathname === '/api/incidents/intake') {
      requirePermission(actor, 'report-incident', permissions);
      const input = await bodyJson(request);
      const originalNarrative = asString(input.originalNarrative, 50_000);
      const awarenessAt = asString(input.awarenessAt, 80);
      const awarenessDate = new Date(awarenessAt);
      if (!originalNarrative) throw httpError(400, 'Racconta che cosa è successo', 'narrative-required');
      if (Number.isNaN(awarenessDate.valueOf())) throw httpError(400, 'Data di conoscenza non valida', 'invalid-awareness-at');
      const attachments = await store.saveAttachments(input.attachments || []);
      const incidentId = id('incident');
      const rawEnvelope = await store.mutate(actor, 'incident.intake.recorded', { type: 'incident', id: incidentId }, {
        originalNarrative, awarenessAt, attachmentDigests: attachments.map(item => item.sha256)
      }, draft => {
        const incident = {
          id: incidentId,
          originalNarrative,
          awarenessAt: new Date(awarenessAt).toISOString(),
          attachments,
          state: 'intake',
          createdAt: now(),
          createdBy: actor.id,
          updatedAt: now(),
          analysis: null,
          analysisTrace: null,
          aiError: null,
          answers: {},
          draft: null,
          draftTrace: null,
          finalNarrative: '',
          submittedAt: null,
          closedAt: null,
          reminders: reminderDates(awarenessAt)
        };
        draft.incidents.push(incident);
        return incident;
      }, commandFrom(request));

      let analysisEnvelope = null;
      let warning = null;
      try {
        const current = store.snapshot().incidents.find(item => item.id === incidentId);
        const ai = await analyzeIncident(store.snapshot().settings, current);
        analysisEnvelope = await store.mutate(actor, 'incident.analyzed', { type: 'incident', id: incidentId }, { trace: ai.trace }, draft => {
          const incident = findIncident(draft, incidentId);
          incident.analysis = ai.output;
          incident.analysisTrace = ai.trace;
          incident.state = 'clarifying';
          incident.updatedAt = now();
          incident.aiError = null;
          return incidentProjection(incident);
        }, { id: `${asString(request.headers['x-ictc-command-id'], 160)}-analysis` });
      } catch (error) {
        warning = error.message;
        await store.mutate(actor, 'incident.analysis.deferred', { type: 'incident', id: incidentId }, { error: error.message }, draft => {
          const incident = findIncident(draft, incidentId);
          incident.state = 'clarifying';
          incident.aiError = error.message;
          incident.updatedAt = now();
          return incident;
        });
      }
      json(response, 201, {
        raw: rawEnvelope,
        analysis: analysisEnvelope,
        warning,
        incident: incidentProjection(findIncident(store.snapshot(), incidentId))
      });
      return true;
    }

    let params = routeMatch(pathname, '/api/incidents/:id/answers');
    if (method === 'POST' && params) {
      requirePermission(actor, 'edit-own-incident', permissions);
      const input = await bodyJson(request);
      const envelope = await store.mutate(actor, 'incident.answers.recorded', { type: 'incident', id: params.id }, input, draft => {
        const incident = findIncident(draft, params.id);
        ensureIncidentOwner(actor, incident);
        if (!['intake', 'clarifying', 'review'].includes(incident.state)) throw httpError(409, 'Segnalazione non modificabile', 'state-conflict');
        applyAnswers(incident, input, actor);
        incident.state = 'clarifying';
        incident.updatedAt = now();
        return incidentProjection(incident);
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }

    params = routeMatch(pathname, '/api/incidents/:id/draft');
    if (method === 'POST' && params) {
      requirePermission(actor, 'edit-own-incident', permissions);
      await bodyJson(request);
      const before = store.snapshot();
      const incident = findIncident(before, params.id);
      ensureIncidentOwner(actor, incident);
      const questions = deriveQuestions(incident);
      const ai = await draftIncident(before.settings, incident, questions);
      const envelope = await store.mutate(actor, 'incident.draft.generated', { type: 'incident', id: params.id }, { trace: ai.trace }, draft => {
        const current = findIncident(draft, params.id);
        ensureIncidentOwner(actor, current);
        current.draft = ai.output;
        current.draftTrace = ai.trace;
        current.finalNarrative = asString(ai.output.narrative, 50_000);
        current.state = 'review';
        current.updatedAt = now();
        return incidentProjection(current);
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }

    params = routeMatch(pathname, '/api/incidents/:id/submit');
    if (method === 'POST' && params) {
      requirePermission(actor, 'submit-own-incident', permissions);
      const input = await bodyJson(request);
      if (input.confirmed !== true) throw httpError(400, 'Conferma esplicita richiesta', 'confirmation-required');
      const envelope = await store.mutate(actor, 'incident.submitted', { type: 'incident', id: params.id }, input, draft => {
        const incident = findIncident(draft, params.id);
        ensureIncidentOwner(actor, incident);
        incident.finalNarrative = asString(input.finalNarrative ?? incident.finalNarrative, 50_000);
        const readiness = submissionReadiness(incident);
        if (!readiness.ready) throw httpError(409, 'Completa i dati necessari prima dell’invio', 'incident-not-ready', readiness);
        incident.state = 'submitted';
        incident.submittedAt = now();
        incident.updatedAt = now();
        return incidentProjection(incident);
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }

    params = routeMatch(pathname, '/api/incidents/:id/close');
    if (method === 'POST' && params) {
      requirePermission(actor, 'close-incident', permissions);
      const input = await bodyJson(request);
      const envelope = await store.mutate(actor, 'incident.closed', { type: 'incident', id: params.id }, input, draft => {
        const incident = findIncident(draft, params.id);
        if (incident.state !== 'submitted') throw httpError(409, 'È possibile chiudere soltanto una segnalazione inviata', 'state-conflict');
        incident.state = 'closed';
        incident.closedAt = now();
        incident.closureNote = asString(input.note, 10_000);
        incident.updatedAt = now();
        return incidentProjection(incident);
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }
    return false;
  };
}
