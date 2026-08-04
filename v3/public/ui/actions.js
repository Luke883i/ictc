import {
  $, $$, api, closeDialog, downloadProtected, filesPayload, localDateTimeValue, notify, openDialog,
  showReceipt, splitList, state, storageSet
} from './common.js';
import { refresh } from './controller.js';
import { renderCatalog, renderNavigation } from './render.js';
import { populateSettings, renderIncidentWorkspace, renderPlanDialog, renderSourceDialog } from './workspaces.js';

async function run(action, success, { refreshState = true } = {}) {
  try {
    const result = await action();
    showReceipt(result);
    if (refreshState) await refresh();
    if (success) notify(success);
    return result;
  } catch (error) {
    if (error.code === 'revision-conflict') await refresh().catch(() => {});
    notify(error.message, true);
    return null;
  }
}

export function installBindings() {
  $$('[data-service]').forEach(button => button.addEventListener('click', () => {
    state.service = button.dataset.service;
    storageSet('ictc-service', state.service);
    renderNavigation();
    $('#main').focus();
  }));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.dataset.close)));
  $('#dismissProof').addEventListener('click', () => { $('#proofPulse').hidden = true; });
  $('#roleSelect').addEventListener('change', async event => {
    state.role = event.target.value;
    storageSet('ictc-role', state.role);
    for (const id of ['planDialog','sourceDialog','incidentWorkspace','settingsDialog','contributionDialog','incidentDialog']) closeDialog(id);
    state.activeMissionId = state.activeSourceId = state.activeIncidentId = null;
    await refresh({keepDialog:false});
  });
  $('#openSettings').addEventListener('click', () => { populateSettings(); openDialog('settingsDialog'); });
  $('#setupNow').addEventListener('click', () => { populateSettings(); openDialog('settingsDialog'); });
  $('#openContribution').addEventListener('click', () => { $('#contributionForm').reset(); openDialog('contributionDialog'); });
  $('#openIncident').addEventListener('click', () => { $('#incidentForm').reset(); $('#incidentForm').elements.awarenessAt.value = localDateTimeValue(); openDialog('incidentDialog'); });
  $('#catalogSearch').addEventListener('input', renderCatalog);
  $('#catalogState').addEventListener('change', renderCatalog);

  $('#settingsForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await run(() => api('/api/admin/settings',{method:'PUT',body:JSON.stringify({organization:{name:form.get('organizationName'),scope:form.get('organizationScope'),jurisdictions:splitList(form.get('jurisdictions'))},llm:{endpoint:form.get('endpoint'),model:form.get('model'),apiKeyEnv:form.get('apiKeyEnv'),temperature:Number(form.get('temperature'))},prompts:Object.fromEntries(['monitoringPlan','complianceDiscovery','contributionEnrichment','incidentAnalysis','incidentDraft'].map(key=>[key,form.get(key)]))})}), 'Configurazione globale registrata');
    if (result) closeDialog('settingsDialog');
  });

  $('#missionForm').addEventListener('submit', async event => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const button = formElement.querySelector('button[type="submit"]');
    button.disabled = true;
    const result = await run(() => api('/api/missions/draft',{method:'POST',body:JSON.stringify({objective:form.get('objective'),cadence:Number(form.get('cadence')),sourceHints:splitList(form.get('sourceHints')),promptOverride:form.get('promptOverride')})}), null);
    button.disabled = false;
    if (!result) return;
    state.activeMissionId = result.mission.id;
    renderPlanDialog();
    openDialog('planDialog');
    formElement.reset();
    notify(result.warning ? `Obiettivo preservato; piano AI da riprovare: ${result.warning}` : 'Piano AI pronto per la verifica');
  });

  $('#contributionForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const button = event.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;
    let attachments; try { attachments = await filesPayload(event.currentTarget.elements.files); } catch (error) { button.disabled = false; notify(error.message, true); return; }
    const result = await run(() => api('/api/contributions',{method:'POST',body:JSON.stringify({links:splitList(form.get('links')),text:form.get('text'),note:form.get('note'),attachments})}), null);
    button.disabled = false;
    if (!result) return;
    closeDialog('contributionDialog');
    notify(result.warning ? `Materiale preservato; analisi AI da riprovare: ${result.warning}` : 'Materiale preservato e classificato');
  });

  $('#incidentForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const button = event.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;
    let attachments; try { attachments = await filesPayload(event.currentTarget.elements.files); } catch (error) { button.disabled = false; notify(error.message, true); return; }
    const result = await run(() => api('/api/incidents/intake',{method:'POST',body:JSON.stringify({originalNarrative:form.get('originalNarrative'),awarenessAt:new Date(form.get('awarenessAt')).toISOString(),attachments})}), null);
    button.disabled = false;
    if (!result) return;
    closeDialog('incidentDialog');
    state.activeIncidentId = result.incident.id;
    renderIncidentWorkspace();
    openDialog('incidentWorkspace');
    notify(result.warning ? `Racconto preservato; analisi AI da riprovare: ${result.warning}` : 'Racconto preservato e analizzato');
  });

  document.addEventListener('click', async event => {
    const evidence = event.target.closest('[data-download-evidence]');
    if (evidence) {
      try { await downloadProtected(evidence.dataset.downloadEvidence); notify('Fascicolo scaricato'); }
      catch (error) { notify(error.message, true); }
      return;
    }
    const contribOpen = event.target.closest('[data-open-contribution]');
    if (contribOpen) { $('#contributionForm').reset(); openDialog('contributionDialog'); return; }
    const plan = event.target.closest('[data-open-plan]');
    if (plan) { state.activeMissionId = plan.dataset.openPlan; renderPlanDialog(); openDialog('planDialog'); return; }
    const activate = event.target.closest('[data-activate-mission]');
    if (activate) { await run(() => api(`/api/missions/${activate.dataset.activateMission}/activate`,{method:'POST',body:'{}'}), 'Monitoraggio attivato'); renderPlanDialog(); return; }
    const revise = event.target.closest('[data-revise-mission]');
    if (revise) {
      const result = await run(() => api(`/api/missions/${revise.dataset.reviseMission}/revise`,{method:'POST',body:JSON.stringify({objective:$('#missionObjective')?.value,sourceHints:splitList($('#missionHints')?.value),promptOverride:$('#missionPrompt')?.value})}), null);
      if (result) { renderPlanDialog(); notify(result.warning ? `Revisione preservata; piano AI da riprovare: ${result.warning}` : 'Piano rigenerato e versione precedente conservata'); }
      return;
    }
    const pause = event.target.closest('[data-pause-mission]');
    if (pause) {
      const reason = $('#pauseReason')?.value.trim();
      if (!reason) return notify('Indica il motivo della sospensione', true);
      await run(() => api(`/api/missions/${pause.dataset.pauseMission}/pause`,{method:'POST',body:JSON.stringify({reason})}), 'Monitoraggio sospeso');
      return;
    }
    const resume = event.target.closest('[data-resume-mission]');
    if (resume) { await run(() => api(`/api/missions/${resume.dataset.resumeMission}/resume`,{method:'POST',body:'{}'}), 'Monitoraggio ripreso'); return; }
    const runMission = event.target.closest('[data-run-mission]');
    if (runMission) { await run(() => api(`/api/missions/${runMission.dataset.runMission}/run`,{method:'POST',body:'{}'}), 'Run completato'); return; }
    const retryContribution = event.target.closest('[data-retry-contribution]');
    if (retryContribution) { await run(() => api(`/api/contributions/${retryContribution.dataset.retryContribution}/enrich`,{method:'POST',body:'{}'}), 'Contributo arricchito'); return; }
    const source = event.target.closest('[data-open-source]');
    if (source) { state.activeSourceId = source.dataset.openSource; renderSourceDialog(); openDialog('sourceDialog'); return; }
    const decision = event.target.closest('[data-source-decision]');
    if (decision) {
      const reason = $('#sourceDecisionReason')?.value.trim();
      if (!reason) return notify('Motiva la decisione sulla fonte', true);
      const result = await run(() => api(`/api/catalog/${state.activeSourceId}/decision`,{method:'POST',body:JSON.stringify({decision:decision.dataset.sourceDecision,reason})}), 'Decisione sulla fonte registrata');
      if (result) renderSourceDialog();
      return;
    }
    const openIncident = event.target.closest('[data-open-incident]');
    if (openIncident) { state.activeIncidentId = openIncident.dataset.openIncident; renderIncidentWorkspace(); openDialog('incidentWorkspace'); return; }
    const retryIncident = event.target.closest('[data-retry-incident]');
    if (retryIncident) { await run(() => api(`/api/incidents/${retryIncident.dataset.retryIncident}/analyze`,{method:'POST',body:'{}'}), 'Analisi AI completata'); return; }
    const answer = event.target.closest('[data-answer-question]');
    if (answer) {
      const value = $('#questionValue')?.value || '';
      if (!value.trim()) return notify('Inserisci una risposta oppure scegli Non disponibile', true);
      await run(() => api(`/api/incidents/${state.activeIncidentId}/answers`,{method:'POST',body:JSON.stringify({answers:[{id:answer.dataset.answerQuestion,value}]})}), 'Risposta e provenienza registrate');
      return;
    }
    const unknown = event.target.closest('[data-answer-unknown]');
    if (unknown) { await run(() => api(`/api/incidents/${state.activeIncidentId}/answers`,{method:'POST',body:JSON.stringify({answers:[{id:unknown.dataset.answerUnknown,unknown:true}]})}), 'Dato registrato come non disponibile'); return; }
    const generate = event.target.closest('[data-generate-draft]');
    if (generate) { await run(() => api(`/api/incidents/${generate.dataset.generateDraft}/draft`,{method:'POST',body:'{}'}), 'Bozza AI salvata come versione'); return; }
    const saveManual = event.target.closest('[data-save-manual]');
    if (saveManual) {
      const finalNarrative = $('#manualNarrative')?.value.trim();
      if (!finalNarrative) return notify('Scrivi la formulazione finale', true);
      await run(() => api(`/api/incidents/${saveManual.dataset.saveManual}/formulation`,{method:'POST',body:JSON.stringify({finalNarrative,source:'human-manual'})}), 'Versione manuale salvata');
      return;
    }
    const saveFormulation = event.target.closest('[data-save-formulation]');
    if (saveFormulation) {
      const finalNarrative = $('#finalNarrative')?.value.trim();
      if (!finalNarrative) return notify('Scrivi la formulazione finale', true);
      await run(() => api(`/api/incidents/${saveFormulation.dataset.saveFormulation}/formulation`,{method:'POST',body:JSON.stringify({finalNarrative,source:'human-review'})}), 'Nuova versione salvata');
      return;
    }
    const submit = event.target.closest('[data-submit-incident]');
    if (submit) {
      if (!$('#confirmIncident')?.checked) return notify('Conferma di aver verificato la versione corrente', true);
      await run(() => api(`/api/incidents/${submit.dataset.submitIncident}/submit`,{method:'POST',body:JSON.stringify({confirmed:true,formulationSha256:submit.dataset.formulationSha})}), 'Segnalazione inviata');
      return;
    }
    const close = event.target.closest('[data-close-incident]');
    if (close) {
      const note = $('#closureNote')?.value.trim();
      if (!note) return notify('Indica il motivo della chiusura', true);
      await run(() => api(`/api/incidents/${close.dataset.closeIncident}/close`,{method:'POST',body:JSON.stringify({note})}), 'Fascicolo chiuso');
    }
  });
}
