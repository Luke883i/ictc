import { $, esc, state } from './common.js';
import { installBindings } from './actions.js';
import { installAdminCenter } from './admin-center.js';
import { installEnterpriseExperience } from './enterprise-ux.js';
import { installFi01Reference } from './fi01-reference.js';
import { installProofSurface } from './proof-surface.js';
import { installSurfaceRouter } from './surface-router.js';

let installed = false;

function renderProcedureHub() {
  const host = $('#procedureHub');
  if (!host || !state.data) return;
  const procedures = Array.isArray(state.data.procedures) ? state.data.procedures : [];
  host.dataset.procedureHub = 'server-derived';
  host.innerHTML = procedures.map(item => {
    const code = item.code ? `<span class="process-code">${esc(item.code)}</span>` : '';
    const count = Number(item.attentionCount || 0);
    const attention = count > 0 ? `<span class="procedure-attention">${count} da vedere</span>` : '<span class="procedure-ready">Operativo</span>';
    const target = item.service || (item.id === 'administration' ? 'administration' : 'home');
    const safeTarget = ['home','monitoring','incidents','proof'].includes(target) ? target : 'home';
    const action = target === 'administration'
      ? '<button class="secondary" type="button" data-open-admin-center>Apri amministrazione</button>'
      : `<button class="secondary" type="button" data-service="${esc(safeTarget)}">${esc(item.actionLabel)}</button>`;
    return `<article class="procedure-card" data-procedure-id="${esc(item.id)}" data-process-code="${esc(item.code || '')}" data-read-only="${item.readOnly ? 'true' : 'false'}"><header>${code}<h3>${esc(item.label)}</h3></header><p>${esc(item.description)}</p><footer>${attention}${action}</footer></article>`;
  }).join('') || '<div class="empty">Nessun processo disponibile per il ruolo corrente.</div>';
}

function ensureProcedureHub() {
  const home = $('#homeView');
  if (!home || $('#procedureHub')) return;
  const anchor = home.querySelector('.home-overview-grid');
  const section = document.createElement('section');
  section.className = 'home-panel procedure-hub-panel';
  section.innerHTML = '<header><p class="eyebrow">Processi</p><h2>Il lavoro disponibile per il tuo ruolo</h2><p>Processi, nomi, stati e azioni derivano dalla projection server-side.</p></header><div id="procedureHub" class="procedure-hub"></div>';
  if (anchor) anchor.before(section); else home.append(section);
}

function openOnly(root, current) {
  root.querySelectorAll('[data-settings-section]').forEach(section => {
    if (section !== current) section.open = false;
  });
}

function ensureProgressiveSettings() {
  const form = $('#settingsForm');
  const body = form?.querySelector('.two-pane-form');
  if (!form || !body || body.dataset.canonicalSettings === 'true') return;
  body.dataset.canonicalSettings = 'true';
  const sections = [...body.children].filter(node => node.tagName === 'SECTION');
  const definitions = [
    ['organization', 'Contesto organizzativo', 'Nome, ambito operativo e territori.'],
    ['provider', 'Connessione AI', 'Servizio, modello autorizzato e variabile segreta.']
  ];
  sections.forEach((section, index) => {
    const [id, label, hint] = definitions[index] || [`section-${index + 1}`, `Passaggio ${index + 1}`, 'Configurazione'];
    section.querySelector('h3')?.remove();
    const details = document.createElement('details');
    details.dataset.settingsSection = id;
    details.className = 'settings-section';
    details.open = index === 0;
    details.innerHTML = `<summary><span><b>${label}</b><small>${hint}</small></span></summary>`;
    section.before(details);
    details.append(section);
    details.addEventListener('toggle', () => { if (details.open) openOnly(body, details); });
  });
  const advanced = body.querySelector(':scope > details.advanced');
  if (advanced) {
    advanced.dataset.settingsSection = 'assisted-instructions';
    advanced.classList.add('settings-section');
    const summary = advanced.querySelector(':scope > summary');
    if (summary) summary.innerHTML = '<span><b>Istruzioni assistite</b><small>Facoltative; non trasferiscono autorità all’AI.</small></span>';
    advanced.addEventListener('toggle', () => { if (advanced.open) openOnly(body, advanced); });
  }
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.textContent = 'Salva configurazione AI';
}

function bindAdminShortcut() {
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-open-admin-center]');
    if (!trigger) return;
    event.preventDefault();
    $('#openAdminCenter')?.click();
  });
}

function renderCanonicalExperience() {
  document.documentElement.dataset.ictcExperience = 'active-1';
  renderProcedureHub();
}

export function installActiveExperience() {
  if (installed) return;
  installed = true;
  ensureProcedureHub();
  ensureProgressiveSettings();
  installProofSurface();
  installSurfaceRouter();
  installBindings();
  installAdminCenter();
  installEnterpriseExperience();
  installFi01Reference();
  bindAdminShortcut();
  document.addEventListener('ictc:rendered', renderCanonicalExperience);
  renderCanonicalExperience();
}
