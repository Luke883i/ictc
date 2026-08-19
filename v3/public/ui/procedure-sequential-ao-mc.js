import { $, ensureSequence, selectedGrc } from './procedure-sequential-dom.js';

export function renderAo(){
  if(selectedGrc()!=='objects')return;
  ensureSequence($('#grcWorkspace'),'objects');
}

export function renderMc(){
  if(selectedGrc()!=='coverage')return;
  ensureSequence($('#grcWorkspace'),'coverage');
}
