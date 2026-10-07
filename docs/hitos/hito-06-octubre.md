# Informe de avance de Hito 06 — Entrega Final

**Período planificado:** Octubre 2026

**Inicio operativo:** 2026-07-15

**Hito:** 06 — Entrega Final

**Proyecto:** Lumapse

**Estado:** Activo — segunda beta `v0.5.0` publicada; cierre académico, matriz RNF y presentación pendientes

**Última actualización:** Octubre 2026

---

## Objetivo

Cerrar Lumapse con documentación coherente, evidencia técnica reproducible, diagramas finales y una presentación académica preparada. Hito 06 no abre una nueva etapa de producto: convierte la beta operativa en una entrega defendible y decide el corte final solo después de validar todos los artefactos.

**Prioridad aprobada vigente:** terminar producto/bloqueantes → generar y validar APK
de la versión correspondiente (objetivo `0.6.0+`, condicionado al avance/autorización)
→ completar informe final, manual y defensa. Para finales de octubre de 2026 deben
estar preparados todos esos entregables; no se promete cerrarlos en dos sesiones.
El [recorte de entrega y deuda postdefensa](../../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa)
precisa los imprescindibles y límites de este mismo hito: beta defendible, sin
afirmar estabilidad comercial, cumplimiento no medido ni adopción real.

**Ajuste aprobado — 2026-10-04:** las métricas CRUD/FPS de RNF-002/RNF-004 quedan
en [backlog post-presentación](../../BACKLOG.md#rendimiento-post-presentación), sin
bloquear la entrega por esa ausencia. Se conservan pendientes y sin rebajar
umbrales; no se exige otra cámara/dispositivo ni se continúan pilotos. Los demás
RNF, la validación funcional y los controles de seguridad no quedan postergados.

## Punto de Partida

- Hitos 00 a 05 cerrados documentalmente.
- Primera beta [`v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8) preservada como evidencia histórica de Hito 05.
- Segunda beta [`v0.5.0`](https://github.com/jdfesa/lumapse/releases/tag/v0.5.0) publicada con APK firmada; tag anotado sobre `5840755` y SHA-256 `d48338e04021a6096fcaeaced5fde411911d403c9ea95407891d2b034515a884`.
- Gate final de `v0.5.0` aprobado con 67 archivos y 1065 tests; CI de PR #10 en verde y versiones web/Android alineadas como `0.5.0/500`.
- Validación incremental histórica en Samsung `SM_G965F` preservada por separado; APK firmada/publicada `v0.5.0` aceptada por el autor en al menos tres dispositivos. [Aceptación general y límites](../gestion/checklist-validacion-android.md#aceptación-general-de-la-apk-publicada-v050).
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
- [ ] Alinear el tablero con la Definition of Workflow y registrar fechas reales de inicio/fin; recalibrar la SLE solo con cinco elementos confiables, sin inventar tiempos para cerrar el hito.
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
- [x] Aceptación general del asset firmado/publicado `lumapse-v0.5.0.apk` recibida; no se rellenan casos históricos ni se reabre esa prueba. F3 sigue pendiente.
- [ ] **Post-presentación, no bloqueante:** medir latencia CRUD/FPS con al menos 500 notas (`RNF-002`, `RNF-004`), según [decisión del autor](../../BACKLOG.md#rendimiento-post-presentación). La importación funcional no acredita rendimiento cuantitativo.
- [ ] Ejecutar pruebas con estudiantes y revisar profundidad de navegación (`RNF-005`, `RNF-006`). La fricción técnica de `Mover a` ya fue corregida y validada en PR #9.
- [ ] Auditar tipografía, touch targets, contraste y navegación accesible (`RNF-007`, `RNF-008`, `RNF-019` a `RNF-022`).
- [x] OFF-01–05 de `RNF-009` PASS en [debug `348da88` identificado](../beta-core-validation/offline-2026-10-06.md), con fix del ZIP local y datos preservados; autor aceptó [PR #31](https://github.com/jdfesa/lumapse/pull/31) y autorizó merge/limpieza, sin transferencia al APK final.
- [x] `RNF-010`: continuidad SQLite verificada y aceptada en [PR #29](https://github.com/jdfesa/lumapse/pull/29); [evidencia y límites](../beta-core-validation/continuidad-2026-10-04.md). No repetir la tarea cerrada ni trasladar automáticamente sus pruebas a un APK nuevo.
- [x] Revalidar dependencias tras el advisory crítico de Capacitor: `@capacitor/android`/`core` 8.5.2 y `source-map-js` 1.2.2, auditorías completa/productiva 0/0. [Evidencia y límites](../gestion/validacion-parche-capacitor-2026-10-07.md).
- [ ] Registrar tráfico de red y revisar trackers durante los flujos completos (`RNF-012`, `RNF-013`); la remediación de dependencias no sustituye esta evidencia.
- [x] Incorporar TypeScript al reporte de coverage y volver a medir `RNF-024`: 92,43% de statements en `src/services/**` sobre la fuente actual (2026-08-21); repetir en el commit candidato para la matriz final.
- [ ] Confirmar o reformular los RNF obsoletos/no aplicables sin reutilizar evidencia PWA para el APK.
- [ ] Emitir una matriz final con RNF, método, comando, dispositivo, fecha, artefacto, resultado y evidencia.
- [ ] Clasificar cada hallazgo como bloqueante, mejora menor aceptada o trabajo post-defensa.

### 4. Presentación y defensa

- Preparar estructura narrativa, diapositivas, demo y tiempos.
- Actualizar el cheatsheet con métricas finales y respuestas verificables.
- Preparar una demo de contingencia y evidencia alternativa si falla el dispositivo.
- Ensayar instalación, apertura, nota, organización, búsqueda, fechas y backup/importación.
- Revisar el manual externo de `v0.5.0` informado por el autor y adaptarlo al APK final; no presumir que ya está revisado o actualizado.
- Reservar tiempo de estudio del autor y mantener coherencia entre artefacto, informe, manual y demo.

### 5. Corte y línea base final

- `v0.4.8` permanece como evidencia inmutable de la primera beta; `v0.5.0` congela AUD-001 a AUD-007 y las correcciones táctiles en la segunda beta.
- Preparar el corte correspondiente después de producto/evidencia y antes del informe final/defensa; objetivo `0.6.0+` condicionado, no obligación de publicar `1.0.0`.
- No reemplazar el asset `v0.5.0`. Un debug privado autorizado se identifica por canal/origen/hash sin bump por prueba; nuevo candidato/entrega requiere versión/code nuevos y permiso específico. [Flujo Android](../flujo-desarrollo-android.md#identificación-de-compilaciones-en-acerca-de).
- `scripts/release-helper.py` ya sincroniza package/changelog, `versionName` y `versionCode`, distingue artefactos firmados/unsigned y expone `check:version` en el gate.
- En el próximo corte entregable autorizado, actualizar versión, código Android, hash, changelog, README y línea base; después reconciliar informe y material de defensa.
- Registrar la línea base académica del artefacto definitivo y su condición de beta; un tag estable o `1.0.0` requiere evidencia y decisión explícita, no se fuerza por la fecha de defensa.

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

El seguimiento original se conserva abajo. Para el frente técnico se
aceptó el [plan inmediato de la beta](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md) en PR #13:
F1, reproducibilidad del gate (AUD-008/AUD-009); F2, confirmación de creación ante fallos de
recarga (AUD-014); F3, evidencia Android y medición con 500 notas. **F1 y F2 fueron aprobadas e integradas
en PR #14 y #15; sus ramas se eliminaron. Crear materia/sección y editar/eliminar fecha
se probaron en Android e integraron por separado en PR #19 (`34b2900`, 2026-09-18);
otras mutaciones vecinas quedan como deuda media guiada por evidencia. F3 tiene preparación
verificable y mediciones Android pendientes, sin cerrar.** Ver la
[evidencia de F2](../gestion/validacion-f2-guardado-y-refresco-2026-09-13.md) y el [protocolo F3](../beta-core-validation/README.md). No agrega funcionalidades ni fija una
fecha para `1.0.0`; los pendientes académicos y la matriz RNF completa siguen abiertos.

| Orden | Frente | Salida esperada |
|---|---|---|
| 1 | Producto y bloqueantes | Identificación de build revisada y tratamiento aprobado de hallazgos reales; CRUD/FPS diferidos a post-presentación, resto de F3 pendiente de prioridad/revisión |
| 2 | APK correspondiente | Gate/auditorías y validación Android del artefacto exacto; corte `0.6.0+` según avance/autorización |
| 3 | Informe, manual y diagramas | Evidencia final incorporada, manual adaptado, bibliografía/maquetación y contenido congelados |
| 4 | Defensa y línea base | Deck, demo, contingencia y decisión académica verificables |

Detalle/prerrequisitos en el [ajuste de prioridad aprobado](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md#ajuste-de-prioridad-aprobado--2026-10-04); el diseño de pruebas original se conserva sin afirmar que fue ejecutado.

Se mantiene WIP 2 como techo entre `En Curso` y `En Revisión`, según la [`Definition of Workflow`](../gestion/definicion-flujo-kanban.md), con una sola rama/frente técnico activo incluyendo revisión; no abrir el siguiente antes de aceptación, integración y limpieza.

## Observaciones Bajo Seguimiento

| Observación | Severidad actual | Evidencia requerida |
|---|---|---|
| AUD-004 — dependencias con advisories | Cerrado técnicamente / sin bloqueantes | Grafo mínimo, auditorías 0/0, sanitización, build y Android aprobados el 2026-09-02 |
| AUD-007 — contratos de errores del store | Cerrado técnicamente / sin bloqueantes | Contrato único, consumidores, 989 tests, quality gate y Android aprobados el 2026-09-03 |
| AUD-006 — resultados async obsoletos | Cerrado / publicado | 1057 tests locales, controles individuales, Android y merge de PR #8; incluido en `v0.5.0` |
| Versionado web/Android | Mitigado en `v0.5.0` | `check:version` compara package, `versionName` y `versionCode`; repetir en cada corte |
| `Mover a` requería pulsación prolongada | Cerrado en PR #9 | Toque normal y menús contextuales validados en Android; conservar como antecedente resuelto |
| Rendimiento con mayor volumen de notas | Evidencia pendiente, diferida a post-presentación | Postergación aceptada por el autor; no bloqueante por falta de métricas. No equivale a cumplimiento de latencia/FPS ni descarta un defecto funcional futuro |
| AUD-008/AUD-009 — gate portable | Cerrados en F1 / PR #14 | Mantener entorno canónico y gate único; aceptación y evidencia por entorno en el reporte de F1 |
| AUD-014 — creación confirmada y recarga fallida | F2 aceptada e integrada en PR #15 | Autor confirmó funcionamiento e hizo merge el 2026-09-14; regresiones SQLite/UI. PR #19 cerró por separado crear materia/sección y editar/eliminar fecha (`34b2900`, 2026-09-18); otras mutaciones vecinas quedan como deuda media |

## Criterios de Cierre

- [x] Narrativa canónica, capítulos fuente y checkpoint ensamblado reconciliados al 2026-07-15.
- [x] Fuentes de base de datos sincronizadas con el schema ejecutable.
- [x] AUD-001, AUD-002 y AUD-003 corregidos, validados e integrados.
- [ ] Informe final revisado, referenciado y exportable.
- [ ] Manual de usuario revisado y adaptado al mismo APK final.
- [x] Gráficos de base de datos actualizados y consistentes con el schema.
- [x] AUD-004 resuelto y auditorías completa/productiva sin vulnerabilidades al 2026-09-02.
- [x] Quality gate de `v0.5.0` sin fallos: 67 archivos, 1065 tests y CI aprobado.
- [ ] Validación Android final documentada y sin bloqueantes.
- [ ] Matriz RNF final emitida con evidencia reproducible y límites explícitos.
- [ ] Observaciones pendientes resueltas o aceptadas explícitamente; `Mover a` cerrado y métricas CRUD/FPS aceptadas como deuda post-presentación, sin declararlas cumplidas. Revisar las restantes por separado.
- [ ] Presentación, demo y contingencia ensayadas.
- [ ] Factor de ajuste sustentado por datos fiables, o limitación de medición explícita; recomendaciones finales registradas.
- [x] Segunda beta posterior a `v0.4.8` publicada como `v0.5.0`, con versión web/Android, firma, hash y distribución inequívocos.
- [ ] Línea base académica final documentada sobre el APK autorizado, con fuente, versión/code, firma y hash; sin obligación de declararlo estable.

## Documentos de Control

- [`../../TODO.md`](../../TODO.md) — tareas inmediatas.
- [`../../BACKLOG.md`](../../BACKLOG.md) — deuda, políticas e ideas postergadas.
- [`../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md`](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md) — propuesta de próximas sesiones, evidencia y criterios de aceptación; sin implementación.
- [`../gestion/lineas-base.md`](../gestion/lineas-base.md) — cortes congelados y futura línea base final.
- [`../gestion/seguimiento-velocidad.md`](../gestion/seguimiento-velocidad.md) — SP entregados por hito.
- [`../gestion/definicion-flujo-kanban.md`](../gestion/definicion-flujo-kanban.md) — estados, políticas, WIP y métricas de flujo.
- [`../gestion/cheatsheet-defensa.md`](../gestion/cheatsheet-defensa.md) — argumentos y métricas de defensa.
- [`../gestion/revision-tecnica-priorizada-2026-09-01.md`](../gestion/revision-tecnica-priorizada-2026-09-01.md) — hallazgos AUD-001 a AUD-013 y prioridades vigentes.
- [`../gestion/analisis-aud-003-seguridad-importacion-backups-2026-09-01.md`](../gestion/analisis-aud-003-seguridad-importacion-backups-2026-09-01.md) — evidencia, implementación y validación acumulativa de AUD-003.
- [`hito-05-septiembre.md`](hito-05-septiembre.md) — cierre del hito anterior.
