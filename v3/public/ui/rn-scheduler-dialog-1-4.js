import { $ } from './common.js';

let installed=false;
function exposeForm(form){if(!form)return;form.hidden=false;form.removeAttribute('hidden');}
function ensureDialog(){
  let dialog=$('#jobDialog');
  if(dialog)return dialog;
  const form=$('#missionForm');
  if(!form)return null;
  dialog=document.createElement('dialog');
  dialog.id='jobDialog';
  dialog.className='dialog wide rn-scheduler-dialog';
  dialog.setAttribute('aria-labelledby','jobDialogTitle');
  dialog.innerHTML=`<div class="dialog-shell"><header><div><p class="eyebrow">Monitoraggio programmato</p><h2 id="jobDialogTitle">Configura il monitoraggio</h2><p>Definisci obiettivo, perimetro e frequenza. L’attivazione richiede una decisione umana.</p></div><button type="button" data-rn-job-close aria-label="Chiudi configurazione job">×</button></header><div class="dialog-body" data-rn-job-body></div></div>`;
  const body=dialog.querySelector('[data-rn-job-body]');
  exposeForm(form);body.append(form);
  form.classList.remove('focus-card');form.classList.add('rn-scheduler-form');
  form.dataset.journeyProcess='monitoring';form.dataset.journeyStage='scope';form.dataset.journeySurface='monitoring-scheduler-dialog';
  document.body.append(dialog);
  return dialog;
}
function close(){const dialog=$('#jobDialog');if(dialog?.open)dialog.close();}
export function installRnSchedulerDialog(){
  if(installed)return;installed=true;const dialog=ensureDialog();if(!dialog)return;
  dialog.addEventListener('click',event=>{if(event.target.closest('[data-rn-job-close]'))close();if(event.target===dialog)close();});
  dialog.addEventListener('close',()=>{const form=$('#missionForm');if(form&&!form.dataset.missionId)form.reset();});
  document.addEventListener('ictc:rendered',()=>{const d=ensureDialog();if(!d)return;const form=$('#missionForm');if(form&&form.parentElement!==d.querySelector('[data-rn-job-body]'))d.querySelector('[data-rn-job-body]').append(form);exposeForm(form);});
  document.addEventListener('ictc:surface-changed',()=>exposeForm($('#missionForm')));
}
