# Audit onto-epistemico della UI ICTC

## Esito

La UI precedente era corretta nei singoli componenti ma non nella composizione. Presentava contemporaneamente tassonomia di prodotto, Projection Stack, ActionFrame, toolbar, coda, grafo e scorciatoie globali. La stessa scelta era descritta più volte e il collegamento tra controllo visibile, oggetto runtime e route restava implicito.

Il problema non era estetico. Era onto-epistemico: una sovrabbondanza di proiezioni faceva apparire equivalenti oggetti con autorità diversa e aumentava il rischio che l’utente confondesse orientamento, osservazione, decisione e prova.

## Difetti eliminati

1. Ingresso module-first: richiedeva di conoscere l’architettura ICTC.
2. Tre guide concorrenti: Projection Stack, ActionFrame e journey rispondevano alla stessa domanda.
3. Densità iniziale elevata: percorso, contesto, limiti, prove e coda erano tutti espansi.
4. Wiring poco visibile: la CTA non dichiarava sempre oggetto SOT, stato prima/dopo e receipt attesa.
5. Persona ambigua: la lente poteva essere scambiata per un ruolo autorizzativo.
6. Falso completamento: i passi precedenti erano rappresentati con check pur essendo solo contesto derivato.
7. Visual test parziale: la preview poteva simulare una receipt senza provare una transizione reale.

## Nuovo principio

```text
persona scelta nel browser
→ incarico derivato dal bootstrap
→ un oggetto SOT o un intento umano esplicito
→ una sola azione primaria
→ checkpoint
→ route backend
→ append/readback
→ bootstrap aggiornato
→ receipt
```

La persona è una lente di presentazione. Non è identità, autenticazione, autorizzazione o prova di ruolo.

## Confini epistemici

- fonte presente ≠ fonte applicabile;
- differenza osservata ≠ materialità;
- decisione locale ≠ parere universale;
- mapping ≠ controllo efficace;
- owner confermato ≠ caso risolto;
- stato chiuso ≠ rischio residuo assente;
- receipt e hash ≠ verità sostanziale;
- runtime ready ≠ conformità o enterprise readiness;
- coda vuota ≠ completezza o assenza di rischio.

## Riutilizzo e rimozione

Sono riutilizzati server, API, ledger, OutcomeEnvelope, object index, route, release boundary, dialog, ricerca, assistente e checkpoint. Dalla composizione attiva sono rimossi Projection Stack universale, otto moduli come navigazione primaria, ActionFrame duplicati, balloon/grafo come home obbligatoria e check di completamento non prodotti da receipt.

Gli oggetti e le relazioni restano nel backend e nel dettaglio: vengono presentati soltanto quando servono all’incarico corrente.
