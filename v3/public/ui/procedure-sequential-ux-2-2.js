import { state } from './common.js';
import { registerExperienceParticipant } from './experience-lifecycle.js';
import { renderAo, renderMc } from './procedure-sequential-ao-mc.js';
import { renderAp } from './procedure-sequential-ap.js';
import { ensureStyle } from './procedure-sequential-dom.js';
import { renderEc, renderRn } from './procedure-sequential-rn-ec.js';
import { handleOwnerClick, handleOwnerSubmit, isOwnerMissionSubmit, renderRnOwner } from './procedure-sequential-rn-owner.js';

const PARTICIPANT='procedure-sequential-ux-2-2';
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
}

export function installSequentialProcedureUx(){
  if(installed)return;
  installed=true;
  registerExperienceParticipant({id:PARTICIPANT,phase:'journey',authority:'journey-overlay',exclusive:false,render:renderAll});
  document.addEventListener('submit',event=>{
    if(!isOwnerMissionSubmit(event))return;
    event.preventDefault();event.stopImmediatePropagation();void handleOwnerSubmit(event.target);
  },true);
  document.addEventListener('click',event=>{
    const owner=event.target.closest?.('[data-seq-owner-monitor]');if(!owner)return;
    event.preventDefault();event.stopImmediatePropagation();void handleOwnerClick(owner);
  },true);
}
