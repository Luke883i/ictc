import { $, compactList, ensureSequence, selectedGrc } from './procedure-sequential-dom.js';
export function renderAp(){if(selectedGrc()!=='actions')return;ensureSequence($('#grcWorkspace'),'actions');compactList($('#grcWorkspace .grc-list'),'article',12,'Altre azioni');}
