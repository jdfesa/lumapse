"""
Análisis de Datos — Relevamiento Lumapse
=========================================
Script principal (orquestador). Importa y ejecuta cada módulo
de análisis en el orden correcto.

Entrada:  datos/respuestas_relevamiento_2026_05.csv (121 respuestas)
Salida:   - Tablas de frecuencias y cruces en consola
          - Gráficos en graficos/*.png

Ejecución:
    cd analisis-relevamiento
    source .venv/bin/activate
    python scripts/analizar.py

Módulos:
    config.py       → Constantes, rutas, paleta de colores
    limpieza.py     → Carga del CSV y limpieza de datos
    frecuencias.py  → Frecuencias simples y métricas clave
    cruces.py       → Tablas cruzadas (crosstabs)
    cualitativo.py  → Análisis de respuestas abiertas (P12)
    graficos.py     → Generación de gráficos PNG

Autor: José David Sandoval
Proyecto: Lumapse — Práctica Profesionalizante III
Institución: IES 6023 "Dr. Alfredo Loutaif"
"""

import sys
from pathlib import Path

# Agregar el directorio de scripts al path para los imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

from limpieza import cargar_y_limpiar
from frecuencias import frecuencias, metricas_clave
from cruces import tablas_cruzadas
from cualitativo import analisis_cualitativo
from graficos import generar_graficos


def main():
    """Orquesta el análisis completo del relevamiento."""
    print("=" * 60)
    print("  ANÁLISIS DEL RELEVAMIENTO DE DATOS — LUMAPSE")
    print("  IES 6023 'Dr. Alfredo Loutaif' · Mayo 2026")
    print("=" * 60)

    # Paso 1: Carga y limpieza
    df = cargar_y_limpiar()

    # Paso 2: Frecuencias simples
    resultados = frecuencias(df)

    # Paso 3: Métricas clave
    metricas = metricas_clave(df)

    # Paso 4: Tablas cruzadas
    cruces = tablas_cruzadas(df)

    # Paso 5: Análisis cualitativo
    comentarios = analisis_cualitativo(df)

    # Paso 6: Gráficos
    generar_graficos(df, resultados)

    # Resumen final
    print(f"\n{'='*60}")
    print("  ANÁLISIS COMPLETADO")
    print(f"  Respuestas analizadas: {len(df)}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
