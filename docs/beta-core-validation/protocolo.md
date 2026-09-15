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

## 3. Importación y precondición visible

1. Importar el ZIP del perfil en el espacio acordado mediante Backup → Importar ZIP;
   verificar preview de **30 contenedores, 68/518 notas, 20 fechas**, sin reparaciones
   ni renombrados. Reimportar: cero importables. Un resultado distinto invalida el setup.
2. Verificar 18 archivadas separadas y las 12 notas adicionales de papelera si se prepararon.
3. Quitar cualquier fecha seleccionada en Calendario (tocar otra vez la seleccionada o
   su acción de limpiar), volver a Entrada y buscar **`#`**. Todos los títulos del fixture
   contienen ese carácter; la búsqueda existente es global y excluye archivadas.
4. Confirmar **50/500 resultados**, sin filtro temporal. Entrada sin búsqueda está vacía
   por diseño del fixture; el total SQLite no prueba el tamaño del listado. El modo
   interno `all` no tiene un control UI confirmado y no se usa como instrucción manual.
5. Documentar esta vista de búsqueda como el listado medido. No mezclarlo con importación,
   vista de materia individual, teclado abierto o filtros ocultos. El feed es virtual:
   no exigir 500 nodos DOM simultáneos; sí 500 elementos en el conjunto filtrado.

La deuda de **filtro de fecha oculto** sigue abierta: puede reducir resultados aunque
la búsqueda coincida. No corregirla dentro de F3 ni marcar un supuesto problema de
volumen sin revisar primero esta precondición. Crear una nota limpia búsqueda/fecha;
restablecer el setup entre muestras, fuera del intervalo medido.

## 4. RNF-002 — Latencia CRUD

**Diseño:** mismo dispositivo/APK, perfiles pequeño y grande separados. Tras arranque y
carga, esperar 30 s, realizar **5 ciclos de calentamiento** por operación y registrar su
preparación/limpieza. Luego **30 muestras válidas por operación y perfil** (180 en total).
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
descartar un outlier por ser lento. Ordenar 30 valores válidos por operación/perfil:
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
