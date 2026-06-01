# Informe de Hito 03 — MVP Completo

**Período:** Julio 2026  
**Hito:** 03 — MVP Completo  
**Proyecto:** Lumapse  
**Estado:** Completado

---

## Resumen Ejecutivo

En este hito convertimos el editor funcional del Hito 02 en un Producto Mínimo Viable (MVP) real. Se incorpora la renderización de Markdown en tiempo real, modos de lectura/escritura y la infraestructura necesaria para que la aplicación funcione offline bajo la arquitectura PWA original.

> **Nota de revisión 2026-06-01:** Durante el pivote mobile-first a Capacitor/SQLite se conservaron servicios base de exportación/importación, pero los flujos dejaron de estar expuestos en la UI actual. Por trazabilidad, `RF-016` se reclasifica para Hito 05 como compartir/exportar nota individual, mientras `RF-017` y `RF-018` pasan a deuda posterior.

---

## Requisitos Funcionales del Hito

| RF | Descripción | Prioridad | Estado |
|---|---|---|---|
| RF-008 | Funcionamiento completamente offline | MUST | ✅ Completado |
| RF-009 | Service Worker para caché de assets | MUST | ✅ Completado |
| RF-010 | Renderizado de Markdown en tiempo real | MUST | ✅ Completado |
| RF-011 | Soporte de sintaxis Markdown básica | MUST | ✅ Completado |
| RF-012 | Modo edición / modo lectura (toggle) | SHOULD | ✅ Completado |
| RF-016 | Exportar/compartir nota individual | SHOULD | ⏳ Reclasificado Hito 05 |
| RF-017 | Exportar respaldo local `.zip` | SHOULD | ⏸️ Postergado |
| RF-018 | Importar archivos o respaldos locales | COULD | ⏸️ Postergado |
| RF-021 | PWA instalable desde el navegador | MUST | ✅ Completado |

---

## Objetivos del Hito — Estado

| Tarea | Estado |
|---|---|
| `MarkdownService` (Renderizado Markdown → HTML) | ✅ Completado |
| Componente `MarkdownPreview` (Vista previa en tiempo real) | ✅ Completado |
| Toggle edición/lectura en `NoteEditor` | ✅ Completado |
| Exportar/compartir nota individual | ⏳ Reclasificado Hito 05 |
| Exportar respaldo local `.zip` | ⏸️ Postergado |
| Importar archivos o respaldos locales | ⏸️ Postergado |
| Service Worker para funcionamiento offline | ✅ Completado |
| PWA instalable + auditoría Lighthouse | ✅ Completado |

---

## Dependencias nuevas

| Paquete | Versión | Propósito |
|---|---|---|
| `marked` | ^18.0.3 | Parser de Markdown a HTML |
| `dompurify` | ^3.4.2 | Sanitizador de HTML para prevención de XSS |
| `jszip` | ^3.10.1 | Librería disponible para prototipo/base técnica de archivos .zip |
| `vite-plugin-pwa` | ^1.3.0 | Plugin para generar el Service Worker usando Workbox |

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

### 4. Base técnica de exportación/importación
- Se incorporó `jszip` y quedaron servicios base para exportación/importación local.
- La revisión posterior al pivote Android/SQLite confirma que estos servicios no son flujos visibles en la UI actual.
- `RF-016` pasa a Hito 05 con alcance mobile-first mínimo: compartir/exportar una nota individual.
- `RF-017` y `RF-018` quedan como deuda posterior por complejidad de backup, importación, duplicados y materias/secciones.

### 5. PWA y Soporte Offline (Service Worker)
- Se instaló la dependencia de desarrollo `vite-plugin-pwa` para habilitar el soporte PWA de forma profesional y mantenible.
- Se configuró `vite.config.js` inyectando el plugin `VitePWA` con registro automático (`injectRegister: 'auto'`).
- Se definió el modo `autoUpdate` para actualizar el Service Worker automáticamente sin interrumpir al usuario.
- Workbox se configuró para cachear todos los assets (`js, css, html, ico, png, svg, json`) garantizando que Lumapse pueda cargarse completamente sin conexión a internet (RF-008, RF-009).
- La aplicación ahora es reconocible como PWA instalable por los navegadores (RF-021) al unir el Service Worker con el `manifest.json` existente.

---

*Documento vivo — Actualizado durante el desarrollo del Hito 03*
