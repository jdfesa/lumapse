#!/usr/bin/env bash
set -Eeuo pipefail

# ==============================================================================
# Lumapse — Auditoría Offline-First
# ==============================================================================
# Escanea src/, public/ e index.html en busca de URLs externas (http/https)
# que podrían romper el funcionamiento offline de la app.
#
# Uso: ./scripts/check-offline.sh
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

EXCLUDED_DIRS="docs/, node_modules/, tmp/, android/, dist/, scripts/, analisis-relevamiento/"

FILES=()
FINDINGS=()
REAL_COUNT=0
COMMENT_COUNT=0

while IFS= read -r file; do
  FILES+=("$file")
done < <(
  {
    if [ -d "$PROJECT_ROOT/src" ]; then
      find "$PROJECT_ROOT/src" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.css" \)
    fi

    if [ -d "$PROJECT_ROOT/public" ]; then
      find "$PROJECT_ROOT/public" -type f
    fi

    if [ -f "$PROJECT_ROOT/index.html" ]; then
      printf '%s\n' "$PROJECT_ROOT/index.html"
    fi
  } | LC_ALL=C sort
)

is_probable_comment() {
  local line="$1"
  local trimmed="$line"

  while [[ "$trimmed" == [[:space:]]* ]]; do
    trimmed="${trimmed#?}"
  done

  [[ "$trimmed" == //* || "$trimmed" == /\** || "$trimmed" == \** ]]
}

relative_path() {
  local absolute_path="$1"
  printf '%s' "${absolute_path#"$PROJECT_ROOT"/}"
}

scan_file() {
  local file="$1"
  local line_number=0
  local line
  local rel_path

  rel_path="$(relative_path "$file")"

  while IFS= read -r line || [ -n "$line" ]; do
    line_number=$((line_number + 1))
    line="${line%$'\r'}"

    case "$line" in
      *http://*|*https://*)
        if is_probable_comment "$line"; then
          COMMENT_COUNT=$((COMMENT_COUNT + 1))
          FINDINGS+=("   $rel_path:$line_number: (comentario?) $line")
        elif [[ "$line" == *".startsWith("* ]] || [[ "$line" == *".includes("* ]]; then
          COMMENT_COUNT=$((COMMENT_COUNT + 1))
          FINDINGS+=("   $rel_path:$line_number: (excepción lógico) $line")
        else
          REAL_COUNT=$((REAL_COUNT + 1))
          FINDINGS+=("   $rel_path:$line_number: $line")
        fi
        ;;
    esac
  done < "$file"
}

for file in "${FILES[@]}"; do
  scan_file "$file"
done

TOTAL_COUNT=$((REAL_COUNT + COMMENT_COUNT))

printf '🔍 Lumapse — Auditoría Offline-First\n'
printf '==================================================\n'
printf 'Escaneando código fuente y assets...\n'
printf '📂 Archivos escaneados: %d\n' "${#FILES[@]}"
printf '📂 Directorios excluidos: %s\n' "$EXCLUDED_DIRS"
printf '%s\n' '--------------------------------------------------'

if [ "$TOTAL_COUNT" -gt 0 ]; then
  printf '🔎 Referencias externas encontradas:\n'
  for finding in "${FINDINGS[@]}"; do
    printf '%s\n' "$finding"
  done
  printf 'Total: %d referencia(s) externa(s) encontrada(s)\n' "$TOTAL_COUNT"
  printf '   ⚠️  %d posible(s) problema(s) real(es)\n' "$REAL_COUNT"
  printf '   💬 %d probable(s) comentario(s)\n' "$COMMENT_COUNT"
  printf '==================================================\n'

  if [ "$REAL_COUNT" -gt 0 ]; then
    exit 1
  fi

  exit 0
fi

printf '==================================================\n'
printf '✅ Offline-First: No se encontraron referencias externas en el código\n'
printf '==================================================\n'
