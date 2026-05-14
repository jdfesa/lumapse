"""
Módulo de cálculo de frecuencias y métricas clave.
Genera tablas de frecuencias absolutas y relativas para cada pregunta,
y calcula las métricas agregadas del relevamiento.
"""

import pandas as pd

from config import ORDEN_INTERNET, ORDEN_EDAD, ORDEN_UTILIDAD
from limpieza import parsear_multirespuesta


def _tabla(serie, base, nombre):
    """Genera e imprime una tabla de frecuencias."""
    conteo = serie.value_counts()
    tabla = pd.DataFrame({
        "n": conteo,
        "%": (conteo / base * 100).round(1)
    })
    print(f"\n{'='*60}")
    print(f"  {nombre} (base: {base})")
    print(f"{'='*60}")
    print(tabla.to_string())
    return tabla


def frecuencias(df: pd.DataFrame) -> dict:
    """
    Calcula frecuencias absolutas y relativas para cada pregunta.
    Devuelve un diccionario con las tablas generadas.
    """
    resultados = {}
    n = len(df)

    # P1 — Turno
    resultados["p1"] = _tabla(df["p1_turno"], n, "P1. Turno")

    # P2 — Carrera
    resultados["p2"] = _tabla(df["p2_carrera_corta"], n, "P2. Carrera")

    # P3 — Edad (ordenada)
    edad_cat = pd.Categorical(df["p3_edad"], categories=ORDEN_EDAD,
                              ordered=True)
    resultados["p3"] = _tabla(pd.Series(edad_cat), n, "P3. Rango de edad")

    # P4 — Método de notas
    resultados["p4"] = _tabla(df["p4_metodo"], n,
                              "P4. Método de toma de notas")

    # P5 — Dificultad (base: solo quienes toman notas)
    toman_notas = df[df["p4_metodo"] != "No tomo notas"]
    base_p5 = len(toman_notas)
    resultados["p5"] = _tabla(
        toman_notas["p5_dificultad"], base_p5,
        f"P5. ¿Dificultad con notas? (base: toman notas = {base_p5})"
    )

    # P5b — Dificultades concretas (multi-respuesta)
    con_dificultad = df[df["p5_dificultad"] == "Si"]
    base_p5b = len(con_dificultad)
    items_p5b = parsear_multirespuesta(con_dificultad["p5b_cuales"])
    conteo_p5b = pd.Series(items_p5b).value_counts()
    tabla_p5b = pd.DataFrame({
        "n": conteo_p5b,
        "%": (conteo_p5b / base_p5b * 100).round(1)
    })
    print(f"\n{'='*60}")
    print(f"  P5b. Dificultades concretas (base: con dificultad = {base_p5b})")
    print(f"{'='*60}")
    print(tabla_p5b.to_string())
    resultados["p5b"] = tabla_p5b

    # P6 — Internet (ordenada)
    internet_cat = pd.Categorical(df["p6_internet"],
                                  categories=ORDEN_INTERNET, ordered=True)
    resultados["p6"] = _tabla(pd.Series(internet_cat), n,
                              "P6. Acceso a internet")

    # P7 — Utilidad percibida (ordenada)
    utilidad_orden = list(ORDEN_UTILIDAD.values())
    utilidad_cat = pd.Categorical(df["p7_utilidad"],
                                  categories=utilidad_orden, ordered=True)
    resultados["p7"] = _tabla(pd.Series(utilidad_cat), n,
                              "P7. Utilidad percibida")

    # P8 — Features (multi-respuesta)
    items_p8 = parsear_multirespuesta(df["p8_features"])
    conteo_p8 = pd.Series(items_p8).value_counts()
    tabla_p8 = pd.DataFrame({
        "n": conteo_p8,
        "%": (conteo_p8 / n * 100).round(1)
    })
    print(f"\n{'='*60}")
    print(f"  P8. Features prioritarias (base: {n}, multi-respuesta)")
    print(f"{'='*60}")
    print(tabla_p8.to_string())
    resultados["p8"] = tabla_p8

    # P9 — Dispositivo
    resultados["p9"] = _tabla(df["p9_dispositivo"], n,
                              "P9. Dispositivo preferido")

    # P10 — Prototipo
    resultados["p10"] = _tabla(df["p10_prototipo"], n,
                               "P10. ¿Probaría prototipo?")

    # P11 — Organización
    resultados["p11"] = _tabla(df["p11_organizacion"], n,
                               "P11. Organización preferida")

    return resultados


def metricas_clave(df: pd.DataFrame) -> dict:
    """Calcula métricas agregadas del relevamiento."""
    n = len(df)
    toman_notas = df[df["p4_metodo"] != "No tomo notas"]

    metricas = {
        "n_total": n,
        "media_utilidad": df["p7_utilidad_num"].mean().round(2),
        "mediana_utilidad": df["p7_utilidad_num"].median(),
        "pct_conectividad_deficiente": (
            df["p6_internet"].isin(["A veces", "Raramente", "Nunca"]).sum()
            / n * 100
        ),
        "pct_probaria": (
            df["p10_prototipo"].isin(["Sí", "Tal vez"]).sum() / n * 100
        ),
        "pct_con_dificultad": (
            toman_notas["p5_dificultad"].eq("Si").sum()
            / len(toman_notas) * 100
        ),
        "pct_celular": (
            df["p9_dispositivo"].eq("Celular").sum() / n * 100
        ),
        "tasa_p12": (
            df["p12_comentarios"].notna().sum() / n * 100
        ),
    }

    print(f"\n{'='*60}")
    print(f"  MÉTRICAS CLAVE")
    print(f"{'='*60}")
    for k, v in metricas.items():
        print(f"  {k}: {v:.1f}" if isinstance(v, float) else f"  {k}: {v}")

    return metricas
