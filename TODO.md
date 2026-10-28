# TODO — Lumapse

> Tablero operativo breve. La deuda y las políticas viven en [`BACKLOG.md`](BACKLOG.md); el marco del hito está en [`docs/hitos/hito-06-octubre.md`](docs/hitos/hito-06-octubre.md) y el cierre anterior en [`docs/hitos/hito-05-septiembre.md`](docs/hitos/hito-05-septiembre.md).

## Hito actual: 06 — Entrega Final

**Estado:** activo; AUD-001 a AUD-007 quedaron cerrados e integrados mediante PR #2, #3 y #5 a #8. La pre-release `v0.5.0` incorpora esos cierres, las correcciones táctiles de PR #9 y el tooling de release de PR #10.

**Corte operativo vigente:** [`v0.6.0 — Release Candidate 1`](https://github.com/jdfesa/lumapse/releases/tag/v0.6.0), publicada como Pre-release, aceptada con validación parcial y desarrollo congelado hasta después de la presentación académica oficial.

**Versión publicada:** `v0.6.0/600`, tag sobre `ac2a747`; APK de fuente `bcefe6a`, SHA-256 `15f8ede5b78387e3fcac1a53eb3bc78dbb1e30df9acf7f4f20c771c48739e042`. No recompilar ni reemplazar el artefacto. `v0.5.0/500` se conserva como beta histórica inmutable.

**Objetivo vigente:** desarrollo congelado → revisión final del [manual de usuario 0.6.0](docs/manual-de-usuario-0.6.0/manual-de-usuario-lumapse.html) incorporado → luego informe final y defensa. Sólo documentación hasta después de la presentación académica oficial; sin cambios de código, funcionalidades, dependencias o configuración que afecte la app y sin nuevas comprobaciones de la APK. No se promete estabilidad ni adopción real.

**Recorte de cierre acordado:** [imprescindibles, límites y deuda postdefensa](BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa). Este tablero registra acciones, no certifica cumplimiento: una casilla pendiente o una postergación no se convierte en evidencia. Los estados RNF permanecen en su [fuente canónica](docs/producto/requisitos-no-funcionales.md).

## Prioridad inmediata — plan aceptado

**Informe final:** seguimiento del tratamiento final en la
[lista por capítulo](#revisión-del-informe-capítulo-por-capítulo).

**Revisión documental previa — completada:** README principal, estructura y
guías vigentes reconciliados con la RC1 y el manual publicado en
[PR #45](https://github.com/jdfesa/lumapse/pull/45). No se trasladó esa revisión a
los capítulos ni se modificaron resultados históricos.

**Decisión de congelación — 2026-10-22:** el autor acepta la RC1 tal como está y
su cobertura parcial; se publica sin completar los controles restantes. Núcleo
offline, organización/búsqueda, fechas, ZIP y tráfico/trackers quedan **diferidos,
no aprobados**, conforme a la [decisión canónica](BACKLOG.md#congelación-académica--2026-10-22).
No más código ni pruebas del binario antes de la presentación. Esta decisión
reemplaza el requisito previo de completar esos controles para publicar/congelar.
No convertir el manual o el informe en otra ronda de pruebas o correcciones.

**Candidato autorizado — 2026-10-22:** preparar `0.6.0/600` como Release Candidate 1
en `chore/presentation-rc1`, sin mejoras nuevas. El autor autorizó generar la APK
y recuperar la firma de distribución existente en almacenamiento temporal privado.
APK inicial generada y firmada desde `3068455`; después se autorizó corregir solo
la etiqueta confusa de Acerca de y aplicar DOMPurify 3.4.17. La APK vigente procede
de `bcefe6a`, con gate/auditorías, firma y etiqueta Android comprobados. Identidad y pendientes se registran en el
[registro del candidato](docs/gestion/candidato-apk-0.6.0.md).
Después, el autor autorizó preparar la beta pública `0.5.0` en el teléfono y
actualizar a la RC1 sin borrar/restaurar desde esa referencia: actualización,
apertura y conservación del conjunto de prueba PASS en el APK inicial. La
actualización posterior al corregido también conservó todas las tablas y el borrador.
El autor aceptó PR #42, integrado en `ac2a747` con sus ramas eliminadas. La decisión
posterior acepta la validación parcial, difiere los controles restantes y congela
el desarrollo; `v0.6.0` ya está publicada, sin inferir resultados nuevos por caso.

**Revisión precorte — 2026-10-22:** `test/pre-cut-acceptance` reúne la
[clasificación y los cinco criterios concretos de corte](docs/gestion/revision-precorte-2026-10-22.md).
Se corrigen el hover de «Agregar fecha» y el tooling afectado de Vite/Vitest.
El incidente de firma/desinstalación PC-11 motivó una ampliación expresa: datos
recuperados por hash y protección del script contra borrados implícitos; actualización
compatible comprobada, con tablas/borrador/preferencias conservados. No se retoman tareas diferidas. La revisión ADR está documentada.
El autor aceptó [PR #41](https://github.com/jdfesa/lumapse/pull/41) y ordenó merge
y limpieza de sus ramas una vez comprobada la integración. Aceptación general
con los límites documentados, sin nuevos resultados manuales por caso. Al cerrar
ese PR no se había generado ni autorizado el APK final; la autorización posterior
del candidato está registrada arriba. No abrir otra ronda de mejoras por rutina.

**Revisión acotada aceptada — RNF-019 (2026-10-20):** resolver el método y la
evidencia de Lighthouse Accessibility en `test/rnf-019-lighthouse-accessibility`,
con [alcance, preparación y criterios](docs/gestion/validacion-lighthouse-rnf-019-2026-10-20.md).
Medición técnica completada: 40 snapshots en ambos temas (96–100/100) del debug
`92deffd`, etiquetas corregidas y datos conservados. El autor aprobó el
[PR #40](https://github.com/jdfesa/lumapse/pull/40) y autorizó merge a `main` y
limpieza de sus ramas integradas. Aceptación general con los límites documentados,
sin nuevas pruebas manuales por caso ni autorización del APK final. Las observaciones
se clasificaron en la revisión precorte indicada arriba, aceptada en PR #41;
confirmación general, sin reformular la métrica ni abrir más correcciones automáticamente.

**Revisión acotada aceptada — RNF-020 (2026-10-19):** navegación por teclado en
[PR #39](https://github.com/jdfesa/lumapse/pull/39), con [plan, evidencia y límites](docs/gestion/validacion-teclado-rnf-020-2026-10-19.md).
El autor aprobó rama, commits en inglés y PR; teléfono local y entrada mediante
ADB autorizados, sin teclado físico. Debug `538c906` con 16 casos PASS, gate de
1206 tests de app/92 de tooling y datos/borrador conservados. RNF-020 permanece en
evidencia parcial: no se certifican hardware ni mutaciones completas. El autor
revisó y aprobó el PR y autorizó merge a `main` y limpieza de sus ramas integradas;
integración comprobable en GitHub. Aceptación general, sin nuevas pruebas manuales
por caso; no incluye RNF-019 ni APK final.

**Cierre de nombres accesibles aceptado — 2026-10-13:** `RNF-022` en
[PR #38](https://github.com/jdfesa/lumapse/pull/38), exclusivamente nombres y
alternativas accesibles. [24 escenas/2188 muestras AX del debug `b7c3d31`,
correcciones y límites](docs/gestion/validacion-nombres-accesibles-rnf-022-2026-10-13.md).
El autor aceptó el PR y autorizó integración a `main` y limpieza de las ramas
integradas; integración comprobable en GitHub. Aceptación general, sin nuevas
pruebas manuales por caso. No acredita teclado/Lighthouse ni autoriza APK final
u otro frente; se conserva el plan de cierre vigente.

**Ajuste aprobado — 2026-10-12:** se sigue el flujo de cierre anterior y el
[recorte vigente](BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa). `RNF-005` pasa
a evaluación posterior al corte, no bloqueante; conserva estado pendiente y
umbral, sin inferir tiempos de una encuesta. No se esperan respuestas para
congelar ni preparar manual/informe, y el feedback no abre correcciones o ramas
automáticamente. La versión y la generación del APK aún requieren acuerdo.

**Cierre de contraste aceptado — 2026-10-12:** `RNF-021` en
[PR #37](https://github.com/jdfesa/lumapse/pull/37), exclusivamente contraste del
texto en ambos temas. Corrección mínima verificada en debug `803947e`, regresiones
y evidencia Android completadas en el alcance del
[reporte](docs/gestion/validacion-contraste-rnf-021-2026-10-12.md).
El autor aceptó el PR y autorizó integración a `main` y limpieza de las ramas
integradas; integración comprobable en GitHub. Aceptación general, sin nuevas
pruebas manuales por caso. No se abre otro frente ni se autoriza una APK de entrega:
después del cierre se continúa la conversación sobre el corte y la congelación,
antes de comenzar el manual y el informe final.

**Prerrequisito de seguridad cerrado (2026-10-02):** el autor aceptó los cambios nuevos instalados en Samsung y autorizó integrar [PR #21](docs/gestion/validacion-parches-dependencias-2026-10-02.md), fusionado mediante `5ef1f911`; rama eliminada y `main` sincronizado. Aceptación general, sin resultados manuales por caso ni mediciones nuevas. No cambia versión ni completa F3.

El [plan de desarrollo inmediato de la beta](docs/gestion/plan-desarrollo-inmediato-beta-2026-09-12.md) fue aceptado e integrado en PR #13. **F1 y F2 aprobadas e integradas** en PR #14 (`7d4ceda`) y PR #15 (`8e25dcd`). **Preparación F3 aceptada e integrada** en PR #16 (`90fd21e`) tras la confirmación general del teléfono; ramas eliminadas. [Protocolo, fixtures y matriz](docs/beta-core-validation/README.md): las métricas Android siguen pendientes, sin declarar F3 cerrada.

**Cierre de tipografía aceptado:** `RNF-007` en [PR #36](https://github.com/jdfesa/lumapse/pull/36), un único objetivo. Ajuste y mediciones de lectura/edición verificados en debug `f2beef7`; [resultados, artefacto y límites](docs/gestion/validacion-tipografia-rnf-007-2026-10-09.md). El autor aceptó el PR y autorizó merge y limpieza de su rama el 2026-10-09; integración comprobable en GitHub. Aceptación general, sin nuevos resultados manuales por caso; no se reabre esta unidad.

**Cierre offline aceptado:** flujos offline (`RNF-009`) en [PR #31](https://github.com/jdfesa/lumapse/pull/31): el autor aceptó el PR el 2026-10-06 y autorizó merge y limpieza. [Artefacto, resultados y límites](docs/beta-core-validation/offline-2026-10-06.md). El cierre de `RNF-010` en PR #29 se conserva sin repetirlo.
**Sesión 1 RNF-002/004: métricas diferidas a post-presentación** por decisión del autor
(2026-10-04), sin cumplimiento cuantitativo ni bloqueo de entrega por esta ausencia.
Control/exportación comprobados;
[evidencia canónica](docs/beta-core-validation/README.md#evidencia-de-la-sesión-1).
[PR #23](https://github.com/jdfesa/lumapse/pull/23) se acota a evidencia/retirada experimental. RNF-009 **verificado en debug `348da88` y aceptado en PR #31**; RNF-010 **verificado y aceptado**, [diagnóstico, corrección y cierre](docs/beta-core-validation/continuidad-2026-10-04.md);
seguir el [ajuste de prioridad vigente](docs/gestion/plan-desarrollo-inmediato-beta-2026-09-12.md#ajuste-de-prioridad-aprobado--2026-10-04).
Los filtros quedaron cerrados en PR #18 (`3898db8`); no sustituyen F3.

| Orden | Frente | Criterio de cierre |
|---|---|---|
| F1 | Gate portable — AUD-008/AUD-009 | Node 22.20.0/npm 10.9.3 fijados y mismo `verify` local/CI, sin depender de workaround, binario ignorado o falsos positivos CSP |
| F2 | Creación confirmada — AUD-014 | No duplicar notas/fechas al fallar una recarga posterior a la escritura; regresiones y smoke Android |
| F3 | Validación del núcleo | Preparación de 500 notas preservada; CRUD/FPS pendientes en backlog post-presentación. RNF-009 verificado en debug `348da88` y aceptado en PR #31; RNF-010 verificado y aceptado en debug identificado, sin cierre global de F3 |

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
- [x] Revisar y aceptar RNF-009/[PR #31](https://github.com/jdfesa/lumapse/pull/31): [OFF-01–05 PASS en debug `348da88`, fix del ZIP local y datos preservados](docs/beta-core-validation/offline-2026-10-06.md). El autor aceptó el PR y autorizó merge/limpieza el 2026-10-06; integración comprobable en GitHub.

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

- [x] Ejecutar OFF-01–05 de funcionamiento offline (`RNF-009`): [PASS en debug identificado, aceptados en PR #31](docs/beta-core-validation/offline-2026-10-06.md). `RNF-010` ya está verificado y aceptado en el debug registrado; conservar esa evidencia sin repetir la tarea cerrada.
- [x] Remediar los advisories actuales de dependencias: `@capacitor/android`/`core` 8.5.2 y `source-map-js` 1.2.2; auditorías completa/productiva en 0/0. [Evidencia y límites](docs/gestion/validacion-parche-capacitor-2026-10-07.md). Esto no cierra la captura de tráfico ni `RNF-012/013`.
- [x] Registrar tráfico de red y revisar trackers durante los flujos capturados (`RNF-012`, `RNF-013`): [PASS en debug `0.5.0/500`, 2026-10-07](docs/gestion/validacion-trafico-trackers-2026-10-07.md). La evidencia debe repetirse sobre el APK candidato final.
- [x] Revisar la profundidad de entrada de crear, buscar y organizar (`RNF-006`) en el debug `0.5.0/500`, con evidencia de rutas de 0–2 taps y límites explícitos. [Registro](docs/gestion/validacion-usabilidad-navegacion-2026-10-07.md).
- [x] Verificar touch targets principales (`RNF-008`) en Android mediante medición de límites renderizados ≥44×44 CSS px. [Evidencia y límites](docs/gestion/validacion-touch-targets-rnf-008-2026-10-08.md).
- [x] Medir y ajustar tipografía de lectura/edición (`RNF-007`): ≥16 CSS px en editor/feed, Markdown y enfoque del debug `f2beef7`, con [evidencia y límites](docs/gestion/validacion-tipografia-rnf-007-2026-10-09.md). El autor aceptó [PR #36](https://github.com/jdfesa/lumapse/pull/36) y autorizó merge/limpieza, sin dar por probado el APK final.
- [x] Medir y corregir contraste de texto en ambos temas (`RNF-021`): [208 fixtures, placeholders y recorridos Android](docs/gestion/validacion-contraste-rnf-021-2026-10-12.md) ≥4,5:1 en el debug `803947e`; el autor aceptó PR #37 y autorizó merge/limpieza, sin nuevas pruebas por caso ni transferencia al APK final.
- [x] Verificar nombres/alternativas accesibles (`RNF-022`): [24 escenas y 2188 muestras AX](docs/gestion/validacion-nombres-accesibles-rnf-022-2026-10-13.md) del debug `b7c3d31`, con correcciones mínimas y datos conservados. El autor aceptó [PR #38](https://github.com/jdfesa/lumapse/pull/38) y autorizó merge/limpieza; aceptación general sin nuevas pruebas por caso. No verifica TalkBack, teclado/Lighthouse ni el APK final.
- [x] Ejecutar la revisión acotada de teclado (`RNF-020`): [16 casos PASS y límites](docs/gestion/validacion-teclado-rnf-020-2026-10-19.md) en debug `538c906`; evidencia parcial conservada, sin teclado físico ni mutaciones completas. El autor revisó y aprobó PR #39 y autorizó merge/limpieza; aceptación general sin nuevas pruebas por caso ni autorización del corte.
- [x] Ejecutar la medición de `RNF-019`: [40 snapshots Lighthouse 96–100/100](docs/gestion/validacion-lighthouse-rnf-019-2026-10-20.md) en el WebView del debug `92deffd`, ambos temas y sin errores de Lighthouse. Se conserva el umbral ≥90, con hallazgos de controles cubiertos y revisión incompleta explícitos; el autor aprobó PR #40 y autorizó merge/limpieza, sin nuevas pruebas por caso ni certificar accesibilidad global o el APK final. La clasificación posterior está en el [reporte de precorte](docs/gestion/revision-precorte-2026-10-22.md); aceptación general del autor en PR #41, sin nuevas pruebas por caso.
- [x] Clasificar observaciones Lighthouse/teclado y revisar trazabilidad ADR: [evidencia y tratamiento PC-01–10](docs/gestion/revision-precorte-2026-10-22.md), sin reabrir lo diferido.
- [x] Cerrar técnicamente PC-11: instalador protegido y actualización debug compatible sin pérdida de tablas, borrador ni preferencias; [artefacto/evidencia](docs/gestion/revision-precorte-2026-10-22.md#debug-definitivo-y-comprobación-posterior-a-la-recuperación). La actualización del candidato firmado sigue siendo obligatoria.
- [x] El autor acepta PR #41 con los límites documentados y autoriza merge/limpieza después de comprobar integración. Aceptación general sin nuevos resultados manuales por caso; conservar la evidencia del debug y los controles del candidato pendientes.

### Corte APK final — artefacto de presentación

Se conserva la evidencia de los [criterios originales](docs/gestion/revision-precorte-2026-10-22.md#no-negociables-y-decisión-de-corte).
La aceptación parcial y congelación explícitas reemplazan la repetición pendiente
de controles como condición de publicación. No abrir otra ronda técnica.

- [x] Repetir `npm run verify`, auditorías completa/productiva y coverage de servicios en la fuente candidata `0.6.0/600`: 1211 tests de app/105 de tooling, auditorías 0/0 y servicios 96,06%; [resultados del corte](docs/gestion/candidato-apk-0.6.0.md#controles-de-la-fuente-candidata), sin atribuir pruebas Android todavía no ejecutadas.
- [x] Generar el APK autorizado `0.6.0/600` (RC1), corregido desde fuente limpia `bcefe6a` por etiqueta neutral y parche DOMPurify autorizado; gate final de 1214 tests de app/105 tooling y auditorías 0/0. Firma original, manifest no-debuggable, canal, assets, hash y etiqueta Android comprobados. [Identidad vigente y evidencia inicial preservada](docs/gestion/candidato-apk-0.6.0.md#binario-corregido). Publicación posterior registrada abajo.
- [x] Probar actualización real desde la APK pública `0.5.0/500` a la RC1 exacta: apertura, cinco notas con estados, materia/sección, fecha académica, borrador y tema conservados; [filas/hashes y límites](docs/gestion/candidato-apk-0.6.0.md#actualización-pública-050-a-060--2026-10-22). Sin desinstalar, limpiar, importar ni restaurar desde la referencia pública.
- [x] Verificar actualización del candidato inicial al corregido, con todas las filas y el borrador idénticos, y comprobar Acerca de en el teléfono. El autor acepta PR #42 y autoriza merge/limpieza; no acredita los controles restantes ni publica el APK.
- [ ] **Diferido hasta después de la presentación:** recorridos restantes del núcleo offline/organización/búsqueda/fechas/ZIP y tráfico/trackers sobre ese APK exacto. No ejecutarlos durante el congelamiento ni marcarlos como aprobados.
- [x] Aceptación expresa de la RC1 con validación parcial y congelación del desarrollo hasta después de la presentación académica oficial. Sólo documentación; sin nuevos cambios o comprobaciones de app, sin recompilar ni sustituir APK.
- [x] Publicar `v0.6.0` como Pre-release: `Lumapse v0.6.0 — Release Candidate 1`, con APK y checksum existentes. Publicación comprobada por metadatos de GitHub el 2026-10-22; sin nueva prueba o descarga del binario.

### Feedback posterior al corte — no bloqueante

- [ ] Distribuir el APK de presentación a compañeros y otros usuarios e invitar a una encuesta voluntaria; registrar versión, fecha y resultados disponibles, sin condicionar manual, informe o defensa a recibir respuestas.
- [ ] Recoger observaciones sobre primera nota (`RNF-005`), funcionalidad y fricciones. El umbral ≤10 s sigue pendiente si no se realiza una medición específica; opiniones no acreditan tiempos ni adopción.
- [ ] Incorporar, cuando se reciban, las observaciones de los dos docentes que el autor informa están probando `v0.5.0`; atribuirlas a esa versión, no al APK posterior. Documentar hallazgos y trabajo futuro sin reabrir automáticamente el desarrollo.

### Después del APK aceptado con límites — cierre académico y defensa

El avance del informe se registra en la
[lista por capítulo](#revisión-del-informe-capítulo-por-capítulo).
La revisión final del manual conserva su pendiente. Sólo documentación, utilizando
el corte publicado y la evidencia existente; no se reabre desarrollo ni se generan
pruebas para completar métricas pendientes.

- [ ] Completar la revisión final del [manual de usuario 0.6.0](docs/manual-de-usuario-0.6.0/manual-de-usuario-lumapse.html) incorporado, con sus capturas y aclaraciones de backup, borradores y papelera, antes de congelarlo para la entrega.
- [ ] Emitir la matriz RNF final con requisito, método, comando, dispositivo, fecha, artefacto, resultado, evidencia y limitaciones aceptadas; mantener CRUD/FPS pendientes y diferidos según el backlog.
- [ ] Incorporar el corte y la evidencia final en los capítulos fuente del informe; revisar coherencia, referencias y diagramas antes de congelar y ensamblar.
- [ ] Contrastar los metadatos bibliográficos de Gómez (2014) y Parada (2026) contra los originales de cátedra y cerrar la sección de referencias.
- [x] **Cronología del relevamiento:** aproximadamente dos días naturales, en horario de Argentina; cierre al alcanzar 121 respuestas, sin afirmar horas exactas de apertura o cierre.
- [ ] Revisar PDF, tablas y legibilidad de figuras; dejar informe y manual preparados para la entrega.
- [ ] Alinear GitHub Projects con la Definition of Workflow: WIP global 2, bloqueos y fechas reales `startedAt`/`finishedAt`, sin reconstruir tiempos inexistentes.
- [ ] Registrar el factor de ajuste solo si hay datos fiables, o declarar la limitación de medición; redactar recomendaciones para futuras cohortes sin inventar métricas.
- [ ] Preparar y ensayar presentación, guion de demo, respuestas de defensa y contingencia; reservar tiempo del autor para estudiar el proyecto.
- [ ] Fijar la línea base final: APK, matriz, informe, manual y demo identifican el mismo corte.

Las mediciones CRUD/FPS, los refactors y las demás mejoras no comprometidas quedan
en el [backlog postdefensa](BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa), no como
una lista adicional de trabajo inmediato. Las comprobaciones restantes del candidato
se difieren por decisión expresa del autor; la falta de cobertura debe reflejarse
en la matriz, manual, informe y defensa, sin inventar resultados ni reabrir pruebas.

### Revisión del informe capítulo por capítulo

- [x] **[Capítulo 1 — Introducción y Planteo del Problema](docs/informe-final/01-introduccion.md):** aprobado e integrado en [PR #46](https://github.com/jdfesa/lumapse/pull/46); rama eliminada.
- [x] **[Capítulo 2 — Marco Metodológico y Modelo de Negocio](docs/informe-final/02-marco-metodologico.md):** aprobado e integrado en [PR #48](https://github.com/jdfesa/lumapse/pull/48); rama eliminada.
- [x] **[Capítulo 3 — Relevamiento y Análisis de Datos](docs/informe-final/03-relevamiento-datos.md):** aprobado e integrado en [PR #49](https://github.com/jdfesa/lumapse/pull/49).
- [x] **[Capítulo 4 — Arquitectura y Diseño](docs/informe-final/04-arquitectura-diseno.md):** aprobado e integrado en [PR #50](https://github.com/jdfesa/lumapse/pull/50); rama eliminada.
- [x] **[Capítulo 5 — Desarrollo e Implementación](docs/informe-final/05-desarrollo-implementacion.md):** revisado contra la fuente RC1 y aprobado; cambios en [PR #51](https://github.com/jdfesa/lumapse/pull/51).
- [ ] **[Capítulo 6 — Pruebas y Validación](docs/informe-final/06-pruebas-validacion.md):** pendiente.
- [ ] **[Capítulo 7 — Conclusiones](docs/informe-final/07-conclusiones.md):** pendiente.
- [ ] **[Referencias — archivo 08](docs/informe-final/08-referencias.md):** pendiente; completar la correspondencia bibliográfica, incluida la GPLv3 citada en la sección 5.7.
- [ ] **Revisión transversal, metadatos y ensamblado final:** pendientes hasta completar la revisión e integración de todos los capítulos y las referencias.
- [ ] **Maquetación LaTeX/PDF y revisión de presentación:** pendientes del contenido consolidado.

## Criterios de salida de Hito 06

- Documentación técnica y académica revisada y congelada.
- Manual de usuario revisado y adaptado al artefacto final.
- Diagramas de base de datos exportados y consistentes con el schema real.
- Quality gate y evidencia Android existentes trazados; aceptación parcial y comprobaciones diferidas explícitas, sin exigir nuevas pruebas ni afirmar validación exhaustiva.
- Matriz RNF final emitida, con estados verificados, parciales, obsoletos o no aplicables sustentados por evidencia.
- Observaciones menores documentadas con decisión explícita.
- Presentación y demo preparadas.
- Artefacto, hash, versión y línea base final inequívocos.

## Observaciones heredadas no bloqueantes

- `Mover a`: la fricción observada en la primera beta fue corregida y validada en PR #9; queda como antecedente resuelto, no como bloqueo abierto.
- Rendimiento: la importación funcional de 500 notas fue aprobada; CRUD/FPS permanecen pendientes y diferidos a post-presentación por el autor. No bloquean la entrega por esa ausencia ni prueban rendimiento óptimo.

Estas observaciones forman parte de la validación final; las reglas de alcance que las gobiernan están centralizadas en [`BACKLOG.md`](BACKLOG.md#política-de-alcance--hito-06).
