# Modelo Físico — DDL SQL y Reglas de Negocio

**Motor:** SQLite (vía `@capacitor-community/sqlite`)  
**Implementación:** [`src/services/sqlite/connection.js`](../../../src/services/sqlite/connection.js)  
**Última revisión:** 2026-07-15 (`0.4.8`)

---

## 1. Esquema efectivo consolidado

El siguiente DDL representa el **resultado efectivo** después de crear una instalación y ejecutar las migraciones idempotentes. `connection.js` conserva algunas columnas históricas como migraciones separadas, por lo que este bloque es una vista consolidada para análisis y no una copia literal de una única cadena SQL. El orden es importante: `subjects` se crea antes que `notes` y `academic_events` porque ambas tablas la referencian.

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

-- Fechas académicas puntuales (recordatorios visuales pasivos, DP-007)
CREATE TABLE IF NOT EXISTS academic_events (
    id        TEXT    PRIMARY KEY,
    type      TEXT    NOT NULL CHECK(type IN ('parcial', 'final', 'tp', 'exposicion')),
    title     TEXT,
    date      TEXT    NOT NULL,
    subjectId TEXT    REFERENCES subjects(id) ON DELETE SET NULL,
    createdAt TEXT    NOT NULL,
    updatedAt TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_academic_events_date
    ON academic_events(date);

CREATE INDEX IF NOT EXISTS idx_academic_events_subject
    ON academic_events(subjectId);

-- Metadatos del sistema (control de migraciones y flags)
CREATE TABLE IF NOT EXISTS metadata (
    key   TEXT PRIMARY KEY,
    value TEXT
);
```

---

## 2. Migraciones (instalaciones existentes — idempotentes)

Para usuarios que ya tienen la app instalada con el schema anterior (sin `subjectId`, sin `parentSubjectId`, etc.), las siguientes sentencias `ALTER TABLE` se ejecutan en cada arranque. La función `runMigrations()` en `connection.js` las envuelve en un `try/catch` que ignora el error `duplicate column name` si la columna ya existe.

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

-- Migración v1.4: fechas académicas discretas (DP-007, RF-027)
CREATE TABLE IF NOT EXISTS academic_events (
    id        TEXT    PRIMARY KEY,
    type      TEXT    NOT NULL CHECK(type IN ('parcial', 'final', 'tp', 'exposicion')),
    title     TEXT,
    date      TEXT    NOT NULL,
    subjectId TEXT    REFERENCES subjects(id) ON DELETE SET NULL,
    createdAt TEXT    NOT NULL,
    updatedAt TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_academic_events_date
    ON academic_events(date);

CREATE INDEX IF NOT EXISTS idx_academic_events_subject
    ON academic_events(subjectId);
```

---

## 3. Reglas de Negocio (validadas en código)

Las siguientes restricciones no quedan resueltas únicamente por el DDL y se validan o coordinan en `SubjectService.crud.ts`, `SubjectService.validation.ts`, `SubjectService.trash.ts` y los módulos SQLite:

1. **Profundidad máxima de 2 niveles:** Al crear una Sección (`parentSubjectId NOT NULL`), verificar que el padre no sea ya una Sección (es decir, que `parent.parentSubjectId IS NULL`). Si el padre ya tiene padre, rechazar la operación con un error descriptivo.

2. **Archivar materia y secciones:** Al archivar una Materia, `SubjectService.crud.ts` marca `subjects.archived = 1` tanto en la materia como en sus secciones hijas, dentro de una transacción. Las notas conservan su propio valor `notes.archived`; el filtro de estado las incluye en Archivo mientras su `subjectId` pertenezca a una materia o sección archivada. La restauración invierte la cascada sobre materia y secciones, sin reescribir las notas.

3. **Notas en Entrada por defecto:** Toda nota nueva se crea con `subjectId = NULL`. El usuario debe mover explícitamente la nota a una Materia o Sección.

4. **ON DELETE — comportamiento ante eliminación física:** Estas acciones se ejecutan con `DELETE`; enviar una materia a Papelera solo asigna `deletedAt` y conserva las claves foráneas hasta la purga definitiva.
   - `subjects.parentSubjectId → ON DELETE CASCADE`: Si se elimina una Materia, todas sus Secciones hijas se eliminan automáticamente.
   - `notes.subjectId → ON DELETE SET NULL`: Si se elimina una Materia o Sección, las notas asociadas no se eliminan, sino que vuelven a **Entrada** (`subjectId = NULL`).
   - `academic_events.subjectId → ON DELETE SET NULL`: Si se elimina una Materia o Sección, las fechas académicas asociadas sobreviven como eventos sin materia (`subjectId = NULL`).

5. **Eliminación lógica (soft-delete) con cascada (RF-026):** Al eliminar una materia, la capa de servicio (`SubjectService`) marca `deletedAt` en la materia, sus secciones hijas y las notas asociadas. La restauración también aplica en cascada. El vaciado de la papelera ejecuta `DELETE` físico sobre todos los registros con `deletedAt IS NOT NULL`. Todas las queries del feed activo filtran con `WHERE deletedAt IS NULL`.

6. **Fechas académicas sin soft-delete (RF-027):** Los eventos de `academic_events` se eliminan físicamente cuando el usuario borra una fecha. No participan de la papelera porque son registros puntuales y livianos; los eventos pasados permanecen visibles en el calendario histórico mientras no se borren.

---

## 4. Decisión Técnica: Ausencia de ON UPDATE

Las cláusulas de integridad referencial en SQL admiten dos eventos: `ON DELETE` y `ON UPDATE`. En el DDL de Lumapse se define explícitamente `ON DELETE` pero **se omite deliberadamente `ON UPDATE`**.

### ¿Por qué no se usa ON UPDATE?

`ON UPDATE CASCADE` solo resulta pertinente cuando la **clave primaria referenciada** es mutable y el modelo permite cambiarla durante el ciclo de vida del registro. En Lumapse, las claves referenciadas por FKs son **UUID v4** generados en el cliente. Son identificadores surrogate opacos e **inmutables por diseño**: una vez asignados no se corrigen, reciclan ni renumeran.

### Comparación con otros tipos de clave primaria

| Tipo de PK | ¿Puede cambiar? | ¿Requiere ON UPDATE? | Ejemplo |
|---|---|---|---|
| Surrogate entera auto-incremental (`1, 2, 3...`) | **No** | **No** | El ID asignado permanece estable; los huecos no se compactan ni reindexan |
| Clave natural mutable (`legajo`, código corregible) | Puede cambiar si el dominio lo permite | **Sí, si existen FKs y se admite actualizarla** | Corrección controlada del valor de negocio |
| **Surrogate UUID v4** (nuestro caso) | **No** | **No** | `"a1b2c3d4-..."` nunca se modifica |

### Conclusión

La ausencia de `ON UPDATE` en las sentencias DDL **no es una omisión**, sino una decisión técnica consciente derivada de usar claves surrogate inmutables. Migrar de UUID a una surrogate entera no cambiaría ese principio. `ON UPDATE CASCADE` solo debería evaluarse si una relación futura referencia una clave natural mutable y el dominio autoriza modificarla.

---

*Documento vivo · Lumapse · PP3 · IES 6023 · 2026*
