# Security Policy

## Supported code

Security fixes target the current `main` branch and, when present, the latest tagged stable release. A green repository CI run is bounded software evidence, not a deployment certification.

## Reporting

Do not publish suspected vulnerabilities, credentials, personal data or exploit details in a public issue. Prefer GitHub private vulnerability reporting when enabled; otherwise contact the repository owner privately with the minimum reproducible information: affected commit/version, threat scenario, steps, expected/observed behavior and the authorization/integrity/confidentiality/availability boundary crossed.

## Runtime boundaries

ICTC defaults to loopback binding. Network exposure and trusted-header identity are guarded by runtime checks and must not be enabled by treating a reverse proxy header as inherently trustworthy. TLS termination, proxy hardening and trusted identity remain deployment responsibilities.

AI egress is governed by explicit network policy and SSRF/rebinding defenses. AI remains proposal-only and does not gain write authority from network availability.

Attachments are stored with restrictive local permissions and carry a trust posture. Registration, checksum or download does not mean malware-clean; production operators remain responsible for scanning/quarantine controls appropriate to the deployment.

## Persistence and integrity

Current local persistence is SQLite/WAL with `synchronous=FULL`, a mutable current snapshot and append-oriented audit/semantic tables. The runtime verifies hash-linked audit state binding, semantic manifests, EpistemicStep bindings and readback after writes.

These controls detect bounded classes of accidental or application-level divergence. They are not WORM storage, qualified signatures, trusted timestamps or protection against a privileged attacker able to replace both data and verification code. Backup integrity and restore drills are operator responsibilities.

## Evidence export

PDF, XML, Markdown and ZIP evidence representations are `same-as-read`; they must never widen record visibility. They carry technical lineage and limitations. Exported receipts can support audit work but do not automatically establish authenticity of external facts, legal admissibility or compliance.

## CI security posture

The repository always runs dependency audit and the ICTC static-analysis-posture gate in the security workflow. CodeQL is conditional on the repository variable `ICTC_ENABLE_GHAS == 'true'`; when the job is skipped it must be reported as **not executed**, not as a passing SAST result.

## Deployment boundary

ICTC is application software, not a complete security perimeter. Production operators remain responsible for at least: TLS, trusted identity, secret management, host/network hardening, backups and restore tests, malware scanning, dependency response, centralized logging/monitoring, incident response, availability/HA and applicable privacy/security controls.

Never expose an untrusted installation directly to the public Internet solely because repository tests are green. Deployment assurance requires deployment-specific evidence.
