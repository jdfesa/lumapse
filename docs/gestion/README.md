# Gestión del Proyecto — Lumapse

Esta carpeta contiene los artefactos de **estimación, planificación y control de avance**
del proyecto, según los lineamientos de la cátedra PP3 (Ing. Mauricio Parada) y la bibliografía
de Gómez (2014).

> **Estado actual:** RC1 `v0.6.0/600` publicada y aceptada con validación parcial;
> [desarrollo y nuevas pruebas de app congelados](../../BACKLOG.md#congelación-académica--2026-10-22).
> Hito 06 sigue activo sólo para documentación y defensa: revisión final del manual
> 0.6.0 publicado, matriz RNF e informe. F1/F2 están integradas; las métricas CRUD/FPS
> de F3 y las comprobaciones restantes de la RC1 se conservan diferidas, no aprobadas.
> Las propuestas y handoffs fechados se leen como evidencia de su momento, no como
> autorización para retomar tareas técnicas.

---

## Índice

| Documento | Contenido | Estado |
|---|---|---|
| [`candidato-apk-0.6.0.md`](./candidato-apk-0.6.0.md) | Fuente, firma, hash, controles y recorridos de actualización de la RC1 | 📌 Publicada y congelada; cobertura parcial aceptada |
| [`revision-precorte-2026-10-22.md`](./revision-precorte-2026-10-22.md) | Clasificación de observaciones, parches e incidente de despliegue/recuperación | ✅ PR #41 integrado; criterios previos supersedidos por la congelación donde corresponde |
| [`validacion-lighthouse-rnf-019-2026-10-20.md`](./validacion-lighthouse-rnf-019-2026-10-20.md) | 40 snapshots Lighthouse del WebView, método y límites | ✅ Métrica verificada en debug identificado; PR #40 aceptado, sin certificación global |
| [`validacion-teclado-rnf-020-2026-10-19.md`](./validacion-teclado-rnf-020-2026-10-19.md) | 16 casos de navegación por teclado mediante ADB | 🔎 Evidencia parcial; sin teclado físico ni mutaciones completas |
| [`validacion-nombres-accesibles-rnf-022-2026-10-13.md`](./validacion-nombres-accesibles-rnf-022-2026-10-13.md) | Nombres y alternativas accesibles; 24 escenas AX | ✅ Verificado en debug, aceptado en PR #38 |
| [`validacion-contraste-rnf-021-2026-10-12.md`](./validacion-contraste-rnf-021-2026-10-12.md) | Contraste del texto en ambos temas | ✅ Verificado en debug, aceptado en PR #37; hover adicional en precorte |
| [`validacion-tipografia-rnf-007-2026-10-09.md`](./validacion-tipografia-rnf-007-2026-10-09.md) | Piso de 16 CSS px en lectura/edición | ✅ Verificado en debug, aceptado en PR #36 |
| [`validacion-touch-targets-rnf-008-2026-10-08.md`](./validacion-touch-targets-rnf-008-2026-10-08.md) | Medición de áreas táctiles principales | ✅ Verificado en el debug identificado |
| [`validacion-usabilidad-navegacion-2026-10-07.md`](./validacion-usabilidad-navegacion-2026-10-07.md) | Profundidad de entrada de crear, buscar y organizar | ✅ RNF-006 verificado; no acredita tiempos de RNF-005 ni adopción |
| [`validacion-trafico-trackers-2026-10-07.md`](./validacion-trafico-trackers-2026-10-07.md) | Inventario y captura runtime de RNF-012/013 | ✅ Evidencia debug conservada; repetición en RC1 diferida |
| [`validacion-parche-capacitor-2026-10-07.md`](./validacion-parche-capacitor-2026-10-07.md) | Parche de Capacitor/source-map-js y auditorías de ese corte | ✅ Evidencia histórica; no sustituye nuevas auditorías de otros cortes |
| [`../beta-core-validation/offline-2026-10-06.md`](../beta-core-validation/offline-2026-10-06.md) | OFF-01–05, fallo y corrección del ZIP local sin red | ✅ RNF-009 verificado en debug `348da88`, aceptado en PR #31 |
| [`../beta-core-validation/continuidad-2026-10-04.md`](../beta-core-validation/continuidad-2026-10-04.md) | Borrador SQLite, migración y guardado atómico | ✅ RNF-010 verificado en debug identificado, aceptado en PR #29 |
| [`validacion-parches-dependencias-2026-10-02.md`](./validacion-parches-dependencias-2026-10-02.md) | Parche mínimo de DOMPurify, brace-expansion y undici; advisories, grafo y regresiones | ✅ Aceptación general Android y merge autorizado de [PR #21](https://github.com/jdfesa/lumapse/pull/21), `5ef1f911`; sin resultados por caso ni nuevas métricas F3 |
| [`plan-desarrollo-inmediato-beta-2026-09-12.md`](./plan-desarrollo-inmediato-beta-2026-09-12.md) | Plan original F1/F2/F3, evolución y seguimiento de cierre | 📌 F1/F2 integradas; secuencia técnica pendiente supersedida por la congelación |
| [`../beta-core-validation/README.md`](../beta-core-validation/README.md) | Fixtures, protocolo y evidencia CRUD/FPS/offline/continuidad | 🔎 CRUD/FPS diferidos; offline y continuidad conservan sus cierres por artefacto |
| [`validacion-parche-vitest-2026-09-15.md`](./validacion-parche-vitest-2026-09-15.md) | Parche de tooling, grafo mínimo, regresiones del mocker y handoff histórico | ✅ Probado e integrado por el autor en PR #17 |
| [`plan-filtros-visibles-2026-09-15.md`](./plan-filtros-visibles-2026-09-15.md) | Alternativas UX, fecha/búsqueda removibles, alcance, regresiones y handoff Android | ✅ Probado e integrado en PR #18 |
| [`plan-refrescos-vecinos-2026-09-16.md`](./plan-refrescos-vecinos-2026-09-16.md) | Plan, matriz y evidencia de crear materia/sección y editar/eliminar fecha con escritura confirmada | ✅ Android aprobado e integrado en PR #19 (`34b2900`, 2026-09-18); otras mutaciones quedan como deuda media |
| [`definicion-flujo-kanban.md`](./definicion-flujo-kanban.md) | Definition of Workflow, WIP, políticas, SLE y métricas de flujo desde Hito 06 | ✅ Vigente |
| [`estimacion-pert.md`](./estimacion-pert.md) | Estimación de 3 puntos (PERT) para los módulos de mayor riesgo | ✅ Completado |
| [`lineas-base.md`](./lineas-base.md) | Líneas base históricas, RC1 `v0.6.0` y cierre documental pendiente | 🔄 No equivale a entrega final ni exige una versión estable |
| [`seguimiento-velocidad.md`](./seguimiento-velocidad.md) | SP planificados y entregados por hito como métrica académica separada del flujo Kanban | ✅ Actualizado |
| [`checklist-validacion-android.md`](./checklist-validacion-android.md) | Evidencia y aceptaciones por artefacto; referencias al candidato | 📌 Resultados históricos preservados; no completa métricas F3 ni cobertura de la RC1 |
| [`cheatsheet-defensa.md`](./cheatsheet-defensa.md) | Métricas, decisiones y respuestas breves para la defensa | 🔄 Revisión final pendiente |
| [`firma-apk-android.md`](./firma-apk-android.md) | Política de firma y evidencia de APK publicadas, incluida RC1 `v0.6.0` | 📌 Artefactos inmutables; no autoriza recompilar ni publicar |
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
