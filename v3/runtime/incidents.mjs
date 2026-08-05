import { analyzeIncident, draftIncident } from '../ai.mjs';
import { asString, id, now, reminderDates } from '../domain.mjs';
import { applyAnswers, currentFormulation, deriveQuestions, formulationRecord, submissionReadiness } from '../question-engine.mjs';
import { bodyJson, commandFrom, httpError, json, requirePermission, routeMatch } from './http.mjs';
import { ensureIncidentOwner, findIncident, incidentProjection } from './model.mjs';

function derivedCommand(command, suffix) {
  return command.id ? { ...command, id: `${command.id}-${suffix}`, expectedRevision: null } : {};
}

export function createIncidentHandler({ store, permissions }) {
  async function analyzeOne(incidentId, actor, command = {}) {
    const current = findIncident(store.snapshot(), incidentId);
    ensureIncidentOwner(actor, current);
    const ai = await analyzeIncident(store.snapshot().settings, current);
    return store.mutate(actor, 'incident.analyzed', { type: 'incident', id: incidentId }, { trace: ai.trace }, draft => {
      const incident = findIncident(draft, incidentId);
      ensureIncidentOwner(actor, incident);
      incident.analysis = ai.output;
      incident.analysisTrace = ai.trace;
      incident.analysisAttempts = Number(incident.analysisAttempts || 0) + 1;
      incident.state = 'clarifying';
      incident.updatedAt = now();
      incident.aiError = null;
      return incidentProjection(incident);
    }, command);
  }

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
      const command = commandFrom(request);
      let rawEnvelope;
      try {
        rawEnvelope = await store.mutate(actor, 'incident.intake.recorded', { type: 'incident', id: incidentId }, {
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
            analysisAttempts: 0,
            aiError: null,
            answers: {},
            draft: null,
            draftTrace: null,
            finalNarrative: '',
            formulationVersions: [],
            formulationDirty: true,
            submittedAt: null,
            closedAt: null,
            reminders: reminderDates(awarenessAt)
          };
          draft.incidents.push(incident);
          return incident;
        }, command);
      } catch (error) {
        await store.deleteAttachments(attachments);
        throw error;
      }

      const recordedId = rawEnvelope.result.id;
      let analysisEnvelope = null;
      let warning = null;
      try {
        analysisEnvelope = await analyzeOne(recordedId, actor, derivedCommand(command, 'analysis'));
      } catch (error) {
        warning = error.message;
        await store.mutate(actor, 'incident.analysis.deferred', { type: 'incident', id: recordedId }, { error: error.message }, draft => {
          const incident = findIncident(draft, recordedId);
          incident.state = 'clarifying';
          incident.aiError = error.message;
          incident.analysisAttempts = Number(incident.analysisAttempts || 0) + 1;
          incident.updatedAt = now();
          return incident;
        }, derivedCommand(command, 'analysis-deferred'));
      }
      json(response, 201, {
        raw: rawEnvelope,
        analysis: analysisEnvelope,
        warning,
        incident: incidentProjection(findIncident(store.snapshot(), recordedId))
      });
      return true;
    }

    let params = routeMatch(pathname, '/api/incidents/:id/analyze');
    if (method === 'POST' && params) {
      requirePermission(actor, 'edit-own-incident', permissions);
      await bodyJson(request);
      const current = findIncident(store.snapshot(), params.id);
      ensureIncidentOwner(actor, current);
      if (!current.aiError) throw httpError(409, 'La segnalazione non richiede un nuovo tentativo di analisi', 'state-conflict');
      const envelope = await analyzeOne(params.id, actor, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }

    params = routeMatch(pathname, '/api/incidents/:id/answers');
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
      if (questions.length) throw httpError(409, 'Rispondi alle domande motivate prima di generare la formulazione', 'questions-open', { missing: questions.map(item => item.id) });
      const ai = await draftIncident(before.settings, incident, questions);
      const envelope = await store.mutate(actor, 'incident.draft.generated', { type: 'incident', id: params.id }, { trace: ai.trace }, draft => {
        const current = findIncident(draft, params.id);
        ensureIncidentOwner(actor, current);
        const narrative = asString(ai.output.narrative, 50_000);
        const version = formulationRecord(narrative, 'ai-draft', actor, ai.trace);
        current.draft = ai.output;
        current.draftTrace = ai.trace;
        current.finalNarrative = narrative;
        current.formulationVersions = [...(current.formulationVersions || []), version];
        current.formulationDirty = false;
        current.state = 'review';
        current.updatedAt = now();
        return incidentProjection(current);
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }

    params = routeMatch(pathname, '/api/incidents/:id/formulation');
    if ((method === 'POST' || method === 'PUT') && params) {
      requirePermission(actor, 'edit-own-incident', permissions);
      const input = await bodyJson(request);
      const envelope = await store.mutate(actor, 'incident.formulation.saved', { type: 'incident', id: params.id }, input, draft => {
        const incident = findIncident(draft, params.id);
        ensureIncidentOwner(actor, incident);
        if (!['clarifying', 'review'].includes(incident.state)) throw httpError(409, 'Formulazione non modificabile', 'state-conflict');
        const questions = deriveQuestions(incident);
        if (questions.length) throw httpError(409, 'Completa prima le domande motivate', 'questions-open', { missing: questions.map(item => item.id) });
        const narrative = asString(input.finalNarrative, 50_000);
        if (!narrative) throw httpError(400, 'Scrivi la formulazione da salvare', 'formulation-required');
        const version = formulationRecord(narrative, asString(input.source, 80) || 'human-version', actor);
        incident.finalNarrative = narrative;
        incident.formulationVersions = [...(incident.formulationVersions || []), version].slice(-100);
        incident.formulationDirty = false;
        incident.state = 'review';
        incident.updatedAt = now();
        return incidentProjection(incident);
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }

    params = routeMatch(pathname, '/api/incidents/:id/submit');
    if (method === 'POST' && params) {
      requirePermission(actor, 'submit-own-incident', permissions);
      const input = await bodyJson(request);
      if (input.confirmed !== true) throw httpError(400, 'Conferma esplicita richiesta', 'confirmation-required');
      const formulationSha256 = asString(input.formulationSha256, 64).toLowerCase();
      if (!/^[a-f0-9]{64}$/.test(formulationSha256)) throw httpError(400, 'Conferma il digest della versione corrente', 'formulation-digest-required');
      const envelope = await store.mutate(actor, 'incident.submitted', { type: 'incident', id: params.id }, { ...input, formulationSha256 }, draft => {
        const incident = findIncident(draft, params.id);
        ensureIncidentOwner(actor, incident);
        const current = currentFormulation(incident);
        const readiness = submissionReadiness(incident);
        if (!readiness.ready) throw httpError(409, 'Completa e salva la formulazione prima dell’invio', 'incident-not-ready', readiness);
        if (formulationSha256 !== current.sha256) throw httpError(409, 'La formulazione è cambiata. Rileggi e conferma la versione corrente.', 'formulation-conflict');
        incident.finalNarrative = current.narrative;
        incident.state = 'submitted';
        incident.submittedAt = now();
        incident.submissionConfirmation = { by: actor.id, at: now(), formulationSha256: current.sha256 };
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
      const note = asString(input.note, 10_000);
      if (!note) throw httpError(400, 'Inserisci una motivazione di chiusura', 'closure-note-required');
      const envelope = await store.mutate(actor, 'incident.closed', { type: 'incident', id: params.id }, { note }, draft => {
        const incident = findIncident(draft, params.id);
        if (incident.state !== 'submitted') throw httpError(409, 'È possibile chiudere soltanto una segnalazione inviata', 'state-conflict');
        incident.state = 'closed';
        incident.closedAt = now();
        incident.closureNote = note;
        incident.closedBy = actor.id;
        incident.updatedAt = now();
        return incidentProjection(incident);
      }, commandFrom(request));
      json(response, 200, envelope);
      return true;
    }
    return false;
  };
}
