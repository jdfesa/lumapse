#!/usr/bin/env python3
"""
Lumapse — Análisis de Deuda Técnica
Detecta archivos JS/TS largos y líneas con anidación profunda en src/.
Uso: python3 scripts/analyze-complexity.py
"""

import os
import sys
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_DIR = PROJECT_ROOT / "src"
MAX_LOC = 250
MAX_DEEPLY_NESTED_LINES = 10
DEEP_INDENT_SPACES = 12


def relative_path(path):
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def read_source(path):
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="replace")


def leading_spaces(line):
    return len(line) - len(line.lstrip(" "))


def analyze_file(path):
    loc = 0
    deeply_nested = 0

    for line in read_source(path).splitlines():
        if not line.strip():
            continue

        loc += 1
        if leading_spaces(line) > DEEP_INDENT_SPACES:
            deeply_nested += 1

    is_long = loc > MAX_LOC
    is_complex = deeply_nested > MAX_DEEPLY_NESTED_LINES
    score = int(is_long) + int(is_complex)

    return {
        "path": path,
        "loc": loc,
        "deeply_nested": deeply_nested,
        "is_long": is_long,
        "is_complex": is_complex,
        "score": score,
    }


def find_source_files():
    if not SRC_DIR.exists():
        return []

    files = []
    for pattern in ("*.js", "*.ts"):
        files.extend(path for path in SRC_DIR.rglob(pattern) if path.is_file())

    return sorted(set(files))


def sort_findings(findings):
    return sorted(
        findings,
        key=lambda item: (
            item["score"],
            item["deeply_nested"],
            item["loc"],
            relative_path(item["path"]),
        ),
        reverse=True,
    )


def print_problem(finding):
    loc_status = "Largo" if finding["is_long"] else "OK"
    complexity_status = "Alta complejidad" if finding["is_complex"] else "OK"

    print("⚠️ {}".format(relative_path(finding["path"])))
    print("   - Líneas de código: {} ({})".format(finding["loc"], loc_status))
    print(
        "   - Líneas anidadas (>12 espacios): {} ({})".format(
            finding["deeply_nested"],
            complexity_status,
        )
    )


def main():
    print("🧬 Lumapse — Análisis de Deuda Técnica (Complejidad)")
    print("==================================================")
    print("Escaneando archivos JS/TS en src/ ...")

    findings = [analyze_file(path) for path in find_source_files()]
    problems = [finding for finding in findings if finding["score"] > 0]
    healthy_count = len(findings) - len(problems)

    for finding in sort_findings(problems):
        print_problem(finding)

    if healthy_count == len(findings):
        print("✅ Todos los archivos JS/TS están dentro de los límites saludables.")
    else:
        print("✅ Los otros {} archivos están dentro de los límites saludables.".format(healthy_count))

    print("==================================================")
    print("💡 Sugerencia: Extraer lógica de los archivos marcados con ⚠️ a funciones auxiliares o submódulos.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
