# ICTC Journey-first UI — design a ritroso

## Idea astratta

Una persona non apre ICTC per usare il modulo Fonti. Apre ICTC per completare un incarico: qualificare una novità, prendere in carico un evento, ricostruire una prova, comprendere una decisione o diagnosticare il runtime.

```text
esito umano necessario
← decisione locale
← oggetto SOT pertinente
← proiezione per persona
← bootstrap runtime
← ledger e dominio
```

## Componenti E2E

### 1. Scelta dell’incarico

Domanda: “Che cosa devi completare adesso?”. La UI offre cinque button: Analista normativo, Responsabile evento, Auditor, Direzione e Operatore piattaforma. La scelta resta in localStorage, non scrive nel dominio e non concede permessi.

### 2. Intestazione della workspace

Dichiara persona, mandato e confine decisionale. Il contenuto proviene dal contratto `persona-journeys.json`, non dall’AI.

### 3. Journey

Mostra il passo corrente; il percorso completo è un disclosure. I passi precedenti sono contesto, non esiti certificati.

### 4. JourneyTask

È una proiezione deterministica di OutcomeEnvelope e stato di dominio. Contiene persona, oggetto o intento, scopo onto-epistemico, riferimento SOT, stato, why-here, conseguenza, anti-equivalenze, evidenza attesa e azione wired.

### 5. Attività corrente

Una sola CTA primaria nel viewport. Oggetto SOT e oggetti pertinenti sono strumenti secondari. Limiti, percorso e coda sono chiusi per default ma accessibili da tastiera.

### 6. Coda

Mostra altri JourneyTask derivati dalla stessa SOT. L’ordine è operativo e deterministico, non un risk score.

### 7. Dettaglio oggetto

`GET /api/objects/:id` alimenta tre tab: Significato, Provenienza ed Evidenza. Le frecce, Home ed End spostano il tab; il focus torna al trigger.

### 8. Checkpoint

Prima di ogni POST mostra stato prima/dopo, evidenza attesa e ciò che non viene concluso. Annullare non produce eventi.

### 9. Route, refresh e receipt

La conferma chiama una route esistente. La risposta deve contenere receipt/readback. Il client ricarica `/api/bootstrap`, ricalcola la journey e mostra la receipt restituita dal backend.

### 10. Prove e Sistema

Ledger sanitizzato, trace object, release, readiness e supply chain restano separati dalle decisioni di dominio. Integrità tecnica non equivale a verità o conformità.

### 11. Ricerca, comfort e assistente

Sono strumenti secondari. Ricerca usa `objectIndex`; comfort è locale; assistente opera sull’oggetto selezionato e sui vicini deterministici, senza write authority.

## Matrice persona → oggetto → azione

| Persona | Oggetti | Azioni |
|---|---|---|
| Analista normativo | source, finding, change, control | propose, review, decide, map |
| Responsabile evento | matter | report, confirm owner, transition |
| Auditor | oggetti con receipt, trace, ledger | sola lettura |
| Direzione | change e matter aperti | sola lettura |
| Operatore | release, integrity, runtime-stage | sola lettura, bundle locale |

## Riutilizzo

Il refactoring conserva server, API, ledger, projectors, object index, route, dialog, release boundary, ricerca, assistente e checkpoint. Cambia la composizione: il backend non viene duplicato e non nasce una nuova SOT.
