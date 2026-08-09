import { $, $$, state } from './common.js';

const roleLabels = { admin: 'Amministratore', user: 'Utente', auditor: 'Auditor' };
function capability(name) { return Array.isArray(state.data?.capabilities) && state.data.capabilities.includes(name); }
function trustedIdentity(){return state.data?.actor?.identityMode==='trusted-header';}
function applyCapabilities() {
  if (!state.data) return;
  const canContribute = capability('contribute-source');
  const canReport = capability('report-incident');
  if ($('#openContribution')) $('#openContribution').hidden = !canContribute;
  $$('[data-open-contribution]').forEach(node => { node.hidden = !canContribute; });
  if ($('#openIncident')) $('#openIncident').hidden = !canReport;
  const roleControl=$('.role-control');if(roleControl)roleControl.hidden=trustedIdentity();
  const menu=$('#stableProfileMenu');if(menu)menu.dataset.identityMode=trustedIdentity()?'trusted-header':'local';
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
