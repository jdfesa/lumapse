# Checklist de Validacion Manual Android — Lumapse

**Hito:** 05 — Testing, Calidad y Distribucion  
**Objetivo:** registrar una prueba manual reproducible en dispositivo Android real antes de distribuir el APK.  
**Estado:** preparado, pendiente de ejecucion en dispositivo real.

---

## Datos de la Prueba

| Campo | Valor |
|---|---|
| Fecha | Pendiente |
| Tester | Jose David Sandoval |
| Dispositivo | Pendiente |
| Version Android | Pendiente |
| Version Lumapse | Pendiente |
| APK probado | Pendiente |
| Commit / tag | Pendiente |
| Resultado general | Pendiente |

---

## Precondiciones

- [ ] `python3 scripts/release-helper.py --type patch --dry-run` ejecutado sin bloqueos.
- [ ] `npm run verify` ejecutado sin fallos.
- [ ] APK candidato generado.
- [ ] Dispositivo Android real disponible.
- [ ] Instalacion desde fuentes desconocidas habilitada, si aplica.
- [ ] Version anterior desinstalada antes de instalar el APK candidato.

> Para una validacion nativa real, no usar el servidor Vite como evidencia principal. El flujo debe probar el APK instalado.

---

## Casos de Validacion

| ID | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| VM-01 | Instalacion limpia | Desinstalar version previa, instalar APK candidato y abrir Lumapse | La app instala y abre sin crash | Pendiente |
| VM-02 | Primer uso offline | Activar modo avion y abrir la app instalada | La app abre sin depender de internet | Pendiente |
| VM-03 | Crear nota | Crear una nota con titulo, texto, lista y Markdown basico | La nota aparece en el feed y conserva formato esperado | Pendiente |
| VM-04 | Persistencia | Cerrar la app, volver a abrirla y revisar la nota creada | La nota sigue disponible | Pendiente |
| VM-05 | Editar nota | Editar contenido y materia de una nota existente | Los cambios se guardan y el feed se actualiza | Pendiente |
| VM-06 | Materias y secciones | Crear una materia, crear una seccion y mover/asociar una nota | La jerarquia Materia > Seccion funciona y filtra correctamente | Pendiente |
| VM-07 | Busqueda | Buscar por titulo y por una palabra del contenido | El feed filtra las notas correctas | Pendiente |
| VM-08 | Pin y archivo | Fijar una nota, archivar otra y revisar el drawer de archivadas | La nota fijada queda arriba y la archivada sale del feed activo | Pendiente |
| VM-09 | Estado academico | Asignar y quitar un marcador de estado a una nota | El marcador visual cambia y puede limpiarse | Pendiente |
| VM-10 | Fechas academicas | Crear, editar y eliminar una fecha academica discreta | El Heatmap/proximas fechas reflejan los cambios | Pendiente |
| VM-11 | Papelera | Eliminar nota/materia, restaurar y luego vaciar papelera | Soft-delete, restauracion y borrado definitivo funcionan | Pendiente |
| VM-12 | Tema | Alternar modo claro/oscuro y reiniciar la app | El tema se aplica y persiste | Pendiente |
| VM-13 | Rotacion/responsivo | Probar vertical y horizontal, si el dispositivo lo permite | No hay solapamientos ni controles inaccesibles | Pendiente |
| VM-14 | Rendimiento percibido | Navegar feed, drawer, editor y heatmap con varias notas | La app responde sin bloqueos perceptibles | Pendiente |
| VM-15 | Exportar/importar ZIP | Exportar ZIP, guardarlo, reinstalar limpio, importar ZIP y repetir importacion | El ZIP se restaura y la segunda importacion omite duplicados | OK 2026-06-18 |

---

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
