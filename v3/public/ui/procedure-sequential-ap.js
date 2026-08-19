import { $, ensureQueueWindow, ensureSequence, selectedGrc } from './procedure-sequential-dom.js';
export function renderAp(){if(selectedGrc()!=='actions')return;const root=$('#grcWorkspace');ensureSequence(root,'actions');ensureQueueWindow(root?.querySelector('.grc-list'),'article',{id:'actions',label:'azioni'});}
