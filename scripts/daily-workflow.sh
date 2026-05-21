#!/usr/bin/env bash

# ==============================================================================
# Lumapse -- Orquestador de Flujo de Trabajo Diario
# ==============================================================================
# Centraliza los scripts de inicio y cierre de sesion en un solo comando.
#
# Modos:
#   ./scripts/daily-workflow.sh start   -> Dashboard de inicio de sesion
#   ./scripts/daily-workflow.sh end     -> Quality gate + reporte de cierre
#   ./scripts/daily-workflow.sh health  -> Dashboard de salud completo
#
# Uso: ./scripts/daily-workflow.sh <start|end|health>
# ==============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Colores
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[0;90m'
NC='\033[0m'

banner() {
  printf "\n${BOLD}${CYAN}======================================================${NC}\n"
  printf "${BOLD}${CYAN}  Lumapse -- %s${NC}\n" "$1"
  printf "${BOLD}${CYAN}======================================================${NC}\n\n"
}

# ==============================================================================
# MODO: START
# ==============================================================================
mode_start() {
  banner "Inicio de Sesion"

  printf "${DIM}Ejecutando check-session.sh...${NC}\n\n"
  "$PROJECT_ROOT/scripts/check-session.sh"

  printf "\n${DIM}Tip: al terminar la sesion, ejecuta './scripts/daily-workflow.sh end'${NC}\n\n"
}

# ==============================================================================
# MODO: END
# ==============================================================================
mode_end() {
  banner "Cierre de Sesion"

  FAIL=0

  # 1. Lint
  printf "${BOLD}[1/4] ESLint${NC}\n"
  if cd "$PROJECT_ROOT" && npm run lint --silent 2>&1; then
    printf "${GREEN}  OK${NC}\n"
  else
    printf "${YELLOW}  Hay advertencias o errores de lint${NC}\n"
    FAIL=1
  fi

  # 2. Build
  printf "\n${BOLD}[2/4] Build de produccion${NC}\n"
  if cd "$PROJECT_ROOT" && npm run build --silent 2>&1 >/dev/null; then
    printf "${GREEN}  OK${NC}\n"
  else
    printf "${RED}  Build fallo${NC}\n"
    FAIL=1
  fi

  # 3. Tamano de archivos
  printf "\n${BOLD}[3/4] Guardia de tamano${NC}\n"
  "$PROJECT_ROOT/scripts/check-file-size.sh"

  # 4. TODOs
  printf "\n${BOLD}[4/4] TODOs / FIXMEs pendientes${NC}\n"
  TODO_COUNT=$(grep -rn "TODO\|FIXME\|HACK\|XXX" "$PROJECT_ROOT/src/" --include="*.js" --include="*.css" --include="*.html" 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$TODO_COUNT" -eq 0 ]]; then
    printf "${GREEN}  No hay TODOs pendientes${NC}\n"
  else
    printf "${YELLOW}  %d TODOs/FIXMEs encontrados -- verificar BACKLOG.md${NC}\n" "$TODO_COUNT"
  fi

  # Resumen de sesion (que se hizo)
  printf "\n${BOLD}--- Resumen de la sesion ---${NC}\n"

  # Commits de hoy
  TODAY=$(date '+%Y-%m-%d')
  TODAYS_COMMITS=$(git -C "$PROJECT_ROOT" log --oneline --since="$TODAY 00:00" --no-decorate 2>/dev/null || echo "")
  if [[ -n "$TODAYS_COMMITS" ]]; then
    printf "\n${CYAN}Commits de hoy:${NC}\n"
    echo "$TODAYS_COMMITS" | while IFS= read -r line; do
      printf "  %s\n" "$line"
    done
  else
    printf "\n${DIM}No hay commits de hoy${NC}\n"
  fi

  # Archivos modificados
  MODIFIED=$(git -C "$PROJECT_ROOT" status --short 2>/dev/null)
  if [[ -n "$MODIFIED" ]]; then
    printf "\n${YELLOW}Archivos pendientes de commit:${NC}\n"
    echo "$MODIFIED" | while IFS= read -r line; do
      printf "  %s\n" "$line"
    done
  fi

  # Estado final
  printf "\n${BOLD}==================================================${NC}\n"
  if [[ $FAIL -eq 0 ]]; then
    printf "${GREEN}${BOLD}  Sesion cerrada correctamente${NC}\n"
  else
    printf "${YELLOW}${BOLD}  Sesion cerrada con advertencias -- revisar arriba${NC}\n"
  fi
  printf "${BOLD}==================================================${NC}\n"
  printf "${DIM}Fecha: $(date '+%Y-%m-%d %H:%M')${NC}\n\n"
}

# ==============================================================================
# MODO: HEALTH
# ==============================================================================
mode_health() {
  banner "Dashboard de Salud"

  printf "${DIM}Ejecutando health-dashboard.py...${NC}\n\n"
  python3 "$PROJECT_ROOT/scripts/health-dashboard.py" "$@"
}

# ==============================================================================
# MAIN
# ==============================================================================

MODE="${1:-help}"
shift 2>/dev/null || true

case "$MODE" in
  start)
    mode_start
    ;;
  end)
    mode_end
    ;;
  health)
    mode_health "$@"
    ;;
  *)
    printf "${BOLD}Lumapse -- Orquestador de Flujo Diario${NC}\n\n"
    printf "Uso:\n"
    printf "  ./scripts/daily-workflow.sh start   # Dashboard de inicio de sesion\n"
    printf "  ./scripts/daily-workflow.sh end     # Quality gate + cierre de sesion\n"
    printf "  ./scripts/daily-workflow.sh health  # Dashboard de salud completo\n"
    printf "  ./scripts/daily-workflow.sh health --save  # Guardar reporte MD\n"
    ;;
esac
