# ICTC Refined Product — Pre-candidate PR

Baseline authority: `main@75025cec68616fb57a686425b45b2ad832a3d639`.

Release identity authority: `v3/release-identity.json`.

## Intent

Assorbire Wave A, B, C e D in una sola PR senza cambiare i confini epistemici del prodotto. Il refinement rende la UI piu leggibile, testabile e coerente; non trasforma evidenze, mapping o postura tecnica in una dichiarazione di conformita, certificazione o sufficienza legale.

## Wave A — visual correctness

- UX-01: un solo vertical scroll owner per ogni dialog canonico.
- UX-02: nessun primary invisibile per collisione di cascade.
- UX-03: il racconto originale e il campo dominante dell'incident intake.
- UX-04: informazioni aggiuntive e rationale della domanda sono progressive disclosure.
- UX-05: il documento retrostante non scorre mentre un modal e aperto.

## Wave B — shell polish

- UX-06: la superficie `Evidenze` e rinominata `Postura Standard & Security ICTC`; su viewport stretti la resa compatta e `Postura ICTC` con accessible name completo.
- UX-07: small brand mark SVG dedicato alla dimensione 28–32 px.
- UX-08: close icon resa con SVG interno e non con glyph dipendente dal font.
- UX-09: primary/secondary action grammar non puo essere sovrascritta da selector generici di card.
- UX-12: incident card compattate senza perdere stato, dossier o apertura.

## Wave C — convergenza tecnica

- UX-10: `market-1-2.css` entra nel grafo CSS canonico; il link runtime legacy viene neutralizzato e reso osservabile dal gate finche il vecchio injector non viene eliminato in una successiva compression-only PR.
- UX-11: label delle superfici globali centralizzate in `ui/product-copy.js`.
- release identity cross-documenti centralizzata in `v3/release-identity.json`.
- README allineato a semantic edition, experience edition e refinement profile correnti.

## Wave D — assurance e hardening

- QA-01: `one_scroll_owner` eseguito su contribution, incident intake, incident workspace, command palette e standard browser.
- QA-02: painted-control audit rileva testo presente ma colore uguale al background senza background image.
- QA-03: geometria del racconto originale deve occupare almeno il 55% del dialog desktop.
- QA-04: screenshot aggiuntivi per contribution, incident intake e incident workspace.
- SEC-01: i recent della command palette sono ri-autorizzati contro la projection corrente, per ogni kind.
- GOV-01: resta owner GitHub; la PR non puo dichiarare main protetto finche la branch protection non e osservata come attiva.
- SAST-01: resta owner GitHub/GHAS; il refinement non descrive CodeQL come eseguito quando il repository lo marca conditional-not-executed.

## DoD locale

### Header e shell

- nessun target primario sotto 44 CSS px;
- nome completo Postura disponibile semanticamente;
- alias compatto solo come presentation adaptation;
- small mark leggibile senza opacity artificiale.

### Contribution dialog

- background scroll locked;
- massimo un elemento con overflow verticale effettivo;
- header e footer stabili;
- close control con accessible name e SVG.

### Incident intake

- `Racconto originale` e il primo task sostanziale e occupa >=55% della larghezza utile desktop;
- tipo, severita, date e allegati sono nella colonna secondaria;
- mobile linearizza senza perdita di campo;
- CTA di submit rimane visibile e distinguibile.

### Incident card

- `Apri`/`Apri evento` e visivamente dipinto;
- Dossier resta secondario;
- nessun whitespace necessario solo per sostenere action rail legacy.

### Incident workspace

- campo della domanda e visibile prima delle spiegazioni secondarie;
- `Perche viene chiesto?` contiene rationale e suggerimento AI in disclosure;
- massimo un vertical scroll owner;
- download evidenze resta raggiungibile.

### Postura Standard & Security ICTC

- titolo, command palette e nav usano la stessa label canonica;
- la vista conserva il boundary: integrita/provenienza non implicano conformita o sufficienza;
- auditor accede in sola lettura.

## DdD locale — Definition of Degradation

Una semplificazione viene rifiutata se causa almeno uno dei seguenti segnali osservabili:

- secondo/terzo scroll owner;
- background scroll durante modal;
- primary text non dipinto;
- narrative share <55% desktop;
- target interattivo <44px;
- recent non piu autorizzato ancora ricercabile;
- stylesheet runtime aggiuntivo attivo oltre il grafo canonico;
- fixed footer che sovrappone receipt/toast;
- label mobile che eccede la capacita della nav senza alias accessibile.

`v3/refined-product-saturation.mjs` contiene mutant probes per ciascuna di queste degradazioni.

## DoD reticolare

Per ogni percorso critico deve restare ricostruibile la catena:

`surface label -> authorized route -> task input -> human/AI authority boundary -> write command (se presente) -> readback -> receipt/evidence -> Postura`

Il polish layer non introduce write API, non crea stati di dominio e non genera EpistemicStep. La command palette continua a essere navigation-only. I recent sono hint locali e vengono accettati soltanto se il corrispondente oggetto compare ancora nella projection autorizzata.

## Saturation e stop rule

`v3/refined-product-saturation.mjs` usa firme di anomalia generate da misure e valori runtime simulati, non una lista chiusa K01-K20. Il mining esegue 12.000 scenari adversarial per scoprire firme normalizzate; poi un holdout seed-separato di M+1000 scenari target deve produrre zero anomalie e zero nuove firme. Mutant di semplificazione devono essere rilevati.

Claim boundary: e una prova bounded del modello di polish; non dimostra assenza di defect browser, assistive-technology o deployment non modellati. Il browser server-backed resta una classe di evidenza distinta.

## Global DoD

La PR e pre-candidate-ready soltanto se:

1. `npm run test:current:semantic` passa sull'exact PR head;
2. `npm run test:current:runtime` passa sull'exact PR head;
3. `browser-v1-9-experience.py` passa sull'exact PR head;
4. `refined-product-saturation.mjs` registra holdout 1000 / anomalies 0;
5. nessun check required osservato e in failure;
6. CodeQL viene descritto secondo il suo stato reale, mai inferito dal posture gate;
7. nessun direct push viene fatto a `main`;
8. merge in main richiede nuova osservazione di SHA e post-merge checks.

## Non-goals

Nessun compliance score, maturity score, certificazione, framework UI esterno, design-system dependency, workflow engine, modifica del modello di autorita, o nuova source of truth operativa.
