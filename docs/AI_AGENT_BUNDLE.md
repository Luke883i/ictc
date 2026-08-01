# ICTC AI Agent Bundle

The canonical source of the standalone AI handoff is `ai/ictc-agent-bundle/`.

Build and verify:

```bash
python3 ai/ictc-agent-bundle/tools/verify_integrity.py ai/ictc-agent-bundle
python3 ai/ictc-agent-bundle/tools/selftest.py ai/ictc-agent-bundle
python3 ai/ictc-agent-bundle/tools/build_bundle.py ai/ictc-agent-bundle --zip dist/ICTC_AI_HANDOFF_BUNDLE_V1.zip
```

The bundle is derived, does not replace repository authority, and refreshes only a local runtime overlay. A successor is materialized in a new directory with lineage receipts rather than mutating the current bundle or embedding predecessor archives.
