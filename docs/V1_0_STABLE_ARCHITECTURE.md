# ICTC 1.0 stable - enterprise-candidate architecture

## Release intent
ICTC 1.0 stable is the first open-source distribution profile whose product promise is deliberately narrower than universal compliance and stronger than a prototype: operate seven bounded business-compliance capabilities with human authority, shared traceability and a minimal three-surface experience.

`1.0_stable` is a product release profile. It does not erase the V4 experimental lineage that produced the runtime semantics.

## Product compression
The end-user product has three permanent surfaces:

1. **Oggi** - work requiring attention now. It is not a second process catalog.
2. **Processi** - the single catalog of the seven business compliance processes, with compact status metrics and one role-aware entry action.
3. **Prove** - evidence, decisions, versions, limits and technical trace.

Administration, AI configuration, exports and deployment controls are contextual control-plane functions, not permanent peers of business work.

## Progressive disclosure
ICTC uses at most five disclosure levels. A level is an information-depth boundary, not a mandatory click sequence.

1. **Orientamento** - status, priority, process and next action.
2. **Lavoro** - process-specific workspace and current records.
3. **Dettaglio** - business record, relations, versions and rationale.
4. **Decisioni e prove** - human decisions, evidence references, limitations and AI provenance.
5. **Traccia tecnica** - audit events, receipts, hashes, raw epistemic structures and export.

Technical trace must not leak into levels 1-2. Evidence detail is normally level 4. Auditors may enter directly at level 4 without forcing operational users to see it first.

## Shared substrate, specific processes
ICTC does not impose one state machine on every process. Each process owns its lifecycle, transitions, checkpoints, exit semantics and temporal rules. Processes share only the substrate needed for trustworthy composition:

- identity and role/access projection;
- typed process identity and governed subject identity;
- human decision records bound to a subject version;
- declared/resolved evidence references without automatic claims of sufficiency;
- audit events, receipts and same-as-read evidence bundles;
- relation grammar and cross-process handoff registration;
- work/review registration;
- explicit claim boundaries and limitations;
- optional AI provenance with no decision authority.

## Seven bounded business processes
### RN-01 - Monitoraggio normativo
Observe sources and changes within the declared perimeter, preserve provenance, separate source review from human impact assessment, and create downstream work when needed. It does not determine legal applicability or normative completeness.

### EC-01 - Eventi e segnalazioni
Preserve the original account, collect justified clarifications, version the formulation and require human confirmation before submission/closure. It is a governed case/reporting workflow, not a SOC incident-response platform.

### AO-01 - Inventario di sistemi e oggetti
Maintain a governed working registry of relevant objects with declared authority, ownership, criticality, human review and typed relations. It does not assert completeness of the real environment or external master systems.

### MC-01 - Controlli e copertura
Govern coverage decisions over a declared universe, keeping mapped, gap, not-applicable and unresolved distinct. A mapping is not proof of control design or operating effectiveness.

### AP-01 - Azioni correttive
Turn a declared origin into owned work, separate adoption, execution and verified closure, and preserve evidence and decision history. Completion by the worker is not closure.

### RC-01 - Rischi di compliance
Preserve scenarios, separate proposals from human ratings, distinguish inherent/residual assessment and record a separate human treatment decision. Scores support management; they are not objective legal truth.

### AR-01 - Questionari e verifiche
Preserve the request, prepare a manual or assisted response set and require a human approval of a bounded, complete disposition of the current questions. Approval is not independent certification.

EV-01 Prove e tracciabilita is a transversal support plane, not an eighth business process.

## Cross-process rule
A downstream change may create **review-needed work**, but it must never silently rewrite a prior human conclusion. Examples: a new source observation can require impact review; a retired object can require mapping/risk review; a verified remediation can require risk or coverage reassessment; superseded evidence can require response review.

## Identity modes
Local role switching is a development convenience only. In trusted-header deployments, upstream identity is authoritative; the browser must not present role switching as a user capability.

## AI mode
AI is an accelerator, not an ontology. Disabling or losing the AI provider must not remove a business process or a human checkpoint. A specific automated feature may become unavailable if its implementation intrinsically uses the provider; that limitation must be explicit and a manual business path must remain available.

## Open-source boundary
The repository can demonstrate software semantics, internal integrity and bounded evidence. It cannot certify a deployment, an organization's compliance, external legal correctness, high availability, disaster recovery, accessibility conformance, security of an upstream proxy/IdP or suitability for a regulated production environment without deployment-specific evidence.
