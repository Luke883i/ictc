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

## Required reads

- Product/epistemic: `docs/00_PROMPT_CLARIFICATION.md`, `docs/01_TO_BE_IDEA.md`, `docs/02_EPISTEMIC_CONTRACT.md`
- UI/language: `docs/03_ENDUSER_LANGUAGE.md`, `docs/05_UI_OBJECT_MODEL.md`, `docs/06_INFORMATION_ARCHITECTURE.md`
- Architecture: `docs/11_ARCHITECTURE.md`, `docs/authority-matrix.yaml`
- AI: `docs/10_LOCAL_AI_CONTRACT.md`
- Delivery: `docs/13_DEVOPS_AND_CI_CD.md`, `docs/14_ITERATION_DOD.md`, `docs/TESTING.md`
- Current convergence: `docs/PR60_GLOBAL_DOD.md`

## Free/private repository governance

11. `GOV-01F` is compensating control only while server-side branch protection is unavailable. Never describe `main` as protected unless GitHub itself reports active protection/enforcement.
12. Before proposing a merge, observe the exact PR HEAD and require all checks declared in `.github/gov-01f-policy.json` for that HEAD. After merge, observe new `main` and declared post-merge checks.
13. A direct push to `main` detected by GOV-01F is a governance breach: freeze runtime expansion, reconcile diff/evidence and do not erase history automatically.

## Runtime authority

14. Before changing runtime authority, read `docs/authority-matrix.yaml` and run `node v3/authority-contract-check.mjs`.
15. Executable runtime authority remains under `v3/`; do not create a parallel root/lib runtime owner without explicit migration decision and falsifier.
16. Seven business procedures remain seven. EP-01 is cross-cutting supervision, not an eighth business process.
17. Cross-procedure creation must authorize the source, target permission and target procedure policy, and must normalize the new object through the target's native initial-state contract.
18. Evidence formats are same-as-read and derive from the canonical evidence graph/dossier owner; no format may widen visibility or silently drop claim boundaries.
