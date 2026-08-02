# Validation report

Validated locally on 2026-08-01 with Python 3 and Git.

## Passed checks

- integrity verification: PASS, repeated twice;
- Python syntax compilation: PASS;
- synthetic repository doctor and refresh: PASS;
- Git blob SHA comparison against the index: PASS;
- predicted tree SHA comparison against `git write-tree`: PASS;
- kernel non-mutation during runtime refresh: PASS;
- successor materialization and successor integrity: PASS;
- deterministic ZIP byte comparison: PASS;
- installation into an empty directory followed by integrity verification: PASS.

## Evidence boundary

These are local reproducible tests of the bundle. GitHub Actions remains a separate observation tied to the commit containing the bundle. The bundle does not claim CI success until that workflow is observed on the published HEAD.
