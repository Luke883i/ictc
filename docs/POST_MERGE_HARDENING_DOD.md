# ICTC v1.6 post-merge hardening Definition of Done

## Scope

This path starts from `main` after merge commit `95170c8a` (PR #13) and ends at a local-first working prototype whose security and evidence boundaries are explicit, tested and fail-closed.

## Epistemic closure

ICTC may attest only operations recorded by its runtime: preserved inputs, AI requests and output digests, human decisions, versions, receipts, lineage and evidence bundles. It does not attest substantive truth, legal applicability, compliance, notification duties, qualified signatures, certified timestamps or production-grade identity.

## Complete slices

### 1. Runtime identity and bind boundary

- Local identity accepts loopback clients only.
- Local actor identifiers are runtime-owned and cannot be supplied by the client.
- Non-loopback binding is rejected by default.
- Network binding requires trusted-header mode, explicit opt-in and a proxy secret of at least 32 characters.
- Trusted identity requests require role, actor ID and constant-time proxy-secret verification.
- Negative checks cover spoofed IDs, remote local-mode clients, missing proxy secret and unsafe binding.

### 2. AI network boundary

- Only HTTP(S) provider URLs are parsed; embedded URL credentials are rejected.
- Cleartext HTTP requires explicit local/private or insecure-provider opt-in.
- Every destination is DNS-resolved before the request.
- Loopback, private, link-local, carrier-grade NAT, benchmark, multicast and reserved addresses are rejected unless private AI is explicitly enabled.
- Redirects are manual, limited and revalidated destination by destination.
- Negative checks cover DNS-to-loopback, metadata address, private IPv4/IPv6, cleartext provider and redirect pivot.

### 3. Attachment replay boundary

- Attachment writes remain all-or-cleanup on partial filesystem failure.
- A replayed command returns the original envelope.
- Attachments materialized by a replay are deleted before the response.
- Contribution and incident replay return HTTP 200 rather than representing a new creation.
- Runtime checks prove that attachment counts remain unchanged after replay.

### 4. Saturation and evidence

- Hardening scenarios are enumerated to `M=64`.
- The primitive set is frozen at M.
- Another 100 cases are evaluated against the frozen set.
- New primitives after M must equal zero.
- The report is emitted as `artifacts/hardening-saturation.json` and uploaded by the existing contract/audit workflow.

## Quantitative DoD

| Gate | Target |
|---|---:|
| Local identity accepted from non-loopback | 0 |
| Client-controlled actor IDs in local mode | 0 |
| Accidental non-loopback binds | 0 |
| Unauthenticated trusted-header requests accepted | 0 |
| AI redirects not revalidated | 0 |
| Private/reserved AI destinations accepted without opt-in | 0 |
| Orphan attachments after successful command replay | 0 |
| New hardening primitives in M+100 validation | 0 |
| Existing product, journey, evidence and runtime gates retained | 100% |

## Prototype boundary

The resulting version is a local-first prototype. Network deployment is supported only behind an explicitly configured identity proxy and still requires deployment-specific controls such as TLS termination, secret management, rate limiting, malware scanning/quarantine, backup, observability and human usability validation.
