# Candidato APK 0.6.0 — presentación

**Fecha:** 2026-10-22<br>
**Rama:** `chore/presentation-rc1`<br>
**Base integrada:** `9ab9c006bc38dd59d9e275968aa583a3ba1e56b6` (PR #41)<br>
**Estado:** APK corregida firmada e instalada por actualización en sitio, con
«Android · candidato» comprobado en Acerca de y datos conservados. El autor aceptó
PR #42 y autorizó merge/limpieza; resto de validación Android, aceptación final del
binario, tag y publicación pendientes. La identidad vigente figura en
[binario corregido](#binario-corregido).

## Objetivo y alcance acordados

Preparar la APK `0.6.0/600`, identificada como **Release Candidate 1**, sin nuevas
funciones, refactors ni mejoras. RC describe el candidato de presentación y no
obliga a anunciar `1.0.0` o estabilidad comercial. Se mantiene la versión numérica
admitida por el tooling; `RC1` forma parte del título previsto.

El autor autorizó generar la APK y recuperar la firma existente en almacenamiento
temporal privado fuera del repositorio. La identidad pública del certificado se
comprobó contra la [beta publicada](firma-apk-android.md#resultado-publicado-050);
no se creó ni sustituyó una clave. No se versionan secretos ni sus ubicaciones.

La autorización inicial no incluía instalación, desinstalación ni cambios de datos.
Después, el autor autorizó preparar el teléfono retirando la debug de prueba,
instalar la APK pública `0.5.0`, crear datos representativos y actualizar a esta
RC1 sin borrar ni restaurar entre versiones. La retirada inicial de la debug es
preparación del banco, no un paso del procedimiento del usuario final.
Después aceptó PR #42 y autorizó merge a `main` y limpieza de sus ramas solo tras
comprobar integración. Ante la confusión de Acerca de, autorizó únicamente la
etiqueta neutral y su recompilación; también aprobó expresamente DOMPurify 3.4.17
tras la nueva consulta de advisories. Publicación y tag se atenderán después con
su asistencia; no se crearon durante este cierre. La aceptación general del PR no
se convierte en nuevos resultados manuales ni en aceptación final del binario.
Las betas publicadas no se reemplazan. El título previsto para una eventual
publicación es `Lumapse v0.6.0 — Release Candidate 1`, tag `v0.6.0`, marcada
**Pre-release**; esto no acredita que existan el tag o la publicación.

## Preparación inicial comprobada

- `main` limpio y sincronizado con `origin/main` tras fetch/pull; sin PR abiertos.
  PR #41 integrado y sus checks de calidad y GitGuardian aprobados.
- Node 22.20.0/npm 10.9.3 existentes seleccionados solo para estos procesos.
  `npm run check:runtime` PASS. El runtime global no se modificó.
- `npm run check:docs`: 111 Markdown/1007 enlaces, sin errores.
- `npm run check:traceability`: sin advertencias.
- `python3 scripts/release-helper.py --check`: base `0.5.0/500` alineada.
- Dry-run minor: candidato `0.6.0/600`, firma configurada. Se aplicó el helper
  con `--skip-build` para versionar antes de compilar desde una fuente limpia.

## Controles de la fuente candidata

Referencia inicial `3068455`, conservada como evidencia histórica. Los controles
del ajuste posterior están en [binario corregido](#binario-corregido).
Ejecutados con el runtime canónico, sin reutilizar métricas de otro corte:

```bash
npm run verify
npm audit --json
npm audit --omit=dev --json
npm run test:coverage -- --maxWorkers=1 --allowOnly=false
```

| Control | Resultado |
|---|---|
| Gate completo de la fuente candidata | PASS, exit 0; 79 archivos/1211 tests de app y 105 de tooling; tres avisos previos de lint, cero errores |
| Auditoría completa/productiva | Ambas exit 0, cero vulnerabilidades conocidas en la consulta del 2026-10-22 |
| Coverage de servicios JS/TS, incluidos subdirectorios | 96,06% de statements (2095/2181), 42 archivos; supera el 70%; suite 1211/1211 PASS |

Enlaces del gate: 112 Markdown/1011 referencias, sin errores. Trazabilidad y
versiones `0.6.0/600` alineadas. `npx cap sync android` conserva los cuatro plugins
existentes y no produce cambios nativos seguidos adicionales. Los logs y resúmenes
crudos quedan fuera del repositorio; no contienen ni publican la configuración de firma.

## Identidad del binario

**Identidad inicial, no vigente para subir:** esta sección conserva el APK de
fuente `3068455` y SHA-256 `70d98d5d…`, usado en la prueba pública de la sección
siguiente. La copia inicial se preservó de forma privada antes de recompilar.
La ruta local de entrega ahora contiene el [binario corregido](#binario-corregido);
no debe usarse el checksum inicial para subirlo.

Se compiló sin volver a incrementar la versión, desde fuente confirmada limpia:
build web con canal `android-candidate`, `npx cap sync android` y Gradle release
con la firma existente. No se usó el deploy debug ni se instaló como parte de la
compilación. El build web, sync y Gradle finalizaron en exit 0. Gradle utilizó
SDK/JDK y dependencias existentes en modo offline, sin instalaciones:

```bash
./gradlew --offline --no-daemon --max-workers=1 \
  '-Dorg.gradle.jvmargs=-Xmx768m -Dfile.encoding=UTF-8' \
  -Dkotlin.compiler.execution.strategy=in-process assembleRelease
```

Gradle informó `BUILD SUCCESSFUL` (289 tareas, 283 ejecutadas y seis al día).
Conserva avisos de repositorios `flatDir`, funciones deprecadas de Gradle y
`downloadFile` del plugin Filesystem; no se abrió una migración de tooling o
plugins por esos avisos. No hubo error de compilación.

| Campo | Valor |
|---|---|
| Versión/code del manifest | `0.6.0/600` |
| Canal incorporado | `android-candidate` |
| Fuente incorporada en metadata | `306845506163bf74a5cb9c79a813d68f66a4d5d9`, `dirty: false` |
| APK local | `releases/v0.6.0/lumapse-v0.6.0.apk`, 25.766.718 bytes |
| SHA-256 del APK | `70d98d5da883651fd9ce7a25ad2e5e15208424f6337dfb6d5b7ed42db9e278c7` |
| Certificado SHA-256 comprobado | `91d719826e632e10f331913c3835c51e38cf780eb139940eb3b0bf1ed6a157cd` |
| Firma del APK y variante no-debuggable | `apksigner verify` PASS, esquema v2; `aapt dump badging` confirma versión y ausencia de `application-debuggable` |
| Alineación | `zipalign -c -p 4` PASS |
| Tag/publicación | No creados |

La copia local tiene el mismo SHA-256 que la salida de Gradle y un archivo
`lumapse-v0.6.0.apk.sha256` adjunto; no reemplaza otro asset. Todos los assets web
del APK se cotejaron byte a byte con `dist`, incluida la metadata de fuente limpia.
No se empaquetaron la keystore ni su configuración. No se abrió Acerca de en un
teléfono: la verificación de metadata anterior es estática sobre el binario.
Los commits posteriores de evidencia documental no cambian la fuente ni ese APK.

## Actualización pública 0.5.0 a 0.6.0 — 2026-10-22

**Artefacto de esta prueba:** APK inicial `70d98d5da883651fd9ce7a25ad2e5e15208424f6337dfb6d5b7ed42db9e278c7`.
No se reatribuye este recorrido directo al APK corregido posterior.

**Resultado:** PASS en Samsung SM-G965F, Android 10. Es una prueba real entre
binarios firmados de distribución, no un debug equivalente ni una restauración
posterior a una instalación limpia.

### Preparación y ejecución

1. Descargar el asset oficial `lumapse-v0.5.0.apk` de la release publicada;
   comprobar su SHA-256 `d48338e04021a6096fcaeaced5fde411911d403c9ea95407891d2b034515a884`,
   versión/code `0.5.0/500`, ausencia de depuración y certificado igual al candidato.
2. Retirar la debug anterior y sus datos de prueba, con autorización expresa del
   autor. Instalar la pública `0.5.0` y extraer su APK instalada: hash idéntico al asset.
3. Crear desde la UI cinco notas, incluida una fijada, una archivada, una en
   papelera y una organizada con Markdown; una materia con sección y color elegido;
   una fecha académica; un borrador de creación sin guardar como nota y tema claro.
4. Fijar la referencia: copia SQLite consistente cuyo hash coincide con el
   original del teléfono, filas completas, relaciones y JSON de borrador persistido
   en el almacenamiento legado. No se inyectó SQL ni se importaron fixtures.
5. Ejecutar únicamente la actualización del candidato exacto:

   ```bash
   adb -s <dispositivo> install -r releases/v0.6.0/lumapse-v0.6.0.apk
   ```

   Resultado `Success`, sin fallback. Extraer el APK instalado: SHA-256 idéntico
   al candidato de la tabla anterior. Abrir la app y comparar datos y capturas.

Desde la referencia pública no se ejecutaron desinstalación, limpieza de datos,
importación ni restauración. No hubo recompilación ni cambios de código del producto.
La fecha de primera instalación permanece `2026-10-22 14:50:31` y el UID de la app
es el mismo; `lastUpdateTime` cambia a `2026-10-22 15:19:01` (reloj del dispositivo).

### Comparación antes y después

| Datos | Antes → después | Comprobación |
|---|---|---|
| Notas | 5 → 5 | Todas las columnas idénticas: contenido, IDs, fechas, materia/sección, pin, archivo y papelera |
| Materia y sección | 2 → 2 | Filas completas, relación padre/hija y color idénticos |
| Fecha académica | 1 → 1 | Fila completa, tipo, fecha, título y asociación idénticos |
| Metadata anterior | 1 → 1 conservada | `indexeddb_migrated=true` sin cambios |
| Borrador | localStorage → SQLite | JSON completo idéntico, incluido `savedAt`, en la nueva fila `lumapse-editor-draft-v1`; título/contenido visibles como «Borrador recuperado» |
| Tema | Claro → claro | Comparación visual de capturas antes/después; no equivale a inventario exhaustivo de preferencias |
| Integridad | `ok` → `ok` | `PRAGMA integrity_check` en copias verificadas; `foreign_key_check` sin filas en ambas |

Hashes de las filas canónicas, iguales antes y después; no solo conteos:

| Tabla | SHA-256 antes = después |
|---|---|
| `notes` | `9efc05fcaaab9e5c0f45630388b59fd8928e8b112c373cbe922545a0abc316e3` |
| `subjects` | `8dbb527a94cbf807b4790b81e8ad5f86976feb77d0faf00b1f1f423629497756` |
| `academic_events` | `7427f2d90ce77c760e9c2764e30d59ba2086dedc62c036764b543d3306313842` |

Para cada tabla se leen todas las columnas, se ordenan las filas por su JSON con
claves ordenadas y se calcula SHA-256 del array JSON UTF-8 con claves ordenadas,
`ensure_ascii=False` y separadores `(',', ':')`. La metadata pasa de una a dos
filas únicamente por la migración del borrador; no se exige igualdad del formato
físico entre almacenamientos distintos. El borrador no se convirtió en una sexta nota.

### Método de lectura y límites

La consola root transformó saltos de línea al intentar una primera copia binaria
de lectura, produciendo una copia local inválida. Se descartó para el análisis;
no era evidencia de corrupción de la base del producto. La lectura definitiva usa
copias auxiliares privadas fuera de la app y `adb pull`, con SHA-256 origen/copia
coincidentes y estabilidad comprobada antes/después. No se normalizan bytes para
dar por válida una base; la inspección no ejecutó SQL de escritura ni restauró
la base de la app.

Se inspeccionaron las capturas previas y posteriores. Se retiraron solo las copias
auxiliares propias del teléfono, fuera de los datos de Lumapse; logs, capturas,
referencias y comparaciones permanecen privados fuera del repositorio.
Al terminar esa prueba, la RC1 inicial quedó instalada con los cinco registros de
prueba y el borrador sin guardar ni descartar para la revisión del autor.

El resultado cubre un dispositivo y este conjunto pequeño, no garantiza toda
actualización, tamaño de base, dispositivo o interrupción posible. No sustituye
los recorridos offline/ZIP, la captura de tráfico/trackers ni la aceptación del autor.

## Binario corregido

**Ajuste autorizado — 2026-10-22:** el texto fijo de Acerca de podía interpretarse
como una firma inválida. Se cambia únicamente a «Android · candidato», sin agregar
una verificación interna de certificados. La firma se comprueba externamente.

La nueva consulta npm reportó un paquete afectado, DOMPurify 3.4.16, con tres
avisos: [SAFE_FOR_TEMPLATES/shadow root](https://github.com/advisories/GHSA-cg2g-xh64-v4q7),
[IN_PLACE y subárboles retirados](https://github.com/advisories/GHSA-mrv2-3pqr-j5jr)
y [SMIL en XHTML](https://github.com/advisories/GHSA-c6gr-qvv4-5v3f).
La revisión de `MarkdownService.ts` no encontró esas condiciones: recibe una
cadena HTML, no habilita SAFE_FOR_TEMPLATES ni IN_PLACE, usa el parser HTML y
prohíbe SVG. El hook retira atributos, no nodos. Esto es análisis de aplicabilidad,
no una prueba de explotación ni garantía de seguridad universal.

El autor autorizó solo DOMPurify 3.4.17: cambian la declaración raíz y ese único
nodo del lockfile; no se actualizaron otros paquetes, plugins ni el runtime.
Dos fixtures de contrato upstream (retirada del padre/hermano con IN_PLACE)
fallaron con 3.4.16 y pasaron con 3.4.17, sin ejecutar handlers ni hacer red.
La regresión de Acerca de también reprodujo el mensaje anterior y pasó con la
etiqueta neutral; se alinearon las expectativas de metadata y build real.

| Control del ajuste | Resultado comprobado |
|---|---|
| Tests focalizados de metadata, Acerca de y Markdown | 4 archivos, 80 tests PASS |
| `npm run verify` final | Exit 0; 79 archivos/1214 tests de app y 105 de tooling; tres avisos previos de lint, cero errores |
| Auditorías completa/productiva tras el parche | Ambas exit 0, cero vulnerabilidades conocidas en esta consulta |
| Build web candidato y sync Capacitor | Exit 0, cuatro plugins conservados; sin cambios nativos seguidos adicionales |
| Gradle release offline con firma existente | Exit 0; 289 tareas, 40 ejecutadas y 249 al día |
| Assets y metadata del APK | 11 archivos de `dist` idénticos byte a byte, canal candidato, fuente limpia, DOMPurify 3.4.17 y ausencia de la etiqueta anterior |
| Firma, manifest y alineación | `apksigner` v2 PASS, certificado original, `0.6.0/600`, no-debuggable, `zipalign` PASS |
| Documentación final | 112 Markdown/1022 enlaces sin errores; trazabilidad sin advertencias y `git diff --check` PASS |

La primera ejecución del gate tras cambiar el texto detectó una expectativa unitaria
antigua; se corrigió dentro del mismo ajuste y se repitió el gate completo en verde.
El coverage 96,06% registrado arriba corresponde a la medición inicial; no se
presenta como una nueva ejecución del ajuste. No cambió el código de servicios.

| Identidad vigente para subir | Valor |
|---|---|
| APK local | `releases/v0.6.0/lumapse-v0.6.0.apk`, 25.767.142 bytes |
| SHA-256 del APK | `15f8ede5b78387e3fcac1a53eb3bc78dbb1e30df9acf7f4f20c771c48739e042` |
| Fuente incorporada | `bcefe6a2ad86ed3abef4f5789a6696143503600e`, `dirty: false` |
| Versión/code y canal | `0.6.0/600`, `android-candidate` |
| Certificado SHA-256 | `91d719826e632e10f331913c3835c51e38cf780eb139940eb3b0bf1ed6a157cd` |
| Checksum adjunto | `lumapse-v0.6.0.apk.sha256`, actualizado al binario corregido |
| Tag/release | No creados; las betas publicadas no se reemplazan |

### Comprobación nativa del corregido

Con autorización de actualización, se verificó primero el APK inicial instalado
y su certificado; después se ejecutó solo `adb install -r` al corregido. Samsung
SM-G965F/Android 10: `Success`, APK extraída con el nuevo hash exacto, UID y fecha
de primera instalación iguales. No hubo desinstalación, limpieza, importación ni
restauración. Apertura correcta y todas las filas de las cuatro tablas idénticas:
cinco notas, dos materias/secciones, un evento y dos entradas de metadata,
incluido el borrador. Los hashes de notas, materias y eventos coinciden con la
prueba anterior; metadata antes/después:
`571bd8a70f3c9e989ed1981d839b930304008e796d79293cf458f5c562f3d0ed`.
Integridad `ok` y FK sin filas en ambas copias verificadas.

Se abrió Acerca de y se inspeccionó su captura: «Android · candidato», versión
0.6.0 y fuente `bcefe6a… · sin cambios locales`, en tema claro. El teléfono queda
en esa pantalla, con el borrador sin guardar ni descartar. Evidencia cruda privada;
no se versionan APK, bases, capturas ni claves. Se retiraron solo copias auxiliares
propias del teléfono, fuera de los datos de la app.

El recorrido nuevo es **0.6.0 inicial → 0.6.0 corregida**, no una repetición directa
de 0.5.0 → corregida. El resultado no sustituye los recorridos offline/ZIP,
tráfico/trackers ni la aceptación manual final pendientes.
Los commits posteriores de documentación y merge no son la fuente incorporada en
la APK y no requieren recompilarla por sí solos.

## Aceptación del binario y congelación

Aplican los [cinco no negociables del precorte](revision-precorte-2026-10-22.md#no-negociables-y-decisión-de-corte).
Esta preparación no convierte los resultados debug en pruebas del candidato ni
certifica ausencia universal de defectos.

- [x] Autorizar y comprobar actualización desde la beta firmada pública, con
  apertura, datos, borrador y tema conservados en el conjunto anterior. Sin
  desinstalación ni restauración después de la referencia `0.5.0`; artefacto inicial.
- [x] Comprobar la actualización al APK corregido y su etiqueta visible, con
  todas las tablas conservadas; recorrido y límites diferenciados arriba.
- [x] Registrar aceptación general del autor de PR #42 y autorización de
  merge/limpieza una vez comprobada integración; sin publicación en este paso.
- [ ] Completar los recorridos del núcleo offline, organización/búsqueda, fechas
  y ZIP local sobre este binario exacto; no deducirlos de la comparación de datos.
- [ ] Repetir tráfico/trackers de RNF-012/013 sobre este binario exacto.
- [ ] Registrar aceptación manual final del binario, con límites PC-02 a PC-08 conservados y
  RNF-020 en evidencia parcial; RNF-002/004 y RNF-005 mantienen su tratamiento.
- [ ] Fijar el artefacto aceptado y su congelación; después adaptar manual,
  emitir matriz RNF, actualizar informe y preparar defensa sobre el mismo corte.

El feedback voluntario no bloquea esos entregables ni abre correcciones de forma
automática. Solo un bloqueo grave confirmado justificaría consultar una excepción
acotada; no se reabre el desarrollo por rutina.
