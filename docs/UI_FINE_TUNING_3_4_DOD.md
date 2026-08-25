# UI Fine-Tuning 3.4 — DoD

## Intent

La closure 3.4 è una **effective transitional presentation closure**, non una nuova authority permanente. Dopo le prime slice CAP-VIS, due responsabilità sono già state assorbite: **Process catalogue -> 3.2.1** e **global chrome -> Workspace Chrome 3.3**. Il residual 3.4 conserva soltanto landing continuity, Home work summary/actions ed Evidence presentation ancora da contrarre.

## Global DoD

- `workspace-chrome-3-3.css` possiede integralmente header/footer correnti.
- `semantic-workspace-closure-3-2-1.css` possiede integralmente la presentation del catalogo Processi.
- `workspace-finetuning-3-4.css` non contiene selettori stable chrome né `#procedureHub`.
- 3.4 non possiede business semantics, data, permissions, routing, procedure state o C0.1 participation.
- Una responsabilità assorbita da un owner canonico non può restare duplicata nel final cascade resolver.

## Task 1 — Header and footer — absorbed into 3.3

Gli invarianti introdotti da 3.4/3.4.1 sono preservati nel chrome owner 3.3: SVG inline, header navy/blue a tre stop, footer a tre stop, layout grid compatto, link target >=44px, hover/focus, responsive e forced-colors. `Candidate` resta assente.

Metrics: stable chrome selectors in 3.4 `0`; raster logo mounts `0`; header gradient stops `3`; footer gradient stops `3`; footer `Candidate` labels `0`.

## Task 2 — Landing continuity — residual 3.4

Home, Processi ed Evidenze condividono una landing luminosa tokenizzata. Questa responsabilità resta transitoriamente nel residual 3.4 e non modifica semantica, routing o state.

## Task 3 — Home summary and actions — residual 3.4

La Home conserva una sola superficie work-summary, separatori singoli e CTA inline `Apri` + SVG `arrow-up-right`, senza cambiare routing o process ownership.

## Task 4 — Evidenze ICTC — residual 3.4

Reticolo epistemico resta unico e first-row; Evidence landing è compatta; il Proof owner mantiene deduplica e ordine semantico.

## Task 5 — Process catalogue — absorbed into 3.2.1

Desktop: equal rows/equal height, quattro classi di figli canonici visibili e CTA allineata. Mobile: natural auto-height. `workspace-finetuning-3-4.css` contiene `#procedureHub` selectors = `0`.

## Reticular DoD

3.4 resta un final cascade resolver **soltanto per le responsabilità residuali**. Ogni assorbimento deve produrre negative authority delta: invarianti preservati, owner canonico esplicito, duplicazione rimossa dal resolver, nessuna nuova generazione CSS.

## Falsification

`v3/ui-finetuning-3-4-check.mjs` verifica sia l'output corrente sia il luogo di ownership: chrome in 3.3, catalogue in 3.2.1, residual landing/Home/Evidence in 3.4. La saturation 3.4 mantiene cinque campagne modellate da 1M trial; tali trial non sono browser session, code mutants indipendenti o user study.

## Checklist

- [ ] Stable chrome selectors nel residual 3.4 = 0.
- [ ] `#procedureHub` selectors nel residual 3.4 = 0.
- [ ] Header/footer correnti preservati in 3.3.
- [ ] Process catalogue invariants preservati in 3.2.1.
- [ ] Landing/Home/Evidence residual invariants preservati.
- [ ] Debt-preservation oracle assente.
- [ ] Nessun nuovo owner, layer, route, write authority o C0.1 participant.
- [ ] Current semantic rail e repository CI green prima del merge.
