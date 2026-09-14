#!/usr/bin/env python3
"""Genera el fixture academico beta-500, variado y reproducible de Lumapse."""

from __future__ import annotations

import argparse
import hashlib
import json
import random
from collections import Counter
from pathlib import Path


DEFAULT_RANDOM_SEED = 20_260_913
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "tmp" / "beta-500-fixture"
TARGET_VISIBLE_NOTES = 500
TARGET_ARCHIVED_NOTES = 18
TARGET_TRASH_NOTES = 12
TARGET_PINNED_NOTES = 30
INBOX_NOTES = 15

ROOT_SUBJECTS = [
    {
        "career": "Tecnicatura en Analisis de Sistemas",
        "name": "Programacion II",
        "color": "#818cf8",
        "sections": ["POO", "Colecciones", "Excepciones", "Testing", "Backtracking"],
    },
    {
        "career": "Tecnicatura en Analisis de Sistemas",
        "name": "Base de Datos",
        "color": "#22d3ee",
        "sections": ["Modelo relacional", "SQL avanzado", "Transacciones", "Optimizacion"],
    },
    {
        "career": "Tecnicatura en Analisis de Sistemas",
        "name": "Redes y Comunicaciones",
        "color": "#34d399",
        "sections": ["Modelo OSI", "Direccionamiento", "IPv6"],
    },
    {
        "career": "Tecnicatura en Analisis de Sistemas",
        "name": "Ingenieria de Software",
        "color": "#f472b6",
        "sections": ["Requisitos", "UML", "Arquitectura", "Calidad", "Patrones"],
    },
    {
        "career": "Tecnicatura en Analisis de Sistemas",
        "name": "Matematica Discreta",
        "color": "#fbbf24",
        "sections": ["Logica", "Grafos"],
    },
    {
        "career": "Tecnicatura en Analisis de Sistemas",
        "name": "Practica Profesionalizante III",
        "color": "#fb923c",
        "sections": ["Planificacion", "Desarrollo", "Pruebas", "Documentacion", "Defensa", "Retrospectiva"],
    },
    {
        "career": "Tecnicatura en Analisis de Sistemas",
        "name": "Ingles Tecnico",
        "color": "#a78bfa",
        "sections": ["Vocabulario", "Lectura tecnica", "Presentaciones"],
    },
    {
        "career": "Tecnicatura en Analisis de Sistemas",
        "name": "Sistemas Operativos",
        "color": "#f87171",
        "sections": ["Procesos", "Memoria", "Archivos", "Concurrencia"],
    },
    {
        "career": "Tecnicatura en Analisis de Sistemas",
        "name": "Estadistica Aplicada",
        "color": "#34d399",
        "sections": ["Descriptiva", "Probabilidad"],
    },
    {
        "career": "Tecnicatura en Analisis de Sistemas",
        "name": "Gestion de Proyectos",
        "color": "#f472b6",
        "sections": ["Alcance", "Estimacion", "Riesgos", "Seguimiento", "Cierre"],
    },
]

# Notas guardadas directamente en cada materia raiz. La suma es 30.
ROOT_NOTE_COUNTS = [5, 3, 4, 2, 3, 6, 2, 1, 2, 2]

# Indices globales de seccion elegidos para casos de borde visibles.
EMPTY_SECTION_INDICES = {4, 8, 11, 16, 18, 24, 27, 31, 33, 38}
SPARSE_SECTION_COUNTS = {1: 1, 6: 2, 13: 3, 21: 4, 29: 5}
HEAVY_SECTION_COUNTS = {0: 55, 5: 48, 14: 64, 22: 72, 35: 50}

NOTE_KINDS = [
    "Resumen de clase",
    "Ejercicio guiado",
    "Preguntas pendientes",
    "Checklist de estudio",
    "Idea para revisar",
    "Ejemplo practico",
    "Conceptos clave",
    "Preparacion de examen",
]

EVENT_TITLES = {
    "parcial": ["Parcial de unidad", "Recuperatorio", "Evaluacion practica"],
    "final": ["Mesa final", "Coloquio integrador", "Entrega final"],
    "tp": ["Entrega de TP", "Revision del proyecto", "Avance grupal"],
    "exposicion": ["Exposicion breve", "Demo en clase", "Presentacion oral"],
}


def distribute_integer(total: int, weights: list[int]) -> list[int]:
    """Distribuye un entero por restos mayores, de forma estable."""
    weight_sum = sum(weights)
    raw = [total * weight / weight_sum for weight in weights]
    result = [int(value) for value in raw]
    remainder = total - sum(result)
    order = sorted(range(len(weights)), key=lambda index: (raw[index] - result[index], -index), reverse=True)
    for index in order[:remainder]:
        result[index] += 1
    return result


def make_content(index: int, subject_name: str, section_name: str | None, rng: random.Random) -> str:
    destination = section_name or subject_name
    variant = index % 6
    if variant == 0:
        body = (
            f"## {destination}\n\n"
            f"- Idea principal #{index}: relacionar el concepto con un ejemplo.\n"
            "- Verificar la definicion antes del proximo encuentro.\n"
            "- [ ] Completar el ejercicio pendiente.\n"
            "- [x] Ordenar los apuntes de la clase."
        )
    elif variant == 1:
        body = (
            f"### Ejercicio {index}\n\n"
            "1. Identificar los datos disponibles.\n"
            "2. Proponer una estrategia de resolucion.\n"
            "3. Comparar el resultado con otro enfoque.\n\n"
            f"> Caso hipotetico de practica para {destination}."
        )
    elif variant == 2:
        body = (
            "| Punto | Estado |\n| --- | --- |\n"
            f"| Lectura {index} | Revisada |\n"
            "| Ejemplo | Pendiente |\n"
            "| Consulta al docente | Anotada |"
        )
    elif variant == 3:
        body = (
            f"**Pregunta de repaso:** ¿como se aplica este tema de {destination} en una situacion real?\n\n"
            "Respuesta tentativa: separar el problema, explicitar supuestos y comprobar cada paso."
        )
    elif variant == 4:
        body = (
            "```text\n"
            f"entrada_{index} -> proceso -> verificacion -> resultado\n"
            "```\n\n"
            "Anotar errores encontrados y repetir solamente el paso que corresponda."
        )
    else:
        body = (
            f"Apunte breve de **{destination}**.\n\n"
            f"Prioridad sugerida: {rng.choice(['alta', 'media', 'baja'])}. "
            "Este contenido es ficticio y existe unicamente para probar Lumapse."
        )

    # Algunas notas extensas fuerzan tarjetas/contenido mas realistas sin exceder limites.
    if index in {97, 233, 401, 487}:
        appendix = "\n".join(
            f"- Desarrollo adicional {line:02d}: observacion sintetica para probar desplazamiento y renderizado."
            for line in range(1, 61)
        )
        body += f"\n\n## Desarrollo extendido\n\n{appendix}"
    return body


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genera el dataset beta-500 para pruebas locales y Android de Lumapse.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Directorio de salida ignorado por Git (default: tmp/beta-500-fixture).",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=DEFAULT_RANDOM_SEED,
        help=f"Semilla pseudoaleatoria reproducible (default: {DEFAULT_RANDOM_SEED}).",
    )
    args = parser.parse_args()

    rng = random.Random(args.seed)
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    dataset_path = output_dir / "dataset.json"
    report_path = output_dir / "DISTRIBUTION.md"
    summary_path = output_dir / "dataset-summary.json"

    subjects: list[dict] = []
    roots: list[dict] = []
    sections: list[dict] = []
    section_index = 0
    for root_index, spec in enumerate(ROOT_SUBJECTS, start=1):
        root_id = f"beta500-subject-{root_index:02d}"
        root = {
            "id": root_id,
            "career": spec["career"],
            "name": spec["name"],
            "color": spec["color"],
            "createdDaysBeforeSeed": 120 - root_index,
            "sections": [],
        }
        for local_index, name in enumerate(spec["sections"], start=1):
            section = {
                "id": f"beta500-section-{section_index + 1:02d}",
                "name": name,
                "createdDaysBeforeSeed": 100 - section_index,
                "rootId": root_id,
                "rootName": spec["name"],
                "globalIndex": section_index,
                "localIndex": local_index,
            }
            root["sections"].append({key: section[key] for key in ("id", "name", "createdDaysBeforeSeed")})
            sections.append(section)
            section_index += 1
        subjects.append(root)
        roots.append(root)

    explicit_total = sum(SPARSE_SECTION_COUNTS.values()) + sum(HEAVY_SECTION_COUNTS.values())
    section_total = TARGET_VISIBLE_NOTES - INBOX_NOTES - sum(ROOT_NOTE_COUNTS)
    flexible_indices = [
        index for index in range(len(sections))
        if index not in EMPTY_SECTION_INDICES
        and index not in SPARSE_SECTION_COUNTS
        and index not in HEAVY_SECTION_COUNTS
    ]
    flexible_weights = [rng.randint(4, 20) for _ in flexible_indices]
    flexible_counts = distribute_integer(section_total - explicit_total, flexible_weights)
    section_counts = {index: 0 for index in range(len(sections))}
    section_counts.update(SPARSE_SECTION_COUNTS)
    section_counts.update(HEAVY_SECTION_COUNTS)
    section_counts.update(dict(zip(flexible_indices, flexible_counts)))
    assert sum(section_counts.values()) == section_total

    notes: list[dict] = []

    def add_note(subject_id: str | None, subject_name: str, section_name: str | None, *, archived: bool = False, trashed: bool = False) -> None:
        index = len(notes) + 1
        kind = NOTE_KINDS[(index + rng.randrange(len(NOTE_KINDS))) % len(NOTE_KINDS)]
        title_context = section_name or subject_name
        title = f"{kind} #{index:03d} - {title_context}"
        created_days = rng.randint(3, 240)
        updated_days = rng.randint(0, created_days)
        deleted_days = rng.randint(1, min(20, updated_days if updated_days > 0 else 1)) if trashed else None
        note = {
            "id": f"beta500-note-{index:04d}",
            "title": title,
            "content": make_content(index, subject_name, section_name, rng),
            "subjectId": subject_id,
            "pinned": False,
            "archived": archived,
            "statusEmoji": rng.choice([None, None, "📖", "❓", "🔥", "✅"]),
            "createdDaysBeforeSeed": created_days,
            "updatedDaysBeforeSeed": updated_days,
            "deletedDaysBeforeSeed": deleted_days,
        }
        notes.append(note)

    for _ in range(INBOX_NOTES):
        add_note(None, "Entrada", None)

    for root, count in zip(roots, ROOT_NOTE_COUNTS):
        for _ in range(count):
            add_note(root["id"], root["name"], None)

    for section in sections:
        for _ in range(section_counts[section["globalIndex"]]):
            add_note(section["id"], section["rootName"], section["name"])

    assert len(notes) == TARGET_VISIBLE_NOTES
    for index in rng.sample(range(TARGET_VISIBLE_NOTES), TARGET_PINNED_NOTES):
        notes[index]["pinned"] = True

    nonempty_sections = [section for section in sections if section_counts[section["globalIndex"]] > 0]
    for archive_index in range(TARGET_ARCHIVED_NOTES):
        section = nonempty_sections[(archive_index * 7) % len(nonempty_sections)]
        add_note(section["id"], section["rootName"], section["name"], archived=True)

    for trash_index in range(TARGET_TRASH_NOTES):
        section = nonempty_sections[(trash_index * 11 + 3) % len(nonempty_sections)]
        add_note(section["id"], section["rootName"], section["name"], trashed=True)

    event_offsets = [
        0, 1, 1, 3, 5, 7, 7, 10, 12, 14,
        18, 21, 24, 28, 30, 33, 35, 41, 45, 49,
        53, 57, 60, 64, 69, 75, 80, 85, 90, 96,
        103, 110, 118, 125, 140, 160, 180, 210, 240, 270,
    ]
    event_types = ["parcial", "final", "tp", "exposicion"]
    all_subject_destinations = [
        {"id": root["id"], "name": root["name"]} for root in roots
    ] + [
        {"id": section["id"], "name": section["name"]} for section in sections
    ]
    events = []
    for index, offset in enumerate(event_offsets, start=1):
        event_type = event_types[(index - 1) % len(event_types)]
        destination = all_subject_destinations[(index * 7) % len(all_subject_destinations)]
        base_title = EVENT_TITLES[event_type][(index - 1) % len(EVENT_TITLES[event_type])]
        events.append({
            "id": f"beta500-event-{index:03d}",
            "type": event_type,
            "title": f"{base_title} - {destination['name']}",
            "subjectId": destination["id"],
            "daysFromSeed": offset,
        })

    expected = {
        "rootSubjects": len(roots),
        "sections": len(sections),
        "subjects": len(roots) + len(sections),
        "activeSubjects": len(roots) + len(sections),
        "deletedSubjects": 0,
        "notes": TARGET_VISIBLE_NOTES + TARGET_ARCHIVED_NOTES + TARGET_TRASH_NOTES,
        "activeNotes": TARGET_VISIBLE_NOTES + TARGET_ARCHIVED_NOTES,
        "normalFeedNotes": TARGET_VISIBLE_NOTES,
        "inboxNotes": INBOX_NOTES,
        "archivedNotes": TARGET_ARCHIVED_NOTES,
        "trashNotes": TARGET_TRASH_NOTES,
        "pinnedActiveNotes": TARGET_PINNED_NOTES,
        "academicEvents": len(events),
        "eventsWithSubject": len(events),
    }
    dataset = {
        "datasetVersion": 1,
        "id": "lumapse-beta-500-v1",
        "locale": "es-AR",
        "description": "Fixture sintetico reproducible para pruebas de volumen, navegacion, calendario, archivo y papelera.",
        "randomSeed": args.seed,
        "datePolicy": {
            "timezone": "America/Argentina/Buenos_Aires",
            "noteTimestamps": "relative-to-seed-date",
            "academicEventDates": "relative-to-seed-date",
        },
        "subjects": subjects,
        "notes": notes,
        "academicEvents": events,
        "expected": expected,
    }
    serialized = json.dumps(dataset, ensure_ascii=False, indent=2) + "\n"
    dataset_path.write_text(serialized, encoding="utf-8")
    dataset_sha = hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    status_counts = Counter(note["statusEmoji"] or "sin estado" for note in notes if note["deletedDaysBeforeSeed"] is None)
    summary = {
        "datasetId": dataset["id"],
        "randomSeed": args.seed,
        "datasetSha256": dataset_sha,
        "expected": expected,
        "emptySections": [sections[index]["name"] for index in sorted(EMPTY_SECTION_INDICES)],
        "sectionVisibleCounts": {
            f"{section['rootName']} / {section['name']}": section_counts[section["globalIndex"]]
            for section in sections
        },
        "rootVisibleCounts": {
            root["name"]: count for root, count in zip(roots, ROOT_NOTE_COUNTS)
        },
        "statusCountsActive": dict(status_counts),
    }
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report_lines = [
        "# Distribucion del fixture beta 500",
        "",
        f"- Semilla pseudoaleatoria: `{args.seed}`",
        f"- SHA-256 de `dataset.json`: `{dataset_sha}`",
        f"- Materias raiz: **{len(roots)}**",
        f"- Secciones: **{len(sections)}**",
        f"- Notas visibles activas: **{TARGET_VISIBLE_NOTES}**",
        f"- Notas archivadas: **{TARGET_ARCHIVED_NOTES}**",
        f"- Notas en papelera: **{TARGET_TRASH_NOTES}**",
        f"- Notas totales SQLite: **{len(notes)}**",
        f"- Fechas academicas: **{len(events)}**",
        "",
        "## Distribucion visible",
        "",
        "| Materia / destino | Notas visibles |",
        "|---|---:|",
        f"| Entrada | {INBOX_NOTES} |",
    ]
    for root, root_count in zip(roots, ROOT_NOTE_COUNTS):
        report_lines.append(f"| **{root['name']}** (directas) | {root_count} |")
        for section in sections:
            if section["rootId"] == root["id"]:
                report_lines.append(f"| ↳ {section['name']} | {section_counts[section['globalIndex']]} |")
    report_lines.extend([
        "",
        "El ZIP oficial de Lumapse excluye por contrato los elementos eliminados. Por eso restaura las 500 notas visibles, las 18 archivadas y las 40 fechas, pero no las 12 filas de Papelera. El snapshot SQLite y este generador conservan el estado exacto completo.",
        "",
    ])
    report_path.write_text("\n".join(report_lines), encoding="utf-8")

    print(json.dumps({
        "dataset": str(dataset_path),
        "sha256": dataset_sha,
        "roots": len(roots),
        "sections": len(sections),
        "visibleNotes": TARGET_VISIBLE_NOTES,
        "archivedNotes": TARGET_ARCHIVED_NOTES,
        "trashNotes": TARGET_TRASH_NOTES,
        "totalNotes": len(notes),
        "events": len(events),
        "emptySections": len(EMPTY_SECTION_INDICES),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
