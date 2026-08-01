import { startJourneyShell } from './js/journey-shell.js';

startJourneyShell().catch(error => {
  const main = document.querySelector('#main');
  if (main) {
    main.innerHTML = `<section class="welcome"><span class="eyebrow">Runtime non disponibile</span><h1>ICTC non può aprire l’interfaccia</h1><p>${String(error.message || error)}</p><button id="retryBoot" type="button">Riprova</button></section>`;
    document.querySelector('#retryBoot')?.addEventListener('click', () => location.reload());
  }
  const status = document.querySelector('#operationStatus');
  if (status) status.textContent = `Errore · ${String(error.message || error)}`;
});
