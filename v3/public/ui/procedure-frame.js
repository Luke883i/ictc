import { $, esc, state } from './common.js';
import { getBackLabel, navigateBack } from './surface-router.js';

const FALLBACK_ACTIONS=Object.freeze({
  monitoring:'Aggiungi materiale',
  incidents:'Registra evento',
  objects:'Aggiungi oggetto',
  coverage:'Aggiungi requisito',
  actions:'Crea azione',
  risks:'Aggiungi scenario',
  assurance:'Nuova richiesta'
});
const WORKSPACE_IDS=Object.freeze(['monitoring','incidents','objects','coverage','actions','risks','assurance']);
let installed=false;

function contract(id){return(state.data?.procedureRegistry?.procedures||[]).find(item=>item.id===id)||null;}
function operational(id){return(state.data?.procedures||[]).find(item=>item.id===id)||null;}
function enabledProcedures(){const enabled=new Set(state.data?.experience?.procedurePolicy?.enabled||[]);return(state.data?.procedureRegistry?.procedures||[]).filter(item=>!enabled.size||enabled.has(item.id));}
function activeGrcId(){let id=state.activeProcessId||'';if(!id)try{id=localStorage.getItem('ictc-grc-process')||'';}catch{}return WORKSPACE_IDS.includes(id)?id:'objects';}
function totalFromMetrics(item){const metrics=item?.metrics||[];const candidate=metrics.find(metric=>/tot|record|element|cas|azioni|risch|oggett|requis/i.test(String(metric.label||'')));const n=Number(candidate?.value);return Number.isFinite(n)?n:null;}
function frameModel(id){const meta=contract(id)||{},item=operational(id)||{},attention=Number(item.attentionCount||0),total=totalFromMetrics(item);return{
  id,
  code:meta.code||item.code||id.toUpperCase(),
  label:meta.label||item.label||id,
  purpose:meta.purpose||item.description||meta.claimBoundary||'',
  claimBoundary:meta.claimBoundary||'',
  attention,
  total,
  stateLabel:attention>0?'Da vedere':'In ordine',
  actionLabel:item.actionLabel||FALLBACK_ACTIONS[id]||'Apri',
  service:meta.adapter?.surface||item.service||id
};}
function signalMarkup(model){const total=model.total==null?'':`<span class="procedure-signal"><b>${esc(model.total)}</b><small>record</small></span>`;return `<div class="procedure-signals" aria-label="Stato della procedura"><span class="procedure-state ${model.attention>0?'attention':'ready'}">${esc(model.stateLabel)}</span><span class="procedure-signal"><b>${esc(model.attention)}</b><small>da vedere</small></span>${total}</div>`;}
function backMarkup(){return `<button class="procedure-back" type="button" data-nav-back aria-label="${esc(getBackLabel())}"><span aria-hidden="true">←</span><span data-back-label>${esc(getBackLabel())}</span></button>`;}
function frameMarkup(model){return `${backMarkup()}<div class="procedure-frame-main"><div class="procedure-frame-copy"><div class="procedure-frame-kicker"><span>${esc(model.code)}</span><span aria-hidden="true">·</span><span>Procedura</span></div><h1>${esc(model.label)}</h1><p class="procedure-purpose"><b>Scopo della procedura</b><span>${esc(model.purpose)}</span></p></div><div class="procedure-frame-operate">${signalMarkup(model)}<div class="procedure-frame-actions"><button class="primary procedure-primary" type="button" data-procedure-primary="${esc(model.id)}">${esc(model.actionLabel)}</button>${model.id==='monitoring'&&state.role!=='auditor'?'<button class="secondary procedure-secondary" type="button" data-procedure-secondary="monitoring-plan">Crea monitoraggio</button>':''}</div></div></div>`;}
function cardMarkup(canonical){const model=frameModel(canonical.id);return `<article class="procedure-card" data-procedure-id="${esc(model.id)}" data-procedure-frame-variant="card"><header><div class="procedure-frame-kicker"><span>${esc(model.code)}</span><span aria-hidden="true">·</span><span>Procedura</span></div><span class="procedure-state ${model.attention>0?'attention':'ready'}">${esc(model.stateLabel)}</span></header><h2>${esc(model.label)}</h2><p class="procedure-purpose"><b>Scopo della procedura</b><span>${esc(model.purpose)}</span></p><footer>${signalMarkup(model)}<button class="primary procedure-primary" type="button" ${model.service==='grc'?`data-service="grc" data-grc-process="${esc(model.id)}"`:`data-service="${esc(model.service)}"`}>${esc(model.actionLabel||'Apri')}</button></footer></article>`;}
export function renderProcedureHub(){const host=$('#procedureHub');if(!host||!state.data)return;host.dataset.procedureHub='procedure-frame-1-9';host.innerHTML=enabledProcedures().map(cardMarkup).join('')||'<div class="empty">Nessuna procedura disponibile per il profilo corrente.</div>';}
function mountNativeFrame(id,selector){const view=$(selector);if(!view)return;let frame=view.querySelector(':scope > .procedure-frame');if(!frame){frame=document.createElement('header');frame.className='procedure-frame';frame.dataset.procedureFrame='canonical-1-9';const hero=view.querySelector(':scope > .hero');if(hero)hero.before(frame);else view.prepend(frame);}frame.innerHTML=frameMarkup(frameModel(id));for(const legacy of view.querySelectorAll(':scope > .workspace-return:not([data-nav-back])'))legacy.remove();}
function mountGrcFrame(){const head=$('#grcWorkspace .grc-head');if(!head)return;head.className='grc-head procedure-frame';head.dataset.procedureFrame='canonical-1-9';head.innerHTML=frameMarkup(frameModel(activeGrcId()));}
function normalizeProcessHubIntro(){const head=$('#processesView .processes-head');if(!head)return;const eyebrow=head.querySelector('.eyebrow'),title=head.querySelector('h1'),copy=head.querySelector('h1 + p, h1 ~ p');if(eyebrow)eyebrow.textContent='Processi';if(title)title.textContent='Procedure';if(copy)copy.textContent='Scegli dove lavorare. Ogni procedura mostra scopo, stato, cosa richiede attenzione e il prossimo passo.';}
function normalizeMonitoringContext(){const card=$('#monitoringView .contribute-card');if(!card)return;const eyebrow=card.querySelector('.eyebrow'),title=card.querySelector('h2'),copy=card.querySelector('h2 + p');if(eyebrow)eyebrow.textContent='Contesto';if(title)title.textContent='Materiali recenti';if(copy)copy.textContent='Consulta gli ultimi materiali registrati. Per aggiungerne uno usa l’azione principale della procedura.';}
function updateBackLabels(){for(const button of document.querySelectorAll('[data-nav-back]')){const label=getBackLabel();button.setAttribute('aria-label',label);const text=button.querySelector('[data-back-label]');if(text)text.textContent=label;}}
function sanitizeEndUserControls(){for(const button of document.querySelectorAll('#main button')){if(button.hidden||button.closest('[hidden]'))continue;const name=(button.getAttribute('aria-label')||button.getAttribute('title')||button.textContent||'').trim();if(!name&&!button.querySelector('img[alt]:not([alt=""])'))button.remove();}}
export function renderProcedureExperience(){renderProcedureHub();normalizeProcessHubIntro();mountNativeFrame('monitoring','#monitoringView');mountNativeFrame('incidents','#incidentsView');if($('#grcWorkspace'))mountGrcFrame();normalizeMonitoringContext();updateBackLabels();sanitizeEndUserControls();}
function smoothBehavior(){return matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth';}
function openPrimary(id){if(id==='monitoring'){const button=$('#openContribution')||document.querySelector('[data-open-contribution]');button?.click();return;}if(id==='incidents'){$('#openIncident')?.click();return;}if(id==='coverage'){const panel=document.querySelector('#grcWorkspace .market-mapping-panel');if(panel){panel.open=true;panel.scrollIntoView({block:'nearest',behavior:smoothBehavior()});panel.querySelector('select,input,textarea,button')?.focus();return;}}const disclosure=$('#grcPrimaryForm');if(disclosure){disclosure.open=true;disclosure.scrollIntoView({block:'nearest',behavior:smoothBehavior()});disclosure.querySelector('input,select,textarea,button')?.focus();}}
export function installProcedureFrame(){if(installed)return;installed=true;document.addEventListener('click',event=>{const back=event.target.closest?.('[data-nav-back]');if(back){event.preventDefault();event.stopImmediatePropagation();navigateBack();return;}const primary=event.target.closest?.('[data-procedure-primary]');if(primary){event.preventDefault();event.stopImmediatePropagation();openPrimary(primary.dataset.procedurePrimary);return;}const secondary=event.target.closest?.('[data-procedure-secondary="monitoring-plan"]');if(secondary){event.preventDefault();event.stopImmediatePropagation();const form=$('#missionForm');if(form){form.hidden=false;form.scrollIntoView({block:'nearest',behavior:smoothBehavior()});form.querySelector('textarea,input,select')?.focus();}return;}},true);document.addEventListener('ictc:rendered',()=>queueMicrotask(renderProcedureExperience));document.addEventListener('ictc:surface-changed',()=>queueMicrotask(renderProcedureExperience));renderProcedureExperience();}
