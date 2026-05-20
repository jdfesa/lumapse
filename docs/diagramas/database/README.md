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
| 03 | `03-modelo-logico-relacional.png` | Lógico | dbdiagram.io (DBML) | Esquema de tablas con PKs, FKs, tipos y restricciones — *pendiente* |

## Flujo metodológico

```
Modelo Conceptual (DER Chen)
        ↓
Normalización (1FN → 2FN → 3FN)
        ↓
Modelo Lógico (Tablas relacionales)
        ↓
Modelo Físico (DDL SQL — en SqliteService.js)
```

El modelo físico (sentencias `CREATE TABLE` y `ALTER TABLE`) se encuentra implementado directamente en [`src/services/SqliteService.js`](../../../src/services/SqliteService.js) y documentado en [`modelo-relacional.md`](../modelo-relacional.md).

---

## Código fuente de los diagramas

### 01 — DER Chen (Graphviz DOT)

El código fuente para regenerar el diagrama se encuentra en el archivo [`modelo-relacional.md`](../modelo-relacional.md), sección 3.

Renderizar en: [graphviz.online](https://dreampuf.github.io/GraphvizOnline/) o [edotor.net](https://edotor.net/)

### 03 — Modelo Lógico (dbdiagram.io DBML)

El código DBML se encuentra en el archivo [`modelo-relacional.md`](../modelo-relacional.md), pendiente de generación.

Renderizar en: [dbdiagram.io](https://dbdiagram.io/)
