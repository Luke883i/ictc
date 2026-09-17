# DEMO Evidence Lattice 3.0

## Intent

DEMO Suite 3.0 is the canonical synthetic DEMO dataset selected by `npm run demo`. It materializes the seven native ICTC procedure populations and exposes Evidence Lattice 3.0 as a derived read-only annual graph.

Canonical authority is:

`DEMO Suite 3.0 dataset -> native seven-procedure runtime state -> derived read-only Evidence Lattice 3.0`

Suite 2.2 is deprecated. It remains only as a generator/regression lineage used to reconstruct the promoted 3.0 corpus; it is not the active DEMO runtime authority and its marker is rejected by the 3.0 materializer.

## Dataset boundary

Suite 3.0 persists exactly 188 synthetic business records across the seven native procedures:

- monitoring: 9;
- incidents: 18;
- objects: 63;
- coverage: 36;
- actions: 27;
- risks: 21;
- assurance: 14.

Every persisted business record carries Suite 3.0 `scenarioId`, `datasetId`, `datasetVersion` and `datasetAuthority`. The former 2.2 identity, where relevant, survives only as explicit deprecated lineage (`sourceScenarioId` / `legacySource`).

The 512 stress fixtures are test-only. They are not persisted in the normal DEMO runtime and are not exposed as business records. Mutation campaigns are also test/CI evidence only.

## Closed annual model

The lattice covers one operating year, 12 months and four quarters. It keeps separate identities for organization, periods, procedures, actors, native business subjects, events, human decisions, claims, evidence and circumstances. Typed cross-subject links remain correlations only: `causal:false` and `authorityTransfer:'none'`.

Evidence levels are abstraction levels, not strength scores: E0 source/reference, E1 observation, E2 governed record, E3 human decision, E4 verified operational outcome and E5 portfolio/annual view.

Epistemic states preserve observed, declared, proposed, derived, decided, verified, unknown, external and stale without promotion by adjacency. Hard boundaries include `proposed != decided`, `mapped != compliant/effective`, `completed != verified closure`, `rating != objective probability/legal nature`, `evidence != conclusion`, `internal approval != independent assurance`, and `correlation != causation`.

## Runtime surface

`GET /api/demo/evidence-lattice` is available only when the active runtime is Suite 3.0. It is read-authorized and never mutates the store. The adapter preserves the existing lattice builder as implementation lineage while publishing Suite 3.0 as source suite and dataset authority.

## Falsification

The cutover rail verifies the real Suite 3.0 materializer and an actual local server start through the canonical `demo` bootstrap path. A dedicated deterministic campaign executes exactly 1,000,000 cutover mutations over dataset identity, runtime isolation, exclusive business population, support provenance, stress exclusion, legacy deprecation and lattice authority.

The existing 10,000,000 ontology/epistemic lattice mutation campaign remains as a regression rail. These campaigns are repository/model evidence; they are not millions of users, companies, legal analyses or independent runtime deployments.
