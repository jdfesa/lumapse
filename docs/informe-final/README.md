# Informe final — flujo de trabajo

Este directorio se trabaja **por secciones**. Los archivos `01-*.md` a `08-*.md` son la fuente de verdad del informe final; `report-metadata.json` controla el estado y el corte que aparecen en la portada generada.

La [presentación institucional](./00-presentacion-institucional.md) es la fuente
de identificación formal del alumno, la institución, la carrera, la cátedra y sus
autoridades y responsables académicos. Se mantiene separada de los capítulos y
sin enlaces en su contenido. La identificación está revisada y aprobada en
[PR #63](https://github.com/jdfesa/lumapse/pull/63); su maquetación definitiva sigue pendiente.
El ensamblador actual todavía no lee esta fuente; su integración se resolverá
al acordar el ensamblado final, sin regenerar ahora el informe completo.

El informe es un documento vivo y queda sujeto a actualizaciones mientras el proyecto avance. Se lo va a consultar de forma recurrente para agregar secciones, corregir inconsistencias, ajustar redacción y completar evidencias antes del cierre académico.

`INFORME-FINAL-COMPLETO.md` es una salida generada, no una fuente de edición. Se regenerará al cerrar la revisión de los capítulos mediante:

```bash
python3 scripts/assemble-report.py
```

No se edita manualmente el informe completo. El checkpoint parcial del 2026-11-17 se retiró del árbol vigente al quedar desactualizado; permanece recuperable en el historial de Git. La lectura y edición actuales se realizan sobre los capítulos fuente, sin mantener una copia ensamblada hasta el cierre editorial.

La fecha de ensamblado se calcula en cada ejecución. El estado, alcance funcional y fecha de corte documental se leen de `report-metadata.json`; nunca se recuperan desde una salida generada anterior.

## Reglas de trabajo

- Editar siempre el capítulo correspondiente, no el informe completo.
- Mantener numeración, títulos y enlaces internos coherentes entre capítulos.
- Antes de ensamblar, ejecutar los chequeos documentales (`npm run check:docs` y `npm run check:traceability`).
- Si aparece contenido útil solo en `INFORME-FINAL-COMPLETO.md`, primero moverlo al capítulo fuente correspondiente y recién después regenerar.

### Seguimiento por capítulos

El [estado de cada unidad](../../TODO.md#revisión-del-informe-capítulo-por-capítulo)
se registra en `TODO.md`. Los metadatos conservan el corte del último checkpoint; su
comprobación definitiva y el ensamblado final siguen pendientes del cierre editorial.

## Estado actual

El Hito 05 quedó cerrado con la primera beta `v0.4.8`. El Hito 06 publicó la segunda
beta `v0.5.0` y la versión **`v0.6.0/600` RC1**, aceptada con validación parcial. El
[desarrollo y las nuevas comprobaciones de app están congelados](../../BACKLOG.md#congelación-académica--2026-10-22)
hasta después de la presentación. El manual 0.6.0 ya está incorporado y publicado,
con revisión final pendiente. La revisión del informe avanza por unidades,
sin dar por cerrados el manual ni la defensa.

**Revisión de las fuentes:** los capítulos 1 y 2 están revisados, aprobados e integrados
en [PR #46](https://github.com/jdfesa/lumapse/pull/46) y
[PR #48](https://github.com/jdfesa/lumapse/pull/48), respectivamente. El capítulo 3
también está revisado, aprobado e integrado en
[PR #49](https://github.com/jdfesa/lumapse/pull/49). El capítulo 4 está aprobado e
integrado en [PR #50](https://github.com/jdfesa/lumapse/pull/50), con su rama
eliminada. El [capítulo 5](./05-desarrollo-implementacion.md) está revisado contra
la fuente de 0.6.0 RC1 y aprobado; sus cambios se recogen en
[PR #51](https://github.com/jdfesa/lumapse/pull/51). El
[capítulo 6](./06-pruebas-validacion.md) está revisado con evidencia atribuida por
artefacto y límites de la versión 0.6.0 RC1 y aprobado; sus cambios se recogen en
[PR #52](https://github.com/jdfesa/lumapse/pull/52). El
[capítulo 7](./07-conclusiones.md) está revisado contra los objetivos y la evidencia
del corte 0.6.0 RC1, con lecciones y trabajo futuro delimitados y aprobado; sus cambios
se recogen en [PR #53](https://github.com/jdfesa/lumapse/pull/53).

La unidad `08-referencias.md` está revisada y aprobada en
[PR #54](https://github.com/jdfesa/lumapse/pull/54).
Los originales de Gómez y Parada permitieron comprobar sus metadatos
y distinguir la obra publicada del material de cátedra. La correspondencia de
citas incluye la GPLv3 de 5.7 y la atribución de la guía Kanban a Coleman y Vacanti,
con corrección mínima de sus dos citas en el capítulo 2.

**Auditoría complementaria de apertura y capítulos 1–2:** el índice describe el
corte 0.6.0 RC1 y distingue navegación de fuentes de índice impreso. Los capítulos
precisan la unidad de análisis de la encuesta y explican con ejemplos la estimación
y el criterio de las decisiones; las tablas del capítulo 2 tienen identificación y
procedencia. Las referencias incorporan el apoyo metodológico de Design Thinking
y Lean Canvas y explicitan el carácter didáctico de la guía del profesor responsable
de la cátedra, Ing. Mauricio Parada. Los ajustes están revisados y aprobados en
[PR #65](https://github.com/jdfesa/lumapse/pull/65); no modifican cifras,
requisitos, evidencia de pruebas ni la identificación
institucional aprobada, y no cierran el ensamblado o la revisión transversal.

**Auditoría complementaria de capítulos 3–4:** se recontaron los datos de mayo y
se contrastaron las reglas de procesamiento, las decisiones y los diagramas con
la fuente de 0.6.0 RC1. Las cifras se conservan; los ajustes precisan unidades del
error nominal, contexto de uso, justificaciones de diseño y límites de Papelera,
identificadores e importación, con tablas identificadas. Los ajustes están
revisados y aprobados en [PR #66](https://github.com/jdfesa/lumapse/pull/66).
No se generó nueva evidencia funcional ni se cerraron la revisión transversal o
la maquetación.

**Figuras de comportamiento y componentes:** el capítulo 4 incorpora SVG
vectoriales de casos de uso (4-1), guardado explícito (4-2) y dependencias de
componentes (4-5), con fuentes editables y criterios de selección en el
[índice de diagramas](../diagramas/README.md#figuras-seleccionadas-para-el-informe).
Los documentos técnicos corrigen las fronteras de actores, listado/búsqueda,
reanudación/restauración y errores transaccionales. El dominio y las secuencias
de detalle permanecen en el repositorio para no duplicar contenido. Las figuras
de base de datos 4-3 y 4-4 no cambian. Esta unidad queda pendiente de revisión del
autor; no declara aprobado el PDF final ni cierra la revisión transversal.

**Ampliación del capítulo 6 — prueba exploratoria:** la sección 6.4.4 incorpora
el método, los resultados y los límites de las 22 respuestas a la encuesta cerrada
el 22 de noviembre de 2026, contrastados con el [análisis y sus datos originales](../prueba-exploratoria/resultados.md).
Se distinguen 13 respuestas con uso declarado y nueve sin uso, sin verificar
personas únicas, versión instalada, adopción o RNF-005. La ampliación está
revisada y aprobada; sus cambios se recogen en [PR #62](https://github.com/jdfesa/lumapse/pull/62).
No modifica la app, los estados RNF ni las pruebas técnicas anteriores.

**Complementos de proceso y recursos:** las secciones 2.1.4 y 2.4.1 explicitan la
asistencia de IA y los recursos y desembolsos personales, con continuidad en
7.3.2. Están revisados y aprobados; sus cambios se recogen en
[PR #57](https://github.com/jdfesa/lumapse/pull/57). No amplían la evidencia de
pruebas; el checkpoint parcial del 2026-11-17 los incorporó sin modificar los capítulos fuente.

**Checkpoint parcial del 2026-11-17 — antecedente histórico:** reunió los siete
capítulos y las referencias de ese corte, con índice automático y metadatos de la
`v0.6.0/600` RC1. Su portada distinguía el tag `v0.6.0` sobre `ac2a747` de la fuente
del APK, `bcefe6a`, e indicaba su estado parcial. Se retiró del árbol vigente junto
con la figura conceptual reemplazada para evitar versiones contradictorias durante
la revisión por capítulos; no se regeneró otro ensamblado.

Ese checkpoint y el anterior de `v0.5.0`, del 2026-09-05, permanecen en el historial
de Git. Los capítulos son la fuente de verdad y conservan las atribuciones y límites
de la evidencia. Su revisión no completa por sí sola los pendientes de diagramas,
matriz RNF, revisión transversal o presentación final.

El tablero único vigente es [`TODO.md`](../../TODO.md).

Los pendientes explícitos del Hito 06 son:

- Revisión transversal y congelamiento editorial del contenido antes del ensamblado final; el checkpoint parcial no cierra esta tarea.
- Inclusión y revisión de vigencia de los diagramas de base de datos y del modelado UML respecto de la versión 0.6.0 RC1 congelada, además de su legibilidad en PDF y diapositivas. La existencia de figuras históricas no completa el [pendiente de diagramas](../../TODO.md#después-del-apk-aceptado-con-límites--cierre-académico-y-defensa).
- Consolidación documental de la matriz RNF a partir de la [fuente canónica](../producto/requisitos-no-funcionales.md) y los reportes existentes: método, fecha, artefacto, resultado y límites. La evidencia de uso, accesibilidad, offline y tráfico en debugs no verifica automáticamente la versión 0.6.0 RC1. CRUD/FPS siguen pendientes y [diferidos a post-presentación](../../BACKLOG.md#rendimiento-post-presentación); las comprobaciones restantes del APK exacto también se difieren, sin nuevas mediciones para completar el informe.
- Conciliación final del [corte 0.6.0 RC1 identificado](../gestion/candidato-apk-0.6.0.md#binario-corregido), sus controles y aceptación parcial entre informe, manual, matriz y demo. El [recorte vigente](../../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa) no exige otra APK ni una versión estable: corresponde cerrar esos entregables con la evidencia disponible y los pendientes explícitos.

### Manual de usuario y consistencia de la entrega

**Acuerdo posterior — 2026-10-12:** la encuesta voluntaria y la evaluación con
usuarios se realizan después del corte, sin bloquear manual, informe ni defensa.
Incorporar el feedback disponible con versión/fecha, fricciones y límites, sin
inferir la métrica de RNF-005 ni abrir correcciones automáticamente. Las futuras
observaciones de los dos docentes que el autor informa prueban `v0.5.0` pertenecen
a esa versión, no al APK posterior. No esperar respuestas para cerrar entregables.

**Evidencia incorporada al checkpoint parcial:** [OFF-01–05 de RNF-009](../beta-core-validation/offline-2026-10-06.md)
pasaron en el debug `348da88` el 2026-10-06, tras corregir el bloqueo del ZIP local
sin red. El autor aceptó [PR #31](https://github.com/jdfesa/lumapse/pull/31); el
resultado corresponde a ese debug y no se transfiere al asset publicado `v0.5.0`
ni a la versión `v0.6.0` RC1. El capítulo 6 conserva esa atribución por artefacto.

El [manual de usuario 0.6.0](../manual-de-usuario-0.6.0/README.md) ya se incorporó
al repositorio y se [publicó en GitHub Pages](https://jdfesa.github.io/lumapse/manual-de-usuario-lumapse.html).
Incluye fuentes editables y siete capturas de ese corte. Reemplaza, como guía de
uso actual, la referencia anterior a un manual externo `v0.5.0` aún por revisar.
Su revisión final y congelamiento documental siguen pendientes; publicar la guía
no equivale a probar los recorridos diferidos de la APK.

La revisión debe explicar los flujos existentes y sus límites: guardado explícito,
borradores, archivo/papelera y backup ZIP local, que no incluye borradores ni papelera.
Informe, manual, matriz RNF y demo deben describir el mismo artefacto. La conciliación
y el congelamiento final siguen pendientes; el ensamblado parcial no completa las
revisiones restantes ni modifica los capítulos fuente.

### Checklist de ensamblado y cierre

- [x] Confirmar que alcance, versión, cantidad de tests y estado del hito coinciden con `TODO`, `BACKLOG.md` y `CHANGELOG.md` en el checkpoint `v0.5.0` del 2026-09-05.
- [x] Sincronizar las fuentes DOT, DBML y DDL con el schema ejecutable.
- [x] Incorporar o referenciar las imágenes finales de base de datos y verificar su correspondencia con el código (2026-07-15).
- [x] Confirmar metadatos de Gómez y del material de cátedra de Parada contra los originales; preparar la correspondencia entre citas y referencias.
- [x] Aprobar la unidad de referencias antes del congelamiento y nuevo ensamblado.
- [x] Ejecutar los chequeos documentales del checkpoint.
- [x] Ensamblar el checkpoint con `python3 scripts/assemble-report.py` y revisar el diff generado.
- [x] Reconciliar metadatos, capítulos y referencias con el tag publicado `v0.5.0`.
- [x] Regenerar el checkpoint parcial 0.6.0 RC1 del 2026-11-17 desde las fuentes vigentes, con fecha, alcance y estado parcial en la portada.
- [ ] Completar la revisión transversal y la conciliación final con la matriz RNF por artefacto, los diagramas y los límites aceptados antes de congelar y ensamblar la entrega.
- [ ] Congelar contenido antes de iniciar la maquetación LaTeX/PDF.

## Formato final de entrega

Como último paso, cuando el informe ya esté estructurado, revisado y listo para la instancia de defensa, se preparará una versión formal en PDF usando LaTeX. Esta fase permanece deliberadamente pendiente hasta congelar el contenido.

La edición diaria seguirá realizándose en Markdown dentro de este directorio. LaTeX no reemplaza a las secciones fuente durante el desarrollo del informe; se reserva como capa final de presentación para maquetar índice, numeración, figuras, tablas, anexos y referencias con formato académico.

La generación final podrá automatizarse mediante un script específico cuando el contenido esté consolidado.

### Consideraciones para la conversión a LaTeX

La selección del motor, el tratamiento de figuras y tablas, y la comprobación
visual de la salida quedan pendientes para esa etapa. No se ha generado ni
verificado un PDF final.
