# Audit onto-epistemico

## Oggetti ammessi

### Monitoraggio

- intento umano preservato;
- piano AI versionato;
- missione attiva, sospesa o in errore;
- esecuzione;
- osservazione di fonte;
- fonte candidata;
- decisione umana motivata;
- receipt e fascicolo.

### Segnalazione

- racconto originale;
- allegato con digest;
- estrazione o ipotesi AI;
- domanda motivata;
- risposta umana e relazione con il suggerimento AI;
- versione della formulazione;
- conferma dell'autore;
- chiusura amministrativa motivata;
- receipt e fascicolo.

## Anti-equivalenze obbligatorie

- fonte osservata ≠ fonte applicabile;
- fonte candidata ≠ fonte verificata;
- confidenza AI ≠ attendibilità giuridica;
- estrazione AI ≠ fatto accertato;
- suggerimento AI ≠ risposta umana;
- versione salvata ≠ segnalazione inviata;
- data promemoria ≠ obbligo di notifica;
- hash integro ≠ verità o completezza;
- chiusura amministrativa ≠ assenza di rischio residuo.

## Gap riscontrati su main dopo PR #12

| Gap AS-IS | Rischio | TO-BE materializzato |
|---|---|---|
| il piano veniva richiesto all'AI prima di salvare l'intento | perdita dell'obiettivo in caso di provider assente | evento `monitoring.mission.intent.recorded` prima della chiamata AI |
| valori AI potevano eliminare domande obbligatorie | AI trasformata implicitamente in autorità | suggerimento precompilato, ma adozione/correzione umana obbligatoria |
| bozza generabile con domande aperte | formulazione apparentemente completa ma epistemicamente lacunosa | gate `questions-open` |
| testo finale modificabile e inviabile senza versionamento | impossibilità di ricostruire cosa è stato confermato | versioni SHA-256 e submit legato al digest corrente |
| fallimento AI senza retry guidato | journey bloccata nonostante originale salvo | stati `needs-plan`/`needs-enrichment`/`aiError` e retry delimitati |
| catalogo aggiornato per sovrascrittura | perdita di provenienza e storia | osservazioni append-only |
| motivazioni facoltative | decisioni non difendibili | motivo obbligatorio per fonte, pausa e chiusura |
| proiezione utente troppo ampia | leakage di prompt, endpoint e materiale altrui | proiezione least privilege |
| link fascicolo senza identità attiva | download incoerente con il ruolo UI | fetch protetto con header attore/ruolo |
| fascicolo poco collegato | prova frammentaria | related objects, manifest hash, versioni ed eventi |

## Gate

`v3/onto-epistemic-audit.mjs` verifica il rapporto tra contratto, ordine delle chiamate, stati, trace, versioni, privacy e fascicoli. Non prova verità giuridica o comprensione umana reale.
