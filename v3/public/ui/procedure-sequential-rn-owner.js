import { api, esc, notify, openDialog, showReceipt, splitList, state } from './common.js';
import { renderPlanDialog } from './workspaces.js';
import { refresh } from './controller.js';
import { $, capability, secondary, setPrimary } from './procedure-sequential-dom.js';

const ownMode=()=>state.data?.actor?.role==='user'&&capability('manage-own-monitoring');
const missions=()=>[...(state.data?.missions||[])].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));

function ownerButton(action,id,label,primary=true){
  const b=document.createElement('button');
  b.type='button';
  b.dataset.seqOwnerMonitor=action;
  b.dataset.id=id;
  b.textContent=label;
  if(primary)setPrimary(b,label);else secondary(b,label);
  return b;
}

function decorateCards(){
  if(!ownMode())return;
  const cards=[...document.querySelectorAll('#missionsList .mission-card')],items=missions();
  cards.forEach((card,index)=>{
    const mission=items[index];if(!mission)return;
    for(const old of card.querySelectorAll('[data-seq-owner-monitor]'))old.remove();
    const host=card.querySelector('.card-actions')||card;
    if(!host.querySelector('[data-open-plan]'))host.append(ownerButton('open',mission.id,'Apri monitoraggio',true));
  });
}

function ownerEditSection(mission){
  if(!['draft','paused','needs-plan'].includes(mission.state))return'';
  return`<section class="lens-panel" data-seq-owner-edit><p class="eyebrow">Revisione del tuo monitoraggio</p><label>Obiettivo<textarea id="seqOwnerObjective" rows="4">${esc(mission.objective||'')}</textarea></label><label>Fonti note<input id="seqOwnerHints" value="${esc((mission.sourceHints||[]).join(', '))}"></label><details><summary>Istruzioni aggiuntive</summary><textarea id="seqOwnerPrompt" rows="4">${esc(mission.promptOverride||'')}</textarea></details></section>`;
}

export function renderRnOwner(){
  if(!ownMode())return;
  decorateCards();
  const dialog=$('#planDialog');if(!dialog?.open)return;
  const mission=(state.data?.missions||[]).find(x=>x.id===state.activeMissionId);if(!mission)return;
  const body=$('#planBody'),actions=$('#planActions');
  if(body&&!body.querySelector('[data-seq-owner-edit]')&&['draft','paused','needs-plan'].includes(mission.state))body.insertAdjacentHTML('beforeend',ownerEditSection(mission));
  if(body&&mission.state==='active'&&!body.querySelector('[data-seq-owner-pause]'))body.insertAdjacentHTML('beforeend','<section class="lens-panel" data-seq-owner-pause><label>Motivo della sospensione<textarea id="seqOwnerPauseReason" rows="3" placeholder="Perche il monitoraggio deve fermarsi ora?"></textarea></label></section>');
  for(const old of actions?.querySelectorAll('[data-seq-owner-monitor]')||[])old.remove();
  if(!actions)return;
  if(mission.state==='draft')actions.append(ownerButton('revise',mission.id,'Rigenera piano',false),ownerButton('activate',mission.id,'Attiva monitoraggio',true));
  else if(mission.state==='needs-plan')actions.append(ownerButton('revise',mission.id,'Riprova pianificazione',true));
  else if(mission.state==='paused')actions.append(ownerButton('revise',mission.id,'Rigenera piano',false),ownerButton('resume',mission.id,'Riprendi monitoraggio',true));
  else if(mission.state==='active')actions.append(ownerButton('pause',mission.id,'Sospendi monitoraggio',false),ownerButton('run',mission.id,'Esegui controllo ora',false));
}

async function ownerWrite(url,body,success){
  try{const result=await api(url,{method:'POST',body:JSON.stringify(body||{})});showReceipt(result?.raw||result?.planning||result);await refresh();notify(success);return result;}
  catch(error){notify(error.message,true);return null;}
}

export function isOwnerMissionSubmit(event){return ownMode()&&event.target?.id==='missionForm';}

export async function handleOwnerSubmit(form){
  const data=new FormData(form),button=form.querySelector('button[type="submit"]');if(button)button.disabled=true;
  const result=await ownerWrite('/api/user/monitors',{objective:data.get('objective'),cadence:Number(data.get('cadence')),sourceHints:splitList(data.get('sourceHints')),promptOverride:data.get('promptOverride')},'Monitoraggio creato; il piano resta da verificare');
  if(button)button.disabled=false;if(!result?.mission)return;
  state.activeMissionId=result.mission.id;renderPlanDialog();openDialog('planDialog');renderRnOwner();form.reset();
}

export async function handleOwnerClick(button){
  if(!ownMode())return;
  const id=button.dataset.id,action=button.dataset.seqOwnerMonitor;
  if(action==='open'){state.activeMissionId=id;renderPlanDialog();openDialog('planDialog');renderRnOwner();return;}
  if(action==='revise'){await ownerWrite(`/api/user/monitors/${id}/revise`,{objective:$('#seqOwnerObjective')?.value,sourceHints:splitList($('#seqOwnerHints')?.value),promptOverride:$('#seqOwnerPrompt')?.value},'Piano rigenerato; la versione precedente resta disponibile');return;}
  if(action==='pause'){const reason=$('#seqOwnerPauseReason')?.value.trim();if(!reason)return notify('Indica il motivo della sospensione',true);await ownerWrite(`/api/user/monitors/${id}/pause`,{reason},'Monitoraggio sospeso');return;}
  await ownerWrite(`/api/user/monitors/${id}/${action}`,{},action==='activate'?'Monitoraggio attivato':action==='resume'?'Monitoraggio ripreso':'Controllo completato');
}
