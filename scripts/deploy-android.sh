#!/usr/bin/env bash

# ==============================================================================
# Lumapse — Deploy Android Seguro
# ==============================================================================
# Este script automatiza el ciclo de despliegue en un dispositivo Android.
#
# Cambio importante (2026-05-26):
# - Por defecto instala encima y conserva los datos locales de la app
#   (SQLite, preferencias, estado de pruebas).
# - Para un deploy limpio que borre datos/caché, usar --clean.
# - Para evitar selectores interactivos cuando hay más de un dispositivo,
#   usar --target <deviceId>.
# ==============================================================================

set -euo pipefail

APP_ID="com.lumapse.app"
TARGET_DEVICE=""
CLEAN_INSTALL=0

usage() {
  cat <<'EOF'
Uso:
  ./scripts/deploy-android.sh [opciones]

Opciones:
  --target <deviceId>  Instala en un dispositivo ADB específico.
  --clean              Desinstala la app antes de instalar. Borra SQLite/datos locales.
  -h, --help           Muestra esta ayuda.

Ejemplos:
  ./scripts/deploy-android.sh
  ./scripts/deploy-android.sh --target ad071603088c2172aa
  ./scripts/deploy-android.sh --target ad071603088c2172aa --clean

Notas:
  - El modo normal preserva datos locales para poder probar archivado,
    papelera, restauraciones y casos borde sin perder la base SQLite.
  - Usar --clean cuando el WebView muestre assets viejos o se necesite
    una instalación fresca. Ese modo borra los datos de la app.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target)
      if [ "${2:-}" = "" ]; then
        echo "❌ Error: --target requiere un deviceId."
        usage
        exit 1
      fi
      TARGET_DEVICE="$2"
      shift 2
      ;;
    --clean)
      CLEAN_INSTALL=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "❌ Error: opción desconocida: $1"
      usage
      exit 1
      ;;
  esac
done

echo "🚀 Iniciando despliegue seguro de Lumapse en Android..."

# 1. Verificar si ADB detecta dispositivos listos.
ADB_DEVICES="$(adb devices | awk 'NR > 1 && $2 == "device" { print $1 }')"
DEVICE_COUNT="$(printf '%s\n' "$ADB_DEVICES" | sed '/^$/d' | wc -l | tr -d ' ')"

if [ "$DEVICE_COUNT" -eq 0 ]; then
  echo "❌ Error: No se detectaron dispositivos Android conectados."
  echo "   Asegurate de que el celular esté conectado por USB y con la depuración activa."
  exit 1
fi

if [ -n "$TARGET_DEVICE" ]; then
  if ! printf '%s\n' "$ADB_DEVICES" | grep -Fxq "$TARGET_DEVICE"; then
    echo "❌ Error: el dispositivo '$TARGET_DEVICE' no está disponible en ADB."
    echo "   Dispositivos conectados:"
    printf '   - %s\n' $ADB_DEVICES
    exit 1
  fi
elif [ "$DEVICE_COUNT" -eq 1 ]; then
  TARGET_DEVICE="$ADB_DEVICES"
else
  echo "❌ Error: hay más de un dispositivo conectado."
  echo "   Indicá explícitamente el destino con --target <deviceId>."
  echo ""
  echo "   Dispositivos disponibles:"
  printf '   - %s\n' $ADB_DEVICES
  echo ""
  echo "   Ejemplo:"
  echo "   ./scripts/deploy-android.sh --target $(printf '%s\n' "$ADB_DEVICES" | sed -n '1p')"
  exit 1
fi

echo "📱 Dispositivo destino: $TARGET_DEVICE"

# 2. Limpieza opcional.
if [ "$CLEAN_INSTALL" -eq 1 ]; then
  echo "🧹 Modo --clean: desinstalando versión anterior y borrando datos locales..."
  adb -s "$TARGET_DEVICE" uninstall "$APP_ID" > /dev/null 2>&1 || true
else
  echo "💾 Modo normal: se preservan SQLite y datos locales de la app."
fi

# 3. Build web
echo "📦 Compilando web app (Vite)..."
npm run build

# 4. Sincronización
echo "🔄 Sincronizando assets con Capacitor..."
npx cap sync android

# 5. Despliegue
echo "📲 Compilando APK e instalando en dispositivo..."
npx cap run android --target "$TARGET_DEVICE"

echo "=================================================="
echo "✅ ¡Despliegue completado con éxito!"
if [ "$CLEAN_INSTALL" -eq 1 ]; then
  echo "   Modo: limpio (--clean, datos locales borrados)"
else
  echo "   Modo: preservando datos locales"
fi
echo "   Dispositivo: $TARGET_DEVICE"
echo "=================================================="
