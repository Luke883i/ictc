# ICTC · audit UI/UX onto-epistemico delle procedure 1–5

Data: 2026-08-18  
Target: `main` post-merge PR #85, più gli screenshot reali forniti come seed negativi.  
Ambito: RN-01, EC-01, AO-01, MC-01, AP-01. RC-01/AR-01 restano regression surfaces. EP-01 è una vista epistemica cross-cutting, non un ottavo processo.

## Intenzionalità resa esplicita

Una procedura ICTC deve apparire come **un processo operativo guidato**, non come un cruscotto di dati né come un catalogo di capacità. Ogni superficie primaria deve rendere immediatamente rispondibili, nell'ordine:

1. dove sono e quale processo sto eseguendo;
2. quale oggetto sto governando;
3. quale decisione umana è richiesta adesso;
4. quale prova resterà dopo la decisione;
5. quale singolo passo viene dopo.

Una superficie o una CTA che non contribuisce a una di queste cinque funzioni è candidata a eliminazione o progressive disclosure. Una capacità runtime non deve essere eliminata solo per comprimere la UI: se è reale ma eccezionale viene spostata nel punto di fase corretto. Una CTA è falsa quando suggerisce un'autorità o un lifecycle diverso da quello del runtime che la riceve.

## Seed negativi dagli screenshot

Gli screenshot sono trattati come esempi reali di failure, non come rappresentazione esaustiva dell'HEAD corrente.

- Un reticolo epistemico con migliaia di atomi e categorie simultanee espone la struttura tecnica prima della domanda operativa. Il numero di atomi, hash, producer, revisioni e basis è prova tecnica, non orientamento primario.
- RN con molte card e quattro CTA affiancate (`Fascicolo`, `Rivedi piano`, `Sospendi`, `Esegui ora`) rende concorrenti navigazione, evidenza, amministrazione ed esecuzione; lo stato non determina la CTA dominante.
- RN con 100 piani e contenuti vendor/operativi mostra il rischio di confondere corpus di stress, sorgenti esterne e closed-world RN. Il DEMO anno-1 deve proiettare il cohort operativo, mentre il corpus di stress resta in persistenza/test.
- La ripetizione visuale delle quattro classi RN può essere ontologicamente corretta ma cognitivamente ridondante: le classi sono policy del perimetro, non necessariamente quattro decisioni simultanee per l'utente.

## Audit verticale per procedura

### RN-01 · Monitoraggio normativo e fonti

**A che cosa serve:** mantenere configurazioni di monitoraggio e verificare osservazioni pubbliche appartenenti alle quattro classi RN ammesse. Non decide applicabilità legale.

**Superfici necessarie:** entry/orientamento, lista monitoraggi, review piano, intake materiale, coda fonti candidate, decisione fonte. La lista non è il punto in cui sospendere, eseguire manualmente, scaricare prova e modificare contemporaneamente: deve servire a scegliere il monitoraggio. Le azioni eccezionali restano nel dialog di gestione.

**Finding:** l'azione `Esegui ora` è reale ma non deve essere CTA primaria permanente di una missione attiva; un monitoraggio attivo normalmente attende il proprio ciclo. Anche `Sospendi` è amministrazione eccezionale. L'AI setup è utility globale/opzionale e non deve dominare la procedura.

**Convergenza:** lista con `Apri monitoraggio` come unico ingresso primario; piano attivo senza falsa urgenza, con run/pause/prove in disclosure; piano draft/paused/errored con una sola CTA coerente (`Attiva`, `Riprendi`, `Riprova`). Sintesi e trace AI sono progressive detail. La verifica fonte resta il checkpoint umano.

### EC-01 · Eventi e quasi incidenti

**A che cosa serve:** preservare il racconto originale, chiarire unknown, confermare una formulazione e chiudere il fascicolo. Non decide obblighi di notifica o responsabilità.

**Superfici necessarie:** entry, intake, lista casi, domanda successiva, formulazione/versione, chiusura. Il percorso umano deve funzionare senza AI.

**Finding:** la workspace contiene molto materiale utile (originale, analisi AI, conferme, versioni, trace), ma se tutto è contemporaneamente aperto la domanda successiva perde priorità. Una bozza AI non deve diventare il percorso visivamente dominante rispetto alla formulazione manuale.

**Convergenza:** nella lista `Apri caso` è la CTA primaria e il dossier è secondario. Nella workspace restano visibili originale, stato e prossima domanda; analisi AI, conferme e cronologia sono disclosure. Quando le informazioni minime sono disponibili, `Salva versione manuale` è primaria e la bozza AI è un'opzione. Con una versione corrente la decisione primaria diventa `Conferma e invia caso`; dopo submission diventa `Chiudi caso`.

### AO-01 · Inventario governato

**A che cosa serve:** mantenere identità organizzative che meritano owner, fonte autorevole, versione, relazioni e riattestazione. Non è una CMDB universale e non inventaria requisiti/evidenze solo perché esistono.

**Superfici necessarie:** entry, creazione candidato, validation card, active/reattestation card, dossier secondario.

**Finding:** una card candidato mostrava simultaneamente dossier, `Valida` ed `Escludi`. La decisione positiva/negativa è legittima ma una sola deve dominare; inoltre il testo owner/fonte viene duplicato dai quattro fatti auditor-oriented aggiunti dal fine-tuning.

**Convergenza:** quattro fatti massimi (identità, fonte, responsabile, riesame). `Conferma oggetto` è CTA primaria del candidato; `Escludi dal registro` e dossier sono alternative/prove. Un oggetto attivo mostra `Riesamina oggetto` come primaria solo quando il riesame è dovuto; altrimenti è un'azione secondaria.

### MC-01 · Standard, requisiti e mapping

**A che cosa serve:** dichiarare concetti/requisiti, prendere una decisione umana di perimetro e poi decidere mapping/gap/rifiuto. Applicabilità, mapping ed efficacia sono tre cose diverse.

**Superfici necessarie:** entry, conteggi discreti, creazione proposta, decisione requisito-scope, decisione mapping, dettaglio concettuale progressivo.

**Finding critico:** il renderer mostra ancora `Copertura %` come KPI primario e offre `N.A.` insieme a `Mappato`/`Gap` come se fosse uno stato del mapping. Il runtime possiede però già l'owner corretto `/api/standards/requirement-scope`; `not-applicable` nel mapping è legacy compatibility e non deve essere creato dai write path correnti.

**Convergenza:** niente percentuale primaria; solo `Decisioni registrate`, `Gap`, `Da decidere`, `Fuori perimetro`. Se non esiste una decisione di scope compatibile, la CTA primaria è `Decidi perimetro`; la UI scrive nel runtime requirement-scope. Solo con scope `applicable` appare `Decidi mapping`, che apre una singola decisione fra `mapped`, `gap`, `rejected`. Gli atomi concettuali restano dettaglio.

### AP-01 · Azioni correttive

**A che cosa serve:** trasformare un'origine in un impegno adottato, eseguirlo, inviarlo a verifica e chiuderlo solo dopo verifica umana con evidenza.

**Superfici necessarie:** entry, creazione proposta, adozione, progressione state-aware, verifica, dossier secondario.

**Finding critico:** per azioni operative la card offre insieme `Avvia` e `Completa`, indipendentemente dallo stato. Più grave, il runtime reale `/api/grc/actions/:id/verify` implementa il checkpoint di chiusura con evidenza e motivazione, ma la workspace non espone alcuna CTA per `ready-for-review`: è una decisione reale orfana dalla UI.

**Convergenza:** `proposed → Adotta azione`; `open → Avvia lavoro`; `in-progress → Invia a verifica`; `blocked → Riprendi lavoro`; `ready-for-review → Verifica risultato`; `closed/cancelled → nessuna CTA mutante primaria`. La verifica usa l'endpoint reale, richiede motivazione, almeno un EvidenceRef/URL per chiudere e conferma esplicita in caso di self-review. `Completato` non diventa mai sinonimo di `chiuso`.

## Audit reticolare

Le cinque procedure devono potersi collegare senza diventare un unico lifecycle. Handoff e riferimenti possono conservare origine e creare review work; non importano la decisione sorgente. Le principali mutazioni vietate sono: RN osservato→applicabile, EC severo→notificabile, AO attivo→efficace, MC mapped→compliant, AP completato→chiuso.

EP-01 è un'altra classe di oggetto: è una vista tecnica sulla traccia registrata. Per evitare l'ottavo-processo visuale, il suo ingresso vive sotto **Postura ICTC**, non nel hub dei Processi di Compliance. Conteggi atomici, raw, producer, digest e basis sono tecnici e vengono subordinati alla navigazione umana.

## DoD estetico e cognitivo

- massimo una CTA primaria per card/dialog/fase;
- massimo una domanda materiale e quattro fatti prima della CTA;
- target interattivi >=44 px e focus visibile;
- griglia RN non oltre tre card dense su desktop standard;
- nessuna label generica `Drilldown`; le CTA nominano azione/oggetto;
- AI, dossier, cronologie, hash, revisioni, trace e alternative in progressive disclosure quando non sono la decisione corrente;
- `prefers-reduced-motion` rispettato;
- terminal state negativi non nascosti;
- nessuna percentuale di compliance/coverage come shortcut decisionale primario;
- 100% delle superfici censite deve avere purpose, fase, domanda, runtime read, eventuale write owner e prova/limite dichiarati.

## Falsificazione

Il runner dedicato esegue 100.000 mutazioni deterministiche per ciascuna delle cinque procedure più 100.000 mutazioni cross-procedure. La frontiera `M` è l'ultima nuova famiglia di failure normalizzata; `M+1000` usa seed indipendente e deve produrre zero novità. La frontiera `N` è l'ultima nuova famiglia di degradazione trovata tentando ulteriore compressione distruttiva; `N+1000` deve trovare zero semplificazioni sicure residue e zero nuove famiglie.

Il runner non pretende di simulare 600.000 utenti: varia sistematicamente autorità, fase, CTA, quantità di fatti, linguaggio, runtime binding, prova, cross-reference e vincoli estetici/cognitivi. È un test di robustezza del modello UI/UX, non user research.
