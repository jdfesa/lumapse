# ADR-003: Enfoque de Desarrollo y Gestión del Flujo — Kanban Adaptado

**Fecha:** 2026-05-01  
**Última revisión metodológica:** 2026-08-11  
**Estado:** Aceptado, revisado  
**Autor:** Jose David Sandoval

---

## Contexto

Lumapse se desarrolla por **una sola persona** durante el ciclo académico de Prácticas Profesionalizantes III. El proceso debía permitir entregas incrementales, reordenar prioridades cuando aparecieran nuevos datos, limitar la dispersión y dejar evidencia verificable para el seguimiento docente.

En este ADR, **enfoque de desarrollo** designa la forma general de construir el producto —ágil, iterativa e incremental— y **Kanban** designa la estrategia utilizada para gestionar el flujo de trabajo. Esta precisión evita presentar Kanban como un proceso prescriptivo equivalente a Scrum o RUP.

## Opciones consideradas

### Scrum

Scrum es un framework ágil que define un Scrum Team con tres responsabilidades —Developers, Product Owner y Scrum Master—, trabajo en Sprints de un mes o menos, cinco eventos y tres artefactos con sus compromisos (Schwaber & Sutherland, 2020).

La edición 2020 de la Scrum Guide indica que un Scrum Team tiene **típicamente diez personas o menos**; no establece un mínimo numérico explícito. La formulación anterior de este ADR mezclaba esa edición con la guía de 2017, que sí discutía un rango de tres a nueve integrantes para el *Development Team*, no para el Scrum Team completo.

Por lo tanto, la decisión de no usar Scrum **no se fundamenta en que una persona tenga prohibido utilizarlo**. Una persona puede adoptar prácticas inspiradas en Scrum o intentar asumir varias responsabilidades. Sin embargo, para afirmar que el proyecto aplica Scrum deberían existir de manera reconocible sus Sprints, responsabilidades, eventos, artefactos y compromisos. Lumapse no organizó el trabajo mediante Sprints, Sprint Goals, Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective. Simular esa estructura solo para asignarle la etiqueta Scrum no describiría el proceso real.

### Rational Unified Process (RUP)

RUP es un proceso iterativo e incremental organizado en las fases Inicio, Elaboración, Construcción y Transición, con disciplinas, roles y artefactos adaptables al proyecto. Lumapse produce requisitos, casos de uso, diagramas y documentación de arquitectura, pero esos artefactos por sí solos no constituyen una aplicación de RUP. El cronograma y la gestión no se estructuraron formalmente según sus fases y disciplinas.

### Kanban

Kanban es una estrategia para optimizar el flujo de valor mediante tres prácticas relacionadas: definir y visualizar el flujo, gestionar activamente los elementos e introducir mejoras sobre el sistema (Kanban Guides, 2025). No prescribe roles ni iteraciones de duración fija, por lo que resulta proporcional a un proyecto individual y permite conservar una cadencia académica sin convertirla en Sprints.

## Decisión

Adoptar un **enfoque ágil, iterativo e incremental, con un sistema de gestión del trabajo basado en Kanban y adaptado al contexto académico unipersonal**.

La definición operativa vigente se mantiene en [`../gestion/definicion-flujo-kanban.md`](../gestion/definicion-flujo-kanban.md). Sus elementos principales son:

1. **Visualización:** `Backlog | En Curso | En Revisión | Hecho`.
2. **Unidad de trabajo:** elemento trazable con objetivo y criterio de cierre; puede estar respaldado por un issue de GitHub, un ítem del proyecto o una tarea versionada en `TODO`/`BACKLOG.md`.
3. **Sistema pull:** no se inicia un elemento nuevo si no existe capacidad disponible.
4. **Control WIP vigente:** máximo dos elementos activos en total entre `En Curso` y `En Revisión`.
5. **Políticas explícitas:** prioridad por valor, riesgo y dependencia; revisión antes de terminar; validación y trazabilidad como condición de cierre.
6. **Hitos académicos:** puntos de revisión, línea base y entrega; no son Sprints ni alteran el flujo continuo.
7. **Mejora continua:** informes de hito, retrospectiva individual y ajuste del backlog.

GitHub Projects proporciona la vista del flujo. `TODO`, `BACKLOG.md`, `CHANGELOG.md`, los informes de hito, los ADR y el historial Git aportan evidencia versionada complementaria; no deben utilizarse para presentar estados contradictorios del mismo trabajo.

## Alcance y límites de la adopción

Durante la mayor parte del desarrollo se aplicaron visualización, priorización continua, límite WIP e inspección por hitos, pero no se conservaron de manera completa las cuatro métricas de flujo exigidas por la guía de Kanban vigente: WIP, *throughput*, edad del elemento y tiempo de ciclo. Los Story Points entregados por hito miden alcance/capacidad académica y **no sustituyen** esas métricas.

Por rigor, Lumapse se presenta como una **aplicación adaptada o basada en Kanban**, no como una implementación históricamente conforme con cada regla de la Kanban Guide 2025. Desde Hito 06, la definición de flujo incorpora las métricas mínimas y una expectativa de nivel de servicio provisional, sin inventar fechas ni métricas retroactivas.

## Por qué no Scrumban

No se adopta la etiqueta Scrumban porque Lumapse no usa Sprints ni los eventos y artefactos de Scrum como base del proceso. Story Points, historias de usuario e hitos son técnicas complementarias y material de planificación académica; su presencia no convierte el flujo en Scrum ni en un híbrido Scrum–Kanban.

## Consecuencias

### Positivas

- La descripción coincide con el proceso realmente ejecutado.
- El tablero y la evidencia versionada permiten inspección docente.
- El WIP acotado reduce dispersión en un proyecto individual.
- Los hitos conservan trazabilidad académica sin imponer Sprints ficticios.
- Las limitaciones métricas quedan documentadas sin reconstruir evidencia inexistente.

### Costos y riesgos

- Mantener tablero y documentos sincronizados requiere disciplina.
- La falta de métricas históricas completas limita el análisis cuantitativo del flujo anterior a Hito 06.
- Sin timeboxes de Sprint existe riesgo de crecimiento de alcance; se mitiga mediante WIP, prioridades y política explícita de cierre.
- La expresión abreviada “usamos Kanban” debe acompañarse con la aclaración “adaptado al contexto individual” para no sobreafirmar conformidad.

## Evidencia verificable

- [`../gestion/definicion-flujo-kanban.md`](../gestion/definicion-flujo-kanban.md) — definición del flujo, políticas y métricas.
- [`../informe-final/02-marco-metodologico.md`](../informe-final/02-marco-metodologico.md) — fundamentación académica.
- [`../../TODO`](../../TODO) y [`../../BACKLOG.md`](../../BACKLOG.md) — trabajo activo y deuda priorizada.
- [`../hitos/`](../hitos/) — revisiones y entregas incrementales.
- [`../../CHANGELOG.md`](../../CHANGELOG.md) — incrementos y cambios publicados/no publicados.
- [`.github/ISSUE_TEMPLATE/`](../../.github/ISSUE_TEMPLATE/) — plantillas de trabajo y trazabilidad.

## Referencias

- Anderson, D. J. (2010). *Kanban: Successful Evolutionary Change for Your Technology Business*. Blue Hole Press.
- IBM. (s. f.). *Project planning*. https://www.ibm.com/docs/en/rational-clearquest/10.0.9?topic=settings-project-planning
- Kanban Guides. (2025). *The Kanban Guide*. https://kanbanguides.org/the-kanban-guide/
- Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide*. https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf
