"""
Configuración central del análisis.
Rutas, constantes, paleta de colores y mapeos reutilizados por todos los módulos.
"""

from pathlib import Path

# ---------------------------------------------------------------------------
# Rutas
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
DATOS_DIR = BASE_DIR / "datos"
GRAFICOS_DIR = BASE_DIR / "graficos"
CSV_PATH = DATOS_DIR / "respuestas_relevamiento_2026_05.csv"

# ---------------------------------------------------------------------------
# Diseño visual (sistema de diseño Lumapse)
# ---------------------------------------------------------------------------
COLOR_FONDO = "#1a1a2e"
COLOR_TEXTO = "#e0e0e0"
COLOR_ACENTO = "#a3e635"
COLOR_SECUNDARIO = "#4ade80"
COLOR_TERCIARIO = "#22d3ee"
PALETA = ["#a3e635", "#4ade80", "#22d3ee", "#818cf8", "#f472b6",
          "#fb923c", "#facc15", "#94a3b8"]

# ---------------------------------------------------------------------------
# Nombres cortos para columnas del CSV
# ---------------------------------------------------------------------------
COLUMNAS = [
    "timestamp", "p1_turno", "p2_carrera", "p3_edad", "p4_metodo",
    "p5_dificultad", "p5b_cuales", "p6_internet", "p7_utilidad",
    "p8_features", "p9_dispositivo", "p10_prototipo", "p11_organizacion",
    "p12_comentarios"
]

# ---------------------------------------------------------------------------
# Órdenes lógicos para escalas ordinales
# ---------------------------------------------------------------------------
ORDEN_INTERNET = ["Siempre", "Casi siempre", "A veces", "Raramente", "Nunca"]
ORDEN_EDAD = ["18-22", "23-27", "28-35", "36-45", "46 o más"]
ORDEN_UTILIDAD = {1: "Nada útil", 2: "Poco útil", 3: "Algo útil",
                  4: "Útil", 5: "Muy útil"}

# ---------------------------------------------------------------------------
# Categorías para análisis cualitativo de P12
# ---------------------------------------------------------------------------
CATEGORIAS_P12 = {
    "Fórmulas / contenido técnico": [
        "fórmula", "ecuacion", "diagrama", "sintagma", "latín"
    ],
    "Planificaciones docentes": [
        "planificaci", "didáctica"
    ],
    "Multimedia (fotos, audio)": [
        "foto", "imagen", "audio", "grabador", "voz"
    ],
    "Organización avanzada": [
        "mapa", "esquema", "cuadro", "sinóptico", "jerárquic"
    ],
    "Velocidad de captura": [
        "rápid", "velocidad", "tiempo", "no me da"
    ],
    "Agenda / calendario": [
        "fecha", "parcial", "horario", "agenda"
    ],
    "Recuperación / historial": [
        "recuperar", "guardar", "correcciones", "elimino"
    ],
    "Conectividad": [
        "internet", "acceso"
    ],
    "Positivos / apoyo": [
        "éxito", "buena idea", "app"
    ],
}
