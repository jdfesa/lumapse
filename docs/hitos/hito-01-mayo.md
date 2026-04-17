# Informe de Hito 01 — Fundación del Proyecto

**Período:** Mayo 2026  
**Hito:** 01 — Fundación  
**Proyecto:** Lumapse PWA  
**Autor:** Jose David Sandoval  
**Materia:** Prácticas Profesionalizantes III

---

## Resumen Ejecutivo

Durante el primer hito del proyecto se estableció la estructura completa del repositorio, se tomaron y documentaron las decisiones técnicas fundamentales, y se configuró el entorno de desarrollo. El proyecto cuenta con cimientos sólidos para avanzar hacia el desarrollo del producto en los hitos siguientes.

---

## Objetivos del Hito — Estado

| Tarea | Estado |
|---|---|
| Inicialización del repositorio Git | ✅ Completado |
| Configuración de Vite 6 | ✅ Completado |
| Estructura de carpetas definitiva | ✅ Completado |
| `README.md` profesional | ✅ Completado |
| `CHANGELOG.md` inicial | ✅ Completado |
| ADR-001 — Stack tecnológico | ✅ Completado |
| ADR-002 — Persistencia offline | ✅ Completado |
| ADR-003 — Metodología Kanban | ✅ Completado |
| ADR-004 — Estructura de carpetas | ✅ Completado |
| Templates de GitHub Issues | ✅ Completado |
| `manifest.json` (PWA shell) | ✅ Completado |
| `index.html` con meta tags PWA | ✅ Completado |
| Sistema de diseño base (CSS tokens) | ✅ Completado |

**Tareas completadas:** 13/13 (100%)

---

## Decisiones Técnicas Tomadas

Todas las decisiones de este hito están documentadas en los ADRs correspondientes:

- **Stack:** Vanilla JS + Vite 6 → [ADR-001](../adr/ADR-001-stack-tecnologico.md)
- **Persistencia:** IndexedDB via `idb` → [ADR-002](../adr/ADR-002-persistencia-indexeddb.md)
- **Metodología:** Kanban con hitos mensuales → [ADR-003](../adr/ADR-003-metodologia-kanban.md)
- **Estructura:** `src/` + `docs/` + `public/` → [ADR-004](../adr/ADR-004-estructura-carpetas.md)

---

## Reflexión del Hito

La fase de fundación fue más importante de lo que inicialmente parece. Definir correctamente la metodología y la estructura en este momento evita problemas de organización que suelen surgir en proyectos mal planificados. Los ADRs son un activo valioso: cuando en el futuro surja una duda sobre "por qué se usó X y no Y", la respuesta ya está documentada y con respaldo técnico.

El sistema de diseño base (CSS Custom Properties) establece un lenguaje visual consistente que se extenderá a lo largo de todo el desarrollo, evitando inconsistencias visuales entre hitos.

---

## Métricas del Hito

| Métrica | Valor |
|---|---|
| Commits realizados | ~15 |
| Archivos creados | 16 |
| ADRs documentados | 4 |
| Dependencias de producción | 0 |
| Dependencias de desarrollo | 1 (vite) |

---

## Próximo Hito — Junio 2026

**Hito 02: Core del Editor**

Objetivos principales:
- Interfaz de usuario del editor de notas
- Operaciones CRUD completas (crear, leer, actualizar, eliminar)
- Persistencia con IndexedDB (primer uso real de `idb`)
- Soporte básico de escritura Markdown
- Auto-guardado

---

*Documento generado al cierre del Hito 01 — Mayo 2026*
