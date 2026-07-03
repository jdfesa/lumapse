# Informe final — flujo de trabajo

Este directorio se trabaja **por secciones**. Los archivos `01-*.md` a `07-*.md` son la fuente de verdad del informe final.

El informe es un documento vivo y queda sujeto a actualizaciones mientras el proyecto avance. Se lo va a consultar de forma recurrente para agregar secciones, corregir inconsistencias, ajustar redacción y completar evidencias antes del cierre académico.

`INFORME-FINAL-COMPLETO.md` es un artefacto ensamblado automáticamente con:

```bash
python3 scripts/assemble-report.py
```

Por regla general, no se edita manualmente el informe completo. Se regenera solo en puntos de control explícitos o al cierre, cuando las secciones ya estén revisadas y consistentes.

## Reglas de trabajo

- Editar siempre el capítulo correspondiente, no el informe completo.
- Mantener numeración, títulos y enlaces internos coherentes entre capítulos.
- Redactar con tono académico y evidencia verificable.
- Usar normas APA como criterio de rigor: citas autor-fecha en el texto y referencias completas al consolidar la bibliografía final.
- No duplicar contenido entre capítulos; si una idea aparece en más de una sección, una debe resumir y la otra desarrollar.
- Antes de ensamblar, ejecutar los chequeos documentales (`npm run check:docs` y `npm run check:traceability`).
- Si aparece contenido útil solo en `INFORME-FINAL-COMPLETO.md`, primero moverlo al capítulo fuente correspondiente y recién después regenerar.

## Estado actual

El informe está en etapa de actualización. Algunas secciones todavía funcionan como esqueleto o contienen contenido parcial, y el informe completo puede quedar desfasado si se edita o regenera antes de terminar la revisión por capítulos.

El próximo trabajo debe priorizar completar y sincronizar las secciones fuente antes de volver a ensamblar el documento completo.

## Formato final de entrega

Como último paso, cuando el informe ya esté estructurado, revisado y listo para la instancia de defensa, se preparará una versión formal en PDF usando LaTeX.

La edición diaria seguirá realizándose en Markdown dentro de este directorio. LaTeX no reemplaza a las secciones fuente durante el desarrollo del informe; se reserva como capa final de presentación para maquetar índice, numeración, figuras, tablas, anexos y referencias con formato académico.

La generación final podrá automatizarse mediante un script específico cuando el contenido esté consolidado.

### Consideraciones para la conversión a LaTeX

La conversión a LaTeX debe tratarse como una fase de presentación final, no como una reescritura del contenido. El objetivo es producir un PDF académico prolijo, manteniendo Markdown como fuente de verdad y evitando divergencias entre versiones.

- Usar preferentemente `xelatex` o `lualatex` para manejar correctamente acentos, comillas, símbolos y posibles caracteres especiales presentes en nombres, tablas o evidencia.
- Exportar previamente los diagramas Mermaid a formato apto para LaTeX (`.pdf`, `.svg` o `.png`) y referenciarlos como figuras con numeración, caption y mención en el texto.
- Mantener los diagramas de base de datos con su flujo propio: DOT/Graphviz para el conceptual Chen y DBML/dbdiagram.io para el modelo lógico relacional, exportando imágenes finales antes de componer el PDF.
- Revisar manualmente tablas largas de requisitos, historias de usuario, métricas y validación, porque una tabla legible en Markdown puede desbordar márgenes en LaTeX.
- Convertir enlaces internos tipo Markdown en referencias académicas cuando corresponda: "ver Figura X", "ver Tabla Y" o "ver Sección Z".
- Definir un criterio único para bloques de código y comandos (`verbatim`, `listings` o equivalente), evitando estilos mezclados dentro del informe.
- Consolidar bibliografía y citas bajo un criterio APA consistente; si se automatiza, evaluar BibTeX/BibLaTeX en la etapa final.
- Revisar captions, numeración de figuras/tablas, portada, índice, anexos y saltos de página como parte de la corrección editorial final.
- No incorporar LaTeX al flujo diario ni al quality gate del proyecto hasta que el contenido esté congelado; si se automatiza, hacerlo con un script separado y documentado.
