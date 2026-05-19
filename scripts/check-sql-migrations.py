#!/usr/bin/env python3
"""
Lumapse — Auditoría de Migraciones SQLite
Verifica formato, estructura y reglas básicas de seguridad en migraciones SQL.
Uso: python3 scripts/check-sql-migrations.py
"""

import os
import re
import sys
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MIGRATIONS_DIR = PROJECT_ROOT / "src" / "store" / "migrations"
MIGRATION_NAME_RE = re.compile(r"^\d{8}_\d{6}_[a-z0-9_]+\.sql$")
DROP_TABLE_RE = re.compile(r"\bDROP\s+TABLE\b", re.IGNORECASE)


def relative_path(path):
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def read_sql(path):
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="replace")


def audit_migration(path):
    errors = []

    if not MIGRATION_NAME_RE.match(path.name):
        errors.append("❌ Falla formato de nombre: debe ser YYYYMMDD_HHMMSS_nombre.sql")

    content = read_sql(path)
    has_up = "-- UP" in content
    has_down = "-- DOWN" in content

    if not has_up:
        errors.append("❌ Sección '-- UP' no encontrada.")

    if not has_down:
        errors.append("❌ Sección '-- DOWN' no encontrada.")

    down_index = content.find("-- DOWN")
    up_block = content if down_index == -1 else content[:down_index]

    if DROP_TABLE_RE.search(up_block):
        errors.append("🚨 ALERTA: Se detectó 'DROP TABLE' en el bloque UP.")

    return errors


def print_header():
    print("🗄️  Lumapse — Auditoría de Migraciones SQLite")
    print("==================================================")
    print("Escaneando src/store/migrations/ ...")


def main():
    print_header()

    if not MIGRATIONS_DIR.exists():
        print("✅ Directorio vacío, nada que revisar.")
        print("==================================================")
        return 0

    migrations = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not migrations:
        print("✅ Directorio vacío, nada que revisar.")
        print("==================================================")
        return 0

    total_errors = 0
    failed_migrations = 0

    for migration in migrations:
        errors = audit_migration(migration)

        if errors:
            failed_migrations += 1
            total_errors += len(errors)
            print("[ERROR] {}".format(migration.name))
            for error in errors:
                print("   {}".format(error))
        else:
            print("[OK] {}".format(migration.name))

    print("==================================================")

    if total_errors:
        print(
            "❌ Auditoría fallida. Se encontraron {} errores en {} migración.".format(
                total_errors,
                failed_migrations,
            )
        )
        return 1

    print("✅ Auditoría exitosa. {} migración(es) revisada(s).".format(len(migrations)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
