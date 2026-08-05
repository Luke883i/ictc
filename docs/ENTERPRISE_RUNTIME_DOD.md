# ICTC v1.7 enterprise runtime Definition of Done

## Scope

The path starts from `main` merge commit `448d4a70` (PR #14) and targets an enterprise-oriented runtime prototype. It does not claim production certification or replace deployment controls.

## Runtime slices

### 1. Identity and authorization

- A runtime user directory exists.
- Supported roles are administrator, user and auditor.
- Trusted identities must be provisioned, active and role-consistent.
- User creation, role changes and disable/enable actions are audited writes.
- Local identity remains a demo boundary and is visibly separated from enterprise identity.

### 2. AI governance and consumption

- Every AI trace contains provider or estimated token usage and estimated cost.
- Monthly budget, warning threshold, model allowlist and token rates are configurable.
- Budget exhaustion and non-allowlisted models fail closed before a provider call.
- Usage is derived from the same evidence-bearing traces already attached to missions, runs, contributions and incidents.
- Provider-reported usage and estimated usage are distinguishable.

### 3. Monitoring journey

- Objective preservation, AI planning, revision, activation, scheduled/manual run, pause/resume, candidate review and evidence export remain separate states.
- New observations invalidate stale source decisions.
- Operational failures preserve the mission and create a recoverable state.

### 4. Incident journey

- Original narrative and attachments are preserved before AI processing.
- Questions remain progressive and motivated.
- AI suggestions require human adoption or correction.
- Formulation versions, digest confirmation, submission and closure remain distinct writes.
- Incident deadlines are advisory and never represented as a legal conclusion.

### 5. Administration and design system

- A control center exposes readiness, AI usage, governance and user lifecycle.
- Design tokens define typography, color, spacing, radius, focus and elevation.
- The admin control plane is responsive, keyboard reachable and does not create a separate scaffold application.
- Operational services remain monitoring and incidents; administration is a control plane, not a third business service.

### 6. Readiness and saturation

- Construction set: `M=96` journey and control scenarios.
- Confirmation set: another 100 iterations.
- Novel primitives after M must equal zero.
- Runtime readiness dimensions must each be at least 99 in the deterministic reference scenario.
- Artifacts include the readiness score, usage summary, primitive count and novelty result.

## Quantitative gates

| Dimension | Target |
|---|---:|
| Identity readiness | >=99% |
| AI governance readiness | >=99% |
| Monitoring readiness | >=99% |
| Incident readiness | >=99% |
| Evidence readiness | >=99% |
| Accessibility readiness | >=99% |
| Operations readiness | >=99% |
| Novel primitives in M+100 | 0 |
| Write receipt coverage | 100% |
| Human authority coverage | 100% |
| Role leakage | 0 |
| Budget bypasses | 0 |
| Unprovisioned trusted identities accepted | 0 |

## Deployment boundary

The following remain external acceptance criteria before a production declaration: enterprise IdP integration, TLS termination, secret manager, malware scanning and quarantine, durable database and backup, disaster recovery, rate limiting, centralized logging, metrics and alerting, independent penetration testing, legal review and moderated usability/accessibility testing with representative users.
