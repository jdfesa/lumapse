# AUD-007 — Contrato de errores de mutaciones del store

**Fecha:** 2026-09-03  
**Estado:** análisis y contrato aprobados para implementación  
**Rama:** `fix/store-action-contract`  
**Base canónica:** `15de2ba95a4334b72a0549c3bd1555c658a28d9d` (`main` = `origin/main`)  
**Alcance:** AUD-007; sin cambios de transacciones, coordinación async, tooling, schema, dependencias ni versión

## 1. Baseline reproducible

El preflight se ejecutó sobre `/home/jd/github/lumapse`, con worktree limpio y `origin` apuntando a
`https://github.com/jdfesa/lumapse.git`. El PR #4 se verificó como integrado y su rama local histórica
se eliminó con autorización explícita antes de crear esta rama. La base corresponde al rebase merge del
PR #5 que cerró AUD-004.

| Evidencia | Resultado |
|---|---|
| `node --version` | `v26.7.0` |
| `npm --version` | `12.0.2` |
| `npm ci` | correcto; 293 paquetes instalados y 0 vulnerabilidades informadas |
| Tests focalizados iniciales | 6 archivos y 188 tests aprobados |
| `package.json` | `0.4.8` |
| Android `versionName` / `versionCode` | `0.4.8` / `408` |

Los tests focalizados iniciales fueron:

- `tests/unit/store/NoteStore.errors.test.js`;
- `tests/unit/store/NoteStore.data.test.js`;
- `tests/unit/store/NoteStore.ui.test.js`;
- `tests/unit/store/NoteStore.academicEvents.test.js`;
- `tests/unit/components/feed/FeedActionRouter.test.js`;
- `tests/unit/components/note-editor/NoteEditor.test.js`.

La suite focalizada normal pasó en Node 26. El workaround de Web Storage permanece reservado únicamente
como diagnóstico de AUD-009 si el gate completo lo requiere; no forma parte de esta corrección.

## 2. Inventario de productores

### 2.1 Mutaciones públicas de notas, materias y papelera

| Mutación | Persistencia | Frontera actual | Retorno exitoso actual |
|---|---|---|---|
| `createNote` | `NoteService.createNote` | `runStoreAction` | nota persistida |
| `updateNote` | `NoteService.updateNote` | `runStoreAction` | nota persistida |
| `updateNoteSilent` | `NoteService.updateNote` | `try/catch` propio | nota persistida |
| `moveNote` | `NoteService.updateNote` | `runStoreAction` | `undefined` |
| `deleteNote` | `NoteService.deleteNote` | `runStoreAction` | `undefined` |
| `createSubject` | `SubjectService.createSubject` | `runStoreAction` | materia/sección persistida |
| `updateSubject` | `SubjectService.updateSubject` | `runStoreAction` | `undefined` |
| `archiveSubject` / `archiveSection` | `SubjectService.archive*` | `runStoreAction` | `undefined` |
| `unarchiveSubject` / `unarchiveSection` | `SubjectService.unarchive*` | `runStoreAction` | `undefined` |
| `deleteSubject` / `deleteSection` | `SubjectService.delete*` | `runStoreAction` | `undefined` |
| `restoreNoteFromTrash` | `SubjectService.restoreNoteFromTrash` | `runStoreAction` | `undefined` |
| `restoreSubjectFromTrash` / `restoreSectionFromTrash` | `SubjectService.restore*` | `runStoreAction` | `undefined` |
| `permanentlyDeleteNote` | `NoteService.permanentlyDeleteNote` | `runStoreAction` | `undefined` |
| `emptyTrash` | `SubjectService.emptyTrash` | `runStoreAction` | `undefined` |

Las cargas `loadNotes`, `loadSubjects`, `loadArchivedSubjects` y `loadTrashCount` son lecturas y quedan
fuera del contrato de mutación. Se mantienen identificadas porque algunas mutaciones las ejecutan después
de persistir para reconciliar caches y contadores.

### 2.2 Mutaciones de presentación con escritura directa

`togglePin`, `toggleArchive` y `setNoteStatus`, en `NoteStore.ui.js`, llaman directamente a
`NoteService.updateNote`. En la base inicial rechazan sin emitir por el canal del store. Los tres actualizan
`state.notes` y notifican solo después de que la escritura resuelve; `toggleArchive` también puede limpiar
`activeNoteId`. Una nota ausente en memoria produce un no-op legítimo y resuelve `undefined` sin tocar SQLite.

### 2.3 Mutaciones académicas

| Mutación | Frontera actual | Retorno exitoso actual |
|---|---|---|
| `createAcademicEvent` | `runStoreAction` | evento persistido |
| `updateAcademicEvent` | `runStoreAction` | evento persistido |
| `deleteAcademicEvent` | `runStoreAction` | `undefined` |

Las tres modifican los caches académicos y llaman `notify()` después de la operación primaria. Crear y
actualizar recargan además próximos eventos; eliminar limpia los caches y también recarga próximos eventos.

## 3. Inventario de consumidores

| Consumidor | Mutaciones | Observación inicial |
|---|---|---|
| `NoteEditor` | `createNote`, `updateNote` | Espera la entidad persistida y preserva borrador/edición tanto ante `undefined` como ante rechazo. El listener DOM registra directamente un método async, por lo que un rechazo puede quedar sin manejar. |
| `FeedActionRouter` | pin, archive, status, move, papelera y `updateNoteSilent` | Pin/archive/status/move ignoran promesas; restauraciones usan `.then(...)` sin rechazo; los refreshes de papelera dependen del éxito pero el router no consume rechazos. El checkbox ya hace rollback, aunque registra nuevamente el error. |
| `NoteList.handleDelete` | `deleteNote` | Espera la mutación, pero el router no espera ni captura el callback retornado. |
| `drawerSubjects` | crear/renombrar materia o sección; desarchivar | Crear y renombrar capturan y muestran toast propio; con emisión global esto duplicaría feedback. Crear sección restaura el estado colapsado ante fallo. Desarchivar se dispara sin esperar ni capturar. |
| `drawerSubjectContextMenu` | archivar y enviar materia/sección a papelera | Los listeners async esperan el store internamente, pero el DOM no consume sus rechazos. |
| `AcademicEventDialog` | crear/actualizar evento | Espera el resultado y mantiene abierto el diálogo ante fallo, pero presenta además un error inline; para `DatabaseError` duplicaría el toast global. |
| `AcademicEventActions` | eliminar evento | El límite DOM captura y registra con `console.warn`; debe evitar repetir el registro/feedback del mismo fallo SQLite. |
| `main.js` | `emptyTrash` desde el aviso global | Oculta el aviso solo después del éxito, pero el listener async puede dejar un rechazo sin manejar. La suscripción global ya convierte cada evento del store en un toast. |
| `ImportService` | `createNote` | Espera la escritura, solo resuelve `true` después del éxito y rechaza su operación ante fallo. No está expuesto en la UI actual. |
| Seeders de QA | `createSubject`, `createNote` | Esperan cada resultado en secuencia y no muestran éxito si una escritura rechaza; sus listeners están deshabilitados en producción. |

`setShowArchived` y las cargas iniciales no son mutaciones persistentes. Se revisarán solo donde sea necesario
para no dejar rechazos en listeners DOM, sin incorporar ownership de requests ni guards de obsolescencia.

## 4. Contrato anterior

La base combina tres políticas observables incompatibles:

1. `runStoreAction` registra cualquier excepción; ante `DatabaseError` emite el evento global y resuelve
   `undefined`, mientras que ante otros errores rechaza.
2. `updateNoteSilent` registra, emite ante `DatabaseError` y siempre vuelve a lanzar.
3. Pin, archive y status rechazan directamente, sin evento global del store.

Esto vuelve ambiguo `undefined`: puede representar una operación void exitosa, un no-op legítimo o un fallo
SQLite absorbido. Como consecuencia, algunos consumidores continúan con cierres o refreshes de éxito y otros
producen rechazos no manejados.

## 5. Contrato elegido

Se adopta una política única de **emitir y propagar**:

1. Toda mutación pública que accede a persistencia atraviesa exactamente una vez `runStoreAction`.
2. Si la acción termina correctamente, se conserva exactamente su valor de retorno actual.
3. Si recibe un `DatabaseError`, `runStoreAction` emite exactamente un evento global con operación, mensaje
   estable y la excepción como causa; luego rechaza con esa misma instancia.
4. Si recibe cualquier otro error, no emite un evento de persistencia y rechaza con la misma instancia.
5. El store no transforma errores en `undefined` ni los sustituye por errores genéricos.
6. Un no-op legítimo anterior a la escritura —por ejemplo una nota inexistente para pin/archive/status— puede
   seguir resolviendo `undefined`; se distingue de un fallo porque no rechaza ni emite.
7. Ninguna capa vuelve a envolver una mutación ya cubierta por `runStoreAction`, evitando emisiones dobles.

Este contrato preserva notas, materias y eventos retornados por las operaciones que ya los exponen, y preserva
`undefined` en las operaciones exitosas de tipo void.

## 6. Reglas de consumo y feedback

- Todo límite DOM consume explícitamente la promesa que dispara.
- El límite UI solo ejecuta cierres, refreshes y feedback de éxito después de una resolución correcta.
- Ante `DatabaseError`, la UI restaura su estado local cuando corresponda y no emite otro evento, toast ni log:
  el único feedback pertenece a la suscripción global de `main.js`.
- Ante un error no SQLite, el límite responsable lo presenta o registra una sola vez según su contexto.
- No se agregan `catch(() => {})`; el manejo debe expresar rollback, restauración o reporte responsable.
- Se admite un helper UI pequeño para clasificar `DatabaseError` ya notificado frente a errores inesperados;
  no se introduce un framework de comandos.

## 7. Estado en memoria y DOM

Las escrituras continúan siendo pesimistas: `state.notes`, caches académicos, contadores, `activeNoteId`,
`activeSubjectId` y `viewMode` solo cambian después de confirmar la operación primaria de persistencia. Si esa
operación rechaza, no se ejecutan `notify()` ni recargas posteriores de éxito.

Los límites visuales aplicarán estas reglas:

- el checkbox Markdown conserva el cambio optimista exclusivamente en el DOM y vuelve a su valor anterior si
  `updateNoteSilent` rechaza;
- el editor mantiene inputs, borrador, contexto de edición y modo foco, y siempre restaura label/disabled del
  botón; el método `handleSave` conserva un rechazo observable para tests y un wrapper DOM lo consume;
- los menús de move/status/pin/archive solo se cierran después del éxito;
- papelera solo refresca después del éxito;
- formularios y diálogos permanecen reintentables ante error;
- no se muestra feedback local duplicado para fallos SQLite ya publicados globalmente.

Una falla posterior de una lectura de reconciliación puede ocurrir después de que la escritura primaria ya se
confirmó. Cambiar la atomicidad entre escrituras y recargas corresponde a AUD-005/AUD-010 y no se resolverá
alterando transacciones en esta rama; las regresiones de AUD-007 fijarán específicamente que un rechazo de la
persistencia primaria no muta memoria ni DOM como éxito.

## 8. Alternativas descartadas

- **Mantener `DatabaseError -> undefined`:** conserva la ambigüedad y los falsos éxitos que originan AUD-007.
- **Resultado discriminado para todas las acciones:** sería válido, pero obligaría a cambiar cada retorno y
  consumidor exitoso. Emitir y rechazar ofrece el mismo carácter inequívoco con menor superficie.
- **Emitir globalmente todos los errores:** mezclaría fallos de programación/dominio con persistencia y podría
  mostrar mensajes engañosos. Los errores no SQLite pertenecen al límite que conoce el contexto.
- **Capturas silenciosas en listeners:** eliminan la advertencia de runtime pero ocultan fallos y dificultan
  rollback y tests.
- **Modificar transacciones o hacer refreshes atómicos:** pertenece a AUD-005/AUD-010 y excede esta rama.

## 9. Plan de regresiones

### Store

- éxito y retorno preservado;
- `DatabaseError`: una emisión exacta y rechazo con la instancia original;
- error no SQLite: rechazo sin emisión;
- ausencia de cambios en state/caches y de `notify()` ante fallo primario;
- cobertura explícita de `createNote`, `updateNote`, `updateNoteSilent`, `togglePin`, `toggleArchive`,
  `setNoteStatus` y mutaciones académicas representativas;
- no-op de nota inexistente claramente resuelto y sin emisión.

### Consumidores

- router sin promesas rechazadas no manejadas;
- trash refresh y cierre de menús exclusivamente después del éxito;
- rollback y desbloqueo del checkbox;
- editor determinista, single-flight y con borrador/contexto preservados;
- formularios de drawer y diálogo académico reintentables;
- una sola señal lógica de feedback por `DatabaseError`.

Los archivos focales se ampliarán sin debilitar expectativas existentes. Cuando un consumidor adicional lo
requiera, su regresión se agregará en el test específico de ese componente o layout.

## 10. Validación prevista

La validación automática incluirá los seis archivos focales, suite completa, coverage, lint, typecheck, build,
presupuesto, checks estáticos/documentales, `verify`, auditorías npm y árbol de dependencias. Cualquier limitación
exclusiva de AUD-008/AUD-009 se informará sin debilitar el gate.

La validación Android no se ejecuta en la máquina remota porque el dispositivo solo estará disponible en la Mac
local. Una vez publicados todos los commits se entregarán SHA exacto, resumen y checklist para probar creación y
edición, pin/archive/status/move, checkbox, eventos académicos, papelera, ausencia de doble toast, reinicio y
persistencia SQLite. El PR no se creará ni mergeará hasta recibir confirmación explícita de ese gate.

## 11. Criterios de cierre

AUD-007 podrá cerrarse únicamente cuando:

- todas las mutaciones persistentes relevantes compartan el contrato emit-and-rethrow;
- cada límite UI inventariado consuma el rechazo y no ejecute efectos de éxito después de un fallo;
- exista una única emisión global por `DatabaseError` y no haya feedback duplicado;
- éxito, no-op y fallo sean distinguibles;
- tests y gates automáticos estén aprobados o sus limitaciones ajenas estén identificadas con exactitud;
- la validación Android local sea aprobada explícitamente;
- documentación, rama local y rama remota reflejen el mismo estado final.

## 12. Límites del frente

- **AUD-005:** no se cambia propiedad de transacciones, migraciones, schema ni atomicidad multioperación.
- **AUD-006:** no se agregan tokens de request, cancelación ni protección contra resultados obsoletos.
- **AUD-008:** no se modifica el fallback offline ni la composición del quality gate.
- **AUD-009:** no se cambia la matriz Node ni se incorpora permanentemente el workaround de Web Storage.
- No se actualizan dependencias, release-helper, versión web/Android, APK, release, tag ni línea base.

El siguiente frente técnico independiente permanece `fix/sqlite-write-coordination` para AUD-005.
