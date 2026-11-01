# Governance ingegneristica

## Autorità

### Gerarchia delle prove per ricostruzione e ritiro

L'owner attuale e il comportamento del `main` prevalgono sulla descrizione di una PR storica. La genealogia delle PR può identificare intenzioni, dipendenze evolutive, regressioni e sostituzioni, ma non costituisce un'autorizzazione ad eliminare. La mancanza di import statici è un segnale di triage e non supera caricamento dinamico, URL pubblico, workflow, conservazione storica o claim unico.

La decisione di ritiro richiede un dossier con path e hash della preimage, prova del consumer testato, risultato della rimozione in ambiente isolato, outcome dei test, eventuale migrazione semantica e rollback. Fino a tale evidenza, il file resta conservato. Vedi [standard documentale](DOCUMENTATION_STANDARD.md), [Atlas](REPOSITORY_ATLAS.md) e [testing](TESTING.md).

`docs/authority-matrix.yaml` stabilisce quali file sono autoritativi, derivati o informativi.

## Decisioni

Le decisioni architetturali sono registrate in `docs/decisions/`. Una nuova ADR è necessaria per:

- modifica del modello di verità;
- nuova classe di claim o stato epistemico;
- cambio incompatibile di schema/API;
- introduzione di un nuovo storage autoritativo;
- ampliamento dell'autorità dell'AI;
- modifica sostanziale della sicurezza o della UX.

## Gate

- nessun merge con CI rossa;
- nessuna label end-user ambigua;
- nessun controllo UI privo di wiring;
- nessuna scrittura critica senza readback;
- nessuna modifica generata a mano;
- review obbligatoria per schema, API, auth e AI authority.

## Decisione e accettazione della review

La reviewer-readiness di una PR richiede evidenza E2 sull'exact-head: diff,
owner, predicati falsificabili, prove realmente eseguite, limiti e rollback.
`CONTRIBUTING.md` descrive l'handoff; la PR usa il template canonico.
L'approvazione **indipendente** e l'enforcement server-side di `main` sono
controlli GitHub E3-GOV distinti, da verificare live. Il maintainer può
integrare solo dopo gli obblighi applicabili; nessun documento o checker può
simulare l'esistenza di un altro reviewer umano.
