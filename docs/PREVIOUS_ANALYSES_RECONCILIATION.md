# Riconciliazione delle analisi precedenti

## Fonte autorevole

L'AS-IS è `main` dopo il merge della PR #12, commit di merge `08b75b1a6f263d9d7f52560328b8bfe806479e65`. La PR ha incluso cinque commit fino a `385e8016`. Le funzionalità descritte successivamente nei commenti della PR non sono considerate implementate.

## Intuizioni che hanno retto

1. ICTC gestisce soltanto monitoraggio normativo e segnalazioni.
2. I soli ruoli applicativi sono amministratore e utente.
3. La catena epistemica deve restare visibile: osservazione → proposta AI → adozione o decisione umana → prova.
4. Una sola azione primaria per contesto riduce ambiguità e click senza esito.
5. Originale, allegati, trace AI, decisioni e receipt devono essere ricostruibili.
6. Missing, empty, unavailable, failed, candidate e verified non sono equivalenti.
7. La saturazione deve scegliere M/N online, congelare le primitive e verificare soltanto dopo la tranche successiva.

## Derive da non ripetere

- Atlante, grafi, Projection Stack, persone, lenti e workspace come ontologia primaria.
- Dashboard cumulative che mostrano contemporaneamente stato, tassonomia, coda, grafo e dettaglio.
- Saturazioni che contano soltanto stringhe o primitive dichiarate dal test.
- AI che completa implicitamente una decisione umana.
- Test locali o commenti PR presentati come commit pubblicati.
- Workflow CI obsoleti mantenuti per inerzia, oppure un unico job che nasconde i fallimenti successivi.

## Eredità utile delle PR 1–10

Le analisi precedenti hanno prodotto proprietà ancora valide: OutcomeEnvelope, anti-overclaim, append/readback, receipt, integrità, safe state, accessibilità, una sola prossima azione, lifecycle degli incidenti, source lineage e test browser. Questa PR le riporta nei due processi attuali senza ripristinare le ontologie dismesse.
