import { $, esc, state } from './common.js';

const BOUNDARY='I dati, le persone, le decisioni e gli esiti mostrati in modalità DEMO sono sintetici. Coerenza del dataset e conteggi non dimostrano conformità, applicabilità, efficacia dei controlli o assurance esterna.';

function renderSuite30Disclosure(){
  const demo=state.data?.experience?.demo;
  if(!demo?.enabled||demo.projectionAuthority!=='demo-suite-3-0')return;
  const card=$('#ictcDemoCard'),dialog=$('#ictcDemoDialog'),coherent=demo.coherent===true,label=coherent?'Suite 3.0 verificata':'Suite 3.0 non coerente',tone=coherent?'ok':'attention',organization=esc(demo.organizationName||'Organizzazione demo'),digest=esc(String(demo.stateDigest||'').slice(0,12));
  document.documentElement.dataset.ictcDemoSuite='3.0';
  document.documentElement.dataset.ictcDemoProjection='demo-suite-3-0';
  if(card){
    card.setAttribute('aria-label',`Apri dettagli dati DEMO Suite 3.0: ${demo.organizationName||'organizzazione demo'}`);
    card.innerHTML=`<span class="demo-context-badge">DEMO</span><span class="demo-context-card-copy"><b>${organization}</b><small>Suite 3.0 · ${esc(label)}</small></span>`;
  }
  if(dialog)dialog.innerHTML=`<div class="demo-dialog-shell"><header class="demo-dialog-head"><div><p class="eyebrow">Contesto sintetico · Suite 3.0</p><h2 id="ictcDemoDialogTitle">Dati DEMO</h2><p>${organization}</p></div><button type="button" data-demo-close aria-label="Chiudi dettagli DEMO">×</button></header><div class="demo-dialog-body"><section class="demo-detail-card"><span>Dataset montato</span><strong>${Number(demo.positiveRecords||0)} record business 3.0</strong><small>Sette procedure native · unica dataset authority ${esc(demo.projectionAuthority)}</small></section><section class="demo-detail-card"><span>Evidence Lattice</span><strong>3.0 · read-only derivato</strong><small>Stessi record business; nessun ottavo processo e nessuna seconda write authority.</small></section><section class="demo-detail-card"><span>Stress corpus</span><strong>${Number(demo.stressFixtures||0)} fixture escluse</strong><small>Test-only · non persistite e non mostrate come record operativi.</small></section><section class="demo-detail-card"><span>Integrità</span><strong class="demo-audit-${tone}">${esc(label)}</strong><small>Digest ${digest||'non disponibile'} · Suite 2.2 deprecata: ${esc(demo.legacySourceStatus||'generator-only')}</small></section><section class="demo-detail-card demo-detail-boundary"><span>Limite</span><strong>Dimostrazione, non verdetto</strong><small>${esc(BOUNDARY)}</small></section></div></div>`;
}

export function installDemoSuite30Ui(){
  const afterRender=()=>queueMicrotask(renderSuite30Disclosure);
  document.addEventListener('ictc:rendered',afterRender);
  document.addEventListener('ictc:surface-changed',afterRender);
  afterRender();
}
