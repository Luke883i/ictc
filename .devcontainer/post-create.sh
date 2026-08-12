#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
chmod +x ictc.sh ictc-v3.sh .devcontainer/post-start.sh
npm ci --ignore-scripts
./ictc.sh doctor --profile current
node v3/gap-audit.mjs
node v3/ux-audit.mjs
