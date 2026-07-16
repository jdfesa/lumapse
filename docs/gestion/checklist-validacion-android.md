# Checklist de Validacion Manual Android — Lumapse

**Hito:** 05 — Testing, Calidad y Distribucion  
**Objetivo:** registrar una prueba manual reproducible en dispositivo Android real antes de distribuir el APK.  
**Estado:** validacion inicial aprobada en dispositivo Android real; apto con observaciones menores.

---

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
