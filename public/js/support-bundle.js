import { $, esc, S } from './core.js';
import { buildSupportBundle } from './support-bundle-model.js';

let latest = null;

function download(bundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ictc-support-${bundle.correlationId}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function render() {
  if (S.view !== 'system') return;
  const main = $('#main');
  if (!main || $('#ictc-support-bundle')) return;
  const section = document.createElement('section');
  section.id = 'ictc-support-bundle';
  section.className = 'card support-bundle-card';
  section.innerHTML = `<span class="eyebrow">Diagnostica locale</span><h2>Support bundle sanitizzato</h2><p>Raccoglie versione, integrità, conteggi e capacità. Esclude payload, documenti, URL, racconti e note libere.</p><button type="button" id="supportBundleCreate">Crea e scarica bundle</button><output id="supportBundleStatus" aria-live="polite"></output><details><summary>Limite del bundle</summary><p>Aiuta la diagnosi operativa; non prova verità, conformità o assenza di dati sensibili fuori dai campi esclusi.</p></details>`;
  main.append(section);
  $('#supportBundleCreate').addEventListener('click', () => {
    latest = buildSupportBundle(S.data, { correlationId: crypto.randomUUID() });
    download(latest);
    $('#supportBundleStatus').innerHTML = `Creato <code>${esc(latest.correlationId)}</code> · ${latest.counts.projectedObjects} oggetti · ${latest.integrity.eventCount} eventi`;
  });
}

export function mountSupportBundle() {
  document.addEventListener('ictc:rendered', render);
  render();
}
