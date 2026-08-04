# ICTC

ICTC gestisce due soli processi:

1. **Fonti normative** — l'amministratore descrive l'obiettivo di sorveglianza, l'AI propone un piano, il runtime esegue i monitoraggi e le persone verificano o scartano le fonti candidate.
2. **Segnalazioni** — l'utente registra il racconto originale e la data di conoscenza, l'AI evidenzia fatti e gap, il sistema pone una domanda motivata alla volta e l'utente conferma la formulazione finale.

I soli ruoli sono `admin` e `user`.

## Avvio

```bash
npm ci
./ictc.sh start --no-open
```

Aprire `http://127.0.0.1:4173`.

## Provider AI

La UI amministrativa configura endpoint, modello e nome della variabile d'ambiente contenente la chiave. La chiave non viene salvata nel runtime.

```bash
export ICTC_LLM_API_KEY='...'
```

Gli endpoint privati richiedono esplicitamente `ICTC_ALLOW_PRIVATE_AI=1`.

## Verifica

```bash
npm test
```

Il gate verifica contratto, rilevanza delle domande, UI progressiva, saturazione `1..M` e `M+100`, ricevute, catena hash, conflitti, allegati, fascicoli ed end-to-end con provider AI mock.

## Confini

ICTC non determina applicabilità, conformità, significatività o obblighi di notifica. I risultati AI sono piani, estrazioni e bozze da verificare. La catena hash locale non equivale a firma qualificata o marcatura temporale certificata.
