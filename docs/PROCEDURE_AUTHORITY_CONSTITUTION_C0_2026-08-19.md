# C0 — Procedure Authority Constitution

Status: current engineering contract for the active UI composition. This document does not redefine business procedure ontology, runtime domain rules, legal applicability or external assurance.

## Purpose

C0 removes accidental authority created by UI stratigraphy. It is a semantics-preserving constitutional hardening step that lets RN-01, EC-01, AO-01, MC-01, AP-01, RC-01 and AR-01 continue to evolve independently without creating another top-level installer, final owner, timer-ordered overlay or parallel current CI rail.

The contract is intentionally small. It governs **how current UI authorities compose**, not **what each compliance procedure means**.

## Executable invariants

1. `v3/public/app.js` installs exactly one composition root: `installActiveExperience()`.
2. `v3/public/ui/active-experience.js` owns installation of current presentation, integrity and journey participants.
3. Participant precedence is explicit and invariant: `presentation -> integrity -> journey`.
4. `procedure-ui-ux-1-6` is the exclusive current decision-presentation owner.
5. `procedure-ui-ux-integrity-1-6` is an integrity observer. It may enforce presentation/runtime consistency but is not a second presentation owner.
6. `procedure-sequential-ux-2-2` is a journey overlay. Its RN user-monitoring write path remains explicitly bounded; it may not acquire MC/AP/AO competing decision ownership.
7. Participant precedence cannot depend on `setTimeout`, timer depth or nested `queueMicrotask` calls. The lifecycle may use one microtask only as a coalescing boundary after an event; ordering is always derived from the phase contract.
8. CSP-effective 1.6 styling is external in `v3/public/ui-convergence.css`; current participant modules do not inject inline `<style>` blocks.
9. The C0 contract, its 10,000-scenario saturation, and the 2.2 contract/saturation are part of `CURRENT_SEMANTIC` and therefore of `npm test`.
10. `.github/workflows/uiux-onto-epistemic.yml` is manual replay only; it is not a second pull-request gate authority.
11. `package.json` is `private:true` to prevent accidental publication of the repository package.

## Progressive procedure mutation

C0 is not a freeze. Procedure-specific work can continue in parallel when it changes an existing canonical owner or runtime/domain contract. A procedure change must route through C0 first only when it would otherwise add a new composition root, global final owner, timing-based precedence layer, parallel decision surface, or independent current CI authority.

The seven procedures remain ontologically heterogeneous. C0 standardizes the authority envelope, not their business semantics.

## Simulation and falsification model

`v3/experience-constitution-saturation.mjs` executes 10,000 deterministic scenarios:

- 4,000 normal permutations of the three current constitutional participants;
- 4,000 stress scenarios with many non-exclusive integrity/journey participants while preserving one exclusive decision-presentation owner;
- 2,000 hostile edge mutations across normalized constitutional failure families.

The executable failure vocabulary contains 12 normalized families: non-array participant set, invalid participant, missing participant id, duplicate participant, unknown phase, unknown authority, phase/authority mismatch, invalid exclusivity flag, non-exclusive decision presentation, exclusive non-presentation authority, exclusive authority conflict, and missing render function.

Discovery proceeds from seed 1 to `M`. On the current implementation the last novel family is followed by the quiet window at **M=112**; an exact holdout through **1112 (M+1000)** produces zero novel normalized constitutional failure families. The runner also asserts that the discovered vocabulary equals the executable analyzer vocabulary, preventing a false no-novelty result caused by unmutated failure classes. Scenario count and holdout are bounded falsification evidence; they are not probabilities of correctness or evidence of external independence.

## Mutation record

C0 intentionally changes composition mechanics while preserving business behavior:

- moves 2.2 installation under `active-experience`;
- introduces `experience-constitution.js` and `experience-lifecycle.js`;
- converts 1.6 presentation, 1.6 integrity and 2.2 journey into registered phase participants;
- removes double/triple-microtask and timeout ordering between those participants;
- removes CSP-blocked inline style injection already duplicated by the external convergence stylesheet;
- repairs `ui-active-experience-audit.mjs` so its `active-compositions=1` claim is derived from actual root installers rather than only counting the active-experience symbol;
- moves 2.2 checks into the canonical current semantic suite;
- retires the dedicated UIUX PR workflow to manual replay;
- ratchets package non-publishability and UI authority documentation.

## Explicit non-goals

C0 does not close remaining RN/EC/AO/MC/AP/RC/AR procedure defects. It does not add branch protection, external review independence, HA, RTO/RPO evidence, KMS custody, production observability, signed provenance, scanner efficacy or assistive-technology evidence. Those remain separate governance/deployment evidence circuits.
