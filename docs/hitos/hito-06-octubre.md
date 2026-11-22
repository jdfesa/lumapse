# Informe de Hito 06 — Entrega Final

**Período planificado:** Octubre de 2026

**Inicio operativo:** 2026-07-15

**Corte de este balance:** 2026-11-22

**Proyecto:** Lumapse

**Estado del hito:** Cierre documental y preparación de defensa en curso. Desarrollo de la app congelado sobre la versión 0.6.0/600 RC1, publicada como Pre-release y aceptada con validación parcial.

**Última actualización:** 2026-11-22

---

## Resumen ejecutivo

El Hito 06 concentró la preparación de una entrega académica defendible: corregir riesgos de integridad y seguridad, hacer reproducibles los controles, identificar el APK de presentación y organizar la evidencia y la documentación. No consistió en agregar todas las funcionalidades posibles ni en convertir la beta en un producto comercial estable.

El trabajo produjo dos cortes publicados: la segunda beta `v0.5.0`, que reunió las correcciones de septiembre, y la versión **0.6.0 RC1**, fijada el 22 de octubre como artefacto de presentación. Su aceptación fue explícitamente parcial: los resultados existentes se conservaron con su fecha y artefacto, y las comprobaciones restantes quedaron diferidas sin presentarlas como aprobadas. Desde la congelación, el trabajo se limitó a documentación.

La etapa posterior incorporó el manual de usuario, la revisión y aprobación de los capítulos y referencias del informe académico, la actualización de los modelos de base de datos y una prueba exploratoria voluntaria. Esta última se cerró el 22 de noviembre con 22 respuestas, cuyos resultados y límites se incorporaron al capítulo de pruebas y validación.

Este documento es el **balance de ejecución del hito**: explica qué se hizo, por qué, cómo y con qué resultados. Es distinto del [informe final académico](../informe-final/README.md), destinado al tribunal y todavía en preparación editorial. Consolidar este balance no declara entregado el PDF completo, revisado definitivamente el manual ni ensayada la defensa. El estado de esas salidas se mantiene en [TODO](../../TODO.md#después-del-apk-aceptado-con-límites--cierre-académico-y-defensa).

## 1. Punto de partida y evolución del alcance

El hito comenzó después del [cierre documental del Hito 05](./hito-05-septiembre.md), el 15 de julio de 2026. La primera beta `v0.4.8` ya estaba publicada; el proyecto disponía de editor Markdown, organización por materias y secciones, borradores persistentes, fechas académicas y respaldo ZIP. El trabajo posterior no se atribuyó retroactivamente a esa APK.

El propósito inicial combinó revisión editorial, diagramas, validación y defensa. Durante su ejecución aparecieron riesgos concretos de persistencia, importación y actualización que justificaron correcciones acotadas antes de fijar el artefacto de presentación. Las decisiones se documentaron mediante requisitos, ADR, reportes de prueba y PR; no se reabrieron funcionalidades postergadas por diseño.

Octubre fue el mes previsto originalmente, no una fecha de terminación acreditada. El balance incorpora el trabajo documental realizado hasta el 22 de noviembre. La [política de cierre](../../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa) distingue lo comprobado, lo pendiente, las limitaciones y lo diferido; la proximidad de la entrega no transforma una ausencia de medición en cumplimiento.

## 2. Cronología de los hechos principales

Las fechas de ejecución y decisión siguen sus reportes. Cuando se indica integración de PR o publicación, la fecha corresponde al registro de GitHub en UTC; no debe confundirse con el comienzo del trabajo ni con una medición de duración.

| Fecha o período | Trabajo y resultado | Evidencia |
|---|---|---|
| 2026-07-15 | Cierre documental del Hito 05 y activación del Hito 06; reconciliación de capítulos, fuentes de base de datos y checkpoint del informe | [Cierre y transferencia](./hito-05-septiembre.md#transferencia-a-hito-06) |
| Septiembre de 2026 | Correcciones AUD-001 a AUD-007, ajuste táctil de organización y preparación de la segunda beta | [Changelog 0.5.0](../../CHANGELOG.md#050--2026-09-05--beta) y [registros de auditoría](../gestion/revision-tecnica-priorizada-2026-09-01.md) |
| 2026-09-06, publicación UTC | Publicación de `v0.5.0`, conservando la primera beta como antecedente inmutable | [Release 0.5.0](https://github.com/jdfesa/lumapse/releases/tag/v0.5.0) |
| 2026-09-14 a 2026-09-18, integraciones UTC | Gate portable, confirmación de notas y fechas ya persistidas y tratamiento separado de refrescos vecinos | [PR #14](https://github.com/jdfesa/lumapse/pull/14), [PR #15](https://github.com/jdfesa/lumapse/pull/15) y [PR #19](https://github.com/jdfesa/lumapse/pull/19) |
| Octubre de 2026, antes del corte | Comprobaciones de continuidad, funcionamiento offline, tráfico y accesibilidad; correcciones localizadas y registro de límites por artefacto | [Continuidad](../beta-core-validation/continuidad-2026-10-04.md), [offline](../beta-core-validation/offline-2026-10-06.md) y [fuente RNF](../producto/requisitos-no-funcionales.md) |
| 2026-10-22 | Revisión precorte, recuperación del incidente de despliegue, generación y actualización del candidato; publicación de 0.6.0 RC1 y decisión de congelar con cobertura parcial | [Precorte](../gestion/revision-precorte-2026-10-22.md) y [candidato publicado](../gestion/candidato-apk-0.6.0.md) |
| 2026-10-25, integraciones UTC | Formalización documental de la congelación e incorporación del manual interactivo de la versión 0.6.0 | [PR #43](https://github.com/jdfesa/lumapse/pull/43) y [PR #44](https://github.com/jdfesa/lumapse/pull/44) |
| 2026-10-27 a 2026-10-29, integraciones UTC | Revisión y aprobación individual de los siete capítulos del informe académico | [Seguimiento por capítulo](../../TODO.md#revisión-del-informe-capítulo-por-capítulo) |
| 2026-11-03, integración UTC | Referencias contrastadas con los originales de cátedra y correspondencia de citas revisada | [PR #54](https://github.com/jdfesa/lumapse/pull/54) |
| 2026-11-10 | Publicación del formulario de la prueba exploratoria, después de aprobar su diseño y recorridos | [Instrumento y publicación](../prueba-exploratoria/README.md) |
| 2026-11-17 | Incorporación del tratamiento de asistencia de IA y recursos personales; ensamblado de un checkpoint parcial de lectura, posteriormente retirado al quedar desactualizado | [PR #57](https://github.com/jdfesa/lumapse/pull/57) y [antecedente editorial](../informe-final/README.md#estado-actual) |
| 2026-11-21 a 2026-11-22, integraciones UTC | Revisión de los modelos conceptual, lógico y físico contra la versión 0.6.0 RC1, sin modificar el esquema ni la app | [PR #58](https://github.com/jdfesa/lumapse/pull/58), [PR #59](https://github.com/jdfesa/lumapse/pull/59) y [PR #60](https://github.com/jdfesa/lumapse/pull/60) |
| 2026-11-22 | Cierre y análisis de la encuesta; incorporación al capítulo 6 y aprobación de la identificación institucional del informe | [Resultados](../prueba-exploratoria/resultados.md), [PR #62](https://github.com/jdfesa/lumapse/pull/62) y [PR #63](https://github.com/jdfesa/lumapse/pull/63) |

La decisión de congelación está fechada el 22 de octubre en su registro; su formalización documental posterior en PR #43 no desplaza esa fecha. Del mismo modo, aprobar un capítulo no equivale a haber generado y revisado el documento completo.

## 3. Correcciones y consolidación técnica realizadas

### 3.1. Integridad, importación y tratamiento de errores

La revisión técnica priorizó la conservación de datos y la previsibilidad de las operaciones por encima de nuevas funciones. Los cierres de septiembre quedaron incorporados a `v0.5.0`:

| Riesgo tratado | Cómo se abordó | Resultado y evidencia |
|---|---|---|
| AUD-001 y AUD-002: borradores, errores y concurrencia de guardado | Separación entre borrador, confirmación de nota y descarte; regresiones para errores y solicitudes concurrentes | Correcciones integradas en [PR #2](https://github.com/jdfesa/lumapse/pull/2) |
| AUD-003: importación de respaldos no confiables | Lectura ZIP acotada, validación de datos y jerarquía antes de escribir, presentación defensiva y checkpoints Android | [Análisis y validación acumulativa](../gestion/analisis-aud-003-seguridad-importacion-backups-2026-09-01.md), integrado en PR #3 |
| AUD-004: dependencias con avisos de seguridad | Actualización mínima del grafo afectado, controles de sanitización y auditorías completas/productivas | [Cierre del 2 de septiembre](../gestion/analisis-aud-004-seguridad-dependencias-2026-09-02.md), integrado en PR #5 |
| AUD-005: coordinación SQLite y recuperación de arranque | Propiedad transaccional explícita, migraciones estrictas y arranque recuperable | [Evidencia y límites](../gestion/analisis-aud-005-coordinacion-sqlite-2026-09-04.md), integrado en PR #7 |
| AUD-006: resultados asíncronos obsoletos | Control de vigencia de solicitudes en Papelera y cachés académicas | [Regresiones y aceptación](../gestion/analisis-aud-006-ownership-solicitudes-async-2026-09-05.md), integrado en PR #8 |
| AUD-007: contratos de error inconsistentes | Contrato de emisión y propagación de errores, con adaptación de los consumidores y límites de interfaz | [Cierre del 3 de septiembre](../gestion/analisis-aud-007-contratos-errores-store-2026-09-03.md), integrado en PR #6 |

La observación táctil de `Mover a`, transferida desde el Hito 05, también se corrigió: toque normal y acciones de materias y secciones comprobados en Android, incorporados en [PR #9](https://github.com/jdfesa/lumapse/pull/9). Estos cierres no demuestran ausencia de cualquier otro defecto.

### 3.2. Controles reproducibles y operaciones ya confirmadas

El frente F1 resolvió dos problemas del proceso: diferencias entre el gate local y CI, y aceptación insuficiente de ciertas salidas de tests. Se fijaron Node 22.20.0 y npm 10.9.3, un único gate portable y la exigencia de exit 0 junto con un reporte Vitest completo. El binario Rust quedó como diagnóstico opcional, no como sustituto del criterio canónico. La decisión está en [ADR-010](../adr/ADR-010-gate-portable-y-entorno-canonico.md) y la ejecución en el [reporte de F1](../gestion/validacion-f1-gate-portable-2026-09-12.md).

En F2 se trató una diferencia importante entre escritura y refresco: una nota o fecha ya persistida no debía informarse como creación fallida porque su recarga posterior fallara, ni duplicarse al reintentar. Se agregaron regresiones y recuperación de lectura para esos caminos. El [cierre de F2](../gestion/validacion-f2-guardado-y-refresco-2026-09-13.md) no se extendió por deducción a todas las mutaciones; crear materia/sección y editar/eliminar fecha se trataron después en un [alcance separado](../gestion/plan-refrescos-vecinos-2026-09-16.md).

### 3.3. Continuidad, respaldo y despliegue

En octubre se verificó la persistencia del borrador en SQLite y su limpieza atómica con el guardado de la nota. Los recorridos y límites quedaron en el [reporte de continuidad de RNF-010](../beta-core-validation/continuidad-2026-10-04.md) y en [ADR-012](../adr/ADR-012-borrador-sqlite-y-guardado-atomico.md). No se prometió conservar una tecla antes de que su escritura llegara a confirmarse.

La comprobación offline detectó un bloqueo de exportación local ZIP cuando no había red. Se corrigió la condición y se repitieron los cinco casos previstos, con datos conservados, sobre el debug `348da88`. El [reporte de RNF-009](../beta-core-validation/offline-2026-10-06.md) conserva tanto el fallo inicial como el resultado posterior, sin atribuirlo automáticamente a otra APK.

El precorte incluyó un incidente de despliegue con pérdida de datos: una incompatibilidad de firma y el fallback de instalación podían terminar en desinstalación. Se recuperaron los datos con comprobación de integridad y se protegió el instalador mediante validación previa de certificados y actualización ADB sin fallback destructivo. La [causa, recuperación y verificación de PC-11](../gestion/revision-precorte-2026-10-22.md#incidente-de-despliegue-y-recuperación) permanecen registradas; no se reinterpretan como un fallo de SQLite ni se ocultan por el carácter de beta.

## 4. Validación obtenida y límites de la evidencia

Las verificaciones se organizaron por requisito y artefacto. Se combinaron pruebas automatizadas, controles estáticos y recorridos Android; cada método cubre aspectos distintos.

| Área | Qué se realizó | Alcance que se conserva |
|---|---|---|
| Fuente de `v0.5.0` | Gate con 67 archivos y 1065 tests, CI y versiones web/Android alineadas | Resultado del corte de la segunda beta, no del candidato posterior |
| Fuente inicial del candidato `3068455` | Gate con 1211 tests de app y 105 de tooling; auditorías completa/productiva en cero en la consulta del 22 de octubre; coverage de servicios de 96,06 % | Coverage de esa fuente y fecha; no es una nueva medición del binario corregido |
| Fuente corregida `bcefe6a` | Gate con 79 archivos y 1214 tests de app, más 105 de tooling; auditorías sin vulnerabilidades conocidas en esa consulta | Controles de fuente registrados en el [candidato](../gestion/candidato-apk-0.6.0.md#binario-corregido); no equivalen a recorridos nativos exhaustivos |
| Uso y accesibilidad | Profundidad de navegación, objetivos táctiles, tipografía, contraste, nombres accesibles, teclado y Lighthouse | Resultados por debug en la [fuente RNF](../producto/requisitos-no-funcionales.md); teclado parcial y puntuación Lighthouse distinta de una certificación integral |
| Privacidad | Registro de tráfico y revisión de trackers durante recorridos identificados | [Evidencia de RNF-012/013](../gestion/validacion-trafico-trackers-2026-10-07.md); no demuestra ausencia de tráfico en cualquier condición ni verifica por sí sola la versión 0.6.0 RC1 |
| Rendimiento y primera nota | Preparación de conjuntos de datos y delimitación del método; mediciones específicas no completadas | RNF-002, RNF-004 y RNF-005 conservan sus umbrales y estado pendiente; no se deducen tiempos de la importación funcional ni de opiniones |

Las nuevas ejecuciones documentales de CI no se usan para reemplazar las métricas históricas del APK. La [matriz de requisitos no funcionales](../producto/requisitos-no-funcionales.md) es la fuente de sus estados; este balance no los modifica ni declara cerrada toda la validación F3.

## 5. Artefacto de presentación y congelación del desarrollo

El 22 de octubre se preparó la versión 0.6.0 RC1 sin abrir nuevas funcionalidades. Se conservaron la firma de distribución y la identidad del artefacto. La revisión localizada incluyó la etiqueta de Acerca de y el parche autorizado de DOMPurify a 3.4.17; no fue una actualización general del stack.

| Campo | Identidad del artefacto publicado |
|---|---|
| Release | [Lumapse v0.6.0 — RC1](https://github.com/jdfesa/lumapse/releases/tag/v0.6.0), Pre-release |
| Versión/code | `0.6.0/600` |
| Fuente incorporada en la APK | `bcefe6a2ad86ed3abef4f5789a6696143503600e`, sin cambios locales |
| Tag de publicación | `v0.6.0`, sobre `ac2a7473f41e4f3772d80ff8fdcb65a6067988f7` |
| Asset | `lumapse-v0.6.0.apk` |
| SHA-256 | `15f8ede5b78387e3fcac1a53eb3bc78dbb1e30df9acf7f4f20c771c48739e042` |
| Firma y variante | Certificado de distribución existente, firma v2 verificada y APK no-debuggable |
| Registro técnico | [Identidad, controles y actualización](../gestion/candidato-apk-0.6.0.md) |

Se verificaron dos recorridos diferentes en Samsung SM-G965F con Android 10: beta pública `0.5.0` → candidato inicial, y candidato inicial → candidato corregido. Se comprobaron apertura y conservación de los conjuntos registrados, incluido el borrador. No se afirmó haber repetido directamente `0.5.0` → corregido ni cubierto todas las actualizaciones posibles.

Después de esas comprobaciones, se aceptó publicar y congelar la versión 0.6.0 RC1 con cobertura parcial. La [decisión canónica](../../BACKLOG.md#congelación-académica--2026-10-22) dejó diferidos los recorridos restantes de offline, organización/búsqueda, fechas, ZIP y tráfico/trackers sobre la APK exacta. Son cobertura no demostrada, no resultados aprobados.

La congelación evitó que manual, informe y defensa se prepararan sobre un producto que siguiera cambiando. No se exige una versión estable `1.0.0`, no se reemplazan las betas publicadas y no se recompila el APK por cambios documentales posteriores. La posible reanudación técnica después de la presentación requiere otro acuerdo; no es una obligación derivada de este informe.

## 6. Trabajo documental y académico realizado

### 6.1. Manual, capítulos y referencias

El [manual de usuario 0.6.0](../manual-de-usuario-0.6.0/README.md) se incorporó con siete capturas actuales, fuentes editables y una guía HTML interactiva publicada en GitHub Pages. Su función fue explicar el producto congelado y sus límites de guardado, borradores, papelera y respaldo, no acreditar recorridos funcionales que no se hubieran ejecutado.

Los siete capítulos del informe académico se revisaron por unidades y se aprobaron individualmente. El contraste separó alcance implementado, decisiones, evidencia histórica y límites de la versión 0.6.0 RC1. Las referencias se comprobaron con los originales de Gómez y del material de cátedra de Parada; se distinguieron ambas fuentes y se corrigió la correspondencia de citas. El [seguimiento de aprobación](../../TODO.md#revisión-del-informe-capítulo-por-capítulo) conserva los PR de cada unidad, y la [guía del informe](../informe-final/README.md) distingue fuentes vigentes de salidas generadas.

El 17 de noviembre se incorporó el tratamiento explícito de la asistencia de IA y de los recursos y desembolsos personales. Se generó un checkpoint parcial de lectura, posteriormente retirado del árbol vigente al quedar desactualizado; permanece recuperable en el historial. No se lo presenta como el informe académico definitivo.

La [presentación institucional](../informe-final/00-presentacion-institucional.md), aprobada el 22 de noviembre, incorporó la identificación formal del alumno, la institución, la cátedra, la rectora, el responsable de cátedra y la tutora. Su inclusión en el ensamblado definitivo y su maquetación pertenecen a la preparación del documento académico.

### 6.2. Modelos y gráficos de base de datos

La actualización no consistió únicamente en mejorar imágenes. Se contrastaron los niveles conceptual, lógico y físico con la fuente de la versión 0.6.0 RC1 para explicar qué relaciones y restricciones pertenecen a SQLite y cuáles a los servicios de aplicación.

- **Conceptual:** representación Chen en SVG, con la jerarquía materia/sección desplegada por roles y separada de los detalles técnicos de almacenamiento.
- **Lógico:** figura vectorial DOT/SVG con cuatro tablas, 26 columnas y tres referencias; distinción entre cardinalidades, acciones referenciales y reglas de profundidad/unicidad de la aplicación.
- **Físico:** DDL consolidado, inicialización y migraciones descritos según la implementación, incluido el uso de `metadata` para el borrador; no se utilizó el documento como un script para modificar bases.

Las fuentes, criterios de contraste y regeneración están en el [mapa de modelos de base de datos](../diagramas/database/README.md). Las figuras anteriores quedan en el historial, sin coexistir como versiones vigentes contradictorias. El DBML se conserva como proyección estructural parcial: no sustituye el DDL para todas las restricciones. Esta revisión documental no modifica la app ni acredita por sí sola la legibilidad de todas las figuras en el PDF completo.

## 7. Prueba exploratoria voluntaria

### Propósito y procedimiento

Después del corte se preparó una prueba para conocer primeras experiencias y barreras de inicio sin condicionar el APK ni la entrega a recibir una cantidad determinada de respuestas. No fue un estudio representativo ni una campaña técnica de aceptación.

El [instrumento aplicado](../prueba-exploratoria/README.md) tuvo cinco preguntas y recorridos diferentes según el uso declarado: experiencia y dificultades para quienes indicaron uso, y motivos para no empezar para quienes no lo indicaron. La invitación propuso probar la versión 0.6.0 RC1 durante unos diez minutos, crear unas cinco notas, organizar, buscar y explorar el calendario; fue una orientación flexible, no una tarea observada ni una condición verificada de inclusión.

El formulario se publicó el 10 de noviembre y se cerró el 22 de noviembre. Se conservaron públicamente el CSV original y el procedimiento de análisis, separando datos, cálculo e interpretación. La [documentación de procedencia y calidad](../prueba-exploratoria/resultados.md#fuente-y-calidad-de-los-datos) permite revisar las bases y los saltos del formulario.

### Resultados y tratamiento

| Base | Resultado descriptivo | Interpretación permitida |
|---|---|---|
| 22 respuestas | 13 declaran uso y nueve no uso | Dos recorridos de participación; no se acredita identidad única ni versión instalada |
| 13 respuestas con uso | Nueve califican la experiencia como fácil o muy fácil; cuatro como ni fácil ni difícil | Facilidad percibida entre quienes respondieron, no una tasa poblacional de usabilidad |
| 13 respuestas con uso | Diez eligen «Ninguna» como dificultad principal; una organización/búsqueda, una errores o cierres y una otra dificultad | Fricciones declaradas que se conservan sin convertirlas en defectos técnicamente reproducidos |
| Nueve respuestas sin uso | Tres señalan falta de tiempo, tres otro motivo, dos descarga/instalación y una orientación inicial | Barreras para empezar; «Otro motivo» no identifica dispositivo ni permite atribuir uso de iPhone |

Los textos de utilidad percibida aportaron ejemplos de apuntes, organización y búsqueda. No demuestran eficacia pedagógica, adopción sostenida ni mejora respecto del relevamiento de mayo, que tuvo otra finalidad e instrumento.

El [análisis completo y sus límites](../prueba-exploratoria/resultados.md) quedó integrado en el repositorio y luego en la sección 6.4.4 del [capítulo de pruebas y validación](../informe-final/06-pruebas-validacion.md), mediante [PR #61](https://github.com/jdfesa/lumapse/pull/61) y [PR #62](https://github.com/jdfesa/lumapse/pull/62). La encuesta no midió el tiempo de primera nota de RNF-005 ni modificó su estado. Tampoco abrió correcciones de la app durante la congelación.

## 8. Balance, límites y continuidad documental

El resultado principal fue pasar de una beta en evolución a un artefacto de presentación identificado, con correcciones de riesgos prioritarios, evidencia atribuida y documentación revisada. El cierre de desarrollo se apoyó en una decisión explícita sobre la cobertura disponible, no en afirmar que toda prueba pendiente hubiera sido superada.

La experiencia dejó tres aprendizajes de proceso: separar una escritura confirmada de su refresco posterior; proteger los datos también en el despliegue, no sólo dentro de la aplicación; y distinguir fuente, APK, resultado de prueba y documento generado. Esa separación permitió conservar los fallos, correcciones y límites sin reescribir la historia para acomodarla al último corte.

No se reconstruyen horas reales, un factor de ajuste o tiempos de ciclo a partir de commits. La [estimación](../gestion/estimacion-pert.md) y el [seguimiento de velocidad](../gestion/seguimiento-velocidad.md) conservan su método y sus límites; los Story Points no se convierten en horas ni en una medición de productividad individual.

A la fecha de corte, deben distinguirse las siguientes salidas:

| Salida | Estado documentado al 2026-11-22 |
|---|---|
| APK de presentación | Versión 0.6.0 RC1 publicada, identificada y congelada; cobertura parcial aceptada |
| Capítulos, referencias e identificación institucional | Revisados y aprobados; no equivalen por sí solos a la revisión del documento completo |
| Prueba exploratoria | Cerrada, analizada e incorporada al capítulo 6 con bases y límites explícitos |
| Modelos de base de datos | Actualizados documentalmente contra la fuente de la versión 0.6.0 RC1; legibilidad definitiva ligada a la composición de la entrega |
| Informe académico y manual | Preparación editorial y revisión final pendientes según el tablero; no se declaran entregados ni cerrados mediante este balance |
| Matriz RNF de entrega | Consolidación documental pendiente a partir de la fuente canónica y los reportes existentes, sin nuevas mediciones |
| Defensa y línea base académica | Preparación, aceptación y conciliación final pendientes de registro |

Los pendientes académicos se siguen en [TODO](../../TODO.md#criterios-de-salida-de-hito-06), sin duplicar aquí otra lista operativa. Las comprobaciones técnicas diferidas y las funciones excluidas permanecen en [BACKLOG](../../BACKLOG.md#diferido-hasta-después-de-la-defensa); no se reactivan automáticamente. Este informe deja asentado el trabajo ejecutado hasta su corte y puede revisarse independientemente de la maquetación del informe académico. El cierre integral del Hito 06 requiere registrar la aceptación de sus entregables documentales, no volver a desarrollar la app.

## Documentos de control

- [TODO](../../TODO.md): seguimiento operativo y criterios de salida del hito.
- [BACKLOG](../../BACKLOG.md): política de alcance, congelación y deuda diferida.
- [Changelog](../../CHANGELOG.md): evolución por corte y correcciones incorporadas.
- [Líneas base](../gestion/lineas-base.md): separación entre artefactos publicados y línea base documental final.
- [Registro del candidato 0.6.0](../gestion/candidato-apk-0.6.0.md): fuente, firma, hash, comprobaciones y aceptación parcial.
- [Requisitos no funcionales](../producto/requisitos-no-funcionales.md): estados y evidencia por requisito.
- [Informe académico](../informe-final/README.md): fuentes, aprobaciones y estado editorial.
- [Prueba exploratoria](../prueba-exploratoria/README.md): diseño aplicado, publicación, cierre, datos originales y análisis.
