# ICTC Enterprise 2 — flusso operativo e configurazione progressiva

## Scopo

Questa slice traduce un processo di lavoro tipico della funzione compliance in una guida contestuale della UI. Il processo non crea una nuova autorità applicativa, non modifica endpoint o permessi e non attribuisce a ICTC la capacità di determinare applicabilità normativa, obblighi di notifica, conformità o certificazione.

## Processo tecnico-logico

| Fase | Domanda dell’utente | Risultato osservabile in ICTC |
|---|---|---|
| 1. Inquadra | Perché stiamo lavorando e chi decide? | Obiettivo, responsabilità e decisione attesa sono espliciti. |
| 2. Delimita | Qual è l’ambito e quali criteri useremo? | Perimetro operativo, riferimenti, inclusioni, esclusioni e limiti. |
| 3. Raccogli | Quali fonti o fatti originali abbiamo? | Originali registrati prima dell’analisi o della classificazione. |
| 4. Valuta | Cosa è pertinente, attendibile o mancante? | Fatti, ipotesi, lacune e proposte assistite restano separati. |
| 5. Decidi e attua | Quale decisione umana prendiamo e chi agisce? | Motivazione, versione, responsabilità, azione e monitoraggio. |
| 6. Riesamina | Quale prova resta e quando rivalutiamo? | Origine, versioni, limiti, ricevute e prossimo riesame. |

La UI mostra una sola **fase consigliata** derivata dalla superficie e dai dati già presenti. Il percorso completo resta disponibile nel disclosure “Vedi il percorso completo”. La fase non è uno stato giuridico né un punteggio di conformità.

## Configurazione AI: essenziale prima, facoltativo dopo

La configurazione viene ricomposta in tre passaggi:

1. **Contesto organizzativo** — organizzazione, ambito operativo e territori;
2. **Connessione AI** — indirizzo del servizio, modello autorizzato e nome della variabile segreta;
3. **Istruzioni assistite** — indicazioni facoltative per pianificazione, ricerca, analisi e formulazione.

È aperto un solo passaggio alla volta. Lo stato “Completo” indica soltanto che i campi essenziali hanno un valore; non valida la correttezza tecnica, organizzativa o giuridica della configurazione.

## Configurazione del monitoraggio normativo

Il menu di configurazione della ricerca viene ricomposto in tre passaggi a apertura singola:

1. **Obiettivo e ambito** — nome, risultato atteso, metodo e territori;
2. **Criteri di ricerca** — riferimento del confronto, autorità, cambiamenti e limite dei risultati;
3. **Frequenza e istruzioni** — periodicità, fonti note e indicazioni facoltative.

Le alternative tecniche “job”, “novelty” e “baseline” non sono usate come etichette primarie. Restano rappresentate da `Ricerca`, `Novità dal riferimento` e `Riferimento del confronto`. Il piano rimane una proposta soggetta ad approvazione umana.

## Rifattorizzazioni dei componenti

- `compliance-flow-cue`: fase corrente compatta e percorso completo su richiesta;
- `configuration-overview`: tre passaggi navigabili con stato testuale;
- `job-configuration-overview`: obiettivo, criteri e frequenza della ricerca in sezioni progressive;
- `settings-section-18`: accordion a apertura singola;
- `admin-config-group`: contesto del servizio separato da limiti e modelli;
- identità locale: creazione chiusa all’ingresso;
- textarea tecniche: altezza ridotta, espansione al focus e ridimensionamento manuale;
- footer dei dialoghi: azione finale stabile durante lo scorrimento.

## Vocabolario

Le etichette principali descrivono l’oggetto e il limite dell’azione:

- `Contesto organizzativo`, non “scope”;
- `Connessione AI`, non “provider AI” come titolo primario;
- `Istruzioni assistite`, non “policy globali e prompt tecnici”;
- `Ambiti territoriali`, non una pretesa determinazione delle giurisdizioni applicabili;
- `Modello autorizzato`, per rendere visibile il governo umano;
- `Fase consigliata`, mai “stato di conformità” o “compliance score”.

Il catalogo completo delle alternative rifiutate e delle motivazioni è in `enterprise-2-compliance-flow-model.json`.

## Progressive disclosure

1. Una superficie operativa mostra fase consigliata, ragione e indice `n/6`.
2. Il percorso completo è chiuso in ingresso.
3. La configurazione mostra tre passaggi e apre una sola sezione.
4. I campi essenziali precedono le istruzioni facoltative.
5. Il governo AI separa contesto da limiti e modelli.
6. La creazione di identità locali è chiusa fino alla richiesta esplicita.
7. Nessuna disclosure nasconde l’azione finale o cambia l’autorità server-side.

## Scenari e saturazione

Il modello attraversa ruolo, superficie, popolazione dati, stato AI, viewport, disclosure, modalità di input, rete, autorità e lingua. Lo spazio cartesiano dichiarato è calcolato dal test.

Le prime `M = 134` esecuzioni introducono le primitive di rischio del modello. L’artefatto generato `artifacts/enterprise-2-compliance-flow-scenarios.json` descrive poi **100 scenari di conferma**, ciascuno con:

- combinazione dimensionale;
- descrizione d’uso;
- alternativa lessicale respinta;
- rifattorizzazione del componente interessato;
- pattern di progressive disclosure;
- invarianti attesi.

Esito richiesto e ottenuto dal test locale:

```text
M                         134
M + 100                   234
novità dopo M             0
contraddizioni dopo M     0
```

La saturazione è bounded rispetto al modello dichiarato. Non dimostra l’assenza universale di futuri difetti, nuovi dati esterni, cambiamenti dei browser o problemi di deployment.

## Standard di riferimento

La slice usa come criteri progettuali:

- **WCAG 2.2**: relazioni informative, reflow, ordine del focus, titoli ed etichette, dimensione minima dei target, identificazione coerente, etichette e istruzioni;
- **WAI-ARIA Authoring Practices**: comportamento di accordion e dialoghi;
- **HTML Living Standard**: semantica di `details/summary`, `dialog`, `form`, `label` e controlli nativi;
- **GOV.UK Design System**: progressive disclosure e raccolta di informazioni in passaggi comprensibili.

Questi riferimenti guidano l’implementazione; la slice non dichiara conformità certificata a tali standard.

## Definition of Done

La DoD è materializzata nel modello e verificata dal test. In sintesi:

- sei fasi presenti e senza conclusioni automatiche;
- una sola fase consigliata prominente;
- percorso completo disponibile su richiesta;
- tre passaggi di configurazione, uno aperto alla volta;
- campi essenziali prima delle istruzioni facoltative;
- label professionali e anti-overclaim;
- nessuna nuova chiamata API, capability o stato backend;
- reflow 320/390 px e zoom 200%;
- focus, nomi accessibili, movimento ridotto e colori forzati preservati;
- 100 scenari dopo M con novelty e contraddizioni pari a zero;
- PR mantenuta draft fino al superamento del journey server-backed sullo stesso HEAD.

## Evidenza e falsificazione

La DoD è falsificata se almeno una delle condizioni seguenti si verifica:

- due passaggi di configurazione risultano aperti contemporaneamente;
- un campo essenziale è collocato soltanto nella sezione facoltativa;
- il layer chiama un endpoint o modifica capability;
- la UI presenta la fase come stato di conformità;
- compare overflow orizzontale a 320 o 390 px;
- il focus non segue l’ordine visivo;
- una delle 100 perturbazioni introduce una nuova primitiva o contraddizione.
