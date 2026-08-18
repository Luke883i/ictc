# User journey

Questo documento è l'owner canonico delle user journey business ICTC. Le sette procedure condividono una grammatica cognitiva minima — **Governa → Decisione umana → Prova che resta → Limite del processo → Handoff tipizzato** — ma non condividono oggetto, lifecycle o autorità decisionale.

## RN-01 · Monitoraggio normativo

**Governa:** osservazioni provenienti da sole quattro classi pubbliche: norme cogenti UE, norme cogenti italiane, provvedimenti/comunicazioni di autorità competenti, giurisprudenza e casi pubblici senza dati personali.

1. La persona definisce o apre un monitor limitato alle quattro classi ammesse come universo chiuso.
2. Il materiale entra da contributo umano (link/file/nota) oppure da scouting AI schedulato; entrambi attraversano la stessa policy server-side di classificazione RN-01 e l'AI produce soltanto fonti e fatti candidati con fonte indicata.
3. Titolo, labeling, sintesi, rilevanza e ambito proposti dall'AI restano proposte.
4. Una persona verifica fonte, identità/versione e qualità minima del materiale.
5. ICTC atomizza il materiale verificato in concetti/proposizioni collegabili mantenendo origine e limiti.
6. Una persona decide rilevanza e impatto operativo; osservazione e applicabilità restano distinte.
7. Se serve lavoro in un'altra procedura, ICTC crea soltanto un draft tipizzato con provenienza.

**Limite:** osservare, estrarre o collegare una fonte non stabilisce applicabilità legale, completezza del diritto o conformità.

## RN-01 · Fonte manuale

1. L'utente inserisce link o file e una nota.
2. ICTC conserva originale, provenienza e checksum.
3. Se l'AI è attiva propone titolo, labeling, sintesi, rilevanza e ambito senza promuovere la fonte; un item fuori dalle quattro classi RN-01 non entra nel catalogo RN come candidato.
4. Una persona include/esclude o richiede chiarimenti.
5. La decisione genera persistenza, readback, receipt e aggiornamento della proiezione.

## RN-01 · Scouting schedulato

1. La persona configura obiettivo, frequenza e vincoli nel popup scheduler interno.
2. Il runtime esegue il meta-prompt di mining solo nel perimetro RN-01 e richiede fatti verificabili con fonti.
3. L'esecuzione produce candidati; nessuna fonte viene auto-verificata e nessuna applicabilità viene decisa.
4. Differenze e candidati entrano nella stessa coda di review delle fonti umane.
5. La persona decide fonte, rilevanza e impatto.

## EC-01 · Eventi e segnalazioni

**Governa:** un event case con narrazione originale e tempo di awareness preservati.

1. La persona registra ciò che è accaduto; l'originale non viene sostituito da una formulazione successiva.
2. ICTC presenta una sola domanda materiale alla volta per separare fatti, assunzioni, unknown e informazioni mancanti.
3. L'AI, se attiva, può proporre una formulazione; resta distinta dall'originale e dai fatti confermati.
4. Una persona conferma o corregge la formulazione operativa.
5. Eventuali handoff creano lavoro tipizzato in AO/RC/AP/AR senza trasferire qualificazioni o doveri legali.
6. La chiusura richiede una disposition umana motivata e conserva versioni, conferme e prova.

**Limite:** classificazione operativa, severità o chiusura non determinano automaticamente obblighi di notifica, responsabilità o rilevanza regolatoria.

## AO-01 · Inventario

**Governa:** identità organizzative governate — sistemi, servizi, dati, fornitori, processi, policy, controlli e altri oggetti del declared universe.

1. La persona crea o riceve un candidato identificabile.
2. Prima dell'attivazione vengono legati fonte autorevole e accountable owner; ciò che manca resta gap visibile.
3. La persona caratterizza criticità con basis esplicita e collega dipendenze tipizzate.
4. Una persona valida l'identità come attiva, la respinge o la porta a stato terminale coerente.
5. Le attestazioni successive riesaminano identità, fonte, ownership e relazioni sulla versione corrente.
6. Auditor e reviewer leggono prima identità, fonte autorevole, owner, stato/review e relazioni; edit e traccia tecnica sono secondari.

**Limite:** presenza nel registro non prova completezza dell'ambiente reale, correttezza dei sistemi master o efficacia di un controllo.

## MC-01 · Controlli e copertura

**Governa:** standard, norme/requisiti dichiarati, concetti atomizzati e mapping nel perimetro organizzativo dichiarato.

1. La persona seleziona il riferimento e la versione/provenienza disponibile.
2. Registra separatamente uso organizzativo del framework e decisioni di scope/applicabilità dei requisiti.
3. ICTC presenta astrazioni minimali ma complete: riferimento, concetto, intento, esito atteso, domanda di evidenza, scope, fonte e versione.
4. La persona propone o riesamina mapping verso oggetti/controlli, con rationale e base osservabile.
5. Mapping, gap, rifiuto e crosswalk rimangono decisioni distinte da efficacia e conformità.
6. Un gap può creare un draft AP-01; nessuna remediation viene creata come conclusione automatica.

**Limite:** catalogo, scope, mapping o crosswalk non stabiliscono applicabilità legale, equivalenza, certificazione o efficacia del controllo.

## AP-01 · Azioni correttive

**Governa:** un impegno di remediation dalla sua origine alla verifica di chiusura.

1. L'utente vede insieme perché l'azione esiste, chi ne risponde, risultato atteso e prossimo checkpoint.
2. Una persona adotta/prioritizza l'impegno e assegna owner e scadenza.
3. Il lavoro procede con aggiornamenti e blocker espliciti.
4. Il completamento produce evidenza e porta alla review; non chiude l'azione.
5. Un checkpoint di verifica distinto riesamina risultato ed evidenza e decide chiusura o rework. Se chi verifica coincide con chi ha completato il lavoro, la self-review richiede acknowledgement esplicito e resta tracciata come tale.
6. Cancellazione e altri terminali negativi richiedono una ragione e non generano remediation ricorsiva automatica.

**Limite:** `done` o “lavoro completato” non significa chiusura verificata; priorità e closure restano decisioni umane e la self-review dichiarata non equivale a verifica indipendente.

## RC-01 · Rischi compliance

**Governa:** scenario di rischio, valutazioni umane inerenti/residue, trattamento e riesame.

1. La persona formula uno scenario e collega solo riferimenti espliciti a oggetti, controlli, azioni o requisiti.
2. Una persona registra probabilità e impatto inerenti con rationale; lo score è derivato per priorità interna.
3. Una persona decide trattamento, owner e data di riesame.
4. Le azioni collegate restano AP-01 e non ereditano il rating come verità.
5. Dopo il trattamento una persona può registrare una valutazione residua separata.
6. Il rischio resta soggetto a riesame periodico anche se il trattamento è stato eseguito.

**Limite:** matrice e score non misurano probabilità oggettiva, rilevanza legale o conformità.

## AR-01 · Questionari e verifiche

**Governa:** richiesta di assurance/questionario e set di risposte versionate con evidenze e limiti.

1. ICTC preserva la richiesta originale e la sua provenienza.
2. Le domande ricevono disposition esplicita; unknown, N/A interno e impossibilità di rispondere restano visibili.
3. Persona o AI possono preparare una bozza; l'AI non approva e non determina sufficienza probatoria.
4. Ogni risposta lega evidenze e limitazioni mantenendo same-as-read.
5. Una persona approva una specifica versione di risposta.
6. Follow-up o gap generano draft tipizzati in altre procedure senza trasformare l'approvazione interna in assurance esterna.

**Limite:** una versione approvata internamente non costituisce assurance indipendente, certificazione, conformità o sufficienza universale dell'evidenza.

## Invarianti trasversali di esperienza

- La prossima azione significativa deve essere comprensibile senza leggere history, hash, tracce AI o provenance raw.
- Ogni contesto decisionale ha al massimo una primary action; azioni di prova, dettaglio e navigazione restano secondarie.
- Workflow state, evidence state e significato sostantivo non condividono una sola etichetta di stato.
- L'AI appare nel percorso primario solo quando cambia il prossimo compito di review; configurazione e tracce sono progressive disclosure.
- Gli handoff cross-procedura creano soltanto draft/review work compatibili con il target e non trasferiscono decisioni.
- Auditor mode privilegia identità, autorità, owner, versione, review ed evidenza prima degli affordance di modifica.
- Stati terminali negativi sono esiti validi e non implicano remediation automatica.
