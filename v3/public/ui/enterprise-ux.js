import { $, $$, state } from './common.js';
import { uiIcon } from './ui-icons.js';

const roleLabels = { admin: 'Amministratore', user: 'Utente', auditor: 'Auditor' };
function capability(name) { return Array.isArray(state.data?.capabilities) && state.data.capabilities.includes(name); }
function trustedIdentity(){return state.data?.actor?.identityMode==='trusted-header';}
function aiStatusView(llm={}){const stateId=llm.ready?'ready':llm.configured?'key-missing':'unconfigured';const detail=llm.ready?'Configurazione AI operativa':llm.configured?'Configurazione AI da verificare':'Configurazione AI non completata';return{stateId,detail};}
function syncRuntimeStatus(){
  const status=$('#runtimeStatus');if(!status||!state.data)return;
  const role=state.data.actor?.role||state.role||'user',view=aiStatusView(state.data.settings?.llm||{});
  status.replaceChildren();status.hidden=true;status.dataset.aiState=view.stateId;status.dataset.actorRole=role;status.dataset.informationRole='configuration';status.dataset.legacyControl='shell-ai-status';
  delete status.dataset.tone;delete status.dataset.tooltip;status.removeAttribute('title');status.removeAttribute('tabindex');status.removeAttribute('aria-label');status.setAttribute('aria-hidden','true');
}
function applyCapabilities() {
  if (!state.data) return;
  const canContribute = capability('contribute-source');
  const canReport = capability('report-incident');
  if ($('#openContribution')) $('#openContribution').hidden = !canContribute;
  $$('[data-open-contribution]').forEach(node => { node.hidden = !canContribute; });
  if ($('#openIncident')) $('#openIncident').hidden = !canReport;
  const roleControl=$('.role-control');if(roleControl)roleControl.hidden=trustedIdentity();
  const menu=$('#stableProfileMenu');if(menu)menu.dataset.identityMode=state.data?.actor?.identityMode||'local';
  syncRuntimeStatus();
}
function projectPendingRole(role) {
  if(trustedIdentity())return;
  const status = $('#runtimeStatus');
  if (status) {
    const pendingLabel=roleLabels[role]||'Ruolo';
    const detail=`Aggiornamento ruolo: ${pendingLabel}`;
    status.dataset.actorRole='transitioning';
    status.dataset.requestedRole=role;
    status.dataset.tooltip=detail;
    status.title=detail;
    status.setAttribute('aria-label',detail);
  }
  const privileged = role === 'admin';
  $$('.admin-only').forEach(node => { node.hidden = !privileged; });
  if (!privileged) {
    if ($('#openAdminCenter')) $('#openAdminCenter').hidden = true;
    if ($('#openSettings')) $('#openSettings').hidden = true;
  }
}

export function installEnterpriseExperience() {
  $('#roleSelect')?.addEventListener('change', event => projectPendingRole(event.target.value));
  document.addEventListener('ictc:rendered', applyCapabilities);
}
