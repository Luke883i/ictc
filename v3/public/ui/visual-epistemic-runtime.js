import { $, $$, state } from './common.js';

let installed=false,scheduled=false;
const FAMILY_LABELS=Object.freeze({actions:'Azioni',risks:'Rischi',assurance:'Questionari e verifiche',coverage:'Copertura',incidents:'Eventi',monitoring:'Monitoraggio',objects:'Oggetti','cross-cutting':'Trasversale',recorded:'Registrato',proposed:'Proposto'});
const TYPE_LABELS=Object.freeze({control:'Controllo',critical:'Critico',high:'Alto',medium:'Medio',low:'Basso',incident:'Evento',action:'Azione',risk:'Rischio',mapping:'Mapping','assurance-case':'Questionario'});
const KPI_NOTES=Object.freeze({
  objects:'I contatori descrivono stato e necessità di riesame: non sono categorie da sommare.',
  coverage:'Copertura, gap, irrisolti e non applicabili descrivono esiti distinti del perimetro dichiarato; non costituiscono un giudizio di conformità.',
  actions:'Le categorie possono sovrapporsi: per esempio una scaduta può essere anche aperta. Non sommare i contatori per stimare il totale.',
  risks:'I conteggi descrivono il workflow. Rating e heatmap sono giudizi di gestione umani, non probabilità oggettive o classificazioni regolatorie.',
  assurance:'Gli stati descrivono il workflow interno; un’approvazione interna non costituisce assurance o certificazione esterna.'
});

function selectedProcess(){
  const id=state.activeProcessId||'';
  return KPI_NOTES[id]?id:null;
}
function replaceExact(root,map){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
    const parent=node.parentElement;
    if(!parent||['SCRIPT','STYLE','TEXTAREA','CODE','PRE'].includes(parent.tagName))continue;
    const raw=node.textContent||'',trimmed=raw.trim(),replacement=map[trimmed];
    if(replacement)node.textContent=raw.replace(trimmed,replacement);
  }
}
function ensureKpiBoundary(root,processId){
  const kpis=root?.querySelector('.grc-kpis');
  if(!kpis||!processId)return;
  let note=kpis.nextElementSibling;
  if(!note?.matches('.epistemic-kpi-note')){
    note=document.createElement('p');note.className='epistemic-kpi-note';kpis.after(note);
  }
  note.textContent=KPI_NOTES[processId];
  kpis.dataset.metricSemantics='non-additive-unless-explicit';
}
function normalizeWorkItems(root,processId){
  for(const card of $$('.grc-list article',root)){
    card.classList.add('epistemic-work-item');
    const meta=card.querySelector('header small');
    if(meta){
      const parts=(meta.textContent||'').split(' · ').map(part=>TYPE_LABELS[part.trim()]||part.trim());
      meta.textContent=parts.join(' · ');
    }
    const footer=card.querySelector('footer');
    if(!footer)continue;
    for(const button of footer.querySelectorAll('button'))button.classList.remove('epistemic-next-action');
    const next=processId==='objects'?footer.querySelector('[data-object-attest], [data-object-review="active"]'):
      processId==='actions'?footer.querySelector('[data-action-adopt], [data-action-progress="in-progress"], [data-action-progress="done"]'):
      processId==='risks'?footer.querySelector('[data-risk-review]'):
      processId==='assurance'?footer.querySelector('[data-assurance-approve], [data-assurance-review]'):
      processId==='coverage'?footer.querySelector('[data-mapping-decision="mapped"], [data-mapping-decision="gap"]'):null;
    if(next)next.classList.add('epistemic-next-action');
    const dossier=footer.querySelector('[data-grc-evidence]');
    if(dossier){dossier.classList.add('epistemic-evidence-action');dossier.setAttribute('aria-label','Apri il dossier delle evidenze');}
  }
}
function normalizeRiskMap(root){
  const map=root?.querySelector('.risk-map');
  if(!map||map.parentElement?.classList.contains('risk-map-frame'))return;
  const frame=document.createElement('div');frame.className='risk-map-frame';
  const x=document.createElement('span');x.className='risk-axis risk-axis-x';x.textContent='Impatto →';
  const y=document.createElement('span');y.className='risk-axis risk-axis-y';y.textContent='Probabilità →';
  map.replaceWith(frame);frame.append(y,map,x);
  const note=document.createElement('p');note.className='risk-map-boundary';note.textContent='Coordinate 1–5 validate da persone. Il prodotto orienta la priorità interna: non è una probabilità oggettiva né una conclusione regolatoria.';frame.after(note);
  map.setAttribute('aria-label','Matrice rischi validati: probabilità per impatto, entrambe da 1 a 5');
}
function normalizeGrc(){
  const root=$('#grcView');if(!root)return;
  const processId=selectedProcess();
  ensureKpiBoundary(root,processId);
  normalizeWorkItems(root,processId);
  if(processId==='risks')normalizeRiskMap(root);
}
function normalizeMonitoring(){
  const root=$('#monitoringView');if(!root)return;
  const ai=$('#aiSetup');if(ai)ai.classList.add('epistemic-secondary-banner');
  const demo=state.data?.experience?.demo;
  if(!demo?.enabled)return;
  const list=$('#missionsList');if(!list)return;
  const section=list.closest('.section-block');if(!section||section.querySelector(':scope > .demo-scheduler-note'))return;
  const note=document.createElement('p');note.className='demo-scheduler-note';note.textContent='Contesto DEMO: lo scheduler operativo è disabilitato. Date di prossima esecuzione nel passato appartengono al dataset sintetico e non indicano job mancati.';
  section.querySelector('.section-head')?.after(note);
}
function normalizeProofSemantics(){
  const title=$('#proofTitle');
  if(!title)return;
  title.textContent='Postura ICTC';
  let qualifier=title.parentElement?.querySelector('.proof-semantic-qualifier');
  if(!qualifier){qualifier=document.createElement('p');qualifier.className='proof-semantic-qualifier';title.after(qualifier);}
  qualifier.textContent='Prove e limiti del funzionamento ICTC';
  title.setAttribute('aria-description','Postura tecnica basata su prove osservabili; non è un giudizio di conformità dell’organizzazione.');
}
function normalizeEpistemicLattice(){
  const root=$('#epistemicView');if(!root)return;
  replaceExact(root,FAMILY_LABELS);
  for(const node of root.querySelectorAll('.epistemic-cluster small'))if(node.textContent.trim()==='Drilldown')node.textContent='Apri dettaglio';
  const search=$('#epistemicSearch');if(search)search.placeholder='Elemento, soggetto, origine…';
  for(const button of root.querySelectorAll('[data-epistemic-mode]'))if(button.textContent.trim()==='Flat / raw')button.textContent='Vista tecnica';
  for(const node of root.querySelectorAll('*')){
    if(node.children.length)continue;
    const value=(node.textContent||'').trim();
    if(/atomi nella pagina$/i.test(value))node.textContent=value.replace(/atomi nella pagina/i,'tracce tecniche nella pagina');
    if(value.startsWith('Compressione di presentazione:'))node.textContent='La vista raggruppa la presentazione senza modificare origine, versione, integrità, base, stato o relazioni registrate.';
  }
}
function apply(){
  if(scheduled)return;scheduled=true;
  queueMicrotask(()=>{scheduled=false;normalizeProofSemantics();normalizeGrc();normalizeMonitoring();normalizeEpistemicLattice();document.documentElement.dataset.visualEpistemicRuntime='1';});
}
export function installVisualEpistemicRuntime(){
  if(installed)return;installed=true;
  document.addEventListener('ictc:rendered',apply);
  document.addEventListener('ictc:surface-changed',apply);
  document.addEventListener('click',()=>setTimeout(apply,0),true);
  apply();
}
