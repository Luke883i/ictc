# Runtime Stabilization 2.9 — semantic runtime DoD

Status: PR candidate
Date: 2026-08-21
Base: `main@a7ad0a60f07321347f8c6d9bf0c5396ba80c4d68`

## Objective

Consume the measurable runtime debt exposed by Semantic Closure 2.8 without adding business owners or a new constitutional layer. The target lattice is minimal: durable command identity, non-promotional epistemic fallback, authority-conserving compatibility semantics, and directly attributable current-release gates.

`done` here means repository/runtime stabilization of these invariants. It does not mean legal/compliance assurance, external deployment assurance, historical transaction-time reconstruction, remote evidence drift monitoring, or RC/AR vertical deep fine-tuning.

## Findings closed

| Finding | Root cause | Stabilization | Falsifier |
|---|---|---|---|
| command replay expires after 500 entries | `commandResults` was both cache and replay authority | append-only SQLite `command_result`; snapshot remains 500-entry cache; cache miss resolves durable ledger | `runtime-stabilization-command-ledger-check.mjs` |
| action-name can mint human authority | regex promoted unknown `review/decide/approve/...` names | unknown names now fail safe to `observed`; only declared effects or exact authority-preserving compatibility entries can produce `decided/attested` | `runtime-stabilization-semantic-check.mjs` |
| AI output can collapse to observed | AI producers without `.ai.` token were outside the 2.8 exact registry | exact proposed/`ai-provider` compatibility entries for monitoring job, workbench run/planning, contribution enrichment and known incident flows | semantic check + saturation |
| compatibility migration can widen authority | replacing regex with an exact registry can accidentally classify previously-observed names as decisions | registry preserves pre-2.9 decisive/attested behavior; names such as `insight.human.validated`, `review.need.resolved` and `catalog.source.impact.assessed` remain observed until explicit effects declare otherwise | semantic check |
| versioned acceptance gates lose provenance | 2.3–2.8 gates were side-effect imports of `current-release-suite-check` | direct membership in semantic/runtime suites; suite check now verifies direct attribution | `current-release-suite-check.mjs` |
| current release profile omits closure generation | profile ended at C0.1 | profile now names Semantic Closure 2.8 and Runtime Stabilization 2.9 | current suite output |
| 2.8 DoD remained candidate after merge | documentation state drift | 2.8 document moved to merged/accepted repository state | documentation review |

## Global DoD

- G1 — exactly seven business processes remain; no new business/persistence/UI owner and no authority widening from migration.
- G2 — a command id that left the 500-entry snapshot cache still resolves to the original durable receipt and cannot execute its mutation again.
- G3 — command id reuse by a different actor/action fails closed.
- G4 — unknown action naming alone can never produce `decided` or `attested`.
- G5 — known AI-producing compatibility actions are always `proposed` with `ai-provider` producer.
- G6 — explicit `metadata.epistemicEffects` remains the forward authority contract and overrides compatibility semantics.
- G7 — transaction-time historical selection remains fail-closed until a real selector exists.
- G8 — unversioned external evidence remains non-usable at decisive checkpoints.
- G9 — versioned gates appear directly in current suite membership, not hidden behind side-effect imports.
- G10 — bounded falsification encodes 10,000,000 deterministic simulation cases and 1,000,000 mutants, with 100,000 mutation holdout and zero novel normalized family in that declared model.
- G11 — exact PR HEAD CI is acceptance evidence; repository checks are not deployment assurance.

## Mutation vocabulary 2.9

1. `command-replay-cache-eviction`
2. `command-id-reuse-conflict`
3. `action-name-human-authority-promotion`
4. `ai-output-observation-collapse`
5. `historical-transaction-selection-bypass`
6. `unversioned-external-evidence-promotion`

The 10M/1M figures are deterministic model-level falsification counts over this declared operator vocabulary. They are not probabilities, legal assurance, production reliability estimates, or proof that the fault vocabulary is complete.

## Local invariants

### Durable command identity

- SQLite table `command_result` is the durable replay authority.
- `commandResults` in the snapshot remains a bounded 500-entry acceleration cache.
- new command results are written in the same SQLite transaction as audit/semantic persistence and snapshot update.
- durable replay returns the original receipt with `replayed=true` and does not advance state revision.
- legacy installations migrate the command results still present in their snapshot on the next successful save; command ids already evicted before 2.9 cannot be reconstructed retroactively.

### Epistemic classification

- exact compatibility registry is bounded and inspectable;
- unknown human-looking verbs fail to `observed`;
- exact decisive/attested entries preserve behavior already implied by the pre-2.9 fallback instead of inventing new authority;
- AI-looking fallback may lower-bound only to `proposed`, never to human authority;
- compatibility is not the target authoring API: new materially epistemic writes should declare `metadata.epistemicEffects`.

### Gate topology

- 2.3, 2.4, 2.5, 2.6, 2.8 and 2.9 acceptance checks are direct current-suite members;
- per-file timeout/failure attribution therefore identifies the failing versioned gate;
- `current-release-suite-check` validates topology instead of executing hidden gates.

## Metrics

| Metric | Target |
|---|---:|
| new business owners | 0 |
| authority widening from compatibility migration | 0 |
| snapshot replay cache | 500 max |
| durable command retention | append-only within SQLite lifecycle |
| replay after cache eviction | 100% for commands recorded by 2.9+ |
| unknown-name human promotion | 0 |
| known AI compatibility collapse to observed | 0 |
| direct versioned-gate attribution | 100% for 2.3–2.9 declared gates |
| deterministic simulations | 10,000,000 |
| modeled mutants | 1,000,000 |
| modeled kill rate | 100% within declared vocabulary |
| holdout | 100,000 |
| new normalized holdout families | 0 |

## Residual frontier

Not hidden by this slice:

- transaction-time historical reconstruction remains unsupported and fail-closed;
- remote drift monitoring for external EvidenceRef is not implemented;
- RC-01 and AR-01 remain `regressionCovered`, not `deepFineTuned`;
- compatibility action registry still exists; the next causal cleanup is migration of remaining materially epistemic writes to explicit `epistemicEffects`, then registry compression;
- the repository hash/audit model does not provide external timestamping, signature, non-repudiation, backup/restore or HA guarantees;
- durable command ids evicted before this schema existed cannot be recovered.

## Acceptance checklist

- [x] branch created from exact base `a7ad0a60...`
- [x] durable replay authority separated from bounded cache
- [x] unknown action-name human promotion removed
- [x] compatibility migration checked for zero authority widening
- [x] uncovered AI-producing actions pinned to proposed/AI producer
- [x] deterministic 10M simulations + 1M mutation model added
- [x] versioned suite gates made directly attributable
- [x] release profile includes 2.8 + 2.9
- [x] README infrastructure/verification parity updated
- [x] 2.8 documentation state drift corrected in this PR
- [ ] exact-head GitHub Actions green on materialized PR

The final checkbox is intentionally not pre-asserted. CI on the actual PR HEAD is the acceptance evidence.
