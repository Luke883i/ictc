import { $, $$ } from './common.js';
import { bindSingleOpen, FIELD_COPY, JOB_FIELD_COPY, normalizeField } from './enterprise-2-compliance-fields.js';

function jobControlNode(form, name) {
  if (name === 'changeTypes') return form.querySelector('fieldset.change-types, fieldset:has([name="changeTypes"])');
  return form.elements.namedItem(name)?.closest?.('label') || null;
}

function disclosureGroup(className, attribute, title, description, id, open = false) {
  const details = document.createElement('details');
  details.className = className;
  details.dataset[attribute] = id;
  details.open = open;
  details.innerHTML = '<summary><span><b></b><small></small></span></summary><div></div>';
  details.querySelector('b').textContent = title;
  details.querySelector('small').textContent = description;
  return details;
}

function jobGroup(title, description, id, open = false) {
  const details = disclosureGroup('job-config-group', 'jobConfigGroup', title, description, id, open);
  details.lastElementChild.className = 'job-config-group-body';
  return details;
}

function moveJobControls(form, names, body) {
  for (const name of names) {
    const node = jobControlNode(form, name);
    if (node) body.append(node);
  }
}

function createJobOverview(form, groups) {
  const nav = document.createElement('nav');
  nav.className = 'job-configuration-overview';
  nav.setAttribute('aria-label', 'Passaggi della ricerca normativa');
  const list = document.createElement('ol');
  [['scope', 'Obiettivo e ambito'], ['criteria', 'Criteri di ricerca'], ['schedule', 'Frequenza e istruzioni']].forEach(([id, label], index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.jobConfigurationTarget = id;
    button.innerHTML = `<span>${index + 1}</span><b></b>`;
    button.querySelector('b').textContent = label;
    button.addEventListener('click', () => {
      for (const group of groups) group.open = group.dataset.jobConfigGroup === id;
      nav.querySelectorAll('button').forEach(peer => peer.setAttribute('aria-current', peer === button ? 'step' : 'false'));
      form.querySelector(`[data-job-config-group="${id}"] > summary`)?.focus();
    });
    item.append(button);
    list.append(item);
  });
  nav.append(list);
  list.querySelector('button')?.setAttribute('aria-current', 'step');
  return nav;
}

export function normalizeJobDialog() {
  const dialog = $('#jobDialog');
  const form = $('#missionForm');
  if (!dialog || !form) return;
  for (const name of Object.keys(JOB_FIELD_COPY)) normalizeField(form, name);
  normalizeField(form, 'jurisdictions');
  const modeLabels = { novelty: 'Novità dal riferimento', coverage: 'Copertura dell’ambito', watchlist: 'Elenco di autorità e fonti' };
  for (const option of form.elements.namedItem('miningMode')?.options || []) if (modeLabels[option.value]) option.textContent = modeLabels[option.value];
  const baselineLabels = { 'last-run': 'Ultima esecuzione', activation: 'Attivazione della ricerca', 'fixed-date': 'Data specifica' };
  for (const option of form.elements.namedItem('noveltyBaseline')?.options || []) if (baselineLabels[option.value]) option.textContent = baselineLabels[option.value];
  const legend = form.querySelector('fieldset.change-types legend, fieldset:has([name="changeTypes"]) legend');
  if (legend) legend.textContent = 'Cambiamenti da cercare';
  const title = $('#jobDialogTitle');
  if (title && /job|configura una ricerca/i.test(title.textContent)) title.textContent = 'Configura una ricerca normativa';
  const lead = dialog.querySelector('.dialog-head p:not(.eyebrow)');
  if (lead) lead.textContent = 'Definisci obiettivo, ambito e criteri. Il piano proposto richiede approvazione umana.';

  if (form.dataset.jobConfigurationPattern !== 'essential-first') {
    const scope = jobGroup('Obiettivo e ambito', 'Nome, risultato atteso, metodo e territori.', 'scope', true);
    const criteria = jobGroup('Criteri di ricerca', 'Riferimento, autorità, cambiamenti e limite dei risultati.', 'criteria');
    const schedule = jobGroup('Frequenza e istruzioni', 'Periodicità, fonti note e indicazioni facoltative.', 'schedule');
    moveJobControls(form, ['jobName', 'objective', 'miningMode', 'jurisdictions'], scope.querySelector('.job-config-group-body'));
    moveJobControls(form, ['noveltyBaseline', 'baselineAt', 'authorities', 'changeTypes', 'resultLimit'], criteria.querySelector('.job-config-group-body'));
    moveJobControls(form, ['cadence', 'sourceHints', 'promptOverride'], schedule.querySelector('.job-config-group-body'));
    for (const wrapper of form.querySelectorAll('.job-profile-fields,.compact-fields,.mission-prompt')) {
      if (!wrapper.querySelector('input,select,textarea,fieldset,label')) wrapper.remove();
    }
    const submit = form.querySelector('button[type="submit"]');
    const note = document.createElement('p');
    note.className = 'job-plan-boundary';
    note.textContent = 'ICTC propone query e criteri. Una persona verifica il piano prima dell’attivazione.';
    form.prepend(createJobOverview(form, [scope, criteria, schedule]), scope, criteria, schedule);
    if (submit) submit.before(note);
    form.dataset.jobConfigurationPattern = 'essential-first';
  }
  bindSingleOpen(form, ':scope > .job-config-group');
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.textContent = /aggiorna/i.test(submit.textContent) ? 'Aggiorna piano' : 'Genera piano';
}

function adminGroup(title, description, id, open = false) {
  const details = disclosureGroup('admin-config-group', 'adminConfigGroup', title, description, id, open);
  details.lastElementChild.className = 'admin-config-group-body';
  return details;
}

function moveFieldsIntoGroup(form, names, group) {
  for (const name of names) {
    const label = form.elements.namedItem(name)?.closest('label');
    if (label) group.append(label);
  }
  for (const row of form.querySelectorAll(':scope > .row')) if (!row.querySelector('label')) row.remove();
}

export function normalizeGovernanceForm() {
  const form = $('#governanceForm');
  if (!form) return;
  for (const name of ['environmentName', 'classification', 'owner', 'monthlyBudgetUsd', 'warningPercent', 'allowedModels']) normalizeField(form, name);
  if (form.dataset.configurationPattern !== 'essential-first') {
    const context = adminGroup('Contesto del servizio', 'Ambiente, dati e responsabilità.', 'context', true);
    const limits = adminGroup('Limiti e modelli', 'Budget, soglia di avviso e modelli autorizzati.', 'limits');
    moveFieldsIntoGroup(form, ['environmentName', 'classification', 'owner'], context.querySelector('.admin-config-group-body'));
    moveFieldsIntoGroup(form, ['monthlyBudgetUsd', 'warningPercent', 'allowedModels'], limits.querySelector('.admin-config-group-body'));
    const actions = form.querySelector('.admin-actions');
    form.prepend(context, limits);
    if (actions) form.append(actions);
    form.dataset.configurationPattern = 'essential-first';
  }
  bindSingleOpen(form, ':scope > .admin-config-group');
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.textContent = 'Salva governo AI';
}

export function normalizeIdentityForms() {
  const identity = $('#identityForm');
  if (identity) {
    bindSingleOpen(identity, ':scope > .identity-step');
    const button = identity.querySelector('button[type="submit"]');
    if (button) button.textContent = 'Salva regole di accesso';
  }
  const test = $('[data-identity-step="test"]');
  if (test?.parentElement) bindSingleOpen(test.parentElement, ':scope > .identity-step');
  const user = $('#userForm');
  if (user && user.dataset.configurationPattern !== 'disclosed-create') {
    const group = adminGroup('Aggiungi identità locale', 'Solo per modalità locale o header ruolo legacy.', 'local-user');
    const body = group.querySelector('.admin-config-group-body');
    for (const child of [...user.children]) body.append(child);
    user.append(group);
    user.dataset.configurationPattern = 'disclosed-create';
  }
}

export function normalizeDialogDensity() {
  for (const dialog of $$('dialog')) {
    dialog.dataset.progressiveDialog = 'true';
    const body = dialog.querySelector('.dialog-body');
    if (body) body.dataset.density = 'compact';
  }
  for (const textarea of $$('textarea')) textarea.dataset.compactInput = 'true';
}
