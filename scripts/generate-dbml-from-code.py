#!/usr/bin/env python3
"""
Lumapse — Generador DBML desde Código
Genera 03-modelo-logico-relacional.dbml parseando el DDL real de sqlite/connection.js.
Uso: python3 scripts/generate-dbml-from-code.py [--check]
"""

import os
import re
import sys
from datetime import date
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SQLITE_SERVICE_PATH = PROJECT_ROOT / "src" / "services" / "sqlite" / "connection.js"
DBML_PATH = PROJECT_ROOT / "docs" / "diagramas" / "database" / "03-modelo-logico-relacional.dbml"

JS_STRING_RE = re.compile(
    r"`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"",
    re.DOTALL,
)
CREATE_TABLE_RE = re.compile(
    r"\bCREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(",
    re.IGNORECASE,
)
ALTER_ADD_COLUMN_RE = re.compile(
    r"\bALTER\s+TABLE\s+([A-Za-z_][A-Za-z0-9_]*)\s+ADD\s+COLUMN\s+(.+?)(?:;|$)",
    re.IGNORECASE | re.MULTILINE,
)
GENERATED_DATE_RE = re.compile(r"^// Fecha de generación:\s+(\d{4}-\d{2}-\d{2})\s*$", re.MULTILINE)

CONSTRAINT_KEYWORDS = {
    "PRIMARY",
    "NOT",
    "NULL",
    "REFERENCES",
    "DEFAULT",
    "CHECK",
    "UNIQUE",
    "COLLATE",
    "GENERATED",
    "AS",
    "CONSTRAINT",
    "AUTOINCREMENT",
}
TABLE_CONSTRAINTS = {
    "PRIMARY",
    "FOREIGN",
    "UNIQUE",
    "CHECK",
    "CONSTRAINT",
}

TABLE_NOTES = {
    "subjects": "Modela Materias (parentSubjectId = NULL) y Secciones (parentSubjectId = UUID). Profundidad máx: 2 niveles (DP-004).",
    "academic_events": "Fechas académicas puntuales como recordatorio visual pasivo integrado al Heatmap (DP-007).",
    "metadata": "Tabla técnica clave-valor para control de migraciones y flags de sistema.",
}

COLUMN_NOTES = {
    ("subjects", "id"): "UUID v4 generado en cliente",
    ("subjects", "name"): "Nombre de la Materia o Sección",
    ("subjects", "parentSubjectId"): "NULL = Materia raíz | UUID = Sección hija",
    ("subjects", "archived"): "0 = activa | 1 = archivada",
    ("subjects", "color"): "Hex opcional (ej: #a3e635)",
    ("subjects", "createdAt"): "ISO 8601 UTC",
    ("notes", "id"): "UUID v4 generado en cliente",
    ("notes", "title"): "Título explícito opcional; el H1 inicial se usa solo como fallback y “Sin título” como valor final",
    ("notes", "content"): "Markdown puro, sin límite de tamaño",
    ("notes", "pinned"): "0 = normal | 1 = fijada al tope",
    ("notes", "archived"): "0 = activa | 1 = archivada",
    ("notes", "subjectId"): "NULL = Entrada | UUID = en Materia o Sección",
    ("notes", "createdAt"): "ISO 8601 UTC · Inmutable",
    ("notes", "updatedAt"): "ISO 8601 UTC · Auto-actualizado en cada guardado",
    ("academic_events", "id"): "UUID v4 generado en cliente",
    ("academic_events", "type"): "parcial | final | tp | exposicion",
    ("academic_events", "title"): "Descripción breve opcional",
    ("academic_events", "date"): "Fecha ISO local YYYY-MM-DD",
    ("academic_events", "subjectId"): "NULL = sin materia | UUID = Materia o Sección asociada",
    ("academic_events", "createdAt"): "ISO 8601 UTC · Inmutable",
    ("academic_events", "updatedAt"): "ISO 8601 UTC · Auto-actualizado al editar",
    ("metadata", "key"): "Identificador de propiedad (ej: indexeddb_migrated)",
    ("metadata", "value"): "Valor de la propiedad",
}

RELATION_NOTES = {
    ("notes", "subjectId"): {
        "description": "NOTA pertenece a una MATERIA o SECCIÓN (N:1)",
        "delete": "ON DELETE SET NULL → si se elimina la materia, la nota vuelve a Entrada",
    },
    ("subjects", "parentSubjectId"): {
        "description": "SECCIÓN es hija de una MATERIA (N:1, auto-referencial)",
        "delete": "ON DELETE CASCADE → si se elimina la materia, sus secciones se eliminan",
    },
    ("academic_events", "subjectId"): {
        "description": "FECHA ACADÉMICA puede asociarse a una MATERIA o SECCIÓN (N:1)",
        "delete": "ON DELETE SET NULL → si se elimina la materia, la fecha sobrevive sin materia",
    },
}


def relative_path(path):
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def read_text(path):
    try:
        return path.read_text(encoding="utf-8")
    except OSError as exc:
        raise RuntimeError(
            "No se pudo leer {0}: {1}".format(relative_path(path), exc)
        )


def write_text(path, content):
    try:
        path.write_text(content, encoding="utf-8")
    except OSError as exc:
        raise RuntimeError(
            "No se pudo escribir {0}: {1}".format(relative_path(path), exc)
        )


def strip_js_string_quotes(value):
    return value[1:-1]


def extract_js_sql(text):
    strings = []

    for match in JS_STRING_RE.finditer(text):
        strings.append(strip_js_string_quotes(match.group(0)))

    return "\n".join(strings)


def strip_sql_comments(text):
    return re.sub(r"--[^\n\r]*", "", text)


def find_matching_parenthesis(text, start_index):
    depth = 0

    for index in range(start_index, len(text)):
        char = text[index]

        if char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
            if depth == 0:
                return index

    return -1


def split_top_level_commas(text):
    parts = []
    start = 0
    depth = 0

    for index, char in enumerate(text):
        if char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        elif char == "," and depth == 0:
            parts.append(text[start:index].strip())
            start = index + 1

    final_part = text[start:].strip()
    if final_part:
        parts.append(final_part)

    return parts


def split_sql_tokens(text):
    tokens = []
    current = []
    depth = 0

    for char in text.strip().rstrip(";"):
        if char == "(":
            depth += 1
            current.append(char)
        elif char == ")":
            depth -= 1
            current.append(char)
        elif char.isspace() and depth == 0:
            if current:
                tokens.append("".join(current))
                current = []
        else:
            current.append(char)

    if current:
        tokens.append("".join(current))

    return tokens


def clean_identifier(value):
    return value.strip().strip('"`[]')


def normalize_type(type_tokens):
    return " ".join(token.upper() for token in type_tokens)


def parse_reference(value):
    match = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)(?:\(([A-Za-z_][A-Za-z0-9_]*)\))?$", value)
    if not match:
        return None, None

    return match.group(1), match.group(2) or "id"


def parse_column_definition(definition):
    tokens = split_sql_tokens(definition)
    if len(tokens) < 2:
        return None

    column_name = clean_identifier(tokens[0])
    if column_name.upper() in TABLE_CONSTRAINTS:
        return None

    type_tokens = []
    constraint_start = len(tokens)
    for index, token in enumerate(tokens[1:], 1):
        if token.upper() in CONSTRAINT_KEYWORDS:
            constraint_start = index
            break
        type_tokens.append(token)

    if not type_tokens:
        return None

    column = {
        "name": column_name,
        "type": normalize_type(type_tokens),
        "pk": False,
        "not_null": False,
        "default": None,
        "ref_table": None,
        "ref_column": None,
        "on_delete": None,
    }

    constraints = tokens[constraint_start:]
    index = 0
    while index < len(constraints):
        token = constraints[index].upper()

        if token == "PRIMARY" and index + 1 < len(constraints) and constraints[index + 1].upper() == "KEY":
            column["pk"] = True
            index += 2
            continue

        if token == "NOT" and index + 1 < len(constraints) and constraints[index + 1].upper() == "NULL":
            column["not_null"] = True
            index += 2
            continue

        if token == "DEFAULT" and index + 1 < len(constraints):
            column["default"] = constraints[index + 1]
            index += 2
            continue

        if token == "REFERENCES" and index + 1 < len(constraints):
            ref_table, ref_column = parse_reference(constraints[index + 1])
            column["ref_table"] = ref_table
            column["ref_column"] = ref_column
            index += 2
            continue

        if token == "ON" and index + 2 < len(constraints) and constraints[index + 1].upper() == "DELETE":
            action_tokens = [constraints[index + 2].upper()]
            if constraints[index + 2].upper() == "SET" and index + 3 < len(constraints):
                action_tokens.append(constraints[index + 3].upper())
                index += 4
            else:
                index += 3
            column["on_delete"] = " ".join(action_tokens)
            continue

        index += 1

    return column


def ensure_table(schema, table_name):
    if table_name not in schema:
        schema[table_name] = {
            "name": table_name,
            "columns": [],
            "column_names": set(),
        }


def add_column(schema, table_name, column):
    ensure_table(schema, table_name)

    if column["name"] in schema[table_name]["column_names"]:
        return

    schema[table_name]["columns"].append(column)
    schema[table_name]["column_names"].add(column["name"])


def parse_create_tables(sql_text, schema, table_order):
    for match in CREATE_TABLE_RE.finditer(sql_text):
        table_name = match.group(1)
        body_start = match.end() - 1
        body_end = find_matching_parenthesis(sql_text, body_start)

        if body_end == -1:
            raise RuntimeError("No se pudo cerrar CREATE TABLE de '{0}'".format(table_name))

        if table_name not in schema:
            table_order.append(table_name)
        ensure_table(schema, table_name)

        body = sql_text[body_start + 1:body_end]
        for definition in split_top_level_commas(body):
            column = parse_column_definition(definition)
            if column:
                add_column(schema, table_name, column)


def parse_alter_add_columns(sql_text, schema, table_order):
    for match in ALTER_ADD_COLUMN_RE.finditer(sql_text):
        table_name = match.group(1)
        column = parse_column_definition(match.group(2))
        if not column:
            continue

        if table_name not in schema:
            table_order.append(table_name)
        add_column(schema, table_name, column)


def parse_schema(sql_text):
    schema = {}
    table_order = []
    sql_text = strip_sql_comments(sql_text)

    parse_create_tables(sql_text, schema, table_order)
    parse_alter_add_columns(sql_text, schema, table_order)

    return [schema[table_name] for table_name in table_order]


def dbml_quote(value):
    return value.replace("\\", "\\\\").replace('"', '\\"')


def get_generated_date():
    if DBML_PATH.exists():
        existing_content = read_text(DBML_PATH)
        match = GENERATED_DATE_RE.search(existing_content)
        if match:
            return match.group(1)

    return date.today().isoformat()


def column_note(table_name, column_name):
    return COLUMN_NOTES.get((table_name, column_name))


def dbml_column_attributes(table_name, column):
    attributes = []

    if column["pk"]:
        attributes.append("pk")
    if column["not_null"] and not column["pk"]:
        attributes.append("not null")
    if column["default"] is not None:
        attributes.append("default: {0}".format(column["default"]))

    note = column_note(table_name, column["name"])
    if note:
        attributes.append('note: "{0}"'.format(dbml_quote(note)))

    if not attributes:
        return ""

    return " [{0}]".format(", ".join(attributes))


def collect_refs(tables):
    refs = []

    for table in tables:
        for column in table["columns"]:
            if not column["ref_table"] or not column["ref_column"]:
                continue
            refs.append({
                "table": table["name"],
                "column": column["name"],
                "ref_table": column["ref_table"],
                "ref_column": column["ref_column"],
                "on_delete": column["on_delete"],
            })

    refs.sort(key=lambda ref: (ref["table"] == ref["ref_table"], ref["table"], ref["column"]))
    return refs


def generate_table_dbml(table):
    lines = ["Table {0} {{".format(table["name"])]
    max_name_length = max(len(column["name"]) for column in table["columns"])
    max_type_length = max(len(column["type"]) for column in table["columns"])

    for column in table["columns"]:
        lines.append(
            "  {0:<{name_width}} {1:<{type_width}}{2}".format(
                column["name"],
                column["type"],
                dbml_column_attributes(table["name"], column),
                name_width=max_name_length,
                type_width=max_type_length,
            ).rstrip()
        )

    table_note = TABLE_NOTES.get(table["name"])
    if table_note:
        lines.append("")
        lines.append('  note: "{0}"'.format(dbml_quote(table_note)))

    lines.append("}")
    return "\n".join(lines)


def generate_header(generated_date):
    return "\n".join([
        "// ═══════════════════════════════════════════════════",
        "// Lumapse — Modelo Lógico Relacional",
        "// Generado automáticamente desde src/services/sqlite/connection.js",
        '// PP3 · IES 6023 "Dr. Alfredo Loutaif" · 2026',
        "// Motor: SQLite · Herramienta: dbdiagram.io",
        "// Fecha de generación: {0}".format(generated_date),
        "// ═══════════════════════════════════════════════════",
        "//",
        "// Instrucciones para regenerar:",
        "//   python3 scripts/generate-dbml-from-code.py",
        "//",
        "// Verificación sin sobrescribir (CI):",
        "//   python3 scripts/generate-dbml-from-code.py --check",
        "//",
        '// Nota: La tabla "metadata" aparece sin relaciones porque es',
        "// una tabla técnica de sistema (clave-valor) para control de",
        "// migraciones y flags internos. No pertenece al dominio del",
        "// negocio, pero se incluye por completitud del modelo físico.",
        "// ═══════════════════════════════════════════════════",
    ])


def generate_refs_dbml(refs):
    lines = [
        "// ═══════════════════════════════════════════════════",
        "// RELACIONES",
        "// ═══════════════════════════════════════════════════",
    ]

    for ref in refs:
        relation_note = RELATION_NOTES.get((ref["table"], ref["column"]), {})
        if relation_note.get("description"):
            lines.append("// {0}".format(relation_note["description"]))
        if relation_note.get("delete"):
            lines.append("// {0}".format(relation_note["delete"]))
        elif ref["on_delete"]:
            lines.append("// ON DELETE {0}".format(ref["on_delete"]))
        lines.append(
            "Ref: {0}.{1} > {2}.{3}".format(
                ref["table"],
                ref["column"],
                ref["ref_table"],
                ref["ref_column"],
            )
        )
        lines.append("")

    return "\n".join(lines).rstrip()


def generate_dbml(tables):
    refs = collect_refs(tables)
    parts = [generate_header(get_generated_date())]

    for table in tables:
        parts.append(generate_table_dbml(table))

    parts.append(generate_refs_dbml(refs))
    return "\n\n".join(parts).rstrip() + "\n"


def print_header():
    print("🔄 Lumapse — Generador DBML desde Código")
    print("==================================================")


def parse_code_schema():
    js_text = read_text(SQLITE_SERVICE_PATH)
    tables = parse_schema(extract_js_sql(js_text))
    if not tables:
        raise RuntimeError("No se encontraron tablas en {0}".format(relative_path(SQLITE_SERVICE_PATH)))
    return tables


def count_columns(tables):
    return sum(len(table["columns"]) for table in tables)


def main(argv):
    check_mode = False

    if len(argv) > 2 or (len(argv) == 2 and argv[1] != "--check"):
        print("Uso: python3 scripts/generate-dbml-from-code.py [--check]", file=sys.stderr)
        return 2

    if len(argv) == 2:
        check_mode = True

    print_header()

    try:
        print("📥 Parseando sqlite/connection.js...")
        tables = parse_code_schema()
        for table in tables:
            print("   ✓ {0}: {1} columnas".format(table["name"], len(table["columns"])))

        dbml = generate_dbml(tables)
        refs = collect_refs(tables)

        if check_mode:
            print("🔍 Comparando: {0}".format(relative_path(DBML_PATH)))
            existing = read_text(DBML_PATH)
            print("==================================================")
            if existing == dbml:
                print(
                    "✅ DBML sincronizado ({0} tablas, {1} columnas, {2} relaciones)".format(
                        len(tables),
                        count_columns(tables),
                        len(refs),
                    )
                )
                print("==================================================")
                return 0

            print("❌ DBML desactualizado. Ejecutar: python3 scripts/generate-dbml-from-code.py")
            print("==================================================")
            return 1

        print("💾 Escribiendo: {0}".format(relative_path(DBML_PATH)))
        write_text(DBML_PATH, dbml)
    except RuntimeError as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1

    print("==================================================")
    print(
        "✅ DBML generado ({0} tablas, {1} columnas, {2} relaciones)".format(
            len(tables),
            count_columns(tables),
            len(refs),
        )
    )
    print("==================================================")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
