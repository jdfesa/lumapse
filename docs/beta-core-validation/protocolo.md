# Protocolo F3 — Datos sintéticos y evidencia Android

**Versión del protocolo:** 1, 2026-09-14. **Estado:** preparado, no ejecutado en Android.
Alcance: RNF-002, RNF-004, subconjunto de RNF-009/RNF-010 y diagnóstico AUD-010/AUD-011.
Los criterios de los [RNF](../producto/requisitos-no-funcionales.md) no se relajan.

## 1. Preparación local reproducible

Usar Node **22.20.0** / npm **10.9.3** del proyecto, sin `NODE_OPTIONS`, y Python 3.
El checkout debe ser el SHA que se va a revisar, con cambios ajenos preservados:

```bash
git status --short --branch
git rev-parse HEAD
npm run check:runtime
npm run verify
python3 scripts/generate-test-fixture.py --profile f3-small --output-dir tmp/f3/small
python3 scripts/generate-test-fixture.py --profile f3-500 --output-dir tmp/f3/large
python3 scripts/test-fixture-db.py export-backup tmp/f3/small/dataset.json tmp/f3/small/lumapse-2026-09-13-12-00.zip --seed-date 2026-09-13
python3 scripts/test-fixture-db.py export-backup tmp/f3/large/dataset.json tmp/f3/large/lumapse-2026-09-13-12-00.zip --seed-date 2026-09-13
```

La semilla predeterminada es `20260913`; el ZIP fija fechas a partir de `2026-09-13`
(timestamps al mediodía UTC), orden de entradas, atributos y compresión STORE. Los
hashes y bytes de referencia están en [resultados](./resultados-2026-09-14.md).
El exportador **rechaza sobreescribir**: para regenerar, usar otro destino y comparar
SHA-256, no borrar un backup existente sin revisarlo. No abre SQLite personal ni ADB.
La salida y las capturas/logs son temporales ignorados, nunca migraciones productivas.

| Perfil | Materias / secciones | Visibles | Archivadas adicionales | Papelera adicional en JSON | Fechas | Notas en ZIP |
|---|---:|---:|---:|---:|---:|---:|
| `f3-small` | 10 / 20 | 50 | 18 | 12 | 20 | 68 |
| `f3-500` | 10 / 20 | 500 | 18 | 12 | 20 | 518 |
| `beta-500` existente, no comparación F3 | 10 / 39 | 500 | 18 | 12 | 40 | 518 |

Los perfiles F3 tienen dos secciones por materia, sin notas directas en Entrada o
raíces. Distribución: 25 activas por sección en el grande; 3 en las primeras diez y
2 en las restantes en el pequeño. Fijadas: 6%; contenido extenso: 2% de las activas,
además de seis variantes Markdown, estados y fechas reproducibles. La variación de
contenido se conserva como parte del perfil; no se presenta como experimento que aísla
solo cantidad de filas. La distribución detallada se genera en `DISTRIBUTION.md`.

El backup v1 **excluye papelera**. Para el camino de importación, crear 12 notas de
prueba adicionales y enviarlas a papelera por UI; no sacrificar ninguna de las 500.
Registrar esos IDs y sus fechas reales por separado: esto verifica conteos/casos, no
reproduce byte a byte las 12 filas eliminadas del JSON. El snapshot completo del
cargador existente es otra ruta, destructiva, no ejecutada ni necesaria en este PR.

## 2. Acuerdo de artefacto y protección de datos — antes de instalar/importar

Completar [sesion.template.json](./sesion.template.json) bajo `tmp/`:

- Operador, fecha/huso, SHA fuente completo, estado limpio, versión/code, variante,
  SHA-256 del APK y huella del certificado. Distinguir release publicada y candidato.
  `shaFuente` identifica el commit Git completo (40 caracteres hexadecimales para
  SHA-1 o 64 para SHA-256); no usar su abreviatura ni confundirlo con el hash del APK.
  Contrastar versión base/compilación/origen de Acerca de con la evidencia del APK;
  una etiqueta candidato no acredita firma/publicación/validación. Para debug privado
  usar el [deploy habitual](../flujo-desarrollo-android.md#identificación-de-compilaciones-en-acerca-de)
  autorizado, sin bump por cada prueba; un nuevo corte entregable se autoriza aparte.
- Modelo, Android/API, WebView y Chrome/DevTools, resolución, Hz, batería/carga,
  ahorro de energía, temperatura/estado térmico y conexión. Mantenerlos comparables.
- Dispositivo/perfil de pruebas **expresamente autorizado**; backup recuperable previo
  y procedimiento de restauración acordado. Un ZIP no respalda borradores ni papelera.
- Misma firma para actualizar sin pérdida. Ante firma incompatible, detenerse: nunca
  `uninstall`, `pm clear`, downgrade ni limpieza automática para lograr una instalación.
- Dos espacios de prueba independientes o restauración controlada entre perfiles en
  el mismo teléfono. Importar ambos ZIP en el mismo workspace suma notas y puede
  renombrar materias: invalida la comparación. No borrar datos reales para aislarlos.

En la Mac con las herramientas Android ya disponibles, comandos **de lectura**, con
el serial acordado en lugar del marcador (no seleccionarlo automáticamente):

```bash
adb devices -l
adb -s SERIAL shell getprop ro.product.model
adb -s SERIAL shell getprop ro.build.version.release
adb -s SERIAL shell getprop ro.build.version.sdk
adb -s SERIAL shell dumpsys webviewupdate
adb -s SERIAL shell dumpsys package com.lumapse.app
shasum -a 256 RUTA_APK
apksigner verify --print-certs RUTA_APK
```

Confirmar el applicationId contra `capacitor.config.json`/Gradle antes de sustituirlo
en comandos. Redactar seriales u otros identificadores personales en la evidencia pública.
No instalar Android Studio solo para esta preparación ni habilitar depuración en una
release de usuarios. Si falta información o el espacio seguro, dejar la prueba pendiente.

El cargador `load-test-fixture-android.sh` exige `main` limpio/sincronizado y autorización
destructiva `--yes`. **No ejecutarlo en esta rama ni relajar sus guardias**. Su self-test
Python usa un DDL copiado; la integración F3 adicional prueba el DDL productivo real.

### Piloto nativo experimental — autorización acotada del 2026-10-03

Ante la exportación manual sin archivo, el autor autorizó un **piloto de observabilidad**
con `androidTest`, script USB y **solo la APK auxiliar de pruebas**, si resulta necesario.
No autorizó reemplazar Lumapse, cambiar producción, firmas, sistema o dependencias,
ni adoptar por anticipado una equivalencia de métricas. El procedimiento y argumentos
están en [scripts](../../scripts/README.md#47-capture-webview-pilot-androidpy).
Se usa la API pública [TracingController](https://developer.android.com/reference/android/webkit/TracingController)
y [TracingConfig](https://developer.android.com/reference/android/webkit/TracingConfig),
disponibles desde API 28. No accede a Chrome Desktop ni rescata su traza anterior;
no usa CDP, sockets WebView, forwards, proxy, consola DevTools o captura global del sistema.

- **Precondición:** terminal interactiva, USB/serial explícito, mismo usuario Android 0,
  checkout revisado limpio y sincronizado, Node/npm canónicos, JDK 21 y SDK/caché Gradle
  ya existentes. Solo datos sintéticos de Lumapse con el respaldo/procedimiento acordados;
  no presupone cobertura completa de WebStorage. No otra instrumentación/grabación
  de Lumapse activa. La instrumentación **puede reiniciar el proceso**: preparar la UI
  después de `READY`, fuera de la traza, y registrar el efecto real sobre borradores/UI.
  `isTracing()` se comprueba en el proceso instrumentado y otra vez antes de iniciar;
  una traza ya activa aborta sin detenerla. Esto no recupera una sesión del proceso anterior.
- **Identidad y aislamiento:** manifest del helper esperado `com.lumapse.app.test`, runner
  existente y `targetPackage=com.lumapse.app`, certificado igual al APK instalado.
  El test exige paquete, UID y proceso de Lumapse antes de usar el singleton WebView;
  sus WebViews/renderers son el alcance, no las demás apps. No añade receivers ni hooks
  productivos. La atribución de procesos/superficies del JSON real aún debe cotejarse.
  El script verifica versión, certificado, SHA-256 y ruta instalada del **APK original antes y después**;
  fuente E5 del target y commit/hash del helper se registran por separado.
- **Una captura, no la serie:** preparación con plazos, luego una operación CRUD sintética
  y un scroll breve manuales. Solicitud de **8 s como máximo**, con margen para stop;
  un intervalo observado hasta retorno de stop superior a **10 s invalida el piloto**.
  Categorías `FRAME_VIEWER`, `INPUT_LATENCY`, `RENDERING`, sin categorías custom,
  modo `RECORD_UNTIL_FULL`; sin throttling/screencast ni flags globales. Overhead sin
  calibrar. El límite del búfer puede perder eventos: no declarar ausencia de pérdidas
  por silencio del JSON. Un bloqueo del UI thread/SDK puede impedir stop; si el cierre
  no se confirma, queda error/PENDING y se requiere intervención, no un éxito inferido.
- **Salida:** JSON original privado, sin reserializar, solo después del cierre confirmado
  del `OutputStream` por el SDK, byte count y SHA-256 coincidentes; metadatos, offsets
  temporales de llamadas/flush y un inventario estructural separado. No equiparar esos
  relojes con `ts` de Chromium sin verificar dominio/offset. El executor se cierra después
  del callback de cierre, no inmediatamente al retorno de stop; un error conserva límites
  honestos, sin limpiar/desinstalar/forzar parada del target ni usar root.

**Permiso posterior y stop rule vigentes:** tras dos fallos previos a READY se corrigió
la clasificación de archivo aún ausente. El tercer piloto (script a8792de, reuso exacto
helper 43e1…/fuente e4bef6b, sin compilación/instalación) llegó a READY pero quedó bloqueado en
readline del host; JUnit PREPARATION_TIMEOUT, sin start/traza/métricas. Target intacto;
[evidencia y causas diferenciadas](./README.md#tercer-piloto--bloqueo-stdin-y-entrega-de-tooling).
Se detiene el método: no otro piloto ni series. El autor autorizó **PR DRAFT de tooling
con bloqueo registrado**, no F3/RNF completadas. Este ajuste específico reemplaza la
prohibición anterior de PR checkpoint para este entregable; mantiene una rama y el
circuito de revisión/decisión del autor. No autoriza merge/ready, código correctivo,
otra captura ni otra rama. Reparación futura de lectura/preparación/interrupción exige
permiso y evidencia auténtica, sin atribuir consumo de Enter a ADB/proxy por hipótesis.
RNF-009/010 solo después de revisión, integración autorizada y limpieza de este frente,
acordando prioridad sin cerrar RNF-002/004. Sin umbrales menores, técnicas nuevas,
reinicios automáticos ni equivalencias inventadas.

**Criterio falsable del piloto:** el build/helper/manifiesto/firma pasan, el target permanece
idéntico, el SDK cierra y entrega JSON no vacío con `traceEvents`, y se pueden inspeccionar
entrada → **primer frame presentado con resultado correcto**, atribución a Lumapse y
clasificación completos/parciales/perdidos. La captura estructural exitosa no prueba la
última parte. Si falta esa semántica, dejar latencias/FPS/desgloses **vacíos y PENDING**,
describir la frontera ausente y detenerse antes de 180 muestras. El inventario nunca
cuenta `doFrame`, buffers enviados, promesas, rAF o INP como sustitutos.

El piloto **no cuenta** para los 30 calentamientos, 180 muestras CRUD ni 3 × 10 tramos
FPS de §4–5. Antes de una serie completa se requiere revisar el JSON real, calibración,
equivalencia/alcance de cualquier ajuste del método y aprobación; se conservan todos
los umbrales, originales/hashes/offsets y el cotejo del autor. Sin datos físicos, no cierre RNF.

## 3. Importación y precondición visible

1. Importar el ZIP del perfil en el espacio acordado mediante Backup → Importar ZIP;
   verificar preview de **30 contenedores, 68/518 notas, 20 fechas**, sin reparaciones
   ni renombrados. Reimportar: cero importables. Un resultado distinto invalida el setup.
2. Verificar 18 archivadas separadas y las 12 notas adicionales de papelera si se prepararon.
3. Quitar la fecha con **Quitar fecha** y la búsqueda previa con su control visible
   (PR #18); volver a Entrada y buscar **`#`**. Todos los títulos del fixture
   contienen ese carácter; la búsqueda existente es global y excluye archivadas.
4. Confirmar **50/500 resultados**, sin filtro temporal. Entrada sin búsqueda está vacía
   por diseño del fixture; el total SQLite no prueba el tamaño del listado. El modo
   interno `all` no tiene un control UI confirmado y no se usa como instrucción manual.
5. Documentar esta vista de búsqueda como el listado medido. No mezclarlo con importación,
   vista de materia individual, teclado abierto o filtros ocultos. El feed es virtual:
   no exigir 500 nodos DOM simultáneos; sí 500 elementos en el conjunto filtrado.

El filtro de fecha oculto quedó resuelto en PR #18 (`3898db8`), no es una corrección
pendiente de F3. Revisar filtros visibles y alcance antes de atribuir un problema al
volumen. Crear una nota limpia búsqueda/fecha;
restablecer el setup entre muestras, fuera del intervalo medido.

## 4. RNF-002 — Latencia CRUD

**Diseño:** mismo dispositivo/APK, perfiles pequeño y grande separados. Tras arranque y
carga, esperar 30 s, realizar **5 ciclos de calentamiento completos** por operación y
perfil y registrar su preparación/limpieza. Luego **30 muestras válidas por operación
y perfil** (180 en total).
Usar títulos `F3 medición #NN`, contenido fijo de unas 200 letras y el mismo destino.
Preparar/restaurar notas auxiliares fuera de la captura para evitar crecimiento acumulado;
conservar 50/500 activas de base. Nunca vaciar la papelera personal. Anotar tamaños antes/después.

| Operación | Acción inicial | Final observable |
|---|---|---|
| Crear | Tap en Guardar con formulario listo, sin incluir tecleo | Confirmación, cierre del formulario y nueva tarjeta visible en Entrada |
| Editar | Tap en Actualizar sobre la misma nota auxiliar | Confirmación y tarjeta con el nuevo contenido visible |
| Papelera | Confirmación final de enviar la nota auxiliar a papelera | Tarjeta retirada y feedback/conteo actualizado |

Medir en una traza del **WebView del APK**, no Vite ni el tiempo de `adb shell input`.
En DevTools Performance identificar el evento de entrada, trabajo async y primer frame
con feedback/estado correcto. La referencia oficial describe la inspección de frames
y el guardado de perfiles: [Performance](https://developer.chrome.com/docs/devtools/performance/reference).
Guardar la traza original y offsets por muestra. No activar CPU throttling; anotar
versión/opciones/overhead del profiler. Un cronómetro humano o un video de baja tasa no
resuelve de forma fiable un límite de 200 ms. Si los límites no son identificables,
registrar **pendiente**, no rellenar tiempos estimados.

Además del tiempo total desde la acción hasta resultado visible, separar:

- `persistencia_ms`: desde entrada al servicio de escritura hasta la resolución
  confirmada de SQLite (incluye espera/bridge; no es tiempo puro de motor SQL).
- `refresco_ms`: lecturas secundarias y notificaciones, hasta terminar el store.
- `total_ms`: intervalo de extremo a extremo, incluida presentación. **No** calcularlo
  sumando los anteriores ni equiparar resolución de la promesa con un frame presentado.

Si el artefacto no expone esos límites en la traza, las columnas quedan vacías y el
desglose pendiente. Cualquier instrumentación temporal deberá revisarse, registrarse
como parche/hash del candidato y calibrarse; no se añadió instrumentación productiva
en esta entrega. No medir tiempos con breakpoints pausantes o logging SQL intensivo.

Usar [crud.template.csv](./crud.template.csv); `valida=false` requiere motivo, nunca
descartar un outlier por ser lento. Para que un calentamiento cuente como completo,
registrar `calentamiento=true`, `valida=true`, `resultado_funcional=ok` y ambos conteos
`notas_visibles_antes`/`notas_visibles_despues`. No exigirle `total_ms` ni traza;
mantenerlo fuera de la estadística medida. Cinco calentamientos completos por
perfil/operación son condición de `PASS`; menos de cinco deja `PENDING` si no hay un
fallo medido. Ordenar 30 valores válidos por operación/perfil:
mediana = promedio de posiciones 15/16; p95 por nearest-rank = posición 29; máximo = 30.
Registrar también cantidad de valores **> 200 ms**, total de intentos/fallos y las
muestras de calentamiento. Una sola muestra válida > 200 ms no cumple el umbral del
protocolo, aunque p95 sea favorable. Menos de 30 válidas o intervalos dudosos: pendiente.
Fallo de guardado/duplicación es fallo funcional, no una muestra que pueda descartarse.

## 5. RNF-004 — Frames durante scroll

Preparar el perfil grande con **500 resultados** como en §3, ocultar teclado, esperar
la carga y hacer un recorrido de calentamiento. Inspeccionar el WebView autorizado
desde `chrome://inspect/#devices`; debe estar habilitado en el candidato, no se presume
por ser debuggable: [depuración de WebViews](https://developer.chrome.com/docs/devtools/remote-debugging/webviews).

Grabar **tres recorridos de 10 segundos**, con movimiento continuo y el mismo gesto
(inicio arriba; bajar durante 5 s y volver durante 5 s), pausas de 10 s fuera de captura.
Anotar velocidad/gestos y tamaño de viewport; no mezclar picker, importación ni navegación.
Desactivar screencast: Chrome advierte que afecta la tasa de frames en su
[guía de depuración remota](https://developer.chrome.com/docs/devtools/remote-debugging/).

Conservar trazas y diez tramos de 1 s por recorrido en [frames.template.csv](./frames.template.csv).
Registrar frames presentados/completos, parciales, perdidos y duración del tramo según
la fuente; FPS = frames completos presentados / segundos observados. No contar callbacks
`requestAnimationFrame` como frames presentados ni mezclar renderización y composición
como si fueran cuadros distintos. Guardar el método y los eventos exactos usados.
La clasificación de frames y el carácter estimado del medidor en vivo están documentados
en [Performance](https://developer.chrome.com/docs/devtools/performance/reference).

Comparar cada tramo con **≥ 55 FPS**, reportar mínimo, mediana y promedio de cada recorrido;
un promedio global no oculta tramos inferiores. Registrar todos los descartes con motivo.
Un overlay aislado, percepción de fluidez o datos de otra superficie no bastan. Si el
WebView/herramienta disponible no permite atribuir frames fiables a la app y al intervalo,
RNF-004 queda pendiente; no convertir automáticamente `gfxinfo` en FPS de WebView.

### Análisis reproducible de los CSV ingresados

Las capturas manuales de Chrome DevTools/Performance sobre el WebView del APK y las
trazas crudas siguen siendo la fuente autoritativa. El analizador local solo valida y
agrega los valores ya identificados e ingresados; **no** crea evidencia de latencia/FPS,
no decide dónde comienzan/terminan las acciones o frames y no cierra un RNF por sí solo.

```bash
mkdir -p tmp/f3/sesion-1
cp -n docs/beta-core-validation/crud.template.csv tmp/f3/sesion-1/crud.csv
cp -n docs/beta-core-validation/frames.template.csv tmp/f3/sesion-1/frames.csv
cp -n docs/beta-core-validation/sesion.template.json tmp/f3/sesion-1/sesion.json
# Completar copias a partir de las trazas; conservar originales y hashes.
python3 scripts/summarize-f3-results.py --crud tmp/f3/sesion-1/crud.csv --frames tmp/f3/sesion-1/frames.csv --session tmp/f3/sesion-1/sesion.json --json-output tmp/f3/sesion-1/resumen.json
```

Las [reglas de entrada y fórmulas](../../scripts/README.md#44-summarize-f3-resultspy--análisis-offline-de-evidencia-f3)
son explícitas: `ok` es el único resultado funcional exitoso, `fallo` es fallo y
`pendiente`/vacío impiden `PASS`. Se excluyen calentamientos del total válido; no se
reconstruye `total_ms` a partir de persistencia y refresco. Mediana, p95 nearest-rank,
máximo, excedencias estrictas de 200 ms, FPS recalculados por duración y mínimo de 55
por tramo siguen los criterios anteriores. El redondeo de FPS ingresado admite una
diferencia absoluta de 0,05; un tramo de un segundo se admite entre 950 y 1050 ms.
`PASS` CRUD requiere cinco calentamientos completos registrados **además de** 30
muestras medidas válidas por perfil/operación; `PASS` FPS requiere tres recorridos de
diez tramos válidos en 500 notas. También se exigen resultado funcional y
trazabilidad completos y ambos conteos de notas visibles en cada muestra medida
válida. Si falta cualquiera de esos conteos, el grupo queda `PENDING` salvo fallo
medido; el resumen cuenta las filas afectadas sin excluirlas de las estadísticas
ni ocultar outliers. El resumen distingue calentamientos totales, completos e
incompletos sin incluirlos en mediana, p95 ni excedencias.
`FAIL` prevalece ante un outlier válido o fallo funcional; si falta evidencia, el
grupo queda `PENDING`, nunca cero o aprobado. CSV/JSON malformados, tipos imposibles,
duplicados o FPS incongruente son errores de integridad (exit no cero), distintos de
una medición `FAIL`/`PENDING` válida (exit cero).

Guardar trazas originales, hashes SHA-256, offsets y método exacto de eventos, CSV
completos y resumen JSON. El autor debe cotejar resultados y adjuntarlos a la matriz;
**este PR no ejecutó ninguna medición Android** ni cambia el estado F3/RNF.

## 6. Consultas y notificaciones — diagnóstico, no optimización

La [evidencia Linux](./resultados-2026-09-14.md) cuenta `db.query`, `db.run` y entregas
a **un** suscriptor pasivo del store, excluyendo su callback inicial. No cuenta renders,
tiempo de bridge ni todos los consumidores de UI. `loadSubjects` no equivale al gesto
completo de abrir el drawer; `getTrashItems` tampoco al render completo de papelera.

En Android, registrar por crear/editar/mover/eliminar y abrir materias/papelera el
intervalo, llamadas SQL agrupadas por sentencia (sin contenido de notas), loaders,
notificaciones y consumidores activos. Hacer esa traza diagnóstica **por separado**
de la medición temporal/FPS para no contaminarla. Si requiere instrumentación no
disponible, dejarla pendiente. Conservar las protecciones de ownership y single-flight.

Solo ante un cuello temporal medido, ejecutar `EXPLAIN QUERY PLAN` de la consulta
identificada en **una copia sintética**, con schema/índices/params documentados. No
añadir índices, batching ni refactors en este PR. El caso de papelera de la traza
Linux no contiene materias eliminadas; no generalizar sus cinco consultas a todo árbol.

## 7. RNF-009/RNF-010 — Offline y continuidad

Modo avión con Wi-Fi y datos móviles explícitamente apagados; USB de depuración no
equivale a internet. Ejecutar en cada caso: acción, resultado esperado, resultado real,
dispositivo/APK y evidencia en la matriz. Los errores son fallos, no “pendientes”.

| Caso | Pasos y criterio | Estado inicial |
|---|---|---|
| OFF-01 | Abrir sin red; crear/editar nota; reabrir: mismo contenido/ID, una sola nota | Pendiente |
| OFF-02 | Buscar título y contenido; mover entre materia/sección; fijar/archivar/desarchivar: conteos y destino correctos | Pendiente |
| OFF-03 | Enviar nota auxiliar a papelera, restaurar y comprobar; borrado definitivo solo de auxiliares autorizadas | Pendiente |
| OFF-04 | Crear/editar/eliminar fecha; navegar mes/proximidad; reabrir: fecha y vínculo correctos | Pendiente |
| OFF-05 | Exportar y guardar ZIP en almacenamiento local; importar en espacio acordado y repetir: sin duplicados | Pendiente |
| CON-01 | Borrador nuevo y de edición: cambiar a otra app y volver, sin guardar: texto recuperado | Pendiente |
| CON-02 | Repetir ambos borradores bloqueando/desbloqueando: texto recuperado | Pendiente |
| CON-03 | Tras esperar 1 s desde la última escritura, terminar/reabrir proceso: borrador nuevo/edición recuperado | Pendiente |
| CON-04 | Repetir terminación inmediatamente tras escribir; registrar la ventana real de persistencia y cualquier pérdida | Pendiente |

Para CON-03/04, usar terminación del proceso **solo con autorización**; registrar el
método (quitar de recientes no garantiza terminación). `force-stop` no reproduce todos
los cierres por memoria del sistema y debe identificarse como simulación. Nunca usar
`clear data`. Verificar que guardar limpia el borrador y descartar explícitamente no lo
resucita. Comparar borrador y nota persistida por separado. No exigir internet para el
ZIP local; un destino externo del share sheet puede necesitar conectividad.

## 8. Cierre

Cada resultado enlaza muestras/traza y SHA-256 del archivo; conservar originales
privados si contienen datos identificables. El reporte público usa datos sintéticos.
Completar la [matriz](./resultados-2026-09-14.md), checklist Android y estados RNF solo
con pruebas ejecutadas del mismo artefacto. Registrar límites y decisión del autor.
Sin dispositivo/datos de medición, esta preparación es revisable pero **F3 no se cierra**.
