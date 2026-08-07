# ICTC agent contract

## Prime directive

Never turn an observation, extraction, score, AI proposal or computed state into a legal conclusion.

## Mandatory rules

1. Every end-user object consumes an `OutcomeEnvelope`; raw domain entities are not rendered directly.
2. Every statement carries a `claimClass`, `epistemicStatus`, producer, inputs, timestamp, limitations and receipt reference.
3. AI output is always `proposed`; only a human action can produce `reviewed` or `decided` state.
4. No autonomous write by the assistant. Scheduled AI jobs may append proposals and machine receipts only.
5. The current local SOT is mutable `state.json` managed by `v3/store.mjs`, with hash-linked audit records. Do not describe canonical state as append-only, reconstructible from events, or state-bound to the audit chain unless executable proof exists. UI success for a write requires persistence, readback and receipt verification.
6. Do not use compliance percentages, certainty scores or green/red verdicts as legal conclusions.
7. Generated files under `docs/generated/` and `artifacts/release-manifest.json` are not hand-edited.
8. Every PR states purpose, user journey, epistemic impact, DoD, checks and non-goals.

## Required reads

- Product work: `docs/00_PROMPT_CLARIFICATION.md`, `docs/01_TO_BE_IDEA.md`, `docs/02_EPISTEMIC_CONTRACT.md`
- UI work: `docs/03_ENDUSER_LANGUAGE.md`, `docs/05_UI_OBJECT_MODEL.md`, `docs/06_INFORMATION_ARCHITECTURE.md`
- Source work: `docs/07_SOURCE_ENRICHMENT.md`, `docs/08_SCHEDULED_SCOUTING.md`
- Incident work: `docs/09_INCIDENT_JOURNEYS.md`
- AI work: `docs/10_LOCAL_AI_CONTRACT.md`
- Delivery work: `docs/13_DEVOPS_AND_CI_CD.md`, `docs/14_ITERATION_DOD.md`

## Free/private repository governance

9. While GitHub server-side branch protection is unavailable, `GOV-01F` is a compensating control only. Never describe `main` as protected unless GitHub itself reports active protection/enforcement.
10. Before proposing a merge, observe the exact PR HEAD and require all checks declared in `.github/gov-01f-policy.json` for that HEAD. After merge, observe the new `main` SHA and the declared post-merge checks.
11. A direct push to `main` detected by `GOV-01F` is a governance breach: freeze runtime expansion, reconcile the diff/evidence, and do not erase history automatically.

## Runtime authority

12. Before changing runtime authority, read `docs/authority-matrix.yaml` and run `node v3/authority-contract-check.mjs`. The current executable runtime authority is under `v3/`; do not create a parallel root/lib runtime owner without an explicit migration decision and falsifier.
