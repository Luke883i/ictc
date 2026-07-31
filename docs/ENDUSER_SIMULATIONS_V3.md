# Simulazioni end-user v3

## Profili simulati

Dipendente che segnala, process owner, compliance specialist, Legal, DPO, CISO, incident manager, auditor, direzione, amministratore, utente mobile e utente con riduzione del movimento o sola tastiera.

## Simulazioni canoniche

1. L’utente non sa da dove iniziare e sceglie una domanda in Oggi.
2. Vede una differenza ma non conosce la fonte: apre balloon e catena.
3. Carica un PDF: il file resta candidato e la review è esplicita.
4. Un job non trova differenze: nessuna proposta AI viene prodotta.
5. Un job trova una differenza: la proposta non viene promossa.
6. Una review rilevante apre una change story.
7. La decisione richiede azione e viene richiesto il mapping astratto.
8. Un controllo è mappato, ma la UI non dichiara efficacia.
9. Un dipendente segnala un evento senza conoscere la categoria.
10. L’owner conferma RACI e avanza una fase alla volta.
11. L’auditor apre trail e ledger senza vedere payload sensibili.
12. L’assistente spiega l’oggetto selezionato senza ampliare il contesto.

## Fallimenti simulati

API indisponibile, hash-chain incoerente, file oltre limite, URL non valido, transizione non consentita, sessione AI scaduta, oggetto non trovato, browser senza animazioni, reduced motion e viewport mobile.

## Gate

```bash
./ictc-v3.sh audit
node v3/saturation.mjs
```

L’audit verifica scritture, readback, receipt, change story, mapping, owner/RACI, transizione e assistente read-only. Il gate di saturazione combina ruolo, intento, contesto e disturbo fino allo scenario M+100.
