import {
  $, $$, api, closeDialog, filesPayload, localDateTimeValue, notify, openDialog,
  showReceipt, splitList, state, storageSet
} from './common.js';
import { refresh } from './controller.js';
import { renderCatalog, renderNavigation } from './render.js';
import { populateSettings, renderIncidentWorkspace, renderPlanDialog, renderSourceDialog } from './workspaces.js';

export function installBindings() {
$$('[data-service]').forEach(button => button.addEventListener('click', () => { state.service = button.dataset.service; storageSet('ictc-service', state.service); renderNavigation(); $('#main').focus(); }));
$$('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.dataset.close)));
$('#dismissProof').addEventListener('click', () => { $('#proofPulse').hidden = true; });
$('#roleSelect').addEventListener('change', async event => { state.role = event.target.value; storageSet('ictc-role', state.role); await refresh({keepDialog:false}); });
$('#openSettings').addEventListener('click', () => { populateSettings(); openDialog('settingsDialog'); });
$('#setupNow').addEventListener('click', () => { populateSettings(); openDialog('settingsDialog'); });
$('#openContribution').addEventListener('click', () => { $('#contributionForm').reset(); openDialog('contributionDialog'); });
$('#openIncident').addEventListener('click', () => { $('#incidentForm').reset(); $('#incidentForm').elements.awarenessAt.value = localDateTimeValue(); openDialog('incidentDialog'); });
$('#catalogSearch').addEventListener('input', renderCatalog); $('#catalogState').addEventListener('change', renderCatalog);

$('#settingsForm').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  try {
    const result = await api('/api/admin/settings',{method:'PUT',body:JSON.stringify({organization:{name:form.get('organizationName'),scope:form.get('organizationScope'),jurisdictions:splitList(form.get('jurisdictions'))},llm:{endpoint:form.get('endpoint'),model:form.get('model'),apiKeyEnv:form.get('apiKeyEnv'),temperature:Number(form.get('temperature'))},prompts:Object.fromEntries(['monitoringPlan','complianceDiscovery','contributionEnrichment','incidentAnalysis','incidentDraft'].map(key=>[key,form.get(key)]))})});
    showReceipt(result); closeDialog('settingsDialog'); await refresh(); notify('Configurazione globale registrata');
  } catch(error) { notify(error.message,true); }
});
$('#missionForm').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget); const button = event.currentTarget.querySelector('button[type="submit"]'); button.disabled = true;
  try {
    const result = await api('/api/missions/draft',{method:'POST',body:JSON.stringify({objective:form.get('objective'),cadence:Number(form.get('cadence')),sourceHints:splitList(form.get('sourceHints'))})});
    showReceipt(result); await refresh(); state.activeMissionId = result.result.id; renderPlanDialog(); openDialog('planDialog'); event.currentTarget.reset(); notify('Piano AI pronto per la verifica');
  } catch(error) { notify(error.message,true); } finally { button.disabled = false; }
});
$('#contributionForm').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget); const button = event.currentTarget.querySelector('button[type="submit"]'); button.disabled = true;
  try {
    const result = await api('/api/contributions',{method:'POST',body:JSON.stringify({links:splitList(form.get('links')),text:form.get('text'),note:form.get('note'),attachments:await filesPayload(event.currentTarget.elements.files)})});
    showReceipt(result); closeDialog('contributionDialog'); await refresh(); notify(result.warning ? `Materiale preservato; analisi rinviata: ${result.warning}` : 'Materiale preservato e classificato');
  } catch(error) { notify(error.message,true); } finally { button.disabled = false; }
});
$('#incidentForm').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget); const button = event.currentTarget.querySelector('button[type="submit"]'); button.disabled = true;
  try {
    const result = await api('/api/incidents/intake',{method:'POST',body:JSON.stringify({originalNarrative:form.get('originalNarrative'),awarenessAt:new Date(form.get('awarenessAt')).toISOString(),attachments:await filesPayload(event.currentTarget.elements.files)})});
    showReceipt(result); closeDialog('incidentDialog'); await refresh(); state.activeIncidentId = result.incident.id; renderIncidentWorkspace(); openDialog('incidentWorkspace'); notify(result.warning ? `Racconto preservato; AI non disponibile: ${result.warning}` : 'Racconto preservato e analizzato');
  } catch(error) { notify(error.message,true); } finally { button.disabled = false; }
});

document.addEventListener('click', async event => {
  const plan = event.target.closest('[data-open-plan]'); if (plan) { state.activeMissionId = plan.dataset.openPlan; renderPlanDialog(); openDialog('planDialog'); return; }
  const activate = event.target.closest('[data-activate-mission]'); if (activate) { activate.disabled = true; try { const result=await api(`/api/missions/${activate.dataset.activateMission}/activate`,{method:'POST',body:'{}'}); showReceipt(result); await refresh(); renderPlanDialog(); notify('Monitoraggio attivato'); } catch(error){notify(error.message,true);} return; }
  const run = event.target.closest('[data-run-mission]'); if (run) { run.disabled = true; try { const result=await api(`/api/missions/${run.dataset.runMission}/run`,{method:'POST',body:'{}'}); showReceipt(result); await refresh(); notify('Run completato'); } catch(error){await refresh();notify(error.message,true);} return; }
  const source = event.target.closest('[data-open-source]'); if (source) { state.activeSourceId = source.dataset.openSource; renderSourceDialog(); openDialog('sourceDialog'); return; }
  const decision = event.target.closest('[data-source-decision]'); if (decision) { const reason = prompt('Motivo della decisione, facoltativo') || ''; try { const result=await api(`/api/catalog/${state.activeSourceId}/decision`,{method:'POST',body:JSON.stringify({decision:decision.dataset.sourceDecision,reason})}); showReceipt(result); await refresh(); renderSourceDialog(); notify('Decisione sulla fonte registrata'); } catch(error){notify(error.message,true);} return; }
  const openIncident = event.target.closest('[data-open-incident]'); if (openIncident) { state.activeIncidentId = openIncident.dataset.openIncident; renderIncidentWorkspace(); openDialog('incidentWorkspace'); return; }
  const answer = event.target.closest('[data-answer-question]'); if (answer) { const value = $('#questionValue')?.value || ''; if (!value.trim()) return notify('Inserisci una risposta oppure scegli Non disponibile',true); try { const result=await api(`/api/incidents/${state.activeIncidentId}/answers`,{method:'POST',body:JSON.stringify({answers:[{id:answer.dataset.answerQuestion,value}]})}); showReceipt(result); await refresh(); notify('Risposta registrata'); } catch(error){notify(error.message,true);} return; }
  const unknown = event.target.closest('[data-answer-unknown]'); if (unknown) { try { const result=await api(`/api/incidents/${state.activeIncidentId}/answers`,{method:'POST',body:JSON.stringify({answers:[{id:unknown.dataset.answerUnknown,unknown:true}]})}); showReceipt(result); await refresh(); notify('Dato registrato come non disponibile'); } catch(error){notify(error.message,true);} return; }
  const generate = event.target.closest('[data-generate-draft]'); if (generate) { generate.disabled=true; try { const result=await api(`/api/incidents/${generate.dataset.generateDraft}/draft`,{method:'POST',body:'{}'}); showReceipt(result); await refresh(); notify('Formulazione AI pronta per la verifica'); } catch(error){notify(error.message,true);} return; }
  const submitManual = event.target.closest('[data-submit-manual]'); if (submitManual) { const finalNarrative=$('#manualNarrative')?.value.trim(); if(!finalNarrative) return notify('Scrivi la formulazione finale',true); if(!confirm('Confermi di aver verificato la formulazione?')) return; try { const result=await api(`/api/incidents/${submitManual.dataset.submitManual}/submit`,{method:'POST',body:JSON.stringify({finalNarrative,confirmed:true})}); showReceipt(result); await refresh(); notify('Segnalazione inviata'); } catch(error){notify(error.message,true);} return; }
  const submit = event.target.closest('[data-submit-incident]'); if (submit) { const finalNarrative=$('#finalNarrative')?.value.trim(); if(!$('#confirmIncident')?.checked) return notify('Conferma di aver verificato la formulazione',true); try { const result=await api(`/api/incidents/${submit.dataset.submitIncident}/submit`,{method:'POST',body:JSON.stringify({finalNarrative,confirmed:true})}); showReceipt(result); await refresh(); notify('Segnalazione inviata'); } catch(error){notify(error.message,true);} return; }
  const close = event.target.closest('[data-close-incident]'); if (close) { const note=prompt('Nota di chiusura, facoltativa') || ''; try { const result=await api(`/api/incidents/${close.dataset.closeIncident}/close`,{method:'POST',body:JSON.stringify({note})}); showReceipt(result); await refresh(); notify('Fascicolo chiuso'); } catch(error){notify(error.message,true);} }
});
}
