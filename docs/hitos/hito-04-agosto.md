# Informe de Hito 04 — Organización y UX

**Período:** Agosto 2026 (En progreso)
**Hito:** 04 — Organización y UX
**Proyecto:** Lumapse PWA
**Estado:** En curso

---

## Resumen Ejecutivo

Este hito se enfoca en mejorar la experiencia de uso general, incorporar herramientas de organización de notas, y pulir detalles visuales y de interacción. Durante el inicio de este hito, se introdujo un cambio importante de UX inspirado en Typora: la unificación del título con el contenido Markdown. 

Adicionalmente, estamos pendientes de los resultados de la encuesta de validación para definir aspectos clave de producto (ej: priorizar sistema de etiquetas vs. carpetas, enfoque Mobile-first vs. Desktop-first).

---

## Requisitos Funcionales y UX del Hito

| RF / UX | Descripción | Estado |
|---|---|---|
| DP-001 | Título unificado (estilo Typora) | ✅ Completado |
| Fix | Exportación segura de notas vacías | ✅ Completado |
| RF-013 | Sistema de etiquetas (tags) por nota | ⏳ Pendiente (Depende de validación P12) |
| RF-014 | Filtrado de notas por etiqueta | ⏳ Pendiente |
| RF-015 | Búsqueda por texto en tiempo real | ⏳ Pendiente |
| UX-001 | Modo oscuro / modo claro | ⏳ Pendiente |
| DP-003 | Enfoque de diseño adaptativo (Mobile/Desktop) | ⏳ Pendiente (Depende de validación P9) |

---

## Avance Actual (Paso a Paso)

### 1. Título Unificado (DP-001)
- Se eliminó el campo explícito de título en la interfaz de edición (`NoteEditor`).
- El título se deriva automáticamente de la primera línea que contenga un encabezado Markdown (`# `).
- Si una nota nueva se crea, el editor pre-carga `# ` para guiar al usuario.
- En la base de datos (IndexedDB) el título se sigue guardando como un valor derivado para optimizar el listado en la barra lateral y facilitar la exportación.

### 2. Corrección en la exportación de notas (Bugfix)
- **Problema original:** Al exportar notas sin contenido, o notas recién creadas que sólo tenían el `# ` inicial, se generaba un archivo `.md` vacío con el nombre `nota.md`.
- **Solución implementada:** Se agregó validación en el listener del botón de exportación en `NoteEditor.js`.
- Se extrae el contenido directamente del DOM (`textarea.value`) en lugar del estado capturado, previniendo posibles *race conditions* durante los ciclos de auto-guardado.
- Se implementó una verificación que ignora el `# ` inicial y elimina los espacios en blanco. Si la nota no tiene contenido real, se alerta al usuario ("La nota está vacía. Escribí algo antes de exportar.") previniendo la descarga inútil.

---

## Próximos Pasos (Para la siguiente sesión)

1. **Revisar estado de la encuesta de validación:** Antes de avanzar con la arquitectura de organización (carpetas vs tags), se debe evaluar si ya existen respuestas para definir la Decisión de Producto DP-002 y DP-003.
2. **Implementar Búsqueda en tiempo real:** Avanzar con la funcionalidad de búsqueda para que el usuario pueda encontrar notas rápidamente (independientemente de cómo se organicen después).
3. **Mejoras UI/UX:** Planificar la integración de modo oscuro/claro y refinamientos de estilos *responsive*.

---
*Documento vivo — Actualizado durante el desarrollo del Hito 04*
