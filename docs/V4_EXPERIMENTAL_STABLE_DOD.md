# ICTC v4_experimental_stable — Global Definition of Done

## Release boundary

`v4_experimental_stable` means the V4 semantic/product model is internally stable under the executable invariants in this document. It does **not** mean production readiness, legal compliance, certification, universal user comprehension, HA/DR or external-assessor approval.

## Global DoD

The candidate is globally done only when all four semantic slices are complete on the same exact PR HEAD and no slice weakens a predecessor falsifier.

1. **Assurance truth** — release evidence reports semantic uniqueness, dimension influence, pairwise/critical-triple coverage, frozen holdouts, mutation score and evidence grade. Raw loop counts cannot close a finding.
2. **Governance enforcement** — AI policy is enforced server-side; deployment readiness controls require bound, time-valid evidence and never become verified from boolean environment flags alone.
3. **Persistence & intake integrity** — no 10k audit ceiling; audit journal is not rewritten inside the mutable snapshot; legacy JSON is migration input only; attachment aggregate limits match transport; novice routing makes no false preservation promise.
4. **Native active experience** — Oggi/Processi/Prove exists in source HTML before JavaScript executes; active-experience does not create/remove permanent shell navigation; README/product/server/DOM release identity agree.
5. **Claim discipline** — browser automation may prove rendered behavior only. Human comprehension remains `not-assessed` until E4 evidence exists. Skipped checks are never counted as passes.
6. **Regression** — existing authority, decision, epistemic, evidence and role boundaries remain green; AI-disabled organization policy preserves all manual business paths.
7. **Exact-head acceptance** — PR exact HEAD must be observed after all commits; required workflows on that same SHA must be completed with no failure. Human merge authority remains external to this DoD.

## S1 — Assurance Truth & Stable Contract

### Task S1.1 — Replace cardinality assurance
- **DoD:** counted scenarios are semantically unique; all declared axes have measurable influence; pairwise and declared critical triples are complete; frozen holdouts pass; mutation score is 100%; report says E2, not E3/E4.
- **Subtask S1.1.a:** derive scenario count from active axes, never target a headline number. **DoD:** duplicate semantic signatures = 0.
- **Subtask S1.1.b:** measure influence. **DoD:** every active axis exceeds the declared minimum.
- **Subtask S1.1.c:** frozen holdout + mutation discrimination. **DoD:** every holdout passes and every declared assurance mutant is killed.

### Task S1.2 — Stabilize claim semantics
- **DoD:** stable release claim explicitly excludes production/legal/universal-human claims.
- **Subtask S1.2.a:** browser != human evidence. **DoD:** `human-comprehension` requires E4 in the machine contract.
- **Subtask S1.2.b:** skipped != pass. **DoD:** release checks use exact conclusions, not green-count aggregation.

## S2 — Governance Enforcement

### Task S2.1 — Server-side AI policy
- **DoD:** organization policy `enabled|disabled` is persisted, admin-authorized and checked inside the common AI call boundary before network access.
- **Subtask S2.1.a:** policy schema/default/normalization. **DoD:** old states migrate to enabled without changing manual flows.
- **Subtask S2.1.b:** fail-closed call boundary. **DoD:** direct AI call with disabled policy returns deterministic `ai-policy-disabled` before provider configuration/network.
- **Subtask S2.1.c:** auditability. **DoD:** policy changes produce normal write receipts.

### Task S2.2 — Deployment evidence binding
- **DoD:** TLS/storage/backup/malware/observability/dependency/accessibility verification requires deployment ID, issuer, observed/expiry timestamps, evidence URI and SHA-256 per control.
- **Subtask S2.2.a:** parser/validator. **DoD:** malformed, stale or unbound evidence yields blocker.
- **Subtask S2.2.b:** readiness projection. **DoD:** legacy boolean env flags alone can never produce `verified`.

## S3 — Persistence & Intake Integrity

### Task S3.1 — Separate snapshot from audit journal
- **DoD:** SQLite/WAL persistence stores mutable canonical snapshot separately from append-only audit rows; no artificial audit count ceiling; mutation durability remains readback-before-visible.
- **Subtask S3.1.a:** legacy migration. **DoD:** existing `state.json` imports once, preserving revision/audit hashes, then is not rewritten as the authority.
- **Subtask S3.1.b:** atomic mutation. **DoD:** snapshot update + one audit insert occur in one transaction and read back before publication to memory.
- **Subtask S3.1.c:** capacity regression. **DoD:** a test crosses revision 10,000 without `audit-capacity`.

### Task S3.2 — Make attachment promises transport-real
- **DoD:** browser/domain/server share an aggregate attachment byte limit compatible with JSON/base64 transport.
- **Subtask S3.2.a:** enforce aggregate budget in browser and store. **DoD:** over-budget sets fail before partial persistence.
- **Subtask S3.2.b:** copy truth. **DoD:** UI states both per-file and aggregate limits.

### Task S3.3 — Novice file routing truth
- **DoD:** routing text says the file is used only by name/context for routing and must be attached after the process is chosen; no preservation claim is made before actual persistence.

## S4 — Native Active Experience & Release Seal

### Task S4.1 — Native permanent shell
- **DoD:** source HTML contains exactly Oggi/Processi/Prove and a native `processesView`; JavaScript only renders state/content and cannot be required to create the permanent shell.
- **Subtask S4.1.a:** static fallback. **DoD:** disabling JS never exposes Home/Monitoraggio/Eventi as permanent navigation.
- **Subtask S4.1.b:** composition audit. **DoD:** active-experience fails if canonical shell is missing rather than silently rebuilding legacy DOM.

### Task S4.2 — SOT convergence
- **DoD:** README, product contract, server health/bootstrap and DOM use the same stable release identity and seven-process model.

### Task S4.3 — Global gate
- **DoD:** one global checker verifies S1-S4 structural invariants and the dedicated browser journey verifies native shell, AI policy OFF/manual continuity, attachment copy, proof/auditor paths and stable metadata.
