import { state } from './common.js';

export function normalizeWorkbenchLabels18() {
  if (!state.data) return;
  for (const card of document.querySelectorAll('.mission-card')) {
    const missionId = card.querySelector('[data-open-plan]')?.dataset.openPlan;
    const mission = state.data.missions?.find(item => item.id === missionId);
    if (!mission) continue;
    const title = card.querySelector('h3');
    if (title) title.textContent = mission.jobName || mission.objective;
    let objective = card.querySelector('.mission-objective-18');
    const needsObjective = mission.jobName && mission.objective && mission.jobName !== mission.objective;
    if (needsObjective && !objective) {
      objective = document.createElement('p');
      objective.className = 'mission-objective-18';
      card.querySelector('.card-head')?.after(objective);
    }
    if (objective) {
      objective.textContent = mission.objective;
      objective.hidden = !needsObjective;
    }
  }
}

export function installWorkbenchLabels18() {
  document.addEventListener('ictc:rendered', normalizeWorkbenchLabels18);
  normalizeWorkbenchLabels18();
}
