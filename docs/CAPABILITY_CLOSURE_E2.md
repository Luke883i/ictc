# CAPABILITY-CLOSURE-E2 — runtime/UI identity closure

## Decision

`CAPABILITY-CLOSURE-E2` is a **blocking entry/regression gate inside `UIUX-CONVERGE-0`**, not a new serial slice and not a new business/runtime authority.

Observed preimage: `main e0c46998dd161d058724e0ccf1fd489190480891` after merged PR #142.

The gate answers one bounded question:

> For every current canonical UI surface, can ICTC preserve the same semantic identity from declared capability through runtime wiring/projection and UI exposure to the action/readback/evidence that the automated end-user journey can actually exercise?

The answer is **yes at E2 for the current canonical 13-surface inventory**, with the external and unfinished boundaries below preserved.

## Why the four-reality formulation was incomplete

The useful runtime decomposition is:

`declared → built → wired → projected/authorized → UI-exposed → actionable → durable/readback → evidenced`.

Representative-human effectiveness (`E3-HUMAN`) and deployment effectiveness (`E4-DEPLOY`) remain outside that chain. Protected-branch enforcement remains `E3-GOV`.

A component can be valid in isolation and still be wrong in relation. The new oracle therefore rejects, among other cases:

- a valid CTA bound to another valid capability;
- a valid runtime route belonging to another procedure;
- a valid handler belonging to another procedure;
- a receipt for the wrong primary subject;
- a readback/proof target that is valid but not the subject just mutated;
- a valid next action routed to the wrong canonical surface;
- a UI root that exists but belongs to another closure unit;
- a browser check that exists in source but is no longer executed by CI.

## Circumstantial evidence used to fill the historical gap

The historical reconciliation is deliberately scoped to **current canonical surfaces**, not to every historical file or retired enhancer.

| Layer | Evidence on observed main | What it establishes |
|---|---|---|
| Product / declared | `docs/PRODUCT.md`, `v3/procedure-dod.mjs`, `v3/uiux-scope-model.json` | exactly seven business procedures plus the current 13-surface UI inventory and bounded product claim |
| Runtime adapter identity | `v3/runtime/procedure-adapters.mjs` | each of the seven procedures owns explicit `subjectTypes`, `stateCollections`, `writeRoutes`, surface and user-scope metadata; duplicate subject adapters fail closed |
| Runtime handler wiring | `v3/runtime/runtime-handler-registry.mjs` | every canonical procedure adapter must have handler registration and factory; missing registrations throw during module construction |
| Projection / authorization | `v3/server.mjs` `/api/bootstrap` | role/scope/revision-bound work, procedures, decisions, epistemic projection, subject versions, exports and next action are assembled into the canonical bootstrap |
| Write identity / receipt | `v3/store.mjs` | `receipt.subject` is copied from the primary event subject; revision/action/hash/state digest are bound in the write envelope |
| Persistence before visibility | `v3/store.mjs` | candidate state is persisted and integrity-verified before `this.state=persisted` becomes the visible canonical state |
| UI mount | `v3/public/app.js`, `v3/public/ui/active-experience.js` | active experience is installed from the canonical entry point; the constitutional lifecycle is mounted after installers |
| UI readback | `v3/public/ui/actions.js`, `v3/public/ui/controller.js` | UI shows the write receipt, then refreshes `/api/bootstrap`; projection revision regression fails closed |
| Seven real procedure journeys | `v3/browser-v2-1-procedure-journey.py` | RN/EC/AO/MC/AP/RC/AR are opened from the current UI and perform real user-field writes; projection revision must advance and the local/process projection must reflect the write |
| Durability / reload evidence | `v3/browser-v3-all-service.py`, existing durability gates | receipt hashes, reload-visible state and persisted semantics are exercised in the current regression corpus |
| CI execution | `.github/workflows/ci.yml` | the canonical seven-procedure browser journey is actually part of PR CI, not merely an unexecuted fixture |
| Semantic-owner residual | `docs/convergence/convergence-authority.json`, C5 | E2 closure does not pretend the 45-installer/owner compression problem is solved |
| Human/deployment/governance residual | `E3-HUMAN`, `E4-DEPLOY`, `E3-GOV` | repository evidence is not laundered into representative usability, production effectiveness or protected-branch enforcement |

### Reconciliation conclusion

Within the current canonical inventory defined by `UIUX-SCOPE-0`:

- canonical surfaces: **13**;
- E2-closed surfaces: **13/13**;
- business procedures: **7/7** bound to canonical ProcedureAdapters and runtime handler plan;
- current seven-procedure end-user journey: **present and CI-executed**;
- receipt/persist/readback contract: **repository-enforced**.

It is therefore now supported to say:

> **The current canonical ICTC surface inventory is reconciled 100% at the E2 repository/runtime/UI functional-closure level on the observed main preimage.**

It remains unsupported to say:

> every historical module ever built was independently end-user validated; the UX is representative-human validated; branch protection is enforced; or deployment effectiveness is proven.

Compatibility enhancers, retired surfaces and historical experimental modules remain historical/compatibility evidence, not members of the current canonical 13-surface denominator.

## Machine-readable DoD

Authority lives in `v3/capability-closure-e2-contract.json`; prose is explanatory only. A closure unit is terminal only if the checker can prove all applicable relationships, not merely the existence of components.

Required global predicates:

1. canonical surface census equals `UIUX-SCOPE-0` exactly;
2. every unit has all applicable closure axes;
3. semantic identity is continuous across layers;
4. all seven procedure units bind exactly to ProcedureAdapter id/surface/subject/write routes;
5. procedure-specific handler keys bind to the correct procedure, not merely to any valid handler;
6. bootstrap exposes canonical work/procedure/decision/epistemic/evidence projections;
7. UI mounts through the canonical active composition root;
8. write receipt binds the same primary subject and revision lineage;
9. UI write readback advances canonical projection revision;
10. persist/integrity verification occurs before visible state replacement;
11. real seven-procedure browser journey remains present in CI;
12. C5 remains a completion gate rather than being laundered closed;
13. E3-HUMAN, E3-GOV and E4-DEPLOY remain external;
14. the same closure oracle remains blocking and is rerun at `UXW-14` before `UIUX-CONVERGE-0` can be done.

This structure is intentionally scalable: adding a canonical surface changes the `UIUX-SCOPE-0` census and therefore breaks `MRD-01` until a closure unit and evidence bindings are added. Adding a procedure without adapter/handler/write-route closure breaks `MRD-04/05`; changing a relation to another valid component breaks the identity rules rather than passing on component existence alone.

## 10,000,000 semantic mutation campaign

Seed: `ictc-capability-closure-e2-2026-09-12`.

The first material-oracle attempt was **discarded**: it revealed that a globally valid handler could be substituted for the correct procedure-specific handler and that context mutants were not being applied because of an incorrect mutant-constructor signature. Those results are not counted.

The oracle was strengthened with exact procedure→handler binding and corrected context mutation, then the campaign restarted from zero.

Final accepted campaign:

- deterministic semantic trials: **10,000,000**;
- material mutation families: **64/64 exercised**;
- independently materialized model/context mutants: **64/64 killed**;
- compact trial kills: **10,000,000/10,000,000**;
- survivors: **0**;
- harness errors: **0**;
- minimum trials/family: **155,630**;
- maximum trials/family: **157,686**;
- digest: `545c5438dac1fea5ab17e2e06de477bb446f989e9ffcb23ff366f0169896c715`.

The material families include census loss, duplicate identity, root drift, code/adapter drift, valid-but-wrong subject family, valid-but-wrong write route, valid-but-wrong handler, missing projection, receipt/readback/persist evidence loss, browser source/CI decoupling, C5 loss, external-rail laundering, serial-bridge regression and claim promotion.

Mutation count is evidence of oracle coverage only; it is not a probability of correctness.

## Project state after this slice

Serial sequencing does **not** change:

`DECIDE-0 done → UIUX-CONVERGE-0 eligible → S4-A6-CLOSE blocked → S5-CANDIDATE-SEAL blocked`.

Inside `UIUX-CONVERGE-0`:

- `CAPABILITY-CLOSURE-E2`: **satisfied entry gate and permanent regression oracle**;
- `C5-SEMANTIC-OWNER-COMPRESSION`: **still todo and terminal-before-done**;
- `UXW-01..UXW-14`: **implementation work remains**;
- `UXW-14`: must rerun capability closure before `UIUX-CONVERGE-0` is done.

Open/internal residuals remain `C1-C5`, `GAP-020`, `GAP-021`, F-06/F-13/F-15 according to their existing owners. External residuals remain `E3-HUMAN`, `E3-GOV`, `E4-DEPLOY`.

## End-user effect

No new business workflow or UI feature is intentionally introduced by this slice. The user-visible effect is indirect but important: subsequent UI convergence work cannot silently leave a capability merely “present in code” while disconnecting its runtime, projection, semantic target, write receipt, readback or proof lineage.
