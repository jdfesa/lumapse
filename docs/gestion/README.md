# Gestión del Proyecto — Lumapse

Esta carpeta contiene los artefactos de **estimación, planificación y control de avance**
del proyecto, según los lineamientos de la cátedra PP3 (Ing. Mauricio Parada) y la bibliografía
de Gómez (2014).

> **Estado actual:** Hito 05 quedó cerrado sobre `v0.4.8`. Hito 06 — Entrega Final está activo y ya publicó la segunda beta `v0.5.0`; el [ciclo técnico inmediato](./plan-desarrollo-inmediato-beta-2026-09-12.md) fue aceptado en PR #13. F1 y F2 fueron aprobadas e integradas en PR #14 y #15, con ramas eliminadas. F3 tiene preparación verificable y medición Android pendiente, sin cerrar. Continúa el cierre académico. Ver [`../hitos/hito-06-octubre.md`](../hitos/hito-06-octubre.md).

---

## Índice

| Documento | Contenido | Estado |
|---|---|---|
| [`plan-desarrollo-inmediato-beta-2026-09-12.md`](./plan-desarrollo-inmediato-beta-2026-09-12.md) | Análisis acotado y próximas sesiones: AUD-008/AUD-009, nuevo AUD-014 y validación del núcleo con 500 notas | ✅ Plan, F1, F2 y preparación F3 integrados |
| [`../beta-core-validation/README.md`](../beta-core-validation/README.md) | Fixtures, protocolo, conteos locales y matriz CRUD/FPS/offline/continuidad | 🔎 PR #16 integrado; métricas Android pendientes |
| [`validacion-parche-vitest-2026-09-15.md`](./validacion-parche-vitest-2026-09-15.md) | Parche de tooling, grafo mínimo, regresiones del mocker y handoff histórico | ✅ Probado e integrado por el autor en PR #17 |
| [`plan-filtros-visibles-2026-09-15.md`](./plan-filtros-visibles-2026-09-15.md) | Alternativas UX, fecha/búsqueda removibles, alcance, regresiones y handoff Android | 🔎 Implementado; prueba/aprobación del autor pendiente |
| [`plan-refrescos-vecinos-2026-09-16.md`](./plan-refrescos-vecinos-2026-09-16.md) | Plan, matriz y evidencia de crear materia y editar/eliminar fecha con escritura confirmada | 🔄 En implementación; Android/aprobación pendientes |
| [`definicion-flujo-kanban.md`](./definicion-flujo-kanban.md) | Definition of Workflow, WIP, políticas, SLE y métricas de flujo desde Hito 06 | ✅ Vigente |
| [`estimacion-pert.md`](./estimacion-pert.md) | Estimación de 3 puntos (PERT) para los módulos de mayor riesgo | ✅ Completado |
| [`lineas-base.md`](./lineas-base.md) | Registro de líneas base y releases `v0.4.8`/`v0.5.0`, más el futuro corte estable | 🔄 Activo en Hito 06 |
| [`seguimiento-velocidad.md`](./seguimiento-velocidad.md) | SP planificados y entregados por hito como métrica académica separada del flujo Kanban | ✅ Actualizado |
| [`checklist-validacion-android.md`](./checklist-validacion-android.md) | Evidencia histórica de `v0.4.8` y validación incremental del corte `v0.5.0` | 🔄 Instalación del asset firmado pendiente |
| [`cheatsheet-defensa.md`](./cheatsheet-defensa.md) | Métricas, decisiones y respuestas breves para la defensa | 🔄 Revisión final pendiente |
| [`firma-apk-android.md`](./firma-apk-android.md) | Política de firma, secretos y evidencia de los artefactos Android publicados | ✅ `v0.5.0` publicada |
| [`plan-mantenibilidad-tipado-gradual-2026-06-12.md`](./plan-mantenibilidad-tipado-gradual-2026-06-12.md) | Estrategia incremental de modularidad y tipado; no habilita refactors amplios durante el cierre | 📌 Referencia |
| [`revision-tecnica-priorizada-2026-09-01.md`](./revision-tecnica-priorizada-2026-09-01.md) | Auditoría original y seguimiento vivo; complemento AUD-014 enlazado al plan inmediato | ✅ AUD-001 a AUD-009 y alcance F2 cerrados |
| [`validacion-f1-gate-portable-2026-09-12.md`](./validacion-f1-gate-portable-2026-09-12.md) | Implementación y evidencia por entorno de AUD-008/AUD-009; aceptación del autor | ✅ F1 integrada en PR #14 |
| [`validacion-f2-guardado-y-refresco-2026-09-13.md`](./validacion-f2-guardado-y-refresco-2026-09-13.md) | Creación confirmada, recuperación de lecturas, regresiones SQLite/UI y límites vecinos | ✅ F2 aceptada e integrada en PR #15 |
| [`analisis-aud-003-seguridad-importacion-backups-2026-09-01.md`](./analisis-aud-003-seguridad-importacion-backups-2026-09-01.md) | Revalidación e implementación de AUD-003: frontera ZIP/JSON, integridad y defensa de presentación | ✅ Cerrado en PR #3 |
| [`analisis-aud-004-seguridad-dependencias-2026-09-02.md`](./analisis-aud-004-seguridad-dependencias-2026-09-02.md) | Revalidación y cierre de AUD-004: advisories, grafo mínimo, auditorías, gates y Android | ✅ Cerrado en PR #5 |
| [`analisis-aud-007-contratos-errores-store-2026-09-03.md`](./analisis-aud-007-contratos-errores-store-2026-09-03.md) | Contrato emit-and-rethrow, adaptación de consumidores y evidencia automática/Android de AUD-007 | ✅ Cerrado en PR #6 |
| [`analisis-aud-005-coordinacion-sqlite-2026-09-04.md`](./analisis-aud-005-coordinacion-sqlite-2026-09-04.md) | Propiedad SQLite explícita, migraciones estrictas y arranque recuperable | ✅ Cerrado en PR #7 |
| [`analisis-aud-006-ownership-solicitudes-async-2026-09-05.md`](./analisis-aud-006-ownership-solicitudes-async-2026-09-05.md) | Vigencia de Papelera y consistencia de caches académicos | ✅ Cerrado en PR #8 e incluido en `v0.5.0` |
| [`historico/`](./historico/) | Snapshots operativos cerrados preservados como evidencia de proceso | 📦 Archivo |

---

## Relación con otras carpetas

| Carpeta | Contenido | Pregunta que responde |
|---|---|---|
| `docs/producto/` | Personas, RF, RNF, HU, Lean Canvas, encuesta | ¿QUÉ construimos y PARA QUIÉN? |
| **`docs/gestion/`** | **Estimación, velocidad, líneas base, control** | **¿CÓMO planificamos y controlamos el avance?** |
| `docs/adr/` | Architecture Decision Records | ¿POR QUÉ tomamos cada decisión técnica? |
| `docs/hitos/` | Informes de avance mensual | ¿QUÉ logramos en cada período? |

---

## Referencia bibliográfica

> Gómez, J. (2014). *Guía Práctica de Estimación y Medición de Proyectos Software.*
> Material complementado por la Guía de Estudio de la cátedra PP3 (Ing. Mauricio Parada, 2026).
