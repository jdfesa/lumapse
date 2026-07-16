# Normalización de Base de Datos — Lumapse

- **Tipo:** Verificación de formas normales (1FN, 2FN y 3FN)
- **Nivel:** Académico — PP3, Tecnicatura en Análisis de Sistemas y Desarrollo de Software
- **Entrada vigente:** esquema SQLite y modelo lógico DBML
- **Salida gráfica:** fuente lógica e imagen exportada, verificadas e incorporadas el 2026-07-15
- **Última revisión:** 2026-07-15 (`0.4.8`)

## Objetivo y alcance

Verificar que las relaciones persistidas por Lumapse cumplen las tres primeras formas normales. El análisis usa el esquema ejecutable de [`connection.js`](../../../src/services/sqlite/connection.js) y el modelo [`03-modelo-logico-relacional.dbml`](./03-modelo-logico-relacional.dbml). El DER conceptual, el DBML y sus exportaciones visuales ya incorporan este alcance; la revisión final pendiente es exclusivamente de legibilidad dentro de la maquetación de entrega.

El esquema contiene tres entidades del dominio y una tabla técnica:

1. `subjects` — materias y secciones;
2. `notes` — notas de estudio;
3. `academic_events` — fechas académicas discretas;
4. `metadata` — propiedades internas de migración y sistema.

## Primera Forma Normal (1FN)

Una relación cumple 1FN cuando cada celda contiene un valor atómico y no existen grupos repetidos.

### `subjects`

| Atributo | Dominio | Evaluación |
|---|---|---|
| `id` | UUID almacenado como `TEXT` | Valor único y atómico; clave primaria. |
| `name` | `TEXT` | Nombre simple de una materia o sección. |
| `parentSubjectId` | UUID o `NULL` | Una única referencia al padre. |
| `archived` | `INTEGER` (`0`/`1`) | Indicador booleano atómico. |
| `color` | `TEXT` o `NULL` | Un único valor de color. |
| `deletedAt` | fecha-hora ISO o `NULL` | Una única marca de borrado lógico. |
| `createdAt` | fecha-hora ISO | Una única marca temporal. |

### `notes`

| Atributo | Dominio | Evaluación |
|---|---|---|
| `id` | UUID almacenado como `TEXT` | Valor único y atómico; clave primaria. |
| `title` | `TEXT` o `NULL` | Un único título resuelto al guardar. |
| `content` | `TEXT` o `NULL` | Markdown almacenado como texto; para el modelo relacional es un valor escalar. |
| `pinned` / `archived` | `INTEGER` (`0`/`1`) | Indicadores booleanos independientes. |
| `subjectId` | UUID o `NULL` | Una única referencia a materia/sección; `NULL` representa Entrada. |
| `statusEmoji` | `TEXT` o `NULL` | Un único marcador académico. |
| `deletedAt` | fecha-hora ISO o `NULL` | Una única marca de borrado lógico. |
| `createdAt` / `updatedAt` | fecha-hora ISO | Marcas temporales individuales. |

### `academic_events`

| Atributo | Dominio | Evaluación |
|---|---|---|
| `id` | UUID almacenado como `TEXT` | Valor único y atómico; clave primaria. |
| `type` | `parcial`, `final`, `tp` o `exposicion` | Un valor del conjunto permitido. |
| `title` | `TEXT` o `NULL` | Una descripción breve opcional. |
| `date` | fecha `YYYY-MM-DD` | Una única fecha local. |
| `subjectId` | UUID o `NULL` | Una única materia/sección opcional. |
| `createdAt` / `updatedAt` | fecha-hora ISO | Marcas temporales individuales. |

### `metadata`

| Atributo | Dominio | Evaluación |
|---|---|---|
| `key` | `TEXT` | Clave primaria atómica. |
| `value` | `TEXT` o `NULL` | Un valor asociado por clave. |

**Resultado de 1FN:** las cuatro relaciones cumplen 1FN. No existen arrays, columnas repetidas ni listas persistidas en una misma celda.

## Segunda Forma Normal (2FN)

Una relación cumple 2FN cuando está en 1FN y ningún atributo no clave depende solo de una parte de una clave primaria compuesta.

| Relación | Clave primaria | ¿Compuesta? | Resultado |
|---|---|---|---|
| `subjects` | `id` | No | Cumple 2FN automáticamente. |
| `notes` | `id` | No | Cumple 2FN automáticamente. |
| `academic_events` | `id` | No | Cumple 2FN automáticamente. |
| `metadata` | `key` | No | Cumple 2FN automáticamente. |

No hay claves primarias compuestas, por lo que no puede existir una dependencia parcial.

## Tercera Forma Normal (3FN)

Una relación cumple 3FN cuando está en 2FN y sus atributos no clave no dependen transitivamente de otros atributos no clave.

### Dependencias funcionales principales

```text
subjects.id
  → name, parentSubjectId, archived, color, deletedAt, createdAt

notes.id
  → title, content, pinned, archived, subjectId, statusEmoji,
    deletedAt, createdAt, updatedAt

academic_events.id
  → type, title, date, subjectId, createdAt, updatedAt

metadata.key
  → value
```

- En `subjects`, `parentSubjectId` identifica al padre, pero no determina el nombre, color o estado del registro hijo.
- En `notes`, `subjectId` no determina título, contenido ni marcadores: distintas notas de la misma materia conservan valores independientes.
- El título de una nota puede ser explícito. Solo cuando está vacío, el servicio intenta resolverlo desde un encabezado Markdown o usa `Sin título`; por tanto, `content → title` no es una dependencia funcional general del esquema.
- En `academic_events`, la materia asociada no determina tipo, fecha ni descripción del evento.
- `metadata` es una relación clave-valor sin atributos intermedios.

**Resultado de 3FN:** las cuatro relaciones cumplen 3FN para las dependencias modeladas. `scripts/run-load-tests.py` contiene un ensayo sintético sobre resolución de títulos, pero no mide normalización ni rendimiento del schema; por eso no se atribuye a 3FN una cifra de mejora que el repositorio no demuestra.

## Integridad referencial y reglas fuera de la normalización

La normalización no sustituye otras restricciones:

- `subjects.parentSubjectId → subjects.id` modela la jerarquía autorreferenciada;
- `notes.subjectId → subjects.id` vincula una nota con una materia o sección;
- `academic_events.subjectId → subjects.id` vincula opcionalmente una fecha académica;
- la profundidad máxima de dos niveles y la unicidad de nombres por nivel se validan en la capa de servicio;
- el borrado lógico se representa con `deletedAt` y se coordina transaccionalmente desde los servicios.

## Resumen

| Relación | 1FN | 2FN | 3FN | Observación |
|---|---|---|---|---|
| `subjects` | Sí | Sí | Sí | Jerarquía mediante FK autorreferenciada. |
| `notes` | Sí | Sí | Sí | Título explícito o resuelto por la aplicación al guardar. |
| `academic_events` | Sí | Sí | Sí | Evento puntual con materia opcional. |
| `metadata` | Sí | Sí | Sí | Tabla técnica, no entidad de negocio. |

Los modelos conceptual y lógico sincronizados fueron exportados y revisados visualmente el 2026-07-15, según el procedimiento de [`README.md`](./README.md). La salida panorámica del modelo conceptual deberá comprobarse al tamaño definitivo del PDF y las diapositivas.
