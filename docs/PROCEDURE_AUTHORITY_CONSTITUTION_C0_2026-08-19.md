# C0.1 — Procedure Authority Constitution

Status: current engineering contract for the active UI composition. C0.1 hardens C0 after its merge; it does not redefine business procedure ontology, runtime domain rules, legal applicability or external assurance.

## Purpose

C0.1 removes the remaining accidental authority created by late UI scheduling. C0 established one composition root and explicit final ownership; the post-merge audit found two residual timing classes: executive harmonization could rewrite final procedure frames through microtask/timeout scheduling, and journey controls were re-annotated through the late `ictc:sequential-rendered` side channel. The lifecycle could also queue a redundant microtask when a participant requested convergence during an active flush.

The contract remains intentionally small. It governs **how current UI authorities converge**, not **what each compliance procedure means**.

## Executable invariants

1. `v3/public/app.js` installs exactly one composition root: `installActiveExperience()`.
2. `v3/public/ui/active-experience.js` owns installation of the current composition.
3. Final procedure precedence is explicit and invariant: `harmonization -> presentation -> integrity -> journey -> annotation`.
4. `procedure-executive-harmonization-1-5` is a non-exclusive `presentation-harmonization` participant. It normalizes role-aware frames and language before final decision presentation.
5. `procedure-ui-ux-1-6` is the exclusive current `decision-presentation` owner.
6. `procedure-ui-ux-integrity-1-6` is an `integrity-observer`; it may enforce presentation/runtime consistency but is not a second presentation owner.
7. `procedure-sequential-ux-2-2` is a `journey-overlay`. Its RN user-monitoring write path remains explicitly bounded; it may not acquire MC/AP/AO competing decision ownership.
8. `procedure-control-anchors-1-4` is the final `control-annotation` participant. It classifies control intent, authority and evidence effect after journey rendering, without owning business decisions or writes.
9. Participant precedence cannot depend on `setTimeout`, timer depth, nested `queueMicrotask` calls or a post-journey side-channel event. The lifecycle may use one microtask only as a coalescing boundary after an event.
10. A request raised while the lifecycle is flushing becomes an in-flush replay; it does not queue a second echo microtask.
11. The lifecycle fails closed with `experience-lifecycle-nonconvergent` after 32 replay cycles instead of looping indefinitely.
12. CSP-effective 1.6 styling remains external in `v3/public/ui-convergence.css`; current final participants do not inject inline `<style>` blocks.
13. The C0.1 contract, its saturation and the 2.2 contract/saturation remain part of `CURRENT_SEMANTIC` and therefore of `npm test`.
14. `.github/workflows/uiux-onto-epistemic.yml` remains manual replay only; it is not a second pull-request gate authority.
15. `package.json` remains `private:true` to prevent accidental package publication.
16. `v3/release-identity.json` separates current contracts and procedure maturity from informational lineage.

## Progressive procedure mutation

C0.1 is not a freeze. Procedure-specific work can continue in parallel when it changes an existing canonical owner or runtime/domain contract. A procedure change must route through the constitutional lifecycle only when it would otherwise add a new composition root, global final owner, timing-based precedence layer, parallel decision surface, post-journey annotation side channel or independent current CI authority.

The seven procedures remain ontologically heterogeneous. C0.1 standardizes their authority envelope, not their business semantics. Current deep fine-tuning is explicit for RN/EC/AO/MC/AP; RC/AR remain canonical and regression-covered while their vertical slices mature.

## Simulation and falsification model

`v3/experience-constitution-saturation.mjs` retains the original 10,000 C0 constitutional scenarios and adds **100,000 deterministic C0.1 hardening scenarios**:

- 40,000 normal cases covering event bursts, canonical phase order and release-truth invariants;
- 40,000 stress cases covering reentrant lifecycle requests and repeated convergence without a second flush;
- 20,000 hostile edge mutations.

The additional executable hardening vocabulary contains 14 normalized failure families:

- burst not coalesced;
- reentrant microtask echo;
- replay loss or duplication;
- unbounded non-convergent loop;
- phase-order drift;
- non-exclusive presentation owner;
- late renderer timing escape;
- sequential side-channel event;
- stale release stage;
- missing current contract;
- procedure-maturity collapse;
- lineage promoted to current identity;
- canonical procedure loss;
- deep/regression maturity overlap.

All 20,000 sampled edge mutants are killed. Discovery reaches the last new normalized hardening family before the quiet window at **M=114**; the independent exact holdout through **1114 (M+1000)** yields zero novel normalized families. The runner asserts that the discovered hardening vocabulary equals the executable mutator vocabulary, so no-novelty cannot be obtained by silently omitting a declared family.

The total runner execution is 110,000 scenarios: 10,000 retained constitutional baseline + 100,000 additional hardening scenarios. Counts, mutation kill rate and no-novelty are bounded repository E2 evidence; they are not defect probabilities, independent assurance or proof of universal correctness.

## Mutation record

C0.1 intentionally changes convergence mechanics and release truth while preserving business authority:

- absorbs executive harmonization 1.5 into the explicit `harmonization` phase;
- turns control anchors into the explicit post-journey `annotation` phase;
- removes the `ictc:sequential-rendered` annotation side channel;
- removes microtask/timeout scheduling from executive harmonization and control-anchor final renderers;
- makes reentrant lifecycle requests replay inside the current flush;
- invalidates stale scheduled lifecycle callbacks when a synchronous flush supersedes them;
- adds a 32-cycle fail-closed convergence guard;
- upgrades release identity to schema 2.0 with current contracts, seven-procedure maturity and separate lineage;
- extends the canonical C0 saturation with 100,000 additional normal/stress/edge simulations.

## Residual timing boundary

C0.1 does **not** claim that every historical UI helper in `v3/public/ui/` is timer-free. Earlier non-final enhancers can still use scheduling for local interaction mechanics. In particular, `procedure-finetuning-1-4` retains bounded legacy scheduling around source-dialog polish. It is not a final constitutional owner and is subsequently normalized by the C0.1 participants, but its remaining timer is technical debt to retire when that legacy helper is compressed. No current final participant may use such timing to establish precedence.

## Explicit non-goals

C0.1 does not close remaining RN/EC/AO/MC/AP/RC/AR procedure defects. It does not add branch protection, external review independence, HA, RTO/RPO evidence, KMS custody, production observability, signed provenance, scanner efficacy or assistive-technology evidence. Those remain separate governance/deployment evidence circuits.
