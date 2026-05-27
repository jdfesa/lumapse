#!/usr/bin/env python3
"""
Lumapse -- SQLite Smoke Test
Ejecuta el DDL real de src/services/sqlite/connection.js en una base temporal.

Este script no usa la base del usuario ni modifica archivos del proyecto. Su
objetivo es validar rapido que el schema, las migraciones idempotentes y las
relaciones principales siguen siendo ejecutables en SQLite.

Uso:
  python3 scripts/db-smoke-test.py
"""

import re
import sqlite3
import sys
import tempfile
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SQLITE_SERVICE_PATH = PROJECT_ROOT / "src" / "services" / "sqlite" / "connection.js"

JS_STRING_RE = re.compile(
    r"`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"",
    re.DOTALL,
)

EXPECTED_TABLES = {"subjects", "notes", "metadata"}
EXPECTED_COLUMNS = {
    "subjects": {"id", "name", "parentSubjectId", "archived", "color", "createdAt", "deletedAt"},
    "notes": {
        "id",
        "title",
        "content",
        "pinned",
        "archived",
        "subjectId",
        "createdAt",
        "updatedAt",
        "statusEmoji",
        "deletedAt",
    },
    "metadata": {"key", "value"},
}


def read_text(path):
    try:
        return path.read_text(encoding="utf-8")
    except OSError as exc:
        raise RuntimeError(f"No se pudo leer {path}: {exc}") from exc


def strip_js_string_quotes(value):
    return value[1:-1]


def extract_sql_strings(text):
    strings = [strip_js_string_quotes(match.group(0)) for match in JS_STRING_RE.finditer(text)]
    create_strings = [value for value in strings if "CREATE TABLE" in value.upper()]
    alter_strings = [value for value in strings if value.strip().upper().startswith("ALTER TABLE")]
    return create_strings, alter_strings


def execute_schema(conn, create_strings, alter_strings):
    if not create_strings:
        raise RuntimeError("No se encontraron sentencias CREATE TABLE en connection.js")

    conn.executescript("\n".join(create_strings))

    for statement in alter_strings:
        try:
            conn.execute(statement)
        except sqlite3.OperationalError as exc:
            message = str(exc).lower()
            if "duplicate column name" not in message:
                raise


def table_names(conn):
    rows = conn.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
    ).fetchall()
    return {row[0] for row in rows}


def column_names(conn, table):
    return {row[1] for row in conn.execute(f"PRAGMA table_info({table})").fetchall()}


def assert_schema_shape(conn):
    tables = table_names(conn)
    missing_tables = EXPECTED_TABLES - tables
    if missing_tables:
        raise AssertionError(f"Faltan tablas: {', '.join(sorted(missing_tables))}")

    for table, expected in EXPECTED_COLUMNS.items():
        columns = column_names(conn, table)
        missing_columns = expected - columns
        if missing_columns:
            raise AssertionError(
                f"Tabla {table}: faltan columnas {', '.join(sorted(missing_columns))}"
            )


def assert_relations(conn):
    conn.execute(
        """
        INSERT INTO subjects (id, name, parentSubjectId, archived, color, createdAt)
        VALUES ('subject-root', 'Materia', NULL, 0, '#22c55e', '2026-05-27T00:00:00Z')
        """
    )
    conn.execute(
        """
        INSERT INTO subjects (id, name, parentSubjectId, archived, color, createdAt)
        VALUES ('subject-child', 'Seccion', 'subject-root', 0, NULL, '2026-05-27T00:00:00Z')
        """
    )
    conn.execute(
        """
        INSERT INTO notes (id, title, content, pinned, archived, subjectId, createdAt, updatedAt)
        VALUES ('note-1', 'Nota', '# Nota', 0, 0, 'subject-child',
                '2026-05-27T00:00:00Z', '2026-05-27T00:00:00Z')
        """
    )
    conn.execute("INSERT INTO metadata (key, value) VALUES ('smoke_test', 'ok')")

    try:
        conn.execute(
            """
            INSERT INTO notes (id, title, content, pinned, archived, subjectId, createdAt, updatedAt)
            VALUES ('note-invalid', 'Invalida', '', 0, 0, 'missing-subject',
                    '2026-05-27T00:00:00Z', '2026-05-27T00:00:00Z')
            """
        )
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError("La FK notes.subjectId acepto un subject inexistente")

    conn.execute("DELETE FROM subjects WHERE id = 'subject-root'")
    note_subject = conn.execute("SELECT subjectId FROM notes WHERE id = 'note-1'").fetchone()[0]
    child_count = conn.execute(
        "SELECT COUNT(*) FROM subjects WHERE id = 'subject-child'"
    ).fetchone()[0]

    if child_count != 0:
        raise AssertionError("ON DELETE CASCADE no elimino la seccion hija")
    if note_subject is not None:
        raise AssertionError("ON DELETE SET NULL no limpio notes.subjectId")


def run_smoke_test():
    service_text = read_text(SQLITE_SERVICE_PATH)
    create_strings, alter_strings = extract_sql_strings(service_text)

    with tempfile.TemporaryDirectory(prefix="lumapse-db-smoke-") as temp_dir:
        db_path = Path(temp_dir) / "lumapse-smoke.sqlite"
        conn = sqlite3.connect(db_path)
        try:
            conn.execute("PRAGMA foreign_keys = ON")
            execute_schema(conn, create_strings, alter_strings)
            assert_schema_shape(conn)
            assert_relations(conn)
        finally:
            conn.close()

    return len(create_strings), len(alter_strings)


def main():
    print("Lumapse -- SQLite Smoke Test")
    print("=" * 50)

    try:
        create_count, alter_count = run_smoke_test()
    except Exception as exc:
        print(f"[FAIL] {exc}")
        print("=" * 50)
        return 1

    print(f"[OK] CREATE blocks ejecutados: {create_count}")
    print(f"[OK] Migraciones ALTER probadas: {alter_count}")
    print("[OK] Tablas, columnas y relaciones principales validadas")
    print("=" * 50)
    print("Resultado: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
