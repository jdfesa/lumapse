# Backlog y Deuda Técnica — Lumapse

Este documento funciona como una bandeja de entrada local para las tareas, mejoras y deuda técnica identificadas durante el desarrollo o en auditorías. Una vez que se inicia un Hito, las tareas relevantes de aquí se planifican y ejecutan.

> **Hito activo:** 04 — Organización y UX (Agosto 2026)
> **Último commit:** `1061663` — docs(android): actualizar flujo de despliegue a instalación limpia
> **Última auditoría del backlog:** 2026-05-18

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

### ~~Paso 3: Sincronizar documentación viva con el estado real del código~~ ✅ Completado (2026-05-17)

**Módulo:** Documentación / Trazabilidad
**Refs:** Auditoría 2026-05-14

**Resumen:** Se cerró la brecha entre código y documentación actualizando todos los documentos vivos del proyecto.

- [x] **`requisitos-funcionales.md`:** RF-009/RF-021 marcados como Obsoleto (ADR-005). RF-013 actualizado a Pin/Archivar (implementado). RF-015 y RF-020 marcados como Implementado.
- [x] **`CHANGELOG.md`:** Sección `[0.4.0]` completada con todas las features del Hito 04: Pin/Archivar, búsqueda, heatmap, menú contextual, fuentes offline, UI Notion/Obsidian, remoción PWA.
- [x] **KI `lumapse_context.md`:** Actualizada estructura de archivos (android/, public/fonts/, Heatmap, hito-00), inconsistencias de auditoría marcadas como resueltas.
- [x] **`README.md`:** Limpiadas referencias a PWA plugin en estructura de carpetas y descripción de Hito 01.

---

### ~~Paso 4: Modo oscuro / modo claro con toggle (RF-019)~~ ✅ Completado (2026-05-18)

**Módulo:** UX / Diseño visual
**Refs:** RF-019, Hito 04

**Resumen:** Se implementó una paleta de tema claro (estilo Notion cálido) usando custom properties sobre `[data-theme="light"]` y se reemplazaron todos los valores rgba hardcodeados por variables. Se añadió el `ThemeService` modular con persistencia en `localStorage` y toggle en el drawer.

- [x] **`main.css`:** Crear set de CSS Custom Properties para `:root` (oscuro, actual por defecto) y `[data-theme="light"]` (claro). No duplicar reglas: solo sobrescribir los tokens de color.
- [x] **main.js / Drawer:** Agregar botón toggle en el drawer con ícono sol/luna. Persistir preferencia en `localStorage`.
- [x] **NoteList.css / NoteEditor.css / Heatmap.css:** Verificar que todos los componentes usan tokens (`var(--color-*)`) y no valores hardcodeados. Corregir si hay alguno.
- [x] **Verificación visual:** Testear ambos modos en el navegador (desktop y responsive mobile).

---

### ~~Paso 5: Capacitor sync y validación en dispositivo Android~~ ✅ Completado (2026-05-18)

**Módulo:** Infraestructura / Mobile
**Refs:** ADR-005, RNF-009, Hito 04

**Resumen:** Se reconstruyó el APK local, se validó el funcionamiento nativo en dispositivo real (Samsung S7) utilizando scrcpy. Se detectó y documentó el problema de caché persistente de WebView durante despliegues in-place, ajustando el flujo de desarrollo oficial.

- [x] `npm run build` → verificar que `dist/` contiene todos los assets (HTML, CSS, JS, fuentes, íconos).
- [x] `npx cap sync android` → sincronizar el contenido web con el proyecto Android.
- [x] Instalar en dispositivo real (S7) usando `cap run android` y visualizar vía scrcpy.
- [x] Documentar cualquier issue específico de Capacitor/Android que surja (caché persistente de WebView abordado actualizando el flujo con desinstalación limpia).

---

### Paso 6: Deuda documental — HU de Hitos 03/04 + actualizar modelo de dominio

**Módulo:** Documentación / Trazabilidad
**Refs:** Auditoría 2026-05-14, Deuda técnica documentación
**Estimado:** ~1 sesión

La documentación académica tiene un gap: las Historias de Usuario solo cubren Hito 02 (HU-001 a HU-006), y el modelo de dominio aún referencia etiquetas/tags y PWA/Service Worker. Para la defensa del proyecto, estos documentos deben estar al día.

**Tareas:**
- [ ] **`historias-de-usuario.md`:** Redactar HU para las features de Hitos 03 y 04:
  - HU-007: Renderizar Markdown (RF-010/011)
  - HU-008: Exportar/Importar notas (RF-016/017/018)
  - HU-009: Fijar y archivar notas (RF-013)
  - HU-010: Buscar notas (RF-015)
  - HU-011: Alternar modo oscuro/claro (RF-019)
- [ ] **`modelo-dominio.md`:** Actualizar entidad `Note` (agregar `pinned`, `archived`; eliminar `tagIds`). Eliminar entidad `Tag` si existe. Actualizar referencias a PWA/SW.
- [ ] **`casos-de-uso.md`:** Actualizar UC-13 (instalar como PWA → instalar como APK), UC-15 (cachear assets → obsoleto), agregar UC para Pin/Archivar.
- [ ] **`hito-04-agosto.md`:** Actualizar tabla de estado de RF/UX para reflejar avance real.

**Criterio de cierre:** Un evaluador externo puede leer `historias-de-usuario.md`, `modelo-dominio.md` y `casos-de-uso.md` y entender exactamente qué hace la app sin mirar el código.

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
