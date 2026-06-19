# Historias de Usuario — Lumapse

**Fase Design Thinking:** Idear / Prototipar  
**Última actualización:** 2026-06-19
**Autor:** José David Sandoval

---

## Convenciones

- **ID:** `HU-XXX` (Historia de Usuario)
- **Formato:** Como [ROL], quiero [FUNCIONALIDAD], para [BENEFICIO].
- **CA:** Criterio de Aceptación — condición verificable que define cuándo la historia está completa.
- **SP:** Story Points — complejidad relativa en escala Fibonacci (1, 2, 3, 5, 8, 13). Ver [metodología de estimación](#metodología-de-estimación).
- **Trazabilidad:** Cada HU referencia el RF que implementa y la Persona que la motiva.
- **Alcance:** Este documento cubre las HU de los **Hitos 02, 03, 04, 05 y funcionalidades futuras formalizadas**. Se ampliará en hitos posteriores.

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

### HU-008 — Portabilidad local de notas

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **compartir una nota individual en Markdown**, para **enviarla a otra persona o moverla fuera de Lumapse sin depender de sincronización**. |
| **RF asociados** | [RF-016](./requisitos-funcionales.md) |
| **Persona** | [Martín](./personas.md#persona-2--martín-el-estudiante-práctico) |
| **Prioridad** | SHOULD |
| **Story Points** | **3 SP** — Flujo acotado de compartir/exportar nota individual, validación en Android real y ubicación discreta en UI. |
| **Hito** | Futuro |

> **Estado de revisión 2026-06-19:** compartir una nota individual (`RF-016`) sigue postergado y solo tiene sentido si usa share sheet nativo de Android con apps reales como WhatsApp. La portabilidad de workspace quedó formalizada aparte como exportación de backup `.zip` (`RF-017 / HU-030`) e importación de backup `.zip` generado por Lumapse (`RF-018 / HU-031`). Si en el futuro se importa una nota individual exportada desde Lumapse, debe crearse en `Entrada` y no intentar recrear materia/sección de origen.

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | El usuario puede compartir/exportar la nota actual como Markdown desde una acción secundaria. | Test funcional en Android real |
| CA-02 | El contenido compartido conserva el Markdown original de la nota. | Comparación manual de contenido |
| CA-03 | La acción no reemplaza ni duplica la función existente de copiar contenido; queda como alternativa de portabilidad. | Revisión UX mobile-first |
| CA-04 | La interfaz principal de captura no suma controles permanentes nuevos. | Inspección visual |

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
| CA-02 | Al escribir, el listado se filtra en tiempo real mostrando solo las notas activas cuyo título o contenido coinciden con el texto ingresado. | Test funcional |
| CA-03 | La búsqueda aplica debounce (≥200ms) para evitar re-renders innecesarios. | Verificación en código |
| CA-04 | Al borrar el texto de búsqueda, se restaura el listado completo. | Test funcional |
| CA-05 | La búsqueda es global entre notas activas aunque el usuario esté ubicado en Entrada o en una materia específica. | Test unitario |
| CA-06 | La búsqueda no depende de tildes ni mayúsculas/minúsculas (`algebra` encuentra `Álgebra`). | Test unitario |

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

### HU-015 — Marcar estado académico de una nota

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **marcar mis notas con un emoji de estado académico** (📖 ❓ 🔥 ✅), para **saber de un vistazo qué temas necesitan atención antes de un examen**. |
| **RF asociados** | [RF-025](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | SHOULD |
| **Story Points** | **3 SP** — Nueva columna en BD (migración idempotente), función toggle en el store, badge visual en la tarjeta y submenú de selección. |
| **Hito** | 04 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Hay un botón con ícono de carita junto al menú de opciones que despliega un panel horizontal con los 4 emojis curados (sin texto). | Inspección visual |
| CA-02 | Al seleccionar un emoji, este aparece como badge en la tarjeta de la nota. | Test funcional |
| CA-03 | Al seleccionar el mismo emoji que ya tiene la nota, el marcador se quita (toggle). | Test funcional |
| CA-04 | El marcador persiste al cerrar y reabrir la aplicación (almacenado en SQLite). | Test manual |

---

### HU-016 — Papelera de reciclaje con eliminación lógica

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero que **las notas y materias eliminadas vayan a una papelera de reciclaje** en lugar de borrarse definitivamente, para **poder recuperar contenido eliminado por error sin perder mi trabajo**. |
| **RF asociados** | [RF-026](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | SHOULD |
| **Story Points** | **8 SP** — Migración de schema SQLite (`deletedAt`), lógica de soft-delete con cascada para materias/secciones/notas, restauración individual y masiva, vista de papelera en la UI, badge de conteo en drawer, umbral de alerta (≥50 items), y vaciado permanente. |
| **Hito** | 04 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Al eliminar una nota desde el menú contextual, la nota desaparece del feed pero no se borra de la base de datos (campo `deletedAt` se marca con la fecha actual). | Test funcional + verificación en BD |
| CA-02 | Al eliminar una materia, sus secciones hijas y notas asociadas también se mueven a la papelera (cascada). | Test funcional |
| CA-03 | Existe una vista “Papelera” accesible desde el drawer que lista todas las notas y materias eliminadas, ordenadas por fecha de eliminación. | Inspección visual |
| CA-04 | El usuario puede restaurar una nota o materia individual desde la papelera. Al restaurar una materia, sus secciones y notas asociadas también se restauran. | Test funcional |
| CA-05 | El usuario puede vaciar la papelera completa, eliminando permanentemente todos los items (DELETE físico). | Test funcional |
| CA-06 | Un badge numérico en el botón de Papelera del drawer muestra el conteo de items eliminados. Cuando supera 50, se muestra una advertencia visual (toast). | Inspección visual |

---

### HU-017 — Filtrar y organizar notas por materia y sección

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **crear materias y secciones y asignar mis notas a ellas**, para **mantener mis apuntes clasificados académicamente y filtrarlos en el listado principal**. |
| **RF asociados** | [RF-014](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | MUST |
| **Story Points** | **8 SP** — Estructura jerárquica en base de datos SQLite con validación de profundidad máxima (DP-004), UI en el drawer para crear y renombrar, selector de materia en el editor de notas y filtrado reactivo del listado principal. |
| **Hito** | 04 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | El usuario puede crear materias raíces y subsecciones de hasta 2 niveles de profundidad (DP-004) desde el drawer. | Test funcional |
| CA-02 | El usuario puede renombrar y eliminar materias/secciones de forma inline desde el drawer. | Test funcional |
| CA-03 | Al seleccionar una materia o sección en el drawer, el feed principal se filtra mostrando solo las notas pertenecientes a esa categoría. | Test funcional |
| CA-04 | En el editor de notas, se puede asociar la nota activa a cualquier materia o sección mediante un selector dropdown. | Test funcional |
| CA-05 | La jerarquía y nombres de las materias persisten en SQLite. | Test manual |

---

## Hito 05 — Preparación de Release y Mejoras Funcionales Controladas (Septiembre 2026)

### HU-005 — Borradores persistentes del editor

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero que **Lumapse conserve un borrador local de lo que estoy escribiendo o editando**, para **poder salir a consultar un PDF, copiar texto o volver más tarde sin perder mi trabajo y manteniendo el control sobre cuándo se guarda la nota final**. |
| **RF asociados** | [RF-005](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | MUST |
| **Story Points** | **5 SP** — Persistencia local con debounce, restauración de nota nueva y edición, indicador visual, descarte explícito y edge cases de navegación/cierre. |
| **Hito** | 05 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Mientras el usuario crea una nota, el editor conserva título, contenido y materia/sección seleccionada como borrador local sin crear una nota final. | Test unitario + prueba manual |
| CA-02 | Mientras el usuario edita una nota existente, el editor conserva los cambios pendientes asociados a la nota original sin actualizarla hasta tocar `Actualizar`. | Test unitario |
| CA-03 | Al volver a Lumapse o reabrir una vista con editor disponible, el borrador se restaura y permite continuar escribiendo. | Test de componente + prueba manual con cambio de app/PDF |
| CA-04 | Al guardar o actualizar con éxito, el borrador se elimina; si falla la persistencia definitiva, el borrador queda disponible. | Test unitario |
| CA-05 | El usuario puede descartar el borrador con confirmación explícita y el editor vuelve a un estado limpio. | Test de componente |
| CA-06 | Si la nota original de un borrador de edición ya no existe, el contenido pendiente se conserva como borrador de nota nueva para evitar pérdida de texto. | Test unitario |

---

### HU-027 — Marcar fechas académicas importantes

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **marcar fechas de parciales, finales, trabajos prácticos y exposiciones en Lumapse**, para **tener recordatorios académicos junto a mis notas sin usar una agenda aparte**. |
| **RF asociados** | [RF-027](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada) |
| **Prioridad** | SHOULD |
| **Story Points** | **8 SP** — Integra nueva tabla SQLite, servicio de dominio, estado global, render en Heatmap, diálogo accesible y lista de próximas fechas, manteniendo el alcance deliberadamente acotado. |
| **Hito** | 05 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | El usuario puede crear una fecha académica con tipo y fecha obligatorios. | Test funcional + unitario de servicio |
| CA-02 | El usuario puede asociar opcionalmente la fecha a una materia o sección existente. | Test funcional + verificación en SQLite |
| CA-03 | El Heatmap muestra un indicador visual discreto en los días con fechas académicas sin ocultar la actividad de notas. | Test de componente + inspección visual |
| CA-04 | Al seleccionar un día con eventos, se muestra una lista compacta de eventos de ese día. | Test de componente |
| CA-05 | La app muestra una lista breve de próximas fechas si existen eventos futuros. | Test de componente |
| CA-06 | Las fechas académicas persisten offline en SQLite y no dependen de servicios externos. | Test unitario SQLite + prueba sin red |
| CA-07 | La funcionalidad no solicita permisos de notificaciones ni incorpora recurrencia, horarios o sincronización externa. | Revisión de alcance + inspección de permisos |

---

### HU-028 — Enriquecer notas con comandos de formato

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante**, quiero **insertar bloques y aplicar formato desde comandos simples**, para **estructurar mis apuntes sin memorizar toda la sintaxis Markdown**. |
| **RF asociados** | [RF-028](./requisitos-funcionales.md) |
| **Persona** | [Lucía](./personas.md#persona-1--lucía-la-estudiante-organizada), [Martín](./personas.md#persona-2--martín-el-estudiante-práctico) |
| **Prioridad** | SHOULD |
| **Story Points** | **5 SP** — Registro compartido de comandos, menús `/`, `+` y `Aa`, continuidad de listas/callouts, render visual de callouts y ajustes responsive del composer. |
| **Hito** | 05 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | El slash menu ofrece bloques básicos como texto, encabezados, listas, tareas, cita, tabla, separador, código y callouts. | Test unitario + inspección visual |
| CA-02 | El botón `+` abre/cierra el menú de inserción sin parpadeos y usa iconos/pistas compactas en lugar de textos redundantes. | Test de interacción + revisión visual |
| CA-03 | El botón `Aa` aplica formato inline sobre la selección: negrita, cursiva, tachado, código inline y link. | Test unitario |
| CA-04 | Listas, checkboxes, listas numeradas, citas y callouts continúan el patrón al presionar Enter y salen del bloque con una línea vacía. | Test unitario de textarea |
| CA-05 | Los callouts principales se escriben con identificadores en inglés (`note`, `tip`, `warning`, etc.) y se renderizan con icono, color y título apropiados. | Test de MarkdownService + inspección visual |
| CA-06 | El botón dedicado de Modo Enfoque funciona también dentro de la vista fullscreen y no queda atrapado por menús desplazados. | Test funcional |
| CA-07 | El contenido guardado sigue siendo Markdown legible y portable, sin introducir formato propietario ni dependencias online. | Revisión de contenido persistido |

---

### HU-023 — Consultar información de la aplicación

| Campo | Detalle |
|---|---|
| **Historia** | Como **docente evaluador**, quiero **consultar una sección Acerca de con versión, autor, licencia y alcance del producto**, para **verificar la identidad de la app y sus condiciones sin depender de documentación externa**. |
| **RF asociados** | [RF-023](./requisitos-funcionales.md) |
| **Persona** | Prof. Ramos |
| **Prioridad** | SHOULD |
| **Story Points** | **2 SP** — Vista informativa simple: navegación secundaria, metadata de paquete, contenido estático y tests de render/escape. |
| **Hito** | 05 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | Existe un acceso “Acerca de” dentro del menú de opciones de Lumapse, sin ocupar la interfaz principal de escritura. | Test de shell + inspección visual |
| CA-02 | La vista muestra nombre de la app, versión, autor y licencia; la versión se toma de la metadata del paquete para evitar duplicación manual. | Test unitario |
| CA-03 | La vista explica brevemente el propósito de Lumapse y su alcance offline/local, aclarando que no sincroniza ni envía datos automáticamente. | Test unitario + revisión UX |
| CA-04 | La sección no incluye onboarding obligatorio ni guía Markdown ampliada; esa ayuda queda sujeta a feedback post-release. | Revisión de alcance |

---

### HU-030 — Crear backup manual externo

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante práctico**, quiero **generar un respaldo manual de mis notas en un archivo `.zip` legible**, para **conservar una copia fuera de Lumapse sin depender de sincronización automática**. |
| **RF asociados** | [RF-017](./requisitos-funcionales.md) |
| **Persona** | [Martín](./personas.md#persona-2--martín-el-estudiante-práctico) |
| **Prioridad** | SHOULD |
| **Story Points** | **8 SP** — Generación de ZIP, manifiesto, JSON estructurado, Markdown por materia/sección, salida nativa Android, recordatorio local y validación manual en dispositivo real. |
| **Hito** | 05 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | El usuario puede generar un `.zip` desde una vista secundaria de Backup. | Test funcional |
| CA-02 | El archivo contiene `manifest.json`, datos estructurados y notas Markdown legibles por materia/sección. | Test unitario + verificación con `unzip` |
| CA-03 | La exportación funciona sin conexión y no sube datos automáticamente a servicios externos. | Prueba en modo avión |
| CA-04 | En Android, el usuario puede elegir destino mediante share sheet o gestor de archivos; Google Drive solo aparece si está instalado. | Prueba manual en dispositivo real |
| CA-05 | La app muestra estado de red y recordatorio local de 30 días sin prometer sincronización automática. | Test de UI |
| CA-06 | El plan operativo queda archivado como evidencia histórica. | Revisión documental |

---

### HU-031 — Importar backup ZIP de Lumapse

| Campo | Detalle |
|---|---|
| **Historia** | Como **estudiante práctico**, quiero **importar un respaldo `.zip` generado por Lumapse**, para **recuperar mis notas en el mismo dispositivo o en una instalación limpia sin depender de sincronización automática**. |
| **RF asociados** | [RF-018](./requisitos-funcionales.md) |
| **Persona** | [Martín](./personas.md#persona-2--martín-el-estudiante-práctico) |
| **Prioridad** | COULD |
| **Story Points** | **8 SP** — Parser/validador de ZIP, preview de importación, política no destructiva de duplicados, escritura transaccional en SQLite, UI de confirmación y validación en Android real. |
| **Hito** | 05 |

**Criterios de Aceptación:**

| CA | Descripción | Verificación |
|---|---|---|
| CA-01 | El usuario puede seleccionar un `.zip` generado por Lumapse desde la vista secundaria de Backup. | Test funcional |
| CA-02 | La app valida `manifest.json`, versión/formato y archivos requeridos antes de escribir en la base local. | Test unitario |
| CA-03 | Antes de confirmar, la UI muestra una vista previa con totales de notas, materias, secciones y fechas académicas detectadas. | Test de UI |
| CA-04 | La importación escribe notas, materias, secciones y fechas académicas de forma transaccional; si hay error, el workspace existente queda intacto. | Test de integración |
| CA-05 | Los duplicados y colisiones se resuelven con una política no destructiva, omitiendo elementos existentes en lugar de sobrescribirlos silenciosamente. | Test de regresión |
| CA-06 | Al finalizar, la app informa cuántos elementos fueron importados, omitidos o rechazados. | Test funcional |
| CA-07 | El flujo queda validado en Android real importando un ZIP en una instalación existente y en una instalación limpia. | Prueba manual documentada |

---

## Hito 06 — Entrega Final (Octubre 2026)

No hay HU funcionales nuevas asignadas a Hito 06 en este corte. El foco previsto es cierre documental, validación final y presentación académica.

---

## Resumen

| Métrica | Hito 02 | Hito 03 | Hito 04 | Hito 05 | Hito 06 | Futuro | Total |
|---|---|---|---|---|---|---|---|
| **Total HU** | 5 | 3 | 7 | 6 | 0 | 1 | **22** |
| **Total Story Points** | 15 | 13 | 37 | 36 | 0 | 3 | **104** |
| **Total Criterios de Aceptación** | 16 | 10 | 30 | 37 | 0 | 4 | **97** |
| **Prioridad predominante** | MUST | MUST/SHOULD | SHOULD/MUST | MUST/SHOULD | — | SHOULD | — |
| **Personas cubiertas** | Lucía (3), Martín (2) | Lucía (2), Martín (1) | Lucía (6), Martín (1) | Lucía (3), Martín (3), Prof. Ramos (1) | — | Martín (1) | Lucía (14), Martín (8), Prof. Ramos (1) |

---

## Trazabilidad: HU → RF → Persona

| HU | RF | Persona | Funcionalidad | SP | Hito |
|---|---|---|---|---|---|
| HU-001 | RF-001 | Lucía | Crear nota | 2 | 02 |
| HU-002 | RF-002 | Martín | Editar nota | 3 | 02 |
| HU-003 | RF-003 | Lucía | Eliminar nota | 2 | 02 |
| HU-004 | RF-004 | Lucía | Listado de notas | 3 | 02 |
| HU-006 | RF-007 | Martín | Persistencia local | 5 | 02 |
| HU-007 | RF-010/011 | Lucía | Renderizar Markdown | 5 | 03 |
| HU-008 | RF-016 | Martín | Compartir/exportar nota individual | 3 | Futuro |
| HU-012 | RF-008 | Lucía | Funcionamiento offline | 5 | 03 |
| HU-013 | RF-012 | Martín | Modos edición/lectura | 3 | 03 |
| HU-009 | RF-013 | Lucía | Fijar y archivar notas | 5 | 04 |
| HU-010 | RF-015 | Martín | Buscar notas | 3 | 04 |
| HU-011 | RF-019 | Lucía | Modo oscuro/claro | 5 | 04 |
| HU-014 | RF-020 | Lucía | Diseño responsive | 5 | 04 |
| HU-015 | RF-025 | Lucía | Marcadores de estado académico | 3 | 04 |
| HU-016 | RF-026 | Lucía | Papelera de reciclaje | 8 | 04 |
| HU-017 | RF-014 | Lucía | Categorización y filtrado por materias | 8 | 04 |
| HU-005 | RF-005 | Lucía | Borradores persistentes del editor | 5 | 05 |
| HU-027 | RF-027 | Lucía | Fechas académicas discretas | 8 | 05 |
| HU-028 | RF-028 | Lucía, Martín | Editor enriquecido y slash commands | 5 | 05 |
| HU-023 | RF-023 | Prof. Ramos | Sección Acerca de | 2 | 05 |
| HU-030 | RF-017 | Martín | Backup manual externo | 8 | 05 |
| HU-031 | RF-018 | Martín | Importación de backup ZIP | 8 | 05 |
| | | | **Total** | **104** | |

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

> **Nota:** Las HU de próximos hitos se agregan cuando el alcance está definido y trazado contra requisitos funcionales. Este documento es un artefacto vivo que crece con el proyecto.

---

*Documento de la fase Idear / Prototipar · Design Thinking · Lumapse · PP3 · 2026*
