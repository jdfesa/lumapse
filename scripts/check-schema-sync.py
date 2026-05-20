#!/usr/bin/env python3
"""
Lumapse — Sincronización Schema ↔ Documentación
Compara el DDL real en SqliteService.js contra 04-modelo-fisico-ddl.md.
Uso: python3 scripts/check-schema-sync.py
"""

import os
import re
import sys
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SQLITE_SERVICE_PATH = PROJECT_ROOT / "src" / "services" / "SqliteService.js"
DDL_DOC_PATH = PROJECT_ROOT / "docs" / "diagramas" / "database" / "04-modelo-fisico-ddl.md"

JS_STRING_RE = re.compile(
    r"`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"",
    re.DOTALL,
)
SQL_FENCE_RE = re.compile(r"```sql\s*(.*?)```", re.IGNORECASE | re.DOTALL)
CREATE_TABLE_RE = re.compile(
    r"\bCREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(",
    re.IGNORECASE,
)
ALTER_ADD_COLUMN_RE = re.compile(
    r"\bALTER\s+TABLE\s+([A-Za-z_][A-Za-z0-9_]*)\s+ADD\s+COLUMN\s+(.+?)(?:;|$)",
    re.IGNORECASE | re.MULTILINE,
)
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


def strip_js_string_quotes(value):
    return value[1:-1]


def extract_js_sql(text):
    strings = []

    for match in JS_STRING_RE.finditer(text):
        strings.append(strip_js_string_quotes(match.group(0)))

    return "\n".join(strings)


def extract_markdown_sql(text):
    return "\n".join(match.group(1) for match in SQL_FENCE_RE.finditer(text))


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


def parse_column_definition(definition):
    tokens = split_sql_tokens(definition)
    if len(tokens) < 2:
        return None

    column = clean_identifier(tokens[0])
    if column.upper() in TABLE_CONSTRAINTS:
        return None

    type_tokens = []
    for token in tokens[1:]:
        if token.upper() in CONSTRAINT_KEYWORDS:
            break
        type_tokens.append(token)

    if not type_tokens:
        return None

    return column, normalize_type(type_tokens)


def add_column(schema, table, column, column_type):
    schema.setdefault(table, {})
    if column not in schema[table]:
        schema[table][column] = column_type


def parse_create_tables(sql_text, schema):
    for match in CREATE_TABLE_RE.finditer(sql_text):
        table = match.group(1)
        body_start = match.end() - 1
        body_end = find_matching_parenthesis(sql_text, body_start)

        if body_end == -1:
            continue

        schema.setdefault(table, {})
        body = sql_text[body_start + 1:body_end]
        for definition in split_top_level_commas(body):
            parsed = parse_column_definition(definition)
            if not parsed:
                continue
            column, column_type = parsed
            add_column(schema, table, column, column_type)


def parse_alter_add_columns(sql_text, schema):
    for match in ALTER_ADD_COLUMN_RE.finditer(sql_text):
        table = match.group(1)
        parsed = parse_column_definition(match.group(2))
        if not parsed:
            continue
        column, column_type = parsed
        add_column(schema, table, column, column_type)


def parse_schema(sql_text):
    schema = {}
    sql_text = strip_sql_comments(sql_text)

    parse_create_tables(sql_text, schema)
    parse_alter_add_columns(sql_text, schema)

    return schema


def compare_schemas(code_schema, docs_schema):
    differences = []

    code_tables = set(code_schema.keys())
    docs_tables = set(docs_schema.keys())

    for table in sorted(code_tables - docs_tables):
        differences.append(
            "❌ Tabla '{0}' existe en código pero NO en documentación".format(table)
        )

    for table in sorted(docs_tables - code_tables):
        differences.append(
            "❌ Tabla '{0}' existe en documentación pero NO en código".format(table)
        )

    for table in sorted(code_tables & docs_tables):
        code_columns = code_schema[table]
        docs_columns = docs_schema[table]

        for column in sorted(set(code_columns.keys()) - set(docs_columns.keys())):
            differences.append(
                "❌ Tabla '{0}': columna '{1}' existe en código pero NO en documentación".format(
                    table,
                    column,
                )
            )

        for column in sorted(set(docs_columns.keys()) - set(code_columns.keys())):
            differences.append(
                "❌ Tabla '{0}': columna '{1}' existe en documentación pero NO en código".format(
                    table,
                    column,
                )
            )

        for column in sorted(set(code_columns.keys()) & set(docs_columns.keys())):
            code_type = code_columns[column]
            docs_type = docs_columns[column]
            if code_type == docs_type:
                continue

            differences.append(
                "⚠️  Tabla '{0}': tipo de '{1}' difiere — código: {2}, docs: {3}".format(
                    table,
                    column,
                    code_type,
                    docs_type,
                )
            )

    return differences


def print_header():
    print("🔄 Lumapse — Sincronización Schema ↔ Documentación")
    print("==================================================")


def main():
    print_header()

    try:
        js_text = read_text(SQLITE_SERVICE_PATH)
        docs_text = read_text(DDL_DOC_PATH)
    except RuntimeError as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1

    code_schema = parse_schema(extract_js_sql(js_text))
    docs_schema = parse_schema(extract_markdown_sql(docs_text))
    differences = compare_schemas(code_schema, docs_schema)

    for difference in differences:
        print(difference)

    print("==================================================")

    if differences:
        print(
            "❌ Schema y documentación NO están sincronizados ({0} diferencias)".format(
                len(differences)
            )
        )
        print("==================================================")
        return 1

    print("✅ Schema y documentación están sincronizados (0 diferencias)")
    print("==================================================")
    return 0


if __name__ == "__main__":
    sys.exit(main())
