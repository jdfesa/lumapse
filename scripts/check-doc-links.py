#!/usr/bin/env python3
"""
Lumapse — Auditoría de Links en Documentación
Valida links internos en archivos Markdown del proyecto.
Uso: python3 scripts/check-doc-links.py
"""

import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

IGNORED_PREFIXES = ("http://", "https://", "mailto:", "tel:")
SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")
HEADING_RE = re.compile(r"^\s{0,3}(#{1,6})\s+(.+?)\s*$")


def find_markdown_files():
    """Encuentra todos los .md a escanear."""
    files = []
    docs_dir = PROJECT_ROOT / "docs"

    if docs_dir.exists():
        files.extend(docs_dir.rglob("*.md"))

    for relative_path in (
        "README.md",
        "CHANGELOG.md",
        "BACKLOG.md",
        "scripts/README.md",
    ):
        path = PROJECT_ROOT / relative_path
        if path.exists():
            files.append(path)

    return sorted(set(files))


def is_ignored_target(target):
    normalized = target.strip().lower()
    return (
        not normalized
        or normalized.startswith(IGNORED_PREFIXES)
        or normalized.startswith("//")
        or SCHEME_RE.match(normalized) is not None
    )


def find_matching_bracket(text, start_index):
    depth = 0
    escaped = False

    for index in range(start_index, len(text)):
        char = text[index]

        if escaped:
            escaped = False
            continue

        if char == "\\":
            escaped = True
            continue

        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return index

    return None


def read_link_destination(text, open_paren_index):
    if open_paren_index >= len(text) or text[open_paren_index] != "(":
        return None, None

    index = open_paren_index + 1
    chars = []
    escaped = False
    paren_depth = 0

    if index < len(text) and text[index] == "<":
        index += 1
        while index < len(text):
            char = text[index]
            if char == ">":
                index += 1
                while index < len(text) and text[index] != ")":
                    index += 1
                if index < len(text):
                    return "".join(chars).strip(), index
                return None, None
            chars.append(char)
            index += 1
        return None, None

    while index < len(text):
        char = text[index]

        if escaped:
            chars.append(char)
            escaped = False
            index += 1
            continue

        if char == "\\":
            escaped = True
            index += 1
            continue

        if char == "(":
            paren_depth += 1
        elif char == ")":
            if paren_depth == 0:
                return "".join(chars).strip(), index
            paren_depth -= 1

        chars.append(char)
        index += 1

    return None, None


def normalize_target(raw_target):
    target = raw_target.strip()

    if not target:
        return ""

    if target.startswith("<") and ">" in target:
        return target[1:target.index(">")].strip()

    if target[0] in ("'", '"'):
        quote = target[0]
        end_index = target.find(quote, 1)
        if end_index != -1:
            return target[1:end_index].strip()

    return target.split()[0]


def extract_line_links(line, line_number, filepath):
    links = []

    for is_image in (True, False):
        index = 0

        while index < len(line):
            if is_image:
                if line[index:index + 2] != "![":
                    index += 1
                    continue
                bracket_index = index + 1
            else:
                if line[index] != "[" or (index > 0 and line[index - 1] == "!"):
                    index += 1
                    continue
                bracket_index = index

            closing_bracket = find_matching_bracket(line, bracket_index)
            if closing_bracket is None:
                index += 1
                continue

            raw_target, closing_paren = read_link_destination(line, closing_bracket + 1)
            if raw_target is None:
                index = closing_bracket + 1
                continue

            target = normalize_target(raw_target)
            if not is_ignored_target(target):
                links.append({
                    "source": filepath,
                    "line": line_number,
                    "target": target,
                    "is_image": is_image,
                })

            index = closing_paren + 1

    return links


def extract_links(filepath, content):
    """Extrae todos los links Markdown de un archivo."""
    links = []
    in_fence = False
    fence_marker = None

    for line_number, line in enumerate(content.splitlines(), 1):
        stripped = line.lstrip()

        if stripped.startswith("```") or stripped.startswith("~~~"):
            marker = stripped[:3]
            if not in_fence:
                in_fence = True
                fence_marker = marker
            elif marker == fence_marker:
                in_fence = False
                fence_marker = None
            continue

        if in_fence:
            continue

        links.extend(extract_line_links(line, line_number, filepath))

    return links


def resolve_link(source_file, link_target):
    """Resuelve un link relativo desde el archivo fuente."""
    target = link_target
    anchor = None

    if "#" in target:
        target, anchor = target.split("#", 1)
        anchor = unquote(anchor)

    if "?" in target:
        target = target.split("?", 1)[0]

    if target == "":
        destination = source_file
    else:
        destination = (source_file.parent / unquote(target)).resolve()

    return destination, anchor


def relative_path(path):
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def decorate_links(all_links):
    decorated = []

    for link in all_links:
        destination, anchor = resolve_link(link["source"], link["target"])
        decorated.append(dict(link, destination=destination, anchor=anchor))

    return decorated


def check_file_links(all_links):
    """Verifica que los archivos referenciados existen."""
    broken = []

    for link in all_links:
        if link["is_image"]:
            continue
        if not link["destination"].exists():
            broken.append(link)

    return broken


def check_image_links(all_links):
    """Verifica que las imágenes referenciadas existen."""
    missing = []

    for link in all_links:
        if not link["is_image"]:
            continue
        if not link["destination"].exists():
            missing.append(link)

    return missing


def strip_inline_markdown(text):
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    return text.replace("`", "")


def slugify_heading(text):
    text = strip_inline_markdown(text)
    text = re.sub(r"\s+#+\s*$", "", text).strip().lower()
    chars = []

    for char in text:
        if char.isalnum() or char == "-":
            chars.append(char)
        elif char.isspace():
            chars.append("-")

    return "".join(chars).strip("-")


def extract_heading_slugs(markdown_file):
    slugs = set()
    slug_counts = {}
    in_fence = False
    fence_marker = None

    try:
        content = markdown_file.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        content = markdown_file.read_text(encoding="utf-8", errors="replace")

    for line in content.splitlines():
        stripped = line.lstrip()

        if stripped.startswith("```") or stripped.startswith("~~~"):
            marker = stripped[:3]
            if not in_fence:
                in_fence = True
                fence_marker = marker
            elif marker == fence_marker:
                in_fence = False
                fence_marker = None
            continue

        if in_fence:
            continue

        match = HEADING_RE.match(line)
        if not match:
            continue

        slug = slugify_heading(match.group(2))
        if not slug:
            continue

        count = slug_counts.get(slug, 0)
        slug_counts[slug] = count + 1
        if count == 0:
            slugs.add(slug)
        else:
            slugs.add("{}-{}".format(slug, count))

    return slugs


def check_anchor_links(all_links):
    """Bonus: verifica anclas en archivos destino."""
    warnings = []
    heading_cache = {}

    for link in all_links:
        anchor = link["anchor"]
        destination = link["destination"]

        if not anchor or not destination.exists():
            continue

        if destination.is_dir():
            readme = destination / "README.md"
            if readme.exists():
                destination = readme
            else:
                warnings.append(dict(link, anchor_status="ancla no verificada"))
                continue

        if destination.suffix.lower() != ".md":
            warnings.append(dict(link, anchor_status="ancla no verificada"))
            continue

        if destination not in heading_cache:
            heading_cache[destination] = extract_heading_slugs(destination)

        if anchor.lower() not in heading_cache[destination]:
            warnings.append(dict(link, anchor_status="ancla no encontrada"))

    return warnings


def print_link_issue(link, message):
    source = relative_path(link["source"])
    print("⚠️  {}:{} → {} — {}".format(source, link["line"], link["target"], message))


def print_anchor_warning(link):
    source = relative_path(link["source"])
    print(
        "💬 {}:{} → {} → {} ({})".format(
            source,
            link["line"],
            link["target"],
            link["anchor"],
            link["anchor_status"],
        )
    )


def main():
    markdown_files = find_markdown_files()
    all_links = []

    for filepath in markdown_files:
        try:
            content = filepath.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            content = filepath.read_text(encoding="utf-8", errors="replace")
        all_links.extend(extract_links(filepath, content))

    decorated_links = decorate_links(all_links)
    broken_links = check_file_links(decorated_links)
    missing_images = check_image_links(decorated_links)
    anchor_warnings = check_anchor_links(decorated_links)

    print("🔍 Lumapse — Auditoría de Links en Documentación")
    print("==================================================")
    print("📋 Archivos Markdown escaneados: {}".format(len(markdown_files)))
    print("📋 Links internos encontrados: {}".format(len(decorated_links)))
    print("--------------------------------------------------")

    print("[1/3] Links a archivos inexistentes...")
    if broken_links:
        for link in broken_links:
            print_link_issue(link, "archivo no encontrado")
        print("   Total: {} link(s) roto(s)".format(len(broken_links)))
    else:
        print("✅ Sin problemas")

    print("[2/3] Links a imágenes inexistentes...")
    if missing_images:
        for link in missing_images:
            print_link_issue(link, "imagen no encontrada")
        print("   Total: {} imagen(es) faltante(s)".format(len(missing_images)))
    else:
        print("✅ Sin problemas")

    print("[3/3] Anclas posiblemente inválidas...")
    if anchor_warnings:
        for link in anchor_warnings:
            print_anchor_warning(link)
        print("   Total: {} ancla(s) a verificar".format(len(anchor_warnings)))
    else:
        print("✅ Sin problemas")

    print("==================================================")
    print(
        "📊 Resumen: {} link(s) roto(s), {} imagen(es) faltante(s), {} ancla(s) a verificar".format(
            len(broken_links),
            len(missing_images),
            len(anchor_warnings),
        )
    )
    print("==================================================")

    if not broken_links and not missing_images and not anchor_warnings:
        print("✅ Documentación: TODOS LOS LINKS SON VÁLIDOS (0 errores)")
        print("==================================================")

    return 1 if broken_links or missing_images else 0


if __name__ == "__main__":
    sys.exit(main())
