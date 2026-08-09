# Contributing to ICTC

ICTC is an evidence-first compliance operations project. Contributions are welcome when they preserve bounded claims, human decision authority and process-specific semantics.

## Before changing code
1. Describe the business or engineering problem and the affected process/capability.
2. Identify the semantic authority being changed: process definition, runtime state, decision, evidence, access, presentation or deployment readiness.
3. Prefer a minimal semantic slice over a cross-cutting rewrite.
4. Add or update an executable falsifier for the claim being introduced.

## Pull requests
A pull request should contain one or more small semantic commits. Each commit should state what invariant it changes. The PR description should include scope, non-goals, claim boundaries, tests run and any deployment assumptions.

Do not introduce a second source of truth for a process, state, relation, decision or evidence concept. Do not convert AI output into an operational or legal conclusion without a recorded human checkpoint.

## Testing
At minimum run the relevant syntax, contract and runtime checks. Changes affecting the stable experience should also run:

```bash
node v3/v1-stable-experience-saturation.mjs
node v3/v1-stable-process-hardening-check.mjs
```

Run broader repository gates when the change touches shared runtime, security, persistence, identity or evidence infrastructure.

## Compatibility and migration
Persistent identifiers and recorded decisions are audit-relevant. Breaking migrations require an explicit migration path and tests. Presentation labels may evolve, but persisted semantic identifiers should not be silently repurposed.

## Contributions and license
By submitting a contribution for inclusion in ICTC, you agree that it may be distributed under the repository's MIT License. Do not submit material you do not have the right to contribute.
