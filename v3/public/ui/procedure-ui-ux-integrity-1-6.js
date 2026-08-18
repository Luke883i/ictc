import { $, api, notify, showReceipt, state } from './common.js';
import { refresh } from './controller.js';

const OWNER='procedure-ui-ux-1-6';
let installed=false,timer=null;

function ensureRuntimeActor(){
  if(!state.data)return;
  const actor={id:`local-${state.role}`,role:state.role};
  try{Object.defineProperty(state.data,'actor',{value:actor,writable:true,configurable:true,enumerable:false});}
  catch{state.data.actor=actor;}
}
function ensureRejectDialog(){
  let dialog=$('#uiuxIncompleteMappingDialog');if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.id='uiuxIncompleteMappingDialog';dialog.className='dialog';dialog.dataset.uiuxOwner=OWNER;
  dialog.innerHTML='<form method="dialog" class="dialog-shell"><header><div><p class="eyebrow">Decisione umana</p><h2>Rifiuta proposta incompleta</h2></div><button type="button" data-uiux-close aria-label="Chiudi">×</button></header><div class="dialog-body"><div class="ux-dialog-form"><p>La proposta non contiene un riferimento requisito risolvibile. Non può essere usata per decidere il perimetro.</p><label>Motivazione<textarea name="reason" rows="5" required>Proposta incompleta: manca un riferimento requisito esplicito e risolvibile.</textarea></label><p class="boundary">Il rifiuto termina questa proposta di mapping. Non decide applicabilità, conformità o efficacia.</p></div></div><footer class="ux-dialog-actions"><button type="button" data-uiux-close>Annulla</button><button class="primary ux-primary" type="submit">Rifiuta proposta</button></footer></form>';
  document.body.append(dialog);
  for(const close of dialog.querySelectorAll('[data-uiux-close]'))close.addEventListener('click',()=>dialog.close());
  dialog.querySelector('form').addEventListener('submit',async event=>{
    event.preventDefault();const id=dialog.dataset.mappingId||'',reason=new FormData(event.currentTarget).get('reason');if(!id)return notify('Mapping non disponibile',true);
    try{const result=await api(`/api/grc/mappings/${id}/decision`,{method:'POST',body:JSON.stringify({decision:'rejected',reason})});showReceipt(result);dialog.close();await refresh();notify('Proposta incompleta rifiutata');}
    catch(error){if(error.code==='revision-conflict')await refresh().catch(()=>{});notify(error.message,true);}
  });
  return dialog;
}
function enforceMappingReference(){
  const root=$('#grcWorkspace');if(!root)return;
  const input=root.querySelector('[data-grc-form="mapping"] [name="requirementRef"]');
  if(input){input.required=true;input.placeholder='Codice o riferimento risolvibile richiesto';input.setAttribute('aria-describedby','uiuxRequirementRefHint');if(!$('#uiuxRequirementRefHint')){const hint=document.createElement('small');hint.id='uiuxRequirementRefHint';hint.textContent='Obbligatorio: il perimetro si decide sul requisito identificato, non sulla sola descrizione.';input.after(hint);}}
  for(const button of root.querySelectorAll('[data-uiux-scope-decision]')){
    if(String(button.dataset.requirementRef||'').trim())continue;
    const id=button.dataset.uiuxScopeDecision||'';delete button.dataset.uiuxScopeDecision;delete button.dataset.requirementRef;button.dataset.uiuxRejectIncomplete=id;button.textContent='Rifiuta proposta incompleta';
    const card=button.closest('article');if(card&&!card.querySelector('[data-uiux-incomplete-mapping-note]')){const note=document.createElement('p');note.className='ux-terminal-note';note.dataset.uiuxIncompleteMappingNote='true';note.textContent='Manca il riferimento requisito: nessuna decisione di perimetro può essere registrata su questa proposta.';card.querySelector('footer')?.before(note);}
  }
}
function enforce(){ensureRuntimeActor();enforceMappingReference();document.documentElement.dataset.ictcUiUxIntegrity='1.6.1';}
function schedule(){clearTimeout(timer);timer=setTimeout(enforce,0);}
export function installProcedureUiUxIntegrity(){
  if(installed)return;installed=true;ensureRejectDialog();ensureRuntimeActor();
  document.addEventListener('ictc:rendered',()=>{ensureRuntimeActor();schedule();});
  document.addEventListener('ictc:surface-changed',schedule);
  document.addEventListener('click',event=>{const button=event.target.closest?.('[data-uiux-reject-incomplete]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();const dialog=ensureRejectDialog();dialog.dataset.mappingId=button.dataset.uiuxRejectIncomplete;dialog.querySelector('form').reset();dialog.showModal();dialog.querySelector('textarea')?.focus();},true);
  schedule();
}
