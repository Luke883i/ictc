import { $, esc, state } from './common.js';

let installed = false;
const SELECTED = new Set(['monitoring', 'incidents', 'objects', 'coverage', 'actions']);
const PROCESS = {
  monitoring: {
    code: 'RN-01',
    nature: 'Osservare fonti pubbliche → verificare la fonte → atomizzare → valutare impatto',
    question: 'Quale fonte o cambiamento richiede una verifica umana?',
    boundary: 'Osservare non significa applicare: fonte, vigenza, perimetro e impatto restano decisioni umane.'
  },
  incidents: {
    code: 'EC-01',
    nature: 'Preservare il fatto → chiarire → formulare → collegare → chiudere',
    question: 'Qual è la prossima informazione necessaria per rendere il caso decidibile?',
    boundary: 'La classificazione operativa non determina obblighi di notifica, responsabilità o rilevanza regolatoria.'
  },
  objects: {
    code: 'AO-01',
    nature: 'Identità → fonte autorevole → owner → criticità/dipendenze → attestazione',
    question: 'Posso dimostrare chi/che cosa è questo oggetto, chi ne risponde e su quale fonte si basa?',
    boundary: 'Il registro governa ciò che è rappresentato; non prova la completezza dell’ambiente reale o dei sistemi master esterni.'
  },
  coverage: {
    code: 'MC-01',
    nature: 'Seleziona → delimita → comprendi i concetti → mappa → decidi gap/N.A. → handoff',
    question: 'Quale concetto normativo sto valutando e quale prova organizzativa lo sostiene?',
    boundary: 'Scope, atomi e mapping descrivono il declared universe; non dimostrano applicabilità legale, equivalenza, certificazione o efficacia.'
  },
  actions: {
    code: 'AP-01',
    nature: 'Origine → adozione → esecuzione → evidenza → verifica → chiusura',
    question: 'Perché esiste questa azione, chi deve fare cosa e quale evidenza consentirà di verificarla?',
    boundary: 'Completato non significa chiuso: la chiusura richiede una verifica umana distinta con evidenza.'
  }
};

const RN_META = 'ICTC_RN01_MINING_POLICY: cerca solo informazioni pubbliche; limita il dominio a norme cogenti UE, norme cogenti italiane, provvedimenti/deliberazioni di autorità competenti e giurisprudenza/casi pubblici senza dati personali. Verifica ogni fatto proposto contro fonti linkate; preferisci fonti ufficiali per fatti normativi. Restituisci candidati, mai decisioni di applicabilità o compliance.';

const activeGrc = () => {
  let id = state.activeProcessId || '';
  try { id = id || localStorage.getItem('ictc-grc-process') || ''; } catch {}
  return id;
};

function anchor(node, process, stage, intent, authority = 'human', evidenceEffect = 'none') {
  if (!node) return;
  node.dataset.journeyProcess = process;
  node.dataset.journeyStage = stage;
  node.dataset.journeyIntent = intent;
  node.dataset.journeyAuthority = authority;
  node.dataset.journeyEvidenceEffect = evidenceEffect;
}

function ensureCompass(host, id) {
  if (!host || !PROCESS[id]) return;
  let box = host.querySelector(':scope > [data-finetune-compass]');
  if (!box) {
    box = document.createElement('section');
    box.className = 'finetune-compass';
    box.dataset.finetuneCompass = id;
    const frame = host.querySelector(':scope > .procedure-frame');
    if (frame) frame.after(box); else host.prepend(box);
  }
  const p = PROCESS[id];
  box.innerHTML = `<div><small>${esc(p.code)} · natura del processo</small><strong>${esc(p.nature)}</strong></div><div><small>Domanda che orienta il lavoro</small><span>${esc(p.question)}</span></div><p>${esc(p.boundary)}</p>`;
}

function renderHub() {
  const host = $('#procedureHub');
  if (!host) return;
  for (const card of host.querySelectorAll('[data-procedure-id]')) {
    const id = card.dataset.procedureId;
    if (!SELECTED.has(id)) continue;
    const p = PROCESS[id];
    card.classList.add('finetune-process-card');
    let nature = card.querySelector('.finetune-card-nature');
    if (!nature) {
      nature = document.createElement('p');
      nature.className = 'finetune-card-nature';
      card.querySelector('h2')?.after(nature);
    }
    nature.textContent = p.nature;
    card.querySelector('.procedure-purpose')?.classList.add('finetune-secondary-copy');
    let decision = card.querySelector('.finetune-card-decision');
    if (!decision) {
      decision = document.createElement('p');
      decision.className = 'finetune-card-decision';
      card.querySelector('footer')?.before(decision);
    }
    const operational = (state.data?.procedures || []).find(x => x.id === id);
    const attention = Number(operational?.attentionCount || 0);
    decision.innerHTML = attention
      ? `<b>${esc(attention)} da decidere</b><span>${esc(p.question)}</span>`
      : `<b>Nessuna decisione urgente</b><span>${esc(p.question)}</span>`;
    const button = card.querySelector('footer .procedure-primary');
    if (button) {
      const labels = { monitoring: 'Sorveglia fonti', incidents: 'Gestisci eventi', objects: 'Verifica inventario', coverage: 'Valuta norme e controlli', actions: 'Gestisci remediation' };
      button.textContent = labels[id];
      anchor(button, id, 'entry', 'open-process', 'navigation', 'consume');
    }
  }
}

function ensureRnScheduler() {
  const form = $('#missionForm');
  if (!form) return;
  let dialog = $('#rnSchedulerDialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'rnSchedulerDialog';
    dialog.className = 'dialog full finetune-scheduler';
    dialog.innerHTML = '<div class="dialog-shell"><header><div><p class="eyebrow">RN-01 · contributore AI schedulato</p><h2>Programma il mining informativo</h2><p>Definisci perimetro e frequenza. Il runtime produrrà solo fonti e fatti candidati da verificare.</p></div><button type="button" data-rn-close-scheduler aria-label="Chiudi">×</button></header><div class="dialog-body" data-rn-scheduler-slot></div><footer><span>Attivazione e decisioni sulle fonti restano umane.</span></footer></div>';
    document.body.append(dialog);
    dialog.querySelector('[data-rn-scheduler-slot]').append(form);
    dialog.querySelector('[data-rn-close-scheduler]').addEventListener('click', () => dialog.close());
  }
  form.hidden = false;
  form.classList.add('finetune-scheduler-form');
  if (!form.querySelector('[data-rn-source-policy]')) {
    const field = document.createElement('fieldset');
    field.dataset.rnSourcePolicy = '';
    field.innerHTML = '<legend>Fonti ammesse · tutte e sole</legend><label class="check"><input type="checkbox" data-rn-source-class value="norme-ue" checked> Norme cogenti UE</label><label class="check"><input type="checkbox" data-rn-source-class value="norme-it" checked> Norme cogenti italiane</label><label class="check"><input type="checkbox" data-rn-source-class value="autorita" checked> Provvedimenti e deliberazioni di autorità competenti</label><label class="check"><input type="checkbox" data-rn-source-class value="giurisprudenza-pubblica-no-pii" checked> Giurisprudenza e casi pubblici, senza dati personali</label><p class="microcopy">Il miner può proporre fonti e fatti. Non può verificarli né stabilirne applicabilità.</p>';
    form.querySelector('.mission-prompt')?.before(field);
  }
  const advanced = form.querySelector('.mission-prompt');
  if (advanced) {
    advanced.open = false;
    const summary = advanced.querySelector('summary');
    if (summary) summary.textContent = 'Meta-prompt e istruzioni di mining';
    const textarea = advanced.querySelector('[name="promptOverride"]');
    if (textarea && !textarea.value.trim()) textarea.placeholder = 'Aggiungi vincoli ulteriori. La policy RN-01 verrà sempre anteposta.';
  }
  const submit = form.querySelector('button[type="submit"]');
  if (submit) {
    submit.querySelector('span')?.replaceChildren(document.createTextNode('Prepara piano da verificare'));
    anchor(submit, 'monitoring', 'scope', 'define-monitor', 'human', 'produce');
  }
}

function encodeRnPolicy(form) {
  if (form?.id !== 'missionForm') return;
  const classes = [...form.querySelectorAll('[data-rn-source-class]:checked')].map(x => x.value);
  if (!classes.length) {
    form.querySelector('[data-rn-source-class]')?.focus();
    throw new Error('Seleziona almeno una classe di fonte RN-01');
  }
  const area = form.elements.promptOverride;
  if (!area) return;
  const custom = String(area.value || '').replace(/^ICTC_RN01_MINING_POLICY:[\s\S]*?\n\nCUSTOM:\n/, '').trim();
  area.value = `${RN_META}\nClassi selezionate: ${classes.join(', ')}.\n\nCUSTOM:\n${custom}`;
}

function renderMonitoring() {
  const host = $('#monitoringView');
  if (!host) return;
  ensureCompass(host, 'monitoring');
  ensureRnScheduler();
  const secondary = host.querySelector('[data-procedure-secondary="monitoring-plan"]');
  if (secondary) {
    secondary.removeAttribute('data-procedure-secondary');
    secondary.dataset.rnOpenScheduler = '';
    secondary.textContent = 'Programma mining AI';
    anchor(secondary, 'monitoring', 'scope', 'open-scheduler', 'navigation', 'none');
  }
  anchor(host.querySelector('#openContribution') || host.querySelector('[data-open-contribution]'), 'monitoring', 'ingest', 'add-material', 'human', 'produce');
  for (const button of host.querySelectorAll('[data-open-plan]')) anchor(button, 'monitoring', 'scope', 'review-monitor-plan', 'human', 'consume');
  for (const button of host.querySelectorAll('[data-activate-mission]')) anchor(button, 'monitoring', 'scope', 'approve-monitor-plan', 'human', 'produce');
  for (const button of host.querySelectorAll('[data-run-mission]')) anchor(button, 'monitoring', 'enrich', 'run-scheduled-miner', 'human', 'produce');
  for (const button of host.querySelectorAll('[data-open-source]')) anchor(button, 'monitoring', 'verify-source', 'inspect-source', 'human', 'consume');
}

function renderIncidents() {
  const host = $('#incidentsView');
  if (!host) return;
  ensureCompass(host, 'incidents');
  anchor($('#openIncident'), 'incidents', 'capture', 'record-original', 'human', 'produce');
  const workspace = $('#incidentWorkspace');
  if (!workspace) return;
  const body = workspace.querySelector('.dialog-body');
  if (body && !body.querySelector(':scope > .finetune-work-question')) {
    const q = document.createElement('aside');
    q.className = 'finetune-work-question';
    q.innerHTML = '<small>EC-01 · una domanda alla volta</small><strong>Ricostruisci prima i fatti; classificazione e conseguenze vengono dopo.</strong>';
    body.prepend(q);
  }
  for (const b of workspace.querySelectorAll('[data-answer-question],[data-answer-unknown]')) anchor(b, 'incidents', 'clarify', 'answer-next-question', 'human', 'produce');
  for (const b of workspace.querySelectorAll('[data-generate-draft]')) anchor(b, 'incidents', 'formulate', 'request-ai-draft', 'ai-proposal', 'produce');
  for (const b of workspace.querySelectorAll('[data-save-formulation],[data-save-manual]')) anchor(b, 'incidents', 'formulate', 'confirm-formulation', 'human', 'produce');
  for (const b of workspace.querySelectorAll('[data-submit-incident]')) anchor(b, 'incidents', 'formulate', 'submit-confirmed-case', 'human', 'produce');
  for (const b of workspace.querySelectorAll('[data-close-incident]')) anchor(b, 'incidents', 'close', 'close-case', 'human', 'consume-and-produce');
  for (const panel of workspace.querySelectorAll('.lens-panel')) {
    const label = panel.querySelector('.eyebrow')?.textContent || '';
    if (/Traccia AI|Versioni|Conferme umane/i.test(label)) panel.classList.add('finetune-drilldown-detail');
  }
}

function decorateObjectCards() {
  const host = $('#grcWorkspace');
  const p = state.data?.grc?.objects;
  if (!host || !p) return;
  ensureCompass(host, 'objects');
  const cards = [...host.querySelectorAll('.grc-list > article')];
  cards.forEach((card, index) => {
    const o = p.objects?.[index];
    if (!o) return;
    card.classList.add('finetune-registry-card');
    let facts = card.querySelector('.finetune-object-facts');
    if (!facts) {
      facts = document.createElement('dl');
      facts.className = 'finetune-object-facts';
      card.querySelector('footer')?.before(facts);
    }
    const due = o.attestationDueAt ? new Date(o.attestationDueAt).toLocaleDateString('it-IT') : 'Non definito';
    facts.innerHTML = `<div><dt>Identità</dt><dd>${esc(o.externalReference || o.id)}</dd></div><div><dt>Fonte autorevole</dt><dd>${esc(o.sourceAuthority || 'Da dichiarare')}</dd></div><div><dt>Responsabile</dt><dd>${esc(o.owner || o.ownerRef?.displayName || 'Da assegnare')}</dd></div><div><dt>Riesame</dt><dd>${esc(due)}</dd></div>`;
    for (const b of card.querySelectorAll('[data-object-review="active"]')) anchor(b, 'objects', 'validate', 'activate-object', 'human', 'produce');
    for (const b of card.querySelectorAll('[data-object-review="rejected"]')) anchor(b, 'objects', 'validate', 'reject-object', 'human', 'produce');
    for (const b of card.querySelectorAll('[data-object-attest]')) anchor(b, 'objects', 'reattest', 'reattest-object', 'human', 'consume-and-produce');
    for (const b of card.querySelectorAll('[data-grc-evidence]')) anchor(b, 'objects', 'reattest', 'inspect-evidence', 'navigation', 'consume');
  });
  const create = host.querySelector('[data-grc-form="object"]');
  if (create) {
    anchor(create.querySelector('button[type="submit"]'), 'objects', 'identify', 'create-candidate', 'human', 'produce');
    const source = create.querySelector('[name="sourceAuthority"]');
    if (source) source.required = true;
    const owner = create.querySelector('[name="owner"]');
    if (owner) owner.required = true;
  }
}

function actionNext(stateValue) {
  return ({
    proposed: 'Decidi se adottare l’impegno',
    open: 'Avvia il lavoro assegnato',
    'in-progress': 'Aggiorna o presenta evidenza di completamento',
    blocked: 'Rendi esplicito il blocco e chi deve risolverlo',
    done: 'Il lavoro è completato: serve verifica distinta',
    'ready-for-review': 'Verifica evidenza e risultato atteso',
    closed: 'Chiusura verificata',
    cancelled: 'Decisione terminale: nessuna remediation automatica'
  }[stateValue] || 'Comprendi origine, owner e prossimo passo');
}

function decorateActionCards() {
  const host = $('#grcWorkspace');
  const p = state.data?.grc?.actions;
  if (!host || !p) return;
  ensureCompass(host, 'actions');
  const cards = [...host.querySelectorAll('.grc-list > article')];
  cards.forEach((card, index) => {
    const a = p.actions?.[index];
    if (!a) return;
    card.classList.add('finetune-action-card');
    let next = card.querySelector('.finetune-action-next');
    if (!next) {
      next = document.createElement('div');
      next.className = 'finetune-action-next';
      card.querySelector('footer')?.before(next);
    }
    const origin = a.origin?.label || a.origin?.type || a.sourceType || a.sourceRef || 'Origine non esplicitata';
    next.innerHTML = `<span><small>Perché esiste</small><b>${esc(origin)}</b></span><span><small>Prossima decisione</small><b>${esc(actionNext(a.state))}</b></span>`;
    for (const b of card.querySelectorAll('[data-action-ai]')) anchor(b, 'actions', 'adopt', 'request-ai-priority', 'ai-proposal', 'produce');
    for (const b of card.querySelectorAll('[data-action-adopt]')) anchor(b, 'actions', 'adopt', 'adopt-action', 'human', 'produce');
    for (const b of card.querySelectorAll('[data-action-progress][data-state="in-progress"]')) anchor(b, 'actions', 'execute', 'start-action', 'human', 'produce');
    for (const b of card.querySelectorAll('[data-action-progress][data-state="done"]')) anchor(b, 'actions', 'complete', 'submit-completion', 'human', 'produce');
    for (const b of card.querySelectorAll('[data-grc-evidence]')) anchor(b, 'actions', 'verify', 'inspect-evidence', 'navigation', 'consume');
  });
  const create = host.querySelector('[data-grc-form="action"]');
  if (create) anchor(create.querySelector('button[type="submit"]'), 'actions', 'understand-origin', 'create-action', 'human', 'produce');
}

function conceptAtomMarkup(atom) {
  return `<article class="finetune-concept-atom"><header><span>${esc(atom.id || atom.conceptId || 'Concetto')}</span><b>${esc(atom.concept || atom.label || 'Concetto dichiarato')}</b></header><p>${esc(atom.intent || 'Comprendere il concetto nel perimetro dichiarato.')}</p><dl><div><dt>Esito atteso</dt><dd>${esc(atom.expectedOutcome || 'Decisione di perimetro o mapping esplicita')}</dd></div><div><dt>Domanda di evidenza</dt><dd>${esc(atom.evidenceQuestion || 'Quale evidenza organizzativa sostiene questo concetto?')}</dd></div></dl></article>`;
}

function decorateCoverage() {
  const host = $('#grcWorkspace');
  if (!host) return;
  ensureCompass(host, 'coverage');
  const frameworks = state.data?.standards?.frameworks || [];
  for (const card of host.querySelectorAll('[data-framework-card]')) {
    const id = card.dataset.frameworkCard;
    const f = frameworks.find(x => x.id === id);
    if (!f) continue;
    card.classList.add('finetune-framework-card');
    let details = card.querySelector('.finetune-concept-drilldown');
    if (!details) {
      details = document.createElement('details');
      details.className = 'finetune-concept-drilldown';
      card.querySelector('footer')?.before(details);
    }
    const atoms = (f.conceptAtoms || []).slice(0, 8);
    details.innerHTML = `<summary>Comprendi i concetti · ${esc(f.conceptAtoms?.length || 0)}</summary><div class="finetune-concept-grid">${atoms.length ? atoms.map(conceptAtomMarkup).join('') : '<p>Gli atomi concettuali saranno disponibili con il profilo strutturale del framework.</p>'}</div><p class="microcopy">Astrazioni neutrali ICTC: non sostituiscono il testo normativo o licenziato.</p>`;
    anchor(card.querySelector('[data-standard-scope]'), 'coverage', 'scope', 'declare-framework-use', 'human', 'produce');
  }
  for (const b of host.querySelectorAll('[data-mapping-decision]')) anchor(b, 'coverage', 'map', `mapping-${b.dataset.mappingDecision}`, 'human', 'consume-and-produce');
  const form = host.querySelector('[data-grc-form="mapping"]');
  if (form) anchor(form.querySelector('button[type="submit"]'), 'coverage', 'map', 'propose-mapping', 'human', 'produce');
}

function renderGrc() {
  const id = activeGrc();
  if (id === 'objects') decorateObjectCards();
  else if (id === 'coverage') decorateCoverage();
  else if (id === 'actions') decorateActionCards();
}

function compressScopeCard() {
  for (const heading of document.querySelectorAll('h2,h3')) {
    if (heading.textContent.trim() !== 'Scopo ICTC') continue;
    const card = heading.closest('section,article,div');
    if (card) {
      card.classList.add('finetune-scope-card');
      card.dataset.journeyIntent = 'understand-product-boundary';
    }
  }
}

function render() {
  if (!state.data) return;
  renderHub();
  renderMonitoring();
  renderIncidents();
  renderGrc();
  compressScopeCard();
}

export function installProcedureFinetuning() {
  if (installed) return;
  installed = true;
  document.addEventListener('submit', event => {
    if (event.target?.id !== 'missionForm') return;
    try { encodeRnPolicy(event.target); }
    catch (error) {
      event.preventDefault();
      event.stopImmediatePropagation();
      alert(error.message);
    }
  }, true);
  document.addEventListener('click', event => {
    const open = event.target.closest?.('[data-rn-open-scheduler]');
    if (open) {
      event.preventDefault();
      event.stopImmediatePropagation();
      ensureRnScheduler();
      $('#rnSchedulerDialog')?.showModal();
      $('#missionForm textarea[name="objective"]')?.focus();
      return;
    }
    if (event.target.closest?.('[data-rn-close-scheduler]')) $('#rnSchedulerDialog')?.close();
  }, true);
  document.addEventListener('ictc:rendered', () => queueMicrotask(render));
  document.addEventListener('ictc:surface-changed', () => queueMicrotask(render));
  render();
}
