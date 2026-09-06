# Diagramas — Lumapse

Esta carpeta contiene las vistas visuales necesarias para explicar la arquitectura, el comportamiento y el dominio de Lumapse. Cada diagrama debe conservar una fuente editable y declarar si representa el estado vigente o una etapa histórica.

## Convenciones

- Los diagramas de arquitectura y comportamiento se escriben en Markdown con [Mermaid](https://mermaid.js.org/) para que puedan revisarse junto con el código.
- Los diagramas de [`database/`](./database/) siguen un flujo externo: Graphviz/edotor.net para el DER conceptual y dbdiagram.io para el modelo lógico. Las fuentes DOT y DBML son versionadas; las imágenes son exportaciones derivadas.
- Un diagrama no reemplaza la decisión técnica: las decisiones y sus consecuencias se justifican en [`../adr/`](../adr/).
- Las rutas y nombres deben declarar su frontera de versión. En este corte, los diagramas de comportamiento y arquitectura se reconciliaron con el tag publicado `v0.5.0` (`5840755`). Las imágenes de base de datos continúan siendo las exportaciones del 2026-07-15 porque el schema final no cambió; sus fuentes y verificadores se revalidaron contra el nuevo tag.

## Índice y estado

| Diagrama | Tipo | Estado | Propósito |
|---|---|---|---|
| [`arquitectura-componentes.md`](./arquitectura-componentes.md) | Arquitectura/componentes | Tag `v0.5.0`; ADR-008 y ADR-009 | Capas, dependencias, límites de plataforma y patrones aplicados |
| [`casos-de-uso.md`](./casos-de-uso.md) | Comportamiento | Alcance funcional `v0.5.0` | Actores y funcionalidades principales |
| [`secuencia-crear-nota.md`](./secuencia-crear-nota.md) | Secuencia | Flujo de `v0.5.0` | Creación, error y persistencia explícita de una nota |
| [`modelo-dominio.md`](./modelo-dominio.md) | Dominio | Dominio y nombres técnicos de `v0.5.0` | Entidades del dominio, servicios y relaciones |
| [`database/`](./database/) | Datos | Schema revalidado en `v0.5.0`; PNG exportados el 2026-07-15 | Modelo conceptual, normalización, modelo lógico y DDL SQLite |

## Estado para la presentación

Las imágenes del modelo conceptual y lógico fueron exportadas desde las fuentes vigentes, reemplazadas y revisadas el 2026-07-15. El control queda registrado así:

1. [x] validar las fuentes DOT/DBML contra el esquema vigente (completado el 2026-07-15);
2. [x] exportar nuevamente ambas imágenes con las herramientas externas indicadas;
3. [x] reemplazar los PNG derivados sin modificar manualmente su contenido;
4. [x] insertar las versiones verificadas en la documentación y el informe;
5. [x] registrar fecha, fuente y versión de la aplicación usadas para la exportación;
6. [ ] confirmar su legibilidad dentro de la maquetación final del PDF y las diapositivas.

El estado de las fuentes, el procedimiento externo y los criterios de aceptación están en [`database/README.md`](./database/README.md).

---

*Documentación técnica · Lumapse · PP3 · 2026*
