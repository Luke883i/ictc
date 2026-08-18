import { $ } from './common.js';

let installed=false;
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
  const body=dialog.querySelector('[data-rn-job-body]');body.append(form);form.classList.remove('focus-card');form.classList.add('rn-scheduler-form');form.dataset.journeyProcess='monitoring';form.dataset.journeyStage='scope';form.dataset.journeySurface='monitoring-scheduler-dialog';document.body.append(dialog);return dialog;
}
function ensureRnScheduler(){
  const dialog=ensureDialog();if(!dialog)return null;const form=$('#missionForm');if(!form)return dialog;const body=dialog.querySelector('[data-rn-job-body]');if(form.parentElement!==body)body.append(form);form.hidden=false;form.removeAttribute('hidden');form.closest('.hero')?.classList.add('rn-hero-with-dialog-only-form');form.classList.remove('focus-card');form.classList.add('rn-scheduler-form');form.dataset.rnSchedulerFormSlot='true';form.dataset.journeyProcess='monitoring';form.dataset.journeyStage='scope';form.dataset.journeyIntent='create-monitor';form.dataset.journeyAuthority='human';form.dataset.journeyEvidenceEffect='produce';if(!form.querySelector('[data-rn-scheduler-meta]')){const meta=document.createElement('div');meta.dataset.rnSchedulerMeta='true';meta.className='rn-scheduler-meta';meta.innerHTML='<p class="eyebrow">RN-01 · contributore AI schedulato</p><p>Il job cerca solo fonti pubbliche nel perimetro RN; i risultati restano candidati finché una persona non verifica fonte e impatto.</p>';form.prepend(meta);}return dialog;
}
function close(){const dialog=$('#jobDialog');if(dialog?.open)dialog.close();}
export function installRnSchedulerDialog(){
  if(installed)return;installed=true;const dialog=ensureRnScheduler();if(!dialog)return;
  dialog.addEventListener('click',event=>{if(event.target.closest('[data-rn-job-close]'))close();if(event.target===dialog)close();});
  dialog.addEventListener('close',()=>{const form=$('#missionForm');if(form&&!form.dataset.missionId)form.reset();});
  document.addEventListener('ictc:rendered',()=>ensureRnScheduler());
  document.addEventListener('ictc:surface-changed',()=>{const form=$('#missionForm');if(form){form.hidden=false;form.removeAttribute('hidden');}});
}
