# Informe de Hito 04 — Organización y UX

**Período:** Agosto 2026 (En progreso)
**Hito:** 04 — Organización y UX
**Proyecto:** Lumapse
**Estado:** En curso
**Última actualización:** Mayo 2026

---

## Resumen Ejecutivo

Este hito se enfoca en mejorar la experiencia de uso general, incorporar herramientas de organización de notas, y pulir detalles visuales y de interacción. Durante el inicio de este hito, se introdujo un cambio importante de UX inspirado en Typora: la unificación del título con el contenido Markdown. 

Adicionalmente, los resultados de la [encuesta de validación](../producto/resultados-relevamiento.md) (n=120) ya están disponibles y han confirmado las decisiones de producto [DP-002](../producto/decisiones-producto.md) (organización por materia, 69.2% de preferencia) y [DP-003](../producto/decisiones-producto.md) (mobile-first, 72.5% prefiere celular).

---

## Requisitos Funcionales y UX del Hito

| RF / UX | Descripción | Estado | Commit / Ref |
|---|---|---|---|
| DP-001 | Título unificado (estilo Typora) | ✅ Completado | HU-002, NoteEditor.js |
| Fix | Exportación segura de notas vacías | ✅ Completado | NoteEditor.js |
| RF-013 | Pin y Archivar notas (reemplaza sistema de tags, ver [DP-002](../producto/decisiones-producto.md)) | ✅ Completado | `HU-009`, NoteStore.js, NoteService.js (v2) |
| RF-015 | Búsqueda por texto en tiempo real | ✅ Completado | `HU-010`, NoteStore.js (debounce 200ms) |
| RF-019 | Toggle modo oscuro / modo claro | ✅ Completado | `HU-011`, ThemeService.js, main.css |
| RF-020 | Layout mobile-first con drawer | ✅ Completado | main.js, main.css |
| UX | Rediseño estética Notion/Obsidian | ✅ Completado | main.css, componentes CSS |
| UX | Menú contextual (tres puntos) | ✅ Completado | NoteList.js |
| UX | Heatmap de contribuciones | ✅ Completado | Heatmap.js, Heatmap.css |
| Infra | Fuentes auto-alojadas (JetBrains Mono) | ✅ Completado | public/fonts/, main.css |
| Infra | Remoción PWA / Migración Capacitor | ✅ Completado | [ADR-005](../adr/ADR-005-pivote-app-nativa.md) |
| Infra | Scripts de automatización (scripts/) | ✅ Completado | deploy-android.sh, clean.sh, check-docs.sh |
| Docs | Historias de Usuario Hitos 03/04 | ✅ Completado | HU-007 a HU-011 |
| Docs | Modelo de Dominio actualizado | ✅ Completado | modelo-dominio.md |
| Docs | Casos de Uso actualizados | ✅ Completado | casos-de-uso.md |

| ~~RF-014~~ | ~~Filtrado de notas por etiqueta~~ | ❌ Descartado | Reemplazado por Pin/Archivar ([DP-002](../producto/decisiones-producto.md)) |

---

## Avance Detallado

### 1. Título Unificado (DP-001)
- Se eliminó el campo explícito de título en la interfaz de edición (`NoteEditor`).
- El título se deriva automáticamente de la primera línea que contenga un encabezado Markdown (`# `).
- Si una nota nueva se crea, el editor pre-carga `# ` para guiar al usuario.
- En la base de datos (IndexedDB) el título se sigue guardando como un valor derivado para optimizar el listado y facilitar la exportación.

### 2. Corrección en la exportación de notas (Bugfix)
- **Problema original:** Al exportar notas sin contenido, se generaba un archivo `.md` vacío.
- **Solución:** Validación en `NoteEditor.js` que verifica contenido real (ignorando `# ` inicial y espacios en blanco). Si la nota está vacía, se alerta al usuario.

### 3. Pin y Archivar (RF-013)
- Upgrade de IndexedDB a v2 con backfill automático de campos `pinned` y `archived`.
- Acciones en el menú contextual de tres puntos (Fijar/Desfijar, Archivar/Desarchivar).
- Notas fijadas aparecen al tope del feed con indicador visual (ícono + borde izquierdo).
- Notas archivadas se ocultan del feed principal y son accesibles desde "Ver archivadas" en el drawer.

### 4. Búsqueda en tiempo real (RF-015)
- Campo de búsqueda en el drawer con debounce de 200ms.
- Filtra notas por título y contenido en memoria.

### 5. Toggle modo oscuro/claro (RF-019)
- `ThemeService.js` modular con persistencia en `localStorage` y detección de preferencia del OS.
- Paleta light theme inspirada en Notion aplicada vía `[data-theme="light"]` con tokens semánticos.
- Migración completa de todos los valores `rgba()` hardcodeados a CSS custom properties.
- Actualización dinámica de `meta[name="theme-color"]` para la barra de estado de Android.

### 6. Infraestructura y DevOps
- Remoción de `vite-plugin-pwa` y migración a Capacitor nativo ([ADR-005](../adr/ADR-005-pivote-app-nativa.md)).
- Fuentes JetBrains Mono auto-alojadas en `public/fonts/` (offline estricto).
- Scripts de automatización: `deploy-android.sh`, `clean.sh`, `check-docs.sh`.
- Flujo de despliegue Android actualizado con desinstalación limpia obligatoria (problema de caché de WebView documentado).
- Validación en dispositivo real (Samsung S7 Edge) vía scrcpy.

### 7. Documentación académica (Paso 6)
- Historias de Usuario ampliadas: HU-007 a HU-011 (Hitos 03 y 04). Total: 11 HU, 46 SP.
- Modelo de Dominio actualizado: eliminada entidad Tag, agregados campos `pinned`/`archived`, nueva entidad ThemeService.
- Casos de Uso actualizados: reemplazados UC obsoletos (PWA, Tags) por UC actuales (APK, Pin/Archivar, Tema).

---

## Próximos Pasos

1. **Estructura de navegación por materias (DP-002):** La decisión de producto está confirmada con datos (69.2%). Implementar el modelo de carpetas por materia como siguiente feature de organización.
2. **Migración a SQLite:** Reemplazar IndexedDB por `@capacitor-community/sqlite` para aprovechar capacidades nativas (queries complejos, volumen de datos).
3. **Seguridad XSS en Markdown:** Revisar la configuración de DOMPurify en `MarkdownService.js` (actualmente permite `img src` que podría generar peticiones externas).

---
*Documento vivo — Actualizado durante el desarrollo del Hito 04*
