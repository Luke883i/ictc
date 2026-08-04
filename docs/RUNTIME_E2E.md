# ICTC runtime e2e — tranche di implementazione

## Percorso amministratore

```text
apri ICTC
→ configura organizzazione, endpoint, modello, variabile segreta e prompt globali
→ crea un monitoraggio
→ definisci scope, tipi documentali, autorità, URL, frequenza e prompt opzionale
→ esegui o lascia schedulare il job
→ consulta elementi nuovi e aggiornati nel catalogo
```

La configurazione LLM è unica. Ogni job può sovrascrivere soltanto il prompt di censimento; endpoint, modello e policy dei segreti restano globali.

## Percorso utente — monitoraggio

```text
apri Monitoraggio normativo
→ consulta job e catalogo
→ aggiungi link, testo e/o documenti nello stesso form
→ attendi il successivo run
→ consulta le fonti candidate con provenienza e confidenza
```

## Percorso utente — incidente

```text
apri Incidenti
→ registra tipo iniziale e fatti
→ aggiungi date, servizi, impatto, indicatori, mitigazioni, contatti e file
→ genera una bozza AI
→ verifica e modifica la formulazione finale
→ invia
```

L'amministratore può chiudere una segnalazione già inviata. Non esistono transizioni decorative o passaggi senza dati.

## API essenziale

| Metodo | Percorso | Ruolo |
|---|---|---|
| GET | `/api/bootstrap` | entrambi |
| PUT | `/api/admin/settings` | admin |
| POST/PATCH | `/api/jobs` / `/api/jobs/:id` | admin |
| POST | `/api/jobs/:id/run` | admin |
| POST | `/api/contributions` | entrambi |
| POST/PATCH | `/api/incidents` / `/api/incidents/:id` | autore o admin |
| POST | `/api/incidents/:id/draft` | autore o admin |
| POST | `/api/incidents/:id/submit` | autore o admin |
| POST | `/api/incidents/:id/close` | admin |

## Robustezza

- persistenza JSON atomica con coda serializzata;
- allegati separati dal file di stato, limite 5 MB e SHA-256;
- timeout provider AI;
- deduplicazione del catalogo per identificatore, URL e titolo;
- stato del job `running`, `idle` o `error` con ultimo errore leggibile;
- permessi server-side per i due ruoli;
- proprietà delle segnalazioni verificata server-side;
- audit con attore, ruolo, azione, data e revisione;
- riavvio verificato dal test e2e.

## Saturazione 1..N e N+100

La simulazione runtime combina:

- 2 ruoli;
- 2 servizi;
- 3 intenti;
- 4 condizioni operative.

Risultato verificato da `v3/runtime-saturation.mjs`:

```text
N = 48
N + 100 = 148
primitive = 34
last novelty = 25
novelty after N = 0
```

## Definition of Done

- [x] due soli servizi visibili;
- [x] due soli ruoli applicativi;
- [x] configurazione LLM globale con prompt modificabili;
- [x] job schedulabili ed eseguibili realmente;
- [x] catalogo con tipi ontologici espliciti;
- [x] unico punto per contributi link/testo/file;
- [x] segnalazione con fatti, allegati, bozza AI e invio;
- [x] promemoria NIS2 chiaramente non decisionali;
- [x] permessi e ownership server-side;
- [x] persistenza atomica, digest allegati e audit;
- [x] saturazione M/M+100 e N/N+100;
- [x] e2e con provider AI mock, permessi, concorrenza e riavvio.
