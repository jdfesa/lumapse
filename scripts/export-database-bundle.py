#!/usr/bin/env python3
"""
Lumapse — Exportador de Respaldos ZIP
Simula un backup integral de SQLite, metadata de integridad y notas Markdown.
Uso: python3 scripts/export-database-bundle.py [ruta.db] [--output-dir DIR]
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import sqlite3
import sys
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB_CANDIDATES = [
    PROJECT_ROOT / "lumapse.db",
    PROJECT_ROOT / "lumapse.sqlite",
    PROJECT_ROOT / "data" / "lumapse.db",
    PROJECT_ROOT / "tmp" / "lumapse.db",
    PROJECT_ROOT / "android" / "app" / "src" / "main" / "assets" / "lumapse.db",
]

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS subjects (
    id              TEXT    PRIMARY KEY,
    name            TEXT    NOT NULL,
    parentSubjectId TEXT    REFERENCES subjects(id) ON DELETE CASCADE,
    archived        INTEGER DEFAULT 0,
    color           TEXT,
    createdAt       TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
    id        TEXT    PRIMARY KEY,
    title     TEXT,
    content   TEXT,
    pinned    INTEGER DEFAULT 0,
    archived  INTEGER DEFAULT 0,
    subjectId TEXT    REFERENCES subjects(id) ON DELETE SET NULL,
    createdAt TEXT    NOT NULL,
    updatedAt TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS metadata (
    key   TEXT PRIMARY KEY,
    value TEXT
);
"""

MOCK_SUBJECTS = [
    ("subj-bd", "Base de Datos", None, 0, "#38bdf8"),
    ("subj-programacion", "Programación", None, 0, "#a3e635"),
    ("subj-pp3", "Prácticas Profesionalizantes III", None, 0, "#f59e0b"),
]

MOCK_NOTES = [
    ("note-001", "Modelo ER", "# Modelo ER\n\nEntidades principales: Nota, Materia y Metadata.", "subj-bd"),
    ("note-002", "Normalización", "# Normalización\n\nLa estructura cumple 1FN, 2FN y 3FN con una desnormalización intencional.", "subj-bd"),
    ("note-003", "SQLite en Capacitor", "# SQLite en Capacitor\n\nPersistencia local robusta para Android.", "subj-programacion"),
    ("note-004", "Defensa PP3", "# Defensa PP3\n\nPuntos clave: offline-first, mobile-first y trazabilidad.", "subj-pp3"),
    ("note-005", "Entrada rápida", "# Entrada rápida\n\nNota sin materia asignada, exportada desde Entrada.", None),
]


def relative_path(path):
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def parse_args(argv):
    parser = argparse.ArgumentParser(
        description="Genera un respaldo ZIP de Lumapse con SQLite, metadata y notas Markdown."
    )
    parser.add_argument(
        "database",
        nargs="?",
        help="Ruta opcional a una base SQLite existente. Si no existe, se genera una mock.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(PROJECT_ROOT),
        help="Directorio donde se escribirá el ZIP. Por defecto: raíz del proyecto.",
    )
    return parser.parse_args(argv[1:])


def resolve_database_path(database_argument):
    if database_argument:
        path = Path(database_argument).expanduser()
        if not path.is_absolute():
            path = PROJECT_ROOT / path
        if path.exists():
            return path, False

    for candidate in DEFAULT_DB_CANDIDATES:
        if candidate.exists():
            return candidate, False

    return None, True


def iso_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def timestamp_for_filename():
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def create_mock_database(temp_dir):
    db_path = temp_dir / "lumapse_mock.db"
    connection = sqlite3.connect(db_path)
    connection.executescript(SCHEMA_SQL)

    connection.executemany(
        """
        INSERT INTO subjects (id, name, parentSubjectId, archived, color, createdAt)
        VALUES (?, ?, ?, ?, ?, '2026-05-20T00:00:00Z')
        """,
        MOCK_SUBJECTS,
    )
    connection.executemany(
        """
        INSERT INTO notes (id, title, content, pinned, archived, subjectId, createdAt, updatedAt)
        VALUES (?, ?, ?, 0, 0, ?, '2026-05-20T00:00:00Z', '2026-05-20T00:00:00Z')
        """,
        MOCK_NOTES,
    )
    connection.executemany(
        "INSERT INTO metadata (key, value) VALUES (?, ?)",
        [
            ("schema_version", "1.1"),
            ("backup_source", "mock"),
        ],
    )

    connection.commit()
    connection.close()
    return db_path


def open_readonly_database(db_path):
    return sqlite3.connect("file:{0}?mode=ro".format(db_path), uri=True)


def table_exists(connection, table_name):
    cursor = connection.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table_name,),
    )
    return cursor.fetchone() is not None


def require_tables(connection):
    missing = [
        table_name
        for table_name in ("subjects", "notes", "metadata")
        if not table_exists(connection, table_name)
    ]

    if missing:
        raise RuntimeError(
            "La base no tiene las tablas requeridas: {0}".format(", ".join(missing))
        )


def fetch_scalar(connection, sql, default=0):
    cursor = connection.execute(sql)
    row = cursor.fetchone()
    if not row:
        return default
    return row[0]


def fetch_schema_version(connection):
    cursor = connection.execute(
        "SELECT value FROM metadata WHERE key IN ('schema_version', 'schemaVersion', 'db_version') ORDER BY key LIMIT 1"
    )
    row = cursor.fetchone()
    if row and row[0]:
        return row[0]
    return "desconocida"


def fetch_notes(connection):
    cursor = connection.execute(
        """
        SELECT id, title, content, createdAt, updatedAt
        FROM notes
        ORDER BY updatedAt DESC, createdAt DESC, id ASC
        """
    )
    return [
        {
            "id": row[0],
            "title": row[1] or "Sin título",
            "content": row[2] or "",
            "createdAt": row[3],
            "updatedAt": row[4],
        }
        for row in cursor.fetchall()
    ]


def sha256_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def slugify_filename(value):
    value = value.strip().lower()
    value = re.sub(r"[^\w\s-]", "", value, flags=re.UNICODE)
    value = re.sub(r"\s+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "sin-titulo"


def unique_note_filename(note, used_names):
    base = slugify_filename(note["title"])
    filename = "{0}.md".format(base)
    counter = 2

    while filename in used_names:
        filename = "{0}-{1}.md".format(base, counter)
        counter += 1

    used_names.add(filename)
    return filename


def note_to_markdown(note):
    lines = [
        "---",
        "id: {0}".format(note["id"]),
        "title: {0}".format(note["title"]),
        "createdAt: {0}".format(note["createdAt"]),
        "updatedAt: {0}".format(note["updatedAt"]),
        "---",
        "",
    ]

    content = note["content"].strip()
    if content:
        lines.append(content)
    else:
        lines.append("# {0}".format(note["title"]))

    return "\n".join(lines).rstrip() + "\n"


def copy_database(source_db, export_dir):
    destination = export_dir / "lumapse.sqlite"
    shutil.copy2(source_db, destination)
    return destination


def export_notes_markdown(notes, export_dir):
    notes_dir = export_dir / "notes_markdown"
    notes_dir.mkdir(parents=True, exist_ok=True)
    used_names = set()

    for note in notes:
        filename = unique_note_filename(note, used_names)
        (notes_dir / filename).write_text(note_to_markdown(note), encoding="utf-8")

    return notes_dir


def write_metadata(export_dir, metadata):
    metadata_path = export_dir / "metadata.json"
    metadata_path.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return metadata_path


def create_zip(export_dir, output_dir, timestamp):
    output_dir.mkdir(parents=True, exist_ok=True)
    zip_path = output_dir / "lumapse_backup_{0}.zip".format(timestamp)

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(export_dir.rglob("*")):
            if not path.is_file():
                continue
            archive.write(path, path.relative_to(export_dir))

    return zip_path


def verify_zip(zip_path, note_count):
    with zipfile.ZipFile(zip_path, "r") as archive:
        names = set(archive.namelist())

    required = {"lumapse.sqlite", "metadata.json"}
    missing = sorted(required - names)
    markdown_files = [
        name
        for name in names
        if name.startswith("notes_markdown/") and name.endswith(".md")
    ]

    if missing:
        raise RuntimeError(
            "El ZIP generado no contiene archivos requeridos: {0}".format(
                ", ".join(missing)
            )
        )

    if len(markdown_files) != note_count:
        raise RuntimeError(
            "El ZIP contiene {0} notas Markdown, se esperaban {1}".format(
                len(markdown_files),
                note_count,
            )
        )


def format_size(size_bytes):
    units = ["B", "kB", "MB", "GB"]
    value = float(size_bytes)

    for unit in units:
        if value < 1024 or unit == units[-1]:
            if unit == "B":
                return "{0:.0f} {1}".format(value, unit)
            return "{0:.1f} {1}".format(value, unit)
        value /= 1024

    return "{0:.1f} GB".format(value)


def print_header():
    print("📦 Lumapse — Exportador de Respaldos (ZIP)")
    print("==================================================")


def build_backup(db_path, output_dir):
    timestamp = timestamp_for_filename()
    temp_root = Path(tempfile.mkdtemp(prefix="lumapse_backup_"))
    export_dir = temp_root / "export"
    export_dir.mkdir(parents=True, exist_ok=True)

    try:
        with open_readonly_database(db_path) as connection:
            require_tables(connection)
            subject_count = fetch_scalar(connection, "SELECT COUNT(*) FROM subjects")
            note_count = fetch_scalar(connection, "SELECT COUNT(*) FROM notes")
            schema_version = fetch_schema_version(connection)
            notes = fetch_notes(connection)

        sqlite_copy = copy_database(db_path, export_dir)
        sqlite_hash = sha256_file(sqlite_copy)
        export_notes_markdown(notes, export_dir)

        metadata = {
            "project": "Lumapse",
            "schema_version": schema_version,
            "backup_created_at": iso_now(),
            "subjects_count": subject_count,
            "notes_count": note_count,
            "sqlite_filename": sqlite_copy.name,
            "sqlite_sha256": sqlite_hash,
            "notes_markdown_dir": "notes_markdown",
        }
        write_metadata(export_dir, metadata)

        zip_path = create_zip(export_dir, output_dir, timestamp)
        verify_zip(zip_path, note_count)

        return {
            "zip_path": zip_path,
            "sqlite_hash": sqlite_hash,
            "subject_count": subject_count,
            "note_count": note_count,
        }
    finally:
        print("🧹 Limpiando temporales...")
        shutil.rmtree(temp_root, ignore_errors=True)


def main(argv):
    args = parse_args(argv)
    output_dir = Path(args.output_dir).expanduser()
    if not output_dir.is_absolute():
        output_dir = PROJECT_ROOT / output_dir

    print_header()

    mock_temp_dir = None
    try:
        db_path, should_mock = resolve_database_path(args.database)
        if should_mock:
            mock_temp_dir = Path(tempfile.mkdtemp(prefix="lumapse_mock_db_"))
            db_path = create_mock_database(mock_temp_dir)

        print("📥 Leyendo base de datos: {0}".format(db_path))
        if should_mock:
            print("   ℹ️  No se encontró base SQLite local; se generó una base mock temporal.")

        with open_readonly_database(db_path) as connection:
            require_tables(connection)
            subject_count = fetch_scalar(connection, "SELECT COUNT(*) FROM subjects")
            note_count = fetch_scalar(connection, "SELECT COUNT(*) FROM notes")

        print("   ✓ {0} materias procesadas".format(subject_count))
        print("   ✓ {0} notas markdown listas para exportar".format(note_count))
        print("💾 Generando metadatos de integridad (metadata.json)...")
        print("🗜️  Empaquetando en ZIP...")
        result = build_backup(db_path, output_dir)
    except (OSError, RuntimeError, sqlite3.Error, zipfile.BadZipFile) as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1
    finally:
        if mock_temp_dir:
            shutil.rmtree(mock_temp_dir, ignore_errors=True)

    zip_path = result["zip_path"]
    print("==================================================")
    print("✅ Respaldo generado con éxito: {0}".format(zip_path.name))
    print("   📍 Ruta: {0}".format(zip_path.resolve()))
    print("   ⚖️  Tamaño: {0}".format(format_size(zip_path.stat().st_size)))
    print("   🔑 SHA-256 SQLite: {0}".format(result["sqlite_hash"]))
    print("==================================================")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
