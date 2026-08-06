# ICTC

**Integrated Compliance Tower Control** is an evidence-first workspace for two governed processes:

1. **Regulatory monitoring** — preserve the objective, obtain an AI-proposed plan, review it, activate a canonical monitoring mission, inspect candidate sources and record a reasoned human decision.
2. **Events and incidents** — preserve the original description and attachments, separate AI extraction from human confirmation, version the final formulation and retain linked evidence.

The application roles are `admin`, `user` and `auditor`. The server returns explicit capabilities and a canonical access profile; the UI projects available actions, prohibited actions, state effects and evidence from that server-issued authority. AI output remains assistive and never determines applicability, compliance, significance or notification duties.

## ICTC 1.4 stable

The application opens on one compact, role-aware Home. It presents one contextual primary action and answers eight decision questions: what, why now, why me, how, expected outcome, AI role, human checkpoint and evidence.

A progressive **Accesso e responsabilità** disclosure also states:

- the active identity and access mode;
- what the actor can and cannot do;
- which state effects are possible;
- which receipts, versions and traces remain available.

The disclosure is open by default for the auditor. The administrator receives read/write authority, the user receives read/contribute authority and the auditor remains read-only. Material, candidate or verified sources, and evidence remain separate concepts.

The visual system uses common enterprise components with compact geometry, hairline separation and progressive disclosure. Desktop action space is reduced, decision explanations are denser, touch and keyboard targets remain at least 44 px, and decorative route numbering is removed.

See `docs/STABLE_1_4_AUDIT.md` and `v3/stable-1-4-contract.json`.

## Enterprise T assurance

The repository includes an executable enterprise engineering profile across 18 dimensions. Each dimension is saturated over 1,440 declared construction scenarios, frozen at N, challenged with 15 additional stress scenarios, checked against 12 convergent universal invariants and subjected to source probes, selected runtime stress and explicit falsification.

The bundle adapts the rigor and control patterns of recognized enterprise standards without claiming certification or reproducing proprietary standard text. Its visual principle is rich but compact: common enterprise components, restrained hierarchy, progressive disclosure and intentional space rather than oversized heroes or empty vertical bands. See `docs/ENTERPRISE_T_ASSURANCE.md`.

The ICTC 1.4 experience model separately enumerates 23,328 role, state, viewport, network, evidence and authority scenarios. After a 64-scenario stability window, N is 23,392; the N+100 tail must introduce zero new behavioral primitives.

## Semantic Workbench

The read-only endpoints below project the canonical runtime state; they do not introduce another monitoring model or scheduler:

```text
GET /api/workbench/meta
GET /api/workbench/metrics
GET /api/workbench/graph
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

Release `1.4.0` includes executable enterprise and journey contracts, a server-issued authority profile, a compact actor-aware Home, claim manifests, canonical semantic projection and model-bounded saturation artifacts.

## Enterprise boundary

Repository checks and browser journeys do not certify a production deployment or provide a legal opinion. `enterprise-ready` remains blocked until explicit external evidence exists for trusted identity, TLS, durable storage, backup restore, malware scanning, observability, dependency review and human accessibility validation. See `docs/ENTERPRISE_CONVERGENCE_DOD.md`, `docs/ENTERPRISE_T_ASSURANCE.md` and `docs/STABLE_1_4_AUDIT.md`.
