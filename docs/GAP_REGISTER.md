# Registro dei gap ICTC

La fonte canonica è `v3/gaps.json`; `v3/public/gap-registry.json` è la sua proiezione esatta dei soli gap `open`. `v3/capability-truth.json` separa capability repository, debito interno e rail E3/E4 esterni.

## Baseline corrente — TRUTH-0

TRUTH-0 osserva `main@5d129a49d0d7907847ff59a3c5fa7d85edb8b66a`, merge della PR #136 GOV-WB4. La più recente esecuzione runtime/presentation è PR #135 A6-UX4 su `main@f766fc064b0f8552f4821776755d72b56b757205`. L'`auditedAnchor` S0-S3 resta intenzionalmente PR #121 come fondazione storica lossless.

Le capability repository sono riconciliate da S1-S3, S4-A0..A5 e dalle execution unit **A6-UX1, A6-UX2, A6-UX3, A6-UX4**. Queste ultime sono merged, ma **non chiudono** il parent GAP-020. La release resta `candidate`; `enterpriseCandidate=false` e `enterpriseReady=false`.

## Prossima traiettoria e slice condizionali

La prossima barrier seriale dopo merge di TRUTH-0 è **SCOPE-0**. C1-C5 sono ora slice semantiche condizionali: C2 delivery provenance e C5 semantic-owner compression diventano eleggibili dopo TRUTH-0; C1 compatibility contraction, C3 capacity contract e C4 AI eval/drift/rollback dopo DECIDE-0. Tutte devono risultare `done` oppure `not-required` con authority+rationale+evidenceRef **prima** che S4-A6-CLOSE possa avanzare. S5-CANDIDATE-SEAL viene dopo, non prima.

## Gap interni aperti

- **GAP-020 → S4-A6-CLOSE:** UX1-UX4 sono merged; restano la convergenza delle slice condizionali applicabili e il seal repository-bounded di assurance contraction.
- **GAP-021 → S5-CANDIDATE-SEAL:** evidence seal atomico su exact-head, solo dopo S4-A6-CLOSE.
- **F-06 → C2-DELIVERY-PROVENANCE**, **F-13 → C3-CAPACITY-CONTRACT**, **F-15 → C4-AI-EVAL-DRIFT** restano non risolti nel remediation registry.

## Rail esterni che il repository non può auto-chiudere

- **E3-HUMAN:** GAP-012 / representative human + assistive-technology evidence.
- **E3-GOV:** GAP-022 branch protection/ruleset/review enforcement e independent governance evidence. GitHub osservato su `main@5d129a49d0d7907847ff59a3c5fa7d85edb8b66a`: `protected=false`.
- **E4-DEPLOY:** GAP-007 scanner efficacy, GAP-009 identity effectiveness, GAP-014 production observability; ulteriori F-* E4 restano nel remediation registry.

Repository simulation, green CI e mutation counts non sostituiscono E3/E4.

## Regola di chiusura

Un gap repository-internal può chiudere solo con path di modifica/test, evidenza riproducibile e limitazione residua. Un gap E3/E4 resta aperto finché la relativa authority esterna non produce evidence osservabile. Il gate `v3/capability-truth-check.mjs` verifica la parità gap canonico/pubblico, la capability lineage fino ad A6-UX4, il routing E3/E4, i blocker S4/S5 e il divieto di promozione prematura.
