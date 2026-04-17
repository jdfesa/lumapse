# ADR-003: Metodología de Desarrollo — Kanban

**Fecha:** 2026-05-01  
**Estado:** Aceptado  
**Autores:** Jose David Sandoval

---

## Contexto

El proyecto Lumapse se desarrolla por **una sola persona** durante un período de 6 meses, en el marco de la materia Prácticas Profesionalizantes III. Era necesario definir una metodología de trabajo que: sea técnicamente correcta, sea aplicable en contexto unipersonal, sea verificable por el profesor semanalmente (vía GitHub), y permita entregas parciales.

## Opciones consideradas

### Scrum
Scrum es un framework ágil basado en sprints fijos (1-4 semanas) con roles diferenciados (Product Owner, Scrum Master, Development Team).

**Problema fundamental:** La Scrum Guide 2020 establece que un Scrum Team debe ser un equipo pequeño de personas, recomendando entre 3 y 9 miembros. Aplicar Scrum en un contexto unipersonal implica simular roles que no tienen sentido real, lo que va en contra de los principios del framework y resultaría académicamente cuestionable.

### Kanban
Sistema de gestión de flujo de trabajo visual, basado en principios simples: visualizar el trabajo, limitar el trabajo en curso (WIP) y mejorar el flujo.

**Ventajas en contexto unipersonal:**
- No requiere roles diferenciados
- Flujo continuo sin sprints fijos (más realista para trabajo individual)
- El tablero es inmediatamente comprensible para el profesor
- Documentación del flujo es orgánica

## Decisión

**Kanban** con las siguientes adaptaciones:

1. **Tablero en GitHub Projects** con columnas: `Backlog | En Curso | En Revisión | Hecho`
2. **WIP limit:** máximo 2 tareas simultáneas en "En Curso"
3. **Hitos mensuales** como puntos de entrega formal (equivalente a releases, no a sprints)
4. **Issues de GitHub** como unidad de trabajo, con labels: `feature`, `bug`, `docs`, `chore`, `milestone`
5. **Informe de hito** al cierre de cada mes: reflexión del avance y ajuste del backlog

## Por qué no Scrumban

Scrumban (híbrido Scrum + Kanban) fue considerado pero descartado porque:
- Agrega ambigüedad sobre qué elementos de cada framework se aplican
- No está formalmente estandarizado por ningún organismo (a diferencia de Kanban International o la Scrum Guide)
- Dificulta la defensa metodológica ante cuestionamientos técnicos

## Consecuencias

**Positivas:**
- Metodología defendible académicamente con respaldo teórico claro
- El tablero de GitHub Projects es visible para el profesor en cada revisión
- Flexibilidad para reordenar prioridades entre hitos
- Overhead mínimo (no hay ceremonies artificiales)

**Negativas:**
- Sin timebox fijos, puede haber riesgo de scope creep (se mitiga con WIP limits)
- Requiere disciplina personal para mantener el tablero actualizado

## Referencias

- Anderson, D. J. (2010). *Kanban: Successful Evolutionary Change for Your Technology Business.* Blue Hole Press.
- Schwaber, K. & Sutherland, J. (2020). *The Scrum Guide.* [scrumguides.org](https://scrumguides.org)
