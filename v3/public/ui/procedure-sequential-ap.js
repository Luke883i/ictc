import { $, ensureSequence, selectedGrc } from './procedure-sequential-dom.js';

export function renderAp(){
  if(selectedGrc()!=='actions')return;
  ensureSequence($('#grcWorkspace'),'actions');
}
