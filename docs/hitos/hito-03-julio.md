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
| RF-008 | Funcionamiento completamente offline | MUST | ⏳ Pendiente |
| RF-009 | Service Worker para caché de assets | MUST | ⏳ Pendiente |
| RF-010 | Renderizado de Markdown en tiempo real | MUST | ⏳ Pendiente |
| RF-011 | Soporte de sintaxis Markdown básica | MUST | ⏳ Pendiente |
| RF-012 | Modo edición / modo lectura (toggle) | SHOULD | ⏳ Pendiente |
| RF-016 | Exportar nota individual como `.md` | MUST | ⏳ Pendiente |
| RF-017 | Exportar todas las notas como `.zip` | SHOULD | ⏳ Pendiente |
| RF-018 | Importar archivos `.md` | SHOULD | ⏳ Pendiente |
| RF-021 | PWA instalable desde el navegador | MUST | ⏳ Pendiente |

---

## Objetivos del Hito — Estado

| Tarea | Estado |
|---|---|
| `MarkdownService` (Renderizado Markdown → HTML) | ✅ Completado |
| Componente `MarkdownPreview` (Vista previa en tiempo real) | ⏳ Pendiente |
| Toggle edición/lectura en `NoteEditor` | ⏳ Pendiente |
| Exportar nota individual como `.md` | ⏳ Pendiente |
| Exportar todas las notas como `.zip` | ⏳ Pendiente |
| Importar archivos `.md` | ⏳ Pendiente |
| Service Worker para funcionamiento offline | ⏳ Pendiente |
| PWA instalable + auditoría Lighthouse | ⏳ Pendiente |

---

## Dependencias nuevas

| Paquete | Versión | Propósito |
|---|---|---|
| `marked` | ^18.0.3 | Parser de Markdown a HTML |
| `dompurify` | ^3.4.2 | Sanitizador de HTML para prevención de XSS |

---

## Avance Actual (Paso a Paso)

### 1. Servicio de Markdown (`MarkdownService`)
- Se instalaron las dependencias `marked` (v18.0.3) y `dompurify` (v3.4.2).
- Se creó `src/services/MarkdownService.js` como módulo independiente.
- Se configuró `marked` con GFM (GitHub Flavored Markdown) y saltos de línea automáticos (`breaks: true`).
- Se implementó sanitización de HTML con `DOMPurify` para prevenir ataques XSS, con lista blanca de etiquetas y atributos permitidos.
- Se exportan dos funciones: `renderMarkdown(text)` y `hasMarkdownSyntax(text)`.
- Se verificó el funcionamiento desde la consola del navegador: los encabezados, negritas, cursivas, listas, código y enlaces se renderizan correctamente.

---

*Documento vivo — Actualizado durante el desarrollo del Hito 03*
