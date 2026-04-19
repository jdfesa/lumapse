# Documentación de Producto — Lumapse

Esta carpeta contiene la documentación centrada en el **usuario y el producto**, siguiendo los principios de **Design Thinking** como marco metodológico de diseño.

> **¿Por qué Design Thinking?**
> Los documentos técnicos (ADRs, roadmap, metodología) responden al *cómo* se construye Lumapse.
> Esta carpeta responde al **por qué** y al **para quién**: valida que el producto resuelve un problema real, para personas reales, de una forma que las alternativas existentes no logran.

---

## Índice de documentos

| Documento | Fase Design Thinking | Descripción |
|---|---|---|
| [`personas.md`](./personas.md) | Empatizar | Perfiles arquetípicos de los usuarios objetivo |
| [`problem-statement.md`](./problem-statement.md) | Definir | Declaración formal del problema que Lumapse resuelve |
| [`analisis-competitivo.md`](./analisis-competitivo.md) | Definir / Idear | Comparación con herramientas existentes y diferenciación |
| [`requisitos-funcionales.md`](./requisitos-funcionales.md) | Idear / Prototipar | Funcionalidades concretas del sistema (RF) |
| [`requisitos-no-funcionales.md`](./requisitos-no-funcionales.md) | Idear / Prototipar | Atributos de calidad del sistema (RNF) |
| [`lean-canvas.md`](./lean-canvas.md) | Idear | Modelo de negocio y propuesta de valor |

---

## Relación con las fases de Design Thinking

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  EMPATIZAR  │──▶│   DEFINIR   │──▶│    IDEAR    │──▶│ PROTOTIPAR  │──▶│   TESTEAR   │
│             │   │             │   │             │   │             │   │             │
│  Personas   │   │  Problem    │   │  Lean       │   │  PWA funcio-│   │  Feedback   │
│  Observación│   │  Statement  │   │  Canvas     │   │  nal (Hitos │   │  real de    │
│  Entrevistas│   │  Análisis   │   │  Requisitos │   │  02-05)     │   │  usuarios   │
│             │   │  Competitivo│   │  RF / RNF   │   │             │   │  (Hito 05)  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

> **Nota:** Las fases de Prototipar y Testear se materializan durante el desarrollo (Hitos 02-06).
> Los documentos de esta carpeta cubren las tres primeras fases (Empatizar, Definir, Idear) y serán actualizados con los hallazgos de las fases posteriores.

---

*Documentación elaborada en el marco de Prácticas Profesionalizantes III · IES 6023 'Dr. Alfredo Loutaif' · 2026*
