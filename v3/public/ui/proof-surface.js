import { $, api, downloadProtected, esc, notify, state } from './common.js';
import { PRODUCT_COPY, SURFACE_LABELS } from './product-copy.js';

let cachedRole = null;
let cachedRevision = -1;
let cachedProof = null;
let loading = null;
let requestSequence = 0;

function currentRevision() {
  const revision = Number(state.data?.revision || 0);
  return Number.isFinite(revision) && revision >= 0 ? revision : 0;
}

function processForSubject(type) {
  return (state.data?.procedureRegistry?.procedures || []).find(item =>
    (item.adapter?.subjectTypes || []).includes(type)
  ) || null;
}

function ensureSurface() {
  const main = $('#main');
  if (!main || $('#proofView')) return;
  main.insertAdjacentHTML('beforeend', `<section id="proofView" class="view proof-view" hidden tabindex="-1" aria-labelledby="proofTitle"><header class="proof-head proof-hero"><div><p class="eyebrow">Postura ICTC</p><h1 id="proofTitle">${esc(SURFACE_LABELS.proof)}</h1><p>${esc(PRODUCT_COPY.proofLead)}</p></div><div class="proof-hero-note"><b>Leggi dal generale al dettaglio</b><span>Osservabile → evidenza richiesta → limiti → tracciabilità</span></div></header><div id="proofLoading" class="proof-state" role="status">Caricamento della postura…</div><div id="proofError" class="proof-state boundary" role="alert" hidden></div><div id="proofContent" hidden><section class="proof-snapshot" aria-label="Sintesi postura"><article><span>Decisioni umane</span><b id="evidenceDecisionCount">0</b><small>nel perimetro visibile</small></article><article><span>Procedure con decisioni</span><b id="evidenceProcessCount">0</b><small>su 7 procedure operative</small></article><article><span>Integrità locale</span><b id="proofIntegrity">—</b><small>coerenza tecnica registrata</small></article><article><span>Ambito di lettura</span><b id="evidenceActor">—</b><small>non amplia i permessi</small></article></section><section class="proof-reading-grid"><article class="proof-reading-card"><p class="eyebrow">Osservabile</p><h2>Cosa ICTC può mostrare</h2><p>Decisioni, receipt, versioni, relazioni, controlli runtime e provenienza effettivamente registrati.</p></article><article class="proof-reading-card"><p class="eyebrow">Da completare</p><h2>Evidenza ancora richiesta</h2><p id="proofReadinessLimit">Un controllo senza evidenza resta non verificato.</p></article><article class="proof-reading-card proof-reading-boundary"><p class="eyebrow">Confine</p><h2>Cosa non viene concluso</h2><p id="proofBoundary"></p></article></section><details class="proof-section" open><summary><span><b>Decisioni e tracciabilità</b><small>La traccia umana più recente nel perimetro accessibile</small></span></summary><div class="proof-section-body"><div id="evidenceDecisionList" class="evidence-decision-list"></div><p class="proof-inline-boundary">Un hash o un fascicolo dimostra una registrazione tecnica, non la sufficienza sostanziale della prova.</p></div></details><details class="proof-section"><summary><span><b>Runtime e integrità</b><small>Release, ruolo e controlli tecnici osservabili</small></span></summary><div class="proof-section-body"><section class="proof-metrics" aria-label="Postura tecnica"><article><span>Release</span><b id="proofRelease">—</b></article><article><span>Ruolo</span><b id="proofActor">—</b></article><article><span>Controlli runtime</span><b id="proofRuntime">—</b></article></section></div></details><details class="proof-section"><summary><span><b>Deployment e requisiti esterni</b><small>Attestazioni che il repository non può sostituire</small></span></summary><div class="proof-section-body"><ul id="proofDeploymentGaps" class="proof-list"></ul></div></details><details class="proof-section"><summary><span><b>Standard e riferimenti</b><small>Mappature di pratica, non attestazioni di conformità</small></span></summary><div class="proof-section-body"><div id="translationMappings" class="proof-mappings"></div></div></details><details class="proof-section"><summary><span><b>Export della vista corrente</b><small>Gli export mantengono lo stesso perimetro di lettura</small></span></summary><div class="proof-section-body"><div class="proof-actions"><button id="downloadViewCsv" class="secondary" type="button">CSV</button><button id="downloadViewJson" class="secondary" type="button">JSON</button><button id="refreshProof" class="secondary" type="button">Aggiorna postura</button></div><p class="proof-inline-boundary">I fascicoli di singolo oggetto sono disponibili in PDF, XML, Markdown e ZIP dalle relative procedure.</p></div></details></div></section>`);
}

function blockerMarkup(items) {
  if (!items.length) {
    return '<li><b>Nessun requisito esterno segnalato</b><span>La proiezione corrente non segnala attestazioni mancanti; questo non equivale a un assessment del deployment.</span></li>';
  }
  return items.map(item => `<li><b>${esc(item.label)}</b><span>${esc(item.evidence || 'Evidenza non disponibile')}</span>${item.action ? `<small>${esc(item.action)}</small>` : ''}</li>`).join('');
}

function translationMarkup() {
  const packs = state.data?.translationPacks?.packs || [];
  if (!packs.length) return '<div class="empty">Nessun riferimento esterno disponibile.</div>';
  return packs.map(pack => `<details class="proof-mapping"><summary><span><b>${esc(pack.framework)} · ${esc(pack.edition)}</b><small>riferimento, non assessment</small></span></summary><div>${(pack.mappings || []).map(item => `<p><b>${esc(item.externalRef)}</b> ← ${esc(item.sourceRef)}<br><span>${esc(item.mappingKind)}</span></p><p class="boundary"><b>Limite.</b> ${esc(item.limitation)}</p>`).join('')}</div></details>`).join('');
}

function decisionMarkup() {
  const records = [...(state.data?.decisions?.records || [])].reverse().slice(0, 12);
  if (!records.length) return '<div class="empty">Nessuna decisione umana registrata nel perimetro accessibile.</div>';
  return records.map(record => {
    const procedure = processForSubject(record.subject?.type);
    const code = procedure?.code || '—';
    const label = procedure?.label || 'Procedura';
    const when = record.at ? new Date(record.at).toLocaleString('it-IT') : 'Data non disponibile';
    return `<article class="evidence-decision"><div class="evidence-decision-meta"><span>${esc(code)}</span><small>${esc(label)}</small></div><div><h3>${esc(record.outcome || record.kind)}</h3><p>${esc(record.reason || 'Motivazione non registrata.')}</p><small>${esc(record.checkpoint || record.kind)} · ${esc(record.actor?.id || 'actor non disponibile')} · ${esc(when)}</small></div></article>`;
  }).join('');
}

function renderBusinessEvidence() {
  const records = state.data?.decisions?.records || [];
  const processes = new Set(records.map(record => processForSubject(record.subject?.type)?.id).filter(Boolean));
  $('#evidenceDecisionCount').textContent = records.length;
  $('#evidenceProcessCount').textContent = processes.size;
  $('#evidenceActor').textContent = state.role === 'admin' ? 'Amministrazione' : state.role === 'auditor' ? 'Auditor' : 'Utente';
  $('#evidenceDecisionList').innerHTML = decisionMarkup();
}

function renderProof(data, revision = currentRevision()) {
  cachedProof = data;
  cachedRole = state.role;
  cachedRevision = Math.max(cachedRevision, Number(revision || 0));
  const posture = data.proof?.posture || {};
  const runtime = posture.runtime || { verified: 0, total: 0 };
  const deployment = posture.deployment || { blockers: [] };
  const integrity = data.proof?.integrity || {};
  renderBusinessEvidence();
  $('#proofRelease').textContent = data.release || 'Non disponibile';
  $('#proofActor').textContent = `${data.actor?.label || data.actor?.role || 'Ruolo'} · ${data.actor?.modeLabel || data.actor?.mode || 'modalità non disponibile'}`;
  $('#proofRuntime').textContent = `${runtime.verified || 0}/${runtime.total || 0} verificati`;
  $('#proofIntegrity').textContent = integrity.ok ? `Coerente · r${integrity.revision || 0}` : 'Da verificare';
  $('#proofBoundary').textContent = data.claimBoundary || PRODUCT_COPY.proofBoundary;
  $('#proofReadinessLimit').textContent = posture.limitation || 'Un controllo senza evidenza resta non verificato.';
  $('#proofDeploymentGaps').innerHTML = blockerMarkup(deployment.blockers || []);
  $('#translationMappings').innerHTML = translationMarkup();
  const view = $('#proofView');
  view.dataset.loadedRevision = String(cachedRevision);
  view.setAttribute('aria-busy', 'false');
  $('#proofLoading').hidden = true;
  $('#proofError').hidden = true;
  $('#proofContent').hidden = false;
}

function clearCache() {
  cachedRole = null;
  cachedRevision = -1;
  cachedProof = null;
  requestSequence += 1;
  loading = null;
}

function cacheCovers(revision) {
  return Boolean(cachedProof && cachedRole === state.role && cachedRevision >= revision);
}

function beginLoad({ initial }) {
  const view = $('#proofView');
  view.setAttribute('aria-busy', 'true');
  $('#proofError').hidden = true;
  $('#proofLoading').hidden = !initial;
  if (initial) $('#proofContent').hidden = true;
}

function failLoad(error, { initial }) {
  const view = $('#proofView');
  view.setAttribute('aria-busy', 'false');
  $('#proofLoading').hidden = true;
  $('#proofError').hidden = false;
  $('#proofError').textContent = `${initial ? 'Postura non disponibile' : 'Aggiornamento della postura non riuscito'}: ${error.message}`;
  if (!initial && cachedProof && cachedRole === state.role) $('#proofContent').hidden = false;
}

async function loadProof({ force = false, targetRevision = currentRevision() } = {}) {
  const revision = Math.max(0, Number(targetRevision || 0), currentRevision());
  if (!force && cacheCovers(revision)) {
    renderProof(cachedProof, cachedRevision);
    return cachedProof;
  }
  if (!force && loading && loading.role === state.role && loading.targetRevision >= revision) return loading.promise;

  const role = state.role;
  const initial = !cachedProof || cachedRole !== role;
  const sequence = ++requestSequence;
  beginLoad({ initial });

  const promise = api('/api/standard-proof')
    .then(data => {
      if (sequence !== requestSequence || state.role !== role) return null;
      renderProof(data, revision);
      return data;
    })
    .catch(error => {
      if (sequence === requestSequence && state.role === role) failLoad(error, { initial });
      throw error;
    })
    .finally(() => {
      if (loading?.sequence === sequence) loading = null;
    });

  loading = { sequence, role, targetRevision: revision, promise };
  return promise;
}

export function installProofSurface() {
  ensureSurface();
  $('#refreshProof')?.addEventListener('click', () => loadProof({ force: true }).catch(() => {}));
  $('#downloadViewCsv')?.addEventListener('click', async () => {
    try { await downloadProtected('/api/export/current.csv', 'ictc-current-view.csv'); }
    catch (error) { notify(error.message, true); }
  });
  $('#downloadViewJson')?.addEventListener('click', async () => {
    try { await downloadProtected('/api/export/current.json', 'ictc-current-view.json'); }
    catch (error) { notify(error.message, true); }
  });
  document.addEventListener('ictc:surface-changed', event => {
    if (event.detail?.surface === 'proof') loadProof({ targetRevision: currentRevision() }).catch(() => {});
  });
  document.addEventListener('ictc:projection-committed', event => {
    const actorRole = event.detail?.actorRole || state.role;
    if (cachedRole && cachedRole !== actorRole) clearCache();
    const revision = Number(event.detail?.revision || 0);
    if (state.service === 'proof' && revision > cachedRevision) loadProof({ targetRevision: revision }).catch(() => {});
  });
  if (state.service === 'proof') loadProof({ targetRevision: currentRevision() }).catch(() => {});
}
