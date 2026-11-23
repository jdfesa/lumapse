# Diagramas — Lumapse

Esta carpeta reúne vistas del comportamiento, la arquitectura y el dominio de
Lumapse. Las fuentes de esta revisión corresponden a **0.6.0/600 — RC1** (fuente
del APK `bcefe6a`), contrastadas estáticamente el 2026-11-23. No se atribuyen nuevas
pruebas funcionales ni se modifican los estados de los requisitos.

## Convenciones

- Las vistas de detalle de secuencia, arquitectura y dominio se mantienen en
  bloques Mermaid dentro de sus documentos Markdown.
- Las figuras seleccionadas para el informe tienen fuente editable DOT o Mermaid
  independiente y salida SVG vectorial en [`figuras/`](./figuras/). No se corrigen
  manualmente los SVG: se modifica la fuente y se regenera.
- La arquitectura representa dependencias lógicas, no servicios desplegados por
  separado ni una arquitectura de capas estrictas. Las decisiones y sus límites
  se justifican en [`../adr/`](../adr/).
- Los modelos de [`database/`](./database/) conservan sus propias fuentes,
  figuras y procedimiento de regeneración. No se reexportan ni se sustituyen
  como parte de las vistas de comportamiento y componentes.

## Índice y alcance

| Documento | Vista | Alcance |
|---|---|---|
| [`casos-de-uso.md`](./casos-de-uso.md) | Casos de uso | Actor principal, capacidades agrupadas y frontera del cliente; tablas de detalle y exclusiones |
| [`secuencia-crear-nota.md`](./secuencia-crear-nota.md) | Secuencias | Arranque, captura, guardado, reanudación, restauración y errores con límites diferenciados |
| [`arquitectura-componentes.md`](./arquitectura-componentes.md) | Arquitectura/componentes | Dependencias del cliente, composición, estado, servicios y persistencia; patrones y límites |
| [`modelo-dominio.md`](./modelo-dominio.md) | Clases de datos | Tres entidades académicas, contratos técnicos separados y módulos colaboradores |
| [`database/`](./database/) | Modelos de datos | Fuentes y figuras de base de datos, con su documentación específica |

## Figuras seleccionadas para el informe

| Figura | Fuente editable | Salida | Ubicación y aporte |
|---|---|---|---|
| Casos de uso | [`casos-de-uso.dot`](./figuras/casos-de-uso.dot) | [SVG](./figuras/casos-de-uso.svg) | Capítulo 4, sección 4.4, figura 4-1: qué puede hacer el usuario y con qué frontera |
| Guardado explícito | [`secuencia-guardar-nota.mmd`](./figuras/secuencia-guardar-nota.mmd) | [SVG](./figuras/secuencia-guardar-nota.svg) | Capítulo 4, sección 4.5, figura 4-2: cómo se confirma una nota y se consume el borrador |
| Componentes | [`arquitectura-componentes.dot`](./figuras/arquitectura-componentes.dot) | [SVG](./figuras/arquitectura-componentes.svg) | Capítulo 4, sección 4.8.1, figura 4-5: dependencias y rutas de acceso a datos |

El modelo de dominio y las secuencias de detalle permanecen en el repositorio.
No se añaden como láminas al manuscrito: la tabla de entidades y el modelo
conceptual ya explican las relaciones académicas; las variantes de arranque,
restauración y fallo apoyan la verificación técnica sin repetir el recorrido
central de guardado. Las figuras 4-3 y 4-4 de base de datos conservan su numeración
y contenido.

### Regeneración de las figuras seleccionadas

Desde la raíz, con Graphviz y Mermaid CLI disponibles como herramientas
documentales externas, sin instalar dependencias en la app:

```bash
dot -Tsvg docs/diagramas/figuras/casos-de-uso.dot -o docs/diagramas/figuras/casos-de-uso.svg
dot -Tsvg docs/diagramas/figuras/arquitectura-componentes.dot -o docs/diagramas/figuras/arquitectura-componentes.svg
mmdc -i docs/diagramas/figuras/secuencia-guardar-nota.mmd -o docs/diagramas/figuras/secuencia-guardar-nota.svg -c docs/diagramas/figuras/mermaid-config.json -b white --no-font-embed
```

El estilo Mermaid se conserva en
[`mermaid-config.json`](./figuras/mermaid-config.json). Se utiliza tipografía
Liberation Sans; debe estar disponible al renderizar o convertir el SVG. La
revisión de esta unidad utilizó Graphviz 16.1.2 y Mermaid CLI 12.2.0. No se añade
ninguno al runtime, a las dependencias ni al gate de la app.

### Revisión para impresión

Las tres figuras se preparan para un ancho de 155 mm, correspondiente al área
útil del preset A4 del informe. La revisión debe comprobar texto completo,
asociaciones y flechas, contraste en escala de grises y ausencia de recortes al
convertir a PDF. La condición `[creación]` de la secuencia limita el refresco a
ese camino; no representa una segunda escritura de la nota.

La prueba aislada de las tres figuras se revisó en páginas A4 a ese ancho, con
fuentes incrustadas y sin recortes observados. Esa prueba no sustituye la
revisión del PDF completo:
quedan por comprobar su colocación definitiva, referencias, pies y saltos dentro
del informe ensamblado. Su inclusión en los capítulos fuente tampoco equivale a
aprobación del autor ni a nuevas pruebas del APK.

---

*Documentación técnica · Lumapse · PP3 · 2026*
