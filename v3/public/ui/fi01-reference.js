import { $, api, closeDialog, notify, openDialog, showReceipt, state } from './common.js';
import { refresh } from './controller.js';
import { internalReferencePanelMarkup } from './security-encoding.js';

const DIALOG_ID = 'internalSourceReferenceDialog';

function canContribute() {
  return Boolean(state.data?.actor?.permissions?.includes('contribute-source'));
}

function injectSurface() {
  if ($('#openInternalSourceReference')) return;
  const anchor = $('#openContribution');
  if (!anchor) return;

  const button = document.createElement('button');
  button.id = 'openInternalSourceReference';
  button.className = 'secondary';
  button.type = 'button';
  button.textContent = 'Registra riferimento interno';
  button.hidden = !canContribute();
  anchor.insertAdjacentElement('afterend', button);

  const dialog = document.createElement('dialog');
  dialog.id = DIALOG_ID;
  dialog.className = 'dialog';
  dialog.setAttribute('aria-labelledby', 'internalSourceReferenceTitle');
  dialog.innerHTML = `
    <form id="internalSourceReferenceForm" class="dialog-shell">
      <header>
        <div>
          <p class="eyebrow">FI-01 · Fonte interna governata</p>
          <h2 id="internalSourceReferenceTitle">Registra un riferimento al sistema master</h2>
          <p>ICTC conserva identità, versione e digest del riferimento. Il documento resta autorevole nel DMS/OneTrust dichiarato.</p>
        </div>
        <button type="button" data-fi01-close aria-label="Chiudi">×</button>
      </header>
      <div class="dialog-body">
        <label>Titolo<input name="title" required maxlength="1000"></label>
        <div class="compact-fields">
          <label>Sistema master<input name="masterSystem" required maxlength="300" placeholder="OneTrust, SharePoint, DMS…"></label>
          <label>ID master<input name="masterId" required maxlength="500" placeholder="DOC-12345"></label>
        </div>
        <div class="compact-fields">
          <label>Versione master<input name="masterVersion" required maxlength="300" placeholder="7"></label>
          <label>SHA-256 della versione<input name="contentSha256" required minlength="64" maxlength="64" pattern="[0-9a-fA-F]{64}" class="hash" placeholder="64 caratteri esadecimali"></label>
        </div>
        <label>URL nel sistema master<input name="referenceUrl" type="url" required placeholder="https://dms.example/.../version/7"></label>
        <div class="compact-fields">
          <label>Tipo documento<select name="documentType"><option value="other">Altro</option><option value="law">Legge</option><option value="regulation">Regolamento</option><option value="directive">Direttiva</option><option value="standard">Standard</option><option value="guideline">Linea guida</option><option value="circular">Circolare</option></select></label>
          <label>Identificativo ufficiale<input name="identifier" maxlength="500" placeholder="facoltativo"></label>
        </div>
        <div class="compact-fields">
          <label>Autorità<input name="authority" maxlength="500" placeholder="facoltativo"></label>
          <label>Giurisdizione<input name="jurisdiction" maxlength="500" placeholder="facoltativo"></label>
        </div>
        <label>URL della fonte ufficiale <small>facoltativo</small><input name="publicSourceUrl" type="url" placeholder="https://..."></label>
        <label>Nota di rilevanza <small>facoltativa</small><textarea name="note" rows="3" maxlength="3000"></textarea></label>
        <div class="boundary">Questa slice registra un riferimento e un digest dichiarato; non copia il documento e non usa AI nell’intake. La verifica ICTC non sostituisce il sistema master né determina applicabilità normativa.</div>
      </div>
      <footer>
        <button type="button" data-fi01-close>Annulla</button>
        <button class="primary" type="submit">Registra riferimento</button>
      </footer>
    </form>`;
  document.body.append(dialog);

  button.addEventListener('click', () => {
    if (!canContribute()) return notify('Il ruolo corrente non può registrare fonti interne', true);
    $('#internalSourceReferenceForm').reset();
    openDialog(DIALOG_ID);
  });
  dialog.querySelectorAll('[data-fi01-close]').forEach(control => control.addEventListener('click', () => closeDialog(DIALOG_ID)));
  $('#internalSourceReferenceForm').addEventListener('submit', async event => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const submit = formElement.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const result = await api('/api/internal-sources/reference', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries([
          'title','masterSystem','masterId','masterVersion','contentSha256','referenceUrl','documentType','identifier','authority','jurisdiction','publicSourceUrl','note'
        ].map(key => [key, form.get(key)])))
      });
      showReceipt(result);
      await refresh();
      closeDialog(DIALOG_ID);
      state.activeSourceId = result.result.id;
      notify('Riferimento interno registrato: verifica umana richiesta');
      requestAnimationFrame(() => {
        const sourceButton = document.querySelector(`[data-open-source="${CSS.escape(result.result.id)}"]`);
        sourceButton?.click();
      });
    } catch (error) {
      notify(error.message, true);
    } finally {
      submit.disabled = false;
    }
  });
}

function decorateInternalReference() {
  const item = state.data?.catalog?.find(entry => entry.id === state.activeSourceId);
  const reference = item?.internalReference;
  const body = $('#sourceBody');
  if (!body || !reference) return;

  const facts = body.querySelectorAll('.source-facts .fact-box');
  if (facts[1]) {
    const value = facts[1].querySelector('b');
    const label = facts[1].querySelector('span');
    if (value) value.textContent = 'Manuale';
    if (label) label.textContent = 'Origine metadati';
  }
  const firstEyebrow = body.querySelector('.lens-panel .eyebrow');
  if (firstEyebrow?.textContent.includes('Suggerimento AI')) firstEyebrow.textContent = 'Metadati dichiarati da verificare';
  const tracePanel = [...body.querySelectorAll('.lens-panel')].find(panel => panel.querySelector('.eyebrow')?.textContent === 'Traccia AI');
  if (tracePanel) tracePanel.innerHTML = '<p class="eyebrow">Intake deterministico</p><p>Nessuna AI è stata usata per registrare identità, versione o digest del sistema master.</p>';

  let panel = $('#fi01MasterPanel');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'fi01MasterPanel';
    panel.className = 'lens-panel';
    body.prepend(panel);
  }
  panel.innerHTML = internalReferencePanelMarkup(reference);
}

function syncVisibility() {
  const button = $('#openInternalSourceReference');
  if (button) button.hidden = !canContribute();
}

export function installFi01Reference() {
  injectSurface();
  syncVisibility();
  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-source]')) requestAnimationFrame(decorateInternalReference);
  });
  document.addEventListener('ictc:surface-changed', () => {
    syncVisibility();
    requestAnimationFrame(decorateInternalReference);
  });
}
