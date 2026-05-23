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
if npm run test --silent 2>&1; then
  echo "OK Tests: OK"
else
  echo "FALLO Tests: FALLO"
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
#    Estrategia: intenta el binario Rust (ultra-rápido, ~2ms) y si no está
#    disponible (otro OS, sin cargo), cae a los scripts Python/Shell originales.
echo ""
echo "[4/4] Ejecutando auditorías de código..."

AUDIT_BIN="./scripts/lumapse-audit-bin"

if [ -x "$AUDIT_BIN" ] && "$AUDIT_BIN" --all 2>/dev/null; then
  echo "✅ lumapse-audit (Rust): OK"
else
  echo "⚠️  Binario Rust no disponible o incompatible con este OS."
  echo "    Usando modo de compatibilidad (Python/Shell)..."
  echo ""

  # 4a. Guardia de tamaño de archivos (reemplaza --code)
  echo "  [4a] check-file-size.sh..."
  if bash scripts/check-file-size.sh; then
    echo "  ✅ File size: OK"
  else
    echo "  ⚠️  File size: AVISOS (no bloqueante)"
  fi

  # 4b. Trazabilidad RF/HU/ADR (reemplaza --traceability)
  echo "  [4b] check-traceability.py..."
  if python3 scripts/check-traceability.py.replaced 2>/dev/null || python3 scripts/check-traceability.py 2>/dev/null; then
    echo "  ✅ Traceability: OK"
  else
    echo "  ⚠️  Traceability: AVISOS"
    FAIL=1
  fi

  # 4c. Sincronización schema SQLite (reemplaza --schema)
  echo "  [4c] check-schema-sync.py..."
  if python3 scripts/check-schema-sync.py; then
    echo "  ✅ Schema sync: OK"
  else
    echo "  ⚠️  Schema sync: DIFERENCIAS"
    FAIL=1
  fi

  # 4d. Links internos en documentación (reemplaza --doc-links)
  echo "  [4d] check-doc-links.py..."
  if python3 scripts/check-doc-links.py; then
    echo "  ✅ Doc links: OK"
  else
    echo "  ⚠️  Doc links: LINKS ROTOS"
    FAIL=1
  fi

  # 4e. Jerarquía de materias (reemplaza --hierarchy)
  echo "  [4e] validate-subjects-hierarchy.py..."
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
