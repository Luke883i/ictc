# ICTC agent contract

## Prime directive

Never turn an observation, extraction, score, AI proposal, mapping, receipt or computed state into a legal/compliance conclusion.

## Mandatory rules

1. End-user business objects consume the bounded projections/OutcomeEnvelope defined by the current runtime; raw storage entities do not become a second UI authority.
2. Statements preserve claim class, epistemic status, producer, inputs, timestamp, limitations and receipt reference where the contract requires them.
3. AI output is always `proposed`; only an authorized human action can produce human-reviewed or human-decided state.
4. No autonomous assistant write. Scheduled AI work may append proposals and machine receipts only within the declared policy.
5. Current local persistence is SQLite through `v3/sqlite-state-persistence.mjs`: mutable current `snapshot`, append-only `audit`, content-addressed `subject_payload`, append-only `subject_version` and `epistemic_step`. A legacy `state.json` may be imported and archived; it is not the current persistence authority. Do not describe ICTC as a fully event-sourced/reconstructible store unless executable proof establishes that stronger property.
6. UI write success requires the write contract's persistence/readback/receipt verification. Do not infer success from optimistic presentation alone.
7. Do not use compliance percentages, certainty scores or green/red legal verdicts as conclusions.
8. Generated files under `docs/generated/` and `artifacts/release-manifest.json` are not hand-edited.
9. Every PR states purpose, user journey, epistemic impact, DoD, checks, non-goals and material residual limits.
10. Presentation modes (Explore, raw, graph, PDF, XML, Markdown, ZIP) are representations of authorized data, never independent sources of truth.

## Read path

For a new contributor, **start with `docs/START_HERE.md`**. It is a routing page, not an authority. Before changing an authority, read `docs/authority-matrix.yaml` and the owner it identifies.

Read additional documents by responsibility instead of treating the whole `docs/` directory as mandatory:

- Product/epistemic changes: `docs/00_PROMPT_CLARIFICATION.md`, `docs/01_TO_BE_IDEA.md`, `docs/02_EPISTEMIC_CONTRACT.md`.
- UI/language changes: `docs/03_ENDUSER_LANGUAGE.md`, `docs/05_UI_OBJECT_MODEL.md`, `docs/06_INFORMATION_ARCHITECTURE.md`.
- Architecture/persistence: `docs/11_ARCHITECTURE.md`, `docs/authority-matrix.yaml`.
- AI: `docs/10_LOCAL_AI_CONTRACT.md`.
- Delivery/CI: `docs/13_DEVOPS_AND_CI_CD.md`, `docs/14_ITERATION_DOD.md`, `docs/TESTING.md`.
- Current development convergence: `docs/convergence/convergence-authority.json` and its derived `docs/convergence/ICTC_CONVERGENCE_AUTHORITY_ACTIVE.xlsx` projection.

Historical/candidate documents are useful for design lineage but do not override the current executable owner declared by the authority matrix. PR-specific historical DoDs do not become current convergence authority by recency.

## Convergence governance

11. Every PR targeting `main` declares `Trajectory impact` as exactly one of `planned | intentional-deviation | neutral | reconciliation` and declares `Convergence slice`.
12. `planned`, `intentional-deviation` and `reconciliation` changes to trajectory-sensitive surfaces update `docs/convergence/convergence-authority.json` and its active workbook projection together. A truly neutral PR uses `Convergence slice: NONE` and must not replan or rewrite the workbook.
13. A user-directed change outside the current workbook is allowed as `intentional-deviation`: preserve prior history, re-anchor to the exact PR base and re-plan forward. Do not reject a user decision merely because it was absent from the previous plan.
14. Never predict or embed a PR's own future head/merge SHA into the authority or workbook. Exact-head and exact-main facts are bound after they exist by Git/GitHub evidence and the untracked convergence receipt.
15. CI may verify the convergence authority and emit receipts; it must not gain `contents:write` or auto-commit to `main` to update the workbook.

## Free/private repository governance

16. `GOV-01F` is compensating control only while server-side branch protection is unavailable. Never describe `main` as protected unless GitHub itself reports active protection/enforcement.
17. Before proposing a merge, observe the exact PR HEAD and require all checks declared in `.github/gov-01f-policy.json` for that HEAD. After merge, observe new `main` and declared post-merge checks.
18. A direct push to `main` detected by GOV-01F is a governance breach: freeze runtime expansion, reconcile diff/evidence and do not erase history automatically.

## Runtime authority

19. Before changing runtime authority, read `docs/authority-matrix.yaml` and run `node v3/authority-contract-check.mjs`.
20. Executable runtime authority remains under `v3/`; do not create a parallel root/lib runtime owner without explicit migration decision and falsifier.
21. Seven business procedures remain seven. EP-01 is cross-cutting supervision, not an eighth business process.
22. Cross-procedure creation must authorize the source, target permission and target procedure policy, and must normalize the new object through the target's native initial-state contract.
23. Evidence formats are same-as-read and derive from the canonical evidence graph/dossier owner; no format may widen visibility or silently drop claim boundaries.

## TRAMA — adaptive engineering intake

24. Per ogni interazione che può cambiare prodotto, runtime, governance o traiettoria, esegui `node v3/trama-engineering.mjs --intent "<human intent>" --phase PLAN`. TRAMA è una proiezione derivata a authority zero: non sostituisce product truth, runtime truth, Git facts o convergence authority.
25. Compila l'intento umano in un IntentCard derivato; non chiedere alla persona di scegliere nodo tecnico, framework o cardinalità di mutation. Seleziona il minimo tier sufficiente tra 1k / 100k / 1M e scala solo su survivor o novelty.
26. Ricalcola ad ogni interazione il vicinato semantico: hard dependency closure, un hop inbound/outbound, owner/writer, oracle/evidence, human impact, deployment impact, derived artifact ed evidence invalidation. La roadmap precedente e una slice già iniziata restano ipotesi falsificabili.
27. Enterprise Candidate è un asintoto non auto-attestabile: TRAMA può esporre distanza e blocker, ma E3-HUMAN, E3-GOV ed E4-DEPLOY non si chiudono con CI o semantic mutation e `s5Seal` resta dell'authority canonica.
28. Dopo ogni esito PR e dopo il merge, esegui l'ACT: ricalcola traiettoria locale + globale, invalida evidence stale, assorbi/ritira candidati orfani e scegli la prossima slice semantica minima oppure fermati. Human business authority e human merge authority restano invariati.

## GOV-TRAMA-COMPASS-1 — AI development operating contract

29. Prima di ogni interazione materiale di sviluppo, TRAMA ricalcola confini **locale, intermedio e globale**, osserva gli owner correnti e compila Global/Intermediate/Local DoD prima del codice.
30. La regola di delega è: **AI owns engineering entropy**; l'umano possiede intento di prodotto e accettazione materiale. Non chiedere all'utente di scegliere nodo tecnico, framework o mutation budget quando il repository può derivarli.
31. Ogni slice deve convergere su una sola prossima azione o STOP/BLOCKED, riusando/estendendo owner esistenti prima di crearne altri, con nearest falsifier, rollback e stop condition.
32. Ogni mutazione semantica richiede una **documentation delta** selettiva e rigenera la **Bussola** `docs/ENGINEERING_COMPASS.md`; la Bussola è generated e non autoritativa.
33. Dopo tool fact, failure/verde PR e merge esegui ACT: invalida evidence stale, ricalcola traiettoria e non equiparare merge, release, Enterprise Candidate o E3/E4.
34. Orientamento operativo: `node v3/trama-engineering.mjs --intent "<intento umano>" --phase PLAN`; l'ACT usa lo stesso intento e gli owner correnti.

## GOV-TRAMA-RECONCILE-1 — stato osservato e GLOBAL_ACT

29. Una richiesta generica di prosecuzione (`ora`, `ora che si fa`, `prosegui`, `continua`, `what next`, equivalenti) significa **GLOBAL_ACT**: osserva nuovamente gli owner correnti, riconcilia locale/intermedio/globale, misura la distanza dalle DoD Enterprise Candidate e scegli esattamente una prossima slice oppure STOP.
30. Non continuare una roadmap solo perché era la roadmap precedente. Se executable evidence, finding, legacy census o authority corrente la falsificano, prima riconcilia lo stato.
31. Classifica ogni candidato legacy per ruolo attuale: `compatibility-required`, `migration-only`, `lineage-only`, `deprecated-test`, `retirement-candidate` oppure `blocking-unclassified`. L'ultima classe è fail-closed. Nome/versione/età non bastano per dichiarare un oggetto legacy.
32. Distingui sempre **repository-terminal** da evidenza esterna: E3-HUMAN, E3-GOV ed E4-DEPLOY non diventano chiusi perché una conditional slice è `done`.
33. La Bussola espone sempre tre orizzonti (locale, intermedio, globale), DoD granulari, blocker, incertezza e una sola next action. La Bussola è projection a authority zero.
