import { $, api, esc, state } from './common.js';

let cachedRole = null;
let cachedProof = null;
let loading = null;

function ensureSurface() {
  const nav = $('.service-nav');
  if (nav && !$('#openProofSurface')) nav.insertAdjacentHTML('beforeend', '<button id="openProofSurface" type="button" data-proof-service="proof" aria-current="false">Prove</button>');
  const main = $('#main');
  if (!main || $('#proofView')) return;
  main.insertAdjacentHTML('beforeend', `
    <section id="proofView" class="view proof-view" hidden tabindex="-1" aria-labelledby="proofTitle">
      <header class="proof-head"><div><p class="eyebrow">EV-01 · Evidenze e controlli</p><h1 id="proofTitle">Prove, postura e limiti</h1><p>Questa vista legge la projection del runtime. Non certifica conformità, applicabilità o verità sostanziale.</p></div><button id="refreshProof" class="secondary" type="button">Aggiorna</button></header>
      <div id="proofLoading" class="proof-state" role="status">Caricamento delle prove…</div>
      <div id="proofError" class="proof-state boundary" role="alert" hidden></div>
      <div id="proofContent" hidden>
        <section class="proof-metrics" aria-label="Sintesi prova">
          <article><span>Release</span><b id="proofRelease">—</b></article>
          <article><span>Ruolo</span><b id="proofActor">—</b></article>
          <article><span>Controlli runtime</span><b id="proofRuntime">—</b></article>
          <article><span>Integrità locale</span><b id="proofIntegrity">—</b></article>
        </section>
        <section class="proof-grid">
          <article class="home-panel"><p class="eyebrow">Limite</p><h2>Cosa questa prova non conclude</h2><p id="proofBoundary"></p><p id="proofReadinessLimit" class="boundary"></p></article>
          <article class="home-panel"><p class="eyebrow">Deployment</p><h2>Attestazioni ancora richieste</h2><ul id="proofDeploymentGaps" class="proof-list"></ul></article>
        </section>
        <section class="home-panel"><p class="eyebrow">Mapping selezionati</p><h2>Pratica, evidenza e limite</h2><div id="proofMappings" class="proof-mappings"></div></section>
      </div>
    </section>`);
}

function blockerMarkup(items) {
  if (!items.length) return '<li>Nessun blocker di deployment nella projection corrente.</li>';
  return items.map(item => `<li><b>${esc(item.label)}</b><span>${esc(item.evidence || 'Evidenza non disponibile')}</span>${item.action ? `<small>${esc(item.action)}</small>` : ''}</li>`).join('');
}

function mappingMarkup(items) {
  if (!items.length) return '<div class="empty">Nessun mapping disponibile.</div>';
  return items.map(item => `<details class="proof-mapping"><summary><span><b>${esc(item.name)}</b><small>${esc(item.alignment)}</small></span></summary><div><p><b>Pratica ICTC.</b> ${esc(item.ictcPractice)}</p><p><b>Evidenze.</b> ${esc((item.evidence || []).join(' · '))}</p><p class="boundary"><b>Limite.</b> ${esc(item.limit)}</p></div></details>`).join('');
}

function renderProof(data) {
  cachedProof = data;
  cachedRole = state.role;
  const posture = data.proof?.posture || {};
  const runtime = posture.runtime || { verified: 0, total: 0 };
  const deployment = posture.deployment || { blockers: [] };
  const integrity = data.proof?.integrity || {};
  $('#proofRelease').textContent = data.release || 'Non disponibile';
  $('#proofActor').textContent = `${data.actor?.label || data.actor?.role || 'Ruolo'} · ${data.actor?.modeLabel || data.actor?.mode || 'modalità non disponibile'}`;
  $('#proofRuntime').textContent = `${runtime.verified || 0}/${runtime.total || 0} verificati`;
  $('#proofIntegrity').textContent = integrity.ok ? `Coerente · r${integrity.revision || 0}` : 'Da verificare';
  $('#proofBoundary').textContent = data.claimBoundary || 'Nessuna conclusione sostanziale viene inferita dalla sola presenza di evidenze.';
  $('#proofReadinessLimit').textContent = posture.limitation || 'Un controllo senza evidenza resta non verificato.';
  $('#proofDeploymentGaps').innerHTML = blockerMarkup(deployment.blockers || []);
  $('#proofMappings').innerHTML = mappingMarkup(data.benchmarkFamilies || []);
  $('#proofLoading').hidden = true;
  $('#proofError').hidden = true;
  $('#proofContent').hidden = false;
}

async function loadProof(force = false) {
  if (!force && cachedProof && cachedRole === state.role) { renderProof(cachedProof); return cachedProof; }
  if (loading) return loading;
  $('#proofLoading').hidden = false;
  $('#proofContent').hidden = true;
  $('#proofError').hidden = true;
  loading = api('/api/standard-proof').then(renderProof).catch(error => {
    $('#proofLoading').hidden = true;
    $('#proofError').hidden = false;
    $('#proofError').textContent = `Prova non disponibile: ${error.message}`;
    throw error;
  }).finally(() => { loading = null; });
  return loading;
}

export function installProofSurface() {
  ensureSurface();
  $('#refreshProof')?.addEventListener('click', () => loadProof(true).catch(() => {}));
  document.addEventListener('ictc:surface-changed', event => {
    if (event.detail?.surface === 'proof') loadProof().catch(() => {});
  });
  document.addEventListener('ictc:rendered', () => {
    if (state.service === 'proof') loadProof(true).catch(() => {});
  });
}
