# ICTC

**Integrated Compliance Tower Control** is an evidence-first workspace for two governed processes:

1. **Regulatory monitoring** — preserve the objective, configure a governed research job, obtain an AI-proposed plan, review it, activate the canonical mission, inspect candidate sources and record a reasoned human decision.
2. **Events and incidents** — preserve the original description and attachments, separate AI extraction from human confirmation, version the final formulation and retain linked evidence.

The application roles are `admin`, `user` and `auditor`. The server returns explicit capabilities and a canonical access profile; the UI projects available actions, prohibited actions, state effects and evidence from that server-issued authority. AI output remains assistive and never determines applicability, compliance, significance or notification duties.

## ICTC 1.8 Enterprise Workbench

Release `1.8.0` makes the two core processes equally visible and turns regulatory monitoring into an explicit governed job:

- **Panoramica** presents equal Research and Events lanes for every role; a recommendation can signal urgency but never hides the other process;
- **Ricerca normativa** supports job name, objective, cadence, mining mode, novelty baseline, fixed baseline date, jurisdictions, authority allowlist, change types and bounded result limit;
- the job profile is persisted with the canonical mission and sent to both AI plan generation and discovery;
- novelty remains a candidate comparison against the declared baseline, never a claim of complete discovery, applicability or legal effect;
- material intake has one canonical entry point and explicit Link, Text and Document modes while preserving the original separately from enrichment;
- **Eventi e incidenti** keeps intake and queue compact, with named `Apri fascicolo` and `Scarica evidenze` actions;
- the global AI dialog separates organization, provider connection and global policy, while job-specific policy remains in Regulatory Research;
- labels follow a lossless `object → state → action → effect` matrix and secondary why/how/AI/evidence detail remains progressively available.

The 1.8 model defines 12 T dimensions. Each T enumerates 15,552 multidimensional scenarios, freezes after a 64-case stability window at `M=15,616`, and requires zero novelty in the following 100 probes. Across all T dimensions this is 186,624 construction cases plus 1,200 tail cases, 187,824 total.

See `docs/ENTERPRISE_1_8_WORKBENCH_AUDIT.md` and `v3/enterprise-1-8-contract.json`.

## ICTC 1.7 Enterprise Clarity

Release `1.7.0` preserves the two operational services and the read-only **Guida e prova** support surface while reducing what competes for attention:

- one deterministic router owns Home, Monitoraggio, Eventi and Guida e prova;
- every surface has one primary action for the current context;
- Home shows priority, reason, effect and compact state; method, responsibility and metrics remain available in an internal context dialog;
- Monitoring and Events keep their core action visible and move explanation to native disclosure or internal dialog;
- Standard Proof opens summary-first and keeps architecture, journeys, benchmark mappings, glossary and limits in one read-only detail dialog;
- Administration presents posture first and keeps controls, usage, governance and directory in independent disclosures;
- canonical labels are already present in HTML before JavaScript enhancement;
- the post-merge keyboard race is covered by a dedicated browser journey.

The 1.7 model enumerates 87,480 scenarios, freezes after a 128-scenario stability window at `M=87,608`, and requires zero novelty in the following 100 probes. Visual budgets require one primary action per surface, a proof hero at most 320 px, a Home decision at most 340 px, 44 px targets and no document overflow.

See `docs/ENTERPRISE_1_7_VISUAL_AUDIT.md` and `v3/enterprise-1-7-contract.json`.

## ICTC 1.6 Standard Proof

ICTC keeps the compact role-aware Home introduced in 1.4 and adds one read-only support area: **Guida e prova**. It does not become a third operational service and does not create another domain model.

The area explains, in one navigable surface:

- what ICTC is and is not;
- the eight technical layers from experience to deployment;
- the monitoring, event, administration and audit journeys;
- the canonical difference between Materiale, Fonte, Evidenza, Fascicolo, Receipt and Trace AI;
- the standards and practices used as engineering benchmarks;
- the runtime controls currently supported by evidence;
- the deployment attestations that remain external blockers;
- the limits of every alignment statement.

Every benchmark mapping follows one rule: **principle → ICTC practice → evidence → limitation**. “Aligned” is never presented as “certified” or as legal compliance.

Administration receives one compact read-only **Postura e confini** panel with release, runtime controls, deployment gaps and evidence-chain status. No new administrative write workflow is added.

The final CSS layer resolves legacy aliases onto the canonical design-token vocabulary and adds explicit focus outlines, 44 px targets, forced-colors support, reduced-motion handling and responsive linearization.

See `docs/STANDARD_PROOF_1_6_AUDIT.md` and `v3/standard-proof-1-6-contract.json`.

## Assurance models

The repository retains the 1.4 experience contract, 1.6 Standard Proof, 1.7 Enterprise Clarity and Enterprise T as regression and assurance layers.

The 1.6 Standard Proof model separately provides:

- **M saturation:** 787,320 declared scenarios, a 128-scenario stability window, `M=787,448`, and zero novelty in the following 100 probes;
- **N compression:** 153 semantic inputs compressed into 124 canonical primitives and zero novelty in the following 100 probes.

These are bounded logical models, not a claim that all real users, browsers, assistive technologies or deployment conditions have been exhausted.

## Semantic Workbench

The read-only endpoints below project the canonical runtime state; they do not introduce another monitoring model or scheduler:

```text
GET /api/workbench/meta
GET /api/workbench/metrics
GET /api/workbench/graph
GET /api/standard-proof
```

Semantic labels are deterministic lexical observations with explicit limitations. Empty coverage is `null`, not a synthetic score.

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

Release `1.8.0` includes executable enterprise and journey contracts, governed regulatory jobs, server-issued authority, progressive detail, bounded saturation and browser evidence.

## Enterprise boundary

Repository checks and browser journeys do not certify a production deployment, standards conformance, legal compliance or complete regulatory discovery. `enterprise-ready` remains blocked until explicit external evidence exists for trusted identity, TLS, durable storage, backup restore, malware scanning, observability, dependency review and human accessibility validation. See `docs/ENTERPRISE_CONVERGENCE_DOD.md`, `docs/ENTERPRISE_T_ASSURANCE.md`, `docs/STABLE_1_4_AUDIT.md`, `docs/STANDARD_PROOF_1_6_AUDIT.md`, `docs/ENTERPRISE_1_7_VISUAL_AUDIT.md` and `docs/ENTERPRISE_1_8_WORKBENCH_AUDIT.md`.
