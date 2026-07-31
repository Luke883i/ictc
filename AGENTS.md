# ICTC agent contract

## Prime directive

Never turn an observation, extraction, score, AI proposal or computed state into a legal conclusion.

## Mandatory rules

1. Every end-user object consumes an `OutcomeEnvelope`; raw domain entities are not rendered directly.
2. Every statement carries a `claimClass`, `epistemicStatus`, producer, inputs, timestamp, limitations and receipt reference.
3. AI output is always `proposed`; only a human action can produce `reviewed` or `decided` state.
4. No autonomous write by the assistant. Scheduled AI jobs may append proposals and machine receipts only.
5. The local ledger is append-only. UI success requires persistence, readback and receipt verification.
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
