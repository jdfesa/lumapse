# Cheat Sheet de Defensa — Lumapse
**Última actualización:** 2026-07-02

> Sincronización parcial de beta: este documento refleja el corte `v0.4.8` publicado y validado. La versión final de defensa debe revisarse nuevamente en Hito 06, junto con informe final y diagramas.

## Métricas del Proyecto

| Métrica | Valor |
|---|---|
| Versión beta vigente | `0.4.8` |
| Release publicada | [`Lumapse v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8) |
| APK firmado | `lumapse-v0.4.8.apk` |
| SHA-256 del APK | `cad122d0329e1761816ac7ad07938673389c859a252d9cc63504359355db3d10` |
| Validación Android | Samsung Galaxy S20 FE (`SM-G780G`), Android 13, apto para beta controlada |
| Archivos de código (JS/TS/CSS) | 112 |
| Líneas de código fuente | 15,305 |
| Requisitos Funcionales | 28 (22 implementados/verificados, 0 pendientes, 4 postergados, 2 obsoletos) |
| Historias de Usuario | 22 |
| Story Points totales formalizados | 104 (65 cerrados en Hitos 02 a 04, 36 formalizados en Hito 05) |
| ADRs documentados | 7 |
| Scripts de automatización | 45 archivos en `scripts/` |
| Tablas en BD | 4 |
| Columnas totales | 26 |

## Decisiones Técnicas Clave

| Decisión | Justificación corta |
|---|---|
| ADR-006 — Arquitectura de Persistencia y Tooling SQLite para Desarrollo Web y Native | Adoptar una arquitectura híbrida de persistencia y automatización de assets para desarrollo local y producción nativa |
| ADR-005 — Pivote de PWA a Aplicación Móvil Nativa (APK) | Migrar de PWA pura a aplicación móvil nativa empaquetada con Capacitor, reemplazando IndexedDB por SQLite como capa de persistencia. |
| DP-003 — Mobile-first | Mobile-first. La interfaz se diseña y optimiza primero para pantallas de celular, con adaptación posterior a pantallas más grandes si el tiempo lo permite. |
| DP-004 — Estructura de Información Opinionada — Materia › Sección › Nota | Implementar una estructura de información predefinida y opinionada con exactamente 3 secciones fijas en la navegación principal y máximo 2 niveles de carpetas creadas por el usuario |
| DP-006 — Ayuda Contextual sin Fricción | Postergar onboarding, contador, indicador online/offline y guía Markdown para evitar ruido visual hasta tener feedback real post-release. |
| DP-001 — Título unificado al estilo Typora | Eliminar el campo de título separado. |
| ADR-007 — Organización por feature folders | Ordenar componentes UI por dominio funcional para mejorar mantenibilidad sin migrar todavía a otro framework. |

## ADRs

| # | Título | Estado |
|---|---|---|
| ADR-001 | Elección del Stack Tecnológico | Aceptado |
| ADR-002 | Estrategia de Persistencia Offline (IndexedDB) | Superseded por ADR-005 |
| ADR-003 | Metodología de Desarrollo — Kanban | Aceptado |
| ADR-004 | Estructura de Carpetas del Proyecto | Aceptado |
| ADR-005 | Pivote de PWA a Aplicación Móvil Nativa (APK) | Aceptado |
| ADR-006 | Arquitectura de Persistencia y Tooling SQLite para Desarrollo Web y Native | Aceptado |
| ADR-007 | Organización de Componentes por Feature | Aceptado |

## Versiones Publicadas

| Versión | Fecha | Highlights |
|---|---|---|
| 0.4.8 | 2026-07-01 | Beta controlada publicada en GitHub Releases, APK firmada, SHA-256 documentado y validación inicial en Android real |
| 0.4.0 | 2026-08 | Persistencia en SQLite (ADR-006), Funcionalidad Pin y Archivar (RF-013), Búsqueda en tiempo real (RF-015) |
| 0.3.0 | 2026-07 | Dependencias marked (v18) y dompurify (v3) para renderizado de Markdown seguro, src/services/MarkdownService, src/components/MarkdownPreview |
| 0.2.0 | 2026-06 | Dependencia idb para el manejo de IndexedDB con promesas, src/services/NoteService, src/store/NoteStore |
| 0.1.0 | 2026-05 | Inicialización del repositorio Git con estructura profesional, Configuración de Vite 6 como build tool, Sistema de diseño base: design tokens, tipografía (Inter + JetBrains Mono), paleta de colores |
| 0.0.0 | 2026-04 | Inicialización del repositorio Git con README e identidad académica (institución, profesor, alumno), docs/anteproyecto/ — Anteproyecto formal del proyecto para PP3, Documentación de producto — Design Thinking: personas y lean canvas |

## Preguntas Frecuentes del Tribunal

- **¿Por qué no usás tags como eje principal?** → DP-002 y DP-004: el 69.2% prefiere carpetas por materia (P11), y la estructura Materia › Sección › Nota reduce decisiones en mobile.
- **¿Por qué guardás el título si ya está en el contenido?** → DP-001: desnormalización intencional. Una prueba empírica con 5.000 notas demostró que reduce el uso de CPU un 55% al evitar parsear Markdown en cada render.
- **¿Por qué no hay `ON UPDATE` en las FKs?** → Sección 4 del DDL: las PK son UUID v4 generadas en cliente e inmutables por diseño.
- **¿Por qué Capacitor sobre PWA pura?** → ADR-005: APK nativo, hardware real, distribución directa y persistencia local más robusta.
- **¿Por qué SQLite sobre IndexedDB?** → ADR-006: modelo relacional, FKs, consultas consistentes y tooling web/native unificado.
- **¿Por qué no agregaste contador de palabras?** → RF-006 quedó postergado: Lumapse prioriza captura rápida. Si estudiantes reales lo piden, se puede sumar como metadato sutil calculado en UI.
- **¿Por qué no mostrás online/offline?** → RF-024 quedó postergado: sin sincronización ni backup, el estado de red no cambia el flujo y podría sugerir una sincronización inexistente.
- **¿Por qué no hay onboarding o tutorial Markdown?** → DP-006: la primera release valida una interfaz autoexplicativa. Lumapse permite escribir texto plano; Markdown es una mejora, no una barrera de entrada.
- **¿Export/import está implementado?** → Sí para backups de workspace: `RF-017` exporta un `.zip` legible/restaurable con salida externa y `RF-018` importa ZIPs generados por Lumapse con preview, transacción y duplicados no destructivos. Sigue postergado `RF-016`, que es compartir/exportar una nota individual, y también la importación `.md` de una nota suelta.
- **¿La APK ya está disponible?** → Sí como beta controlada `v0.4.8`, publicada en GitHub Releases y validada inicialmente en Android real. No se presenta todavía como versión final estable; el cierre definitivo queda para Hito 06.
- **¿Qué queda antes de defender?** → Sincronizar el informe final, revisar diagramas con el modelo congelado y consolidar evidencia de validación. El diagrama de base de datos es el más sensible a cambios; casos de uso y secuencia deberían requerir una revisión menor.

## Fuentes

- `docs/producto/requisitos-funcionales.md`
- `docs/producto/historias-de-usuario.md`
- `docs/producto/decisiones-producto.md`
- `docs/adr/`
- `CHANGELOG.md`
- `docs/gestion/checklist-validacion-android.md`
- `docs/gestion/lineas-base.md`
- `docs/diagramas/database/04-modelo-fisico-ddl.md`
- `src/`
- `scripts/`
