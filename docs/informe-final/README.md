# Informe final — flujo de trabajo

Este directorio se trabaja **por secciones**. Los archivos `01-*.md` a `08-*.md` son la fuente de verdad del informe final; `report-metadata.json` controla el estado y el corte que aparecen en la portada generada.

El informe es un documento vivo y queda sujeto a actualizaciones mientras el proyecto avance. Se lo va a consultar de forma recurrente para agregar secciones, corregir inconsistencias, ajustar redacción y completar evidencias antes del cierre académico.

`INFORME-FINAL-COMPLETO.md` es un artefacto ensamblado automáticamente con:

```bash
python3 scripts/assemble-report.py
```

Por regla general, no se edita manualmente el informe completo. El próximo ensamblado queda pendiente hasta completar la revisión y aprobación de todos los capítulos y las referencias.

La fecha de ensamblado se calcula en cada ejecución. El estado, alcance funcional y fecha de corte documental se leen de `report-metadata.json`; nunca se recuperan desde una salida generada anterior.

## Reglas de trabajo

- Editar siempre el capítulo correspondiente, no el informe completo.
- Mantener numeración, títulos y enlaces internos coherentes entre capítulos.
- Antes de ensamblar, ejecutar los chequeos documentales (`npm run check:docs` y `npm run check:traceability`).
- Si aparece contenido útil solo en `INFORME-FINAL-COMPLETO.md`, primero moverlo al capítulo fuente correspondiente y recién después regenerar.

### Seguimiento por capítulos

El [estado de cada unidad](../../TODO.md#revisión-del-informe-capítulo-por-capítulo)
se registra en `TODO.md`. El ensamblado final y la actualización de los metadatos
globales siguen pendientes; una revisión parcial no equivale al informe terminado.

## Estado actual

El Hito 05 quedó cerrado con la primera beta `v0.4.8`. El Hito 06 publicó la segunda
beta `v0.5.0` y la **RC1 `v0.6.0/600`**, aceptada con validación parcial. El
[desarrollo y las nuevas comprobaciones de app están congelados](../../BACKLOG.md#congelación-académica--2026-10-22)
hasta después de la presentación. El manual 0.6.0 ya está incorporado y publicado,
con revisión final pendiente. La revisión del informe avanza por unidades,
sin dar por cerrados el manual ni la defensa.

**Revisión parcial:** los capítulos 1 y 2 están revisados, aprobados e integrados
en [PR #46](https://github.com/jdfesa/lumapse/pull/46) y
[PR #48](https://github.com/jdfesa/lumapse/pull/48), respectivamente. El capítulo 3
también está revisado, aprobado e integrado en
[PR #49](https://github.com/jdfesa/lumapse/pull/49). El capítulo 4 está aprobado e
integrado en [PR #50](https://github.com/jdfesa/lumapse/pull/50), con su rama
eliminada. El [capítulo 5](./05-desarrollo-implementacion.md) está revisado contra
la fuente RC1 y aprobado; sus cambios se recogen en
[PR #51](https://github.com/jdfesa/lumapse/pull/51). El
[capítulo 6](./06-pruebas-validacion.md) está revisado con evidencia atribuida por
artefacto y límites de la RC1 y aprobado; sus cambios se recogen en
[PR #52](https://github.com/jdfesa/lumapse/pull/52). El
[capítulo 7](./07-conclusiones.md) está revisado contra los objetivos y la evidencia
del corte RC1, con lecciones y trabajo futuro delimitados; pendiente de lectura
y aprobación en [PR #53](https://github.com/jdfesa/lumapse/pull/53).
El archivo `08-referencias.md` todavía conserva el checkpoint
anterior; su revisión sigue pendiente, incluida la correspondencia bibliográfica
de la GPLv3 citada en 5.7.

**Frontera del checkpoint generado:** `report-metadata.json` y
`INFORME-FINAL-COMPLETO.md` conservan el corte `v0.5.0` del 2026-09-05, incluido el
gate histórico de 67 archivos/1065 tests. No describen toda la evolución hasta la
RC1 ni reflejan aún la revisión parcial de las fuentes. Sus métricas no corresponden
al `main` actual ni se atribuyen al APK `0.6.0`.

`INFORME-FINAL-COMPLETO.md` se regeneró como checkpoint después de reconciliar los capítulos con `v0.5.0`. Los capítulos siguen siendo la fuente de verdad; el próximo ensamblado permanece pendiente hasta completar la revisión y aprobación de todas las unidades.

El tablero único vigente es [`TODO.md`](../../TODO.md). El nombre anterior `TODO`
se conserva en menciones históricas del checkpoint; no representa otro tablero ni
una ruta de navegación vigente.

Los pendientes explícitos del Hito 06 son:

- Revisión editorial de congelamiento después de incorporar las evidencias finales; la reconciliación transversal y las figuras DB del checkpoint ya están completadas.
- Verificación de legibilidad de las imágenes de base de datos dentro del PDF y las diapositivas. El conceptual Chen y el lógico relacional ya fueron exportados, revisados e incorporados desde sus fuentes DOT y DBML sincronizadas.
- Verificación de los metadatos bibliográficos incompletos de Gómez (2014) y Parada (2026) contra los originales de cátedra; la sección de referencias ya existe y no inventa los datos ausentes.
- Consolidación documental de la matriz RNF a partir de la [fuente canónica](../producto/requisitos-no-funcionales.md) y los reportes existentes: método, fecha, artefacto, resultado y límites. La evidencia de uso, accesibilidad, offline y tráfico en debugs no verifica automáticamente la RC1. CRUD/FPS siguen pendientes y [diferidos a post-presentación](../../BACKLOG.md#rendimiento-post-presentación); las comprobaciones restantes del APK exacto también se difieren, sin nuevas mediciones para completar el informe.
- Incorporación del [corte RC1 identificado](../gestion/candidato-apk-0.6.0.md#binario-corregido), sus controles y aceptación parcial en los capítulos cuando se acuerde su revisión. El [recorte vigente](../../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa) no exige otra APK ni una versión estable: corresponde cerrar manual, matriz, informe y defensa con la evidencia disponible y los pendientes explícitos. Esta revisión de guías no modifica ni regenera el checkpoint.

### Manual de usuario y consistencia de la entrega

**Acuerdo posterior — 2026-10-12:** la encuesta voluntaria y la evaluación con
usuarios se realizan después del corte, sin bloquear manual, informe ni defensa.
Incorporar el feedback disponible con versión/fecha, fricciones y límites, sin
inferir la métrica de RNF-005 ni abrir correcciones automáticamente. Las futuras
observaciones de los dos docentes que el autor informa prueban `v0.5.0` pertenecen
a esa versión, no al APK posterior. No esperar respuestas para cerrar entregables.

**Evidencia posterior al checkpoint:** [OFF-01–05 de RNF-009](../beta-core-validation/offline-2026-10-06.md)
pasaron en el debug `348da88` el 2026-10-06, tras corregir el bloqueo del ZIP local
sin red. El autor aceptó [PR #31](https://github.com/jdfesa/lumapse/pull/31); el
resultado corresponde a ese debug y no se transfiere al asset publicado `v0.5.0`
ni a la RC1 `v0.6.0`. El informe ensamblado conserva su checkpoint anterior.

El [manual de usuario 0.6.0](../manual-de-usuario-0.6.0/README.md) ya se incorporó
al repositorio y se [publicó en GitHub Pages](https://jdfesa.github.io/lumapse/manual-de-usuario-lumapse.html).
Incluye fuentes editables y siete capturas de ese corte. Reemplaza, como guía de
uso actual, la referencia anterior a un manual externo `v0.5.0` aún por revisar.
Su revisión final y congelamiento documental siguen pendientes; publicar la guía
no equivale a probar los recorridos diferidos de la APK.

La revisión debe explicar los flujos existentes y sus límites: guardado explícito,
borradores, archivo/papelera y backup ZIP local, que no incluye borradores ni papelera.
Informe, manual, matriz RNF y demo deben describir el mismo artefacto. La adaptación
y el congelamiento final siguen pendientes; este acuerdo no regenera los capítulos
ni el informe ensamblado de `v0.5.0`.

### Checklist antes del próximo ensamblado

- [x] Confirmar que alcance, versión, cantidad de tests y estado del hito coinciden con `TODO`, `BACKLOG.md` y `CHANGELOG.md` en el checkpoint `v0.5.0` del 2026-09-05.
- [x] Sincronizar las fuentes DOT, DBML y DDL con el schema ejecutable.
- [x] Incorporar o referenciar las imágenes finales de base de datos y verificar su correspondencia con el código (2026-07-15).
- [ ] Confirmar metadatos de los materiales de cátedra y cerrar la bibliografía con correspondencia uno a uno entre citas y referencias.
- [x] Ejecutar los chequeos documentales del checkpoint.
- [x] Ensamblar el checkpoint con `python3 scripts/assemble-report.py` y revisar el diff generado.
- [x] Reconciliar metadatos, capítulos y referencias con el tag publicado `v0.5.0`.
- [ ] Adaptar capítulos y metadatos al corte RC1 `v0.6.0`, con matriz RNF por artefacto y límites aceptados, antes de acordar un nuevo ensamblado.
- [ ] Congelar contenido antes de iniciar la maquetación LaTeX/PDF.

## Formato final de entrega

Como último paso, cuando el informe ya esté estructurado, revisado y listo para la instancia de defensa, se preparará una versión formal en PDF usando LaTeX. Esta fase permanece deliberadamente pendiente hasta congelar el contenido.

La edición diaria seguirá realizándose en Markdown dentro de este directorio. LaTeX no reemplaza a las secciones fuente durante el desarrollo del informe; se reserva como capa final de presentación para maquetar índice, numeración, figuras, tablas, anexos y referencias con formato académico.

La generación final podrá automatizarse mediante un script específico cuando el contenido esté consolidado.

### Consideraciones para la conversión a LaTeX

La selección del motor, el tratamiento de figuras y tablas, y la comprobación
visual de la salida quedan pendientes para esa etapa. No se ha generado ni
verificado un PDF final.
