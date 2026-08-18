import { $, state } from './common.js';
let installed=false;
function ensureRnSchedulerDialog(){
  if($('#jobDialog'))return $('#jobDialog');
  const form=$('#missionForm');
  if(!form)return null;
  const dialog=document.createElement('dialog');
  dialog.id='jobDialog';
  dialog.className='job-dialog finetune-scheduler';
  dialog.dataset.rnSchedulerOwner='active-adapter-1-4';
  dialog.innerHTML='<div class="dialog-head"><div><p class="eyebrow">RN-01 · contributore AI schedulato</p><h2 id="jobDialogTitle">Programma il mining informativo</h2><p>Definisci obiettivo, frequenza e fonti di orientamento. Il runtime produce candidati da verificare, non decisioni.</p></div><button type="button" data-workbench-close="jobDialog" aria-label="Chiudi configurazione job">×</button></div><div class="dialog-body job-dialog-body" data-rn-scheduler-form-slot></div>';
  document.body.append(dialog);
  form.hidden=false;form.removeAttribute('hidden');
  dialog.querySelector('[data-rn-scheduler-form-slot]').append(form);
  form.classList.remove('focus-card');
  dialog.querySelector('[data-workbench-close="jobDialog"]').addEventListener('click',()=>{if(dialog.open)dialog.close();});
  return dialog;
}
function ensure(){if(!state.data)return;const dialog=ensureRnSchedulerDialog();const form=$('#missionForm');if(dialog&&form){form.hidden=false;form.removeAttribute('hidden');}}
export function installRnSchedulerDialog(){
  if(installed)return;installed=true;
  ensureRnSchedulerDialog();
  document.addEventListener('ictc:rendered',()=>queueMicrotask(ensure));
  document.addEventListener('ictc:surface-changed',()=>queueMicrotask(ensure));
}
