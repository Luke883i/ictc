# S3 — LINEAGE-DECISION-BINDING

## Outcome

ICTC exposes one role-scoped DecisionRecord projection for epistemically meaningful human checkpoints without flattening their domain meaning. Source review, incident answer adoption, incident submission and incident closure remain distinct decision kinds but share actor, checkpoint, subject and exact subject-version binding.

## Compatibility and migration

No store rewrite is required. Existing persisted source decisions, incident answers, submission confirmations and closure fields are projected into the DecisionRecord schema. `legacyProjection=true` makes reconstruction explicit rather than pretending the historical records were originally written in the new envelope.

## Version binding

- source decisions bind `source-observation-sha256`;
- incident answer adoption binds the digest of the human answer and optionally the AI proposal digest;
- submission binds the confirmed formulation SHA-256;
- closure binds the submitted formulation version.

A later observation or formulation does not retroactively move an earlier decision to the new version.

## Authority topology

Every projected record has `authority=human`. AI proposal digests can be referenced but never become the decision actor. External master authority remains on internal source content/version and is not transferred to the human DecisionRecord.

## Relation grammar extension

S3 adds object/version, object/decision, decision/version, human/decision and version-supersession relations to the S2 grammar. These relations are reusable by the evidence graph in S5.

## DoD

- one DecisionRecord projection;
- source, answer-adoption, submission and closure remain separate kinds;
- exact version digest on every projected decision;
- role-scoped incident decisions do not leak to another user;
- historical records are marked as projected legacy rather than rewritten;
- AI cannot become decision authority by projection;
- bootstrap semantic ratchet exposes the decision projection;
- no new persistence store or router family.

## Weld to S4

S4 adds one epistemic-state projection over sources, AI proposals, human decisions and evidence availability. It must derive status from existing authoritative records and must not change the DecisionRecord actor or subject-version binding.
