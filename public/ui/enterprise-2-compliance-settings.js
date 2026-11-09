import { $ } from './common.js';
import { FIELD_COPY, normalizeField } from './enterprise-2-compliance-fields.js';

const SETTINGS_META = Object.freeze({
  organization: Object.freeze({ index: 1, title: 'Contesto organizzativo', description: 'Ambito, organizzazione e territori interessati.', required: ['organizationName', 'organizationScope'] }),
  provider: Object.freeze({ index: 2, title: 'Connessione AI', description: 'Servizio, modello autorizzato e segreto applicativo.', required: ['endpoint', 'model'] }),
  policy: Object.freeze({ index: 3, title: 'Istruzioni assistite', description: 'Indicazioni facoltative condivise dai processi.', required: [] })
});

function sectionComplete(form, id) {
  const meta = SETTINGS_META[id];
  if (!meta || !meta.required.length) return null;
  return meta.required.every(name => String(form.elements.namedItem(name)?.value || '').trim());
}

function updateSettingsOverview(form) {
  const overview = form.querySelector('[data-configuration-overview]');
  if (!overview) return;
  for (const [id, meta] of Object.entries(SETTINGS_META)) {
    const button = overview.querySelector(`[data-configuration-target="${id}"]`);
    const details = form.querySelector(`[data-settings-section="${id}"]`);
    if (!button || !details) continue;
    const complete = sectionComplete(form, id);
    button.dataset.complete = complete === null ? 'optional' : String(complete);
    button.setAttribute('aria-current', details.open ? 'step' : 'false');
    button.querySelector('small').textContent = complete === null ? 'Facoltative' : complete ? 'Completo' : 'Da completare';
    button.title = meta.description;
  }
  const done = ['organization', 'provider'].filter(id => sectionComplete(form, id)).length;
  overview.querySelector('[data-configuration-progress]').textContent = `${done}/2 sezioni essenziali complete`;
}

function openSettingsSection(form, id, { focus = true } = {}) {
  for (const details of form.querySelectorAll('.settings-section-18[data-settings-section]')) {
    details.open = details.dataset.settingsSection === id;
  }
  updateSettingsOverview(form);
  if (focus) form.querySelector(`[data-settings-section="${id}"] > summary`)?.focus();
}

function createSettingsOverview(form, sections) {
  const overview = document.createElement('nav');
  overview.className = 'configuration-overview';
  overview.dataset.configurationOverview = 'true';
  overview.setAttribute('aria-label', 'Passaggi della configurazione AI');
  overview.innerHTML = '<div class="configuration-overview-head"><div><p class="eyebrow">Configurazione guidata</p><b>Completa prima gli elementi essenziali</b></div><span data-configuration-progress></span></div><ol></ol>';
  const list = overview.querySelector('ol');
  for (const details of sections) {
    const id = details.dataset.settingsSection;
    const meta = SETTINGS_META[id];
    if (!meta) continue;
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.configurationTarget = id;
    button.innerHTML = `<span>${meta.index}</span><b></b><small></small>`;
    button.querySelector('b').textContent = meta.title;
    button.addEventListener('click', () => openSettingsSection(form, id));
    item.append(button);
    list.append(item);
  }
  return overview;
}

export function normalizeSettingsDialog() {
  const form = $('#settingsForm');
  const body = form?.querySelector('.settings-18');
  if (!form || !body) return;
  for (const name of Object.keys(FIELD_COPY)) normalizeField(form, name);
  const sections = [...body.querySelectorAll(':scope > .settings-section-18[data-settings-section]')].filter(section => SETTINGS_META[section.dataset.settingsSection]);
  if (!sections.length) return;

  if (!form.querySelector('[data-configuration-overview]')) body.prepend(createSettingsOverview(form, sections));
  for (const details of sections) {
    const id = details.dataset.settingsSection;
    const meta = SETTINGS_META[id];
    const summary = details.querySelector(':scope > summary');
    summary?.setAttribute('tabindex', '0');
    const title = summary?.querySelector('b');
    const description = summary?.querySelector('small');
    if (title) title.textContent = `${meta.index}. ${meta.title}`;
    if (description) description.textContent = meta.description;
    details.dataset.configurationStep = String(meta.index);
    if (details.dataset.complianceFlowBound === 'true') continue;
    details.dataset.complianceFlowBound = 'true';
    details.addEventListener('toggle', () => {
      if (details.open) for (const sibling of sections) if (sibling !== details) sibling.open = false;
      updateSettingsOverview(form);
    });
    if (meta.index < 3) {
      const next = sections.find(candidate => Number(candidate.dataset.configurationStep) === meta.index + 1);
      const bodyNode = details.querySelector('.settings-section-body');
      if (bodyNode && next) {
        const action = document.createElement('button');
        action.type = 'button';
        action.className = 'configuration-next';
        action.textContent = `Continua: ${SETTINGS_META[next.dataset.settingsSection].title}`;
        action.addEventListener('click', () => openSettingsSection(form, next.dataset.settingsSection));
        bodyNode.append(action);
      }
    }
  }

  if (form.dataset.complianceFlowInitialized !== 'true') {
    form.dataset.complianceFlowInitialized = 'true';
    const initial = !sectionComplete(form, 'organization') ? 'organization' : !sectionComplete(form, 'provider') ? 'provider' : 'organization';
    openSettingsSection(form, initial, { focus: false });
    form.addEventListener('input', () => updateSettingsOverview(form));
  }

  const title = $('#settingsTitle');
  if (title) title.textContent = 'Configura il servizio AI';
  const lead = $('#settingsDialog header p:not(.eyebrow)');
  if (lead) lead.textContent = 'Definisci contesto, connessione e istruzioni. Salva dopo la verifica finale.';
  const boundary = form.querySelector('.settings-job-boundary');
  if (boundary) boundary.textContent = 'Le singole ricerche si configurano in Monitoraggio normativo.';
  const save = form.querySelector('footer button[type="submit"]');
  if (save) save.textContent = 'Salva configurazione AI';
  updateSettingsOverview(form);
  form.dataset.configurationPattern = 'essential-first';
}
