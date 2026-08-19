import { $, compactList, ensureSequence } from './procedure-sequential-dom.js';

export function renderRn(){
  const host=$('#monitoringView');
  if(!host||host.hidden)return;
  ensureSequence(host,'monitoring');
  compactList($('#missionsList'),'.mission-card',12,'Altri monitoraggi');
  compactList($('#catalogList'),'.catalog-card',16,'Altre fonti');
}

export function renderEc(){
  const host=$('#incidentsView');
  if(!host||host.hidden)return;
  ensureSequence(host,'incidents');
  compactList($('#incidentList'),'.incident-card',12,'Altri fascicoli evento');
}
