import { $, api, esc, state } from './common.js';
import { installStable14Experience } from './stable-1-4-home.js';
import { navigateSurface, renderSurfaceNavigation } from './surface-router.js';

let cachedProof = null;
let cachedRole = null;
let loadingPromise = null;

const roleIntroductions = {
  admin: 'Leggi la postura, distingui i controlli dimostrati dai gap esterni e apri il dettaglio solo quando serve.',
  user: 'Capisci cosa puoi registrare, quale effetto produce e dove resta la prova.',
  auditor: 'Ricostruisci autorità, architettura, standard, evidenze e limiti in sola lettura.'
};
const alignmentLabels = {
  'implemented-baseline': 'Baseline implementata',
  'aligned-and-evidenced': 'Allineato con evidenze',
  'external-validation-required': 'Validazione esterna richiesta',
  'practice-inspired': 'Pratica di ispirazione',
  'context-only': 'Contesto normativo'
};

function proofMarkup() {
  return `
    <section id="proofView" class="view proof-view proof-view-17" hidden tabindex="-1" aria-labelledby="proofTitle">
      <section class="proof-hero proof-hero-17" aria-describedby="proofLead">
        <div class="proof-hero-copy">
          <p class="eyebrow">ICTC 1.7 · Enterprise clarity</p>
          <h1 id="proofTitle">Capire. Verificare. Decidere.</h1>
          <p id="proofLead">La prima vista mostra soltanto identità, postura, confine e prossima esplorazione. Il dettaglio completo resta disponibile nell'app.</p>
          <p id="proofRoleIntro" class="proof-role-intro"></p>
          <button id="openProofDetails" class="primary" type="button">Apri mappa completa</button>
        </div>
        <aside class="proof-verdict" aria-label="Stato sintetico della prova">
          <div><span>Release</span><b id="proofRelease">Caricamento</b></div>
          <div><span>Ruolo e modalità</span><b id="proofActor">—</b></div>
          <div><span>Controlli runtime</span><b id="proofRuntime">—</b></div>
          <div><span>Gap deployment</span><b id="proofDeployment">—</b></div>
          <div><span>Catena evidenze</span><b id="proofIntegrity">—</b></div>
          <div><span>Regola</span><b>Pratica · prova · limite</b></div>
        </aside>
      </section>

      <div id="proofLoading" class="proof-state" role="status">Caricamento della prova dal runtime…</div>
      <div id="proofError" class="proof-state proof-state-error" role="alert" hidden>
        <b>La prova non è disponibile.</b><span id="proofErrorMessage"></span>
        <button id="retryProof" type="button">Riprova</button>
      </div>
      <div id="proofContent" hidden>
        <section id="proofStart" class="proof-section proof-start-17" aria-labelledby="proofStartTitle">
          <header><p class="eyebrow">In breve</p><h2 id="proofStartTitle">Tre risposte prima del dettaglio</h2></header>
          <div id="proofAnswers" class="proof-answer-grid"></div>
        </section>
      </div>
    </section>`;
}

function detailDialogMarkup() {
  return `<dialog id="proofDetailDialog" class="proof-detail-dialog" aria-labelledby="proofDetailTitle">
    <div class="proof-detail-shell">
      <header><div><p class="eyebrow">Mappa completa</p><h2 id="proofDetailTitle">Come ICTC collega sistema, lavoro, standard e prove</h2><p>Questa vista è informativa e read-only. Ogni mapping distingue principio, pratica, evidenza e limite.</p></div><button type="button" data-proof-close aria-label="Chiudi">×</button></header>
      <nav class="proof-index" aria-label="Indice della guida ICTC">
        <a href="#proofArchitecture">Architettura</a><a href="#proofJourneys">Flussi</a><a href="#proofStandards">Standard</a><a href="#proofGlossary">Glossario</a><a href="#proofLimits">Limiti</a>
      </nav>
      <div class="proof-detail-content">
        <section id="proofArchitecture" class="proof-section" aria-labelledby="proofArchitectureTitle"><header><p class="eyebrow">Infrastruttura</p><h2 id="proofArchitectureTitle">Otto strati, una sola fonte di verità</h2><p>La vista spiega il sistema; non replica dati operativi né introduce un secondo runtime.</p></header><ol id="proofStack" class="proof-stack"></ol></section>
        <section id="proofJourneys" class="proof-section" aria-labelledby="proofJourneysTitle"><header><p class="eyebrow">Logica</p><h2 id="proofJourneysTitle">Dal dato grezzo alla prova</h2></header><div id="proofJourneyGrid" class="proof-journey-grid"></div></section>
        <section id="proofStandards" class="proof-section" aria-labelledby="proofStandardsTitle"><header><p class="eyebrow">Riferimenti</p><h2 id="proofStandardsTitle">Standard e pratiche di ispirazione</h2><p>“Allineato” descrive una pratica osservabile; non significa certificato o legalmente conforme.</p></header><div id="proofStandardList" class="proof-standard-list"></div></section>
        <section id="proofGlossary" class="proof-section" aria-labelledby="proofGlossaryTitle"><header><p class="eyebrow">Ontologia</p><h2 id="proofGlossaryTitle">Parole che non sono sinonimi</h2></header><dl id="proofGlossaryList" class="proof-glossary"></dl></section>
        <section id="proofLimits" class="proof-section proof-limits" aria-labelledby="proofLimitsTitle"><header><p class="eyebrow">Confine</p><h2 id="proofLimitsTitle">Cosa questa prova non dimostra</h2></header><p id="proofBoundary"></p><div class="proof-limit-grid"><div><h3>Evidenze disponibili</h3><ul id="proofEvidenceKinds"></ul></div><div><h3>Attestazioni mancanti</h3><ul id="proofDeploymentGaps"></ul></div></div></section>
      </div>
    </div>
  </dialog>`;
}

function adminProofMarkup() {
  return `<section id="adminProofPanel" class="admin-panel admin-proof-panel" aria-labelledby="adminProofTitle"><div class="admin-proof-head"><div><p class="eyebrow">Enterprise clarity</p><h3 id="adminProofTitle">Postura e confini</h3><p>Una sintesi leggibile; il dettaglio resta nella mappa completa.</p></div><button id="openProofFromAdmin" type="button">Apri guida e prova</button></div><div id="adminProofMetrics" class="metric-grid" aria-live="polite"><div class="metric"><b>—</b><small>Caricamento prova</small></div></div></section>`;
}

function ensureSurface() {
  const nav = $('.service-nav');
  if (nav && !$('#openStandardProof')) nav.insertAdjacentHTML('beforeend', '<button id="openStandardProof" type="button" data-proof-service="proof" aria-current="false">Guida e prova</button>');
  const main = $('#main');
  if (main && !$('#proofView')) main.insertAdjacentHTML('beforeend', proofMarkup());
  if (!$('#proofDetailDialog')) document.body.insertAdjacentHTML('beforeend', detailDialogMarkup());
  const adminGrid = $('#adminCenter .admin-grid');
  if (adminGrid && !$('#adminProofPanel')) adminGrid.insertAdjacentHTML('afterbegin', adminProofMarkup());
}

function listMarkup(values) {
  return (values || []).map(value => `<li>${esc(value)}</li>`).join('');
}

function renderAdminProof(data) {
  const root = $('#adminProofMetrics');
  if (!root || data.actor.role !== 'admin') return;
  const posture = data.proof.posture;
  root.innerHTML = `<div class="metric"><b>${esc(data.release)}</b><small>Release attiva</small></div><div class="metric"><b>${esc(posture.runtime.verified)}/${esc(posture.runtime.total)}</b><small>Controlli runtime</small></div><div class="metric"><b>${esc(posture.deployment.blockers.length)}</b><small>Gap deployment</small></div><div class="metric"><b>${data.proof.integrity.ok ? 'Coerente' : 'Da verificare'}</b><small>Catena evidenze</small></div>`;
}

function renderProof(data) {
  cachedProof = data;
  cachedRole = state.role;
  const posture = data.proof.posture;
  $('#proofRelease').textContent = data.release;
  $('#proofActor').textContent = `${data.actor.label} · ${data.actor.modeLabel}`;
  $('#proofRoleIntro').textContent = roleIntroductions[data.actor.role] || roleIntroductions.user;
  $('#proofRuntime').textContent = `${posture.runtime.verified}/${posture.runtime.total} verificati`;
  $('#proofDeployment').textContent = `${posture.deployment.blockers.length} aperti`;
  $('#proofIntegrity').textContent = data.proof.integrity.ok ? `Coerente · r${data.proof.integrity.revision}` : 'Da verificare';
  const answers = [
    ['Che cos’è', 'Un workspace evidence-first per monitoraggio normativo e fascicoli evento, con autorità umana esplicita.'],
    ['Cosa puoi fare', data.actor.role === 'auditor' ? 'Consultare e ricostruire in sola lettura.' : data.actor.role === 'admin' ? 'Governare configurazioni, identità e decisioni autorizzate.' : 'Registrare materiali e i tuoi eventi senza formulare conclusioni preventive.'],
    ['Cosa non è', 'Non è un parere legale, un certificato di conformità o una prova automatica di verità sostanziale.']
  ];
  $('#proofAnswers').innerHTML = answers.map(([title, body]) => `<article><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('');
  $('#proofStack').innerHTML = data.architecture.map((layer, index) => `<li><span>${index + 1}</span><div><h3>${esc(layer.label)}</h3><p>${esc(layer.description)}</p></div></li>`).join('');
  $('#proofJourneyGrid').innerHTML = data.journeys.map(journey => `<article><h3>${esc(journey.label)}</h3><dl><div><dt>Ingresso</dt><dd>${esc(journey.input)}</dd></div><div><dt>Checkpoint umano</dt><dd>${esc(journey.humanGate)}</dd></div><div><dt>Esito</dt><dd>${esc(journey.output)}</dd></div></dl></article>`).join('');
  $('#proofStandardList').innerHTML = data.benchmarkFamilies.map((item, index) => `<details class="proof-standard" ${index === 0 ? 'open' : ''}><summary><span><small>${esc(item.family)}</small><b>${esc(item.name)}</b></span><em data-alignment="${esc(item.alignment)}">${esc(alignmentLabels[item.alignment] || item.alignment)}</em></summary><div class="proof-standard-body"><p><b>Principio.</b> ${esc(item.principle)}</p><p><b>Pratica ICTC.</b> ${esc(item.ictcPractice)}</p><p><b>Evidenze.</b> ${esc(item.evidence.join(' · '))}</p><p class="boundary"><b>Limite.</b> ${esc(item.limit)}</p><a aria-label="Riferimento ufficiale ${esc(item.name)}" href="${esc(item.officialUrl)}" target="_blank" rel="noopener noreferrer">Riferimento ufficiale</a></div></details>`).join('');
  $('#proofGlossaryList').innerHTML = data.glossary.map(item => `<div><dt>${esc(item.term)}</dt><dd>${esc(item.definition)}</dd></div>`).join('');
  $('#proofBoundary').textContent = data.claimBoundary;
  $('#proofEvidenceKinds').innerHTML = listMarkup(data.proof.evidenceKinds);
  $('#proofDeploymentGaps').innerHTML = posture.deployment.blockers.length ? posture.deployment.blockers.map(item => `<li><b>${esc(item.label)}</b><span>${esc(item.evidence)}${item.action ? ` · ${esc(item.action)}` : ''}</span></li>`).join('') : '<li>Nessun gap di deployment aperto nel profilo corrente.</li>';
  $('#proofLoading').hidden = true;
  $('#proofError').hidden = true;
  $('#proofContent').hidden = false;
  renderAdminProof(data);
}

async function loadProof(force = false) {
  if (!force && cachedProof && cachedRole === state.role) { renderProof(cachedProof); return cachedProof; }
  if (loadingPromise) return loadingPromise;
  $('#proofLoading')?.removeAttribute('hidden');
  $('#proofContent')?.setAttribute('hidden', '');
  $('#proofError')?.setAttribute('hidden', '');
  $('#proofView')?.setAttribute('aria-busy', 'true');
  loadingPromise = api('/api/standard-proof').then(data => { renderProof(data); return data; }).catch(error => {
    $('#proofLoading').hidden = true;
    $('#proofError').hidden = false;
    $('#proofErrorMessage').textContent = error.message;
    throw error;
  }).finally(() => { $('#proofView')?.removeAttribute('aria-busy'); loadingPromise = null; });
  return loadingPromise;
}

function bindSurface() {
  $('#retryProof')?.addEventListener('click', () => loadProof(true).catch(() => {}));
  $('#openProofDetails')?.addEventListener('click', () => $('#proofDetailDialog')?.showModal());
  $('[data-proof-close]')?.addEventListener('click', () => $('#proofDetailDialog')?.close());
  $('#openProofFromAdmin')?.addEventListener('click', () => {
    if ($('#adminCenter')?.open) $('#adminCenter').close();
    navigateSurface('proof', { focusTarget: '#proofView' });
  });
  $('#openAdminCenter')?.addEventListener('click', () => loadProof(true).catch(() => {}));
  document.addEventListener('ictc:surface-changed', event => {
    if (event.detail?.surface === 'proof') loadProof().catch(() => {});
  });
}

export function installStandardProof17Experience() {
  installStable14Experience();
  ensureSurface();
  bindSurface();
  renderSurfaceNavigation();
  document.addEventListener('ictc:rendered', () => {
    if (state.service === 'proof') loadProof(true).catch(() => {});
  });
}
