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

### Paso 2: Funcionalidad "Fijar" (Pin) y "Archivar" en el menú contextual

**Módulo:** Captura de notas / Core
**Refs:** RF-013 (organización), Hito 04
**Estimado:** ~1-2 sesiones

Los botones de "Fijar" y "Archivar" ya existen como concepto en el dropdown del menú contextual (tres puntos), pero **no tienen lógica implementada**. Son la siguiente funcionalidad de organización antes de materias/carpetas.

**Tareas:**
- [ ] **NoteService.js:** Agregar campos `pinned: false` y `archived: false` al schema de notas. Manejar el upgrade de IndexedDB (DB_VERSION 2) para notas existentes que no tengan estos campos.
- [ ] **NoteStore.js:** Agregar acciones `togglePin(id)` y `toggleArchive(id)`. Modificar `getFilteredNotes()` para: (a) no mostrar notas archivadas en el feed por defecto, (b) mostrar notas fijadas al tope de la lista.
- [ ] **NoteList.js:** Agregar botones "Fijar" y "Archivar" al dropdown. Mostrar indicador visual (ícono pin) en las notas fijadas.
- [ ] **main.js / Drawer:** Agregar un enlace "Ver archivadas" en el drawer para poder acceder a notas archivadas.
- [ ] Verificar que export/import sigue funcionando con los campos nuevos.

**Criterio de cierre:** El usuario puede fijar notas (aparecen primero), archivar notas (desaparecen del feed, accesibles desde drawer), y deshacer ambas acciones.

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

- [ ] **🔴 Eliminar `vite-plugin-pwa` y artefactos PWA:** La arquitectura objetivo es Capacitor + APK nativa (ADR-005), no PWA. El Service Worker, `manifest.json`, `registerSW.js` y la config de Workbox en `vite.config.js` son infraestructura muerta que contradice la decisión arquitectónica. En Capacitor los assets ya son locales dentro del APK; no se necesita precache ni web manifest. Remover: (1) `vite-plugin-pwa` de `package.json`, (2) la config `VitePWA()` de `vite.config.js`, (3) `public/manifest.json`, (4) verificar que `dist/` post-build no genere `sw.js` ni `registerSW.js`.
- [ ] **Seguridad (XSS en Markdown):** Revisar la configuración de DOMPurify en `MarkdownService.js`. Actualmente permite `img src`, lo que podría generar peticiones externas no deseadas.
- [x] **Assets Manifest:** Agregar los íconos requeridos (`icon-192.png`, `icon-512.png`) en `public/icons/` para cumplir con las validaciones del `manifest.json`.

## ⚙️ Deuda Técnica — DevOps y Procesos

- [ ] **Templates de GitHub:** Actualizar las plantillas de Issues/PRs en la carpeta `.github/` para incluir campos obligatorios de trazabilidad (ej: "¿Qué RF/HU/ADR resuelve esto?").
