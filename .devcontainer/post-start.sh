#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
export ICTC_NO_OPEN=1
export ICTC_HOST=0.0.0.0
./ictc.sh codespace
