#!/usr/bin/env python3
"""
Lumapse — Cheat Sheet de Defensa
Genera una hoja de defensa con métricas y decisiones clave del proyecto.
Uso: python3 scripts/generate-defense-cheatsheet.py
"""

import os
import re
import sys
from datetime import date
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUTPUT_PATH = PROJECT_ROOT / "docs" / "gestion" / "cheatsheet-defensa.md"
RF_PATH = PROJECT_ROOT / "docs" / "producto" / "requisitos-funcionales.md"
HU_PATH = PROJECT_ROOT / "docs" / "producto" / "historias-de-usuario.md"
PRODUCT_DECISIONS_PATH = PROJECT_ROOT / "docs" / "producto" / "decisiones-producto.md"
DDL_PATH = PROJECT_ROOT / "docs" / "diagramas" / "database" / "04-modelo-fisico-ddl.md"
CHANGELOG_PATH = PROJECT_ROOT / "CHANGELOG.md"
ADR_DIR = PROJECT_ROOT / "docs" / "adr"
SRC_DIR = PROJECT_ROOT / "src"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"

CODE_EXTENSIONS = {".js", ".ts", ".css"}
RF_RE = re.compile(r"\bRF-\d{3}\b")
HU_RE = re.compile(r"^HU-\d{3}$")
ADR_HEADING_RE = re.compile(r"^#\s+(ADR-\d{3}):\s+(.+?)\s*$", re.MULTILINE)
ADR_STATUS_RE = re.compile(r"^\*\*Estado:\*\*\s+(.+?)\s*$", re.MULTILINE)
DP_HEADING_RE = re.compile(r"^##\s+(DP-\d{3}):\s+(.+?)\s*$", re.MULTILINE)
CHANGELOG_VERSION_RE = re.compile(r"^##\s+\[([^\]]+)\]\s+—\s+([^—]+)\s+—\s+(.+?)\s*$")
SQL_FENCE_RE = re.compile(r"```sql\s*(.*?)```", re.IGNORECASE | re.DOTALL)
CREATE_TABLE_RE = re.compile(
    r"\bCREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(",
    re.IGNORECASE,
)
GENERATED_DATE_RE = re.compile(r"^\*\*Generado automáticamente:\*\*\s+(\d{4}-\d{2}-\d{2})\s*$", re.MULTILINE)
TABLE_CONSTRAINTS = {"PRIMARY", "FOREIGN", "UNIQUE", "CHECK", "CONSTRAINT"}


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


def iter_files(directory, extensions=None):
    if not directory.exists():
        return []

    files = []
    for path in directory.rglob("*"):
        if not path.is_file():
            continue
        if extensions and path.suffix.lower() not in extensions:
            continue
        files.append(path)

    return sorted(files)


def strip_markdown(value):
    value = value.strip()
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"\*\*(.*?)\*\*", r"\1", value)
    value = re.sub(r"~~(.*?)~~", r"\1", value)
    return value.replace("`", "").strip()


def split_table_row(line):
    return [strip_markdown(cell) for cell in line.strip().strip("|").split("|")]


def count_source_lines(files):
    total = 0

    for path in files:
        for line in read_text(path).splitlines():
            if line.strip():
                total += 1

    return total


def parse_requirements():
    rf_rows = []
    counts_by_status = {}

    for line in read_text(RF_PATH).splitlines():
        stripped = line.strip()
        if not stripped.startswith("| RF-"):
            continue

        cells = split_table_row(stripped)
        if len(cells) < 6 or not RF_RE.match(cells[0]):
            continue

        status = cells[5]
        if status.startswith("Obsoleto"):
            status = "Obsoleto"

        counts_by_status[status] = counts_by_status.get(status, 0) + 1
        rf_rows.append({
            "id": cells[0],
            "status": status,
        })

    return {
        "total": len(rf_rows),
        "by_status": counts_by_status,
    }


def parse_user_stories():
    hu_rows = []

    for line in read_text(HU_PATH).splitlines():
        stripped = line.strip()
        if not stripped.startswith("| HU-"):
            continue

        cells = split_table_row(stripped)
        if len(cells) < 6 or not HU_RE.match(cells[0]):
            continue

        try:
            story_points = int(cells[4])
        except ValueError:
            continue

        hu_rows.append({
            "id": cells[0],
            "sp": story_points,
            "hito": cells[5],
        })

    return {
        "total": len(hu_rows),
        "story_points": sum(row["sp"] for row in hu_rows),
    }


def parse_adrs():
    adrs = []

    for path in sorted(ADR_DIR.glob("ADR-*.md")):
        content = read_text(path)
        heading = ADR_HEADING_RE.search(content)
        status = ADR_STATUS_RE.search(content)

        if not heading:
            continue

        adrs.append({
            "id": heading.group(1),
            "title": heading.group(2),
            "status": strip_markdown(status.group(1)) if status else "Sin estado",
            "path": path,
            "decision": extract_section(content, "Decisión"),
        })

    return adrs


def extract_section(content, heading):
    pattern = re.compile(r"^##+\s+{0}\s*$".format(re.escape(heading)), re.MULTILINE)
    match = pattern.search(content)
    if not match:
        return ""

    start = match.end()
    next_heading = re.search(r"^##+\s+", content[start:], re.MULTILINE)
    end = start + next_heading.start() if next_heading else len(content)
    return content[start:end].strip()


def first_sentence(text, fallback="Sin resumen disponible"):
    paragraphs = [
        paragraph.strip()
        for paragraph in re.split(r"\n\s*\n", text)
        if paragraph.strip()
    ]
    text = ""

    for paragraph in paragraphs:
        if re.match(r"^\s*(?:[-*]|\d+\.)\s+", paragraph):
            continue
        text = paragraph
        break

    text = strip_markdown(text)
    text = re.sub(r"^\s*[-*]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s+", " ", text).strip()

    if not text:
        return fallback

    if ":" in text:
        before_colon = text.split(":", 1)[0].strip()
        if len(before_colon) >= 50:
            return before_colon

    match = re.search(r"(.+?[.!?])(?:\s|$)", text)
    if match:
        sentence = match.group(1).strip()
        remaining = text[match.end():].strip()
        second_match = re.search(r"(.+?[.!?])(?:\s|$)", remaining)
        if len(sentence) < 35 and second_match:
            return "{0} {1}".format(sentence, second_match.group(1).strip())
        return sentence

    return text[:140].rstrip()


def parse_product_decisions():
    content = read_text(PRODUCT_DECISIONS_PATH)
    matches = list(DP_HEADING_RE.finditer(content))
    decisions = []

    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(content)
        block = content[start:end]

        status_match = re.search(r"^\*\*Estado:\*\*\s+(.+?)\s*$", block, re.MULTILINE)
        decision_text = extract_section(block, "Decisión")
        justification_text = extract_section(block, "Justificación")

        decisions.append({
            "id": match.group(1),
            "title": match.group(2),
            "status": strip_markdown(status_match.group(1)) if status_match else "Sin estado",
            "summary": first_sentence(decision_text or justification_text),
        })

    return decisions


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


def parse_database_shape():
    content = read_text(DDL_PATH)
    sql_text = "\n".join(match.group(1) for match in SQL_FENCE_RE.finditer(content))
    sql_text = re.sub(r"--[^\n\r]*", "", sql_text)
    tables = []
    total_columns = 0

    for match in CREATE_TABLE_RE.finditer(sql_text):
        table_name = match.group(1)
        body_start = match.end() - 1
        body_end = find_matching_parenthesis(sql_text, body_start)
        if body_end == -1:
            continue

        columns = []
        for definition in split_top_level_commas(sql_text[body_start + 1:body_end]):
            tokens = definition.split()
            if len(tokens) < 2:
                continue
            if tokens[0].upper() in TABLE_CONSTRAINTS:
                continue
            columns.append(tokens[0].strip('"`[]'))

        tables.append({
            "name": table_name,
            "columns": columns,
        })
        total_columns += len(columns)

    return {
        "tables": tables,
        "table_count": len(tables),
        "column_count": total_columns,
    }


def parse_changelog_versions():
    versions = []
    current = None

    for line in read_text(CHANGELOG_PATH).splitlines():
        version_match = CHANGELOG_VERSION_RE.match(line.strip())
        if version_match:
            current = {
                "version": version_match.group(1),
                "date": version_match.group(2).strip(),
                "title": version_match.group(3).strip(),
                "highlights": [],
            }
            versions.append(current)
            continue

        if not current or len(current["highlights"]) >= 3:
            continue

        bullet = line.strip()
        if not bullet.startswith("- "):
            continue

        bold_match = re.match(r"-\s+\*\*(.+?):\*\*", bullet)
        if bold_match:
            current["highlights"].append(strip_markdown(bold_match.group(1)))
        else:
            current["highlights"].append(strip_markdown(bullet[2:]).split(".")[0])

    return versions


def count_scripts():
    return len([
        path for path in SCRIPTS_DIR.iterdir()
        if path.is_file() and path.suffix in (".py", ".sh")
    ])


def format_number(value):
    return "{:,}".format(value)


def get_generated_date():
    if OUTPUT_PATH.exists():
        content = read_text(OUTPUT_PATH)
        match = GENERATED_DATE_RE.search(content)
        if match:
            return match.group(1)

    return date.today().isoformat()


def key_decisions(adrs, product_decisions):
    decisions_by_id = {decision["id"]: decision for decision in product_decisions}
    adrs_by_id = {adr["id"]: adr for adr in adrs}
    rows = []

    for adr_id in ("ADR-006", "ADR-005"):
        adr = adrs_by_id.get(adr_id)
        if adr:
            rows.append({
                "decision": "{0} — {1}".format(adr_id, adr["title"]),
                "summary": first_sentence(adr["decision"]),
            })

    for decision_id in ("DP-003", "DP-004", "DP-001"):
        decision = decisions_by_id.get(decision_id)
        if decision:
            rows.append({
                "decision": "{0} — {1}".format(decision_id, decision["title"]),
                "summary": decision["summary"],
            })

    return rows


def build_markdown(context):
    rf = context["requirements"]
    hu = context["user_stories"]
    code = context["code"]
    db = context["database"]
    adrs = context["adrs"]
    versions = context["versions"]
    decisions = key_decisions(adrs, context["product_decisions"])

    implemented = rf["by_status"].get("Implementado", 0)
    pending = rf["by_status"].get("Pendiente", 0)
    obsolete = rf["by_status"].get("Obsoleto", 0)

    lines = [
        "# Cheat Sheet de Defensa — Lumapse",
        "**Generado automáticamente:** {0}".format(get_generated_date()),
        "",
        "## Métricas del Proyecto",
        "",
        "| Métrica | Valor |",
        "|---|---|",
        "| Archivos de código (JS/TS/CSS) | {0} |".format(format_number(code["files"])),
        "| Líneas de código fuente | {0} |".format(format_number(code["loc"])),
        "| Requisitos Funcionales | {0} ({1} implementados, {2} pendientes, {3} obsoletos) |".format(
            rf["total"],
            implemented,
            pending,
            obsolete,
        ),
        "| Historias de Usuario | {0} |".format(hu["total"]),
        "| Story Points totales | {0} |".format(hu["story_points"]),
        "| ADRs documentados | {0} |".format(len(adrs)),
        "| Scripts de automatización | {0} |".format(context["scripts"]),
        "| Tablas en BD | {0} |".format(db["table_count"]),
        "| Columnas totales | {0} |".format(db["column_count"]),
        "",
        "## Decisiones Técnicas Clave",
        "",
        "| Decisión | Justificación corta |",
        "|---|---|",
    ]

    for decision in decisions:
        lines.append("| {0} | {1} |".format(decision["decision"], decision["summary"]))

    lines.extend([
        "",
        "## ADRs",
        "",
        "| # | Título | Estado |",
        "|---|---|---|",
    ])

    for adr in adrs:
        lines.append("| {0} | {1} | {2} |".format(adr["id"], adr["title"], adr["status"]))

    lines.extend([
        "",
        "## Versiones Publicadas",
        "",
        "| Versión | Fecha | Highlights |",
        "|---|---|---|",
    ])

    for version in versions:
        highlights = ", ".join(version["highlights"]) if version["highlights"] else version["title"]
        lines.append(
            "| {0} | {1} | {2} |".format(
                version["version"],
                version["date"],
                highlights,
            )
        )

    lines.extend([
        "",
        "## Preguntas Frecuentes del Tribunal",
        "",
        "- **¿Por qué no usás tags como eje principal?** → DP-002 y DP-004: el 69.2% prefiere carpetas por materia (P11), y la estructura Materia › Sección › Nota reduce decisiones en mobile.",
        "- **¿Por qué guardás el título si ya está en el contenido?** → DP-001: desnormalización intencional. Una prueba empírica con 5.000 notas demostró que reduce el uso de CPU un 55% al evitar parsear Markdown en cada render.",
        "- **¿Por qué no hay `ON UPDATE` en las FKs?** → Sección 4 del DDL: las PK son UUID v4 generadas en cliente e inmutables por diseño.",
        "- **¿Por qué Capacitor sobre PWA pura?** → ADR-005: APK nativo, hardware real, distribución directa y persistencia local más robusta.",
        "- **¿Por qué SQLite sobre IndexedDB?** → ADR-006: modelo relacional, FKs, consultas consistentes y tooling web/native unificado.",
        "",
        "## Fuentes",
        "",
        "- `docs/producto/requisitos-funcionales.md`",
        "- `docs/producto/historias-de-usuario.md`",
        "- `docs/producto/decisiones-producto.md`",
        "- `docs/adr/`",
        "- `CHANGELOG.md`",
        "- `docs/diagramas/database/04-modelo-fisico-ddl.md`",
        "- `src/`",
        "- `scripts/`",
        "",
    ])

    return "\n".join(lines)


def collect_context():
    source_files = iter_files(SRC_DIR, CODE_EXTENSIONS)

    return {
        "requirements": parse_requirements(),
        "user_stories": parse_user_stories(),
        "adrs": parse_adrs(),
        "versions": parse_changelog_versions(),
        "database": parse_database_shape(),
        "product_decisions": parse_product_decisions(),
        "scripts": count_scripts(),
        "code": {
            "files": len(source_files),
            "loc": count_source_lines(source_files),
        },
    }


def print_header():
    print("🧭 Lumapse — Generador de Cheat Sheet de Defensa")
    print("==================================================")


def main():
    print_header()

    try:
        print("📥 Recolectando métricas y decisiones...")
        context = collect_context()
        content = build_markdown(context)
        print("💾 Escribiendo: {0}".format(relative_path(OUTPUT_PATH)))
        write_text(OUTPUT_PATH, content)
    except RuntimeError as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1

    print("==================================================")
    print(
        "✅ Cheat sheet generado: {0} RF, {1} HU, {2} ADR, {3} scripts".format(
            context["requirements"]["total"],
            context["user_stories"]["total"],
            len(context["adrs"]),
            context["scripts"],
        )
    )
    print("==================================================")
    return 0


if __name__ == "__main__":
    sys.exit(main())
