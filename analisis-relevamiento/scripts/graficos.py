"""
Módulo de generación de gráficos.
Produce 12 gráficos PNG con el estilo visual del sistema de diseño
de Lumapse, listos para insertar en el informe de resultados.
"""

import matplotlib
matplotlib.use("Agg")  # Backend sin GUI para generar PNGs
import matplotlib.pyplot as plt
import pandas as pd

from config import (
    GRAFICOS_DIR, COLOR_FONDO, COLOR_TEXTO, COLOR_ACENTO,
    COLOR_SECUNDARIO, COLOR_TERCIARIO, PALETA,
)


def _configurar_estilo():
    """Configura el estilo visual global de matplotlib."""
    plt.rcParams.update({
        "figure.facecolor": COLOR_FONDO,
        "axes.facecolor": COLOR_FONDO,
        "axes.edgecolor": COLOR_TEXTO,
        "axes.labelcolor": COLOR_TEXTO,
        "text.color": COLOR_TEXTO,
        "xtick.color": COLOR_TEXTO,
        "ytick.color": COLOR_TEXTO,
        "font.family": "sans-serif",
        "font.size": 11,
        "figure.dpi": 150,
    })


def _guardar(fig, nombre):
    """Guarda un gráfico en la carpeta de salida."""
    ruta = GRAFICOS_DIR / f"{nombre}.png"
    fig.savefig(ruta, bbox_inches="tight", facecolor=COLOR_FONDO)
    plt.close(fig)
    print(f"  ✓ {ruta.name}")


def _barras_h(datos, titulo, nombre, color=COLOR_ACENTO, base=None):
    """Gráfico de barras horizontales con etiquetas de valor y %."""
    fig, ax = plt.subplots(figsize=(10, max(4, len(datos) * 0.6)))
    y_pos = range(len(datos))
    ax.barh(y_pos, datos.values, color=color, edgecolor="none", height=0.6)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(datos.index, fontsize=10)
    ax.invert_yaxis()
    ax.set_title(titulo, fontsize=14, fontweight="bold", pad=15)
    ax.set_xlabel("Respuestas")

    b = base or datos.sum()
    for i, v in enumerate(datos.values):
        pct = v / b * 100
        ax.text(v + 0.5, i, f"{v} ({pct:.0f}%)", va="center", fontsize=9)

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    _guardar(fig, nombre)


def _torta(datos, titulo, nombre):
    """Gráfico de torta con porcentajes."""
    fig, ax = plt.subplots(figsize=(8, 6))
    colores = PALETA[:len(datos)]
    labels = [
        f"{idx}\n{v} ({v / datos.sum() * 100:.0f}%)"
        for idx, v in datos.items()
    ]
    ax.pie(datos.values, labels=labels, colors=colores, startangle=90,
           textprops={"fontsize": 10, "color": COLOR_TEXTO})
    ax.set_title(titulo, fontsize=14, fontweight="bold", pad=15)
    _guardar(fig, nombre)


def generar_graficos(df: pd.DataFrame, resultados: dict):
    """
    Genera los 12 gráficos definidos en el plan de análisis.

    Args:
        df: DataFrame limpio con las respuestas.
        resultados: Diccionario de tablas de frecuencias (de frecuencias.py).
    """
    _configurar_estilo()
    GRAFICOS_DIR.mkdir(exist_ok=True)
    n = len(df)

    print(f"\n{'='*60}")
    print(f"  GENERANDO GRÁFICOS")
    print(f"{'='*60}")

    # 1. Turno
    _barras_h(resultados["p1"]["n"],
              "P1. Distribución por turno", "turno", base=n)

    # 2. Carrera
    _barras_h(resultados["p2"]["n"],
              "P2. Distribución por carrera", "carrera",
              color=COLOR_SECUNDARIO, base=n)

    # 3. Edad
    _barras_h(resultados["p3"]["n"],
              "P3. Rango de edad", "edad",
              color=COLOR_TERCIARIO, base=n)

    # 4. Método de notas
    _barras_h(resultados["p4"]["n"],
              "P4. Método de toma de notas", "metodo_notas", base=n)

    # 5. Dificultad (torta)
    _torta(resultados["p5"]["n"],
           "P5. ¿Dificultad con la toma de notas?", "dificultad")

    # 6. Dificultades detalle
    _barras_h(resultados["p5b"]["n"],
              "P5b. Principales dificultades",
              "dificultades_detalle", color="#f472b6")

    # 7. Internet
    _barras_h(resultados["p6"]["n"],
              "P6. Acceso estable a internet", "internet",
              color="#fb923c", base=n)

    # 8. Utilidad percibida
    _barras_h(resultados["p7"]["n"],
              "P7. Utilidad percibida (escala 1-5)", "utilidad",
              color=COLOR_ACENTO, base=n)

    # 9. Features
    _barras_h(resultados["p8"]["n"],
              "P8. Características más valoradas (multi-respuesta)",
              "features", color=COLOR_SECUNDARIO, base=n)

    # 10. Dispositivo
    _barras_h(resultados["p9"]["n"],
              "P9. Dispositivo preferido", "dispositivo",
              color=COLOR_TERCIARIO, base=n)

    # 11. Prototipo (torta)
    _torta(resultados["p10"]["n"],
           "P10. ¿Probaría un prototipo?", "prototipo")

    # 12. Organización
    _barras_h(resultados["p11"]["n"],
              "P11. Organización preferida", "organizacion",
              color="#818cf8", base=n)
