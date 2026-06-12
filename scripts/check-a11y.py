#!/usr/bin/env python3
"""
Lumapse — Auditoría de Accesibilidad (a11y)
Linter estático simple para componentes UI e index.html.
Uso: python3 scripts/check-a11y.py
"""

import os
import re
import sys


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPONENTS_DIR = os.path.join(PROJECT_ROOT, "src", "components")
INDEX_HTML = os.path.join(PROJECT_ROOT, "index.html")

IMG_RE = re.compile(r"<img\b", re.IGNORECASE)
BUTTON_RE = re.compile(r"<button\b", re.IGNORECASE)
ALT_RE = re.compile(r"\balt\s*=", re.IGNORECASE)
ARIA_LABEL_RE = re.compile(r"\baria-label\s*=", re.IGNORECASE)
TITLE_RE = re.compile(r"\btitle\s*=", re.IGNORECASE)
TABINDEX_RE = re.compile(r"\btabindex\s*=\s*(?:[\"']|{)?([1-9][0-9]*)", re.IGNORECASE)


def relative_path(path):
    return os.path.relpath(path, PROJECT_ROOT)


def iter_target_files():
    files = []

    if os.path.isdir(COMPONENTS_DIR):
        for root, _, filenames in os.walk(COMPONENTS_DIR):
            for filename in filenames:
                if filename.endswith((".js", ".ts")):
                    files.append(os.path.join(root, filename))

    if os.path.isfile(INDEX_HTML):
        files.append(INDEX_HTML)

    return sorted(files)


def read_lines(path):
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return handle.readlines()
    except UnicodeDecodeError:
        with open(path, "r", encoding="utf-8", errors="replace") as handle:
            return handle.readlines()


def clean_line(line):
    return line.strip()


def collect_tag(lines, start_index):
    tag_lines = [lines[start_index]]

    if ">" in lines[start_index]:
        return lines[start_index]

    for next_line in lines[start_index + 1:start_index + 10]:
        tag_lines.append(next_line)
        if ">" in next_line:
            break

    return "".join(tag_lines)


def add_issue(issues, path, line_number, line, problem):
    issues.append({
        "path": path,
        "line_number": line_number,
        "line": clean_line(line),
        "problem": problem,
    })


def scan_file(path):
    issues = []
    lines = read_lines(path)

    for line_number, line in enumerate(lines, 1):
        if IMG_RE.search(line):
            tag = collect_tag(lines, line_number - 1)
            if not ALT_RE.search(tag):
                add_issue(
                    issues,
                    path,
                    line_number,
                    line,
                    "Etiqueta <img> sin atributo 'alt'.",
                )

        if BUTTON_RE.search(line):
            tag = collect_tag(lines, line_number - 1)
            if not ARIA_LABEL_RE.search(tag) and not TITLE_RE.search(tag):
                add_issue(
                    issues,
                    path,
                    line_number,
                    line,
                    "Etiqueta <button> sin atributo 'aria-label' o 'title'.",
                )

        tabindex_match = TABINDEX_RE.search(line)
        if tabindex_match:
            add_issue(
                issues,
                path,
                line_number,
                line,
                "Atributo tabindex mayor a 0; puede alterar el orden natural de foco.",
            )

    return issues


def main():
    issues = []

    print("♿ Lumapse — Auditoría de Accesibilidad (a11y)")
    print("==================================================")
    print("Escaneando componentes de interfaz...")

    for path in iter_target_files():
        issues.extend(scan_file(path))

    for issue in issues:
        print("⚠️  {}:{}".format(relative_path(issue["path"]), issue["line_number"]))
        print("   - Encontrado: {}".format(issue["line"]))
        print("   - Problema: {}".format(issue["problem"]))

    print("==================================================")
    print("📊 Resultado: {} posibles problemas de accesibilidad encontrados.".format(len(issues)))
    print("💡 Recuerda que en aplicaciones académicas, la accesibilidad web (W3C) es un requerimiento ético y técnico.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
