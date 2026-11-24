#!/usr/bin/env python3
"""
Lumapse — Ensamblador de Informe Final
Ensambla los capítulos de docs/informe-final/ en un Markdown unificado.
Uso: python3 scripts/assemble-report.py
     python3 scripts/assemble-report.py --check
"""

import argparse
import json
import os
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import unquote


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REPORT_DIR = PROJECT_ROOT / "docs" / "informe-final"
OUTPUT_PATH = REPORT_DIR / "informe-final-completo.md"
METADATA_PATH = REPORT_DIR / "report-metadata.json"
PRESENTATION_PATH = REPORT_DIR / "00-presentacion-institucional.md"
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
FENCE_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")
MARKDOWN_LINK_RE = re.compile(r"(?<!!)(\[[^\]]+\]\()([^)]+)(\))")
IMAGE_RE = re.compile(r"!\[[^\]\n]*\]\(([^)\n]+)\)")


def relative_path(path):
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def read_text(path):
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
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
    if not isinstance(metadata, dict):
        raise RuntimeError("Los metadatos deben ser un objeto JSON.")

    missing = [
        key for key in required
        if not isinstance(metadata.get(key), str) or not metadata[key].strip()
    ]
    if missing:
        raise RuntimeError(
            "Faltan metadatos requeridos en {0}: {1}".format(
                relative_path(METADATA_PATH), ", ".join(missing)
            )
        )

    try:
        cutoff = date.fromisoformat(metadata["document_cutoff_date"])
    except ValueError as exc:
        raise RuntimeError("El corte documental debe ser una fecha AAAA-MM-DD válida.") from exc
    if cutoff.isoformat() != metadata["document_cutoff_date"]:
        raise RuntimeError("El corte documental debe usar el formato AAAA-MM-DD.")
    if any("-->" in metadata[key] or "\n" in metadata[key] for key in required):
        raise RuntimeError("Los metadatos deben contener valores de una sola línea.")

    return metadata


def read_presentation():
    content = read_text(PRESENTATION_PATH)
    if not content.strip():
        raise RuntimeError("La presentación institucional está vacía.")
    return content


def read_chapters():
    chapters = []

    for index, filename in enumerate(CHAPTER_FILENAMES, 1):
        path = REPORT_DIR / filename
        content = read_text(path)
        if not content.strip():
            raise RuntimeError("El capítulo {0} está vacío.".format(filename))
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
    anchor = base
    count = seen.get(base, 0)
    while anchor in seen:
        anchor = "{0}-{1}".format(base, count)
        count += 1
    seen[base] = max(count, 1)
    seen[anchor] = 1
    return anchor


def iter_unfenced_lines(content):
    """Omite bloques de código sin confundir cercas de distinto tipo o longitud."""
    fence = None

    for index, line in enumerate(content.splitlines(keepends=True)):
        match = FENCE_RE.match(line)
        if match:
            marker, rest = match.groups()
            if fence is None:
                fence = marker
            elif marker[0] == fence[0] and len(marker) >= len(fence) and not rest.strip():
                fence = None
            continue
        if fence is None:
            yield index, line


def iter_headings(content):
    for _, line in iter_unfenced_lines(content):
        match = HEADING_RE.match(line)
        if not match:
            continue

        level = len(match.group(1))
        title = match.group(2).strip()
        yield level, title


def collect_anchors(chapters, presentation):
    seen = {}
    toc_entries = []
    chapter_anchors = {}

    for _, title in iter_headings(presentation):
        unique_anchor(title, seen)
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

    lines = content.splitlines(keepends=True)
    for index, line in iter_unfenced_lines(content):
        lines[index] = MARKDOWN_LINK_RE.sub(replace_link, line)
    return "".join(lines)


def validate_figures(content):
    """Comprueba las imágenes Markdown locales sin leer fuentes ajenas al informe."""
    for _, line in iter_unfenced_lines(content):
        for match in IMAGE_RE.finditer(line):
            target = match.group(1).split()[0].strip("<>")
            if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target) or target.startswith("//"):
                raise RuntimeError("La figura debe ser local: {0}".format(target))
            path = REPORT_DIR / unquote(target.split("#", 1)[0])
            if not path.is_file():
                raise RuntimeError("No se encontró la figura: {0}".format(target))


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


def build_header(metadata):
    """Conserva el control editorial en un comentario, no en la portada académica."""
    return "\n".join([
        "<!--",
        "Generado por scripts/assemble-report.py. Editar las fuentes, no esta salida.",
        "Estado: {0}".format(metadata["status"]),
        "Corte documental: {0}".format(metadata["document_cutoff_date"]),
        "Alcance funcional: {0}".format(metadata["functional_scope"]),
        "Tag publicado: {0} / {1}".format(
            metadata["functional_tag"], metadata["functional_commit"],
        ),
        "Fuente técnica: {0} @ {1}".format(
            metadata["technical_ref"], metadata["technical_commit"],
        ),
        "-->",
    ])


def assemble_document(chapters, toc_entries, chapter_anchors, metadata, presentation):
    fixed_chapters = [
        fix_chapter_links(chapter["content"], chapter_anchors).strip()
        for chapter in chapters
    ]

    parts = [
        build_header(metadata),
        presentation.strip(),
        "---",
        "## Tabla de Contenidos\n\n{0}".format(generate_toc(toc_entries)),
        "---",
        "\n\n---\n\n".join(fixed_chapters),
    ]

    content = "\n\n".join(parts).rstrip() + "\n"
    validate_figures(content)
    return content


def print_header():
    print("📄 Lumapse — Ensamblador de Informe Final")
    print("==================================================")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check", action="store_true",
        help="Comprueba que la salida coincide con las fuentes, sin escribir archivos.",
    )
    args = parser.parse_args(argv)
    print_header()

    try:
        print("📥 Leyendo presentación institucional, metadatos y capítulos...")
        metadata = read_metadata()
        presentation = read_presentation()
        chapters = read_chapters()

        toc_entries, chapter_anchors = collect_anchors(chapters, presentation)
        print(
            "📝 Generando tabla de contenidos ({0} entradas)...".format(
                len(toc_entries)
            )
        )

        content = assemble_document(
            chapters, toc_entries, chapter_anchors, metadata, presentation,
        )

        if args.check:
            if read_text(OUTPUT_PATH) != content:
                raise RuntimeError(
                    "La salida está desactualizada. Ejecutar python3 scripts/assemble-report.py."
                )
            print("✅ La salida coincide con las fuentes; no se modificaron archivos.")
        else:
            print("💾 Escribiendo: {0}".format(relative_path(OUTPUT_PATH)))
            write_text(OUTPUT_PATH, content)
    except RuntimeError as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1

    print("==================================================")
    print(
        "✅ Informe completo: presentación, 7 capítulos y referencias; {0:,} bytes".format(
            len(content.encode("utf-8")),
        )
    )
    print("==================================================")
    return 0


if __name__ == "__main__":
    sys.exit(main())
