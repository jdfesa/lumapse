# Modelo físico — DDL SQLite, migraciones y reglas de aplicación

- **Corte de referencia:** `0.6.0/600 — Release Candidate 1`, fuente `bcefe6a`.
- **Motor:** SQLite mediante `@capacitor-community/sqlite` en Android.
- **Esquema y migraciones:** [`src/services/sqlite/connection.js`](../../../src/services/sqlite/connection.js).
- **Revisión documental:** 2026-11-21; contraste de fuentes, sin nuevas pruebas del APK.

## 1. Esquema efectivo consolidado

El DDL siguiente representa las cuatro tablas y sus 26 columnas **después de la
inicialización y las migraciones**. Es una transcripción consolidada para análisis,
no la cadena literal que ejecuta la app ni un instalador o script de actualización.
El código crea primero las tablas base y después agrega las columnas ausentes.
El orden de columnas de esta presentación agrupa atributos relacionados; el orden
físico puede diferir según el historial de creación y migración.

Se conserva `subjects` antes de las tablas que la referencian. La transcripción no
agrega restricciones, valores por defecto ni índices al esquema congelado.

```sql
-- Materias y secciones; la profundidad se valida en el servicio.
CREATE TABLE IF NOT EXISTS subjects (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    parentSubjectId TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    archived        INTEGER DEFAULT 0,
    color           TEXT,
    deletedAt       TEXT,
    createdAt       TEXT NOT NULL
);

-- Notas; subjectId nulo representa Entrada.
CREATE TABLE IF NOT EXISTS notes (
    id          TEXT PRIMARY KEY,
    title       TEXT,
    content     TEXT,
    pinned      INTEGER DEFAULT 0,
    archived    INTEGER DEFAULT 0,
    subjectId   TEXT REFERENCES subjects(id) ON DELETE SET NULL,
    statusEmoji TEXT,
    deletedAt   TEXT,
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT NOT NULL
);

-- Fechas académicas puntuales, sin papelera.
CREATE TABLE IF NOT EXISTS academic_events (
    id        TEXT PRIMARY KEY,
    type      TEXT NOT NULL
        CHECK(type IN ('parcial', 'final', 'tp', 'exposicion')),
    title     TEXT,
    date      TEXT NOT NULL,
    subjectId TEXT REFERENCES subjects(id) ON DELETE SET NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_academic_events_date
    ON academic_events(date);

CREATE INDEX IF NOT EXISTS idx_academic_events_subject
    ON academic_events(subjectId);

-- Estado técnico, incluido el borrador del editor.
CREATE TABLE IF NOT EXISTS metadata (
    key   TEXT PRIMARY KEY,
    value TEXT
);
```

### 1.1. Restricciones e índices declarados

| Elemento | Declaración efectiva |
|---|---|
| Cuatro claves primarias | `subjects.id`, `notes.id`, `academic_events.id` y `metadata.key`, todas `TEXT PRIMARY KEY` |
| Tres claves foráneas opcionales | `subjects.parentSubjectId`, `notes.subjectId` y `academic_events.subjectId` referencian `subjects.id`; ninguna declara `NOT NULL` |
| Ocho `NOT NULL` explícitos | `subjects`: `name`, `createdAt`; `notes`: `createdAt`, `updatedAt`; `academic_events`: `type`, `date`, `createdAt`, `updatedAt` |
| Tres valores `DEFAULT 0` | `subjects.archived`, `notes.pinned` y `notes.archived` |
| Un `CHECK` | `academic_events.type` admite `parcial`, `final`, `tp` y `exposicion` |
| Dos índices explícitos no únicos | `idx_academic_events_date` sobre `date` e `idx_academic_events_subject` sobre `subjectId`, en `academic_events` |

Las tablas no declaran `STRICT` ni `WITHOUT ROWID`. En estas condiciones, las PK
textuales no implican `NOT NULL` en SQLite; los índices implícitos de las PK no se
cuentan entre los dos índices explícitos. `DEFAULT 0` no impone un dominio booleano.
Estas particularidades se fundamentan en la documentación de
[CREATE TABLE](https://sqlite.org/lang_createtable.html).

`TEXT` e `INTEGER` expresan afinidades, no un tipado estricto. No hay restricciones
SQL de formato UUID, fecha, color, emoji o JSON, ni un `CHECK` que limite los
indicadores a `0` y `1`. La fecha académica usa `YYYY-MM-DD`; las marcas temporales
generadas por los servicios usan `toISOString()`. Son convenciones de aplicación,
no garantías del tipo `TEXT`. Véase la documentación de
[tipos y afinidades de SQLite](https://sqlite.org/datatype3.html).

## 2. Inicialización y migraciones

`initialize()` abre la conexión y ejecuta el DDL base con `CREATE ... IF NOT EXISTS`.
Después llama a `runMigrations()`, también en una instalación nueva: el DDL base
todavía no incluye `notes.statusEmoji`, `notes.deletedAt` ni `subjects.deletedAt`.
En el entorno web auxiliar se solicita `saveToStore` después de cada una de esas
dos etapas; no es una operación de persistencia adicional en Android.

La lista de migraciones contiene siete `ALTER TABLE ... ADD COLUMN`, la creación
de `academic_events` y sus dos índices. Para cada `ALTER`, consulta
`PRAGMA table_info(tabla)`: si encuentra la columna, omite esa sentencia; si falta,
la ejecuta. Si la tabla no existe o falla una operación, propaga un error con el
nombre de migración y su causa, e impide completar la inicialización. **No ignora
errores `duplicate column name` ni otros fallos SQL por su mensaje** (ADR-009).

Las etiquetas `v1.1` a `v1.4` son rótulos históricos de grupos en el código, no
versiones publicadas de la app ni el argumento de versión `1` de
`createConnection`. La idempotencia resulta de comprobar columnas y de los
`CREATE ... IF NOT EXISTS`, no de un contador de migraciones en `metadata`.

### 2.1. Sentencias de compatibilidad

Este listado reproduce las sentencias y su orden. Los `ALTER` **no son idempotentes
por sí solos**: requieren la comprobación previa descrita. No se deben ejecutar
después del DDL consolidado como si ambos bloques fueran un único script.

```sql
-- v1.1: organización en materias y secciones.
ALTER TABLE notes ADD COLUMN subjectId TEXT
    REFERENCES subjects(id) ON DELETE SET NULL;
ALTER TABLE subjects ADD COLUMN parentSubjectId TEXT
    REFERENCES subjects(id) ON DELETE CASCADE;
ALTER TABLE subjects ADD COLUMN archived INTEGER DEFAULT 0;
ALTER TABLE subjects ADD COLUMN color TEXT;

-- v1.2: marcador académico de nota.
ALTER TABLE notes ADD COLUMN statusEmoji TEXT;

-- v1.3: papelera de notas y materias/secciones.
ALTER TABLE notes ADD COLUMN deletedAt TEXT;
ALTER TABLE subjects ADD COLUMN deletedAt TEXT;

-- v1.4: fechas académicas e índices.
CREATE TABLE IF NOT EXISTS academic_events (
    id        TEXT PRIMARY KEY,
    type      TEXT NOT NULL
        CHECK(type IN ('parcial', 'final', 'tp', 'exposicion')),
    title     TEXT,
    date      TEXT NOT NULL,
    subjectId TEXT REFERENCES subjects(id) ON DELETE SET NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_academic_events_date
    ON academic_events(date);

CREATE INDEX IF NOT EXISTS idx_academic_events_subject
    ON academic_events(subjectId);
```

Comprobar la existencia de una columna no verifica su definición completa.
`CREATE ... IF NOT EXISTS` tampoco concilia una tabla existente con otra definición.
Este mecanismo no repara esquemas arbitrariamente alterados ni presenta toda la
lista como una única transacción atómica.

### 2.2. Migraciones de datos y estado técnico

Son operaciones distintas de los cambios de estructura anteriores:

- **Notas históricas de IndexedDB:** `legacyMigration.js` consulta la propiedad
  `indexeddb_migrated`. Si no vale el texto `true`, lee el origen legado y confirma
  notas y marcador en una transacción. Utiliza `INSERT OR IGNORE` para no reemplazar
  una nota SQLite con la misma clave durante un reintento. Un error de lectura no
  se interpreta como una colección vacía.
- **Borrador del editor:** `EditorDraftService.ts` y `sqlite/editorDrafts.js`
  administran una única fila bajo `lumapse-editor-draft-v1`. `value` contiene JSON
  validado por el servicio, o el texto `null` como marcador de limpieza durable.
  No es un `NULL` SQL. Sólo la ausencia de la fila permite migrar el borrador de
  `localStorage`; la limpieza confirmada impide reimportarlo (ADR-012).

El JSON del borrador no agrega columnas ni FK: sus referencias internas se
interpretan en la aplicación. Al guardar desde el editor, nota y marcador vacío
se confirman en una misma transacción. El contrato y sus límites se desarrollan
en las secciones 4.5 y 4.7.4 del informe.

## 3. Integridad referencial y eliminación

Las acciones declaradas requieren el control de claves foráneas habilitado.
El código Android del plugin utilizado lo activa al abrir la base mediante
`setForeignKeyConstraintsEnabled(true)`; el DDL de la app no incluye un
`PRAGMA foreign_keys` propio. No debe inferirse su activación por la mera presencia
de `REFERENCES`. El requisito y las acciones por omisión se explican en
[SQLite foreign key support](https://sqlite.org/foreignkeys.html).

| Referencia a `subjects.id` | Acción ante borrado físico del destino |
|---|---|
| `subjects.parentSubjectId` | `ON DELETE CASCADE`: elimina los registros hijos |
| `notes.subjectId` | `ON DELETE SET NULL`: deja sin asociación las notas que aún existan |
| `academic_events.subjectId` | `ON DELETE SET NULL`: deja sin asociación los eventos |

Asignar `deletedAt` no ejecuta estas acciones. `SubjectService.trash.ts` coordina
el borrado lógico de la materia o sección y sus notas. El vaciado de papelera
elimina primero las notas marcadas y luego las materias/secciones marcadas, dentro
de una transacción. Por tanto, `SET NULL` **no garantiza que sobrevivan las notas
que la propia purga elimina**. Los eventos no tienen `deletedAt`: no se marcan por
esa cascada lógica y su eliminación individual es física.

No se declara `ON UPDATE`; la acción efectiva es `NO ACTION`, no una cascada.
Los CRUD conservan los UUID de las entidades al editarlas. Esa estabilidad es un
contrato de aplicación, no una restricción SQL que prohíba cualquier cambio de PK.
`metadata.key` es una clave técnica textual, no un UUID ni un destino de las FK.

## 4. Reglas que corresponden a la aplicación

| Regla | Responsabilidad y límite |
|---|---|
| Dos niveles de organización | `SubjectService.validation.ts` comprueba que el padre propuesto exista y sea raíz; la FK no limita profundidad ni impide por sí sola un ciclo |
| Nombres de materias/secciones | El servicio exige nombre no vacío y compara nombres recortados y en minúsculas dentro del mismo padre, entre registros no eliminados e incluidos los archivados; no hay `UNIQUE` SQL de nombre por nivel |
| Ubicación inicial de notas | `NoteStore.data.js` acepta materia explícita; si no se indica, usa el contexto de materia o `NULL`. El selector del editor permite asociar al guardar; no exige pasar primero por Entrada |
| Archivo | El servicio actualiza materia y secciones en una transacción; no reescribe `notes.archived`. `noteFilters.ts` considera tanto la marca propia de nota como la organización archivada |
| Papelera y restauración | El servicio coordina las cascadas lógicas; `getAllNotes()` excluye `deletedAt IS NOT NULL`. Restaurar contenedores resuelve nombres repetidos; restaurar una nota suelta la envía a Entrada si su materia falta o sigue eliminada |
| Fecha académica | `AcademicEventService.ts` valida tipo, fecha real en formato `YYYY-MM-DD`, título breve y materia existente no eliminada. El DDL sólo restringe tipo y presencia de fecha, no su validez calendárica |

Los índices de eventos describen la estructura disponible para las consultas;
no acreditan tiempos medidos ni que el planificador utilice siempre un índice.
La persistencia transaccional y los límites ante resultados inciertos corresponden
a ADR-009 y ADR-012, no se deducen sólo del DDL.

## 5. Alcance del contraste documental

El contraste con la fuente de 0.6.0 RC1 cubre tablas, columnas, tipos declarados, PK, FK,
`NOT NULL`, `DEFAULT`, `CHECK`, índices explícitos, acciones referenciales y las
sentencias de migración. También distingue las reglas de los servicios y el uso
actual de `metadata`. No modifica el esquema ni genera nueva evidencia funcional.

Los controles `check:schema` y `check:dbml` complementan la revisión: el primero
compara tablas, columnas y tipos; el segundo verifica una proyección parcial del
modelo. Ninguno certifica todas las restricciones, las migraciones de una base
concreta o el plugin nativo. La validación existente y sus límites por artefacto
se conservan en el capítulo 6.
