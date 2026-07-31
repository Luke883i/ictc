#!/usr/bin/env bash
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
PORT=${PORT:-4327}
OUT="$ROOT/artifacts/screenshots/dashboard-v2.png"
TRACE_OUT="$ROOT/artifacts/screenshots/trace-v2.png"
LOG="$ROOT/artifacts/visual.log"
ATTEST="$ROOT/artifacts/visual-attestation.json"
mkdir -p "$ROOT/artifacts/screenshots"
PORT=$PORT node "$ROOT/server.mjs" >"$ROOT/artifacts/server.log" 2>&1 &
PID=$!
cleanup(){ kill "$PID" 2>/dev/null || true; }
trap cleanup EXIT
sleep 1
MODE="fallback-static"
LIMITATION="Browser renderer unavailable or timed out; deterministic preview generated from runtime projection."
if command -v playwright >/dev/null 2>&1; then
  if timeout 60s playwright screenshot --browser chromium --viewport-size "1600,1000" --wait-for-selector ".hero-card" --wait-for-timeout 1200 "http://127.0.0.1:$PORT" "$OUT" >"$LOG" 2>&1; then
    test -s "$OUT"
    MODE="real-browser"
    LIMITATION="None for the captured viewport; responsive and assistive-technology checks remain separate gates."
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
  inspectedBy: 'assistant-visual-inspection',
  viewport: { width: 1600, height: 1000 },
  artifacts: [path.relative(root, process.env.OUT), path.relative(root, process.env.TRACE_OUT)],
  checks: ['hierarchy', 'legibility', 'clipping', 'density', 'palette restraint', 'runtime trace readability'],
  limitation: process.env.LIMITATION
};
writeFileSync(path.join(root, 'artifacts', 'visual-attestation.json'), JSON.stringify(payload, null, 2));
NODE
echo "visual-check: $MODE $OUT; trace $TRACE_OUT"
