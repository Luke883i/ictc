# ICTC 1.0 stable - global Definition of Done

## Global release gate
The release profile is `1.0_stable` only when every mandatory gate below is green on the same exact commit. Stable means stable bounded product semantics and distributable open-source packaging; it does not mean legal certification or production suitability for every deployment.

## G1 - Runtime semantic integrity
- Seven business-process identities are authoritative and unique.
- EV-01 remains a transversal proof surface, not an eighth business process.
- Each business process exposes a process-specific execution contract; no universal lifecycle is imposed.
- Human decision checkpoints remain human-authoritative and version-bound.
- Gap/N.A./unresolved, proposed/adopted, completed/verified-closed, inherent/residual and draft/approved remain distinct.
- Cross-process handoffs create explicit links/work and never silently rewrite a human decision.

## G2 - User experience compression
- Permanent navigation is exactly `Oggi / Processi / Prove`.
- There is exactly one full process catalog.
- Oggi shows only current work/attention plus a compact start-work affordance; it does not repeat the seven full cards.
- One primary action per context.
- No permanent header export control.
- Administration and AI configuration are contextual control-plane actions.
- Trusted-header identity does not expose a role switcher.
- Maximum disclosure depth is five.
- Raw hashes/audit/epistemic data are level 5; business status is level 1.

## G3 - Process-specific E2E promises
- RN-01: new observations invalidate stale source review semantics and preserve separate impact decisions.
- EC-01: required clarification plus current formulation digest are mandatory before submission.
- AO-01: object identity, authority, review and typed relation targets remain governable.
- MC-01: declared coverage preserves mapped/gap/N.A./unresolved distinctions.
- AP-01: execution cannot close an action; verified closure is distinct; cancellation is reasoned and auditable.
- RC-01: inherent precedes residual; treatment is a separate human decision; mitigation may originate an action without mutating the rating.
- AR-01: approval covers a complete disposition of the current response set; unknown question IDs cannot be approved.

## G4 - Experience scenario saturation
- Deterministic 1000 heterogeneous normal-use scenarios: zero critical findings.
- Deterministic 1000 adversarial scenarios: zero critical findings.
- Scenario dimensions include role, expertise, device, AI mode, identity mode, business intent, process, attention load and proof depth.
- Mutation discrimination score is 1.0 for stable experience invariants.

## G5 - Open-source distribution
- OSI-approved repository license with explicit license metadata.
- CONTRIBUTING, SECURITY, SUPPORT and governance/claim-boundary documentation are present.
- No repository wording claims certification, universal legal compliance or external assessor approval.
- Security reporting path is explicit.
- Release/deployment documentation separates software release status from deployment readiness.

## G6 - Regression and build
- Syntax check green.
- Existing runtime semantic rails required by the release remain green.
- Stable contract, process contract and 2000-scenario saturation gates green.
- Browser stable journey green for admin, contributor and auditor/trusted-identity presentation.
- No active UI composition imports historical or superseded process-catalog/home layers.

## Task DoD
A semantic slice is complete only when its claim is explicit; implementation changes only the necessary authority or presentation owner; a falsifier exists; unrelated process semantics remain unchanged; limitations are documented; and its tests pass on the exact slice commit.

## Subtask DoD
A subtask is complete only when the code is syntactically valid, deterministic where applicable, no duplicate authority is introduced, and the next slice does not need to compensate for hidden side effects from the subtask.

## Release score
The release score is pass/fail by mandatory gate, not an average. Optional enhancements can exceed the baseline, but no surplus in one area compensates for a failed mandatory gate. `100%+` therefore means all mandatory gates green plus documented optional hardening, never arithmetic masking of a failed invariant.
