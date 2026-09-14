# ICTC security runtime closure — main 2026-09-14

Base authority: `c35ed3479eff20826bb49d8280c3ea1e37be2fdc` (merge of PR #146).

This slice closes the code-addressable findings from the consolidated security report without claiming deployment security, production effectiveness or enterprise readiness.

## Runtime changes

- FI-01 external master metadata no longer interpolates directly into an `innerHTML` sink. A pure renderer applies field-by-field HTML escaping and an HTTP(S)-only href allowlist.
- Browser write-boundary validation is executed centrally for every API write before handler dispatch; individual `bodyJson()` checks remain defense in depth.
- Abuse control is layered. A coarse tenant + remote edge budget protects the pre-authentication path; after trusted authentication, the normal budget is keyed by tenant + subject. This removes the low-capacity shared reverse-proxy bucket as the primary per-user control while retaining a pre-auth flood guard.
- `ICTC_ALLOW_PRIVATE_AI` and `ICTC_ALLOW_INSECURE_AI` are independent. Private-network opt-in does not authorize cleartext HTTP.
- Attachment IDs must be canonical single-segment identifiers before any filesystem resolution. Clean/quarantine reads, writes, rename and delete paths use root-confining resolution.
- The security workflow gains unconditional first-party SAST, runtime security DoD, targeted implementation mutants and a Chromium CDP FI-01 DOM regression. CodeQL remains supplemental when GHAS is available.
- Every checkout in the security workflow disables credential persistence.

## Local falsification evidence

Seed: `0x51c7c147` (`1372045639`).

The deterministic remediation rail executed **1,000,000** trials: 250,000 layered rate-key trials, 250,000 attachment-path confinement trials, 250,000 FI-01 output-encoding trials and 250,000 AI opt-in independence trials. Final result: **1,000,000 killed, 0 survivors**.

The mutation campaign did not converge in one pass. Two oracle weaknesses were exposed while maturing the candidate: the first implementation-mutant rail failed to kill a raw FI-01 field regression, and a later pass failed to kill an AI opt-in coupling regression. The SAST/oracle rules were strengthened before the candidate was accepted. A separate targeted implementation-mutation rail now kills **20/20** named regressions with **0 survivors**.

A real Chromium CDP run executes the production FI-01 renderer bytes against event-handler HTML, SVG event-handler, `<script>` and `javascript:` payload classes. The mounted DOM contains no executable nodes or dangerous href and preserves hostile values only as text.

Final local receipt SHA-256 values:

- `security-main-mutation-1m.json`: `010e329324b8b3e337b9f68bd7700e6537fd613aa2d1c28e42ff9a0809d20154`
- `security-implementation-mutants.json`: `e1d9f9a44c40ab0d0863f2b1d1a3ffbffe8ae85af92609d36c5f815502ff392b`
- `security-fi01-dom-browser.json`: `8465465aaf8bdfeeda80a1cb6524b78b554bf01cce3cdc998b8cd1a85455a403`
- `security-sast.json`: `72e014fd0f1fba9068263217f0b8508c6d7493b02a30f4eeffff04e057946440`
- `security-runtime-dod.json`: `d9d35c55deddebf61873289fd1e93e7b12fd0f4bbd3cbdd8856ccac9e39538d9`

## CI authority

`runtime-security-dod` runs the bounded DoD check, the implementation-mutant rail, the new 1M remediation rail and the repository-native 1.01M security attack saturation. `repository-sast` runs pinned-action validation plus the first-party security SAST. `fi01-dom-browser` resolves the system Chromium binary and executes the CDP DOM regression without adding a browser package dependency. `dependency-audit` continues to run `npm audit` and SBOM generation.

The repository-native 1.01M rail and the full current semantic/runtime/browser suites are CI evidence and are **not** pre-claimed by the local receipts above. GitHub exact-head check conclusions remain the acceptance authority for the PR.

## Claim boundary and remaining debt

The slice does **not** attest production security. Both rate-limit layers remain process-local (`distributedReady:false` in the underlying budget projection). The following remain deployment/owner evidence and continue to block any enterprise-ready or security-certified claim: distributed/multi-host abuse-control authority, TLS and reverse-proxy hardening, secret/KMS custody, backup/restore drills, malware-scanner efficacy, centralized logging/monitoring and incident response, HA/RTO/RPO, and repository branch/ruleset enforcement.

Low hardening debt outside this focused slice also remains where other workflows do not yet disable checkout credential persistence and where Python browser tooling is version-pinned but not hash-locked. Those items are not laundered into a closed claim by this PR.
