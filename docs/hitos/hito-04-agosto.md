# Informe de Hito 04 — Organización y UX

**Período:** Agosto 2026 (En progreso)
**Hito:** 04 — Organización y UX
**Proyecto:** Lumapse
**Estado:** En curso

---

## Resumen Ejecutivo

Este hito se enfoca en mejorar la experiencia de uso general, incorporar herramientas de organización de notas, y pulir detalles visuales y de interacción. Durante el inicio de este hito, se introdujo un cambio importante de UX inspirado en Typora: la unificación del título con el contenido Markdown. 

Adicionalmente, los resultados de la [encuesta de validación](../producto/resultados-relevamiento.md) (n=120) ya están disponibles y han confirmado las decisiones de producto [DP-002](../producto/decisiones-producto.md) (organización por materia, 69.2% de preferencia) y [DP-003](../producto/decisiones-producto.md) (mobile-first, 72.5% prefiere celular).

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
| DP-003 | Enfoque mobile-first | ✅ Confirmado (datos del relevamiento) |

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

1. **Implementar estructura de navegación Entrada / Materias / Archivo:** La [DP-002](../producto/decisiones-producto.md) está confirmada con datos. Crear el modelo de carpetas por materia.
2. **Implementar Búsqueda en tiempo real:** Avanzar con la funcionalidad de búsqueda para que el usuario pueda encontrar notas rápidamente (RF-015).
3. **Mejoras UI/UX:** Planificar la integración de modo oscuro/claro y refinamientos de estilos mobile-first (DP-003).

---
*Documento vivo — Actualizado durante el desarrollo del Hito 04*
