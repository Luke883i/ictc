import { $, api, esc, notify, showReceipt, state } from './common.js';
import { refresh } from './controller.js';

const VERSION='1.6.0';
const OWNER='procedure-ui-ux-1-6';
let installed=false;

const IT_LABELS=Object.freeze({
  monitoring:'Monitoraggio normativo e fonti',
  incidents:'Eventi e quasi incidenti',
  objects:'Inventario governato',
  coverage:'Standard, requisiti e mapping',
  actions:'Azioni correttive'
});

function activeGrc(){
  let value=state.activeProcessId||'';
  try{value=value||localStorage.getItem('ictc-grc-process')||'';}catch{}
  return value;
}
function byState(list,id){return(list||[]).find(item=>item.id===id)||null;}
function mark(host,process,phase='overview'){
  if(!host)return;
  host.dataset.uiuxOwner=OWNER;
  host.dataset.uiuxVersion=VERSION;
  host.dataset.uiuxProcess=process;
  host.dataset.uiuxPhase=phase;
  host.dataset.uiuxPrimaryActionMax='1';
  host.dataset.uiuxMaterialQuestionMax='1';
  host.dataset.uiuxPrimaryFactsMax='4';
  host.dataset.uiuxTechnicalDetail='progressive-disclosure';
}
function alreadyTuned(node){return node?.dataset?.uiuxApplied===VERSION;}
function finishTuning(node){if(node)node.dataset.uiuxApplied=VERSION;return node;}
function ensureStyles(){
  if($('#procedureUiUx16Styles'))return;
  const style=document.createElement('style');
  style.id='procedureUiUx16Styles';
  style.textContent=`
    :root{--ictc-uiux-focus:3px solid currentColor}
    [data-uiux-owner="${OWNER}"] button,[data-uiux-owner="${OWNER}"] summary,[data-uiux-owner="${OWNER}"] a.secondary{min-block-size:44px}
    [data-uiux-owner="${OWNER}"] button:focus-visible,[data-uiux-owner="${OWNER}"] summary:focus-visible,[data-uiux-owner="${OWNER}"] a:focus-visible{outline:var(--ictc-uiux-focus);outline-offset:3px}
    .ux-primary{font-weight:750}
    .ux-secondary-actions{margin-block-start:.65rem;border-top:1px solid color-mix(in srgb,currentColor 14%,transparent);padding-block-start:.35rem}
    .ux-secondary-actions>summary,.ux-technical-detail>summary{cursor:pointer;font-weight:650;list-style-position:inside}
    .ux-secondary-actions[open]>.ux-secondary-stack,.ux-technical-detail[open]>.ux-secondary-stack{display:flex;flex-wrap:wrap;gap:.5rem;margin-block-start:.55rem}
    .ux-card-meta-secondary{margin-block-start:.5rem}
    .ux-card-meta-secondary>summary{font-size:.9rem}
    .ux-utility-banner{padding:.65rem 1rem!important;box-shadow:none!important}
    .ux-utility-banner strong{font-size:1rem!important}.ux-utility-banner p{margin:.15rem 0 0!important}
    .ux-progressive-panel>details>summary{font-weight:700;cursor:pointer}.ux-progressive-panel>details>div{margin-block-start:.75rem}
    .ux-decision-note{display:grid;gap:.2rem;padding:.7rem .8rem;border-inline-start:3px solid currentColor;background:color-mix(in srgb,currentColor 4%,transparent);margin:.6rem 0}
    .ux-decision-note small{opacity:.72}.ux-decision-note b{font-size:1rem}
    .ux-terminal-note{font-size:.92rem;opacity:.82;margin:.55rem 0}
    .ux-dialog-form{display:grid;gap:.85rem}.ux-dialog-form label{display:grid;gap:.35rem}.ux-dialog-form textarea,.ux-dialog-form select{inline-size:100%}
    .ux-dialog-actions{display:flex;justify-content:flex-end;gap:.6rem;flex-wrap:wrap}
    .ux-hidden-legacy{display:none!important}
    .ux-epistemic-entry{margin-block-start:1rem}
    .ux-epistemic-entry p{max-inline-size:72ch}
    .mission-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,30rem),1fr))!important}
    .mission-card h3,.incident-card h3,.grc-list article h3{max-inline-size:40ch}
    .mission-card .card-actions,.incident-card .card-actions,.grc-list article footer{align-items:center}
    .finetune-compass>div,.finetune-compass>p{max-inline-size:72ch}
    .epistemic-shell .surface-mode-switch,.epistemic-shell .epistemic-filter-group{gap:.5rem}
    .epistemic-shell .surface-raw{max-block-size:24rem;overflow:auto}
    @media(max-width:860px){.mission-grid{grid-template-columns:1fr!important}.ux-dialog-actions{justify-content:stretch}.ux-dialog-actions>*{inline-size:100%}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
  `;
  document.head.append(style);
}
function makePrimary(node,label){
  if(!node)return null;
  node.textContent=label||node.textContent;
  node.classList.add('primary','ux-primary');
  node.classList.remove('secondary','link-button');
  node.dataset.uiuxPrimary='true';
  return node;
}
function makeSecondary(node,label){
  if(!node)return null;
  if(label)node.textContent=label;
  node.classList.remove('primary','ux-primary');
  node.classList.add('secondary');
  delete node.dataset.uiuxPrimary;
  return node;
}
function disclosure(container,nodes,summary='Altre azioni'){
  const movable=[...new Set((nodes||[]).filter(Boolean))].filter(node=>node.isConnected&&node.parentElement===container);
  if(!movable.length)return null;
  let details=container.querySelector(':scope > details.ux-secondary-actions');
  if(!details){
    details=document.createElement('details');
    details.className='ux-secondary-actions';
    details.innerHTML=`<summary>${esc(summary)}</summary><div class="ux-secondary-stack"></div>`;
    container.append(details);
  }
  const stack=details.querySelector('.ux-secondary-stack');
  for(const node of movable){makeSecondary(node);stack.append(node);}
  return details;
}
function progressivePanel(panel,label){
  if(!panel||panel.dataset.uiuxProgressive==='true')return;
  const children=[...panel.childNodes];
  const details=document.createElement('details');
  details.className='ux-technical-detail';
  const summary=document.createElement('summary');summary.textContent=label;
  const body=document.createElement('div');body.className='ux-progressive-body';
  for(const child of children)body.append(child);
  details.append(summary,body);panel.append(details);
  panel.classList.add('ux-progressive-panel');panel.dataset.uiuxProgressive='true';
}
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
function ensureDialog(id,title,body){
  let dialog=$(`#${id}`);
  if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.id=id;dialog.className='dialog';
  dialog.innerHTML=`<form method="dialog" class="dialog-shell"><header><div><p class="eyebrow">Decisione umana</p><h2>${esc(title)}</h2></div><button type="button" data-uiux-close aria-label="Chiudi">×</button></header><div class="dialog-body">${body}</div><footer class="ux-dialog-actions"><button type="button" data-uiux-close>Annulla</button><button class="primary ux-primary" type="submit">Registra decisione</button></footer></form>`;
  document.body.append(dialog);
  for(const close of dialog.querySelectorAll('[data-uiux-close]'))close.addEventListener('click',()=>dialog.close());
  return dialog;
}

function tuneMonitoringList(){
  const host=$('#monitoringView');if(!host)return;
  mark(host,'monitoring','observe');
  const sectionHeading=[...host.querySelectorAll('.section-head h2')].find(h=>/Piani di monitoraggio/i.test(h.textContent));
  if(sectionHeading)sectionHeading.textContent='Monitoraggi';
  const count=$('#missionCount');if(count)count.setAttribute('aria-label',`${count.textContent} monitoraggi visibili`);
  const missions=[...(state.data?.missions||[])].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const cards=[...host.querySelectorAll('#missionsList .mission-card')];
  cards.forEach((card,index)=>{
    const mission=missions[index];if(!mission||alreadyTuned(card))return;
    mark(card,'monitoring',mission.state);
    const actions=card.querySelector('.card-actions');if(!actions)return;
    const open=actions.querySelector('[data-open-plan]');
    if(open)makePrimary(open,'Apri monitoraggio');
    const others=[...actions.children].filter(node=>node!==open);
    for(const node of others){
      if(node.matches?.('[data-run-mission]'))node.textContent='Esegui controllo adesso';
      if(node.matches?.('[data-pause-mission]'))node.textContent='Sospendi monitoraggio';
      if(node.matches?.('[data-resume-mission]'))node.textContent='Riprendi monitoraggio';
      if(node.matches?.('[data-download-evidence]'))node.textContent='Apri dossier';
    }
    disclosure(actions,others,'Gestisci e consulta prove');
    const meta=card.querySelector('.card-meta');
    if(meta&&!meta.querySelector(':scope > details.ux-card-meta-secondary')){
      const spans=[...meta.querySelectorAll(':scope > span')];
      const technical=spans.filter(span=>/^v\d+/i.test(span.textContent.trim())||/^Ogni\s/i.test(span.textContent.trim()));
      if(technical.length){
        const details=document.createElement('details');details.className='ux-card-meta-secondary ux-technical-detail';details.innerHTML='<summary>Frequenza e versione</summary><div class="ux-secondary-stack"></div>';
        const stack=details.querySelector('.ux-secondary-stack');for(const span of technical)stack.append(span);meta.append(details);
      }
    }
    finishTuning(card);
  });
  const ai=$('#aiSetup');
  if(ai){ai.classList.add('ux-utility-banner');const button=ai.querySelector('button');if(button)makeSecondary(button,'Configura AI opzionale');const strong=ai.querySelector('strong');if(strong)strong.textContent='AI opzionale per mining e analisi';}
}
function tunePlanDialog(){
  const dialog=$('#planDialog'),mission=byState(state.data?.missions,state.activeMissionId);if(!dialog||!mission||!dialog.open)return;
  mark(dialog,'monitoring',mission.state);
  const actions=$('#planActions');if(!actions)return;
  for(const b of actions.querySelectorAll('button'))makeSecondary(b);
  let primary=null;
  if(mission.state==='draft')primary=actions.querySelector('[data-activate-mission]');
  else if(mission.state==='paused')primary=actions.querySelector('[data-resume-mission]');
  else if(mission.state==='needs-plan')primary=actions.querySelector('[data-revise-mission]');
  if(primary){
    const label=mission.state==='draft'?'Attiva monitoraggio':mission.state==='paused'?'Riprendi monitoraggio':'Riprova pianificazione';
    makePrimary(primary,label);
  }
  for(const b of actions.querySelectorAll('[data-run-mission]'))b.textContent='Esegui controllo adesso';
  for(const b of actions.querySelectorAll('[data-pause-mission]'))b.textContent='Sospendi monitoraggio';
  for(const b of actions.querySelectorAll('[data-revise-mission]'))if(b!==primary)b.textContent='Rigenera piano';
  for(const b of actions.querySelectorAll('[data-download-evidence]'))b.textContent='Apri dossier';
  disclosure(actions,[...actions.children].filter(node=>node!==primary&&node.tagName!=='DETAILS'),mission.state==='active'?'Azioni eccezionali e prove':'Alternative e prove');
  const trace=[...dialog.querySelectorAll('.lens-panel')].find(panel=>/Traccia AI/i.test(panel.querySelector('.eyebrow')?.textContent||''));
  progressivePanel(trace,'Traccia tecnica AI');
}
function tuneSourceDialog(){
  const dialog=$('#sourceDialog'),item=byState(state.data?.catalog,state.activeSourceId);if(!dialog||!item||!dialog.open)return;
  mark(dialog,'monitoring','verify-source');
  const facts=[...dialog.querySelectorAll('.source-facts .fact-box')];
  for(const box of facts){
    const label=box.querySelector('span');
    if(/Confidenza AI/i.test(label?.textContent||'')){label.textContent='Classe proposta';const value=box.querySelector('b');if(value)value.textContent=item.sourceClass||'Da classificare';}
  }
  for(const panel of dialog.querySelectorAll('.lens-panel')){
    const eyebrow=panel.querySelector('.eyebrow')?.textContent||'';
    if(/Suggerimento AI/i.test(eyebrow))progressivePanel(panel,'Sintesi e rilevanza proposte dall’AI');
    if(/Traccia AI/i.test(eyebrow))progressivePanel(panel,'Traccia tecnica AI');
  }
  const actions=$('#sourceActions');if(actions){
    const verify=actions.querySelector('[data-source-decision="verified"]');if(verify)makePrimary(verify,'Verifica fonte');
    const reject=actions.querySelector('[data-source-decision="rejected"]');if(reject)makeSecondary(reject,'Escludi fonte');
    const dossier=actions.querySelector('[data-download-evidence]');if(dossier)dossier.textContent='Apri dossier';
    disclosure(actions,[reject,dossier].filter(Boolean),'Alternative e prove');
  }
}
function tuneMonitoring(){tuneMonitoringList();tunePlanDialog();tuneSourceDialog();}

function tuneIncidents(){
  const host=$('#incidentsView');if(!host)return;mark(host,'incidents','case-work');
  const incidents=[...(state.data?.incidents||[])].sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  [...host.querySelectorAll('#incidentList .incident-card')].forEach((card,index)=>{
    const item=incidents[index];if(!item||alreadyTuned(card))return;mark(card,'incidents',item.state);
    const actions=card.querySelector('.card-actions');if(!actions)return;
    const open=actions.querySelector('[data-open-incident]');if(open)makePrimary(open,'Apri caso');
    const dossier=actions.querySelector('[data-download-evidence]');if(dossier)dossier.textContent='Apri dossier';
    disclosure(actions,[dossier].filter(Boolean),'Prove');
    finishTuning(card);
  });
  const workspace=$('#incidentWorkspace');if(!workspace||!workspace.open)return;mark(workspace,'incidents',byState(state.data?.incidents,state.activeIncidentId)?.state||'review');
  for(const panel of workspace.querySelectorAll('.lens-panel')){
    const label=panel.querySelector('.eyebrow')?.textContent||'';
    if(/Analisi AI/i.test(label))progressivePanel(panel,'Analisi AI proposta');
    else if(/Traccia AI/i.test(label))progressivePanel(panel,'Traccia tecnica AI');
    else if(/Conferme umane/i.test(label))progressivePanel(panel,'Conferme registrate');
    else if(/Versioni/i.test(label))progressivePanel(panel,'Cronologia versioni');
  }
  const actions=$('#workspaceActions');if(!actions)return;
  for(const b of actions.querySelectorAll('button'))makeSecondary(b);
  let primary=actions.querySelector('[data-submit-incident]')||actions.querySelector('[data-close-incident]')||actions.querySelector('[data-save-manual]')||null;
  if(primary){
    if(primary.matches('[data-submit-incident]'))makePrimary(primary,'Conferma e invia caso');
    else if(primary.matches('[data-close-incident]'))makePrimary(primary,'Chiudi caso');
    else makePrimary(primary,'Salva versione manuale');
  }
  const generate=actions.querySelector('[data-generate-draft]');if(generate)generate.textContent='Chiedi una bozza all’AI';
  disclosure(actions,[...actions.children].filter(node=>node!==primary&&node.tagName!=='DETAILS'),'Alternative e prove');
}

function tuneObjects(root,p){
  if(!root||!p)return;mark(root,'objects','registry');
  const cards=[...root.querySelectorAll('.grc-list > article')];
  cards.forEach((card,index)=>{
    const item=p.objects?.[index];if(!item||alreadyTuned(card))return;mark(card,'objects',item.status);
    const footer=card.querySelector('footer');if(!footer)return;
    for(const b of footer.querySelectorAll('button'))makeSecondary(b);
    const validate=footer.querySelector('[data-object-review="active"]');
    const reject=footer.querySelector('[data-object-review="rejected"]');
    const attest=footer.querySelector('[data-object-attest]');
    const dossier=footer.querySelector('[data-grc-evidence]');
    let primary=null;
    if(item.status==='candidate'&&validate)primary=makePrimary(validate,'Conferma oggetto');
    else if(item.status==='active'&&attest){
      const due=Date.parse(item.attestationDueAt||'');
      if(!Number.isNaN(due)&&due<=Date.now())primary=makePrimary(attest,'Riesamina oggetto');
      else attest.textContent='Riesamina prima della scadenza';
    }
    if(reject)reject.textContent='Escludi dal registro';if(dossier)dossier.textContent='Apri dossier';
    disclosure(footer,[reject,attest,dossier].filter(node=>node&&node!==primary),'Alternative e prove');
    const facts=card.querySelector('.finetune-object-facts');if(facts){const legacy=[...card.children].find(node=>node.tagName==='P'&&!node.classList.contains('quiet'));if(legacy)legacy.classList.add('ux-hidden-legacy');}
    finishTuning(card);
  });
}
function setCoverageKpis(root,p){
  const kpis=[...root.querySelectorAll('.grc-kpis .grc-kpi')];if(kpis.length<3)return;
  const values=[['Decisioni registrate',p.decided??0,`${p.declared??0} elementi dichiarati`],['Gap',p.gaps??0,'decisioni esplicite'],['Da decidere',p.unresolved??0,'nessuna inferenza automatica'],['Fuori perimetro',p.notApplicable??0,'decisioni di scope']];
  kpis.slice(0,4).forEach((card,index)=>{const row=values[index];if(!row)return;card.querySelector('small').textContent=row[0];card.querySelector('strong').textContent=String(row[1]);let span=card.querySelector('span');if(!span){span=document.createElement('span');card.append(span);}span.textContent=row[2];});
  root.dataset.uiuxCoveragePercentagePrimary='false';
}
function ensureScopeDialog(){
  const dialog=ensureDialog('uiuxScopeDialog','Decidi il perimetro del requisito',`<div class="ux-dialog-form" data-uiux-scope-form><label>Decisione<select name="decision" required><option value="applicable">Nel perimetro</option><option value="not-applicable">Fuori perimetro</option><option value="deferred">Rinvia decisione</option><option value="unknown">Informazioni insufficienti</option></select></label><label>Motivazione<textarea name="reason" rows="5" required placeholder="Perche' questa decisione e' appropriata nel perimetro dichiarato?"></textarea></label><p class="boundary">La decisione di perimetro non e' un mapping e non prova compliance o efficacia.</p></div>`);
  if(dialog.dataset.uiuxBound)return dialog;dialog.dataset.uiuxBound='true';
  dialog.querySelector('form.dialog-shell').addEventListener('submit',async event=>{
    event.preventDefault();const form=dialog.querySelector('form.dialog-shell'),data=new FormData(form),requirementRef=dialog.dataset.requirementRef||'';
    if(!requirementRef)return notify('Riferimento requisito mancante',true);
    const result=await write(()=>api('/api/standards/requirement-scope',{method:'POST',body:JSON.stringify({requirementRef,decision:data.get('decision'),reason:data.get('reason')})}),'Decisione di perimetro registrata');
    if(result)dialog.close();
  });
  return dialog;
}
function ensureMappingDialog(){
  const dialog=ensureDialog('uiuxMappingDialog','Decidi il mapping',`<div class="ux-dialog-form" data-uiux-mapping-form><label>Decisione<select name="decision" required><option value="mapped">Conferma mapping</option><option value="gap">Registra gap</option><option value="rejected">Rifiuta proposta</option></select></label><label>Motivazione<textarea name="reason" rows="5" required placeholder="Quale evidenza o limite sostiene la decisione?"></textarea></label><p class="boundary">Mapped significa collegamento umano a target governati; non dimostra efficacia o compliance.</p></div>`);
  if(dialog.dataset.uiuxBound)return dialog;dialog.dataset.uiuxBound='true';
  dialog.querySelector('form.dialog-shell').addEventListener('submit',async event=>{
    event.preventDefault();const form=dialog.querySelector('form.dialog-shell'),data=new FormData(form),id=dialog.dataset.mappingId||'';
    if(!id)return notify('Mapping non disponibile',true);
    const result=await write(()=>api(`/api/grc/mappings/${id}/decision`,{method:'POST',body:JSON.stringify({decision:data.get('decision'),reason:data.get('reason')})}),'Decisione mapping registrata');
    if(result)dialog.close();
  });
  return dialog;
}
function tuneCoverage(root,p){
  if(!root||!p)return;mark(root,'coverage','mapping');setCoverageKpis(root,p);
  const cards=[...root.querySelectorAll('.grc-list > article')];
  cards.forEach((card,index)=>{
    const item=p.mappings?.[index];if(!item||alreadyTuned(card))return;mark(card,'coverage',item.state);
    const footer=card.querySelector('footer');if(!footer)return;
    for(const legacy of footer.querySelectorAll('[data-mapping-decision]'))legacy.remove();
    const dossier=footer.querySelector('[data-grc-evidence]');if(dossier){makeSecondary(dossier,'Apri dossier');}
    if(item.state==='proposed'&&state.role==='admin'){
      const scope=item.requirementScope?.decision||null;
      const button=document.createElement('button');button.type='button';button.className='primary ux-primary';
      if(scope==='applicable'){
        button.dataset.uiuxMappingDecision=item.id;button.textContent='Decidi mapping';
      }else{
        button.dataset.uiuxScopeDecision=item.id;button.dataset.requirementRef=item.requirementRef||'';
        button.textContent=scope==='not-applicable'?'Rivedi perimetro':scope==='deferred'?'Riprendi decisione di perimetro':'Decidi perimetro';
      }
      footer.prepend(button);
      if(scope==='not-applicable'){
        const note=document.createElement('p');note.className='ux-terminal-note';note.textContent='Fuori perimetro: nessuna decisione di mapping e\' richiesta finche\' il perimetro non cambia.';card.querySelector('footer')?.before(note);
      }
    }
    disclosure(footer,[dossier].filter(Boolean),'Prove');
    finishTuning(card);
  });
}
function ensureActionVerifyDialog(){
  const dialog=ensureDialog('uiuxActionVerifyDialog','Verifica il risultato dell’azione',`<div class="ux-dialog-form" data-uiux-action-verify-form><label>Esito<select name="decision" required><option value="closed">Chiudi: risultato verificato</option><option value="rework">Riapri: serve rilavorazione</option></select></label><label>Motivazione<textarea name="reason" rows="5" required placeholder="Che cosa hai verificato e con quale limite?"></textarea></label><label>Riferimenti evidenza<textarea name="evidenceRefs" rows="4" placeholder="URL o EvidenceRef, uno per riga"></textarea></label><label class="check" data-uiux-self-review hidden><input type="checkbox" name="selfReviewAcknowledged"> Ho completato io il lavoro: confermo esplicitamente la self-review tracciata.</label><p class="boundary">Completato non significa chiuso. La chiusura richiede verifica umana ed evidenza risolvibile.</p></div>`);
  if(dialog.dataset.uiuxBound)return dialog;dialog.dataset.uiuxBound='true';
  dialog.querySelector('form.dialog-shell').addEventListener('submit',async event=>{
    event.preventDefault();const form=dialog.querySelector('form.dialog-shell'),data=new FormData(form),id=dialog.dataset.actionId||'',decision=data.get('decision'),evidenceRefs=String(data.get('evidenceRefs')||'').split(/\n|,/).map(x=>x.trim()).filter(Boolean),selfReview=form.querySelector('[name="selfReviewAcknowledged"]')?.checked===true;
    if(decision==='closed'&&!evidenceRefs.length)return notify('Per chiudere serve almeno un riferimento evidenza',true);
    const result=await write(()=>api(`/api/grc/actions/${id}/verify`,{method:'POST',body:JSON.stringify({decision,reason:data.get('reason'),evidenceRefs,selfReviewAcknowledged:selfReview})}),'Verifica azione registrata');
    if(result)dialog.close();
  });
  return dialog;
}
function ensureActionStateDialog(){
  const dialog=ensureDialog('uiuxActionStateDialog','Registra un cambio di stato',`<div class="ux-dialog-form" data-uiux-action-state-form><p data-uiux-action-state-copy></p><label>Motivazione<textarea name="note" rows="4" required></textarea></label><p class="boundary">Un cambio di stato operativo non equivale a verifica del risultato.</p></div>`);
  if(dialog.dataset.uiuxBound)return dialog;dialog.dataset.uiuxBound='true';
  dialog.querySelector('form.dialog-shell').addEventListener('submit',async event=>{
    event.preventDefault();const form=dialog.querySelector('form.dialog-shell'),data=new FormData(form),id=dialog.dataset.actionId||'',next=dialog.dataset.nextState||'';
    const result=await write(()=>api(`/api/grc/actions/${id}/progress`,{method:'POST',body:JSON.stringify({state:next,note:data.get('note')})}),'Stato azione registrato');if(result)dialog.close();
  });
  return dialog;
}
function tuneActions(root,p){
  if(!root||!p)return;mark(root,'actions','action-lifecycle');
  const cards=[...root.querySelectorAll('.grc-list > article')];
  cards.forEach((card,index)=>{
    const item=p.actions?.[index];if(!item||alreadyTuned(card))return;mark(card,'actions',item.state);
    const footer=card.querySelector('footer');if(!footer)return;
    for(const b of footer.querySelectorAll('button'))makeSecondary(b);
    const dossier=footer.querySelector('[data-grc-evidence]');if(dossier)dossier.textContent='Apri dossier';
    const ai=footer.querySelector('[data-action-ai]');if(ai)ai.textContent='Chiedi priorita'+' all’AI';
    const adopt=footer.querySelector('[data-action-adopt]');
    for(const progress of [...footer.querySelectorAll('[data-action-progress]')])progress.remove();
    let primary=null;
    if(item.state==='proposed'&&adopt)primary=makePrimary(adopt,'Adotta azione');
    else if(item.state==='open'){
      primary=document.createElement('button');primary.type='button';primary.dataset.uiuxActionQuick=item.id;primary.dataset.nextState='in-progress';primary.textContent='Avvia lavoro';footer.prepend(primary);makePrimary(primary);
    }else if(item.state==='in-progress'){
      primary=document.createElement('button');primary.type='button';primary.dataset.uiuxActionQuick=item.id;primary.dataset.nextState='done';primary.textContent='Invia a verifica';footer.prepend(primary);makePrimary(primary);
      const blocked=document.createElement('button');blocked.type='button';blocked.dataset.uiuxActionState=item.id;blocked.dataset.nextState='blocked';blocked.textContent='Segnala blocco';footer.append(blocked);makeSecondary(blocked);
    }else if(item.state==='blocked'){
      primary=document.createElement('button');primary.type='button';primary.dataset.uiuxActionQuick=item.id;primary.dataset.nextState='in-progress';primary.textContent='Riprendi lavoro';footer.prepend(primary);makePrimary(primary);
    }else if(item.state==='ready-for-review'){
      primary=document.createElement('button');primary.type='button';primary.dataset.uiuxActionVerify=item.id;primary.textContent='Verifica risultato';footer.prepend(primary);makePrimary(primary);
    }
    const cancellable=['open','in-progress','blocked','ready-for-review'].includes(item.state);
    let cancel=null;if(cancellable){cancel=document.createElement('button');cancel.type='button';cancel.dataset.uiuxActionState=item.id;cancel.dataset.nextState='cancelled';cancel.textContent='Annulla azione';footer.append(cancel);makeSecondary(cancel);}
    disclosure(footer,[ai,dossier,cancel,...footer.querySelectorAll('[data-uiux-action-state]')].filter(node=>node&&node!==primary),'Alternative e prove');
    finishTuning(card);
  });
}
function tuneGrc(){
  const root=$('#grcWorkspace'),id=activeGrc(),grc=state.data?.grc;if(!root||!grc)return;
  if(id==='objects')tuneObjects(root,grc.objects);
  else if(id==='coverage')tuneCoverage(root,grc.coverage);
  else if(id==='actions')tuneActions(root,grc.actions);
}

function tuneEpistemic(){
  const card=$('#epistemicMetaCard'),proof=$('#proofView');
  if(card&&proof&&card.parentElement!==proof){card.classList.add('ux-epistemic-entry');card.querySelector('h2')&&(card.querySelector('h2').textContent='Dettagli epistemici');const button=card.querySelector('[data-service="epistemic"]');if(button)button.textContent='Apri dettagli epistemici';proof.append(card);}
  const view=$('#epistemicView');if(!view)return;mark(view,'cross-cutting','technical-inspection');
  for(const chip of view.querySelectorAll('.surface-chip'))if(/atomi nella pagina/i.test(chip.textContent)){chip.title=chip.textContent;chip.textContent='Traccia disponibile';}
  for(const cluster of view.querySelectorAll('[data-explore-procedure]')){
    const id=cluster.dataset.exploreProcedure,label=IT_LABELS[id]||id||'Trasversale';const span=cluster.querySelector('span');if(span)span.textContent=label;const small=cluster.querySelector('small');if(small)small.textContent='Apri traccia';
  }
}

function ensureDialogs(){ensureScopeDialog();ensureMappingDialog();ensureActionVerifyDialog();ensureActionStateDialog();}
function bindCustomActions(){
  document.addEventListener('click',async event=>{
    if(event.target.closest?.('[data-open-plan],[data-open-source],[data-open-incident]'))setTimeout(schedule,0);
    const scope=event.target.closest?.('[data-uiux-scope-decision]');if(scope){event.preventDefault();event.stopImmediatePropagation();const dialog=ensureScopeDialog();dialog.dataset.mappingId=scope.dataset.uiuxScopeDecision;dialog.dataset.requirementRef=scope.dataset.requirementRef||'';const form=dialog.querySelector('form.dialog-shell');form.reset();dialog.showModal();form.querySelector('select,textarea')?.focus();return;}
    const map=event.target.closest?.('[data-uiux-mapping-decision]');if(map){event.preventDefault();event.stopImmediatePropagation();const dialog=ensureMappingDialog();dialog.dataset.mappingId=map.dataset.uiuxMappingDecision;dialog.querySelector('form.dialog-shell').reset();dialog.showModal();return;}
    const verify=event.target.closest?.('[data-uiux-action-verify]');if(verify){event.preventDefault();event.stopImmediatePropagation();const item=byState(state.data?.grc?.actions?.actions,verify.dataset.uiuxActionVerify),dialog=ensureActionVerifyDialog(),form=dialog.querySelector('form.dialog-shell');dialog.dataset.actionId=verify.dataset.uiuxActionVerify;form.reset();const self=item?.completedBy&&item.completedBy===state.data?.actor?.id,field=form.querySelector('[data-uiux-self-review]');if(field){field.hidden=!self;field.querySelector('input').required=Boolean(self);}dialog.showModal();return;}
    const quick=event.target.closest?.('[data-uiux-action-quick]');if(quick){event.preventDefault();event.stopImmediatePropagation();await write(()=>api(`/api/grc/actions/${quick.dataset.uiuxActionQuick}/progress`,{method:'POST',body:JSON.stringify({state:quick.dataset.nextState,note:quick.dataset.nextState==='done'?'Lavoro completato e inviato a verifica':'Transizione operativa registrata dalla superficie guidata'})}),'Stato azione aggiornato');return;}
    const actionState=event.target.closest?.('[data-uiux-action-state]');if(actionState){event.preventDefault();event.stopImmediatePropagation();const dialog=ensureActionStateDialog();dialog.dataset.actionId=actionState.dataset.uiuxActionState;dialog.dataset.nextState=actionState.dataset.nextState;const form=dialog.querySelector('form.dialog-shell');form.reset();const copy=form.querySelector('[data-uiux-action-state-copy]');copy.textContent=actionState.dataset.nextState==='cancelled'?'Spiega perche'+' l’azione viene annullata.':'Descrivi il blocco operativo prima di registrarlo.';dialog.showModal();return;}
  },true);
}
function render(){
  if(!state.data)return;
  ensureStyles();
  tuneMonitoring();
  tuneIncidents();
  tuneGrc();
  tuneEpistemic();
  document.documentElement.dataset.ictcUiUxFinetuning=VERSION;
}
function schedule(){queueMicrotask(()=>queueMicrotask(render));}
export function installProcedureUiUxFinetuning(){
  if(installed)return;installed=true;
  ensureStyles();ensureDialogs();bindCustomActions();
  document.addEventListener('ictc:rendered',schedule);
  document.addEventListener('ictc:surface-changed',schedule);
  document.addEventListener('toggle',event=>{if(event.target.closest?.('#planDialog,#sourceDialog,#incidentWorkspace'))schedule();},true);
  schedule();
}
