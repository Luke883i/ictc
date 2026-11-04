# ICTC AI Agent Bundle — historical PR #8 handoff

**Status: Historical PR #8 · integrity-preserved lineage · HOLD_CONSUMERS.**

The sealed handoff at `ai/ictc-agent-bundle/` describes the **ICTC 1.0.0 / PR #8** single-user checkout. It is not the current onboarding, the current product/software authority, or a current CI contract. Its `config/repository_contract.json` and `config/test_catalog.json` refer to paths and npm scripts that do not all exist on current `main`. A green integrity/selftest does not make the historical `doctor.py` pass against the current repository.

**Current, non-AI and AI contributor entrypoints** are the repository [README](../README.md), [docs/START_HERE.md](START_HERE.md), [DEVELOPMENT](DEVELOPMENT.md), [TESTING](TESTING.md) and [architecture](11_ARCHITECTURE.md). Use the existing commands from the current `package.json`:

```bash
npm run check
npm run docs:check
npm test
node scripts/repository-contract.mjs
```

For historical forensic checks **only**, the bundle remains byte-preserved and verifiable:

```bash
python3 ai/ictc-agent-bundle/tools/verify_integrity.py ai/ictc-agent-bundle
python3 ai/ictc-agent-bundle/tools/selftest.py ai/ictc-agent-bundle
python3 ai/ictc-agent-bundle/tools/build_bundle.py ai/ictc-agent-bundle --zip dist/ICTC_AI_HANDOFF_BUNDLE_V1.zip
```

The sealed bundle and its contract are **immutable in place**. Do not edit its source to pretend that PR #8 described the present architecture. If a new handoff is justified, create an explicitly versioned successor with provenance and consumer review; no successor is created by this document. `scripts/repository-contract.mjs` diagnoses current-vs-historical paths and commands without changing current owners. `HOLD_CONSUMERS` is *not* permission to remove, rename, redirect, overwrite, or deprecate a public path; unknown external consumers remain unproven. The inherited standalone `START.py --repo` / `doctor.py` should be expected to report historical contract drift, **not** current checkout health.
