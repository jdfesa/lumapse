# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Conventional Commits](https://www.conventionalcommits.org/).

---

## [0.4.0] — 2026-08 — Hito 04: Organización y UX (En progreso)

### Changed
- **DP-001: Título unificado (estilo Typora).** Se eliminó el campo de título separado del editor. El título de la nota se extrae automáticamente de la primera línea `# ` del contenido Markdown. El campo `title` en la base de datos se mantiene como valor derivado/caché para la barra lateral y la exportación.
- `NoteEditor.js`: reescrito para eliminar el `<input>` de título, extraer título vía `extractTitleFromContent()`, y pre-cargar `# ` como contenido por defecto en notas nuevas.
- `NoteEditor.css`: simplificado el header (solo contiene botones de acciones, alineados a la derecha).
- `NoteStore.js`: `createNote()` inicializa el contenido con `# ` para guiar al usuario.

### Added
- `docs/producto/decisiones-producto.md` — Registro de decisiones de producto con trazabilidad hacia la encuesta de validación.
- P12 agregada a la encuesta de relevamiento: preferencia de organización (carpetas vs tags).

### Fixed
- **Exportación de notas vacías:** Se corrigió un bug en `NoteEditor.js` donde exportar una nota recién creada sin contenido resultaba en un archivo `.md` vacío ("nota.md"). Ahora valida si hay contenido significativo y muestra un mensaje de alerta guiando al usuario. Además, se mejoró la forma de extraer el contenido actual desde el DOM para prevenir race conditions durante el auto-guardado.

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

*Los cambios futuros se agregarán encima de esta sección.*
