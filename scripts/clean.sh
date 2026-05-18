#!/usr/bin/env bash

# ==============================================================================
# Lumapse — Clean Project
# ==============================================================================
# Este script limpia cachés, carpetas de compilación y artefactos temporales
# para devolver el proyecto a un estado limpio. Ideal cuando hay errores
# extraños de compilación o dependencias "fantasma".
# ==============================================================================

echo "🧹 Iniciando limpieza del proyecto Lumapse..."

# 1. Limpiar caché de Vite
if [ -d "node_modules/.vite" ]; then
  echo "🗑️  Borrando caché de Vite..."
  rm -rf node_modules/.vite
fi

# 2. Limpiar build web (dist)
if [ -d "dist" ]; then
  echo "🗑️  Borrando carpeta dist/..."
  rm -rf dist
fi

# 3. Limpiar compilación de Android
if [ -d "android/app/build" ] || [ -d "android/.gradle" ]; then
  echo "🗑️  Borrando build de Android (Gradle)..."
  rm -rf android/app/build
  rm -rf android/.gradle
fi

# 4. Gestión de la carpeta tmp/
# Contiene archivos temporales que pueden ser necesarios para ciertos procesos.
# Se solicita confirmación interactiva antes de vaciarla.
if [ -d "tmp" ]; then
  echo ""
  read -p "⚠️  ¿Deseas vaciar el contenido de la carpeta 'tmp/'? (y/N): " clean_tmp
  if [[ "$clean_tmp" =~ ^[Yy]$ ]]; then
    echo "🗑️  Vaciando contenido de tmp/..."
    # Borra solo el contenido para mantener la carpeta
    find tmp -mindepth 1 -delete
  else
    echo "⏭️  Omitiendo la limpieza de tmp/."
  fi
fi

echo ""
echo "✨ Limpieza completada. El entorno está fresco."
