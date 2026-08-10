# V2.0 Epistemic Lattice Convergence

## Intent

This convergence moves ICTC forward without changing the authority model of the seven bounded business procedures. The product keeps exactly seven business compliance procedures. A new cross-cutting meta-procedure, **EP-01 Reticolo epistemico**, is added for admin and auditor roles to inspect the cumulative epistemic fabric produced by those procedures.

EP-01 is not an eighth compliance process, is not a compliance score, and is not a legal or certification authority. It is a supervision and reasoning surface over already recorded semantic history.

## Global invariants

1. Seven business procedures remain the complete business-process set. EP-01 is cross-cutting and `businessProcess:false`.
2. Flat and graph modes consume the same server projection; presentation never invents a second semantic truth store.
3. Every visible atom carries identity, producer/authority, basis, time/revision, epistemic family/status, and limitations.
4. AI output is always `proposed`. Human ON authorizes execution, not truth, review, applicability, compliance, legal sufficiency, control effectiveness, or closure.
5. An AI semantic edge is a proposed relation with explicit basis references. It never silently mutates the source or target record.
6. Cross-procedure creation routes through typed creation adapters and canonical target normalizers. No generic write endpoint may bypass a target procedure's validation or RBAC.
7. A cross-procedure creation records source subject, target subject, relation predicate, actor, timestamp, and semantic subjects in the same receipt-bound mutation.
8. New visual primitives are additive and shared by every surface; procedure-specific lifecycle semantics remain distinct.
9. Progressive disclosure hides complexity, never epistemic limitations or human-decision boundaries.
10. No synthetic compliance/maturity percentage, global green/red legal verdict, or autonomous remediation is introduced.

## Point 1 — further visual and experiential refinement

### Strategy

Introduce a canonical surface primitive layer used by Home, Processi, Monitoraggio, Eventi, GRC procedures, Postura, and EP-01. The layer owns canvas width, first-fold rhythm, panel anatomy, toolbar geometry, raw-data presentation, mode switching, focus treatment, responsive compression, and reduced-motion behavior.

### DoD P1

- every active surface is marked with the canonical surface primitive contract;
- all top-level working panels use the same spacing/border/radius grammar without flattening process-specific content;
- first viewport preserves: where / purpose / state or scope / next action;
- tables and raw projections own their horizontal overflow locally; the page does not gain horizontal overflow;
- toolbars wrap or scroll locally below 620px;
- interactive targets remain >=44 CSS px where the refined shell owns them;
- focus-visible remains observable on keyboard navigation;
- reduced-motion removes non-essential transitions;
- no new competing primary CTA is introduced;
- visual primitives apply to EP-01 from its first implementation.

### Sub-DoD P1

- P1.1 canonical `surface-canvas`, `surface-panel`, `surface-toolbar`, `surface-mode-switch`, `surface-data-region`, `surface-raw`, `surface-empty` primitives;
- P1.2 runtime enhancer applies primitives to all existing surfaces deterministically and idempotently;
- P1.3 responsive invariants at 390, 768, 1024, 1366, 1600 widths;
- P1.4 accessibility naming and focus ownership stay intact;
- P1.5 browser test asserts no page-level horizontal overflow and canonical primitive coverage.

## Point 2 — EP-01 cumulative epistemic lattice

### Final trace model

Each procedure-specific business object is represented through its canonical SubjectVersion occurrences and transaction-bound EpistemicStep effects. EP-01 projects cumulative history directly from SQLite append storage, not from an independent copy.

The final navigable trace is:

`business record -> SubjectVersion occurrence -> EpistemicStep effect -> producer/authority -> basis references -> relation -> review/decision state -> successor occurrences`

### Modes

**Mode A — Flat/raw.** A paginated, filterable extraction-like table. Each atom can disclose its complete structured JSON payload and bindings.

**Mode B — Proto semantic graph.** The same atoms become nodes and their predecessor/basis/effect/standard/semantic relations become typed edges. The graph has an accessible list representation; SVG is an orientation aid, not the sole information channel.

### DoD P2

- EP-01 is visible only to roles with `inspect-epistemic-lattice`;
- user role receives neither navigation entry nor API data;
- server reads cumulative SubjectVersion and EpistemicStep rows from canonical SQLite append storage;
- pagination exposes total counts and does not imply the current page is the whole ledger;
- flat and graph mode hashes are derived from one projection revision;
- every graph edge resolves to known nodes or an explicitly external/bounded reference;
- predecessor chains remain navigable;
- raw JSON disclosure is escaped and never executed as markup;
- seven business procedure counts remain exactly seven;
- EP-01 has a canonical frame but is flagged `businessProcess:false` and `crossCutting:true`.

### Sub-DoD P2

- P2.1 persistence page API for subject versions and epistemic steps;
- P2.2 server projection normalizes atoms, nodes, edges and coverage metadata;
- P2.3 RBAC permission added only to admin and auditor;
- P2.4 surface router and command palette know EP-01 without adding it to business procedure registry;
- P2.5 flat table supports search, procedure/family/kind filtering and raw disclosure;
- P2.6 graph supports node selection, neighbor inspection and typed-edge legend;
- P2.7 browser journey proves admin/auditor access and user denial.

## Point 3 — human-ON AI derivation and progressive abstraction

### Pipeline

AI processing is incremental and bounded. A human explicitly turns analysis ON for a request. The runtime selects not-yet-covered or query-relevant atoms and runs a structured pipeline:

- L0 recorded atoms — immutable basis references;
- L1 normalized observations — proposed restatements bound to basis atoms;
- L2 themes — proposed clusters/patterns across atoms;
- L3 cross-atom inferences — proposed hypotheses against declared standards/best-practice references;
- L4 questions — proposed investigative questions, such as `Dove emerge un rischio di corruzione?`, each bound to the L0-L3 basis that motivated it.

The pipeline may add proposed semantic edges. It may not change business records, decisions, ratings, applicability, mapping state, action closure, risk rating, or assurance approval.

### DoD P3

- `humanOn:true` is mandatory for execution;
- organization AI policy and budget remain server-enforced;
- admin and auditor may request analysis only through explicit RBAC;
- every derived atom has `epistemicStatus:'proposed'`, producer trace, basis atom IDs, model trace digest and limitations;
- standard references are explicit inputs/references, never inferred as legally applicable;
- processing reports selected/covered/remaining atoms so bounded execution cannot be mistaken for complete analysis;
- repeated processing can eventually cover the full cumulative lattice without one unbounded prompt;
- AI-proposed semantic edges are visually and structurally distinguishable from recorded deterministic edges;
- only a human review action can mark a derivation reviewed; rejection remains preserved;
- auditor execution does not grant business-write or review authority;
- admin review of a derivation does not mutate the business subjects used as basis.

### Sub-DoD P3

- P3.1 strict output validator with bounded counts and strings;
- P3.2 incremental cursor/coverage metadata;
- P3.3 inference-run record plus derivation records persisted through normal Store mutation and receipt binding;
- P3.4 explicit epistemic effects classify outputs as proposed;
- P3.5 admin-only human review endpoint for accept/reject of derivation usefulness;
- P3.6 UI ON control explains authority boundary before execution;
- P3.7 query mode supports question-led abstraction without presenting answers as conclusions.

## Point 4 — robust minimal cross-procedure creation

### Model

A cross-reference is a typed relation plus an optional typed target creation. The source procedure never writes directly into another procedure's state shape. A registry of target creation adapters translates a bounded entry payload into the existing target normalizer.

Each creation records:

`source procedure + source subject -> typed relation -> target procedure + newly created target subject`

The transaction declares both source and target semantic subjects so the receipt and semantic manifest bind the handoff.

### DoD P4

- all seven target procedures expose one bounded cross-create entry contract;
- creation adapters reuse canonical target validation/normalization where available;
- target procedure RBAC is required in addition to source visibility;
- disabled target procedures reject new cross-created records;
- invalid source subject, unsupported relation or malformed target payload fails closed;
- successful result contains target record plus explicit cross-reference metadata;
- duplicate command IDs remain idempotent through Store command semantics;
- source and target semantic subjects are bound in one mutation/receipt manifest;
- cross-create never silently performs downstream human checkpoints;
- UI exposes a single `Crea collegato` secondary affordance, never a second competing primary CTA.

### Sub-DoD P4

- P4.1 target creation-adapter registry with seven entries and no eighth business adapter;
- P4.2 relation vocabulary derives from a bounded compatibility matrix;
- P4.3 generic handler validates source visibility, target procedure policy and target permission;
- P4.4 each target builder produces a native entry-state record, not an adopted/approved/closed state;
- P4.5 source/target origin metadata is preserved on the target;
- P4.6 UI form changes fields based on target adapter while keeping one reusable interaction pattern;
- P4.7 tests cover every source-to-target procedure pair plus denial cases.

## Global DoD

The PR is globally complete only when all of the following hold on the exact PR HEAD:

1. P1-P4 DoDs and sub-DoDs are executable assertions or browser journeys where feasible.
2. Seven business procedure registry/adapters remain seven and existing process semantics stay green.
3. EP-01 is same-authority dual-view, admin/auditor only, and user-invisible.
4. AI derivations are proposal-only, human-ON, basis-bound, standard-reference-bound and review-separated.
5. Cross-procedure creation covers 7 target adapters and all 7x7 source/target combinations at contract level without bypassing RBAC/procedure policy.
6. Existing semantic, runtime, browser, security, durability, integrity-binding and governance compensating checks have no failures on the exact PR HEAD; skipped checks are reported as skipped.
7. New browser tests cover EP-01 flat mode, graph mode, RBAC, AI control boundary, linked creation and mobile overflow.
8. New saturation uses at least 24,000 pseudo-random adversarial model scenarios plus a seed-separated 2,000-scenario holdout. It mines anomaly signatures from measured invariants rather than a closed list of defect IDs.
9. Simplification mutants demonstrate degradation when removing RBAC isolation, same-projection dual modes, basis-bound AI edges, target-normalizer routing, secondary semantic-subject binding, mobile overflow ownership, or human-ON gating.
10. Saturation is described as bounded evidence, not proof that unknown defect classes do not exist.
11. PR body states purpose, journeys, epistemic impact, non-goals, exact validation and unresolved repository-owner controls.
12. No direct push to main; merge observation remains exact-head governed.

## Saturation envelope

Primary model mining: 24,000 deterministic pseudo-random scenarios across role, procedure, target procedure, lattice density, predecessor depth, relation fan-out, AI state, inference coverage, viewport, projection page size, disabled-procedure policy and stale-revision conflict.

Holdout: 2,000 scenarios with a distinct seed and no target mutations. The target must emit zero invariant anomalies in the holdout. Mutants must be killed independently; target success plus mutant detection is the Definition of Degradation evidence.

This envelope is intentionally bounded. It supports no-new-anomaly evidence within the generated state space and demonstrates selected simplifications would degrade required behavior. It does not prove absence of unknown classes outside that state space.
