# ICTC 2.1 — Procedure Journey & Semantic Exploration Convergence

Baseline: `main@55b69b168a3f0fe54f096c29eface77cd61e0860` (post PR #59).

Profile: `2.1-procedure-journey-exploration-pre-candidate`.

## Intent

Move ICTC forward by proving complete end-user work across all seven business procedures, making dependent projections visibly converge after writes, improving route continuity with bounded presentation transitions, and turning EP-01 from a mostly flat/raw or node-grid inspection surface into a progressively explorable read model. This release does not add a business procedure, graph database, workflow engine, compliance score, legal conclusion, AI decision authority, or new persistence authority.

## Global invariants

1. The seven business procedures remain exactly RN-01, EC-01, AO-01, MC-01, AP-01, RC-01 and AR-01.
2. Every successful business write remains owned by the existing server-side procedure/write adapters and returns a verified receipt.
3. A successful bootstrap refresh emits one canonical projection-commit signal with previous/current revision; dependent surfaces may react to this signal but do not gain business authority.
4. EP-01 is a read/proposal meta-procedure. Flat, graph and progressive exploration modes consume the same revision-bounded lattice projection and expose the same projection digest.
5. AI-derived content remains `proposed`, basis-bound and visually distinct from recorded business atoms. Human review does not mutate the basis business subjects.
6. Presentation transitions are progressive enhancement, disabled for reduced motion, and never gate navigation or writes.
7. No surface may silently show a known-stale projection after a successful write when that surface is visible and declares a dependency on the changed projection family.
8. Mobile document overflow is forbidden; intentionally wide data/graph regions own their local scrolling.
9. Role changes fail closed for EP-01, command navigation, contextual actions and cached selections.
10. Saturation evidence is bounded engineering evidence, not proof of absence of unknown defect classes or human usability/compliance assurance.

## D1 — End-user procedure application & projection convergence

### DoD D1

A server-backed browser journey navigates through and performs a real visible UI write in every business procedure. After each write it verifies the procedure-local record, current revision advance, Processi projection update, and at least one dependent cross-surface signal. EP-01 must converge to the resulting revision without manual page reload when visible or when reopened.

### D1T1 — Canonical projection-commit signal

- Extend `controller.refresh()` to capture previous/current revision and emit one `ictc:projection-committed` event after the bootstrap projection is installed.
- Event detail is presentation metadata only: previousRevision, revision, changed boolean, actorRole and reason.
- No duplicate business write, no synthetic changed-domain inference.

Sub-DoD: revision never regresses; unchanged refresh is represented as `changed:false`; role-switch refresh still emits the signal; existing `ictc:rendered` compatibility remains until later compression is separately justified.

### D1T2 — Dependent-surface convergence

- EP-01 reloads its lattice projection on projection-commit only when visible/active and when the revision advanced.
- Stale lattice requests cannot overwrite a newer response.
- EP-01 exposes the loaded revision and digest in DOM for browser verification.

Sub-DoD: at most one effective lattice reload per committed revision; role-denied users never trigger the protected API; navigation to EP-01 always converges to current bootstrap revision.

### D1T3 — Seven-procedure real browser journey

- RN-01: register source material from the visible contribution flow.
- EC-01: register an event from the visible incident flow.
- AO-01: register an inventory candidate from the visible procedure form.
- MC-01: register a requirement/mapping proposal from the visible procedure form.
- AP-01: register an action from the visible procedure form.
- RC-01: register a risk scenario from the visible procedure form.
- AR-01: register an assurance request from the visible procedure form.
- After every step, observe revision and procedure projection changes; after the chain, open EP-01 and verify all seven procedure IDs are represented in the cumulative read model.

Sub-DoD: no direct API seeding for the seven primary writes; API reads may be used only as an independent verification oracle. Browser journey runs at desktop and checks the final EP-01 state at mobile width.

## D2 — Route continuity, advanced transitions & current-context cues

### DoD D2

Navigation between Home, Processi, each procedure, Evidenze and EP-01 is continuous, keyboard safe, History compatible and visibly contextual without adding business state. Advanced transitions are a progressive enhancement and preserve reduced-motion semantics.

### D2T1 — Standard transition coordinator

- Add one small presentation coordinator around surface routing using `document.startViewTransition` when available.
- Use stable direction/state attributes and CSS view-transition pseudo-elements; fall back synchronously when unsupported.
- Reduced-motion forces zero animation duration.

Sub-DoD: route semantics and History are identical with/without the API; no transition wraps an async business write; focus lands after the transition at the canonical destination.

### D2T2 — Current-path strip

- Add a compact, reusable `surface-context-strip` to procedure frames and EP-01.
- It shows the current product area, procedure/meta-procedure identity and current EP-01 exploration level where applicable.
- Items that are actionable use buttons with explicit accessible names; informational items are text.

Sub-DoD: no duplicate primary navigation; no hidden role-inaccessible destination; mobile wraps without document overflow; screen-reader text is sufficient without icon glyphs.

### D2T3 — Action feedback & focus continuity

- Projection-changing interactions expose a bounded busy state and an aria-live completion signal.
- After create flows, focus returns to the created/updated collection context or the canonical procedure frame rather than an arbitrary document origin.
- Back/Forward does not reopen stale dialogs.

Sub-DoD: no focus trap outside open dialogs; no `aria-busy` left stuck after error; reduced-motion and keyboard-only paths remain usable.

## D3 — EP-01 progressive exploration

### DoD D3

EP-01 gains a default `Esplora` mode that moves from aggregate context to scoped groups, relations and individual atoms without changing the underlying lattice authority. Flat/raw and Proto-grafo remain available expert modes and retain the same digest.

### D3T1 — Deterministic exploration levels

Introduce four deterministic levels computed solely from the current lattice payload:

1. `Quadro` — procedure distribution, epistemic status distribution, atom/version/step totals.
2. `Gruppi` — procedure/family clusters with counts and representative recorded/proposed atoms.
3. `Relazioni` — neighbors/edge predicates for a selected cluster or atom, with recorded/proposed separation.
4. `Atomo` — bounded human-readable fields first, raw JSON behind disclosure.

Sub-DoD: level changes are read-only; counts reconcile with the filtered atom set; no generated compliance interpretation; empty and partial data states remain navigable.

### D3T2 — Drill path and reversible scope

- Maintain an in-memory exploration path with buttons for prior levels.
- Selecting a procedure/family/node narrows only presentation scope; clear/reset returns to the same full projection revision.
- Search/filter changes reconcile or clear invalid selections deterministically.

Sub-DoD: Backspace/Escape never deletes data; browser History remains surface-level only; path state is role-local and not persisted as semantic state.

### D3T3 — AI derivation linkage

- Proposed L1-L4 derivations are surfaced as a separate `Letture proposte` section when present in the lattice.
- Selecting a derivation exposes basis atoms and allows one-click scope to the recorded basis set.
- Standard/best-practice references remain references, never applicability or compliance conclusions.

Sub-DoD: proposed derivations are visually and textually distinguishable from recorded atoms; basis navigation fails closed when a basis atom is outside the loaded page and offers reload/newer navigation rather than inventing content.

## D4 — Hardening, minimization & assurance

### DoD D4

The new behavior adds one bounded refresh contract, one transition coordinator and one EP-01 exploration model; duplicate authority/listener growth is rejected. Race, role, stale-selection, overflow and compression faults are explicitly falsified.

### D4T1 — Lattice request/race hardening

- Use monotonic request sequence or AbortController so stale EP-01 responses cannot replace newer revisions.
- Filter and selected IDs are reconciled on every projection load.
- Failed reload leaves the last known projection visibly marked stale rather than silently presenting it as current.

Sub-DoD: no uncaught promise rejection; stale flag clears only after a successful current-or-newer projection; denied roles clear sensitive local selection state.

### D4T2 — Listener and primitive minimization

- Reuse surface primitives for context strip, busy state, disclosure and data region.
- New modules listen to the narrowest event possible; generic `ictc:rendered` is retained only where legacy compatibility currently requires it.
- No second procedure registry, route registry or projection authority is introduced.

Sub-DoD: static gate counts/inspects new event owners; removing the projection-commit contract or exploration model must break an explicit test, demonstrating that the new code is not redundant decoration.

### D4T3 — Per-task simulations and global saturation

For each of the 12 tasks D1T1…D4T3 run exactly:

- 3,000 favorable scenarios;
- 3,000 antagonistic/fault-pressure scenarios;
- 3,000 inexperienced-use scenarios.

Total task simulations: **108,000**. Dimensions include role, procedure, viewport, revision delta, transition support, reduced motion, network response ordering, filter/search state, exploration level, graph density, proposed/recorded mix, source/target relation, enabled procedure policy and empty/partial datasets.

Then run a separate global pseudo-random discovery stream of **45,000** scenarios producing anomaly signatures from measured invariant violations rather than preassigned defect labels. Freeze the discovered signature set at M (last genuinely new normalized signature), then run a distinct-seed **M+1000 holdout**. The target implementation must emit zero anomalies; fault-injected discovery may emit known or new signatures and is used to validate detector sensitivity. Compression mutants remove or merge individual new responsibilities and must demonstrate a measurable DoD degradation; otherwise the redundant responsibility is removed before PR closure.

## Global DoD

The PR is complete only when all conditions hold on one exact PR head:

- D1-D4 and all 12 task/sub-DoD contracts are represented by executable static/runtime/browser gates.
- Real server-backed browser writes traverse all seven business procedures from visible controls and observe projection convergence.
- EP-01 `Esplora`, Flat/raw and Proto-grafo consume one lattice projection digest and remain admin/auditor-only.
- Projection-commit refresh closes the stale-reticulum gap without creating a second state authority.
- Advanced transitions pass History, keyboard, focus and reduced-motion checks.
- 108,000 task simulations complete with zero target violations.
- 45,000 global discovery scenarios + distinct-seed 1,000 holdout complete; no target anomaly occurs and no genuinely new normalized holdout signature appears.
- Compression mutants prove each retained new responsibility is necessary for at least one DoD; otherwise it is removed.
- Current semantic/runtime/launcher/security/authority/integrity suites remain green.
- Server-backed Experience 1.9, Epistemic 2.0 and new 2.1 journey are green on the exact head.
- CodeQL and branch protection are reported according to observed platform state and are never inferred from other green checks.

## Claim boundary

This is bounded repository/runtime/browser/model-assisted engineering evidence. It is not independent human usability research, accessibility certification, legal compliance, control-effectiveness assessment, penetration testing, production deployment certification, or proof that no unknown defect class exists outside the generated/tested state space.
