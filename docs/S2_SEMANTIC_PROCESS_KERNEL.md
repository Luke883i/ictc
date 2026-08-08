# S2 — SEMANTIC-PROCESS-KERNEL

## Outcome

ICTC has one declarative runtime ProcessDefinition registry and one relation grammar. Runtime ontology and procedure projections derive names, codes, archetypes, role modes, action labels and claim boundaries from that registry. The browser remains a projection consumer.

## Authority

`process-kernel.json` is runtime semantic input consumed by `runtime/process-kernel.mjs`. `runtime/ontology.mjs` remains the canonical bootstrap ontology projection. This does not create a second authority: the kernel is compiled into the one runtime projection and is never interpreted independently by the browser.

## ProcessDefinition

Every process declares: stable id/code, archetype, service/control-plane placement, object types, accepted input classes, authority topology, role modes, decision checkpoint requirement, evidence behavior and claim boundary. Current definitions preserve RN-01, EC-01, EV-01, IA-01 and GA-01 plus the administration control plane.

## Relation grammar

The canonical active graph may use only declared relation ids. S2 introduces:

- `object-has-label`
- `monitoring-includes-label`
- `monitoring-observed-source`
- `material-enriched-into-source`

Unknown relations and invalid endpoint types are rejected.

## Scalability falsifier

`process-kernel-check.mjs` compiles an additional synthetic `monitor-review` ProcessDefinition and requires `expectedCoreEdits=0`. The synthetic definition reuses the existing archetype/runtime adapter and requires no new router, receipt model, decision model, evidence store or relation string.

## DoD

- one ProcessDefinition registry;
- four canonical archetypes;
- one runtime relation grammar;
- procedure hub derives semantic identity/copy/role modes from ProcessDefinition;
- ontology projection exposes process archetypes and relations;
- semantic API ratchet advanced to 1.1.0;
- ad-hoc relation rejected;
- invalid relation endpoint rejected;
- synthetic monitor-review process compiles with zero core semantic edits;
- no persistence or human-authority change.

## Weld to S3

S3 may extend the relation grammar with lineage/checkpoint/decision relations and may introduce a generic DecisionRecord projection. It must not create local relation strings or reinterpret ProcessDefinition authority topology.
