# Seguimiento de Velocidad — Lumapse

> **Proyecto:** Lumapse  
> **Referencia:** Gómez, J. (2014), Secciones 5 y 7. Guía de Estudio PP3 (Ing. Mauricio Parada, 2026).  
> **Fecha de creación:** 2026-05-15  
> **Autor:** José David Sandoval  
> **Actualización:** 2026-07-15 — cierre de Hito 05 con 36 SP entregados y activación de Hito 06 como etapa documental sin HU nuevas.

---

## 1. ¿Qué es la velocidad del equipo?

La **velocidad** es la cantidad de Story Points que el equipo completa en un período
(sprint o hito). Es el puente entre los SP del backlog y el tiempo calendario.
Medir la velocidad real permite:

- Detectar atrasos antes de que sean críticos.
- Ajustar la planificación de hitos futuros con datos reales.
- Dejar un historial institucional para futuros estudiantes (Gómez, 2014, §7.4).

---

## 2. Parámetros del proyecto

| Parámetro | Valor |
|---|---|
| **Tamaño del equipo** | 1 persona (proyecto individual) |
| **Duración de cada hito** | ~1 mes calendario (~22 días hábiles) |
| **Equivalencia** | 1 Hito ≈ 2 sprints de 2 semanas |

---

## 3. Story Points por hito

### Hito 01 — Fundación (Mayo 2026)

El Hito 01 fue de **configuración y documentación**, sin funcionalidades de usuario medibles
en Story Points. No se incluye en la tabla de velocidad porque no tiene HU implementadas.

Artefactos producidos: repo Git, Vite 6, diseño base, ADR-001 a ADR-004, documentación de
producto, relevamiento de datos (120 respuestas), ADR-005 (pivote).

### Hito 02 — Core del Editor (Junio 2026)

Story Points asignados en [`historias-de-usuario.md`](../producto/historias-de-usuario.md):

| HU | Funcionalidad | SP |
|---|---|---|
| HU-001 | Crear nota rápida | 2 |
| HU-002 | Editar nota existente | 3 |
| HU-003 | Eliminar nota con confirmación | 2 |
| HU-004 | Ver listado de notas | 3 |
| HU-006 | Persistencia local sin servidor | 5 |
| | **Total Hito 02 normalizado** | **15** |

> **Nota metodológica:** `RF-005 / HU-005` fue reclasificada el 2026-06-07. La necesidad original de no perder texto se mantiene, pero la solución validada ya no es auto-guardado final silencioso sino borrador persistente del editor, por lo que se registra en Hito 05.

### Hito 03 — MVP Completo (Julio 2026)

Story Points normalizados contra las HU formales actuales:

| HU | Funcionalidad | SP |
|---|---|---|
| HU-007 | Renderizar Markdown | 5 |
| HU-012 | Funcionamiento offline | 5 |
| HU-013 | Modos edición/lectura | 3 |
| | **Total Hito 03** | **13** |

> **Nota metodológica:** `HU-008` fue reclasificada como futura porque compartir/exportar una nota individual no está expuesto en la UI actual. La portabilidad de workspace se formalizó después en Hito 05 como exportación de backup `.zip` (`RF-017 / HU-030`) e importación de backup `.zip` generado por Lumapse (`RF-018 / HU-031`).

### Hito 04 — Organización y UX (Agosto 2026, cerrado formalmente)

Story Points entregados según las HU formalizadas:

| HU | Funcionalidad | SP |
|---|---|---|
| HU-009 | Fijar y archivar notas | 5 |
| HU-010 | Buscar notas | 3 |
| HU-011 | Modo oscuro/claro | 5 |
| HU-014 | Diseño responsive | 5 |
| HU-015 | Marcadores de estado académico | 3 |
| HU-016 | Papelera de reciclaje | 8 |
| HU-017 | Categorización y filtrado por materias | 8 |
| | **Total Hito 04 entregado** | **37** |

El Hito 04 registra 37 SP entregados y queda **cerrado formalmente el 2026-06-01**. Los pendientes menores de UX fueron resueltos con una combinación de pulido mínimo (empty states) y decisiones explícitas de postergación/descarte para proteger la filosofía del producto: captura rápida, offline-first, mobile-first y sin sincronización todavía.

### Hito 05 — Testing, Calidad y Distribución (planificado para Septiembre 2026, cerrado)

Story Points entregados al cierre documental del 2026-07-15:

| HU | Funcionalidad | SP |
|---|---|---|
| HU-005 | Borradores persistentes del editor | 5 |
| HU-027 | Fechas académicas discretas | 8 |
| HU-028 | Editor enriquecido y slash commands | 5 |
| HU-023 | Sección Acerca de | 2 |
| HU-030 | Backup manual externo | 8 |
| HU-031 | Importación de backup ZIP | 8 |
| | **Total Hito 05 entregado** | **36** |

Hito 05 mantuvo su objetivo principal de testing, calidad y distribución e incorporó mejoras funcionales acotadas aprobadas durante la preparación de release. Los 36 SP quedaron implementados, probados y documentados; el hito se cerró sobre la beta operativa `v0.4.8` sin reabrir Hito 04.

### Hito 06 — Entrega Final (planificado para Octubre 2026, activo)

Hito 06 no tiene HU funcionales ni SP asignados al 2026-07-15. Sus entregables son de cierre: revisión editorial, gráficos de base de datos, validación final, línea base y presentación. Si apareciera un cambio funcional bloqueante, deberá estimarse y aprobarse antes de alterar esta línea.

---

## 4. Tabla de seguimiento de velocidad

| Hito | Período | SP planificados | SP entregados | Velocidad real | Desvío | Estado | Notas |
|---|---|---|---|---|---|---|---|
| 01 | Mayo 2026 | — | — | — | — | ✅ Completado | Fundación, sin HU medibles en SP |
| 02 | Junio 2026 | 15 | 15 | 15 SP/mes | 0 | ✅ Completado | Core CRUD y persistencia local; RF-005 reclasificado a Hito 05 |
| 03 | Julio 2026 | 13 | 13 | 13 SP/mes | 0 | ✅ Completado | Markdown, lectura/escritura y offline; portabilidad local reclasificada |
| 04 | Agosto 2026 | 37 | 37 | 37 SP/mes | 0 | ✅ Completado | Organización por materias + UX mobile cerrado formalmente |
| 05 | Septiembre 2026 | 36 | 36 | 36 SP/hito | 0 | ✅ Completado | Testing + APK firmado, export/import ZIP, fechas discretas, editor enriquecido, borradores persistentes y Acerca de |
| 06 | Octubre 2026 | — | — | No aplica todavía | — | 🔄 En curso | Documentación, gráficos DB, validación final, línea base y presentación; sin HU nuevas |

### Velocidad promedio (datos disponibles)

```
Velocidad promedio cerrada = (15 + 13 + 37 + 36) / 4 = 25.25 SP/hito
```

> El script `python3 scripts/generate-velocity-report.py` permite auditar los SP desde la tabla de HU. Al 2026-07-15 registra **22 HU**, **104 SP formalizados**, **101 SP entregados** en Hitos 02 a 05 y **3 SP postergados** a Futuro (`HU-008`). Para velocidad real cerrada se promedian solo los cuatro hitos funcionales completados; el valor `20.8` del reporte automático usa además el bucket Futuro como agrupación y no representa velocidad entregada.

---

## 5. Análisis de desvíos

### Hito 02 — Sin desvío

| Métrica | Valor |
|---|---|
| SP planificados | 15 |
| SP entregados | 15 |
| Desvío | 0 (100% de cumplimiento) |

El Hito 02 se completó según el alcance normalizado actual. Las 5 HU de core CRUD, listado y persistencia local fueron implementadas y verificadas. La protección contra pérdida de escritura se conserva como necesidad de producto, pero su solución definitiva se formalizó después como borrador persistente del editor en Hito 05.

### Hito 03 — Sin desvío, con reclasificación de alcance

| Métrica | Valor |
|---|---|
| SP planificados | 13 |
| SP entregados | 13 |
| Desvío | 0 (100% de cumplimiento) |

El Hito 03 se completó con éxito dentro del alcance hoy verificable: Markdown, modos de lectura/escritura y soporte offline original. La portabilidad local de nota individual se reclasifica como deuda posterior; la portabilidad de workspace se resuelve más adelante en Hito 05 mediante exportación e importación de backup ZIP.

### Hito 04 — Entregado por encima del plan inicial y cerrado formalmente

| Métrica | Valor |
|---|---|
| SP planificados | 37 |
| SP entregados | 37 |
| Desvío | 0 respecto de las HU formalizadas |

El Hito 04 concentra el mayor volumen de SP del proyecto porque absorbió tanto la organización por materias como mejoras de UX, papelera, marcadores de estado y refuerzos de persistencia. La entrega funcional registrada en HU alcanza 37 SP y el cierre formal se completa al resolver los pendientes menores mediante decisiones de producto documentadas.

> **Lección aprendida:** cerrar un hito no significa implementar toda idea opcional. En un producto minimalista, también es cierre declarar qué no se incorpora todavía y por qué.

### Hito 05 — Sin desvío en las HU formalizadas y cierre operativo de beta

| Métrica | Valor |
|---|---|
| SP planificados/formalizados | 36 |
| SP entregados | 36 |
| Desvío | 0 respecto de las HU formalizadas |

Hito 05 adelantó trabajo respecto del mes planificado y cerró un volumen amplio: calidad, distribución y seis HU controladas. La principal lección es separar el artefacto publicado de la evolución posterior de `main`: `v0.4.8` identifica la APK validada, mientras los commits posteriores todavía no constituyen otra release.

---

## 6. Factores que podrían generar desvíos en el cierre del proyecto

| Factor de riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Confundir `main` posterior con la APK `v0.4.8` | Mitigado | Alto | Changelog y líneas base separan tag, artefacto y el checkpoint inicial de 12 commits; el conteo posterior puede crecer |
| Pendientes UX pequeños crecen de alcance | Media | Medio | `Mover a` y rendimiento se validan con severidad explícita; no habilitan features nuevas |
| Documentación generada queda desfasada | Media | Alto | Congelar fuente Markdown y regenerar salidas solo en puntos de control |
| Gráficos de base de datos requieren herramientas externas | Mitigado | Medio | Fuentes y exportaciones contrastadas con el schema e incorporadas el 2026-07-15; resta verificar legibilidad en la maquetación final |
| Preparación de defensa desplaza la validación final | Media | Alto | Mantener WIP máximo de dos frentes y cerrar validación antes del corte/tag final |

---

## 7. Contenido mínimo para el informe final (Gómez, 2014, §7.4)

Al cierre del proyecto, esta tabla debe contener:

- [x] Total de Story Points estimados vs. entregados por hito.
- [x] Velocidad promedio real del equipo.
- [x] Factores que generaron desvíos (positivos y negativos).
- [ ] Factor de ajuste real (horas totales / horas de desarrollo puro) — *pendiente de medición al cierre*.
- [ ] Recomendaciones para equipos futuros — *pendiente, se redactará en el Hito 06*.

> **Referencia:** Gómez, J. (2014). *Guía Práctica de Estimación y Medición de Proyectos
> Software*, Secciones 5 (Velocidad) y 7 (Control del avance y cierre).
