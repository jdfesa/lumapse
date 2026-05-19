#!/usr/bin/env python3
"""
Lumapse — Métricas del Proyecto
Recolecta métricas cuantitativas para el informe final.
Uso: python3 scripts/project-metrics.py
"""

import os
import re
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CODE_EXTENSIONS = {".js", ".css"}
WORD_RE = re.compile(r"\b[\wÁÉÍÓÚÜÑáéíóúüñ]+\b", re.UNICODE)


def iter_files(directory, extensions=None):
    if not directory.exists():
        return []

    files = []
    for path in directory.rglob("*"):
        if not path.is_file():
            continue
        if extensions is not None and path.suffix.lower() not in extensions:
            continue
        files.append(path)

    return sorted(files)


def read_text_file(path):
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="replace")


def count_source_lines(files):
    total = 0

    for path in files:
        content = read_text_file(path)
        for line in content.splitlines():
            if line.strip():
                total += 1

    return total


def count_files(directory):
    if not directory.exists():
        return 0

    return sum(1 for path in directory.iterdir() if path.is_file())


def markdown_files_for_word_count():
    docs_files = iter_files(PROJECT_ROOT / "docs", {".md"})
    root_files = sorted(path for path in PROJECT_ROOT.glob("*.md") if path.is_file())
    return docs_files, sorted(set(docs_files + root_files))


def count_words(files):
    total = 0

    for path in files:
        content = read_text_file(path)
        total += len(WORD_RE.findall(content))

    return total


def format_number(value):
    return "{:,}".format(value)


def main():
    source_files = iter_files(PROJECT_ROOT / "src", CODE_EXTENSIONS)
    source_loc = count_source_lines(source_files)
    component_count = count_files(PROJECT_ROOT / "src" / "components")
    service_count = count_files(PROJECT_ROOT / "src" / "services")
    docs_markdown_files, word_markdown_files = markdown_files_for_word_count()
    total_words = count_words(word_markdown_files)

    print("📊 Lumapse — Métricas del Proyecto (Generado para Informe Final)")
    print("==================================================")
    print("💻 Código Fuente:")
    print("   - Archivos de código (JS/CSS): {} archivos".format(format_number(len(source_files))))
    print("   - Líneas de código fuente (LOC): {} líneas".format(format_number(source_loc)))
    print("   - Componentes UI: {}".format(format_number(component_count)))
    print("   - Servicios core: {}".format(format_number(service_count)))
    print("📚 Documentación:")
    print("   - Archivos Markdown: {} documentos".format(format_number(len(docs_markdown_files))))
    print("   - Volumen total: {} palabras".format(format_number(total_words)))
    print("==================================================")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
