# Diagramas de Base de Datos — Lumapse

Carpeta dedicada a los diagramas del diseño de base de datos del proyecto, siguiendo la metodología académica de tres niveles de abstracción.

**Autor:** José David Sandoval  
**Motor de BD:** SQLite (vía `@capacitor-community/sqlite`)  
**Última actualización:** Mayo 2026

---

## Contenido

| # | Archivo | Nivel | Herramienta | Descripción |
|---|---|---|---|---|
| 01 | `01-modelo-conceptual-der-chen.png` | Conceptual | Graphviz (DOT) | DER con notación Chen: entidades, relaciones y atributos |
| 01 | `01-modelo-conceptual-der-chen.dot` | Conceptual | Código fuente | Código DOT para regenerar el diagrama en [edotor.net](https://edotor.net) |
| 02 | `02-normalizacion.md` | Lógico | Documentación | Verificación de 1FN, 2FN y 3FN sobre las entidades del modelo |
| 03 | `03-modelo-logico-relacional.png` | Lógico | dbdiagram.io (DBML) | Esquema de tablas con PKs, FKs, tipos y restricciones |
| 03 | `03-modelo-logico-relacional.dbml` | Lógico | Código fuente | Código DBML para regenerar el diagrama en [dbdiagram.io](https://dbdiagram.io) |
| 04 | `04-modelo-fisico-ddl.md` | Físico | Documentación | Sentencias DDL SQL, migraciones idempotentes y reglas de negocio |

> **Nota:** La tabla `metadata` aparece sin relaciones en el modelo lógico (03) porque es una tabla técnica de sistema (clave-valor) utilizada para control de migraciones y flags internos. No pertenece al dominio del negocio (no representa una entidad del mundo real del estudiante), pero se incluye por completitud del esquema físico.

## Flujo metodológico

```
Modelo Conceptual (DER Chen — Graphviz DOT → edotor.net)
        ↓
Normalización (1FN → 2FN → 3FN)
        ↓
Modelo Lógico (Tablas relacionales — DBML → dbdiagram.io)
        ↓
Modelo Físico (DDL SQL — en connection.js)
```

El modelo físico (sentencias `CREATE TABLE` y `ALTER TABLE`) se encuentra implementado en [`src/services/sqlite/connection.js`](../../../src/services/sqlite/connection.js) y documentado en [`04-modelo-fisico-ddl.md`](04-modelo-fisico-ddl.md).

---

## Código fuente de los diagramas

### 01 — DER Chen (Graphviz DOT)

El código fuente para regenerar el diagrama se encuentra en [`01-modelo-conceptual-der-chen.dot`](01-modelo-conceptual-der-chen.dot).

Renderizar en: [edotor.net](https://edotor.net)

### 03 — Modelo Lógico (dbdiagram.io DBML)

El código fuente para regenerar el diagrama se encuentra en [`03-modelo-logico-relacional.dbml`](03-modelo-logico-relacional.dbml).

Renderizar en: [dbdiagram.io](https://dbdiagram.io)
