export { startJourneyShell } from './journey-shell-actions.js';
export { state } from './journey-shell-common.js';

export const SHELL_WIRING_MANIFEST = Object.freeze({
  modules: ['journey-shell-common.js', 'journey-shell-render.js', 'journey-shell-actions.js'],
  projection: ['deriveCoreWorkspace', 'deriveSemanticRows', 'deriveIncidentRows'],
  access: ['/api/access', 'x-ictc-actor-id', 'x-ictc-tenant-id', 'tenantSelect', 'actorSelect'],
  contract: ["fetch('/core-workspaces.json'", "api('/api/bootstrap'"],
  writeCycle: ['async function checkpoint', 'state.lastReceipt = result.receipt', 'await refresh()', 'readbackVerified'],
  routes: ['/api/jobs', '/schedule', '/run', '/api/sources', '/review', '/decide', '/map-control', '/api/matters', '/confirm-owner', '/transition'],
  controls: ['class="primary" data-task-action', 'compact-table', 'monitor-table', 'case-table', 'fieldHtml', 'required'],
  labels: ['Monitora URL', 'Aggiungi contenuto', 'Esegui', 'Rivedi', 'Attiva', 'Valuta', 'Decidi', 'Collega', 'Segnala', 'Conferma', 'Registra il triage', 'Avvia la risposta', 'Registra il ripristino', 'Chiudi il caso', 'Catena delle decisioni', 'Fasi del processo'],
  accessibility: ['role="status"', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'ctrlKey', 'metaKey', "toLowerCase() === 'k'", 'dialogReturnFocus', 'target.focus()']
});
