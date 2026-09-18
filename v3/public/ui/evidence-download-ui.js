import { downloadProtected, notify } from './common.js';

const FORMATS = Object.freeze([
  ['pdf', 'PDF stampabile'],
  ['xml', 'XML strutturato'],
  ['md', 'Markdown'],
  ['zip', 'ZIP completo']
]);

let installed = false;
let scheduled = false;

function baseUrl(value) {
  return String(value || '').replace(/\.(?:zip|pdf|xml|md)$/, '');
}

function menuFor(button) {
  const base = baseUrl(button.dataset.downloadEvidence);
  if (!base) return null;
  const details = document.createElement('details');
  details.className = 'evidence-export-menu';
  details.dataset.evidenceBase = base;
  details.innerHTML = `<summary class="secondary" aria-label="Scarica fascicolo in un formato">Fascicolo</summary><div role="group" aria-label="Formati fascicolo">${FORMATS.map(([format, label]) => `<button type="button" data-evidence-download="${format}" aria-label="Scarica fascicolo: ${label}">${label}</button>`).join('')}</div>`;
  button.replaceWith(details);
  return details;
}

function enhance() {
  scheduled = false;
  for (const button of document.querySelectorAll('button[data-download-evidence]')) menuFor(button);
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(enhance);
}

function closeMenus(except = null) {
  for (const menu of document.querySelectorAll('.evidence-export-menu[open]')) {
    if (menu !== except) menu.removeAttribute('open');
  }
}

export function installEvidenceDownloads() {
  if (installed) return;
  installed = true;
  schedule();
  document.addEventListener('ictc:rendered', schedule);
  document.addEventListener('click', async event => {
    const menu = event.target.closest?.('.evidence-export-menu');
    if (!menu) {
      closeMenus();
      return;
    }
    const summary = event.target.closest?.('.evidence-export-menu > summary');
    if (summary) {
      closeMenus(menu);
      return;
    }
    const button = event.target.closest?.('[data-evidence-download]');
    if (!button) return;
    event.preventDefault();
    const format = button.dataset.evidenceDownload;
    const base = menu.dataset.evidenceBase;
    if (!base || !FORMATS.some(([id]) => id === format)) return;
    try {
      await downloadProtected(`${base}.${format}`, `ictc-evidence.${format}`);
      menu.removeAttribute('open');
      document.dispatchEvent(new CustomEvent('ictc:evidence-download-complete', {
        detail: { format, base, menuClosed: true }
      }));
      notify(format === 'pdf' ? 'PDF stampabile scaricato' : 'Fascicolo evidenze scaricato');
    } catch (error) {
      notify(error.message, true);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const open = document.querySelector('.evidence-export-menu[open]');
    if (!open) return;
    open.removeAttribute('open');
    open.querySelector('summary')?.focus();
  });
}