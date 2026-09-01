# AUD-003 — Análisis de seguridad de importación de backups

**Estado:** Análisis revalidado; implementación pendiente  
**Rama:** `fix/backup-import-security`  
**Commit base revisado:** `376f7b6` (`main`)  
**Fecha:** 2026-09-01  
**Prioridad:** P0  
**Alcance:** frontera ZIP/JSON, validación runtime, integridad estructural, consumo de recursos y renderizado de datos importados

---

## 1. Objetivo y alcance

Revalidar el hallazgo AUD-003 contra el código vigente, sin asumir que la auditoría original
continuara siendo exacta, y definir una remediación modular que preserve backups legítimos de
Lumapse.

Este documento versiona la fase de análisis. No modifica código de producción ni autoriza por sí
solo cambios fuera del alcance descrito.

La rama y el primer commit se publicaron durante la fase de análisis, antes del checkpoint de
aprobación previsto. Ese desvío queda limitado a documentación: la implementación de producción
continúa expresamente pendiente y requiere autorización antes de comenzar.

### Incluido

- Lectura de fuentes `Blob`, `ArrayBuffer`, `Uint8Array` y base64.
- Inspección y extracción del ZIP.
- Validación de `manifest.json` y los tres JSON canónicos.
- IDs, colores, fechas, timestamps, textos, booleans y relaciones.
- Límites de archivo, entradas, expansión, documentos, entidades y campos.
- Flujo de datos hasta DOM, atributos, estilos y selectores.
- Compatibilidad con backups v1 históricos y actuales.
- Pruebas unitarias, integración, regresión y validación Android requeridas.

### Excluido

- Actualizaciones de dependencias de AUD-004.
- Refactors generales de `NoteEditor`.
- Cambios estéticos.
- Migraciones arquitectónicas amplias.
- Otros hallazgos de la auditoría.
- Firma criptográfica o autenticación de backups.

---

## 2. Sincronización y documentación revisada

La revisión comenzó con el repositorio limpio. Se actualizó `main` mediante `fetch --prune` y
`pull --ff-only`; el resultado quedó sincronizado con `origin/main` en `376f7b6`.

Documentación leída antes de inspeccionar el flujo:

- [`../../README.md`](../../README.md).
- [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md).
- [`revision-tecnica-priorizada-2026-09-01.md`](./revision-tecnica-priorizada-2026-09-01.md).
- [ADR-006 — Persistencia y tooling SQLite](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).
- [ADR-007 — Organización por feature](../adr/ADR-007-organizacion-componentes-por-feature.md).
- [ADR-008 — Arquitectura modular y patrones](../adr/ADR-008-arquitectura-modular-y-patrones.md).
- [Requisitos no funcionales](../producto/requisitos-no-funcionales.md).
- [Plan histórico de importación ZIP](./historico/plan-importacion-backup-zip-2026-06-18.md).

La propuesta conserva el monolito cliente modular, el Service Layer, la inyección explícita de
dependencias y la persistencia local SQLite definidos en los ADR vigentes.

---

## 3. Resultado ejecutivo

AUD-003 se confirma con una precisión de alcance:

| Riesgo | Resultado |
|---|---|
| Inyección persistente de nodos DOM/HTML | Confirmada |
| Inyección en atributos | Confirmada |
| Inyección CSS y alteración visual | Confirmada |
| Ejecución JavaScript/XSS | Potencial; no demostrada |
| Datos estructuralmente inválidos | Confirmada |
| Consumo excesivo de memoria/ZIP bomb | Confirmado |
| Inyección SQL | Refutada en el flujo actual |
| HTML directo desde Markdown de notas | Refutado en el flujo actual |
| ZIP Slip con escritura arbitraria | Refutado en el flujo actual |

La prioridad P0 permanece justificada. Un backup es una frontera no confiable aunque su selección
requiera una acción explícita del usuario: sus datos se persisten y vuelven a renderizar en
sesiones posteriores.

El CSP de `index.html:18-23` reduce mecanismos de ejecución inline, pero no impide crear nodos,
atributos o controles visuales. Además, `style-src 'unsafe-inline'` permite que una inyección CSS
afecte la interfaz.

---

## 4. Revalidación de las afirmaciones originales

### 4.1 Validación insuficiente en el parser — confirmada

`src/services/backup/BackupImportZipService.ts` presenta los siguientes comportamientos:

- `textValue()` (`51-53`) convierte números, arrays u objetos a strings.
- `requireText()` (`60-66`) solo comprueba que el resultado no quede vacío.
- `normalizeBoolean()` (`68-75`) convierte valores desconocidos silenciosamente a `false`.
- `normalizeDateTime()` (`77-80`) acepta cualquier texto o aplica fallback sin validar fecha.
- `normalizeDate()` (`82-88`) solo exige el patrón `YYYY-MM-DD`; acepta días inexistentes.
- `normalizeSubjectId()` y `normalizeColor()` (`90-96`) aceptan cualquier texto opcional.
- Las entidades (`119-195`) no limitan arrays ni longitudes de campos.
- `validateManifest()` (`217-255`) admite conteos coercionados y booleans mediante `Boolean()`.
- `loadZip()` (`300-315`) no limita el tamaño de la fuente.
- `readJsonFile()` (`317-328`) materializa todo el archivo como string antes de `JSON.parse()`.
- `parseBackupImportZip()` (`330-363`) extrae tres JSON en paralelo mediante `Promise.all()`.

Ejemplos de estado inválido aceptado actualmente:

- Un objeto como texto termina persistido como `[object Object]`.
- `dataPolicy.includesDeletedItems: "false"` se interpreta como `true`.
- Conteos negativos, fraccionarios, `NaN` o `Infinity` no tienen contrato estricto.
- `2026-02-31` supera la expresión regular.
- Un timestamp arbitrario puede llegar hasta `new Date(...).toISOString()`.
- Cualquier valor truthy en `deletedAt` provoca la omisión silenciosa de la fila.

### 4.2 Primitivas TypeScript — hecho confirmado, causa matizada

`src/domain/primitives.ts` define `EntityId`, `ISODateString`, `ISODateTimeString` y `HexColor`
como aliases de `string`. Los aliases no existen en runtime; esto es comportamiento normal de
TypeScript.

El defecto no es conservar esos aliases, sino tratarlos como prueba de validación después de
coercionar datos no confiables. Cambiar a tipos branded tampoco sustituiría un parser runtime.

### 4.3 IDs, colores, fechas y textos llegan a renderizadores — confirmada parcialmente

- IDs de materias y notas llegan a templates sin codificación contextual.
- Colores llegan a declaraciones CSS inline sin allowlist.
- Nombres se escapan correctamente como texto en varios lugares, pero no siempre como atributo.
- Fechas y timestamps llegan a formatters y al Heatmap sin garantizar validez real.
- El contenido Markdown sí pasa por `MarkdownService` y DOMPurify.

### 4.4 Falta de límites — confirmada

No existen límites para:

- bytes del archivo o fuente base64;
- cantidad de entradas ZIP;
- tamaño comprimido o descomprimido total;
- tamaño individual de `manifest.json` o JSON canónicos;
- cantidad de materias, notas o eventos;
- longitud de IDs, rutas, nombres, títulos o contenido.

El parser tampoco separa la prevalidación de metadatos ZIP de la extracción efectiva.

---

## 5. Recorrido completo de datos

```text
BackupView <input type=file>
  -> BackupImportFlowController.prepareFromFile(File)
  -> BackupImportService.prepareBackupImport(source)
  -> BackupImportZipService.parseBackupImportZip(source)
       -> JSZip.loadAsync(...)
       -> manifest.json
       -> data/subjects.json
       -> data/notes.json
       -> data/academic-events.json
       -> coerción/normalización actual
  -> BackupImportPlanService.createCurrentBackupImportPlan(parsed)
       -> duplicados
       -> conflictos locales
       -> reparación de relaciones
       -> preview
  -> confirmación del usuario
  -> BackupImportDataSource.applyBackupImportPlan(plan)
       -> transacción SQLite
       -> INSERT parametrizados
  -> NoteList.refreshAfterBackupImport()
       -> recarga de notas, materias, archivadas, papelera y eventos
  -> store
  -> renderizadores DOM/atributos/CSS
```

### 5.1 Selección y preview

`src/components/backup/BackupImportFlowController.js:31-60` pasa el `File` completo al servicio.
No hay prevalidación de `file.size`.

El preview no renderiza entidades crudas. `BackupImportUI.js` codifica el filename y los errores,
y `Toast.js` utiliza `textContent`; esta etapa no constituye un sink de inyección.

### 5.2 Planificación

`BackupImportPlanService.ts` conserva fortalezas importantes:

- omite IDs duplicados dentro del backup;
- evita sobrescribir IDs locales;
- repara referencias inexistentes;
- renombra materias en conflicto;
- prepara un preview antes de escribir.

Sin embargo, `planSubjects()` (`141-244`) puede conservar profundidad 3+ si una entidad apunta a
una sección importada o local. También una cadena circular larga puede producir una jerarquía que
la UI no representa por completo. Esto contradice DP-004 y la regla existente
`validateMaxDepth()` de `SubjectService.validation.ts:68-84`.

### 5.3 Persistencia

`BackupImportDataSource.ts:35-90` usa placeholders `?`, y `applyBackupImportPlan()` ejecuta los
inserts dentro de `runTransaction()`. Por ello se refuta una inyección SQL en este flujo.

La persistencia conserva strings crudos, lo cual es correcto para texto de usuario siempre que la
frontera valide estructura y la presentación aplique codificación contextual.

### 5.4 Recarga y sinks

`NoteList.refreshAfterBackupImport()` recarga todos los estados que pueden presentar datos
restaurados. SQLite y el store no sanitizan esos strings antes de entregarlos a UI.

| Campo | Sinks actuales | Evaluación |
|---|---|---|
| `subject.id` | `drawerSubjectsRender.js`, `drawerArchivedSubjects.js`, `NoteCardRenderer.js`, `drawerSubjects.js`, papelera posterior | Atributos/IDs sin escape y selectores construidos con input |
| `subject.name` | drawer, archivadas, badges, pickers, eventos y papelera | Texto generalmente seguro; atributos del drawer usan escape de texto incorrecto |
| `subject.color` | drawer, archivadas, badge, menú de movimiento, pickers, eventos y papelera | Inyección CSS confirmada |
| `note.id` | `NoteList.js`, `NoteCardRenderer.js`, `TrashView.js` | Atributos sin escape |
| `note.title` | feed y papelera | Codificado como texto en los sinks inspeccionados |
| `note.content` | Markdown del feed, textarea del editor, preview de papelera | DOMPurify en Markdown; `textContent`/escape en los demás |
| `note.updatedAt` | fecha relativa y `Heatmap.calculateActivity()` | Puede producir `RangeError` |
| `event.id`, `title`, `date` | `AcademicEventTypes.ts` | Contextos HTML/atributo codificados; fecha todavía puede ser inválida |
| `event.subjectId` | resolución de materia para label/color | El color de materia vuelve a llegar a CSS |

---

## 6. Riesgos confirmados por categoría

### 6.1 Inyección DOM/HTML — alta

Interpolaciones relevantes:

- `drawerSubjectsRender.js:51-55`, `63`, `71-81`, `92-99`, `117-120`.
- `NoteList.js:277`, `300`, `304`, `318`, `322`, `326`.
- `NoteCardRenderer.js:69`, `75-76`.
- `TrashView.js:87`, `115`, `141`, `144`.

Un ID puede cerrar un atributo y agregar markup cuando el template se asigna mediante
`innerHTML`. El valor persiste en SQLite y reaparece cada vez que se reconstruye la vista.

La prueba temporal de revalidación creó nodos controlados por el dato importado. No se demostró
ejecución JavaScript; la conclusión precisa es **inyección DOM persistente con XSS potencial**.

### 6.2 Inyección en atributos — alta

`appShell.escapeHtml()` (`173-177`) crea un nodo de texto y devuelve su `innerHTML`. Esto es
adecuado para texto HTML, pero las comillas no necesitan codificarse en un nodo de texto.

Se utiliza en atributos como:

```html
data-subject-name="${escapeHtml(subject.name)}"
```

Por tanto, el helper correcto se usa en el contexto incorrecto. Otros IDs ni siquiera pasan por
ese helper.

### 6.3 Inyección CSS — alta

Ejemplos:

- `drawerSubjectsRender.js:54,95`.
- `drawerArchivedSubjects.js:39,62`.
- `NoteList.js:44`.
- `NoteCardRenderer.js:69`.
- `TrashView.js:64,81,109`.
- `SubjectPicker.js:120`.
- `AcademicEventTypes.ts:202,233`.

Escapar comillas HTML no protege la gramática CSS. Un punto y coma puede introducir nuevas
declaraciones sin salir del atributo.

La prueba temporal confirmó que un color manipulado aplicó `position: fixed` e `inset`. El CSP
permite estilos inline, por lo que puede producir overlay, denegación visual o suplantación de UI.

`AcademicEventSubjectPicker.js` no reproduce el breakout: construye nodos y utiliza CSSOM. Aun
así, debe recibir un color válido para conservar el contrato visual.

### 6.4 Integridad estructural y disponibilidad — media/alta

Una prueba temporal confirmó que un `updatedAt` inválido llega a
`Heatmap.calculateActivity()` (`59-65`) y provoca `RangeError` en `toISOString()`.

Otros efectos:

- relaciones de profundidad 3+ inaccesibles desde el drawer;
- selectores CSS inválidos en `drawerSubjects.js:217,232,259,265,298,311`;
- conteos del manifest engañosos;
- objetos coercionados y datos semánticamente corruptos;
- fechas académicas inexistentes que no corresponden a una celda real.

### 6.5 Consumo de memoria/ZIP bomb — alta

Una prueba controlada generó un JSON repetitivo de 2.097.152 bytes dentro de un ZIP de 2.264
bytes, una expansión aproximada de 926 veces. El parser lo aceptó y no existe un punto en el flujo
que detenga una variante mayor.

El riesgo aumenta porque:

- JSZip recibe la fuente completa;
- el directorio puede contener entradas adicionales;
- los tres JSON se descomprimen concurrentemente;
- cada JSON existe como bytes, string UTF-16 y objetos de `JSON.parse()` durante el procesamiento.

---

## 7. Riesgos refutados y fortalezas conservadas

### Inyección SQL

Refutada. Los valores se envían mediante placeholders y la aplicación del plan es transaccional.

### Markdown crudo

Refutado para el código actual. `MarkdownService.ts:205` pasa la salida de `marked` por DOMPurify.
La prueba temporal eliminó un `script` y un handler `onerror`.

Esto no sustituye AUD-004: la actualización de DOMPurify y otras dependencias continúa fuera de
este PR.

### ZIP Slip

No se escriben entradas del ZIP en el filesystem y solo se leen archivos canónicos. JSZip además
normaliza componentes `..`. No hay escritura arbitraria en el flujo actual.

La remediación debe igualmente rechazar rutas inseguras: una ruta normalizada puede colisionar
con `manifest.json` u otro nombre canónico y crear ambigüedad.

### Papelera importada

El parser omite filas con `deletedAt`, por lo que `TrashView` no recibe elementos eliminados de
forma inmediata. Una entidad activa contaminada sí alcanza esa vista después de un borrado
posterior; por ello sus sinks siguen dentro del alcance defensivo.

### Otros controles que deben preservarse

- Preview explícito antes de persistir.
- No sobrescritura por ID.
- Reparación de relaciones faltantes.
- Renombrado determinista por conflicto de nombre.
- Escritura transaccional.
- UI de errores mediante texto, no HTML crudo.

---

## 8. Diseño de remediación

La solución propuesta aplica defensa en profundidad sin dependencias nuevas ni reescrituras
generales.

### 8.1 Validadores runtime de primitivas

Crear `src/domain/primitiveValidation.ts` con funciones puras para:

- IDs opacos seguros;
- colores hexadecimales;
- fechas de calendario;
- timestamps RFC 3339;
- strings acotados y caracteres de control.

`src/domain/primitives.ts` permanece como contrato estático. Los validadores se reutilizan desde
backup y presentación para evitar reglas de color duplicadas.

### 8.2 Política central de límites

Crear `src/services/backup/BackupImportPolicy.ts` como única fuente para límites de archivo,
entradas, documentos, entidades y campos.

### 8.3 Preflight ZIP32 antes de JSZip

Crear `src/services/backup/BackupZipPreflight.ts` para:

1. comprobar el tamaño de `Blob`/buffer/base64 antes de copiar o decodificar;
2. normalizar la fuente a bytes una sola vez;
3. localizar EOCD y recorrer el directorio central;
4. limitar entradas y tamaños antes de `JSZip.loadAsync()`;
5. rechazar rutas inseguras, colisiones, cifrado, multidisk y ZIP64;
6. aceptar `STORE` y `DEFLATE`.

No se debe depender de `zipObject._data`: es metadata privada de JSZip y no limita la cantidad de
entradas antes del parseo.

La extracción de los JSON canónicos debe ser secuencial y acotada por bytes reales. Un stream de
JSZip se pausa y rechaza cuando la salida supera el presupuesto, aun si el directorio central
declara un tamaño menor.

#### Checkpoint obligatorio de diseño

`BackupZipPreflight.ts` no debe implementarse directamente a partir de este documento. Antes de
escribir el lector binario se debe presentar y aprobar un diseño focalizado que especifique:

- métodos y flags ZIP admitidos para backups actuales `STORE` e históricos `DEFLATE`;
- tratamiento de data descriptors, nombres UTF-8, comentarios y campos extra;
- búsqueda acotada del EOCD y rechazo de truncamiento, multidisk y ZIP64;
- validación de offsets, tamaños y conteos sin overflow;
- coherencia entre directorio central y headers locales;
- rechazo de cifrado, métodos desconocidos, rutas inseguras y nombres canónicos duplicados;
- responsabilidad de CRC y manejo de archivos corruptos;
- aborto por bytes reales descomprimidos aunque la metadata declare un valor menor;
- interacción exacta con JSZip sin depender de propiedades privadas.

El checkpoint también debe comparar esta alternativa con una solución más pequeña basada en APIs
públicas existentes. Solo se conserva el parser ZIP32 propio si reduce el riesgo total y puede
probarse como una unidad aislada; la ausencia de dependencias nuevas no justifica introducir un
parser ambiguo o insuficientemente verificable.

### 8.4 Validación de manifest y entidades

Crear `src/services/backup/BackupImportValidation.ts`. Debe:

- validar tipos reales sin `String(object)`;
- conservar compatibilidad explícita de campos opcionales;
- devolver errores con `ruta`, índice y campo;
- evitar incluir valores enormes o markup no confiable en mensajes;
- producir entidades válidas antes de crear el plan.

`BackupImportZipService.ts` quedaría como orquestador de fuente, preflight, extracción y
validación, reduciendo su responsabilidad actual.

### 8.5 Jerarquía

`BackupImportPlanService.ts` debe reutilizar `validateMaxDepth()` de
`SubjectService.validation.ts` contra materias locales y ya planificadas.

Un padre inexistente, circular o que ya sea una sección se repara a `null` y se registra en
`relationshipRepairs`; nunca se persiste profundidad 3+.

### 8.6 Presentación por contexto

Crear `src/components/common/htmlEscaping.js` con APIs explícitas:

- `escapeHtmlText()`;
- `escapeHtmlAttribute()`.

Reglas:

- texto visible mediante `textContent` o escape de texto;
- atributos mediante escape de atributos;
- CSS mediante allowlist de color, nunca un escape HTML genérico;
- selectores sin interpolar IDs no confiables;
- construcción DOM en listas simples cuando reduzca riesgo;
- templates existentes pueden mantenerse si todos los tokens dinámicos tienen contexto definido.

No se propone almacenar texto escapado en SQLite. El texto de usuario se preserva y se codifica
al renderizar.

---

## 9. Contratos propuestos

| Dato | Contrato runtime |
|---|---|
| ID | String recortado, 1-128 caracteres, `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$` |
| Color | `null` o `#[0-9A-Fa-f]{6}`; normalización a minúsculas |
| Fecha | `YYYY-MM-DD` con día real, incluidos años bisiestos |
| Timestamp | RFC 3339 con zona, componentes válidos y resultado finito; normalización UTC |
| Texto de una línea | Unicode, sin NUL/C0 y con límite por campo |
| Contenido | String o `null`/ausente como vacío; Markdown preservado; límite UTF-8 |
| Boolean | Boolean y compatibilidad exacta con `0/1/"true"/"false"/"1"/"0"` |
| `deletedAt` | Ausente/null o timestamp válido; si existe se omite con aviso consolidado |
| `type` académico | Allowlist actual: `parcial`, `final`, `tp`, `exposicion` |
| Conteos | Enteros finitos, no negativos y dentro de límites |
| `files` | Strings únicos, acotados y sin rutas inseguras |

No se exige UUID estricto: tests, fixtures y backups históricos usan IDs como `subj-math`,
`note-1` y `event-1`.

Longitudes iniciales:

- ID: 128 caracteres ASCII.
- Materia/sección: 120 code points.
- Título de nota: 4.096 code points.
- Contenido de una nota: 2 MiB UTF-8.
- Estado de nota: 16 code points.
- Título académico: `ACADEMIC_EVENT_TITLE_MAX_LENGTH` (65).
- Filename: 255 caracteres.
- Ruta ZIP: 512 caracteres.

Los textos legítimos pueden contener `<`, `>`, comillas, emoji y Markdown; la seguridad se
resuelve por contexto de salida, no destruyendo contenido al importar.

---

## 10. Límites iniciales recomendados

| Recurso | Límite | Justificación |
|---|---:|---|
| ZIP/fuente comprimida | 64 MiB | Techo explícito para WebView y buffers/base64 |
| Total descomprimido anunciado | 64 MiB | Acota expansión total independientemente de la ratio |
| Entradas ZIP | 5.100 | Cinco entradas base más un Markdown por cada una de 5.000 notas |
| `manifest.json` | 4 MiB | Puede listar miles de rutas Markdown |
| `data/subjects.json` | 2 MiB | Amplio para 1.000 materias/secciones |
| `data/notes.json` | 24 MiB | Presupuesto principal del backup |
| `data/academic-events.json` | 8 MiB | Amplio para 5.000 eventos |
| Markdown individual | 2 MiB | Alineado con el contenido máximo por nota |
| Materias/secciones | 1.000 | Muy superior al uso normal |
| Notas | 5.000 | Diez veces el objetivo RNF-004 de 500 notas |
| Eventos académicos | 5.000 | Techo de seguridad, no promesa de rendimiento |

No se propone un límite de ratio de compresión. Un texto legítimo repetitivo puede comprimir muy
bien; los límites absolutos de salida son más predecibles.

Estos valores deben validarse antes de congelarse con:

- el backup Android real documentado;
- una fixture de 500 notas;
- archivos exactamente en el límite y límite + 1;
- prueba manual en el dispositivo Samsung objetivo.

---

## 11. Compatibilidad con backups v1

### Formatos ZIP que deben conservarse

El historial Git muestra dos escritores válidos:

- Antes de `e7b3ec2`, `BackupZipService.js` utilizaba JSZip con `compression: 'DEFLATE'`.
- El escritor actual `BackupZipArchive.ts` utiliza `STORE` sin compresión.

El importador endurecido debe aceptar métodos 0 y 8. Restringirlo a `STORE` rompería backups
legítimos de versiones anteriores.

### Comportamientos que deben preservarse

- IDs históricos no UUID.
- Colores hexadecimales de seis dígitos fuera de la paleta actual, por ejemplo `#38bdf8`.
- Booleans legacy definidos explícitamente.
- Timestamp ausente con fallback a un timestamp válido del manifest.
- `null` en título/contenido opcional según el contrato existente.
- Entradas Markdown adicionales.
- Omisión de duplicados y conflictos locales.
- Renombrado y reparación de relaciones.

### Cambios deliberados

- Valores anteriormente aceptados solo por coerción serán rechazados.
- Colores CSS arbitrarios, shorthand o nombres de color no serán aceptados.
- Backups que superen límites fallarán completos antes de escribir.
- Timestamps válidos con offset podrán normalizarse a UTC preservando el instante.

No existe un límite que conserve todos los backups posibles porque el exportador actual puede
generar contenido sin techo. Los límites son un cambio de seguridad necesario y deben calibrarse
con backups reales antes del merge.

---

## 12. Archivos previstos para implementación

### Crear

- `src/domain/primitiveValidation.ts`.
- `src/services/backup/BackupImportPolicy.ts`.
- `src/services/backup/BackupZipPreflight.ts`.
- `src/services/backup/BackupImportValidation.ts`.
- `src/components/common/htmlEscaping.js`.
- Tests unitarios correspondientes.

### Modificar

- `src/services/backup/BackupImportZipService.ts`.
- `src/services/backup/BackupImportPlanService.ts`.
- `src/layout/drawerSubjectsRender.js`.
- `src/layout/drawerSubjects.js`.
- `src/layout/drawerArchivedSubjects.js`.
- `src/components/feed/NoteList.js`.
- `src/components/feed/NoteCardRenderer.js`.
- `src/components/feed/TrashView.js`.
- `src/components/note-editor/SubjectPicker.js`.
- `src/components/academic-events/AcademicEventTypes.ts`.
- `src/components/academic-events/Heatmap.js`.
- Tests actuales de importación y renderizado directamente relacionados.

### Mantener intactos

- `src/domain/primitives.ts`.
- `src/services/backup/BackupImportService.ts`.
- `src/services/backup/BackupImportDataSource.ts`.
- `src/services/backup/BackupZipService.ts`.
- `src/services/backup/BackupZipArchive.ts`.
- `src/services/MarkdownService.ts`.
- Schema, migraciones y conexión SQLite.
- `BackupView`, `BackupImportFlowController` y `BackupImportUI`.
- `AcademicEventSubjectPicker.js`.
- `NoteEditor`.
- `package.json` y lockfile.

---

## 13. Plan de pruebas

### Evidencia de la fase de análisis

Una revalidación independiente ejecutó el siguiente conjunto existente directamente relacionado
con parser, plan, datasource, servicio, regresión y renderizadores:

```bash
npm test -- \
  tests/unit/services/backup/BackupImportZipService.test.js \
  tests/unit/services/backup/BackupImportPlanService.test.js \
  tests/unit/services/backup/BackupImportDataSource.test.js \
  tests/unit/services/backup/BackupImportService.test.js \
  tests/unit/services/backup/BackupImportRegression.test.js \
  tests/unit/components/feed/NoteList.test.js \
  tests/unit/components/feed/TrashView.test.js \
  tests/unit/components/academic-events/AcademicEventTypes.test.js \
  tests/unit/components/academic-events/Heatmap.test.js \
  tests/unit/layout/drawerSubjects.test.js
```

Resultado reproducido: **10 archivos y 69 tests aprobados**.

El análisis original reportó pruebas exploratorias temporales fuera del repositorio. Esos
artefactos no se conservaron y, por tanto, sus resultados no constituyen todavía un gate
reproducible. Los seis escenarios reportados fueron:

1. ZIP manipulado -> parser -> nodo DOM controlado.
2. Inyección de atributo mediante valores persistidos.
3. Inyección de declaraciones CSS adicionales.
4. Timestamp inválido -> `RangeError` en Heatmap.
5. Expansión ZIP sin límite.
6. Eliminación de `script` y `onerror` por DOMPurify.

Cada escenario que fundamente la remediación debe convertirse en una regresión permanente,
revisable y fallida antes del fix correspondiente, sin conservar payloads ejecutables en datos de
producción ni depender de evidencia temporal.

### Unitarias requeridas

- IDs válidos, históricos, excesivos y con metacaracteres.
- Colores válidos/null y payloads CSS rechazados.
- Fechas reales, bisiestos y timestamps con zona.
- Tipos incorrectos y caracteres de control.
- Límites exactos y límite + 1.
- ZIP `STORE` y `DEFLATE`.
- ZIP64, multidisk, cifrado, rutas inseguras, duplicados y método desconocido.
- Tamaño central falsificado y aborto por salida real.
- Manifest con conteos o booleans inválidos.
- Cantidad máxima de entidades y campos.
- Jerarquía de tres niveles, ciclos y padre local que ya es sección.

### Integración y regresión

- Exportador actual -> parser -> preview -> plan -> transacción.
- Fixture histórica `DEFLATE`.
- Backup Android real.
- Conflictos, renombrado y reparaciones existentes.
- Rechazo antes de cualquier escritura.
- Rollback transaccional.
- Feed normal y virtualizado.
- Drawer activo, archivadas, pickers y eventos académicos.
- Papelera después de eliminar una entidad importada.
- Ausencia de nodos, atributos y declaraciones CSS adicionales.
- Markdown legítimo y payloads de saneamiento actuales.
- Heatmap resistente a timestamps ya persistidos inválidos.

La fase final debe ejecutar `npm run verify` y validación manual Android.

---

## 14. Fases de implementación propuestas

### Fase 1 — frontera y límites

- Checkpoint de diseño de `BackupZipPreflight.ts` y decisión explícita de proceder o simplificar.
- Validadores de primitivas.
- Política central.
- Preflight ZIP.
- Extracción secuencial acotada.
- Regresiones del parser.

Commit propuesto:

```text
fix(backup): validate and bound imported archives
```

No se inicia el código de esta fase hasta aprobar el checkpoint de preflight. Después, cualquier
cambio en límites, compatibilidad o contrato observable de rechazo debe presentarse para revisión
antes de continuar.

### Fase 2 — integridad estructural

- Profundidad máxima de materias/secciones.
- Ciclos y padres inválidos.
- Preview de reparaciones.

Commit propuesto:

```text
fix(backup): enforce imported subject hierarchy
```

### Fase 3 — defensa en presentación

- Escape contextual.
- Allowlist de colores en todos los sinks.
- Selectores seguros.
- Resistencia ante registros contaminados previamente.

Commit propuesto:

```text
fix(ui): harden imported data render contexts
```

### Fase 4 — cierre

- Tests específicos y `npm run verify`.
- Revisión de diff y commits.
- Push de `fix/backup-import-security`.
- PR limpio y documentado.
- Sin merge a `main`.

---

## 15. Recomendación

Mantener por ahora **una única rama de AUD-003** y tratar el objetivo de un solo PR como
provisional. La decisión se confirma después del checkpoint de preflight y de estimar el diff real.

Separar frontera y renderizadores en PRs independientes dejaría una ventana incompleta:

- solo frontera no neutraliza registros contaminados ya persistidos;
- solo presentación no limita ZIP bombs ni estructuras inválidas.

Si el lector ZIP32 o la defensa de presentación no pueden revisarse de forma independiente, se
deben usar PRs apilados o secuenciales con trazabilidad común. Ningún PR parcial se considera cierre
de AUD-003 ni se fusiona sin evaluar la cobertura completa de frontera y sinks.

El alcance debe mantenerse sin dependencias nuevas, sin cambios estéticos y sin incorporar
AUD-004. Cualquier modificación a límites, compatibilidad o comportamiento observable debe
presentarse antes de ampliar la implementación.
