# Registro dei gap ICTC

La fonte canonica è `v3/gaps.json`; `v3/public/gap-registry.json` è la sua proiezione esatta dei soli gap `open`. `v3/capability-truth.json` separa capability repository, debito interno e rail E3/E4 esterni.

## Baseline e stato corrente

`TRUTH-0` e A6-UX4 restano **lineage storica** dentro `v3/capability-truth.json`; non sono un live pointer del registro gap. Lo stato dei gap è posseduto da `v3/gaps.json`, la projection pubblica contiene esattamente i soli gap `open`, mentre il sequencing corrente appartiene esclusivamente a `docs/convergence/convergence-authority.json`.

`GOV-ASIS-CONVERGENCE-1` riconcilia gap, remediation finding, conditional/serial slice e rail E3/E4 in una projection authority-zero. Non chiude né riapre debito e non sostituisce gli owner canonici. Una closure storica che ricompare senza transizione esplicita fallisce chiusa come `BLOCKED_REOPEN_WITH_EVIDENCE`.

## Traiettoria

Questo documento non replica più la “prossima slice” corrente. Il critical path e la next action sono letti dalla convergence authority a ogni ACT; congelarli qui ricreerebbe lo stesso drift che il debt compiler deve rilevare.

## Gap interni aperti

- **GAP-020 → S4-A6-CLOSE:** UX1-UX4 sono merged; restano la convergenza delle slice condizionali applicabili e il seal repository-bounded di assurance contraction.
- **GAP-021 → S5-CANDIDATE-SEAL:** evidence seal atomico su exact-head, solo dopo S4-A6-CLOSE.
- **F-06 → C2-DELIVERY-PROVENANCE**, **F-13 → C3-CAPACITY-CONTRACT**, **F-15 → C4-AI-EVAL-DRIFT** restano non risolti nel remediation registry.

## Rail esterni che il repository non può auto-chiudere

- **E3-HUMAN:** GAP-012 / representative human + assistive-technology evidence.
- **E3-GOV:** GAP-022 branch protection/ruleset/review enforcement richiede osservazione live di GitHub; un file versionato non può auto-certificarne lo stato.
- **E4-DEPLOY:** GAP-007 scanner efficacy, GAP-009 identity effectiveness, GAP-014 production observability; ulteriori F-* E4 restano nel remediation registry.

Repository simulation, green CI e mutation counts non sostituiscono E3/E4.

## Regola di chiusura

Un gap repository-internal può chiudere solo con path di modifica/test, evidenza riproducibile e limitazione residua. Un gap E3/E4 resta aperto finché la relativa authority esterna non produce evidence osservabile. Il gate `v3/capability-truth-check.mjs` verifica la parità gap canonico/pubblico, la capability lineage fino ad A6-UX4, il routing E3/E4, i blocker S4/S5 e il divieto di promozione prematura.
