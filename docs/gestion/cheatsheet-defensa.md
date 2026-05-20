# Cheat Sheet de Defensa — Lumapse
**Generado automáticamente:** 2026-05-20

## Métricas del Proyecto

| Métrica | Valor |
|---|---|
| Archivos de código (JS/CSS) | 16 |
| Líneas de código fuente | 2,365 |
| Requisitos Funcionales | 24 (17 implementados, 5 pendientes, 2 obsoletos) |
| Historias de Usuario | 14 |
| Story Points totales | 59 |
| ADRs documentados | 6 |
| Scripts de automatización | 26 |
| Tablas en BD | 3 |
| Columnas totales | 16 |

## Decisiones Técnicas Clave

| Decisión | Justificación corta |
|---|---|
| ADR-006 — Arquitectura de Persistencia y Tooling SQLite para Desarrollo Web y Native | Adoptar una arquitectura híbrida de persistencia y automatización de assets para desarrollo local y producción nativa |
| ADR-005 — Pivote de PWA a Aplicación Móvil Nativa (APK) | Migrar de PWA pura a aplicación móvil nativa empaquetada con Capacitor, reemplazando IndexedDB por SQLite como capa de persistencia. |
| DP-003 — Mobile-first | Mobile-first. La interfaz se diseña y optimiza primero para pantallas de celular, con adaptación posterior a pantallas más grandes si el tiempo lo permite. |
| DP-004 — Estructura de Información Opinionada — Materia › Sección › Nota | Implementar una estructura de información predefinida y opinionada con exactamente 3 secciones fijas en la navegación principal y máximo 2 niveles de carpetas creadas por el usuario |
| DP-001 — Título unificado al estilo Typora | Eliminar el campo de título separado. |

## ADRs

| # | Título | Estado |
|---|---|---|
| ADR-001 | Elección del Stack Tecnológico | Aceptado |
| ADR-002 | Estrategia de Persistencia Offline (IndexedDB) | Superseded por ADR-005 |
| ADR-003 | Metodología de Desarrollo — Kanban | Aceptado |
| ADR-004 | Estructura de Carpetas del Proyecto | Aceptado |
| ADR-005 | Pivote de PWA a Aplicación Móvil Nativa (APK) | Aceptado |
| ADR-006 | Arquitectura de Persistencia y Tooling SQLite para Desarrollo Web y Native | Aceptado |

## Versiones Publicadas

| Versión | Fecha | Highlights |
|---|---|---|
| 0.4.0 | 2026-08 | Persistencia en SQLite (ADR-006), Funcionalidad Pin y Archivar (RF-013), Búsqueda en tiempo real (RF-015) |
| 0.3.0 | 2026-07 | Dependencias marked (v18) y dompurify (v3) para renderizado de Markdown seguro, src/services/MarkdownService, src/components/MarkdownPreview |
| 0.2.0 | 2026-06 | Dependencia idb para el manejo de IndexedDB con promesas, src/services/NoteService, src/store/NoteStore |
| 0.1.0 | 2026-05 | Inicialización del repositorio Git con estructura profesional, Configuración de Vite 6 como build tool, Sistema de diseño base: design tokens, tipografía (Inter + JetBrains Mono), paleta de colores |
| 0.0.0 | 2026-04 | Inicialización del repositorio Git con README e identidad académica (institución, profesor, alumno), docs/anteproyecto/ — Anteproyecto formal del proyecto para PP3, Documentación de producto — Design Thinking: personas y lean canvas |

## Preguntas Frecuentes del Tribunal

- **¿Por qué no usás tags como eje principal?** → DP-002 y DP-004: el 69.2% prefiere carpetas por materia (P11), y la estructura Materia › Sección › Nota reduce decisiones en mobile.
- **¿Por qué guardás el título si ya está en el contenido?** → DP-001: desnormalización intencional para listar notas rápido sin parsear Markdown completo en cada render.
- **¿Por qué no hay `ON UPDATE` en las FKs?** → Sección 4 del DDL: las PK son UUID v4 generadas en cliente e inmutables por diseño.
- **¿Por qué Capacitor sobre PWA pura?** → ADR-005: APK nativo, hardware real, distribución directa y persistencia local más robusta.
- **¿Por qué SQLite sobre IndexedDB?** → ADR-006: modelo relacional, FKs, consultas consistentes y tooling web/native unificado.

## Fuentes

- `docs/producto/requisitos-funcionales.md`
- `docs/producto/historias-de-usuario.md`
- `docs/producto/decisiones-producto.md`
- `docs/adr/`
- `CHANGELOG.md`
- `docs/diagramas/database/04-modelo-fisico-ddl.md`
- `src/`
- `scripts/`
