# AUD-005 — Coordinación SQLite y arranque recuperable

**Fecha:** 2026-09-04  
**Rama:** `fix/sqlite-write-coordination`  
**Base remota verificada:** `57e653c1638af3cecff6dd72513a1a52216bff62`  
**Estado:** cerrado e integrado mediante PR #7; validación canónica y Android aprobadas

## Alcance y preflight

Checkout: `/home/jd/github/lumapse`. Remoto: `https://github.com/jdfesa/lumapse.git`.
Se comprobaron ubicación, rama, árbol limpio y ausencia de commits locales sin publicar. Se ejecutaron
`git fetch origin --prune`, `git switch main` y `git pull --ff-only origin main`; HEAD y origin/main
coincidieron con la base indicada. No se borraron ramas, datos ni trabajo ajeno.

Solo se trata AUD-005. AUD-006 no comenzó y requiere integrar primero esta corrección.
AUD-007 conserva su contrato emit-and-rethrow. AUD-008/AUD-009 no se modifican. Hito 06 continúa activo:
no se cierran RNF, documentación final, defensa ni release. No cambian dependencias, lockfile,
toolchain, versión `0.4.8`, Android `408`, tags, firma ni artefactos publicados.

## Causa y contrato

El contador global confundía concurrencia independiente con anidamiento; el CRUD podía incorporarse
a otra transacción. Migraciones y persistencia web absorbían fallos. `initApp()` dejaba el rechazo de
inicio sin frontera visual.

La solución y sus alternativas están en [ADR-009](../adr/ADR-009-propiedad-transaccional-sqlite.md):
capacidad explícita, cola compartida, fachada SQLite sin acceso al objeto nativo, éxito después de
commit/persistencia y cuarentena ante estado incierto. Las cascadas, restauración de nota huérfana,
vaciado y purgado se confirman como unidades. No se agrega batching ni se optimiza N+1.

Las migraciones omiten únicamente columnas comprobadas por PRAGMA; cualquier error inesperado
aborta con contexto y causa. La importación legada usa una transacción para notas y marcador, sin
reemplazar notas SQLite. El schema final y las cascadas FK no cambian.

El arranque separa preparación async de montaje síncrono, ambos compuestos en `main.js`. Antes de
terminar la preparación no existen componentes/listeners nuevos. La UI de error es accesible, en
español y sin SQL ni contenidos privados. Un montaje parcial fallido exige recargar la WebView,
no reinstalar componentes sobre el mismo documento.

Rutas principales revisadas/modificadas:

- `/home/jd/github/lumapse/src/services/sqlite/connection.js`: conexión, schema y recuperación.
- `/home/jd/github/lumapse/src/services/sqlite/writeCoordinator.js`: cola y propietario explícito.
- `/home/jd/github/lumapse/src/services/sqlite/legacyMigration.js`: migración legada transaccional.
- `/home/jd/github/lumapse/src/main.js`: composición de preparación y montaje.
- `/home/jd/github/lumapse/src/layout/appStartup.js`: estado accesible y reintento single-flight.
- `/home/jd/github/lumapse/tests/unit/services/sqlite/connection.test.js`: regresiones de conexión.

## Evidencia reproducible

Entorno remoto: **Node v26.7.0 / npm 12.0.2**. `npm ci` completó con el lockfile vigente: 293 paquetes.
npm informó el bloqueo preexistente del postinstall de `esbuild`; no se cambió su configuración y el
build funcionó. Ambas auditorías npm se consultaron en vivo: **0 vulnerabilidades** en base y corrección.
El sandbox inicialmente bloqueó fetch/auditorías; se repitieron con autorización, sin asumir resultados offline.

Los logs locales están en `/tmp/lumapse-aud005/base/` y `/tmp/lumapse-aud005/final/`.
Para evitar mezclar la base con archivos en edición, la comparación adicional usa un `git archive`
del SHA base en `/tmp/lumapse-aud005/baseline-checkout`, con el mismo `node_modules` instalado desde
el lockfile inalterado. No se reutilizan cifras de sesiones anteriores.

### Regresiones red → green

| Reproducción previa | Evidencia local | Resultado corregido |
|---|---|---|
| Transacción independiente, CRUD intercalado, persistencia fallida, migración inesperada y doble init: 5 fallos | `/tmp/lumapse-aud005/red-connection.log` | Casos aprobados |
| Montaje prematuro y fallo sin pantalla/reintento: 2 fallos y 1 rechazo no manejado | `/tmp/lumapse-aud005/red-startup.log` | Casos aprobados; sin rechazo no manejado |
| Vaciado de papelera confirmaba notas antes de fallar materias | `/tmp/lumapse-aud005/red-trash-atomicity.log` | Rollback completo en SQLite real |
| Reintento consultaba transacciones después de fallar `open()` | `/tmp/lumapse-aud005/red-open-retry.log` | Comprueba primero si la base está abierta |
| Un estado transaccional no booleano se interpretaba como inactivo | `/tmp/lumapse-aud005/red-unknown-state.log` | Recuperación bloqueada hasta comprobar estado |

Las promesas se controlan explícitamente, sin sleeps arbitrarios. Se cubren además anidamiento,
capacidades expiradas/ajenas, errores begin/write/commit/rollback, recuperación de cola/conexión,
persistencia web pendiente, idempotencia de schema, errores de IndexedDB, importación no destructiva,
desacople de lecturas externas y protección contra doble montaje.

### Comandos

Todos los comandos shell se ejecutaron con prefijo `rtk` (o `rtk proxy` para conservar salida completa).
Desde `/home/jd/github/lumapse`:

```bash
rtk npm ci
rtk npm test -- tests/unit/services/sqlite tests/unit/SubjectService.test.js tests/unit/services/backup/BackupImportDataSource.test.js tests/unit/services/backup/BackupImportRegression.test.js tests/unit/main.test.js tests/unit/layout/appStartup.test.js
rtk npm run verify
rtk npm run test:coverage
rtk npm run check:docs
rtk npm run check:traceability
rtk npm run check:schema
rtk npm run check:dbml
rtk npm audit
rtk npm audit --omit=dev
```

Como `verify` se detiene en quality, también se ejecutan independientemente sus checks posteriores:
`typecheck`, `check:toolchain`, `check:db-smoke`, `check:size`, `check:native-dialogs` y `check:a11y`.
La medición diagnóstica en este Node se reproduce con:

```bash
rtk proxy env NODE_OPTIONS=--no-experimental-webstorage npm run test:coverage
```

Este diagnóstico **no sustituye ni vuelve verde** el comando canónico fallido.

### Matriz comparada — checkpoint previo a la interrupción

| Control | Base | Corrección |
|---|---|---|
| Focalizados | 8 archivos / 196 tests | 13 archivos / 235 tests aprobados |
| Suite completa diagnóstica | 62 archivos / 989 tests | 67 archivos / 1028 tests aprobados |
| `verify` normal | Falla: AUD-009 + AUD-008 | Mismas limitaciones; no verde |
| `test:coverage` normal | Falla: 53 tests Web Storage | Mismos 53 fallos; no verde |
| Coverage diagnóstico global, statements | 94,19% (2351/2496) | 95,63% (2477/2590) |
| Coverage diagnóstico `src/services/**`, statements | 93,58% (1910/2041) | 95,36% (2036/2135) |
| Lint / typecheck | 0 errores, 3 warnings / aprobado | Sin nuevos warnings / aprobado |
| Build y bundle gzip | 192,03 kB / 250 kB | 193,43 kB / 250 kB; aprobado |
| Docs / trazabilidad / schema / DBML | Aprobados | Aprobados |
| Toolchain / DB smoke / diálogos / a11y estática | Aprobados | Aprobados |
| Auditoría npm completa / productiva | 0 / 0 vulnerabilidades | 0 / 0 vulnerabilidades |

**Clasificación de fallos:** AUD-009 reproduce `localStorage.clear` sobre un valor indefinido en
cinco archivos, tanto en base como corrección. AUD-008 reproduce los dos falsos positivos del CSP
`capacitor://localhost http://localhost` en `index.html:19-20` mediante el fallback de `quality`.
No se tocaron reglas, umbrales, cobertura ni scripts para ocultarlos. Antes de integrar debe existir
validación canónica satisfactoria del **SHA final**, no solo este diagnóstico remoto.

Durante el desarrollo, `check:db-smoke` detectó una regresión nueva: el literal clasificador
`'ALTER TABLE'` se interpretaba como SQL incompleto por el extractor existente. Se corrigió el
clasificador de producción, sin modificar el checker, y se repitieron smoke/schema/DBML con éxito.
Ese fallo no se atribuyó a AUD-008/AUD-009.

## Recuperación de la sesión interrumpida

El límite de uso interrumpió la sesión después del commit `bf79c98`, antes de implementar dos
regresiones nuevas de cierre nativo. La matriz anterior describe el checkpoint previo; no representa
el resultado final de esa interrupción. Se resguardaron los archivos sin commit antes de continuar.

El commit `8110de4` completó `beforeReload`, enlazado desde `main.js` a `closeDatabaseForReload`.
El cierre comparte una promesa, impide nuevas operaciones, espera inicialización y trabajo activo,
comprueba el estado transaccional y libera la conexión antes de recargar. Un fallo de cierre conserva
la referencia y permite reintentar; nunca recarga ni vuelve a montar componentes mientras el estado
sea incierto. Las fachadas SQLite retenidas también quedan invalidadas. No se borran bases ni preferencias.

Validación repetida sobre la implementación recuperada, con el mismo Node/npm remoto:

- Red → green ampliado: **7 fallos reproducidos; 3 archivos / 33 tests aprobados** después del fix.
- Suite completa diagnóstica con `NODE_OPTIONS=--no-experimental-webstorage`: **67 archivos / 1035 tests aprobados**.
- `npm run verify` normal: **no verde**, conserva los **53 fallos basales** de Web Storage (AUD-009)
  y los dos falsos positivos CSP (AUD-008). No se relajaron controles.
- Coverage diagnóstico global: **95,66% de statements**; no es coverage integral de UI.
- Lint sin errores ni warnings nuevos, typecheck, build, toolchain, DB smoke, schema, DBML,
  documentación, trazabilidad, diálogos y a11y estática aprobados.
- Bundle gzip: **193,57 kB / 250 kB**. Auditorías npm completa y productiva: **0 / 0 vulnerabilidades**.
- Logs adicionales: `/tmp/lumapse-aud005/recovery-red.log`, `recovery-green.log` y `recovery/`.

En ese checkpoint remoto todavía faltaban la validación canónica y Android. La sección de cierre
siguiente registra la evidencia posterior y la autorización del usuario.

## Validación local — procedimiento y checklist

El procedimiento exige sincronizar el SHA publicado en un checkout limpio, comprobar
`git rev-parse HEAD` y ejecutar la validación canónica antes de integrar. No usar reset, limpieza,
desinstalación ni `--clean`. Este checklist define los escenarios sugeridos, no acredita por sí solo
la ejecución individual de todos ellos.

El Android está exclusivamente conectado a la Mac. Usar el
[procedimiento oficial, sección 5.2](../flujo-desarrollo-android.md):
`npm run deploy:android` (con `--target` si corresponde), preservando SQLite y preferencias.

Checklist proporcional:

1. Abrir la instalación existente y volver a abrirla: notas, materias, secciones, eventos y borrador
   siguen presentes; una única UI, sin pantalla vacía ni controles duplicados.
2. Crear/editar una nota y una fecha académica; cerrar y reabrir: cambios conservados.
3. Archivar/desarchivar y enviar/restaurar una materia con sección y notas de prueba: cascada completa
   y navegación conservada, sin acciones duplicadas.
4. Enviar elementos **de prueba** a papelera, restaurarlos y vaciar solo si su contenido es descartable;
   cancelar el vaciado si hubiera información que conservar. No purgar datos personales para validar.
5. Importar un ZIP Lumapse de prueba y repetir el preview: datos existentes conservados, duplicados
   omitidos según la política vigente. Exportar backup para comprobar continuidad del flujo.
6. Repetir los flujos básicos en modo avión. Los fallos de DB/migración/reintento quedan cubiertos con
   fixtures aisladas; **no se pide corromper ni borrar la base real**.

Después de aprobación manual: abrir PR en inglés contra `main`, revisar checks del SHA final y
esperar autorización explícita de integración. Cambios posteriores de código requieren revalidación
y nueva aprobación. Después del merge se informará PR/SHA; no se eliminarán ramas sin confirmación.


## Cierre canónico y aprobación Android — 2026-09-04

- **Código validado:** `0832a75fe262da7ad3633008d69278df345bbefd`; los cambios posteriores de este cierre
  son exclusivamente documentales, sin cambios de código, dependencias ni configuración Android.
- **Mac canónica:** Node 22.20.0 / npm 10.9.3. `npm ci`, `npm run verify`, `npm run test:coverage`,
  docs, trazabilidad, schema y DBML aprobados sin workaround: **67 archivos / 1035 tests**,
  **0 errores de lint / 3 warnings conocidos**, **95,66% statements** en el scope configurado.
  Las auditorías npm completa y productiva informaron **0 / 0 vulnerabilidades**.
- **Instalación:** script oficial `npm run deploy:android -- --target <dispositivo>` desde la Mac,
  sin `--clean` ni desinstalación. Samsung **SM_G965F**, paquete `com.lumapse.app`, versión **0.4.8/408**.
  Build Vite, sync, Gradle e instalación completados; actualización registrada a las **23:19:36**.
- **SHA-256 del APK local e instalado, comprobados iguales:**
  `b311ae558f08ca92769172542f515e845925e1c5a71d7b9eeb4140c9bf207118`.
- **Aprobación del usuario:** después de la instalación informó «aparentemente todo funciona ok»
  y autorizó aceptar el PR, hacer merge y borrar ramas locales/remotas. Esto acredita una aprobación
  manual de funcionamiento general; no se atribuye una ejecución individual exhaustiva del checklist
  ni se amplía el cierre a la matriz RNF o a mediciones de rendimiento.
- **Integración:** completada posteriormente mediante PR #7 por rebase; `main` contiene los commits
  equivalentes con SHAs nuevos y el cierre documental en `455860e`. La rama local histórica puede
  conservarse mientras se verifica la ausencia de trabajo sin publicar. AUD-006 no formó parte de este cierre.

El APK sigue siendo evidencia de prueba: no se publicó una release, no se cambió la versión y
no se modificó la beta distribuida `v0.4.8`.
