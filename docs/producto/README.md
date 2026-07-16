# Documentación de Producto — Lumapse

**Última actualización:** 2026-07-15

Esta carpeta contiene la documentación centrada en el **usuario y el producto**, siguiendo los principios de **Design Thinking** como marco metodológico de diseño.

> **Lectura temporal:** Algunos artefactos conservan deliberadamente la formulación inicial PWA/IndexedDB como evidencia del proceso. Cada documento que fue afectado por el pivote distingue esa línea base del estado vigente: Capacitor, SQLite y APK Android.

> **¿Por qué Design Thinking?**
> Los documentos técnicos (ADRs, roadmap, metodología) responden al *cómo* se construye Lumapse.
> Esta carpeta responde al **por qué** y al **para quién**: valida que el producto resuelve un problema real, para personas reales, de una forma que las alternativas existentes no logran.

---

## Índice de documentos

| Documento | Fase Design Thinking | Descripción |
|---|---|---|
| [`personas.md`](./personas.md) | Empatizar | Perfiles arquetípicos de los usuarios objetivo |
| [`relevamiento-datos.md`](./relevamiento-datos.md) | Empatizar | Diseño del instrumento de encuesta — 12 preguntas + 1 condicional, ramificación, análisis previsto |
| [`metodologia-muestral.md`](./metodologia-muestral.md) | Empatizar | Fórmula de muestreo para poblaciones finitas, cálculo de n, escenarios y contingencia |
| [`problem-statement.md`](./problem-statement.md) | Definir | Declaración formal del problema que Lumapse resuelve |
| [`analisis-competitivo.md`](./analisis-competitivo.md) | Definir / Idear | Comparación con herramientas existentes y diferenciación |
| [`requisitos-funcionales.md`](./requisitos-funcionales.md) | Idear / Prototipar | Funcionalidades concretas del sistema (RF) — 28 requisitos |
| [`requisitos-no-funcionales.md`](./requisitos-no-funcionales.md) | Idear / Prototipar | Atributos de calidad del sistema (RNF) — 26 requisitos |
| [`historias-de-usuario.md`](./historias-de-usuario.md) | Idear / Prototipar | Historias de Usuario con Criterios de Aceptación — Hitos 02 a 05 y futuras formalizadas |
| [`lean-canvas.md`](./lean-canvas.md) | Idear | Modelo de negocio y propuesta de valor |
| [`resultados-relevamiento.md`](./resultados-relevamiento.md) | Empatizar / Definir | Resultados del análisis de 120 respuestas — hallazgos, cruces estadísticos, validación de artefactos y recomendaciones |
| [`decisiones-producto.md`](./decisiones-producto.md) | Transversal | Decisiones de diseño de producto documentadas |
| [`origen-del-nombre.md`](./origen-del-nombre.md) | Definir / Idear | Proceso creativo y justificación del nombre *Lumapse* |

### Materiales de distribución

La subcarpeta [`encuesta/`](./encuesta/) contiene los materiales para la distribución presencial y digital del relevamiento:

| Archivo | Uso |
|---|---|
| `qr-encuesta.png` | QR alta resolución para impresión (820×820px) |
| `qr-encuesta-small.png` | QR compacto para difusión por WhatsApp (410×410px) |
| `poster-encuesta.html` | Póster A4 imprimible (optimizado para B&W) |
| `encuesta_como_tomas_notas_ies_6023.pdf` | PDF listo para imprimir |

---

## Relación con las fases de Design Thinking

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  EMPATIZAR  │──▶│   DEFINIR   │──▶│    IDEAR    │──▶│ PROTOTIPAR  │──▶│   TESTEAR   │
│             │   │             │   │             │   │             │   │             │
│  Personas   │   │  Problem    │   │  Lean       │   │  Prototipo  │   │  Beta real  │
│  Relevamien-│   │  Statement  │   │  Canvas     │   │  evolutivo  │   │  + feedback │
│  to de Datos│   │  Análisis   │   │  Requisitos │   │  APK (Hitos │   │  final de   │
│  Metodología│   │  Competitivo│   │  RF / RNF   │   │  02-05)     │   │  Hito 06    │
│  Muestral   │   │             │   │  Historias  │   │             │   │             │
│             │   │             │   │  de Usuario │   │             │   │             │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

> **Nota:** Prototipar se materializó incrementalmente entre los Hitos 02 y 05. Hito 05 aportó una primera validación técnica y manual de la beta `v0.4.8`; la validación directa con usuarios, la revisión final de RNF y los ajustes de cierre pertenecen al Hito 06.

---

## Relación con los Diagramas UML

Los diagramas técnicos del sistema (Casos de Uso, Secuencia, Modelo de Dominio) se encuentran en [`docs/diagramas/`](../diagramas/). Estos diagramas traducen los requisitos y las historias de usuario documentados aquí en modelos visuales que guían la implementación.

| Artefacto de producto | Diagrama que lo consume |
|---|---|
| Personas → Actores | [Diagrama de Casos de Uso](../diagramas/casos-de-uso.md) |
| RF → Casos de Uso | [Diagrama de Casos de Uso](../diagramas/casos-de-uso.md) |
| HU → Flujos de interacción | [Diagrama de Secuencia](../diagramas/secuencia-crear-nota.md) |
| RF + RNF → Entidades del dominio | [Modelo de Dominio](../diagramas/modelo-dominio.md) |

---

*Documentación elaborada en el marco de Prácticas Profesionalizantes III · IES 6023 'Dr. Alfredo Loutaif' · 2026*
