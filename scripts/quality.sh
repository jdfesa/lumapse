#!/usr/bin/env bash

# ==============================================================================
# Lumapse — Quality Gate
# ==============================================================================
# Ejecuta todos los chequeos de calidad del proyecto en un solo comando.
# Diseñado para correr antes de cerrar una sesión de trabajo, antes de
# un commit importante o como validación general del estado del proyecto.
# ==============================================================================

set -e

echo "🔍 Lumapse — Quality Gate"
echo "=================================================="

FAIL=0

tests_finished_without_failures() {
  local output="$1"

  printf '%s\n' "$output" | grep -Eq 'Test Files[[:space:]].*passed[[:space:]]+\([0-9]+\)' || return 1
  printf '%s\n' "$output" | grep -Eq 'Tests[[:space:]].*passed[[:space:]]+\([0-9]+\)' || return 1
  ! printf '%s\n' "$output" | grep -Eq '^(.*Test Files|.*Tests)[[:space:]].*failed'
}

# 1. Linting
echo ""
echo "[1/4] Ejecutando ESLint..."
if npm run lint --silent 2>&1; then
  echo "OK Lint: OK"
else
  echo "FALLO Lint: FALLO"
  FAIL=1
fi

# 2. Tests unitarios
echo ""
echo "[2/4] Ejecutando tests unitarios..."
set +e
TEST_OUTPUT="$(npm run test --silent 2>&1)"
TEST_EXIT=$?
set -e
printf '%s\n' "$TEST_OUTPUT"
if [ $TEST_EXIT -eq 0 ]; then
  echo "OK Tests: OK"
elif [ $TEST_EXIT -eq 139 ] && tests_finished_without_failures "$TEST_OUTPUT"; then
  echo "OK Tests: OK (⚠️  Node segfault al cerrar — ignorado)"
else
  echo "FALLO Tests: FALLO (exit $TEST_EXIT)"
  FAIL=1
fi

# 3. Build de produccion
echo ""
echo "[3/4] Ejecutando build de produccion..."
if npm run build --silent 2>&1; then
  echo "OK Build: OK"
else
  echo "FALLO Build: FALLO"
  FAIL=1
fi

# 4. Auditoría de código y documentación
#    Estrategia: usa el binario Rust cuando esta disponible y ejecutable.
#    Si el binario falta o es incompatible con el OS actual, cae a los scripts
#    Python/Shell preservados. Si Rust corre y encuentra problemas reales, no
#    se enmascara el resultado con fallback.
echo ""
echo "[4/4] Ejecutando auditorías de código..."

AUDIT_BIN="./scripts/lumapse-audit-bin"

if [ -x "$AUDIT_BIN" ] && "$AUDIT_BIN" --help >/dev/null 2>&1; then
  if "$AUDIT_BIN" --all; then
    echo "✅ lumapse-audit (Rust): OK"
  else
    echo "❌ lumapse-audit (Rust): encontró problemas reales"
    FAIL=1
  fi
else
  echo "⚠️  Binario Rust no disponible o incompatible con este OS."
  echo "    Usando modo de compatibilidad (Python/Shell)..."
  echo ""

  # 4a. Guardia de tamaño de archivos (parte de --code)
  echo "  [4a] check-file-size.sh..."
  if bash scripts/check-file-size.sh; then
    echo "  ✅ File size: OK"
  else
    echo "  ⚠️  File size: AVISOS (no bloqueante)"
  fi

  # 4b. Auditoria offline-first (parte de --code)
  echo "  [4b] check-offline.sh..."
  if bash scripts/check-offline.sh; then
    echo "  ✅ Offline-first: OK"
  else
    echo "  ⚠️  Offline-first: REFERENCIAS EXTERNAS"
    FAIL=1
  fi

  # 4c. Auditoria historica de TODOs y estado Git (parte documental de --code)
  echo "  [4c] check-docs.sh..."
  if bash scripts/check-docs.sh; then
    echo "  ✅ Quick docs/code audit: OK"
  else
    echo "  ⚠️  Quick docs/code audit: AVISOS"
  fi

  # 4d. Trazabilidad RF/HU/ADR (reemplaza --traceability)
  echo "  [4d] check-traceability.py..."
  if python3 scripts/check-traceability.py.replaced 2>/dev/null || python3 scripts/check-traceability.py 2>/dev/null; then
    echo "  ✅ Traceability: OK"
  else
    echo "  ⚠️  Traceability: AVISOS"
    FAIL=1
  fi

  # 4e. Sincronización schema SQLite (reemplaza --schema)
  echo "  [4e] check-schema-sync.py..."
  if python3 scripts/check-schema-sync.py; then
    echo "  ✅ Schema sync: OK"
  else
    echo "  ⚠️  Schema sync: DIFERENCIAS"
    FAIL=1
  fi

  # 4f. Links internos en documentación (reemplaza --doc-links)
  echo "  [4f] check-doc-links.py..."
  if python3 scripts/check-doc-links.py; then
    echo "  ✅ Doc links: OK"
  else
    echo "  ⚠️  Doc links: LINKS ROTOS"
    FAIL=1
  fi

  # 4g. Jerarquía de materias (reemplaza --hierarchy)
  echo "  [4g] validate-subjects-hierarchy.py..."
  if python3 scripts/validate-subjects-hierarchy.py; then
    echo "  ✅ Hierarchy: OK"
  else
    echo "  ⚠️  Hierarchy: VIOLACIONES"
    FAIL=1
  fi

  echo ""
  echo "  Modo compatibilidad completado."
fi

# Resumen final
echo ""
echo "=================================================="
if [ $FAIL -eq 0 ]; then
  echo "OK Quality Gate: TODOS LOS CHEQUEOS PASARON"
else
  echo "FALLO Quality Gate: HAY FALLOS -- revisar la salida anterior"
  exit 1
fi
