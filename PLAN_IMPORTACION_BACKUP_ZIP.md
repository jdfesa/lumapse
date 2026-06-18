# Plan de importacion de backup ZIP - Lumapse

> Documento operativo vivo. Cuando la feature quede implementada y validada,
> este plan debe moverse a `docs/gestion/historico/`.

## Estado

- Fecha de inicio: 2026-06-18
- Rama de trabajo: `codex/importar-backup-zip`
- Estado actual: Fase 6 cerrada - integracion y regresion automatizada
- Feature objetivo: importacion/restauracion desde backup `.zip` generado por Lumapse
- Requisito relacionado: `RF-018`

## Objetivo

Implementar la funcion inversa del backup manual externo: permitir que una
persona seleccione un `.zip` exportado por Lumapse y recupere sus materias,
secciones, notas y fechas academicas en una instalacion nueva o en un dispositivo
distinto.

La primera version debe priorizar recuperacion segura, trazabilidad y ausencia
de acciones destructivas. No debe prometer sincronizacion automatica ni reemplazo
completo del workspace.

## Contexto tecnico

El backup actual ya contiene un contrato restaurable:

- `manifest.json`
- `data/subjects.json`
- `data/notes.json`
- `data/academic-events.json`
- `README.txt`
- Copias Markdown legibles dentro de `notes/`

Para restaurar datos de Lumapse, la fuente canonica sera `data/*.json`.
Los Markdown quedan como salida humana legible y como posible fallback futuro,
pero no seran la fuente principal de importacion en esta fase.

El servicio historico `src/services/ImportService.js` solo importa un `.md`
individual y no resuelve backup, materias, secciones, fechas academicas ni
politica de duplicados. Esta feature debe reemplazar ese alcance para `.zip`
sin forzar una migracion completa del store ni de componentes grandes.

## Principios de trabajo

- Avanzar por fases pequenas, testeables y reversibles.
- Mantener cambios quirurgicos: tocar solo los modulos necesarios.
- Escribir servicios nuevos en TypeScript cuando el contrato aporte seguridad.
- Conservar barrels/fachadas publicas cuando eviten romper imports existentes.
- Separar lectura de ZIP, validacion, plan de importacion, escritura SQLite y UI.
- No pisar ni borrar datos existentes en la primera version.
- Ejecutar escrituras dentro de transacciones.
- Mostrar preview antes de modificar la base local.
- Cerrar cada fase con pruebas unitarias o verificacion manual documentada.

## Alcance de la primera version

Incluye:

- Seleccionar un `.zip` desde el dispositivo o proveedor de documentos.
- Validar que el archivo sea un backup Lumapse compatible.
- Leer y normalizar `subjects`, `notes` y `academicEvents`.
- Mostrar resumen antes de importar.
- Importar en modo seguro, sin reemplazar workspace.
- Restaurar jerarquia Materia -> Seccion cuando sea posible.
- Restaurar notas, archivadas incluidas.
- Restaurar fechas academicas.
- Refrescar store, drawer, feed y calendario despues de importar.

No incluye:

- Google Drive API directa.
- Sincronizacion multi-dispositivo.
- Reemplazo completo del workspace.
- Merge semantico de notas editadas en dos dispositivos.
- Importacion desde Markdown como fuente canonica.
- Adjuntos o imagenes, porque el contrato actual indica `includesAttachments: false`.
- Restaurar papelera, porque el backup v1 excluye items con `deletedAt`.

## Politica de importacion v1

La politica inicial sera `merge-safe`:

- Si el backup no es de `app: "Lumapse"` o usa una version no compatible, se rechaza.
- Si falta `manifest.json` o algun JSON canonico, se rechaza.
- Si el archivo no tiene datos importables, se rechaza.
- Los IDs existentes en la base local no se sobreescriben.
- Los registros nuevos conservan su ID original cuando no hay conflicto.
- Las materias se importan antes que las secciones.
- Si una seccion referencia un padre inexistente e irrecuperable, se importa como materia raiz.
- Si una nota referencia una materia/seccion inexistente, entra en `Entrada`.
- Si una fecha academica referencia una materia/seccion inexistente, queda sin materia.
- Las colisiones de nombre dentro del mismo nivel deben resolverse con sufijo claro,
  por ejemplo `(importada)`, sin cambiar IDs salvo que una decision posterior lo exija.
- El resultado debe informar importados, omitidos, renombrados y relaciones corregidas.

Esta politica se puede ajustar durante la fase de diseno de contrato si los tests
revelan un caso mas seguro, pero cualquier cambio debe quedar registrado en este
archivo antes de implementarse.

## Arquitectura propuesta

### Dominio

- `src/domain/backupImport.ts`
  - Tipos para preview, resumen, decisiones y resultado final.
  - No debe depender de DOM, SQLite ni Capacitor.

### Lectura y validacion del ZIP

- `src/services/backup/BackupImportZipService.ts`
  - Lee `File`, `Blob` o `ArrayBuffer`.
  - Usa `JSZip`.
  - Extrae `manifest.json` y `data/*.json`.
  - Valida version, app, conteos basicos y estructura minima.
  - Devuelve datos normalizados o errores de usuario.

### Plan de importacion

- `src/services/backup/BackupImportPlanService.ts`
  - Compara backup vs datos locales.
  - Calcula conteos, duplicados por ID, colisiones de nombre y relaciones rotas.
  - Produce un preview sin escribir en SQLite.

### Escritura SQLite

- `src/services/backup/BackupImportDataSource.ts`
  - Ejecuta la importacion ya planificada.
  - Usa `runTransaction`.
  - Inserta en orden: materias raiz, secciones, notas, fechas academicas.
  - No depende de UI.

### Orquestacion

- `src/services/backup/BackupImportService.ts`
  - Une lectura, preview y aplicacion.
  - Expone API simple para la UI.

### UI

- `src/components/backup/BackupView.js`
  - Mantener JS por ahora para no mezclar migracion grande de componente DOM.
  - Agregar accion `Importar ZIP`.
  - Mostrar preview y pedir confirmacion antes de escribir.
  - Mostrar resultado final y errores.

### Store

- `src/store/NoteStore.data.js` y `src/store/NoteStore.academicEvents.js`
  - Agregar una accion pequena para refrescar datos despues de importar si hace falta.
  - Preferir reutilizar `loadNotes`, `loadSubjects`, `loadArchivedSubjects`,
    `loadTrashCount`, `loadAcademicEvents` y `loadUpcomingAcademicEvents`.

## Fases

### Fase 0 - Plan y contrato

Objetivo: dejar acordado el alcance antes de tocar codigo funcional.

Tareas:

- [x] Crear rama `codex/importar-backup-zip`.
- [x] Analizar formato actual del backup.
- [x] Crear este plan en la raiz del repo.
- [x] Revisar si la politica `merge-safe` alcanza para el primer MVP.

Criterio de cierre:

- El plan queda versionado.
- No hay cambios funcionales todavia.
- La politica inicial queda definida como `merge-safe`.

Verificacion:

- `git status --short --branch`
- Revision manual de este archivo.

### Fase 1 - Parser y validador de ZIP

Objetivo: abrir un `.zip` Lumapse y convertirlo en datos importables sin tocar SQLite.

Tareas:

- [x] Crear tipos en `src/domain/backupImport.ts`.
- [x] Implementar `BackupImportZipService.ts`.
- [x] Validar `manifest.json`.
- [x] Validar presencia y JSON valido de `data/subjects.json`, `data/notes.json`
  y `data/academic-events.json`.
- [x] Normalizar booleanos, fechas opcionales, `subjectId`, `parentSubjectId`
  y campos faltantes.
- [x] Agregar tests unitarios.

Criterio de cierre:

- Un ZIP generado por `BackupZipService` puede leerse correctamente.
- Un ZIP corrupto, incompleto o incompatible devuelve error claro.
- No se escribe en base de datos.

Verificacion:

- [x] `npm test -- tests/unit/services/backup/BackupImportZipService.test.js`
- [x] `npm run typecheck`

### Fase 2 - Preview y plan de importacion

Objetivo: calcular que pasaria antes de escribir.

Tareas:

- [x] Implementar `BackupImportPlanService.ts`.
- [x] Leer datos locales necesarios para detectar IDs existentes.
- [x] Detectar colisiones de nombre por nivel de materias/secciones.
- [x] Definir renombres seguros con sufijo `(importada)`.
- [x] Resolver referencias rotas a Entrada o raiz segun corresponda.
- [x] Devolver conteos: importables, omitidos, renombrados, relaciones corregidas.
- [x] Agregar tests unitarios puros.

Criterio de cierre:

- El preview permite explicar al usuario que se va a importar.
- Los duplicados no se pisan.
- Las relaciones rotas quedan explicitadas.

Verificacion:

- [x] `npm test -- tests/unit/services/backup/BackupImportPlanService.test.js`
- [x] `npm run typecheck`

### Fase 3 - Escritura transaccional

Objetivo: aplicar un plan validado de importacion de forma atomica.

Tareas:

- [x] Implementar `BackupImportDataSource.ts`.
- [x] Insertar materias raiz.
- [x] Insertar secciones.
- [x] Insertar notas.
- [x] Insertar fechas academicas.
- [x] Omitir IDs existentes sin modificar registros actuales.
- [x] Usar `runTransaction`.
- [x] Agregar tests de escritura con mocks de SQLite.

Criterio de cierre:

- Si falla una escritura intermedia, no queda importacion parcial.
- Los datos existentes no cambian.
- Los timestamps del backup se conservan en registros nuevos.

Verificacion:

- [x] `npm test -- tests/unit/services/backup/BackupImportDataSource.test.js`
- [x] `npm run typecheck`

### Fase 4 - Orquestacion de importacion

Objetivo: exponer una API de servicio simple para la UI.

Tareas:

- [x] Implementar `BackupImportService.ts`.
- [x] Exponer funcion para preparar preview desde archivo.
- [x] Exponer funcion para confirmar importacion desde preview validado.
- [x] Devolver resultado final con resumen de cambios.
- [x] Agregar tests de orquestacion.

Criterio de cierre:

- La UI puede usar una API pequena y estable.
- El flujo preview -> confirmar no duplica parsing ni deja estado ambiguo.

Verificacion:

- [x] `npm test -- tests/unit/services/backup/BackupImportService.test.js`
- [x] `npm run typecheck`

### Fase 5 - UI en Backup

Objetivo: permitir importar desde la vista Backup sin invadir el feed y
separar claramente la accion de exportar backup de la accion inversa de
importar un ZIP compatible con Lumapse.

Tareas:

- [x] Agregar boton `Importar ZIP`.
- [x] Separar la navegacion del drawer en `Exportar ZIP` e `Importar ZIP`.
- [x] Separar la UI interna en pestanas `Exportar ZIP` e `Importar ZIP`.
- [x] Extraer paneles de UI y controlador de importacion para mantener
  `BackupView` por debajo del limite LOC.
- [x] Abrir selector de archivo con `accept=".zip,application/zip"`.
- [x] Mostrar estado de lectura.
- [x] Mostrar preview antes de confirmar.
- [x] Pedir confirmacion con `ConfirmDialog`.
- [x] Ejecutar importacion.
- [x] Refrescar store y vista.
- [x] Mostrar resultado final.
- [x] Agregar tests de componente.

Criterio de cierre:

- El usuario entiende que se va a importar antes de tocar la base.
- Cancelar no modifica nada.
- Un error de archivo o version no rompe la vista.

Verificacion:

- [x] `npm test -- tests/unit/components/backup/BackupView.test.js`
- [x] `npm test -- tests/unit/components/backup/BackupView.test.js tests/unit/store/NoteStore.ui.test.js tests/unit/components/feed/NoteList.test.js`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `scripts/lumapse-audit-bin --code`

### Fase 6 - Integracion y regresion

Objetivo: validar el flujo completo con un ZIP real generado por Lumapse.

Tareas:

- [x] Crear ZIP de fixture desde `generateBackupZip`.
- [x] Importarlo en tests usando servicios reales donde sea viable.
- [x] Probar instalacion limpia.
- [x] Probar workspace con datos existentes.
- [x] Probar duplicados por ID.
- [x] Probar referencias rotas.
- [x] Probar materias archivadas.
- [x] Probar fechas academicas.

Criterio de cierre:

- Un backup generado por Lumapse se puede recuperar.
- No se pierden datos locales existentes.
- El flujo completo queda cubierto por tests focalizados.

Verificacion:

- [x] `npm test -- tests/unit/services/backup/BackupImportRegression.test.js`
- [x] `npm test -- tests/unit/services/backup/BackupImportRegression.test.js tests/unit/services/backup/BackupImportZipService.test.js tests/unit/services/backup/BackupImportPlanService.test.js tests/unit/services/backup/BackupImportDataSource.test.js tests/unit/services/backup/BackupImportService.test.js`
- [x] `npm test`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `scripts/lumapse-audit-bin --code`

### Fase 7 - Validacion Android real

Objetivo: asegurar que el selector de archivo funciona en el entorno principal.

Tareas:

- [ ] Exportar ZIP desde Android real.
- [ ] Guardarlo en almacenamiento local o Google Drive desde share sheet.
- [ ] En una instalacion limpia, seleccionar el `.zip`.
- [ ] Confirmar preview.
- [ ] Importar.
- [ ] Verificar feed, materias, archivadas y calendario.
- [ ] Repetir importacion del mismo ZIP y confirmar que se omiten duplicados.
- [ ] Documentar evidencia y bloqueos.

Criterio de cierre:

- Flujo validado manualmente en Android real.
- Si el selector web de archivo no alcanza en WebView, queda documentada la
  decision de incorporar un picker nativo en una fase adicional.

Verificacion:

- Checklist manual actualizado.
- Evidencia registrada en docs de gestion o changelog segun corresponda.

### Fase 8 - Documentacion y cierre

Objetivo: cerrar trazabilidad y archivar el plan.

Tareas:

- [ ] Actualizar `CHANGELOG.md`.
- [ ] Actualizar `TODO` y `BACKLOG.md`.
- [ ] Actualizar requisitos/HU si corresponde.
- [ ] Mover este plan a `docs/gestion/historico/`.
- [ ] Registrar comandos de verificacion finales.

Criterio de cierre:

- La feature queda implementada, probada y documentada.
- El plan deja de estar en raiz y pasa a historico.

Verificacion:

- `npm run verify` si el alcance documental y de codigo lo amerita.

## Riesgos y mitigaciones

| Riesgo | Mitigacion |
|---|---|
| El usuario cree que importacion equivale a sincronizacion | Mantener lenguaje de backup manual, no sync |
| ZIP corrupto o ajeno a Lumapse | Validar manifest y estructura antes de escribir |
| Datos existentes pisados por accidente | Modo `merge-safe`, sin overwrite en v1 |
| Importacion parcial por error SQL | Usar `runTransaction` |
| Relaciones a materias faltantes | Reubicar en Entrada o raiz e informarlo |
| Duplicados de materias confunden la UI | Resolver colisiones con sufijo claro |
| File picker no funciona bien en Android WebView | Validar manualmente y planificar picker nativo solo si hace falta |
| Se mezcla migracion TS con refactor grande de UI | Tipar servicios nuevos y mantener componentes grandes en JS |

## Bitacora

### 2026-06-18

- Se creo la rama `codex/importar-backup-zip`.
- Se confirmo que el ZIP actual incluye JSON canonico restaurable.
- Se definio que la primera version usara `data/*.json` como fuente de verdad.
- Se creo este plan operativo en la raiz del repo.
- Se cerro Fase 1 con tipos en `src/domain/backupImport.ts`, parser en
  `src/services/backup/BackupImportZipService.ts` y tests focalizados.
- Verificaciones ejecutadas:
  - `npm test -- tests/unit/services/backup/BackupImportZipService.test.js`
  - `npm run typecheck`
- Se cerro Fase 2 con preview puro en
  `src/services/backup/BackupImportPlanService.ts`.
- El plan ahora detecta duplicados locales, IDs duplicados dentro del backup,
  colisiones de nombre, relaciones rotas y ordena materias padre antes que
  secciones para preparar la escritura transaccional.
- Verificaciones ejecutadas:
  - `npm test -- tests/unit/services/backup/BackupImportPlanService.test.js`
  - `npm test -- tests/unit/services/backup/BackupImportZipService.test.js tests/unit/services/backup/BackupImportPlanService.test.js`
  - `npm run typecheck`
- Se cerro Fase 3 con aplicacion transaccional en
  `src/services/backup/BackupImportDataSource.ts`.
- La escritura conserva IDs y timestamps del backup, inserta materias antes que
  notas y fechas, convierte booleanos a enteros SQLite y no abre transaccion
  cuando no hay datos importables.
- Verificaciones ejecutadas:
  - `npm test -- tests/unit/services/backup/BackupImportDataSource.test.js`
  - `npm test -- tests/unit/services/backup/BackupImportZipService.test.js tests/unit/services/backup/BackupImportPlanService.test.js tests/unit/services/backup/BackupImportDataSource.test.js`
  - `npm run typecheck`
- Se cerro Fase 4 con la fachada de orquestacion en
  `src/services/backup/BackupImportService.ts`.
- El flujo queda separado en dos pasos para UI: `prepareBackupImport()` genera
  preview sin escribir y `confirmBackupImport()` aplica un plan ya confirmado.
  Tambien queda `importBackupZip()` como atajo programatico.
- Verificaciones ejecutadas:
  - `npm test -- tests/unit/services/backup/BackupImportService.test.js`
  - `npm test -- tests/unit/services/backup/BackupImportZipService.test.js tests/unit/services/backup/BackupImportPlanService.test.js tests/unit/services/backup/BackupImportDataSource.test.js tests/unit/services/backup/BackupImportService.test.js`
  - `npm run typecheck`
- Se cerro Fase 5 integrando importacion en la experiencia de Backup.
- Se ajusto la navegacion para separar `Exportar ZIP` de `Importar ZIP`,
  evitando que una sola accion llamada "Backup" oculte la funcion inversa.
- Se normalizo la microcopia de botones y titulos para que cada accion indique
  explicitamente si crea o consume un ZIP.
- `BackupView` quedo como orquestador liviano y la UI/flujo se dividio en
  `BackupExportUI`, `BackupImportUI`, `BackupViewPanels` y
  `BackupImportFlowController`.
- El guard Rust de tamano queda sin `PELIGRO`; `BackupView.js` baja a 279 LOC
  no vacias en `scripts/lumapse-audit-bin --code`.
- La UI permite seleccionar ZIP, generar preview, cancelar, confirmar con
  `ConfirmDialog`, aplicar importacion y mostrar resultado.
- `NoteList` inyecta un callback para refrescar notas, materias, archivadas,
  papelera y fechas academicas despues de una importacion exitosa.
- Verificaciones ejecutadas:
  - `npm test -- tests/unit/components/backup/BackupView.test.js`
  - `npm test -- tests/unit/components/backup/BackupView.test.js tests/unit/store/NoteStore.ui.test.js tests/unit/components/feed/NoteList.test.js`
  - `npm test -- tests/unit/components/backup/BackupView.test.js tests/unit/components/feed/NoteList.test.js tests/unit/services/backup/BackupImportZipService.test.js tests/unit/services/backup/BackupImportPlanService.test.js tests/unit/services/backup/BackupImportDataSource.test.js tests/unit/services/backup/BackupImportService.test.js`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - `scripts/lumapse-audit-bin --code`
- Verificacion visual local pendiente: `npm run dev -- --host 127.0.0.1 --port 5173`
  fallo dentro del sandbox con `EPERM` y la ejecucion escalada fue rechazada.
- Se cerro Fase 6 agregando regresion de integracion en
  `tests/unit/services/backup/BackupImportRegression.test.js`.
- La regresion crea ZIPs reales con `generateBackupZip()` y los reimporta con
  `prepareBackupImport()`/`confirmBackupImport()` o `importBackupZip()`, usando
  parser, planner y datasource reales con SQLite controlado por mock.
- Cobertura agregada:
  - instalacion limpia con materias, secciones, notas archivadas y fechas;
  - workspace con datos existentes y renombre seguro;
  - repeticion del mismo ZIP con duplicados por ID omitidos;
  - referencias rotas reparadas a `null`;
  - fallback de timestamps desde `manifest.createdAt`.
- Verificaciones ejecutadas:
  - `npm test -- tests/unit/services/backup/BackupImportRegression.test.js`
  - `npm test -- tests/unit/services/backup/BackupImportRegression.test.js tests/unit/services/backup/BackupImportZipService.test.js tests/unit/services/backup/BackupImportPlanService.test.js tests/unit/services/backup/BackupImportDataSource.test.js tests/unit/services/backup/BackupImportService.test.js`
  - `npm test`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - `scripts/lumapse-audit-bin --code`
