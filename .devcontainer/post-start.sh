#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
export ICTC_NO_OPEN=1
./ictc.sh start --no-open
