#!/usr/bin/env bash
# Prepara un dispositivo Android de pruebas con un fixture de volumen sin borrar preferencias.

set -Eeuo pipefail
IFS=$'\n\t'

APP_ID="com.lumapse.app"
DEFAULT_SERIAL="ad071603088c2172aa"
DB_NAME="lumapse-dbSQLite.db"
DB_DIR="/data/data/${APP_ID}/databases"
DB_PATH="${DB_DIR}/${DB_NAME}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DATASET="${REPO_ROOT}/tmp/beta-500-fixture/dataset.json"
TOOL="${SCRIPT_DIR}/test-fixture-db.py"
ADB_BIN="${ADB:-adb}"
PYTHON_BIN="${PYTHON:-python3}"

SERIAL="${DEFAULT_SERIAL}"
SEED_DATE="$(date +%F)"
BACKUP_ROOT="${REPO_ROOT}/tmp/beta-500-fixture/backups"
RESTORE_SOURCE=""
VALIDATE_ONLY=0
CONFIRMED=0

RUN_STAMP=""
WORK_DIR=""
BACKUP_DIR=""
ROLLBACK_DB=""
REMOTE_STAGE=""
REMOTE_BACKUP_MAIN=""
REPLACED=0
APP_STOPPED=0
ROLLBACK_RUNNING=0
EXPECTED_VERSION_NAME=""
EXPECTED_VERSION_CODE=""
INSTALLED_VERSION_NAME=""
INSTALLED_VERSION_CODE=""

usage() {
  cat <<'EOF'
Uso (desde la raíz del repositorio):
  npm run fixture:generate
  ./scripts/load-test-fixture-android.sh --validate-only
  ./scripts/load-test-fixture-android.sh --yes [opciones]
  ./scripts/load-test-fixture-android.sh --yes --restore RUTA [opciones]

Opciones:
  --serial SERIAL       Destino ADB. Por defecto: ad071603088c2172aa.
  --dataset RUTA        Dataset JSON. Por defecto: tmp/beta-500-fixture/dataset.json.
  --seed-date FECHA     Fecha base YYYY-MM-DD para timestamps y eventos relativos.
  --backup-root RUTA    Directorio local de backups recuperables.
  --restore RUTA        Restaura un before.sqlite3 o un directorio que lo contenga.
  --validate-only       Valida dataset y transacción sobre una SQLite temporal; no usa ADB.
  --yes                 Confirmación obligatoria para seed o restauración.
  -h, --help            Muestra esta ayuda.

Seguridad:
  - Verifica main limpio e igual a origin/main, paquete, versión y run-as.
  - Detiene la app antes de leer/reemplazar SQLite.
  - Copia main + WAL/SHM/journal y consolida un backup antes de modificar.
  - Nunca usa pm clear, uninstall, --clean ni toca shared_prefs/app_webview.
EOF
}

log() {
  printf '[fixture] %s\n' "$*"
}

die() {
  printf '[fixture] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Falta el comando requerido: $1"
}

adb_target() {
  "$ADB_BIN" -s "$SERIAL" "$@"
}

# adb shell no transporta argv literalmente: concatena sus argumentos y hace
# que el shell remoto vuelva a parsearlos. Construimos por eso una unica orden
# remota y entrecomillamos cada argumento que debe sobrevivir ese segundo
# parseo. El script viaja como argumento de `sh -c`; stdin queda completamente
# libre para datos binarios (por ejemplo, `cat > base.sqlite3`).
quote_remote_arg() {
  local value="$1"
  printf "'%s'" "${value//\'/\'\\\'\'}"
}

run_as_remote_command() {
  local transport="$1"
  local script="$2"
  local quoted_app
  local quoted_script
  quoted_app="$(quote_remote_arg "$APP_ID")"
  quoted_script="$(quote_remote_arg "$script")"
  adb_target "$transport" "exec run-as ${quoted_app} sh -c ${quoted_script}"
}

run_as_script() {
  [ "$#" -eq 1 ] || die "Error interno: run_as_script requiere un unico script"
  run_as_remote_command shell "$1"
}

run_as_exec_out_script() {
  [ "$#" -eq 1 ] || die "Error interno: run_as_exec_out_script requiere un unico script"
  run_as_remote_command exec-out "$1"
}

remote_file_exists() {
  local quoted_path
  quoted_path="$(quote_remote_arg "$1")"
  run_as_script "test -f ${quoted_path}" >/dev/null 2>&1
}

pull_app_file() {
  local remote_path="$1"
  local local_path="$2"
  local partial="${local_path}.partial"
  local quoted_remote_path
  quoted_remote_path="$(quote_remote_arg "$remote_path")"
  mkdir -p "$(dirname "$local_path")"
  rm -f "$partial"
  if ! run_as_exec_out_script "exec cat ${quoted_remote_path}" >"$partial"; then
    rm -f "$partial"
    die "No se pudo copiar desde el sandbox de la app: $remote_path"
  fi
  if [ ! -s "$partial" ]; then
    rm -f "$partial"
    die "La copia recibida está vacía: $remote_path"
  fi
  mv "$partial" "$local_path"
}

pull_raw_database_set() {
  local destination="$1"
  mkdir -p "$destination"
  pull_app_file "$DB_PATH" "${destination}/${DB_NAME}"
  for suffix in -wal -shm -journal; do
    if remote_file_exists "${DB_PATH}${suffix}"; then
      pull_app_file "${DB_PATH}${suffix}" "${destination}/${DB_NAME}${suffix}"
    fi
  done
}

json_value() {
  "$PYTHON_BIN" - "$1" "$2" <<'PY'
import json, sys
value = json.load(open(sys.argv[1], encoding="utf-8"))
for part in sys.argv[2].split("."):
    value = value[part]
print(value)
PY
}

launch_app() {
  log "Relanzando ${APP_ID}..."
  adb_target shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 \
    || die "Android no pudo iniciar la actividad launcher de ${APP_ID}"
  sleep 4
  if ! adb_target shell pidof "$APP_ID" 2>/dev/null | tr -d '\r' | grep -q .; then
    if ! adb_target shell ps -A 2>/dev/null | tr -d '\r' | grep -q "[[:space:]]${APP_ID}$"; then
      die "La app no quedó ejecutándose después del relanzamiento"
    fi
  fi
  APP_STOPPED=0
}

stop_app() {
  log "Deteniendo la app para obtener una SQLite consistente..."
  adb_target shell am force-stop "$APP_ID"
  APP_STOPPED=1
  sleep 1
  if adb_target shell pidof "$APP_ID" 2>/dev/null | tr -d '\r' | grep -q .; then
    die "El proceso de la app sigue activo después de force-stop"
  fi
}

snapshot_current_database() {
  local destination="$1"
  local kind="$2"
  local raw_dir="${destination}/raw"
  local consolidated="${destination}/snapshot.sqlite3"
  local manifest="${destination}/snapshot-manifest.json"

  mkdir -p "$destination"
  chmod 700 "$destination"
  pull_raw_database_set "$raw_dir"
  "$PYTHON_BIN" "$TOOL" consolidate "${raw_dir}/${DB_NAME}" "$consolidated" >/dev/null
  "$PYTHON_BIN" "$TOOL" snapshot "$consolidated" "$manifest" \
    --kind "$kind" \
    --serial "$SERIAL" \
    --package "$APP_ID" \
    --version-name "$INSTALLED_VERSION_NAME" \
    --version-code "$INSTALLED_VERSION_CODE" >/dev/null
  chmod 600 "$consolidated" "$manifest" "${raw_dir}"/*
}

stage_local_database() {
  local local_database="$1"
  local label="$2"
  local readback="${WORK_DIR}/${label}-stage-readback.sqlite3"
  local quoted_stage

  REMOTE_STAGE="${DB_DIR}/.lumapse-${label}-${RUN_STAMP}.sqlite3"
  quoted_stage="$(quote_remote_arg "$REMOTE_STAGE")"
  if ! run_as_script "umask 077; cat > ${quoted_stage}; chmod 600 ${quoted_stage}" <"$local_database"; then
    die "run-as no pudo recibir la SQLite preparada dentro del sandbox de la app"
  fi
  pull_app_file "$REMOTE_STAGE" "$readback"
  if ! cmp -s "$local_database" "$readback"; then
    die "La SQLite transferida no coincide byte a byte con el archivo local"
  fi
  rm -f "$readback"
}

replace_with_staged_database() {
  local quoted_db
  local quoted_backup
  local quoted_stage
  REMOTE_BACKUP_MAIN="${DB_PATH}.fixture-before-${RUN_STAMP}"
  quoted_db="$(quote_remote_arg "$DB_PATH")"
  quoted_backup="$(quote_remote_arg "$REMOTE_BACKUP_MAIN")"
  quoted_stage="$(quote_remote_arg "$REMOTE_STAGE")"
  REPLACED=1
  run_as_script "set -e
    mv ${quoted_db} ${quoted_backup}
    for suffix in -wal -shm -journal; do
      if [ -f ${quoted_db}\"\$suffix\" ]; then
        mv ${quoted_db}\"\$suffix\" ${quoted_backup}\"\$suffix\"
      fi
    done
    mv ${quoted_stage} ${quoted_db}
    chmod 600 ${quoted_db}"
}

cleanup_remote_backups() {
  local quoted_backup
  local quoted_backup_wal
  local quoted_backup_shm
  local quoted_backup_journal
  local quoted_stage
  quoted_backup="$(quote_remote_arg "$REMOTE_BACKUP_MAIN")"
  quoted_backup_wal="$(quote_remote_arg "${REMOTE_BACKUP_MAIN}-wal")"
  quoted_backup_shm="$(quote_remote_arg "${REMOTE_BACKUP_MAIN}-shm")"
  quoted_backup_journal="$(quote_remote_arg "${REMOTE_BACKUP_MAIN}-journal")"
  quoted_stage="$(quote_remote_arg "$REMOTE_STAGE")"
  run_as_script "rm -f \
    ${quoted_backup} ${quoted_backup_wal} ${quoted_backup_shm} ${quoted_backup_journal} \
    ${quoted_stage}" >/dev/null 2>&1 || true
}

emergency_rollback() {
  local failed_main="${DB_PATH}.fixture-failed-${RUN_STAMP}"
  local quoted_db
  local quoted_failed
  local quoted_backup
  local quoted_stage
  quoted_db="$(quote_remote_arg "$DB_PATH")"
  quoted_failed="$(quote_remote_arg "$failed_main")"
  quoted_backup="$(quote_remote_arg "$REMOTE_BACKUP_MAIN")"
  ROLLBACK_RUNNING=1
  set +e
  log "Fallo posterior al reemplazo: iniciando rollback automático..."
  adb_target shell am force-stop "$APP_ID" >/dev/null 2>&1

  if remote_file_exists "$REMOTE_BACKUP_MAIN"; then
    run_as_script "set -e
      if [ -f ${quoted_db} ]; then mv ${quoted_db} ${quoted_failed}; fi
      for suffix in -wal -shm -journal; do
        if [ -f ${quoted_db}\"\$suffix\" ]; then
          mv ${quoted_db}\"\$suffix\" ${quoted_failed}\"\$suffix\"
        fi
      done
      mv ${quoted_backup} ${quoted_db}
      for suffix in -wal -shm -journal; do
        if [ -f ${quoted_backup}\"\$suffix\" ]; then
          mv ${quoted_backup}\"\$suffix\" ${quoted_db}\"\$suffix\"
        fi
      done
      chmod 600 ${quoted_db}" >/dev/null 2>&1
  elif [ -n "$ROLLBACK_DB" ] && [ -f "$ROLLBACK_DB" ]; then
    stage_local_database "$ROLLBACK_DB" "rollback"
    quoted_stage="$(quote_remote_arg "$REMOTE_STAGE")"
    run_as_script "set -e
      if [ -f ${quoted_db} ]; then mv ${quoted_db} ${quoted_failed}; fi
      for suffix in -wal -shm -journal; do
        if [ -f ${quoted_db}\"\$suffix\" ]; then
          mv ${quoted_db}\"\$suffix\" ${quoted_failed}\"\$suffix\"
        fi
      done
      mv ${quoted_stage} ${quoted_db}
      chmod 600 ${quoted_db}" >/dev/null 2>&1
  fi

  adb_target shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
  printf '[fixture] Rollback automático intentado. Backup local: %s\n' "${BACKUP_DIR:-no creado}" >&2
  printf '[fixture] Si hace falta repetirlo: ./scripts/load-test-fixture-android.sh --yes --serial %s --restore %q\n' \
    "$SERIAL" "${BACKUP_DIR:-}" >&2
  ROLLBACK_RUNNING=0
}

on_exit() {
  local status="$?"
  trap - EXIT
  if [ "$status" -ne 0 ]; then
    if [ "$REPLACED" -eq 1 ] && [ "$ROLLBACK_RUNNING" -eq 0 ]; then
      emergency_rollback
    elif [ "$APP_STOPPED" -eq 1 ]; then
      adb_target shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true
    fi
  fi
  if [ -n "$WORK_DIR" ] && [ -d "$WORK_DIR" ]; then
    rm -rf "$WORK_DIR"
  fi
  exit "$status"
}

trap on_exit EXIT
trap 'exit 130' INT TERM

while [ "$#" -gt 0 ]; do
  case "$1" in
    --serial)
      [ "$#" -ge 2 ] || die "--serial requiere un valor"
      SERIAL="$2"
      shift 2
      ;;
    --dataset)
      [ "$#" -ge 2 ] || die "--dataset requiere una ruta"
      DATASET="$2"
      shift 2
      ;;
    --seed-date)
      [ "$#" -ge 2 ] || die "--seed-date requiere YYYY-MM-DD"
      SEED_DATE="$2"
      shift 2
      ;;
    --backup-root)
      [ "$#" -ge 2 ] || die "--backup-root requiere una ruta"
      BACKUP_ROOT="$2"
      shift 2
      ;;
    --restore)
      [ "$#" -ge 2 ] || die "--restore requiere una ruta"
      RESTORE_SOURCE="$2"
      shift 2
      ;;
    --validate-only)
      VALIDATE_ONLY=1
      shift
      ;;
    --yes)
      CONFIRMED=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Opción desconocida: $1"
      ;;
  esac
done

require_command "$PYTHON_BIN"
[ -f "$TOOL" ] || die "No existe $TOOL"
[ -n "$RESTORE_SOURCE" ] || [ -f "$DATASET" ] || die "No existe $DATASET; ejecutá npm run fixture:generate"

if [ "$VALIDATE_ONLY" -eq 1 ]; then
  [ -z "$RESTORE_SOURCE" ] || die "--validate-only y --restore son incompatibles"
  log "Validando JSON, reglas de dominio y roundtrip SQLite temporal..."
  "$PYTHON_BIN" "$TOOL" validate-dataset "$DATASET"
  "$PYTHON_BIN" "$TOOL" self-test "$DATASET" --seed-date "$SEED_DATE"
  log "Validación local completada; no se usó ADB ni se modificó el teléfono."
  exit 0
fi

[ "$CONFIRMED" -eq 1 ] || die "Falta --yes para confirmar explícitamente la operación destructiva."
case "$SERIAL" in
  ""|*[![:alnum:].:_-]*) die "Serial ADB inválido: $SERIAL" ;;
esac

require_command "$ADB_BIN"
require_command git
require_command cmp

cd "$REPO_ROOT"
[ "$(git rev-parse --show-toplevel 2>/dev/null)" = "$REPO_ROOT" ] \
  || die "El script debe ejecutarse dentro del checkout $REPO_ROOT"
[ "$(git symbolic-ref --quiet --short HEAD 2>/dev/null)" = "main" ] \
  || die "El checkout no está en main"
[ -z "$(git status --porcelain --untracked-files=normal)" ] \
  || die "El checkout tiene cambios fuera de tmp/; no se tocará el dispositivo"
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] \
  || die "main no coincide con origin/main; ejecutá el preflight de sincronización del RUNBOOK"

EXPECTED_VERSION_NAME="$(sed -nE 's/^[[:space:]]*versionName[[:space:]]+"([^"]+)".*/\1/p' android/app/build.gradle | head -n 1)"
EXPECTED_VERSION_CODE="$(sed -nE 's/^[[:space:]]*versionCode[[:space:]]+([0-9]+).*/\1/p' android/app/build.gradle | head -n 1)"
[ -n "$EXPECTED_VERSION_NAME" ] && [ -n "$EXPECTED_VERSION_CODE" ] \
  || die "No se pudo leer versionName/versionCode de android/app/build.gradle"

if [ -z "$RESTORE_SOURCE" ]; then
  "$PYTHON_BIN" "$TOOL" validate-dataset "$DATASET" >/dev/null
fi
"$PYTHON_BIN" - "$SEED_DATE" <<'PY'
from datetime import date
import sys
try:
    parsed = date.fromisoformat(sys.argv[1])
except ValueError as exc:
    raise SystemExit(f"Fecha base inválida: {exc}")
if parsed.isoformat() != sys.argv[1]:
    raise SystemExit("Fecha base no canónica; usar YYYY-MM-DD")
PY

STATE="$(adb_target get-state 2>/dev/null | tr -d '\r' || true)"
[ "$STATE" = "device" ] || die "El serial $SERIAL no está conectado y autorizado en estado device"
PACKAGES="$(adb_target shell pm list packages "$APP_ID" 2>/dev/null | tr -d '\r')"
printf '%s\n' "$PACKAGES" | grep -qx "package:${APP_ID}" \
  || die "El paquete $APP_ID no está instalado en $SERIAL"

PACKAGE_DUMP="$(adb_target shell dumpsys package "$APP_ID" | tr -d '\r')"
INSTALLED_VERSION_NAME="$(printf '%s\n' "$PACKAGE_DUMP" | sed -nE 's/.*versionName=([^[:space:]]+).*/\1/p' | head -n 1)"
INSTALLED_VERSION_CODE="$(printf '%s\n' "$PACKAGE_DUMP" | sed -nE 's/.*versionCode=([0-9]+).*/\1/p' | head -n 1)"
[ "$INSTALLED_VERSION_NAME" = "$EXPECTED_VERSION_NAME" ] \
  || die "versionName instalado=$INSTALLED_VERSION_NAME; esperado=$EXPECTED_VERSION_NAME"
[ "$INSTALLED_VERSION_CODE" = "$EXPECTED_VERSION_CODE" ] \
  || die "versionCode instalado=$INSTALLED_VERSION_CODE; esperado=$EXPECTED_VERSION_CODE"

QUOTED_DB_DIR="$(quote_remote_arg "$DB_DIR")"
QUOTED_DB_PATH="$(quote_remote_arg "$DB_PATH")"
run_as_script "id" >/dev/null 2>&1 || die "run-as $APP_ID no funciona; se requiere un build debuggable compatible"
run_as_script "test -d ${QUOTED_DB_DIR} && test -r ${QUOTED_DB_PATH} && test -s ${QUOTED_DB_PATH}" >/dev/null 2>&1 \
  || die "run-as funciona de forma insuficiente o no existe una base legible en $DB_PATH"

RUN_STAMP="$(date +%Y%m%d-%H%M%S)"
WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/lumapse-test-fixture.XXXXXX")"
mkdir -p "$BACKUP_ROOT"
BACKUP_DIR="${BACKUP_ROOT}/before-${RUN_STAMP}-${SERIAL}"

log "Preflight aprobado: ${APP_ID} ${INSTALLED_VERSION_NAME} (${INSTALLED_VERSION_CODE}) en ${SERIAL}."
stop_app
snapshot_current_database "$BACKUP_DIR" "before-test-fixture"
mv "${BACKUP_DIR}/snapshot.sqlite3" "${BACKUP_DIR}/before.sqlite3"
mv "${BACKUP_DIR}/snapshot-manifest.json" "${BACKUP_DIR}/backup-manifest.json"
ROLLBACK_DB="${BACKUP_DIR}/before.sqlite3"
BEFORE_METADATA_SHA="$(json_value "${BACKUP_DIR}/backup-manifest.json" metadataSha256)"
log "Backup recuperable verificado: ${BACKUP_DIR}"

if [ -n "$RESTORE_SOURCE" ]; then
  if [ -d "$RESTORE_SOURCE" ]; then
    RESTORE_DB="${RESTORE_SOURCE%/}/before.sqlite3"
  else
    RESTORE_DB="$RESTORE_SOURCE"
  fi
  [ -f "$RESTORE_DB" ] || die "No existe la SQLite de restauración: $RESTORE_DB"
  RESTORE_MANIFEST="${WORK_DIR}/restore-input.json"
  "$PYTHON_BIN" "$TOOL" snapshot "$RESTORE_DB" "$RESTORE_MANIFEST" \
    --kind "restore-input" --serial "$SERIAL" --package "$APP_ID" \
    --version-name "$INSTALLED_VERSION_NAME" --version-code "$INSTALLED_VERSION_CODE" >/dev/null
  RESTORE_LOGICAL_SHA="$(json_value "$RESTORE_MANIFEST" logicalDatabaseSha256)"

  stage_local_database "$RESTORE_DB" "restore"
  replace_with_staged_database
  VERIFY_COPY="${WORK_DIR}/restore-prelaunch.sqlite3"
  pull_app_file "$DB_PATH" "$VERIFY_COPY"
  cmp -s "$RESTORE_DB" "$VERIFY_COPY" || die "La restauración no coincide antes del relanzamiento"

  launch_app
  stop_app
  RESTORE_AFTER="${WORK_DIR}/restore-after-runtime"
  snapshot_current_database "$RESTORE_AFTER" "restore-after-runtime"
  AFTER_LOGICAL_SHA="$(json_value "${RESTORE_AFTER}/snapshot-manifest.json" logicalDatabaseSha256)"
  [ "$AFTER_LOGICAL_SHA" = "$RESTORE_LOGICAL_SHA" ] \
    || die "El contenido lógico restaurado cambió al abrir la app"
  cleanup_remote_backups
  launch_app
  REPLACED=0
  log "Restauración validada. Backup previo a restaurar: ${BACKUP_DIR}"
  exit 0
fi

STAGED_DB="${WORK_DIR}/test-fixture.sqlite3"
SEED_MANIFEST="${BACKUP_DIR}/seed-manifest.json"
"$PYTHON_BIN" "$TOOL" seed "$ROLLBACK_DB" "$STAGED_DB" "$DATASET" \
  --seed-date "$SEED_DATE" --manifest-out "$SEED_MANIFEST" >/dev/null
chmod 600 "$SEED_MANIFEST"

stage_local_database "$STAGED_DB" "fixture"
replace_with_staged_database

PRELAUNCH_COPY="${WORK_DIR}/prelaunch.sqlite3"
pull_app_file "$DB_PATH" "$PRELAUNCH_COPY"
"$PYTHON_BIN" "$TOOL" validate-db "$PRELAUNCH_COPY" "$DATASET" \
  --seed-date "$SEED_DATE" --metadata-sha256 "$BEFORE_METADATA_SHA" >/dev/null

launch_app
stop_app
AFTER_DIR="${BACKUP_DIR}/after-runtime"
snapshot_current_database "$AFTER_DIR" "after-runtime-fixture"
"$PYTHON_BIN" "$TOOL" validate-db "${AFTER_DIR}/snapshot.sqlite3" "$DATASET" \
  --seed-date "$SEED_DATE" --metadata-sha256 "$BEFORE_METADATA_SHA" >/dev/null

cleanup_remote_backups
launch_app
REPLACED=0

log "Fixture instalado y validado después del arranque."
log "Backup para rollback: ${BACKUP_DIR}"
log "Conteos: $(json_value "$DATASET" expected.rootSubjects) materias, $(json_value "$DATASET" expected.sections) secciones, $(json_value "$DATASET" expected.normalFeedNotes) notas visibles, $(json_value "$DATASET" expected.archivedNotes) archivadas, $(json_value "$DATASET" expected.trashNotes) en papelera y $(json_value "$DATASET" expected.academicEvents) fechas."
log "Rollback: ./scripts/load-test-fixture-android.sh --yes --serial ${SERIAL} --restore '${BACKUP_DIR}'"
