# Diagramas — Lumapse

Esta carpeta contiene los **diagramas técnicos y de análisis** del proyecto, utilizados para visualizar la arquitectura, el comportamiento y el dominio del sistema.

---

## Convenciones

- **Formato principal:** Los diagramas UML del proyecto se documentan en Markdown con notación [Mermaid](https://mermaid.js.org/), que GitHub renderiza de forma nativa sin herramientas externas.
- **Excepción de base de datos:** Los diagramas de [`database/`](./database/) siguen un flujo específico con fuentes DOT/DBML e imágenes exportadas: DER Chen con Graphviz/edotor.net y modelo lógico relacional con dbdiagram.io. Ese flujo está documentado en [`database/README.md`](./database/README.md).
- **Estructura:** Cada archivo contiene el diagrama, la descripción de sus elementos y la justificación de las decisiones de modelado.
- **Nomenclatura:** `tipo-de-diagrama.md` (ej: `casos-de-uso.md`, `modelo-dominio.md`).

---

## Índice de Diagramas

| Diagrama | Tipo UML | Descripción |
|---|---|---|
| [`casos-de-uso.md`](./casos-de-uso.md) | Comportamiento | Actores del sistema y funcionalidades principales |
| [`secuencia-crear-nota.md`](./secuencia-crear-nota.md) | Comportamiento | Flujo de interacción al crear una nota con borrador persistente |
| [`modelo-dominio.md`](./modelo-dominio.md) | Estructura | Entidades del dominio y sus relaciones |
| [`database/`](./database/) | Datos | Modelo conceptual Chen, normalización, modelo lógico DBML y DDL físico SQLite |

---

## Evolución prevista

| Hito | Diagramas a agregar |
|---|---|
| **02** (Junio) | Diagrama de componentes (arquitectura `src/`) |
| **03** (Julio) | Registro de Service Worker del alcance PWA original |
| **05** (Septiembre) | Diagrama de despliegue APK |

---

*Documentación técnica · Lumapse · PP3 · 2026*
