#!/usr/bin/env bash
set -Eeuo pipefail

# ==============================================================================
# Lumapse — Generador de Migraciones SQLite
# ==============================================================================
# Crea un archivo SQL con boilerplate estándar para versionar cambios de esquema.
#
# Uso: ./scripts/generate-migration.sh nombre_migracion
# Ejemplo: ./scripts/generate-migration.sh create_notes_table
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATIONS_DIR="$PROJECT_ROOT/src/store/migrations"

usage() {
  printf 'Uso: ./scripts/generate-migration.sh nombre_migracion\n'
  printf 'Ejemplo: ./scripts/generate-migration.sh create_notes_table\n'
}

if [ "$#" -eq 0 ]; then
  printf '❌ Falta el nombre de la migración.\n'
  usage
  exit 1
fi

RAW_NAME="$*"
MIGRATION_NAME="$(
  printf '%s' "$RAW_NAME" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9]/_/g' \
    | sed 's/__*/_/g' \
    | sed 's/^_//' \
    | sed 's/_$//'
)"

if [ -z "$MIGRATION_NAME" ]; then
  printf '❌ El nombre de la migración no contiene caracteres válidos.\n'
  usage
  exit 1
fi

TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
READABLE_DATE="$(date '+%Y-%m-%d %H:%M:%S %Z')"
FILENAME="${TIMESTAMP}_${MIGRATION_NAME}.sql"
MIGRATION_PATH="$MIGRATIONS_DIR/$FILENAME"
RELATIVE_PATH="src/store/migrations/$FILENAME"

mkdir -p "$MIGRATIONS_DIR"

cat > "$MIGRATION_PATH" <<SQL
-- Migración: $MIGRATION_NAME
-- Creada: $READABLE_DATE
-- ==========================================
-- UP (Aplicar cambios)
-- ==========================================
-- Escribe tus sentencias CREATE / ALTER aquí.
-- ==========================================
-- DOWN (Revertir cambios)
-- ==========================================
-- Escribe tus sentencias DROP / revertir aquí.
SQL

printf '✅ Migración generada: %s\n' "$RELATIVE_PATH"
