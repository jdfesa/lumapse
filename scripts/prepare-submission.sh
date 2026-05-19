#!/usr/bin/env bash
set -Eeuo pipefail

# ==============================================================================
# Lumapse — Empaquetador de Entregas
# ==============================================================================
# Genera un .zip limpio del proyecto para entregas universitarias, excluyendo
# artefactos pesados, temporales o propios del entorno local.
#
# Uso: ./scripts/prepare-submission.sh
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATE_STAMP="$(date '+%Y%m%d')"
OUTPUT_NAME="Lumapse_Entrega_${DATE_STAMP}.zip"
OUTPUT_PATH="$PROJECT_ROOT/$OUTPUT_NAME"

format_size() {
  local file="$1"

  if command -v stat >/dev/null 2>&1; then
    local bytes
    bytes="$(stat -f '%z' "$file" 2>/dev/null || stat -c '%s' "$file" 2>/dev/null || printf '0')"
    awk -v bytes="$bytes" 'BEGIN {
      if (bytes >= 1048576) {
        printf "%.1f MB", bytes / 1048576
      } else if (bytes >= 1024) {
        printf "%.1f KB", bytes / 1024
      } else {
        printf "%d B", bytes
      }
    }'
  else
    printf 'tamaño no disponible'
  fi
}

printf '🎓 Lumapse — Empaquetador de Entregas\n'
printf '==================================================\n'
printf 'Empaquetando código fuente y documentación...\n'
printf 'Excluyendo: .git/, node_modules/, dist/, android/, tmp/ ...\n'

if ! command -v zip >/dev/null 2>&1; then
  printf '❌ No se encontró el comando zip en el sistema.\n'
  printf '==================================================\n'
  exit 1
fi

if [ -f "$OUTPUT_PATH" ]; then
  rm -f "$OUTPUT_PATH"
fi

(
  cd "$PROJECT_ROOT"
  zip -r "$OUTPUT_NAME" . \
    -x ".git/*" \
    -x "node_modules/*" \
    -x "dist/*" \
    -x "android/*" \
    -x "tmp/*" \
    -x "*/.DS_Store" \
    -x ".DS_Store" \
    -x "*.zip" \
    >/dev/null
)

printf '✅ Archivo generado: %s\n' "$OUTPUT_NAME"
printf '⚖️  Tamaño: %s\n' "$(format_size "$OUTPUT_PATH")"
printf 'El proyecto está listo para ser enviado a la universidad.\n'
printf '==================================================\n'
