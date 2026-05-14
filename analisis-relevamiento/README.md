# Análisis del Relevamiento de Datos — Lumapse

> **Fase Design Thinking:** Empatizar (validación cuantitativa)  
> **Dataset:** 121 respuestas · IES 6023 "Dr. Alfredo Loutaif" · Mayo 2026  
> **Nivel estadístico:** Confianza 95%, margen de error ~8.5%

---

## Objetivo

Analizar las respuestas del relevamiento de datos para validar —o refutar— las hipótesis de diseño formuladas en el Hito 01, y fundamentar con evidencia empírica las decisiones de producto y arquitectura de los hitos siguientes.

El análisis toma como entrada los datos crudos exportados desde Google Forms y produce como salida un informe de resultados documentado en [`docs/producto/resultados-relevamiento.md`](../docs/producto/resultados-relevamiento.md).

---

## Estructura de la carpeta

```
analisis-relevamiento/
├── README.md                  ← Este archivo
├── datos/                     ← Datos crudos exportados de Google Forms
│   └── respuestas_relevamiento_2026_05.csv
├── scripts/                   ← Scripts de análisis (Python)
│   ├── analizar.py            ← Script principal
│   └── requirements.txt      ← Dependencias del entorno
└── graficos/                  ← Gráficos generados por el script
```

---

## Herramientas y justificación

| Herramienta | Versión | Propósito | Justificación |
|---|---|---|---|
| **Python 3** | 3.10+ | Lenguaje del análisis | Estándar de la industria para análisis de datos. Ecosistema maduro con librerías especializadas |
| **pandas** | 2.2.3 | Lectura, limpieza, frecuencias y tablas cruzadas | Librería de referencia para datos tabulares. Permite operaciones complejas (crosstab, groupby) en pocas líneas |
| **matplotlib** | 3.9.4 | Generación de gráficos estáticos | Librería base de visualización en Python. Gráficos de calidad para informes sin dependencias adicionales |

**¿Por qué Python y no JavaScript?** Si bien el proyecto Lumapse está desarrollado en JavaScript, el análisis de datos es una tarea distinta que requiere herramientas especializadas. Python con pandas es el estándar reconocido para este tipo de trabajo; JavaScript no posee equivalentes maduros para análisis estadístico tabular.

**¿Por qué un entorno virtual?** El entorno virtual (`venv/`) aísla las dependencias del análisis del sistema operativo. Esto garantiza reproducibilidad: cualquier persona puede recrear el entorno exacto ejecutando los pasos de instalación.

---

## Cómo reproducir el análisis

```bash
# 1. Navegar a la carpeta
cd analisis-relevamiento

# 2. Crear y activar el entorno virtual
python3 -m venv venv
source venv/bin/activate    # macOS/Linux

# 3. Instalar dependencias
pip install -r scripts/requirements.txt

# 4. Ejecutar el script de análisis
python scripts/analizar.py
```

Los gráficos se generan automáticamente en `graficos/`.

---

## Flujo de trabajo

```
Datos crudos (CSV)          Script de análisis          Informe final
     │                           │                          │
     ▼                           ▼                          ▼
datos/respuestas_*.csv  →  scripts/analizar.py  →  docs/producto/resultados-relevamiento.md
                                 │
                                 ▼
                           graficos/*.png
```

1. El CSV contiene las 121 respuestas tal cual fueron exportadas de Google Sheets.
2. El script lee el CSV, limpia los datos, calcula frecuencias, genera tablas cruzadas y produce los gráficos.
3. Los resultados del script alimentan el informe final, que se ubica en la documentación de producto.

---

## Documentación relacionada

| Documento | Ubicación | Contenido |
|---|---|---|
| Diseño de la encuesta | [`relevamiento-datos.md`](../docs/producto/relevamiento-datos.md) | Preguntas, justificación, lógica de ramificación |
| Metodología muestral | [`metodologia-muestral.md`](../docs/producto/metodologia-muestral.md) | Fórmula, escenarios, tipo de muestreo |
| Bitácora de ejecución | [`encuesta/README.md`](../docs/producto/encuesta/README.md) | Canales de distribución, cronología, resultado |
| Informe de resultados | [`resultados-relevamiento.md`](../docs/producto/resultados-relevamiento.md) | Análisis, conclusiones y recomendaciones *(pendiente)* |
