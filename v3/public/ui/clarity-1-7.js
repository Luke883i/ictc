import { $, $$, esc, state } from './common.js';

const contextCopy = {
  monitoring: {
    title: 'Come funziona il monitoraggio',
    lead: 'ICTC separa obiettivo, proposta AI, decisione umana e prova.',
    rows: [
      ['Serve', 'Un obiettivo comprensibile, una frequenza e le eventuali fonti già note.'],
      ['AI', 'Propone un piano e possibili fonti; non decide applicabilità o stato verificato.'],
      ['Tu', 'Rivedi, attivi, sospendi e motivi ogni decisione che cambia stato.'],
      ['Resta', 'Obiettivo, versioni, esecuzioni, osservazioni, decisioni e receipt.']
    ]
  },
  events: {
    title: 'Come viene trattato un evento',
    lead: 'Il racconto originale viene preservato prima di analisi, chiarimenti e formulazioni.',
    rows: [
      ['Serve', 'Il racconto disponibile, il momento di conoscenza e gli elementi già raccolti.'],
      ['AI', 'Estrae fatti e propone domande o bozze; non determina obblighi.'],
      ['Tu', 'Completi, correggi e confermi prima di inviare o chiudere.'],
      ['Resta', 'Originale, allegati, analisi, risposte, versioni, decisioni e receipt.']
    ]
  }
};

function ensureContextDialog() {
  if ($('#clarityContextDialog')) return;
  document.body.insertAdjacentHTML('beforeend', `<dialog id="clarityContextDialog" class="clarity-context-dialog" aria-labelledby="clarityContextTitle"><div class="clarity-context-shell"><header><div><p class="eyebrow">Contesto</p><h2 id="clarityContextTitle"></h2><p id="clarityContextLead"></p></div><button type="button" data-clarity-close aria-label="Chiudi">×</button></header><div id="clarityContextBody" class="clarity-context-body"></div></div></dialog>`);
  $('[data-clarity-close]')?.addEventListener('click', () => $('#clarityContextDialog')?.close());
}

function openContext(title, lead, body) {
  $('#clarityContextTitle').textContent = title;
  $('#clarityContextLead').textContent = lead;
  $('#clarityContextBody').innerHTML = body;
  $('#clarityContextDialog').showModal();
}

function text(selector) {
  return $(selector)?.textContent?.trim() || '—';
}

function homeContextMarkup() {
  const journey = $$('#homeJourney .journey-step').map(item => `<li>${esc(item.textContent.trim())}</li>`).join('');
  const metrics = $$('#homeMetrics .home-metric').map(item => `<li>${esc(item.textContent.trim())}</li>`).join('');
  const authority = $('#homeAuthority');
  const authorityMarkup = authority ? `<section><h3>Accesso e responsabilità</h3><p>${esc(authority.textContent.trim())}</p></section>` : '';
  return `<div class="clarity-context-grid"><section><h3>Perché spetta a te</h3><p>${esc(text('#homeWhyMe'))}</p></section><section><h3>Come procedere</h3><p>${esc(text('#homeHow'))}</p></section><section><h3>Metodo del ruolo</h3><ol>${journey}</ol></section><section><h3>Stato del lavoro</h3><ul>${metrics}</ul></section>${authorityMarkup}</div>`;
}

function renderHomeSignals() {
  const root = $('#homeSignalBar');
  if (!root) return;
  const metrics = $$('#homeMetrics .home-metric').slice(0, 3).map(item => {
    const value = item.querySelector('b')?.textContent || '—';
    const label = item.querySelector('span')?.textContent || '';
    return `<span><b>${esc(value)}</b><small>${esc(label)}</small></span>`;
  });
  root.innerHTML = metrics.join('');
}

function compressHome() {
  const action = $('.reborn-action');
  const brief = $('.reborn-brief');
  if (!action || !brief) return;
  if (!$('#homeContextAction')) {
    $('#homePrimaryAction')?.insertAdjacentHTML('afterend', '<button id="homeContextAction" class="secondary clarity-context-action" type="button">Capire il percorso</button><div id="homeSignalBar" class="home-signal-bar" aria-label="Stato sintetico"></div>');
    $('#homeContextAction')?.addEventListener('click', () => openContext('Il tuo contesto', 'Responsabilità, metodo e stato restano disponibili senza competere con la decisione primaria.', homeContextMarkup()));
  }
  for (const selector of ['#homeWhyMe', '#homeHow']) {
    const row = $(selector)?.closest('div');
    if (row) { row.classList.add('clarity-visually-deferred'); row.setAttribute('aria-hidden', 'true'); row.dataset.claritySecondary = 'true'; }
  }
  const method = $('.reborn-method');
  const status = $('.home-status-strip');
  if (method) { method.hidden = true; method.setAttribute('aria-hidden', 'true'); }
  if (status) { status.hidden = true; status.setAttribute('aria-hidden', 'true'); }
  renderHomeSignals();
}

function contextRowsMarkup(config) {
  return `<div class="clarity-context-grid">${config.rows.map(([label, value]) => `<section><h3>${esc(label)}</h3><p>${esc(value)}</p></section>`).join('')}</div>`;
}

function compressMonitoring() {
  const hero = $('#monitoringView .hero');
  if (!hero) return;
  hero.classList.add('clarity-core-hero');
  const copy = $('#monitoringView .hero-copy');
  if (copy && !$('#monitoringContextAction')) {
    copy.insertAdjacentHTML('beforeend', '<button id="monitoringContextAction" class="secondary clarity-context-action" type="button">Come funziona</button>');
    $('#monitoringContextAction').addEventListener('click', () => {
      const config = contextCopy.monitoring;
      openContext(config.title, config.lead, contextRowsMarkup(config));
    });
  }
}

function compressEvents() {
  const hero = $('#incidentsView .hero');
  if (!hero) return;
  hero.classList.add('clarity-core-hero');
  $('.ai-lens-demo')?.setAttribute('hidden', '');
  const guide = $('#eventsGuide');
  if (guide) guide.hidden = true;
  const copy = $('#incidentsView .hero-copy');
  if (copy && !$('#eventsContextAction')) {
    copy.insertAdjacentHTML('beforeend', '<button id="eventsContextAction" class="secondary clarity-context-action" type="button">Come viene trattato</button>');
    $('#eventsContextAction').addEventListener('click', () => {
      const config = contextCopy.events;
      openContext(config.title, config.lead, contextRowsMarkup(config));
    });
  }
}

function compressAdmin() {
  const grid = $('#adminCenter .admin-grid');
  if (!grid || grid.dataset.clarity17 === 'true') return;
  grid.dataset.clarity17 = 'true';
  const descriptions = {
    'Stato dei controlli': 'Verifiche e blocker correnti',
    'Azioni richieste': 'Elementi che richiedono intervento',
    'Utilizzo AI': 'Consumo, budget e scopi',
    'Governance AI': 'Ambiente, budget e modelli consentiti',
    'Utenti e ruoli': 'Directory e ciclo di vita degli accessi'
  };
  for (const panel of [...grid.children]) {
    if (!panel.classList.contains('admin-panel') || panel.classList.contains('admin-proof-panel')) continue;
    const titleNode = panel.querySelector(':scope > h3');
    if (!titleNode) continue;
    const title = titleNode.textContent.trim();
    const details = document.createElement('details');
    details.className = 'admin-disclosure';
    details.dataset.adminSection = title.toLowerCase().replace(/\s+/g, '-');
    if (title === 'Stato dei controlli') details.open = true;
    const summary = document.createElement('summary');
    summary.innerHTML = `<span><b>${esc(title)}</b><small>${esc(descriptions[title] || 'Dettaglio amministrativo')}</small></span><em>Apri</em>`;
    const body = document.createElement('div');
    body.className = 'admin-disclosure-body';
    for (const child of [...panel.children]) if (child !== titleNode) body.append(child);
    titleNode.remove();
    details.append(summary, body);
    panel.append(details);
  }
}

function normalizeCanonicalCopy() {
  const brand = document.querySelector('.brand small');
  if (brand) brand.textContent = 'Decisioni, prove e limiti';
  const roleLabel = document.querySelector('.role-control span');
  if (roleLabel) roleLabel.textContent = 'Ruolo attivo';
  const contributionHeading = document.querySelector('.contribute-card h2');
  if (contributionHeading) contributionHeading.textContent = 'Aggiungi materiale';
  const incidentsHeading = document.querySelector('#incidentsView .section-head h2');
  if (incidentsHeading) incidentsHeading.textContent = 'Fascicoli evento';
  document.title = 'ICTC 1.7 · Enterprise clarity';
}

function applyClarity() {
  if (!state.data?.actor) return;
  normalizeCanonicalCopy();
  compressHome();
  compressMonitoring();
  compressEvents();
  compressAdmin();
}

export function installEnterpriseClarity17() {
  ensureContextDialog();
  document.addEventListener('ictc:rendered', applyClarity);
  if (state.data?.actor) applyClarity();
}
