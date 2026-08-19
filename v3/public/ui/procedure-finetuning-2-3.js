import { $, api, filesPayload, notify, showReceipt, state } from './common.js';
import { refresh } from './controller.js';

let installed=false;

async function write(action,success){
  try{
    const result=await action();
    showReceipt(result);
    await refresh();
    if(success)notify(success);
    return result;
  }catch(error){
    if(error.code==='revision-conflict')await refresh().catch(()=>{});
    notify(error.message,true);
    return null;
  }
}

function ensureStyle(){
  if(document.querySelector('link[data-procedure-finetuning-23]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/procedure-finetuning-2-3.css';
  link.dataset.procedureFinetuning23='';
  document.head.append(link);
}

function ensureRnContributionOptIn(){
  const form=$('#contributionForm');
  if(!form||form.querySelector('[data-rn-ai-optin]'))return;
  const body=form.querySelector('.dialog-body');
  if(!body)return;
  const details=document.createElement('details');
  details.className='procedure-progressive-option';
  details.dataset.rnAiOptin='';
  details.innerHTML='<summary>Analisi facoltativa</summary><label class="check"><input name="analyzeWithAi" type="checkbox"> Analizza ora con AI</label><p class="microcopy">Se non selezioni questa opzione, ICTC conserva soltanto l’originale. Potrai chiedere l’analisi in seguito.</p>';
  body.append(details);
  const submit=form.querySelector('button[type="submit"]');
  const sync=()=>{if(submit)submit.textContent=form.elements.analyzeWithAi?.checked?'Conserva e analizza':'Conserva materiale';};
  form.elements.analyzeWithAi?.addEventListener('change',sync);
  sync();
}

async function submitContribution(form){
  const data=new FormData(form);
  const button=form.querySelector('button[type="submit"]');
  button.disabled=true;
  let attachments;
  try{attachments=await filesPayload(form.elements.files);}catch(error){button.disabled=false;notify(error.message,true);return;}
  const analyzeWithAi=data.get('analyzeWithAi')==='on';
  const result=await write(()=>api('/api/contributions',{method:'POST',body:JSON.stringify({
    links:String(data.get('links')||'').split(/[\n,]/).map(x=>x.trim()).filter(Boolean),
    text:data.get('text'),
    note:data.get('note'),
    attachments,
    analyzeWithAi
  })}),null);
  button.disabled=false;
  if(!result)return;
  form.closest('dialog')?.close();
  if(analyzeWithAi)notify(result.warning?`Materiale conservato; analisi AI non riuscita: ${result.warning}`:'Materiale conservato e analizzato');
  else notify('Materiale conservato. Analisi AI non richiesta.');
}

function simplifyIncidentIntake(){
  const form=$('#incidentForm');
  const body=form?.querySelector('.dialog-body');
  if(!body||body.dataset.finetune23==='true')return;
  body.dataset.finetune23='true';
  const aside=body.querySelector('aside');
  if(aside&&!aside.closest('details')){
    const details=document.createElement('details');
    details.className='procedure-progressive-option';
    details.innerHTML='<summary>Quando e quali elementi hai disponibili?</summary><div data-progressive-slot></div>';
    aside.parentElement.insertBefore(details,aside);
    details.querySelector('[data-progressive-slot]').append(aside);
  }
}

function removeRiskAiRatingControl(){
  if((state.activeProcessId||'')!=='risks')return;
  const checkbox=document.querySelector('#grcWorkspace [data-grc-form="risk"] [name="useAi"]');
  const label=checkbox?.closest('label');
  if(label)label.remove();
  const form=document.querySelector('#grcWorkspace [data-grc-form="risk"]');
  if(form&&!form.querySelector('[data-risk-human-rating-note]')){
    const note=document.createElement('p');
    note.className='boundary';note.dataset.riskHumanRatingNote='';
    note.textContent='Probabilità e impatto sono valutazioni umane. L’AI non assegna rating di rischio.';
    form.querySelector('button[type="submit"]')?.before(note);
  }
}

function enhance(){
  ensureStyle();
  ensureRnContributionOptIn();
  simplifyIncidentIntake();
  removeRiskAiRatingControl();
  document.documentElement.dataset.procedureFinetuning='2.3';
}

export function installProcedureFinetuning23(){
  if(installed)return;
  installed=true;
  ensureStyle();
  enhance();
  document.addEventListener('ictc:rendered',enhance);
  document.addEventListener('ictc:surface-changed',enhance);
  document.addEventListener('submit',event=>{
    if(event.target?.id!=='contributionForm')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void submitContribution(event.target);
  },true);
}
