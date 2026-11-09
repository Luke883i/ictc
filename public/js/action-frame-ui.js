import { $, esc, S } from './core.js';
import { go, openDialog, openObject } from './render.js';
import { deriveActionFrames } from './action-frame-model.js';

let contractPromise;
let activeFrames = [];

const loadContract = () => contractPromise ||= fetch('/epistemic-contract.json').then(response => {
  if (!response.ok) throw new Error('Contratto epistemico non disponibile');
  return response.json();
});

function ensureStyles() {
  if (document.querySelector('link[href="action-frame.css"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'action-frame.css';
  document.head.append(link);
}

function details(frame) {
  const prerequisites = frame.prerequisites.length
    ? `<div><b>Prima di agire</b><ul>${frame.prerequisites.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>`
    : '';
  return `<details><summary>Perché questa azione compare qui</summary><div class="action-frame-detail"><p><b>Processo sottostante:</b> ${esc(frame.processRef)}</p>${prerequisites}<p><b>Conseguenza:</b> ${esc(frame.consequence)}</p><p><b>Non significa:</b> ${esc(frame.doesNotMean.join(' · ') || 'Nessuna conclusione aggiuntiva.')}</p><p><b>Evidenza attesa:</b> ${esc(frame.evidenceAfter.join(' · ') || 'Nessuna scrittura.')}</p></div></details>`;
}

function renderFrame(frame) {
  const objectAttribute = frame.objectRef ? ` data-object-id="${esc(frame.objectRef)}"` : '';
  return `<article class="action-frame-card"${objectAttribute}>
    <div class="action-frame-meta"><span>Guida derivata</span><small>${esc(frame.epistemicStatus)}</small></div>
    <h3>${esc(frame.userQuestion)}</h3>
    <p>${esc(frame.statement)}</p>
    <button type="button" class="primary" data-action-frame="${esc(frame.id)}" ${frame.availability === 'blocked' ? 'disabled' : ''}>${esc(frame.action.label)}</button>
    ${details(frame)}
  </article>`;
}

export function syncActionFrames() {
  const main = $('#main');
  if (!main || !S.data) return;
  main.querySelector('#ictc-action-frames')?.remove();
  activeFrames = deriveActionFrames(S.data, S.view);
  if (!activeFrames.length) return;
  const section = document.createElement('section');
  section.id = 'ictc-action-frames';
  section.className = 'action-frame-section';
  section.setAttribute('aria-labelledby', 'ictc-action-frame-title');
  section.innerHTML = `<header><div><span class="eyebrow">Qui e ora</span><h2 id="ictc-action-frame-title">Che cosa devi fare qui?</h2><p>Azioni locali derivate dagli oggetti runtime. Il processo resta nel dettaglio.</p></div><small>${activeFrames.length} opzioni contestuali</small></header><div class="action-frame-grid">${activeFrames.map(renderFrame).join('')}</div>`;
  const pageHead = main.querySelector('.page-head');
  if (pageHead) pageHead.insertAdjacentElement('afterend', section);
  else main.prepend(section);
}

function moveToSelector(selector) {
  const target = document.querySelector(selector);
  if (!target) throw new Error('Controllo non disponibile nella vista corrente');
  target.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  target.focus({ preventScroll: true });
  target.classList.add('action-frame-target');
  setTimeout(() => target.classList.remove('action-frame-target'), 1600);
}

async function performFrame(frame) {
  if (!frame || frame.availability === 'blocked') return;
  if (frame.action.kind === 'object') return openObject(frame.action.value);
  if (frame.action.kind === 'dialog') return openDialog(frame.action.value, document.querySelector(`[data-action-frame="${CSS.escape(frame.id)}"]`));
  if (frame.action.kind === 'view') return go(frame.action.value);
  if (frame.action.kind === 'selector') return moveToSelector(frame.action.value);
}

function checkpointDialog() {
  let dialog = $('#ictc-action-checkpoint');
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.id = 'ictc-action-checkpoint';
  dialog.className = 'action-checkpoint';
  dialog.innerHTML = `<form method="dialog"><header><div><span class="eyebrow">Punto di decisione</span><h2 data-checkpoint-title></h2></div><button value="cancel" aria-label="Annulla">×</button></header><p data-checkpoint-summary></p><dl><dt>Stato prima</dt><dd data-checkpoint-before></dd><dt>Stato dopo</dt><dd data-checkpoint-after></dd><dt>Evidenza attesa</dt><dd data-checkpoint-evidence></dd></dl><section><h3>Che cosa non conclude</h3><ul data-checkpoint-limits></ul></section><p class="action-checkpoint-context" data-checkpoint-context></p><footer><button value="cancel">Torna indietro</button><button class="primary" value="confirm">Conferma e registra</button></footer></form>`;
  document.body.append(dialog);
  return dialog;
}

export async function withActionCheckpoint(actionId, context, execute) {
  const contract = await loadContract();
  const action = contract.writeActions.find(item => item.id === actionId);
  if (!action) throw new Error(`Contratto di scrittura assente: ${actionId}`);
  const dialog = checkpointDialog();
  dialog.querySelector('[data-checkpoint-title]').textContent = context.title || action.label || actionId;
  dialog.querySelector('[data-checkpoint-summary]').textContent = context.summary || context.consequence || 'Conferma l’azione dopo averne verificato la conseguenza locale.';
  dialog.querySelector('[data-checkpoint-before]').textContent = context.before || action.before;
  dialog.querySelector('[data-checkpoint-after]').textContent = context.after || action.after;
  dialog.querySelector('[data-checkpoint-evidence]').textContent = context.evidence || (action.requiresReceipt ? 'Receipt e readback dopo la persistenza.' : 'Nessuna receipt richiesta.');
  dialog.querySelector('[data-checkpoint-limits]').innerHTML = action.doesNotMean.map(item => `<li>${esc(item)}</li>`).join('');
  dialog.querySelector('[data-checkpoint-context]').textContent = context.detail || '';
  dialog.returnValue = 'cancel';
  const confirmed = await new Promise(resolve => {
    const onClose = () => { dialog.removeEventListener('close', onClose); resolve(dialog.returnValue === 'confirm'); };
    dialog.addEventListener('close', onClose);
    dialog.showModal();
  });
  return confirmed ? execute() : null;
}

export function mountActionFrames() {
  ensureStyles();
  document.addEventListener('ictc:rendered', syncActionFrames);
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-action-frame]');
    if (!button) return;
    const frame = activeFrames.find(item => item.id === button.dataset.actionFrame);
    performFrame(frame).catch(error => {
      const status = $('#handshake');
      if (status) status.textContent = `× ${error.message}`;
    });
  });
  syncActionFrames();
}
