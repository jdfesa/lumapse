# Seguimiento de Velocidad — Lumapse

> **Proyecto:** Lumapse  
> **Referencia:** Gómez, J. (2014), Secciones 5 y 7. Guía de Estudio PP3 (Ing. Mauricio Parada, 2026).  
> **Fecha de creación:** 2026-05-15  
> **Autor:** José David Sandoval  
> **Actualización:** Al cierre de cada hito.

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

## 3. Estimación de Story Points por hito

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

Story Points estimados retroactivamente (las HU formales no se crearon para este hito;
la estimación se basa en los RF completados y la complejidad observada durante el desarrollo):

| RF | Funcionalidad | SP | Justificación |
|---|---|---|---|
| RF-010 | Renderizado Markdown en tiempo real | 5 | Nueva librería (marked), integración con DOMPurify, componente MarkdownPreview |
| RF-011 | Sintaxis Markdown básica (GFM) | 3 | Configuración de marked + estilos CSS para HTML renderizado |
| RF-012 | Toggle edición / lectura | 3 | Tres modos de vista con estado dinámico y CSS condicional |
| RF-016 | Exportar nota individual como .md | 3 | Blob + download, sanitización del nombre de archivo |
| RF-017 | Exportar todas las notas como .zip | 5 | Integración JSZip, prevención de colisión de nombres |
| RF-018 | Importar archivos .md | 3 | FileReader API, creación de nota con parámetros iniciales |
| RF-008/009 | Offline + Service Worker | 5 | vite-plugin-pwa, configuración de Workbox, caché de assets |
| RF-021 | PWA instalable | 2 | Manifest + configuración del plugin |
| | **Total Hito 03** | **29** |

### Hito 04 — Organización y UX (Agosto 2026) — Planificado

Story Points estimados prospectivamente:

| RF | Funcionalidad | SP | Justificación |
|---|---|---|---|
| RF-013 | Estructura de carpetas por materia | 8 | Modelo de datos nuevo, UI de gestión, lógica de asignación de notas |
| RF-014 | Filtrar notas por materia | 3 | Query filtrada + chips de selección |
| RF-015 | Búsqueda por texto (título y contenido) | 5 | Índice de búsqueda, input con debounce, resultados en tiempo real |
| RF-019 | Modo oscuro / claro | 3 | CSS Custom Properties + media query + toggle |
| RF-020 | Diseño mobile-first responsive | 5 | Revisión completa de CSS, gestos, tamaños táctiles |
| RF-022 | Pantalla de onboarding | 3 | Componente modal, detección de primer uso, contenido guiado |
| RF-006 | Conteo de palabras y caracteres | 1 | Cálculo simple sobre el contenido actual |
| RF-024 | Indicador offline/online | 2 | Listener de eventos `online`/`offline` + indicador visual |
| | **Total Hito 04** | **30** |

---

## 4. Tabla de seguimiento de velocidad

| Hito | Período | SP planificados | SP entregados | Velocidad real | Desvío | Estado | Notas |
|---|---|---|---|---|---|---|---|
| 01 | Mayo 2026 | — | — | — | — | ✅ Completado | Fundación, sin HU medibles en SP |
| 02 | Junio 2026 | 20 | 20 | 20 SP/mes | 0 | ✅ Completado | Todas las HU completadas. Baseline: `LB-PROD-v0.1.0` |
| 03 | Julio 2026 | 29 | 29 | 29 SP/mes | 0 | ✅ Completado | MVP completo. Baseline: `LB-PROD-v0.2.0` |
| 04 | Agosto 2026 | 30 | — | — | — | 🔄 En curso | Organización por materias + UX mobile |
| 05 | Septiembre 2026 | *por definir* | — | — | — | ⏳ Futuro | Testing + APK firmado |
| 06 | Octubre 2026 | *por definir* | — | — | — | ⏳ Futuro | Informe final + entrega |

### Velocidad promedio (datos disponibles)

```
Velocidad promedio = (20 + 29) / 2 = 24.5 SP/mes
```

> Esta velocidad es la referencia para estimar si el Hito 04 (30 SP planificados) es
> viable en el período asignado. Con una velocidad promedio de 24.5 SP/mes, 30 SP
> representa un **incremento del 22%** respecto del promedio, lo cual es ambicioso
> pero manejable si se priorizan los RF MUST sobre los COULD.

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

### Hito 03 — Sin desvío pero con observación

| Métrica | Valor |
|---|---|
| SP planificados | 29 |
| SP entregados | 29 |
| Desvío | 0 (100% de cumplimiento) |

El Hito 03 se completó con éxito, pero debe notarse que:

1. Los SP se estimaron **retroactivamente** (no hubo HU formales previas al desarrollo).
2. La estimación retroactiva puede sufrir de **sesgo de confirmación** (se tiende a
   estimar exactamente lo que se logró). Para mayor rigor, los Hitos 04+ deben
   estimarse **antes** del desarrollo.

> **Lección aprendida:** A partir del Hito 04, la estimación de SP debe hacerse
> ANTES de comenzar el desarrollo, no después. Esto permite medir la precisión
> real de la estimación y detectar desviaciones.

---

## 6. Factores que podrían generar desvíos en el Hito 04

| Factor de riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Integración de Capacitor retrasa el inicio | Media | Alto | Iniciar la integración las primeras 2 semanas de agosto |
| El modelo de carpetas requiere migración del esquema SQLite | Media | Medio | Diseñar el esquema con extensibilidad desde el inicio |
| Dark mode con inconsistencias visuales | Baja | Bajo | Usar CSS Custom Properties desde el principio (ya implementado) |
| Carga académica de otras materias | Alta | Medio | Priorizar RF MUST sobre RF COULD si el tiempo se acota |

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
