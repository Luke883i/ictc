import { $, esc, state } from './common.js';

const REPOSITORY_URL='https://github.com/Luke883i/ictc';
const LICENSE_URL='https://github.com/Luke883i/ictc/blob/main/LICENSE';
const GRC_LABELS=Object.freeze({
  objects:{code:'AO-01',label:'Inventario di sistemi e oggetti',description:'Mantieni un registro governato di sistemi, servizi, dati, fornitori, processi, policy e controlli con fonte, ownership e riesame.'},
  coverage:{code:'MC-01',label:'Controlli e copertura',description:'Dichiara il perimetro di requisiti e governa mapping, gap, non applicabile e irrisolti senza confondere copertura ed efficacia.'},
  actions:{code:'AP-01',label:'Azioni correttive',description:'Trasforma gap, finding e rischi in lavoro assegnato, eseguito e verificato, separando completamento e chiusura.'},
  risks:{code:'RC-01',label:'Rischi di compliance',description:'Governa scenari, rating umani, trattamento e collegamenti a oggetti, controlli e remediation.'},
  assurance:{code:'AR-01',label:'Questionari e verifiche',description:'Preserva la richiesta, prepara un response set manuale o assistito e approva una versione completa e tracciata.'}
});
const HOME_SUMMARIES=Object.freeze({admin:'Una vista unica su priorità, processi, decisioni ed evidenze. L’amministrazione resta separata dal lavoro operativo.',user:'Continua il lavoro pertinente al tuo ruolo, consulta lo stato dei processi e registra conoscenza ed evidenze nel contesto corretto.',auditor:'Ricostruisci processi, decisioni ed evidenze nel perimetro accessibile, senza modificare lo stato operativo.'});
let installed=false;
function canonicalServices(){const nav=$('.service-nav');return nav?[...nav.querySelectorAll(':scope > [data-service]')].map(node=>node.dataset.service):[];}
function installHeader(){
  const header=$('.topbar'),nav=$('.service-nav'),actions=$('.top-actions');if(!header||!nav||!actions)return;
  let inner=header.querySelector('.stable-header-inner');if(!inner){inner=document.createElement('div');inner.className='stable-header-inner';const brand=header.querySelector('.brand');header.prepend(inner);if(brand)inner.append(brand);inner.append(nav);inner.append(actions);}
  const brand=header.querySelector('.brand');if(brand){const legacy=brand.querySelector('.brand-mark');if(legacy)legacy.remove();let mark=brand.querySelector('.ictc-brand-mark');if(!mark){mark=document.createElement('img');mark.className='ictc-brand-mark';mark.src='/assets/ictc-mark.png';mark.alt='';mark.setAttribute('aria-hidden','true');brand.prepend(mark);}const title=brand.querySelector('b');if(title)title.textContent='ICTC';const small=brand.querySelector('small');if(small)small.textContent='Integrated Compliance Tower Control';brand.setAttribute('aria-label','ICTC · Integrated Compliance Tower Control');}
  const evidence=nav.querySelector('[data-service="proof"]');if(evidence)evidence.textContent='Evidenze';
}
function ensureHomeStructure(){
  const hero=$('.home-hero'),intro=$('.home-intro'),next=$('.home-next');for(const legacy of ['.home-journey-panel','.home-overview-grid'])$(legacy)?.setAttribute('hidden','');if(!hero||!intro||!next)return;
  hero.dataset.stableHero='ictc-wide';intro.querySelector('.eyebrow')?.replaceChildren(document.createTextNode('Integrated Compliance Tower Control'));
  const title=$('#homeTitle');if(title)title.textContent='Governa la compliance operativa, senza perdere la traccia.';
  const summary=$('#homeSummary');if(summary&&!state.data)summary.textContent='Orientati sul lavoro aperto, entra nel processo giusto e conserva decisioni ed evidenze nello stesso contesto.';
  if(!$('#homePulse'))intro.insertAdjacentHTML('beforeend','<div id="homePulse" class="home-pulse" aria-label="Stato sintetico ICTC"></div>');
  if(!$('#homePriorities'))intro.insertAdjacentHTML('beforeend','<div id="homePriorities" class="home-priorities" aria-label="Priorità per processo"></div>');
  if(next.parentElement===hero&&!next.classList.contains('stable-next-strip'))next.classList.add('stable-next-strip');
}
function processTrigger(item){const label=esc(item.label||item.code||item.id);if(item.service==='grc')return `<button type="button" data-service="grc" data-grc-process="${esc(item.id)}"><span>${label}</span><strong>${Number(item.attentionCount||0)} da vedere</strong><i aria-hidden="true">→</i></button>`;return `<button type="button" data-service="${esc(item.service||item.id)}"><span>${label}</span><strong>${Number(item.attentionCount||0)} da vedere</strong><i aria-hidden="true">→</i></button>`;}
function renderHomePulse(){
  const pulse=$('#homePulse'),priorities=$('#homePriorities');if(!pulse||!priorities||!state.data)return;
  const summary=$('#homeSummary');if(summary)summary.textContent=HOME_SUMMARIES[state.role]||'Orientati sul lavoro aperto, entra nel processo giusto e conserva decisioni ed evidenze nello stesso contesto.';
  const procedures=(state.data.procedures||[]).filter(item=>item.code&&item.id!=='evidence'),enabled=Number(state.data.experience?.procedurePolicy?.enabled?.length??procedures.length),attention=procedures.reduce((sum,item)=>sum+Number(item.attentionCount||0),0),healthy=procedures.filter(item=>Number(item.attentionCount||0)===0).length,decisions=Number(state.data.decisions?.records?.length||0);
  pulse.innerHTML=`<div><b>${enabled}</b><span>processi attivi</span></div><div><b>${attention}</b><span>elementi da vedere</span></div><div><b>${healthy}</b><span>processi in ordine</span></div><div><b>${decisions}</b><span>decisioni umane</span></div>`;
  const top=[...procedures].filter(item=>Number(item.attentionCount||0)>0).sort((a,b)=>Number(b.attentionCount||0)-Number(a.attentionCount||0)||String(a.code).localeCompare(String(b.code))).slice(0,3);
  priorities.innerHTML=top.length?`<div class="home-priority-head"><span>Priorità per processo</span><button type="button" data-service="processes">Tutti i processi</button></div>${top.map(processTrigger).join('')}`:`<div class="home-priority-clear"><span>Nessuna priorità di processo aperta nella proiezione corrente.</span><button type="button" data-service="processes">Apri Processi</button></div>`;
}
function normalizeStandaloneGrc(){
  const head=$('.grc-head');if(!head)return;head.querySelector('nav[aria-label="Processi GRC"]')?.remove();let id=state.activeProcessId||'';if(!id)try{id=localStorage.getItem('ictc-grc-process')||'';}catch{}const meta=GRC_LABELS[id];if(!meta)return;const eyebrow=head.querySelector('.eyebrow'),title=head.querySelector('h1'),description=head.querySelector('h1 + p');if(eyebrow)eyebrow.textContent=`${meta.code} · Processo di compliance`;if(title)title.textContent=meta.label;if(description)description.textContent=meta.description;head.dataset.standaloneProcess=id;
}
function installFooter(){if($('#stableLegalFooter'))return;const footer=document.createElement('footer');footer.id='stableLegalFooter';footer.className='stable-legal-footer';footer.setAttribute('aria-label','Licenza e condizioni ICTC');footer.innerHTML=`<span>ICTC · <a href="${LICENSE_URL}" target="_blank" rel="noopener noreferrer">MIT</a></span><span aria-hidden="true">·</span><a href="${REPOSITORY_URL}" target="_blank" rel="noopener noreferrer">Repository</a><span aria-hidden="true">·</span><a href="/terms.html">Condizioni</a>`;document.body.append(footer);}
export function ensureStableShell(){document.title='ICTC · Integrated Compliance Tower Control';document.documentElement.dataset.ictcEdition='1.1-stable';document.documentElement.dataset.ictcStability='stable';document.documentElement.dataset.ictcExperience='stable-2';const services=canonicalServices();if(JSON.stringify(services)!==JSON.stringify(['home','processes','proof']))throw Object.assign(new Error('Shell stabile non canonica'),{code:'stable-shell-missing',details:{services}});installHeader();ensureHomeStructure();renderHomePulse();normalizeStandaloneGrc();installFooter();}
export function installStableShell(){if(installed)return;installed=true;ensureStableShell();document.addEventListener('ictc:surface-changed',event=>{if(event.detail?.surface==='grc')queueMicrotask(normalizeStandaloneGrc);});window.addEventListener('click',event=>{if(event.target.closest?.('[data-grc-process]'))queueMicrotask(normalizeStandaloneGrc);},true);}
