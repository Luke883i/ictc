# ICTC

**Integrated Compliance Tower Control** is an evidence-first workspace for two governed processes:

1. **Regulatory monitoring** — preserve the objective, obtain an AI-proposed plan, review it, activate a canonical monitoring mission, inspect candidate sources and record a reasoned human decision.
2. **Events and incidents** — preserve the original description and attachments, separate AI extraction from human adoption, version the final formulation and retain linked evidence.

The application roles are `admin`, `user` and `auditor`. The server returns explicit capabilities and the UI projects available actions from those capabilities. AI output remains assistive and never determines applicability, compliance, significance or notification duties.

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

Release `1.8.0-rc.1` adds an executable enterprise convergence contract, claim manifest, canonical semantic projection, capability-safe UX and a saturation artifact. The logical saturation model uses 18 threads, freezes primitives at each M and records zero novelty in each independent M+100 tail.

## Enterprise boundary

The runtime can be made **enterprise-certifiable**, but the repository cannot certify a deployment by itself. `enterprise-ready` remains blocked until explicit external evidence exists for trusted identity, TLS, durable storage, backup restore, malware scanning, observability, dependency review and human accessibility validation. See `docs/ENTERPRISE_CONVERGENCE_DOD.md`.
