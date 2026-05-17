# Informe de Hito 00 — Investigación y Anteproyecto

**Período:** Abril 2026  
**Hito:** 00 — Investigación y Anteproyecto  
**Proyecto:** Lumapse  
**Autor:** José David Sandoval  
**Profesor:** Ing. Mauricio Parada  
**Materia:** Prácticas Profesionalizantes III  
**Institución:** IES 6023 'Dr. Alfredo Loutaif'

---

## Resumen Ejecutivo

El hito cero comprende la etapa de investigación previa al desarrollo: la concepción del problema, la documentación académica inicial, el anteproyecto formal, el diseño de la encuesta de relevamiento y la producción de los primeros artefactos de análisis (historias de usuario, diagramas UML, personas, lean canvas). Este trabajo estableció las bases de producto que fundamentaron todas las decisiones técnicas del Hito 01 en adelante.

---

## Objetivos del Hito — Estado

| Tarea | Estado |
|---|---|
| Inicialización del repositorio Git | ✅ Completado |
| README con identidad académica (institución, profesor, alumno) | ✅ Completado |
| Documentación de producto — Design Thinking (personas, lean canvas) | ✅ Completado |
| Definición de público objetivo | ✅ Completado |
| Anteproyecto formal en Markdown | ✅ Completado |
| Historias de usuario iniciales (HU-001 a HU-005) | ✅ Completado |
| Diagramas UML (casos de uso, secuencia, modelo de dominio) | ✅ Completado |
| Plan de recolección de datos y metodología estadística | ✅ Completado |
| Diseño y refinamiento de la encuesta de relevamiento | ✅ Completado |
| Enlace a documentación académica en Dropbox | ✅ Completado |

**Tareas completadas:** 10/10 (100%)

---

## Entregables Producidos

### Documentación académica
- `docs/anteproyecto/` — Anteproyecto formal del proyecto para PP3.
- `README.md` — Primera versión con identidad académica completa.

### Documentación de producto
- `docs/producto/personas.md` — Perfiles de usuario basados en Design Thinking.
- `docs/producto/lean-canvas.md` — Modelo de negocio/producto.
- `docs/producto/historias-de-usuario.md` — HU-001 a HU-005 (CRUD + auto-guardado).
- `docs/diagramas/` — Casos de uso, secuencia y modelo de dominio (UML).

### Investigación
- `docs/producto/plan-recoleccion-datos.md` — Plan de recolección y metodología estadística.
- `docs/producto/encuesta.md` — Diseño de la encuesta (refinada para evitar sesgos, commit `2db3eab`).

---

## Cronología de Commits

| Fecha | Commit | Descripción |
|---|---|---|
| 2026-04-17 | `712d07c` | Init del repo — fundación del proyecto |
| 2026-04-17 | `4080770` | Eliminar documentos binarios del repo |
| 2026-04-17 | `8e3fab4` | Enlace a Dropbox de documentación académica |
| 2026-04-17 | `6f3c391` | Corregir nombre de la institución |
| 2026-04-17 | `ba4a038` | Información académica detallada |
| 2026-04-19 | `0bd92df` | Documentación de producto (Design Thinking) |
| 2026-04-19 | `960b410` | Ampliar público objetivo a hispanohablantes |
| 2026-04-24 | `1512037` | HU y diagramas UML (**tag: `LBREQ-v1.0`**) |
| 2026-04-24 | `c2e404e` | Anteproyecto en formato Markdown |
| 2026-04-24 | `424f3fe` | Fix URL del repositorio |
| 2026-04-24 | `6ec9047` | Fix separador duplicado en README |
| 2026-04-28 | `fedc40e` | Plan de recolección de datos y metodología |
| 2026-04-28 | `6eeb5bd` | Actualizar lista de carpetas Dropbox |
| 2026-04-29 | `2db3eab` | Refinar encuesta para evitar sesgos |

---

## Reflexión del Hito

Este hito, aunque no contenga código funcional, es el que le da sentido académico a todo el proyecto. Sin la investigación de producto, las personas, el anteproyecto y el diseño de la encuesta, las decisiones técnicas del Hito 01 habrían sido arbitrarias. El tag `LBREQ-v1.0` del 24 de abril marca el cierre formal del relevamiento de requisitos iniciales.

El refinamiento de la encuesta (29 abr) fue un paso clave: se detectaron sesgos en la formulación de preguntas sobre problemas con notas, y se corrigieron antes de la distribución. Esto le otorga mayor validez a los datos del relevamiento (n=120) que se analizarían en mayo.

---

## Métricas del Hito

| Métrica | Valor |
|---|---|
| Período | 17 abr — 29 abr 2026 |
| Commits realizados | 14 |
| Documentos creados | ~10 |
| Tags producidos | 1 (`LBREQ-v1.0`) |
| Dependencias de producción | 0 |
| Código funcional | 0 (hito de investigación) |

---

## Siguiente Hito — Mayo 2026

**Hito 01: Fundación**

Objetivos principales:
- Configuración técnica (Vite 6, estructura de carpetas)
- Decisiones de arquitectura documentadas (ADR-001 a ADR-004)
- Sistema de diseño base (CSS Custom Properties)
- Templates de GitHub para Issues/PRs
- Setup PWA shell (manifest, meta tags)

---

*Documento generado retroactivamente a partir de la evidencia en commits del repositorio — Mayo 2026*
