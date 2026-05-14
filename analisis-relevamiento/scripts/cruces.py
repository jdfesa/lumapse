"""
Módulo de tablas cruzadas (crosstabs).
Genera los 6 cruces estadísticos definidos en el plan de análisis
para detectar relaciones entre variables.
"""

import re

import pandas as pd


def tablas_cruzadas(df: pd.DataFrame) -> dict:
    """
    Genera las 6 tablas cruzadas y las imprime.
    Devuelve un diccionario con los DataFrames resultantes.
    """
    cruces = {}

    def _crosstab(nombre, fila, col, filtro=None):
        """Helper: genera e imprime un crosstab."""
        data = df if filtro is None else df[filtro]
        tabla = pd.crosstab(data[fila], data[col], margins=True,
                            margins_name="Total")
        print(f"\n{'='*60}")
        print(f"  CRUCE: {nombre} (n={len(data)})")
        print(f"{'='*60}")
        print(tabla.to_string())
        cruces[nombre] = tabla
        return tabla

    # ------------------------------------------------------------------
    # Cruce 1: Turno × Dificultades (requiere expandir P5b)
    # ------------------------------------------------------------------
    con_dif = df[df["p5_dificultad"] == "Si"].copy()
    if len(con_dif) > 0:
        filas_expandidas = []
        for _, row in con_dif.iterrows():
            items = re.split(r",\s*(?![^(]*\))", str(row["p5b_cuales"]))
            for item in items:
                item = item.strip()
                if item:
                    filas_expandidas.append({
                        "turno": row["p1_turno"],
                        "dificultad": item
                    })
        df_exp = pd.DataFrame(filas_expandidas)
        tabla = pd.crosstab(df_exp["dificultad"], df_exp["turno"],
                            margins=True, margins_name="Total")
        print(f"\n{'='*60}")
        print(f"  CRUCE: Turno × Dificultades (n={len(con_dif)})")
        print(f"{'='*60}")
        print(tabla.to_string())
        cruces["turno_x_dificultades"] = tabla

    # ------------------------------------------------------------------
    # Cruce 2: Carrera × Dispositivo
    # ------------------------------------------------------------------
    _crosstab("carrera_x_dispositivo", "p2_carrera_corta", "p9_dispositivo")

    # ------------------------------------------------------------------
    # Cruce 3: Dispositivo × Organización
    # ------------------------------------------------------------------
    _crosstab("dispositivo_x_organizacion", "p9_dispositivo",
              "p11_organizacion")

    # ------------------------------------------------------------------
    # Cruce 4: Edad × Método de notas
    # ------------------------------------------------------------------
    _crosstab("edad_x_metodo", "p3_edad", "p4_metodo")

    # ------------------------------------------------------------------
    # Cruce 5: Edad × Features (requiere expandir P8)
    # ------------------------------------------------------------------
    filas_feat = []
    for _, row in df.iterrows():
        items = re.split(r",\s*(?![^(]*\))", str(row["p8_features"]))
        for item in items:
            item = item.strip()
            if item and item != "nan":
                filas_feat.append({
                    "edad": row["p3_edad"],
                    "feature": item
                })
    df_feat = pd.DataFrame(filas_feat)
    tabla = pd.crosstab(df_feat["feature"], df_feat["edad"],
                        margins=True, margins_name="Total")
    print(f"\n{'='*60}")
    print(f"  CRUCE: Edad × Features (n={len(df)})")
    print(f"{'='*60}")
    print(tabla.to_string())
    cruces["edad_x_features"] = tabla

    # ------------------------------------------------------------------
    # Cruce 6: Método actual × Dispositivo deseado
    # ------------------------------------------------------------------
    _crosstab("metodo_x_dispositivo", "p4_metodo", "p9_dispositivo")

    return cruces
