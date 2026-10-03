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
checkpoint siguiente; la captura original se completó posteriormente en el
[cuarto piloto](#cuarto-piloto--captura-completada-semántica-pendiente), pero las métricas siguen **PENDING**. Los dos primeros intentos
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
El primer fallo sin raw y el segundo rechazo de 100 bytes permanecen diferenciados.

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


**Verificación de esta entrega documental (2026-10-03; alcance registrado en `dfa7627`):** no se reparó
stdin ni se modificó Java/JS/Python/test-infra. Código acumulado idéntico a `a8792de`;
la evidencia física anterior sigue perteneciendo a sus fuentes script/helper/APK reales.
Con Node **22.20.0 / npm 10.9.3** existentes y PATH solo de sesión:

- `python3 -m unittest discover -s scripts/tests -p test_webview_pilot.py -v`: **40/40
  PASS** ejecutados de nuevo en esta entrega, no atribuidos al checkpoint anterior.
- `npm run verify` íntegro, una ejecución: **exit0, 77 archivos/1167 app +68 tooling**,
  build web y controles completos. Avisos de lint/tamaño existentes, sin degradar fallos.
- `npm run check:docs`, `npm run check:traceability`, enlaces suplementarios de siete
  fuentes (incluye TODO) y `git diff --check`: **PASS**. Los ajustes posteriores del
  registro factual son solo documentales y se revalidan con esos controles.
- SHA-256 script: `9fbb3400210bd81e4efb03de7c280bb4d591867d4c5f2ee6e1b4888a458d5a3c`;
  tests: `0d59653738238c9858850ee5284ad24addd2f9f80b1ba9e631c940ef26899ad6`, sin cambios.
- **Sin compilación Android ni USB desde este host**, sin nueva captura/CSV/mediciones,
  release o merge. La entrega sigue DRAFT: tests host no resuelven el bloqueo ni F3.



### Reparación host y continuidad local — 2026-10-03

**Nueva autorización posterior a la entrega inicial:** el autor pidió un intento acotado
para resolver el impedimento en la **misma rama/PR**, sin integrar ni limpiar todavía.
La continuación Debian (Astra/max solo para esa ronda) quedó interrumpida por límite
de uso tras modificar el coordinador y sus tests. El autor autorizó al coordinador
retomar por SSH, revisar/completar la unidad, hacer commit/push y después fetch/pull
local para preparar la prueba. Los borradores antiguos de Debian se respaldaron
fuera del repo con aprobación explícita y **no se reaplicaron**; se partió del último
HEAD publicado `6d5bc5c`. No hay nueva rama, cambios de producto, versión o dependencias.

**Reproducción y corrección host:** una PTY sintética en Debian confirmó que `select`
puede indicar lectura disponible con bytes parciales + VEOF mientras `readline`
sigue bloqueado. La corrección lee bytes no bloqueantes desde una apertura independiente
de la misma terminal: conserva flags del stdin original y termios, sin flush ni registrar
lo escrito. Solo una línea Enter vacía confirma; EOF/texto/plazo/interrupción/final del
nativo abortan. No se usa un hilo de lectura que quede vivo después del timeout.
Los subprocess del coordinador y el hijo de instrumentación reciben stdin DEVNULL.
Esto elimina un riesgo de lector heredado, **no demuestra que ADB consumiera el Enter**
del tercer piloto ni modifica su evidencia histórica.

El plazo absoluto es el menor entre READY + 90 s y lanzamiento host + 110 s, con
margen conservador respecto de los 120 s nativos. Se consulta un READY fresco/estricto,
se comprueba proceso y plazo otra vez antes de un único start con timeout restante;
no se reintenta la señal. `KeyboardInterrupt` registra **ABORTED/exit 130**, no un
PENDING sin error. Cleanup y postcheck intentan conservar el error primario y registran
fallos secundarios; una limpieza/identidad sin confirmar no produce éxito.
No hay cambios Java: el auxiliar instalado conserva su fuente/hash y el reuso exacto
no requiere compilar ni instalar. HEAD del script nunca se confunde con el APK auxiliar.

**Evidencia ejecutada en Debian:** Python 3.13.5, Node 22.20.0/npm 10.9.3 existentes;
`python3 -m unittest discover -s scripts/tests -p test_webview_pilot.py -v`: **59/59 PASS**,
repetidos por el coordinador tras retomar. Incluyen PTY real, Enter/CRLF fragmentado,
EOF/bytes parciales/silencio/lector competidor, flags/termios intactos, SIGINT y
ningún start tardío/sin confirmación/tras final nativo, además de las 40 regresiones previas.
`npm run verify` íntegro: **exit 0**, 77 archivos/1167 tests de aplicación y
68 tests de tooling; controles y build web completos, sin omisiones.
Los avisos existentes no se convierten en fallos ni en aceptación nativa. Los cambios
documentales posteriores se revalidan con docs/traceability/enlaces y diff-check.

**Límite de ese checkpoint:** reparación host revisada y verificable, **validación nativa entonces pendiente**;
el resultado posterior está en el [cuarto piloto](#cuarto-piloto--captura-completada-semántica-pendiente).
No se ejecutó Android ni captura nueva desde Debian; no se acredita READY → CAPTURING
→ cierre SDK/traza/hash/semántica por estos tests. Antes de un piloto local único,
comprobar checkout limpio/HEAD/upstream, dispositivo/target/helper exactos, ausencia de
instrumentación concurrente y confirmación del operador. Solo se contempla reuso del
auxiliar conocido, sin build/install, datos nuevos/importación/restauración ni cambio
del APK principal. Preparar fuera del intervalo y guardar/scroll solo durante CAPTURING.
Ante otro fallo, conservar la evidencia y detenerse, sin series/reintentos automáticos.
**RNF-002/004 siguen PENDING** con sus umbrales intactos; PR DRAFT, sin ready/merge.

### Cuarto piloto — captura completada, semántica pendiente

**2026-10-03, 09:36:48–09:37:43 UTC, Mac/USB local:** el autor autorizó expresamente
**un único piloto de 8 s**, reusando el auxiliar exacto sin build/install ni cambiar
el APK principal, y reconoció el posible reinicio por instrumentación. Preflight:
checkout limpio/HEAD/upstream `f237f10698e6221086bae12ed7888f16efb0dbc5`, 59 tests host
PASS también en Mac (Python 3.14.6), CI Quality Gate/GitGuardian del mismo HEAD SUCCESS;
Node 22.20.0/npm 10.9.3, JDK 21.0.10, Gradle 8.14.3 ya existentes. Samsung
SM-G965F/Android 10/API 29/WebView 153.0.8010.36, usuario 0.

**Captura completada realmente:** READY visible, autor respondió «lista» a la nota
preparada sin guardar; Enter recibido por el host, **START_COMMAND_COMPLETED** y
CAPTURING visible. JUnit **OK (1 test)**, salida host **0**,
`CAPTURED_PENDING_REVIEW`, confirmación `OutputStream.close` y hash/tamaño Android–Mac
iguales. Intervalo observado start-call-before → stop-call-after **8019,627725 ms**,
menor al máximo 10 s del piloto (no latencia CRUD). Traza JSON original **1456872 bytes,
7681 eventos**, SHA-256:
`5d05187ccbe6f7dc2d8c7c65a5402fdc11946c72f81cb3451b367b38b769a200`.
Reporte host original SHA-256:
`2c91fd5552b27b817fd08981f32a32e04b964545b8af08a855581f03b84f8a88`.

Auxiliar **REUSED_VERIFIED**, no instalación: hash `43e1…` y fuente `e4bef6b` completos
registrados arriba; script `f237f10`, no fuente del APK principal. Target E5,
`0.5.0/500`, APK `599d…`, certificado y ruta **iguales antes/después**.
No restore/seed/importación, build, APK nueva ni nuevas series. El autor respondió
«listo» después de CAPTURING y confirmó explícitamente que **la nota se guardó
correctamente y realizó el scroll durante el aviso CAPTURING**. Es confirmación
funcional del operador, no timestamps instrumentados ni un conteo final. Los originales/revisión estructural siguen privados e ignorados,
no se publican seriales, bases, logs completos o contenido de notas.

**Revisión estructural, no métricas aceptadas:** la traza contiene Browser/Renderer
(el Browser coincide con el PID target) y 44 pares `PipelineReporter` completos:
16 `STATE_PRESENTED_ALL`, 20 `STATE_DROPPED`, 8 `STATE_NO_UPDATE_DESIRED`, ningún
`STATE_PRESENTED_PARTIAL` en esos pares. Todos declaran `SCROLL_NONE`; un evento
`GestureProvider::OnTouchEvent`, sin `EventLatency` ni `clock_sync`/fase de clock sync.
Estos son conteos de reportes, **no FPS, pérdidas globales ni latencia input→feedback**.
La [definición primaria de Chromium](https://chromium.googlesource.com/devtools/devtools-frontend/+/b88894b14f63f84c460f66cff8918b2b4d079eae/front_end/models/trace/types/TraceEvents.ts)
distingue actualización completa/parcial/no actualización; es referencia semántica,
no prueba de correspondencia binaria exacta con la WebView instalada. No se supone
que un frame reportado sea el primer feedback correcto del guardado.

**Impedimento residual concreto:** todavía falta identificar el input de guardar y
su primer frame correctamente presentado/resultado funcional, mapear los relojes,
comprobar pérdidas/completitud y ventanas de scroll. La traza de 8 s no acredita
los 3 × 10 tramos con 500 resultados ni las 180 muestras + 30 calentamientos.
No se atribuye `SCROLL_NONE` a un fallo del operador sin evidencia de sus acciones;
no se infiere que el JSON sea lossless por salir 0. Handshake/captura/cierre están
validados para este único artefacto/dispositivo, **RNF-002/004 permanecen PENDING**.
No otra captura ni cambio de categorías/método por iniciativa: revisar esta evidencia
y acordar el siguiente paso antes de series. PR DRAFT y sin autorización de merge.

### Diagnóstico semántico acotado — piloto 04

**Continuación autorizada el 2026-10-03:** revisión offline/documental de las fronteras
del artefacto ya capturado, no otra captura, instalación o reparación de stdin.
Debian parte del checkpoint publicado `fc2f028`; **no tiene ni inspeccionó el JSON
original privado**. Los conteos siguientes proceden del inventario anonimizado
aportado por el operador y de la evidencia del cuarto piloto, no de una medición remota.
Los 44 pares se emparejaron localmente por `pid/tid/cat/id2` con stack, sin extremos
sin pareja en ese conjunto; esto no demuestra completitud de toda la traza.

| Frontera | Evidencia disponible | Conclusión y carencia concreta |
|---|---|---|
| Entrada de Guardar → resultado correcto | Un `GestureProvider::OnTouchEvent`, cero `EventLatency`; confirmación funcional del autor | No se identifica qué input disparó Guardar ni se enlaza con el primer frame que muestra la tarjeta/feedback correcto. Un touch genérico o la confirmación posterior no aporta esos timestamps. Latencia/desgloses vacíos. |
| Presentación y clasificación | 16 reportes ALL, 20 DROPPED, 8 NO_UPDATE_DESIRED, 0 PARTIAL; nombres de etapas de presentación | Son estados del pipeline reportado, no un censo deduplicado de frames físicos de Lumapse. ALL no demuestra contenido funcional correcto; NO_UPDATE no es una actualización presentada. DROPPED tampoco significa evento perdido del archivo. No se calcula FPS ni un FAIL RNF. |
| Scroll y ventanas | 44 SCROLL_NONE; autor confirmó scroll durante CAPTURING; perfil 500 no cargado | La clasificación observada no reconstruye el gesto/ventana y no desmiente al operador. Faltan los 3 × 10 tramos de 1 s con 500 resultados. No dividir 16 por los 8 s del piloto. |
| Relojes | Llamadas SDK en `elapsedRealtimeNanos`; cero `clock_sync`/fase `c` informados | No hay correlación documentada con `ts` Chromium. Convertir ns a otra unidad no establece dominio/origen/offset; la duración de captura no es latencia CRUD. |
| Atribución y completitud | Browser coincide con target PID, Renderer identificado; cierre/hash/bytes cotejados | El hash verifica transferencia, no cobertura de todas las superficies ni ausencia de pérdidas. Cero pares huérfanos no prueba que no falten pares enteros. Scope/loss siguen pendientes. |

**Fuentes primarias y límites de correspondencia:**

- [TracingController](https://developer.android.com/reference/android/webkit/TracingController)
  documenta captura WebView y salida JSON; no ofrece por ese contrato una frontera de
  resultado correcto de Lumapse. [TracingConfig](https://developer.android.com/reference/android/webkit/TracingConfig)
  describe conjuntos de categorías típicos, no garantiza un evento concreto.
  `RECORD_UNTIL_FULL` deja de registrar al llenarse: 7681 eventos y cierre correcto
  no prueban que el búfer no se agotara ni cuál fue su capacidad efectiva.
- [TraceEvents.ts, revisión `b88894b`](https://chromium.googlesource.com/devtools/devtools-frontend/+/b88894b14f63f84c460f66cff8918b2b4d079eae/front_end/models/trace/types/TraceEvents.ts)
  distingue actualizaciones completas/parciales, no actualización y descarte;
  contempla reportes FORKED/BACKFILL y campos de fuente/secuencia/árbol. Emparejar
  reportes no equivale a deduplicar frames. [Emisor Chromium, revisión `6718b70`](https://chromium.googlesource.com/chromium/src/+/6718b706ff100957d755554cec783840a8f1f05b/cc/metrics/compositor_frame_reporter.cc)
  publica estado, identidad del frame y clasificación de scroll del pipeline.
  Son referencias orientativas: **no se verificó su correspondencia con el build
  exacto WebView 153.0.8010.36**. La consulta del source por ese tag no devolvió
  contenido utilizable; no demuestra que el tag o la funcionalidad no existan.
- [SystemClock](https://developer.android.com/reference/android/os/SystemClock#elapsedRealtimeNanos())
  define el reloj SDK desde el arranque, incluyendo suspensión profunda; esto por
  sí solo no identifica el reloj de los eventos Chromium del artefacto.

**Decisión de esta unidad:** no hay base para una serie ni para afirmar que el SDK
sea intrínsecamente incapaz de medir. Tampoco se justifica un parser nuevo o cambios
en `inspect_trace`: ya deja métricas `null` y RNF PENDING; sin el raw ni su esquema
verificado, automatizar relaciones supuestas sería especulativo. Se mantienen sin
cambios captura/handshake/categorías, Java/helper, producto y el analizador F3.

**Verificación de esta revisión documental (Debian, Python 3.13.5;
Node 22.20.0/npm 10.9.3):** suite host existente
`python3 -m unittest discover -s scripts/tests -p test_webview_pilot.py -v`,
**59/59 PASS, exit 0**; `npm run check:docs`, `npm run check:traceability`,
auditoría suplementaria de los siete archivos modificados (incluido TODO, 152 enlaces
internos) y `git diff --check`: **exit 0, sin problemas**. No nuevas regresiones,
inspección del raw, ejecución Android ni equivalencia metrológica demostrada.
Además se ejecutó manualmente una vez `npm run verify` íntegro: **exit 0**, 77 archivos /
1167 tests de aplicación y 68 de tooling, build web y todos los controles; versión
`0.5.0/500` intacta. La anotación posterior de ese resultado solo cambia documentación
y se revalida con docs/traceability/enlaces/diff-check, sin otra ejecución del gate.

**Siguiente acción mínima solicitada:** una consulta local **solo lectura y offline**
sobre el original del cuarto piloto, cotejando su SHA-256 ya registrado; devolver
únicamente presencia/conteos agregados, nunca IDs, URLs, notas ni el raw:

1. En los pares `PipelineReporter`, presencia de `chrome_frame_reporter`/`frame_reporter`
   y de `frame_source`, `frame_sequence`, `layer_tree_host_id`, `frame_type`,
   `has_missing_content`; cantidad de tuplas fuente/secuencia/árbol distintas,
   duplicadas y sin campos suficientes, sin publicar sus valores.
2. Para el touch y `Graphics.Pipeline`, presencia de identificadores/flows de
   correlación y número de enlaces inequívocos a un reporte/etapa de presentación;
   admitir **no identificable**. Para `SwapEndToPresentationCompositorFrame`,
   `SubmitCompositorFrameToPresentationCompositorFrame`, `WaitForPresentation` y
   `SkiaRenderer::SwapBuffers`, solo fases/conteos y disponibilidad de límites
   temporales/identidad de frame, sin tratarlos como frames distintos.
3. Presencia de metadatos explícitos de unidad/dominio/sincronización de reloj y
   búfer/pérdidas; un campo ausente queda ausente, nunca cero pérdidas por defecto.

La consulta debe declarar su procedimiento y las ambigüedades. La solicitud anterior
se ejecutó localmente según el [resultado siguiente](#consulta-estructural-local--resultado). Aunque encuentre
identidades/flows, todavía deberá demostrarse qué frame contiene el resultado
correcto de Guardar: los conteos no lo certifican. Si faltan enlaces, identificación
de contenido, relojes o completitud, **detener esta vía antes de series** y presentar
al autor el ajuste mínimo y su impacto; no otro piloto/helper/categorías/instrumentación
por iniciativa. Esta consulta no requiere operar la app ni transferir el original a
Debian. RNF-002/004 PENDING; RNF-009/010 no iniciados, umbrales y evidencia histórica intactos.

### Consulta estructural local — resultado

**2026-10-03, 20:39:03 UTC, Mac, Python 3.14.6:** el autor autorizó continuar con
el siguiente paso lógico tras explicar la revisión offline. Una consulta privada
`rtk proxy python3 <consulta-privada.py>` (ruta anonimizada), **exit 0**, leyó el
original del cuarto piloto, no Android ni una copia remota. SHA-256 original
`5d05187ccbe6f7dc2d8c7c65a5402fdc11946c72f81cb3451b367b38b769a200`
**igual antes/después**, 1456872 bytes / 7681 eventos. Consulta y salida agregada
permanecen privadas e ignoradas; SHA-256 de la consulta
`17415c7f3dfe0e1c513def29d519ba5e4d0ca2c1889f1390c79ad761921cb13c`
y del resumen `dc0ccec2a9b961a080686ac8f0ca047073604bd803bb62d23cb1c9b0197c30f9`.
No se transfirió raw ni se publicaron IDs, PID/tid, URLs o notas.

**Procedimiento y límite:** selección por nombres exactos; emparejamiento `b/e`
con stacks por `pid/tid/cat/name/id2` (fallback `id`) y scope, en el orden original;
unión de campos de los diccionarios `frame_reporter`/`chrome_frame_reporter` de los
extremos, contando conflictos. Se inspeccionaron claves conocidas de correlación,
reloj y búfer/pérdidas, sin publicar valores. Comprobaciones sintéticas previas de
emparejamiento simple/anidado, huérfanos y timestamps inválidos PASS; no son nuevas
regresiones del producto. No se reconstruyó una cadena causal por proximidad temporal
ni por coincidencia numérica de IDs de namespaces no verificados.

| Consulta | Resultado observado | Qué no acredita |
|---|---|---|
| PipelineReporter | 88 eventos, 44 pares completos, 0 huérfanos; 44 límites finitos/ordenados; 44 diccionarios `frame_reporter`, 0 `chrome_frame_reporter`, sin conflictos | No prueba completitud global ni un frame físico por par. |
| Identidad fuente/secuencia/árbol | Los tres campos presentes en 44 pares: **36 tuplas distintas, 8 grupos duplicados y 8 reportes adicionales que comparten identidad**; ninguno incompleto | No convertir 44 reportes ni 36 tuplas en un censo de frames presentados/FPS. La identidad estructural no certifica superficie/contenido correcto. |
| Clasificación | Estados 16 ALL / 20 DROPPED / 8 NO_UPDATE, como el inventario anterior; `frame_type` ausente en 44, `has_missing_content=false` en 44 | Ausencia de `frame_type` no demuestra ausencia de FORKED/BACKFILL; `has_missing_content=false` no identifica la tarjeta correcta de Guardar. |
| Entrada | Un `GestureProvider::OnTouchEvent` de fase X con `ts/dur`; sin las claves de correlación inspeccionadas | No identifica el botón Guardar ni enlaza su input con el primer feedback correcto. No se afirma que el usuario no guardó o no hizo scroll. |
| Graphics.Pipeline | 224 eventos: 80 X, 72 s, 72 f; `id` en 144 y `frame_sink_id` en 16 | Existen flows, pero no se demostró el puente touch→Guardar→presentación correcta. Número de enlaces inequívocos **no determinado**, no un cero medido. |
| Etapas de presentación | `SwapEndToPresentationCompositorFrame` y `SubmitCompositorFrameToPresentationCompositorFrame`: cada nombre 32 eventos (16 b / 16 e), `ts/id2` presentes. `WaitForPresentation`: 8 n con `ts/id2`; `SkiaRenderer::SwapBuffers`: 8 X con `ts/dur` | Son extremos/etapas, no frames diferentes para sumar ni timestamps del resultado correcto. No se validó su correspondencia causal. |
| Relojes y pérdidas | Cero `EventLatency` y fase c; 481 s / 481 f en toda la traza. Sin claves explícitas de reloj de la lista inspeccionada. Dos claves `buffer_size` en nivel superior/metadatos | No declarar ausencia de cualquier metadato posible ni pérdida cero. Presencia de tamaño no prueba capacidad efectiva/saturación; ni los flows globales validan sincronización/completitud. |

Las claves de correlación revisadas fueron `id/id2/bind_id/flow_in/flow_out`,
`frame_token/frame_sink_id/trace_id/latency_id/interactionId/interaction_id/touch_id/flow_id/begin_frame_id`.
Para reloj: `displayTimeUnit/clock-domain/clock_domain/clock_id/clock_name/clock_sync/time_unit/timestamp_unit/trace_clock`;
para búfer/pérdidas: `trace_buffer_size/buffer_size/buffer_usage/buffer_overflow/overflow/events_dropped/lost_events/data_loss/data_loss_occurred/trace_stats`.
Es una búsqueda explícitamente limitada, no prueba de ausencia de campos desconocidos.
La [referencia Chromium ya citada](https://chromium.googlesource.com/devtools/devtools-frontend/+/b88894b14f63f84c460f66cff8918b2b4d079eae/front_end/models/trace/types/TraceEvents.ts)
orienta esas claves/fases; sigue sin cotejo binario con WebView 153 instalada.

**Conclusión y siguiente decisión:** esta consulta aporta duplicación de identidades
y disponibilidad concreta de etapas/flows, pero **no habilita muestras válidas ni
FPS**. Se detiene antes de otra captura/serie; no insistir con el mismo piloto sin
resolver la frontera ausente. El ajuste a evaluar debe poder identificar el input
de Guardar y vincular el contenido esperado con su primera presentación, además de
justificar dominio/offset de relojes, atribución y completitud. Se necesita una
propuesta técnica acotada con impacto/calibración y revisión del autor antes de
cambiar helper/categorías/método o compilar/instalar. La disponibilidad de root y el
permiso general de tocar el teléfono de pruebas no validan esa equivalencia ni
requieren usar privilegios. No nuevo piloto, acceso Android, instalación, alteración
de datos/APK, cambio de código o métrica en esta revisión; RNF-002/004 **PENDING**.

Verificación documental local: `npm run check:docs` (96 archivos / 818 enlaces),
`npm run check:traceability`, auditoría suplementaria de las siete fuentes cambiadas
(incluido TODO, 158 enlaces, cero problemas) y `git diff --check`: **exit 0**.
No se ejecutaron otra captura ni nuevas pruebas Android para esta anotación.

### Evaluación del ajuste mínimo — frontera de presentación

**2026-10-03, continuación autorizada en Debian:** el autor permitió diseñar y,
**solo si se justificaba Guardar → primer resultado correcto realmente presentado**,
ajustar helper/categorías con tests y push. No autorizó instalación ni otro piloto.
Se contrastaron los contratos públicos y el código vigente; el original sigue privado
en Mac. **El gate de implementación no se supera:** no se encontró una cadena
justificada dentro de ese ajuste mínimo. No se modifica helper, categorías ni host.

**Propuesta mínima evaluada, no adoptada:** input real → comprobación del contenido
esperado → estado visual listo → commit/copia del frame → enlace a presentación en
la traza. Debe identificar una misma operación, superficie y frame, no asociar eventos
solo por proximidad temporal. Las fronteras se revisaron así:

| Eslabón | Contrato/código comprobado | Resultado del gate |
|---|---|---|
| Input real | [MotionEvent.getEventTime](https://developer.android.com/reference/android/view/MotionEvent#getEventTime()) usa `uptimeMillis`; no el reloj `elapsedRealtimeNanos` de las llamadas SDK | Un listener podría aportar el instante de entrada, no la identidad semántica Guardar ni el extremo final. Faltarían correlación con la operación y mapeo de relojes; no se añadió listener. |
| Contenido correcto | [NoteEditor.handleSave](../../src/components/note-editor/NoteEditor.js) cambia el botón a `Guardando...` **antes** de esperar `NoteStore.createNote/updateNote`; el [protocolo CRUD](./protocolo.md#4-rnf-002--latencia-crud) exige la tarjeta/estado final correcto | La primera respuesta visual al toque puede ser progreso, no éxito. Para crear se requiere confirmación, formulario cerrado y nueva tarjeta visible; editar y papelera conservan sus finales propios. No se redefine el indicador como resultado aceptado. |
| Estado listo | [VisualStateCallback](https://developer.android.com/reference/android/webkit/WebView.VisualStateCallback) notifica disponibilidad para el próximo `onDraw` | No es confirmación de dibujo ni de presentación. |
| Commit y contenido del búfer | [registerFrameCommitCallback](https://developer.android.com/reference/android/view/ViewTreeObserver#registerFrameCommitCallback(java.lang.Runnable)) confirma render/envío a swapchain y advierte que el frame puede no ser visible; [PixelCopy](https://developer.android.com/reference/android/view/PixelCopy) copia el último búfer encolado | Ni combinados aportan un acuse de presentación física o prueban que sea el primer frame correcto. Una copia correcta no resuelve este extremo. |
| Métricas de ventana | [FrameMetrics](https://developer.android.com/reference/android/view/FrameMetrics#TOTAL_DURATION) termina `TOTAL_DURATION` en render/envío al subsistema; su `FRAME_TIMELINE_VSYNC_ID` público requiere API 36, no API 29 | No sustituye el instante de presentación ni enlaza por sí solo contenido/frame/superficie. No se adopta como FPS o latencia CRUD. |

**Contraejemplo contractual, no una nueva observación física:** aunque la comprobación
de contenido fuera perfecta, un callback y una copia pueden terminar con el búfer
correcto todavía encolado. También faltaría descartar una presentación correcta
anterior al callback. Por ello esa cadena no garantiza ni presentación ni **primera**
presentación; una regresión con mocks solo probaría el orden simulado.

**Por qué no basta añadir categorías:** el helper ya solicita INPUT_LATENCY,
RENDERING y FRAME_VIEWER. En [AwTracingController, `main` consultado el 2026-10-03](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/android_webview/java/src/org/chromium/android_webview/AwTracingController.java)
(blob `2d6a6ce513a2c5b8490bd886c751e8bd5721fee9`), INPUT_LATENCY ya incluye
`benchmark/input` y RENDERING incluye `cc`. Seleccionar más emisores no crea una
comprobación del contenido correcto ni una garantía de presentación. No se atribuye
la ausencia observada de EventLatency a categorías erróneas sin cotejar el build.

Además, [EventLatencyTracingRecorder, `HEAD` consultado el 2026-10-03](https://chromium.googlesource.com/chromium/src/+/HEAD/cc/metrics/event_latency_tracing_recorder.cc)
(blob `e42956a79298a2c40f6f3d87fb25d4c33ef4499d`) documenta una limitación WebView:
en la ruta descrita el tiempo de presentación coincide con inicio de swap y falta
recibir presentación como en Chrome. [HardwareRenderer, revisión `a6f13d0`](https://chromium.googlesource.com/chromium/src/+/a6f13d05946c819b20d2e0043801b473246a6e57/android_webview/browser/gfx/hardware_renderer.cc)
construye feedback mediante `TimeTicks::Now()` y flags cero después de DrawAndSwap.
Estas fuentes son evidencia de que **el nombre Presentation no garantiza el extremo
requerido**, no prueba de la ruta usada por el Samsung. **No se verificó correspondencia
con el binario WebView 153.0.8010.36**; no se declara incapacidad universal del SDK.

**Condiciones falsables para reabrir implementación:** identificar input/operación;
demostrar contenido final correcto vinculado a una identidad de frame/superficie;
obtener su presentación real con cobertura de los frames anteriores para afirmar
primacía; y justificar dominios/offsets, deduplicación, pérdidas/completitud y
calibración del overhead. Más eventos pueden cambiar coste/ocupación del búfer:
no se supone overhead nulo ni se resta una constante inventada. La consulta local
previa no satisface estas condiciones; no se solicitan más conteos sin una señal útil.

**Decisión y permiso mínimo pendiente:** no programar un helper especulativo ni pedir
otro piloto de esta cadena. Para continuar más allá del alcance actual, solicitar
autorización **solo de diseño** de un método que combine una señal verificable de
presentación del compositor/display atribuible a Lumapse con una comprobación
funcional por operación. Su fuente exacta, acceso necesario, privacidad y calibración
deben presentarse antes de elegir herramienta o autorizar implementación/build/
instalación/captura. Esto no autoriza trazado global, root, acceso Chrome ni modificar
producto, y no afirma que tal señal esté disponible en API 29. Una eventual adopción
que cambie tooling/metodología requiere el ADR y revisión previstos en CONTRIBUTING;
aquí no se adopta un método ni se cambia arquitectura. Sin esa justificación,
RNF-002/004 permanecen **PENDING**, no FAIL del producto; umbrales intactos.

**Verificación de esta unidad documental (Debian; Node 22.20.0/npm 10.9.3,
Python 3.13.5; código base `fb064d7` sin cambios):**
`python3 -m unittest discover -s scripts/tests -p test_webview_pilot.py -v`:
59/59 PASS, exit 0, suite existente con PTY reales, no nuevas regresiones.
`npm run check:docs` (96 archivos / 825 enlaces), `npm run check:traceability`,
auditoría suplementaria de los siete archivos modificados (incluido TODO, 166 enlaces)
y `git diff --check`: exit 0, sin problemas. No se ejecutan `npm run verify`,
compilación Java ni validación Android nueva en esta revisión solo documental;
los resultados previos de verify/piloto no se presentan como pruebas de este gate.

Los pilotos primero a tercero no produjeron traza; el cuarto sí conserva el original
identificado arriba. No se recibieron calentamientos ni muestras cuantitativas válidas para esta sesión.
RNF-002/RNF-004 siguen **PENDING**. El PR DRAFT autorizado entrega herramientas y bloqueo,
no cierre F3 ni evidencia cuantitativa completada.
La sesión 2 RNF-009/RNF-010 no se inicia. El acuerdo y la carga no rebajan umbrales,
no aportan latencias/FPS ni sustituyen el cotejo de trazas por el autor; la evidencia
histórica de septiembre permanece intacta.

### Ensayo local de Artemis — instalación, no métricas

**2026-10-03:** el autor autorizó instalar Artemis y eligió una primera verificación
local **sin API ni envío de capturas**. Se completaron instalación Python aislada,
comprobación de sus 176 paquetes, CLI y dos handshakes MCP; cero llamadas a herramientas
del teléfono. Su servidor directo publica toque/scroll sin lanzar el agente autónomo,
pero **aún no se probó el control del Samsung** ni se instaló el helper de Artemis.
El registro MCP es local, ignorado y con aprobación por herramienta; la conexión del
cliente debe comprobarse antes de operar. Pin, aislamiento, compatibilidad y siguiente
paso están en [ADR-012](../adr/ADR-012-ensayo-local-artemis.md).

Este ensayo no cambia APK/datos de Lumapse, no ejecuta otro piloto y no demuestra
Guardar → primer frame correcto presentado ni FPS. RNF-002/RNF-004 **PENDING**;
la propuesta anterior de solo diseño no limita la instalación aquí autorizada,
pero no se adopta un método metrológico ni se modifica el protocolo de aceptación.

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

La vía Chrome/CUA está bloqueada y no se elude; el [cuarto piloto SDK](#cuarto-piloto--captura-completada-semántica-pendiente)
completó captura/cierre, pero la revisión semántica sigue pendiente. Solo después
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
