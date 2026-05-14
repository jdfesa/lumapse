"""
Módulo de carga y limpieza de datos.
Lee el CSV exportado de Google Forms, normaliza los valores y devuelve
un DataFrame listo para el análisis.
"""

import re
from io import StringIO

import pandas as pd

from config import CSV_PATH, COLUMNAS, ORDEN_UTILIDAD


def parsear_multirespuesta(serie: pd.Series) -> list[str]:
    """
    Parsea una columna multi-respuesta separada por comas,
    respetando comas dentro de paréntesis.

    Ejemplo: "No encuentro lo que busco, Me cuesta organizar el formato
    (títulos, listas, tablas, fórmulas)" → 2 elementos, no 5.
    """
    todas = []
    for valor in serie.dropna():
        if not valor.strip():
            continue
        items = re.split(r",\s*(?![^(]*\))", valor)
        todas.extend([item.strip() for item in items if item.strip()])
    return todas


def cargar_y_limpiar() -> pd.DataFrame:
    """
    Lee el CSV, aplica las reglas de limpieza y devuelve el DataFrame.

    Acciones:
    1. Normalizar line endings (Google exporta con \\r\\r\\n)
    2. Renombrar columnas a IDs cortos
    3. Excluir "Solo vengo a rendir" (criterio poblacional)
    4. Reclasificar turno doble en P1
    5. Reclasificar carrera doble en P2
    6. Mapear P7 de entero a etiqueta Likert
    """
    # Leer normalizando line endings
    contenido = CSV_PATH.read_text(encoding="utf-8")
    contenido = contenido.replace("\r\n", "\n").replace("\r", "\n")
    df = pd.read_csv(StringIO(contenido))

    # Renombrar columnas
    df.columns = COLUMNAS

    # --- Exclusión: "Solo vengo a rendir" ---
    mascara = df["p1_turno"].str.contains("Solo vengo a rendir",
                                          case=False, na=False)
    excluidos = mascara.sum()
    df = df[~mascara].reset_index(drop=True)
    print(f"[Limpieza] Registros excluidos ('Solo vengo a rendir'): {excluidos}")

    # --- P1: reclasificar turno doble → Tarde ---
    df["p1_turno"] = df["p1_turno"].replace(
        {"De 14 a 18 y en la noche de 19 a 23 hs": "Tarde (14 a 18hs)"}
    )
    turno_map = {
        "Mañana (8 a 12hs)": "Mañana",
        "Tarde (14 a 18hs)": "Tarde",
        "Noche (19 a 23hs)": "Noche",
    }
    df["p1_turno"] = df["p1_turno"].map(turno_map).fillna(df["p1_turno"])

    # --- P2: reclasificar carrera doble ---
    df["p2_carrera"] = df["p2_carrera"].replace({
        "Prof. en Lengua y Literatura/ Prof. Educación Especial":
            "Prof. en Lengua y Literatura"
    })
    carrera_map = {
        "Prof. Educación Especial": "Ed. Especial",
        "Prof. en Educación Primaria": "Ed. Primaria",
        "Prof. en Lengua y Literatura": "Lengua y Lit.",
        "Prof. de Danzas con orientación Folklorica": "Danzas",
        "Tec. en Analisis de Sistemas y Desarrollo de Software": "Sistemas",
        "Tec. Superior en Turismo": "Turismo",
    }
    df["p2_carrera_corta"] = df["p2_carrera"].map(carrera_map).fillna(
        df["p2_carrera"]
    )

    # --- P7: mapear a etiqueta Likert ---
    df["p7_utilidad_num"] = df["p7_utilidad"].astype(int)
    df["p7_utilidad"] = df["p7_utilidad_num"].map(ORDEN_UTILIDAD)

    n = len(df)
    print(f"[Limpieza] Respuestas válidas para análisis: {n}")
    return df
