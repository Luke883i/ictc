# GOV-01F — Free/private compensating governance

## Perche esiste

Il repository ICTC e privato e il piano GitHub corrente non rende disponibili branch protection/ruleset con enforcement server-side. `GOV-01F` e quindi un controllo compensativo, non un sostituto equivalente della protezione del branch.

## Claim boundary

`GOV-01F` **non** puo impedire fisicamente all'owner di fare direct-push su `main`. Puo:

- imporre al percorso AI/engineering il lavoro su branch dedicato;
- produrre un check PR `governance-free-private`;
- verificare che un push su `main` sia associato a una PR realmente merged;
- rendere rosso il workflow dopo un direct-push non associato a PR;
- conservare evidenza JSON della verifica;
- consentire al project-control bundle di congelare nuove slice runtime finche una violazione non e riconciliata.

Un risultato verde GOV-01F non deve mai essere descritto come `protected=true`.

## Protocollo prima del merge

La PR deve avere base `main`, provenire da un branch `agent/`, `feat/`, `fix/` o `docs/`, e il suo HEAD esatto deve essere osservato prima del merge. Per convenzione progettuale, sullo stesso HEAD devono risultare verdi:

- `governance-free-private`;
- `contract-and-audit`;
- `runtime-e2e`;
- `browser-journeys`;
- `launcher-smoke`;
- `dependency-audit`;
- `assurance`;
- `browser`.

`codeql` non e incluso finche il repository non dispone della capability necessaria o di un SAST equivalente sempre attivo.

## Protocollo dopo il merge

Dopo il merge, osservare il nuovo SHA di `main` e richiedere sullo stesso SHA:

- `governance-free-private`;
- `contract-and-audit`;
- `runtime-e2e`;
- `browser-journeys`;
- `launcher-smoke`;
- `dependency-audit`;
- `evidence`.

Il check `governance-free-private` usa l'API GitHub `commits/{sha}/pulls` e fallisce se il nuovo commit di `main` non e associato a una PR merged verso `main`.

## Violazione rilevata

Un direct-push a `main` e un **governance breach**. Non riscrivere automaticamente la storia. Prima:

1. congelare nuove feature runtime;
2. osservare il diff rispetto all'ultimo `main` accettato;
3. eseguire suite e post-merge evidence sul nuovo SHA;
4. classificare l'effetto e decidere se revertire o accettare tramite una PR di riconciliazione;
5. registrare receipt e nuovo anchor.

## Limite residuo

Questo controllo riduce il rischio operativo ma non elimina il rischio di bypass da parte dell'owner. Se in futuro GitHub Pro/Team/Enterprise o un repository pubblico rendono disponibile la branch protection, `GOV-01` server-side torna preferibile e `GOV-01F` resta come evidenza supplementare.
