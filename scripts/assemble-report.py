#!/usr/bin/env python3
"""
Lumapse — Ensamblador de Informe Final
Ensambla los capítulos de docs/informe-final/ en un Markdown unificado.
Uso: python3 scripts/assemble-report.py
"""

import json
import os
import re
import sys
from datetime import date
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REPORT_DIR = PROJECT_ROOT / "docs" / "informe-final"
OUTPUT_PATH = REPORT_DIR / "INFORME-FINAL-COMPLETO.md"
METADATA_PATH = REPORT_DIR / "report-metadata.json"
CHAPTER_FILENAMES = [
    "01-introduccion.md",
    "02-marco-metodologico.md",
    "03-relevamiento-datos.md",
    "04-arquitectura-diseno.md",
    "05-desarrollo-implementacion.md",
    "06-pruebas-validacion.md",
    "07-conclusiones.md",
    "08-referencias.md",
]

HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$")
FENCE_RE = re.compile(r"^\s*```")
MARKDOWN_LINK_RE = re.compile(r"(\[[^\]]+\]\()([^)]+)(\))")


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


def read_metadata():
    try:
        metadata = json.loads(read_text(METADATA_PATH))
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Metadatos inválidos en {0}: {1}".format(relative_path(METADATA_PATH), exc)
        ) from exc

    required = (
        "status",
        "document_cutoff_date",
        "functional_scope",
        "functional_tag",
        "functional_commit",
        "technical_ref",
        "technical_commit",
    )
    missing = [key for key in required if not metadata.get(key)]
    if missing:
        raise RuntimeError(
            "Faltan metadatos requeridos en {0}: {1}".format(
                relative_path(METADATA_PATH), ", ".join(missing)
            )
        )

    return metadata


def read_chapters():
    chapters = []

    for index, filename in enumerate(CHAPTER_FILENAMES, 1):
        path = REPORT_DIR / filename
        content = read_text(path)
        size = len(content.encode("utf-8"))
        print(
            "   [{0}/{1}] {2} ({3} bytes)".format(
                index,
                len(CHAPTER_FILENAMES),
                filename,
                size,
            )
        )
        chapters.append({
            "filename": filename,
            "path": path,
            "content": content,
            "size": size,
        })

    return chapters


def strip_heading_markup(text):
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"[*_~]", "", text)
    return text.strip()


def slugify(text):
    text = strip_heading_markup(text).lower()
    text = re.sub(r"\s+#+\s*$", "", text).strip()
    chars = []

    for char in text:
        if char.isalnum() or char == "-":
            chars.append(char)
        elif char.isspace():
            chars.append("-")

    return "".join(chars).strip("-")


def unique_anchor(title, seen):
    base = slugify(title)
    count = seen.get(base, 0)
    seen[base] = count + 1

    if count == 0:
        return base

    return "{0}-{1}".format(base, count)


def iter_headings(content):
    in_fence = False

    for line in content.splitlines():
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue

        if in_fence:
            continue

        match = HEADING_RE.match(line)
        if not match:
            continue

        level = len(match.group(1))
        title = match.group(2).strip()
        yield level, title


def collect_anchors(chapters):
    seen = {}
    toc_entries = []
    chapter_anchors = {}

    unique_anchor("Informe Final — Lumapse", seen)
    unique_anchor("Tabla de Contenidos", seen)

    for chapter in chapters:
        for level, title in iter_headings(chapter["content"]):
            anchor = unique_anchor(title, seen)

            if level == 1 and chapter["filename"] not in chapter_anchors:
                chapter_anchors[chapter["filename"]] = anchor

            if level in (1, 2, 3):
                toc_entries.append({
                    "level": level,
                    "title": title,
                    "anchor": anchor,
                })

    return toc_entries, chapter_anchors


def normalize_chapter_target(target):
    path_part, separator, fragment = target.partition("#")

    if path_part.startswith("./"):
        path_part = path_part[2:]

    if "/" in path_part or "\\" in path_part:
        return None

    if path_part not in CHAPTER_FILENAMES:
        return None

    if separator:
        fragment = fragment.strip()
        if fragment:
            return slugify(fragment)

    return path_part


def fix_chapter_links(content, chapter_anchors):
    def replace_link(match):
        prefix, target, suffix = match.groups()
        normalized = normalize_chapter_target(target)

        if not normalized:
            return match.group(0)

        if normalized in CHAPTER_FILENAMES:
            anchor = chapter_anchors.get(normalized)
        else:
            anchor = normalized

        if not anchor:
            return match.group(0)

        return "{0}#{1}{2}".format(prefix, anchor, suffix)

    return MARKDOWN_LINK_RE.sub(replace_link, content)


def generate_toc(toc_entries):
    lines = []

    for entry in toc_entries:
        indent = "  " * (entry["level"] - 1)
        lines.append(
            "{0}- [{1}](#{2})".format(
                indent,
                entry["title"],
                entry["anchor"],
            )
        )

    return "\n".join(lines)


def build_header(metadata, assembled_date):
    return "\n".join([
        "# Informe Final — Lumapse",
        "",
        "| Campo | Valor |",
        "|---|---|",
        "| Alumno | José David Sandoval |",
        "| Carrera | Tecnicatura en Análisis de Sistemas y Desarrollo de Software |",
        '| Institución | IES 6023 "Dr. Alfredo Loutaif" |',
        "| Materia | Prácticas Profesionalizantes III |",
        "| Año | 2026 |",
        "| Estado | {0} |".format(metadata["status"]),
        "| Alcance funcional | {0} (`{1}` / `{2}`) |".format(
            metadata["functional_scope"],
            metadata["functional_tag"],
            metadata["functional_commit"],
        ),
        "| Fuente técnica auditada | `{0}` @ `{1}` |".format(
            metadata["technical_ref"],
            metadata["technical_commit"],
        ),
        "| Corte documental | {0} |".format(metadata["document_cutoff_date"]),
        "| Ensamblado automáticamente | {0} |".format(assembled_date),
    ])


def assemble_document(chapters, toc_entries, chapter_anchors, metadata):
    fixed_chapters = [
        fix_chapter_links(chapter["content"], chapter_anchors).strip()
        for chapter in chapters
    ]

    parts = [
        build_header(metadata, date.today().isoformat()),
        "---",
        "## Tabla de Contenidos\n\n{0}".format(generate_toc(toc_entries)),
        "---",
        "\n\n---\n\n".join(fixed_chapters),
    ]

    return "\n\n".join(parts).rstrip() + "\n"


def print_header():
    print("📄 Lumapse — Ensamblador de Informe Final")
    print("==================================================")


def main():
    print_header()

    try:
        print("📥 Leyendo capítulos...")
        metadata = read_metadata()
        chapters = read_chapters()

        toc_entries, chapter_anchors = collect_anchors(chapters)
        print(
            "📝 Generando tabla de contenidos ({0} entradas)...".format(
                len(toc_entries)
            )
        )

        print("🔗 Corrigiendo links inter-capítulo...")
        content = assemble_document(chapters, toc_entries, chapter_anchors, metadata)

        print("💾 Escribiendo: {0}".format(relative_path(OUTPUT_PATH)))
        write_text(OUTPUT_PATH, content)
    except RuntimeError as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1

    print("==================================================")
    print(
        "✅ Informe ensamblado: {0} capítulos, {1:,} bytes".format(
            len(chapters),
            len(content.encode("utf-8")),
        )
    )
    print("==================================================")
    return 0


if __name__ == "__main__":
    sys.exit(main())
