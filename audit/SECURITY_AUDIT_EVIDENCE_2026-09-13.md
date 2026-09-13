# Security audit evidence — 2026-09-13

## Statement metadata (epistemic contract)

- Claim class: engineering evidence (E2), observation and remediation record. Not a legal/compliance conclusion, not a certification, not external assurance.
- Epistemic status: human-authorized security review; automated deterministic evidence re-executed and transcribed by the agent; the single code fix was reviewed through the repository PR flow.
- Producer: GitHub Copilot cloud agent session on branch `copilot/affronta-pentest-stresstest`, directed and authorized by the repository owner (@Luke883i) for an explicit, circumscribed, traced security review.
- Inputs: full repository working tree at commit `fe36e5e` (post-fix head; pre-fix base `bc08485`), zero-third-party-dependency runtime under `v3/`, existing deterministic suites, GitHub-provided CodeQL scan.
- Timestamp: evidence produced 2026-09-13 (UTC), re-executed in-session on 2026-09-13 before transcription into this document.
- Receipt references: untracked JSON receipts regenerated under `artifacts/` (gitignored by design); their identifying digests are transcribed verbatim below. Receipts are reproducible by re-running the listed commands at this commit.
- Limitations: see “Claim boundary” at the end of this document. Nothing here upgrades an observation, score or receipt into a compliance verdict.

## 1. Scope of the review

Owner-directed pentest-style review of the whole repository, treating the draft PR as future `main`:

- Static/code review by a dedicated security-review specialist over: SQL construction, path traversal, SSRF on the AI egress, identity/tenancy, CSRF, ZIP/PDF/XML/CSV export boundaries, AI/LLM privilege boundary, CI workflow injection/permissions, dependency supply chain.
- Runtime/adversarial evidence via the repository's existing deterministic saturation and stress suites (re-executed, all green).
- Independent scans: `npm audit`, CodeQL (javascript).

## 2. Finding and remediation

### SEC-2026-09-13-01 — Stored HTML injection in FI-01 master-reference renderer

- Severity: MEDIUM (confidence 9/10). Class: stored markup injection (CWE-79 family), full XSS blocked only by CSP (`script-src 'self'`, no `unsafe-inline`, set in `v3/runtime/http.mjs`).
- Location (pre-fix): `v3/public/ui/fi01-reference.js:128`.
- Cause: `reference.masterSystem`, `reference.masterId`, `reference.masterVersion` — attacker-controlled free text accepted via `POST /api/internal-sources/reference` (`v3/runtime/contributions.mjs`, permission `contribute-source`) and normalized only for length/trim in `v3/runtime/internal-source-reference.mjs` — were interpolated into `innerHTML` without the repository's standard `esc()` HTML escaping.
- Attack scenario: a low-privilege contributor stores hostile markup that renders raw in the admin/auditor source-verification surface (UI spoofing/phishing inside the trust-critical human verification step; would become full stored XSS if CSP were ever loosened).
- Remediation: commit `fe36e5e` wraps all five interpolated fields (`masterSystem`, `masterId`, `masterVersion`, `contentSha256`, `referenceUrl`) in `esc()` from `v3/public/ui/common.js`, matching every sibling renderer.
- Regression guard: new case `FI01-08` in `v3/fi01-reference-check.mjs` asserts the escaping contract and rejects any unescaped `${reference.*}` interpolation in the renderer.
- Post-fix verification: `node v3/fi01-reference-check.mjs` → `ok (cases=9)`, cases FI01-00 … FI01-08 all passed (receipt: `artifacts/fi01-reference.json`, `result: passed`).

## 3. Code-review areas examined with no high-confidence exploitable findings

- SQL: all queries in `v3/sqlite-state-persistence.mjs` / `v3/hardened-persistence.mjs` use prepared statements with bound parameters; the single `LIKE` probe is gated by a strict `^[a-f0-9]{64}$` check.
- Path traversal: static serving resolves against `publicRoot` with prefix check after URL normalization; attachment reads resolve only server-generated IDs; `routeMatch` rejects decoded `/`, `\`, NUL in params.
- SSRF (AI egress, `v3/network-policy.mjs`): http(s)-only, credentials-in-URL blocked, private/reserved IPv4+IPv6 deny-list, DNS resolution pinned into the socket (anti-rebinding), no redirect following.
- Identity/tenancy: trusted-header mode requires ≥32-char proxy secret compared with `timingSafeEqual`; network binding refused without explicit opt-in + secret; tenant membership re-checked against resolved actor; role-header switching loopback-only.
- CSRF: cross-site writes blocked via `Sec-Fetch-Site`/Origin-vs-Host plus mandatory `application/json` content type.
- Export boundaries: `zipStore` strips leading slashes (no zip-slip); `xmlEscape`/`pdfEscape` correct for their contexts; `safeFilename` neutralizes `content-disposition` header injection; `csvCell` neutralizes formula injection.
- AI/LLM boundary: model output schema-validated; URL fields pass `normalizeUrl` (http/https only); results land in `candidate` state requiring human decision — AI output never reaches privileged writes (contract rule: AI output is always `proposed`).
- CI: actions SHA-pinned, `permissions: contents: read` (+`statuses: write` only), `persist-credentials: false`, no `pull_request_target`, no injectable untrusted expressions.
- Dependencies: zero third-party runtime dependencies; `npm audit` → `found 0 vulnerabilities`.

## 4. Deterministic adversarial / saturation evidence (re-executed at this head)

| Suite (command) | Scenarios | Result | Receipt reference |
| --- | --- | --- | --- |
| `node v3/security-attack-saturation.mjs` | 1,000,000 baseline + 10,000 mutation holdout = 1,010,000 | 0 false-allows, 0 false-denials, reconciled | `artifacts/security-attack-saturation.json`, seed `477896742`, traceDigest `966e25e328d82c7b56d245ff79407664897233497739ad3d8933466442951175` |
| `node v3/security-boundary-check.mjs` | boundary contract cases | ok | stdout receipt `security-boundary-check: ok` |
| `node v3/hardening-saturation.mjs` | M=64, M+100=164, primitives=9 | ok, validation novelty=0 | `artifacts/hardening-saturation.json` (total=164) |
| `node v3/deautopoiesis-adversarial-saturation.mjs` | 1,000,000 hostile scenarios, 8 families | ok, falseClosures=0 | `artifacts/deautopoiesis-adversarial-saturation.json`, uniqueSeedContract `sha256(deautopoiesis:index)` |
| `node v3/epistemic-lattice-saturation.mjs` | 24,000 primary + 2,000 holdout | 0 holdout anomalies; simplification mutants 11/11 killed | stdout receipt, seed `200027`, dynamicSignatures=66 |
| `node v3/native-semantic-lattice-3-2-stress.mjs` | lattice stress | ok | stdout receipt |
| `node v3/fi01-reference-check.mjs` | 9 cases (FI01-00…FI01-08) | passed | `artifacts/fi01-reference.json` |

Family-level checksums for `security-attack-saturation` (verbatim from the regenerated receipt): network-address-policy 250,000 (`98f913a9`); tenant-routing 250,000 (`f9a7884b`); abuse-budget 200,000 (`e10b46a1`); route-decoding 100,000 (`588df82b`); csv-formula-boundary 100,000 (`d7789f29`); scanner-tenant-replay 50,000 (`50277fb7`); attachment-trust-binding 50,000 (`a9c31b25`); holdout families csv 2,003 (`d261c140`), tenant 1,989 (`8d585143`), route 1,964 (`3c062f6a`), network 2,004 (`7949516b`), trust 2,040 (`3968f471`).

## 5. Regression and release evidence (re-executed at this head)

| Evidence | Result |
| --- | --- |
| `npm run check` (syntax-check 668 modules + BOOTSTRAP-0 contract) | ok |
| `npm run test:current` (current semantic + runtime release suite) | ok |
| `npm run test:runtime` (legacy runtime checks incl. evidence/export auth, v15 e2e + saturation) | ok |
| `npm run test:enterprise-t` (enterprise-t saturation, invariant convergence, audit, runtime stress 15 cases `completed-with-explicit-gaps`, falsification 10 hypotheses / 5 challenges `survived-with-bounded-claims`) | ok |
| `npm audit` | found 0 vulnerabilities |
| CodeQL security scan (javascript) on the PR change set | 0 alerts |
| Automated PR code review of the change set | no review comments |

## 6. Systemic hardening notes (recorded, not individually exploitable)

1. No shared scheme-allowlisting `safeHref()` helper at the render layer; safety currently depends on every write path using `normalizeUrl` plus CSP.
2. `v3/public/ui/semantic-surface-a6-ux4.js` redefines `esc` as `CSS.escape` — a latent naming trap against the HTML escaper convention (current inputs are fixed IDs; not exploitable today).
3. HTML escaping is enforced per-file by convention; SEC-2026-09-13-01 shows the convention can be missed. A structural guard (auto-escaping `html` tagged template or lint rule) would close the class; `FI01-08` closes it for the FI-01 surface only.

## Claim boundary

This document transcribes engineering evidence produced by same-circuit deterministic suites, one specialist code review, `npm audit` and CodeQL at commit `fe36e5e`. It does not establish: coverage of "99% of known security bugs" (no methodology makes that a verifiable conclusion), independently compiled code mutants, production malware efficacy, penetration of a deployed environment, server-side branch protection, KMS custody, approved RTO/RPO, or external assurance. `main` must not be described as protected unless GitHub itself reports active protection (GOV-01F remains a compensating control). Receipts under `artifacts/` are untracked by design; reproduce them by re-running the listed commands at this commit.
