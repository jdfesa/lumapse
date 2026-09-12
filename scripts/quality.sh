#!/usr/bin/env bash
# Gate canónico compartido por npm run verify, npm run quality y CI.
# El auditor Rust es diagnóstico optativo: nunca decide ni sustituye controles.
set -Eeuo pipefail
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

if [ "$#" -ne 0 ]; then
  echo "[FALLO] El gate completo no admite filtros ni argumentos."
  exit 2
fi

echo "Lumapse — Quality Gate"
# Fallar antes de cualquier suite si el entorno no es el declarado.
npm run check:runtime --silent

FAIL=0
run_check() {
  local label="$1"
  shift
  printf '\n--- %s ---\n' "$label"
  if "$@"; then
    echo "[OK] $label"
  else
    local code=$?
    echo "[FALLO] $label (exit $code)"
    FAIL=1
  fi
}

TEST_TMP="$(mktemp -d "${TMPDIR:-/tmp}/lumapse-quality.XXXXXX")"
trap 'rm -rf "$TEST_TMP"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

run_check lint npm run lint --silent
run_check test:tooling npm run test:tooling --silent
# Un worker limita memoria, no cantidad de casos. No aceptar .only ni resúmenes
# textuales como evidencia: exit no cero (incluido 139) siempre bloquea.
run_check test npm run test --silent -- --maxWorkers=1 --allowOnly=false \
  --reporter=default --reporter=json --outputFile.json="$TEST_TMP/vitest.json"
run_check test:report node scripts/check-test-report.js "$TEST_TMP/vitest.json"
run_check build npm run build --silent

for check in typecheck check:toolchain check:version check:db-smoke check:size \
  check:native-dialogs check:a11y check:traceability check:docs check:schema \
  check:dbml check:subjects check:offline; do
  run_check "$check" npm run "$check" --silent
done

# Se conservan los diagnósticos históricos y sus umbrales: sus avisos de deuda
# no son fallos, pero un error de ejecución de la herramienta sí lo es.
run_check file-size bash scripts/check-file-size.sh
run_check quick-docs bash scripts/check-docs.sh

echo ""
if [ "$FAIL" -ne 0 ]; then
  echo "[FALLO] Quality Gate: hay controles fallidos."
  exit 1
fi
echo "[OK] Quality Gate: todos los controles pasaron."
