# Architecture Decision Records — Lumapse

Los ADR conservan decisiones importantes, sus alternativas y consecuencias. Un ADR reemplazado se mantiene como evidencia histórica, pero no define la arquitectura vigente.

## Registro

| ADR | Decisión | Estado |
|---|---|---|
| [ADR-001](./ADR-001-stack-tecnologico.md) | Stack base web y Vite | Aceptado, revisado |
| [ADR-002](./ADR-002-persistencia-indexeddb.md) | Persistencia IndexedDB original | Reemplazado por ADR-005 y ADR-006 |
| [ADR-003](./ADR-003-metodologia-kanban.md) | Enfoque incremental y gestión del flujo con Kanban adaptado | Aceptado, revisado |
| [ADR-004](./ADR-004-estructura-carpetas.md) | Estructura del repositorio | Aceptado, revisado |
| [ADR-005](./ADR-005-pivote-app-nativa.md) | Pivote a aplicación Android híbrida con Capacitor | Aceptado y validado técnicamente |
| [ADR-006](./ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md) | Persistencia SQLite multiplataforma | Aceptado y validado |
| [ADR-007](./ADR-007-organizacion-componentes-por-feature.md) | Componentes UI organizados por feature | Aceptado |
| [ADR-008](./ADR-008-arquitectura-modular-y-patrones.md) | Arquitectura modular y patrones aplicados | Aceptado |
| [ADR-009](./ADR-009-propiedad-transaccional-sqlite.md) | Propiedad transaccional SQLite y recuperación de arranque (AUD-005) | Aceptado; validación canónica y Android aprobadas |
| [ADR-010](./ADR-010-gate-portable-y-entorno-canonico.md) | Gate portable y entorno canónico (AUD-008/AUD-009) | Aceptado e integrado en PR #14 |
| [ADR-011](./ADR-011-limite-guardado-y-refresco.md) | Confirmación de creación y recuperación de lecturas (AUD-014) | Aceptado e integrado en PR #15 |
| [ADR-012](./ADR-012-borrador-sqlite-y-guardado-atomico.md) | Borrador SQLite, migración legacy y guardado atómico (RNF-010) | Aceptado; gate/Android PASS y cierre aprobado por el autor en PR #29 |
| [ADR-013](./ADR-013-despliegue-android-sin-desinstalacion-implicita.md) | Instalación debug sin fallback de desinstalación | Aceptación general en PR #41; merge/limpieza autorizados |

## Decisiones vigentes en una frase

Lumapse es un monolito modular cliente, offline-first, desarrollado con módulos ES y TypeScript gradual sobre Vite, empaquetado para Android con Capacitor y persistido en SQLite. La arquitectura se organiza por capas de responsabilidad y componentes por feature.

La vista detallada y sus evidencias están en [`../diagramas/arquitectura-componentes.md`](../diagramas/arquitectura-componentes.md).

## Revisión de trazabilidad precorte — 2026-10-22

Se contrastaron los doce ADR con las rutas actuales y el historial hasta `7adea77`.
No se encontró una decisión arquitectónica significativa del inventario siguiente
sin ADR. Esta revisión documental de RNF-026 no prueba que cada registro precediera
a su implementación ni certifica propiedades de un APK nuevo.

| Decisión inventariada | Registro | Evidencia actual |
|---|---|---|
| Módulos ES sin framework y Vite 6 | ADR-001 | [`package.json`](../../package.json), [`vite.config.js`](../../vite.config.js), [`src/main.js`](../../src/main.js) |
| IndexedDB como origen histórico, no motor actual | ADR-002, reemplazado por ADR-005/006 | [`legacyMigration.js`](../../src/services/sqlite/legacyMigration.js); no se presenta la migración como persistencia productiva |
| Flujo individual basado en Kanban | ADR-003 | [`definicion-flujo-kanban.md`](../gestion/definicion-flujo-kanban.md), [`CONTRIBUTING.md`](../../CONTRIBUTING.md) |
| Una aplicación, responsabilidades y UI por feature | ADR-004/007 | [`src/`](../../src/), [`src/components/`](../../src/components/), [`tests/unit/`](../../tests/unit/) |
| Distribución Android híbrida, sin backend ni canal PWA soportado | ADR-005 | [`capacitor.config.json`](../../capacitor.config.json), [`android/`](../../android/) |
| SQLite nativo y compatibilidad SQLite/WASM de desarrollo | ADR-006 | [`connection.js`](../../src/services/sqlite/connection.js), [`package.json`](../../package.json) |
| Capas pragmáticas, store observable, adaptadores y TypeScript gradual | ADR-008 | [`main.js`](../../src/main.js), [`NoteStore.state.js`](../../src/store/NoteStore.state.js), [`backup/`](../../src/services/backup/), [`domain/`](../../src/domain/) |
| Propiedad transaccional explícita y arranque recuperable | ADR-009 | [`writeCoordinator.js`](../../src/services/sqlite/writeCoordinator.js), [`appStartup.js`](../../src/layout/appStartup.js) |
| Runtime fijo y gate local/CI único | ADR-010 | [`.nvmrc`](../../.nvmrc), [`quality.sh`](../../scripts/quality.sh), [`lint.yml`](../../.github/workflows/lint.yml) |
| Escritura confirmada separada del refresco secundario | ADR-011 | [`NoteStore.refresh.js`](../../src/store/NoteStore.refresh.js), [`NoteStore.data.js`](../../src/store/NoteStore.data.js) |
| Borrador SQLite y consumo atómico al guardar | ADR-012 | [`EditorDraftService.ts`](../../src/services/EditorDraftService.ts), [`editorDrafts.js`](../../src/services/sqlite/editorDrafts.js) |

**Temporalidad:** ADR-008 es una formalización retrospectiva del diseño resultante,
como explica su contexto; su alta está en `c1f4f52` (2026-07-15). ADR-009 se añadió
en `3283b87`, después de las implementaciones `737734b` y `5d87aa6` del mismo día
(2026-09-04): documenta ese checkpoint, no una decisión demostrablemente previa.
ADR-006, ADR-010, ADR-011 y ADR-012 se incorporaron junto con los cambios citados
en su historia (`d183a31`, `7d4ceda`, `8e25dcd`, `dbc8940`); eso tampoco demuestra
el orden interno de diseño e implementación. Los encabezados y revisiones de
ADR-001 a ADR-004 no se usan para reconstruir fechas de decisión no comprobadas.
No se reescriben esas fuentes históricas.

Los cambios posteriores a `v0.5.0` de gate, confirmación/refresco y borradores
quedan cubiertos por ADR-010/011/012. Identificación de build, filtros, política
de exportación local offline y correcciones de accesibilidad conservan plataforma,
capas y persistencia: sus planes/reportes aportan la trazabilidad funcional, sin
inventar un ADR por cada defecto. Los parches menores y el ajuste CSS del
[precorte](../gestion/revision-precorte-2026-10-22.md) tampoco cambian esas decisiones.

**Ampliación de esta rama:** el incidente de desinstalación motivó una decisión
de tooling adicional, [ADR-013](./ADR-013-despliegue-android-sin-desinstalacion-implicita.md),
con protección y recuperación autorizadas. Complementa el inventario de doce ADR
de la base; no modifica su temporalidad ni la arquitectura de la app.
