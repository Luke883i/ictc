# Enterprise 2 — regressione navigazione amministrativa

## Osservazione

La journey browser `S08-admin-controls` ha rilevato che, dopo la selezione della sezione **Controlli**, il numero di pannelli amministrativi visibili non era esattamente uno.

## Causa

Le sezioni storiche `Stato dei controlli`, `Azioni richieste`, `Utilizzo AI` e `Governance AI` sono rappresentate da un elemento `details` interno a un contenitore `.admin-panel`. Il resolver Enterprise 2 nascondeva tutti i pannelli diretti e rendeva visibile soltanto il target interno, lasciando nascosto il pannello proprietario.

## Correzione

La navigazione ora:

1. risolve il target selezionato;
2. risale al relativo `.admin-panel` diretto;
3. nasconde tutti gli altri pannelli diretti;
4. rende visibile il solo pannello proprietario;
5. apre il disclosure selezionato;
6. conserva `data-active-admin-section` e `aria-current` già emessi dal layer Enterprise 2.

## Invariante

Per ogni sezione della navigazione amministrativa, `#adminCenter .admin-panel:visible` deve avere cardinalità esattamente pari a `1`.

## Falsificatore

La correzione fallisce se una selezione produce zero pannelli visibili, più di un pannello visibile oppure un pannello diverso da quello proprietario del target.

## Evidenza eseguibile

La verifica è demandata alla journey `v3/browser-enterprise-2-check.py`, fase `S08-admin-controls`, insieme alle regressioni 1.8, ai controlli di sintassi, runtime, launcher e sicurezza sullo stesso SHA.
