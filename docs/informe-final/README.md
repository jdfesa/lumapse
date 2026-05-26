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
