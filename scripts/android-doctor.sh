#!/usr/bin/env bash

# ==============================================================================
# Lumapse -- Android Doctor
# ==============================================================================
# Diagnostica el entorno Android local sin instalar, compilar ni borrar datos.
#
# Uso:
#   ./scripts/android-doctor.sh
# ==============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_ID="com.lumapse.app"
FAIL=0
WARN=0

ok() {
  printf '[OK]   %s\n' "$1"
}

warn() {
  printf '[WARN] %s\n' "$1"
  WARN=$((WARN + 1))
}

fail() {
  printf '[FAIL] %s\n' "$1"
  FAIL=$((FAIL + 1))
}

have_command() {
  command -v "$1" >/dev/null 2>&1
}

check_installed_app() {
  local device_id="$1"
  local packages

  if packages="$(adb -s "$device_id" shell pm list packages "$APP_ID" 2>/dev/null | tr -d '\r')"; then
    printf '%s\n' "$packages" | grep -qx "package:${APP_ID}"
  else
    return 1
  fi
}

check_sqlite_data() {
  local device_id="$1"
  local databases
  local db_dir="/data/data/${APP_ID}/databases"

  if ! adb -s "$device_id" shell run-as "$APP_ID" ls "/data/data/${APP_ID}" >/dev/null 2>&1; then
    warn "No se pudo inspeccionar datos en ${device_id} (build no debuggable o permisos insuficientes)"
    return
  fi

  databases="$(adb -s "$device_id" shell run-as "$APP_ID" ls "$db_dir" 2>/dev/null | tr -d '\r' || true)"

  if printf '%s\n' "$databases" | grep -Eqi '\.(db|sqlite)(-|$)|database'; then
    ok "Base de datos SQLite encontrada en dispositivo ${device_id}"
  else
    ok "Dispositivo ${device_id} sin base de datos previa (install limpio)"
  fi
}

printf 'Lumapse -- Android Doctor\n'
printf '==================================================\n'

if [[ -d "$PROJECT_ROOT/android" ]]; then
  ok 'Directorio android/ presente'
else
  fail 'No existe android/. Ejecuta npx cap add android si corresponde.'
fi

if [[ -f "$PROJECT_ROOT/capacitor.config.json" ]]; then
  ok 'capacitor.config.json presente'
else
  fail 'No se encontro capacitor.config.json'
fi

if [[ -n "${ANDROID_HOME:-}" && -d "${ANDROID_HOME:-}" ]]; then
  ok "ANDROID_HOME=${ANDROID_HOME}"
elif [[ -n "${ANDROID_SDK_ROOT:-}" && -d "${ANDROID_SDK_ROOT:-}" ]]; then
  ok "ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT}"
elif [[ -f "$PROJECT_ROOT/android/local.properties" ]]; then
  ok 'android/local.properties presente'
else
  warn 'No se detecto ANDROID_HOME, ANDROID_SDK_ROOT ni android/local.properties'
fi

if have_command java; then
  JAVA_VERSION=$(java -version 2>&1 | head -n 1)
  ok "Java disponible: ${JAVA_VERSION}"
else
  warn 'java no disponible en PATH'
fi

if have_command npx; then
  ok "npx disponible: $(npx --version 2>/dev/null | head -n 1)"
else
  fail 'npx no disponible en PATH'
fi

if [[ -x "$PROJECT_ROOT/android/gradlew" ]]; then
  ok 'Gradle wrapper android/gradlew ejecutable'
elif [[ -f "$PROJECT_ROOT/android/gradlew" ]]; then
  warn 'android/gradlew existe pero no es ejecutable'
else
  warn 'No se encontro android/gradlew'
fi

if have_command adb; then
  ok 'adb disponible'
  ADB_OUTPUT="$(adb devices 2>/dev/null || true)"
  DEVICES=()
  while IFS= read -r DEVICE_ID; do
    [[ -n "$DEVICE_ID" ]] && DEVICES+=("$DEVICE_ID")
  done < <(printf '%s\n' "$ADB_OUTPUT" | awk '$2 == "device" { print $1 }')
  DEVICE_COUNT="${#DEVICES[@]}"
  if [[ "$DEVICE_COUNT" -gt 0 ]]; then
    ok "${DEVICE_COUNT} dispositivo(s) Android conectado(s)"
    for DEVICE_ID in "${DEVICES[@]}"; do
      if check_installed_app "$DEVICE_ID"; then
        ok "Lumapse APK instalada en dispositivo ${DEVICE_ID}"
        check_sqlite_data "$DEVICE_ID"
      else
        warn "Lumapse APK no instalada en dispositivo ${DEVICE_ID}; el proximo deploy sera un install limpio"
      fi
    done
  else
    warn 'adb disponible, pero no hay dispositivos autorizados/conectados'
  fi
else
  warn 'adb no disponible en PATH'
fi

if [[ -f "$PROJECT_ROOT/public/assets/sql-wasm.wasm" ]]; then
  ok 'sql-wasm.wasm presente para build web'
else
  warn 'Falta public/assets/sql-wasm.wasm; npm run copy-wasm lo regenera'
fi

printf '==================================================\n'
if [[ "$FAIL" -gt 0 ]]; then
  printf 'Resultado: FAIL (%d falla(s), %d advertencia(s))\n' "$FAIL" "$WARN"
  exit 1
fi

if [[ "$WARN" -gt 0 ]]; then
  printf 'Resultado: OK con advertencias (%d)\n' "$WARN"
else
  printf 'Resultado: OK\n'
fi
