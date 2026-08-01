# Design a ritroso: Monitoraggio e Incidenti

## Decisione di prodotto

La UI non parte da ruoli, moduli o astrazioni tecniche. Parte dai due servizi che l’utente cerca:

1. monitorare fonti e contenuti;
2. gestire incidenti e quasi incidenti.

Ogni elemento visibile deve soddisfare il contratto:

```text
input reale → oggetto persistito → uso nella UI → azione o lettura → evidenza verificabile
```

Un elemento privo di input, output o uso runtime è decorativo e deve essere rimosso.

## Monitoraggio programmato

### Idea astratta

Una fonte viene osservata nel tempo; il sistema conserva il contenuto, confronta la baseline e può chiedere a un provider AI una proposta delimitata. Una persona decide rilevanza e impatto.

### Oggetti

| Oggetto | Scopo | Creato da | Usato da |
|---|---|---|---|
| Monitoraggio | URL, frequenza, domanda di studio e prossima esecuzione | utente | scheduler e tabella monitoraggi |
| Fonte | origine e impronta del contenuto | configurazione o intake | finding e dettaglio |
| Blob testuale | contenuto osservato immutabile per digest | runtime | confronto e audit |
| Studio AI | proposta, modello, stato e limitazioni | provider configurato | finding e dettaglio |
| Finding | differenza revisionabile | confronto runtime | review umana |
| Decisione | impatto contestuale motivato | persona | collegamento a controllo |
| Controllo | relazione documentata | persona | reticolo e audit |
| Receipt | append e readback della scrittura | ledger | conferma e prova tecnica |

### UI

- `Nuovo monitoraggio`: crea fonte candidata e configurazione disattivata.
- `Rivedi la fonte`: condizione necessaria prima dell’attivazione.
- `Attiva monitoraggio`: registra frequenza e prossima esecuzione.
- `Esegui ora`: usa contenuto fornito o acquisizione remota configurata.
- tabella monitoraggi: fonte, stato, prossima esecuzione e stato AI;
- catena delle evidenze: monitoraggio o intake → fonte → differenza → decisione/controllo.

## Inserimento manuale

### Idea astratta

Una persona registra un URL o testo senza attribuirgli automaticamente autorità o applicabilità.

### UI e runtime

```text
Aggiungi fonte
→ POST /api/sources
→ blob e digest quando è testo
→ fonte candidata + finding
→ receipt
→ review umana
→ decisione e controllo quando rilevante
```

## Incidenti e quasi incidenti

Il percorso operativo sintetizza pratiche dominanti di incident handling: preparazione e reporting, triage/analisi, risposta, recovery e lessons learned. I riferimenti progettuali sono NIST SP 800-61 Rev. 3 e ISO/IEC 27035-1:2023 / 27035-3:2020. ICTC non dichiara conformità a tali standard.

### Oggetti

| Oggetto | Scopo | Creato da | Usato da |
|---|---|---|---|
| Caso | fatti originali, tipo iniziale, owner e stato | segnalante | tabella casi e transizioni |
| RACI | responsabilità confermate | owner | governance del caso |
| Evidenza di triage | classificazione, severità, scope, impatto, confidenza | team di triage | decisione di risposta |
| Evidenza di risposta | contenimento, eradication e comunicazioni | response team | recovery |
| Evidenza di recovery | stato servizio, validazione e monitoraggio residuo | service owner | closure review |
| Lessons learned | lezioni, follow-up e approvazione | owner/accountable | chiusura e miglioramento |
| Timeline | ordine delle decisioni e receipt | runtime | audit del caso |

### UI

```text
Segnala evento
→ Conferma responsabilità
→ Registra il triage
→ Avvia la risposta
→ Registra il ripristino
→ Chiudi e registra le lezioni
```

Ogni fase apre soltanto i campi necessari, impedisce salti di stato, produce receipt e aggiorna la stessa riga del caso.

## Progressive disclosure

Il primo viewport mostra:

- titolo del servizio;
- massimo due azioni di servizio;
- quattro indicatori descrittivi;
- una prossima azione;
- una tabella operativa;
- il reticolo o il percorso del caso.

Origine, produttore, ID, limiti e receipt complete sono disponibili nel dettaglio.
