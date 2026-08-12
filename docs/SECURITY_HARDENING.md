# Security hardening and third-party verification

This document describes repository-level security controls implemented by ICTC and how a third party can falsify them. It is not a penetration-test report, certification, legal conclusion, or deployment attestation.

## Evidence boundary

Repository checks, deterministic simulations and GitHub CI are E2 engineering evidence. They can demonstrate that specific repository invariants are executable and repeatable. They cannot establish independent reviewer/oracle separation, production scanner efficacy, external KMS/HSM custody, server-side branch protection, approved RTO/RPO, production alert drills, or human assistive-technology evidence.

The machine-readable local DoD is `audit/security-enterprise-dod.json`. Reproduced breaker findings are recorded in `audit/security-attack-findings.json`. The M+10,000 run writes `artifacts/security-attack-saturation.json` and records the seed, family counts, false allow/deny counters, rolling family checksums, a global trace digest and representative witnesses.

## Security boundaries

### AI egress

AI HTTP(S) requests are DNS-resolved before connection and the selected address is pinned into the transport. Redirect destinations are re-resolved and revalidated. Private, loopback, reserved, transition and IPv4-mapped IPv6 targets are rejected unless the explicit local-development private-network opt-in is enabled. Provider response bodies have an application byte budget so a remote endpoint cannot force unbounded buffering.

### Tenant and identity authority

Tenant selection is derived from trusted proxy identity membership. The tenant router places a non-serialized request context on the request. After RBAC identity resolution, the authorized actor must independently reconcile to the already selected tenant through the actor subject or authorized groups. A deployment that configures different Shibboleth headers for routing and RBAC therefore fails closed instead of silently crossing tenant authority.

### Attachment and malware boundary

New attachment bytes enter the quarantine namespace. Clean trust is insufficient by itself: serving verifies the physical namespace and the recorded SHA-256/size. In multi-tenant mode, scanner trust must carry the signed tenant id; pre-tenant clean trust fails closed and requires re-attestation. Scanner attestations bind tenant id, attachment id, attachment digest, verdict, scanner id/version, signature database version and observation time. Malware detection quality remains the external scanner's responsibility.

### Recovery boundary

SQLite recovery points use the SQLite backup API. The attachment inventory is derived from the database snapshot, and each inventory item must exist in the exact physical namespace declared by that snapshot. Recovery does not search another namespace to heal a mismatch. Recovery objects use AES-256-GCM and the manifest uses HMAC-SHA-256 with separate keys derived from the configured 32-byte recovery key. Restore occurs into an absent staging target and verifies manifest authentication, ciphertext/plaintext digests, snapshot revision, audit head and canonical state digest before promotion.

### Export boundary

CSV exports preserve same-as-read authorization and neutralize spreadsheet formula prefixes `=`, `+`, `-`, and `@`, including when preceded by control or whitespace characters. JSON export semantics are not changed by this CSV-specific mitigation.

## Reproduction

Run these checks from the repository root with a supported Node runtime:

```text
node v3/security-enterprise-dod-check.mjs
node v3/tenant-identity-coherence-check.mjs
node v3/attachment-scanner-tenant-check.mjs
node v3/csv-export-security-check.mjs
node v3/ai-network-policy-check.mjs
node v3/runtime-enterprise-boundaries-ci.mjs
node v3/runtime-enterprise-boundaries-saturation.mjs
node v3/security-attack-saturation.mjs
npm run test:current:semantic
npm run test:current:runtime
```

GitHub's `runtime-enterprise-boundaries` workflow repeats the runtime falsifiers on Ubuntu and Windows with Node 22 and 24, and runs both the original one-million-scenario boundary saturation and the additional M+10,000 security saturation.

## Residual enterprise work

The remaining assurance work is deliberately external or not yet complete: protected `main` and independent review; commit/release signing and provenance; production KMS/HSM custody and active datastore encryption strategy; production malware-engine evidence; distributed rate limiting and capacity/SLO evidence; off-host recovery drills with approved RTO/RPO; centralized telemetry and alert/error-budget drills; versioned AI evaluation/drift rollback gates; API pagination/capacity contracts; and independent human accessibility testing.
