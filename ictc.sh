#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE="${ICTC_PROFILE:-current}"
COMMAND=""
NO_OPEN="${ICTC_NO_OPEN:-0}"
PORT="${ICTC_PORT:-4173}"
LEGACY_PORT="${ICTC_LEGACY_PORT:-4174}"
STATE_ROOT="${ICTC_STATE_DIR:-$ROOT/.ictc}"
RUNTIME_ROOT="${ICTC_RUNTIME_DIR:-$ROOT/.ictc/runtime}"
ARGS=()

say(){ printf '%s\n' "$*"; }
fail(){ printf 'ICTC: %s\n' "$*" >&2; exit 1; }

usage(){
  cat <<'TXT'
ICTC launcher

  ./ictc.sh start [--profile current|v3|v2|all] [--no-open]
  ./ictc.sh stop|restart|status|logs|doctor|test|audit [--profile ...]
  ./ictc.sh codespace

Profiles:
  current, v3  Living Evidence Atlas on ICTC_PORT (default 4173)
  v2           Legacy epistemic beta on ICTC_LEGACY_PORT (default 4174)
  all          Starts current and legacy runtimes with isolated state
TXT
}

while (($#)); do
  case "$1" in
    --profile) shift; PROFILE="${1:-}"; [ -n "$PROFILE" ] || fail 'Valore --profile mancante' ;;
    --no-open) NO_OPEN=1 ;;
    -h|--help|help) COMMAND=help ;;
    start|stop|restart|status|logs|open|doctor|test|audit|codespace) COMMAND="$1" ;;
    *) ARGS+=("$1") ;;
  esac
  shift || true
done

COMMAND="${COMMAND:-help}"
case "$PROFILE" in current|v3) PROFILE=v3;; v2|all) :;; *) fail "Profilo sconosciuto: $PROFILE";; esac

require_file(){ [ -f "$1" ] || fail "File richiesto assente: ${1#$ROOT/}"; }
preflight(){
  command -v bash >/dev/null || fail 'bash non trovato'
  command -v node >/dev/null || fail 'Node.js non trovato'
  command -v curl >/dev/null || fail 'curl non trovato'
  [ "$(node -p "Number(process.versions.node.split('.')[0])")" -ge 22 ] || fail 'Node.js 22+ richiesto'
  require_file "$ROOT/ictc-v3.sh"
  require_file "$ROOT/ictc-v2.sh"
  mkdir -p "$STATE_ROOT" "$RUNTIME_ROOT"
}

run_v3(){
  ICTC_STATE_DIR="$STATE_ROOT/v3" \
  ICTC_RUNTIME_DIR="$RUNTIME_ROOT/v3" \
  PORT="$PORT" ICTC_PORT="$PORT" ICTC_NO_OPEN="$NO_OPEN" \
  bash "$ROOT/ictc-v3.sh" "$@"
}

run_v2(){
  ICTC_STATE_DIR="$STATE_ROOT/v2" \
  ICTC_RUNTIME_DIR="$RUNTIME_ROOT/v2" \
  ICTC_PORT="$LEGACY_PORT" ICTC_NO_OPEN="$NO_OPEN" \
  bash "$ROOT/ictc-v2.sh" "$@"
}

run_profile(){
  local command="$1"; shift || true
  case "$PROFILE" in
    v3) run_v3 "$command" "$@" ;;
    v2) run_v2 "$command" "$@" ;;
    all)
      case "$command" in
        start)
          run_v3 start "$@"
          if ! run_v2 start "$@"; then
            run_v3 stop || true
            return 1
          fi
          ;;
        stop)
          run_v2 stop || true
          run_v3 stop || true
          ;;
        restart)
          run_profile stop
          run_profile start "$@"
          ;;
        status)
          local rc=0
          run_v3 status || rc=1
          run_v2 status || rc=1
          return "$rc"
          ;;
        logs) say 'Use due terminali: ./ictc.sh logs --profile v3 e ./ictc.sh logs --profile v2' ;;
        open) run_v3 open; run_v2 open ;;
        doctor) run_v3 doctor; run_v2 doctor ;;
        *) fail "Comando $command non supportato con --profile all" ;;
      esac
      ;;
  esac
}

codespace_url(){
  if [ "${CODESPACES:-}" = true ] && [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
    printf 'https://%s-%s.%s\n' "$CODESPACE_NAME" "$PORT" "$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"
  else
    printf 'http://127.0.0.1:%s\n' "$PORT"
  fi
}

run_audit(){
  preflight
  case "$PROFILE" in
    v2) npm --prefix "$ROOT" run audit ;;
    v3)
      npm --prefix "$ROOT" run audit
      run_v3 audit
      node "$ROOT/v3/gap-audit.mjs"
      node "$ROOT/v3/ux-audit.mjs"
      node "$ROOT/v3/blob-audit.mjs"
      node "$ROOT/v3/launcher-audit.mjs"
      node "$ROOT/v3/enduser-simulation.mjs"
      ;;
    all)
      PROFILE=v3 run_audit
      PROFILE=v2 run_audit
      ;;
  esac
}

case "$COMMAND" in
  help) usage ;;
  codespace)
    preflight
    PROFILE=v3; NO_OPEN=1
    export ICTC_HOST=0.0.0.0
    run_v3 start --no-open
    say "ICTC Codespaces: $(codespace_url)"
    say 'La visibilità della porta deve restare Private salvo decisione esplicita.'
    ;;
  doctor)
    preflight
    say "node=$(node --version) profile=$PROFILE current_port=$PORT legacy_port=$LEGACY_PORT"
    say "state_root=$STATE_ROOT runtime_root=$RUNTIME_ROOT codespaces=${CODESPACES:-false}"
    run_profile doctor
    ;;
  audit) run_audit ;;
  test)
    preflight
    if [ "$PROFILE" = v2 ]; then npm --prefix "$ROOT" test; else run_v3 test; fi
    ;;
  start|stop|restart|status|logs|open)
    preflight
    run_profile "$COMMAND" "${ARGS[@]}"
    ;;
  *) fail "Comando sconosciuto: $COMMAND" ;;
esac
