#!/usr/bin/env python3
"""
Lumapse — Generador de Borrador de Changelog
Lee los últimos commits y emite Markdown para copiar manualmente al CHANGELOG.
Uso: python3 scripts/generate-changelog.py
"""

import datetime
import os
import re
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COMMIT_RE = re.compile(r"^(feat|fix|docs|chore|refactor|test)(?:\([^)]+\))?!?:\s+.+$")

SECTIONS = [
    ("feat", "### ✨ Nuevas Funcionalidades"),
    ("fix", "### 🐛 Correcciones de Errores"),
    ("docs", "### 📚 Documentación"),
    ("maintenance", "### ⚙️ Mantenimiento y Refactorización"),
]

SECTION_BY_TYPE = {
    "feat": "feat",
    "fix": "fix",
    "docs": "docs",
    "chore": "maintenance",
    "refactor": "maintenance",
    "test": "maintenance",
}


def run_git_log():
    result = subprocess.run(
        ["git", "log", "--oneline", "-n", "40"],
        cwd=str(PROJECT_ROOT),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )

    if result.returncode != 0:
        print("No se pudo leer git log: {}".format(result.stderr.strip()), file=sys.stderr)
        return None

    return result.stdout.splitlines()


def parse_commit_line(line):
    parts = line.strip().split(maxsplit=1)
    if len(parts) != 2:
        return None

    commit_hash, subject = parts

    if subject.startswith("Merge") or subject.startswith("Revert"):
        return None

    match = COMMIT_RE.match(subject)
    if not match:
        return None

    commit_type = match.group(1)
    section = SECTION_BY_TYPE.get(commit_type)
    if section is None:
        return None

    return section, "- {} ({})".format(subject, commit_hash)


def collect_entries(lines):
    entries = {
        "feat": [],
        "fix": [],
        "docs": [],
        "maintenance": [],
    }

    for line in lines:
        parsed = parse_commit_line(line)
        if parsed is None:
            continue

        section, item = parsed
        entries[section].append(item)

    return entries


def main():
    lines = run_git_log()
    if lines is None:
        return 1

    entries = collect_entries(lines)
    today = datetime.date.today().isoformat()

    print("## [Borrador] — {}".format(today))

    printed_any = False
    for section_key, title in SECTIONS:
        section_entries = entries[section_key]
        if not section_entries:
            continue

        printed_any = True
        print(title)
        for entry in section_entries:
            print(entry)

    if not printed_any:
        print("_Sin commits convencionales en los últimos 40 commits._")

    return 0


if __name__ == "__main__":
    sys.exit(main())
