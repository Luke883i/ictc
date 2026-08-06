# ICTC

**Integrated Compliance Tower Control** is an evidence-first workspace for two governed processes:

1. **Regulatory monitoring** — preserve the objective, obtain an AI-proposed plan, review it, activate a canonical monitoring mission, inspect candidate sources and record a reasoned human decision.
2. **Events and incidents** — preserve the original description and attachments, separate AI extraction from human confirmation, version the final formulation and retain linked evidence.

The application roles are `admin`, `user` and `auditor`. The server returns explicit capabilities and a canonical access profile; the UI projects available actions, prohibited actions, state effects and evidence from that server-issued authority. AI output remains assistive and never determines applicability, compliance, significance or notification duties.

## ICTC 1.7 Enterprise Clarity

Release `1.7.0` keeps the two operational services and the read-only **Guida e prova** support surface, while reducing what is always visible:

- one deterministic router owns Home, Monitoraggio, Eventi and Guida e prova;
- each surface exposes one primary action for the current context;
- Home shows priority, reason, effect and a compact status signal; method, responsibility and metrics move to an internal context dialog;
- Monitoring keeps its primary form but moves explanatory detail into a native disclosure;
- Events keeps `Registra evento` as the single primary action and moves process explanation into an internal dialog;
- Standard Proof opens summary-first and places architecture, journeys, twelve benchmark mappings, glossary and limits in one read-only detail dialog;
- Administration shows posture first and places controls, usage, governance and directory into independent disclosures;
- canonical labels are present in HTML before JavaScript enhancement;
- the post-merge keyboard race is addressed by the single surface router and verified by a dedicated browser journey.

See `docs/ENTERPRISE_1_7_VISUAL_AUDIT.md` and `v3/enterprise-1-7-contract.json`.

## Assurance models

The repository retains Reborn 3, 1.4 Stable, 1.6 Standard Proof and Enterprise T as regression and assurance layers.

The 1.7 model separately provides:

- **M saturation:** 87,480 declared scenarios, a 128-scenario stability window, `M=87,608`, and zero novelty in the following 100 probes;
- **visual budgets:** desktop proof hero at most 320 px, Home decision at most 340 px, 44 px minimum targets and one primary action per surface context;
- **browser evidence:** role journeys, deterministic keyboard navigation, progressive detail, Admin disclosure, auditor read-only posture and desktop/mobile overflow checks.

These are bounded engineering models, not a claim that all real users, browsers, assistive technologies or deployment conditions have been exhausted.

## ICTC 1.6 Standard Proof

The read-only support area explains what ICTC is and is not, the eight technical layers, the monitoring/event/administration/audit journeys, canonical terminology, standards used as engineering benchmarks, runtime controls, deployment attestations and the limits of every alignment statement.

Every benchmark mapping follows: **principle → ICTC practice → evidence → limitation**. “Aligned” is never presented as “certified” or as legal compliance.

## Semantic Workbench

The read-only endpoints below project canonical runtime state; they do not introduce another monitoring model or scheduler:

```text
GET /api/workbench/meta
GET /api/workbench/metrics
GET /api/workbench/graph
GET /api/standard-proof
```

## Run

Requires Node.js 22 or later.

```bash
npm ci
./ictc.sh start --no-open
```

Open `http://127.0.0.1:4173`.

## Verify

```bash
npm test
```

## Enterprise boundary

Repository checks and browser journeys do not certify a production deployment, standards conformance or legal compliance. `enterprise-ready` remains blocked until explicit external evidence exists for trusted identity, TLS, durable storage, backup restore, malware scanning, observability, dependency review and human accessibility validation. See `docs/ENTERPRISE_CONVERGENCE_DOD.md`, `docs/ENTERPRISE_T_ASSURANCE.md`, `docs/STABLE_1_4_AUDIT.md`, `docs/STANDARD_PROOF_1_6_AUDIT.md` and `docs/ENTERPRISE_1_7_VISUAL_AUDIT.md`.
