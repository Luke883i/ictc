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
  main.insertAdjacentHTML('beforeend', `<section id="proofView" class="view proof-view" hidden tabindex="-1" aria-labelledby="proofTitle"><header class="proof-head proof-hero"><div><p class="eyebrow">Evidenza sul funzionamento ICTC</p><h1 id="proofTitle">${esc(SURFACE_LABELS.proof)}</h1><p>${esc(PRODUCT_COPY.proofLead)}</p></div><div class="proof-hero-note"><b>Dalla prova al limite</b><span>Fatto osservato → evidenza → requisito esterno → limite</span></div></header><div id="proofLoading" class="proof-state" role="status">Caricamento delle evidenze…</div><div id="proofError" class="proof-state boundary" role="alert" hidden></div><div id="proofContent" hidden><section class="proof-snapshot" aria-label="Sintesi delle prove"><article><span>Decisioni registrate</span><b id="evidenceDecisionCount">0</b><small>nel perimetro visibile</small></article><article><span>Processi con decisioni</span><b id="evidenceProcessCount">0</b><small>su 7 Processi di Compliance</small></article><article><span>Integrità della catena</span><b id="proofIntegrity">—</b><small>coerenza tecnica osservabile, non conformità</small></article><article><span>Vista per ruolo</span><b id="evidenceActor">—</b><small>non amplia i permessi</small></article></section><section class="proof-reading-grid"><article class="proof-reading-card"><p class="eyebrow">Fatti osservabili</p><h2>Cosa ICTC registra</h2><p>Decisioni, ricevute, versioni, relazioni, controlli runtime e provenienza effettivamente presenti.</p></article><article class="proof-reading-card"><p class="eyebrow">Evidenza esterna</p><h2>Cosa resta da provare</h2><p id="proofReadinessLimit">Un controllo senza evidenza resta non verificato.</p></article><article class="proof-reading-card proof-reading-boundary"><p class="eyebrow">Confine</p><h2>Cosa non si può concludere</h2><p id="proofBoundary"></p></article></section><section class="proof-method" aria-labelledby="proofMethodTitle"><header><p class="eyebrow">Metodo di lettura</p><h2 id="proofMethodTitle">Come leggere le prove ICTC</h2><p>Ogni affermazione deve essere collegata a una pratica osservabile, a una prova e a un limite esplicito.</p></header><ol id="proofEvidenceKinds" class="proof-method-list"></ol><p id="proofRule" class="proof-inline-boundary"></p></section><details class="proof-section"><summary><span><b>Decisioni e tracciabilità</b><small>Eventi umani recenti; apri per il dettaglio</small></span></summary><div class="proof-section-body"><div id="evidenceDecisionList" class="evidence-decision-list"></div><p class="proof-inline-boundary">Un hash o un fascicolo dimostra una registrazione tecnica, non la sufficienza sostanziale della prova.</p></div></details><details class="proof-section"><summary><span><b>Runtime e integrità</b><small>Versione, accesso e controlli tecnici osservabili</small></span></summary><div class="proof-section-body"><section class="proof-metrics" aria-label="Evidenza tecnica del runtime"><article><span>Versione runtime</span><b id="proofRelease">—</b></article><article><span>Ruolo osservato</span><b id="proofActor">—</b></article><article><span>Controlli con evidenza</span><b id="proofRuntime">—</b><small>non è un punteggio di conformità o sicurezza</small></article></section></div></details><details class="proof-section"><summary><span><b>Deployment e requisiti esterni</b><small>Attestazioni che il repository non può produrre da solo</small></span></summary><div class="proof-section-body"><ul id="proofDeploymentGaps" class="proof-list"></ul></div></details><details class="proof-section"><summary><span><b>Standard dichiarati e riferimenti</b><small>Pratica + evidenza + limite, mai certificazione</small></span></summary><div class="proof-section-body"><div id="proofBenchmarkMappings" class="proof-mappings"></div><div id="translationMappings" class="proof-mappings"></div></div></details><details class="proof-section"><summary><span><b>Export della vista corrente</b><small>Gli export mantengono lo stesso perimetro di lettura</small></span></summary><div class="proof-section-body"><div class="proof-actions"><button id="downloadViewCsv" class="secondary" type="button">CSV</button><button id="downloadViewJson" class="secondary" type="button">JSON</button><button id="refreshProof" class="secondary" type="button">Aggiorna evidenze</button></div><p class="proof-inline-boundary">I fascicoli di singolo oggetto sono disponibili in PDF, XML, Markdown e ZIP dai relativi Processi di Compliance.</p></div></details></div></section>`);
}

function friendlyEvidence(value) {
  const raw = String(value || '');
  if (!raw) return 'Attestazione esterna non disponibile.';
  if (/(?:-missing|-invalid)/i.test(raw)) return 'Attestazione assente, incompleta o non valida per il deployment osservato.';
  return raw;
}

function blockerMarkup(items) {
  if (!items.length) {
    return '<li><b>Nessun requisito esterno segnalato</b><span>La proiezione corrente non segnala attestazioni mancanti; questo non equivale a un assessment del deployment.</span></li>';
  }
  return items.map(item => {
    const raw = item.evidence || 'Evidenza non disponibile';
    const hasTechnical = /(?:-missing|-invalid)/i.test(raw) || /ICTC_[A-Z0-9_]+/.test(item.action || '');
    const action = item.action ? 'Richiede configurazione o attestazione esterna.' : '';
    const technical = hasTechnical ? `<details class="proof-technical-detail"><summary>Dettagli tecnici</summary><code>${esc(raw)}</code>${item.action ? `<small>${esc(item.action)}</small>` : ''}</details>` : (item.action ? `<small>${esc(item.action)}</small>` : '');
    return `<li><b>${esc(item.label)}</b><span>${esc(friendlyEvidence(raw))}</span>${action ? `<small>${esc(action)}</small>` : ''}${technical}</li>`;
  }).join('');
}

function alignmentLabel(value) {
  return ({
    'implemented-baseline': 'Baseline implementata',
    'aligned-and-evidenced': 'Pratica mappata con evidenza',
    'external-validation-required': 'Validazione esterna richiesta',
    'practice-inspired': 'Pratica ispirata',
    'context-only': 'Riferimento di contesto'
  })[value] || 'Mappatura informativa';
}

function benchmarkMarkup(items = []) {
  if (!items.length) return '<div class="empty">Nessun benchmark dichiarato disponibile.</div>';
  return items.map(item => `<details class="proof-mapping"><summary><span><b>${esc(item.name || item.id)}</b><small>${esc(alignmentLabel(item.alignment))}</small></span></summary><div><p><b>Pratica ICTC.</b> ${esc(item.ictcPractice || 'Non descritta.')}</p><p><b>Evidenza.</b> ${esc((item.evidence || []).join(' · ') || 'Non indicata.')}</p><p class="boundary"><b>Limite.</b> ${esc(item.limit || 'La mappatura non equivale a una conclusione di conformità.')}</p></div></details>`).join('');
}

function translationMarkup() {
  const packs = state.data?.translationPacks?.packs || [];
  if (!packs.length) return '<div class="empty">Nessun ulteriore riferimento esterno disponibile.</div>';
  return packs.map(pack => `<details class="proof-mapping"><summary><span><b>${esc(pack.framework)} · ${esc(pack.edition)}</b><small>riferimento, non assessment</small></span></summary><div>${(pack.mappings || []).map(item => `<p><b>${esc(item.externalRef)}</b> ← ${esc(item.sourceRef)}<br><span>${esc(item.mappingKind)}</span></p><p class="boundary"><b>Limite.</b> ${esc(item.limitation)}</p>`).join('')}</div></details>`).join('');
}

function proofMethodMarkup(items = []) {
  if (!items.length) return '<li><b>Metodo non disponibile</b><span>La proiezione corrente non espone ancora i tipi di prova.</span></li>';
  return items.map((item, index) => `<li><span aria-hidden="true">${index + 1}</span><p>${esc(item)}</p></li>`).join('');
}

function humanOutcome(value) {
  return ({approved:'Approvata',reviewed:'Validata',accepted:'Accettata',rejected:'Esclusa',closed:'Chiusa',done:'Completata',mapped:'Mappata',gap:'Gap'})[value] || String(value || 'Decisione registrata');
}

function decisionMarkup() {
  const records = [...(state.data?.decisions?.records || [])].reverse().slice(0, 12);
  if (!records.length) return '<div class="empty">Nessuna decisione umana registrata nel perimetro accessibile.</div>';
  return records.map(record => {
    const process = processForSubject(record.subject?.type);
    const code = process?.code || '—';
    const label = process?.label || 'Processo di Compliance';
    const subject = record.subject?.id ? ` · ${record.subject.id}` : '';
    const when = record.at ? new Date(record.at).toLocaleString('it-IT') : 'Data non disponibile';
    return `<article class="evidence-decision"><div class="evidence-decision-meta"><span>${esc(code)}</span><small>${esc(label)}</small></div><div><h3>${esc(humanOutcome(record.outcome || record.kind))}</h3><p>${esc(record.reason || 'Motivazione non registrata.')}</p><small>${esc(record.checkpoint || record.kind)}${esc(subject)} · ${esc(record.actor?.id || 'attore non disponibile')} · ${esc(when)}</small></div></article>`;
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
  $('#proofRuntime').textContent = `${runtime.verified || 0} di ${runtime.total || 0} con evidenza`;
  $('#proofIntegrity').textContent = integrity.ok ? `Coerente tecnicamente · r${integrity.revision || 0}` : 'Coerenza tecnica da verificare';
  $('#proofBoundary').textContent = data.claimBoundary || PRODUCT_COPY.proofBoundary;
  $('#proofReadinessLimit').textContent = posture.limitation || 'Un controllo senza evidenza resta non verificato.';
  $('#proofDeploymentGaps').innerHTML = blockerMarkup(deployment.blockers || []);
  $('#proofEvidenceKinds').innerHTML = proofMethodMarkup(data.proof?.evidenceKinds || []);
  $('#proofRule').textContent = data.proof?.rule || 'Ogni affermazione deve mostrare pratica, evidenza e limite.';
  $('#proofBenchmarkMappings').innerHTML = benchmarkMarkup(data.benchmarkFamilies || []);
  $('#translationMappings').innerHTML = translationMarkup();
  const view = $('#proofView');
  view.dataset.loadedRevision = String(cachedRevision);
  view.setAttribute('aria-busy', 'false');
  $('#proofLoading').hidden = true;
  $('#proofError').hidden = true;
  $('#proofContent').hidden = false;
  document.dispatchEvent(new CustomEvent('ictc:rendered',{detail:{surface:'proof',reason:'proof-data-rendered'}}));
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
  $('#proofError').textContent = `${initial ? 'Prove non disponibili' : 'Aggiornamento delle prove non riuscito'}: ${error.message}`;
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
