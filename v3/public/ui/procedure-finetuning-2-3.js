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
  details.innerHTML='<summary>Analisi facoltativa</summary><label class="check" for="rnAnalyzeWithAi"><input id="rnAnalyzeWithAi" name="analyzeWithAi" type="checkbox" aria-label="Analizza ora con AI"> Analizza ora con AI</label><p class="microcopy">Se non selezioni questa opzione, ICTC conserva soltanto l’originale. Potrai chiedere l’analisi in seguito.</p>';
  body.append(details);
  const submit=form.querySelector('button[type="submit"]');
  const sync=()=>{if(submit)submit.textContent=form.elements.analyzeWithAi?.checked?'Conserva e analizza':'Conserva materiale';};
  form.elements.analyzeWithAi?.addEventListener('change',sync);
  sync();
}

function ensureRnSchedulerAccessibleNames(){
  const prompt=$('#missionForm [name="promptOverride"]');
  if(prompt&&!prompt.getAttribute('aria-label'))prompt.setAttribute('aria-label','Istruzioni specifiche per il monitoraggio');
}

function ensureIncidentTemporalAccessibleNames(){
  const fields=[
    ['occurredAt','ecOccurredAt','Quando è accaduto'],
    ['detectedAt','ecDetectedAt','Quando è stato rilevato']
  ];
  for(const [name,id,labelText] of fields){
    const input=$(`#incidentForm [name="${name}"]`);
    if(!input)continue;
    if(!input.id)input.id=id;
    if(!input.getAttribute('aria-label'))input.setAttribute('aria-label',labelText);
    const label=input.closest('label');
    if(label&&!label.htmlFor)label.htmlFor=input.id;
  }
}

function ensureIncidentWorkspaceAccessibleNames(){
  const control=$('#incidentWorkspace #questionValue');
  if(!control||control.getAttribute('aria-label'))return;
  const incident=(state.data?.incidents||[]).find(item=>item.id===state.activeIncidentId);
  control.setAttribute('aria-label',incident?.nextQuestion?.label||'Risposta al chiarimento');
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
  ensureIncidentTemporalAccessibleNames();
  body.dataset.finetune23='true';
  const aside=body.querySelector('aside');
  if(!aside||aside.querySelector('[data-finetune23-incident-optional]'))return;
  const optional=[...aside.children].filter(node=>node.matches?.('[data-market-event-dates],.dropzone,.evidence-note'));
  if(!optional.length)return;
  const details=document.createElement('details');
  details.className='procedure-progressive-option';
  details.dataset.finetune23IncidentOptional='';
  details.innerHTML='<summary>Altri tempi ed elementi disponibili</summary><div data-progressive-slot></div>';
  aside.insertBefore(details,optional[0]);
  const slot=details.querySelector('[data-progressive-slot]');
  for(const node of optional)slot.append(node);
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
  ensureRnSchedulerAccessibleNames();
  ensureIncidentTemporalAccessibleNames();
  simplifyIncidentIntake();
  ensureIncidentWorkspaceAccessibleNames();
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
