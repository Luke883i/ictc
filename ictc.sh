#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${ICTC_STATE_DIR:-$ROOT/.ictc}"
RUN_DIR="$STATE_DIR/run"
LOG_DIR="$STATE_DIR/logs"
PID_FILE="$RUN_DIR/server.pid"
LOG_FILE="$LOG_DIR/server.log"
DEPS_STAMP="$STATE_DIR/deps.stamp"
HOST="${ICTC_HOST:-127.0.0.1}"
PORT="${PORT:-${ICTC_PORT:-4173}}"
RUNTIME_DIR="${ICTC_RUNTIME_DIR:-$ROOT/runtime}"
URL="http://$HOST:$PORT"
NO_OPEN="${ICTC_NO_OPEN:-0}"
FOREGROUND=0
umask 077

say() { printf '%s\n' "$*"; }
fail() { printf 'ICTC: %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'HELP'
ICTC local launcher

Usage:
  ./ictc.sh start [--no-open] [--foreground]
  ./ictc.sh stop
  ./ictc.sh restart [--no-open]
  ./ictc.sh status
  ./ictc.sh open
  ./ictc.sh logs
  ./ictc.sh test
  ./ictc.sh audit
  ./ictc.sh doctor

Environment:
  ICTC_PORT or PORT      HTTP port (default 4173)
  ICTC_HOST              bind host (default 127.0.0.1)
  ICTC_RUNTIME_DIR       local SOT directory (default ./runtime)
  ICTC_NO_OPEN=1         do not open a browser
  BROWSER                preferred browser command
HELP
}

ensure_dirs() {
  mkdir -p "$RUN_DIR" "$LOG_DIR" "$RUNTIME_DIR/blobs"
}

node_major() {
  node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || printf '0'
}

preflight() {
  command -v node >/dev/null 2>&1 || fail 'Node.js non trovato. Installare Node.js 22 o successivo.'
  command -v npm >/dev/null 2>&1 || fail 'npm non trovato.'
  command -v curl >/dev/null 2>&1 || fail 'curl non trovato.'
  local major
  major="$(node_major)"
  [ "$major" -ge 22 ] || fail "Node.js 22+ richiesto; rilevato $(node --version)."
  [[ "$PORT" =~ ^[0-9]+$ ]] || fail "Porta non valida: $PORT"
  [ "$PORT" -ge 1 ] && [ "$PORT" -le 65535 ] || fail "Porta fuori intervallo: $PORT"
  [ -f "$ROOT/package-lock.json" ] || fail 'package-lock.json mancante.'
  [ -f "$ROOT/server.mjs" ] || fail 'server.mjs mancante.'
}

install_if_needed() {
  if [ ! -f "$DEPS_STAMP" ] || [ "$ROOT/package-lock.json" -nt "$DEPS_STAMP" ]; then
    say 'ICTC: verifica dipendenze…'
    (cd "$ROOT" && npm ci --ignore-scripts)
    touch "$DEPS_STAMP"
  fi
}

pid_value() {
  [ -f "$PID_FILE" ] && cat "$PID_FILE" || true
}

process_running() {
  local pid
  pid="$(pid_value)"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

health_ok() {
  curl -fsS --max-time 2 "$URL/api/health" >/dev/null 2>&1
}

wait_for_health() {
  local attempt
  for attempt in $(seq 1 80); do
    health_ok && return 0
    sleep 0.25
  done
  return 1
}

open_url() {
  [ "$NO_OPEN" = '1' ] && return 0
  if [ -n "${BROWSER:-}" ]; then
    "$BROWSER" "$URL" >/dev/null 2>&1 &
    return 0
  fi
  case "$(uname -s)" in
    Darwin) open "$URL" >/dev/null 2>&1 & return 0 ;;
    Linux)
      if grep -qi microsoft /proc/version 2>/dev/null && command -v cmd.exe >/dev/null 2>&1; then
        cmd.exe /c start "" "$URL" >/dev/null 2>&1 & return 0
      fi
      if [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]; then
        if command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1 & return 0; fi
        if command -v gio >/dev/null 2>&1; then gio open "$URL" >/dev/null 2>&1 & return 0; fi
      fi
      ;;
  esac
  say "ICTC: browser non aperto automaticamente; visita $URL"
}

start_server() {
  ensure_dirs
  preflight
  install_if_needed

  if process_running && health_ok; then
    say "ICTC: già attivo su $URL (PID $(pid_value))."
    open_url
    return 0
  fi

  if [ -f "$PID_FILE" ]; then rm -f "$PID_FILE"; fi

  if [ "$FOREGROUND" = '1' ]; then
    say "ICTC: avvio in primo piano su $URL"
    cd "$ROOT"
    exec env PORT="$PORT" ICTC_HOST="$HOST" ICTC_RUNTIME_DIR="$RUNTIME_DIR" node server.mjs
  fi

  say 'ICTC: avvio runtime locale…'
  (
    cd "$ROOT"
    nohup env PORT="$PORT" ICTC_HOST="$HOST" ICTC_RUNTIME_DIR="$RUNTIME_DIR" node server.mjs >>"$LOG_FILE" 2>&1 &
    printf '%s' "$!" >"$PID_FILE"
  )

  if ! wait_for_health; then
    tail -n 80 "$LOG_FILE" >&2 || true
    rm -f "$PID_FILE"
    fail 'avvio non completato entro 20 secondi.'
  fi

  local health
  health="$(curl -fsS "$URL/api/health")"
  say "ICTC: attivo su $URL"
  say "ICTC: health $health"
  say "ICTC: log $LOG_FILE"
  open_url
}

stop_server() {
  if ! process_running; then
    rm -f "$PID_FILE"
    say 'ICTC: non risulta un processo gestito attivo.'
    return 0
  fi
  local pid
  pid="$(pid_value)"
  say "ICTC: arresto PID $pid…"
  kill -TERM "$pid" 2>/dev/null || true
  for _ in $(seq 1 40); do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.25
  done
  if kill -0 "$pid" 2>/dev/null; then
    kill -KILL "$pid" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
  say 'ICTC: arrestato.'
}

show_status() {
  if process_running; then
    if health_ok; then
      say "ICTC: attivo su $URL (PID $(pid_value))."
      curl -fsS "$URL/api/health"; printf '\n'
      curl -fsS "$URL/api/runtime/integrity"; printf '\n'
    else
      say "ICTC: processo presente ma health check non disponibile (PID $(pid_value))."
      return 1
    fi
  else
    say 'ICTC: non attivo.'
    return 1
  fi
}

show_logs() {
  ensure_dirs
  touch "$LOG_FILE"
  tail -n 120 -f "$LOG_FILE"
}

run_tests() {
  preflight
  (cd "$ROOT" && npm ci --ignore-scripts && npm test)
}

run_audit() {
  preflight
  (cd "$ROOT" && npm ci --ignore-scripts && npm run audit)
}

show_doctor() {
  ensure_dirs
  say "root=$ROOT"
  say "node=$(node --version 2>/dev/null || echo missing)"
  say "npm=$(npm --version 2>/dev/null || echo missing)"
  say "host=$HOST"
  say "port=$PORT"
  say "url=$URL"
  say "runtime=$RUNTIME_DIR"
  say "state=$STATE_DIR"
  if process_running; then say "process=running pid=$(pid_value)"; else say 'process=stopped'; fi
  if health_ok; then say 'health=ok'; else say 'health=unavailable'; fi
}

command="${1:-help}"
shift || true
while [ "$#" -gt 0 ]; do
  case "$1" in
    --no-open) NO_OPEN=1 ;;
    --foreground) FOREGROUND=1 ;;
    -h|--help) usage; exit 0 ;;
    *) fail "opzione non riconosciuta: $1" ;;
  esac
  shift
done

case "$command" in
  start) start_server ;;
  stop) stop_server ;;
  restart) stop_server; start_server ;;
  status) show_status ;;
  open) health_ok || fail 'ICTC non è attivo.'; open_url ;;
  logs) show_logs ;;
  test) run_tests ;;
  audit) run_audit ;;
  doctor) show_doctor ;;
  help|-h|--help) usage ;;
  *) usage; fail "comando non riconosciuto: $command" ;;
esac
