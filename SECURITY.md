# Security Policy

## Supported version
Security fixes target the current `main` branch and the latest tagged stable release.

## Reporting a vulnerability
Do not publish suspected vulnerabilities, credentials, private data or exploit details in a public issue. Use GitHub private vulnerability reporting when it is enabled for this repository. If private reporting is unavailable, contact the repository owner through a private channel listed on the maintainer profile and include only the minimum information needed to reproduce the issue.

A useful report includes the affected commit/version, threat scenario, reproduction steps, expected versus observed behavior and any evidence that the issue crosses an authorization, integrity, confidentiality or availability boundary.

## Deployment boundary
ICTC is application software, not a complete security perimeter. Production operators remain responsible for TLS termination, trusted identity, secret management, host and network security, backups and restore tests, malware scanning, dependency management, monitoring, incident response and applicable privacy/security controls.

Never place an untrusted deployment directly on the public Internet solely because repository tests are green. Repository evidence demonstrates bounded software properties; deployment assurance requires deployment-specific evidence.
