#!/usr/bin/env python3
"""
Lumapse — Reporte de Velocidad
Calcula Story Points entregados por hito desde historias-de-usuario.md.
Uso: python3 scripts/generate-velocity-report.py
"""

import os
import re
import sys
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HU_PATH = PROJECT_ROOT / "docs" / "producto" / "historias-de-usuario.md"
TRACEABILITY_HEADING_RE = re.compile(r"^##\s+Trazabilidad:\s+HU\s+→\s+RF\s+→\s+Persona\s*$")
HU_RE = re.compile(r"^HU-\d{3}$")


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


def strip_markdown(value):
    value = value.strip()
    value = re.sub(r"\*\*(.*?)\*\*", r"\1", value)
    value = value.replace("`", "")
    return value.strip()


def split_table_row(line):
    return [strip_markdown(cell) for cell in line.strip().strip("|").split("|")]


def parse_traceability_rows(content):
    rows = []
    in_traceability = False

    for line in content.splitlines():
        if TRACEABILITY_HEADING_RE.match(line.strip()):
            in_traceability = True
            continue

        if not in_traceability:
            continue

        stripped = line.strip()
        if not stripped:
            if rows:
                break
            continue

        if not stripped.startswith("|"):
            if rows:
                break
            continue

        cells = split_table_row(stripped)
        if len(cells) < 6:
            continue

        hu_id, _, _, _, sp_value, hito = cells[:6]
        if not HU_RE.match(hu_id):
            continue

        try:
            story_points = int(sp_value)
        except ValueError:
            continue

        rows.append({
            "hu": hu_id,
            "sp": story_points,
            "hito": hito.zfill(2),
        })

    return rows


def group_by_hito(rows):
    grouped = {}

    for row in rows:
        hito = row["hito"]
        grouped.setdefault(hito, {"hu_count": 0, "sp": 0})
        grouped[hito]["hu_count"] += 1
        grouped[hito]["sp"] += row["sp"]

    return grouped


def print_report(rows, grouped):
    print("📈 Lumapse — Reporte de Velocidad (Story Points por Hito)")
    print("==================================================")
    print(
        "📋 Fuente: {0} ({1} HU)".format(
            relative_path(HU_PATH),
            len(rows),
        )
    )
    print("--------------------------------------------------")
    print("| Hito | HU entregadas | SP entregados | SP acumulados |")
    print("|------|---------------|---------------|---------------|")

    accumulated_sp = 0
    total_sp = 0

    for hito in sorted(grouped):
        hu_count = grouped[hito]["hu_count"]
        hito_sp = grouped[hito]["sp"]
        accumulated_sp += hito_sp
        total_sp += hito_sp

        print(
            "| {0:>4} | {1:>13} | {2:>13} | {3:>13} |".format(
                hito,
                hu_count,
                hito_sp,
                accumulated_sp,
            )
        )

    print("--------------------------------------------------")
    average_velocity = total_sp / len(grouped) if grouped else 0
    print("📊 Velocidad promedio: {0:.1f} SP/hito".format(average_velocity))
    print("📊 SP totales del proyecto: {0}".format(total_sp))
    print("==================================================")


def main():
    try:
        content = read_text(HU_PATH)
    except RuntimeError as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1

    rows = parse_traceability_rows(content)
    if not rows:
        print("Error: no se encontraron HU en la tabla de trazabilidad.", file=sys.stderr)
        return 1

    grouped = group_by_hito(rows)
    print_report(rows, grouped)
    return 0


if __name__ == "__main__":
    sys.exit(main())
