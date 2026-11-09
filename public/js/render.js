import { $, $$, esc, status, titles, S, api, pill, handshake } from './core.js';
import { views } from './views.js';

export function go(view) {
  S.view = view;
  history.pushState({}, '', `#${view}`);
  render();
}

export function render() {
  $('#main').innerHTML = (views[S.view] || views.home)();
  $('#title').textContent = titles[S.view];
  $$('nav [data-view]').forEach(button => button.dataset.view === S.view ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current'));
  document.dispatchEvent(new Event('ictc:rendered'));
  $('#main').focus({ preventScroll: true });
}

export function openDialog(id, trigger = document.activeElement) {
  const dialog = $(`#${id}`);
  dialog.dataset.return = trigger?.id || '';
  dialog.showModal();
}

export function closeDialog(id) {
  const dialog = $(`#${id}`);
  const button = dialog.dataset.return && $(`#${dialog.dataset.return}`);
  dialog.close();
  button?.focus();
}

export async function openObject(id) {
  S.detail = await api(`/api/objects/${encodeURIComponent(id)}`);
  S.selected = id;
  S.tab = 'understand';
  renderDetail();
  $('#detail').showModal();
  $('#capsule').textContent = `${S.detail.object.label} + ${S.detail.related.length} relazioni deterministiche`;
}

export function renderDetail() {
  const { object, related, edges } = S.detail;
  $('#detailStatus').innerHTML = pill(object.epistemicStatus);
  $('#detailTitle').textContent = object.label;
  $$('[data-tab]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.tab === S.tab)));
  if (S.tab === 'understand') {
    $('#detailBody').innerHTML = `<h3>Che cosa devi fare qui</h3><p>${esc(object.nextAction || 'Nessuna azione automatica.')}</p><h3>Perché questo oggetto compare</h3><p>${esc(object.statement)}</p><h3>Che cosa non conclude</h3><ul>${object.limitations.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
  } else if (S.tab === 'chain') {
    $('#detailBody').innerHTML = `<div class="chain-list"><div class="chain-row"><b>Produttore</b><span>${esc(object.producer.id)}</span></div><div class="chain-row"><b>Input</b><span>${esc(object.inputs.map(item => item.id).join(', '))}</span></div><div class="chain-row"><b>Receipt</b><code>${esc(object.receiptRef || 'non disponibile')}</code></div><div class="chain-row"><b>Relazioni</b><span>${esc(edges.map(edge => edge.label).join(', ') || 'nessuna')}</span></div></div><h3>Oggetti che spiegano il contesto</h3><div class="related">${related.map(item => `<button data-related="${item.id}">${esc(item.label)}</button>`).join('') || 'Nessuno'}</div>`;
  } else {
    $('#detailBody').innerHTML = `<p class="note">Dati tecnici per verifica e debug. Non aggiungono autorità all’oggetto.</p><pre>${esc(JSON.stringify(object, null, 2))}</pre>`;
  }
  $$('[data-related]').forEach(button => button.onclick = () => openObject(button.dataset.related));
}

export async function mutate(path, payload, label) {
  handshake('collect', `${label}: raccolta input`);
  try {
    handshake('process', `${label}: applicazione regola`);
    const result = await api(path, { method: 'POST', body: JSON.stringify(payload) });
    handshake('persist', `${label}: receipt ${result.receipt?.hash?.slice(0, 10) || 'registrata'}`);
    await refresh();
    return result;
  } catch (error) {
    handshake('error', error.message);
    throw error;
  }
}

export async function refresh() {
  S.data = await api('/api/bootstrap');
  $('#controlSelect').innerHTML = S.data.controls.map(item => `<option value="${item.id}">${esc(item.label)}</option>`).join('');
  render();
  integrity();
}

export async function integrity() {
  const payload = await api('/api/runtime/integrity');
  $('#integrity').textContent = `SOT locale · ${payload.ok ? 'catena coerente' : 'verifica fallita'} · ${payload.eventCount} eventi`;
}
