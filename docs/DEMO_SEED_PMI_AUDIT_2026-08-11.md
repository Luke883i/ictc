# Demo seed PMI italiana — audit e contratto di convergenza

Baseline: `main@91ac3f6d91808b95f2ac704d76febd3eec1f7c3c` (merge PR #68).

## Intent

Aggiungere una modalità demo esplicita e isolata che popoli ICTC con un dataset sintetico realistico per una PMI italiana, usando gli stessi owner runtime e gli stessi normalizzatori dei sette Processi di Compliance. Il dataset non deve diventare una seconda autorità, non deve contaminare lo state standard e non deve trasformare dati sintetici in conclusioni di compliance.

## Baseline osservata

- launcher authority: `ictc.sh`;
- runtime entrypoint: `v3/server.mjs`;
- canonical mutable state: `Store` + SQLite;
- seven business procedures: monitoring, incidents, objects, coverage, actions, risks, assurance;
- multi-subject transactions already materialize AFTER-state subject versions for declared semantic subjects;
- current launcher has no demo command or demo runtime isolation;
- current server has no demo bootstrap gate;
- current procedure normalizers are distributed across native runtime modules rather than a demo fixture layer.

## Company archetype

Synthetic organization: **Officine Aurora S.r.l.**, manufacturing/industrial-services SME in Emilia-Romagna, approximately 90 employees, one production site plus a small commercial office, Microsoft 365, cloud ERP, payroll provider, managed IT supplier, B2B customer portal, mixed Windows endpoints, local production network, EU customers and suppliers.

This archetype is a plausibility scaffold only. Tracked legal/standard references are declared inputs and never evidence that a rule applies to the organization.

## Target dataset

Exactly 100 primary records per canonical business procedure:

- RN-01 monitoring: 100 missions;
- EC-01 incidents: 100 incidents / near misses / observations;
- AO-01 objects: 100 working-registry objects;
- MC-01 coverage: 100 declared-universe mappings;
- AP-01 actions: 100 corrective actions;
- RC-01 risks: 100 risk scenarios;
- AR-01 assurance: 100 assurance cases.

Total primary procedure records: **700**. Cross references must connect monitoring/incidents/coverage to objects/actions/risks/assurance without importing decisions, legal applicability, control effectiveness or assurance conclusions across procedures.

## Safety and epistemic invariants

1. `./ictc.sh demo` and `./ictc.sh start --demo-seed` use a demo-specific runtime directory by default.
2. Standard `./ictc.sh start` never enables or reads demo mode implicitly.
3. Seed is idempotent and fingerprinted; a completed identical seed is a no-op.
4. Demo seeding refuses to populate a non-demo business state.
5. Every synthetic business record carries explicit `synthetic-demo` provenance.
6. Human-looking decisions are attributed to a named demo persona and remain explicitly synthetic.
7. AI is not invoked to create seed decisions.
8. GRC objects/mappings/actions/risks/assurance use native normalizers and native review/adoption functions.
9. Cross-procedure links preserve provenance only; they do not inherit rating, applicability, effectiveness or approval.
10. Risk normative facets arise only from an explicitly registered mapping reference; `legalClassification` remains undefined.
11. Assurance approval in demo means only that the synthetic response set passed the native human approval contract.
12. The seed is persisted through `Store.mutate`; no direct JSON/SQLite injection becomes a hidden write authority.
13. Multi-subject batch size remains <=32 semantic subjects so every seeded business subject gets a canonical AFTER-state version occurrence.
14. Runtime bootstrap exposes demo posture only as descriptive metadata, not as a compliance verdict.

## Saturation contract

- 100,000 deterministic diversified seed scenarios over procedure, archetype, lifecycle, relation, owner, normative-reference and evidence dimensions;
- zero target invariant violations;
- 100,000 deterministic mutations;
- every injected mutation must be killed by the demo invariant detector;
- explicit mutation families include missing provenance, procedure count drift, duplicate IDs, broken references, target not active, illegal AI/human authority upgrade, inferred legal classification, non-demo runtime contamination and non-idempotent fingerprint drift.

This is bounded engineering evidence over the declared demo model. It does not establish realism for every Italian SME, legal applicability, compliance, control effectiveness, certification, security of a deployment or independent assurance.
