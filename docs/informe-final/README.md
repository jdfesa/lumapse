# Informe final — flujo de trabajo

Este directorio se trabaja **por secciones**. Los archivos `01-*.md` a `08-*.md` son la fuente de verdad del informe final; `report-metadata.json` controla el estado y el corte que aparecen en la portada generada.

El informe es un documento vivo y queda sujeto a actualizaciones mientras el proyecto avance. Se lo va a consultar de forma recurrente para agregar secciones, corregir inconsistencias, ajustar redacción y completar evidencias antes del cierre académico.

`INFORME-FINAL-COMPLETO.md` es un artefacto ensamblado automáticamente con:

```bash
python3 scripts/assemble-report.py
```

Por regla general, no se edita manualmente el informe completo. Se regenera solo en puntos de control explícitos o al cierre, cuando las secciones ya estén revisadas y consistentes.

La fecha de ensamblado se calcula en cada ejecución. El estado, alcance funcional y fecha de corte documental se leen de `report-metadata.json`; nunca se recuperan desde una salida generada anterior.

## Reglas de trabajo

- Editar siempre el capítulo correspondiente, no el informe completo.
- Mantener numeración, títulos y enlaces internos coherentes entre capítulos.
- Redactar con tono académico y evidencia verificable.
- Usar normas APA como criterio de rigor: citas autor-fecha en el texto y referencias completas al consolidar la bibliografía final.
- No duplicar contenido entre capítulos; si una idea aparece en más de una sección, una debe resumir y la otra desarrollar.
- Antes de ensamblar, ejecutar los chequeos documentales (`npm run check:docs` y `npm run check:traceability`).
- Si aparece contenido útil solo en `INFORME-FINAL-COMPLETO.md`, primero moverlo al capítulo fuente correspondiente y recién después regenerar.

## Estado actual

El Hito 05 quedó cerrado con la beta controlada `v0.4.8` firmada, validada inicialmente, publicada y documentada. El Hito 06 se encuentra activo para el cierre académico. Los capítulos fuente describen el alcance funcional vigente, la distribución Android, la suite de 773 tests y los límites actuales de validación.

`INFORME-FINAL-COMPLETO.md` fue regenerado como checkpoint el 2026-07-15 después de la reconciliación transversal y se volvió a ensamblar al incorporar las figuras externas de base de datos. Los capítulos siguen siendo la fuente de verdad y el artefacto deberá ensamblarse otra vez cuando se consolide la evidencia final.

Los pendientes explícitos del Hito 06 son:

- Revisión editorial de congelamiento después de incorporar las evidencias finales; la reconciliación transversal y las figuras DB del checkpoint ya están completadas.
- Verificación de legibilidad de las imágenes de base de datos dentro del PDF y las diapositivas. El conceptual Chen y el lógico relacional ya fueron exportados, revisados e incorporados desde sus fuentes DOT y DBML sincronizadas.
- Verificación de los metadatos bibliográficos incompletos de Gómez (2014) y Parada (2026) contra los originales de cátedra; la sección de referencias ya existe y no inventa los datos ausentes.
- Ejecución del plan RNF de Hito 06: uso y navegación, accesibilidad, rendimiento, offline/cierre inesperado, tráfico/dependencias, coverage TypeScript y matriz final por artefacto; además, portabilidad del auditor y equivalencia entre CI y gate local.
- Validación Android final, preparación de la presentación y ensamblado definitivo después de cerrar los puntos anteriores.

### Checklist antes del próximo ensamblado

- [x] Confirmar que alcance, versión, cantidad de tests y estado del hito coinciden con `TODO`, `BACKLOG.md` y `CHANGELOG.md` en el checkpoint 2026-07-15.
- [x] Sincronizar las fuentes DOT, DBML y DDL con el schema ejecutable.
- [x] Incorporar o referenciar las imágenes finales de base de datos y verificar su correspondencia con el código (2026-07-15).
- [ ] Confirmar metadatos de los materiales de cátedra y cerrar la bibliografía con correspondencia uno a uno entre citas y referencias.
- [x] Ejecutar los chequeos documentales del checkpoint.
- [x] Ensamblar el checkpoint con `python3 scripts/assemble-report.py` y revisar el diff generado.
- [ ] Congelar contenido antes de iniciar la maquetación LaTeX/PDF.

## Formato final de entrega

Como último paso, cuando el informe ya esté estructurado, revisado y listo para la instancia de defensa, se preparará una versión formal en PDF usando LaTeX. Esta fase permanece deliberadamente pendiente hasta congelar el contenido.

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
