# F3 — Validación del núcleo de la beta

**Inicio:** 2026-09-14. **Estado:** preparación aceptada e integrada en [PR #16](https://github.com/jdfesa/lumapse/pull/16), `90fd21e`; F3 **sin cierre cuantitativo**, mediciones Android pendientes.
**Rama de preparación:** `docs/beta-core-validation`, eliminada local y remotamente tras el merge autorizado. No hay nueva release ni cambios productivos de esta preparación.

El 2026-09-15 el autor informó que probó en el dispositivo y aparentemente todo funciona
bien; autorizó el merge y la limpieza. Esta confirmación general no aporta muestras CRUD/FPS,
identidad/hash del APK ni resultados detallados por caso. No se completan las plantillas ni
se mejora el estado de los RNF por inferencia. El gate local y el CI de `main` integrado pasaron.

F2 fue aceptada por el autor tras probar su funcionamiento y quedó integrada en
[PR #15](https://github.com/jdfesa/lumapse/pull/15), `8e25dcd`. Se actualizó `main` a
`f9c8de0` y se eliminó su rama local; la remota ya estaba eliminada. Esta fase sigue
el [plan aceptado](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md), sin optimizar
consultas/notificaciones por intuición ni sustituir la validación del teléfono por CI.

## Seguimiento de la sesión 1

**2026-10-03:** inicio autorizado de RNF-002/RNF-004 en
`test/android-performance-evidence`, desde `main` limpio y sincronizado en
`8215541f66572f286d016e6a18f07d9cbc82aaf6`. GitHub confirma PR #21 y #22 integrados;
la rama local residual de PR #21 se limpió después de probar pertenencia de sus
commits al PR y ausencia de trabajo sin publicar. No se reabre la preparación PR #16.

El APK aceptado conserva la fuente
`e5becc96b032007f587fb564c7b6afd790c5faf9` y su identidad registrada en la
[checklist Android](../gestion/checklist-validacion-android.md#identificación-de-build--smoke-aceptado-de-pr-22).
El commit posterior de PR #22 solo añade documentación y su árbol coincide con el
merge actual; esto no atribuye otro origen al APK ni genera un binario nuevo.

En el entorno remoto canónico pasaron **25 regresiones Python** de fixtures/analizador
y **6 pruebas de integración SQLite en memoria**. Los dos ZIP sintéticos necesarios
se reprodujeron fuera del repositorio con los hashes históricos, sin importar al
teléfono ni modificar generador, analizador o producto. La ejecución sobre plantillas
vacías sale 0 con estado **PENDING**, no aporta latencias ni FPS.

**Lectura física inicial aportada por el operador (2026-10-03, 03:19 UTC):** Samsung SM-G965F,
Android 10/API 29, WebView 153.0.8010.36; hash del APK instalado y certificado
coinciden con el debug privado aceptado. Acerca de no se reabrió en esta lectura:
fuente/canal se apoyan en la observación anterior y el mismo hash binario. No hubo
instalación, lectura de bases personales, importación ni medición cuantitativa en
esa lectura previa a la carga. La alternativa de dos usuarios Android se propuso,
pero **no se adoptó**; no se crean usuarios ni cuentas de Lumapse.

**Acuerdo vigente de pruebas (2026-10-03):** el autor confirmó que los datos actuales
de Lumapse en este Samsung son sintéticos y descartables, y autorizó respaldo,
sustitución controlada y pruebas necesarias incluso destructivas **solo sobre esos
datos de prueba**. Eligió el cargador existente, con el mismo usuario Android y APK:
**respaldo SQLite → 50 → medición → 500 → medición → restauración opcional**. Root
disponible no es autorización para otras apps, datos o equipos, ni para producción;
no permite extrapolar este procedimiento a un teléfono con datos personales.
Se mantiene una sola rama por tarea. Este checkpoint de carga no cerró F3 ni abrió PR;
el [ajuste posterior de entrega](#tercer-piloto--bloqueo-stdin-y-entrega-de-tooling) autoriza
un PR DRAFT de herramientas/bloqueo, no mediciones aprobadas.

**Checkpoint local informado por el operador:** la carga de `f3-small` mediante
[`load-test-fixture-android.sh`](../../scripts/load-test-fixture-android.sh) terminó
con exit 0 el 2026-10-03 a las 03:36 UTC. Se ejecutó desde `main` limpio e igual a
`origin/main` en `8215541`, con Node 22.20.0/npm 10.9.3, según el reporte local;
no desde esta rama remota ni relajando las guardias del cargador. Se usó `run-as`,
**sin usar root, `pm clear`, desinstalación ni instalar otro APK**. Es una carga
SQLite, no evidencia de importación/reimportación ZIP ni de medición CRUD/FPS.

| Dato aportado por el operador | Resultado del checkpoint |
|---|---|
| Perfil y fecha base | `f3-small`, `2026-09-13`; SHA-256 del dataset `47d8a7f3f1cfefdd3711748fc55e74813688dc1b4e482dfda18755c16e97bb08` |
| Conteos SQLite posteriores | 80 notas: 68 no eliminadas (50 del feed normal esperado + 18 archivadas), 12 en papelera; 30 contenedores y 20 fechas |
| Respaldo y SQLite posterior | `integrity_check` y `foreign_key_check`: `ok` en ambos |
| SHA-256 del respaldo SQLite consolidado | `a3c1108c9b2d5707d52ee8a72ec95c1b036a5ae18231126c19800a4a10390f47` |
| SHA-256 lógico del respaldo | `4892c7881ce33bafaf5de928e39265a86b1340732ce3d5d326d5a5e62dc2a321` |
| `metadata` antes/después | Mismo SHA-256: `8da7cd2226b0709e6d91ead96ade5bbcec281e601946e6cc0605531b8eebfe97` |

**Cobertura y recuperación:** el cargador detiene Lumapse y copia SQLite con
WAL/SHM/journal cuando existen, consolida y verifica el respaldo antes de sustituir
notas, materias y fechas. Incluye datos guardados, papelera y `metadata`; **no es un
respaldo completo de WebStorage ni de preferencias/borradores**. No toca directamente
`shared_prefs`/`app_webview`, pero eso no demuestra recuperación de su contenido.
La restauración opcional acordada usa el mismo cargador con `--restore` y el
`before.sqlite3` original preservado localmente; su ruta de restauración compara
contenido antes/después del arranque. **No se aportó una restauración ejecutada hoy**;
el rollback automático tras error es un mecanismo de intento, no una recuperación
probada en esta carga exitosa. Las bases crudas, auxiliares y respaldos quedan
privados en el equipo operador: aquí se registran solo conteos y hashes, sin
seriales, rutas privadas ni contenidos. No se copiaron bases al entorno remoto.

**Observación local posterior aportada por el operador (2026-10-03):** búsqueda `#`
cotejada con los **50 títulos exactos** del fixture. Después se guardó una nota auxiliar
`F3 piloto #01` con 200 letras ASCII: tarjeta presente, compositor vacío, Entrada con
la auxiliar y búsqueda limpiada conforme al producto. Estado posterior **50 base + 1
auxiliar**, no listado medido de 50 ni perfil 500. Record/Stop manuales produjeron una
captura de pantalla Performance con filmstrip y campo **INP 195 ms**, que **no es
latencia CRUD ni aceptación**. Save no produjo archivo/dialogo en los intentos informados;
sin causa confirmada ni evidencia de una incidencia de producto. No hay traza exportada
ni CSV/muestras válidas. La política del navegador bloqueó `chrome://inspect`: no se
elude por otra superficie y no se pide repetir Save a ciegas.

**Paso experimental aprobado inicialmente (estado actualizado abajo):** piloto experimental por API pública WebView en `androidTest`
y script USB, instalando **solo helper de pruebas** con firma compatible, nunca otra
APK de Lumapse. [Alcance, riesgos y criterios del piloto](./protocolo.md#piloto-nativo-experimental--autorización-acotada-del-2026-10-03)
y [entrypoint/preflight](../../scripts/README.md#47-capture-webview-pilot-androidpy).
El build y la instalación inicial del helper fueron realizados en Mac según el
checkpoint siguiente; **captura útil y revisión semántica PENDING**. Los dos primeros intentos
fallaron antes de READY; el tercero alcanzó READY pero quedó bloqueado en stdin:
[estado y permiso actuales](#tercer-piloto--bloqueo-stdin-y-entrega-de-tooling). La implementación
remota no constituye prueba física. Este pipeline
autorizado no adopta equivalencia ni rebaja el protocolo. No sustituir por 500 antes de
resolver la captura/revisión y medir el pequeño; no sumar ambos perfiles.

**Verificación host del capturador (2026-10-03, checkpoint inicial `d50e56bf`):** el avance de nueve archivos se
recuperó contra la base publicada `43ec1f75`, con hash/base y aplicación comprobados,
sin reiniciar el frente. Se mantienen API pública, opt-in, ámbito de proceso y cierre
SDK; se reforzaron identidad/ruta instalada del target, versión no declarada del helper
como `null` y guardas de estado/tiempo/hash. Un timeout del hijo ADB local no autoriza
parar Lumapse ni omitir el cotejo final. Comandos ejecutados con Node 22.20.0/npm 10.9.3:

- `python3 -m unittest discover -s scripts/tests -p test_webview_pilot.py -v`:
  **21/21 PASS** (15 recuperadas + 6 regresiones); no compila Java ni ejecuta ADB.
- `npm run verify`: **PASS**, 77 archivos/1167 tests de aplicación y 68 tests de tooling,
  con las regresiones Python descubiertas por el gate; build web y controles completos.
- `npm run check:docs`, `npm run check:traceability` y auditoría suplementaria de enlaces
  de las seis fuentes tocadas, incluido `TODO` fuera del descubrimiento habitual: PASS.
- `git diff --check`: PASS. Sin modificaciones de producción, dependencias, versiones
  ni artefactos privados. Avisos existentes de lint/tamaño no se degradan ni son métricas F3.

El guard de runtime no pudo lanzar su subprocess npm dentro del sandbox inicial;
las versiones directas fueron exactas y el mismo guard pasó con auto-review normal,
sin cambio global ni bypass. El gate íntegro se repitió sobre el snapshot final;
las dos ejecuciones previas de Debian no se atribuyen a este refinamiento.
No hay Java/ADB en PATH de este host: compilación nativa y piloto en Mac **PENDING**,
con JDK/SDK/caché y firmante debug existentes. El checkpoint publicado no es un PR F3
ni evidencia de dispositivo. Sin porcentaje vivo de cuota, no se presume presupuesto
independiente por equipo ni se inicia otro relevo automáticamente.

### Piloto físico inicial y corrección acotada de transporte

Los pendientes/permisos de este corte se conservan como historia de la ronda 1;
el resultado posterior y el permiso vigente están en
[segundo piloto y continuación expresa](#segundo-piloto-y-continuación-expresa-del-diagnóstico).

**Reporte del operador, 2026-10-03 (actualización 06:27 UTC):** el propietario autorizó
una descarga puntual **solo de dependencias AndroidTest ya declaradas** faltantes en
caché. `:app:assembleDebugAndroidTest` online terminó PASS a las **06:17:40 UTC**,
con JDK21/wrapper/SDK existentes y descarga SDK deshabilitada; sin cambiar fuentes,
versiones o dependencias ni instalar herramientas. La siguiente ejecución del script
volvió al default **offline**, PASS (162 tareas up-to-date, 12 s), e instaló solo el auxiliar.
Hashes AAR aportados del cache resuelto (no prueban métricas):

| Artefacto ya declarado o transitivo | SHA-256 AAR |
|---|---|
| `androidx.test.ext:junit:1.3.0` | `3363df84da4540ba8daff02c3f7cd65471037a6a5370591a7e6deba377b36e7f` |
| `androidx.test.espresso:espresso-core:3.7.0` | `5dd90e366838bf044cb52eae06474debd285df18a7a77c40441ac8e8951bb00f` |
| `androidx.test:runner:1.7.0` | `970311c47119928a2e406a88892a3d270387cc5a49a181a1c44511105b41b818` |
| `androidx.test.services:storage:1.6.0` | `f97e3cf6aaf4e3fb97ef219d37a9c0a0720183c1f6db87b37642521e26fb6d30` |
| `androidx.test:core:1.7.0` | `f4dacd8edceeec48e0c76ecf28339b28f4b4f6b74f8e34e9e59b472c27d9eb81` |
| `androidx.test:monitor:1.8.0` | `56cb7496a06d9f2dca7d3ff76c50a8a30bd18e00a24a3b267d5a31437b278e67` |
| `androidx.test.espresso:espresso-idling-resource:3.7.0` | `5ff62326b49c308c1d060466ae3cf4aa0e3deaf9295f077a6886048dda3e9b14` |

Auxiliar instalado: `com.lumapse.app.test`, versión/code **null**, runner
`AndroidJUnitRunner`, target `com.lumapse.app`, fuente **`d50e56bf`**; APK SHA-256
`80bb89eb429249293de2cd18f08c44d7492b81632582da8c18b432f8353f5bbd`, certificado
`5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`.
Fuente/identidad del Lumapse original siguen **E5 / 0.5.0/500**, no el commit del helper;
APK/certificado/versiones/ruta instalada **iguales antes/después** según el operador.
No hubo instalación main, reset de datos, root/forward/flags globales; la actividad se
abrió de nuevo normalmente. Fixture conocido: **50 base + 1 auxiliar**, 500 no cargado;
respaldo SQLite original preservado, sin backup completo de preferencias/WebStorage/borradores.

**Fallo observado, no defecto de producto confirmado:** Python salió 1 con
`Invalid native status JSON` **antes de mostrar READY**. No conservó los bytes de esa
primera lectura. El operador había confirmado estar listo, pero nunca recibió el
handshake: no se atribuye el fallo a no pulsar Enter. No se envió `start.signal`;
el test nativo agotó su preparación de 120 s: **FAIL PREPARATION_TIMEOUT**. Estado
final JSON válido de **866 bytes**, ERROR, sin `start_call_before_elapsed_ns`;
**ninguna traza, operación CRUD de este piloto, muestra ni FPS**. JSON final válido
no demuestra la causa: snapshot transitorio durante escritura/lectura es hipótesis.
[AtomicFile](https://developer.android.com/reference/android/util/AtomicFile) no ofrece
bloqueo entre procesos y su base no es contrato de lectura externa consistente.

**Ronda de corrección 1 autorizada:** publicación solo de snapshot cerrado/sincronizado
mediante [move atómico](https://developer.android.com/reference/java/nio/file/Files),
sin fallback no atómico; diagnóstico privado de lecturas fallidas (bytes acotados,
hash/tamaño/razón/hora) y máximo tres lecturas incompletas consecutivas. JSON malicioso,
scope/run/estado incorrectos o contrato de hash/tiempo inválido abortan, no se toleran.
Reuso/update del **auxiliar conocido** requieren opt-in y pins de hash/proveniencia;
reuso exige fuentes nativas iguales y no reinstala. Al cambiar Java corresponde update
solo auxiliar de firma compatible, sin downgrade, limpieza ni tocar el target.
Contrato detallado en [scripts](../../scripts/README.md#47-capture-webview-pilot-androidpy).

Investigación/implementación/verificación acotadas a objetivo **20 min**, sin recortar
el gate ni abandonar tests a medias. Tras publicar código seguro se permite **un único
piloto local adicional de 8 s**. Si falla o no contiene las fronteras metrológicas
reales, registrar el [impedimento de tooling](../../BACKLOG.md#deuda-técnica-viva),
**detener este método y esperar decisión del autor**. Sin más técnicas, series, nuevo
relevo, reinicio automático o RNF rebajados; no hay PR checkpoint de la herramienta.
Esta corrección aún requiere compilación/piloto Mac; no es causa raíz física probada.

**Verificación remota de la ronda 1 (2026-10-03):** con Node22.20.0/npm10.9.3 existentes,
`python3 -m unittest discover -s scripts/tests -p test_webview_pilot.py -v` **32/32 PASS**;
`npm run verify` íntegro **exit0**, 77 archivos/1167 app +68 tooling (incluye Python),
build web y todos los controles. `check:docs`, `check:traceability`, 97 enlaces
suplementarios de seis fuentes (incluido TODO) y `git diff --check`: PASS.
Dos ajustes de mocks/asserts host fallaron inicialmente durante la corrección y fueron
corregidos sin skips; no son resultados Android. La última modificación documental
solo registra estos hechos y se revalida con docs/trazabilidad. Java/ADB no ejecutados
ni disponibles en PATH aquí: build del helper corregido, update y piloto físico siguen
**PENDING**. No se atribuye el build previo Mac a este snapshot Java nuevo.


### Segundo piloto y continuación expresa del diagnóstico

Este corte conserva la reparación de clasificación y su permiso de revisión; el
[tercer piloto y nuevo alcance de entrega](#tercer-piloto--bloqueo-stdin-y-entrega-de-tooling)
actualizan el bloqueo, sin cambiar la evidencia de los intentos anteriores.

**Reporte del operador del 2026-10-03, 07:29 UTC (Mac, no ejecución remota):** el único
piloto adicional de la ronda 1 se ejecutó con script/helper fuente
`e4bef6b5d8eca564eb48719702e0938882d67d6e`. Build
`:app:assembleDebugAndroidTest --offline --no-daemon -Pandroid.builder.sdkDownload=false`
**PASS, 15 s, 162 tareas (4 ejecutadas/158 up-to-date)**, sin nuevas dependencias.
Update compatible `-r -t` **solo auxiliar** verificado; APK actual `com.lumapse.app.test`
(versión/code null), SHA-256
`43e1eb3e34669468932d2d2a0baa19d4e0ae74e5a5049deb1eafb5c8e8b81827`, certificado
`5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`.
El helper `80bb…/d50e…` queda como antecedente, no pin vigente.

Samsung SM-G965F, Android10/API29, WebView153.0.8010.36, usuario0. Lumapse principal
siguió **0.5.0/500**, fuente `e5becc96b032007f587fb564c7b6afd790c5faf9`, APK
`599d507f9e2e2b70f90921ec1d9459458f522f6f566d93ee8e29e2c8e15a4f57`, mismo certificado:
**identidad y ruta instalada pre/post iguales**, según cotejo del operador. Sin instalación
main, force-stop, clear, uninstall ni root. Fixture **50 base + 1 auxiliar**, 500 no
cargado; respaldo SQLite/WAL/SHM/journal privado intacto, no backup completo ni restore.

**Causa observada del segundo rechazo:** primera lectura READY, exit ADB **0**, stdout
**100 bytes**, stderr **0**. El diagnóstico de `cat` indicaba que `status.json` de la
ruta/run esperado aún no existía; `wait_state` seleccionó el parser JSON por exit 0 y
abortó con `PERMANENT_STATUS_REJECTION`. SHA-256 del stdout privado original:
`8b49b7be5bff1d165acf7ba32e4e540e98e33e558f8fd43a512f9c50fc65f86e`.
No se publican bytes ni run ID reales. READY no fue visible; el operador estaba listo,
pero **no recibió el handshake**. Sin Enter/señal, captura, traza, CRUD ni métricas.
JUnit terminó **FAIL (1 test/1 failure), PREPARATION_TIMEOUT, 122.183 s**; JSON final
válido **928 bytes**, transporte `closed-same-directory-atomic-move-v1`, sin inicio de
captura; SHA-256 `3a1b143fbcc7e757a05f2264cb281c319576c1b036d43aa887d04a58da57cc31`.
Esto demuestra clasificación incorrecta del transporte del **segundo** piloto, no la
causa del primero sin bytes ni un defecto de Lumapse. El snapshot final no prueba que
el primero sufriera escritura parcial. Se consumió el permiso del único piloto adicional.

**Nueva continuación expresamente autorizada:** diagnóstico/reparación remota acotada
(Astra/max) de este impedimento, no reinicio automático ni autorización de otro piloto.
Se corrige solo el wrapper Python y sus regresiones: ausencia inicial estrictamente
identificada antes del parser, tanto exit0 como exit1, sin aceptar errores arbitrarios;
deadline READY fijo, diagnóstico privado y rechazo de READY tardío. Se preservan las
guardas de scope/run/estado/hash/relojes/auxiliar/target. Java y build nativo **sin cambios**;
la propuesta para revisión puede reusar únicamente el auxiliar actual exacto, evitando
otra instalación. [Contrato y pins vigentes](../../scripts/README.md#47-capture-webview-pilot-androidpy).
El permiso puntual de descargas ya declaradas/cache de la ronda anterior no se amplía.

**Verificación host de la corrección `cce5ab1` (2026-10-03):** se reprodujo primero el
rechazo `Invalid native status JSON` con una regresión sintética de 100 bytes y run ID
nuevo (no el raw/hash privado). Sobre el código corregido final, Node22.20.0/npm10.9.3
existentes, sin instalar herramientas ni cambiar configuración global:

- `python3 -m unittest discover -s scripts/tests -p test_webview_pilot.py -v`: **40/40
  PASS**. Ocho regresiones nuevas cubren exit0/1, canal/plazo exactos, ausencia persistente,
  path/run/permiso/JSON/scope incorrectos, READY tardío y ningún prompt/start sin READY;
  conservan tests de reuso/update conocido, rechazo desconocido y target inmutable.
- `npm run verify`: **exit0**, 77 archivos/1167 tests app y 68 tooling (descubre Python),
  build web y controles íntegros. Persisten 3 avisos de lint y avisos de tamaño previos;
  no se degradaron fallos ni se omitieron suites. No se atribuyen los gates anteriores.
- `npm run check:docs`, `npm run check:traceability`, auditoría suplementaria de las seis
  fuentes tocadas (incluye TODO) y `git diff --check`: **PASS**. El commit de esta evidencia
  es solo documental y se revalida con los mismos controles documentales.
- Java/ADB ausentes del PATH de este host: **sin build Android ni prueba USB aquí**.
  El diff desde `e4bef6b` no cambia Java, Android/build, producto, dependencias, versión
  ni fixtures. No hay nueva traza/CSV/muestra, release o PR. Commits/push normales sin
  deshabilitar hooks; este checkout solo contiene hooks de ejemplo, sin instalarlos.

El resultado publicado se presenta al autor **antes de otra captura**. Sin evidencia
nueva no se acredita reparación física, capacidad metrológica ni RNF. Si una captura
posterior autorizada falla o carece de fronteras reales, conservar el impedimento
[en BACKLOG](../../BACKLOG.md#deuda-técnica-viva), detener el método y pedir una decisión,
sin técnicas/reintentos indefinidos ni umbrales menores. Como alternativa **por decidir**,
priorizar el siguiente frente ya planificado de offline/continuidad, solo después de
acordar el cierre/repriorización del frente actual; no iniciarlo en esta continuación.


### Tercer piloto — bloqueo stdin y entrega de tooling

**Reporte del coordinador, 2026-10-03, 08:07 UTC (actualizado 08:17 UTC):** script
fuente `a8792de45048e1d1e2f844a4e45ed76d8cecfbda`. Auxiliar
`com.lumapse.app.test` **REUSED_VERIFIED**, no compilación ni instalación;
SHA-256 `43e1eb3e34669468932d2d2a0baa19d4e0ae74e5a5049deb1eafb5c8e8b81827`,
fuente `e4bef6b5d8eca564eb48719702e0938882d67d6e`, certificado igual al
[registro anterior](#segundo-piloto-y-continuación-expresa-del-diagnóstico).
Preflight local: Node 22.20.0 / npm 10.9.3, JDK 21.0.10, Gradle 8.14.3, SDK existente;
40 tests host PASS en Mac y checkout limpio/fetch/pull ff-only antes del intento.
Samsung SM-G965F, Android 10/API 29, WebView 153.0.8010.36, usuario 0, USB local Mac.

**READY auténtico visible por primera vez:** la corrección de clasificación de `cat`
permitió superar ese bloqueo. El autor preparó `F3 piloto #03`, confirmó lista/sin
guardar y el coordinador envió Enter por TTY. **Sin CAPTURING ni start.signal**, sin
inicio de captura/traza/muestra/FPS. JUnit terminó **FAIL PREPARATION_TIMEOUT,
127.303 s**; estado nativo ERROR, sin `start_call_before_elapsed_ns`.
Python host permaneció bloqueado **más de seis minutos**. Después del final JUnit,
SIGINT dirigido **solo al Python local verificado**, exit 130; no force-stop de Android
ni terminación de RTK/ADB/teléfono. `execute.finally` cotejó el original:
**hash/certificado/0.5.0/500/ruta pre/post iguales**; fuente del target E5 y hash 599d…
no cambian. Se mantienen los respaldos SQLite/WAL/SHM/journal privados, no un backup
completo de preferencias/WebStorage/borradores ni una restauración. El último conteo
conocido era **50 base + 1 auxiliar**; #03 preparada no acredita guardado ni conteo final.
**500 no cargado**. No se piden bases, raw, serial, claves ni nuevas lecturas para este registro.

**Bloqueo demostrado del host, no defecto productivo confirmado:** el stacktrace al
interrumpir ubica `capture` en `sys.stdin.readline()` tras
`select.select([sys.stdin], [], [], 90)` (script fuente a8792de, línea 537).
El timeout limita [select](https://docs.python.org/3.12/library/select.html#select.select),
no la [lectura de línea posterior](https://docs.python.org/3.12/library/io.html#io.IOBase.readline).
`Popen` no fija stdin y [hereda la entrada del padre](https://docs.python.org/3.12/library/subprocess.html#subprocess.Popen);
competencia entre lectores/consumo de Enter por ADB o proxy es **hipótesis**, no causa
confirmada. No se culpa al usuario/nota ni se afirma recepción dentro/fuera de 90 s sin
timestamps desglosados. `KeyboardInterrupt` queda fuera del catch actual: `main.finally`
guardó `pilot-result.json` con **PENDING y sin error**, pero el reporte coordinador
acredita **exit 130 y bloqueo**, no PASS. Hash del reporte original privado en Mac,
aportado por el coordinador (no de la copia anonimizada):
`a075ab44d0a0f5ea98653e55f8b19285d0b65142c6c1ee595bf8b12ca258ad65`.
El primer fallo sin raw y el segundo rechazo de100 bytes permanecen diferenciados.

**Ajuste de entrega expresamente aprobado el 2026-10-03 (Argentina):** el autor pidió
registrar el impedimento para futuro y respondió **«Sí: preparar ese PR para revisión»**.
Se entrega en la misma rama **tooling experimental + tests/diagnósticos + bloqueo**,
PR **DRAFT** hacia main. Esto reemplaza el límite anterior de no PR checkpoint para
este entregable concreto, **no** autoriza mediciones aprobadas, ready/merge, otra captura,
reparar stdin, otra rama o iniciar RNF-009/010. Este cierre documental usa Sol/xhigh;
Astra queda postergada, solo para futuro con tiempo y permiso. No cambia el flujo general.

**Impedimento vigente:** no continuar capturas/series hoy. Una futura reparación requiere
permiso específico, tests de lectura/preparación realmente acotada y de interrupción,
revisar aislamiento stdin del hijo sin asumir que consumió Enter, y resultado host
honesto ante aborto. Solo una prueba posterior autorizada puede acreditar
READY → preparación confirmada → start/CAPTURING → cierre SDK/trace/hash, target
intacto y fronteras metrológicas reales. Nada de eso se completa por estos 40 tests.
Criterios RNF originales intactos: **30 calentamientos + 180 muestras CRUD válidas, todas ≤ 200 ms,
50/500; 3 × 10 tramos de 1 s, cada uno ≥ 55 FPS, 500 resultados**. Trazas originales/hashes,
relojes/offsets, CSV/JSON y cotejo del autor, sin sustitutos ni descarte de outliers.
El [bloqueo en BACKLOG](../../BACKLOG.md#deuda-técnica-viva) sigue abierto. Próximo pendiente
útil: offline/continuidad RNF-009/010 ya planificado, **solo tras revisión, integración
expresamente autorizada y limpieza de esta rama**, acordando prioridad sin dar por
cerradas RNF-002/004. No se inicia ni se publica otra prueba en esta continuación.


No se recibieron trazas originales, calentamientos ni muestras cuantitativas válidas para esta sesión.
RNF-002/RNF-004 siguen **PENDING**. El PR DRAFT autorizado entrega herramientas y bloqueo,
no cierre F3 ni evidencia cuantitativa completada.
La sesión 2 RNF-009/RNF-010 no se inicia. El acuerdo y la carga no rebajan umbrales,
no aportan latencias/FPS ni sustituyen el cotejo de trazas por el autor; la evidencia
histórica de septiembre permanece intacta.

## Entrega revisable

- [Protocolo](./protocolo.md): fixtures, seguridad del dispositivo, CRUD/FPS, offline y borradores.
- [Resultados y matriz incremental](./resultados-2026-09-14.md): solo hechos ejecutados; pendientes identificados.
- Plantillas vacías: [sesión](./sesion.template.json), [muestras CRUD](./crud.template.csv)
  y [frames por tramo](./frames.template.csv). Copiarlas a `tmp/` para completar la evidencia.
- [Analizador F3](../../scripts/summarize-f3-results.py): valida CSV ingresados a mano
  y resume `PASS`/`FAIL`/`PENDING`; no produce trazas ni mide el dispositivo.
- Generador existente ampliado con `f3-small` y `f3-500`; `beta-500` sigue siendo el valor por defecto.
- ZIP v1 determinista y pruebas de importación real, repetición sin duplicados, conteos y papelera separada.

## Primer análisis de una sesión física — pendiente del autor

La vía Chrome/CUA está bloqueada y no se elude; el piloto SDK está detenido por el
[impedimento vigente](#tercer-piloto--bloqueo-stdin-y-entrega-de-tooling). Solo después
de una captura fiable autorizada y revisada según el [protocolo](./protocolo.md), copiar las
plantillas sin sobreescribir evidencia existente, completar las filas y ejecutar:

```bash
mkdir -p tmp/f3/sesion-1
cp -n docs/beta-core-validation/crud.template.csv tmp/f3/sesion-1/crud.csv
cp -n docs/beta-core-validation/frames.template.csv tmp/f3/sesion-1/frames.csv
cp -n docs/beta-core-validation/sesion.template.json tmp/f3/sesion-1/sesion.json
python3 scripts/summarize-f3-results.py --crud tmp/f3/sesion-1/crud.csv --frames tmp/f3/sesion-1/frames.csv --session tmp/f3/sesion-1/sesion.json --json-output tmp/f3/sesion-1/resumen.json
```

Se puede analizar solo `--crud` o solo `--frames`; la ausencia del otro conjunto no
constituye un cero medido ni cierre F3. Conservar archivos de traza originales y sus
SHA-256, offsets, fuente de frames, CSV y JSON junto a la identidad del APK, fuente y
dispositivo. Para CRUD, `PASS` exige cinco calentamientos completos registrados por
perfil/operación además de 30 muestras válidas medidas, funcionalidad confirmada y
umbral cumplido; los calentamientos no integran las estadísticas temporales.
`calentamiento=true`, `valida=true`, `resultado_funcional=ok` y ambos conteos de notas
visibles presentes definen un calentamiento completo, sin exigir tiempo ni traza.
Las muestras medidas válidas también deben tener ambos conteos de notas visibles;
si falta cualquiera, el grupo queda `PENDING` salvo fallo medido. El resumen cuenta
las filas afectadas sin excluir sus tiempos ni ocultar fallos.
`FAIL` refleja al menos una muestra válida fuera de umbral o fallo funcional;
`PENDING` refleja evidencia insuficiente, incluidos calentamientos ausentes o
incompletos. Los errores de integridad producen exit no
cero; `FAIL`/`PENDING` estructuralmente válidos producen exit cero. La CLI **no**
captura latencias/FPS, identifica límites de traza ni cierra RNF-002/RNF-004 por sí
sola. El autor debe revisar, adjuntar evidencia y aprobar o comunicar fallas.
**No se ejecutó medición Android en este PR.**

## Qué no se afirma

Este apartado conserva los límites de la **preparación original de PR #16**;
el checkpoint físico posterior se distingue en el seguimiento de la sesión 1.

No hay latencias Android, FPS, prueba de bloqueo/terminación ni APK nuevo en esta entrega.
No se accedió al teléfono ni a bases personales. El host Linux no tiene `adb`/Java
en PATH. RNF-002/RNF-004 siguen **pendientes**; RNF-009/RNF-010 no mejoran de estado
por generar datos o ejecutar SQLite en memoria.

La revisión de esta preparación puede hacerse ahora. Para continuar las mediciones se
necesita acordar con el autor dispositivo, APK identificable y espacio de prueba seguro.
Para un debug privado autorizado usar el deploy habitual e identificar canal/origen
y hash del APK, sin bump por cada prueba. Un candidato/entrega posterior requiere
versión/code nuevos y firma compatible; no reemplazar el asset publicado. Ver el
[flujo Android](../flujo-desarrollo-android.md#identificación-de-compilaciones-en-acerca-de).
El PR no autoriza instalación,
reemplazo de datos, merge, tag o publicación automáticos.

Una vez recibida la evidencia del teléfono, acordar un PR de seguimiento desde `main`
actualizado, solo después de cerrar la tarea que esté en revisión; no reutilizar la rama
eliminada ni abrir un segundo frente. Un fallo RNF se registra con sus muestras y cualquier
corrección se prioriza por separado. El filtro oculto quedó resuelto por PR #18
(`3898db8`); quitar los filtros visibles activos y verificar 50/500 resultados antes
de medir. El reporte de septiembre conserva la observación histórica, no reabre esa deuda.

Las próximas dos sesiones aprobadas son **RNF-002/004** y después **RNF-009/010**,
con revisión, autorización, integración y limpieza entre frentes. Seguir el
[plan vigente](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md#continuidad-aprobada--2026-10-02);
las muestras/dispositivo F3 siguen **PENDING**.
