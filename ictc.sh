#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${ICTC_PORT:-${PORT:-4173}}"
HOST="${ICTC_HOST:-127.0.0.1}"
STATE="${ICTC_STATE_DIR:-$ROOT/.ictc}"
RUNTIME="${ICTC_RUNTIME_DIR:-$STATE/runtime}"
RUN="$STATE/run" LOG="$STATE/logs" PID="$RUN/ictc.pid" OUT="$LOG/ictc.log"
NO_OPEN="${ICTC_NO_OPEN:-0}" COMMAND=""
while (($#)); do case "$1" in start|stop|restart|status|logs|doctor|test|audit) COMMAND="$1";; --no-open) NO_OPEN=1;; --profile) shift; [[ "${1:-}" =~ ^(current|v3)$ ]] || { echo 'Sono supportati solo current e v3' >&2; exit 2; };; -h|--help|help) COMMAND=help;; *) echo "Argomento sconosciuto: $1" >&2; exit 2;; esac; shift || true; done
COMMAND="${COMMAND:-help}"; URL="http://127.0.0.1:$PORT"
mkdir -p "$RUN" "$LOG" "$RUNTIME"
pid(){ [[ -r "$PID" ]] && cat "$PID"; }
alive(){ local p; p="$(pid 2>/dev/null || true)"; [[ "$p" =~ ^[0-9]+$ ]] && kill -0 "$p" 2>/dev/null; }
health(){ curl -fsS --max-time 2 "$URL/api/health" >/dev/null 2>&1; }
start(){
  command -v node >/dev/null; command -v curl >/dev/null; [[ "$(node -p "Number(process.versions.node.split('.')[0])")" -ge 22 ]]
  if alive && health; then echo "ICTC già attivo: $URL"; return; fi
  rm -f "$PID"
  (cd "$ROOT"; PORT="$PORT" ICTC_HOST="$HOST" ICTC_RUNTIME_DIR="$RUNTIME" nohup node v3/server.mjs >>"$OUT" 2>&1 & echo $! >"$PID.tmp")
  mv "$PID.tmp" "$PID"
  for _ in $(seq 1 80); do if alive && health; then echo "ICTC attivo: $URL"; [[ "$NO_OPEN" = 1 ]] || { command -v xdg-open >/dev/null && xdg-open "$URL" >/dev/null 2>&1 & }; return; fi; sleep .2; done
  tail -40 "$OUT" >&2 || true; exit 1
}
stop(){ if alive; then local p; p="$(pid)"; kill "$p" 2>/dev/null || true; for _ in $(seq 1 30); do kill -0 "$p" 2>/dev/null || break; sleep .1; done; fi; rm -f "$PID"; echo 'ICTC arrestato'; }
case "$COMMAND" in
  start) start;; stop) stop;; restart) stop; start;;
  status) if alive && health; then echo "ICTC attivo: $URL pid=$(pid)"; curl -fsS "$URL/api/health"; echo; else echo "ICTC non attivo: $URL"; exit 1; fi;;
  logs) touch "$OUT"; tail -f "$OUT";; doctor) echo "node=$(node --version) url=$URL runtime=$RUNTIME";;
  test) (cd "$ROOT" && npm test);; audit) (cd "$ROOT" && npm run audit);;
  help) echo './ictc.sh start [--no-open] | stop | restart | status | logs | doctor | test | audit';;
esac
