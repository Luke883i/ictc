#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
V3="$ROOT/v3"
STATE="${ICTC_STATE_DIR:-$ROOT/.ictc}"
RUN="$STATE/run"
LOG="$STATE/logs"
PID="$RUN/v3.pid"
OUT="$LOG/v3.log"
HOST="${ICTC_HOST:-127.0.0.1}"
PORT="${PORT:-${ICTC_PORT:-4173}}"
ACCESS_HOST="${ICTC_ACCESS_HOST:-127.0.0.1}"
URL="http://$ACCESS_HOST:$PORT"
RUNTIME="${ICTC_RUNTIME_DIR:-$V3/runtime}"
NO_OPEN="${ICTC_NO_OPEN:-0}"
umask 077

say(){ printf '%s\n' "$*"; }
fail(){ printf 'ICTC v1: %s\n' "$*" >&2; exit 1; }
pid_value(){
  local value
  [ -r "$PID" ] || return 1
  IFS= read -r value < "$PID" || return 1
  [[ "$value" =~ ^[0-9]+$ ]] || return 1
  printf '%s\n' "$value"
}
alive(){ local value; value="$(pid_value)" || return 1; kill -0 "$value" 2>/dev/null; }
health(){ curl -fsS --max-time 2 "$URL/api/health" >/dev/null 2>&1; }

preflight(){
  command -v node >/dev/null || fail 'Node.js non trovato'
  command -v curl >/dev/null || fail 'curl non trovato'
  [ "$(node -p "Number(process.versions.node.split('.')[0])")" -ge 22 ] || fail 'Node.js 22+ richiesto'
  [ -f "$V3/server.mjs" ] || fail 'Runtime corrente assente'
  [ -f "$ROOT/v1/release.json" ] || fail 'Manifest v1 assente'
  mkdir -p "$RUN" "$LOG" "$RUNTIME/blobs"
}

open_browser(){
  [ "$NO_OPEN" = 1 ] && return 0
  if [ -n "${BROWSER:-}" ]; then "$BROWSER" "$URL" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null; then xdg-open "$URL" >/dev/null 2>&1 &
  elif command -v open >/dev/null; then open "$URL" >/dev/null 2>&1 &
  else say "Apri $URL"
  fi
}

launch(){
  local tmp="$PID.tmp"
  rm -f "$tmp"
  (
    cd "$ROOT"
    PORT="$PORT" ICTC_HOST="$HOST" ICTC_RUNTIME_DIR="$RUNTIME" \
      nohup node v3/server.mjs >>"$OUT" 2>&1 &
    printf '%s\n' "$!" > "$tmp"
  )
  mv "$tmp" "$PID"
}

start(){
  preflight
  if alive; then
    health || fail "PID $(pid_value) attivo ma health non disponibile su $URL"
    say "ICTC v1 già attivo: $URL"
    open_browser
    return
  fi
  rm -f "$PID"
  if health; then fail "La porta $PORT risponde ma non è associata a un PID ICTC gestito"; fi
  launch
  for _ in $(seq 1 60); do
    if alive && health; then
      say "ICTC v1 attivo: $URL"
      open_browser
      return
    fi
    sleep .2
  done
  tail -30 "$OUT" >&2 || true
  rm -f "$PID"
  fail 'Avvio non completato o PID non persistente'
}

stop(){
  if ! alive; then
    rm -f "$PID"
    if health; then fail "Servizio raggiungibile su $URL ma non gestito dal PID ICTC"; fi
    say 'ICTC v1 non attivo'
    return
  fi
  local value
  value="$(pid_value)"
  kill "$value" 2>/dev/null || true
  for _ in $(seq 1 30); do
    kill -0 "$value" 2>/dev/null || break
    sleep .1
  done
  rm -f "$PID"
  if health; then fail "Il processo $value è stato arrestato ma $URL risponde ancora"; fi
  say 'ICTC v1 arrestato'
}

status(){
  local value
  if ! alive; then
    if health; then say "profile=v3 product=1.0.0 processo=non-gestito health=ok url=$URL"; else say "profile=v3 product=1.0.0 processo=non-attivo health=non-raggiungibile url=$URL"; fi
    return 1
  fi
  value="$(pid_value)"
  if ! health; then say "profile=v3 product=1.0.0 processo=attivo pid=$value health=non-raggiungibile url=$URL"; return 1; fi
  say "profile=v3 product=1.0.0 processo=attivo pid=$value health=ok url=$URL"
  curl -fsS "$URL/api/release"
  printf '\n'
}

case "${1:-help}" in
  start) shift; [ "${1:-}" = '--no-open' ] && NO_OPEN=1; start ;;
  stop) stop ;;
  restart) stop; start ;;
  status) status ;;
  open) open_browser ;;
  logs) mkdir -p "$LOG"; touch "$OUT"; tail -f "$OUT" ;;
  doctor) preflight; say "profile=current product=1.0.0 runtime-generation=v3 node=$(node --version) bind=$HOST url=$URL runtime=$RUNTIME" ;;
  test) preflight; node "$V3/audit.mjs" ;;
  audit)
    preflight
    node "$V3/audit.mjs"
    node "$V3/saturation.mjs"
    node "$ROOT/v1/fixture-audit.mjs"
    node "$ROOT/v1/saturation.mjs"
    node "$ROOT/v1/stability-audit.mjs"
    node "$ROOT/v1/buyer-simulation.mjs"
    ;;
  help|-h|--help) echo './ictc-v3.sh start [--no-open] | stop | restart | status | open | logs | doctor | test | audit' ;;
  *) fail 'Comando sconosciuto' ;;
esac
