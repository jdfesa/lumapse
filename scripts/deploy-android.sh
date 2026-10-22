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

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"
APP_ID="com.lumapse.app"
TARGET_DEVICE=""
CLEAN_INSTALL=0
APK_PATH="$PROJECT_ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
DEPLOY_TMP=""
trap 'if [ -n "$DEPLOY_TMP" ]; then rm -rf "$DEPLOY_TMP"; fi' EXIT

find_apksigner() {
  if command -v apksigner >/dev/null 2>&1; then
    command -v apksigner
    return
  fi
  local sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" candidate found=""
  if [ -n "$sdk" ]; then
    for candidate in "$sdk"/build-tools/*/apksigner; do
      if [ -x "$candidate" ]; then found="$candidate"; fi
    done
  fi
  if [ -z "$found" ]; then
    echo "❌ No se encontró apksigner. Configurá ANDROID_HOME/ANDROID_SDK_ROOT o su PATH; no se instalará ni borrará la app." >&2
    return 1
  fi
  printf '%s\n' "$found"
}

certificate_digests() {
  local output digests
  if ! output="$("$APKSIGNER" verify --print-certs "$1" 2>&1)"; then
    echo "❌ No se pudo verificar el certificado del APK. No se instalará ni borrará la app." >&2
    return 1
  fi
  digests="$(printf '%s\n' "$output" | sed -n 's/^Signer #[0-9][0-9]* certificate SHA-256 digest: //p' | tr '[:upper:]' '[:lower:]' | LC_ALL=C sort -u)"
  if [ -z "$digests" ] || printf '%s\n' "$digests" | grep -Evq '^[0-9a-f]{64}$'; then
    echo "❌ Certificado SHA-256 ausente o inválido. No se instalará ni borrará la app." >&2
    return 1
  fi
  printf '%s\n' "$digests"
}

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
  - --clean requiere permiso específico y recuperación acordada; borra datos.
    Un ZIP no respalda borradores ni papelera. No es un remedio automático.
  - El modo normal exige certificados iguales y nunca desinstala como fallback.
    Requiere apksigner del SDK y Java. Un downgrade rechazado aborta sin borrar.
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

# 2. Informar intención; no borrar antes de terminar el build y las verificaciones.
if [ "$CLEAN_INSTALL" -eq 1 ]; then
  echo "🧹 Modo --clean explícito: borrará datos solo después de compilar y verificar el APK."
else
  echo "💾 Modo normal: se preservan SQLite y datos locales de la app."
fi

# 3. Build web
echo "📦 Compilando web app (Vite)..."
LUMAPSE_BUILD_CHANNEL=android-debug npm run build

# 4. Sincronización
echo "🔄 Sincronizando assets con Capacitor..."
npx cap sync android

# 5. Construir sin native-run: su fallback desinstala ante firma distinta/downgrade.
echo "📲 Compilando APK debug..."
(cd android && ./gradlew assembleDebug)
if [ ! -f "$APK_PATH" ]; then
  echo "❌ No se encontró el APK compilado; no se modificará la app instalada." >&2
  exit 1
fi
APKSIGNER="$(find_apksigner)"
CANDIDATE_CERTIFICATES="$(certificate_digests "$APK_PATH")"

# La igualdad estricta es conservadora: rotaciones de firma requieren otro flujo acordado.
PACKAGES="$(adb -s "$TARGET_DEVICE" shell pm list packages "$APP_ID" | tr -d '\r')"
APP_INSTALLED=0
if printf '%s\n' "$PACKAGES" | grep -Fxq "package:$APP_ID"; then
  APP_INSTALLED=1
  if [ "$CLEAN_INSTALL" -eq 0 ]; then
    INSTALLED_PATHS="$(adb -s "$TARGET_DEVICE" shell pm path "$APP_ID" | tr -d '\r')"
    INSTALLED_APK="$(printf '%s\n' "$INSTALLED_PATHS" | sed -n 's/^package:\(.*\/base\.apk\)$/\1/p')"
    if [ -z "$INSTALLED_APK" ] || [ "$(printf '%s\n' "$INSTALLED_APK" | wc -l | tr -d ' ')" -ne 1 ]; then
      echo "❌ No se pudo identificar inequívocamente el APK instalado; no se modificará la app." >&2
      exit 1
    fi
    DEPLOY_TMP="$(mktemp -d "${TMPDIR:-/tmp}/lumapse-deploy.XXXXXX")"
    adb -s "$TARGET_DEVICE" pull "$INSTALLED_APK" "$DEPLOY_TMP/installed.apk"
    INSTALLED_CERTIFICATES="$(certificate_digests "$DEPLOY_TMP/installed.apk")"
    if [ "$CANDIDATE_CERTIFICATES" != "$INSTALLED_CERTIFICATES" ]; then
      echo "❌ Firma incompatible: despliegue abortado antes de instalar. Se conserva la app y sus datos." >&2
      echo "   No usar --clean como solución automática. Acordar firma y recuperación primero." >&2
      exit 1
    fi
  fi
fi

if [ "$CLEAN_INSTALL" -eq 1 ] && [ "$APP_INSTALLED" -eq 1 ]; then
  echo "🧹 Desinstalación solicitada explícitamente con --clean."
  adb -s "$TARGET_DEVICE" uninstall "$APP_ID"
fi

# ADB rechaza incompatibilidades sin un segundo intento ni desinstalación implícita.
if ! INSTALL_OUTPUT="$(adb -s "$TARGET_DEVICE" install -r -t "$APK_PATH" 2>&1)"; then
  printf '%s\n' "$INSTALL_OUTPUT" >&2
  echo "❌ Instalación rechazada; no se desinstalará ni reintentará automáticamente." >&2
  exit 1
fi
printf '%s\n' "$INSTALL_OUTPUT"
if printf '%s\n' "$INSTALL_OUTPUT" | grep -Eq 'Failure|INSTALL_FAILED' || ! printf '%s\n' "$INSTALL_OUTPUT" | tr -d '\r' | grep -Fxq 'Success'; then
  echo "❌ ADB no confirmó una instalación exitosa; se detiene sin desinstalar." >&2
  exit 1
fi
adb -s "$TARGET_DEVICE" shell am start -n "$APP_ID/.MainActivity"

echo "=================================================="
echo "✅ ¡Despliegue completado con éxito!"
if [ "$CLEAN_INSTALL" -eq 1 ]; then
  echo "   Modo: limpio (--clean, datos locales borrados)"
else
  echo "   Modo: preservando datos locales"
fi
echo "   Dispositivo: $TARGET_DEVICE"
echo "=================================================="
