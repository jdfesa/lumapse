#!/usr/bin/env bash

# ==============================================================================
# Lumapse — Auditoría Rápida de Proyecto
# ==============================================================================
# Verifica consistencia básica: TODOs pendientes en el código y el estado del
# repositorio, como medida de seguridad antes de realizar commits importantes
# para mantener la rigurosidad académica del proyecto.
# ==============================================================================

echo "🔍 Iniciando auditoría rápida del proyecto..."
echo "---------------------------------------------------"

# 1. Buscar TODOs y FIXMEs en el código fuente
echo "📝 Buscando TODOs o FIXMEs pendientes en src/..."
# Usamos '|| true' para evitar que el script falle si grep no encuentra nada
TODOS=$(grep -rnw 'src/' -e 'TODO' -e 'FIXME' 2>/dev/null || true)

if [ -z "$TODOS" ]; then
  echo "✅ No se encontraron tareas técnicas pendientes (TODO/FIXME) en el código."
else
  echo "⚠️  Atención: Tareas pendientes encontradas:"
  # Formatear la salida para que sea fácil de leer
  echo "$TODOS" | while read -r line; do
    echo "   - $line"
  done
fi

echo "---------------------------------------------------"

# 2. Resumen rápido del estado de Git
echo "📂 Estado actual del repositorio (git status):"
git status --short

echo "---------------------------------------------------"
echo "✅ Auditoría completada."
