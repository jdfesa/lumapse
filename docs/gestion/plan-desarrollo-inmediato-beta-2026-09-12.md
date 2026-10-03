# Plan de desarrollo inmediato de la beta — 2026-09-12

**Estado:** Plan aceptado e integrado mediante [PR #13](https://github.com/jdfesa/lumapse/pull/13), `65e5767`. F1 y F2 aprobadas e integradas en PR #14 (`7d4ceda`) y PR #15 (`8e25dcd`). Preparación F3 aceptada e integrada en PR #16 (`90fd21e`) tras confirmación general del teléfono el 2026-09-15; ramas eliminadas. Las métricas Android siguen pendientes, sin declarar F3 cerrada. [Evidencia y límites de F2](./validacion-f2-guardado-y-refresco-2026-09-13.md); [preparación y matriz F3](../beta-core-validation/README.md).

**Rama documental original:** `docs/immediate-beta-plan`, integrada y eliminada.

**Base inspeccionada original:** `origin/main` en `91723d6` (2026-09-07), posterior a la publicación de `v0.5.0`. Para el frente actual: `5ef1f911d593f7fbd689d304432bfed47586fff6`, posterior al merge de PR #21.

**Horizonte original:** tres a cuatro sesiones. La continuidad aprobada vigente se limita a las dos sesiones descritas abajo, después del frente de identificación de build; no promete la entrega final en ellas.

**Responsable:** autor del proyecto, con asistencia técnica; la aceptación y el merge requieren su autorización.

## 1. Decisión aceptada

Trabajar en **tres entregables secuenciales y revisables**: hacer reproducible la verificación sobre Node 22.20.0/npm 10.9.3, corregir una ambigüedad de guardado confirmada y medir/validar el núcleo en Android. No agregar funcionalidades ni cambiar de arquitectura.

**F1 fue la primera tarea y quedó integrada en PR #14 tras la aceptación explícita del autor. F2 comenzó después de actualizar `main` y limpiar esa rama.** Se conserva el orden F1 → F2 → F3; ninguna fase abre un segundo frente durante la revisión.

El plan descompone el frente de **validación final de Hito 06**. No reemplaza el cierre académico de Prácticas Profesionalizantes III: bibliografía, maquetación, pruebas con estudiantes y defensa siguen pendientes. Tampoco promete `1.0.0`: una versión estable se decidirá después de reunir evidencia y aceptar explícitamente las limitaciones, en un corte separado.

## 2. Qué se revisó y qué no

Se partió de [`README.md`](../../README.md), [`BACKLOG.md`](../../BACKLOG.md), [`TODO`](../../TODO), [Hito 06](../hitos/hito-06-octubre.md), la [auditoría anterior](./revision-tecnica-priorizada-2026-09-01.md), los [RNF](../producto/requisitos-no-funcionales.md) y las reglas de contribución. La inspección de código fue acotada a cambios recientes y a las dependencias necesarias para contrastar sus pendientes:

| Recorte | Archivos y motivo |
|---|---|
| Cambios del 6–7 de septiembre | README y presentación de capturas/video; no cambian el runtime |
| AUD-007, 3 de septiembre | `NoteStore.data.js`, `NoteStore.errors.js`, `NoteEditor.js`, `AcademicEventDialog.js` y tests asociados: contrato de errores y confirmación de guardado |
| AUD-005, 4 de septiembre | `sqlite/connection.js`, CRUD de notas/eventos, `SubjectService.crud.ts`/`SubjectService.trash.ts` y harness SQLite: persistencia, recargas y conteos |
| AUD-006 y correcciones táctiles, 5 de septiembre | `NoteStore.academicEvents.js`, `TrashRequestOwner.js`, fragmentos/diffs de Heatmap, feed, drawer y sus tests: conservar protecciones recientes |
| Dependencias del gate y de la medición | `package.json`, `vitest.config.js`, setup de tests, `.github/workflows/lint.yml`, `scripts/quality.sh`, auditor offline Shell/Rust, smoke SQLite y scripts existentes de datos/carga |

No se realizó una auditoría integral del repositorio, un pentest, una nueva consulta de advisories, una instalación Android ni una medición de rendimiento nativo. No se leyeron bases personales ni se ejecutaron los generadores de datos antiguos. Las conclusiones siguientes separan hechos comprobados de riesgos pendientes de medición.

## 3. Diagnóstico vigente

La tabla conserva el diagnóstico de base del 2026-09-12. El seguimiento actual está en la cabecera y en los reportes de F1/F2; no presentar los defectos ya corregidos en la rama como evidencia de su estado anterior.

| Frente | Evidencia en la base revisada | Clasificación y decisión |
|---|---|---|
| AUD-001 a AUD-007 y `Mover a` | Sus correcciones están integradas en `v0.5.0`; el código reciente conserva single-flight, propagación de errores y ownership de solicitudes | **Cerrados.** Mantener sus regresiones; no reabrirlos por una recomendación histórica |
| AUD-008: gate local/CI | El fallback offline rechaza las dos entradas `http://localhost` del CSP. CI ejecuta una lista propia que omite typecheck, offline, toolchain y DB smoke; `verify` tampoco incluye el DBML que CI sí controla | **Confirmado. F1.** Unificar la unión de controles, no su mínimo común |
| AUD-009: entorno Node | README ofrecía `v22+`, CI fija 22 y no existe archivo de versión. En Node 26.7.0, sin `NODE_OPTIONS`, la suite con un worker falla 60 tests por `localStorage` indefinido | **Confirmado. F1.** La decisión vigente fija Node 22.20.0/npm 10.9.3, ya registrados en la evidencia de la Mac canónica; no ampliar ahora la matriz a Node 26 |
| AUD-014: escritura confirmada presentada como fallo | Dos caracterizaciones sobre SQLite en memoria prueban que crear una nota/fecha, fallar su lectura secundaria y reintentar deja dos filas con IDs distintos | **Nuevo defecto confirmado, P1. F2.** Separar persistencia de actualización de datos derivados |
| AUD-010/AUD-011: notificaciones y conteos | `createNote`, `moveNote` y `deleteNote` encadenan loaders notificantes y otra notificación; `getSubjectTree`/`getTrashItems` conservan conteos secuenciales por contenedor | **Patrones confirmados; impacto temporal no medido. F3 mide, no optimiza por intuición** |
| Smoke de base de datos | Ejecuta el DDL actual, pero `EXPECTED_TABLES`/`EXPECTED_COLUMNS` y las aserciones de relaciones no exigen `academic_events`, sus índices ni su `CHECK(type)` | **Brecha de cobertura**, ya registrada en backlog; no demuestra un defecto del schema. No presentarlo como validación exhaustiva |
| Herramientas de carga heredadas | `generate-mock-data.py` genera 100 notas aleatorias con columnas antiguas (`created_at`, `is_pinned`, etc.) hacia `src/store/migrations`; `run-load-tests.py` mide DP-001 en Python/SQLite en memoria con durabilidad desactivada | **No son evidencia RNF-002/RNF-004 del APK.** F3 requiere fixture compatible y medición nativa |
| AUD-012/AUD-013 | Cohesión, tamaño de archivos, bundle y coverage siguen como deuda/monitoreo | No abrir migración de UI, refactor masivo ni ampliación de coverage en este ciclo |

### AUD-014: secuencia causal y límites de la prueba

1. `NoteStore.data.createNote()` espera la inserción, agrega la nota a `state.notes` y después espera `loadSubjects()`, todavía dentro de `runStoreAction()`.
2. Si esa lectura falla, la promesa rechaza aunque la fila ya exista. `NoteEditor.handleSave()` no llega al descarte del borrador y vuelve a habilitar el botón; el siguiente intento vuelve a crear.
3. `NoteStore.academicEvents.createAcademicEvent()` tiene la misma frontera con `reloadUpcomingAcademicEvents()`. El diálogo permanece abierto ante rechazo.
4. Las dos reproducciones usan servicios y coordinador reales, el DDL vigente y `sql.js`; el harness reemplaza el plugin nativo e inyecta un fallo de lectura. Un `SELECT` prueba una fila después del rechazo y dos después del reintento.

Esto **no demuestra pérdida de datos, frecuencia del fallo en teléfonos ni una transacción SQLite defectuosa**. Confirma una señal de resultado incorrecta y duplicación por reintento en esos dos caminos. AUD-001/AUD-002 cubrieron fallo de escritura y taps simultáneos; no este fallo posterior a una escritura exitosa. La [reproducción autocontenida](#8-reproducción-de-aud-014) conserva la evidencia sin agregar tests permanentes antes de aprobar la implementación.

## 4. Secuencia de las próximas sesiones

### Continuidad aprobada — 2026-10-02

El autor aprobó las próximas **dos sesiones**, los ajustes mínimos de documentación
y la identificación de builds en Acerca de. Son acuerdos vigentes, no otra auditoría
ni autorización de merges futuros. Cualquier cambio de flujo no aprobado se consulta
antes de adoptarlo, conforme a AGENTS/CONTRIBUTING.

**Orden de entrega:** producto y bloqueantes → APK correspondiente generada/validada
(objetivo `0.6.0+` según avance y autorización específica) → informe final/defensa.
Meta fines de octubre 2026 condicionada a evidencia, correcciones y disponibilidad.
No se promete APK final, todos los RNF ni defensa en estas dos sesiones.

**Frente habilitador aceptado:** identificación de build, desde `5ef1f911`, en [PR #22](https://github.com/jdfesa/lumapse/pull/22).
Acerca de presenta versión base, compilación y origen; el canal se declara automáticamente
en los scripts existentes, sin nuevas dependencias, bump ni arquitectura. Semántica,
fallback, HMR y límites en el [flujo Android](../flujo-desarrollo-android.md#identificación-de-compilaciones-en-acerca-de).
El draft inicial quedó a la espera del dispositivo; el smoke sobre E5 ya fue aceptado
el 2026-10-02 y el autor autorizó integración/limpieza. [Artefacto, prueba y límites](./checklist-validacion-android.md#identificación-de-build--smoke-aceptado-de-pr-22).
El PR es la fuente del estado de integración; cerrar con CI del HEAD documental final
y limpieza comprobada, sin afirmar esas operaciones antes de ejecutarlas. Sin release.
La APK publicada `v0.5.0` ya fue aceptada en al menos tres dispositivos: [registro general](./checklist-validacion-android.md#aceptación-general-de-la-apk-publicada-v050).
Ese cierre no acredita el código nuevo ni los RNF de F3.

**Verificación local del habilitador (2026-10-02):** código en `6278dee33575c281466179a71cf5aa4fec20de33`,
con ajustes documentales de esta rama presentes al ejecutar el gate. Node **22.20.0** /
npm **10.9.3** revalidados; distribución aislada existente contrastada con SHASUMS oficial.
Dependencias instaladas reutilizadas con package/lock sin cambios; no se ejecutó otro
`npm ci`, ni se alteró el runtime global. Sin dependencias nuevas ni bump de Gradle.
Se repitió `npm run verify` íntegro sobre `a4f8413` más el ajuste local de compatibilidad
del formateador (`hasOwnProperty.call`, patrón existente en los helpers): exit 0,
los mismos 77 archivos / 1167 tests y 68 de tooling. El estado dirty del build de
esa ejecución representa ese ajuste; el artefacto web final se recompila tras el commit.

| Comando ejecutado | Resultado real |
|---|---|
| `npm test -- tests/unit/config/buildMetadata.test.js tests/unit/components/about/AboutView.test.js` | Exit 0; 2 archivos / 14 tests: etiquetas, versión base, estado/fallback y escape del render |
| `node --test tests/tooling/build-metadata.test.js` | Exit 0; 7 tests: Git sustituible (sin Git/HEAD, árbol ajeno, dirty/desconocido), HMR y Vite dev + tres builds web reales en memoria |
| `python3 -m unittest discover -s scripts/tests -p test_release_build_metadata.py -v` | Exit 0; 2 regresiones con subprocess/pipeline simulados, **sin ejecutar** limpieza/Capacitor/Gradle/ADB |
| `npm run verify` | Exit 0; 77 archivos / 1167 tests de app, 68 de tooling; gate completo, build web, types, versión `0.5.0/500`, SQLite y controles documentales/offline aprobados |
| `npm run check:docs`, `npm run check:traceability` | Exit 0; enlaces/anclas válidos y trazabilidad sin advertencias |
| Auditoría suplementaria con las funciones de `scripts/check-doc-links.py` | Archivos modificados incluidos AGENTS/CONTRIBUTING/TODO, normalmente no descubiertos; enlaces/anclas sin problemas |
| `git diff --check` | Sin errores; package/lock/Gradle y evidencia histórica de resultados F3 sin cambios |

Se verificaron snapshots reales de los cuatro canales sobre `6278dee`, con estado
de código limpio aunque había documentos modificados. La integración web comprueba
versión base desde package, canal y origen incrustados, sin rutas del host ni APIs Node
en el cliente. No sustituye un APK. Los tres avisos lint preexistentes (NoteEditor y
BackupImportPlanService) y avisos diagnósticos de tamaño no se ocultaron ni relajaron.
Logs y snapshots temporales no se versionan. CI se consulta en el PR para su HEAD exacto,
por separado de esta evidencia local. En aquel checkpoint remoto **Android estaba
PENDING** y no se tocó el teléfono; el smoke posterior aceptado está en la checklist.
Todas las mediciones F3 siguen **PENDING**; su próximo frente está **NO INICIADO**.

**Handoff original de prueba — smoke ya aceptado, no repetir:**

1. Revisar el PR y acordar instalación habitual sobre firma compatible; no usar `--clean`.
2. En el equipo con Android disponible, sincronizar la única rama/HEAD del PR y usar
   `npm run deploy:android -- --target <DEVICE_ID>` cuando la instalación esté autorizada.
3. En Acerca de comprobar **Versión base 0.5.0**, **Android debug · prueba privada** y
   **Origen** igual al HEAD completo del checkout; estado local según código relevante.
   En checkout limpio debe indicar sin cambios locales; no ensuciar datos para probarlo.
4. Revisar legibilidad del SHA en pantalla, navegación/apertura y conservación de datos.
   Adjuntar identidad real del APK (hash/certificado), dispositivo/Android/WebView y
   confirmación general o resultados efectivamente observados, sin inferir métricas.
5. Revisión, CI del HEAD exacto y **nueva autorización explícita** antes de ready/merge;
   sincronizar `main` y limpiar la rama únicamente tras integración comprobada.

La autorización del punto 5 ya fue recibida para **PR #22** en la
[decisión del autor](https://github.com/jdfesa/lumapse/pull/22#issuecomment-5964326370).
Fuente de la APK instalada: `e5becc96b032007f587fb564c7b6afd790c5faf9`; el HEAD posterior
solo agrega este registro documental, sin modificar producto ni atribuirle otra APK.
CI final e integración/limpieza se corroboran en el PR. No iniciar F3 automáticamente.

**Prerrequisitos comunes de F3:** cerrar el PR anterior y comprobar GitHub/main limpio;
autor/dispositivo e inspector disponibles; APK fuente/canal/hash/certificado identificados;
espacios sintéticos independientes 50/500 o restauración acordada. Un ZIP no respalda
borradores ni papelera. Instalación, importación, auxiliares y terminación necesitan
autorización pertinente; nunca usar borrado, `uninstall` o `pm clear` por defecto.
Quitar filtros visibles activos y confirmar **50/500** antes de capturar; PR #18 ya
resolvió el filtro oculto. El [reporte de septiembre](../beta-core-validation/resultados-2026-09-14.md)
permanece histórico: no rellenarlo con mediciones inexistentes.

| Sesión | Una unidad/frente | Evidencia y aceptación | Cierre del ciclo |
|---|---|---|---|
| 1 | RNF-002/004: latencia CRUD y FPS | Perfiles 50/500; 5 calentamientos por operación/perfil (30); 30 × 3 CRUD × 2 perfiles (180) muestras válidas, **todas ≤ 200 ms**; 3 recorridos × 10 tramos con 500 resultados, **cada tramo ≥ 55 FPS**. Trazas originales/hashes/offsets, CSV y JSON cotejados por el autor. | Commit `test(validation): record Android CRUD and frame evidence`; docs/traceability y enlaces, PR inglés, revisión de evidencia, checks HEAD exacto y autorización de merge, main sincronizado y rama eliminada. |
| 2 | RNF-009/010: offline y continuidad | OFF-01–05, CON-01–04; borradores nuevos y de edición; cambio de app, bloqueo y terminación autorizada con ventana real de 500 ms. Esperado/real, IDs/conteos/contenido, método/fecha/dispositivo y confirmación auténtica. | Solo tras cerrar sesión 1 y acordar prioridad según sus resultados. Commit `test(validation): record Android offline and draft continuity evidence`; mismo ciclo de tests/docs/PR/autorización/limpieza. |

**Ajuste acotado de entrega aprobado el 2026-10-03:** ante el
[bloqueo real del tercer piloto](../beta-core-validation/README.md#tercer-piloto--bloqueo-stdin-y-entrega-de-tooling),
el autor autorizó PR DRAFT de **herramientas + bloqueo**, no cierre cuantitativo de sesión 1.
Tras revisión, integración expresamente autorizada y limpieza de ese frente, acordar
prioridad para offline/continuidad; RNF-002/004 permanecen PENDING. No iniciar sesión 2,
reparación stdin o nueva captura en aquella entrega documental. La [continuación
posterior autorizada](../beta-core-validation/README.md#reparación-host-y-continuidad-local--2026-10-03)
repara el host en la misma rama; el [cuarto piloto](../beta-core-validation/README.md#cuarto-piloto--captura-completada-semántica-pendiente)
completó captura/cierre/hash con reuso exacto y target intacto. El
[diagnóstico semántico](../beta-core-validation/README.md#diagnóstico-semántico-acotado--piloto-04)
identifica fronteras aún no demostradas; siguiente acción solo consulta offline local
del original, sin nueva captura/helper/series ni cambio del APK principal. No cambia umbrales
ni el ciclo general de una rama/revisión/autorización.

Seguir el [protocolo F3](../beta-core-validation/protocolo.md) y su matriz canónica.
**Captura diagnóstica identificada; muestras/métricas de esta continuidad: PENDING.** El analizador existente sale
0 también para FAIL/PENDING estructuralmente válidos: no mide ni demuestra PASS.
Sin captura fiable o permiso, registrar PENDING; con fallo real, registrar FAIL y
acordar tratamiento antes de otro frente, sin bajar umbrales u optimizar por intuición.
Actualizar solo RNF/casos sustentados por evidencia. Si se autoriza código correctivo,
tests focalizados y `npm run verify` íntegro; no prometer que cabe en estas sesiones.

**Fase posterior condicionada:** bloqueantes resueltos o límites explícitos aceptados;
evidencia RNF restante (estudiantes/usabilidad, accesibilidad, tráfico/privacidad,
coverage del candidato y matriz final). Luego corte autorizado `0.6.0+`, gate/auditorías,
APK exacta generada y validada; firma/publicación requieren permiso específico.
Solo después: capítulos fuente del informe, originales bibliográficos, maquetación,
ensamblado/PDF, defensa/demo/contingencia. No abrir ramas ni publicar automáticamente.

### Secuencia original y cierres ya integrados

| Orden | Entregable | Rama prevista | Dependencia | Salida revisable |
|---|---|---|---|---|
| Completado | Analizar y acordar el alcance | `docs/immediate-beta-plan` | Ninguna | PR #13 aprobado e integrado; rama local/remota eliminada |
| F1 · integrada | Gate portable y entorno explícito | `fix/quality-gate-portability` (eliminada) | PR del plan aceptado e integrado | PR #14 aceptado e integrado; AUD-008/AUD-009 cerrados por aceptación |
| F2 · integrada | Confirmación inequívoca de creación | `fix/post-write-refresh-contract` (eliminada) | F1 integrado | PR #15 integrado por el autor después de confirmar funcionamiento; cierre acotado de AUD-014 |
| F3 · preparación integrada | Validación crítica y medición con 500 notas | `docs/beta-core-validation` (eliminada) | F2 integrado; preparación aceptada en PR #16 | Confirmación general del teléfono; faltan muestras CRUD/FPS y evidencia por caso, ninguna optimización incluida |

Cada fase vuelve a `main` actualizado antes de crear su rama y espera revisión antes del merge. Se mantiene [WIP global 2](./definicion-flujo-kanban.md) como techo, contando también `En Revisión`; esta secuencia usa **una sola rama técnica activa**. No abrir la siguiente hasta integrar y limpiar la anterior. El autor debe aprobar explícitamente el PR y confirmar funcionamiento en su teléfono de pruebas; CI no sustituye esa aprobación. El apoyo de estudiantes/dispositivo se coordina con el autor, no se presume disponible. Registrar `startedAt`/`finishedAt` cuando sucedan, no inventarlos desde commits.

### F1 — Verificación reproducible antes de tocar el comportamiento

**Objetivo:** que un checkout limpio, sin binarios ignorados ni variables especiales, obtenga un resultado de calidad comparable con CI.

**Cambios acotados:**

1. Fijar **Node 22.20.0 y npm 10.9.3**, ya registrados en la evidencia de la Mac canónica, mediante un archivo de versión, `engines` y CI. Mantener README e instrucciones de instalación/verificación alineados. Una versión distinta debe producir un diagnóstico temprano, no 60 fallos engañosos. No actualizar dependencias por arrastre ni declarar soporte Node 26.
2. Corregir la clasificación offline mediante una excepción contextual para los orígenes locales requeridos en el CSP. No eliminar la CSP ni ignorar `index.html`, todas las URLs o líneas completas que contengan `localhost`.
3. Hacer que `npm run verify` y CI ejecuten la misma unión de controles: lint, tests, build, typecheck, toolchain, versión, DB smoke, presupuesto, diálogos nativos, a11y, trazabilidad, links, schema, DBML, jerarquía y offline. Mantener identificable qué control falla.
4. Garantizar que la presencia de `scripts/lumapse-audit-bin` no pueda omitir controles obligatorios ni cambiar su criterio de aceptación. Puede conservarse como acelerador/diagnóstico, pero no como requisito oculto. No emprender una reescritura del auditor Rust.
5. Retirar del camino canónico la aceptación de exit `139` por texto de resumen en `quality.sh`: un crash no equivale a gate aprobado. No convertir errores en warnings ni normalizar exits no cero.

**Superficie prevista:** `package.json` y metadatos correspondientes de `package-lock.json`, nuevo archivo de versión, `.github/workflows/lint.yml`, `scripts/quality.sh`, `scripts/check-offline.sh`, pruebas acotadas de scripts, README y `scripts/README.md`. No cambiar `src/` ni el schema. Si se agrega un script, documentarlo y conectarlo a su entrypoint.

**Criterios de aceptación:**

- [ ] Checkout limpio en Node 22.20.0/npm 10.9.3: `npm ci` y `npm run verify` terminan con exit 0, sin `NODE_OPTIONS` ni binario local preexistente; mismo comando verde en CI y en ambas máquinas.
- [x] Regresiones offline: CSP local permitido; URL remota real rechazada, incluso compartiendo línea con un origen local; host como `localhost.example.org` no queda permitido por substring. Assets remotos JS/TS/CSS/HTML siguen detectándose.
- [x] Pruebas del gate: un check fallido, suite incompleta o salida anormal hacen fallar el agregado; el caso exitoso funciona con y sin el acelerador opcional.
- [x] Node fuera del rango declarado se rechaza o diagnostica inequívocamente antes de la suite. El workaround de Node 26 queda como antecedente, no como solución canónica.
- [x] No se reducen umbrales, se omiten pruebas ni se pierde un control que hoy ejecuta CI.

**Aceptación F1:** [PR #14](https://github.com/jdfesa/lumapse/pull/14) integrado tras aprobación del autor; Linux limpio y CI aprobados, con [evidencia por checkpoint](./validacion-f1-gate-portable-2026-09-12.md). El criterio de ejecución en ambas máquinas conserva la limitación de logs Mac no recibidos; no se fabrica evidencia para marcarlo completo.

**Cierre:** actualizar solo el estado real de AUD-008/AUD-009, registrar versiones exactas, comandos, exits y enlace de CI. No atribuir este PR a una nueva validación Android del producto: no modifica el runtime.

### F2 — Confirmación de persistencia separada del refresco

**Objetivo:** que una creación ya confirmada no se comunique como fallida ni invite a repetir la escritura.

**Contrato aceptado e integrado en F2, PR #15 (`8e25dcd`), tras confirmación del autor:**

- Fallo **antes de confirmar la escritura**: conservar el contrato de error actual, los datos del formulario/borrador y el reintento de guardado.
- Escritura **confirmada** y fallo de refresco: mantener como resultado la entidad persistida, completar el estado de éxito del formulario y emitir un aviso diferenciado de actualización pendiente; ofrecer recuperación de lecturas sin repetir el `INSERT`.
- No silenciar la recarga fallida, dejar promesas sin manejar, inventar éxito de persistencia, hacer un rollback compensatorio ni borrar la fila ya confirmada para acomodar la UI.

**Pasos de implementación:**

1. Convertir los dos casos de caracterización en regresiones permanentes con el resultado esperado corregido. Cubrir además el error de escritura previo y el camino normal.
2. Separar la frontera de escritura del refresco en `createNote()` y `createAcademicEvent()`. Usar un límite pequeño y explícito, no reemplazar globalmente el store ni el contrato de todas sus acciones.
3. Definir la recuperación de la lectura fallida y su feedback desde UI/composición, sin importar `Toast` desde el store. El borrador solo se limpia cuando la escritura está efectivamente confirmada; single-flight y guards de AUD-006 deben conservarse.
4. Integrar pruebas de editor y diálogo que comprueben la consecuencia visible, no solo un mock exitoso del store. Inspeccionar mutaciones vecinas con la misma secuencia para registrarlas como casos confirmados o pendientes; no declararlas corregidas sin prueba ni agregarlas silenciosamente al PR.

**Superficie prevista:** `src/store/NoteStore.data.js`, `src/store/NoteStore.academicEvents.js`, límite pequeño de errores/feedback si resulta necesario, consumidores `NoteEditor.js`/`AcademicEventDialog.js` solo si requieren adaptación y sus tests. Reutilizar el harness de `tests/unit/services/sqlite/`; no cambiar esquema, importación ZIP, routing ni suscripciones globales.

**Criterios de aceptación:**

- [x] Nota/fecha insertada + lectura secundaria fallida: existe exactamente una fila; el resultado identifica esa entidad y el formulario no ofrece reenviar la misma creación como si hubiera fallado.
- [x] Recuperar conteos/próximas fechas no ejecuta otra escritura; UI y estado convergen al dato persistido y el aviso no se duplica.
- [x] Fallo de inserción: cero filas nuevas, borrador/formulario intacto y reintento legítimo disponible. Se conservan pruebas de taps concurrentes y respuestas async obsoletas.
- [x] Regresiones store + SQLite + consumidores UI, suite completa y `npm run verify` pasan en el entorno fijado por F1: checkpoint `75a5440`, 71 archivos / 1098 tests y 56 de tooling.
- [ ] Smoke Android de crear/editar nota y fecha, navegación, reapertura y ausencia de duplicados sobre el SHA candidato. El fallo inyectado en SQLite de tests y la prueba nativa normal se registran como evidencias diferentes.

**Cierre:** evidencia por caso y SHA; AUD-014 solo se cierra para los caminos efectivamente cubiertos. La preparación segura de artefacto/dispositivo descrita en F3 también aplica al smoke de F2, antes de su integración. La aprobación de este plan no autoriza borrar datos, instalar sobre una firma incompatible ni publicar un APK.

Implementación, contrato, mutaciones vecinas fuera de alcance y handoff: [reporte F2](./validacion-f2-guardado-y-refresco-2026-09-13.md) y [ADR-011](../adr/ADR-011-limite-guardado-y-refresco.md). La prueba manual web es auxiliar, no obligatoria; no instalar Android Studio por ese motivo. Se mantiene el gate automático y la aprobación en el teléfono.

### F3 — Evidencia del núcleo, no optimización anticipada

**Seguimiento 2026-09-14:** [preparación y matriz](../beta-core-validation/README.md).
Se reutilizan las herramientas de fixture integradas entre F1/F2, conservando `beta-500`
y añadiendo los perfiles exactos de comparación F3. No hay mediciones Android todavía.

**Objetivo:** decidir con datos si hay que intervenir consultas o notificaciones, y ampliar la evidencia de continuidad/offline del producto existente.

**Preparación segura:** acordar dispositivo y artefacto; registrar modelo, Android/WebView, SHA, versión/código, canal, firma y hash. Distinguir asset publicado, debug privado autorizado y nuevo candidato según el [flujo Android](../flujo-desarrollo-android.md#identificación-de-compilaciones-en-acerca-de). Debug habitual no exige bump por prueba; candidato/entrega usa versión/code nuevos y autorización específica. Ante firma incompatible, detenerse y acordar entorno/restauración; nunca desinstalar/borrar datos por defecto.

**Protocolo mínimo:**

1. Generar un fixture sintético determinista compatible con el backup v1: **500 notas activas visibles en el listado a medir**, 10 materias con 2 secciones cada una y 20 fechas. Añadir por separado casos archivados/papelera para no reducir las 500 visibles. Fijar semilla, fechas, distribución de contenidos, conteos y hash; conservar generador/protocolo revisables y ZIP/logs en `tmp/` o como adjuntos de evidencia, nunca como migraciones productivas. No reutilizar directamente `generate-mock-data.py`.
2. Medir un perfil pequeño de referencia y el de 500 notas en el mismo dispositivo. Tras calentamiento declarado, tomar **30 muestras por operación** de crear, editar y enviar a papelera; medir desde la acción hasta confirmación y actualización visible, separando además persistencia y refrescos. Registrar muestras crudas, mediana, p95 y máximo. **RNF-002 exige ≤ 200 ms: un p95 favorable no permite ocultar muestras que exceden el límite.**
3. Capturar frames durante **tres recorridos de scroll de 10 segundos** con las 500 notas visibles, sin selector de archivos/importación mezclados en la medición. Registrar herramienta, método, configuración y FPS por tramo, no solo percepción. Contrastar **RNF-004 ≥ 55 FPS**; si no hay captura fiable, mantenerlo pendiente.
4. Contar consultas y notificaciones por crear/mover/eliminar, abrir materias y abrir papelera. Relacionar esa traza con `getSubjectTree`, `getTrashItems` y loaders del store. Usar `EXPLAIN QUERY PLAN` sobre una copia del dataset si aparece un cuello de botella de consultas, no agregar índices sin datos.
5. Repetir sin red creación/edición/búsqueda/organización, papelera, fechas y backup/importación local; distinguir que un destino externo de compartición puede necesitar conectividad. Probar borrador nuevo y de edición al cambiar de app, bloquear/desbloquear y terminar/reabrir el proceso. No usar `clear data` como simulación de cierre inesperado.

**Entregables:** protocolo y generación reproducibles, resultados por caso y una matriz incremental con requisito, método/comando, dispositivo, fecha, SHA/artefacto, valor, umbral, estado y evidencia. Actualizar la [checklist Android](./checklist-validacion-android.md), RNF y pendientes **solo con mediciones ejecutadas**. Una utilidad nueva requerirá revisión y pruebas propias; no queda autorizada una batería de scripts genéricos.

**Criterio de salida:** todos los casos ejecutados o explícitamente pendientes por una dependencia externa, con límites claros. Un fallo RNF abre una corrección acotada respaldada por la medición y su propia aprobación; no se marca el requisito cumplido ni se optimiza dentro del PR de evidencia. Sin dispositivo, entregar preparación verificable y dejar F3 sin cerrar.

## 5. Pendientes que se conservan fuera de este ciclo

- **Cierre académico vigente:** originales bibliográficos, figuras en PDF/diapositivas, tablero y métricas de flujo, presentación/demo y contingencia. El ciclo técnico no los da por hechos ni vuelve a redactar todo el informe.
- **Validación posterior aún necesaria:** usuarios y navegación (RNF-005/RNF-006), accesibilidad/tipografía/contraste, tráfico/trackers y matriz RNF completa. F3 es un subconjunto, no el cierre de todos los RNF.
- **Mejora técnica candidata siguiente:** ampliar el smoke SQLite con `academic_events`, columnas, índices, tipo inválido, FK/`ON DELETE SET NULL` e idempotencia. Sigue abierta; se priorizará al terminar este ciclo o si una regresión de schema la vuelve necesaria.
- **Solo con mediciones de F3:** agregación de conteos o reducción de notificaciones (AUD-010/AUD-011), un cuello de botella por PR, preservando conteos y semántica de archivo/papelera.
- **No activar ahora:** refactor de routing, migración masiva a TypeScript/framework, Docker, adjuntos, compartir/importar notas individuales, nube/sincronización, onboarding y cambios de producto postergados.

El horizonte termina al revisar F3 y seleccionar **como máximo el próximo objetivo**, no en una lista de funcionalidades para llegar artificialmente a `1.0.0`.

## 6. Evidencia de esta sesión de análisis

Entorno local: Node `26.7.0`, npm `12.0.2`; no había `NODE_OPTIONS` ni binario `scripts/lumapse-audit-bin`. No se modificó el código productivo ni el entorno soportado.

| Verificación ejecutada | Resultado y alcance |
|---|---|
| `npm test -- --maxWorkers=1` | Exit 1: 67 archivos, 1005 tests aprobados y 60 fallidos por Web Storage en 5 archivos; AUD-009 vigente |
| `NODE_OPTIONS=--no-experimental-webstorage npm test -- --maxWorkers=1` | Exit 0: 67 archivos / 1065 tests aprobados. **Diagnóstico con workaround, no gate canónico aprobado** |
| Reproducción AUD-014 con configuración temporal | Exit 0: 2/2 caracterizaciones verifican el defecto actual sobre SQLite en memoria, no una corrección |
| `bash scripts/check-offline.sh` | Exit 1: dos falsos positivos CSP (`index.html:19–20`); AUD-008 vigente |
| `npm run check:db-smoke` | Exit 0, con la limitación de cobertura indicada en §3 |
| `npm run typecheck` / `npm run lint` | Exit 0; lint conserva 3 warnings conocidos (complejidad/tamaño de editor y tamaño de `BackupImportPlanService.ts`) |
| `check:docs`, `check:traceability`, `check:toolchain`, `check:schema`, `check:dbml`, `check:subjects`, `check:version` | Controles individuales aprobados; versión `0.5.0/500` sin cambios |

Los logs diagnósticos locales se guardaron en `tmp/immediate-beta-plan-2026-09-12/`, ignorado por Git. Los resultados resumidos y el reproducer se conservan aquí para no depender de esos temporales. No se ejecutaron en esta sesión el agregado `npm run verify`, un nuevo coverage, auditorías de dependencias, benchmark ni validación Android. La CI de este PR documental se registra en el propio PR y no demuestra que AUD-008/AUD-009 estén resueltos.

## 7. Condiciones de aceptación de este PR documental — cumplidas en PR #13

- [x] El autor acepta el orden F1 → F2 → F3, el alcance de AUD-014 y lo que queda fuera.
- [x] El contrato propuesto distingue escritura fallida de refresco fallido sin perder borradores ni ocultar errores.
- [x] Backlog, TODO e Hito 06 enlazan el mismo plan y no presentan tareas futuras como implementadas.
- [x] Checks documentales, trazabilidad y `git diff --check` aprobados; CI revisada y limitaciones locales explícitas.
- [x] No hay cambios en runtime, dependencias, schema, versión, APK ni datos personales.

**Seguimiento actualizado 2026-09-16:** el plan, F1, F2 y la preparación F3 fueron aceptados e integrados, con sus ramas eliminadas. El autor informó funcionamiento correcto en el teléfono y autorizó PR #16; sin muestras cuantitativas no se cierra F3 ni se optimiza su rendimiento. También probó e integró el [parche de Vitest](./validacion-parche-vitest-2026-09-15.md) en PR #17 (`7dc105c`) y la [corrección de filtros visibles](./plan-filtros-visibles-2026-09-15.md) en PR #18 (`3898db8`). El próximo objetivo verificable vuelve a ser la evidencia Android pendiente de F3. No se agrega una F4 retroactiva ni se publica automáticamente otro release.

## 8. Reproducción de AUD-014

**Evidencia histórica del defecto, anterior a F2.** Los dos tests siguientes esperan el comportamiento defectuoso; las regresiones permanentes corregidas están en `tests/unit/store/NoteStore.postWriteRefresh.test.js` y sus consumidores en `tests/unit/components/PostWriteRefresh.integration.test.js`.

En la raíz del repositorio, con las dependencias ya instaladas, crear los siguientes archivos **temporales**, no incorporarlos como tests de aceptación sin invertir antes el resultado esperado. Los helpers importados ya están versionados. La configuración usa un único worker y no toca una base de usuario.

`tmp/immediate-beta-plan-2026-09-12/vitest.config.mjs`:

```js
import base from '../../vitest.config.js'
export default {
  ...base,
  test: {
    ...base.test,
    include: ['tmp/immediate-beta-plan-2026-09-12/post-write-refresh.test.js'],
    maxWorkers: 1,
  },
}
```

`tmp/immediate-beta-plan-2026-09-12/post-write-refresh.test.js`:

```js
import { afterEach, beforeEach, expect, it } from 'vitest'
import { importConnection } from '../../tests/unit/services/sqlite/connectionHarness.js'
import { sqliteFixture } from '../../tests/unit/services/sqlite/sqliteFixture.js'

let fixture, connection, db
beforeEach(async () => {
  fixture = await sqliteFixture()
  const harness = await importConnection({ platform: 'android' })
  connection = harness.module
  db = harness.mockDb
  Object.assign(db, fixture.adapter)
  fixture.database.run("CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT); INSERT INTO metadata VALUES ('indexeddb_migrated', 'true')")
  await connection.initDatabase()
})
afterEach(() => fixture.close())

it('nota confirmada: el rechazo y reintento generan dos filas', async () => {
  const store = await import('../../src/store/NoteStore.data.js')
  db.query.mockRejectedValueOnce(new Error('injected post-write read failure'))
  await expect(store.createNote('PP3', 'Contenido')).rejects.toThrow('injected post-write read failure')
  expect((await connection.getDb().query('SELECT id FROM notes')).values).toHaveLength(1)
  await store.createNote('PP3', 'Contenido')
  const rows = (await connection.getDb().query('SELECT id FROM notes')).values
  expect(rows).toHaveLength(2)
  expect(new Set(rows.map(row => row.id)).size).toBe(2)
})

it('fecha confirmada: el rechazo y reintento generan dos filas', async () => {
  const store = await import('../../src/store/NoteStore.academicEvents.js')
  const input = { type: 'tp', title: 'Entrega PP3', date: '2026-09-20', subjectId: null }
  const query = db.query.getMockImplementation()
  db.query.mockImplementation(async (sql, values) => {
    if (sql.includes('date >= ?')) throw new Error('injected upcoming refresh failure')
    return query(sql, values)
  })
  await expect(store.createAcademicEvent(input)).rejects.toThrow('injected upcoming refresh failure')
  expect((await connection.getDb().query('SELECT id FROM academic_events')).values).toHaveLength(1)
  db.query.mockImplementation(query)
  await store.createAcademicEvent(input)
  const rows = (await connection.getDb().query('SELECT id FROM academic_events')).values
  expect(rows).toHaveLength(2)
  expect(new Set(rows.map(row => row.id)).size).toBe(2)
})
```

Ejecutar:

```bash
npm test -- --config tmp/immediate-beta-plan-2026-09-12/vitest.config.mjs
```

Resultado observado: **1 archivo / 2 tests aprobados** porque caracterizan el comportamiento defectuoso. No usan dispositivo Android: `platform: 'android'` selecciona el camino del adaptador simulado. F2 debe transformar estos casos en pruebas del contrato corregido y sumar la integración con sus formularios.
