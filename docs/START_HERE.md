# START HERE — orientamento ICTC

Questa è una mappa, non una nuova autorità.

## Percorso minimo

1. `README.md` — identità del prodotto, sette processi, tre reticoli, stack e boundary.
2. `AGENTS.md` — invarianti epistemici globali.
3. `docs/authority-matrix.yaml` — owner eseguibili.
4. `docs/11_ARCHITECTURE.md` — AS-IS logico/tecnologico.
5. `docs/02_EPISTEMIC_CONTRACT.md` — authority, version/basis, read/write UI boundary.
6. `docs/SEMANTIC_CLOSURE_2_8_DOD.md` — finding di secondo ordine e DoD corrente della slice.
7. `docs/TESTING.md` — falsificazione, mutation/saturation ed exact-head. Esegui `npm test` come verifica normativa corrente.

Se serve ricostruire una PR storica per capire l'owner corrente, la documentazione/authority matrix ha un gap: correggi la mappa invece di aggiungere un secondo owner.

## Vocabolario

Business: **Processi di Compliance**. EP-01 è cross-cutting, non ottavo processo. Evidenze ICTC non è una pagina di score. `procedure*` resta naming tecnico compatibile. OutcomeEnvelope va inteso secondo l'ADR amended: canonical read projections + write envelope/receipt, mai raw storage UI.

## Dove intervenire

| Obiettivo | Owner/partenza | Falsificazione minima |
|---|---|---|
| runtime/authority | authority matrix + runtime owner | targeted check + current suite |
| procedure | contract/adapter/policy + native runtime | contract/runtime/journey |
| rischio RC | `grc-risks` + dependency review | multi-cycle closure check |
| evidence ref | `reference-contract` | reference + integration check |
| cross-process | `procedure-dod` + `cross-procedure-create` | typed edge/lineage check |
| epistemic causality | `epistemic-step` + write metadata | causality check |
| shared UI | active experience + C0.1 lifecycle | constitution/UI exact-head |
| persistence | Store + SQLite persistence | durability/integrity |
| docs | README + AS-IS docs | documentation authority |

## Ordine delle fonti

1. owner eseguibile + authority matrix;
2. global/local AGENTS constraints;
3. architecture/epistemic/security/testing/development AS-IS;
4. candidate DoD;
5. trajectory e documenti storici.

I documenti storici conservano lineage e contesto, ma non sono autorità corrente.
La data più recente non crea authority da sola.
