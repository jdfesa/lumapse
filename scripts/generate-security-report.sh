#!/usr/bin/env bash
set -Eeuo pipefail

# ==============================================================================
# Lumapse — Reporte de Seguridad de Dependencias
# ==============================================================================
# Ejecuta npm audit y genera un reporte Markdown para documentación académica.
#
# Uso: ./scripts/generate-security-report.sh
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_DIR="$PROJECT_ROOT/docs/gestion"
REPORT_PATH="$REPORT_DIR/reporte-seguridad.md"
RELATIVE_REPORT_PATH="docs/gestion/reporte-seguridad.md"
GENERATED_AT="$(date '+%Y-%m-%d %H:%M')"

printf '🔒 Ejecutando auditoría de seguridad en dependencias...\n'

AUDIT_OUTPUT="$(cd "$PROJECT_ROOT" && npm audit 2>&1 || true)"

mkdir -p "$REPORT_DIR"

{
  printf '# 🛡️ Reporte de Seguridad de Dependencias\n'
  printf '**Fecha de generación:** %s\n' "$GENERATED_AT"
  printf '**Generado por:** Automatización Lumapse (generate-security-report.sh)\n'
  printf '## Resumen de Auditoría\n'
  printf 'El siguiente reporte es un análisis estático de las dependencias de Node.js utilizadas en el proyecto para identificar vulnerabilidades conocidas (CVEs).\n'
  printf '## Salida de `npm audit`\n'
  printf '```text\n'
  printf '%s\n' "$AUDIT_OUTPUT"
  printf '```\n'
} > "$REPORT_PATH"

printf '✅ Reporte generado exitosamente en: %s\n' "$RELATIVE_REPORT_PATH"
