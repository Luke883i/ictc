import { createMonitoringPlan, discoverCompliance, enrichContribution } from '../ai.mjs';
import { asString, id, normalizeUrl, now, sha256, uniqueStrings } from '../domain.mjs';
import {
  applicationGuide, detectSemanticLabels, itemMatchesJob, nextJobRunAt, normalizeJobConfig,
  semanticGraph, workbenchMetrics
} from '../semantic.mjs';
import { bodyJson, commandFrom, httpError, json, requirePermission, routeMatch } from './http.mjs';

const OFFICIAL_HOST_SUFFIXES = Object.freeze([
  'gov.it', 'garanteprivacy.it', 'acn.gov.it', 'agid.gov.it', 'eur-lex.europa.eu', 'europa.eu',
  'edpb.europa.eu', 'enisa.europa.eu', 'gazzettaufficiale.it', 'parlamento.it', 'senato.it', 'camera.it'
]);

function enterpriseArrays(state) {
  state.monitoringJobs ||= [];
  state.jobProposals ||= [];
  state.jobRuns ||= [];
  state.contributions ||= [];
  state.catalog ||= [];
  return state;
}

function visibleProposals(state, actor) {
  const proposals = state.jobProposals || [];
  return actor.role === 'admin' ? proposals : proposals.filter(item => item.createdBy === actor.id);
}

function visibleContributions(state, actor) {
  const contributions = state.contributions || [];
  return actor.role === 'admin' ? contributions : contributions.filter(item => item.createdBy === actor.id);
}

function observableOfficialReference(item) {
  const url = normalizeUrl(item.sourceUrl);
  let hostname = '';
  try { hostname = url ? new URL(url).hostname.toLowerCase() : ''; } catch {}
  const hostMatch = hostname && OFFICIAL_HOST_SUFFIXES.some(suffix => hostname === suffix || hostname.endsWith(`.${suffix}`));
  const semanticAuthorities = new Set(item.semantic?.labels?.authorities || []);
  const authorityMatch = [...semanticAuthorities].some(value => !['UNKNOWN_AUTHORITY', 'OTHER_AUTHORITY'].includes(value));
  return {
    observed: Boolean(hostMatch || (item.identifier && authorityMatch)),
    evidence: hostMatch ? `hostname:${hostname}` : item.identifier && authorityMatch ? `identifier:${item.identifier}` : 'nessun riferimento ufficiale osservabile',
    limitation: 'Il runtime verifica hostname, identificativo e autorità osservati; non certifica autenticità, vigenza o applicabilità.'
  };
}

function catalogKey(item) {
  return normalizeUrl(item.sourceUrl) || asString(item.identifier, 500).toLowerCase() || asString(item.title, 500).toLowerCase();
}

function sourceSignature(item) {
  return sha256({
    title: item.title, documentType: item.documentType, authority: item.authority, jurisdiction: item.jurisdiction,
    identifier: item.identifier, sourceUrl: item.sourceUrl, publicationDate: item.publicationDate,
    effectiveDate: item.effectiveDate, summary: item.summary, relevance: item.relevance, semantic: item.semantic?.labels
  });
}

function normalizeCatalogItem(raw, origin, trace) {
  const title = asString(raw?.title, 1000) || 'Fonte senza titolo verificato';
  const sourceUrl = normalizeUrl(raw?.sourceUrl);
  const item = {
    id: id('source'), title,
    documentType: asString(raw?.documentType, 100) || 'other',
    authority: asString(raw?.authority, 500), jurisdiction: asString(raw?.jurisdiction, 300),
    identifier: asString(raw?.identifier, 500), sourceUrl,
    publicationDate: asString(raw?.publicationDate, 80), effectiveDate: asString(raw?.effectiveDate, 80),
    summary: asString(raw?.summary, 10000), relevance: asString(raw?.relevance, 10000),
    confidence: Math.max(0, Math.min(1, Number(raw?.confidence || 0))),
    state: 'candidate', createdAt: now(), updatedAt: now(), origin, observations: [], decisions: [], aiTrace: trace || null
  };
  item.semantic = detectSemanticLabels({ ...item, rawSemanticHints: raw?.semantic || null });
  item.officialReference = observableOfficialReference(item);
  item.signature = sourceSignature(item);
  item.observations.push({ observedAt: origin.observedAt, origin, signature: item.signature, aiTrace: trace || null });
  return item;
}

function jobSnapshot(job) {
  return {
    id: job.id, title: job.title, description: job.description, objective: job.objective,
    schedule: job.schedule, mining: job.mining, filters: job.filters, state: job.state,
    plan: job.plan || null, planVersion: job.planVersion || 0, nextRunAt: job.nextRunAt || null,
    lastRunAt: job.lastRunAt || null, lastError: job.lastError || null,
    createdAt: job.createdAt, createdBy: job.createdBy, updatedAt: job.updatedAt, updatedBy: job.updatedBy
  };
}

function findJob(state, jobId) {
  const job = (state.monitoringJobs || []).find(item => item.id === jobId);
  if (!job) throw httpError(404, 'Job di monitoraggio non trovato', 'not-found');
  return job;
}

function findProposal(state, proposalId) {
  const proposal = (state.jobProposals || []).find(item => item.id === proposalId);
  if (!proposal) throw httpError(404, 'Proposta di job non trovata', 'not-found');
  return proposal;
}

function derivedCommand(command, suffix) {
  return command.id ? { ...command, id: `${command.id}-${suffix}`, expectedRevision: null } : {};
}

export function createWorkbenchRuntime({ store, permissions, runningJobs = new Set() }) {
  async function planJob(jobId, actor, command = {}) {
    const state = store.snapshot();
    const job = findJob(state, jobId);
    const ai = await createMonitoringPlan(state.settings, { ...job, cadenceHours: job.schedule.cadenceHours, sourceHints: job.filters.sourceHints });
    return store.mutate(actor, 'workbench.job.planned', { type: 'monitoring-job', id: jobId }, { trace: ai.trace }, draft => {
      enterpriseArrays(draft);
      const current = findJob(draft, jobId);
      current.planHistory ||= [];
      if (current.plan) current.planHistory.push({ version: current.planVersion, plan: current.plan, trace: current.planTrace, archivedAt: now(), archivedBy: actor.id });
      current.plan = ai.output;
      current.planTrace = ai.trace;
      current.planVersion = Number(current.planVersion || 0) + 1;
      current.state = current.state === 'paused' ? 'paused' : 'draft';
      current.planError = null;
      current.updatedAt = now(); current.updatedBy = actor.id;
      return jobSnapshot(current);
    }, command);
  }

  async function deferPlan(jobId, actor, error, command = {}) {
    return store.mutate(actor, 'workbench.job.plan.deferred', { type: 'monitoring-job', id: jobId }, { error: error.message }, draft => {
      const current = findJob(enterpriseArrays(draft), jobId);
      current.state = 'needs-plan'; current.planError = error.message; current.updatedAt = now(); current.updatedBy = actor.id;
      return jobSnapshot(current);
    }, command);
  }

  async function createJob(input, actor, command = {}, sourceProposalId = null) {
    const config = normalizeJobConfig(input);
    if (!config.objective) throw httpError(400, 'Descrivi ciò che il job deve sorvegliare', 'objective-required');
    if (!config.title) config.title = config.objective.slice(0, 90);
    const jobId = id('job');
    const raw = await store.mutate(actor, 'workbench.job.intent.recorded', { type: 'monitoring-job', id: jobId }, { config, sourceProposalId }, draft => {
      enterpriseArrays(draft);
      const job = {
        id: jobId, ...config, state: 'planning', plan: null, planTrace: null, planHistory: [], planVersion: 0,
        planError: null, createdAt: now(), createdBy: actor.id, updatedAt: now(), updatedBy: actor.id,
        activatedAt: null, pausedAt: null, pauseReason: null, nextRunAt: null, lastRunAt: null, lastError: null,
        sourceProposalId
      };
      draft.monitoringJobs.push(job);
      if (sourceProposalId) {
        const proposal = findProposal(draft, sourceProposalId);
        proposal.status = 'adopted'; proposal.adoptedAt = now(); proposal.adoptedBy = actor.id; proposal.jobId = jobId;
      }
      return jobSnapshot(job);
    }, command);
    let planning = null; let warning = null;
    try { planning = await planJob(jobId, actor, derivedCommand(command, 'plan')); }
    catch (error) { warning = error.message; await deferPlan(jobId, actor, error, derivedCommand(command, 'deferred')); }
    return { raw, planning, warning, job: jobSnapshot(findJob(store.snapshot(), jobId)) };
  }

  async function runJob(jobId, actor, command = {}) {
    if (runningJobs.has(jobId)) throw httpError(409, 'Job già in esecuzione', 'already-running');
    runningJobs.add(jobId);
    try {
      const state = store.snapshot();
      const job = findJob(state, jobId);
      if (job.state !== 'active') throw httpError(409, 'Attiva prima il job', 'job-not-active');
      if (!job.plan) throw httpError(409, 'Il piano AI non è disponibile', 'job-plan-missing');
      const runId = id('jobrun'); const startedAt = now();
      let discovery;
      try {
        discovery = await discoverCompliance(state.settings, {
          ...job, cadenceHours: job.schedule.cadenceHours, sourceHints: job.filters.sourceHints
        }, job.plan, {
          previousIdentifiers: (state.catalog || []).map(item => item.identifier).filter(Boolean),
          miningPolicy: job.mining, semanticLabels: job.filters.include, languages: job.mining.languages
        });
      } catch (error) {
        await store.mutate(actor, 'workbench.job.run.failed', { type: 'monitoring-job-run', id: runId }, { jobId, error: error.message }, draft => {
          enterpriseArrays(draft); const current = findJob(draft, jobId);
          current.lastError = error.message; current.lastRunAt = startedAt; current.nextRunAt = nextJobRunAt(startedAt, current);
          const run = { id: runId, jobId, state: 'failed', startedAt, completedAt: now(), error: error.message, discovered: 0, inserted: 0, updated: 0, unchanged: 0, filtered: 0 };
          draft.jobRuns.push(run); return run;
        }, command);
        throw error;
      }
      const candidates = Array.isArray(discovery.output?.items) ? discovery.output.items.slice(0, 200) : [];
      return store.mutate(actor, 'workbench.job.run.completed', { type: 'monitoring-job-run', id: runId }, { jobId, trace: discovery.trace }, draft => {
        enterpriseArrays(draft); const current = findJob(draft, jobId);
        let inserted = 0, updated = 0, unchanged = 0, filtered = 0, eligible = 0;
        for (const rawItem of candidates) {
          if (eligible >= current.mining.maxItems) { filtered += 1; continue; }
          const normalized = normalizeCatalogItem(rawItem, { kind: 'monitoring-job', jobId, runId, observedAt: now() }, discovery.trace);
          if (!itemMatchesJob(normalized, current)) { filtered += 1; continue; }
          if (current.mining.officialOnly && !normalized.officialReference.observed) { filtered += 1; continue; }
          const key = catalogKey(normalized);
          const existing = draft.catalog.find(item => catalogKey(item) === key && key);
          const mode = current.mining.mode;
          if (!existing && mode === 'changes-only') { filtered += 1; continue; }
          if (existing) {
            const changed = existing.signature !== normalized.signature;
            if (mode === 'new-only' || (!changed && mode !== 'all-observed') || (!current.mining.detectChanges && mode !== 'all-observed')) { unchanged += 1; continue; }
            existing.observations ||= [];
            existing.observations.push(...normalized.observations);
            if (changed) {
              for (const keyName of ['title', 'documentType', 'authority', 'jurisdiction', 'identifier', 'sourceUrl', 'publicationDate', 'effectiveDate', 'summary', 'relevance', 'confidence', 'semantic', 'officialReference', 'signature', 'aiTrace']) existing[keyName] = normalized[keyName];
              existing.updatedAt = now(); updated += 1;
            } else unchanged += 1;
          } else {
            draft.catalog.push(normalized); inserted += 1;
          }
          eligible += 1;
        }
        const completedAt = now();
        const run = { id: runId, jobId, state: 'completed', startedAt, completedAt, discovered: candidates.length, eligible, inserted, updated, unchanged, filtered, miningMode: current.mining.mode, aiTrace: discovery.trace };
        draft.jobRuns.push(run);
        current.lastRunAt = completedAt; current.lastError = null; current.nextRunAt = nextJobRunAt(completedAt, current); current.updatedAt = completedAt;
        return run;
      }, command);
    } finally { runningJobs.delete(jobId); }
  }

  async function tick(actor = { id: 'scheduler', role: 'admin', identityMode: 'system', permissions: [...permissions.admin] }) {
    const due = (store.snapshot().monitoringJobs || []).filter(item => item.state === 'active' && item.nextRunAt && new Date(item.nextRunAt) <= new Date());
    for (const job of due) {
      try { await runJob(job.id, actor, { id: `scheduler-job-${job.id}-${job.nextRunAt}` }); }
      catch (error) { console.error('workbench scheduler', job.id, error.message); }
    }
  }

  async function handle(request, response, pathname, actor) {
    const method = request.method || 'GET';
    if (method === 'GET' && pathname === '/api/workbench/meta') {
      requirePermission(actor, 'read', permissions); json(response, 200, applicationGuide()); return true;
    }
    if (method === 'GET' && pathname === '/api/workbench/graph') {
      requirePermission(actor, 'read', permissions); json(response, 200, semanticGraph(store.snapshot(), actor)); return true;
    }
    if (method === 'GET' && pathname === '/api/workbench/metrics') {
      requirePermission(actor, 'read', permissions); json(response, 200, workbenchMetrics(store.snapshot(), actor)); return true;
    }
    if (method === 'GET' && pathname === '/api/workbench/jobs') {
      requirePermission(actor, 'read', permissions); json(response, 200, { jobs: (store.snapshot().monitoringJobs || []).map(jobSnapshot) }); return true;
    }
    if (method === 'GET' && pathname === '/api/workbench/proposals') {
      requirePermission(actor, 'read', permissions); json(response, 200, { proposals: visibleProposals(store.snapshot(), actor) }); return true;
    }
    if (method === 'GET' && pathname === '/api/workbench/intake') {
      requirePermission(actor, 'read', permissions); json(response, 200, { items: visibleContributions(store.snapshot(), actor) }); return true;
    }
    if (method === 'POST' && pathname === '/api/workbench/proposals') {
      requirePermission(actor, 'read', permissions); const input = await bodyJson(request); const config = normalizeJobConfig(input);
      if (!config.objective) throw httpError(400, 'Descrivi ciò che dovrebbe essere monitorato', 'objective-required');
      const proposalId = id('jobproposal');
      const envelope = await store.mutate(actor, 'workbench.job.proposed', { type: 'job-proposal', id: proposalId }, config, draft => {
        enterpriseArrays(draft); const proposal = { id: proposalId, ...config, title: config.title || config.objective.slice(0, 90), status: 'proposed', createdAt: now(), createdBy: actor.id, updatedAt: now() };
        draft.jobProposals.push(proposal); return proposal;
      }, commandFrom(request));
      json(response, 201, envelope); return true;
    }
    if (method === 'POST' && pathname === '/api/workbench/jobs') {
      requirePermission(actor, 'manage-monitoring', permissions); const result = await createJob(await bodyJson(request), actor, commandFrom(request)); json(response, 201, result); return true;
    }
    let params = routeMatch(pathname, '/api/workbench/proposals/:id/adopt');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions); const proposal = findProposal(store.snapshot(), params.id);
      if (proposal.status !== 'proposed') throw httpError(409, 'La proposta non è più adottabile', 'state-conflict');
      const result = await createJob(proposal, actor, commandFrom(request), proposal.id); json(response, 201, result); return true;
    }
    params = routeMatch(pathname, '/api/workbench/jobs/:id/plan');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions); await bodyJson(request); const envelope = await planJob(params.id, actor, commandFrom(request)); json(response, 200, envelope); return true;
    }
    params = routeMatch(pathname, '/api/workbench/jobs/:id/activate');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions); const input = await bodyJson(request);
      const envelope = await store.mutate(actor, 'workbench.job.activated', { type: 'monitoring-job', id: params.id }, input, draft => {
        const job = findJob(enterpriseArrays(draft), params.id); if (!job.plan) throw httpError(409, 'Verifica prima il piano AI', 'job-plan-missing');
        job.state = 'active'; job.activatedAt = now(); job.pausedAt = null; job.pauseReason = null; job.nextRunAt = nextJobRunAt(now(), job, true); job.updatedAt = now(); job.updatedBy = actor.id; return jobSnapshot(job);
      }, commandFrom(request)); json(response, 200, envelope); return true;
    }
    params = routeMatch(pathname, '/api/workbench/jobs/:id/pause');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions); const input = await bodyJson(request); const reason = asString(input.reason, 5000);
      if (!reason) throw httpError(400, 'Motiva la sospensione', 'reason-required');
      const envelope = await store.mutate(actor, 'workbench.job.paused', { type: 'monitoring-job', id: params.id }, { reason }, draft => {
        const job = findJob(enterpriseArrays(draft), params.id); if (job.state !== 'active') throw httpError(409, 'Puoi sospendere solo un job attivo', 'state-conflict');
        job.state = 'paused'; job.pausedAt = now(); job.pauseReason = reason; job.nextRunAt = null; job.updatedAt = now(); job.updatedBy = actor.id; return jobSnapshot(job);
      }, commandFrom(request)); json(response, 200, envelope); return true;
    }
    params = routeMatch(pathname, '/api/workbench/jobs/:id/run');
    if (method === 'POST' && params) {
      requirePermission(actor, 'manage-monitoring', permissions); await bodyJson(request); const envelope = await runJob(params.id, actor, commandFrom(request)); json(response, 200, envelope); return true;
    }
    if (method === 'POST' && pathname === '/api/workbench/intake') {
      requirePermission(actor, 'contribute-source', permissions); const input = await bodyJson(request);
      const links = uniqueStrings(input.links, 100, 4000).map(normalizeUrl).filter(Boolean);
      const text = asString(input.text, 50000); const note = asString(input.note, 5000); const title = asString(input.title, 300);
      const kind = ['knowledge', 'source', 'evidence', 'incident-context'].includes(input.kind) ? input.kind : 'knowledge';
      const attachments = await store.saveAttachments(input.attachments || []);
      if (!links.length && !text && !attachments.length) { await store.deleteAttachments(attachments); throw httpError(400, 'Aggiungi almeno un link, un testo o un documento', 'material-required'); }
      const contributionId = id('contribution'); const semantic = detectSemanticLabels({ title, kind, links, text, note, attachmentNames: attachments.map(item => item.name) });
      let raw;
      try {
        raw = await store.mutate(actor, 'workbench.intake.recorded', { type: 'contribution', id: contributionId }, { title, kind, links, text, note, semantic, attachmentDigests: attachments.map(item => item.sha256) }, draft => {
          enterpriseArrays(draft); const item = { id: contributionId, title, kind, context: { service: asString(input.context?.service, 40) || 'shared', subjectId: asString(input.context?.subjectId, 200), note: asString(input.context?.note, 2000) }, links, text, note, attachments, semantic, state: 'recorded', createdAt: now(), createdBy: actor.id, enrichedAt: null, aiTrace: null, aiSuggestions: null, aiError: null };
          draft.contributions.push(item); return item;
        }, commandFrom(request));
        if (raw.replayed) await store.deleteAttachments(attachments);
      } catch (error) { await store.deleteAttachments(attachments); throw error; }
      let enrichment = null; let warning = null;
      try {
        const ai = await enrichContribution(store.snapshot().settings, raw.result);
        enrichment = await store.mutate(actor, 'workbench.intake.enriched', { type: 'contribution', id: contributionId }, { trace: ai.trace }, draft => {
          const item = (enterpriseArrays(draft).contributions || []).find(entry => entry.id === contributionId); if (!item) throw httpError(404, 'Contributo non trovato', 'not-found');
          item.state = 'enriched'; item.enrichedAt = now(); item.aiTrace = ai.trace; item.aiSuggestions = ai.output; item.aiError = null; return item;
        }, derivedCommand(commandFrom(request), 'enrich'));
      } catch (error) {
        warning = error.message;
        await store.mutate(actor, 'workbench.intake.enrichment.deferred', { type: 'contribution', id: contributionId }, { error: error.message }, draft => {
          const item = enterpriseArrays(draft).contributions.find(entry => entry.id === contributionId); item.state = 'needs-enrichment'; item.aiError = error.message; return item;
        }, derivedCommand(commandFrom(request), 'deferred'));
      }
      json(response, raw.replayed ? 200 : 201, { raw, enrichment, warning, semantic }); return true;
    }
    return false;
  }

  return { handle, tick, runJob, createJob };
}
