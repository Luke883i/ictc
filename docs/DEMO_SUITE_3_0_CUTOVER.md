# DEMO Suite 3.0 cutover

`npm run demo` is the canonical entry point for DEMO Suite 3.0.

## Authority

The active DEMO authority is `demo-suite-3-0`. Suite 2.2 is deprecated and retained only as a generator/regression lineage. It must never appear as the active marker or projection authority of a Suite 3.0 runtime.

The active runtime directory is `.ictc/demo-runtime-3-0`. The old `.ictc/demo-runtime-2-2` directory is compatibility-only and cannot be reused for the new suite.

## Population

Suite 3.0 persists exactly 188 synthetic business records across the seven native ICTC procedures. Each carries `scenarioId=ictc-demo-suite-3-0`, `datasetId=ictc-demo-suite-3-0`, `datasetVersion=3.0` and `datasetAuthority=demo-suite-3-0`.

The old Suite 2.2 scenario identifier is retained only in explicit lineage fields (`sourceScenarioId` / `legacySource`). The runtime marker is `settings.demoSuite30`; `settings.demoSuite22` is rejected by the 3.0 materializer.

The 512 stress fixtures are not persisted. Evidence Lattice 3.0 is a read-only derived projection of the same 188 native records and does not create an eighth business procedure or a second write authority.

## Gates

The exact-head workflow executes the Suite 3.0 cutover contract, a real server E2E through the canonical `demo` bootstrap path, a 1,000,000-mutation cutover campaign, the retained Evidence Lattice regression checks and the existing 10,000,000 ontology/epistemic mutation campaign.

These gates support repository/runtime claims about the local DEMO contract only. They do not establish legal compliance, control effectiveness, independent assurance, external deployment quality or real-world representativeness.
