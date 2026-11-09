#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
chmod +x ictc.sh .devcontainer/post-start.sh
npm ci --ignore-scripts
./ictc.sh doctor --profile current
node tests/verification/gap-audit.mjs
node tests/verification/ux-audit.mjs
