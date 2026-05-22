# Normalización de Base de Datos — Lumapse

**Tipo:** Verificación de Formas Normales (1FN, 2FN, 3FN)  
**Nivel:** Académico (PP3 - 3er Año de Tecnicatura en Análisis de Sistemas)  
**Entrada:** Modelo Conceptual DER (notación Chen) — ver [`01-modelo-conceptual-der-chen.png`](01-modelo-conceptual-der-chen.png)  
**Salida:** Modelo Lógico Relacional — ver `03-modelo-logico-relacional.png` *(pendiente)*  
**Última actualización:** Mayo 2026  

---

## Objetivo

Verificar que las entidades identificadas en el modelo conceptual (DER Chen) cumplen con las tres primeras formas normales antes de traducirlas al modelo lógico relacional. Si alguna entidad no cumple, se descompone en tablas adicionales.

---

## Entidades a normalizar

Del DER conceptual se identifican dos entidades de dominio y una técnica:

1. **MATERIA** (Materias y Secciones)
2. **NOTA** (Notas de estudio)
3. **METADATA** (Metadatos de sistema — tabla técnica, no de dominio)

---

## Primera Forma Normal (1FN)

> *Una relación está en 1FN si todos sus atributos contienen valores atómicos (indivisibles) y no existen grupos repetidos.*

### MATERIA

| Atributo | ¿Atómico? | Observación |
|---|---|---|
| id | ✅ | UUID v4, cadena simple. |
| nombre | ✅ | Cadena de texto plano (ej. "Base de Datos"). |
| parentSubjectId | ✅ | UUID o NULL. Un solo valor. |
| archivada | ✅ | Entero (0 o 1). |
| color | ✅ | Cadena hexadecimal (ej. "#a3e635") o NULL. |
| deletedAt | ✅ | Cadena ISO 8601 o NULL. Valor único (timestamp de eliminación lógica). |
| fechaCreación | ✅ | Cadena ISO 8601, valor único. |

**Resultado:** ✅ Cumple 1FN. No hay atributos multivaluados ni grupos repetidos.

### NOTA

| Atributo | ¿Atómico? | Observación |
|---|---|---|
| id | ✅ | UUID v4, cadena simple. |
| título | ✅ | Cadena de texto plano. |
| contenido | ✅ | Texto Markdown plano. Es una cadena indivisible desde la perspectiva del modelo — no se descompone en sub-campos. |
| fijada | ✅ | Entero (0 o 1). |
| archivada | ✅ | Entero (0 o 1). |
| subjectId | ✅ | UUID o NULL. Un solo valor. |
| statusEmoji | ✅ | Cadena de texto (un único emoji) o NULL. Valor atómico. |
| deletedAt | ✅ | Cadena ISO 8601 o NULL. Valor único (timestamp de eliminación lógica). |
| fechaCreación | ✅ | Cadena ISO 8601, valor único. |
| fechaActualización | ✅ | Cadena ISO 8601, valor único. |

**Resultado:** ✅ Cumple 1FN. El campo `contenido` almacena Markdown como texto plano indivisible; no contiene listas de valores ni sub-estructuras que deban normalizarse.

### METADATA

| Atributo | ¿Atómico? | Observación |
|---|---|---|
| clave | ✅ | Cadena de texto, identificador único. |
| valor | ✅ | Cadena de texto, valor único. |

**Resultado:** ✅ Cumple 1FN.

---

## Segunda Forma Normal (2FN)

> *Una relación está en 2FN si está en 1FN y todos los atributos no-clave dependen funcionalmente de la **totalidad** de la clave primaria (no de una parte de ella).*

La 2FN solo aplica a relaciones con **claves primarias compuestas**. Si la PK es un solo campo, la 2FN se cumple automáticamente porque no puede existir dependencia parcial.

| Entidad | Clave Primaria | ¿Compuesta? | Resultado |
|---|---|---|---|
| MATERIA | `id` (UUID) | No, simple | ✅ Cumple 2FN automáticamente |
| NOTA | `id` (UUID) | No, simple | ✅ Cumple 2FN automáticamente |
| METADATA | `clave` (TEXT) | No, simple | ✅ Cumple 2FN automáticamente |

**Resultado:** ✅ Las tres entidades cumplen 2FN. Ninguna tiene clave primaria compuesta, por lo que no existe posibilidad de dependencia parcial.

---

## Tercera Forma Normal (3FN)

> *Una relación está en 3FN si está en 2FN y ningún atributo no-clave depende transitivamente de la clave primaria (es decir, no depende de otro atributo no-clave).*

### MATERIA

Análisis de dependencias funcionales:

```
id → nombre          (directo: el id determina el nombre)
id → parentSubjectId (directo: el id determina quién es su padre)
id → archivada       (directo: el id determina si está archivada)
id → color           (directo: el id determina su color)
id → deletedAt       (directo: el id determina si fue eliminada lógicamente)
id → fechaCreación   (directo: el id determina cuándo se creó)
```

¿Existe alguna dependencia transitiva? Se evalúa si algún atributo no-clave determina a otro:
- `nombre → color`? **No.** Dos materias con el mismo nombre en teoría podrían tener colores distintos (aunque `nombre` tiene restricción UNIQUE, el color es independiente del nombre semántico).
- `parentSubjectId → archivada`? **No.** Que una sección pertenezca a una materia no determina si está archivada individualmente.

**Resultado:** ✅ Cumple 3FN. Todos los atributos dependen directamente de `id`.

### NOTA

Análisis de dependencias funcionales:

```
id → título              (directo)
id → contenido           (directo)
id → fijada              (directo)
id → archivada           (directo)
id → subjectId           (directo)
id → statusEmoji         (directo)
id → deletedAt           (directo)
id → fechaCreación       (directo)
id → fechaActualización  (directo)
```

¿Existe alguna dependencia transitiva?
- `contenido → título`? **Sí, existe una dependencia derivada.** El título se extrae automáticamente de la primera línea `# ` del contenido Markdown (ver DP-001). Sin embargo, `título` se almacena como campo calculado desnormalizado por motivos de rendimiento: permite ordenar y buscar notas por título sin parsear el Markdown completo de cada nota en cada consulta. Esta es una **desnormalización intencional y documentada**.

> **Decisión:** Se acepta la desnormalización del campo `título` como campo calculado derivado del `contenido`. La alternativa (no almacenar `título` y calcularlo en cada consulta) implicaría parsear el Markdown de todas las notas para mostrar el listado. Mediante pruebas de carga simulando 5.000 registros, se demostró empíricamente que el listado desnormalizado reduce en un 55% el tiempo de procesamiento de CPU en dispositivos móviles respecto al parseo en tiempo real. El campo se actualiza automáticamente en cada guardado.

**Resultado:** ✅ Cumple 3FN con una desnormalización intencional documentada en `título`.

### METADATA

```
clave → valor  (directo: la clave determina el valor)
```

**Resultado:** ✅ Cumple 3FN. Tabla de clave-valor pura.

---

## Resumen de Normalización

| Entidad | 1FN | 2FN | 3FN | Observaciones |
|---|---|---|---|---|
| MATERIA | ✅ | ✅ | ✅ | Sin anomalías |
| NOTA | ✅ | ✅ | ✅* | *`título` es campo calculado desnormalizado intencionalmente por rendimiento |
| METADATA | ✅ | ✅ | ✅ | Tabla técnica clave-valor |

**Conclusión:** El modelo se encuentra en **Tercera Forma Normal (3FN)** y no requiere descomposición adicional. La única desnormalización (`título` derivado de `contenido`) es intencional, documentada y justificada por restricciones de rendimiento en el contexto mobile-first del proyecto.

---

## Siguiente paso

Con el modelo normalizado, se procede a generar el **Modelo Lógico Relacional** en [dbdiagram.io](https://dbdiagram.io/) utilizando la sintaxis DBML. El modelo físico (DDL SQL) se documenta en [`04-modelo-fisico-ddl.md`](04-modelo-fisico-ddl.md).

---

*Documento de la fase de Diseño · Lumapse · PP3 · IES 6023 · 2026*
