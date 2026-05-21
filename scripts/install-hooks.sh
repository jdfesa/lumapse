#!/usr/bin/env bash
set -Eeuo pipefail

# ==============================================================================
# Lumapse — Instalador de Git Hooks
# ==============================================================================
# Configura hooks locales de Git para ejecutar chequeos de calidad antes de
# commits y pushes. Solo afecta a este repositorio.
#
# Uso: ./scripts/install-hooks.sh
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GIT_DIR="$PROJECT_ROOT/.git"
HOOKS_DIR="$GIT_DIR/hooks"

if [ ! -d "$GIT_DIR" ]; then
  printf '❌ No se encontró el directorio .git/ en %s\n' "$PROJECT_ROOT"
  printf '   Ejecutá este script desde un clon Git válido de Lumapse.\n'
  exit 1
fi

mkdir -p "$HOOKS_DIR"

cat > "$HOOKS_DIR/pre-commit" <<'HOOK'
#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

printf '  Lumapse pre-commit: ejecutando chequeos rapidos...\n'
printf '==================================================\n'

npm run lint
./scripts/check-offline.sh
./scripts/check-docs.sh
./scripts/check-file-size.sh

printf '==================================================\n'
printf '  Pre-commit OK\n'
HOOK

cat > "$HOOKS_DIR/pre-push" <<'HOOK'
#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

printf '🚀 Lumapse pre-push: ejecutando quality gate completo...\n'
printf '==================================================\n'

./scripts/quality.sh
python3 ./scripts/check-traceability.py
./scripts/bundle-budget.sh

printf '==================================================\n'
printf '✅ Pre-push OK\n'
HOOK

chmod +x "$HOOKS_DIR/pre-commit" "$HOOKS_DIR/pre-push"

printf '🔗 Lumapse — Instalador de Git Hooks\n'
printf '==================================================\n'
printf "✅ Hook 'pre-commit' instalado exitosamente.\n"
printf "✅ Hook 'pre-push' instalado exitosamente.\n"
printf '==================================================\n'
printf '¡Tu entorno local ahora está protegido!\n'
