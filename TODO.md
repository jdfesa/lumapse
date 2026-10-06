# TODO — Lumapse

> Tablero operativo breve. La deuda y las políticas viven en [`BACKLOG.md`](BACKLOG.md); el marco del hito está en [`docs/hitos/hito-06-octubre.md`](docs/hitos/hito-06-octubre.md) y el cierre anterior en [`docs/hitos/hito-05-septiembre.md`](docs/hitos/hito-05-septiembre.md).

## Hito actual: 06 — Entrega Final

**Estado:** activo; AUD-001 a AUD-007 quedaron cerrados e integrados mediante PR #2, #3 y #5 a #8. La pre-release `v0.5.0` incorpora esos cierres, las correcciones táctiles de PR #9 y el tooling de release de PR #10.

**Corte operativo vigente:** segunda beta [`v0.5.0`](https://github.com/jdfesa/lumapse/releases/tag/v0.5.0), publicada con APK firmada y validación automática/Android trazable.

**Versión publicada:** `v0.5.0` (`versionCode 500`), tag anotado sobre `5840755`. Las betas publicadas son inmutables; debug privado autorizado no exige bump por prueba. Un candidato/entrega posterior requiere versión/code nuevos: [flujo Android](docs/flujo-desarrollo-android.md#identificación-de-compilaciones-en-acerca-de).

**Objetivo:** producto y bloqueantes → APK de versión correspondiente generada/validada (objetivo `0.6.0+` según avance y autorización) → informe final, manual actualizado y defensa. Para finales de octubre de 2026 deben estar preparados todos esos entregables, sin ampliar el producto ni prometer una versión estable o adopción real.

**Recorte de cierre acordado:** [imprescindibles, límites y deuda postdefensa](BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa). Este tablero registra acciones, no certifica cumplimiento: una casilla pendiente o una postergación no se convierte en evidencia. Los estados RNF permanecen en su [fuente canónica](docs/producto/requisitos-no-funcionales.md).

## Prioridad inmediata — plan aceptado

**Prerrequisito de seguridad cerrado (2026-10-02):** el autor aceptó los cambios nuevos instalados en Samsung y autorizó integrar [PR #21](docs/gestion/validacion-parches-dependencias-2026-10-02.md), fusionado mediante `5ef1f911`; rama eliminada y `main` sincronizado. Aceptación general, sin resultados manuales por caso ni mediciones nuevas. No cambia versión ni completa F3.

El [plan de desarrollo inmediato de la beta](docs/gestion/plan-desarrollo-inmediato-beta-2026-09-12.md) fue aceptado e integrado en PR #13. **F1 y F2 aprobadas e integradas** en PR #14 (`7d4ceda`) y PR #15 (`8e25dcd`). **Preparación F3 aceptada e integrada** en PR #16 (`90fd21e`) tras la confirmación general del teléfono; ramas eliminadas. [Protocolo, fixtures y matriz](docs/beta-core-validation/README.md): las métricas Android siguen pendientes, sin declarar F3 cerrada.

**Último frente aceptado:** continuidad del borrador SQLite (`RNF-010`) en [PR #29](https://github.com/jdfesa/lumapse/pull/29): pruebas técnicas y teléfono aceptados por el autor; merge y limpieza autorizados. [Artefacto, resultados y límites](docs/beta-core-validation/continuidad-2026-10-04.md).
**Sesión 1 RNF-002/004: métricas diferidas a post-presentación** por decisión del autor
(2026-10-04), sin cumplimiento cuantitativo ni bloqueo de entrega por esta ausencia.
Control/exportación comprobados;
[evidencia canónica](docs/beta-core-validation/README.md#evidencia-de-la-sesión-1).
[PR #23](https://github.com/jdfesa/lumapse/pull/23) se acota a evidencia/retirada experimental. RNF-009 **verificado en debug `348da88`, revisión pendiente**; RNF-010 **verificado y aceptado**, [diagnóstico, corrección y cierre](docs/beta-core-validation/continuidad-2026-10-04.md);
seguir el [ajuste de prioridad vigente](docs/gestion/plan-desarrollo-inmediato-beta-2026-09-12.md#ajuste-de-prioridad-aprobado--2026-10-04).
Los filtros quedaron cerrados en PR #18 (`3898db8`); no sustituyen F3.

| Orden | Frente | Criterio de cierre |
|---|---|---|
| F1 | Gate portable — AUD-008/AUD-009 | Node 22.20.0/npm 10.9.3 fijados y mismo `verify` local/CI, sin depender de workaround, binario ignorado o falsos positivos CSP |
| F2 | Creación confirmada — AUD-014 | No duplicar notas/fechas al fallar una recarga posterior a la escritura; regresiones y smoke Android |
| F3 | Validación del núcleo | Preparación de 500 notas preservada; CRUD/FPS pendientes en backlog post-presentación. RNF-009 verificado en debug `348da88`; RNF-010 verificado y aceptado en debug identificado, sin cierre global de F3 |

El cierre editorial/visual, la matriz RNF restante, la defensa y la decisión de línea base final **siguen pendientes** en la checklist, después del APK validado. F3 no los sustituye ni obliga a publicar `1.0.0`. WIP 2 es techo entre En Curso y En Revisión, no permiso para dos ramas/frentes técnicos.

- [x] Aceptar e integrar el PR del plan inmediato — PR #13, `65e5767`; rama documental local/remota eliminada.
- [x] F1: aceptada e integrada en PR #14 (`7d4ceda`); rama `fix/quality-gate-portability` eliminada local/remota. Evidencia de ejecución e información no recibida distinguidas en su reporte.
- [x] Revalidar y preparar el parche de Vitest (GHSA-82fw-gwwq-j7x9): 4.1.11, grafo productivo intacto, auditorías del 2026-09-15 en 0/0 y cuatro regresiones focalizadas. [Evidencia](docs/gestion/validacion-parche-vitest-2026-09-15.md).
- [x] Autor confirmó pruebas y realizó merge de PR #17 (`7dc105c`); main sincronizado y rama local/remota eliminada.
- [x] Comparar alternativas e implementar filtros visibles con limpieza independiente, alcance efectivo y regresiones automáticas. [Plan y handoff](docs/gestion/plan-filtros-visibles-2026-09-15.md).
- [x] Autor probó y aprobó los filtros visibles en el teléfono; PR #18 integrado mediante `3898db8`, con `main` revalidado y rama local/remota eliminada.
- [x] F2: autor confirmó funcionamiento e integró PR #15 (`8e25dcd`) el 2026-09-14; rama local/remota eliminada. Cierre acotado a creación de notas/fechas.
- [x] Refrescos vecinos de F2: crear materia/sección y editar/eliminar fecha fueron probados en Android por el autor e integrados en [PR #19](https://github.com/jdfesa/lumapse/pull/19) el 2026-09-18 (`34b2900`), con regresiones SQLite/UI y recuperación solo de lectura. Mover/eliminar notas y otras acciones de materias/papelera permanecen como deuda media, a revisar con evidencia; este cierre no completa F3. [Plan y evidencia](docs/gestion/plan-refrescos-vecinos-2026-09-16.md).
- [x] F3: perfiles/ZIP de 50/500 notas, integración SQLite y protocolo aceptados e integrados en PR #16; confirmación general del teléfono recibida el 2026-09-15, sin nuevas muestras crudas ni identidad APK.
- [x] Identificación de build: smoke Acerca/navegación aceptado y merge/limpieza autorizados para PR #22. Fuente Android E5; cierre documental sin cambios de producto ni métricas F3. Integración comprobable en el PR, sin cierre cuantitativo de F3.
- [x] Cerrar la revisión documental de F3-1: [PR #28](https://github.com/jdfesa/lumapse/pull/28) integrado mediante `b646571`; ramas eliminadas, sin métricas cumplidas. [Postergación aceptada de RNF-002/004](BACKLOG.md#rendimiento-post-presentación) preservada.
  - [x] Verificar APK instalada y cargar/validar el fixture pequeño (50 notas), con respaldo recuperable (2026-10-04).
  - [x] Comprobar creación sintética y exportar dos trazas piloto; restablecer el fixture limpio. No son muestras de latencia/FPS aceptadas.
  - [x] Probar la atribución física con SurfaceFlinger/gfxinfo en el dispositivo: el display global expone periodos, pero la capa WebView de Lumapse no devuelve frames atribuibles.
  - [x] Cargar y comprobar el perfil `f3-500` (500 resultados) y ejecutar un recorrido exploratorio de scroll; no es FPS aceptado por falta de atribución física.
- [x] RNF-010: persistencia SQLite, migración y limpieza atómica verificadas; 1189 tests, CON-01–04 y Guardar/Descartar PASS en debug `dbc8940`. El autor confirmó funcionamiento en el teléfono y aprobó el cierre de [PR #29](https://github.com/jdfesa/lumapse/pull/29). [Resultados, aceptación y límites](docs/beta-core-validation/continuidad-2026-10-04.md). No repetir esta tarea ni las pruebas ya realizadas.
- [ ] Revisar y aceptar RNF-009/PR de `test/android-offline-core`: [OFF-01–05 PASS en debug `348da88`, fix del ZIP local y datos preservados](docs/beta-core-validation/offline-2026-10-06.md). No hay autorización de merge todavía.

Las series CRUD/FPS y la resolución de su método ya no son trabajo inmediato:
quedan en el [backlog post-presentación](BACKLOG.md#rendimiento-post-presentación),
con muestras y umbrales conservados. No se harán más pilotos en este frente.

## Checklist de trabajo

- [x] Completar la reconciliación editorial transversal de versión, hitos, alcance, arquitectura, requisitos, encuesta y métricas (checkpoint 2026-07-15).
- [x] Sincronizar las fuentes DOT, DBML y DDL con el schema vigente.
- [x] Ensamblar un checkpoint coherente de `INFORME-FINAL-COMPLETO.md` desde los capítulos fuente.
- [x] Exportar externamente, reemplazar, revisar visualmente e incorporar los gráficos de base de datos (2026-07-15).
- [x] Revisar el marco metodológico y la defensa: corregir Scrum 2017/2020, distinguir RUP y formalizar el flujo Kanban (2026-08-11).
- [x] Corregir AUD-001 y AUD-002: conservar borradores ante fallos, serializar guardados concurrentes y diferenciar el descarte (PR #2, 2026-09-01).
- [x] Corregir AUD-003: acotar y validar la importación ZIP, proteger jerarquías/renderizado y aprobar los checkpoints Android acumulativos (PR #3, 2026-09-02).
- [x] Completar la sincronización documental posterior a las auditorías en `CHANGELOG.md`, backlog, `TODO` e Hito 06 (2026-09-02).
- [x] Resolver AUD-004 en un PR separado: DOMPurify y siete dependencias de tooling parcheadas, auditorías 0/0, 955 tests, build, quality gate y Android 0.4.8/408 aprobados (2026-09-02).
- [x] Resolver AUD-007 en PR #6: contrato de errores de mutaciones unificado, límites UI adaptados, 989 tests, quality gate y prueba manual Android aprobados (2026-09-03).
- [x] Cerrar AUD-005 mediante PR #7: SHA de código validado `0832a75`, 1035 tests, gate y funcionamiento general Android aprobados. Ver [evidencia](docs/gestion/analisis-aud-005-coordinacion-sqlite-2026-09-04.md).
- [x] Cerrar AUD-006 en [PR #8](https://github.com/jdfesa/lumapse/pull/8): 1057 tests locales con un worker, controles individuales, aprobación Android, CI y merge trazados. Ver [evidencia](docs/gestion/analisis-aud-006-ownership-solicitudes-async-2026-09-05.md).
- [x] Ejecutar el gate final de `v0.5.0`: 67 archivos y 1065 tests aprobados con un worker; CI de PR #10 en verde y versiones web/Android verificadas como `0.5.0/500`.
- [x] APK firmada/publicada `v0.5.0` probada y aceptada por el autor en al menos tres dispositivos; [aceptación general canónica](docs/gestion/checklist-validacion-android.md#aceptación-general-de-la-apk-publicada-v050). Sin inventar resultados por caso/F3 ni volver a pedir esa prueba.
- [x] Corregir y validar la interacción `Mover a` en PR #9: destinos con toque normal, acciones de materia/sección visibles y cierre consistente de menús contextuales.
- [x] Incorporar TypeScript al reporte de coverage y volver a medir `RNF-024`: 92,43% de statements en `src/services/**` sobre la fuente actual (2026-08-21).
- [x] Reforzar `scripts/release-helper.py` para sincronizar y verificar `versionName`/`versionCode` Android con la versión declarada; aplicado en PR #10.
- [x] Sincronizar README, CHANGELOG, Hito 06, líneas base, velocidad, cheatsheet e informe académico con la publicación de `v0.5.0`.
- [x] Publicar y preservar la segunda beta `v0.5.0`.

### Antes del corte APK final — núcleo y riesgos

- [x] Ejecutar OFF-01–05 de funcionamiento offline (`RNF-009`): [PASS en debug identificado, revisión del autor pendiente](docs/beta-core-validation/offline-2026-10-06.md). `RNF-010` ya está verificado y aceptado en el debug registrado; conservar esa evidencia sin repetir la tarea cerrada.
- [ ] Registrar tráfico de red y revisar dependencias/trackers (`RNF-012`, `RNF-013`), distinguiendo transmisión automática de una exportación explícita del usuario.
- [ ] Ejecutar una prueba acotada de uso con estudiantes y revisar profundidad de navegación (`RNF-005`, `RNF-006`), sin inferir tiempos, éxito o adopción a partir de la encuesta o de las pruebas del autor.
- [ ] Revisar tipografía, touch targets, contraste, teclado cuando corresponda y nombres accesibles (`RNF-007`, `RNF-008`, `RNF-020` a `RNF-022`). Medir los criterios aplicables; la inspección visual o el checker estático no bastan para declararlos cumplidos.
- [ ] Resolver el método de `RNF-019`: ejecutar la medición prevista o acordar formalmente un tratamiento adecuado al APK; no atribuir un score Lighthouse inexistente.
- [ ] Clasificar los hallazgos: resolver bloqueantes confirmados y someter las observaciones menores o la evidencia incompleta a aceptación explícita, sin ampliar automáticamente el producto ni postergar otros RNF.

### Corte APK final — artefacto de presentación

- [ ] Repetir `npm run verify`, auditorías completa/productiva y coverage de servicios en el corte candidato; registrar resultados reales, no reutilizar cifras históricas como mediciones nuevas.
- [ ] Generar y validar el nuevo APK autorizado (objetivo `0.6.0+`); fijar fuente, versión/code, canal, firma y hash, preservar las betas publicadas y registrar la revisión Android pertinente sobre ese binario exacto.

### Después del APK validado — cierre académico y defensa

- [ ] Emitir la matriz RNF final con requisito, método, comando, dispositivo, fecha, artefacto, resultado, evidencia y limitaciones aceptadas; mantener CRUD/FPS pendientes y diferidos según el backlog.
- [ ] Incorporar el corte y la evidencia final en los capítulos fuente del informe; revisar coherencia, referencias y diagramas antes de congelar y ensamblar.
- [ ] Contrastar los metadatos bibliográficos de Gómez (2014) y Parada (2026) contra los originales de cátedra y cerrar la sección de referencias.
- [ ] Revisar el manual externo de `v0.5.0` informado por el autor y adaptarlo al APK final, con capturas coherentes y límites de backup/borradores/papelera. Su existencia no acredita que ya esté actualizado o revisado.
- [ ] Revisar PDF, tablas y legibilidad de figuras; dejar informe y manual preparados para la entrega.
- [ ] Alinear GitHub Projects con la Definition of Workflow: WIP global 2, bloqueos y fechas reales `startedAt`/`finishedAt`, sin reconstruir tiempos inexistentes.
- [ ] Registrar el factor de ajuste solo si hay datos fiables, o declarar la limitación de medición; redactar recomendaciones para futuras cohortes sin inventar métricas.
- [ ] Preparar y ensayar presentación, guion de demo, respuestas de defensa y contingencia; reservar tiempo del autor para estudiar el proyecto.
- [ ] Fijar la línea base final: APK, matriz, informe, manual y demo identifican el mismo corte.

Las mediciones CRUD/FPS, los refactors y las demás mejoras no comprometidas quedan
en el [backlog postdefensa](BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa), no como
una lista adicional de trabajo inmediato. La revisión acotada de otros RNF sigue
pendiente: cualquier limitación o postergación nueva exige una decisión explícita.

## Criterios de salida de Hito 06

- Documentación técnica y académica revisada y congelada.
- Manual de usuario revisado y adaptado al artefacto final.
- Diagramas de base de datos exportados y consistentes con el schema real.
- Quality gate y validación Android final sin bloqueantes abiertos.
- Matriz RNF final emitida, con estados verificados, parciales, obsoletos o no aplicables sustentados por evidencia.
- Observaciones menores documentadas con decisión explícita.
- Presentación y demo preparadas.
- Artefacto, hash, versión y línea base final inequívocos.

## Observaciones heredadas no bloqueantes

- `Mover a`: la fricción observada en la primera beta fue corregida y validada en PR #9; queda como antecedente resuelto, no como bloqueo abierto.
- Rendimiento: la importación funcional de 500 notas fue aprobada; CRUD/FPS permanecen pendientes y diferidos a post-presentación por el autor. No bloquean la entrega por esa ausencia ni prueban rendimiento óptimo.

Estas observaciones forman parte de la validación final; las reglas de alcance que las gobiernan están centralizadas en [`BACKLOG.md`](BACKLOG.md#política-de-alcance--hito-06).
