# ICTC v3 local agent contract

- Treat every visible read object as a **canonical authority-bounded projection**, never as a raw persistence entity. Writes return OutcomeEnvelope/receipt; a read record does not need to be a literal OutcomeEnvelope schema instance.
- Keep observation, AI proposal, human review, decision, evidence and technical verification distinct.
- Do not hide open gaps or convert them into simulated capabilities.
- A business-authority write requires the authorized human checkpoint, persistence, readback and receipt; scheduled/system work may only perform the bounded machine writes explicitly allowed by policy.
- Prefer explicit `metadata.epistemicEffects` for materially epistemic writes. Action-name inference is compatibility only and must never promote AI output to human authority.
- New external evidence used at a decisive checkpoint must be version/digest-bound; observation timestamp alone is not decision-grade evidence identity.
- Cross-process creation produces a bounded native draft; do not bypass lineage depth/cycle guards or transfer source decisions.
- Run the current semantic/runtime suite and the relevant targeted checks after UI or runtime changes. Exact-head CI is the acceptance evidence for a PR.
