# S5 — CLAIM-EVIDENCE-EXPORT

ICTC derives one bounded claim/evidence graph from the existing Store evidence bundle, S3 DecisionRecord and S4 epistemic projection. It adds no evidence store. Claims are runtime-practice claims only; every claim carries a limitation and `standardConclusion=not-assessed`.

Exports are current authorized view JSON/CSV plus bounded evidence ZIP. The ZIP contains manifest, subject, relations, decisions, epistemic posture, claims, audit subset, receipt projection, limitations and SHA-256 checksums. Every emitted claim must have reverse traversal to supporting evidence. Translation packs in S6 may map these claims to external frameworks but may not strengthen their conclusion.
