import { $, api, notify, showReceipt, state } from './common.js';
import { refresh } from './controller.js';

const OWNER='procedure-ui-ux-1-6';
let installed=false,timer=null,workspaceObserver=null,workspaceObserved=null;

function slug(value){return String(value||'interaction').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'interaction';}
function ensureAccessibilityOverrides(){
  if($('#procedureUiUx16IntegrityStyles'))return;
  const style=document.createElement('style');style.id='procedureUiUx16IntegrityStyles';style.textContent=`#monitoringView button,#monitoringView summary,#monitoringView a.secondary,#incidentsView button,#incidentsView summary,#incidentsView a.secondary,#grcWorkspace button,#grcWorkspace summary,#grcWorkspace a.secondary,#planDialog button,#planDialog summary,#planDialog a.secondary,#sourceDialog button,#sourceDialog summary,#sourceDialog a.secondary,#incidentWorkspace button,#incidentWorkspace summary,#incidentWorkspace a.secondary,#uiuxScopeDialog button,#uiuxScopeDialog summary,#uiuxScopeDialog a.secondary,#uiuxMappingDialog button,#uiuxMappingDialog summary,#uiuxMappingDialog a.secondary,#uiuxIncompleteMappingDialog button,#uiuxIncompleteMappingDialog summary,#uiuxIncompleteMappingDialog a.secondary,#uiuxActionVerifyDialog button,#uiuxActionVerifyDialog summary,#uiuxActionVerifyDialog a.secondary,#uiuxActionStateDialog button,#uiuxActionStateDialog summary,#uiuxActionStateDialog a.secondary,[data-uiux-owner="${OWNER}"] button,[data-uiux-owner="${OWNER}"] summary,[data-uiux-owner="${OWNER}"] a.secondary{min-height:44px!important;min-block-size:44px!important;box-sizing:border-box}@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}}`;document.head.append(style);
}
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
  for(const legacy of root.querySelectorAll('[data-mapping-decision]'))legacy.remove();
  for(const button of root.querySelectorAll('[data-uiux-scope-decision]')){
    if(String(button.dataset.requirementRef||'').trim())continue;
    const id=button.dataset.uiuxScopeDecision||'';delete button.dataset.uiuxScopeDecision;delete button.dataset.requirementRef;button.dataset.uiuxRejectIncomplete=id;button.textContent='Rifiuta proposta incompleta';
    const card=button.closest('article');if(card&&!card.querySelector('[data-uiux-incomplete-mapping-note]')){const note=document.createElement('p');note.className='ux-terminal-note';note.dataset.uiuxIncompleteMappingNote='true';note.textContent='Manca il riferimento requisito: nessuna decisione di perimetro può essere registrata su questa proposta.';card.querySelector('footer')?.before(note);}
  }
  for(const button of root.querySelectorAll('[data-uiux-reject-incomplete]'))button.textContent='Rifiuta proposta incompleta';
}
function stampDialogContexts(){
  const contexts=[['#uiuxScopeDialog','coverage','scope'],['#uiuxMappingDialog','coverage','map'],['#uiuxIncompleteMappingDialog','coverage','map'],['#uiuxActionVerifyDialog','actions','verify'],['#uiuxActionStateDialog','actions','execute']];
  for(const [selector,process,stage] of contexts){const dialog=$(selector);if(!dialog)continue;dialog.dataset.uiuxOwner=OWNER;dialog.dataset.uiuxProcess=process;dialog.dataset.uiuxPhase=stage;}
}
function classifyControl(node,process,stage){
  const attrs=[...node.attributes||[]].map(a=>a.name).join(' '),text=(node.textContent||node.getAttribute('aria-label')||'').trim().toLowerCase();
  if(/evidence|dossier|download/.test(attrs)||/dossier|evidenz|prova/.test(text))return['evidence','inspect-evidence','navigation','consume'];
  if(node.tagName==='SUMMARY')return[stage||'detail','inspect-progressive-detail','navigation','none'];
  if(/uiux-action-verify/.test(attrs))return['verify','verify-action-result','human','consume-and-produce'];
  if(/uiux-scope-decision/.test(attrs))return['scope','decide-requirement-scope','human','produce'];
  if(/uiux-mapping-decision/.test(attrs))return['map','decide-mapping','human','produce'];
  if(/uiux-reject-incomplete/.test(attrs))return['map','reject-incomplete-mapping','human','produce'];
  if(/uiux-action-quick|uiux-action-state|action-adopt/.test(attrs))return[stage||'execute',slug(text),'human','produce'];
  if(/source-decision|object-review|object-attest|submit-incident|close-incident|save-manual|answer-question/.test(attrs))return[stage||'decide',slug(text),'human','produce'];
  if(/ai|generate-draft|action-ai/.test(attrs)||/\bai\b/.test(text))return[stage||'assist','request-ai-proposal','human','produce'];
  if(node.matches('a[href]'))return[stage||'navigate',slug(text),'navigation','none'];
  return[stage||'support',slug(text),'navigation','none'];
}
function stampJourneyAnchors(){
  stampDialogContexts();
  for(const host of document.querySelectorAll(`[data-uiux-owner="${OWNER}"]`)){
    const process=host.dataset.uiuxProcess||host.closest?.('[data-uiux-process]')?.dataset.uiuxProcess||'';
    const hostStage=host.dataset.uiuxPhase||host.closest?.('[data-uiux-phase]')?.dataset.uiuxPhase||'support';
    if(!process)continue;
    host.dataset.journeyProcess=host.dataset.journeyProcess||process;host.dataset.journeySurface=host.dataset.journeySurface||'procedure-specific';
    for(const node of host.querySelectorAll('button,a[href],summary')){
      if(node.dataset.journeyProcess)continue;
      const stage=node.closest?.('[data-uiux-phase]')?.dataset.uiuxPhase||hostStage,[s,intent,authority,effect]=classifyControl(node,process,stage);
      node.dataset.journeyProcess=process;node.dataset.journeyStage=s;node.dataset.journeyIntent=intent;node.dataset.journeyAuthority=authority;node.dataset.journeyEvidenceEffect=effect;
    }
  }
}
function ensureWorkspaceObserver(){
  const root=$('#grcWorkspace');if(!root||root===workspaceObserved)return;
  workspaceObserver?.disconnect();workspaceObserved=root;
  workspaceObserver=new MutationObserver(()=>enforce());
  workspaceObserver.observe(root,{childList:true,subtree:true});
}
function enforce(){ensureAccessibilityOverrides();ensureRuntimeActor();enforceMappingReference();stampJourneyAnchors();ensureWorkspaceObserver();document.documentElement.dataset.ictcUiUxIntegrity='1.6.1';}
function schedule(){clearTimeout(timer);timer=setTimeout(enforce,0);}
export function installProcedureUiUxIntegrity(){
  if(installed)return;installed=true;ensureAccessibilityOverrides();ensureRejectDialog();ensureRuntimeActor();ensureWorkspaceObserver();
  document.addEventListener('ictc:rendered',()=>{ensureRuntimeActor();schedule();});
  document.addEventListener('ictc:surface-changed',schedule);
  document.addEventListener('click',event=>{const button=event.target.closest?.('[data-uiux-reject-incomplete]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();const dialog=ensureRejectDialog();dialog.dataset.mappingId=button.dataset.uiuxRejectIncomplete;dialog.querySelector('form').reset();dialog.showModal();dialog.querySelector('textarea')?.focus();},true);
  document.addEventListener('toggle',schedule,true);
  schedule();
}
