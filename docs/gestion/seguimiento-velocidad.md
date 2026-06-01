# Seguimiento de Velocidad — Lumapse

> **Proyecto:** Lumapse  
> **Referencia:** Gómez, J. (2014), Secciones 5 y 7. Guía de Estudio PP3 (Ing. Mauricio Parada, 2026).  
> **Fecha de creación:** 2026-05-15  
> **Autor:** José David Sandoval  
> **Actualización:** 2026-06-01 — cierre formal del Hito 04 y activación operativa del Hito 05.

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
| HU-005 | Auto-guardado automático | 5 |
| HU-006 | Persistencia local sin servidor | 5 |
| | **Total Hito 02** | **20** |

### Hito 03 — MVP Completo (Julio 2026)

Story Points normalizados contra las HU formales actuales:

| HU | Funcionalidad | SP |
|---|---|---|
| HU-007 | Renderizar Markdown | 5 |
| HU-012 | Funcionamiento offline | 5 |
| HU-013 | Modos edición/lectura | 3 |
| | **Total Hito 03** | **13** |

> **Nota metodológica:** `HU-008` fue reclasificada como futura porque exportación/importación no está expuesta en la UI actual. Compartir nota individual solo vuelve si se implementa con share sheet nativo de Android; backup `.zip` e importación quedan como deuda posterior.

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

---

## 4. Tabla de seguimiento de velocidad

| Hito | Período | SP planificados | SP entregados | Velocidad real | Desvío | Estado | Notas |
|---|---|---|---|---|---|---|---|
| 01 | Mayo 2026 | — | — | — | — | ✅ Completado | Fundación, sin HU medibles en SP |
| 02 | Junio 2026 | 20 | 20 | 20 SP/mes | 0 | ✅ Completado | Todas las HU completadas. Baseline: `LB-PROD-v0.1.0` |
| 03 | Julio 2026 | 13 | 13 | 13 SP/mes | 0 | ✅ Completado | Markdown, lectura/escritura y offline; portabilidad local reclasificada |
| 04 | Agosto 2026 | 37 | 37 | 37 SP/mes | 0 | ✅ Completado | Organización por materias + UX mobile cerrado formalmente |
| 05 | Septiembre 2026 | *por definir* | — | — | — | 🔄 En curso | Testing + APK firmado |
| 06 | Octubre 2026 | *por definir* | — | — | — | ⏳ Futuro | Informe final + entrega |

### Velocidad promedio (datos disponibles)

```
Velocidad promedio = (20 + 13 + 37) / 3 = 23.3 SP/hito
```

> El script `python3 scripts/generate-velocity-report.py` permite auditar los SP formalizados por hito desde la tabla de HU. Para velocidad real cerrada se consideran solo los hitos formalmente completados (02 a 04). Al 2026-06-01, el proyecto registra **18 HU formalizadas**, **81 SP totales planificados/formalizados** y **70 SP cerrados** en Hitos 02 a 04.

---

## 5. Análisis de desvíos

### Hito 02 — Sin desvío

| Métrica | Valor |
|---|---|
| SP planificados | 20 |
| SP entregados | 20 |
| Desvío | 0 (100% de cumplimiento) |

El Hito 02 se completó según lo planificado. Las 6 HU fueron implementadas y verificadas.
Esto indica que la estimación inicial fue precisa para funcionalidades de complejidad
baja-moderada (CRUD, auto-guardado, listado).

### Hito 03 — Sin desvío, con reclasificación de alcance

| Métrica | Valor |
|---|---|
| SP planificados | 13 |
| SP entregados | 13 |
| Desvío | 0 (100% de cumplimiento) |

El Hito 03 se completó con éxito dentro del alcance hoy verificable: Markdown, modos de lectura/escritura y soporte offline original. La portabilidad local se reclasifica como deuda posterior por requerir integración nativa, formato de backup y política de importación.

### Hito 04 — Entregado por encima del plan inicial y cerrado formalmente

| Métrica | Valor |
|---|---|
| SP planificados | 37 |
| SP entregados | 37 |
| Desvío | 0 respecto de las HU formalizadas |

El Hito 04 concentra el mayor volumen de SP del proyecto porque absorbió tanto la organización por materias como mejoras de UX, papelera, marcadores de estado y refuerzos de persistencia. La entrega funcional registrada en HU alcanza 37 SP y el cierre formal se completa al resolver los pendientes menores mediante decisiones de producto documentadas.

> **Lección aprendida:** cerrar un hito no significa implementar toda idea opcional. En un producto minimalista, también es cierre declarar qué no se incorpora todavía y por qué.

---

## 6. Factores que podrían generar desvíos en el cierre del Hito 04

| Factor de riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Mezclar cierre de Hito 04 con preparación de Hito 05 | Mitigado | Medio | Hito 04 cerrado; Hito 05 activo desde 2026-06-01 |
| Pendientes UX pequeños crecen de alcance | Mitigado | Medio | RF-006, RF-022 y RF-024 postergados con justificación |
| Documentación generada queda desfasada | Media | Alto | Regenerar informe/cheatsheet solo en puntos de control |
| Gráficos de base de datos requieren herramientas externas | Media | Bajo | Dejarlos para el cierre final, como ya se acordó |

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
