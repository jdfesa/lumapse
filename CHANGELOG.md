# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Conventional Commits](https://www.conventionalcommits.org/).

---

## [0.4.0] — 2026-08 — Hito 04: Organización y UX (En progreso)

### Added
- **Funcionalidad Pin y Archivar (RF-013):** Las notas pueden fijarse (aparecen al tope del feed con indicador visual) o archivarse (ocultas del feed, accesibles desde "Ver archivadas" en el drawer). IndexedDB upgrade a v2 con backfill automático.
- **Búsqueda en tiempo real (RF-015):** Input de búsqueda en el drawer que filtra notas por título y contenido con debounce de 200ms.
- **Heatmap de contribuciones:** Componente visual en el drawer que muestra la actividad de creación de notas en formato calendario mensual.
- **Menú contextual de tres puntos:** Dropdown en cada tarjeta de nota con opciones: Fijar, Archivar, Editar y Eliminar.
- **Fuentes auto-alojadas:** JetBrains Mono descargada a `public/fonts/` (woff2 variable, subsets latin + latin-ext) para funcionamiento 100% offline.
- **Botón "Ver archivadas" en drawer:** Toggle entre feed normal y vista de notas archivadas, con estilo activo.
- **Toggle modo oscuro/claro (RF-019):** `ThemeService.js` modular con persistencia en `localStorage`, detección de preferencia del OS (`prefers-color-scheme`) y actualización dinámica de `meta[name="theme-color"]` para la barra de estado de Android. Paleta light theme inspirada en Notion con tokens semánticos en `[data-theme="light"]`. Botón sol/luna en el drawer.
- **Scripts de automatización (`scripts/`):** Cuatro scripts para estandarizar flujos de trabajo: `deploy-android.sh` (despliegue limpio en dispositivo), `clean.sh` (limpieza segura de cachés), `check-docs.sh` (auditoría rápida de TODOs y estado Git) y `check-traceability.py` (auditoría de coherencia entre RF, HU, ADR, CHANGELOG y código fuente — 6 chequeos automáticos).
- `docs/producto/decisiones-producto.md` — Registro de decisiones de producto con trazabilidad hacia la encuesta de validación.
- P12 agregada a la encuesta de relevamiento: preferencia de organización (carpetas vs tags).
- `docs/hitos/hito-00-abril.md` — Informe retroactivo del Hito 00 (Investigación y Anteproyecto).

### Changed
- **DP-001: Título unificado (estilo Typora).** Se eliminó el campo de título separado del editor. El título se extrae automáticamente de la primera línea `# ` del contenido Markdown.
- **Rediseño UI a estética Notion/Obsidian:** Interfaz minimalista con paleta oscura suave, tipografía monospace y micro-animaciones.
- **Jerarquía de Markdown en feed:** Encabezados H1-H3 con tamaños y pesos corregidos para legibilidad.
- **Layout mobile-first (RF-020):** Arquitectura responsive con drawer lateral, sin sidebar fija.
- **Migración de colores hardcodeados a tokens CSS:** Todos los valores `rgba()` en `NoteList.css`, `NoteEditor.css` y `Heatmap.css` reemplazados por variables semánticas (`var(--color-*)`) para compatibilidad con el sistema de temas.
- **Flujo de despliegue Android actualizado:** El ciclo de testing ahora incluye desinstalación obligatoria (`adb uninstall`) antes de instalar, para evitar caché persistente del WebView. Documentado en `docs/flujo-desarrollo-android.md`.

### Removed
- **`vite-plugin-pwa` y artefactos PWA (ADR-005):** Se eliminó `vite-plugin-pwa` (289 paquetes), `public/manifest.json`, `VitePWA()` de `vite.config.js` y `<link rel="manifest">` de `index.html`. La arquitectura es Capacitor nativa; los assets son locales por diseño.
- `@import` remoto de Google Fonts en `main.css` — reemplazado por `@font-face` locales.

### Security
- **Hardening XSS en MarkdownService (Paso 7):** Eliminada la etiqueta `<img>` y atributos `src`/`alt` de la whitelist de DOMPurify para prevenir peticiones HTTP externas (tracking por pixel espía, privacy leaks). Agregados `FORBID_TAGS` y `FORBID_ATTR` como defensa en profundidad. Hook `afterSanitizeAttributes` bloquea `javascript:` y `data:` en hrefs y fuerza `rel="noopener noreferrer nofollow"` en enlaces externos. Verificado: cero peticiones externas al renderizar Markdown con payloads maliciosos.

### Fixed
- **Exportación de notas vacías:** Validación de contenido significativo antes de exportar.
- **Ícono nativo:** Eliminados bordes blancos del ícono de la aplicación.
- **Caché de WebView en despliegues Android:** Detectado y resuelto el problema de assets web obsoletos al actualizar el APK in-place. La solución (desinstalación previa) fue documentada y automatizada en `scripts/deploy-android.sh`.

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
