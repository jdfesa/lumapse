#!/usr/bin/env bash
set -Eeuo pipefail

# ==============================================================================
# Lumapse — Bundle Budget
# ==============================================================================
# Ejecuta el build de producción y verifica que los tamaños del bundle
# se mantienen dentro de los presupuestos definidos.
#
# Presupuestos (gzip):
#   JS:    80 kB
#   CSS:   20 kB
#   HTML:   5 kB
#   Total: 100 kB
#
# Uso: ./scripts/bundle-budget.sh
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Presupuestos en kB (gzip)
# Incrementados para acomodar el motor relacional SQLite y jeep-sqlite (simulación web)
BUDGET_JS=150
BUDGET_CSS=20
BUDGET_HTML=5
BUDGET_TOTAL=180

JS_GZIP=0
CSS_GZIP=0
HTML_GZIP=0
TOTAL_GZIP=0
EXCEEDED_COUNT=0

add_float() {
  awk -v a="$1" -v b="$2" 'BEGIN { printf "%.2f", a + b }'
}

compare_gt() {
  awk -v a="$1" -v b="$2" 'BEGIN { if (a > b) print 1; else print 0 }'
}

percentage() {
  awk -v used="$1" -v limit="$2" 'BEGIN { if (limit <= 0) print 0; else printf "%d", (used / limit) * 100 + 0.5 }'
}

overage() {
  awk -v used="$1" -v limit="$2" 'BEGIN { printf "%.2f", used - limit }'
}

progress_bar() {
  local used="$1"
  local limit="$2"
  local filled
  local empty
  local bar=""
  local i

  filled="$(awk -v used="$used" -v limit="$limit" 'BEGIN {
    if (limit <= 0 || used <= 0) {
      print 0
    } else {
      blocks = int((used / limit) * 20)
      if (blocks < 1) blocks = 1
      if (blocks > 20) blocks = 20
      print blocks
    }
  }')"

  empty=$((20 - filled))

  for ((i = 0; i < filled; i++)); do
    bar="${bar}█"
  done

  for ((i = 0; i < empty; i++)); do
    bar="${bar}░"
  done

  printf '%s' "$bar"
}

parse_build_output() {
  local output="$1"
  local line
  local asset
  local gzip_size

  while IFS= read -r line; do
    case "$line" in
      *"gzip:"*)
        asset="$(printf '%s\n' "$line" | awk '{ print $1 }')"
        gzip_size="$(printf '%s\n' "$line" | awk -F'gzip:' '{ print $2 }' | awk '{ print $1 }')"

        if [ -z "$gzip_size" ]; then
          continue
        fi

        TOTAL_GZIP="$(add_float "$TOTAL_GZIP" "$gzip_size")"

        case "$asset" in
          *.js)
            JS_GZIP="$(add_float "$JS_GZIP" "$gzip_size")"
            ;;
          *.css)
            CSS_GZIP="$(add_float "$CSS_GZIP" "$gzip_size")"
            ;;
          *.html)
            HTML_GZIP="$(add_float "$HTML_GZIP" "$gzip_size")"
            ;;
        esac
        ;;
    esac
  done <<< "$output"
}

print_budget_line() {
  local label="$1"
  local used="$2"
  local budget="$3"
  local pct
  local bar
  local status
  local extra=""

  pct="$(percentage "$used" "$budget")"
  bar="$(progress_bar "$used" "$budget")"

  if [ "$(compare_gt "$used" "$budget")" -eq 1 ]; then
    status="❌"
    extra=" (+$(overage "$used" "$budget") kB)"
    EXCEEDED_COUNT=$((EXCEEDED_COUNT + 1))
  else
    status="✅"
  fi

  printf '   %-6s %6.2f kB / %6.2f kB  [%s] %3d%%  %s%s\n' \
    "$label:" "$used" "$budget" "$bar" "$pct" "$status" "$extra"
}

printf '📦 Lumapse — Bundle Budget\n'
printf '==================================================\n'
printf 'Ejecutando build de producción...\n'

if ! BUILD_OUTPUT="$(cd "$PROJECT_ROOT" && npm run build 2>&1)"; then
  printf '❌ Build falló\n'
  printf '%s\n' '--------------------------------------------------'
  printf '%s\n' "$BUILD_OUTPUT"
  printf '==================================================\n'
  exit 1
fi

BUILD_TIME="$(printf '%s\n' "$BUILD_OUTPUT" | sed -n 's/.*built in \([^ ]*\).*/\1/p' | tail -n 1)"
if [ -z "$BUILD_TIME" ]; then
  BUILD_TIME="tiempo no disponible"
fi

parse_build_output "$BUILD_OUTPUT"

if [ "$(compare_gt 0.01 "$TOTAL_GZIP")" -eq 1 ]; then
  printf '❌ No se pudieron parsear tamaños gzip desde la salida de Vite\n'
  printf '%s\n' '--------------------------------------------------'
  printf '%s\n' "$BUILD_OUTPUT"
  printf '==================================================\n'
  exit 1
fi

printf '✓ Build completado en %s\n' "$BUILD_TIME"
printf '%s\n' '--------------------------------------------------'
printf '📊 Análisis de tamaño (gzip):\n'
print_budget_line "JS" "$JS_GZIP" "$BUDGET_JS"
print_budget_line "CSS" "$CSS_GZIP" "$BUDGET_CSS"
print_budget_line "HTML" "$HTML_GZIP" "$BUDGET_HTML"
printf '   ────────────────────────────────────────────────\n'
print_budget_line "Total" "$TOTAL_GZIP" "$BUDGET_TOTAL"
printf '==================================================\n'

if [ "$EXCEEDED_COUNT" -gt 0 ]; then
  printf '❌ Bundle Budget: %d PRESUPUESTO(S) EXCEDIDO(S)\n' "$EXCEEDED_COUNT"
  printf '   Revisar las dependencias antes de hacer commit.\n'
  printf '==================================================\n'
  exit 1
fi

printf '✅ Bundle Budget: TODOS LOS PRESUPUESTOS OK\n'
printf '==================================================\n'
