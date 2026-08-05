# ICTC honest enterprise runtime DoD

## Objective

ICTC must never represent a capability as ready unless the runtime can point to evidence produced by the application or to an explicit deployment attestation. Missing infrastructure is a blocker, not a score of 90 or 99.

## Product journeys

- Monitoring preserves the objective before AI, exposes plan revision, activation, pause/resume, run failures, candidate review and evidence export.
- Incident handling preserves the original, asks motivated questions, records human adoption, versions wording, binds submission to a digest and requires a reason to close.
- Administration exposes identity lifecycle, AI governance, actual usage, operational attention and evidence-backed posture.
- Auditor access is read-only and administrative actions are absent.

## Honest-posture controls

Each control has: stable id, label, status, evidence, scope and a corrective action when blocked.

Runtime controls:
- active administrator and auditor;
- configured AI provider;
- positive AI budget;
- non-empty model allowlist;
- mandatory human approval;
- valid evidence chain;
- safe runtime binding.

Deployment attestations:
- enterprise identity provider;
- TLS;
- durable transactional storage;
- tested backup/restore;
- malware scanner and quarantine;
- centralized observability;
- dependency audit evidence;
- moderated accessibility/assistive-technology audit.

No deployment control may default to verified.

## Operational attention

The runtime must surface, from stored state:
- monitoring plans or runs in error;
- candidate sources awaiting a human decision;
- incidents not yet submitted or closed;
- AI budget at or above the configured warning threshold.

## Identity safety

- Trusted identities must be provisioned, active and role-consistent.
- User lifecycle writes return receipts.
- The last active administrator cannot be disabled or demoted.
- Auditor can inspect incidents and evidence but cannot write.

## Metrics

| Metric | Target |
|---|---:|
| Fake verified controls | 0 |
| Controls with evidence or corrective action | 100% |
| Last-admin lockout paths accepted | 0 |
| Administrative browser journey coverage | 100% of create, govern, disable, auditor projection |
| Monitoring and incident critical write receipt coverage | 100% |
| AI decisions requiring human authority | 100% |
| Role leakage in browser and API tests | 0 |
| Novel primitives in the 100 confirmation scenarios after saturation M | 0 |

## Saturation method

The scenario space is generated from independent axes: role, surface, lifecycle state, device, AI availability and evidence integrity. Construction continues until all resulting primitives are represented. A further 100 scenarios must introduce no new primitive. A repeated hard-coded list is not accepted as saturation evidence.

## Acceptance

The application may report `enterprise-ready` only when every runtime control and every deployment attestation is verified. Otherwise it reports `enterprise-blocked` and lists the blockers. This is intentionally stricter than the previous prototype score.
