"""
Módulo de análisis cualitativo.
Categoriza las respuestas abiertas de P12 por temas y las segmenta
por carrera para detectar necesidades específicas por perfil.
"""

import pandas as pd

from config import CATEGORIAS_P12


def analisis_cualitativo(df: pd.DataFrame) -> pd.DataFrame:
    """
    Categoriza los comentarios abiertos de P12.

    Cada comentario se clasifica en una o más categorías temáticas
    según las palabras clave definidas en config.CATEGORIAS_P12.
    Los resultados se cruzan con la carrera (P2) para detectar
    necesidades diferenciadas por perfil académico.
    """
    comentarios = df[df["p12_comentarios"].notna()][
        ["p2_carrera_corta", "p12_comentarios"]
    ].copy()

    def categorizar(texto):
        """Asigna categorías temáticas a un comentario."""
        texto_lower = texto.lower()
        cats = []
        for cat, keywords in CATEGORIAS_P12.items():
            if any(kw in texto_lower for kw in keywords):
                cats.append(cat)
        return cats if cats else ["Otros"]

    comentarios["categorias"] = comentarios["p12_comentarios"].apply(
        categorizar
    )

    # Expandir categorías para conteo
    todas_cats = []
    for _, row in comentarios.iterrows():
        for cat in row["categorias"]:
            todas_cats.append({
                "categoria": cat,
                "carrera": row["p2_carrera_corta"]
            })
    df_cats = pd.DataFrame(todas_cats)

    # --- Imprimir resultados ---
    print(f"\n{'='*60}")
    print(f"  P12. ANÁLISIS CUALITATIVO ({len(comentarios)} comentarios)")
    print(f"{'='*60}")

    if len(df_cats) > 0:
        conteo_cats = df_cats["categoria"].value_counts()
        print("\nDistribución por categoría:")
        print(conteo_cats.to_string())

        print("\nCruce categoría × carrera:")
        cruce = pd.crosstab(df_cats["categoria"], df_cats["carrera"],
                            margins=True, margins_name="Total")
        print(cruce.to_string())

    print("\nComentarios textuales (por carrera):")
    for _, row in comentarios.iterrows():
        print(f"  [{row['p2_carrera_corta']}] "
              f"{row['p12_comentarios'][:100]}")

    return comentarios
