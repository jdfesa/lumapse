# Modelo Físico — DDL SQL y Reglas de Negocio

**Motor:** SQLite (vía `@capacitor-community/sqlite`)  
**Implementación:** [`src/services/SqliteService.js`](../../../src/services/SqliteService.js)  
**Última actualización:** Mayo 2026  

---

## 1. Creación de tablas (nuevas instalaciones)

Las siguientes sentencias DDL se ejecutan en la inicialización de la base de datos. El orden es importante: `subjects` se crea antes que `notes` porque `notes.subjectId` tiene una clave foránea que referencia a `subjects(id)`.

```sql
-- Materias y Secciones (estructura jerárquica auto-referencial, máx. 2 niveles)
CREATE TABLE IF NOT EXISTS subjects (
    id               TEXT    PRIMARY KEY,
    name             TEXT    NOT NULL,
    parentSubjectId  TEXT    REFERENCES subjects(id) ON DELETE CASCADE,
    archived         INTEGER DEFAULT 0,
    color            TEXT,
    deletedAt        TEXT,
    createdAt        TEXT    NOT NULL
);

-- Notas (viven en Entrada, en una Materia, o en una Sección)
CREATE TABLE IF NOT EXISTS notes (
    id          TEXT    PRIMARY KEY,
    title       TEXT,
    content     TEXT,
    pinned      INTEGER DEFAULT 0,
    archived    INTEGER DEFAULT 0,
    subjectId   TEXT    REFERENCES subjects(id) ON DELETE SET NULL,
    statusEmoji TEXT,
    deletedAt   TEXT,
    createdAt   TEXT    NOT NULL,
    updatedAt   TEXT    NOT NULL
);

-- Metadatos del sistema (control de migraciones y flags)
CREATE TABLE IF NOT EXISTS metadata (
    key   TEXT PRIMARY KEY,
    value TEXT
);
```

---

## 2. Migraciones (instalaciones existentes — idempotentes)

Para usuarios que ya tienen la app instalada con el schema anterior (sin `subjectId`, sin `parentSubjectId`, etc.), las siguientes sentencias `ALTER TABLE` se ejecutan en cada arranque. La función `runMigrations()` en `SqliteService.js` las envuelve en un `try/catch` que ignora el error `duplicate column name` si la columna ya existe.

```sql
-- Migración v1.1: notas con referencia a materia/sección
ALTER TABLE notes ADD COLUMN subjectId TEXT REFERENCES subjects(id) ON DELETE SET NULL;

-- Migración v1.1: materias con soporte de sub-secciones, archivo y color
ALTER TABLE subjects ADD COLUMN parentSubjectId TEXT REFERENCES subjects(id) ON DELETE CASCADE;
ALTER TABLE subjects ADD COLUMN archived INTEGER DEFAULT 0;
ALTER TABLE subjects ADD COLUMN color TEXT;

-- Migración v1.2: emoji de estado académico (DP-005, RF-025)
ALTER TABLE notes ADD COLUMN statusEmoji TEXT;

-- Migración v1.3: papelera de reciclaje con soft-delete (RF-026)
ALTER TABLE notes ADD COLUMN deletedAt TEXT;
ALTER TABLE subjects ADD COLUMN deletedAt TEXT;
```

---

## 3. Reglas de Negocio (validadas en código)

Las siguientes restricciones **no pueden modelarse en SQL puro** y deben validarse en la capa de lógica de negocio (`SqliteService.js`):

1. **Profundidad máxima de 2 niveles:** Al crear una Sección (`parentSubjectId NOT NULL`), verificar que el padre no sea ya una Sección (es decir, que `parent.parentSubjectId IS NULL`). Si el padre ya tiene padre, rechazar la operación con un error descriptivo.

2. **Archivar en cascada (UI):** Al archivar una Materia, la UI debe mostrar todas sus Secciones y Notas como archivadas en la vista de Archivo, aunque a nivel de base de datos solo se marca `subjects.archived = 1` en la Materia.

3. **Notas en Entrada por defecto:** Toda nota nueva se crea con `subjectId = NULL`. El usuario debe mover explícitamente la nota a una Materia o Sección.

4. **ON DELETE — comportamiento referencial:**
   - `subjects.parentSubjectId → ON DELETE CASCADE`: Si se elimina una Materia, todas sus Secciones hijas se eliminan automáticamente.
   - `notes.subjectId → ON DELETE SET NULL`: Si se elimina una Materia o Sección, las notas asociadas no se eliminan, sino que vuelven a **Entrada** (`subjectId = NULL`).

5. **Eliminación lógica (soft-delete) con cascada (RF-026):** Al eliminar una materia, la capa de servicio (`SubjectService`) marca `deletedAt` en la materia, sus secciones hijas y las notas asociadas. La restauración también aplica en cascada. El vaciado de la papelera ejecuta `DELETE` físico sobre todos los registros con `deletedAt IS NOT NULL`. Todas las queries del feed activo filtran con `WHERE deletedAt IS NULL`.

---

## 4. Decisión Técnica: Ausencia de ON UPDATE

Las cláusulas de integridad referencial en SQL admiten dos eventos: `ON DELETE` y `ON UPDATE`. En el DDL de Lumapse se define explícitamente `ON DELETE` pero **se omite deliberadamente `ON UPDATE`**.

### ¿Por qué no se usa ON UPDATE?

`ON UPDATE CASCADE` es necesario cuando la **clave primaria referenciada** puede cambiar de valor en algún momento del ciclo de vida del registro. En Lumapse, todas las claves primarias son **UUID v4** generados en el cliente al momento de la creación. Un UUID es un identificador opaco, aleatorio e **inmutable por diseño**: una vez asignado, no existe ningún escenario de negocio ni de mantenimiento que requiera modificar su valor.

### Comparación con otros tipos de clave primaria

| Tipo de PK | ¿Puede cambiar? | ¿Requiere ON UPDATE? | Ejemplo |
|---|---|---|---|
| Auto-increment (`1, 2, 3...`) | Sí (reindexación) | Potencialmente | Compactar IDs tras eliminar registros |
| Clave natural (`DNI`, `legajo`) | Sí | **Sí** | Corrección de un número de legajo erróneo |
| **UUID v4** (nuestro caso) | **No** | **No** | `"a1b2c3d4-..."` nunca se modifica |

### Conclusión

La ausencia de `ON UPDATE` en las sentencias DDL **no es una omisión**, sino una decisión técnica consciente derivada de la elección de UUID v4 como tipo de clave primaria. Si en el futuro se migrara a claves naturales o secuenciales, sería necesario agregar `ON UPDATE CASCADE` a ambas relaciones FK.

---

*Documento vivo · Lumapse · PP3 · IES 6023 · 2026*
