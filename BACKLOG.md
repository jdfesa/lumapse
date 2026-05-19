# Backlog y Deuda Técnica — Lumapse

Este documento funciona como una bandeja de entrada local para las tareas, mejoras y deuda técnica identificadas durante el desarrollo o en auditorías. Una vez que se inicia un Hito, las tareas relevantes de aquí se planifican y ejecutan.

> **Hito activo:** 04 — Organización y UX (Agosto 2026)
> **Último commit:** `dae265b` — docs(hito-04): actualizar informe de progreso con avance real
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

### ~~Paso 6: Deuda documental — HU de Hitos 03/04 + actualizar modelo de dominio~~ ✅ Completado (2026-05-18)

**Módulo:** Documentación / Trazabilidad
**Refs:** Auditoría 2026-05-14, Deuda técnica documentación

**Resumen:** Se cerró la brecha entre código y documentación académica: se redactaron 5 nuevas Historias de Usuario (HU-007 a HU-011, 26 SP), se actualizó el modelo de dominio eliminando la entidad Tag y agregando ThemeService, se corrigieron los casos de uso (PWA→APK, Tags→Pin/Archivar, SW→Tema) y se actualizó el informe del Hito 04 con el avance real.

- [x] **`historias-de-usuario.md`:** HU-007 a HU-011 redactadas con criterios de aceptación, SP y trazabilidad.
- [x] **`modelo-dominio.md`:** Entidad Note actualizada (pinned, archived), Tag eliminada, ThemeService agregada, schema IndexedDB v2.
- [x] **`casos-de-uso.md`:** UC-06/07 (Tags→Pin/Archivar), UC-13 (PWA→APK), UC-15 (SW→Tema). Actor SW→Capacitor.
- [x] **`hito-04-agosto.md`:** Tabla de RF/UX completa con 15 ítems y estado de avance real.

---

### ~~Paso 7: Hardening de seguridad XSS en MarkdownService~~ ✅ Completado (2026-05-19)

**Módulo:** Core / Seguridad
**Refs:** Deuda técnica (Auditoría 2026-05-14), MarkdownService.js
**Estimado:** ~30 min

**Resumen:** Se eliminó `<img>` de `ALLOWED_TAGS` y `src`/`alt` de `ALLOWED_ATTR` en DOMPurify para prevenir peticiones HTTP externas (pixel tracking, IP leaks). Se agregaron `FORBID_TAGS` y `FORBID_ATTR` como defensa en profundidad, y un hook `afterSanitizeAttributes` que bloquea `javascript:`/`data:` en hrefs y fuerza `rel="noopener noreferrer nofollow"` en enlaces externos. Verificado visualmente con payloads XSS: cero peticiones externas, cero ejecución de scripts, Markdown seguro renderiza correctamente.

**Tareas:**
- [x] **`MarkdownService.js`:** Revisar `ALLOWED_TAGS` y `ALLOWED_ATTR`. Evaluar si `img` debe mantenerse o eliminarse. Si se mantiene, agregar un hook de DOMPurify que fuerce `src` a solo data URIs o que elimine `img` por completo.
- [x] **Test manual:** Crear una nota con payload `![test](https://externo.com/pixel.png)` y verificar que la imagen NO se carga (Network tab vacío).
- [x] **Documentar:** Agregar comentario en el código justificando la decisión de seguridad.

**Criterio de cierre:** No se realizan peticiones HTTP externas al renderizar Markdown. La sanitización está documentada en el código.

---

### Paso 8: Migración de persistencia a SQLite

**Módulo:** Core / Persistencia
**Refs:** ADR-002 (extensión), Hito 04/05
**Estimado:** ~1-2 sesiones

IndexedDB cumplió su rol para el MVP, pero la migración a SQLite vía `@capacitor-community/sqlite` es necesaria antes de implementar categorización por materias (Paso 9). SQLite ofrece queries relacionales (JOIN, FK), mejor rendimiento con volumen de datos, y es nativo en el contenedor Capacitor.

**Tareas:**
- [ ] **Instalar dependencia:** `@capacitor-community/sqlite` + `npx cap sync`.
- [ ] **Crear `SqliteService.js`:** Abstracción sobre el plugin con métodos equivalentes a los actuales de `NoteService` (CRUD, getAll, search).
- [ ] **Definir schema SQL:** Tabla `notes` con columnas `id`, `title`, `content`, `pinned`, `archived`, `created_at`, `updated_at`. Tabla `subjects` (preparación para Paso 9).
- [ ] **Migrar datos:** Script de migración one-time que lee las notas de IndexedDB y las inserta en SQLite al primer arranque post-actualización.
- [ ] **Actualizar `NoteStore.js`:** Reemplazar las llamadas a `NoteService` (IndexedDB) por el nuevo `SqliteService`.
- [ ] **Eliminar dependencia `idb`:** `npm uninstall idb`. Limpiar imports.
- [ ] **Verificar en dispositivo:** Build + deploy en S7 (`./scripts/deploy-android.sh`). Validar CRUD, pin, archivar, búsqueda.
- [ ] **Documentar:** Redactar ADR-006 justificando la migración. Actualizar `modelo-dominio.md`.

**Criterio de cierre:** La app funciona exclusivamente con SQLite. IndexedDB ya no se usa. Los datos existentes se migran sin pérdida. APK funcional en dispositivo.

---

### Paso 9: Categorización por materia (DP-002) — Modelo + UI

**Módulo:** Organización / Feature nueva
**Refs:** DP-002, RF-013 (extensión), encuesta P12 (69.2% carpetas)
**Estimado:** ~1-2 sesiones
**Dependencia:** Paso 8 (SQLite debe estar implementado)

La encuesta de validación confirmó que el 69.2% de los estudiantes prefiere organizar por carpeta/materia. Este paso implementa la estructura de carpetas como sistema de organización principal, aprovechando las capacidades relacionales de SQLite.

**Tareas:**
- [ ] **`SubjectService.js`:** CRUD de materias (nombre, color opcional). Validación de nombre único.
- [ ] **`NoteService` (extensión):** Agregar campo `subjectId` a las notas. Método `getNotesBySubject(id)`.
- [ ] **UI — Drawer:** Sección de materias en el drawer con listado, botón de crear, y selector activo que filtra el feed.
- [ ] **UI — Composer:** Selector de materia al crear/editar nota (dropdown o chips).
- [ ] **UI — Feed:** Indicador visual de materia en cada tarjeta de nota (badge de color).
- [ ] **Verificar en dispositivo:** Build + deploy en S7.
- [ ] **Documentar:** Actualizar HU, modelo de dominio, casos de uso y CHANGELOG.

**Criterio de cierre:** El usuario puede crear materias, asignar notas a una materia, y filtrar el feed por materia desde el drawer. La funcionalidad persiste en SQLite.

---

## 📝 Deuda Técnica — Documentación y Diseño

- [x] ~~**Historias de Usuario (Hitos 03 y 04):**~~ ✅ Completado (2026-05-18). HU-007 a HU-011 redactadas con criterios de aceptación, SP y trazabilidad.
- [x] ~~**Actualizar Modelo de Dominio y Casos de Uso:**~~ ✅ Completado (2026-05-18). Entidad Tag eliminada, campos pinned/archived agregados, casos de uso corregidos (PWA→APK, Tags→Pin/Archivar).

## 💻 Deuda Técnica — Código y Arquitectura

- [x] **🔴 ~~Eliminar `vite-plugin-pwa` y artefactos PWA:~~** ✅ Completado (2026-05-17). Se removió `vite-plugin-pwa` (289 paquetes), `public/manifest.json`, config `VitePWA()` de `vite.config.js`, `<link rel="manifest">` de `index.html`, y referencias PWA en `package.json`. Build limpio: sin `sw.js`, sin `registerSW.js`.
- [x] ~~**Seguridad (XSS en Markdown):**~~ ✅ Resuelto (2026-05-19, Paso 7). `img` y `src` eliminados de whitelist DOMPurify. Agregados `FORBID_TAGS`, `FORBID_ATTR` y hook `afterSanitizeAttributes`.
- [x] **Assets Manifest:** Agregar los íconos requeridos (`icon-192.png`, `icon-512.png`) en `public/icons/` para cumplir con las validaciones del `manifest.json`.

## ⚙️ Deuda Técnica — DevOps y Procesos

- [ ] **Templates de GitHub:** Actualizar las plantillas de Issues/PRs en la carpeta `.github/` para incluir campos obligatorios de trazabilidad (ej: "¿Qué RF/HU/ADR resuelve esto?").

## 🧪 Deuda Técnica — Testing (Mediano plazo)

- [ ] **Suite de tests automatizados (Vitest):** Incorporar Vitest como framework de testing unitario. Priorizar tests sobre servicios con lógica pura: `MarkdownService` (sanitización XSS), `ThemeService` (persistencia y detección de OS), `NoteStore` (filtrado, ordenamiento, pin/archivar). Objetivo: prevenir regresiones antes de que la app llegue a usuarios finales. *(Ref: Auditoría 2026-05-18)*
