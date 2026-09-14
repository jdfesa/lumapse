# F2 — Validación de guardado confirmado y refresco recuperable

**Estado:** implementación terminada y gate local aprobado; pendiente de revisión, validación del candidato en el teléfono y autorización explícita de merge. AUD-014 no se declara cerrado.

**Rama única:** `fix/post-write-refresh-contract`. **Inicio observado:** 2026-09-13; cierre pendiente de aceptación.

**PR de implementación:** [#15 — creación confirmada y refresco recuperable](https://github.com/jdfesa/lumapse/pull/15), abierto para revisión y prueba en el teléfono, sin auto-merge.

**Base:** `7d4ceda`, merge aprobado de [PR #14](https://github.com/jdfesa/lumapse/pull/14). Se verificó `main` sincronizado y se eliminó `fix/quality-gate-portability` local/remota antes de crear F2. F3 no se inició.

**Contrato:** [ADR-011](../adr/ADR-011-limite-guardado-y-refresco.md), conforme al [plan aceptado](./plan-desarrollo-inmediato-beta-2026-09-12.md). Documentación y app en español; rama, commits y PR en inglés.

## 1. Qué cambió

| Checkpoint | Cambio verificable |
|---|---|
| `480c914` | Separa la escritura de los refrescos en `createNote`/`createAcademicEvent`; entidad persistida como resultado, canal de aviso independiente y recuperación de solo lectura |
| `69dd1ab` | Conecta el aviso recuperable en `main`, conserva borradores ante fallo de inserción y bloquea envíos concurrentes/cierre del diálogo; integración con formularios y SQLite reales |
| `75a5440` | Actualiza el contrato del mock de arranque y prueba el wiring real del aviso; conserva el arranque/reintento single-flight |

Tras una escritura confirmada, fallar al leer materias/conteos o próximas fechas ya no
rechaza la creación. El editor vacía el formulario y descarta su borrador; el diálogo
cierra devolviendo la fecha guardada. Se publica la entidad conocida aunque la recarga falle.

El aviso distingue **guardado confirmado** de **actualización pendiente**. No expira
automáticamente: **Actualizar** repite solo las lecturas, bloquea taps concurrentes y
retira el aviso al recuperar. Si vuelve a fallar, conserva el mismo aviso y reintento;
no ejecuta otra escritura. **Cerrar aviso** no modifica datos ni confirma recuperación;
las cargas normales, incluido el próximo arranque, vuelven a leerlos.

Si falla la inserción, siguen existiendo cero filas nuevas, el error original, un solo
feedback de escritura y el formulario/borrador conservado para un reintento legítimo.
No se cambió el código productivo de `NoteEditor`: su contrato previo de entidad era correcto.

## 2. Evidencia ejecutada

Linux x64, Node **22.20.0**, npm **10.9.3**, sin `NODE_OPTIONS`. Distribución oficial
aislada en `/tmp`, archivo verificado contra `SHASUMS256.txt`; no se cambió Node global.
Dependencias instaladas existentes, con lockfile sin cambios. La comprobación de npm
falló dentro del sandbox que bloquea subprocesos y se repitió con permiso fuera de él;
no se alteró la guardia de runtime ni se aceptó esa ejecución como válida.

| Prueba | Resultado | Límite |
|---|---|---|
| Dos regresiones iniciales sobre la base F1 | 2 fallos esperados por rechazo de lectura | Prueban que los tests detectaban AUD-014 antes del arreglo |
| Suite de store tras `480c914` | 8 archivos / 208 tests aprobados | Incluye recuperación y conservación de ownership académico |
| Formularios, toast y consumidores focalizados | 4 archivos / 83 tests aprobados | Incluye editor/dialog reales con store y SQLite; no Android |
| Composición `main` tras `75a5440` | 4 tests aprobados | Suscripción solo tras preparación; un aviso diferenciado conectado a UI |
| Primer `npm run verify`, `69dd1ab` | **Exit 1**: 1 test de arranque falló por mock incompleto | El gate y su validador rechazaron el resultado; no fue aceptado como verde |
| `npm run verify`, `75a5440` | **Exit 0**: 56 tests de tooling; 71 archivos / 1098 tests de aplicación | Reporte estructurado completo, build y todos los controles obligatorios aprobados |
| `npm run verify`, `d2a7e1a` | **Exit 0**, mismos totales y controles | Incluye la documentación de F2; log `verify-final.log` |
| [CI de `d2a7e1a`](https://github.com/jdfesa/lumapse/actions/runs/34798142327) | **Aprobada**, instalación y gate canónico completos | Node 22.20.0/npm 10.9.3; no es validación Mac/Android |
| Lint/typecheck | Sin errores; 3 warnings históricos de lint | No se redujeron umbrales ni ocultaron controles |
| Caracterización temporal de mutaciones vecinas | 3/3 casos verifican ambigüedades existentes | Diagnóstico separado, no correcciones ni tests incluidos en los 1098 |

Se agregaron **33 tests de aplicación**: 11 de contrato SQLite, 5 del límite de refresco,
3 de ownership académico, 6 de integración UI/SQLite, 6 de toast, 1 de concurrencia del
diálogo y 1 del wiring en `main`. Se mantienen las regresiones anteriores de borradores,
taps simultáneos, errores y solicitudes obsoletas.

Los fallos se inyectan en el adaptador del plugin, pero se ejecutan servicios, coordinador,
DDL y SQL reales en memoria. Los asserts consultan las filas: exactamente una después
de la escritura confirmada y de recuperar; cero después de un `INSERT` fallido.
`platform: 'android'` selecciona un camino simulado, **no identifica un dispositivo**.

Comandos reproducibles con el entorno canónico:

```bash
npm run check:runtime
npm test -- --maxWorkers=1 tests/unit/store
npm test -- --maxWorkers=1 tests/unit/components/PostWriteRefresh.integration.test.js tests/unit/components/common/Toast.test.js tests/unit/components/academic-events/AcademicEventDialog.test.js tests/unit/components/note-editor/NoteEditor.test.js tests/unit/main.test.js
npm run verify
```

Logs ignorados: `tmp/post-write-refresh-f2-2026-09-13/verify-code.log` (fallido),
`verify-candidate.log` y `verify-final.log` (aprobados), `ci-d2a7e1a.log` y `neighbors.log`
(diagnóstico). Los tests versionados y este reporte no dependen de conservar `/tmp`.
El enlace de CI anterior identifica un checkpoint inmutable; comprobar también los
[checks de la cabeza final del PR #15](https://github.com/jdfesa/lumapse/pull/15/checks).
CI conserva el aviso previo sobre runtime de wrappers de Actions; no cambia el runtime
Node 22.20.0/npm 10.9.3 verificado para el proyecto ni amplía F2 a mantenimiento de tooling.

## 3. Mutaciones vecinas: no corregidas en F2

| Camino inspeccionado | Evidencia | Consecuencia y seguimiento |
|---|---|---|
| `createSubject` (materia raíz) | SQLite confirma el `INSERT` y el store rechaza al fallar `loadSubjects` | Queda una fila; reintentar el mismo nombre es rechazado por validación de unicidad, **no** se probó duplicación. Corrección separada |
| `updateAcademicEvent` | SQLite conserva el nuevo título tras `UPDATE` y la recarga rechazada | Resultado ambiguo para edición; no se cambió ese contrato |
| `deleteAcademicEvent` | SQLite confirma cero filas tras `DELETE` y el store rechaza por recarga | Resultado ambiguo para eliminación; no se cambió ese contrato |
| `moveNote`, `deleteNote`, actualización/archivo/restauración/papelera de materias | Patrón estático de escritura seguida de loaders dentro de `runStoreAction` | Pendientes de caracterización y priorización, no se afirma que todos tengan la misma consecuencia |
| `updateNote` / `updateNoteSilent` | Inspección del camino normal: no encadenan esos loaders secundarios | No son la reproducción de AUD-014; no se hace una afirmación general sobre todos sus fallos |

Reproducción mínima de los tres casos confirmados: usar `postWriteRefreshHarness()` de
`tests/unit/store/postWriteRefreshHarness.js` en un archivo temporal Vitest, con configuración
que extienda `vitest.config.js` y seleccione solo ese archivo. Para materia, permitir la
validación previa y el `INSERT INTO subjects`, luego hacer que `db.query` rechace; comprobar
rechazo de `store.createSubject('PP3')` y una fila mediante `fixture.database.exec`.
Restaurar el adaptador de lectura y comprobar que el mismo nombre es rechazado sin otra fila.
Para fechas, crear primero `academicInput`, activar `failUpcomingRead(db)`, ejecutar
`store.updateAcademicEvent(id, { title: 'Cambio persistido' })` o `store.deleteAcademicEvent(id)`
y comprobar rechazo más título persistido o tabla vacía, respectivamente. Cada caso usa una
fixture nueva y la cierra; no toca una base del usuario.

Se registraron en [`BACKLOG.md`](../../BACKLOG.md), sin abrir otra rama, ampliar F2 ni
atribuirles el cierre de los dos caminos de creación corregidos.

## 4. Validación pendiente en el teléfono

El usuario informó que las pruebas manuales web no funcionaban en su entorno. Ese smoke
es auxiliar, **no obligatorio para F2**. Se descartó como criterio de aceptación; las
capturas sintéticas de navegador no se cuentan como evidencia aprobada ni nativa.
`npm run verify` no requiere abrir la app web. No se instaló Android Studio: se conserva
el [flujo Android existente](../flujo-desarrollo-android.md) para compilar y probar en el teléfono.

Preparar la rama en la Mac con el checkout sin cambios personales pendientes:

```bash
git status --short --branch
git fetch origin --prune
git switch fix/post-write-refresh-contract
git pull --ff-only
nvm install
nvm use
npm ci
npm run verify
git rev-parse HEAD
```

**Antes de compilar o instalar:** acordar artefacto, versión/`versionCode` de validación
distintos de la beta publicada `0.5.0/500` y firma compatible. Registrar SHA de código,
hash del APK, modelo, Android/WebView y resultado. No reutilizar `v0.5.0` para un binario
diferente, publicar un APK, desinstalar ni borrar datos para resolver una incompatibilidad.
Si falta esa preparación, detener la instalación y coordinarla con el autor.

Smoke proporcional, con datos de prueba identificables y sin borrar información personal:

- [ ] Crear una nota con título/contenido únicos; pulsar guardar dos veces rápidamente: una sola nota, formulario limpio, conteo actualizado.
- [ ] Editarla, navegar entre Entrada/materia, cambiar de app y reabrir: mismo ID/contenido, sin borrador de creación resucitado ni duplicados.
- [ ] Crear una fecha futura, también con taps rápidos: un solo evento, cierre del diálogo y próximas fechas/mes coherentes.
- [ ] Editar la fecha por el camino normal y reabrir: dato conservado. Esto **no** corrige ni valida su fallo de refresco vecino.
- [ ] Repetir creación normal sin red; comprobar navegación y persistencia tras reapertura.
- [ ] Registrar el resultado y el artefacto exacto en el PR; aprobar el merge solo después de revisar el diff y confirmar el funcionamiento.

No inyectar errores de almacenamiento en datos reales. La falla controlada de recarga,
su aviso y la recuperación sin `INSERT` ya tienen evidencia automatizada separada; la
prueba nativa normal no se presenta como reproducción nativa del fallo inyectado.

## 5. Detención y exclusiones

No se modificaron dependencias, lockfile, esquema, importación ZIP, routing, coordinador
nativo ni versión. No se ejecutaron una nueva auditoría de dependencias, `npm ci` local,
compilación/instalación Android, contacto con la Mac/teléfono, release o tag. El seguimiento
de Vitest registrado en F1 conserva su fecha, sin reutilizarlo como auditoría actual.

El PR permanece **abierto**, sin auto-merge. Mantener solo `main` y esta rama de trabajo
local/remota. Después de la aprobación explícita: merge, sincronizar `main`, eliminar
únicamente la rama integrada y recién entonces elegir el próximo objetivo. F3 y las
mutaciones vecinas siguen pendientes; no abrir un segundo frente durante la revisión.
