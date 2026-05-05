# Informe de Hito 03 — MVP Completo

**Período:** Julio 2026  
**Hito:** 03 — MVP Completo  
**Proyecto:** Lumapse PWA  
**Estado:** En curso

---

## Resumen Ejecutivo

En este hito convertimos el editor funcional del Hito 02 en un Producto Mínimo Viable (MVP) real. Se incorpora la renderización de Markdown en tiempo real, la capacidad de exportar e importar notas como archivos `.md`, y la infraestructura necesaria para que la aplicación funcione completamente offline como una PWA instalable.

---

## Requisitos Funcionales del Hito

| RF | Descripción | Prioridad | Estado |
|---|---|---|---|
| RF-008 | Funcionamiento completamente offline | MUST | ✅ Completado |
| RF-009 | Service Worker para caché de assets | MUST | ✅ Completado |
| RF-010 | Renderizado de Markdown en tiempo real | MUST | ⏳ Pendiente |
| RF-011 | Soporte de sintaxis Markdown básica | MUST | ⏳ Pendiente |
| RF-012 | Modo edición / modo lectura (toggle) | SHOULD | ✅ Completado |
| RF-016 | Exportar nota individual como `.md` | MUST | ✅ Completado |
| RF-017 | Exportar todas las notas como `.zip` | SHOULD | ✅ Completado |
| RF-018 | Importar archivos `.md` | SHOULD | ✅ Completado |
| RF-021 | PWA instalable desde el navegador | MUST | ⏳ Pendiente |

---

## Objetivos del Hito — Estado

| Tarea | Estado |
|---|---|
| `MarkdownService` (Renderizado Markdown → HTML) | ✅ Completado |
| Componente `MarkdownPreview` (Vista previa en tiempo real) | ✅ Completado |
| Toggle edición/lectura en `NoteEditor` | ✅ Completado |
| Exportar nota individual como `.md` | ✅ Completado |
| Exportar todas las notas como `.zip` | ✅ Completado |
| Importar archivos `.md` | ✅ Completado |
| Service Worker para funcionamiento offline | ✅ Completado |
| PWA instalable + auditoría Lighthouse | ✅ Completado |

---

## Dependencias nuevas

| Paquete | Versión | Propósito |
|---|---|---|
| `marked` | ^18.0.3 | Parser de Markdown a HTML |
| `dompurify` | ^3.4.2 | Sanitizador de HTML para prevención de XSS |
| `jszip` | ^3.10.1 | Librería para generar archivos .zip dinámicos |
| `vite-plugin-pwa` | ^0.20.0 | Plugin para generar el Service Worker usando Workbox |

---

## Avance Actual (Paso a Paso)

### 1. Servicio de Markdown (`MarkdownService`)
- Se instalaron las dependencias `marked` (v18.0.3) y `dompurify` (v3.4.2).
- Se creó `src/services/MarkdownService.js` como módulo independiente.
- Se configuró `marked` con GFM (GitHub Flavored Markdown) y saltos de línea automáticos (`breaks: true`).
- Se implementó sanitización de HTML con `DOMPurify` para prevenir ataques XSS, con lista blanca de etiquetas y atributos permitidos.
- Se exportan dos funciones: `renderMarkdown(text)` y `hasMarkdownSyntax(text)`.
- Se verificó el funcionamiento desde la consola del navegador: los encabezados, negritas, cursivas, listas, código y enlaces se renderizan correctamente.

### 2. Componente UI: `MarkdownPreview`
- Se creó `src/components/MarkdownPreview.js` como clase modular que recibe texto Markdown y lo renderiza como HTML seguro.
- Se creó `src/components/MarkdownPreview.css` con estilos completos para el HTML renderizado: encabezados (h1-h6), párrafos, listas, código inline y bloques, blockquotes, tablas GFM, enlaces y separadores.
- Se integró el componente dentro de `NoteEditor`: el editor ahora presenta un layout split (textarea a la izquierda, preview a la derecha) separados por un borde visual.
- El preview se actualiza de forma **instantánea** con cada keystroke (sin debounce), mientras que el auto-guardado a IndexedDB mantiene su debounce de 800ms.
- Se implementó un cache interno (`lastContent`) para evitar re-renders innecesarios cuando el contenido no cambia.
- Se verificó visualmente en el navegador: el Markdown se renderiza correctamente en tiempo real.

### 3. Toggle de Modos de Vista (`NoteEditor`)
- Se implementó un selector de modos de vista en la cabecera del editor: **Edición** (solo texto), **Dividido** (texto y preview, por defecto) y **Lectura** (solo preview).
- Se actualizaron los estilos de `NoteEditor.css` para ocultar o mostrar las áreas correspondientes según la clase `view-edit`, `view-split` o `view-read` aplicada dinámicamente al contenedor.
- Se agregaron iconos SVG para que la interfaz sea más intuitiva y profesional.

---

### 4. Exportar nota a Markdown
- Se implementó la funcionalidad en `NoteEditor` para exportar la nota activa como archivo `.md` (RF-016).
- Se agregó un botón de exportación en la cabecera del editor junto al botón de eliminar.
- El archivo generado utiliza el título de la nota sanitizado como nombre de archivo y contiene el Markdown nativo.

### 5. Exportar todas las notas a ZIP
- Se instaló la dependencia `jszip` para habilitar la compresión de archivos desde el navegador.
- Se implementó `src/services/ExportService.js` con lógica para iterar sobre todas las notas almacenadas en IndexedDB.
- Se previene la colisión de nombres de archivos si varias notas tienen el mismo título.
- Se agregó un botón en la cabecera de `NoteList` (barra lateral) para disparar la exportación total (RF-017).

### 6. Importar archivos Markdown
- Se implementó `src/services/ImportService.js` con lógica para abrir un selector de archivos del sistema.
- Se lee el contenido del archivo local y se usa el nombre del archivo (sin extensión) como título de la nota.
- Se actualizó `NoteStore.createNote()` para aceptar parámetros iniciales (título y contenido) y delegarlos a `NoteService`.
- Se agregó un botón de importación en la cabecera de `NoteList`, junto a los de crear y exportar (RF-018).

### 7. PWA y Soporte Offline (Service Worker)
- Se instaló la dependencia de desarrollo `vite-plugin-pwa` para habilitar el soporte PWA de forma profesional y mantenible.
- Se configuró `vite.config.js` inyectando el plugin `VitePWA` con registro automático (`injectRegister: 'auto'`).
- Se definió el modo `autoUpdate` para actualizar el Service Worker automáticamente sin interrumpir al usuario.
- Workbox se configuró para cachear todos los assets (`js, css, html, ico, png, svg, json`) garantizando que Lumapse pueda cargarse completamente sin conexión a internet (RF-008, RF-009).
- La aplicación ahora es reconocible como PWA instalable por los navegadores (RF-021) al unir el Service Worker con el `manifest.json` existente.

---

*Documento vivo — Actualizado durante el desarrollo del Hito 03*
