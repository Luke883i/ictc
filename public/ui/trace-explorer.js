import { $, api, downloadProtected, esc, notify, state } from './common.js';
let installed=false,cache=null,selectedTraceId='';

function ensureStyle(){
  if(document.querySelector('link[data-trace-explorer-style]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='trace-explorer.css';link.dataset.traceExplorerStyle='true';document.head.append(link);
}
function ensureHost(){
  ensureStyle();
  const view=$('#proofView');
  if(!view)return null;
  if(!$('#traceExplorer'))view.insertAdjacentHTML('beforeend',`<section id="traceExplorer" class="trace-explorer" aria-labelledby="traceExplorerTitle"><header class="trace-head"><div><p class="eyebrow">Esplora evidenze e tracce</p><h2 id="traceExplorerTitle">Ricostruisci un elemento di lavoro</h2><p>Segui originale, assistenza, decisioni umane, relazioni ed evidenze senza trasformare la traccia in un giudizio di conformità.</p></div><div class="trace-tools"><label>Cerca<input id="traceSearch" type="search" placeholder="Oggetto, processo, riferimento"></label><label>Processo<select id="traceProcessFilter"><option value="">Tutti</option></select></label></div></header><div class="trace-layout"><div id="traceList" class="trace-list" aria-label="Elementi ricostruibili"></div><article id="traceDetail" class="trace-detail"><p class="quiet">Seleziona un elemento per ricostruirne la traccia.</p></article></div></section>`);
  return $('#traceExplorer');
}
function processMeta(id){const p=(state.data?.procedures||[]).find(x=>x.id===id);return{code:p?.code||id,label:p?.label||id};}
function subjectLabel(t){return t.original?.reference||`${t.subject.type} · ${t.subject.id}`;}
function subjectTypeLabel(value){return({incident:'evento',action:'azione',risk:'rischio','grc-object':'oggetto',mapping:'mapping','assurance-case':'questionario',mission:'monitoraggio'})[value]||String(value||'elemento').replaceAll('-',' ');}
function matching(trace,needle,process){
  if(process&&trace.processId!==process)return false;
  if(!needle)return true;
  const meta=processMeta(trace.processId),hay=[trace.subject.type,trace.subject.id,trace.original?.reference,trace.original?.kind,meta.code,meta.label,...(trace.relations||[]).flatMap(x=>[x.relation,x.target?.id,x.source?.id])].filter(Boolean).join(' ').toLowerCase();
  return hay.includes(needle);
}
function renderList(){
  const list=$('#traceList');if(!list||!cache)return;
  const needle=String($('#traceSearch')?.value||'').trim().toLowerCase(),process=$('#traceProcessFilter')?.value||'',items=(cache.traces||[]).filter(t=>matching(t,needle,process));
  list.innerHTML=items.map(t=>{
    const m=processMeta(t.processId),decision=t.decisions?.length?`${t.decisions.length} decisioni`:'nessuna decisione',selected=t.id===selectedTraceId;
    return`<button type="button" data-trace-id="${esc(t.id)}" aria-current="${selected?'true':'false'}"><span><small>${esc(m.code)} · ${esc(subjectTypeLabel(t.subject.type))}</small><b>${esc(String(subjectLabel(t)).slice(0,110))}</b><em>Identificativo ${esc(String(t.subject.id||'—').slice(0,56))}</em><span class="trace-counts">${esc(decision)} · ${t.auditEvents?.length||0} eventi · ${t.relations?.length||0} relazioni</span></span><i aria-hidden="true">→</i></button>`;
  }).join('')||'<p class="quiet">Nessun elemento nel perimetro della ricerca.</p>';
}
function rows(items,fn){return(items||[]).map(fn).join('')||'<p class="quiet">Nessun elemento registrato.</p>';}
function technicalDisclosure(label,content){return `<details class="trace-technical"><summary>${esc(label)}</summary>${content}</details>`;}
function epistemicSummary(item){
  const posture=item?.posture||item?.checkpoint||item?.id||'Record epistemico';
  const basis=Array.isArray(item?.basis)?`${item.basis.length} basi dichiarate`:item?.basis?'base dichiarata':'base non esposta';
  return `<article class="trace-row"><b>${esc(posture)}</b><span>${esc(basis)}</span>${technicalDisclosure('Dettagli tecnici',`<pre>${esc(JSON.stringify(item,null,2))}</pre>`)}</article>`;
}
function renderDetail(trace){
  const host=$('#traceDetail');if(!host)return;
  const meta=processMeta(trace.processId),subjectType=subjectTypeLabel(trace.subject.type);
  host.innerHTML=`<header><div><p class="eyebrow">${esc(meta.code)} · ${esc(meta.label)}</p><h3>${esc(String(subjectLabel(trace)).slice(0,180))}</h3><p>${esc(subjectType)} · ${esc(trace.subject.id)}</p></div><button type="button" data-trace-download="${esc(trace.evidenceUrl)}">Scarica dossier</button></header><section><h4>1. Originale e provenienza</h4><dl><dt>Tipo</dt><dd>${esc(subjectTypeLabel(trace.original?.kind||trace.subject.type))}</dd><dt>Riferimento</dt><dd>${esc(trace.original?.reference||'non disponibile')}</dd></dl>${technicalDisclosure('Digest e identificativi',`<code>${esc(trace.original?.digest||'non disponibile')}</code>`)}</section><section><h4>2. Assistenza AI</h4>${rows(trace.assist,x=>`<article class="trace-row"><b>${esc(x.purpose||x.field)}</b>${(x.limitations||[]).map(l=>`<small>${esc(l)}</small>`).join('')}${technicalDisclosure('Digest input/output',`<code>input ${esc(x.inputSha256||'—')}<br>output ${esc(x.outputSha256||'—')}</code>`)}</article>`)}</section><section><h4>3. Decisioni umane</h4>${rows(trace.decisions,x=>`<article class="trace-row"><b>${esc(x.kind)} · ${esc(x.outcome||'')}</b><span>${esc(x.checkpoint||'checkpoint')} · ${esc(x.by||'persona')} · ${esc(x.at||'')}</span><p>${esc(x.reason||'')}</p>${technicalDisclosure('Versione collegata',`<code>${esc(x.subjectVersion?.kind||'')} ${esc(x.subjectVersion?.sha256||'')}</code>`)}</article>`)}</section><section><h4>4. Stato epistemico</h4>${rows(trace.epistemic,epistemicSummary)}</section><section><h4>5. Relazioni</h4>${rows(trace.relations,x=>`<article class="trace-row"><b>${esc(x.relation)}</b><span>${esc(x.direction||'')} ${esc(x.target?.type||x.source?.type||'')} · ${esc(x.target?.id||x.source?.id||'')}</span>${x.note?`<p>${esc(x.note)}</p>`:''}</article>`)}</section><section><h4>6. Audit e ricevute</h4>${rows(trace.auditEvents,x=>`<article class="trace-row"><b>r${esc(x.revision)} · ${esc(x.action)}</b><span>${esc(x.actorId||'')} · ${esc(x.at||'')}</span>${technicalDisclosure('Hash di audit',`<code>${esc(x.hash||'')}</code>`)}</article>`)}</section><section class="trace-boundary"><h4>7. Limiti</h4>${(trace.limitations||[]).map(x=>`<p>${esc(x)}</p>`).join('')}</section>`;
}
async function load(force=false){
  ensureHost();
  if(cache&&!force){renderList();return;}
  try{
    cache=await api('/api/work/traces');
    const filter=$('#traceProcessFilter'),ids=[...new Set((cache.traces||[]).map(x=>x.processId))];
    filter.innerHTML='<option value="">Tutti</option>'+ids.map(id=>{const m=processMeta(id);return`<option value="${esc(id)}">${esc(m.code)} · ${esc(m.label)}</option>`;}).join('');
    if(selectedTraceId&&!cache.traces?.some(x=>x.id===selectedTraceId))selectedTraceId='';
    renderList();
  }catch(error){notify(error.message,true);}
}
export function installTraceExplorer(){
  if(installed)return;installed=true;ensureHost();
  document.addEventListener('ictc:surface-changed',e=>{if(e.detail?.surface==='proof')load(true);});
  document.addEventListener('ictc:rendered',()=>{if(state.service==='proof')load(true);});
  document.addEventListener('input',e=>{if(e.target.id==='traceSearch')renderList();});
  document.addEventListener('change',e=>{if(e.target.id==='traceProcessFilter')renderList();});
  document.addEventListener('click',e=>{
    const item=e.target.closest('[data-trace-id]');
    if(item){selectedTraceId=item.dataset.traceId;const trace=cache?.traces?.find(x=>x.id===selectedTraceId);renderList();if(trace)renderDetail(trace);return;}
    const download=e.target.closest('[data-trace-download]');
    if(download)downloadProtected(download.dataset.traceDownload,'ictc-evidence.zip').catch(error=>notify(error.message,true));
  });
}
