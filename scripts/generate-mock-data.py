#!/usr/bin/env python3
"""
Lumapse — Generador de datos mock para SQLite
Genera 100 notas de prueba en SQL para pruebas de estrés de UI.
Uso: python3 scripts/generate-mock-data.py
"""

import datetime
import os
import random
import uuid


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIGRATIONS_DIR = os.path.join(PROJECT_ROOT, "src", "store", "migrations")
OUTPUT_FILENAME = "99999999_999999_seed_mock_data.sql"
OUTPUT_PATH = os.path.join(MIGRATIONS_DIR, OUTPUT_FILENAME)
RELATIVE_OUTPUT_PATH = "src/store/migrations/{}".format(OUTPUT_FILENAME)

NOTE_TITLES = [
    "Apuntes de Física",
    "Resumen de Historia",
    "Ideas para la Tesis",
    "Notas de Programación",
    "Guía de Matemática",
    "Conceptos de Base de Datos",
    "Lectura de Metodología",
    "Plan de Estudio Semanal",
    "Preguntas para el Parcial",
    "Síntesis de Arquitectura",
    "Mapa de Conceptos",
    "Notas de Investigación",
    "Checklist de Entrega",
    "Resumen de Clase",
    "Borrador de Informe Final",
]

TOPICS = [
    "persistencia local",
    "arquitectura offline-first",
    "gestión del conocimiento",
    "diseño de interfaz",
    "validación académica",
    "seguridad de datos",
    "experiencia móvil",
    "metodología de investigación",
    "pruebas de rendimiento",
    "organización de apuntes",
]


def sql_escape(value):
    return value.replace("'", "''")


def isoformat_z(value):
    return value.strftime("%Y-%m-%dT%H:%M:%SZ")


def random_timestamp_pair():
    now = datetime.datetime.utcnow().replace(microsecond=0)
    start = now - datetime.timedelta(days=180)
    total_seconds = int((now - start).total_seconds())
    created = start + datetime.timedelta(seconds=random.randint(0, total_seconds))
    updated = created + datetime.timedelta(seconds=random.randint(0, int((now - created).total_seconds())))
    return isoformat_z(created), isoformat_z(updated)


def random_content(index):
    topic = random.choice(TOPICS)
    return (
        "# Nota de prueba {index}\n\n"
        "Este es un apunte importante sobre {topic}.\n\n"
        "- Concepto clave: revisar definiciones principales.\n"
        "- Acción pendiente: relacionar con el informe final.\n"
        "- Observación: validar comportamiento en escenarios offline.\n\n"
        "## Reflexión\n"
        "La nota ayuda a probar rendimiento, renderizado Markdown y navegación del feed."
    ).format(index=index, topic=topic)


def build_note(index):
    created_at, updated_at = random_timestamp_pair()
    return {
        "id": str(uuid.uuid4()),
        "title": random.choice(NOTE_TITLES),
        "content": random_content(index),
        "created_at": created_at,
        "updated_at": updated_at,
        "is_pinned": 1 if random.random() < 0.10 else 0,
        "is_archived": 1 if random.random() < 0.20 else 0,
    }


def sql_value_tuple(note):
    values = (
        sql_escape(note["id"]),
        sql_escape(note["title"]),
        sql_escape(note["content"]),
        sql_escape(note["created_at"]),
        sql_escape(note["updated_at"]),
        note["is_pinned"],
        note["is_archived"],
    )
    return "('{}', '{}', '{}', '{}', '{}', {}, {})".format(*values)


def write_seed_file(notes):
    os.makedirs(MIGRATIONS_DIR, exist_ok=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as handle:
        handle.write("-- Migración: seed_mock_data\n")
        handle.write("-- Descripción: Inserta 100 notas de prueba para pruebas de rendimiento UI.\n")
        handle.write("-- ADVERTENCIA: Solo ejecutar en entorno de desarrollo.\n")
        handle.write("-- ==========================================\n")
        handle.write("-- UP (Aplicar cambios)\n")
        handle.write("-- ==========================================\n")
        handle.write("INSERT INTO notes (id, title, content, created_at, updated_at, is_pinned, is_archived) VALUES \n")

        for index, note in enumerate(notes):
            suffix = "," if index < len(notes) - 1 else ";"
            handle.write("{}{}\n".format(sql_value_tuple(note), suffix))

        handle.write("-- ==========================================\n")
        handle.write("-- DOWN (Revertir cambios)\n")
        handle.write("-- ==========================================\n")
        handle.write("DELETE FROM notes WHERE id IN (")
        handle.write(", ".join("'{}'".format(sql_escape(note["id"])) for note in notes))
        handle.write(");\n")


def main():
    print("🌱 Generando 100 registros de prueba...")
    notes = [build_note(index) for index in range(1, 101)]
    write_seed_file(notes)
    print("✅ Archivo SQL generado: {}".format(RELATIVE_OUTPUT_PATH))
    print("⚠️ ADVERTENCIA: Recuerda no ejecutar este script en producción.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
