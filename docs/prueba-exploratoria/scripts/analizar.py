#!/usr/bin/env python3
"""Recuenta la encuesta exploratoria sin modificar el CSV ni inferir dispositivos."""

import argparse
from collections import Counter
import csv
from datetime import datetime, timedelta, timezone
import hashlib
import io
import json
from pathlib import Path
import re


BASE = Path(__file__).resolve().parents[1]
CSV_ORIGINAL = BASE / "datos/respuestas_experiencia_2026_11.csv"
CABECERAS = (
    "Timestamp",
    "¿Hasta dónde llegaste con la prueba?",
    "¿Qué tan fácil o difícil te resultó usar Lumapse?",
    "¿En qué te resultó útil Lumapse, si te resultó útil?",
    "¿Cuál fue tu principal dificultad al usar Lumapse?",
    "¿Qué fue lo principal que te frenó para empezar a usar Lumapse?",
)
OPCIONES = {
    "P1": (
        "No llegué a instalarla.",
        "La instalé, pero no llegué a usarla.",
        "La usé y realicé sólo una parte del recorrido sugerido.",
        "La usé y realicé el recorrido sugerido.",
    ),
    "P2": ("Muy fácil.", "Fácil.", "Ni fácil ni difícil.", "Difícil.", "Muy difícil."),
    "P4": (
        "Ninguna.",
        "Crear o guardar notas.",
        "Organizar o encontrar mis notas.",
        "Usar el calendario o las fechas.",
        "Errores o cierres de la app.",
        "Otra dificultad.",
    ),
    "P5": (
        "Falta de tiempo.",
        "Dudas sobre la seguridad o la procedencia de la APK.",
        "Dificultades con la descarga o la instalación.",
        "Falta de orientación para empezar.",
        "Falta de interés en continuar con la prueba.",
        "Otro motivo.",
    ),
}
CON_USO = OPCIONES["P1"][2:]


def leer_fecha(texto):
    """Lee el formato exportado y su offset explícito, sin depender del locale."""
    patron = r"(\d{4})/(\d{2})/(\d{2}) (\d{1,2}):(\d{2}):(\d{2}) (AM|PM) GMT([+-]\d{1,2})"
    coincidencia = re.fullmatch(patron, texto)
    if not coincidencia:
        raise ValueError("Marca temporal con formato inesperado")
    anio, mes, dia, hora, minuto, segundo, periodo, offset = coincidencia.groups()
    if not 1 <= int(hora) <= 12:
        raise ValueError("Hora fuera del rango de 12 horas")
    hora_24 = int(hora) % 12 + (12 if periodo == "PM" else 0)
    return datetime(
        int(anio), int(mes), int(dia), hora_24, int(minuto), int(segundo),
        tzinfo=timezone(timedelta(hours=int(offset))),
    )


def frecuencias(filas, indice, pregunta):
    conteos = Counter(fila[indice].strip() for fila in filas)
    base = len(filas)
    return {
        "base": base,
        "opciones": [
            {"respuesta": opcion, "n": conteos[opcion],
             "porcentaje": round(100 * conteos[opcion] / base, 1) if base else None}
            for opcion in OPCIONES[pregunta]
        ],
    }


def analizar(ruta):
    datos = Path(ruta).read_bytes()
    filas = list(csv.reader(io.StringIO(datos.decode("utf-8-sig"), newline=""), strict=True))
    if not filas or tuple(filas[0]) != CABECERAS:
        raise ValueError("Cabeceras distintas de las seis columnas esperadas")
    originales = filas[1:]
    if not originales:
        raise ValueError("El CSV no contiene respuestas")
    fechas = []
    for numero, fila in enumerate(originales, 1):
        if len(fila) != len(CABECERAS):
            raise ValueError("R{:02d}: cantidad de columnas incorrecta".format(numero))
        valores = [celda.strip() for celda in fila]
        for pregunta, indice in (("P1", 1), ("P2", 2), ("P4", 4), ("P5", 5)):
            if valores[indice] and valores[indice] not in OPCIONES[pregunta]:
                raise ValueError("R{:02d}: opción desconocida en {}".format(numero, pregunta))
        if not valores[1]:
            raise ValueError("R{:02d}: falta P1".format(numero))
        con_uso = valores[1] in CON_USO
        obligatorias, no_mostradas = ((2, 3, 4), (5,)) if con_uso else ((5,), (2, 3, 4))
        if any(not valores[i] for i in obligatorias) or any(valores[i] for i in no_mostradas):
            raise ValueError("R{:02d}: respuestas incompatibles con el recorrido de P1".format(numero))
        try:
            fechas.append(leer_fecha(valores[0]))
        except ValueError as error:
            raise ValueError("R{:02d}: {}".format(numero, error)) from error

    usadas = [fila for fila in originales if fila[1].strip() in CON_USO]
    sin_uso = [fila for fila in originales if fila[1].strip() not in CON_USO]
    preguntas = {}
    for pregunta, indice, seleccion in (
        ("P1", 1, originales), ("P2", 2, usadas), ("P4", 4, usadas), ("P5", 5, sin_uso)
    ):
        preguntas[pregunta] = frecuencias(seleccion, indice, pregunta)
        preguntas[pregunta]["blancos_fuera_del_recorrido"] = len(originales) - len(seleccion)
    preguntas["P3"] = {
        "base": len(usadas), "blancos_fuera_del_recorrido": len(sin_uso),
        "respuestas": [
            {"id_fila": "R{:02d}".format(numero), "texto_original": fila[3]}
            for numero, fila in enumerate(originales, 1) if fila[1].strip() in CON_USO
        ],
    }
    cruces = {}
    for pregunta, indice, etapas in (("P2", 2, CON_USO), ("P5", 5, OPCIONES["P1"][:2])):
        cruces["P1_" + pregunta] = [
            {"etapa": etapa, **frecuencias(
                [fila for fila in originales if fila[1].strip() == etapa], indice, pregunta
            )}
            for etapa in etapas
        ]
    return {
        "fuente": {
            "archivo": Path(ruta).name, "bytes": len(datos),
            "sha256": hashlib.sha256(datos).hexdigest(),
            "columnas": len(CABECERAS), "filas_respuestas": len(originales),
        },
        "envios": {
            "primero": min(fechas).isoformat(), "ultimo": max(fechas).isoformat(),
            "por_fecha_registrada": dict(sorted(Counter(f.date().isoformat() for f in fechas).items())),
        },
        "calidad": {
            "filas_excluidas": 0,
            "duplicados_exactos_adicionales": len(originales) - len(set(map(tuple, originales))),
            "ramificacion_coherente": True,
        },
        "bases": {"total": len(originales), "con_uso": len(usadas), "sin_uso": len(sin_uso)},
        "preguntas": preguntas, "cruces": cruces,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", type=Path, default=CSV_ORIGINAL)
    parser.add_argument("--salida", type=Path, help="JSON derivado; sin esta opción, sólo stdout")
    argumentos = parser.parse_args()
    if argumentos.salida and argumentos.salida.resolve() == argumentos.csv.resolve():
        parser.error("La salida no puede sobrescribir el CSV de entrada")
    try:
        resumen = analizar(argumentos.csv)
        texto = json.dumps(resumen, ensure_ascii=False, indent=2) + "\n"
        if argumentos.salida:
            argumentos.salida.write_text(texto, encoding="utf-8")
        else:
            print(texto, end="")
    except (OSError, UnicodeError, csv.Error, ValueError) as error:
        parser.error(str(error))


if __name__ == "__main__":
    main()
