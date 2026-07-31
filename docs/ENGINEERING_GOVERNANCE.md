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
