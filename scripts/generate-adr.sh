#!/usr/bin/env bash
set -Eeuo pipefail

# ==============================================================================
# Lumapse — Generador de ADR
# ==============================================================================
# Crea un nuevo Architecture Decision Record con numeración secuencial.
#
# Uso: ./scripts/generate-adr.sh "Título de la decisión"
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ADR_DIR="$PROJECT_ROOT/docs/adr"

usage() {
  printf 'Uso: ./scripts/generate-adr.sh "Título de la decisión"\n'
  printf 'Ejemplo: ./scripts/generate-adr.sh "Migrar a persistencia local"\n'
}

if [ "$#" -eq 0 ]; then
  printf '❌ Falta el título de la decisión arquitectónica.\n'
  usage
  exit 1
fi

TITLE="$*"
SLUG="$(
  printf '%s' "$TITLE" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9]/-/g' \
    | sed 's/--*/-/g' \
    | sed 's/^-//' \
    | sed 's/-$//'
)"

if [ -z "$SLUG" ]; then
  printf '❌ El título no contiene caracteres válidos para generar el archivo.\n'
  usage
  exit 1
fi

mkdir -p "$ADR_DIR"

MAX_NUMBER=0
while IFS= read -r file; do
  filename="$(basename "$file")"
  number="${filename#ADR-}"
  number="${number%%-*}"

  if [[ "$number" =~ ^[0-9]{3}$ ]] && [ "$((10#$number))" -gt "$MAX_NUMBER" ]; then
    MAX_NUMBER="$((10#$number))"
  fi
done < <(find "$ADR_DIR" -maxdepth 1 -type f -name 'ADR-[0-9][0-9][0-9]-*.md' | sort)

NEXT_NUMBER="$((MAX_NUMBER + 1))"
ADR_NUMBER="$(printf '%03d' "$NEXT_NUMBER")"
DATE_STAMP="$(date '+%Y-%m-%d')"
FILENAME="ADR-${ADR_NUMBER}-${SLUG}.md"
ADR_PATH="$ADR_DIR/$FILENAME"
RELATIVE_PATH="docs/adr/$FILENAME"

if [ -e "$ADR_PATH" ]; then
  printf '❌ Ya existe el archivo %s\n' "$RELATIVE_PATH"
  exit 1
fi

cat > "$ADR_PATH" <<EOF
# ADR-$ADR_NUMBER: $TITLE
**Fecha:** $DATE_STAMP
**Estado:** Propuesto / Aceptado / Rechazado
**Autor:** Jose David Sandoval
## Contexto
[Describe aquí el problema o situación actual que requiere tomar esta decisión]
## Decisión
[Describe la decisión arquitectónica exacta que se ha tomado]
## Consecuencias
- **Positivas:** 
  - [Beneficio 1]
- **Negativas / Riesgos:**
  - [Trade-off 1]
EOF

printf '✅ ADR generado exitosamente: %s\n' "$RELATIVE_PATH"
printf 'Por favor, abre el archivo y completa los campos de Contexto, Decisión y Consecuencias.\n'
