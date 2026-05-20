#!/usr/bin/env python3
"""
Lumapse — Validación de Jerarquía de Materias
Valida la integridad de subjects/notes y la regla DP-004 en una base SQLite.
Uso: python3 scripts/validate-subjects-hierarchy.py [ruta.db|--test-violations]
"""

import os
import sqlite3
import sys
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


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
"""

VALID_SUBJECTS = [
    ("subj-matematica", "Matemática", None),
    ("subj-programacion", "Programación", None),
    ("subj-bd", "Base de Datos", None),
    ("sec-matematica-parcial-1", "Parcial 1", "subj-matematica"),
    ("sec-programacion-tp", "Trabajos Prácticos", "subj-programacion"),
]

VALID_NOTES = [
    ("note-entrada", "Nota en Entrada", None),
    ("note-matematica", "Apuntes de Matemática", "subj-matematica"),
    ("note-seccion", "TP de Programación", "sec-programacion-tp"),
]

INVALID_SUBJECTS = [
    ("subj-matematica", "Matemática", None),
    ("sec-matematica-parcial-1", "Parcial 1", "subj-matematica"),
    ("sec-matematica-clase-1", "Clase 1", "sec-matematica-parcial-1"),
    ("sec-huerfana", "Sección Huérfana", "subj-inexistente"),
    ("cycle-a", "Ciclo A", "cycle-c"),
    ("cycle-b", "Ciclo B", "cycle-a"),
    ("cycle-c", "Ciclo C", "cycle-b"),
    ("cycle-self", "Ciclo Directo", "cycle-self"),
]

INVALID_NOTES = [
    ("note-valida", "Nota válida", "subj-matematica"),
    ("note-huerfana", "Nota huérfana", "subj-inexistente"),
]


def relative_path(path):
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def open_sqlite(path):
    if path == ":memory:":
        return sqlite3.connect(":memory:")

    db_path = Path(path).expanduser()
    if not db_path.is_absolute():
        db_path = PROJECT_ROOT / db_path

    if not db_path.exists():
        raise RuntimeError("No existe la base SQLite: {0}".format(relative_path(db_path)))

    return sqlite3.connect("file:{0}?mode=ro".format(db_path), uri=True)


def create_schema(connection):
    connection.execute("PRAGMA foreign_keys = OFF")
    connection.executescript(SCHEMA_SQL)


def seed_subjects(connection, subjects):
    connection.executemany(
        """
        INSERT INTO subjects (id, name, parentSubjectId, archived, color, createdAt)
        VALUES (?, ?, ?, 0, NULL, '2026-05-20T00:00:00Z')
        """,
        subjects,
    )


def seed_notes(connection, notes):
    connection.executemany(
        """
        INSERT INTO notes (id, title, content, pinned, archived, subjectId, createdAt, updatedAt)
        VALUES (?, ?, '', 0, 0, ?, '2026-05-20T00:00:00Z', '2026-05-20T00:00:00Z')
        """,
        notes,
    )


def create_memory_database(with_violations):
    connection = open_sqlite(":memory:")
    create_schema(connection)

    if with_violations:
        seed_subjects(connection, INVALID_SUBJECTS)
        seed_notes(connection, INVALID_NOTES)
    else:
        seed_subjects(connection, VALID_SUBJECTS)
        seed_notes(connection, VALID_NOTES)

    connection.commit()
    return connection


def table_exists(connection, table_name):
    cursor = connection.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table_name,),
    )
    return cursor.fetchone() is not None


def validate_required_tables(connection):
    missing = []

    for table_name in ("subjects", "notes"):
        if not table_exists(connection, table_name):
            missing.append(table_name)

    return missing


def fetch_subjects(connection):
    cursor = connection.execute(
        """
        SELECT id, name, parentSubjectId
        FROM subjects
        ORDER BY id
        """
    )
    return [
        {
            "id": row[0],
            "name": row[1],
            "parent": row[2],
        }
        for row in cursor.fetchall()
    ]


def fetch_subject_orphans(connection):
    cursor = connection.execute(
        """
        SELECT child.id, child.name, child.parentSubjectId
        FROM subjects child
        LEFT JOIN subjects parent ON parent.id = child.parentSubjectId
        WHERE child.parentSubjectId IS NOT NULL
          AND parent.id IS NULL
        ORDER BY child.id
        """
    )
    return [
        "❌ Subject '{0}' ({1}) referencia parentSubjectId inexistente: '{2}'".format(
            row[0],
            row[1],
            row[2],
        )
        for row in cursor.fetchall()
    ]


def fetch_depth_violations(connection):
    cursor = connection.execute(
        """
        SELECT child.id, child.name, child.parentSubjectId, parent.parentSubjectId
        FROM subjects child
        JOIN subjects parent ON parent.id = child.parentSubjectId
        WHERE parent.parentSubjectId IS NOT NULL
        ORDER BY child.id
        """
    )
    return [
        "❌ Subject '{0}' ({1}) supera 2 niveles: padre '{2}' también tiene padre '{3}'".format(
            row[0],
            row[1],
            row[2],
            row[3],
        )
        for row in cursor.fetchall()
    ]


def describe_cycle(cycle_ids, subjects_by_id):
    labels = []

    for subject_id in cycle_ids:
        subject = subjects_by_id.get(subject_id, {})
        name = subject.get("name")
        if name:
            labels.append("{0} ({1})".format(subject_id, name))
        else:
            labels.append(subject_id)

    return " -> ".join(labels)


def normalize_cycle(cycle_ids):
    if not cycle_ids:
        return tuple()

    candidates = []
    for index in range(len(cycle_ids)):
        candidates.append(tuple(cycle_ids[index:] + cycle_ids[:index]))

    return min(candidates)


def find_cycles(subjects):
    subjects_by_id = {subject["id"]: subject for subject in subjects}
    reported = set()
    violations = []

    for subject in subjects:
        chain = []
        seen_indexes = {}
        current_id = subject["id"]

        while current_id:
            if current_id in seen_indexes:
                cycle_ids = chain[seen_indexes[current_id]:]
                normalized = normalize_cycle(cycle_ids)
                if normalized not in reported:
                    reported.add(normalized)
                    cycle_path = cycle_ids + [cycle_ids[0]]
                    violations.append(
                        "❌ Ciclo detectado: {0}".format(
                            describe_cycle(cycle_path, subjects_by_id)
                        )
                    )
                break

            current = subjects_by_id.get(current_id)
            if not current:
                break

            seen_indexes[current_id] = len(chain)
            chain.append(current_id)
            current_id = current["parent"]

    return violations


def fetch_note_orphans(connection):
    cursor = connection.execute(
        """
        SELECT notes.id, notes.title, notes.subjectId
        FROM notes
        LEFT JOIN subjects ON subjects.id = notes.subjectId
        WHERE notes.subjectId IS NOT NULL
          AND subjects.id IS NULL
        ORDER BY notes.id
        """
    )
    return [
        "❌ Note '{0}' ({1}) referencia subjectId inexistente: '{2}'".format(
            row[0],
            row[1],
            row[2],
        )
        for row in cursor.fetchall()
    ]


def print_check(number, title, violations):
    print("[{0}/4] {1}...".format(number, title))

    if violations:
        for violation in violations:
            print(violation)
    else:
        print("✅ Sin problemas")

    return len(violations)


def print_header(base_label):
    print("🏗️  Lumapse — Validación de Jerarquía de Materias")
    print("==================================================")
    print("📂 Base: {0}".format(base_label))
    print("--------------------------------------------------")


def usage():
    return "Uso: python3 scripts/validate-subjects-hierarchy.py [ruta.db|--test-violations]"


def parse_args(argv):
    if len(argv) > 2:
        raise RuntimeError(usage())

    if len(argv) == 1:
        return {
            "mode": "memory-valid",
            "path": None,
            "base_label": ":memory: (datos de prueba)",
        }

    argument = argv[1]
    if argument in ("-h", "--help"):
        return {"mode": "help", "path": None, "base_label": None}

    if argument == "--test-violations":
        return {
            "mode": "memory-invalid",
            "path": None,
            "base_label": ":memory: (datos de prueba con violaciones)",
        }

    if Path(argument).is_absolute():
        base_label = argument
    else:
        base_label = relative_path((PROJECT_ROOT / argument).resolve())

    return {
        "mode": "file",
        "path": argument,
        "base_label": base_label,
    }


def validate_connection(connection):
    missing_tables = validate_required_tables(connection)
    if missing_tables:
        for table_name in missing_tables:
            print("❌ Tabla requerida no encontrada: {0}".format(table_name))
        return len(missing_tables)

    subjects = fetch_subjects(connection)
    checks = [
        (
            "Subjects huérfanos (parentSubjectId inválido)",
            fetch_subject_orphans(connection),
        ),
        (
            "Profundidad > 2 niveles (violación DP-004)",
            fetch_depth_violations(connection),
        ),
        (
            "Ciclos en jerarquía",
            find_cycles(subjects),
        ),
        (
            "Notas con subjectId inválido",
            fetch_note_orphans(connection),
        ),
    ]

    total_violations = 0
    for index, check in enumerate(checks, 1):
        title, violations = check
        total_violations += print_check(index, title, violations)

    return total_violations


def main(argv):
    try:
        args = parse_args(argv)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    if args["mode"] == "help":
        print(usage())
        return 0

    connection = None
    try:
        if args["mode"] == "memory-valid":
            connection = create_memory_database(with_violations=False)
        elif args["mode"] == "memory-invalid":
            connection = create_memory_database(with_violations=True)
        else:
            connection = open_sqlite(args["path"])

        print_header(args["base_label"])
        total_violations = validate_connection(connection)
    except (RuntimeError, sqlite3.Error) as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1
    finally:
        if connection:
            connection.close()

    print("==================================================")
    if total_violations:
        print("❌ Jerarquía inválida ({0} violaciones)".format(total_violations))
        print("==================================================")
        return 1

    print("✅ Jerarquía válida (0 violaciones)")
    print("==================================================")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
