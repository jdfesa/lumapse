# Capítulo 6: Pruebas y Validación

La implementación del capítulo 5 describe los mecanismos presentes en Lumapse; este capítulo analiza qué evidencia permite evaluar su funcionamiento y qué queda sin demostrar. El corte de presentación es **0.6.0/600 — Release Candidate 1 (RC1)**, publicado el 22 de octubre de 2026 y aceptado con validación parcial. Distingo ese binario de las betas anteriores, de los debugs privados y de las ejecuciones sobre código fuente: compartir un número de versión no vuelve equivalentes sus resultados. Incorporo además la encuesta exploratoria cerrada el 22 de noviembre, como evidencia de experiencias y barreras declaradas, no como una nueva comprobación técnica del APK.

## 6.1. Estrategia y criterios de interpretación

Prioricé los riesgos que podían afectar el trabajo académico almacenado: pérdida o duplicación de notas, continuidad del borrador, integridad de importaciones y disponibilidad de los flujos sin conexión. Combiné pruebas automatizadas, controles estáticos y comprobaciones Android, sin tratar ninguna capa como sustituto universal de las demás.

**Tabla 6-1. Niveles de comprobación y límites de interpretación**

| Nivel | Qué permite comprobar | Límite principal |
|---|---|---|
| Pruebas de lógica y componentes | Reglas de servicios, estado, filtros, presentación y manejo de errores en un entorno controlado | El DOM simulado no reproduce el WebView ni la interacción física |
| Integración con SQLite en memoria | Colaboración entre servicios, coordinador, store e interfaz ante escrituras y fallos inducidos | Los límites del plugin nativo se reemplazan por adaptadores de prueba |
| Gate de código y documentación | Construcción, tipos, reglas estáticas, consistencia de versiones, esquema y trazabilidad | Un resultado correcto no mide por sí solo latencia, tráfico o accesibilidad real |
| Comprobaciones en Android | Flujos con SQLite, WebView y selectores nativos en una APK identificada | Cada resultado corresponde a un dispositivo, configuración y conjunto de casos |
| Encuesta exploratoria voluntaria | Facilidad y utilidad percibidas, dificultades de uso y barreras para empezar | Autoinforme de quienes respondieron, sin verificar tareas, dispositivo o versión instalada |
| Evaluación con usuarios nuevos | Tiempo a primera nota y dificultades de uso sin instrucciones previas | No se dispone de esa medición; una revisión técnica no la reemplaza |

Para interpretar cada resultado mantengo unidos requisito, método, fecha, fuente o APK, entorno y alcance. Una prueba ejecutada con resultado satisfactorio es distinta de un control previsto, de una aceptación general y de una métrica no medida. También conservo los fallos que motivaron correcciones: sustituirlos por el último resultado impediría explicar por qué cambiaron decisiones de persistencia o despliegue.

La base documental reúne el registro del candidato del 22 de octubre, el checklist Android y los informes de continuidad, offline, tráfico y accesibilidad que identifico en las secciones siguientes. Los reportes y CSV derivados permiten revisar resultados y conteos; no sustituyen los originales completos. Las bases, capturas e informes crudos de esas comprobaciones técnicas se conservan fuera de la publicación. Sus hashes identifican esas copias, pero no ofrecen por sí solos acceso público ni una reproducción independiente de toda la ejecución. Para la encuesta exploratoria, en cambio, conservé públicamente el CSV original y un recuento reproducible; su tratamiento se desarrolla en la sección 6.4.4.

## 6.2. Pruebas automatizadas e integración técnica

### 6.2.1. Regresiones orientadas a riesgos

La suite de aplicación utiliza Vitest con DOM simulado mediante jsdom e incluye código JavaScript y TypeScript. Sus escenarios abarcan Markdown y sanitización, jerarquía de materias, filtrado y visibilidad de notas, fechas, papelera, borradores, importación ZIP y componentes de interacción. No todos son pruebas unitarias aisladas: algunos comprueban colaboraciones entre varias capas.

En las pruebas de persistencia integradas, SQLite se ejecuta realmente en memoria mediante sql.js, mientras que el adaptador permite controlar los límites asíncronos del plugin. Esto posibilita inducir un fallo en una segunda escritura, demorar una operación o rechazar un refresco, y comprobar después las filas y el estado resultantes. Entre los contratos protegidos están el rollback de operaciones compuestas, la migración del borrador, su limpieza atómica al confirmar una nota y la recuperación de lecturas sin repetir una creación ya persistida. Las pruebas de propiedad de solicitudes verifican además que respuestas obsoletas no sustituyan el estado vigente en los caminos cubiertos.

Este enfoque aporta algo más preciso que una secuencia de mocks exitosos: permite relacionar un fallo concreto con sus efectos sobre datos y presentación. Sin embargo, no reproduce durabilidad física, terminación de procesos, renderizado Android ni todos los fallos posibles del puente nativo. Los mecanismos y sus fronteras se desarrollaron en las secciones 4.5, 5.3 y 5.4.

### 6.2.2. Resultados de los cortes y cobertura

El gate vigente comparte definición local y remota conforme a ADR-010 y a la sección 5.8. Usa Node **22.20.0**, npm **10.9.3** y un worker de Vitest; exige salida cero y un reporte completo y coherente, sin aceptar crashes por un resumen favorable. Node 26 no es un entorno soportado por ese corte y se rechaza al inicio. El auditor Rust es optativo y no sustituye controles. La cobertura y las auditorías de dependencias se ejecutan por separado, no como resultados implícitos de cada `npm run verify`.

**Tabla 6-2. Ejecuciones automatizadas registradas por corte**

| Referencia | Fecha del registro | Resultado registrado |
|---|---|---|
| Segunda beta `v0.5.0` | 5 de septiembre de 2026 | Gate aprobado: 67 archivos y 1065 pruebas de aplicación; CI del corte aprobado |
| Candidato inicial `3068455`, `0.6.0/600` | 22 de octubre de 2026 | Gate aprobado: 79 archivos, 1211 pruebas de aplicación y 105 de herramientas |
| Candidato corregido `bcefe6a`, `0.6.0/600` | 22 de octubre de 2026 | Gate final aprobado: 79 archivos, 1214 pruebas de aplicación y 105 de herramientas |

Los conteos describen esas ejecuciones; no se suman entre sí ni expresan un porcentaje de requisitos cumplidos. El gate final del candidato conservó tres advertencias previas de lint y cero errores. Sus controles de construcción, tipos, versión y documentación pasaron, sin que eso equivalga a recorrer toda la aplicación instalada.

Para **RNF-024**, la medición del candidato inicial ejecutó `npm run test:coverage -- --maxWorkers=1 --allowOnly=false`. Registró **96,06 % de statements en servicios: 2095 de 2181, distribuidos en 42 archivos**, incluidos JavaScript, TypeScript y subdirectorios. Superó el mínimo del 70 %. La base anterior del 21 de agosto había registrado 92,43 % sobre otro conjunto de servicios; no interpreto la diferencia como una mejora causada por incrementar la versión.

El porcentaje de 96,06 % pertenece a la fuente `3068455`, no a una nueva ejecución del ajuste posterior. Aunque ese ajuste no modificó el código de servicios, cambió el candidato y no se repitió la cobertura. Tampoco es cobertura de toda la interfaz: la configuración excluye componentes, layout y otros ámbitos, no fija umbrales bloqueantes y medir statements ejecutados no demuestra la calidad de todas las aserciones ni la ausencia de errores.

### 6.2.3. Alcance de los controles de integración

Los controles de esquema, DBML y jerarquía contrastan aspectos de la implementación con sus representaciones documentales. Son complementarios: comparar tablas, columnas y tipos no verifica por completo índices, restricciones `CHECK` o acciones referenciales. El smoke Python ejecuta el DDL extraído en una base temporal y comprueba relaciones seleccionadas, pero sus aserciones explícitas se concentran en `subjects`, `notes` y `metadata`, no en toda la tabla de fechas académicas. No lo presento como una prueba exhaustiva de migraciones o integridad nativa.

Las pruebas JUnit conservadas en Android comprueban el nombre del paquete `com.lumapse.app` y el contexto de la aplicación. No forman parte del gate npm ni constituyen una suite de interfaz de extremo a extremo. Construir correctamente el proyecto Android y comprobar su identidad tampoco acredita automáticamente los recorridos del usuario.

## 6.3. Evidencia Android, continuidad y actualización

### 6.3.1. Antecedentes y funcionamiento offline

La primera beta `v0.4.8` tiene una ejecución manual del 1 de julio de 2026 en Samsung Galaxy S20 FE, Android 13: instalación, apertura offline, notas, organización, búsqueda, fechas, papelera, tema y revisión inicial de presentación. Su valoración de rendimiento fue perceptiva y con pocas notas, no una medición temporal. Para `v0.5.0` distingo la validación incremental con firma debug en Samsung SM-G965F de la aceptación posterior del asset firmado publicado: el 2 de octubre quedó registrada su prueba y aceptación general en **al menos tres dispositivos**. No se conocen los modelos ni resultados granulares de ese conjunto, por lo que no completo casos o métricas por inferencia ni mantengo aquella aceptación como pendiente.

La evidencia offline posterior es más específica. El registro del **6 de octubre**, sobre Samsung **SM-G965F, Android 10**, identifica el debug privado `0.5.0/500` de fuente **`348da88`**, con modo avión, Wi-Fi y datos apagados y sin red activa. Las acciones usaron controles del WebView con SQLite y puente reales, y los selectores Android se operaron mediante ADB; no fue una sesión con participantes nuevos.

**Tabla 6-3. Casos offline ejecutados en el debug `348da88`**

| Caso | Comprobación | Resultado |
|---|---|---|
| OFF-01 | Abrir, crear, editar y volver a la nota | PASS; contenido e identidad comprobados |
| OFF-02 | Buscar, mover, fijar y archivar | PASS; destino y datos conservados |
| OFF-03 | Papelera, restauración y borrado de una auxiliar | PASS; sin vaciar la papelera previa |
| OFF-04 | Crear, modificar, consultar y eliminar una fecha auxiliar | PASS; las fechas anteriores se conservaron |
| OFF-05 | Generar ZIP local, importar y repetir la importación | PASS; auxiliar recuperada y segunda importación sin duplicados |

La ejecución inicial de OFF-05 había fallado porque la exportación local se deshabilitaba sin internet. La corrección separó generación local y disponibilidad de destinos externos; sólo después se repitió el flujo completo. La comparación final conservó las notas originales, materias y fechas, con integridad SQLite correcta. Esto sustenta **RNF-009 en ese alcance**, no garantiza todo destino externo ni transfiere el resultado al asset de `v0.5.0` o a la versión 0.6.0 RC1.

### 6.3.2. Continuidad del borrador

La validación de **RNF-010** mostró por qué una comprobación visible de almacenamiento no basta. En los debugs previos se perdió una modificación reciente al terminar el proceso antes de 500 ms y reapareció el borrador después de ciertas limpiezas. Quitar el debounce hizo inmediata la captura, pero una repetición nativa todavía perdió el último cambio aunque la interfaz y `localStorage` lo mostraran antes de terminar el proceso.

Tras adoptar SQLite y la confirmación atómica de nota y limpieza, el registro del **5 de octubre** identifica el debug limpio **`dbc8940`**, Samsung SM-G965F/Android 10. Pasaron **12 casos** de creación y edición: cambiar de app, bloquear, terminar y reabrir, descartar, y guardar o actualizar. La migración desde el almacenamiento anterior recuperó el borrador sin convertirlo automáticamente en nota. En una repetición con entrada nativa, el timestamp inmediatamente anterior al SIGKILL se registró a **285 ms** de la entrada y el texto se recuperó al reabrir.

Ese intervalo delimita la prueba de interrupción, no una medición de latencia CRUD. La terminación deliberada del proceso tampoco equivale a un apagado físico ni a todos los mecanismos de cierre de Android. El resultado aceptado cubre los casos y el artefacto registrados; **no garantiza conservar la última tecla si el proceso muere antes del commit**. La distinción entre borrador y nota confirmada permanece como se explicó en la sección 5.4.2.

### 6.3.3. Identidad y alcance de las pruebas de la versión 0.6.0 RC1

El binario publicado es `lumapse-v0.6.0.apk`, versión **0.6.0**, código **600**, canal **`android-candidate`**, generado desde fuente limpia **`bcefe6a`**. La etiqueta `v0.6.0` apunta a **`ac2a747`**, que incluye la integración posterior; no es el commit incorporado en la APK. Su identificación registrada incluye:

**SHA-256 de la APK publicada:**

```text
15f8ede5b78387e3fcac1a53eb3bc78dbb1e30df9acf7f4f20c771c48739e042
```

**SHA-256 del certificado de distribución:**

```text
91d719826e632e10f331913c3835c51e38cf780eb139940eb3b0bf1ed6a157cd
```

Se registraron verificación de firma v2, manifest no depurable, alineación y correspondencia de assets web y metadata con la construcción. Son controles de identidad y empaquetado, no pruebas funcionales de todas las pantallas.

**Tabla 6-4. Actualizaciones firmadas comprobadas el 22 de octubre de 2026**

| Recorrido en Samsung SM-G965F/Android 10 | Resultado y alcance |
|---|---|
| APK pública `0.5.0` → candidato inicial `3068455` | Actualización y apertura PASS; cinco notas, dos materias/secciones y una fecha conservadas; borrador completo migrado de localStorage a SQLite y recuperado visiblemente; tema claro conservado |
| Candidato inicial → candidato corregido `bcefe6a` | Actualización y apertura PASS; todas las filas de las cuatro tablas, incluido el borrador, idénticas; etiqueta «Android · candidato» comprobada en Acerca de |

Desde la referencia pública no hubo desinstalación, limpieza, importación ni restauración. Se comprobaron los hashes de las APK instaladas y se compararon filas completas, no sólo cantidades, en copias verificadas de lectura: integridad correcta y claves foráneas sin violaciones. **Son dos recorridos diferentes**; no constituyen una repetición directa de `0.5.0` al candidato corregido ni una garantía para cualquier tamaño de base o dispositivo.

La seguridad de ese procedimiento también tiene un antecedente adverso. Durante el precorte, un despliegue debug con firma distinta provocó una desinstalación implícita del intermediario `native-run` y pérdida del estado de prueba. El incidente se conservó como fallo operativo: se recuperaron tablas, borrador y preferencias, comprobados por hash o valor frente a la referencia previa, y se protegió el instalador conforme a ADR-013. La actualización debug compatible posterior conservó los datos. No atribuyo el borrado a SQLite ni presento la recuperación como si el incidente no hubiera ocurrido; tampoco confundo esa prueba debug con las actualizaciones firmadas de la tabla 6-4.

## 6.4. Rendimiento, usabilidad y accesibilidad

### 6.4.1. Métricas medidas y métricas pendientes

El tamaño del bundle y la construcción correcta aportan evidencia de **RNF-003** y **RNF-025** en los cortes registrados, pero no miden respuesta interactiva. **RNF-002 conserva el límite de 200 ms por operación** y **RNF-004 exige al menos 55 FPS durante el desplazamiento con 500 notas**. Ambos permanecen pendientes y diferidos hasta después de la presentación, sin reducir umbrales.

Los perfiles sintéticos de 50 y 500 notas permitieron preparar datos y comprobar importación y funcionamiento. Los pilotos de trazas no establecieron una atribución suficiente entre entrada, contenido correcto y primera presentación física Android; los datos de SurfaceFlinger y gfxinfo tampoco aportaron frames atribuibles a la superficie de Lumapse. Esta limitación del método no demuestra un defecto de rendimiento ni un cumplimiento. El experimento Python con 5000 notas compara estrategias aisladas sobre SQLite en memoria y con durabilidad desactivada: no mide el tiempo del flujo completo, CPU o renderizado del APK.

**RNF-005**, primera nota de un usuario nuevo en **10 segundos o menos**, continúa sin medición con participantes. El acceso técnico al editor, una valoración durante el desarrollo o una encuesta voluntaria no verifican ese tiempo. La encuesta posterior al corte, presentada en la sección 6.4.4, aporta percepciones de experiencia inicial, pero no mide ese umbral ni acredita adopción. La encuesta de hábitos del capítulo 3 fundamenta decisiones de producto, no es una prueba de uso de la aplicación instalada.

### 6.4.2. Revisiones de interacción y presentación

Las comprobaciones Android de octubre cubrieron dimensiones distintas. La tabla siguiente identifica el origen de los debugs privados, todos sobre Samsung SM-G965F/Android 10; **no son resultados de la versión 0.6.0 RC1 firmada**.

**Tabla 6-5. Evidencia acotada de usabilidad y accesibilidad**

| RNF y fecha de 2026 | Fuente del debug | Método y resultado registrado |
|---|---|---|
| RNF-006, 7 de octubre | `348da88` | Profundidad de entrada: editor visible sin taps adicionales; buscar y organizar accesibles en dos taps |
| RNF-008, 8 de octubre | `9056ab2` | Límites renderizados de controles principales y opciones de materia: al menos 44×44 CSS px |
| RNF-007, 9 de octubre | `f2beef7` | Tamaños computados y revisión visual de lectura/edición: mínimo 16 CSS px en el alcance medido |
| RNF-021, 12 de octubre | `803947e` | Contraste compuesto: 208 muestras de fixtures y 174 de recorridos, ambos temas por encima de 4,5:1 |
| RNF-022, 13 de octubre | `b7c3d31` | Árbol de accesibilidad y revisión de propósito: 2188 observaciones en 24 escenas, sin nombres vacíos o de símbolo solo |
| RNF-020, 19 de octubre | `538c906` | Navegación con entrada ADB/CDP: 16 casos PASS; evidencia parcial, sin teclado físico ni mutaciones completas |

El alcance importa tanto como el valor. RNF-006 mide llegar a una función, no completar todas sus operaciones. Los 44×44 CSS px corresponden a controles principales, no a cada botón de la app. Los 16 CSS px son del texto de lectura y edición, no de toda etiqueta o metadato; el componente preview se midió aisladamente, sin atribuirle una vista activa inexistente.

En contraste se compusieron fondos, alfa y opacidades antes de comparar; algunos estados hover se reprodujeron mediante reglas CSS en fixtures, no con un puntero físico. Las 2188 muestras accesibles son observaciones repetidas, no controles únicos ni interacciones. Los eventos de teclado inyectados permiten estudiar foco, cancelación y retorno, pero no certifican hardware USB/Bluetooth. Tomé **WCAG 2.2** como referencia para interpretar contraste, alternativas y operabilidad, sin declarar conformidad global a partir de estas comprobaciones parciales (World Wide Web Consortium [W3C], 2024).

### 6.4.3. Lighthouse y tratamiento de sus hallazgos

Para **RNF-019**, la medición del **20 de octubre** utilizó Lighthouse **13.5.0** sobre el WebView real del debug **`92deffd`**, no una réplica de escritorio. Los snapshots conservaron la pantalla y el almacenamiento, sin recarga ni emulación de viewport o agente de usuario. Se obtuvieron **40 informes válidos: 20 escenas por tema, 34 puntuaciones de 100/100 y seis de 96/100**. Cada escena superó el umbral de 90; no se promediaron resultados para ocultar un caso inferior.

El resultado no significa cero hallazgos. Los informes registraron **seis auditorías ponderadas fallidas**, de contraste o tamaño disponible de objetivos, además de revisión incompleta y entradas manuales no ejecutadas por el instrumento. Los 3040 registros derivados son entradas de auditoría, no 3040 pruebas humanas; 400 corresponden a comprobaciones manuales. Incluso una puntuación de 100 había coexistido en la referencia anterior con una etiqueta fallida de peso cero. El score y el inventario de problemas deben leerse por separado.

Los informes definitivos se conservaron aunque el runner terminó con error en la limpieza posterior a recolectarlos; la restauración del estado se completó y comprobó por separado. No considero exitosa toda la ejecución por haber obtenido scores favorables.

La revisión del **22 de octubre** reprodujo un defecto adicional: el hover de «Agregar fecha» podía quedar visible con bajo contraste tras cerrar el diálogo con Escape. Se corrigió y midió en el debug **`e0700f6`**: 8,82:1 en oscuro y 6,29:1 en claro en ese estado. Sus seis snapshots nuevos de 100/100 no reemplazan las cuarenta escenas anteriores ni verifican la versión 0.6.0 RC1. Otros límites de superposición, semántica ARIA y cobertura quedaron clasificados y aceptados para el corte: por ejemplo, los botones de opciones de tarjeta seguían midiendo 28×28 CSS px. No se convirtieron en cumplimiento general de RNF-008, teclado completo, control por voz, TalkBack o WCAG exhaustiva.

### 6.4.4. Prueba exploratoria voluntaria posterior al corte

**Diseño y tratamiento de las respuestas**

Después de publicar la versión 0.6.0 RC1, propuse una prueba voluntaria para conocer primeras experiencias y barreras de inicio. La encuesta estuvo abierta del **10 al 22 de noviembre de 2026** y reunió **22 respuestas**, cuyos envíos se registraron entre el 10 y el 20 de noviembre, con offset explícito GMT-3. La convocatoria se dirigió a estudiantes dispuestos a colaborar, sin selección aleatoria ni una meta de tamaño para inferencia poblacional. A diferencia del relevamiento de hábitos y necesidades del capítulo 3, este instrumento consultó la experiencia posterior a la invitación a probar Lumapse; sus resultados no constituyen una comparación antes/después.

La invitación indicaba descargar la versión 0.6.0 RC1 mediante una APK fuera de Google Play. Sugerí dedicar unos diez minutos a crear unas cinco notas, organizarlas por materia, buscar y explorar el calendario. El recorrido era flexible y admitía uso parcial; no fue una ejecución observada ni un requisito de participación. Ofrecí recursos opcionales de apoyo, por lo que tampoco corresponde describir la experiencia como una prueba sin instrucciones previas. No se registraron por respuesta el dispositivo, la versión instalada ni el cumplimiento efectivo de las tareas.

El formulario tenía cinco preguntas distribuidas en cuatro secciones. La primera distinguía no instalar, instalar sin usar, uso parcial y recorrido sugerido completo. Las dos últimas opciones conducían a facilidad percibida, utilidad en texto breve y dificultad principal de uso; las dos primeras, al motivo principal para no empezar. Todas las preguntas mostradas eran obligatorias. Las opciones «Otra dificultad» y «Otro motivo» eran cerradas, sin ampliación escrita.

Conservé las 22 filas sin exclusiones ni imputación de blancos: **13 declararon uso y nueve no lo declararon**. Las preguntas de facilidad, utilidad y dificultad usan base 13; los motivos para no empezar, base nueve. Los blancos del otro recorrido son saltos previstos, no valoraciones negativas. El recuento del CSV original coincide con la salida reproducible y las filas respetan la ramificación. No hay filas exactamente duplicadas, incluida la marca temporal, pero no se recopilaron nombres o correos ni se limitó el envío a una respuesta por cuenta: **22 respuestas no demuestran 22 personas distintas**. La conservación de marcas temporales y textos libres tampoco permite garantizar anonimato absoluto.

**Participación y facilidad percibida**

**Tabla 6-6. Etapa de participación declarada — base: 22 respuestas**

| Etapa | n | % |
|---|---:|---:|
| No llegó a instalarla | 7 | 31,8 |
| Instaló, pero no llegó a usarla | 2 | 9,1 |
| Usó sólo una parte del recorrido sugerido | 6 | 27,3 |
| Usó y realizó el recorrido sugerido | 7 | 31,8 |
| **Total** | **22** | **100,0** |

El uso declarado reúne 13 respuestas (59,1 %); la ausencia de uso, nueve (40,9 %). Las siete que declaran el recorrido completo no acreditan una comprobación independiente de cada función. Tampoco corresponde describir las nueve sin uso como fallos de instalación, pues dos declaran haber instalado la app. No se conoce el total de invitaciones, descargas o visitas al formulario, por lo que estos porcentajes no son tasas de respuesta, conversión o abandono.

**Tabla 6-7. Facilidad de uso percibida — base: 13 respuestas con uso declarado**

| Valoración | n | % |
|---|---:|---:|
| Muy fácil | 4 | 30,8 |
| Fácil | 5 | 38,5 |
| Ni fácil ni difícil | 4 | 30,8 |
| Difícil | 0 | 0,0 |
| Muy difícil | 0 | 0,0 |
| **Total** | **13** | **100,0** |

Nueve respuestas (69,2 %) califican el uso como fácil o muy fácil; las cuatro neutrales no se agregan a ese grupo ni se interpretan como rechazo. La señal favorable se limita a quienes declararon uso y respondieron, no a quienes no empezaron ni a la población estudiantil. Los porcentajes de las tablas se calculan sobre la base indicada y se redondean a un decimal; sus sumas pueden diferir de 100 % por redondeo. Por el tamaño reducido de las bases, priorizo los recuentos absolutos.

**Utilidad percibida y dificultades de uso**

Los trece textos breves de utilidad aportan ejemplos de captura, organización, búsqueda, fijado y edición de apuntes. También aparecen menciones de archivo de notas, fuente y tamaño, actividades académicas y apreciaciones generales favorables. Esta lectura es descriptiva, sin clasificador de sentimiento ni categorías excluyentes de satisfacción. La respuesta «Nuevo a conocer» no permite determinar un beneficio o una valoración; tampoco la ausencia de la frase «No me resultó útil» convierte todos los textos en evidencia inequívoca de utilidad.

Las expresiones sobre rapidez son percepciones, no mediciones de latencia. La mención de «archivos» no demuestra adjuntos, ni la de recordatorios para parciales acredita el uso del calendario o notificaciones automáticas. Así, los comentarios permiten reconocer usos que resultaron significativos para algunas respuestas, sin atribuir funciones o beneficios educativos que el instrumento no comprobó.

En la pregunta sobre dificultad principal, diez respuestas eligieron «Ninguna» (76,9 %). Las otras tres (23,1 %) se distribuyeron entre organizar o encontrar notas, errores o cierres de la app y otra dificultad, con una respuesta en cada opción (7,7 %). No hubo selecciones de crear o guardar notas ni de calendario o fechas. Son **fricciones autoinformadas**, no tres defectos reproducidos: no se solicitaron acción exacta, mensaje, frecuencia ni condiciones del problema. «Ninguna» y los ceros tampoco prueban ausencia de fallos o que todas las funciones se hayan recorrido.

La respuesta que señaló errores o cierres calificó el uso como neutral y expresó una opinión favorable sobre la idea. Esa coexistencia muestra por qué una valoración positiva no debe utilizarse para descartar la dificultad declarada. La señal se conserva sin asignarle causa técnica, severidad o dispositivo.

**Barreras para empezar**

**Tabla 6-8. Motivo principal para no empezar — base: nueve respuestas sin uso declarado**

| Motivo | n | % |
|---|---:|---:|
| Falta de tiempo | 3 | 33,3 |
| Dudas sobre seguridad o procedencia de la APK | 0 | 0,0 |
| Dificultades con descarga o instalación | 2 | 22,2 |
| Falta de orientación para empezar | 1 | 11,1 |
| Falta de interés en continuar | 0 | 0,0 |
| Otro motivo | 3 | 33,3 |
| **Total** | **9** | **100,0** |

La falta de tiempo aparece tanto entre quienes no instalaron como entre quienes instalaron sin usar. Las dos menciones a descarga o instalación pertenecen al primer grupo, pero no permiten distinguir incompatibilidad, descarga, configuración u otra causa. De las tres respuestas «Otro motivo», dos declaran no haber instalado y una, instalación sin uso. El instrumento no consulta sistema operativo ni permite ampliar ese motivo: no se recodifican como iPhone, incompatibilidad, desinterés o problemas de instalación. El cero en seguridad o interés tampoco demuestra confianza general o ausencia de desinterés, porque se pidió un único motivo principal a quienes respondieron.

**Aporte y límites de la prueba**

La encuesta complementa la evidencia técnica con una señal favorable de facilidad percibida, ejemplos de utilidad para apuntes y organización, tres dificultades principales de uso y barreras para iniciar la experiencia. La participación voluntaria y la selección de quienes llegaron a usar la app restringen esa interpretación: no calculo márgenes de error, intervalos de confianza ni significación estadística, ni generalizo los porcentajes al instituto. El formulario tampoco verifica condición de estudiante, identidad o experiencia previa de cada respuesta.

No se midieron tiempo a primera nota, retención, uso sostenido o eficacia educativa. La versión 0.6.0 RC1 fue la invitada, no una identidad binaria comprobada en cada envío. Por ello, estas opiniones no sustituyen las pruebas del APK, la evaluación de accesibilidad ni las métricas CRUD/FPS, y **RNF-005 mantiene su estado pendiente y umbral de 10 segundos o menos**. Las dificultades se conservan como señales para un seguimiento posterior que requerirá acuerdo específico; no reabren el desarrollo ni las comprobaciones diferidas durante la congelación.

## 6.5. Seguridad, privacidad y alcance de las auditorías

La evidencia de **RNF-012 y RNF-013** corresponde al **7 de octubre**, debug **`348da88`**, Samsung SM-G965F/Android 10. Se combinaron revisión estática de integraciones y captura runtime durante arranque, navegación, calendario, Acerca de y apertura de una exportación explícita. El selector se canceló sin elegir destino: no se comprobó la conservación del archivo por una aplicación externa.

Durante una ventana de **240 segundos**, los contadores de recepción y transmisión del UID de Lumapse no variaron: **cero bytes nuevos atribuibles a la app** en esos flujos. La captura global sí contenía tráfico ajeno; no se atribuyó a Lumapse por aparecer en el mismo dispositivo. La revisión estática no encontró una integración declarada de tracking, analytics o cookies de terceros. Son resultados de esa corrida, no una garantía universal ni una captura del APK final. Un escaneo de referencias externas tampoco detecta necesariamente toda comunicación dinámica.

Las auditorías completa y productiva de dependencias del **22 de octubre** finalizaron con cero vulnerabilidades conocidas después de los parches autorizados, incluido DOMPurify **3.4.17** en el candidato corregido. Esa cifra representa la consulta y el grafo examinados en esa fecha, no ausencia permanente de vulnerabilidades. Los avisos del tooling de desarrollo y una vulnerabilidad explotable en el APK son riesgos que deben distinguirse, aunque ambos requieran tratamiento en su ámbito.

Las regresiones de sanitización, escape contextual y validación de ZIP aportan defensas comprobables frente a entradas seleccionadas, como se explicó en las secciones 5.4.3 y 5.5. No constituyen una prueba de penetración completa ni una certificación de ausencia de XSS. Tampoco la firma de distribución certifica privacidad: identifica al firmante y permite comprobar compatibilidad, mientras que el tráfico requiere su propia observación.

## 6.6. Síntesis del estado y límites de la entrega

La clasificación de los **26 requisitos no funcionales** mantiene los estados y artefactos de sus registros, sin elevar una aceptación general a prueba exhaustiva de la versión 0.6.0 RC1.

**Tabla 6-9. Síntesis documental de estados RNF**

| Estado registrado | Cantidad | Identificadores |
|---|---:|---|
| Verificado en el alcance documentado | 16 | RNF-003; RNF-006 a RNF-010; RNF-012 y RNF-013; RNF-018 y RNF-019; RNF-021 a RNF-026 |
| Evidencia parcial | 1 | RNF-020 |
| Pendiente | 3 | RNF-002, RNF-004 y RNF-005 |
| Obsoleto por el pivote | 3 | RNF-001, RNF-011 y RNF-017 |
| No aplica al APK | 3 | RNF-014, RNF-015 y RNF-016 |

Entre los verificados, RNF-018 conserva la inspección del Markdown legible dentro del backup, sin habilitar compartir notas individuales. RNF-023 se apoya en la separación modular descrita en el capítulo 4. RNF-026 tiene un inventario de decisiones contrastado en el precorte, complementado por ADR-013; algunos ADR formalizan retrospectivamente una solución y no prueban que el registro precediera a implementarla. Los requisitos obsoletos corresponden a criterios de carga web, Service Worker e instalación PWA reemplazados; los no aplicables se refieren a hosting HTTPS, headers y paridad multinavegador, no al canal APK vigente.

La tabla no expresa «16 de 26 pruebas de la versión 0.6.0 RC1 aprobadas»: combina requisitos, métodos y checkpoints diferentes. No calculo con ella un índice global de calidad. El tamaño del bundle, la cobertura de servicios, una revisión documental y un recorrido nativo miden propiedades distintas y no compensan entre sí la falta de evidencia.

La versión **0.6.0 RC1 fue aceptada y publicada con validación parcial**. Están documentados sus controles de fuente e identidad, apertura y actualizaciones con el conjunto pequeño descrito. Los recorridos restantes de núcleo offline, organización/búsqueda, fechas y ZIP, así como tráfico y trackers sobre el binario exacto, quedaron **diferidos, no aprobados**. La actualización directa de `0.5.0` al corregido tampoco se repitió. La decisión del 22 de octubre congeló desarrollo y nuevas comprobaciones de app hasta después de la presentación, sin convertir esas ausencias en defectos confirmados ni en resultados positivos.

La encuesta de noviembre añade experiencia declarada sin modificar esa clasificación: nueve de las trece respuestas con uso califican la app como fácil o muy fácil, mientras que las dificultades de uso y las barreras para empezar permanecen visibles. Ese aporte no acredita adopción ni convierte las opiniones en pruebas de la versión 0.6.0 RC1 exacta.

El alcance defendible de la entrega es, por tanto, un prototipo Android identificable, con controles automatizados, evidencia nativa relevante y primeras percepciones voluntarias de uso, pero no una versión estable certificada ni una validación exhaustiva de seguridad, accesibilidad, rendimiento o uso sostenido. Esta delimitación permite fundamentar las conclusiones y el trabajo futuro del capítulo 7 con resultados obtenidos, en lugar de promesas de comprobación.
