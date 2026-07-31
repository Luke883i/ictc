# ICTC v3 local agent contract

- Treat every visible object as an OutcomeEnvelope projection.
- Keep observation, AI proposal, human review, decision and technical verification distinct.
- Do not hide open gaps or convert them into simulated capabilities.
- Every write path requires a human confirmation, persistence, readback and receipt.
- Run `node v3/gap-audit.mjs`, `node v3/ux-audit.mjs` and `node v3/enduser-simulation.mjs` after UI or runtime changes.
