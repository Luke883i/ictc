# Generated AI handoff archive

`ICTC_AI_HANDOFF_BUNDLE_V1.zip` is reproducibly generated from `ai/ictc-agent-bundle/` and is not stored as a repository blob.

```bash
python3 ai/ictc-agent-bundle/tools/build_bundle.py \
  ai/ictc-agent-bundle \
  --zip dist/ICTC_AI_HANDOFF_BUNDLE_V1.zip
sha256sum -c dist/ICTC_AI_HANDOFF_BUNDLE_V1.zip.sha256
```

GitHub Actions uploads the verified ZIP as a workflow artifact.
