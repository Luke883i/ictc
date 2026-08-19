import { $, compactList, ensureSequence, selectedGrc } from './procedure-sequential-dom.js';
function compactCurrent(label){const list=$('#grcWorkspace .grc-list');compactList(list,'article',12,label);}
export function renderAo(){if(selectedGrc()!=='objects')return;ensureSequence($('#grcWorkspace'),'objects');compactCurrent('Altri oggetti');}
export function renderMc(){if(selectedGrc()!=='coverage')return;ensureSequence($('#grcWorkspace'),'coverage');compactCurrent('Altri mapping');}
