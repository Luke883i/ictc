# Security Policy

## Supported code

Security fixes target the current `main` branch and, when present, the latest tagged stable release. A green repository CI run is bounded software evidence, not a deployment certification.

## Reporting

Do not publish suspected vulnerabilities, credentials, personal data or exploit details in a public issue. Prefer GitHub private vulnerability reporting when enabled; otherwise contact the repository owner privately with the minimum reproducible information: affected commit/version, threat scenario, steps, expected/observed behavior and the authorization/integrity/confidentiality/availability boundary crossed.

## Runtime boundaries

ICTC defaults to loopback binding. Network exposure and trusted-header identity are guarded by runtime checks and must not be enabled by treating a reverse proxy header as inherently trustworthy. TLS termination, proxy hardening and trusted identity remain deployment responsibilities.

API abuse control is layered: a coarse tenant + remote edge budget protects the pre-authentication path, while authenticated trusted-header traffic is additionally isolated by tenant + subject. These in-process budgets are not a distributed multi-host rate-limit authority; horizontally scaled deployments require deployment-specific abuse-control evidence.

AI egress is governed by explicit network policy and SSRF/rebinding defenses. `ICTC_ALLOW_PRIVATE_AI` and `ICTC_ALLOW_INSECURE_AI` are independent opt-ins: authorizing private destinations does not authorize cleartext HTTP. AI remains proposal-only and does not gain write authority from network availability.

Attachments are stored with restrictive local permissions and carry a trust posture. Attachment identifiers are canonicalized as single path segments before filesystem resolution. Registration, checksum or download does not mean malware-clean; production operators remain responsible for scanning/quarantine controls appropriate to the deployment.

## Persistence and integrity

Current local persistence is SQLite/WAL with `synchronous=FULL`, a mutable current snapshot and append-oriented audit/semantic tables. The runtime verifies hash-linked audit state binding, semantic manifests, EpistemicStep bindings and readback after writes.

These controls detect bounded classes of accidental or application-level divergence. They are not WORM storage, qualified signatures, trusted timestamps or protection against a privileged attacker able to replace both data and verification code. Backup integrity and restore drills are operator responsibilities.

## Evidence export

PDF, XML, Markdown and ZIP evidence representations are `same-as-read`; they must never widen record visibility. They carry technical lineage and limitations. Exported receipts can support audit work but do not automatically establish authenticity of external facts, legal admissibility or compliance.

## CI security posture

The security workflow unconditionally runs dependency audit, the first-party security SAST rail, the runtime security DoD, targeted implementation mutants, the deterministic 1M remediation saturation and a Chromium FI-01 DOM regression. CodeQL remains supplemental and conditional on `ICTC_ENABLE_GHAS == 'true'`; when skipped it must be reported as **not executed**, not as a passing CodeQL result.

First-party SAST is deliberately bounded to repository security-sensitive sinks and is not equivalent to an independent commercial SAST product. GitHub check conclusions remain the execution authority for CI runs.

## Deployment boundary

ICTC is application software, not a complete security perimeter. Production operators remain responsible for at least: TLS, trusted identity, secret/KMS management, host/network hardening, distributed abuse controls where multiple instances exist, backups and restore tests, malware scanning, dependency response, centralized logging/monitoring, incident response, availability/HA and applicable privacy/security controls.

Never expose an untrusted installation directly to the public Internet solely because repository tests are green. Deployment assurance requires deployment-specific evidence.
