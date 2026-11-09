import { $, state } from './common.js';
let installed=false;
const RN_SOURCE_COPY=Object.freeze([
  ['binding-eu-law','Norme cogenti UE'],
  ['binding-italian-law','Norme cogenti italiane'],
  ['competent-authority-decisions','Provvedimenti e deliberazioni di autorità competenti'],
  ['public-jurisprudence-and-case-information-without-personal-data','Giurisprudenza e casi pubblici · senza dati personali']
]);
function journey(node,stage,intent,evidenceEffect='none'){if(!node)return;node.dataset.journeyProcess='monitoring';node.dataset.journeyStage=stage;node.dataset.journeyIntent=intent;node.dataset.journeyAuthority='human';node.dataset.journeyEvidenceEffect=evidenceEffect;}
function ensureRnSchedulerDialog(){
  if($('#jobDialog'))return $('#jobDialog');
  const form=$('#missionForm');if(!form)return null;
  const dialog=document.createElement('dialog');
  dialog.id='jobDialog';dialog.className='job-dialog rn-scheduler-dialog';dialog.dataset.rnSchedulerOwner='rn-scheduler-dialog-1-4';
  dialog.innerHTML='<div class="dialog-head"><div><p class="eyebrow">RN-01 · contributore AI schedulato</p><h2 id="jobDialogTitle">Programma il mining informativo</h2><p>Definisci obiettivo, baseline e frequenza. Il runtime può produrre soltanto fonti e fatti candidati da verificare.</p></div><button type="button" data-workbench-close="jobDialog" aria-label="Chiudi configurazione job">×</button></div><div class="dialog-body job-dialog-body" data-rn-scheduler-form-slot></div>';
  document.body.append(dialog);form.hidden=false;form.removeAttribute('hidden');dialog.querySelector('[data-rn-scheduler-form-slot]').append(form);form.classList.remove('focus-card');form.classList.add('rn-scheduler-form');
  dialog.querySelector('[data-workbench-close="jobDialog"]').addEventListener('click',()=>{if(dialog.open)dialog.close();});
  return dialog;
}
function decorateForm(form,dialog){
  if(!form||!dialog)return;
  if(!form.querySelector('[data-rn-source-policy]')){const field=document.createElement('section');field.dataset.rnSourcePolicy='';field.className='rn-source-policy';field.innerHTML=`<div><small>Perimetro fonte chiuso · tutte e sole</small><strong>RN-01 sorveglia quattro classi pubbliche</strong></div><div class="rn-source-policy-grid">${RN_SOURCE_COPY.map(([id,label])=>`<span data-rn-source-class="${id}">${label}</span>`).join('')}</div><p>Il miner può proporre fonti, etichette, sintesi, rilevanza, domini e concetti. Non può verificare la fonte, stabilire applicabilità o decidere compliance.</p>`;form.querySelector('.mission-prompt')?.before(field);}
  const advanced=form.querySelector('.mission-prompt');if(advanced){advanced.open=false;const summary=advanced.querySelector('summary');if(summary)summary.textContent='Meta-prompt e istruzioni aggiuntive';const textarea=advanced.querySelector('[name="promptOverride"]');if(textarea&&!textarea.value.trim())textarea.placeholder='Aggiungi vincoli specifici. La policy RN-01 server-side resta sempre applicata.';}
  const submit=form.querySelector('button[type="submit"]');if(submit){submit.textContent=form.dataset.missionId?'Aggiorna e rigenera piano':'Prepara piano da verificare';journey(submit,'scope','define-monitor','produce');}
}
function bindLauncher(){
  const secondary=document.querySelector('[data-procedure-secondary="monitoring-plan"],[data-rn-open-scheduler]');
  if(!secondary)return;
  secondary.removeAttribute('data-procedure-secondary');secondary.dataset.rnOpenScheduler='';secondary.textContent='Programma mining AI';journey(secondary,'scope','open-scheduler');
}
function ensure(){if(!state.data)return;const dialog=ensureRnSchedulerDialog(),form=$('#missionForm');if(dialog&&form){form.hidden=false;form.removeAttribute('hidden');decorateForm(form,dialog);}bindLauncher();}
function openScheduler(){const dialog=ensureRnSchedulerDialog(),form=$('#missionForm');if(!dialog||!form)return;form.reset();form.dataset.missionId='';const baseline=form.querySelector('[data-baseline-date]');if(baseline)baseline.hidden=true;decorateForm(form,dialog);dialog.showModal();form.querySelector('[name="jobName"],textarea,input,select')?.focus();}
export function installRnSchedulerDialog(){if(installed)return;installed=true;ensure();document.addEventListener('click',event=>{const open=event.target.closest?.('[data-rn-open-scheduler]');if(!open)return;event.preventDefault();openScheduler();});document.addEventListener('ictc:rendered',()=>queueMicrotask(ensure));document.addEventListener('ictc:surface-changed',()=>queueMicrotask(ensure));}
