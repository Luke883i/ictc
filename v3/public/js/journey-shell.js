import { startJourneyShell as startBaseJourneyShell } from './journey-shell-bindings.js';
import { state } from './journey-shell-common.js';
import { installGuidedJourney } from './journey-guidance.js';

export async function startJourneyShell() {
  await startBaseJourneyShell();
  installGuidedJourney(state, state.contract);
}

export { state };

export const SHELL_WIRING_MANIFEST = Object.freeze({
  modules: ['journey-shell-common.js', 'journey-shell-render.js', 'journey-shell-actions.js', 'journey-shell-bindings.js', 'journey-guidance.js'],
  projection: ['deriveCoreWorkspace', 'deriveSemanticRows', 'deriveIncidentRows', 'deriveGuidedWorkspace'],
  access: ['/api/access', 'x-ictc-actor-id', 'x-ictc-tenant-id', 'tenantSelect', 'actorSelect'],
  contract: ["fetch('/core-workspaces.json'", "api('/api/bootstrap'"],
  writeCycle: ['async function checkpoint', 'state.lastReceipt = result.receipt', 'await refresh()', 'readbackVerified'],
  routes: ['/api/jobs', '/schedule', '/run', '/api/sources', '/review', '/decide', '/map-control', '/api/matters', '/confirm-owner', '/transition'],
  controls: ['class="primary" data-task-action', 'compact-table', 'monitor-table', 'case-table', 'fieldHtml', 'required'],
  labels: ['Monitora URL', 'Aggiungi contenuto', 'Esegui', 'Rivedi', 'Attiva', 'Valuta', 'Decidi', 'Collega', 'Segnala', 'Conferma', 'Da fare', 'In attesa di un altro ruolo'],
  accessibility: ['role="status"', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'ctrlKey', 'metaKey', "toLowerCase() === 'k'", 'dialogReturnFocus', 'target.focus()']
});
