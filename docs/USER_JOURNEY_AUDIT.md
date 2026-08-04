# Audit user journey

## Monitoraggio normativo

### Journey amministratore

1. descrive il risultato da sorvegliare;
2. ICTC preserva l'intento;
3. l'AI propone il piano oppure il runtime dichiara il fallimento senza perdere l'intento;
4. l'amministratore revisiona, attiva, sospende o riprende con motivazione;
5. il runtime esegue e conserva ogni osservazione;
6. l'amministratore verifica o scarta una fonte con motivo;
7. ogni write mostra receipt e il fascicolo collega missione, run, osservazioni e decisioni.

### Journey utente

1. consulta monitoraggi e catalogo senza controlli amministrativi;
2. aggiunge link, testo o file senza tassonomia obbligatoria;
3. vede che l'originale è salvo;
4. se l'AI fallisce, riprova soltanto l'arricchimento;
5. scarica il proprio fascicolo con identità coerente.

## Segnalazione

1. l'utente inserisce racconto e data di conoscenza;
2. il runtime preserva originale e allegati prima dell'AI;
3. AI Lens separa estrazioni e ipotesi;
4. Question Compass mostra una domanda, il perché e l'uso probatorio;
5. un suggerimento AI può essere adottato o corretto, e la relazione viene registrata;
6. la formulazione AI o manuale viene salvata come versione;
7. modifiche successive producono nuove versioni;
8. l'autore conferma il digest corrente;
9. l'amministratore può chiudere soltanto con motivazione;
10. il fascicolo ricostruisce l'intero percorso.

## Criteri di esperienza

- completezza: entrambi i percorsi raggiungono un esito probatorio;
- robustezza: AI assente, retry, conflitto, restart e interruzione non perdono l'originale;
- minimalità: uno/due dati iniziali e una domanda alla volta;
- chiarezza: ogni stato spiega disponibilità, azione successiva e limite;
- pervasività AI: piano, estrazione, suggerimento, sintesi e formulazione sono assistiti;
- autorità umana: attivazione, adozione, decisione, invio e chiusura restano umani;
- tracciabilità: 100% delle scritture con receipt; 100% delle chiamate AI riuscite con trace;
- privacy: materiale privato visibile soltanto all'autore e all'amministratore in lettura.

## Test sintetici

`v3/user-journey-audit.mjs` verifica 18 proprietà statiche. `v3/e2e-check.mjs`, `v3/runtime-journey-saturation.mjs` e `v3/browser-check.py` esercitano il runtime reale.
