#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${ICTC_PORT:-${PORT:-4173}}"
HOST="${ICTC_HOST:-127.0.0.1}"
STATE="${ICTC_STATE_DIR:-$ROOT/.ictc}"
RUNTIME_OVERRIDE="${ICTC_RUNTIME_DIR:-}"
NO_OPEN="${ICTC_NO_OPEN:-0}"
DEMO_SEED="${ICTC_DEMO_SEED:-0}"
COMMAND=""

while (($#)); do
  case "$1" in
    start|stop|restart|status|logs|doctor|test|audit) COMMAND="$1" ;;
    demo) COMMAND="start"; DEMO_SEED=1 ;;
    --demo-seed|-demoseed) DEMO_SEED=1 ;;
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
elif [[ "$DEMO_SEED" = 1 ]]; then
  RUNTIME="$STATE/demo-runtime-v2"
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
  rm -f "$PID"
  (
    cd "$ROOT"
    PORT="$PORT" ICTC_HOST="$HOST" ICTC_RUNTIME_DIR="$RUNTIME" ICTC_DEMO_SEED="$DEMO_SEED" nohup node v3/server.mjs >>"$OUT" 2>&1 &
    echo $! >"$PID.tmp"
  )
  mv "$PID.tmp" "$PID"
  local attempts="${ICTC_STARTUP_ATTEMPTS:-160}"
  if [[ "$DEMO_SEED" = 1 ]]; then attempts="${ICTC_DEMO_STARTUP_ATTEMPTS:-900}"; fi
  for _ in $(seq 1 "$attempts"); do
    if alive && health; then
      if [[ "$DEMO_SEED" = 1 ]]; then
        echo "ICTC DEMO attivo: $URL · runtime=$RUNTIME"
      else
        echo "ICTC attivo: $URL · runtime=$RUNTIME"
      fi
      [[ "$NO_OPEN" = 1 ]] || { command -v xdg-open >/dev/null && xdg-open "$URL" >/dev/null 2>&1 & }
      return
    fi
    sleep .2
  done
  echo "ICTC non pronto dopo ${attempts} tentativi (demoSeed=${DEMO_SEED})" >&2
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
  doctor) echo "node=$(node --version) url=$URL runtime=$RUNTIME demoSeed=$DEMO_SEED" ;;
  test) (cd "$ROOT" && npm test) ;;
  audit) (cd "$ROOT" && npm run audit) ;;
  help)
    echo 'Uso:'
    echo '  ./ictc.sh start [--no-open]                 # modalità standard, .ictc/runtime'
    echo '  ./ictc.sh demo [--no-open]                  # modalità demo PMI v2 + reality context, .ictc/demo-runtime-v2'
    echo '  ./ictc.sh start --demo-seed [--no-open]     # equivalente esplicito di demo'
    echo '  ./ictc.sh start -demoseed [--no-open]       # alias compatibile'
    echo '  ./ictc.sh stop | restart | status | logs | doctor | test | audit'
    echo 'La modalità demo usa gli stessi owner/runtime ICTC, materializza dati sintetici e lineage contestuale e disabilita lo scheduler operativo; non rappresenta esiti reali di compliance.'
    echo 'Il bootstrap demo può richiedere più tempo del runtime standard; ICTC_DEMO_STARTUP_ATTEMPTS consente di modificare il budget di readiness senza cambiare i dati.'
    echo 'ICTC_RUNTIME_DIR può sovrascrivere la directory di stato: non riusare una runtime reale per il seed demo.'
    ;;
esac
