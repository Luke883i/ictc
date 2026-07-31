#!/usr/bin/env bash
set -Eeuo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
PORT=${PORT:-4327}
OUT="$ROOT/artifacts/screenshots/dashboard-v2.png"
TRACE_OUT="$ROOT/artifacts/screenshots/trace-v2.png"
LOG="$ROOT/artifacts/visual.log"
ATTEST="$ROOT/artifacts/visual-attestation.json"
RUNTIME_DIR=$(mktemp -d)
mkdir -p "$ROOT/artifacts/screenshots"

PORT=$PORT ICTC_RUNTIME_DIR="$RUNTIME_DIR" node "$ROOT/server.mjs" >"$ROOT/artifacts/server.log" 2>&1 &
PID=$!
cleanup(){ kill "$PID" 2>/dev/null || true; rm -rf "$RUNTIME_DIR"; }
trap cleanup EXIT

for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then break; fi
  sleep .2
done
curl -fsS "http://127.0.0.1:$PORT/api/health" >/dev/null

MODE="fallback-static"
LIMITATION="Browser renderer unavailable or timed out; deterministic preview generated from the runtime projection."
PLAYWRIGHT=()
if command -v playwright >/dev/null 2>&1; then
  PLAYWRIGHT=(playwright)
elif npx --no-install playwright --version >/dev/null 2>&1; then
  PLAYWRIGHT=(npx --no-install playwright)
fi

if [ "${#PLAYWRIGHT[@]}" -gt 0 ]; then
  if timeout 75s "${PLAYWRIGHT[@]}" screenshot \
    --browser chromium \
    --viewport-size "1600,1000" \
    --wait-for-selector ".hero" \
    --wait-for-timeout 1200 \
    --full-page \
    "http://127.0.0.1:$PORT" "$OUT" >"$LOG" 2>&1; then
    test -s "$OUT"
    MODE="real-browser"
    LIMITATION="Screenshot browser reale acquisito; screen reader e interazioni complete restano gate separati."
  fi
fi

if [ "$MODE" = "fallback-static" ]; then
  node "$ROOT/scripts/static-preview.mjs" "$OUT"
  test -s "$OUT"
fi
node "$ROOT/scripts/trace-preview.mjs" "$TRACE_OUT"
test -s "$TRACE_OUT"

MODE="$MODE" LIMITATION="$LIMITATION" OUT="$OUT" TRACE_OUT="$TRACE_OUT" node - <<'NODE'
const { writeFileSync } = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const payload = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  mode: process.env.MODE,
  inspectedBy: 'automated-visual-gate',
  viewport: { width: 1600, height: 1000 },
  artifacts: [path.relative(root, process.env.OUT), path.relative(root, process.env.TRACE_OUT)],
  checks: ['render completed', 'artifact non-empty', 'runtime trace generated'],
  limitation: process.env.LIMITATION
};
writeFileSync(path.join(root, 'artifacts', 'visual-attestation.json'), JSON.stringify(payload, null, 2));
NODE

echo "visual-check: $MODE $OUT; trace $TRACE_OUT"
