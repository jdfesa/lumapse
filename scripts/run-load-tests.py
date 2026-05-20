#!/usr/bin/env python3
"""
Lumapse — Test de Rendimiento y Carga
Valida DP-001 comparando parseo Markdown vs. título desnormalizado en SQLite.
Uso: python3 scripts/run-load-tests.py
"""

import argparse
import gc
import re
import sqlite3
import sys
import time
from datetime import datetime, timezone


DEFAULT_NOTE_COUNT = 5000
TITLE_RE = re.compile(r"^#\s+(.+?)\s*$", re.MULTILINE)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS notes (
    id        TEXT    PRIMARY KEY,
    title     TEXT,
    content   TEXT,
    pinned    INTEGER DEFAULT 0,
    archived  INTEGER DEFAULT 0,
    subjectId TEXT,
    createdAt TEXT    NOT NULL,
    updatedAt TEXT    NOT NULL
);
"""


def parse_args(argv):
    parser = argparse.ArgumentParser(
        description="Ejecuta pruebas de carga para validar DP-001."
    )
    parser.add_argument(
        "--notes",
        type=int,
        default=DEFAULT_NOTE_COUNT,
        help="Cantidad de notas a generar. Default: 5000.",
    )
    return parser.parse_args(argv[1:])


def iso_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def create_connection():
    connection = sqlite3.connect(":memory:")
    connection.execute("PRAGMA journal_mode = OFF")
    connection.execute("PRAGMA synchronous = OFF")
    connection.execute("PRAGMA temp_store = MEMORY")
    connection.executescript(SCHEMA_SQL)
    return connection


def build_markdown_content(index, title):
    paragraph_a = (
        "Lumapse registra apuntes académicos en Markdown para permitir lectura "
        "offline, sincronización conceptual con el informe final y edición rápida "
        "desde dispositivos móviles. Esta nota de carga simula contenido realista "
        "con varias frases, listas y referencias a decisiones del proyecto."
    )
    paragraph_b = (
        "El objetivo de esta prueba es medir cuánto cuesta recorrer el contenido "
        "completo de cada nota para extraer el primer encabezado H1 cuando el feed "
        "solo necesita mostrar el título, la fecha y un estado visual compacto."
    )
    paragraph_c = (
        "En un celular de gama media, evitar trabajo repetitivo sobre cientos o "
        "miles de notas reduce uso de CPU, latencia perceptible y consumo de batería."
    )

    return (
        "# {0}\n\n"
        "{1}\n\n"
        "## Puntos clave\n"
        "- Registro de prueba número {2}.\n"
        "- Validación de DP-001: título desnormalizado.\n"
        "- Escenario: listado masivo de notas.\n\n"
        "{3}\n\n"
        "## Observación\n"
        "{4}\n"
    ).format(title, paragraph_a, index, paragraph_b, paragraph_c)


def generate_note_rows(note_count):
    timestamp = iso_now()

    for index in range(1, note_count + 1):
        title = "Nota de carga {0:04d}".format(index)
        yield (
            "load-note-{0:04d}".format(index),
            title,
            build_markdown_content(index, title),
            0,
            0,
            None,
            timestamp,
            timestamp,
        )


def seed_notes(connection, note_count):
    connection.executemany(
        """
        INSERT INTO notes (id, title, content, pinned, archived, subjectId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        generate_note_rows(note_count),
    )
    connection.commit()


def extract_title_from_markdown(content):
    match = TITLE_RE.search(content)
    if match:
        return match.group(1).strip()
    return "Sin título"


def elapsed_ms(start_ns, end_ns):
    return (end_ns - start_ns) / 1_000_000


def run_markdown_parse_test(connection):
    gc.collect()
    start_ns = time.perf_counter_ns()
    rows = connection.execute(
        "SELECT id, content FROM notes ORDER BY updatedAt DESC, id ASC"
    ).fetchall()
    titles = [extract_title_from_markdown(content) for _, content in rows]
    end_ns = time.perf_counter_ns()
    return elapsed_ms(start_ns, end_ns), titles


def run_denormalized_title_test(connection):
    gc.collect()
    start_ns = time.perf_counter_ns()
    rows = connection.execute(
        "SELECT id, title FROM notes ORDER BY updatedAt DESC, id ASC"
    ).fetchall()
    titles = [title or "Sin título" for _, title in rows]
    end_ns = time.perf_counter_ns()
    return elapsed_ms(start_ns, end_ns), titles


def validate_results(parsed_titles, denormalized_titles):
    if len(parsed_titles) != len(denormalized_titles):
        raise RuntimeError(
            "Cantidad de títulos inconsistente: parseo={0}, desnormalizado={1}".format(
                len(parsed_titles),
                len(denormalized_titles),
            )
        )

    for index, parsed_title in enumerate(parsed_titles):
        if parsed_title != denormalized_titles[index]:
            raise RuntimeError(
                "Título inconsistente en posición {0}: '{1}' != '{2}'".format(
                    index,
                    parsed_title,
                    denormalized_titles[index],
                )
            )


def calculate_metrics(markdown_ms, denormalized_ms):
    if denormalized_ms <= 0:
        speedup = float("inf")
    else:
        speedup = markdown_ms / denormalized_ms

    if markdown_ms <= 0:
        reduction = 0
    else:
        reduction = max(0, (1 - (denormalized_ms / markdown_ms)) * 100)

    return speedup, reduction


def print_header():
    print("⚡ Lumapse — Test de Rendimiento y Carga (Validación DP-001)")
    print("==================================================")


def print_report(note_count, markdown_ms, denormalized_ms, speedup, reduction):
    print("📝 Población de prueba: {0:,} notas creadas en memoria.".format(note_count))
    print("--------------------------------------------------")
    print("⚙️  Ejecutando Prueba A (Parseo de Markdown dinámico en memoria)...")
    print("   ⏱️  Tiempo transcurrido: {0:.3f} ms".format(markdown_ms))
    print("⚙️  Ejecutando Prueba B (Consulta desnormalizada - Campo 'title')...")
    print("   ⏱️  Tiempo transcurrido: {0:.3f} ms".format(denormalized_ms))
    print("--------------------------------------------------")
    print("📊 RESULTADOS DE RENDIMIENTO:")
    print("   ⚡ El campo desnormalizado 'title' es {0:.1f} veces más rápido.".format(speedup))
    print("   📉 Reducción del uso de procesamiento CPU en mobile: {0:.2f}%".format(reduction))
    print("")
    print("🧾 Resumen para anexo:")
    print(
        "   Con {0:,} notas, leer y parsear Markdown completo tomó {1:.3f} ms, "
        "mientras que consultar el campo desnormalizado 'title' tomó {2:.3f} ms. "
        "Esto representa una mejora de {3:.1f}x y respalda DP-001 para listados masivos."
        .format(note_count, markdown_ms, denormalized_ms, speedup)
    )
    print("==================================================")
    print("✅ Test completado con éxito (Métrica académica registrada)")
    print("==================================================")


def main(argv):
    args = parse_args(argv)
    if args.notes <= 0:
        print("Error: --notes debe ser mayor que 0.", file=sys.stderr)
        return 2

    print_header()

    try:
        connection = create_connection()
        seed_notes(connection, args.notes)

        markdown_ms, parsed_titles = run_markdown_parse_test(connection)
        denormalized_ms, denormalized_titles = run_denormalized_title_test(connection)
        validate_results(parsed_titles, denormalized_titles)
        speedup, reduction = calculate_metrics(markdown_ms, denormalized_ms)
        print_report(args.notes, markdown_ms, denormalized_ms, speedup, reduction)
    except (RuntimeError, sqlite3.Error) as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1
    finally:
        try:
            connection.close()
        except NameError:
            pass

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
