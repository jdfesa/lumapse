#!/usr/bin/env bash

# ==============================================================================
# Lumapse -- Dashboard de Inicio de Sesion
# ==============================================================================
# Muestra un resumen rapido del estado del proyecto para arrancar cada sesion
# de trabajo sabiendo exactamente donde estas parado.
#
# Informacion que muestra (~3 segundos):
#   1. Hito activo (desde CHANGELOG.md)
#   2. Ultimos 5 commits
#   3. Archivos modificados sin commitear
#   4. Deuda tecnica (archivos que superan limites)
#   5. TODOs/FIXMEs pendientes en codigo
#   6. Estado rapido de lint
#
# Uso: ./scripts/check-session.sh
# ==============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Colores
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

divider() {
  printf "${DIM}--------------------------------------------------${NC}\n"
}

section() {
  printf "\n${CYAN}${BOLD}$1${NC}\n"
  divider
}

# ==============================================================================
# 0. RAMA ACTIVA
# ==============================================================================
section "0. Rama activa"

CURRENT_BRANCH=$(git -C "$PROJECT_ROOT" branch --show-current 2>/dev/null || echo "desconocida")

if [[ "$CURRENT_BRANCH" == "main" ]]; then
  printf "   ${GREEN}▶ ${BOLD}main${NC} ${DIM}(rama principal)${NC}\n"
else
  printf "   ${YELLOW}▶ ${BOLD}%s${NC} ${DIM}(rama de trabajo)${NC}\n" "$CURRENT_BRANCH"
  # Mostrar cuantos commits de ventaja tiene sobre main
  AHEAD=$(git -C "$PROJECT_ROOT" rev-list --count main.."$CURRENT_BRANCH" 2>/dev/null || echo "?")
  if [[ "$AHEAD" != "?" && "$AHEAD" -gt 0 ]]; then
    printf "   ${DIM}  %s commits por delante de main${NC}\n" "$AHEAD"
  fi
fi

# Ramas locales ya mergeadas a main que se pueden limpiar
MERGED=$(git -C "$PROJECT_ROOT" branch --merged main 2>/dev/null | grep -v '^\*' | grep -v 'main' | sed 's/^[[:space:]]*//' || true)
if [[ -n "$MERGED" ]]; then
  printf "   ${YELLOW}Ramas mergeadas (limpiar):${NC}\n"
  echo "$MERGED" | while IFS= read -r branch; do
    printf "   ${DIM}  - %s  →  git branch -d %s${NC}\n" "$branch" "$branch"
  done
fi

# Total de ramas locales
BRANCH_COUNT=$(git -C "$PROJECT_ROOT" branch | wc -l | tr -d ' ')
if [[ "$BRANCH_COUNT" -gt 1 ]]; then
  printf "   ${DIM}Ramas locales: %s (ver con: git branch -a)${NC}\n" "$BRANCH_COUNT"
fi

# ==============================================================================
# 1. HITO ACTIVO
# ==============================================================================
section "1. Hito activo"

# Intentar detectar el hito desde CHANGELOG.md
HITO_LINE=$(grep -m 1 "^## \[" "$PROJECT_ROOT/CHANGELOG.md" 2>/dev/null || echo "")
if [[ -n "$HITO_LINE" ]]; then
  printf "   Ultimo registro: %s\n" "$HITO_LINE"
else
  printf "   ${DIM}No se pudo detectar desde CHANGELOG.md${NC}\n"
fi

# Intentar detectar desde BACKLOG.md
BACKLOG_HITO=$(grep -m 1 "Hito.*En curso\|En curso\|activo" "$PROJECT_ROOT/BACKLOG.md" 2>/dev/null || echo "")
if [[ -n "$BACKLOG_HITO" ]]; then
  printf "   Backlog: %s\n" "$(echo "$BACKLOG_HITO" | sed 's/^[[:space:]]*//')"
fi

# ==============================================================================
# 2. ULTIMOS COMMITS
# ==============================================================================
section "2. Ultimos 5 commits"

git -C "$PROJECT_ROOT" log --oneline -5 --no-decorate 2>/dev/null | while IFS= read -r line; do
  printf "   %s\n" "$line"
done

# ==============================================================================
# 3. ESTADO DE GIT
# ==============================================================================
section "3. Estado de Git"

GIT_STATUS=$(git -C "$PROJECT_ROOT" status --short 2>/dev/null)
if [[ -z "$GIT_STATUS" ]]; then
  printf "   ${GREEN}Worktree limpio${NC}\n"
else
  MODIFIED=$(echo "$GIT_STATUS" | { grep -c "^ M\| M " || true; })
  UNTRACKED=$(echo "$GIT_STATUS" | { grep -c "^??" || true; })
  STAGED=$(echo "$GIT_STATUS" | { grep -c "^[MADRC]" || true; })

  if [[ $MODIFIED -gt 0 ]]; then
    printf "   ${YELLOW}Modificados:${NC} %d archivos sin stagear\n" "$MODIFIED"
  fi
  if [[ $STAGED -gt 0 ]]; then
    printf "   ${GREEN}Staged:${NC} %d archivos listos para commit\n" "$STAGED"
  fi
  if [[ $UNTRACKED -gt 0 ]]; then
    printf "   ${DIM}Sin rastrear:${NC} %d archivos nuevos\n" "$UNTRACKED"
  fi
fi

# ==============================================================================
# 4. DEUDA TECNICA (archivos grandes)
# ==============================================================================
section "4. Deuda tecnica (archivos grandes)"

LIMIT_WARN=250
PROBLEMS=0

while IFS= read -r -d '' file; do
  LOC=$(grep -cvE '^\s*$' "$file" 2>/dev/null || echo "0")
  if [[ $LOC -gt $LIMIT_WARN ]]; then
    RPATH="${file#$PROJECT_ROOT/}"
    PROBLEMS=$((PROBLEMS + 1))
    printf "   ${YELLOW}[%d LOC]${NC} %s\n" "$LOC" "$RPATH"
  fi
done < <(find "$PROJECT_ROOT/src" \( -name "*.js" -o -name "*.ts" -o -name "*.css" \) -type f -print0 2>/dev/null | sort -z)

if [[ $PROBLEMS -eq 0 ]]; then
  printf "   ${GREEN}Todos los archivos dentro de los limites${NC}\n"
else
  printf "   ${DIM}Ejecuta: python3 scripts/split-guide.py --all${NC}\n"
fi

# ==============================================================================
# 5. TODOs / FIXMEs en codigo
# ==============================================================================
section "5. TODOs y FIXMEs en codigo"

TODO_COUNT=0
FIXME_COUNT=0

if [[ -d "$PROJECT_ROOT/src" ]]; then
  TODO_COUNT=$( (grep -rn "TODO\|HACK" "$PROJECT_ROOT/src/" --include="*.js" --include="*.ts" --include="*.css" --include="*.html" 2>/dev/null || true) | wc -l | tr -d ' ')
  FIXME_COUNT=$( (grep -rn "FIXME\|XXX\|BUG" "$PROJECT_ROOT/src/" --include="*.js" --include="*.ts" --include="*.css" --include="*.html" 2>/dev/null || true) | wc -l | tr -d ' ')
fi

if [[ $TODO_COUNT -eq 0 && $FIXME_COUNT -eq 0 ]]; then
  printf "   ${GREEN}No hay TODOs ni FIXMEs pendientes${NC}\n"
else
  if [[ $TODO_COUNT -gt 0 ]]; then
    printf "   ${YELLOW}TODOs:${NC} %d\n" "$TODO_COUNT"
    grep -rn "TODO\|HACK" "$PROJECT_ROOT/src/" --include="*.js" --include="*.ts" --include="*.css" --include="*.html" 2>/dev/null | head -5 | while IFS= read -r line; do
      printf "   ${DIM}  %s${NC}\n" "${line#$PROJECT_ROOT/}"
    done
  fi
  if [[ $FIXME_COUNT -gt 0 ]]; then
    printf "   ${RED}FIXMEs:${NC} %d\n" "$FIXME_COUNT"
    grep -rn "FIXME\|XXX\|BUG" "$PROJECT_ROOT/src/" --include="*.js" --include="*.ts" --include="*.css" --include="*.html" 2>/dev/null | head -5 | while IFS= read -r line; do
      printf "   ${DIM}  %s${NC}\n" "${line#$PROJECT_ROOT/}"
    done
  fi
  printf "\n   ${DIM}Sugerencia: mover estos items al BACKLOG.md si no estan registrados.${NC}\n"
fi

# ==============================================================================
# 6. LINT RAPIDO
# ==============================================================================
section "6. Estado de lint"

if cd "$PROJECT_ROOT" && npm run lint --silent 2>&1 >/dev/null; then
  printf "   ${GREEN}ESLint: OK${NC}\n"
else
  printf "   ${RED}ESLint: hay errores -- ejecuta 'npm run lint' para detalles${NC}\n"
fi

# ==============================================================================
# RESUMEN FINAL
# ==============================================================================
printf "\n${BOLD}===================================================${NC}\n"
printf "${BOLD}Lumapse -- Sesion lista para trabajar${NC}\n"
printf "${BOLD}===================================================${NC}\n"
printf "${DIM}Fecha: $(date '+%Y-%m-%d %H:%M')${NC}\n"
