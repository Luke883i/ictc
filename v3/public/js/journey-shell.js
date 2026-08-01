export { startJourneyShell } from './journey-shell-actions.js';
export { state } from './journey-shell-common.js';

export const SHELL_WIRING_MANIFEST = Object.freeze({
  modules: ['journey-shell-common.js','journey-shell-render.js','journey-shell-actions.js'],
  projection: ['deriveCoreWorkspace','deriveSemanticRows','deriveIncidentRows'],
  contract: ["fetch('/core-workspaces.json'", "api('/api/bootstrap'"],
  writeCycle: ['async function checkpoint','state.lastReceipt = result.receipt','await refresh()','readbackVerified'],
  routes: ['/api/jobs','/schedule','/run','/api/sources','/review','/decide','/map-control','/api/matters','/confirm-owner','/transition'],
  controls: ['class="primary" data-task-action','compact-table','monitor-table','case-table','fieldHtml','required'],
  labels: ['Nuovo monitoraggio','Aggiungi fonte','Esegui ora','Rivedi la fonte','Attiva il monitoraggio','Valuta la differenza','Registra la decisione','Collega il controllo','Segnala un evento','Conferma responsabilità','Registra il triage','Avvia la risposta','Registra il ripristino','Chiudi e registra le lezioni','Collegamenti tra fonti e decisioni','Fasi del processo'],
  accessibility: ['role="status"','ArrowLeft','ArrowRight','Home','End','ctrlKey','metaKey','toLowerCase() === \'k\'','dialogReturnFocus','target.focus()']
});
