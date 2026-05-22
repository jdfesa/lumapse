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

printf "🔨 Compilando lumapse-audit (Rust) para hooks súper-rápidos...\n"
cd "$PROJECT_ROOT/scripts/lumapse-audit"
cargo build --release
cp target/release/lumapse-audit "$PROJECT_ROOT/scripts/lumapse-audit-bin"
cd "$PROJECT_ROOT"

cat > "$HOOKS_DIR/pre-commit" <<'HOOK'
#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

printf '  Lumapse pre-commit: ejecutando chequeos rapidos...\n'
printf '==================================================\n'

npm run lint
./scripts/lumapse-audit-bin --code

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
./scripts/lumapse-audit-bin --traceability
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
