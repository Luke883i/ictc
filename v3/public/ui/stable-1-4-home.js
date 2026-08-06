import { $, esc, state } from './common.js';
import { installReborn3Experience } from './reborn-3-home.js';

const conciseRoleSummaries = {
  admin: 'Imposti il sistema e approvi le decisioni che cambiano stato. ICTC prepara proposte e registra ogni passaggio.',
  user: 'Raccogli fatti e materiali. Puoi inviare ciò che sai senza dover classificare o concludere.',
  auditor: 'Leggi in sola lettura chi ha fatto cosa, quando, con quale effetto e quali limiti.'
};

function normalizeShell() {
  const brand = document.querySelector('.brand small');
  if (brand) brand.textContent = 'Decisioni, fonti ed eventi';
  const roleLabel = document.querySelector('.role-control span');
  if (roleLabel) roleLabel.textContent = 'Ruolo attivo';
  const navLabels = { home: 'Home', monitoring: 'Monitoraggio', incidents: 'Eventi' };
  for (const [service, label] of Object.entries(navLabels)) {
    const button = document.querySelector(`[data-service="${service}"]`);
    if (button && button.dataset.stableLabel !== 'true') {
      button.textContent = label;
      button.dataset.stableLabel = 'true';
    }
  }
  const contributionHeading = document.querySelector('.contribute-card h2');
  if (contributionHeading) contributionHeading.textContent = 'Aggiungi materiale';
  const incidentsHeading = document.querySelector('#incidentsView .section-head h2');
  if (incidentsHeading) incidentsHeading.textContent = 'Fascicoli evento';
  document.title = 'ICTC 1.4 · Decisioni, fonti ed eventi';
}

function ensureAuthorityStructure() {
  const root = $('#homeView');
  const trust = root?.querySelector('.trust-brief');
  if (!root || !trust) return null;
  root.dataset.stable14 = 'true';
  let authority = $('#homeAuthority');
  if (!authority) {
    trust.insertAdjacentHTML('afterend', `
      <details id="homeAuthority" class="authority-brief">
        <summary><span>Accesso e responsabilità</span><b id="homeAuthorityMode"></b></summary>
        <div class="authority-grid">
          <section><h3>Identità attiva</h3><p id="homeAuthorityIdentity"></p></section>
          <section><h3>Puoi</h3><ul id="homeAuthorityCan"></ul></section>
          <section><h3>Non puoi</h3><ul id="homeAuthorityCannot"></ul></section>
          <section><h3>Effetti</h3><ul id="homeAuthorityEffects"></ul></section>
          <section><h3>Tracce disponibili</h3><ul id="homeAuthorityEvidence"></ul></section>
        </div>
      </details>`);
    authority = $('#homeAuthority');
  }
  const action = root.querySelector('.reborn-action');
  if (action && !$('#homeOrientation')) {
    action.insertAdjacentHTML('beforeend', '<p id="homeOrientation" class="home-orientation">Una priorità, un effetto, una prova. Apri i dettagli solo quando servono.</p>');
  }
  const primary = $('#homePrimaryAction');
  if (primary) primary.setAttribute('aria-describedby', 'homeReason homeOutcome');
  return authority;
}

function fallbackProfile(actor) {
  const readOnly = actor.role === 'auditor';
  return {
    actorId: actor.id,
    label: actor.role,
    identityMode: actor.identityMode || 'local',
    mode: readOnly ? 'read-only' : 'unknown',
    modeLabel: readOnly ? 'Sola lettura' : 'Accesso limitato dal server',
    can: ['Usare soltanto le capacità restituite dal server.'],
    cannot: ['Eseguire azioni non autorizzate dal profilo attivo.'],
    effects: [readOnly ? 'La consultazione non modifica lo stato.' : 'Gli effetti dipendono dalla capacità autorizzata.'],
    evidence: ['Identità, capacità ed eventi registrati.']
  };
}

function renderList(selector, values) {
  const node = $(selector);
  if (!node) return;
  node.innerHTML = (values || []).map(value => `<li>${esc(value)}</li>`).join('');
}

function renderStable14() {
  if (!state.data?.actor) return;
  normalizeShell();
  const authority = ensureAuthorityStructure();
  if (!authority) return;
  const actor = state.data.actor;
  const profile = state.data.accessProfile || fallbackProfile(actor);
  const roleChanged = authority.dataset.role && authority.dataset.role !== actor.role;
  authority.dataset.role = actor.role;
  if (actor.role === 'auditor') authority.open = true;
  else if (roleChanged) authority.open = false;
  $('#homeRole').textContent = profile.label || actor.role;
  $('#homeSummary').textContent = conciseRoleSummaries[actor.role] || '';
  $('#homeAuthorityMode').textContent = profile.modeLabel || profile.mode;
  $('#homeAuthorityMode').dataset.mode = profile.mode || 'unknown';
  $('#homeAuthorityIdentity').textContent = `${profile.actorId || actor.id} · ${profile.label || actor.role} · autorità emessa dal server`;
  renderList('#homeAuthorityCan', profile.can);
  renderList('#homeAuthorityCannot', profile.cannot);
  renderList('#homeAuthorityEffects', profile.effects);
  renderList('#homeAuthorityEvidence', profile.evidence);
  const journeyTitle = $('#journeyTitle');
  if (journeyTitle) journeyTitle.textContent = 'Il tuo percorso in quattro passaggi';
  const statusTitle = $('#homeStatusTitle');
  if (statusTitle) statusTitle.textContent = 'Stato del lavoro';
}

export function installStable14Experience() {
  installReborn3Experience();
  document.addEventListener('ictc:rendered', renderStable14);
  if (state.data?.actor) renderStable14();
}
