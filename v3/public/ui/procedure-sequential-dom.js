import { $, esc, state } from './common.js';
import { GLOBAL_UX_DOD, PROCEDURE_SEQUENCE } from './procedure-sequential-policy.js';

export const selectedGrc=()=>state.activeProcessId||(()=>{try{return localStorage.getItem('ictc-grc-process')||'';}catch{return'';}})();
export const capability=name=>Array.isArray(state.data?.capabilities)&&state.data.capabilities.includes(name);

const QUEUE_STATE_LABELS=Object.freeze({candidate:'Da validare',active:'Attivi',rejected:'Esclusi',proposed:'Da decidere',mapped:'Mappati',gap:'Gap','not-applicable':'Fuori perimetro',open:'Aperte','in-progress':'In corso',blocked:'Bloccate','ready-for-review':'Da verificare',closed:'Chiuse',cancelled:'Annullate',reviewed:'Valutati',intake:'In ingresso',review:'Da approvare',approved:'Approvate'});

export function ensureStyle(){
  if(document.querySelector('link[data-sequential-ux-style]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='/ui/procedure-sequential-ux-2-2.css';link.dataset.sequentialUxStyle='';document.head.append(link);
}
export function setPrimary(button,label){if(!button)return;button.classList.add('primary','seq-primary');button.classList.remove('secondary');button.textContent=label;button.setAttribute('aria-label',label);button.dataset.seqPrimary='true';}
export function secondary(button,label){if(!button)return;button.classList.remove('primary','seq-primary');button.classList.add('secondary');button.removeAttribute('data-seq-primary');if(label){button.textContent=label;button.setAttribute('aria-label',label);}}

export function compactList(host,selector,budget=GLOBAL_UX_DOD.listItemsBeforeProgressiveDisclosure,label='Mostra altri elementi'){
  if(!host)return;
  const previous=host.querySelector(':scope > details.seq-overflow');
  if(previous){const oldSlot=previous.querySelector(':scope > .seq-overflow-grid');for(const node of [...oldSlot?.children||[]])host.insertBefore(node,previous);previous.remove();}
  const nodes=[...host.querySelectorAll(`:scope > ${selector}`)];if(nodes.length<=budget)return;
  const details=document.createElement('details');details.className='seq-overflow';details.innerHTML=`<summary>${esc(label)} · ${nodes.length-budget}</summary><div class="seq-overflow-grid"></div>`;
  const slot=details.querySelector('div');for(const node of nodes.slice(budget))slot.append(node);host.append(details);
}

function restoreLegacyOverflow(host){
  for(const details of [...host.querySelectorAll(':scope > details.seq-overflow')]){
    const slot=details.querySelector(':scope > .seq-overflow-grid');
    for(const node of [...slot?.children||[]])host.insertBefore(node,details);
    details.remove();
  }
}
function annotateQueueControl(node,id,intent){
  if(!node)return;
  node.dataset.journeyProcess=id;node.dataset.journeyStage='orient';node.dataset.journeyIntent=intent;node.dataset.journeyAuthority='navigation';node.dataset.journeyEvidenceEffect='none';
}
function queueTools(host,id,label){
  const parent=host.parentElement||host;
  let tools=parent.querySelector(`[data-procedure-queue-tools="${id}"],[data-seq-queue-tools="${id}"]`);
  if(!tools){
    tools=document.createElement('div');tools.className='procedure-queue-tools surface-toolbar';tools.dataset.seqQueueTools=id;
    tools.innerHTML=`<input type="search" data-seq-queue-search="${esc(id)}" placeholder="Cerca ${esc(label)}"><select data-seq-queue-state="${esc(id)}"><option value="">Tutti gli stati</option></select>`;
    host.before(tools);
  }else tools.dataset.seqQueueTools=id;
  let search=id==='objects'?tools.querySelector('[data-seq-ao-search]'):tools.querySelector(`[data-seq-queue-search="${id}"]`);
  let stateSelect=id==='objects'?tools.querySelector('[data-seq-ao-filter]'):tools.querySelector(`[data-seq-queue-state="${id}"]`);
  if(!search){search=document.createElement('input');search.type='search';search.dataset.seqQueueSearch=id;search.placeholder=`Cerca ${label}`;tools.prepend(search);}
  if(!stateSelect){stateSelect=document.createElement('select');stateSelect.dataset.seqQueueState=id;stateSelect.innerHTML='<option value="">Tutti gli stati</option>';tools.append(stateSelect);}
  let count=tools.querySelector('[data-seq-queue-count]');if(!count){count=document.createElement('span');count.className='surface-chip';count.dataset.seqQueueCount='';count.setAttribute('aria-live','polite');tools.append(count);}
  let more=tools.querySelector('[data-seq-queue-more]');if(!more){more=document.createElement('button');more.type='button';more.className='secondary';more.dataset.seqQueueMore=id;more.textContent='Mostra altri';tools.append(more);}
  annotateQueueControl(search,id,'filter-queue-text');annotateQueueControl(stateSelect,id,'filter-queue-state');annotateQueueControl(more,id,'expand-queue');
  return{tools,search,stateSelect,count,more};
}
function populateStates(select,cards,id){
  if(id==='objects'&&select.options.length>1)return;
  const current=select.value,values=[...new Set(cards.map(card=>card.dataset.recordState||card.dataset.uiuxPhase||'').filter(Boolean))];
  select.innerHTML='<option value="">Tutti gli stati</option>'+values.map(value=>`<option value="${esc(value)}">${esc(QUEUE_STATE_LABELS[value]||value.replaceAll('-',' '))}</option>`).join('');
  if([...select.options].some(option=>option.value===current))select.value=current;
}
export function ensureQueueWindow(host,selector='article',{id,label='elementi',budget=GLOBAL_UX_DOD.listItemsBeforeProgressiveDisclosure}={}){
  if(!host||!id)return;
  restoreLegacyOverflow(host);
  const cards=[...host.querySelectorAll(`:scope > ${selector}`)];
  const ui=queueTools(host,id,label);populateStates(ui.stateSelect,cards,id);
  if(!ui.tools.dataset.seqQueueLimit)ui.tools.dataset.seqQueueLimit=String(budget);
  const refresh=(reset=false)=>{
    restoreLegacyOverflow(host);
    const all=[...host.querySelectorAll(`:scope > ${selector}`)];
    if(reset)ui.tools.dataset.seqQueueLimit=String(budget);
    const limit=Math.max(budget,Number(ui.tools.dataset.seqQueueLimit||budget)),q=String(ui.search.value||'').trim().toLowerCase(),filter=ui.stateSelect.value||'';
    const matching=all.filter(card=>{const recordState=card.dataset.recordState||card.dataset.uiuxPhase||'',due=card.dataset.recordDue==='true',text=card.textContent.toLowerCase(),textOk=!q||text.includes(q),stateOk=!filter||recordState===filter||(filter==='due'&&due);return textOk&&stateOk;});
    const visible=new Set(matching.slice(0,limit));for(const card of all)card.hidden=!visible.has(card);
    ui.count.textContent=`${Math.min(limit,matching.length)} di ${matching.length}`;
    const remaining=Math.max(0,matching.length-limit);ui.more.hidden=remaining===0;ui.more.textContent=remaining?`Mostra altri ${Math.min(budget,remaining)}`:'Mostra altri';
  };
  if(ui.tools.dataset.seqQueueBound!=='true'){
    ui.tools.dataset.seqQueueBound='true';
    ui.search.addEventListener('input',event=>{refresh(true);event.stopPropagation();});
    ui.stateSelect.addEventListener('change',event=>{refresh(true);event.stopPropagation();});
    ui.more.addEventListener('click',()=>{ui.tools.dataset.seqQueueLimit=String(Number(ui.tools.dataset.seqQueueLimit||budget)+budget);refresh(false);});
  }
  refresh(false);
}

export function ensureSequence(host,id){
  if(!host||!PROCEDURE_SEQUENCE[id])return;
  let guide=host.querySelector(':scope > [data-seq-guide]');
  if(!guide){guide=document.createElement('nav');guide.dataset.seqGuide=id;guide.className='seq-guide';const compass=host.querySelector(':scope > [data-finetune-compass]');(compass||host.firstElementChild)?.after(guide);}
  const p=PROCEDURE_SEQUENCE[id];guide.setAttribute('aria-label',`${p.code} percorso operativo`);guide.innerHTML=`<span class="seq-purpose">${esc(p.purpose)}</span><ol>${p.stages.map((s,i)=>`<li><span>${i+1}</span>${esc(s)}</li>`).join('')}</ol>`;
}

export { $ };
