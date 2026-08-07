import { $, $$, state } from './common.js';

const UI_STANDARD_ID = 'ictc-surface-standard-1';
const PLACEHOLDER_COPY = new Set(['descrizione.', 'tbd', 'todo', 'placeholder']);
const CLASSIFICATION_LABELS = Object.freeze({
  internal: 'Uso interno',
  confidential: 'Riservato',
  restricted: 'Limitato'
});

function text(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeDialogChrome(root = document) {
  for (const dialog of $$('dialog', root)) {
    dialog.dataset.uiStandardDialog = 'true';
    const shell = dialog.querySelector(':scope > .dialog-shell, :scope > .admin-shell') || dialog.firstElementChild;
    if (shell) shell.classList.add('ui-dialog-shell');
    const header = shell?.querySelector(':scope > header, :scope > .dialog-head, :scope > .admin-head') || dialog.querySelector(':scope > header, :scope > .dialog-head, :scope > .admin-head');
    const body = shell?.querySelector(':scope > .dialog-body, :scope > .admin-grid') || dialog.querySelector(':scope > .dialog-body, :scope > .admin-grid');
    const footer = shell?.querySelector(':scope > footer') || dialog.querySelector(':scope > footer');
    header?.classList.add('ui-dialog-header');
    body?.classList.add('ui-dialog-body');
    footer?.classList.add('ui-dialog-footer');
    const close = header?.querySelector('button[aria-label^="Chiudi"],button[data-admin-close],button[data-workbench-close],button[data-close]');
    if (close) {
      close.classList.add('ui-dialog-close');
      close.dataset.priority = 'quiet';
    }
  }
}

function wrapMetricPairs(root = document) {
  for (const host of $$('.lane-status', root)) {
    const children = [...host.children];
    const existingPairs = children.filter(node => node.classList.contains('ui-metric-pair'));
    if (existingPairs.length === children.length && existingPairs.length > 0) {
      host.dataset.metricPairs = 'true';
      host.setAttribute('role', 'list');
      for (const pair of existingPairs) pair.setAttribute('role', 'listitem');
      continue;
    }
    if (children.length < 4 || children.length % 2 !== 0) {
      delete host.dataset.metricPairs;
      continue;
    }
    const pairs = [];
    let valid = true;
    for (let index = 0; index < children.length; index += 2) {
      if (children[index].tagName !== 'B' || !['SPAN', 'SMALL'].includes(children[index + 1]?.tagName)) {
        valid = false;
        break;
      }
      pairs.push([children[index], children[index + 1]]);
    }
    if (!valid) {
      delete host.dataset.metricPairs;
      continue;
    }
    for (const [value, label] of pairs) {
      const pair = document.createElement('span');
      pair.className = 'ui-metric-pair';
      pair.setAttribute('role', 'listitem');
      pair.append(value, label);
      host.append(pair);
    }
    host.dataset.metricPairs = 'true';
    host.setAttribute('role', 'list');
  }
}

function normalizeDisclosures(root = document) {
  for (const details of $$('details', root)) {
    details.dataset.uiDisclosure = 'true';
    const summary = details.querySelector(':scope > summary');
    if (!summary) continue;
    summary.classList.add('ui-disclosure-summary');
    const mark = summary.querySelector(':scope > .ds-disclosure-mark');
    if (mark) mark.classList.add('ui-disclosure-mark');
  }
  for (const standard of $$('.proof-standard', root)) standard.dataset.uiStandardBlock = 'true';
}

function suppressPlaceholderCopy(root = document) {
  for (const node of $$('p,span,small', root)) {
    if (!PLACEHOLDER_COPY.has(text(node.textContent))) continue;
    const card = node.closest('.proof-answer-grid > article, .proof-answer-grid > section');
    if (card) {
      card.dataset.uiPlaceholder = 'true';
      card.remove();
    }
  }
  for (const grid of $$('.proof-answer-grid', root)) {
    const visible = [...grid.children].some(child => !child.hidden);
    if (!visible) {
      const section = grid.closest('section:not(#proofView)');
      if (section) {
        section.hidden = true;
        section.dataset.uiEmptySection = 'true';
      }
    }
  }
}

function localizeControlledVocabulary(root = document) {
  const classification = $('#governanceForm select[name="classification"]');
  if (classification) {
    for (const option of classification.options) {
      const label = CLASSIFICATION_LABELS[option.value];
      if (label) option.textContent = label;
    }
  }
  const staleLabels = new Map([
    ['Policy globali e prompt tecnici', 'Istruzioni assistite'],
    ['Provider AI', 'Connessione AI'],
    ['Scarica prova', 'Scarica evidenza']
  ]);
  for (const node of $$('h1,h2,h3,summary,b,button', root)) {
    const replacement = staleLabels.get(String(node.textContent || '').trim());
    if (replacement) node.textContent = replacement;
  }
}

function activeAdminTarget(dialog) {
  return dialog?.querySelector('.admin-section-nav [aria-current="page"][data-admin-target]')?.dataset.adminTarget || null;
}

function enforceAdminIsolation(root = document) {
  const dialog = $('#adminCenter');
  if (!dialog?.open) return;
  const targetSelector = activeAdminTarget(dialog);
  const grid = dialog.querySelector('.admin-grid');
  if (!targetSelector || !grid) return;
  const target = dialog.querySelector(targetSelector);
  const owner = target?.classList.contains('admin-panel') ? target : target?.closest('.admin-panel');
  if (!owner || owner.parentElement !== grid) return;
  for (const panel of [...grid.children].filter(node => node.classList.contains('admin-panel'))) panel.hidden = panel !== owner;
  owner.hidden = false;
  dialog.dataset.uiIsolatedAdminTarget = targetSelector;
}

function normalizeMobileBrand() {
  const brand = $('.brand');
  if (brand) brand.dataset.uiBrand = 'true';
}

function reconcileServerIssuedAdminVisibility() {
  const role = state.data?.actor?.role;
  if (!role) return;
  const settings = $('#openSettings');
  if (!settings) return;
  settings.hidden = role !== 'admin';
  settings.dataset.uiAuthoritySource = 'server-actor-role';
}

let scheduled = false;
function applyUiStandard() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    document.documentElement.dataset.uiStandard = UI_STANDARD_ID;
    normalizeDialogChrome();
    wrapMetricPairs();
    normalizeDisclosures();
    suppressPlaceholderCopy();
    localizeControlledVocabulary();
    enforceAdminIsolation();
    normalizeMobileBrand();
    reconcileServerIssuedAdminVisibility();
    document.dispatchEvent(new CustomEvent('ictc:ui-standard-ready', { detail: { id: UI_STANDARD_ID } }));
  });
}

export function installEnterprise2UiStandard() {
  document.addEventListener('ictc:rendered', applyUiStandard);
  document.addEventListener('ictc:surface-changed', applyUiStandard);
  document.addEventListener('toggle', event => {
    if (event.target.matches?.('details')) requestAnimationFrame(applyUiStandard);
  }, true);
  document.addEventListener('click', event => {
    if (event.target.closest('button,[data-admin-target],[data-service],[data-proof-service]')) {
      requestAnimationFrame(applyUiStandard);
      setTimeout(applyUiStandard, 160);
    }
  }, true);
  applyUiStandard();
}
