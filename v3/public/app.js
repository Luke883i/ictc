import { $, esc, S, api, handshake } from './js/core.js';
import { render, integrity } from './js/render.js';
import { bind } from './js/interactions.js';
import { mountEpistemicGuide } from './js/epistemic-guide.js';
import { mountActionFrames } from './js/action-frame-ui.js';
import { mountSupportBundle } from './js/support-bundle.js';

function applyReleaseGuardrails() {
  const release = S.data?.release;
  const fileMode = document.querySelector('[data-source-mode="file"]');
  if (!release || !fileMode) return;
  if (release.guardrails?.binaryUpload === 'disabled-by-default') {
    fileMode.disabled = true;
    fileMode.setAttribute('aria-disabled', 'true');
    fileMode.textContent = 'PDF/DOC · non disponibile';
    fileMode.title = 'La v1 stabile accetta link. I file richiedono quarantena e scansione prima di essere abilitati.';
    const fileField = $('#fileField');
    if (fileField) fileField.hidden = true;
  }
  document.documentElement.dataset.releaseReadiness = release.readiness;
}

async function boot() {
  bind();
  S.data = await api('/api/bootstrap');
  applyReleaseGuardrails();
  S.session = (await api('/api/session', { method: 'POST', body: '{}' })).sessionId;
  const controlSelect = $('#controlSelect');
  if (controlSelect && Array.isArray(S.data.controls)) controlSelect.innerHTML = S.data.controls.map(item => `<option value="${item.id}">${esc(item.label)}</option>`).join('');
  mountActionFrames();
  mountSupportBundle();
  render();
  integrity();
  await mountEpistemicGuide();
  handshake('idle', `Pronto · ICTC ${S.data.release?.version || S.data.meta.version}`);
}
boot().catch(error => {
  $('#main').innerHTML = `<section class="card"><h1>ICTC non disponibile</h1><p>${esc(error.message)}</p><button id="retry">Riprova</button></section>`;
  handshake('error', error.message);
  $('#retry')?.addEventListener('click', () => location.reload());
});
