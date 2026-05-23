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

# 4. Auditor unificado Rust
echo ""
echo "[4/4] Ejecutando lumapse-audit --all..."
if ./scripts/lumapse-audit-bin --all; then
  echo "OK lumapse-audit: OK"
else
  echo "FALLO lumapse-audit: FALLO"
  FAIL=1
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
