# ICTC 2.0 Enterprise Candidate — audit UI/UX, slice semantica e Definition of Done

## 1. Stato e confine della candidata

Questa slice parte da `main` dopo l’integrazione LDAP/Shibboleth e tratta le undici schermate fornite come evidenza osservativa primaria. La candidata interviene sull’ultimo strato UI, senza introdurre endpoint, permessi, decisioni o attestazioni che il runtime non possiede.

La proof package generata è una **certification-evidence candidate**: rende ispezionabili scopo, controlli, ruoli, prove, limiti e artefatti macchina. Non costituisce certificazione ISO, conformità legale, validazione di accessibilità, approvazione ministeriale né avallo di Garante o ACN. Tali esiti richiedono soggetti e procedure esterne.

## 2. Metodo falsificabile

L’audit combina:

1. osservazione delle undici immagini;
2. riconciliazione con DOM, CSS e controller;
3. riconciliazione con capability ed endpoint runtime;
4. modellazione delle journey umane attese;
5. trasformazione terminale e reversibile della UI;
6. browser proof con undici screenshot deterministici;
7. saturazione su dimensioni T esplicite fino a `M`, conferma `M+100` senza nuova primitiva;
8. compressione con un witness di irriducibilità per ogni invariante conservato.

Una modifica è accettata soltanto quando l’affermazione visiva corrisponde a una capacità reale del backend e il relativo controllo è osservabile in un test o artefatto.

## 3. Mining per immagine

### S01 — Panoramica auditor sintetica

**Problemi osservati**

- Titolo dominante rispetto al contenuto operativo.
- Due copie di orientamento comunicano la stessa distinzione fra processi.
- Le due card consumano quasi un viewport pur contenendo quattro numeri e due azioni.
- La prossima attività è parzialmente sotto la piega.
- “job” e “fascicoli” sono termini interni introdotti prima dell’oggetto comprensibile.
- Lo stato AI compete con l’informazione realmente utile all’auditor: la sola lettura.

**Fix**

- Titolo per ruolo: `Consulta attività e prove`.
- Lead unico, massimo 68 caratteri medi per riga.
- Card di processo compatte, con `ricerche attive`, `fonti da verificare`, `eventi aperti`, `eventi totali`.
- `Prossima attività` resa visibile nel primo viewport.
- Badge auditor: `Sola lettura`; lo stato AI resta nel titolo accessibile.

**Falsificatore**

La vista fallisce se un desktop 1440×1000 non mostra entrambe le aree e la prossima attività senza scorrimento, oppure se un’azione di scrittura è visibile all’auditor.

### S02 — Metodo auditor espanso

**Problemi osservati**

- Un solo disclosure contiene scopo, metodo, AI, autorità, prove, metriche e journey.
- Le righe hanno densità informativa molto bassa e altezze sproporzionate.
- La matrice non esprime una relazione stabile fra le colonne.
- L’apertura automatica per l’auditor trasforma una vista di consultazione in un muro di testo.

**Fix**

- Due disclosure indipendenti: `Come lavorare` e `Prove e responsabilità`.
- Nessuna apertura automatica.
- Metodo, effetto e checkpoint umano separati da AI, evidenza e accesso.
- Journey conservata dentro il gruppo metodo, non come terzo blocco concorrente.

**Falsificatore**

La vista fallisce se all’avvio esiste un disclosure aperto, oppure se metodo e proof non possono essere aperti separatamente.

### S03 — Autorità e stato auditor

**Problemi osservati**

- Metriche, autorità e limiti sono distribuiti in blocchi non contigui.
- Stringhe identità e digest non hanno un comportamento di wrapping evidente.
- “Sola lettura” è ripetuto in titolo, copy, badge e tabella.
- La tabella a due colonne spreca larghezza con contenuti corti.

**Fix**

- Autorità annidata in `Prove e responsabilità`.
- Identità, capability, effetti e tracce in griglia compatta.
- Copia read-only deduplicata; una sola etichetta primaria e dettagli subordinati.
- `overflow-wrap:anywhere` per identificatori e hash.

### S04 — Ricerca normativa utente

**Problemi osservati**

- `Job di ricerca e novelty` descrive l’implementazione, non il compito.
- `Job configurati` non è linguaggio universale.
- La card singola ha un’altezza da dashboard pur contenendo una riga di stato.
- Il fallimento di pianificazione è duplicato in pill e testo.
- `Evidenze` non indica se apre, scarica o verifica.
- Frequenza `Ogni 168h` e versione `v0` richiedono interpretazione tecnica.

**Fix**

- Titolo `Ricerche normative`.
- Sezione `Ricerche disponibili` o `Ricerche configurate` secondo il ruolo.
- Card compatta con nome, obiettivo, frequenza, prossima esecuzione e versione esplicitamente etichettati.
- Azioni `Apri dettaglio` e `Scarica prova`.
- Termini `novelty` e `baseline` conservati solo nella configurazione avanzata, con label italiane.

**Riconciliazione backend**

- La consultazione apre il piano esistente tramite `data-open-plan`.
- La modifica profilo rimane condizionata a `manage-monitoring`.
- La registrazione di materiale rimane condizionata a `contribute-source`.
- Nessun nuovo stato di missione viene inventato.

### S05 e S11 — Eventi utente, desktop e viewport alternativo

**Problemi osservati**

- `Registra e completa i fascicoli` presume un ciclo già iniziato.
- `Fascicolo evento` è un’astrazione documentale prima dell’oggetto umano: l’evento.
- L’empty state è alto e passivo.
- Contatore e heading sono visivamente separati.
- Il pulsante primario è sproporzionato rispetto al contenuto.
- La stessa struttura problematica persiste in due viewport: il difetto è invariante, non accidentale.

**Fix**

- Titolo `Eventi e incidenti`.
- Sezione `Eventi registrati`.
- CTA `Registra evento`.
- Empty state massimo 120px, con istruzione differenziata per capability.
- `Apri evento` e `Scarica prova` sulle card.
- Il termine fascicolo resta nel dettaglio, dove rappresenta correttamente l’insieme versionato.

**Riconciliazione backend**

La journey mantiene le fasi reali: intake, analisi differibile, chiarimenti, formulazione, conferma, invio e chiusura motivata. La UI non afferma che l’AI classifichi obblighi o verità.

### S06 — Guida e prove

**Problemi osservati**

- Il titolo è parzialmente coperto dalla navigazione.
- `Capire. Verificare. Decidere.` è una headline, non una destinazione operativa.
- La griglia mescola versione, ruolo, controlli, gap e regola senza una scala comune.
- Il contenuto utile inizia sotto un hero eccessivo.
- La pagina può essere letta come attestazione di conformità anziché come guida e prova del runtime.

**Fix**

- Titolo `Guida operativa e prove`.
- Lead che distingue capacità, controlli, evidenze e limiti.
- Label KPI: `Versione`, `Ruolo e accesso`, `Controlli applicativi`, `Requisiti di deployment`, `Integrità delle evidenze`, `Metodo di lettura`.
- `Apri dettagli` come azione secondaria.
- Claim boundary mantenuto e incluso nella proof macchina.

### S07 — Amministrazione, sintesi

**Problemi osservati**

- La griglia a due colonne crea quadranti vuoti e dipendenze verticali imprevedibili.
- Gli accordion `Apri` non dichiarano una destinazione o uno stato.
- La sintesi enterprise, i controlli e le configurazioni sono allo stesso livello.
- Non esiste un modello di navigazione stabile per una superficie lunga.

**Fix**

- Navigatore di sezione orizzontale e scrollabile.
- Una sola superficie amministrativa attiva alla volta.
- Sezioni: Sintesi, Controlli, Azioni richieste, Utilizzo AI, Governance AI, Accesso federato, Identità locali.
- Titolo `Amministrazione ICTC` e lead conciso.

### S08 — Controlli amministrativi

**Problemi osservati**

- Stati sulla destra risultano troncati.
- L’hash integrità è un identificatore non spezzabile.
- La colonna vuota permane mentre la lista cresce.
- `Verificato` e `Bloccante` dipendono fortemente dal colore.
- I controlli di identità, AI e integrità non hanno un contesto di sezione stabile.

**Fix**

- Superficie singola a larghezza intera.
- Stato testuale sempre presente.
- Wrapping di hash e identificatori.
- Righe a densità uniforme.
- Navigazione che mantiene il contesto Controlli.

### S09 — Utilizzo e governance AI

**Problemi osservati**

- Il pannello utilizzo vuoto occupa metà dello spazio.
- `Ambiente` può significare deployment, organizzazione o provider.
- `Classificazione` espone valori inglesi senza spiegazione.
- Il pulsante di salvataggio è distante dalla semantica dei campi.

**Fix**

- Utilizzo e Governance sono due sezioni navigabili, non colonne simultanee.
- `Nome ambiente`, `Classificazione dei dati`, `Responsabile del servizio`, `Modelli AI autorizzati`.
- Label opzioni italiane con valori runtime invariati.
- Azione di salvataggio locale al form.

### S10 — Identità locali su viewport stretto

**Problemi osservati**

- Il form di creazione precede la directory, anche se l’operazione è infrequente.
- Identità locali e federate possono essere interpretate come un’unica autorità.
- Il form consuma quasi tutto il viewport.
- Mancano un disclosure e una spiegazione del confine locale/legacy.

**Fix**

- Sezioni distinte `Accesso federato` e `Identità locali`.
- Lista corrente prima del form.
- Form dentro `Aggiungi identità locale`, chiuso di default.
- Spiegazione che Shibboleth deriva l’autorità da regole gruppo/utente e non dalla directory locale.

## 4. Problemi invarianti globali

1. **Gerarchia eccessiva dei titoli.** H1 fino a 3.8rem occupano spazio senza aumentare comprensione.
2. **Lessico implementation-first.** Job, novelty, baseline e fascicolo precedono ricerca, confronto, riferimento ed evento.
3. **Progressive disclosure monolitica.** Un disclosure raccoglie troppe categorie cognitive.
4. **Dashboardizzazione di dati scarsi.** Empty state e una singola card occupano superfici da grandi collezioni.
5. **Azioni distanti dall’oggetto.** Pulsanti collocati sul margine opposto o in colonne separate.
6. **Amministrazione senza information architecture.** Accordion in griglia non equivalgono a navigazione.
7. **Stato AI sovraesposto.** Per auditor e utenti manuali il badge persistente compete con il ruolo e il compito.
8. **Prova e certificazione non sufficientemente distinte.** Metriche interne possono sembrare un verdetto esterno.
9. **Identità federata e locale non separate.** Rischio di doppia fonte di autorità nella rappresentazione.
10. **Assurance visiva incompleta.** Il test 1.8 verificava DOM e budget, ma non produceva screenshot.

## 5. Slice runtime proposta

La slice è volutamente terminale e reversibile:

- `v3/public/ui/enterprise-2.js`: normalizzazione semantica, progressive disclosure, card operative e navigazione amministrativa;
- `v3/public/enterprise-2.css`: gerarchie, densità, responsive, zoom, focus, forced colors e reduced motion;
- `v3/enterprise-2-contract.json`: immagini, invarianti, journey, T-dimensioni e DoD;
- `v3/enterprise-2-check.mjs`: contratto statico e certification-evidence mapping;
- `v3/enterprise-2-saturation.mjs`: saturazione bounded fino a M+100;
- `v3/enterprise-2-compression.mjs`: witness di irriducibilità;
- `v3/browser-enterprise-2-check.py`: undici screenshot e journey browser;
- integrazione terminale in `app.js`, `styles.css`, `package.json` e CI.

La slice non modifica storage, API, permessi, audit event o semantica degli stati.

## 6. Journey attese

### Ricerca normativa — amministratore

`Panoramica → Nuova ricerca → scopo → perimetro → confronto temporale → piano proposto → revisione umana → attivazione → esecuzione → fonti candidate → decisione motivata → prova`

L’AI può proporre piano e candidati. Attivazione, verifica, esclusione e sospensione restano atti umani.

### Ricerca normativa — utente

`Panoramica → Ricerche normative → apri dettaglio → aggiungi materiale originale → conferma registrazione → segui stato → scarica prova`

L’utente non configura la ricerca e non attribuisce stato verificato.

### Ricerca normativa — auditor, consulente o certificatore

`Panoramica → Ricerche normative → piano/versione → esecuzioni → fonte → decisione e motivazione → trace AI → prova esportabile → limite`

Non sono visibili controlli di scrittura.

### Eventi — utente

`Panoramica → Registra evento → originale e allegati → informazioni mancanti → versione → conferma → invio → prova`

La UI parte dall’evento; il fascicolo è il contenitore versionato visibile nel dettaglio.

### Eventi — amministratore

`Registro eventi → originale/versioni → stato e prossima decisione → invio già confermato → chiusura motivata → prova`

### Amministrazione — amministratore

`Amministrazione → seleziona sezione → legge stato → apre dettaglio → modifica → prova/test → salva → receipt`

### Certificatore ISO o auditor ministeriale

`Claim boundary → controlli applicativi → gap deployment → identità e ruoli → catena evidenze → mapping standard → artefatti macchina`

La vista consente ispezione, non formula un verdetto di certificazione.

### Garante o ACN

`Perimetro → testo originale → actor e timestamp → versioni → decisioni umane → trace AI separata → integrità → limiti → export protetto`

## 7. T-dimensioni aggiunte

La saturazione include venti assi espliciti. Oltre a superficie, ruolo, stato, volume, viewport e input, aggiunge:

- audience: dipendente, consulente, auditor interno, certificatore ISO, ministero/regolatore, Garante/ACN;
- composizione documentale: sintesi executive, record operativo, mapping standard, claim boundary, proof macchina;
- terminologia: plain language, termine di dominio, riferimento legale, riferimento standard, stato-azione-effetto;
- zoom e text expansion;
- identity mode e AI state;
- evidence state e disclosure depth;
- carico cognitivo e sensibilità dei dati.

La procedura usa witness espliciti per ogni primitiva di rischio, un flusso deterministico di scenari e una finestra di stabilità. `M+100` deve introdurre zero nuove primitive. Il significato è limitato al modello dichiarato: non equivale all’assenza universale di futuri difetti.

## 8. Certification proof per dimensione

Ogni dimensione genera un mapping macchina `dimensione → stato → artefatti attestanti`:

- scopo e claim boundary;
- capability e ruoli;
- identità e accesso;
- autorità umana sull’AI;
- provenienza;
- versioni e receipt;
- controlli runtime;
- gap deployment;
- label semantiche;
- progressive disclosure;
- layout responsive;
- tastiera e focus;
- forced colors e reduced motion;
- lettura consulente/certificatore;
- ispezione autorità pubblica;
- artefatti macchina.

Lo stato usato è `candidate-evidence-present`, non `certified`.

## 9. Definition of Done completa

### Semantica e rappresentazione

- Tutte le undici immagini sono mappate a problema, fix e falsificatore.
- Titoli primari privi di `job`, `novelty` e `baseline` non spiegati.
- Ogni record mostra oggetto, stato, prossima azione, effetto e prova.
- `Evento` precede `fascicolo`; `ricerca` precede `job`.
- Il claim boundary è visibile e presente nell’artefatto macchina.

### Capacità reali

- Ogni write control corrisponde a una capability restituita dal server.
- L’auditor espone zero write controls.
- Accesso federato e directory locale restano due autorità rappresentate separatamente.
- Nessun endpoint o stato è inventato dal layer terminale.

### Gerarchia e carico cognitivo

- Un’intenzione primaria per superficie.
- Massimo un disclosure top-level aperto per scelta dell’utente.
- Metodo, proof e configurazione tecnica sono separati.
- Empty state non superiore a 120px nel budget di riferimento.
- Hero operativo non superiore a 260px nel desktop di riferimento.
- La prima azione è vicina all’oggetto cui si applica.

### Responsive, mobilità e accessibilità

- Nessun overflow materiale a 320px, 390px, mobile landscape e 200% text zoom.
- Target visibili almeno 44×44px.
- Ordine focus logico.
- Escape chiude i dialoghi e restituisce il focus all’invocatore.
- Forced colors preserva stato, selezione e focus.
- Reduced motion elimina animazioni non essenziali.
- Testo lungo e identificatori non spezzabili non vengono troncati.

### Assurance e saturazione

- `enterprise-2-check` verde.
- Saturazione su tutte le T-dimensioni fino a M e M+100 con novità zero.
- Compressione con un witness per ogni invariante.
- Browser journey produce undici screenshot con digest SHA-256.
- Artefatto certification proof copre tutte le dimensioni dichiarate.
- Contratti 1.4, 1.6, 1.7, 1.8, identity, runtime e security restano verdi.

### Delivery

- Slice lineare e reversibile.
- Branch separato da `main`.
- Nessuna PR aperta finché la candidata non è completa.
- La testa è definita pre-PR candidate; il passaggio a PR candidate richiede CI remota verde sullo SHA esatto.
