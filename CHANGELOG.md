# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)
y este proyecto adhiere a [Conventional Commits](https://www.conventionalcommits.org/).

---

## [0.2.0] — 2026-06 — Hito 02: Core del Editor (En progreso)

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
