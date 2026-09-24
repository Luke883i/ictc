import { state } from './common.js';

const VERSION='a6-ux3';
let installed=false;

const PROCESS_ICONS=Object.freeze({
  monitoring:'<svg class="lucide a6-process-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg>',
  incidents:'<svg class="lucide a6-process-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4m0 3h.01"/></svg>',
  objects:'<svg class="lucide a6-process-icon" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
  coverage:'<svg class="lucide a6-process-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/></svg>',
  actions:'<svg class="lucide a6-process-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  risks:'<svg class="lucide a6-process-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5z"/><path d="M12 8v4m0 4h.01"/></svg>',
  assurance:'<svg class="lucide a6-process-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4m-8-5 2 2 4-4"/></svg>'
});
const TERMINAL_INCIDENT_STATES=new Set(['closed','resolved','cancelled']);
const CURRENT_MONITORING_STATES=new Set(['active','planning','draft','needs-plan']);

function journey(node,{process,stage='operate',intent,authority='navigation',effect='none'}){
  if(!node)return;
  node.dataset.journeyProcess=process;
  node.dataset.journeyStage=stage;
  node.dataset.journeyIntent=intent;
  node.dataset.journeyAuthority=authority;
  node.dataset.journeyEvidenceEffect=effect;
}

function owner(root,id){
  if(!root)return;
  root.dataset.a6Ux3Operational=VERSION;
  root.dataset.a6OperationalOwner=id;
}

function searchText(item){
  const fields=['id','title','name','objective','state','status','eventKind','operationalSeverity','sourceAuthority','owner','criticality','kind','type','shortName','edition','issuer'];
  return fields.map(key=>item?.[key]).filter(value=>value!==undefined&&value!==null).join(' ').toLocaleLowerCase('it-IT');
}

function worklistCompact(root){
  const section=root?.querySelector(':scope > [data-procedure-attention-slot] [data-procedure-worklist], [data-procedure-attention-slot] [data-procedure-worklist]');
  if(!section)return;
  section.dataset.a6AttentionQueue='compact';
  const eyebrow=section.querySelector('.section-head .eyebrow');
  const copy=section.querySelector('.section-head p');
  if(eyebrow)eyebrow.hidden=true;
  if(copy)copy.hidden=true;
}

function compactFrame(root){
  const frame=root?.querySelector(':scope > .procedure-frame');
  if(!frame)return;
  frame.dataset.a6OperationalFrame='compact';
  const copy=frame.querySelector('.procedure-frame-copy');
  const purpose=copy?.querySelector('.procedure-purpose');
  const value=copy?.querySelector('.procedure-value');
  if(purpose&&value&&!copy.dataset.a6SubtitleMerged){
    const p=String(purpose.textContent||'').trim(),v=String(value.textContent||'').trim();
    purpose.textContent=[p,v].filter(Boolean).join(' ');
    value.hidden=true;
    copy.dataset.a6SubtitleMerged='true';
  }
}

function homeOwner(){
  const root=document.querySelector('#homeView'),queue=document.querySelector('#homePriorities');
  if(!root||!queue)return;
  owner(root,'home');
  queue.dataset.a6OperationalQueue='decision-then-priority';
  queue.dataset.a6OperationalOwner='home-worklist';
  for(const button of queue.querySelectorAll('.home-business-priority')){
    const label=button.querySelector('b'),reason=button.querySelector('small'),open=button.querySelector('.home-priority-open');
    if(!label||!reason||!open||button.dataset.a6PriorityRow==='compact')continue;
    button.dataset.a6PriorityRow='compact';
    const processId=button.dataset.grcProcess||button.dataset.service||'';
    label.parentElement?.classList.add('a6-priority-identity');
    label.dataset.a6ProcessIcon=processId;
    if(!label.querySelector('.a6-process-icon')&&PROCESS_ICONS[processId])label.insertAdjacentHTML('afterbegin',PROCESS_ICONS[processId]);
    open.childNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE)node.textContent='';});
    open.setAttribute('aria-label',`Apri ${label.textContent||'processo'}`);
  }
}

function retireLegacyRegistryHead(host,id){
  const section=host?.closest('.section-block');
  const head=section?.querySelector(':scope > .section-head');
  if(!head)return;
  head.hidden=true;
  head.dataset.a6Ux3SemanticOwner='retired';
  head.dataset.a6Ux3RetiredBy=id;
  const legacyCount=head.querySelector('.counter,[id$="Count"]');
  if(legacyCount){
    legacyCount.dataset.semanticCountOwner='retired';
    legacyCount.setAttribute('aria-hidden','true');
  }
}

function registryWrap(host,{id,label,process,count,open=false}){
  if(!host)return null;
  retireLegacyRegistryHead(host,id);
  let details=host.closest(`[data-a6-registry="${id}"]`);
  if(!details&&id==='monitoring'){
    const canonical=host.closest('[data-rn-monitoring-secondary]');
    if(canonical){details=canonical;details.dataset.a6Registry=id;details.classList.add('a6-operational-registry');}
  }
  if(!details){
    details=document.createElement('details');
    details.className='a6-operational-registry';
    details.dataset.a6Registry=id;
    details.open=open;
    const summary=document.createElement('summary');
    summary.innerHTML=`<span>${label}</span><small data-a6-registry-count-group data-semantic-count-owner="primary"><b data-a6-registry-count>0 di 0</b></small>`;
    journey(summary,{process,intent:`inspect-${id}-registry`});
    host.parentElement?.insertBefore(details,host);
    details.append(summary,host);
  }
  const queueId=id==='monitoring'?'monitoring-jobs':id;
  let queue=details.querySelector(`:scope > [data-seq-queue-tools="${CSS.escape(queueId)}"]`);
  if(!queue){
    const sibling=host.previousElementSibling;
    if(sibling?.matches?.(`[data-seq-queue-tools="${CSS.escape(queueId)}"]`))queue=sibling;
  }
  if(queue&&queue.parentElement!==details)details.insertBefore(queue,host);
  const summary=details.querySelector(':scope > summary');
  if(summary){
    journey(summary,{process,intent:`inspect-${id}-registry`});
    const legacyCount=summary.querySelector(':scope > .counter');if(legacyCount){legacyCount.hidden=true;legacyCount.dataset.semanticCountOwner='retired';legacyCount.setAttribute('aria-hidden','true');}
    for(const stale of summary.querySelectorAll('[data-a6-registry-count-label],[data-a6-registry-total]'))stale.remove();
    let countGroup=summary.querySelector('[data-a6-registry-count-group]');
    if(!countGroup){countGroup=document.createElement('small');countGroup.dataset.a6RegistryCountGroup='';countGroup.dataset.semanticCountOwner='primary';countGroup.innerHTML='<b data-a6-registry-count>0 di 0</b>';summary.append(countGroup);}
  }
  const previousTotal=Number(details.dataset.a6RegistryTotal||0),nextTotal=Number(count||0);
  if(details.dataset.a6RegistryDefaultApplied!=='true'&&!open){details.open=false;details.dataset.a6RegistryDefaultApplied='true';}
  if(open&&nextTotal>0&&previousTotal===0){details.open=true;details.dataset.a6RegistryDefaultApplied='true';}
  details.dataset.a6RegistryTotal=String(nextTotal);
  const countNode=details.querySelector('[data-a6-registry-count]');if(countNode)countNode.textContent=`${nextTotal} di ${nextTotal}`;
  return details;
}

function ensureFilter(details,{id,process,options,defaultValue}){
  if(!details)return;
  let tools=details.querySelector(`[data-a6-filter="${id}"]`);
  if(!tools){
    tools=document.createElement('div');
    tools.className='a6-operational-filter';
    tools.dataset.a6Filter=id;
    tools.dataset.enduserPrimitive='ControlRail';
    tools.dataset.controlRail=id;
    tools.innerHTML=`<label><span>Cerca</span><input type="search" data-a6-search="${id}" aria-label="Cerca nel registro ${id}"></label><label><span>Stato</span><select data-a6-state="${id}" aria-label="Filtra stato ${id}">${options.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label>`;
    details.insertBefore(tools,details.children[1]||null);
  }
  const select=tools.querySelector(`[data-a6-state="${id}"]`);
  if(select&&!select.dataset.a6DefaultApplied){select.value=defaultValue;select.dataset.a6DefaultApplied='true';}
  owner(details,`${process}-registry`);
}

function stateMatches(registryId,filter,stateValue){
  if(filter==='all'||!filter)return true;
  if(registryId==='monitoring'){
    if(filter==='current')return CURRENT_MONITORING_STATES.has(stateValue);
    if(filter==='active')return stateValue==='active';
    if(filter==='draft')return ['planning','draft','needs-plan'].includes(stateValue);
    if(filter==='inactive')return stateValue==='paused';
  }
  if(registryId==='incidents'){
    if(filter==='open')return !TERMINAL_INCIDENT_STATES.has(stateValue);
    return stateValue===filter;
  }
  return stateValue===filter;
}

function applyCardFilter(id){
  const details=document.querySelector(`[data-a6-registry="${id}"]`);
  if(!details)return;
  const query=String(details.querySelector(`[data-a6-search="${id}"]`)?.value||'').trim().toLocaleLowerCase('it-IT');
  const select=details.querySelector(`[data-a6-state="${id}"]`);
  const filter=String(select?.value||'all');
  let shown=0;
  for(const card of details.querySelectorAll('[data-a6-filter-card]')){
    const recordText=String(card.dataset.a6RecordSearch||'');
    const recordState=String(card.dataset.a6RecordState||'');
    const visible=(!query||recordText.includes(query))&&stateMatches(id,filter,recordState);
    card.hidden=!visible;
    if(visible)shown++;
  }
  const count=details.querySelector('[data-a6-registry-count]');
  const total=Number(details.dataset.a6RegistryTotal||0);
  if(count)count.textContent=`${shown} di ${total}`;
  details.dataset.a6VisibleCount=String(shown);
  details.dataset.a6CountSemantics=filter==='all'&&!query?'total':'visible-filtered';
}

function missionId(card){
  return card.querySelector('[data-open-plan]')?.dataset.openPlan||card.querySelector('[data-edit-job-profile]')?.dataset.editJobProfile||'';
}

function monitoringOwner(){
  const root=document.querySelector('#monitoringView');
  if(!root)return;
  owner(root,'monitoring');compactFrame(root);worklistCompact(root);
  const sourceSection=root.querySelector('#catalogList')?.closest('.section-block');
  if(sourceSection){root.classList.add('a6-ordered-flow');sourceSection.dataset.a6FlowOrder='primary';}
  const attention=root.querySelector(':scope > [data-procedure-attention-slot="monitoring"]');if(attention)attention.dataset.a6FlowOrder='attention';
  const entry=root.querySelector('[data-open-contribution] strong');if(entry)entry.textContent='Aggiungi fonte o materiale';
  const entryNote=root.querySelector('[data-open-contribution] small');if(entryNote)entryNote.textContent='Registra prima l’originale; analisi e impatto restano separati e revisionabili.';
  const material=root.querySelector('.contribute-card');if(material){const h=material.querySelector('h2'),p=material.querySelector('h2 + p');if(h)h.textContent='Materiali in ingresso';if(p)p.textContent='Originali conservati che possono generare una fonte candidata, ma non sono ancora fonti verificate.';}
  const list=root.querySelector('#missionsList');if(!list)return;
  const byId=new Map((state.data?.missions||[]).map(item=>[item.id,item]));
  const details=registryWrap(list,{id:'monitoring',label:'Monitoraggi',process:'monitoring',count:byId.size,open:false});
  let unbound=0;
  for(const card of list.querySelectorAll('.mission-card,article')){
    const id=missionId(card),item=byId.get(id);
    if(!id||!item){card.dataset.a6RecordBinding='unresolved';unbound++;continue;}
    card.dataset.a6FilterCard='';card.dataset.a6RecordBinding='stable-id';card.dataset.a6RecordId=id;card.dataset.a6RecordState=item.state||'';card.dataset.recordState=item.state||'';card.dataset.a6RecordSearch=searchText(item);
    const activations=(item.history||item.auditTrail||[]).filter(event=>['monitoring.mission.activated','monitoring.mission.resumed'].includes(event?.type||event?.eventType)).length;
    const cycles=activations>0?activations:Number(item.runCount||0)>0?1:0;
    card.dataset.a6ActivationCycles=String(cycles);
  }
  details.dataset.a6UnboundRecords=String(unbound);
}

function incidentId(card){return card.querySelector('[data-open-incident]')?.dataset.openIncident||'';}
function incidentOwner(){
  const root=document.querySelector('#incidentsView');
  if(!root)return;
  owner(root,'incidents');compactFrame(root);worklistCompact(root);
  const list=root.querySelector('#incidentList');if(!list)return;
  const byId=new Map((state.data?.incidents||[]).map(item=>[item.id,item]));
  const details=registryWrap(list,{id:'incidents',label:'Eventi registrati',process:'incidents',count:byId.size,open:true});
  let unbound=0;
  for(const card of list.querySelectorAll('.incident-card,article')){
    const id=incidentId(card),item=byId.get(id);
    if(!id||!item){card.dataset.a6RecordBinding='unresolved';unbound++;continue;}
    card.dataset.a6FilterCard='';card.dataset.a6RecordBinding='stable-id';card.dataset.a6RecordId=id;card.classList.add('p2-record-row');card.dataset.enduserPrimitive='RecordRow';card.dataset.recordGrammar='row-list';card.dataset.recordId=id;card.dataset.a6RecordState=item.state||'';card.dataset.recordState=item.state||'';card.dataset.a6RecordSearch=searchText(item);
    if(TERMINAL_INCIDENT_STATES.has(item.state)){
      card.dataset.a6TerminalRecord='true';
      for(const node of card.querySelectorAll('[data-procedure-record-next],.procedure-record-facts span,.procedure-record-facts li')){if(/verifica formulazione|chiarimento|approvazione/i.test(String(node.textContent||'')))node.hidden=true;}
      const open=card.querySelector('[data-open-incident]');if(open)open.textContent='Consulta fascicolo';
    }
  }
  details.dataset.a6UnboundRecords=String(unbound);
}

function recordId(card){
  return card.dataset.recordId||card.querySelector('[data-id]')?.dataset.id||card.querySelector('[data-object-attest]')?.dataset.objectAttest||card.querySelector('[data-ao-complete-object]')?.dataset.aoCompleteObject||(card.querySelector('[data-grc-evidence]')?.dataset.grcEvidence||'').match(/grc-object\/([^/.]+)/)?.[1]||'';
}
function objectOwner(){
  const root=document.querySelector('#grcWorkspace');if(!root)return;
  const active=state.activeProcessId||(()=>{try{return localStorage.getItem('ictc-grc-process')||'';}catch{return'';}})();if(active!=='objects')return;
  owner(root,'objects');compactFrame(root);worklistCompact(root);
  const byId=new Map((state.data?.grc?.objects?.objects||[]).map(item=>[item.id,item]));
  let unbound=0;
  for(const card of root.querySelectorAll('.grc-list > article')){
    const id=recordId(card),item=byId.get(id);if(!id||!item){card.dataset.a6RecordBinding='unresolved';unbound++;continue;}
    card.dataset.a6RecordBinding='stable-id';card.dataset.a6RecordId=id;card.dataset.a6RecordState=item.status||'';card.dataset.a6RecordSearch=searchText(item);
    card.dataset.a6ObjectLifecycle=['rejected','retired'].includes(item.status)?'terminal':item.status==='candidate'?'candidate':'governed';
    const complete=Boolean(item.ownerRef?.id||item.owner)&&Boolean(item.sourceAuthority);card.dataset.a6ObjectBasis=complete?'complete':'incomplete';
    if(item.attestationDueAt)card.dataset.a6ReviewDueAt=item.attestationDueAt;
  }
  root.dataset.a6UnboundRecords=String(unbound);
  const search=root.querySelector('[data-seq-ao-search]'),filter=root.querySelector('[data-seq-ao-filter]');
  if(search){search.dataset.a6StableRecordSearch='';search.setAttribute('aria-label','Cerca oggetti per identità registrata');}
  if(filter){filter.dataset.a6StableStateFilter='';filter.setAttribute('aria-label','Filtra lifecycle oggetti');}
}

function coverageOwner(){
  const root=document.querySelector('#grcWorkspace');if(!root)return;
  const active=state.activeProcessId||(()=>{try{return localStorage.getItem('ictc-grc-process')||'';}catch{return'';}})();if(active!=='coverage')return;
  owner(root,'coverage');compactFrame(root);worklistCompact(root);
  const library=root.querySelector('.market-section');const attention=root.querySelector(':scope > [data-procedure-attention-slot="coverage"]');
  if(library){root.classList.add('a6-ordered-flow');library.dataset.a6FlowOrder='primary';}if(attention)attention.dataset.a6FlowOrder='attention';
  for(const detail of root.querySelectorAll('.finetune-concept-drilldown')){detail.hidden=true;detail.dataset.a6RetiredDuplicate='concept-drilldown';}
  for(const detail of root.querySelectorAll('.market-scope-editor')){detail.hidden=false;detail.dataset.a6ScopePopup='native-details-overlay';}
  for(const card of root.querySelectorAll('[data-framework-card]')){const button=card.querySelector('[data-open-standard-browser]');if(button){button.textContent='Comprendi standard';button.dataset.a6StandardEntry='single';button.dataset.a6StandardFramework=card.dataset.frameworkCard||'';if(!button.dataset.journeyProcess)journey(button,{process:'coverage',intent:'inspect-standard-reference'});}}
}

function revealTypedTarget(event){
  const recordId=event.detail?.recordId;if(!recordId)return;
  const card=document.querySelector(`[data-a6-record-id="${CSS.escape(recordId)}"]`);if(!card)return;
  const registry=card.closest('[data-a6-registry]');if(registry){registry.open=true;const select=registry.querySelector('[data-a6-state]');if(select){select.value='all';applyCardFilter(registry.dataset.a6Registry);}}
  card.hidden=false;card.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});if(!card.hasAttribute('tabindex'))card.tabIndex=-1;card.focus({preventScroll:true});
}

function converge(){
  document.documentElement.dataset.a6Ux3Operational=VERSION;
  homeOwner();monitoringOwner();incidentOwner();objectOwner();coverageOwner();
}
function schedule(){queueMicrotask(converge);requestAnimationFrame(converge);}
export function installOperationalSurfaceA6Ux3(){
  if(installed)return;installed=true;
  for(const name of ['ictc:rendered','ictc:surface-changed','ictc:projection-committed'])document.addEventListener(name,schedule);
  document.addEventListener('input',event=>{const id=event.target?.dataset?.a6Search;if(id)applyCardFilter(id);});
  document.addEventListener('change',event=>{const id=event.target?.dataset?.a6State;if(id)applyCardFilter(id);});
  document.addEventListener('ictc:work-target-resolved',revealTypedTarget);
  schedule();
}
