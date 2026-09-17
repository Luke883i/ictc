# DEMO Evidence Lattice 3.0

## Intent

DEMO Evidence Lattice 3.0 turns the canonical Suite 2.2 operating-year runtime into a queryable annual graph without creating an eighth business procedure or a second write authority.

Authority remains:

`Suite 2.2 fixture -> native seven-procedure constructors/checkpoints -> canonical runtime state -> derived read-only Evidence Lattice 3.0`

The lattice is a semantic projection. It does not rewrite RN-01, EC-01, AO-01, MC-01, AP-01, RC-01 or AR-01 records.

## Why

Suite 2.2 already provides 188 positive business records and a chronological native replay. The replay events are construction/checkpoint mechanics; they are not by themselves a first-class business graph. Lattice 3.0 makes the year inspectable through separate identities for subjects, events, decisions, claims, evidence, circumstances, periods, procedures and actors.

## Closed annual model

The model covers one operating year (12 months, 4 quarters) and preserves exactly the Suite 2.2 procedure census. Every business subject belongs to the synthetic organization, one native procedure and an operating period. Every edge resolves inside the graph.

First-class node kinds:

- organization, period, procedure and actor;
- native business subject;
- event and human decision;
- claim and explicit unknown;
- evidence reference;
- circumstance/context.

Typed cross-subject links are correlations only. They always carry `causal:false`, a declared basis and `authorityTransfer:'none'`.

## Evidence and epistemic lattice

Evidence levels are abstraction levels, not strength scores:

- E0 source/reference;
- E1 observation;
- E2 governed record;
- E3 human decision;
- E4 verified operational outcome;
- E5 portfolio/annual view.

Epistemic states preserve `observed`, `declared`, `proposed`, `derived`, `decided`, `verified`, `unknown`, `external` and `stale` without promotion by adjacency.

Hard anti-laundering boundaries include:

`observed != true in world`, `proposed != decided`, `mapped != compliant/effective`, `completed != verified closure`, `rating != objective probability/legal nature`, `evidence != conclusion`, `internal approval != independent assurance`, and `correlation != causation`.

## Runtime surface

The existing runtime handler registry mounts one read-authorized endpoint:

`GET /api/demo/evidence-lattice`

It returns 404 outside a Suite 2.2-derived demo graph and never calls `store.mutate`.

## Falsification

The exact-head rail first builds the real Suite 2.2 state and validates the full graph. It then executes 10,000,000 deterministic compact semantic-contract mutations, depth 1-4, across ontology, epistemic status, time, correlations and circumstances. Every declared family must be sampled and every mutant must be killed.

The 10M campaign is repository/model evidence. It is not 10M SMEs, users, browser sessions, independent full-state mutants, legal analyses or human-validity observations.
