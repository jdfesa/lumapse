#!/usr/bin/env bash

# ==============================================================================
# Lumapse — Deploy Android Limpio
# ==============================================================================
# Este script automatiza el ciclo de despliegue en un dispositivo Android.
# Soluciona el problema de caché agresivo del WebView desinstalando la
# aplicación antes de cada nuevo build, garantizando que los assets
# mostrados (HTML/CSS/JS) sean siempre los más recientes.
# ==============================================================================

set -e # Detener la ejecución inmediatamente si algún comando falla

echo "🚀 Iniciando despliegue limpio de Lumapse en Android..."

# 1. Verificar si ADB detecta dispositivos
DEVICE_COUNT=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l | tr -d ' ')
if [ "$DEVICE_COUNT" -eq "0" ]; then
  echo "❌ Error: No se detectaron dispositivos Android conectados."
  echo "   Asegurate de que el celular esté conectado por USB y con la depuración activa."
  exit 1
fi
echo "📱 Dispositivos detectados: $DEVICE_COUNT"

# 2. Desinstalar versión anterior (limpia caché del WebView)
# Usamos '|| true' para que el script no falle si la app no estaba instalada
echo "🧹 Desinstalando versión anterior..."
adb uninstall com.lumapse.app > /dev/null 2>&1 || true

# 3. Build web
echo "📦 Compilando web app (Vite)..."
npm run build

# 4. Sincronización
echo "🔄 Sincronizando assets con Capacitor..."
npx cap sync android

# 5. Despliegue
echo "📲 Compilando APK e instalando en dispositivo..."
npx cap run android

echo "=================================================="
echo "✅ ¡Despliegue completado con éxito!"
echo "=================================================="
