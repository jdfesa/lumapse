#!/usr/bin/env bash

# ==============================================================================
# Lumapse -- Guardia de Tamano de Archivos
# ==============================================================================
# Escanea archivos JS, TS, CSS y HTML en src/ y reporta aquellos que superan el
# limite saludable de lineas de codigo (LOC).
#
# Filosofia: NUNCA bloquea el flujo de trabajo. Solo reporta advertencias
# para que la deuda tecnica se registre y se resuelva planificadamente.
#
# Uso: ./scripts/check-file-size.sh
#      ./scripts/check-file-size.sh --json   # Salida para otros scripts
# ==============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$PROJECT_ROOT/src"

# Limites (LOC no vacias)
LIMIT_WARN=250    # Advertencia
LIMIT_DANGER=400  # Peligro alto

# Colores
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
DIM='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

JSON_MODE=false
if [[ "${1:-}" == "--json" ]]; then
  JSON_MODE=true
fi

# Contar LOC no vacias de un archivo
count_loc() {
  grep -cvE '^\s*$' "$1" 2>/dev/null || echo "0"
}

# Ruta relativa desde la raiz del proyecto
rel_path() {
  echo "${1#$PROJECT_ROOT/}"
}

main() {
  if [[ "$JSON_MODE" == false ]]; then
    printf "${BOLD}Lumapse -- Guardia de Tamano de Archivos${NC}\n"
    printf "==================================================\n"
    printf "Escaneando archivos en src/ ...\n\n"
  fi

  local warnings=0
  local dangers=0
  local ok_count=0
  local total=0
  local json_entries=""

  # Buscar archivos JS, TS, CSS y HTML en src/
  while IFS= read -r -d '' file; do
    total=$((total + 1))
    local loc
    loc=$(count_loc "$file")
    local rpath
    rpath=$(rel_path "$file")

    if [[ "$JSON_MODE" == true ]]; then
      local status="ok"
      if [[ $loc -gt $LIMIT_DANGER ]]; then
        status="danger"
      elif [[ $loc -gt $LIMIT_WARN ]]; then
        status="warn"
      fi
      if [[ -n "$json_entries" ]]; then
        json_entries="${json_entries},"
      fi
      json_entries="${json_entries}{\"file\":\"${rpath}\",\"loc\":${loc},\"status\":\"${status}\"}"
      continue
    fi

    if [[ $loc -gt $LIMIT_DANGER ]]; then
      dangers=$((dangers + 1))
      printf "${RED}  [PELIGRO]${NC} %4d LOC  %s\n" "$loc" "$rpath"
    elif [[ $loc -gt $LIMIT_WARN ]]; then
      warnings=$((warnings + 1))
      printf "${YELLOW}  [AVISO]  ${NC} %4d LOC  %s\n" "$loc" "$rpath"
    else
      ok_count=$((ok_count + 1))
    fi
  done < <(find "$SRC_DIR" \( -name "*.js" -o -name "*.ts" -o -name "*.css" -o -name "*.html" \) -type f -print0 | sort -z)

  if [[ "$JSON_MODE" == true ]]; then
    printf '[%s]' "$json_entries"
    return 0
  fi

  # Resumen
  printf "\n==================================================\n"
  printf "${GREEN}OK:${NC} %d archivos dentro del limite\n" "$ok_count"

  if [[ $warnings -gt 0 ]]; then
    printf "${YELLOW}AVISOS:${NC} %d archivos superan %d LOC\n" "$warnings" "$LIMIT_WARN"
  fi

  if [[ $dangers -gt 0 ]]; then
    printf "${RED}PELIGRO:${NC} %d archivos superan %d LOC\n" "$dangers" "$LIMIT_DANGER"
    printf "\n${DIM}Sugerencia: ejecuta 'python3 scripts/split-guide.py' para ver como dividirlos.${NC}\n"
  fi

  if [[ $warnings -eq 0 && $dangers -eq 0 ]]; then
    printf "\nTodos los archivos estan dentro de los limites saludables.\n"
  fi

  # NUNCA falla -- solo reporta
  return 0
}

main "$@"
