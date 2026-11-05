# ICTC AI Agent Bundle — historical PR #8 handoff

**Status: Historical PR #8 · integrity-preserved lineage · HOLD_CONSUMERS.**

The sealed handoff at `docs/archive/ictc-agent-bundle/` describes the **ICTC 1.0.0 / PR #8** single-user checkout. It is not the current onboarding, the current product/software authority, or a current CI contract. Its `config/repository_contract.json` and `config/test_catalog.json` refer to paths and npm scripts that do not all exist on current `main`. A green integrity/selftest does not make the historical `doctor.py` pass against the current repository.

**Current, non-AI and AI contributor entrypoints** are the repository [README](../README.md), [docs/START_HERE.md](START_HERE.md), [DEVELOPMENT](DEVELOPMENT.md), [TESTING](TESTING.md) and [architecture](11_ARCHITECTURE.md). Use the existing commands from the current `package.json`:

```bash
npm run check
npm run docs:check
npm test
node scripts/repository-contract.mjs
```

For historical forensic checks **only**, the bundle remains byte-preserved and verifiable:

```bash
python3 docs/archive/ictc-agent-bundle/tools/verify_integrity.py docs/archive/ictc-agent-bundle
python3 docs/archive/ictc-agent-bundle/tools/selftest.py docs/archive/ictc-agent-bundle
python3 docs/archive/ictc-agent-bundle/tools/build_bundle.py docs/archive/ictc-agent-bundle --zip artifacts/ICTC_AI_HANDOFF_BUNDLE_V1.zip
```

The sealed bundle and its contract are **byte-immutable in the archive**. Do not edit its source to pretend that PR #8 described the present architecture. If a new handoff is justified, create an explicitly versioned successor with provenance and consumer review; no successor is created by this document. `scripts/repository-contract.mjs` diagnoses current-vs-historical paths and commands without changing current owners. The original checkout path was relocated in a bounded root-to-archive migration with the same Git blob SHAs and relative manifest paths. `HOLD_CONSUMERS` still applies to unobserved external consumers of the former public URL; it does not authorize further relocation, source modification or deletion. The inherited standalone `START.py --repo` / `doctor.py` should be expected to report historical contract drift, **not** current checkout health.

**C1 · generated-artifact contraction.** The previous tracked `dist/README.md` and `dist/ICTC_AI_HANDOFF_BUNDLE_V1.zip.sha256` were historical build instructions and a historical checksum, **not** the ZIP itself. Their original bytes remain available in the immutable Git preimage [`26ac705e`](https://github.com/Luke883i/ictc/tree/26ac705e331511fe1d8f1db93b8167ad795e506a/dist). To regenerate the sealed source without writing new files into the tracked root, write the generated ZIP to the already ignored `artifacts/` directory. Original PR8 source bytes, manifest and integrity verification are unchanged. This operation does **not** prove that external consumers of historical `dist/` URLs are absent.
