# Contributing to ICTC

ICTC is an evidence-first compliance operations project. Contributions are welcome when they preserve bounded claims, human decision authority and process-specific semantics.

## Start here

Read `docs/START_HERE.md` first. It routes current product, architecture, semantic, testing and governance authorities. `docs/documentation-manifest.json` classifies current, operating, policy, lineage, source-input and roadmap documents; file recency does not create authority.

## Percorso minimo prima del primo push

1. Scegli la route del cambiamento in `docs/START_HERE.md`; per il runtime distingui il percorso locale/compatibility da `enterprise-runtime`.
2. Crea un branch dedicato usando un prefisso ammesso dalla policy canonica `.github/gov-01f-policy.json`: `agent/`, `codex/`, `fix/`, `feat/`, `docs/`, `chore/`, `refactor/`, `test/`, `ci/`, `research/`, `dependabot/`. `dependabot/` è riservato agli aggiornamenti automatici; `main` non è un branch di lavoro.
3. Esegui prima il "feedback più vicino" della route; usa poi la rail di convergenza indicata.
4. Apri una PR dalla exact head corrente e usa il template; il verde di uno SHA precedente non vale per la nuova head.

La policy GOV-01F resta compensating governance: questi prefissi e i check repository non rendono `main` server-side protected.

## Before changing code or documentation

1. Describe the business or engineering problem and affected process/capability.
2. Identify the semantic authority being changed from `docs/authority-matrix.yaml`.
3. State the claim boundary and non-goals.
4. Prefer a minimal semantic slice over a cross-cutting rewrite or second source of truth.
5. Add or update an executable falsifier for the invariant introduced.
6. Update the documentation manifest when a current/policy/operating document or its lifecycle changes.

Do not convert AI output into an operational/legal conclusion without a recorded human checkpoint. Do not promote a prompt, roadmap, historical audit or slice DoD into current product authority by implication.

## Pull requests

Use `.github/PULL_REQUEST_TEMPLATE.md`. Keep semantic commits small. The PR description must identify affected authority, scope/non-goals, claim boundary, current rail, tests actually run, compatibility, residual risk and rollback. For stacked work, declare the prerequisite PR/branch explicitly.

## Human review handoff (repository E2 vs GitHub E3)

A reviewable PR must name its existing authority from `docs/authority-matrix.yaml`,
its bounded semantic change, positive and negative invariants, exact base/head SHA,
file diff, commands **actually executed** with results, residual debt, and rollback.
The PR template is the submission form, not an approval receipt. The reviewer
independently compares the diff with the canonical owner and reproduces critical
checks; the maintainer controls integration, not the business decision.

`docs/PRODUCT.md` owns product purpose; `docs/11_ARCHITECTURE.md` and the
executable runtime own AS-IS design; `v3/release-identity.json` owns the release;
`docs/documentation-manifest.json` classifies documents; `docs/convergence/`
plans changes but never rewrites Git's live facts. The deployment operator owns
operational controls and evidence; authorized business decision makers retain
human approvals. None of these roles is created by this documentation.

**Two non-equivalent review states:** `review-ready` means the candidate and its
receipts can be independently assessed; `review-enforced` requires live GitHub
branch rules, effective reviewer permissions, required checks and actual human
approval on the exact head. `GOV-01F` è un controllo compensativo, non branch protection server-side.
CODEOWNERS, a green CI, AI or a local
review simulation do not establish `review-enforced` or E4 deployment assurance.
See `GAP-022` / E3-GOV and `GAP-012` / E3-HUMAN in `v3/gaps.json`.

## Testing

At minimum:

```bash
npm run docs:check
npm test
npm run release:check
```

Run `npm run docs:saturation` when changing the documentation lattice, manifest, authority routing or community-health surfaces. Run broader targeted gates when touching shared runtime, security, persistence, identity, evidence or UI composition.

A green CI/model campaign is bounded software evidence. It does not establish deployment assurance, legal compliance, branch-protection configuration or independent assurance.

## Security and support

Never publish suspected vulnerabilities, credentials, personal data or exploit details in a public issue. Follow `SECURITY.md`. Use public issues only for non-sensitive reproducible defects or bounded change proposals; support scope is in `SUPPORT.md`.

## Compatibility and migration

Persistent identifiers and recorded decisions are audit-relevant. Breaking migrations require an explicit migration path and tests. Presentation labels may evolve, but persisted semantic identifiers must not be silently repurposed.

## Contributions and license

By submitting a contribution for inclusion in ICTC, you agree that it may be distributed under the repository's MIT License. Do not submit material you do not have the right to contribute.
