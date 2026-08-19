# ICTC · sequential onto-epistemic journeys 2.2

## Rebase boundary after PR #86

PR #86 is now the canonical 1.6 presentation and decision owner for RN/EC/AO/MC/AP. This branch is intentionally narrower after rebasing: 2.2 adds explicit five-stage journey orientation, bounded list disclosure and the role-scoped user-owned RN runtime, but it does not recreate AO, MC or AP decision handlers.

The merge rule is single-owner first. AO completion remains in `ao-auditor-facts-1-4`; MC scope/mapping and AP verification remain in `procedure-ui-ux-1-6`. The sequential layer must contain no second generic decision dialog, no second MC/AP write CTA, and no EP relocation because those concerns are already governed on main.

## Incremental scope

- RN-01: journey guide, progressive list budgets, and real `/api/user/monitors` lifecycle for users with `manage-own-monitoring`.
- EC-01: journey guide and list containment only; the 1.6 human-first workspace remains authoritative.
- AO-01: journey guide only; canonical completion/review/attestation owners are reused.
- MC-01: journey guide only; applicability and mapping remain owned by 1.6 and the runtime requirement-scope/mapping endpoints.
- AP-01: journey guide only; state-aware transitions and verification remain owned by 1.6.
- EP posture: unchanged from main. 2.2 does not move or wrap the epistemic entry again.

## Regression invariants inherited from main

- exactly one material decision owner per runtime write;
- no `requirementLabel` fallback when resolving requirement scope for an incomplete mapping;
- completion is not closure; self-review acknowledgement is required only for a closing verification;
- CSP remains strict; the 2.2 stylesheet is same-origin and contains no inline-style dependency;
- canonical journey anchors re-run after the late 2.2 overlay;
- all existing browser, semantic, runtime, assurance and exact-head gates must remain green.

## Falsification boundary

The 100,000 deterministic mutation model remains an engineering falsification harness for presentation/authority failure families. It is not legal advice, compliance evidence, control-effectiveness assurance, certification evidence, or moderated usability research.
