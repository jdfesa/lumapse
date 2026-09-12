# Informe de avance de Hito 06 — Entrega Final

**Período planificado:** Octubre 2026

**Inicio operativo:** 2026-07-15

**Hito:** 06 — Entrega Final

**Proyecto:** Lumapse

**Estado:** Activo — segunda beta `v0.5.0` publicada; cierre académico, matriz RNF y presentación pendientes

**Última actualización:** 2026-09-12

---

## Objetivo

Cerrar Lumapse con documentación coherente, evidencia técnica reproducible, diagramas finales y una presentación académica preparada. Hito 06 no abre una nueva etapa de producto: convierte la beta operativa en una entrega defendible y decide el corte final solo después de validar todos los artefactos.

## Punto de Partida

- Hitos 00 a 05 cerrados documentalmente.
- Primera beta [`v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8) preservada como evidencia histórica de Hito 05.
- Segunda beta [`v0.5.0`](https://github.com/jdfesa/lumapse/releases/tag/v0.5.0) publicada con APK firmada; tag anotado sobre `5840755` y SHA-256 `d48338e04021a6096fcaeaced5fde411911d403c9ea95407891d2b034515a884`.
- Gate final de `v0.5.0` aprobado con 67 archivos y 1065 tests; CI de PR #10 en verde y versiones web/Android alineadas como `0.5.0/500`.
- Validación incremental aprobada en Samsung `SM_G965F` con datos preservados; la instalación específica del asset firmado de GitHub sigue pendiente y está diferenciada en la checklist.
- AUD-001 y AUD-002 quedaron integrados mediante PR #2; AUD-003 quedó integrado mediante PR #3 después de completar la suite acumulativa y los checkpoints Android acordados.
- AUD-004 quedó integrado mediante PR #5, AUD-007 mediante PR #6, AUD-005 mediante PR #7 y AUD-006 mediante PR #8, con sus quality gates y validaciones Android aprobados. Todos forman parte de `v0.5.0`.
- PR #9 cerró la fricción táctil de `Mover a` y las acciones de materias/secciones; PR #10 preparó, verificó y versionó la segunda beta.
- Diagramas Mermaid revisados contra el alcance de la beta; fuentes DOT, DBML y DDL sincronizadas; exportaciones gráficas de base de datos reemplazadas, revisadas e incorporadas el 2026-07-15.

## Alcance del Hito

### 1. Revisión editorial y congelamiento documental

- [x] Revisar el informe final de punta a punta y ensamblar un checkpoint coherente.
- [x] Eliminar contradicciones entre versión, hitos, requisitos, métricas y evidencias.
- [x] Mantener Markdown como fuente de verdad y documentar la salida LaTeX/PDF para después del congelamiento.
- [x] Incorporar una sección de referencias y metadatos de portada reproducibles, sin leer información desde el artefacto generado.
- [x] Revisar el marco metodológico: corregir la comparación con Scrum, distinguir RUP de sus artefactos y formalizar el flujo Kanban sin inventar métricas históricas.
- [x] Reconciliar `CHANGELOG.md`, backlog, `TODO`, líneas base, informe y material de defensa con la publicación de `v0.5.0`, preservando `v0.4.8` como evidencia histórica.
- [ ] Alinear el tablero con la Definition of Workflow y registrar fechas de inicio/fin de los elementos restantes para recalibrar la SLE con evidencia.
- [ ] Verificar contra los originales los datos bibliográficos incompletos de los materiales de cátedra.
- [ ] Consolidar la evidencia final; luego verificar referencias, tablas, terminología, legibilidad de las figuras y congelar el contenido. Las exportaciones gráficas DB ya fueron incorporadas.

### 2. Gráficos de base de datos

- [x] Sincronizar el modelo conceptual Chen en su fuente DOT/Graphviz.
- [x] Regenerar el modelo lógico relacional DBML desde el schema implementado.
- [x] Verificar el modelo físico DDL contra el schema implementado.
- [x] Exportar, reemplazar e incorporar los gráficos finales desde las fuentes vigentes (2026-07-15).
- [ ] Confirmar su legibilidad al tamaño definitivo del informe y la presentación; reexportar solo si la maquetación lo exige.

### 3. Validación final

- [x] Cerrar AUD-001 y AUD-002 con regresiones de error y concurrencia, integración mediante PR #2 y comportamiento de descarte distinguible.
- [x] Cerrar AUD-003 con importación ZIP acotada, validación runtime, jerarquía consistente, presentación defensiva, suite acumulativa e integración mediante PR #3.
- [x] Aprobar los checkpoints Android de AUD-003 con backups `STORE`/`DEFLATE`, rechazo de datos inválidos antes de persistir, fixture de 500 notas y build completo instalado. Esta evidencia no equivale a validar un artefacto publicado nuevo.
- [x] Resolver AUD-004 en un PR separado: grafo mínimo actualizado, auditorías completa/productiva en cero, sanitización, 955 tests, build, quality gate y Android 0.4.8/408 aprobados el 2026-09-02.
- [x] Resolver AUD-007 en un PR separado: contrato emit-and-rethrow, límites UI deterministas, 989 tests, quality gate y Android 0.4.8/408 aprobados el 2026-09-03.
- [x] Cerrar AUD-005: propiedad SQLite explícita, migraciones estrictas, arranque recuperable, 1035 tests, gate canónico y funcionamiento general Android aprobados el 2026-09-04; integrado mediante PR #7.
- [x] Cerrar AUD-006: ownership de Papelera y caches académicos, 1057 tests locales con un worker, controles individuales y Android aprobados; integrado mediante [PR #8](https://github.com/jdfesa/lumapse/pull/8), con limitación del gate local documentada.
- [x] Ejecutar el quality gate del corte `v0.5.0`: 67 archivos y 1065 tests aprobados, CI de PR #10 en verde y metadatos `0.5.0/500` verificados.
- [ ] Completar la checklist Android sobre el asset firmado `lumapse-v0.5.0.apk`; la validación incremental existente utilizó un build equivalente con clave debug para preservar datos.
- [ ] Medir latencia CRUD y rendimiento con al menos 500 notas (`RNF-002`, `RNF-004`); la importación funcional de esa cantidad no constituye una medición de rendimiento.
- [ ] Ejecutar pruebas con estudiantes y revisar profundidad de navegación (`RNF-005`, `RNF-006`). La fricción técnica de `Mover a` ya fue corregida y validada en PR #9.
- [ ] Auditar tipografía, touch targets, contraste y navegación accesible (`RNF-007`, `RNF-008`, `RNF-019` a `RNF-022`).
- [ ] Repetir los flujos principales en modo avión y cubrir cierre o terminación inesperada del editor (`RNF-009`, `RNF-010`).
- [ ] Registrar tráfico de red y revisar dependencias/trackers (`RNF-012`, `RNF-013`).
- [x] Incorporar TypeScript al reporte de coverage y volver a medir `RNF-024`: 92,43% de statements en `src/services/**` sobre la fuente actual (2026-08-21); repetir en el commit candidato para la matriz final.
- [ ] Confirmar o reformular los RNF obsoletos/no aplicables sin reutilizar evidencia PWA para el APK.
- [ ] Emitir una matriz final con RNF, método, comando, dispositivo, fecha, artefacto, resultado y evidencia.
- [ ] Clasificar cada hallazgo como bloqueante, mejora menor aceptada o trabajo post-defensa.

### 4. Presentación y defensa

- Preparar estructura narrativa, diapositivas, demo y tiempos.
- Actualizar el cheatsheet con métricas finales y respuestas verificables.
- Preparar una demo de contingencia y evidencia alternativa si falla el dispositivo.
- Ensayar instalación, apertura, nota, organización, búsqueda, fechas y backup/importación.

### 5. Corte y línea base final

- `v0.4.8` permanece como evidencia inmutable de la primera beta; `v0.5.0` congela AUD-001 a AUD-007 y las correcciones táctiles en la segunda beta.
- Decidir después de la matriz RNF y la preparación de defensa si `v0.5.0` será la referencia académica suficiente o si corresponde un corte estable posterior.
- No reutilizar `v0.5.0` ni `versionCode 500` para un binario diferente.
- `scripts/release-helper.py` ya sincroniza package/changelog, `versionName` y `versionCode`, distingue artefactos firmados/unsigned y expone `check:version` en el gate.
- Si se genera otro APK, actualizar versión, código Android, hash, changelog, README, línea base y material de defensa en un único corte.
- Crear `LB-PROD-v1.0.0` o un tag estable equivalente solo cuando documentación, validación y artefacto sean definitivos.

## Fuera de Alcance

- Nuevas funcionalidades de producto.
- Sincronización multi-dispositivo o backup automático en nube.
- Adjuntos de imagen.
- Compartir/importar notas individuales.
- Onboarding, coach marks o tutoriales obligatorios.
- Migraciones amplias de framework, store o componentes DOM.
- Refactors que no resuelvan un riesgo concreto de entrega.

Las ideas conservadas siguen en [`../../BACKLOG.md`](../../BACKLOG.md) y no compiten con el cierre.

## Orden de Trabajo

El orden académico general se conserva abajo. Para las próximas sesiones del frente técnico se
propone el [plan inmediato de la beta](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md):
F1, reproducibilidad del gate (AUD-008/AUD-009); F2, confirmación de creación ante fallos de
recarga (AUD-014); F3, evidencia Android y medición con 500 notas. **La propuesta requiere
aceptación e integración por PR antes de implementar.** No agrega funcionalidades ni fija una
fecha para `1.0.0`; los pendientes académicos y la matriz RNF completa siguen abiertos.

| Orden | Frente | Salida esperada |
|---|---|---|
| 1 | Sincronización documental | Evidencia de `v0.5.0` reflejada sin reescribir la historia de `v0.4.8` |
| 2 | Seguridad de release | Completado: AUD-004 validado con auditorías 0/0 y Android aprobado |
| 3 | Revisión editorial y diagramas DB | Contenido congelado; fuentes y exportaciones finales verificadas |
| 4 | Validación | Gate, matriz RNF y checklist Android sin bloqueantes sobre el mismo artefacto |
| 5 | Presentación | Deck, demo, guion y contingencia listos |
| 6 | Línea base | `v0.5.0` documentada y decisión explícita sobre un eventual corte estable posterior |

Se mantiene WIP máximo de dos elementos activos en total entre `En Curso` y `En Revisión`, según la [`Definition of Workflow`](../gestion/definicion-flujo-kanban.md), para evitar que documentación, validación y presentación queden abiertas al mismo tiempo.

## Observaciones Bajo Seguimiento

| Observación | Severidad actual | Evidencia requerida |
|---|---|---|
| AUD-004 — dependencias con advisories | Cerrado técnicamente / sin bloqueantes | Grafo mínimo, auditorías 0/0, sanitización, build y Android aprobados el 2026-09-02 |
| AUD-007 — contratos de errores del store | Cerrado técnicamente / sin bloqueantes | Contrato único, consumidores, 989 tests, quality gate y Android aprobados el 2026-09-03 |
| AUD-006 — resultados async obsoletos | Cerrado / publicado | 1057 tests locales, controles individuales, Android y merge de PR #8; incluido en `v0.5.0` |
| Versionado web/Android | Mitigado en `v0.5.0` | `check:version` compara package, `versionName` y `versionCode`; repetir en cada corte |
| `Mover a` requería pulsación prolongada | Cerrado en PR #9 | Toque normal y menús contextuales validados en Android; conservar como antecedente resuelto |
| Rendimiento con mayor volumen de notas | Riesgo medio de evidencia | Medición de latencia y percepción con al menos 500 notas; no solo importación funcional |
| `npm run verify` depende del entorno vigente | Riesgo medio de tooling | Resolver por separado falsos positivos CSP de AUD-008 y colisión Web Storage de Node 26 de AUD-009 |
| AUD-014 — creación confirmada y recarga fallida | P1 confirmado en SQLite en memoria; sin corrección | Dos reproducciones generan duplicados al reintentar; F2 propone separar el resultado de escritura del refresco y validar consumidores/Android |

## Criterios de Cierre

- [x] Narrativa canónica, capítulos fuente y checkpoint ensamblado reconciliados al 2026-07-15.
- [x] Fuentes de base de datos sincronizadas con el schema ejecutable.
- [x] AUD-001, AUD-002 y AUD-003 corregidos, validados e integrados.
- [ ] Informe final revisado, referenciado y exportable.
- [x] Gráficos de base de datos actualizados y consistentes con el schema.
- [x] AUD-004 resuelto y auditorías completa/productiva sin vulnerabilidades al 2026-09-02.
- [x] Quality gate de `v0.5.0` sin fallos: 67 archivos, 1065 tests y CI aprobado.
- [ ] Validación Android final documentada y sin bloqueantes.
- [ ] Matriz RNF final emitida con evidencia reproducible y límites explícitos.
- [ ] Observaciones pendientes resueltas o aceptadas explícitamente; `Mover a` ya quedó cerrado, rendimiento sigue abierto.
- [ ] Presentación, demo y contingencia ensayadas.
- [ ] Factor de ajuste y recomendaciones finales registrados.
- [x] Segunda beta posterior a `v0.4.8` publicada como `v0.5.0`, con versión web/Android, firma, hash y distribución inequívocos.
- [ ] Decisión de línea base académica final documentada: usar `v0.5.0` o producir un corte estable posterior.

## Documentos de Control

- [`../../TODO`](../../TODO) — tareas inmediatas.
- [`../../BACKLOG.md`](../../BACKLOG.md) — deuda, políticas e ideas postergadas.
- [`../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md`](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md) — propuesta de próximas sesiones, evidencia y criterios de aceptación; sin implementación.
- [`../gestion/lineas-base.md`](../gestion/lineas-base.md) — cortes congelados y futura línea base final.
- [`../gestion/seguimiento-velocidad.md`](../gestion/seguimiento-velocidad.md) — SP entregados por hito.
- [`../gestion/definicion-flujo-kanban.md`](../gestion/definicion-flujo-kanban.md) — estados, políticas, WIP y métricas de flujo.
- [`../gestion/cheatsheet-defensa.md`](../gestion/cheatsheet-defensa.md) — argumentos y métricas de defensa.
- [`../gestion/revision-tecnica-priorizada-2026-09-01.md`](../gestion/revision-tecnica-priorizada-2026-09-01.md) — hallazgos AUD-001 a AUD-013 y prioridades vigentes.
- [`../gestion/analisis-aud-003-seguridad-importacion-backups-2026-09-01.md`](../gestion/analisis-aud-003-seguridad-importacion-backups-2026-09-01.md) — evidencia, implementación y validación acumulativa de AUD-003.
- [`hito-05-septiembre.md`](hito-05-septiembre.md) — cierre del hito anterior.
