import { $, $$, state } from './common.js';
import { uiIcon } from './ui-icons.js';

const roleLabels = { admin: 'Amministratore', user: 'Utente', auditor: 'Auditor' };
function capability(name) { return Array.isArray(state.data?.capabilities) && state.data.capabilities.includes(name); }
function trustedIdentity(){return state.data?.actor?.identityMode==='trusted-header';}
function syncRuntimeStatus(){
  const status=$('#runtimeStatus');if(!status||!state.data)return;
  const role=state.data.actor?.role||state.role||'user',roleLabel=roleLabels[role]||role,llm=state.data.settings?.llm||{};
  const detail=llm.ready?'AI disponibile':llm.configured?'Chiave AI non disponibile':'AI non configurata';
  const aiLabel=role==='auditor'?'Sola lettura':llm.ready?'AI pronta':'AI non attiva';
  const icon=llm.ready?'sparkles':'triangle-alert';
  status.innerHTML=`${uiIcon(icon,'ui-icon runtime-status-icon')}<span>${roleLabel} · ${aiLabel}</span>`;
  status.dataset.aiState=llm.ready?'ready':llm.configured?'key-missing':'unconfigured';
  status.dataset.actorRole=role;
  status.title=`${roleLabel} · ${detail}`;
  status.setAttribute('aria-label',`${roleLabel}. ${detail}`);
}
function applyCapabilities() {
  if (!state.data) return;
  const canContribute = capability('contribute-source');
  const canReport = capability('report-incident');
  if ($('#openContribution')) $('#openContribution').hidden = !canContribute;
  $$('[data-open-contribution]').forEach(node => { node.hidden = !canContribute; });
  if ($('#openIncident')) $('#openIncident').hidden = !canReport;
  const roleControl=$('.role-control');if(roleControl)roleControl.hidden=trustedIdentity();
  const menu=$('#stableProfileMenu');if(menu)menu.dataset.identityMode=trustedIdentity()?'trusted-header':'local';
  syncRuntimeStatus();
}
function projectPendingRole(role) {
  if(trustedIdentity())return;
  const status = $('#runtimeStatus');
  if (status) {
    status.dataset.actorRole = 'transitioning';
    status.dataset.requestedRole = role;
    status.textContent = `${roleLabels[role] || 'Ruolo'} · Aggiornamento…`;
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
