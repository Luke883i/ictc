import { $, esc, state } from './common.js';
import { SURFACE_LABELS } from './product-copy.js';

const REPOSITORY_URL='https://github.com/Luke883i/ictc';
const LICENSE_URL='https://github.com/Luke883i/ictc/blob/main/LICENSE';
const EXPERIENCE_EDITION='1.9-experience-candidate';
const HOME_SUMMARIES=Object.freeze({
  admin:'Vedi cosa richiede attenzione, entra nel Processo di Compliance giusto e mantieni decisioni ed evidenze nello stesso contesto.',
  user:'Continua il lavoro del tuo ruolo e registra conoscenza ed evidenze nel Processo di Compliance corretto.',
  auditor:'Ricostruisci Processi di Compliance, decisioni ed evidenze nel perimetro accessibile, senza modificare lo stato operativo.'
});
let installed=false;

function canonicalServices(){
  const nav=$('.service-nav');
  return nav?[...nav.querySelectorAll(':scope > [data-service]')].map(node=>node.dataset.service):[];
}
function businessProcedures(){
  const ids=new Set((state.data?.procedureRegistry?.procedures||[]).map(item=>item.id));
  return(state.data?.procedures||[]).filter(item=>ids.has(item.id));
}
function normalizeShellIdentity(){
  const html=document.documentElement;
  html.dataset.ictcExperienceEdition=EXPERIENCE_EDITION;
  html.dataset.ictcExperience='market-1';
  const home=$('.service-nav [data-service="home"]'),processes=$('.service-nav [data-service="processes"]'),proof=$('.service-nav [data-service="proof"]');
  if(home)home.textContent=SURFACE_LABELS.home;
  if(processes)processes.textContent=SURFACE_LABELS.processes;
  if(proof){proof.textContent=SURFACE_LABELS.proof;proof.setAttribute('aria-label',SURFACE_LABELS.proof);proof.dataset.refinedCompactLabel='';}
}
function assertNativeShell(){
  normalizeShellIdentity();
  const services=canonicalServices(),failures=[];
  if(document.documentElement.dataset.ictcEdition!=='1.2-market-candidate')failures.push('semantic-edition');
  if(document.documentElement.dataset.ictcExperienceEdition!==EXPERIENCE_EDITION)failures.push('experience-edition');
  if(document.documentElement.dataset.ictcStability!=='candidate')failures.push('stability');
  if(JSON.stringify(services)!==JSON.stringify(['home','processes','proof']))failures.push('services');
  if(!$('.stable-header-inner'))failures.push('header');
  if($('.service-nav [data-service="home"]')?.textContent!==SURFACE_LABELS.home)failures.push('home-label');
  if($('.service-nav [data-service="processes"]')?.textContent!==SURFACE_LABELS.processes)failures.push('processes-label');
  if($('.service-nav [data-service="proof"]')?.textContent!==SURFACE_LABELS.proof)failures.push('proof-label');
  if(!$('#homePulse')||!$('#homePriorities'))failures.push('home-runtime-slots');
  if(failures.length)throw Object.assign(new Error(`Shell Experience 1.9 non canonica: ${failures.join(', ')}`),{code:'native-experience-shell-invalid',details:{failures}});
}
function processTrigger(item){
  const meta=(state.data?.procedureRegistry?.procedures||[]).find(x=>x.id===item.id)||{},label=esc(meta.label||item.label||item.code||item.id),surface=meta.adapter?.surface||item.service||item.id;
  if(surface==='grc')return `<button type="button" data-service="grc" data-grc-process="${esc(item.id)}"><span>${label}</span><strong>${Number(item.attentionCount||0)} da vedere</strong><i aria-hidden="true">→</i></button>`;
  return `<button type="button" data-service="${esc(surface)}"><span>${label}</span><strong>${Number(item.attentionCount||0)} da vedere</strong><i aria-hidden="true">→</i></button>`;
}
function renderHomePulse(){
  const pulse=$('#homePulse'),priorities=$('#homePriorities');
  if(!pulse||!priorities||!state.data)return;
  const summary=$('#homeSummary');
  if(summary)summary.textContent=HOME_SUMMARIES[state.role]||HOME_SUMMARIES.user;
  const procedures=businessProcedures(),serverSummary=state.data.procedureSummary,enabled=Number(serverSummary?.counts?.processes??state.data.experience?.procedurePolicy?.enabled?.length??procedures.length),attention=Number(serverSummary?.counts?.attention??procedures.reduce((sum,item)=>sum+Number(item.attentionCount||0),0)),withoutAttention=Number(serverSummary?.counts?.healthy??procedures.filter(item=>Number(item.attentionCount||0)===0).length),decisions=Number(state.data.decisions?.records?.length||0);
  pulse.innerHTML=`<div><b>${enabled}</b><span>Processi di Compliance</span></div><div><b>${attention}</b><span>elementi da vedere</span></div><div><b>${withoutAttention}</b><span>processi senza attenzione aperta</span></div><div><b>${decisions}</b><span>decisioni umane registrate</span></div>`;
  const source=serverSummary?.rows?.length?serverSummary.rows.map(row=>({...row,id:row.id,attentionCount:row.attention})):procedures,top=[...source].filter(item=>Number(item.attentionCount||0)>0).sort((a,b)=>Number(b.attentionCount||0)-Number(a.attentionCount||0)||String(a.id).localeCompare(String(b.id))).slice(0,3);
  priorities.innerHTML=top.length?`<div class="home-priority-head"><span>Priorità per volume di lavoro aperto</span><button type="button" data-service="processes">Tutti i Processi di Compliance</button></div>${top.map(processTrigger).join('')}<p class="market-global-note">I conteggi orientano il lavoro: non sono punteggi di conformità, maturità o rischio.</p>`:`<div class="home-priority-clear"><span>Nessuna priorità aperta nella vista corrente.</span><button type="button" data-service="processes">Apri Processi di Compliance</button></div>`;
}
function demoAuditChips(demo){
  const audit=demo?.audit,counts=audit?.counts;
  if(!counts)return'';
  const stateLabel=audit.verdict==='coherent'?'Coerenza sintetica verificata':'Coerenza sintetica da riesaminare';
  return `<span class="demo-context-chip">${esc(stateLabel)}</span><span class="demo-context-chip">DoD locale ${Number(counts.localPassed||0)}/${Number(counts.localTotal||0)}</span><span class="demo-context-chip">DoD globale ${Number(counts.globalPassed||0)}/${Number(counts.globalTotal||0)}</span>`;
}
function renderDemoBanner(){
  const demo=state.data?.experience?.demo,existing=$('#ictcDemoBanner');
  if(!demo?.enabled){existing?.remove();document.documentElement.dataset.ictcDemoMode='false';return;}
  document.documentElement.dataset.ictcDemoMode='true';
  const banner=existing||document.createElement('div');
  banner.id='ictcDemoBanner';
  banner.className='demo-mode-banner';
  banner.setAttribute('role','status');
  banner.setAttribute('aria-label','Contesto demo con dati sintetici');
  banner.innerHTML=`<div class="demo-context-line"><strong class="demo-context-badge">DEMO</strong><span class="demo-context-label">Dati sintetici</span><span class="demo-context-chip">${esc(demo.organizationName||'Organizzazione demo')}</span><span class="demo-context-chip">${Number(demo.primaryRecords||0)} record primari</span><span class="demo-context-chip">${Number(demo.supportRecords||0)} record di contesto</span><span class="demo-context-chip">Scheduler disabilitato</span>${demoAuditChips(demo)}</div><p class="demo-context-boundary">Nessun dato, contatore o esito demo rappresenta una conclusione reale di compliance, applicabilità o efficacia.</p>`;
  if(!existing){const anchor=$('.stable-header-inner')?.parentElement||$('.stable-header-inner');if(anchor)anchor.after(banner);else document.body.prepend(banner);}
}
function installFooter(){
  if($('#stableLegalFooter'))return;
  const footer=document.createElement('footer');
  footer.id='stableLegalFooter';footer.className='stable-legal-footer';footer.setAttribute('aria-label','Licenza e condizioni ICTC');
  footer.innerHTML=`<span>ICTC · <a href="${LICENSE_URL}" target="_blank" rel="noopener noreferrer">MIT</a></span><span aria-hidden="true">·</span><a href="${REPOSITORY_URL}" target="_blank" rel="noopener noreferrer">Repository</a><span aria-hidden="true">·</span><a href="/terms.html">Condizioni</a>`;
  document.body.append(footer);
}
export function ensureStableShell(){assertNativeShell();renderHomePulse();renderDemoBanner();installFooter();}
export function installStableShell(){if(installed)return;installed=true;normalizeShellIdentity();ensureStableShell();document.addEventListener('ictc:surface-changed',()=>queueMicrotask(ensureStableShell));}
