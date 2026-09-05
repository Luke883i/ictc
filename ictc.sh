#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${ICTC_PORT:-${PORT:-4173}}"
HOST="${ICTC_HOST:-127.0.0.1}"
STATE="${ICTC_STATE_DIR:-$ROOT/.ictc}"
RUNTIME_OVERRIDE="${ICTC_RUNTIME_DIR:-}"
NO_OPEN="${ICTC_NO_OPEN:-0}"
DEMO_SUITE="${ICTC_DEMO_SUITE:-}"
COMMAND=""

while (($#)); do
  case "$1" in
    start|stop|restart|status|logs|doctor|test|audit) COMMAND="$1" ;;
    demo) COMMAND="start"; DEMO_SUITE=2.2 ;;
    --demo-suite) DEMO_SUITE=2.2 ;;
    --demo-seed|-demoseed) DEMO_SUITE=2.2 ;;
    --no-open) NO_OPEN=1 ;;
    --profile)
      shift
      [[ "${1:-}" =~ ^(current|v3)$ ]] || { echo 'Sono supportati solo current e v3' >&2; exit 2; }
      ;;
    -h|--help|help) COMMAND=help ;;
    *) echo "Argomento sconosciuto: $1" >&2; exit 2 ;;
  esac
  shift || true
done

COMMAND="${COMMAND:-help}"
if [[ -n "$RUNTIME_OVERRIDE" ]]; then
  RUNTIME="$RUNTIME_OVERRIDE"
elif [[ "$DEMO_SUITE" = 2.2 ]]; then
  RUNTIME="$STATE/demo-runtime-2-2"
else
  RUNTIME="$STATE/runtime"
fi

URL="http://127.0.0.1:$PORT"
RUN="$STATE/run"
LOG="$STATE/logs"
PID="$RUN/ictc.pid"
OUT="$LOG/ictc.log"
mkdir -p "$RUN" "$LOG" "$RUNTIME"

pid(){ [[ -r "$PID" ]] && cat "$PID"; }
alive(){ local p; p="$(pid 2>/dev/null || true)"; [[ "$p" =~ ^[0-9]+$ ]] && kill -0 "$p" 2>/dev/null; }
health(){ curl -fsS --max-time 2 "$URL/api/health" >/dev/null 2>&1; }

start(){
  command -v node >/dev/null
  command -v curl >/dev/null
  [[ "$(node -p "Number(process.versions.node.split('.')[0])")" -ge 22 ]]
  if alive && health; then
    echo "ICTC già attivo: $URL"
    return
  fi
  local build_sha build_dirty
  build_sha="${ICTC_BUILD_SHA:-${GITHUB_SHA:-}}"
  build_dirty="${ICTC_BUILD_DIRTY:-}"
  if [[ -z "$build_sha" ]] && command -v git >/dev/null 2>&1; then
    build_sha="$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || true)"
  fi
  if [[ -z "$build_dirty" ]] && [[ -n "$build_sha" ]] && command -v git >/dev/null 2>&1 && git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    if git -C "$ROOT" diff --quiet HEAD -- && git -C "$ROOT" diff --cached --quiet; then build_dirty=0; else build_dirty=1; fi
  fi
  rm -f "$PID"
  (
    cd "$ROOT"
    PORT="$PORT" ICTC_HOST="$HOST" ICTC_RUNTIME_DIR="$RUNTIME" ICTC_DEMO_SUITE="$DEMO_SUITE" ICTC_BUILD_SHA="$build_sha" ICTC_BUILD_DIRTY="$build_dirty" nohup node v3/server.mjs >>"$OUT" 2>&1 &
    echo $! >"$PID.tmp"
  )
  mv "$PID.tmp" "$PID"
  local attempts="${ICTC_STARTUP_ATTEMPTS:-160}"
  if [[ "$DEMO_SUITE" = 2.2 ]]; then attempts="${ICTC_DEMO_STARTUP_ATTEMPTS:-900}"; fi
  for _ in $(seq 1 "$attempts"); do
    if alive && health; then
      if [[ "$DEMO_SUITE" = 2.2 ]]; then
        echo "ICTC DEMO Suite 2.2 attivo: $URL · runtime=$RUNTIME"
      else
        echo "ICTC attivo: $URL · runtime=$RUNTIME"
      fi
      [[ "$NO_OPEN" = 1 ]] || { command -v xdg-open >/dev/null && xdg-open "$URL" >/dev/null 2>&1 & }
      return
    fi
    sleep .2
  done
  echo "ICTC non pronto dopo ${attempts} tentativi (demoSuite=${DEMO_SUITE:-off})" >&2
  tail -80 "$OUT" >&2 || true
  exit 1
}

stop(){
  if alive; then
    local p
    p="$(pid)"
    kill "$p" 2>/dev/null || true
    for _ in $(seq 1 30); do kill -0 "$p" 2>/dev/null || break; sleep .1; done
  fi
  rm -f "$PID"
  echo 'ICTC arrestato'
}

case "$COMMAND" in
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  status)
    if alive && health; then
      echo "ICTC attivo: $URL pid=$(pid)"
      curl -fsS "$URL/api/health"; echo
    else
      echo "ICTC non attivo: $URL"; exit 1
    fi
    ;;
  logs) touch "$OUT"; tail -f "$OUT" ;;
  doctor) echo "node=$(node --version) url=$URL runtime=$RUNTIME demoSuite=${DEMO_SUITE:-off}" ;;
  test) (cd "$ROOT" && npm test) ;;
  audit) (cd "$ROOT" && npm run audit) ;;
  help)
    echo 'Uso:'
    echo '  ./ictc.sh start [--no-open]                 # modalità standard, .ictc/runtime'
    echo '  ./ictc.sh demo [--no-open]                  # DEMO Suite 2.2 canonica, .ictc/demo-runtime-2-2'
    echo '  ./ictc.sh start --demo-suite [--no-open]    # equivalente esplicito di demo'
    echo '  ./ictc.sh start --demo-seed [--no-open]     # alias compatibile: monta sempre Suite 2.2'
    echo '  ./ictc.sh start -demoseed [--no-open]       # alias compatibile: monta sempre Suite 2.2'
    echo '  ./ictc.sh stop | restart | status | logs | doctor | test | audit'
    echo 'La modalità DEMO monta esclusivamente Suite 2.2 sugli stessi owner/runtime ICTC; i 188 record positivi sono sintetici e i 512 mutanti di stress restano test-only.'
    echo 'Il bootstrap DEMO può richiedere più tempo del runtime standard; ICTC_DEMO_STARTUP_ATTEMPTS consente di modificare il budget di readiness senza cambiare i dati.'
    echo 'ICTC_RUNTIME_DIR può sovrascrivere la directory di stato: non riusare una runtime reale o una vecchia demo-runtime-v2 per Suite 2.2.'
    ;;
esac
