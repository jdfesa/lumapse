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
echo "📋 [1/3] Ejecutando ESLint..."
if npm run lint --silent 2>&1; then
  echo "✅ Lint: OK"
else
  echo "❌ Lint: FALLÓ"
  FAIL=1
fi

# 2. Build de producción
echo ""
echo "📦 [2/3] Ejecutando build de producción..."
if npm run build --silent 2>&1; then
  echo "✅ Build: OK"
else
  echo "❌ Build: FALLÓ"
  FAIL=1
fi

# 3. Auditoría de documentación
echo ""
echo "📝 [3/3] Ejecutando auditoría de docs..."
./scripts/check-docs.sh

# Resumen final
echo ""
echo "=================================================="
if [ $FAIL -eq 0 ]; then
  echo "✅ Quality Gate: TODOS LOS CHEQUEOS PASARON"
else
  echo "❌ Quality Gate: HAY FALLOS — revisar la salida anterior"
  exit 1
fi
