# Audit user journey

## Monitoraggio normativo

### Journey amministratore

1. descrive il risultato da sorvegliare;
2. ICTC preserva l'intento;
3. l'AI propone il piano oppure il runtime dichiara il fallimento senza perdere l'intento;
4. l'amministratore revisiona, attiva, sospende o riprende con motivazione;
5. il runtime esegue e conserva ogni osservazione;
6. una nuova osservazione rende nuovamente candidata una fonte già decisa quando non coincide con l'osservazione oggetto della decisione precedente;
7. l'amministratore verifica o scarta una fonte con motivo legato al digest dell'osservazione corrente;
8. ogni write mostra receipt e il fascicolo collega missione, run, osservazioni e decisioni.

### Journey utente

1. consulta monitoraggi e catalogo senza controlli amministrativi;
2. aggiunge link, testo o file senza tassonomia obbligatoria;
3. vede che l'originale è salvo;
4. se l'AI fallisce, riprova soltanto l'arricchimento;
5. scarica il proprio fascicolo con identità coerente;
6. nei fascicoli pubblici delle fonti non vede materiale, metadati, autore o eventi di contributi altrui.

## Segnalazione

1. l'utente inserisce racconto e data di conoscenza;
2. il runtime preserva originale e allegati prima dell'AI;
3. AI Lens separa estrazioni e ipotesi;
4. Question Compass mostra una domanda, il perché e l'uso probatorio;
5. un suggerimento AI può essere adottato o corretto, e la relazione viene registrata;
6. la formulazione AI o manuale viene salvata come versione;
7. modifiche successive producono nuove versioni;
8. l'autore deve trasmettere il digest della versione corrente: digest assente o diverso blocca l'invio;
9. l'amministratore può chiudere soltanto con motivazione;
10. il fascicolo ricostruisce l'intero percorso.

## Criteri di esperienza

- completezza: entrambi i percorsi raggiungono un esito probatorio;
- robustezza: AI assente, retry, conflitto, restart, interruzione e fallimento parziale degli allegati non perdono l'originale;
- minimalità: uno/due dati iniziali e una domanda alla volta;
- chiarezza: ogni stato spiega disponibilità, azione successiva e limite;
- pervasività AI: piano, estrazione, suggerimento, sintesi e formulazione sono assistiti;
- autorità umana: attivazione, adozione, decisione, invio e chiusura restano umani;
- tracciabilità: 100% delle scritture con receipt; 100% delle chiamate AI riuscite con trace;
- privacy: materiale privato visibile soltanto all'autore e all'amministratore in lettura;
- lineage: la stessa fonte resta un unico oggetto quando identificatore o URL sono stabili, mentre ogni riosservazione resta append-only.

## Prove automatizzate

`v3/user-journey-audit.mjs` verifica proprietà statiche. `v3/v15-e2e.mjs`, `v3/v15-runtime-saturation.mjs` e `v3/browser-check.py` esercitano il runtime reale.

Queste sono simulazioni tecniche, non uno studio di comprensione con partecipanti umani. Il protocollo, le metriche e le soglie per la validazione moderata sono in `docs/HUMAN_USER_TEST_PROTOCOL.md`.
