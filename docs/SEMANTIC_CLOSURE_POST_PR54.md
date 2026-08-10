# ICTC Semantic Closure — post PR54

Baseline: `main@11cb18be5a5bcdacf39714688230ad7e068f3ef4`.

This is the rebased execution profile of the Convergence Masterplan v2. It deliberately preserves the seven procedure-specific lifecycles and applies only the minimum shared corrections needed for semantic closure.

## Global DoD

| ID | Required outcome | Metric |
|---|---|---|
| S01 | Business writes are classified | WritePath Census coverage = 100% |
| S02 | Each write route has one semantic owner | duplicate write authority = 0 |
| S03 | Generic kernel has no independent seven-procedure set | hardcoded business procedure sets = 0 |
| S04 | Subject versions use canonical AFTER state | mutation-result-as-version cases = 0 |
| S05 | Version occurrence differs from payload identity | same-payload new occurrence preserved = 100% |
| S06 | Semantic history is outside current snapshot | historical bytes added to snapshot per occurrence = 0 |
| S07 | Audit/current state/version append is atomic | injected authoritative failure leaves partial commit = 0 |
| S08 | Projection basis is transitive | actor/scope/transactionAsOf/validAsOf/revision/policy basis coverage = 100% |
| S09 | Historical views remain current-auth gated | historical re-grant cases = 0 |
| S10 | Standard catalogue validity is not a user validation task | validation-language/actions = 0 |
| S11 | Standard nodes remain browsable independently of organizational use | permitted node reachability = 100% |
| S12 | Requirement references bind an edition | edition-less internal standard binding = 0 |
| S13 | ReviewNeed is cause-addressed and idempotent | duplicate on retry = 0 |
| S14 | Dirty draft survives refresh/conflict | dirty draft loss = 0 |
| S15 | AI remains optional and non-authoritative | core AI-OFF journey parity = 100% |
| S16 | Evidence strength/purpose do not collapse into sufficiency | automatic substantive-sufficiency claims = 0 |
| S17 | Disabled procedure blocks new work but preserves history | history loss = 0; disabled writes accepted = 0 |
| S18 | Reports/metrics use the same deterministic basis | metric/drilldown basis mismatch = 0 |
| S19 | 10,000 model scenarios saturate | M+1000 new normalized classes = 0 |
| S20 | Mutation falsifiers remain effective | mutation score = 1.0 |
| S21 | Current exact-head CI is green | failures/queued/in-progress = 0 |

No weighted score can compensate a failed required gate.

## Ordered slices

1. **Census & falsifiers** — make the remaining post-PR54 gaps observable before changing architecture.
2. **Registry/route closure** — remove duplicate write owners and scattered business-procedure lists.
3. **Standards semantics** — separate catalogue provenance, organizational use and requirement applicability; expose node browsing.
4. **ProjectionContext v2** — normalized transaction/effective time and transitive basis.
5. **Append history** — `subject_payload`, `subject_version`, `epistemic_step` append tables; current snapshot remains bounded.
6. **Canonical AFTER-state versioning** — SubjectAdapter canonicalization, occurrence identity separate from payload digest.
7. **Epistemic effects** — one step envelope per business-significant mutation; explicit multi-subject effects.
8. **ReviewNeed** — persisted/idempotent cause identity while preserving old decisions.
9. **DraftStore/UI polish** — preserve unsaved human intent; one renderer owner; progressive disclosure remains five levels maximum.
10. **Exact-head convergence** — semantic/runtime/browser/launcher plus 10,000-scenario saturation.

## Explicit deferrals

Not required for this closure release: generic workflow engine, event-sourcing rewrite, graph database, PostgreSQL migration, global GraphSlice AI, universal Assertion graph, full delegation/SoD, synthetic compliance score. Those can only build on a closed write/version/projection substrate.

## Evidence boundary

Model saturation and repository/runtime/browser tests are E2 engineering evidence. They are not independent legal, certification, penetration-test, accessibility or E4 human-comprehension evidence.
