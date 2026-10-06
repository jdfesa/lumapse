# Checklist de Validacion Manual Android — Lumapse

**Hito:** 06 — Entrega Final<br>
**Objetivo:** registrar evidencia reproducible de cada APK y distinguir la verificación del asset firmado de las pruebas sobre builds equivalentes.<br>
**Estado:** `v0.5.0` publicada y aceptada; smoke de identificación de PR #22 aceptado. F3 sin métricas CRUD/FPS nuevas; OFF-01–05 de RNF-009 verificados en debug `348da88` y aceptados en PR #31. RNF-010 verificado en debug identificado y aceptado por el autor; cierre aprobado en PR #29.

---

## Flujos offline — 2026-10-06

[Fallo OFF-05 reproducido, corrección y matriz del debug nuevo](../beta-core-validation/offline-2026-10-06.md).
El autor autorizó la unidad OFF-01–05 y el debug conservando datos y firma. La
validación de la corrección pasó en el debug `348da88`; el autor aceptó
[PR #31](https://github.com/jdfesa/lumapse/pull/31) el 2026-10-06. No se atribuyen
resultados al asset publicado ni a un candidato nuevo.

- [x] Identificar APK inicial y reproducir bloqueo de exportación ZIP sin red.
- [x] Incorporar fix acotado y regresiones de disponibilidad/exportación/cancelación.
- [x] Identificar y validar el debug nuevo: OFF-01–05 PASS, integridad y datos preservados.
- [x] El autor aceptó el PR y autorizó merge y limpieza el 2026-10-06, con integración previa comprobada antes de borrar ramas. Sin nuevas pruebas manuales por caso; se conserva la evidencia del debug identificado.

---

## Continuidad del borrador — 2026-10-04/05

[Evidencia canónica, hashes y límites](../beta-core-validation/continuidad-2026-10-04.md).
Los fallos del diagnóstico en WebStorage no se borran ni se transfieren a esta APK.

- [x] Persistencia SQLite y limpieza atómica aprobadas; [ADR-012](../adr/ADR-012-borrador-sqlite-y-guardado-atomico.md).
- [x] Gate completo PASS: 1189 tests, build, tipos y controles del proyecto.
- [x] Debug `0.5.0/500`, fuente `dbc8940` limpia, instalada con firma original mediante deploy habitual, sin desinstalación ni borrado.
- [x] Migración real del borrador anterior PASS, sin crear nota final; 83 notas idénticas tras instalar.
- [x] CON-01–04, creación/edición, PASS en modo avión. CON-04 a 217/209 ms; repetición nativa a 285 ms PASS.
- [x] Guardar/Descartar y terminación cercana PASS: no reaparece el borrador ni se duplica la nota.
- [x] Control final de integridad, conservación de notas ajenas a las pruebas, borrador limpio y red restaurada.
- [x] El autor confirmó funcionamiento en esta APK y autorizó merge/limpieza de [PR #29](https://github.com/jdfesa/lumapse/pull/29). RNF-010 verificado para el alcance registrado; OFF-01–05 pendientes por separado. No repetir las pruebas aceptadas.

---

## Aceptación general de la APK publicada v0.5.0

Registro del acuerdo comunicado por el autor el **2026-10-02**: la APK firmada y
publicada `lumapse-v0.5.0.apk` fue probada y aceptada en **al menos tres dispositivos**.
Se cierra el pendiente operativo de aceptación del asset publicado. No se conocen
los modelos, fechas de ejecución ni resultados granulares de esos dispositivos;
no se completan por inferencia las casillas históricas ni se atribuyen métricas F3.

- [x] Aceptación general del asset firmado/publicado `v0.5.0` recibida del autor.

La identidad del asset permanece en [Corte vigente — v0.5.0](#corte-vigente--v050).
El debug posterior de parches fue aceptado por separado y PR #21 integrado mediante
`5ef1f911`; [evidencia canónica](./validacion-parches-dependencias-2026-10-02.md).
Ninguna de estas aceptaciones demuestra los casos o mediciones RNF pendientes.
**No solicitar nuevamente la aceptación histórica de `v0.5.0`.** El smoke del frente
de identificación también fue aceptado; F3 queda separado según el [plan vigente](./plan-desarrollo-inmediato-beta-2026-09-12.md#continuidad-aprobada--2026-10-02).

---

## Identificación de build — smoke aceptado de PR #22

**Fecha Argentina:** 2026-10-02. Despliegue desde Mac y smoke en Samsung, registrado en el
[reporte Android](https://github.com/jdfesa/lumapse/pull/22#issuecomment-5963840051).
El autor confirmó funcionamiento correcto sin roturas observadas y autorizó expresamente
integración a `main` y limpieza de ramas integradas: [decisión](https://github.com/jdfesa/lumapse/pull/22#issuecomment-5964326370).
Los comentarios se publicaron el 2026-10-03 UTC, todavía 2026-10-02 en Argentina.

| Identificación reportada | Valor |
|---|---|
| Dispositivo / entorno | Samsung `SM-G965F`, Android 10, WebView `153.0.8010.36` |
| Comando habitual | `npm run deploy:android -- --target <dispositivo-test>`, serial redactado, **sin `--clean`**, exit 0 |
| Variante / versión base | Debug privado, `0.5.0` / `versionCode 500`; no candidato ni release |
| Fuente incrustada | `e5becc96b032007f587fb564c7b6afd790c5faf9`, `android-debug`, `dirty=false` |
| SHA-256 APK generada e instalada | `599d507f9e2e2b70f90921ec1d9459458f522f6f566d93ee8e29e2c8e15a4f57`, coincidencia exacta reportada |
| SHA-256 certificado | `5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`; certificado y `firstInstallTime` sin cambios |

- [x] Acerca de real: `0.5.0`, **Android debug · prueba privada**, SHA completo seguido de **sin cambios locales**; captura legible sin recorte horizontal en configuración de 720 px.
- [x] Navegación Acerca → Entrada (composer visible, Acerca ausente) → Opciones → Acerca: PASS.
- [x] Aceptación **general** y autorización expresa de integración recibidas del autor.

**Límites:** smoke focalizado, no CRUD exhaustivo, integridad total, continuidad ni
mediciones F3/RNF. No se editaron notas, usó root, terminó el proceso, leyó la DB,
importó datos, desinstaló ni borró datos. Sin bump, cambio de certificado, firma de release ni publicación.
El cierre remoto no repite operaciones de teléfono. El `verify` local sobre E5 fue
reportado PASS (77 archivos / 1167 tests de app + 68 de tooling); no es una ejecución
nueva de ese gate en este cierre documental.

Los commits finales de cierre son **solo documentación**, conservan el producto E5
y no son el SHA de la APK instalada. El [PR #22](https://github.com/jdfesa/lumapse/pull/22)
es la fuente del HEAD final, CI e integración/limpieza; esas operaciones se verifican
después de CI verde del HEAD exacto, sin anticiparlas aquí. F3 **NO INICIADO**.

---

## Corrección cerrada — refrescos vecinos, PR #19

`createSubject`, `updateAcademicEvent` y `deleteAcademicEvent` conservan el éxito de
SQLite ante un fallo de lectura secundaria y ofrecen recuperación solo de lectura.
La evidencia automática y el handoff están en el
[plan del 2026-09-16](./plan-refrescos-vecinos-2026-09-16.md). El autor probó los
flujos normales en Android y aprobó la integración: PR #19 se fusionó el
2026-09-18 mediante `34b2900`. La inyección del fallo secundario está cubierta por
regresiones SQLite/UI, no por el smoke del teléfono. **No completa F3.**

- [x] Autor probó crear materia/sección y editar/eliminar fecha en Android; aprobó el merge de PR #19. Ver [registro del PR](https://github.com/jdfesa/lumapse/pull/19) y [plan y evidencia](./plan-refrescos-vecinos-2026-09-16.md).

El handoff original se conserva en el plan como historia; sus casillas sin marcar no
reabren PR #19. Este documento no registra una planilla por caso ni el hash del APK. Las
mediciones CRUD/FPS y los casos F3 siguen pendientes por separado.

---

## Corrección cerrada — filtros visibles, 2026-09-16

El autor confirmó la prueba Android del HEAD `1ffa7f3` y aprobó PR #18; el cambio
se integró en `main` mediante `3898db8`. El smoke local preservó datos y verificó
fecha visible fuera del calendario, alcance al cambiar de materia, restauración
con **Quitar fecha**, búsqueda global removible y sincronización del drawer, sin
crashes. El APK debug de prueba quedó identificado en el
[plan y evidencia](./plan-filtros-visibles-2026-09-15.md#prueba-del-autor-y-límite-de-aprobación);
no es un nuevo asset de release ni sustituye las mediciones F3 pendientes.

---

## Ciclo posterior — F3, 2026-09-14

**Preparación F3 integrada en PR #16 (`90fd21e`) tras confirmación general del teléfono
el 2026-09-15; evidencia cuantitativa/por caso pendiente.** F2 fue aceptada e integrada
por el autor en PR #15; no se atribuyen esas confirmaciones a una APK cuyo hash no se recibió.
Para F3, seguir el [protocolo](../beta-core-validation/protocolo.md) y completar la
[matriz del nuevo artefacto](../beta-core-validation/resultados-2026-09-14.md).

- [ ] Acordar dispositivo, espacio de pruebas y APK con SHA, versión/code y firma.
- [ ] Importar perfil pequeño/grande por separado; verificar 50/500 resultados reales sin filtro temporal.
- [ ] Registrar 30 muestras por operación/perfil: total, persistencia/refresco, mediana, p95, máximo y excedencias de 200 ms.
- [ ] Capturar tres recorridos de 10 s; ≥ 55 FPS por tramo o pendiente si falta captura fiable.
- [ ] Ejecutar OFF-01 a OFF-05 y CON-01 a CON-04, sin `clear data` ni datos personales.
- [x] Autor informó funcionamiento general y autorizó integrar la preparación F3 en PR #16; rama local/remota eliminada. No equivale a completar los casos anteriores.

La preparación local y CI **no marcan estas casillas**. El corte `v0.5.0` y la historia
siguiente se conservan sin cambios: no trasladar sus resultados al candidato F3.

**Actualización de prioridad — 2026-10-04:** el autor difiere únicamente las
métricas RNF-002/RNF-004 a [post-presentación](../../BACKLOG.md#rendimiento-post-presentación).
Las casillas cuantitativas anteriores permanecen pendientes, no bloquean la entrega
por esa ausencia y no se completan con confirmaciones funcionales. No más pilotos
ni otra cámara/dispositivo exigidos; OFF/CON y la validación funcional del artefacto
mantienen su estado y se acuerdan por separado. Esta decisión no aprueba el PR ni
autoriza su merge.

---

## Corte vigente — v0.5.0

### Identificación y publicación

| Campo | Valor |
|---|---|
| Fecha del corte | 2026-09-05 |
| Versión Lumapse | `0.5.0` (`versionCode 500`) |
| Tag / commit | `v0.5.0` / `5840755` |
| APK publicada | `lumapse-v0.5.0.apk` |
| Tamaño publicado | 25.762.498 bytes |
| SHA-256 | `d48338e04021a6096fcaeaced5fde411911d403c9ea95407891d2b034515a884` |
| Firma | APK Signature Scheme v2; mismo certificado de producción que `v0.4.8` |
| Release | [`Lumapse v0.5.0`](https://github.com/jdfesa/lumapse/releases/tag/v0.5.0) — pre-release |

### Evidencia aprobada antes de publicar

- [x] `scripts/release-helper.py --check` confirmó `package.json`, `package-lock.json`, `versionName 0.5.0` y `versionCode 500`.
- [x] `VITEST_MAX_WORKERS=1 npm run verify` aprobó 67 archivos y 1065 tests.
- [x] El workflow `CI — Quality Gate` de PR #10 y GitGuardian finalizaron correctamente.
- [x] La APK firmada se verificó con `apksigner`; esquema v2 y certificado esperados.
- [x] El SHA-256 local coincide con el digest que GitHub publica para el único asset.
- [x] Un build equivalente `0.5.0/500` se instaló sobre la versión previa en Samsung `SM_G965F`, preservó SQLite y fue aprobado manualmente.
- [x] La corrección táctil de PR #9 confirmó en el mismo dispositivo que `Mover a` abre con un toque normal y que los menús de materias/secciones se comportan correctamente.

### Límite de la evidencia Android

El dispositivo usado para la validación incremental tenía una compilación debug instalada. Para preservar los datos, el build equivalente `0.5.0/500` se firmó con la clave debug; no fue el asset firmado con la clave de producción que se adjuntó a GitHub. El handoff siguiente describe el pendiente de aquel checkpoint, **no el estado operativo vigente**: la aceptación general posterior está registrada arriba. Se conserva sin inventar resultados por caso.

- [ ] instalar específicamente `lumapse-v0.5.0.apk` en un dispositivo compatible con su certificado de producción;
- [ ] repetir al menos instalación/apertura offline, creación/edición/persistencia, materias/secciones, papelera y backup/importación;
- [ ] registrar dispositivo, versión Android, método de instalación y resultado sin atribuir al asset pruebas ejecutadas sobre otro binario.

---

## Evidencia histórica — v0.4.8

## Datos de la Prueba

| Campo | Valor |
|---|---|
| Fecha | 2026-07-01 |
| Tester | Jose David Sandoval |
| Dispositivo | Samsung Galaxy S20 FE (`SM-G780G`) |
| Version Android | 13 |
| Version Lumapse | `0.4.8` (`versionCode 408`) |
| APK probado | `releases/v0.4.8/lumapse-v0.4.8.apk` |
| Commit / tag | `a808de7` / `v0.4.8` |
| Resultado general | Apto para beta controlada con observaciones UX menores |
| Release | [`Lumapse v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8) |

---

## Precondiciones

- [x] `python3 scripts/release-helper.py --type patch --dry-run` ejecutado sin bloqueos.
- [x] `npm run verify` ejecutado sin fallos.
- [x] APK candidato unsigned generado.
- [x] APK candidato firmado generado.
- [x] Dispositivo Android real disponible.
- [x] Instalacion desde fuentes desconocidas habilitada, si aplica.
- [x] Version anterior desinstalada o ausente antes de instalar el APK candidato.

> Para una validacion nativa real, no usar el servidor Vite como evidencia principal. El flujo debe probar el APK instalado.

## Generacion de APK candidata

| Campo | Valor |
|---|---|
| Fase | 2A — APK release unsigned |
| Version candidata | 0.4.8 |
| Android `versionName` | 0.4.8 |
| Android `versionCode` | 408 |
| Comandos previstos | `npm run build`, `npx cap sync android`, `./gradlew assembleRelease` |
| Artefacto Gradle esperado | `android/app/build/outputs/apk/release/app-release-unsigned.apk` |
| Copia local esperada | `releases/v0.4.8/lumapse-v0.4.8-unsigned.apk` |
| Estado | Generada el 2026-06-30 |
| Resultado Gradle | `./gradlew assembleRelease` exitoso |
| SHA-256 | `f53442d79d3e1b5f077b43e0df62737ad4529857be05c0dba48b622e83e6fb4a` |

> La APK unsigned no es el artefacto final de distribucion. Antes de publicarla en GitHub Releases debe firmarse con un keystore de release.

## Firma de APK candidata

| Campo | Valor |
|---|---|
| Fase | 2B — APK release firmada |
| Politica | Keystore local ignorada por Git y secretos por variables de entorno |
| Documento de referencia | `docs/gestion/firma-apk-android.md` |
| Gradle signing config | Preparado en `android/app/build.gradle` |
| APK firmada esperada | `releases/v0.4.8/lumapse-v0.4.8.apk` |
| Estado | Generada y verificada el 2026-06-30 |
| Resultado Gradle | `./gradlew assembleRelease` exitoso con keystore local |
| Resultado `apksigner` | Verifies; APK Signature Scheme v2 = true |
| SHA-256 APK | `cad122d0329e1761816ac7ad07938673389c859a252d9cc63504359355db3d10` |
| Certificado | `CN=Jose David Sandoval, OU=Lumapse, O=Lumapse, L=Salta, ST=Salta, C=AR` |
| Respaldo externo | `/Users/jd/Library/CloudStorage/Dropbox/99_Archive/lumapse/release-0.4.8/` |

> La keystore local se genero bajo `android/keystores/`, ruta ignorada por Git. Debe respaldarse fuera del repo para poder firmar futuras actualizaciones instalables sobre esta misma APK.

---

## Casos de Validacion

| ID | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| VM-01 | Instalacion limpia | Desinstalar version previa, instalar APK candidato y abrir Lumapse | La app instala y abre sin crash | OK 2026-07-01 |
| VM-02 | Primer uso offline | Activar modo avion y abrir la app instalada | La app abre sin depender de internet | OK 2026-07-01 |
| VM-03 | Crear nota | Crear una nota con titulo, texto, lista y Markdown basico | La nota aparece en el feed y conserva formato esperado | OK 2026-07-01 |
| VM-04 | Persistencia | Cerrar la app, volver a abrirla y revisar la nota creada | La nota sigue disponible | OK 2026-07-01 |
| VM-05 | Editar nota | Editar contenido y materia de una nota existente | Los cambios se guardan y el feed se actualiza | OK 2026-07-01 |
| VM-06 | Materias y secciones | Crear una materia, crear una seccion y mover/asociar una nota | La jerarquia Materia > Seccion funciona y filtra correctamente | OK con observacion UX 2026-07-01 |
| VM-07 | Busqueda | Buscar por titulo y por una palabra del contenido | El feed filtra las notas correctas | OK 2026-07-01 |
| VM-08 | Pin y archivo | Fijar una nota, archivar otra y revisar el drawer de archivadas | La nota fijada queda arriba y la archivada sale del feed activo | OK 2026-07-01 |
| VM-09 | Estado academico | Asignar y quitar un marcador de estado a una nota | El marcador visual cambia y puede limpiarse | OK 2026-07-01 |
| VM-10 | Fechas academicas | Crear, editar y eliminar una fecha academica discreta | El Heatmap/proximas fechas reflejan los cambios | OK 2026-07-01 |
| VM-11 | Papelera | Eliminar nota/materia, restaurar y luego vaciar papelera | Soft-delete, restauracion y borrado definitivo funcionan | OK 2026-07-01 |
| VM-12 | Tema | Alternar modo claro/oscuro y reiniciar la app | El tema se aplica y persiste | OK 2026-07-01 |
| VM-13 | Rotacion/responsivo | Probar vertical y horizontal, si el dispositivo lo permite | No hay solapamientos ni controles inaccesibles | OK inicial 2026-07-01 |
| VM-14 | Rendimiento percibido | Navegar feed, drawer, editor y heatmap con varias notas | La app responde sin bloqueos perceptibles | OK inicial 2026-07-01 |
| VM-15 | Exportar/importar ZIP | Exportar ZIP, guardarlo, reinstalar limpio, importar ZIP y repetir importación | El ZIP se restaura y la segunda importación omite duplicados | Evidencia parcial previa: OK 2026-06-18; repetir sobre el artefacto final |

> VM-01 a VM-14 corresponden a la ejecución de `v0.4.8` del 2026-07-01 en el S20 FE. VM-15 conserva una evidencia separada sobre un build anterior; sus datos de dispositivo, versión, rama y commit se detallan más abajo y no deben atribuirse a la APK firmada `v0.4.8`.

---

## Ejecucion Manual — Release candidata 0.4.8

| Campo | Valor |
|---|---|
| Fecha | 2026-07-01 |
| Tester | Jose David Sandoval |
| Dispositivo | Samsung Galaxy S20 FE (`SM-G780G`) |
| Version Android | 13 |
| Version Lumapse | `0.4.8` (`versionCode 408`) |
| APK | `releases/v0.4.8/lumapse-v0.4.8.apk` |
| GitHub Release | [`v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8) |
| Instalacion | `adb install -r` exitoso |
| Resultado general | Apto para beta controlada |

### Observaciones

- No se observaron crashes ni perdida de datos durante la validacion inicial.
- El patron general de la app se percibe coherente con el alcance offline-first propuesto.
- Observacion UX menor: el boton `Mover a` puede requerir una pulsacion prolongada para activarse; con un toque breve el control/menu puede desaparecer. No bloquea el flujo porque la accion se puede completar, pero conviene revisarlo como friccion de interaccion si se repite.
- Rendimiento percibido correcto con pocas notas. El comportamiento con mayor volumen de notas queda como seguimiento natural post-release, no como bloqueo para publicar la beta controlada.

## Ejecucion Parcial — Exportar/Importar ZIP

| Campo | Valor |
|---|---|
| Fecha | 2026-06-18 |
| Tester | Codex + Jose David Sandoval |
| Dispositivo | Samsung SM-G965F |
| Version Android | 10 (SDK 29) |
| Version Lumapse | Android `versionName=1.0`, `versionCode=1` |
| Rama / commit | `feature/importar-backup-zip` / `a1be7c9` |
| Resultado general | OK para flujo Exportar ZIP / Importar ZIP |

### Pasos Ejecutados

- [x] Deploy Android normal preservando datos:
  `bash scripts/deploy-android.sh --target ad071603088c2172aa`
- [x] Abrir Lumapse instalada en Android real.
- [x] Verificar menu de opciones con `Exportar ZIP` e `Importar ZIP`.
- [x] Verificar iconografia: exportar usa flecha de salida, importar usa flecha de entrada.
- [x] Exportar ZIP desde Lumapse.
- [x] Verificar share sheet nativo con archivo `lumapse-2026-06-18-12-21.zip`.
- [x] Guardar ZIP en `Descargas`.
- [x] Confirmar por ADB que existe `/storage/emulated/0/Download/lumapse-2026-06-18-12-21.zip`.
- [x] Importar el mismo ZIP sobre workspace existente.
- [x] Confirmar preview con `0` importables y duplicados omitidos:
  `21 nota(s), 14 materia(s), 2 fecha(s)`.
- [x] Confirmar importacion no-op y verificar resultado visible en `Importar ZIP`.
- [x] Deploy Android limpio con borrado de datos:
  `bash scripts/deploy-android.sh --target ad071603088c2172aa --clean`
- [x] Confirmar instalacion limpia sin notas en Entrada.
- [x] Importar ZIP desde el selector nativo.
- [x] Confirmar preview con `21 nota(s), 14 materia(s), 2 fecha(s)` importables.
- [x] Confirmar importacion y verificar resultado:
  `Importacion completada: 21 nota(s), 14 materia(s), 2 fecha(s)`.
- [x] Verificar feed restaurado con notas visibles.
- [x] Verificar drawer con materias/secciones restauradas.
- [x] Verificar vista Archivadas con nota archivada restaurada.
- [x] Verificar Calendario con `2` proximas fechas restauradas.
- [x] Repetir importacion del mismo ZIP post-restauracion.
- [x] Confirmar preview duplicado con `0` importables y omision de
  `21 nota(s), 14 materia(s), 2 fecha(s)`.
- [x] Confirmar importacion no-op final.

### Observaciones

- El selector web de archivo en WebView abre correctamente el picker nativo de
  Android; no se requiere picker nativo adicional para esta version.
- Durante la validacion se detecto que, al cambiar a `Importar ZIP` desde la
  pestana interna y confirmar importacion, un refresco del store podia volver
  visualmente a `Exportar ZIP`. Se corrigio sincronizando el panel activo con
  `NoteStore.setViewBackup(panel)`.
- No se observaron crashes ni perdida de datos tras restaurar desde el ZIP.

---

## Evidencia a Registrar

- APK probado y version.
- Dispositivo y version Android.
- Resultado por caso: OK / Fallo / No aplica.
- Capturas o notas breves de cualquier fallo.
- Decision final: apto para release, apto con observaciones o bloqueado.

---

## Criterio de Aprobacion

La validacion manual se considera aprobada si:

- Todos los casos criticos pasan: instalacion, apertura offline, creacion/edicion/persistencia de notas, materias, busqueda y papelera.
- No aparecen crashes ni perdida de datos.
- Cualquier observacion menor queda documentada y no bloquea la distribucion.
