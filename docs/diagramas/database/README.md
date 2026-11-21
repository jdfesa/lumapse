# Diagramas de Base de Datos — Lumapse

Esta carpeta documenta el diseño de datos en tres niveles de abstracción. Las **fuentes editables** se versionan y las **imágenes son artefactos derivados**. El conceptual utiliza notación Chen; el lógico conserva DBML y el físico corresponde al DDL y las migraciones de SQLite.

- **Autor:** José David Sandoval
- **Motor:** SQLite mediante `@capacitor-community/sqlite`
- **Versión de referencia del conceptual revisado:** `0.6.0/600 — RC1`, fuente `bcefe6a`
- **Revisión del conceptual:** 2026-11-21; no constituye una nueva prueba del APK

## Contenido y autoridad

| Archivo | Nivel | Rol | Estado al corte |
|---|---|---|---|
| [`01-modelo-conceptual.dot`](./01-modelo-conceptual.dot) | Conceptual | Fuente Graphviz, notación Chen | Contraste con dominio, SQLite y jerarquía de la RC1; detalle por roles |
| [`01-modelo-conceptual.svg`](./01-modelo-conceptual.svg) | Conceptual | Imagen vectorial derivada de DOT | Figura 4-3 del capítulo fuente; atributos seleccionados |
| [`02-normalizacion.md`](./02-normalizacion.md) | Lógico | Justificación de 1FN, 2FN y 3FN | Referencia textual |
| [`03-modelo-logico-relacional.dbml`](./03-modelo-logico-relacional.dbml) | Lógico | Fuente DBML | Sincronizada con el esquema ejecutable |
| [`03-modelo-logico-relacional.png`](./03-modelo-logico-relacional.png) | Lógico | Imagen derivada | Exportación del 2026-07-15 conservada |
| [`04-modelo-fisico-ddl.md`](./04-modelo-fisico-ddl.md) | Físico | Documentación del DDL y migraciones | Referencia técnica |
| [`src/services/sqlite/connection.js`](../../../src/services/sqlite/connection.js) | Físico ejecutable | Fuente de verdad del esquema | Autoridad final ante una divergencia |

La tabla `metadata` pertenece al esquema ejecutable, pero no al dominio académico. En la RC1 conserva propiedades internas y el borrador del editor; se incluye en los niveles lógico y físico, no en el conceptual.

## Modelo conceptual de la RC1

![Modelo conceptual de Lumapse en notación Chen con jerarquía desplegada por roles](./01-modelo-conceptual.svg)

**Figura DB-1.** Modelo conceptual en notación Chen con cardinalidades de participación `(mín, máx)`. El panel a representa tres tipos de entidad y sus asociaciones de contenido. El panel b despliega la relación de `Subject` para distinguir materia raíz y sección hija, sin un lazo que sugiera autocontención de una instancia. Es un detalle del mismo tipo de entidad, no dos entidades o tablas nuevas.

- Rectángulos: tipos de entidad o sus apariciones por rol, identificadas explícitamente.
- Rombos: relaciones; óvalos: atributos; identificadores propios subrayados.
- La cardinalidad junto a una entidad indica en cuántos vínculos de esa relación participa. No se interpreta con la convención de extremos de pata de cuervo.
- Una materia o sección puede agrupar cero o muchas notas y fechas: `(0,N)`. Cada nota o fecha admite cero o una materia o sección: `(0,1)`.
- En la jerarquía, una materia raíz no tiene padre y puede tener cero o muchas secciones: `(0,N)`. Cada sección tiene exactamente una materia padre: `(1,1)`. Los roles son excluyentes, la relación une registros distintos y no hay subsecciones.
- En el nivel lógico ambos roles se almacenan en `subjects`: raíz con `parentSubjectId = NULL`; sección con referencia a una raíz. Al crear una sección, el servicio comprueba que el padre exista y sea una materia raíz; la FK por sí sola no limita la profundidad ni distingue los roles.

### Atributos seleccionados y contraste

La figura muestra nueve atributos académicos seleccionados, no el inventario completo de columnas:

| Tipo de entidad | Atributos de la figura | Correspondencia en el dominio |
|---|---|---|
| `Subject` | identificador, nombre, color opcional | `id`, `name`, `color` |
| `Note` | identificador, título, contenido | `id`, `title`, `content` |
| `AcademicEvent` | identificador, tipo, fecha | `id`, `type`, `date` |

Los demás atributos y las referencias se detallan en el modelo lógico. El título de nota no implica una entrada manual obligatoria: se resuelve mediante el contrato de guardado explicado en 4.7.5. La selección no elimina propiedades de la app ni incorpora nuevas tablas.

Se contrastaron `src/domain/subjects.ts`, `notes.ts` y `academicEvents.ts`, el esquema y las migraciones de `src/services/sqlite/connection.js`, la profundidad en `SubjectService.validation.ts` y el título en `NoteTitleService.ts`. Esas fuentes no presentan diferencias respecto de `bcefe6a`; esta comparación documental no valida nuevamente el APK.

### Regenerar la figura actual

Con Graphviz instalado como herramienta documental externa a la app, desde la raíz del repositorio:

```bash
dot -Kneato -Tsvg docs/diagramas/database/01-modelo-conceptual.dot \
  -o docs/diagramas/database/01-modelo-conceptual.svg
```

Esta exportación utiliza Graphviz 16.1.2 y el motor Neato. La fuente fija posiciones para mantener una disposición vertical. No se agrega una dependencia ni un generador al proyecto de la app. La [documentación de Graphviz](https://graphviz.org/docs/) describe el lenguaje y la exportación; las [notas docentes de Virginia Tech sobre el modelo ER](https://courses.cs.vt.edu/cs4604/Spring21/pdfs/3-ermodel2.pdf) desarrollan el uso de roles en relaciones recursivas.

El SVG es monocromo, conserva texto vectorial y no necesita imágenes rasterizadas o etiquetas HTML incrustadas. La revisión de esta figura no sustituye la revisión del PDF A4: tipografía disponible, ancho útil, pie, márgenes de encuadernación y paginación. El ensamblado y LaTeX/PDF siguen fuera de esta unidad.

## Modelo lógico relacional

![Modelo lógico relacional de Lumapse](./03-modelo-logico-relacional.png)

**Figura DB-2.** Modelo lógico relacional de Lumapse, exportado desde [`03-modelo-logico-relacional.dbml`](./03-modelo-logico-relacional.dbml) mediante dbdiagram.io. Incluye las cuatro tablas del esquema (`subjects`, `notes`, `academic_events` y `metadata`), sus 26 columnas y las tres relaciones declaradas.

Los PNG son artefactos derivados: no se corrigen manualmente. Cualquier cambio futuro debe aplicarse primero a las fuentes y al esquema ejecutable, ejecutar los verificadores y luego producir una nueva exportación.

## Flujo metodológico

```text
Modelo conceptual del informe (DOT → Graphviz → SVG)
        ↓
Normalización (1FN → 2FN → 3FN)
        ↓
Modelo lógico (DBML → dbdiagram.io)
        ↓
Modelo físico (DDL y migraciones en connection.js)
```

La coherencia entre DBML, DDL documentado y esquema ejecutable se valida con las herramientas del repositorio antes de exportar las imágenes. Para `v0.5.0`, `npm run check:dbml`, `npm run check:schema` y el smoke test del DDL finalizaron correctamente dentro de los gates documentados.

## Procedimiento de actualización externa

### Modelo lógico

1. Ejecutar `python3 scripts/generate-dbml-from-code.py --check` sobre [`03-modelo-logico-relacional.dbml`](./03-modelo-logico-relacional.dbml).
2. Importar el DBML validado en [dbdiagram.io](https://dbdiagram.io).
3. Exportar y reemplazar `03-modelo-logico-relacional.png`.
4. Verificar que ninguna tabla, FK o restricción relevante haya quedado fuera del encuadre.

## Criterios de cierre

- Las fuentes editables coinciden con `connection.js` y con la documentación física.
- Los verificadores de esquema del repositorio finalizan correctamente.
- Cada imagen utilizada en el informe procede de su fuente editable vigente.
- Las imágenes representan visualmente el alcance de las fuentes; la legibilidad al tamaño final de informe y diapositivas se valida durante la maquetación.
- El capítulo fuente identifica la RC1 `0.6.0/600`; las versiones anteriores se conservan sólo como antecedentes o atribución de evidencia histórica. El checkpoint ensamblado no se modifica manualmente.
