import { $, esc, state } from './common.js';
import { GLOBAL_UX_DOD, PROCEDURE_SEQUENCE } from './procedure-sequential-policy.js';

export const selectedGrc=()=>state.activeProcessId||(()=>{try{return localStorage.getItem('ictc-grc-process')||'';}catch{return'';}})();
export const capability=name=>Array.isArray(state.data?.capabilities)&&state.data.capabilities.includes(name);

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

export function ensureSequence(host,id){
  if(!host||!PROCEDURE_SEQUENCE[id])return;
  let guide=host.querySelector(':scope > [data-seq-guide]');
  if(!guide){guide=document.createElement('nav');guide.dataset.seqGuide=id;guide.className='seq-guide';const compass=host.querySelector(':scope > [data-finetune-compass]');(compass||host.firstElementChild)?.after(guide);}
  const p=PROCEDURE_SEQUENCE[id];guide.setAttribute('aria-label',`${p.code} percorso operativo`);guide.innerHTML=`<span class="seq-purpose">${esc(p.purpose)}</span><ol>${p.stages.map((s,i)=>`<li><span>${i+1}</span>${esc(s)}</li>`).join('')}</ol>`;
}

export { $ };
