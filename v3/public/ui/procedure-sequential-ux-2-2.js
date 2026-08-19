import { state } from './common.js';
import { renderAo, renderMc } from './procedure-sequential-ao-mc.js';
import { renderAp } from './procedure-sequential-ap.js';
import { ensureStyle } from './procedure-sequential-dom.js';
import { renderEc, renderRn } from './procedure-sequential-rn-ec.js';
import { handleOwnerClick, handleOwnerSubmit, isOwnerMissionSubmit, renderRnOwner } from './procedure-sequential-rn-owner.js';

let installed=false;

function renderAll(){
  if(!state.data)return;
  ensureStyle();
  renderRn();
  renderRnOwner();
  renderEc();
  renderAo();
  renderMc();
  renderAp();
  document.documentElement.dataset.seqUx='2.2';
  document.dispatchEvent(new CustomEvent('ictc:sequential-rendered',{detail:{service:state.service,authority:'journey-overlay'}}));
}

// 1.6 uses a double microtask to remain the canonical decision presentation owner.
// The third microtask lets 2.2 add only non-authoritative journey structure afterwards.
function schedule(){queueMicrotask(()=>queueMicrotask(()=>queueMicrotask(renderAll)));}

export function installSequentialProcedureUx(){
  if(installed)return;
  installed=true;
  document.addEventListener('ictc:rendered',schedule);
  document.addEventListener('ictc:surface-changed',schedule);
  document.addEventListener('toggle',event=>{if(event.target?.id==='planDialog')schedule();},true);
  document.addEventListener('submit',event=>{
    if(!isOwnerMissionSubmit(event))return;
    event.preventDefault();event.stopImmediatePropagation();void handleOwnerSubmit(event.target);
  },true);
  document.addEventListener('click',event=>{
    const owner=event.target.closest?.('[data-seq-owner-monitor]');if(!owner)return;
    event.preventDefault();event.stopImmediatePropagation();void handleOwnerClick(owner);
  },true);
  schedule();
}
