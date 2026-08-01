# Audit onto-epistemico del testo end-user

## Regola

Ogni testo deve dire almeno una delle seguenti cose:

- che cosa è disponibile;
- che cosa deve fare la persona;
- che cosa cambierà;
- quale prova resterà;
- che cosa l’esito non significa.

Le stringhe che descrivono l’architettura ma non aiutano l’azione sono rimosse dalla superficie primaria.

## Inventario automatico

`v3/core-copy-audit.mjs` raccoglie:

- testo HTML;
- nomi accessibili, placeholder e title;
- attività generate per tutti gli stati monitoraggio/incidente;
- etichette e campi del contratto runtime.

Il gate fallisce per gergo interno, verdetti sintetici o azioni non inventariate. Gli stati successivi vengono generati mediante fixture varianti, così una label non passa soltanto perché esiste nel sorgente.

## Vocabolario principale

| Evitare | Usare |
|---|---|
| journey, SOT, projection | monitoraggio, caso, fonte, differenza, prova |
| job | monitoraggio |
| checkpoint | rivedi e conferma |
| readback | registrazione verificata |
| claim class | tipo di oggetto |
| compliant / safe | stato osservato, decisione registrata, limite |

## Stati

- `Da rivedere`: richiede decisione umana.
- `Attivo`: configurazione operativa, non completezza.
- `Completato`: esecuzione tecnica terminata, non rilevanza.
- `Non configurato`: capacità assente, non fallimento del contenuto.
- `Errore`: operazione non completata.
- `Registrato`: scrittura e rilettura riuscite.

## Limite

Il gate non controlla il testo inserito dagli utenti né le risposte arbitrarie dei provider esterni. Il runtime limita e delimita tali contenuti, ma la qualità sostanziale richiede governance umana.
