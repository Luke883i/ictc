# Registro dei gap ICTC

La fonte canonica è `tests/contracts/gaps.json`; `public/gap-registry.json` è la sua proiezione esatta dei soli gap `open`. `tests/contracts/capability-truth.json` separa capability repository, debito interno e rail E3/E4 esterni.

## C1 — Consumer e writer: delimitazione della chiusura

La pre-PR C1 aggiunge una proiezione derivata del grafo source→adapter→handler→API→SQLite→browser e un oracle con ricevute HTTP per i sette processi. Il suo stato è leggibile in `artifacts/consumer-writer-convergence.json` dopo l'esecuzione e nei workflow già esistenti. Zero import relativi irrisolti non significa zero consumer esterni; più handler con lo stesso prefisso non significano automaticamente duplicazione di authority senza analisi del dispatch; il browser senza osservazione nativa non equivale a PASS. La `docs/convergence/convergence-authority.json` conserva in esclusiva la decisione terminale di C1 dopo evidenza su esatta HEAD. Nessun ritiro automatico di file o approvazione di release è consentito dal censimento.

## Lettura per CTO (nessuna nuova authority)

La [vista executive](../README.md#executive-view-per-cto--enterprise-candidate-non-enterprise-ready) e la [procedura RELEASE](RELEASE.md) instradano la decisione tecnica, ma **non** possiedono gli stati. Prima del GO/NO-GO leggere `tests/contracts/gaps.json` (gap), `audit/remediation-registry.json` (finding E2/E3/E4), `docs/convergence/convergence-authority.json` (slice) e i fatti live GitHub. `F-13/F-15` sono debiti E2; `GAP-012/022` richiedono E3; `GAP-007/009/014` richiedono E4. Nessun loro valore è calcolato dalla lunghezza di questo documento o dal verde della CI.

## Baseline e stato corrente

`TRUTH-0` e A6-UX4 restano **lineage storica** dentro `tests/contracts/capability-truth.json`; non sono un live pointer del registro gap. Lo stato dei gap è posseduto da `tests/contracts/gaps.json`, la projection pubblica contiene esattamente i soli gap `open`, mentre il sequencing corrente appartiene esclusivamente a `docs/convergence/convergence-authority.json`.

`GOV-ASIS-CONVERGENCE-1` riconcilia gap, remediation finding, conditional/serial slice e rail E3/E4 in una projection authority-zero. Non chiude né riapre debito e non sostituisce gli owner canonici. Una closure storica che ricompare senza transizione esplicita fallisce chiusa come `BLOCKED_REOPEN_WITH_EVIDENCE`.

## Traiettoria

Questo documento non replica più la “prossima slice” corrente. Il critical path e la next action sono letti dalla convergence authority a ogni ACT; congelarli qui ricreerebbe lo stesso drift che il debt compiler deve rilevare.

## Gap interni aperti

- **GAP-020 → S4-A6-CLOSE:** UX1-UX4 sono merged; restano la convergenza delle slice condizionali applicabili e il seal repository-bounded di assurance contraction.
- **GAP-021 → S5-CANDIDATE-SEAL:** evidence seal atomico su exact-head, solo dopo S4-A6-CLOSE.
- **F-13 → C3-CAPACITY-CONTRACT** e **F-15 → C4-AI-EVAL-DRIFT** restano non risolti nel remediation registry. La pre-PR aggiunge un **sotto-contratto E2 non terminale** per ciascuno: paginazione opt-in delle tracce e cursori role/revision-bound per F-13; enforcement versionato con blocco per drift/scadenza/sospensione per F-15. F-13 richiede ancora limiti di lavoro/memoria della proiezione completa e ulteriori misure di capacity; F-15 richiede dataset, misurazioni indipendenti, aggiornamento controllato delle finestre e prova di rollback esterna. `tests/verification/convergence-reticular-dod-check.mjs` ricostruisce il reticolo e fallisce chiuso con `--require-global`; non anticipare gli stati del workbook.
- **F-06 / C2-DELIVERY-PROVENANCE è repository-terminal (POST-216 ACT, 30/09/2026):** candidate e post-merge `main` hanno prodotto e verificato archive exact-head, CycloneDX SBOM, provenance, build/SBOM attestations e receipt repository-bound. Questa closure è E2 e non equivale a release, deployment o assurance esterna.

## Rail esterni che il repository non può auto-chiudere

- **E3-HUMAN:** GAP-012 / representative human + assistive-technology evidence.
- **E3-GOV:** GAP-022 branch protection/ruleset/review enforcement richiede osservazione live di GitHub; un file versionato non può auto-certificarne lo stato.
  - **POST-214 ACT (osservazione immutabile, 29/09/2026):** `main` ha riportato `protected=false`; i due ruleset repository attivi osservati (`GOV-01-1`, `GOV-01-2`) includono solo `refs/heads/GOV-01`, non `main`. Il dettaglio branch-protection ha restituito 403 all'integrazione, quindi controlli organization-level/non accessibili non sono esclusi. GAP-022 resta aperto; nessuna closure E3-GOV è inferita.
- **E4-DEPLOY:** GAP-007 scanner efficacy, GAP-009 identity effectiveness, GAP-014 production observability; ulteriori F-* E4 restano nel remediation registry.

Repository simulation, green CI e mutation counts non sostituiscono E3/E4.

## Regola di chiusura

Un gap repository-internal può chiudere solo con path di modifica/test, evidenza riproducibile e limitazione residua. Un gap E3/E4 resta aperto finché la relativa authority esterna non produce evidence osservabile. Il gate `tests/verification/capability-truth-check.mjs` verifica la parità gap canonico/pubblico, la capability lineage fino ad A6-UX4, il routing E3/E4, i blocker S4/S5 e il divieto di promozione prematura.
