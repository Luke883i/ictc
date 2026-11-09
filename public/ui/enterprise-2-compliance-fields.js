export const JOB_FIELD_COPY = Object.freeze({
  jobName: Object.freeze({ label: 'Nome della ricerca', hint: 'Titolo breve e riconoscibile nel registro.' }),
  objective: Object.freeze({ label: 'Obiettivo', hint: 'Descrivi il risultato informativo atteso.' }),
  miningMode: Object.freeze({ label: 'Metodo di ricerca', hint: 'Scegli confronto, copertura o elenco di osservazione.' }),
  noveltyBaseline: Object.freeze({ label: 'Riferimento del confronto', hint: 'Indica da quale esecuzione o data confrontare i risultati.' }),
  baselineAt: Object.freeze({ label: 'Data di riferimento', hint: 'Necessaria soltanto quando scegli una data specifica.' }),
  jurisdictions: Object.freeze({ label: 'Ambiti territoriali', hint: 'Esempio: Italia, Unione europea.' }),
  authorities: Object.freeze({ label: 'Autorità e fonti prioritarie', hint: 'Elenca gli enti o i repertori da privilegiare.' }),
  resultLimit: Object.freeze({ label: 'Risultati massimi per esecuzione', hint: 'Limite operativo dei candidati proposti.' }),
  cadence: Object.freeze({ label: 'Frequenza', hint: 'Intervallo previsto tra le esecuzioni.' }),
  sourceHints: Object.freeze({ label: 'Fonti note', hint: 'Indicazioni facoltative per orientare la ricerca.' }),
  promptOverride: Object.freeze({ label: 'Istruzioni specifiche', hint: 'Usa solo quando le istruzioni standard non bastano.' })
});

export const FIELD_COPY = Object.freeze({
  organizationName: Object.freeze({ label: 'Organizzazione', hint: 'Nome usato nelle attività e nelle evidenze.' }),
  organizationScope: Object.freeze({ label: 'Ambito operativo', hint: 'Descrivi funzioni, servizi o unità comprese.' }),
  jurisdictions: Object.freeze({ label: 'Ambiti territoriali', hint: 'Esempio: Italia, Unione europea.' }),
  endpoint: Object.freeze({ label: 'Indirizzo del servizio', hint: 'Endpoint approvato per il servizio AI.' }),
  model: Object.freeze({ label: 'Modello autorizzato', hint: 'Nome esatto del modello consentito.' }),
  apiKeyEnv: Object.freeze({ label: 'Nome della variabile segreta', hint: 'ICTC legge il valore dall’ambiente e non lo mostra.' }),
  temperature: Object.freeze({ label: 'Variabilità della risposta', hint: 'Usa il valore definito dalla policy tecnica.' }),
  monitoringPlan: Object.freeze({ label: 'Pianificazione del monitoraggio', hint: 'Istruzioni generali per proporre un piano.' }),
  complianceDiscovery: Object.freeze({ label: 'Ricerca delle fonti', hint: 'Criteri generali per cercare fonti candidate.' }),
  contributionEnrichment: Object.freeze({ label: 'Analisi dei materiali', hint: 'Indicazioni per proporre metadati senza modificare l’originale.' }),
  incidentAnalysis: Object.freeze({ label: 'Analisi degli eventi', hint: 'Separa fatti, ipotesi e informazioni mancanti.' }),
  incidentDraft: Object.freeze({ label: 'Formulazione degli eventi', hint: 'Prepara bozze da verificare senza decidere obblighi.' }),
  environmentName: Object.freeze({ label: 'Ambiente', hint: 'Nome dell’ambiente applicativo governato.' }),
  classification: Object.freeze({ label: 'Classificazione dei dati', hint: 'Livello massimo ammesso per questo ambiente.' }),
  owner: Object.freeze({ label: 'Responsabile del servizio', hint: 'Persona o funzione responsabile della configurazione.' }),
  monthlyBudgetUsd: Object.freeze({ label: 'Budget mensile indicativo', hint: 'Soglia economica di governo, non previsione certa.' }),
  warningPercent: Object.freeze({ label: 'Soglia di avviso', hint: 'Percentuale alla quale mostrare un avviso.' }),
  allowedModels: Object.freeze({ label: 'Modelli autorizzati', hint: 'Un modello per riga.' })
});

function directTextNodes(label) {
  return [...label.childNodes].filter(node => node.nodeType === Node.TEXT_NODE);
}

export function normalizeField(form, name) {
  const control = form?.elements?.namedItem(name);
  const copy = FIELD_COPY[name] || JOB_FIELD_COPY[name];
  const label = control?.closest('label');
  if (!control || !copy || !label) return;
  directTextNodes(label).forEach(node => node.remove());
  let title = label.querySelector(':scope > .field-label');
  if (!title) {
    title = document.createElement('span');
    title.className = 'field-label';
    label.prepend(title);
  }
  title.textContent = copy.label;
  let hint = label.querySelector(':scope > .field-hint');
  if (!hint) {
    hint = document.createElement('small');
    hint.className = 'field-hint';
    label.append(hint);
  }
  hint.textContent = copy.hint;
  if (control.required) label.dataset.requiredField = 'true';
}

export function bindSingleOpen(container, selector) {
  const groups = [...container.querySelectorAll(selector)];
  for (const group of groups) {
    if (group.dataset.singleOpenBound === 'true') continue;
    group.dataset.singleOpenBound = 'true';
    group.addEventListener('toggle', () => {
      if (!group.open) return;
      for (const sibling of groups) if (sibling !== group) sibling.open = false;
    });
  }
}
