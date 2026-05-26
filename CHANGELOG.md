# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Conventional Commits](https://www.conventionalcommits.org/).

---

## Hito 04: Organización y UX (En progreso)

> Las versiones 0.4.0 a 0.4.6 componen el Hito 04. Cada sub-versión agrupa un lote
> lógico de trabajo entregado de forma incremental siguiendo la metodología Kanban (ADR-003).

---

## [0.4.6] — 2026-05-26 — Diálogos de Confirmación Personalizados

### Added
- **Componente de Diálogo de Confirmación Personalizado (`ConfirmDialog.js` / `ConfirmDialog.css`):** Implementación de una modal accesible (`role="alertdialog"`, `aria-modal="true"`) para la confirmación de acciones destructivas o importantes. Cuenta con soporte completo para navegación por teclado (trampa de foco con Tab y Shift+Tab, cierre con Escape y restauración del foco al elemento previamente activo).
- **Suite de tests para ConfirmDialog (`ConfirmDialog.test.js`):** 5 tests de Vitest que validan el comportamiento de navegación, confirmación, cancelación y renderizado accesible del componente.

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
- Botón y funcionalidad para exportar nota individual como archivo `.md` (RF-016) en el `NoteEditor`.
- Botón y `ExportService` con `jszip` para exportar el workspace completo como `.zip` (RF-017) en el `NoteList`.
- Botón e `ImportService` para importar archivos `.md` locales como nuevas notas (RF-018) en el `NoteList`.
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
