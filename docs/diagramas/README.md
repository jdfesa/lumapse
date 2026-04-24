# Diagramas — Lumapse

Esta carpeta contiene los **diagramas técnicos y de análisis** del proyecto, utilizados para visualizar la arquitectura, el comportamiento y el dominio del sistema.

---

## Convenciones

- **Formato:** Los diagramas se documentan en Markdown con notación [Mermaid](https://mermaid.js.org/), que GitHub renderiza de forma nativa sin herramientas externas.
- **Estructura:** Cada archivo contiene el diagrama, la descripción de sus elementos y la justificación de las decisiones de modelado.
- **Nomenclatura:** `tipo-de-diagrama.md` (ej: `casos-de-uso.md`, `modelo-dominio.md`).

---

## Índice de Diagramas

| Diagrama | Tipo UML | Descripción |
|---|---|---|
| [`casos-de-uso.md`](./casos-de-uso.md) | Comportamiento | Actores del sistema y funcionalidades principales |
| [`secuencia-crear-nota.md`](./secuencia-crear-nota.md) | Comportamiento | Flujo de interacción al crear y auto-guardar una nota |
| [`modelo-dominio.md`](./modelo-dominio.md) | Estructura | Entidades del dominio y sus relaciones |

---

## Evolución prevista

| Hito | Diagramas a agregar |
|---|---|
| **02** (Junio) | Diagrama de componentes (arquitectura `src/`) |
| **03** (Julio) | Secuencia: flujo de export/import, registro de Service Worker |
| **05** (Septiembre) | Diagrama de despliegue (PWA → GitHub Pages) |

---

*Documentación técnica · Lumapse · PP3 · 2026*
