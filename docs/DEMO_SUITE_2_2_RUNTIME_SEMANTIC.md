# DEMO Suite 2.2 — runtime semantic lattice

## Purpose

Materialize the verified DEMO Suite 2.2 operating-year graph in ICTC without coupling the change to the Native Semantic Lattice 3.2 work in PR #99.

This PR deliberately adds no default server/UI wiring and edits none of PR #99's files. `ensureDemoSuite22()` is an opt-in runtime materializer; absent an explicit call (or `ICTC_DEMO_SUITE=2.2` when a later bootstrap wiring adopts it), existing runtime behavior is unchanged. This keeps the data/runtime contract independently reviewable while PR #99 is still moving.

## Authority lattice

`curated compact scenario -> native constructors/checkpoints -> deterministic 612-event replay -> digest-bound runtime graph -> opt-in RuntimeStore materialization -> native projections -> progressive DEMO metadata`

The compact fixture is declarative input, not a second domain model. The materialized state is rebuilt through current ICTC procedure constructors/checkpoints and must match the canonical SHA-256 state digest before it can be persisted. Native procedure state remains authoritative; DEMO metadata explains synthetic provenance, quality posture, progressive disclosure, narrative clock and claim boundaries.

## Runtime corpus

Positive operating-year records: 188.

| Procedure | Count |
| --- | ---: |
| RN-01 | 9 |
| EC-01 | 18 |
| AO-01 | 63 |
| MC-01 | 36 |
| AP-01 | 27 |
| RC-01 | 21 |
| AR-01 | 14 |

The 512 adversarial mutants remain test-only. Persisting deliberately invalid mutants would corrupt the working registry and blur the boundary between positive demo experience and falsification corpus.

The native replay executes **188 constructors, 385 human/domain checkpoints and 612 chronological events**. It reproduces the previously verified runtime state digest:

`4266e20a3a89efe65d9e1d050b81fbaaccbccd378e81f28b8e26d0a51c46d61e`

The fixture is gzip-compressed and split into bounded text chunks only to keep the repository payload compact. Decompression is deterministic and the resulting materialized graph is digest checked.

## Metadata lattice

Each positive record carries one semantic nucleus projected progressively:

- L0 shell: DEMO identity and snapshot;
- L1 procedure: procedure story/workload context;
- L2 list: state, owner, quality, pressure and bounded temporal cue;
- L3 detail: authority, evidence posture and claim boundary;
- L4 provenance: source master, origin/thread and field provenance;
- L5 technical: scenario version, runtime authority and stress visibility.

L2 deliberately excludes technical provenance and claim-boundary internals. L5 explicitly declares `native-procedure-runtime` as authority and `stressVisible=false`.

## Bootstrap safety

`ensureDemoSuite22()` refuses to materialize into a non-empty business runtime, refuses a runtime containing the legacy demo seed, rejects partial markers, replays the graph through native constructors/checkpoints before any persistence, validates the canonical digest, batches semantic subjects through the `RuntimeStore` ledger, is idempotent after completion, and revalidates the persisted graph before marking completion.

The dedicated RuntimeStore check proves first materialization, restart persistence and idempotent restart. The semantic check proves native projection counts, AO ontology boundaries, evidence-backed AP closure, explicit AR approval and the intentionally review-needed RC-021 binding.

## PR #99 isolation

This change is intentionally a **zero-overlap semantic runtime slice** relative to PR #99: new fixture, runtime module, checks, workflow and documentation only. It does not edit `package.json`, current-release rails, the existing demo seed/runtime check, workflows touched by #99, or UI composition files.

After #99 merges, promotion to the default demo/server path should be a separate tiny integration that wires the already-tested materializer and then reruns the combined browser/current-release/exact-head rail. Keeping that promotion out of this PR prevents merge and authority coupling.

## Known product finding retained

RC-021 intentionally exposes a `version-changed` binding after the linked remediation evolves. The runtime must surface review-needed rather than silently rebinding it.

Separately, the existing risk summary provider and effective risk projection can disagree on review-due counts. DEMO Suite 2.2 does not deform scenario data to conceal that product-level discrepancy.

## Claim boundary

This is bounded synthetic runtime evidence. It is not legal advice, a certification, proof of control effectiveness, a user study, or evidence about a real organization.
