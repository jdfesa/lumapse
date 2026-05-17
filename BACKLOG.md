# Backlog y Deuda Técnica — Lumapse

Este documento funciona como una bandeja de entrada local para las tareas, mejoras y deuda técnica identificadas durante el desarrollo o en auditorías. Una vez que se inicia un Hito, las tareas relevantes de aquí se planifican y ejecutan.

> **Hito activo:** 04 — Organización y UX (Agosto 2026)
> **Último commit:** `d3e20a7` — docs: actualizar estado de tareas en el backlog
> **Última auditoría del backlog:** 2026-05-16

---

## 🎯 Próximos 3 Pasos (Sprint inmediato)

Estos son los 3 bloques de trabajo a ejecutar en orden. No se avanza al siguiente hasta completar el actual.

### ~~Paso 1: Offline estricto — Fuentes locales + limpieza PWA~~ ✅ Completado (2026-05-16)

**Módulo:** Mobile-first / Offline-first
**Refs:** RNF-009, RNF-012, ADR-005

**Resumen:** Se descargó JetBrains Mono (woff2 variable, subsets latin + latin-ext) a `public/fonts/`, se reemplazó el `@import` CDN por `@font-face` locales en `main.css`, y se actualizó `vite.config.js` para incluir `woff2` en el precache del Service Worker (10 entries, 245 KiB).

- [x] Descargar `JetBrains Mono` (woff2, pesos 400-700 variable) a `public/fonts/`.
- [x] Reemplazar el `@import` remoto en `main.css` por `@font-face` locales.
- [x] Agregar `woff2` al `globPatterns` de `vite-plugin-pwa` en `vite.config.js`.
- [x] Verificar que `npm run build` incluye las fuentes en `dist/fonts/` y en el precache del SW.

---

### ~~Paso 2: Funcionalidad "Fijar" (Pin) y "Archivar" en el menú contextual~~ ✅ Completado (2026-05-17)

**Módulo:** Captura de notas / Core
**Refs:** RF-013 (organización), Hito 04

**Resumen:** Se implementó Pin y Archivar end-to-end: upgrade de IndexedDB a v2 con backfill de campos, acciones en NoteStore, botones en el dropdown del menú contextual, indicador visual de pin, y toggle "Ver archivadas" en el drawer.

- [x] **NoteService.js:** Schema v2 con campos `pinned` y `archived`. Backfill automático de notas existentes.
- [x] **NoteStore.js:** Acciones `togglePin()`, `toggleArchive()`, `setShowArchived()`. `getFilteredNotes()` filtra archivadas y ordena pinned al tope.
- [x] **NoteList.js:** Botones Fijar/Archivar en dropdown con labels dinámicos (Fijar/Desfijar, Archivar/Desarchivar). Indicador visual pin (ícono + borde izquierdo).
- [x] **main.js / Drawer:** Botón "Ver archivadas" / "Ver notas activas" con estilo activo.
- [x] Verificado visualmente: pin sube al tope, archivar oculta, vista archivadas funciona, toggle ida/vuelta correcto.

---

### Paso 3: Sincronizar documentación viva con el estado real del código

**Módulo:** Documentación / Trazabilidad
**Refs:** Auditoría 2026-05-14
**Estimado:** ~1 sesión

El código avanzó significativamente en Hito 04 (UI microblog, menú contextual, heatmap, búsqueda, Capacitor init) pero la documentación viva **no refleja esto**. Antes de seguir sumando funcionalidades, hay que cerrar la brecha.

**Tareas:**
- [ ] **`requisitos-funcionales.md`:** Marcar como "Implementado" los RF que ya están en código: RF-001 a RF-005 (CRUD + auto-guardado), RF-008/009 (PWA/offline), RF-010/011/012 (Markdown), RF-015 (búsqueda), RF-016/017/018 (export/import), RF-020 (mobile-first).
- [ ] **`CHANGELOG.md`:** Completar la sección `[0.4.0]` con todas las features del Hito 04 que faltan registrar (UI microblog, menú contextual, heatmap, búsqueda en drawer, Capacitor init, ícono nativo).
- [ ] **KI `lumapse_context.md`:** Actualizar la sección "Estado arquitectónico" para reflejar que `android/`, `capacitor.config.json` y las deps `@capacitor/*` YA existen en el repo.
- [ ] **`README.md`:** Verificar que la sección de stack/roadmap refleje el estado actual (Capacitor inicializado, Hito 04 en progreso con features concretas).

**Criterio de cierre:** Un lector nuevo que revise `README.md`, `CHANGELOG.md` y `requisitos-funcionales.md` puede entender qué está implementado y qué no, sin ambigüedades.

---

## 📝 Deuda Técnica — Documentación y Diseño

- [ ] **Historias de Usuario (Hitos 03 y 04):** Redactar las HU faltantes para renderizado Markdown, exportación/importación, y estructura por materias *(Ref: Auditoría 2026-05-14)*.
- [ ] **Actualizar Modelo de Dominio y Casos de Uso:** Revisar `modelo-dominio.md` y `casos-de-uso.md` para reflejar el pivote de etiquetas a carpetas por materia (DP-002) y eliminar referencias obsoletas a PWA/SW.

## 💻 Deuda Técnica — Código y Arquitectura

- [x] **🔴 ~~Eliminar `vite-plugin-pwa` y artefactos PWA:~~** ✅ Completado (2026-05-17). Se removió `vite-plugin-pwa` (289 paquetes), `public/manifest.json`, config `VitePWA()` de `vite.config.js`, `<link rel="manifest">` de `index.html`, y referencias PWA en `package.json`. Build limpio: sin `sw.js`, sin `registerSW.js`.
- [ ] **Seguridad (XSS en Markdown):** Revisar la configuración de DOMPurify en `MarkdownService.js`. Actualmente permite `img src`, lo que podría generar peticiones externas no deseadas.
- [x] **Assets Manifest:** Agregar los íconos requeridos (`icon-192.png`, `icon-512.png`) en `public/icons/` para cumplir con las validaciones del `manifest.json`.

## ⚙️ Deuda Técnica — DevOps y Procesos

- [ ] **Templates de GitHub:** Actualizar las plantillas de Issues/PRs en la carpeta `.github/` para incluir campos obligatorios de trazabilidad (ej: "¿Qué RF/HU/ADR resuelve esto?").
