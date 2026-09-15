#!/usr/bin/env python3
"""Valida, materializa y audita fixtures sintéticos de Lumapse sobre SQLite."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sqlite3
import sys
import tempfile
import zipfile
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable


ALLOWED_COLORS = {
    "#818cf8", "#f87171", "#fb923c", "#fbbf24",
    "#34d399", "#22d3ee", "#a78bfa", "#f472b6",
}
ALLOWED_STATUSES = {None, "📖", "❓", "🔥", "✅"}
ALLOWED_EVENT_TYPES = {"parcial", "final", "tp", "exposicion"}
OPAQUE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$")
EXPECTED_TABLE_COLUMNS = {
    "subjects": {
        "id", "name", "parentSubjectId", "archived", "color", "deletedAt", "createdAt",
    },
    "notes": {
        "id", "title", "content", "pinned", "archived", "subjectId",
        "statusEmoji", "deletedAt", "createdAt", "updatedAt",
    },
    "academic_events": {
        "id", "type", "title", "date", "subjectId", "createdAt", "updatedAt",
    },
    "metadata": {"key", "value"},
}
SELF_TEST_SCHEMA = """
CREATE TABLE subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parentSubjectId TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    archived INTEGER DEFAULT 0,
    color TEXT,
    deletedAt TEXT,
    createdAt TEXT NOT NULL
);
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    pinned INTEGER DEFAULT 0,
    archived INTEGER DEFAULT 0,
    subjectId TEXT REFERENCES subjects(id) ON DELETE SET NULL,
    statusEmoji TEXT,
    deletedAt TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);
CREATE TABLE academic_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('parcial', 'final', 'tp', 'exposicion')),
    title TEXT,
    date TEXT NOT NULL,
    subjectId TEXT REFERENCES subjects(id) ON DELETE SET NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);
CREATE INDEX idx_academic_events_date ON academic_events(date);
CREATE INDEX idx_academic_events_subject ON academic_events(subjectId);
CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT);
"""


class FixtureError(RuntimeError):
    """Error esperado y explicable del fixture."""


def fail(message: str) -> None:
    raise FixtureError(message)


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"No se pudo leer JSON válido desde {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"{path} debe contener un objeto JSON en la raíz")
    return value


def require_dict(value: Any, path: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        fail(f"{path} debe ser un objeto")
    return value


def require_list(value: Any, path: str) -> list[Any]:
    if not isinstance(value, list):
        fail(f"{path} debe ser una lista")
    return value


def require_string(value: Any, path: str, *, max_chars: int, allow_empty: bool = False) -> str:
    if not isinstance(value, str):
        fail(f"{path} debe ser texto")
    if any(ord(char) < 32 and char not in "\n\t" for char in value):
        fail(f"{path} contiene caracteres de control")
    if not allow_empty and not value.strip():
        fail(f"{path} no puede estar vacío")
    if len(value) > max_chars:
        fail(f"{path} supera {max_chars} caracteres")
    return value


def require_one_line(value: Any, path: str, *, max_chars: int) -> str:
    text_value = require_string(value, path, max_chars=max_chars)
    if any(char in text_value for char in ("\n", "\r", "\u2028", "\u2029")):
        fail(f"{path} debe ocupar una sola línea")
    return text_value.strip()


def require_id(value: Any, path: str) -> str:
    text_value = require_one_line(value, path, max_chars=128)
    if not OPAQUE_ID.fullmatch(text_value):
        fail(f"{path} no es un ID opaco ASCII válido")
    return text_value


def require_int(value: Any, path: str, *, minimum: int = 0, maximum: int = 3650) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        fail(f"{path} debe ser un entero")
    if not minimum <= value <= maximum:
        fail(f"{path} debe estar entre {minimum} y {maximum}")
    return value


def require_bool(value: Any, path: str) -> bool:
    if not isinstance(value, bool):
        fail(f"{path} debe ser booleano")
    return value


def parse_seed_date(value: str) -> date:
    try:
        parsed = date.fromisoformat(value)
    except ValueError as exc:
        fail(f"La fecha base debe usar YYYY-MM-DD: {exc}")
    if parsed.isoformat() != value:
        fail("La fecha base debe ser canónica (YYYY-MM-DD)")
    return parsed


def relative_timestamp(seed_date: date, days_before: int) -> str:
    instant = datetime.combine(
        seed_date - timedelta(days=days_before),
        time(hour=12),
        tzinfo=timezone.utc,
    )
    return instant.isoformat().replace("+00:00", "Z")


def validate_expected(dataset: dict[str, Any], computed: dict[str, int]) -> None:
    expected = require_dict(dataset.get("expected"), "expected")
    missing = sorted(set(computed) - set(expected))
    extra = sorted(set(expected) - set(computed))
    if missing or extra:
        fail(f"expected no coincide con las claves calculadas; faltan={missing}, sobran={extra}")
    for key, actual in computed.items():
        declared = require_int(expected[key], f"expected.{key}", maximum=100_000)
        if declared != actual:
            fail(f"expected.{key}={declared}, pero el dataset calcula {actual}")


def validate_dataset(dataset: dict[str, Any]) -> dict[str, Any]:
    if dataset.get("datasetVersion") != 1:
        fail("datasetVersion debe ser 1")
    require_id(dataset.get("id"), "id")
    if dataset.get("locale") != "es-AR":
        fail("locale debe ser es-AR")

    subjects = require_list(dataset.get("subjects"), "subjects")
    notes = require_list(dataset.get("notes"), "notes")
    events = require_list(dataset.get("academicEvents"), "academicEvents")
    if len(subjects) < 6:
        fail("El dataset debe contener al menos 6 materias raíz")

    all_ids: set[str] = set()
    subject_ids: set[str] = set()
    root_ids: set[str] = set()
    section_ids: set[str] = set()
    subject_rows: list[dict[str, Any]] = []
    names_by_parent: dict[str | None, set[str]] = {}

    def reserve_id(entity_id: str, path: str) -> None:
        if entity_id in all_ids:
            fail(f"{path} duplica el ID {entity_id}")
        all_ids.add(entity_id)

    for root_index, root_value in enumerate(subjects):
        path = f"subjects[{root_index}]"
        root = require_dict(root_value, path)
        root_id = require_id(root.get("id"), f"{path}.id")
        reserve_id(root_id, f"{path}.id")
        root_ids.add(root_id)
        subject_ids.add(root_id)
        name = require_one_line(root.get("name"), f"{path}.name", max_chars=40)
        require_one_line(root.get("career"), f"{path}.career", max_chars=120)
        color = require_one_line(root.get("color"), f"{path}.color", max_chars=7).lower()
        if color not in ALLOWED_COLORS:
            fail(f"{path}.color no pertenece a la paleta vigente de Lumapse")
        created_days = require_int(root.get("createdDaysBeforeSeed"), f"{path}.createdDaysBeforeSeed")
        normalized_name = name.casefold()
        if normalized_name in names_by_parent.setdefault(None, set()):
            fail(f"{path}.name duplica una materia raíz")
        names_by_parent[None].add(normalized_name)
        subject_rows.append({
            "id": root_id,
            "name": name,
            "parentSubjectId": None,
            "archived": 0,
            "color": color,
            "deletedAt": None,
            "createdDaysBeforeSeed": created_days,
        })

        sections = require_list(root.get("sections"), f"{path}.sections")
        if len(sections) < 2:
            fail(f"{path}.sections debe incluir varias secciones directas (mínimo 2)")
        for section_index, section_value in enumerate(sections):
            section_path = f"{path}.sections[{section_index}]"
            section = require_dict(section_value, section_path)
            if "sections" in section:
                fail(f"{section_path} no puede contener subsecciones")
            section_id = require_id(section.get("id"), f"{section_path}.id")
            reserve_id(section_id, f"{section_path}.id")
            section_ids.add(section_id)
            subject_ids.add(section_id)
            section_name = require_one_line(section.get("name"), f"{section_path}.name", max_chars=40)
            normalized_section_name = section_name.casefold()
            if normalized_section_name in names_by_parent.setdefault(root_id, set()):
                fail(f"{section_path}.name duplica una sección del mismo padre")
            names_by_parent[root_id].add(normalized_section_name)
            subject_rows.append({
                "id": section_id,
                "name": section_name,
                "parentSubjectId": root_id,
                "archived": 0,
                "color": color,
                "deletedAt": None,
                "createdDaysBeforeSeed": require_int(
                    section.get("createdDaysBeforeSeed"),
                    f"{section_path}.createdDaysBeforeSeed",
                ),
            })

    note_rows: list[dict[str, Any]] = []
    for index, note_value in enumerate(notes):
        path = f"notes[{index}]"
        note = require_dict(note_value, path)
        note_id = require_id(note.get("id"), f"{path}.id")
        reserve_id(note_id, f"{path}.id")
        title = require_one_line(note.get("title"), f"{path}.title", max_chars=4096)
        content = require_string(note.get("content"), f"{path}.content", max_chars=2_000_000, allow_empty=True)
        if len(content.encode("utf-8")) > 2 * 1024 * 1024:
            fail(f"{path}.content supera 2 MiB UTF-8")
        subject_id = note.get("subjectId")
        if subject_id is not None:
            subject_id = require_id(subject_id, f"{path}.subjectId")
            if subject_id not in subject_ids:
                fail(f"{path}.subjectId no referencia una materia o sección del dataset")
        pinned = require_bool(note.get("pinned"), f"{path}.pinned")
        archived = require_bool(note.get("archived"), f"{path}.archived")
        status = note.get("statusEmoji")
        if status not in ALLOWED_STATUSES:
            fail(f"{path}.statusEmoji no pertenece a los cuatro estados vigentes")
        created_days = require_int(note.get("createdDaysBeforeSeed"), f"{path}.createdDaysBeforeSeed")
        updated_days = require_int(note.get("updatedDaysBeforeSeed"), f"{path}.updatedDaysBeforeSeed")
        if created_days < updated_days:
            fail(f"{path}: createdDaysBeforeSeed debe ser >= updatedDaysBeforeSeed")
        deleted_days = note.get("deletedDaysBeforeSeed")
        if deleted_days is not None:
            deleted_days = require_int(deleted_days, f"{path}.deletedDaysBeforeSeed")
            if deleted_days > updated_days:
                fail(f"{path}: la eliminación no puede ser anterior a la última actualización")
        note_rows.append({
            "id": note_id,
            "title": title,
            "content": content,
            "pinned": int(pinned),
            "archived": int(archived),
            "statusEmoji": status,
            "subjectId": subject_id,
            "createdDaysBeforeSeed": created_days,
            "updatedDaysBeforeSeed": updated_days,
            "deletedDaysBeforeSeed": deleted_days,
        })

    event_rows: list[dict[str, Any]] = []
    for index, event_value in enumerate(events):
        path = f"academicEvents[{index}]"
        event = require_dict(event_value, path)
        event_id = require_id(event.get("id"), f"{path}.id")
        reserve_id(event_id, f"{path}.id")
        event_type = event.get("type")
        if event_type not in ALLOWED_EVENT_TYPES:
            fail(f"{path}.type no pertenece a la lista vigente")
        title = require_one_line(event.get("title"), f"{path}.title", max_chars=65)
        subject_id = require_id(event.get("subjectId"), f"{path}.subjectId")
        if subject_id not in subject_ids:
            fail(f"{path}.subjectId no referencia una materia o sección del dataset")
        event_rows.append({
            "id": event_id,
            "type": event_type,
            "title": title,
            "subjectId": subject_id,
            "daysFromSeed": require_int(event.get("daysFromSeed"), f"{path}.daysFromSeed", maximum=365),
        })

    active_notes = [note for note in note_rows if note["deletedDaysBeforeSeed"] is None]
    normal_feed_notes = [note for note in active_notes if not note["archived"]]
    computed = {
        "rootSubjects": len(root_ids),
        "sections": len(section_ids),
        "subjects": len(subject_rows),
        "activeSubjects": len(subject_rows),
        "deletedSubjects": 0,
        "notes": len(note_rows),
        "activeNotes": len(active_notes),
        "normalFeedNotes": len(normal_feed_notes),
        "inboxNotes": sum(
            note["subjectId"] is None and not note["archived"]
            for note in active_notes
        ),
        "archivedNotes": sum(bool(note["archived"]) for note in active_notes),
        "trashNotes": len(note_rows) - len(active_notes),
        "pinnedActiveNotes": sum(bool(note["pinned"]) for note in active_notes),
        "academicEvents": len(event_rows),
        "eventsWithSubject": sum(event["subjectId"] is not None for event in event_rows),
    }
    validate_expected(dataset, computed)

    return {
        "subjects": subject_rows,
        "notes": note_rows,
        "academicEvents": event_rows,
        "counts": computed,
    }


def required_schema(connection: sqlite3.Connection) -> None:
    tables = {
        row[0]
        for row in connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
    }
    for table, required_columns in EXPECTED_TABLE_COLUMNS.items():
        if table not in tables:
            fail(f"La base no contiene la tabla requerida {table}")
        actual_columns = {
            row[1] for row in connection.execute(f"PRAGMA table_info({table})")
        }
        missing = sorted(required_columns - actual_columns)
        if missing:
            fail(f"La tabla {table} no contiene las columnas requeridas: {', '.join(missing)}")


def integrity_check(connection: sqlite3.Connection) -> None:
    result = connection.execute("PRAGMA integrity_check").fetchone()
    if not result or result[0] != "ok":
        fail(f"PRAGMA integrity_check falló: {result}")
    foreign_key_errors = connection.execute("PRAGMA foreign_key_check").fetchall()
    if foreign_key_errors:
        fail(f"PRAGMA foreign_key_check encontró relaciones inválidas: {foreign_key_errors[:5]}")


def metadata_rows(connection: sqlite3.Connection) -> list[tuple[str, str | None]]:
    return [tuple(row) for row in connection.execute("SELECT key, value FROM metadata ORDER BY key")]


def metadata_digest(rows: Iterable[tuple[str, str | None]]) -> str:
    payload = json.dumps(list(rows), ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def logical_database_digest(connection: sqlite3.Connection) -> str:
    """Hash estable del contenido lógico; ignora layout de páginas y journal mode."""
    payload: dict[str, Any] = {}
    for table in sorted(EXPECTED_TABLE_COLUMNS):
        columns = sorted(EXPECTED_TABLE_COLUMNS[table])
        quoted_columns = ", ".join(f'"{column}"' for column in columns)
        rows = [list(row) for row in connection.execute(
            f'SELECT {quoted_columns} FROM "{table}"'
        )]
        rows.sort(key=lambda row: json.dumps(row, ensure_ascii=False, separators=(",", ":")))
        payload[table] = {"columns": columns, "rows": rows}
    serialized = json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def require_legacy_migration_complete(connection: sqlite3.Connection) -> None:
    row = connection.execute(
        "SELECT value FROM metadata WHERE key='indexeddb_migrated'"
    ).fetchone()
    if not row or row[0] != "true":
        fail(
            "metadata.indexeddb_migrated no vale 'true'; se aborta para impedir "
            "que un IndexedDB legado reinyecte notas antiguas al relanzar la app"
        )


def expected_materialized_rows(model: dict[str, Any], seed_date: date) -> dict[str, list[dict[str, Any]]]:
    subjects = [
        {
            "id": row["id"],
            "name": row["name"],
            "parentSubjectId": row["parentSubjectId"],
            "archived": row["archived"],
            "color": row["color"],
            "deletedAt": row["deletedAt"],
            "createdAt": relative_timestamp(seed_date, row["createdDaysBeforeSeed"]),
        }
        for row in model["subjects"]
    ]
    notes = [
        {
            "id": row["id"],
            "title": row["title"],
            "content": row["content"],
            "pinned": row["pinned"],
            "archived": row["archived"],
            "statusEmoji": row["statusEmoji"],
            "subjectId": row["subjectId"],
            "createdAt": relative_timestamp(seed_date, row["createdDaysBeforeSeed"]),
            "updatedAt": relative_timestamp(seed_date, row["updatedDaysBeforeSeed"]),
            "deletedAt": (
                relative_timestamp(seed_date, row["deletedDaysBeforeSeed"])
                if row["deletedDaysBeforeSeed"] is not None else None
            ),
        }
        for row in model["notes"]
    ]
    created_at = relative_timestamp(seed_date, 0)
    events = [
        {
            "id": row["id"],
            "type": row["type"],
            "title": row["title"],
            "date": (seed_date + timedelta(days=row["daysFromSeed"])).isoformat(),
            "subjectId": row["subjectId"],
            "createdAt": created_at,
            "updatedAt": created_at,
        }
        for row in model["academicEvents"]
    ]
    return {"subjects": subjects, "notes": notes, "academic_events": events}


def fetch_dicts(connection: sqlite3.Connection, sql: str) -> list[dict[str, Any]]:
    cursor = connection.execute(sql)
    columns = [description[0] for description in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def validate_database(
    database: Path,
    dataset: dict[str, Any],
    seed_date: date,
    *,
    expected_metadata_digest: str | None = None,
) -> dict[str, Any]:
    model = validate_dataset(dataset)
    expected = expected_materialized_rows(model, seed_date)
    try:
        connection = sqlite3.connect(f"file:{database}?mode=ro", uri=True)
    except sqlite3.Error as exc:
        fail(f"No se pudo abrir {database}: {exc}")
    try:
        required_schema(connection)
        integrity_check(connection)
        require_legacy_migration_complete(connection)
        actual = {
            "subjects": fetch_dicts(connection, """
                SELECT id, name, parentSubjectId, archived, color, deletedAt, createdAt
                FROM subjects ORDER BY id
            """),
            "notes": fetch_dicts(connection, """
                SELECT id, title, content, pinned, archived, statusEmoji, subjectId,
                       createdAt, updatedAt, deletedAt
                FROM notes ORDER BY id
            """),
            "academic_events": fetch_dicts(connection, """
                SELECT id, type, title, date, subjectId, createdAt, updatedAt
                FROM academic_events ORDER BY id
            """),
        }
        for key in actual:
            expected[key].sort(key=lambda row: row["id"])
            if actual[key] != expected[key]:
                fail(f"El contenido materializado de {key} no coincide exactamente con dataset.json")

        invalid_depth = connection.execute("""
            SELECT COUNT(*)
            FROM subjects child
            JOIN subjects parent ON parent.id = child.parentSubjectId
            WHERE parent.parentSubjectId IS NOT NULL
        """).fetchone()[0]
        if invalid_depth:
            fail(f"Se detectaron {invalid_depth} subsecciones prohibidas")
        duplicate_names = connection.execute("""
            SELECT COUNT(*) FROM (
              SELECT COALESCE(parentSubjectId, ''), lower(trim(name)), COUNT(*) AS amount
              FROM subjects
              GROUP BY COALESCE(parentSubjectId, ''), lower(trim(name))
              HAVING amount > 1
            )
        """).fetchone()[0]
        if duplicate_names:
            fail("Se detectaron nombres de materia/sección repetidos dentro del mismo nivel")
        rows = metadata_rows(connection)
        digest = metadata_digest(rows)
        if expected_metadata_digest and digest != expected_metadata_digest:
            fail("La tabla metadata cambió durante el seed o la transferencia")
        return {
            "database": str(database),
            "seedDate": seed_date.isoformat(),
            "counts": model["counts"],
            "metadataRows": len(rows),
            "metadataSha256": digest,
            "logicalDatabaseSha256": logical_database_digest(connection),
            "databaseSha256": sha256_file(database),
            "integrityCheck": "ok",
            "foreignKeyCheck": "ok",
            "contentMatch": "exact",
        }
    except sqlite3.Error as exc:
        fail(f"Fallo SQLite al validar {database}: {exc}")
    finally:
        connection.close()


def seed_database(
    source: Path,
    output: Path,
    dataset: dict[str, Any],
    seed_date: date,
) -> dict[str, Any]:
    if output.exists():
        fail(f"El destino ya existe y no se sobrescribirá: {output}")
    model = validate_dataset(dataset)
    materialized = expected_materialized_rows(model, seed_date)
    output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, output)
    connection = sqlite3.connect(output)
    metadata_before: list[tuple[str, str | None]] = []
    try:
        connection.execute("PRAGMA foreign_keys=ON")
        required_schema(connection)
        integrity_check(connection)
        require_legacy_migration_complete(connection)
        metadata_before = metadata_rows(connection)

        # Un journal autocontenido evita transportar WAL/SHM al dispositivo.
        connection.execute("PRAGMA journal_mode=DELETE")
        connection.execute("BEGIN IMMEDIATE")
        connection.execute("DELETE FROM academic_events")
        connection.execute("DELETE FROM notes")
        connection.execute("DELETE FROM subjects")
        connection.executemany(
            """
            INSERT INTO subjects
              (id, name, parentSubjectId, archived, color, deletedAt, createdAt)
            VALUES
              (:id, :name, :parentSubjectId, :archived, :color, :deletedAt, :createdAt)
            """,
            materialized["subjects"],
        )
        connection.executemany(
            """
            INSERT INTO notes
              (id, title, content, pinned, archived, statusEmoji, subjectId,
               createdAt, updatedAt, deletedAt)
            VALUES
              (:id, :title, :content, :pinned, :archived, :statusEmoji, :subjectId,
               :createdAt, :updatedAt, :deletedAt)
            """,
            materialized["notes"],
        )
        connection.executemany(
            """
            INSERT INTO academic_events
              (id, type, title, date, subjectId, createdAt, updatedAt)
            VALUES
              (:id, :type, :title, :date, :subjectId, :createdAt, :updatedAt)
            """,
            materialized["academic_events"],
        )
        connection.commit()
        integrity_check(connection)
        if metadata_rows(connection) != metadata_before:
            fail("La tabla metadata cambió durante la transacción")
    except (FixtureError, sqlite3.Error):
        connection.rollback()
        raise
    finally:
        connection.close()

    return validate_database(
        output,
        dataset,
        seed_date,
        expected_metadata_digest=metadata_digest(metadata_before),
    )


def consolidate_database(source: Path, output: Path) -> None:
    if output.exists():
        fail(f"El destino ya existe y no se sobrescribirá: {output}")
    try:
        source_connection = sqlite3.connect(f"file:{source}?mode=ro", uri=True)
        required_schema(source_connection)
        integrity_check(source_connection)
        output.parent.mkdir(parents=True, exist_ok=True)
        destination_connection = sqlite3.connect(output)
        source_connection.backup(destination_connection)
        destination_connection.close()
        source_connection.close()
        consolidated = sqlite3.connect(output)
        required_schema(consolidated)
        integrity_check(consolidated)
        consolidated.execute("PRAGMA journal_mode=DELETE")
        consolidated.close()
    except (FixtureError, sqlite3.Error) as exc:
        output.unlink(missing_ok=True)
        if isinstance(exc, FixtureError):
            raise
        fail(f"No se pudo consolidar la base {source}: {exc}")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def database_summary(database: Path) -> dict[str, Any]:
    try:
        connection = sqlite3.connect(f"file:{database}?mode=ro", uri=True)
        required_schema(connection)
        integrity_check(connection)
        counts = {
            "subjects": connection.execute("SELECT COUNT(*) FROM subjects").fetchone()[0],
            "activeSubjects": connection.execute(
                "SELECT COUNT(*) FROM subjects WHERE deletedAt IS NULL"
            ).fetchone()[0],
            "notes": connection.execute("SELECT COUNT(*) FROM notes").fetchone()[0],
            "activeNotes": connection.execute(
                "SELECT COUNT(*) FROM notes WHERE deletedAt IS NULL"
            ).fetchone()[0],
            "academicEvents": connection.execute(
                "SELECT COUNT(*) FROM academic_events"
            ).fetchone()[0],
        }
        rows = metadata_rows(connection)
        return {
            "database": str(database),
            "databaseBytes": database.stat().st_size,
            "databaseSha256": sha256_file(database),
            "counts": counts,
            "metadataRows": len(rows),
            "metadataSha256": metadata_digest(rows),
            "logicalDatabaseSha256": logical_database_digest(connection),
            "integrityCheck": "ok",
            "foreignKeyCheck": "ok",
        }
    except (OSError, sqlite3.Error) as exc:
        fail(f"No se pudo inspeccionar {database}: {exc}")
    finally:
        if "connection" in locals():
            connection.close()


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def print_json(value: dict[str, Any]) -> None:
    print(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True))


def command_validate_dataset(args: argparse.Namespace) -> None:
    dataset = load_json(args.dataset)
    model = validate_dataset(dataset)
    print_json({"dataset": str(args.dataset), "status": "ok", "counts": model["counts"]})


def command_export_backup(args: argparse.Namespace) -> None:
    """Exporta exclusivamente un dataset sintético validado; nunca abre SQLite ni ADB."""
    dataset = load_json(args.dataset)
    model = validate_dataset(dataset)
    seed_date = parse_seed_date(args.seed_date)
    if not 1980 <= seed_date.year <= 2107:
        fail("La fecha ZIP debe estar entre 1980 y 2107")
    rows = expected_materialized_rows(model, seed_date)
    created_at = relative_timestamp(seed_date, 0)
    filename = f"lumapse-{seed_date:%Y-%m-%d}-12-00.zip"

    def active_entities(entities: list[dict[str, Any]]) -> list[dict[str, Any]]:
        result = []
        for row in entities:
            if row.get("deletedAt") is not None:
                continue
            item = {key: value for key, value in row.items() if key != "deletedAt"}
            for key in ("pinned", "archived"):
                if key in item:
                    item[key] = bool(item[key])
            result.append(item)
        return result

    subjects = active_entities(rows["subjects"])
    notes = active_entities(rows["notes"])
    events = rows["academic_events"]

    def json_text(value: Any) -> str:
        return json.dumps(value, ensure_ascii=False, indent=2) + "\n"

    files = {
        "data/subjects.json": json_text(subjects),
        "data/notes.json": json_text(notes),
        "data/academic-events.json": json_text(events),
        "README.txt": "Fixture sintético de Lumapse; backup v1. Incluye archivo, excluye papelera.\n",
    }
    for note in notes:
        files[f"notes/{note['id']}.md"] = f"# {note['title']}\n\n{note['content']}\n"
    counts = {"subjects": len(subjects), "notes": len(notes), "academicEvents": len(events), "attachments": 0}
    files["manifest.json"] = json_text({
        "app": "Lumapse", "backupFormatVersion": 1,
        "createdAt": created_at, "filename": filename, "exportMode": "manual",
        "dataPolicy": {"includesDeletedItems": False, "includesArchivedItems": True, "includesAttachments": False},
        "counts": counts, "files": sorted([*files, "manifest.json"]),
    })
    # STORE evita variaciones por zlib; fechas, orden y atributos no dependen del host.
    # Modo x: no sobrescribir un backup existente por accidente.
    try:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(args.output, "x", compression=zipfile.ZIP_STORED) as archive:
            for path, content in sorted(files.items()):
                info = zipfile.ZipInfo(path, (seed_date.year, seed_date.month, seed_date.day, 12, 0, 0))
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                archive.writestr(info, content.encode("utf-8"))
    except (OSError, ValueError) as exc:
        fail(f"No se pudo crear el ZIP (no se sobrescriben archivos): {exc}")
    print_json({
        "status": "ok", "datasetId": dataset["id"], "seedDate": args.seed_date,
        "datasetSha256": sha256_file(args.dataset), "backupSha256": sha256_file(args.output),
        "backupBytes": args.output.stat().st_size, "counts": counts,
        "excludedTrashNotes": model["counts"]["trashNotes"],
    })


def command_self_test(args: argparse.Namespace) -> None:
    dataset = load_json(args.dataset)
    seed_date = parse_seed_date(args.seed_date)
    with tempfile.TemporaryDirectory(prefix="lumapse-fixture-self-test-") as temp_value:
        temp_dir = Path(temp_value)
        source = temp_dir / "source.sqlite3"
        output = temp_dir / "seeded.sqlite3"
        connection = sqlite3.connect(source)
        connection.executescript(SELF_TEST_SCHEMA)
        connection.executemany(
            "INSERT INTO metadata (key, value) VALUES (?, ?)",
            [("indexeddb_migrated", "true"), ("self_test_sentinel", "preserve")],
        )
        connection.commit()
        before = metadata_digest(metadata_rows(connection))
        connection.close()
        result = seed_database(source, output, dataset, seed_date)
        if result["metadataSha256"] != before:
            fail("El self-test detectó cambios en metadata")
        result["selfTest"] = "ok"
        print_json(result)


def command_consolidate(args: argparse.Namespace) -> None:
    consolidate_database(args.source, args.output)
    print_json(database_summary(args.output))


def command_seed(args: argparse.Namespace) -> None:
    dataset = load_json(args.dataset)
    result = seed_database(args.source, args.output, dataset, parse_seed_date(args.seed_date))
    if args.manifest_out:
        manifest = {
            "kind": "seeded-fixture",
            "createdAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "dataset": str(args.dataset),
            "datasetSha256": sha256_file(args.dataset),
            **result,
        }
        write_json(args.manifest_out, manifest)
    print_json(result)


def command_validate_database(args: argparse.Namespace) -> None:
    dataset = load_json(args.dataset)
    result = validate_database(
        args.database,
        dataset,
        parse_seed_date(args.seed_date),
        expected_metadata_digest=args.metadata_sha256,
    )
    print_json(result)


def command_snapshot(args: argparse.Namespace) -> None:
    summary = database_summary(args.database)
    manifest = {
        "kind": args.kind,
        "createdAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "serial": args.serial,
        "package": args.package,
        "versionName": args.version_name,
        "versionCode": args.version_code,
        **summary,
    }
    write_json(args.output, manifest)
    print_json(manifest)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    validate_parser = subparsers.add_parser("validate-dataset")
    validate_parser.add_argument("dataset", type=Path)
    validate_parser.set_defaults(func=command_validate_dataset)

    export_parser = subparsers.add_parser("export-backup", help="ZIP v1 determinista desde JSON sintético; sin ADB")
    export_parser.add_argument("dataset", type=Path)
    export_parser.add_argument("output", type=Path)
    export_parser.add_argument("--seed-date", required=True)
    export_parser.set_defaults(func=command_export_backup)

    self_test_parser = subparsers.add_parser("self-test")
    self_test_parser.add_argument("dataset", type=Path)
    self_test_parser.add_argument("--seed-date", required=True)
    self_test_parser.set_defaults(func=command_self_test)

    consolidate_parser = subparsers.add_parser("consolidate")
    consolidate_parser.add_argument("source", type=Path)
    consolidate_parser.add_argument("output", type=Path)
    consolidate_parser.set_defaults(func=command_consolidate)

    seed_parser = subparsers.add_parser("seed")
    seed_parser.add_argument("source", type=Path)
    seed_parser.add_argument("output", type=Path)
    seed_parser.add_argument("dataset", type=Path)
    seed_parser.add_argument("--seed-date", required=True)
    seed_parser.add_argument("--manifest-out", type=Path)
    seed_parser.set_defaults(func=command_seed)

    validate_db_parser = subparsers.add_parser("validate-db")
    validate_db_parser.add_argument("database", type=Path)
    validate_db_parser.add_argument("dataset", type=Path)
    validate_db_parser.add_argument("--seed-date", required=True)
    validate_db_parser.add_argument("--metadata-sha256")
    validate_db_parser.set_defaults(func=command_validate_database)

    snapshot_parser = subparsers.add_parser("snapshot")
    snapshot_parser.add_argument("database", type=Path)
    snapshot_parser.add_argument("output", type=Path)
    snapshot_parser.add_argument("--kind", required=True)
    snapshot_parser.add_argument("--serial", required=True)
    snapshot_parser.add_argument("--package", required=True)
    snapshot_parser.add_argument("--version-name", required=True)
    snapshot_parser.add_argument("--version-code", required=True)
    snapshot_parser.set_defaults(func=command_snapshot)
    return parser


def main(argv: list[str]) -> int:
    try:
        args = build_parser().parse_args(argv)
        args.func(args)
        return 0
    except FixtureError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("ERROR: operación interrumpida", file=sys.stderr)
        return 130


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
