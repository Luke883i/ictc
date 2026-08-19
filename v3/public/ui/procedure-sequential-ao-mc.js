import { $, ensureQueueWindow, ensureSequence, selectedGrc } from './procedure-sequential-dom.js';
export function renderAo(){if(selectedGrc()!=='objects')return;const root=$('#grcWorkspace');ensureSequence(root,'objects');ensureQueueWindow(root?.querySelector('.grc-list'),'article',{id:'objects',label:'oggetti'});}
export function renderMc(){if(selectedGrc()!=='coverage')return;const root=$('#grcWorkspace');ensureSequence(root,'coverage');ensureQueueWindow(root?.querySelector('.grc-list'),'article',{id:'coverage',label:'requisiti e mapping'});}
