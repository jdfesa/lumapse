# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Conventional Commits](https://www.conventionalcommits.org/).

---

## Próximo — Hito 05: Testing, Calidad y Distribución (Preparación iniciada)

> Hito 05 queda activo desde el cierre formal del Hito 04 (2026-06-01). El foco es estabilizar, preparar distribución y revisar decisiones de alcance antes de la primera release.

---

## [Unreleased] — Preparación Hito 05 — Quality Gate, Release y Mejoras Funcionales Controladas

> Esta entrada se agrupa por bloques de trabajo para mantener el Hito 05 legible mientras sigue abierto. El corte final puede convertirse luego en una o más versiones formales si corresponde.

### Bloque 1 — Quality Gate, Release y Auditorías

#### Added
- **Scripts npm operativos:** Se expusieron `quality`, `verify`, `check:session`, `check:health`, `check:size`, `check:a11y`, `check:native-dialogs`, `check:traceability`, `check:docs`, `check:schema`, `check:dbml`, `check:subjects` y `deploy:android` para unificar el flujo local y CI.
- **Check contra diálogos nativos:** Nuevo `scripts/check-native-dialogs.js`, que bloquea `alert()`, `confirm()` y `prompt()` en `src/`, con excepción explícita para `src/utils/seeder.js`.
- **Entrypoint estable de trazabilidad:** Nuevo `scripts/check-traceability.py` como wrapper compatible para el checker preservado en `check-traceability.py.replaced`.

#### Changed
- **GitHub Actions ampliado:** El workflow existente pasó a ser `CI — Quality Gate` y ahora ejecuta lint, tests, build, bundle budget, check de diálogos nativos, trazabilidad, links internos, schema sync, DBML, jerarquía de materias y auditoría a11y estática.
- **Tests nativos Android corregidos:** Se reemplazaron los tests generados por template que referenciaban paquetes de Capacitor por tests bajo `com.lumapse.app`.
- **Versionado de paquete alineado:** `package.json` y `package-lock.json` pasan de `0.1.0` a `0.4.7`, manteniendo el paquete sincronizado con la última versión cerrada documentada antes de preparar un release/APK.
- **CSP web ajustada para SQLite WASM:** `index.html` permite el runtime WASM local necesario para `jeep-sqlite`/`sql.js`, manteniendo los recursos restringidos a orígenes locales.
- **Accesibilidad de controles secundarios:** Los tabs de Backup, el descarte de borrador y las opciones del selector de materia declaran etiquetas accesibles/tooltip, dejando `npm run check:a11y` sin advertencias.

### Bloque 2 — Mantenibilidad y TypeScript Gradual

#### Added
- **Plan de mantenibilidad y tipado gradual:** Se documentó en `docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md` una estrategia por fases para ordenar tests por feature, desacoplar store/UI, introducir contratos de dominio y migrar gradualmente módulos puros a TypeScript/JSDoc sin reescritura completa.
- **Typecheck gradual:** Se agregó TypeScript como dependencia de desarrollo, `tsconfig.json`, script `typecheck`, contratos iniciales en `src/domain/` y el typecheck dentro de `npm run verify`.

#### Changed
- **Componentes UI organizados por feature folders:** `src/components/` deja de ser una carpeta plana y pasa a agrupar editor, feed, fechas académicas, backup, Markdown y componentes comunes en subcarpetas explícitas. La decisión queda documentada en `docs/adr/ADR-007-organizacion-componentes-por-feature.md` y fue verificada con la suite unitaria.
- **Tests de componentes organizados por feature folders:** `tests/unit/components/` ahora espeja la estructura de `src/components/` con carpetas `academic-events`, `backup`, `common`, `feed` y `note-editor`, manteniendo más cerca el mapa mental de código y pruebas.
- **Store desacoplado del feedback visual:** `NoteStore.*` deja de importar `Toast`; ahora emite eventos de error de dominio mediante `NoteStore.errors.js` y `main.js` decide cómo comunicarlos en la UI.
- **Primera tanda de módulos puros migrada a TypeScript:** `AcademicEventRules`, `NoteTitleService`, `SubjectService.validation`, `BackupFormat` y `noteFilters` pasan a `.ts` con contratos mínimos y tests enfocados.
- **Primer servicio de dominio migrado a TypeScript:** `AcademicEventService` pasa a `.ts`, declara entradas/salidas publicas sobre contratos de `src/domain/academicEvents.ts` y mantiene aislado el CRUD SQLite bajo nivel.
- **Servicios puros de backup migrados a TypeScript:** `BackupNetworkService` y `BackupReminderService` pasan a `.ts` para fijar contratos de estado de red, decisiones de backup externo y recordatorios locales sin tocar Capacitor, storage ni UI.
- **Contrato de backup tipado:** `BackupDataSource` y `BackupService` pasan a `.ts`, agregando `BackupData`, `BackupItemCounts`, `BackupZipOptions` y `CurrentBackupZip` como contratos compartidos entre SQLite, ZIP, exportacion web y flujo de backup.
- **ZIP de backup y auditorias alineadas con TypeScript:** `BackupZipService` pasa a `.ts` y el auditor Rust/binario junto con scripts auxiliares de tamaño, offline, a11y, health y metricas ahora incluyen archivos `.ts`.
- **Escritor ZIP liviano tipado:** `BackupZipArchive` pasa a `.ts`, fijando contratos para archivos ZIP, opciones de salida y retorno `Blob`/`ArrayBuffer`/base64, con test directo de rutas UTF-8 y contenido binario.
- **CRUD de materias tipado:** `SubjectService.crud` pasa a `.ts`, declarando contratos de creación, actualización, archivo/desarchivo y árbol activo sobre `Subject`/`SubjectTree`, mientras `SubjectService.js` sigue como barrel público.
- **Papelera avanzada tipada:** `SubjectService.trash` pasa a `.ts`, fijando contratos de cascada, restauración navegable, notas sueltas, secciones huérfanas y salida `getTrashItems` sin cambiar el barrel público.
- **Tipos visuales de fechas académicas tipados:** `AcademicEventTypes` pasa a `.ts`, fijando contratos para tipos visuales, colores, opciones de dots/listas y acciones sin tocar los componentes grandes que lo consumen.
- **Trazabilidad preparada para JS/TS:** El checker de trazabilidad escanea comentarios en archivos `.js` y `.ts`, evitando que futuras migraciones queden fuera del control documental.

### Bloque 3 — Mejoras Funcionales Controladas

#### Added
- **Editor enriquecido y slash commands (RF-028 / HU-028):** El editor incorpora un registro compartido de comandos para `/`, botón `+` y botón `Aa`, con inserción de encabezados, listas, checkboxes, citas, tablas, separadores, código y callouts. Incluye formato inline sobre selección, botón dedicado de Modo Enfoque en el composer, continuidad inteligente con Enter para listas/citas/callouts, salida con línea vacía y popup visual con iconos/pistas compactas.
- **Borradores persistentes del editor (RF-005 / HU-005):** El editor conserva localmente el trabajo en curso al crear o editar notas, restaura el borrador al volver a la app o a una vista con editor, muestra un indicador sutil de cambios pendientes y permite descartarlo con confirmación. La nota final solo se crea o actualiza cuando el usuario toca `Guardar` o `Actualizar`; los borradores se limpian tras guardado exitoso o descarte explícito.
- **Fechas Académicas discretas (RF-027 / HU-027 / DP-007):** Implementación completa de marcadores académicos puntuales para parciales, finales, trabajos prácticos y exposiciones dentro del calendario existente. Incluye tabla SQLite `academic_events`, CRUD bajo nivel, servicio de dominio, store reactivo, dots en Heatmap, mini-card por día, modal accesible de creación/edición, lista colapsable de próximas fechas, acciones de editar/eliminar con confirmación accesible y tests unitarios de datos, store y UI.
- **Backup manual externo (RF-017 / HU-030):** Nueva vista `Backup` accesible desde el drawer para crear un `.zip` manual restaurable y legible, con `manifest.json`, JSON estructurado, notas Markdown por materia/sección, recordatorio local de 30 días, detección WiFi/datos móviles/offline y salida por share sheet/gestor de archivos. Validado en Android real; si Google Drive está instalado puede aparecer como destino, y si no, funciona el fallback de almacenamiento elegido por el usuario.
- **Importación de backup ZIP (RF-018 / HU-031):** La vista `Backup` permite seleccionar un `.zip` generado por Lumapse, validar `manifest.json`, previsualizar notas/materias/secciones/fechas académicas, importar de forma transaccional y omitir duplicados sin sobrescribir datos existentes. Validado en Android real sobre workspace existente e instalación limpia.
- **Sección Acerca de (RF-023 / HU-023):** Nueva vista accesible desde el menú de la app con versión tomada de `package.json`, autor, licencia, propósito y alcance offline/local, evitando convertirla en onboarding o guía Markdown.

#### Changed
- **Contador de materias corregido:** el badge de una materia raíz ahora suma notas directas y notas de sus secciones, mientras cada sección mantiene su contador propio.
- **Búsqueda RF-015 más útil:** La lupa ahora busca globalmente entre notas activas aunque el usuario esté ubicado en Entrada o en una materia, y normaliza tildes para que `algebra` encuentre `Álgebra`.
- **Título implícito más claro:** Las tarjetas destacan suavemente la primera línea no vacía como título cuando la nota no usa `#`, manteniendo el editor de un solo campo y reduciendo fricción para usuarios nuevos.
- **Render Markdown enriquecido:** Callouts principales se renderizan con icono, color y título por tipo; blockquotes simples, tablas, separadores, código y checkboxes tienen estilos más estables en preview y tarjetas de nota.
- **Tipografía de escritura más amable:** La interfaz conserva JetBrains Mono como identidad visual, pero el área de escritura y lectura de notas usa una pila serif nativa del sistema para una experiencia offline-first más cómoda en móvil.
- **Menú de app ampliado:** Las opciones de Lumapse ahora incluyen `Acerca de` junto a Exportar ZIP, Importar ZIP y cambio de tema; el editor se oculta en vistas informativas o de mantenimiento.
- **Reclasificación RF-005:** El auto-guardado final silencioso queda reemplazado por borradores persistentes del editor, preservando texto, título y materia/sección sin crear duplicados ni actualizar notas definitivas sin confirmación.

### Bloque 4 — Documentación, Trazabilidad y Planes Cerrados

#### Changed
- **Backlog/TODO actualizados:** El `TODO` raíz y `BACKLOG.md` registran como completada la capa de automatización, cierran formalmente Hito 04 y clasifican esta tanda como preparación de Hito 05 con cambios funcionales controlados.
- **Seguimiento de velocidad actualizado:** `docs/gestion/seguimiento-velocidad.md` registra 22 HU formalizadas, 104 SP totales, 65 SP cerrados en Hitos 02 a 04 y 36 SP formalizados en curso para Hito 05.
- **Reclasificación RF-016 y cierre de RF-017/RF-018:** La revisión documental mantiene compartir/exportar nota individual e importación `.md` como decisiones futuras, pero `RF-017` y `RF-018` dejan de ser deuda abierta porque la exportación e importación manual de backups ZIP ya quedaron integradas y validadas en Android real.
- **Plan de backup archivado:** El plan operativo de backup `.zip` y Google Drive se movió desde la raíz a `docs/gestion/historico/plan-backup-google-drive-2026-06-03.md` para conservar evidencia sin ensuciar el directorio principal.
- **Plan de importación ZIP archivado:** El plan operativo de importación de backups `.zip` se conserva en `docs/gestion/historico/plan-importacion-backup-zip-2026-06-18.md` como evidencia de alcance, fases, pruebas y validación Android.
- **Plan de editor enriquecido archivado:** El plan operativo de editor enriquecido y slash commands se movió desde la raíz a `docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md` tras completar sus fases.
- **Plan de borradores persistentes archivado:** El plan operativo de `RF-005 / HU-005` se movió desde la raíz a `docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md` tras completar implementación, tests y validación manual.

---

## Hito 04: Organización y UX (Cerrado formalmente)

> Las versiones 0.4.0 a 0.4.7 componen el Hito 04. Cada sub-versión agrupa un lote
> lógico de trabajo entregado de forma incremental siguiendo la metodología Kanban (ADR-003).
> El hito queda cerrado formalmente el 2026-06-01. El cierre se realiza con empty states pulidos y decisiones explícitas de postergación/descarte para las funcionalidades que podían agregar fricción o sugerir capacidades no presentes todavía.

### Cierre formal — 2026-06-01

#### Changed
- **Empty states de cierre UX:** Se pulieron los mensajes de feed vacío, búsqueda sin resultados, materia sin notas, archivo vacío y fecha sin notas para orientar sin agregar onboarding obligatorio.
- **RF-006 postergado:** El contador de palabras/caracteres no se incorpora al MVP para preservar un editor liviano. Queda como posible mejora futura si estudiantes reales lo solicitan.
- **RF-024 postergado:** El indicador online/offline se posterga hasta que exista sincronización, backup o integración externa. En el producto actual, todas las acciones centrales funcionan offline.
- **RF-022 postergado:** El onboarding carousel se posterga para no bloquear la primera nota con una experiencia previa. Se evaluará con feedback post-release.
- **DP-006 consolidada:** La ayuda Markdown y coach marks quedan fuera del Hito 04; cualquier ayuda ampliada deberá integrarse con la futura sección "Acerca de" de Hito 05 sin saturar la interfaz.

---

## [0.4.7] — 2026-05-26 — Integridad Transaccional de Cascadas

### Added
- **Suite de invariantes de visibilidad de notas (`noteVisibilityInvariants.test.js`):** Tests puros que validan que una nota activa siempre tenga al menos una vista primaria navegable, cubriendo Entrada, materia, sección, archivo individual y archivo heredado por materia/sección.
- **Helper transaccional SQLite (`runTransaction`):** Nueva utilidad compartida en `sqlite/connection.js` para ejecutar operaciones críticas dentro de una transacción explícita con `beginTransaction`, `commitTransaction` y `rollbackTransaction`.

### Changed
- **Cascadas de materias/secciones ahora son atómicas:** `archiveSubject`, `unarchiveSubject`, `archiveSection`, `unarchiveSection`, `deleteSubject`, `deleteSection`, `restoreSubject` y `restoreSection` se ejecutan dentro de una transacción para evitar estados parciales si falla una escritura intermedia.
- **Escrituras SQL compatibles con transacciones explícitas:** `sqlite/notes.js` y `sqlite/subjects.js` desactivan la transacción implícita de `db.run()` cuando ya existe una transacción explícita activa, evitando transacciones anidadas en Capacitor SQLite.
- **Deploy Android seguro por defecto:** `scripts/deploy-android.sh` ahora conserva los datos locales de la app al instalar, agrega `--clean` para desinstalar/borrar SQLite de forma explícita y soporta `--target <deviceId>` para evitar selectores interactivos cuando hay más de un dispositivo conectado.

---

## [0.4.6] — 2026-05-26 — Diálogos de Confirmación Personalizados y Modo Enfoque

### Added
- **Componente de Diálogo de Confirmación Personalizado (`ConfirmDialog.js` / `ConfirmDialog.css`):** Implementación de una modal accesible (`role="alertdialog"`, `aria-modal="true"`) para la confirmación de acciones destructivas o importantes. Cuenta con soporte completo para navegación por teclado (trampa de foco con Tab y Shift+Tab, cierre con Escape y restauración del foco al elemento previamente activo).
- **Suite de tests para ConfirmDialog (`ConfirmDialog.test.js`):** 5 tests de Vitest que validan el comportamiento de navegación, confirmación, cancelación y renderizado accesible del componente.
- **Modo Enfoque (Focus Mode):** Implementación de una vista libre de distracciones accesible desde el menú del botón "+" (`NoteEditor.js`). Al activarse (`composer--focus`, `focus-mode-active`), expande el editor a pantalla completa, oculta el resto de los componentes de la interfaz (cabecera, listado de notas, drawer, toasts) y presenta un botón de encoger para salir del modo. Se sale automáticamente al guardar la nota.
- **Leyenda del Botón "+" (`EditorPopup.js`):** Se añadió la leyenda informativa "Tipea / para comandos" en el pie de la popup del botón de inserción rápida.

### Changed
- **Reemplazo de diálogos nativos `confirm()`:** Se migraron todas las llamadas a `confirm()` en el ruteador de acciones del feed, listado de notas, vaciado de papelera por toast, archivado de materias/secciones y menú contextual por el nuevo componente asíncrono `confirmDialog`.
- **Reemplazo de diálogos nativos `alert()`:** Se sustituyeron las alertas de error de base de datos por `showErrorToast` en el drawer de administración de materias/secciones.

---

## [0.4.5] — 2026-05-25 — Archivado en Cascada y Papelera Avanzada

### Added
- **Archivado en cascada de materias y secciones:** Archivado y desarchivado de materias y sus secciones hijas, heredando dinámicamente la visibilidad oculta en el feed de notas (`noteFilters.js`) mediante `archivedSubjectIds` sin modificar la propiedad `archived` de las notas individuales para prevenir su pérdida. El drawer fue migrado a un menú contextual por click derecho y long-press, agregando `drawerSubjectContextMenu.js` y `drawerArchivedSubjects.js` para mantener la separación de responsabilidades y modularidad.
- **Agrupamiento avanzado y restauración en Papelera de Reciclaje (RF-026, HU-016):** Se corrigió la papelera para mostrar las materias eliminadas como carpetas agrupando sus secciones hijas e indicando el conteo total de notas, y las secciones eliminadas de forma aislada se muestran en su sección propia con la referencia de su materia madre. Se implementó una lógica de restauración inteligente con sufijos como `(restaurada)` ante colisiones de nombres del mismo nivel, y restauración en cadena que recupera o desarchiva el contenedor padre automáticamente.
- **Componente Toast y Notificaciones en UI:** Implementado `Toast.js` (`src/components/Toast.js`) y sus estilos en `main.css` para proveer notificaciones no intrusivas en la UI ante acciones del usuario y errores del sistema.
- **Manejo de Errores SQLite y Resiliencia:** Estructura de excepciones `DatabaseError` (`src/services/sqlite/errors.js`) con capturadores `try/catch` robustos en la persistencia SQLite, previniendo fallos silenciosos y mostrando alertas amigables al usuario mediante Toasts.
- **Virtualización del Feed de Notas (`VirtualFeed.js`):** Nuevo componente que implementa *List Virtualization* basándose en `IntersectionObserver`, caching dinámico de alturas con búsqueda binaria y posicionamiento absoluto para soportar miles de notas sin degradación de rendimiento.

### Deuda Técnica (Pendiente)
- **Sección de Ayuda / Onboarding (DP-006):** Implementar una sección accesible que explique al usuario cómo usar la app, incluyendo el significado de los emojis de estado y las funcionalidades principales. Objetivo: que cualquier estudiante pueda usar la app desde el día uno sin manual externo.
- **Gráficos ER y modelo lógico desactualizados:** Los diagramas exportados (notación Chen y modelo lógico relacional) deben regenerarse para reflejar los campos `deletedAt` y `statusEmoji` de la Papelera de Reciclaje.

---

## [0.4.4] — 2026-05-23 — Tooling, Testing y Refactorización

### Added
- **Auditor Concurrente en Rust v0.1.0 (Script #35):** `lumapse-audit` unifica verificaciones de tamaño (LOC), tareas pendientes (TODO/FIXME) y arquitectura offline-first en un único pase multi-hilo, acelerando el Quality Gate de ~200ms a ~2ms.
- **Auditor Rust v0.2.0 — 3 módulos nuevos:** Absorción de tres scripts Python críticos al binario Rust nativo: `schema_sync` (sincronización schema SQLite ↔ DDL documentado), `doc_links` (auditoría de 297 links internos en Markdown) y `subjects_hierarchy` (validación de jerarquía de materias en memoria). Flag `--all` ejecuta los 5 módulos en un único comando. Tiempo de ejecución total: < 5ms.
- **`scripts/docs/evolucion-toolchain-rust.md`:** Documento dedicado que registra la evolución del toolchain de scripts hacia Rust nativo, con política de preservación de scripts originales y comparativa de rendimiento. Extrae el contenido que habría hinchado `scripts/README.md`.
- **Suite de tests unitarios Vitest (Hito 05 — Preparación):** 294 tests unitarios en 9 archivos dentro de `tests/unit/`. Cobertura 90.15% statements / 93.91% functions sobre el scope crítico (servicios y store). Incluye `vitest.config.js` separado del config de Vite y configuración de cobertura V8. Scripts agregados: `test`, `test:watch`, `test:coverage`, `test:ui`.
- **Scripts de automatización (`scripts/`):** Cuatro scripts para estandarizar flujos de trabajo: `deploy-android.sh` (despliegue limpio en dispositivo), `clean.sh` (limpieza segura de cachés), `check-docs.sh` (auditoría rápida de TODOs y estado Git) y `check-traceability.py` (auditoría de coherencia entre RF, HU, ADR, CHANGELOG y código fuente — 6 chequeos automáticos).

### Changed
- **Control de Acciones del Feed (`FeedActionRouter.js`):** Extracción de la lógica del delegador de clicks de `NoteList.js` hacia una clase dedicada de ruteo de acciones, reduciendo la complejidad ciclomática de 19 a < 10.
- **Quality gate unificado (`quality.sh`):** Reemplaza las llamadas a `check-docs.sh` y `check-file-size.sh` por un único `./scripts/lumapse-audit-bin --all`, reduciendo el tiempo del quality gate en pre-push a < 10ms totales. El auditor Rust ejecuta los 5 módulos en un solo pase.
- **Refactorización mecánica de archivos grandes:** Split quirúrgico de módulos >400 LOC sin cambiar comportamiento ni API pública. `SubjectService.js` quedó como barrel y delega en `SubjectService.validation.js`, `SubjectService.crud.js` y `SubjectService.trash.js`; `NoteList.js` delega helpers de tarjetas en `NoteCardRenderer.js` y la vista de papelera en `TrashView.js`; `NoteList.css` importa `NoteCard.css` y `TrashView.css`; `drawer.css` importa `drawer-subjects.css` y `drawer-trash.css`; `drawerController.js` delega materias y tema en `drawerSubjects.js` y `drawerTheme.js`. Verificado con build, tests, guardia de tamaño y lint.
- **Refactorización de NoteStore:** `NoteStore.js` dividido en submódulos (`state`, `data`, `ui`) con barrel file para mantener retrocompatibilidad.

### Fixed
- **Modo Compatibilidad (Scripts Python):** Corregido fallo de ejecución en `check-schema-sync.py` and `generate-dbml-from-code.py` al apuntar a la antigua ruta de persistencia (`SqliteService.js` → `sqlite/connection.js`).

---

## [0.4.3] — 2026-05-22 — Categorización por Materias y Papelera

### Added
- **Secciones anidadas (Profundidad Nivel 2):** Botón "+" en el drawer para crear subsecciones (ej. "Unidad I") dentro de una materia raíz ("Programación I"), aplicando automáticamente herencia de color.
- **Edición inline de materias y secciones (RF-014):** Botón de edición (✏️) al lado de cada materia o sección en el drawer que activa un modo de renombrado inline, con foco automático, guardado al presionar `Enter` o perder foco (blur), y cancelación al presionar `Escape`.
- **Submenú "Mover a":** Menú contextual (flyout) en cada tarjeta de nota para mover notas rápidamente entre diferentes materias y secciones.
- **Breadcrumbs en badges:** Las notas pertenecientes a subsecciones muestran un badge de materia completo con el formato `Padre › Hijo` (ej. "Programación I › Unidad I").
- **Papelera de Reciclaje (RF-026, HU-016):** Eliminación lógica (soft-delete) mediante campo `deletedAt` en `notes` y `subjects`. Al eliminar una nota o materia, se marca con timestamp en lugar de borrarla físicamente. La eliminación de una materia aplica cascada a secciones hijas y notas asociadas. Vista dedicada en el drawer con listado de items eliminados (notas y materias), botones de restaurar individual y vaciar papelera. Badge de conteo en el drawer y advertencia visual (toast) cuando la papelera supera 50 items. Migración de schema SQLite idempotente.
- **Marcadores de estado académico (DP-005, RF-025):** Set curado de 4 emojis (📖 ❓ 🔥 ✅) para marcar el estado de comprensión de cada nota. Badge visual en la tarjeta del feed y submenú "Estado" en el menú contextual. Persistencia en SQLite con migración idempotente.

### Changed
- **Modelo Lógico:** Regenerado el archivo `03-modelo-logico-relacional.dbml` para apuntar a la ruta correcta de persistencia en la cabecera del archivo.

---

## [0.4.2] — 2026-05-20 — Migración a SQLite y Seguridad

### Added
- **Persistencia en SQLite (ADR-006):** Migración de la capa de datos de IndexedDB a SQLite utilizando `@capacitor-community/sqlite`. Incluye soporte de simulación en web con `sql.js` (WebAssembly) y `jeep-sqlite` para el desarrollo local, y un script de migración automático (one-time) de IndexedDB legacy a SQLite.

### Changed
- **Capa de Persistencia:** Reemplazo de `NoteService.js` por `SqliteService.js` y actualización de `NoteStore.js` y `ExportService.js` para consumir la base de datos SQLite.
- **Plantilla de ADRs:** Modificada la plantilla de `generate-adr.sh` para establecer como autor a Jose David Sandoval de forma predeterminada.

### Removed
- **Biblioteca IndexedDB:** Desinstalación de la dependencia `idb` y remoción del antiguo `NoteService.js`.

### Security
- **Hardening XSS en MarkdownService (Paso 7, rev. 2):** Política quirúrgica de `<img>`: se permiten imágenes con `src` local (`data:`, `blob:`, rutas relativas) y se bloquean URLs externas (`http://`, `https://`) para prevenir tracking por pixel espía sin quitarle funcionalidad al usuario. Hook `afterSanitizeAttributes` filtra selectivamente por `node.tagName === 'IMG'`. Complementado con `FORBID_TAGS`/`FORBID_ATTR` como defensa en profundidad. Hook adicional bloquea `javascript:` y `data:` en hrefs de `<a>` y fuerza `rel="noopener noreferrer nofollow"` en enlaces externos.
- **Content Security Policy (CSP) en `index.html`:** Meta tag `Content-Security-Policy` que restringe la carga de recursos a nivel de WebView/browser: `img-src 'self' data: blob: capacitor://localhost http://localhost`, `script-src 'self'`, `default-src 'self'`. Actúa como segunda capa de defensa — incluso si DOMPurify es bypasseado, el motor del WebView aborta las peticiones externas.
- **Suite Vitest con tests de sanitización:** 15 tests de seguridad en `MarkdownService.test.js` verifican de forma automatizada la política de dos capas: `<img>` con src externo se limpia, `<img>` con `data:` URI y ruta relativa sobrevive, `<script>`, `javascript:`, `onclick`, `srcset` y `poster` son eliminados. 294 tests totales, todos pasando.

### Fixed
- **Encabezados de ADRs:** Cambiada la etiqueta de plural a singular (`**Autores:**` → `**Autor:**`) en todos los archivos de arquitectura (ADR-001 a ADR-006) y en la plantilla de `generate-adr.sh`, dado que el desarrollo es individual.
- **Autoría de ADR-006:** Corregido el campo de autor en el documento de persistencia SQLite para establecer a Jose David Sandoval en lugar de Equipo de Lumapse.

---

## [0.4.1] — 2026-05-18 — Branding Nativo y Documentación Académica

### Added
- **Branding de Lumapse nativo (Android):** Reemplazo completo de la identidad genérica de Capacitor en el APK por la identidad visual real de Lumapse. Incluye 15 íconos de launcher adaptativos multiplataforma generados con `scripts/generate-icons.py` y 11 splash screens (en modo vertical y horizontal) con logo y nombre generados con `scripts/generate-splash.py`. Se ajustaron los colores de fondo de los íconos adaptativos y splash screens a `#1a1d23` para coherencia con la UI.
- **Logotipo en UI (Header y Drawer):** Sustitución del ícono de cubo genérico en SVG por la imagen de marca de la bombilla neuronal de Lumapse (`icon-144x144.png`) con dimensiones y alineaciones pulidas en el App Shell.
- **Scripts de automatización de branding:** `scripts/generate-icons.py` y `scripts/generate-splash.py` añadidos al repositorio para mantener el flujo de recreación de assets documentado, limpio y repetible.
- `docs/hitos/hito-00-abril.md` — Informe retroactivo del Hito 00 (Investigación y Anteproyecto).

### Changed
- **Flujo de despliegue Android actualizado:** El ciclo de testing ahora incluye desinstalación obligatoria (`adb uninstall`) antes de instalar, para evitar caché persistente del WebView. Documentado en `docs/flujo-desarrollo-android.md`.

### Fixed
- **Ícono nativo:** Eliminados bordes blancos del ícono de la aplicación.
- **Caché de WebView en despliegues Android:** Detectado y resuelto el problema de assets web obsoletos al actualizar el APK in-place. La solución (desinstalación previa) fue documentada y automatizada en `scripts/deploy-android.sh`.

---

## [0.4.0] — 2026-05-17 — Hito 04: Core UX — Organización y Diseño Visual

### Added
- **Funcionalidad Pin y Archivar (RF-013):** Las notas pueden fijarse (aparecen al tope del feed con indicador visual) o archivarse (ocultas del feed, accesibles desde "Ver archivadas" en el drawer). IndexedDB upgrade a v2 con backfill automático.
- **Búsqueda en tiempo real (RF-015):** Input de búsqueda en el drawer que filtra notas por título y contenido con debounce de 200ms.
- **Heatmap de contribuciones:** Componente visual en el drawer que muestra la actividad de creación de notas en formato calendario mensual.
- **Menú contextual de tres puntos:** Dropdown en cada tarjeta de nota con opciones: Fijar, Archivar, Editar y Eliminar.
- **Fuentes auto-alojadas:** JetBrains Mono descargada a `public/fonts/` (woff2 variable, subsets latin + latin-ext) para funcionamiento 100% offline.
- **Botón "Ver archivadas" en drawer:** Toggle entre feed normal y vista de notas archivadas, con estilo activo.
- **Toggle modo oscuro/claro (RF-019):** `ThemeService.js` modular con persistencia en `localStorage`, detección de preferencia del OS (`prefers-color-scheme`) y actualización dinámica de `meta[name="theme-color"]` para la barra de estado de Android. Paleta light theme inspirada en Notion con tokens semánticos en `[data-theme="light"]`. Botón sol/luna en el drawer.
- `docs/producto/decisiones-producto.md` — Registro de decisiones de producto con trazabilidad hacia la encuesta de validación.
- P12 agregada a la encuesta de relevamiento: preferencia de organización (carpetas vs tags).

### Changed
- **DP-001: Título unificado (estilo Typora).** Se eliminó el campo de título separado del editor. El título se extrae automáticamente de la primera línea `# ` del contenido Markdown.
- **Rediseño UI a estética Notion/Obsidian:** Interfaz minimalista con paleta oscura suave, tipografía monospace y micro-animaciones.
- **Jerarquía de Markdown en feed:** Encabezados H1-H3 con tamaños y pesos corregidos para legibilidad.
- **Layout mobile-first (RF-020):** Arquitectura responsive con drawer lateral, sin sidebar fija.
- **Migración de colores hardcodeados a tokens CSS:** Todos los valores `rgba()` en `NoteList.css`, `NoteEditor.css` y `Heatmap.css` reemplazados por variables semánticas (`var(--color-*)`) para compatibilidad con el sistema de temas.

### Removed
- **`vite-plugin-pwa` y artefactos PWA (ADR-005):** Se eliminó `vite-plugin-pwa` (289 paquetes), `public/manifest.json`, `VitePWA()` de `vite.config.js` y `<link rel="manifest">` de `index.html`. La arquitectura es Capacitor nativa; los assets son locales por diseño.
- `@import` remoto de Google Fonts en `main.css` — reemplazado por `@font-face` locales.

### Fixed
- **Exportación de notas vacías:** Validación de contenido significativo antes de exportar.

---

## [0.3.0] — 2026-07 — Hito 03: MVP Completo ✅

### Added
- Dependencias `marked` (v18) y `dompurify` (v3) para renderizado de Markdown seguro.
- `src/services/MarkdownService.js` — Servicio de conversión Markdown → HTML sanitizado (RF-010, RF-011).
- `src/components/MarkdownPreview.js` + `.css` — Componente de vista previa de Markdown en tiempo real (RF-010).
- Toggle de modos de vista en `NoteEditor` permitiendo alternar entre modo Edición, Dividido (Split) y Lectura (RF-012).
- Base técnica inicial para exportación/importación Markdown (`ExportService`, `ImportService`, `jszip`). En ese corte posterior al pivote mobile-first la UI no exponía estos flujos; `RF-016`, `RF-017` y `RF-018` pasaron temporalmente a deuda posterior.
- Dependencia `vite-plugin-pwa` y configuración en `vite.config.js` para generación automática de Service Worker y caché estático (RF-008, RF-009, RF-021).
- `docs/hitos/hito-03-julio.md` — Informe de seguimiento del Hito 03 actualizado.

### Changed
- `NoteEditor`: integración de layout split (editor + preview) con actualización en tiempo real.
- `NoteEditor.css`: estilos actualizados para soportar layouts de edición y lectura centralizada.

---

## [0.2.0] — 2026-06 — Hito 02: Core del Editor ✅

### Added
- Dependencia `idb` para el manejo de IndexedDB con promesas.
- `src/services/NoteService.js` — Capa de persistencia con IndexedDB (operaciones CRUD).
- `src/store/NoteStore.js` — Gestor de estado reactivo (patrón Observer) para mantener la UI sincronizada con los datos.
- Componente `NoteList` (`.js` y `.css`) — Barra lateral UI para renderizar el listado y permitir la creación/selección de notas.
- Componente `NoteEditor` (`.js` y `.css`) — UI principal de escritura con borrado y título.
- Funcionalidad de Auto-guardado en tiempo real (debounce 800ms) implementada dentro del editor.
- Integración del layout base usando *Flexbox* en `main.js`.

---

## [0.1.0] — 2026-05 — Hito 01: Fundación
### Added
- Inicialización del repositorio Git con estructura profesional
- Configuración de Vite 6 como build tool
- Sistema de diseño base: design tokens, tipografía (Inter + JetBrains Mono), paleta de colores
- `index.html` — punto de entrada de la PWA con meta tags, theme-color y manifest
- `src/main.js` — bootstrap de la aplicación
- `src/styles/main.css` — estilos base con CSS Custom Properties
- `public/manifest.json` — Web App Manifest (PWA shell)
- `README.md` profesional con badges, stack, setup y roadmap
- `CHANGELOG.md` — este documento
- `docs/adr/ADR-001` — Decisión de stack tecnológico
- `docs/adr/ADR-002` — Decisión de persistencia offline (IndexedDB)
- `docs/adr/ADR-003` — Decisión de metodología (Kanban)
- `docs/adr/ADR-004` — Decisión de estructura de carpetas
- `.github/ISSUE_TEMPLATE/` — Templates para features y bugs
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.gitignore` configurado para Node.js + macOS + Vite
- `docs/hitos/hito-01-mayo.md` — Informe de avance del Hito 01

---

## [0.0.0] — 2026-04 — Hito 00: Investigación y Anteproyecto ✅

> *Documentado retroactivamente a partir de la evidencia en commits (14 commits, 17–29 abr 2026).*

### Added
- Inicialización del repositorio Git con README e identidad académica (institución, profesor, alumno)
- `docs/anteproyecto/` — Anteproyecto formal del proyecto para PP3
- Documentación de producto — Design Thinking: personas y lean canvas
- Definición de público objetivo: estudiantes hispanohablantes con conectividad limitada
- Historias de usuario iniciales (HU-001 a HU-005) para CRUD y auto-guardado
- Diagramas UML: casos de uso, secuencia y modelo de dominio
- Plan de recolección de datos con metodología estadística
- Diseño y refinamiento de la encuesta de relevamiento (corrección de sesgos)
- Tag `LBREQ-v1.0` marcando el cierre del relevamiento de requisitos iniciales
- `docs/hitos/hito-00-abril.md` — Informe de avance del Hito 00

---

*Los cambios futuros se agregarán encima de esta sección.*
