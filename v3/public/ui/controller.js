import { $, api, state } from './common.js';
import { render } from './render.js';
import { renderIncidentWorkspace, renderPlanDialog, renderSourceDialog } from './workspaces.js';

export async function refresh({ keepDialog = true } = {}) {
  state.data = await api('/api/bootstrap');
  state.role = state.data.actor.role;
  document.title=`ICTC ${state.data.version} · Enterprise Workbench`;
  render();
  if (keepDialog && state.activeIncidentId && $('#incidentWorkspace').open) renderIncidentWorkspace();
  if (keepDialog && state.activeSourceId && $('#sourceDialog').open) renderSourceDialog();
  if (keepDialog && state.activeMissionId && $('#planDialog').open) renderPlanDialog();
  document.dispatchEvent(new CustomEvent('ictc:rendered', {
    detail: { actorRole: state.data.actor.role },
  }));
}
