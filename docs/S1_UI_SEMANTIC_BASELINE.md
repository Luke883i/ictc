# S1 — UI-SEMANTIC-BASELINE

## Purpose

Collapse the historical browser stack into one active composition and establish the first incremental semantic API ratchet. This slice changes presentation authority and contract governance only; it does not change persistence, decision authority, relation semantics or the process registry.

## Before

The browser entrypoint installed multiple historical experiences in sequence (Stable 1.4, Standard Proof 1.7, Enterprise 1.7/1.8 and Enterprise 2), while `styles.css` imported the corresponding override cascade. Historical assurance checks required those layers to remain installed, so CI reinforced the layering.

## After

`app.js` installs exactly one `active-experience.js`. The active graph is composed from unversioned runtime modules: surface routing, actions, administration, capability projection, FI-01 and a canonical read-only proof surface. Historical UI files remain in the repository as regression fixtures but are absent from the runtime import graph.

The static shell title is version-neutral. Runtime release identity continues to derive from `/api/bootstrap` and `VERSION`.

Lifecycle state labels in the active renderer derive from `bootstrap.ontology.states`; classification vocabulary remains presentation-only.

## Semantic API ratchet

`semantic-api-contract.json` binds these already-stable bootstrap semantics:

- `capabilities` → actor permissions;
- `accessProfile` → server access projection;
- `experience.release` → `VERSION`;
- `ontology` → runtime ontology projection;
- `homeNextAction` → canonical server projection;
- `procedures` → canonical server procedure hub.

The checker proves schema shape, declared derivation bindings and procedure-to-ontology referential integrity for admin, user and auditor. It does not prove universal authorization correctness, legal applicability, compliance or substantive truth.

## Definition of Done

- [x] exactly one active experience composition;
- [x] zero historical versioned JS enhancers on the runtime import graph;
- [x] zero historical CSS override imports on the runtime import graph;
- [x] static shell contains no stale release/version branding;
- [x] active lifecycle labels derive from runtime ontology;
- [x] procedure hub renders the server projection instead of a browser-owned process catalog;
- [x] canonical proof surface reads `/api/standard-proof` without creating a second evidence authority;
- [x] semantic API baseline covers ontology, procedures, home-next-action, capabilities, access profile and release;
- [x] negative detector rejects a stale historical enhancer path;
- [x] historical UI artifacts remain parseable retained fixtures;
- [x] canonical browser journey covers admin → monitoring → human source decision → user contribution/event → auditor proof/read-only.

## Metrics

| Metric | Before | Target |
|---|---:|---:|
| active experience compositions | many sequential installers | 1 |
| historical runtime enhancer imports | > 10 | 0 |
| historical runtime CSS imports | > 10 | 0 |
| stale static shell version tokens | 1 | 0 |
| semantic API baseline coverage | 0 | 1 bounded contract |
| active browser-owned lifecycle label maps | 1 | 0 |

## Historical fixture policy

Versioned UI artifacts are retained to preserve lineage and model evidence. They are syntax-checked and presence-checked, but current CI no longer interprets "installed in app.js" as a success criterion. Reintroducing one onto the active graph fails `ui-active-experience-audit.mjs`.

## Post-merge weld to S2

After merge, re-observe exact `main` and run:

1. `node v3/ui-active-experience-audit.mjs`;
2. `node v3/semantic-api-contract-check.mjs`;
3. `node v3/historical-ui-fixture-check.mjs`;
4. canonical browser journey for admin/user/auditor;
5. scan the merged JS/CSS import graph.

S2 (`SEMANTIC-PROCESS-KERNEL`) may add process and relation semantics only through the canonical runtime kernel and must extend `semantic-api-contract.json`; it may not add another browser process catalog, bootstrap semantic authority or historical compatibility layer.

## Claim boundary

This slice demonstrates composition convergence and a bounded semantic contract. It does not make ICTC 2.0, production-ready, highly available, legally compliant, certified or externally assessed.
