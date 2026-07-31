import { $, esc, S, api, handshake } from './js/core.js';
import { render, integrity } from './js/render.js';
import { bind } from './js/interactions.js';
import { mountEpistemicGuide } from './js/epistemic-guide.js';
import { mountActionFrames } from './js/action-frame-ui.js';
import { mountSupportBundle } from './js/support-bundle.js';

async function boot() {
  bind();
  S.data = await api('/api/bootstrap');
  S.session = (await api('/api/session', { method: 'POST', body: '{}' })).sessionId;
  const controlSelect = $('#controlSelect');
  if (controlSelect && Array.isArray(S.data.controls)) controlSelect.innerHTML = S.data.controls.map(item => `<option value="${item.id}">${esc(item.label)}</option>`).join('');
  mountActionFrames();
  mountSupportBundle();
  render();
  integrity();
  await mountEpistemicGuide();
  handshake('idle', 'Pronto');
}
boot().catch(error => {
  $('#main').innerHTML = `<section class="card"><h1>ICTC non disponibile</h1><p>${esc(error.message)}</p><button id="retry">Riprova</button></section>`;
  handshake('error', error.message);
  $('#retry')?.addEventListener('click', () => location.reload());
});
