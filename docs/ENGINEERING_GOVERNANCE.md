# Governance ingegneristica

## Autorità

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
