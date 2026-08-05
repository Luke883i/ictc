import { $, $$ } from './common.js';

const roleLabels = { admin: 'Amministratore', user: 'Utente', auditor: 'Auditor' };

function projectPendingRole(role) {
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
}
