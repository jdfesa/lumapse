# Definición de Flujo Kanban — Lumapse

> **Estado:** Vigente desde Hito 06  
> **Fecha de formalización:** 2026-08-11  
> **Decisión asociada:** [ADR-003](../adr/ADR-003-metodologia-kanban.md)  
> **Alcance:** Gestión del trabajo de desarrollo, documentación, validación y preparación de defensa

## 1. Propósito y alcance

Este documento formaliza la **Definition of Workflow (DoW)** de Lumapse tomando como referencia la Kanban Guide 2025. No reescribe la historia del proyecto ni atribuye métricas inexistentes a etapas anteriores: vuelve explícitas las políticas ya utilizadas y agrega el control mínimo necesario para el trabajo restante de Hito 06.

El autor del proyecto es el único miembro operativo del sistema. Docentes, estudiantes que participen de validaciones y tribunal son *stakeholders*: aportan criterios, feedback o evaluación, pero no se simulan como integrantes de un Scrum Team.

## 2. Unidad de trabajo

Un **elemento de trabajo** es una tarea trazable que produce una salida verificable. Puede estar representado por un issue de GitHub, un ítem de GitHub Projects o una tarea versionada en `TODO`/`BACKLOG.md`, pero debe aparecer en la vista de flujo activa para consumir capacidad.

Cada elemento debe declarar, como mínimo:

- objetivo o problema que resuelve;
- tipo (`feature`, `bug`, `docs`, `test`, `chore` o `release`);
- criterio de aceptación o cierre;
- dependencias conocidas;
- evidencia esperada, cuando corresponda.

Un hito, una épica o una idea futura no se contabilizan como una sola unidad de flujo si contienen tareas independientes. Deben descomponerse antes de pasar a `En Curso`.

## 3. Puntos de inicio y finalización

- **Inicio:** momento en que el elemento pasa a `En Curso` y comienza trabajo efectivo. Desde ese instante forma parte del WIP.
- **Finalización:** momento en que satisface su criterio de cierre, supera las verificaciones proporcionales al riesgo y pasa a `Hecho`.
- **En Revisión:** sigue siendo trabajo iniciado y, por lo tanto, continúa dentro del WIP hasta finalizar.

## 4. Estados del flujo

| Estado | Significado | Política de entrada | Política de salida |
|---|---|---|---|
| `Backlog` | Trabajo identificado, todavía no iniciado. | Objetivo comprensible y prioridad inicial. | Existe capacidad, dependencias resueltas y criterio de cierre suficiente. |
| `En Curso` | Trabajo efectivo sobre el elemento. | Se selecciona mediante *pull* respetando prioridad y WIP. Se registra fecha de inicio. | La salida está implementada o redactada y lista para verificación. |
| `En Revisión` | Verificación técnica, editorial o manual. | Existe una salida revisable y se ejecutan los controles previstos. | Cumple el criterio de cierre o vuelve a `En Curso` con el hallazgo documentado. |
| `Hecho` | Resultado aceptado y trazable. | Verificaciones superadas, documentación sincronizada y decisión registrada si queda una limitación. | Estado terminal; una nueva necesidad genera otro elemento. |

Un elemento bloqueado conserva su estado y WIP, se marca como `blocked` y registra causa y acción de desbloqueo. No se lo mueve artificialmente a `Backlog` para liberar capacidad.

## 5. Control de trabajo en curso y sistema pull

- **WIP máximo global:** dos elementos activos sumando `En Curso` y `En Revisión`.
- Solo se selecciona un elemento del backlog cuando el WIP es menor que dos.
- La revisión tiene prioridad sobre iniciar trabajo nuevo: terminar antes que empezar.
- Una excepción solo se admite ante un bloqueo de entrega, pérdida de datos, seguridad o corrupción de evidencia. Debe documentarse y cerrarse antes de normalizar el flujo.
- Los frentes de Hito 06 —documentación, validación, presentación y corte final— no habilitan cuatro trabajos paralelos; se descomponen y respetan el mismo límite.

## 6. Priorización y Definition of Done

El backlog se ordena por:

1. bloqueo de entrega o riesgo de pérdida de datos;
2. evidencia exigida para la defensa;
3. dependencia técnica o documental;
4. valor para el MVP;
5. mejoras postergables.

Un elemento puede pasar a `Hecho` cuando:

- cumple sus criterios de aceptación;
- las pruebas, chequeos o revisiones aplicables finalizaron sin bloqueantes;
- los documentos afectados no contradicen al código ni a la línea base;
- las limitaciones conocidas quedan clasificadas, no ocultas;
- el cambio y su evidencia pueden rastrearse mediante archivos, commit, issue o informe de hito.

## 7. Cadencias de revisión

- **Continua:** revisar WIP, bloqueos y prioridades antes de seleccionar otro elemento.
- **Semanal/docente:** mostrar estado, evidencia y cambios de prioridad cuando exista instancia de seguimiento.
- **Por hito:** revisar resultados, desvíos, riesgos y backlog; un hito es una cadencia de control y entrega, no un Sprint.
- **Antes de una línea base o release:** ejecutar verificaciones, congelar el alcance y registrar versión, commit, artefacto y evidencia.

## 8. Expectativa de nivel de servicio

Desde el 2026-08-11 se adopta como hipótesis inicial una **SLE provisional de que el 85 % de los elementos termine en siete días calendario o menos**, medidos desde `En Curso` hasta `Hecho`. No es un resultado histórico ni una promesa contractual: es una previsión inicial que deberá recalibrarse cuando existan al menos cinco elementos finalizados con fechas confiables.

Los elementos que excedan ese tamaño deben dividirse. Si no pueden dividirse, se identifican como excepción y no se mezclan con tareas ordinarias al interpretar la SLE.

## 9. Métricas de flujo

| Métrica | Definición aplicada | Registro |
|---|---|---|
| WIP | Cantidad de elementos iniciados y no terminados. | Conteo de `En Curso` + `En Revisión`. |
| *Throughput* | Cantidad exacta de elementos terminados por semana o hito. | Fecha de finalización y conteo del período. |
| Edad del elemento | Días transcurridos desde el inicio de un elemento todavía activo. | Fecha actual − fecha de inicio. |
| Tiempo de ciclo | Días transcurridos entre inicio y finalización. | Fecha de finalización − fecha de inicio. |

Estas métricas se analizan sobre elementos de trabajo, no sobre commits ni Story Points. Los SP por hito permanecen como indicador académico separado de alcance/capacidad.

Para cada elemento iniciado desde esta formalización deben conservarse al menos `startedAt` y, al finalizar, `finishedAt`, ya sea como campos del proyecto o como registro inequívoco dentro del ítem. La medición no debe depender de inferir fechas desde commits posteriores.

## 10. Límite de la evidencia histórica

El proyecto no conservó fechas de inicio y finalización confiables para todos los elementos anteriores a esta formalización. En consecuencia:

- no se reconstruyen tiempos de ciclo ni edades a partir de suposiciones;
- un commit no se considera automáticamente un elemento terminado;
- la velocidad en SP no se renombra como *throughput*;
- la defensa distingue prácticas aplicadas durante el desarrollo de controles incorporados para el cierre.

La formulación defendible es: **“Lumapse utilizó un enfoque ágil incremental con gestión visual y límite WIP basado en Kanban; en Hito 06 formalizó su Definition of Workflow y las métricas mínimas, sin afirmar una conformidad histórica que la evidencia no permite demostrar.”**

## 11. Fuentes de evidencia

- Vista activa de GitHub Projects — estado visual del flujo.
- [`../../TODO`](../../TODO) — trabajo operativo inmediato.
- [`../../BACKLOG.md`](../../BACKLOG.md) — deuda y decisiones postergadas.
- [`seguimiento-velocidad.md`](./seguimiento-velocidad.md) — SP entregados por hito, separados de métricas Kanban.
- [`../hitos/`](../hitos/) — inspección y adaptación por hitos.
- [`../../CHANGELOG.md`](../../CHANGELOG.md) y Git — resultados y evolución versionada.

## Referencia

Kanban Guides. (2025). *The Kanban Guide*. https://kanbanguides.org/the-kanban-guide/
