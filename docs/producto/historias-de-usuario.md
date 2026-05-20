# Historias de Usuario — Lumapse

**Fase Design Thinking:** Idear / Prototipar  
**Última actualización:** Mayo 2026  
**Autor:** José David Sandoval

---

## Convenciones

- **ID:** `HU-XXX` (Historia de Usuario)
- **Formato:** Como [ROL], quiero [FUNCIONALIDAD], para [BENEFICIO].
- **CA:** Criterio de Aceptación — condición verificable que define cuándo la historia está completa.
- **SP:** Story Points — complejidad relativa en escala Fibonacci (1, 2, 3, 5, 8, 13). Ver [metodología de estimación](#metodología-de-estimación).
- **Trazabilidad:** Cada HU referencia el RF que implementa y la Persona que la motiva.
- **Alcance:** Este documento cubre las HU de los **Hitos 02, 03 y 04**. Se ampliará en hitos posteriores.

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

## Hito 03 — MVP Completo (Julio 2026)

### HU-007 — Renderizar Markdown en tiempo real

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **ver mis notas renderizadas en Markdown** con formato visual (negritas, listas, encabezados), para **leer mis apuntes con la misma claridad que en un documento formal**. |
| **RF asociados** | [RF-010, RF-011](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | MUST |
| **Story Points** | **5 SP** — Integración de librerías externas (`marked` + `DOMPurify`), servicio de conversión, componente de preview, y modos de vista (edición, split, lectura). |
| **Hito** | 03 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | El contenido Markdown se renderiza como HTML visual (encabezados, negritas, listas, código). | Inspección visual con nota de prueba |
| CA-02 | El HTML generado está sanitizado contra inyección XSS mediante DOMPurify. | Test manual con payload `<script>alert(1)</script>` |
| CA-03 | El usuario puede alternar entre modo edición, vista dividida (split) y modo lectura. | Test funcional |
| CA-04 | La vista previa se actualiza en tiempo real mientras se escribe en el editor. | Inspección visual |

---

### HU-008 — Exportar e importar notas

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **exportar mis notas como archivos `.md` e importar archivos Markdown existentes**, para **hacer backup de mi trabajo o migrar contenido desde otras herramientas**. |
| **RF asociados** | [RF-016, RF-017, RF-018](./requisitos-funcionales.md) |
| **Persona** | [Martín](./personas.md#persona-2--martín-el-estudiante-práctico) |
| **Prioridad** | SHOULD |
| **Story Points** | **8 SP** — Tres flujos distintos (exportar nota individual, exportar workspace como `.zip`, importar `.md`), manejo del filesystem del dispositivo, y dependencia de `jszip`. |
| **Hito** | 03 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Se puede exportar una nota individual como archivo `.md` desde el editor. | Test funcional (verificar descarga) |
| CA-02 | Se puede exportar el workspace completo como archivo `.zip` con todas las notas. | Test funcional (verificar contenido del zip) |
| CA-03 | Se pueden importar uno o más archivos `.md` desde el dispositivo, creando notas nuevas. | Test funcional |
| CA-04 | Las notas importadas conservan el contenido Markdown original sin alteraciones. | Comparación manual de contenido |

---

### HU-012 — Usar Lumapse sin conexión

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante con conectividad limitada**, quiero **abrir y usar Lumapse sin conexión después de instalarla**, para **consultar y editar mis apuntes en clases, traslados o lugares sin internet**. |
| **RF asociados** | [RF-008](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | MUST |
| **Story Points** | **5 SP** — Requiere empaquetado local de assets dentro del APK, fuentes auto-alojadas y verificación de funcionamiento sin red. |
| **Hito** | 03 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | La aplicación instalada abre correctamente con la conexión de red desactivada. | Test manual en modo avión |
| CA-02 | Los assets principales (HTML, CSS, JavaScript y fuentes) se cargan desde el paquete local de la aplicación. | Network tab / inspección del APK |
| CA-03 | La edición y consulta de notas existentes funciona sin realizar requests externos. | Test funcional sin conexión |

---

### HU-013 — Alternar modos de edición y lectura

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante práctico**, quiero **alternar entre modo edición, vista dividida y modo lectura en una nota**, para **escribir cuando estoy tomando apuntes y leer con comodidad cuando estoy repasando**. |
| **RF asociados** | [RF-012](./requisitos-funcionales.md) |
| **Persona** | [Martín](./personas.md#persona-2--martín-el-estudiante-práctico) |
| **Prioridad** | SHOULD |
| **Story Points** | **3 SP** — Estado de UI para tres modos, clases CSS condicionales y coordinación con el componente de preview. |
| **Hito** | 03 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | El editor permite seleccionar modo Edición, Dividido (Split) y Lectura. | Test funcional |
| CA-02 | En modo Lectura se muestra la vista previa renderizada sin el área editable principal. | Inspección visual |
| CA-03 | Al volver a modo Edición, el contenido de la nota se conserva sin cambios. | Test funcional |

---

## Hito 04 — Organización y UX (Agosto 2026)

### HU-009 — Fijar y archivar notas

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **fijar las notas más importantes al tope del listado y archivar las que ya no uso activamente**, para **mantener organizado mi espacio de trabajo sin perder información**. |
| **RF asociados** | [RF-013](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | SHOULD |
| **Story Points** | **5 SP** — Upgrade de schema de la BD (nuevos campos `pinned`, `archived`), lógica de ordenamiento con prioridad, filtro de archivadas, y tres acciones en el menú contextual. |
| **Hito** | 04 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Al fijar una nota, esta aparece en la parte superior del feed con un indicador visual (ícono de pin). | Inspección visual |
| CA-02 | Al archivar una nota, esta desaparece del feed principal. | Test funcional |
| CA-03 | Existe una vista "Ver archivadas" accesible desde el drawer para consultar notas archivadas. | Test funcional |
| CA-04 | Las acciones de fijar y archivar son reversibles (desfijar, desarchivar). | Test funcional (toggle ida/vuelta) |

---

### HU-010 — Buscar notas

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **buscar notas por título o contenido**, para **encontrar rápidamente un apunte específico sin recorrer todo el listado manualmente**. |
| **RF asociados** | [RF-015](./requisitos-funcionales.md) |
| **Persona** | [Martín](./personas.md#persona-2--martín-el-estudiante-práctico) |
| **Prioridad** | SHOULD |
| **Story Points** | **3 SP** — Input con debounce, filtrado en memoria sobre el array de notas, y actualización reactiva de la lista. |
| **Hito** | 04 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Existe un campo de búsqueda accesible desde el drawer. | Inspección visual |
| CA-02 | Al escribir, el listado se filtra en tiempo real mostrando solo las notas cuyo título o contenido coinciden con el texto ingresado. | Test funcional |
| CA-03 | La búsqueda aplica debounce (≥200ms) para evitar re-renders innecesarios. | Verificación en código |
| CA-04 | Al borrar el texto de búsqueda, se restaura el listado completo. | Test funcional |

---

### HU-011 — Alternar modo oscuro y claro

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **alternar entre un modo oscuro y un modo claro** desde la interfaz, para **adaptar la lectura a distintas condiciones de iluminación (aulas, transporte, exteriores)**. |
| **RF asociados** | [RF-019](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | SHOULD |
| **Story Points** | **5 SP** — Arquitectura de tokens CSS con dos paletas, servicio modular (`ThemeService`) con persistencia en `localStorage`, detección de preferencia del OS, y actualización dinámica del `meta[theme-color]` para la barra de estado nativa. |
| **Hito** | 04 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Existe un botón de toggle accesible desde el drawer con ícono dinámico (sol/luna). | Inspección visual |
| CA-02 | Al alternar el tema, toda la interfaz cambia de paleta sin recargar la página. | Test funcional |
| CA-03 | La preferencia de tema persiste al cerrar y reabrir la aplicación. | Test manual (cerrar app, reabrir, verificar tema) |
| CA-04 | Si no hay preferencia guardada, se respeta la configuración del sistema operativo (`prefers-color-scheme`). | Test manual (cambiar tema del OS) |

---

### HU-014 — Usar la app en móvil y escritorio

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **usar Lumapse cómodamente en pantallas móviles y de escritorio**, para **tomar apuntes desde el celular y revisar mi material en pantallas más grandes sin perder legibilidad ni controles**. |
| **RF asociados** | [RF-020](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | MUST |
| **Story Points** | **5 SP** — Revisión mobile-first del layout, drawer lateral, tamaños táctiles y adaptación entre 320px y 1920px. |
| **Hito** | 04 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | La interfaz se adapta correctamente desde 320px hasta 1920px de ancho sin scroll horizontal no deseado. | Test responsive en DevTools |
| CA-02 | En pantallas móviles, la navegación usa drawer lateral en lugar de una sidebar fija. | Inspección visual |
| CA-03 | Los controles principales mantienen tamaño táctil y legibilidad adecuados en móvil. | Test manual en viewport móvil |

---

## Resumen

| Métrica | Hito 02 | Hito 03 | Hito 04 | Total |
|---|---|---|---|---|
| **Total HU** | 6 | 4 | 4 | **14** |
| **Total Story Points** | 20 | 21 | 18 | **59** |
| **Total Criterios de Aceptación** | 20 | 14 | 15 | **49** |
| **Prioridad predominante** | MUST | MUST/SHOULD | SHOULD/MUST | — |
| **Personas cubiertas** | Lucía (4), Martín (2) | Lucía (2), Martín (2) | Lucía (3), Martín (1) | Lucía (9), Martín (5) |

---

## Trazabilidad: HU → RF → Persona

| HU | RF | Persona | Funcionalidad | SP | Hito |
|---|---|---|---|---|---|
| HU-001 | RF-001 | Lucía | Crear nota | 2 | 02 |
| HU-002 | RF-002 | Martín | Editar nota | 3 | 02 |
| HU-003 | RF-003 | Lucía | Eliminar nota | 2 | 02 |
| HU-004 | RF-004 | Lucía | Listado de notas | 3 | 02 |
| HU-005 | RF-005 | Lucía | Auto-guardado | 5 | 02 |
| HU-006 | RF-007 | Martín | Persistencia local | 5 | 02 |
| HU-007 | RF-010/011 | Lucía | Renderizar Markdown | 5 | 03 |
| HU-008 | RF-016/017/018 | Martín | Exportar/Importar notas | 8 | 03 |
| HU-012 | RF-008 | Lucía | Funcionamiento offline | 5 | 03 |
| HU-013 | RF-012 | Martín | Modos edición/lectura | 3 | 03 |
| HU-009 | RF-013 | Lucía | Fijar y archivar notas | 5 | 04 |
| HU-010 | RF-015 | Martín | Buscar notas | 3 | 04 |
| HU-011 | RF-019 | Lucía | Modo oscuro/claro | 5 | 04 |
| HU-014 | RF-020 | Lucía | Diseño responsive | 5 | 04 |
| | | | **Total** | **59** | |

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

> **Nota:** Las HU de los Hitos 05 y 06 (categorización por materias, SQLite) se agregarán al inicio de cada hito, siguiendo el mismo formato y convenciones. Este documento es un artefacto vivo que crece con el proyecto.

---

*Documento de la fase Idear / Prototipar · Design Thinking · Lumapse · PP3 · 2026*
