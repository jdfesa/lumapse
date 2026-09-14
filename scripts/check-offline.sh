#!/usr/bin/env bash
# Entry point portable conservado para npm y llamadas directas existentes.
set -Eeuo pipefail
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec python3 "$PROJECT_ROOT/scripts/check-offline.py"
