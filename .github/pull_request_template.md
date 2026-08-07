## Human outcome
What can a person understand, decide or complete after this change?

## Epistemic boundary
- Inputs:
- Producer:
- OutcomeEnvelope / state transition:
- Limitations:
- Receipt/readback:
- Forbidden equivalences checked:

## Scope
- In scope:
- Non-goals:

## Validation
- [ ] `npm run check`
- [ ] `node v3/authority-contract-check.mjs`
- [ ] `node v3/docs-command-contract-check.mjs`
- [ ] `npm test`
- [ ] `npm run release:check` when this PR is a release candidate
- [ ] relevant browser/UI GitHub checks inspected on the exact PR HEAD when UI is affected
- [ ] keyboard/reduced-motion path reviewed when UI is affected
- [ ] no new visible control without wiring manifest entry
- [ ] no AI path can mint human-reviewed, human-owned or verified state

## Deployment and rollback
- Migration impact:
- Rollback path:

## GOV-01F — Free/private compensating governance
- [ ] PR branch is not `main`/`master` and follows the repository branch convention
- [ ] exact PR HEAD SHA observed before merge
- [ ] `governance-free-private` green on the exact PR HEAD
- [ ] all `requiredPreMergeChecks` from `.github/gov-01f-policy.json` green on that HEAD
- [ ] merge performed through the GitHub PR flow; no direct push to `main`
- [ ] post-merge `main` SHA and `requiredPostMergeChecks` will be observed and recorded

> Boundary: GOV-01F is compensating governance. It does not make `main` server-side protected.
