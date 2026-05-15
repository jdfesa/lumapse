# Historias de Usuario — Lumapse

**Fase Design Thinking:** Idear / Prototipar  
**Última actualización:** Abril 2026  
**Autor:** José David Sandoval

---

## Convenciones

- **ID:** `HU-XXX` (Historia de Usuario)
- **Formato:** Como [ROL], quiero [FUNCIONALIDAD], para [BENEFICIO].
- **CA:** Criterio de Aceptación — condición verificable que define cuándo la historia está completa.
- **SP:** Story Points — complejidad relativa en escala Fibonacci (1, 2, 3, 5, 8, 13). Ver [metodología de estimación](#metodología-de-estimación).
- **Trazabilidad:** Cada HU referencia el RF que implementa y la Persona que la motiva.
- **Alcance:** Este documento cubre inicialmente las HU del **Hito 02 (Core del Editor)**. Se ampliará en hitos posteriores.

---

## Hito 02 — Core del Editor (Junio 2026)

### HU-001 — Crear nota rápida

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **crear una nueva nota con un solo toque** desde la pantalla principal, para **capturar apuntes durante la clase sin perder tiempo**. |
| **RF asociados** | [RF-001](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | MUST |
| **Story Points** | **2 SP** — Baseline de referencia. Operación CRUD simple: un botón, un evento, un registro nuevo. |
| **Hito** | 02 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | La pantalla principal muestra un botón visible para crear una nueva nota. | Inspección visual de la UI |
| CA-02 | Al presionar el botón, se abre un editor vacío con cursor activo en menos de 500ms. | Medición con `performance.now()` |
| CA-03 | La nota se crea con un título por defecto ("Sin título") y contenido vacío. | Test unitario |

---

### HU-002 — Editar nota existente

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **editar el título y contenido de una nota existente**, para **corregir, ampliar o reorganizar mis apuntes**. |
| **RF asociados** | [RF-002](./requisitos-funcionales.md) |
| **Persona** | [Martín](./personas.md#persona-2--martín-el-estudiante-práctico) |
| **Prioridad** | MUST |
| **Story Points** | **3 SP** — Similar a crear, pero requiere carga previa del contenido y actualización parcial del registro. |
| **Hito** | 02 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Al seleccionar una nota del listado, se abre el editor con el contenido actual cargado. | Test funcional |
| CA-02 | Los cambios en el título y contenido se reflejan inmediatamente en el editor. | Inspección visual |
| CA-03 | La fecha de última modificación (`updatedAt`) se actualiza al guardar los cambios. | Test unitario |

---

### HU-003 — Eliminar nota con confirmación

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **eliminar una nota que ya no necesito**, con **confirmación previa para evitar borrado accidental**. |
| **RF asociados** | [RF-003](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | MUST |
| **Story Points** | **2 SP** — Operación destructiva simple con diálogo de confirmación. Misma complejidad que crear. |
| **Hito** | 02 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Existe una acción de eliminar accesible desde el listado o desde el editor de la nota. | Inspección visual |
| CA-02 | Al solicitar la eliminación, se muestra un diálogo de confirmación antes de proceder. | Test funcional |
| CA-03 | Si el usuario confirma, la nota se elimina permanentemente de IndexedDB. | Test unitario (verificar que `getAll()` no incluye la nota) |
| CA-04 | Si el usuario cancela, la nota permanece intacta y la UI no cambia. | Test funcional |

---

### HU-004 — Ver listado de notas

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **ver un listado de todas mis notas ordenadas por fecha**, para **encontrar rápidamente la nota más reciente**. |
| **RF asociados** | [RF-004](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | MUST |
| **Story Points** | **3 SP** — Requiere consulta ordenada a la BD, renderizado de lista con extractos y manejo del estado vacío. |
| **Hito** | 02 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | La pantalla principal muestra un listado con todas las notas almacenadas. | Inspección visual |
| CA-02 | Cada ítem del listado muestra: título, extracto del contenido (primeros 80 caracteres), y fecha de última modificación. | Inspección visual |
| CA-03 | Las notas están ordenadas por fecha de última modificación, la más reciente primero. | Test unitario (comparar orden del array) |
| CA-04 | Si no hay notas, se muestra un estado vacío con instrucciones para crear la primera nota. | Test funcional |

---

### HU-005 — Auto-guardado automático

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero que **mis notas se guarden automáticamente** mientras escribo, para **no perder contenido si cierro la app o se queda sin batería**. |
| **RF asociados** | [RF-005](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | MUST |
| **Story Points** | **5 SP** — Lógica de debounce temporal, manejo de eventos de cambio, indicador visual de estado, y edge cases (cierre inesperado, cambio de nota). |
| **Hito** | 02 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | La nota activa se persiste en IndexedDB después de 800ms de inactividad del usuario. | Test unitario con timer mock |
| CA-02 | La nota activa se persiste al cambiar a otra nota o al cerrar el editor. | Test funcional |
| CA-03 | Se muestra un indicador visual sutil de estado de guardado (ej: "Guardado" / "Guardando..."). | Inspección visual |
| CA-04 | Después de un cierre inesperado del navegador, al reabrir la app la nota conserva el último contenido guardado. | Test manual |

---

### HU-006 — Persistencia local sin servidor

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante preocupado por mi privacidad**, quiero que **todas mis notas se almacenen localmente en mi dispositivo**, para **no depender de servidores externos ni de una conexión a internet**. |
| **RF asociados** | [RF-007](./requisitos-funcionales.md) |
| **Persona** | [Martín](./personas.md#persona-2--martín-el-estudiante-práctico) |
| **Prioridad** | MUST |
| **Story Points** | **5 SP** — Capa de abstracción sobre IndexedDB (NoteService), configuración de la BD, manejo de errores de almacenamiento y verificación offline. |
| **Hito** | 02 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Las notas se almacenan en IndexedDB del navegador. | Verificación en DevTools → Application → IndexedDB |
| CA-02 | No se realizan requests HTTP con datos del usuario durante ninguna operación CRUD. | Network tab en DevTools durante uso completo |
| CA-03 | La app funciona correctamente con la conexión de red desactivada (modo avión). | Test manual sin conexión |

---

## Resumen

| Métrica | Valor |
|---|---|
| **Total HU (Hito 02)** | 6 |
| **Total Story Points (Hito 02)** | **20 SP** |
| **Total Criterios de Aceptación** | 20 |
| **Prioridad** | Todas MUST |
| **Personas cubiertas** | Lucía (4 HU), Martín (2 HU) |
| **RFs cubiertos** | RF-001 a RF-005, RF-007 |

---

## Trazabilidad: HU → RF → Persona

| HU | RF | Persona | Funcionalidad | SP |
|---|---|---|---|---|
| HU-001 | RF-001 | Lucía | Crear nota | 2 |
| HU-002 | RF-002 | Martín | Editar nota | 3 |
| HU-003 | RF-003 | Lucía | Eliminar nota | 2 |
| HU-004 | RF-004 | Lucía | Listado de notas | 3 |
| HU-005 | RF-005 | Lucía | Auto-guardado | 5 |
| HU-006 | RF-007 | Martín | Persistencia local | 5 |
| | | | **Total Hito 02** | **20** |

---

## Metodología de estimación

Lumapse es un proyecto **individual** (José David Sandoval), lo cual impide aplicar estrictamente técnicas grupales como Planning Poker o Delphi de banda ancha (Gómez, 2014, Sección 4). La estimación de Story Points se realizó mediante **juicio experto individual**, aplicando la escala de Fibonacci con los siguientes criterios:

| SP | Complejidad | Criterio aplicado |
|---|---|---|
| 1 | Trivial | Cambio cosmético o de configuración sin lógica nueva. |
| 2 | Simple | Operación CRUD atómica: un evento, una escritura en BD, sin flujo condicional. |
| 3 | Moderada baja | CRUD con lógica adicional: carga previa, renderizado de lista, estado vacío. |
| 5 | Moderada | Lógica de negocio con temporización, manejo de eventos complejos o capa de abstracción sobre la BD. |
| 8 | Compleja | Módulo que integra varias entidades, requiere migración de datos o tecnología parcialmente nueva. |
| 13 | Muy compleja | Funcionalidad con alta incertidumbre técnica o dependencia de herramientas desconocidas. |

**Historia de referencia (baseline):** HU-001 (Crear nota rápida) = **2 SP**. Todas las demás historias se estiman relativamente a esta referencia.

> **Referencia:** Gómez, J. (2014). *Guía Práctica de Estimación y Medición de Proyectos Software*, Secciones 4 y 5. Complementada por la Guía de Estudio PP3 (Ing. Mauricio Parada, 2026).

---

> **Nota:** Las HU de los Hitos 03 a 06 (Markdown, organización, export/import, PWA, UX) se agregarán al inicio de cada hito, siguiendo el mismo formato y convenciones. Este documento es un artefacto vivo que crece con el proyecto.

---

*Documento de la fase Idear / Prototipar · Design Thinking · Lumapse · PP3 · 2026*
