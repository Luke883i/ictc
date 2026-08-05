import { $, $$, state } from './common.js';

const copy = new Map([
  ['Fonti normative','Monitoraggio normativo'],['Segnalazioni','Eventi e incidenti'],['Monitoraggio guidato','Nuovo monitoraggio'],['Descrivi il risultato.','Definisci cosa monitorare.'],['L’AI prepara il piano.','L’AI propone il piano.'],['Che cosa deve sorvegliare ICTC?','Obiettivo di monitoraggio'],['Ritmo','Frequenza'],['Fonti già note, facoltative','Fonti note (facoltative)'],['Istruzione specifica del monitoraggio','Prompt del monitoraggio — avanzato'],['Monitoraggi','Piani di monitoraggio'],['Segnalazione progressiva','Segnalazione guidata'],['Racconta i fatti.','Descrivi l’evento.'],['ICTC trova i gap.','ICTC evidenzia le informazioni mancanti.'],['Nuova segnalazione','Registra evento'],['Postura enterprise','Stato dei controlli'],['Richiede attenzione','Azioni richieste'],['Consumo AI','Utilizzo AI'],['Ambiente e governo AI','Governance AI'],['Directory utenti','Utenti e ruoli'],['AI globale','Configurazione AI'],['Provisiona utente','Aggiungi utente']
]);
const roleLabels = { admin: 'Amministratore', user: 'Utente', auditor: 'Auditor' };

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}
function setHidden(node, hidden) {
  if (node && node.hidden !== hidden) node.hidden = hidden;
}
function replaceExactText(root = document) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const value = node.nodeValue?.trim();
    if (copy.has(value)) node.nodeValue = node.nodeValue.replace(value, copy.get(value));
  }
}
function capability(name) {
  return Array.isArray(state.data?.capabilities) && state.data.capabilities.includes(name);
}
function projectCapabilities() {
  const role = state.data?.actor?.role;
  const roleLabel = roleLabels[role] || 'Ruolo non riconosciuto';
  const status = $('#runtimeStatus');
  if (status && state.data?.settings?.llm) {
    const llm = state.data.settings.llm;
    const ai = llm.ready ? 'AI pronta' : llm.configured ? 'Chiave AI non disponibile' : 'AI non configurata';
    setText(status, `${roleLabel} · ${ai}`);
    status.dataset.actorRole = role || 'unknown';
    const statusState = llm.ready ? 'ready' : 'attention';
    if (status.dataset.state !== statusState) status.dataset.state = statusState;
  }
  const canManage = capability('manage-monitoring');
  const canContribute = capability('contribute-source');
  const canReport = capability('report-incident');
  setHidden($('#missionForm'), !canManage);
  $$('[data-open-contribution], #openContribution').forEach(node => setHidden(node, !canContribute));
  setHidden($('#openIncident'), !canReport);
  const intro = $('#userMonitoringIntro');
  if (intro && role === 'auditor') {
    setHidden(intro, false);
    setText(intro.querySelector('.eyebrow'), 'Vista auditor');
    setText(intro.querySelector('h2'), 'Consulta fonti, decisioni ed evidenze.');
    setText(intro.querySelector('p'), 'La vista auditor è in sola lettura e non consente contributi o nuove segnalazioni.');
    setHidden(intro.querySelector('button'), true);
  }
}
function projectPendingRole(role) {
  const status = $('#runtimeStatus');
  if (status) {
    status.dataset.actorRole = 'transitioning';
    status.dataset.requestedRole = role;
    setText(status, `${roleLabels[role] || 'Ruolo'} · Aggiornamento…`);
  }
  const privileged = role === 'admin';
  $$('.admin-only').forEach(node => setHidden(node, !privileged));
  if (!privileged) {
    setHidden($('#openAdminCenter'), true);
    setHidden($('#openSettings'), true);
  }
}
function normalizeLabels() {
  $$('.pill.needs-plan').forEach(node => setText(node, 'Pianificazione non riuscita'));
  $$('[data-open-plan]').forEach(node => { if (node.textContent.trim() === 'Apri piano') setText(node, 'Rivedi piano'); });
  $$('[data-download-evidence]').forEach(node => { if (node.textContent.trim() === 'Fascicolo') setText(node, 'Apri evidenze'); });
  $$('.score.warn').forEach(node => {
    if (node.textContent.trim() === 'Blocco') setText(node, 'Bloccante');
    if (node.textContent.trim() === 'high') setText(node, 'Alta');
  });
}
export function installEnterpriseExperience() {
  const apply = () => {
    replaceExactText();
    projectCapabilities();
    normalizeLabels();
  };
  apply();
  $('#roleSelect')?.addEventListener('change', event => projectPendingRole(event.target.value));
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      apply();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
