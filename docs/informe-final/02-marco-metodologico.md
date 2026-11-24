# Capítulo 2: Marco Metodológico y Modelo de Negocio

En este capítulo explico cómo organicé el desarrollo y cómo relacioné las necesidades iniciales con las decisiones de producto y los requisitos. Distingo la gestión del trabajo, el análisis de usuarios y las hipótesis de valor: cumplen funciones complementarias, pero no constituyen una única metodología ni producen el mismo tipo de evidencia.

## 2.1. Enfoque de Desarrollo y Gestión del Flujo (Kanban Adaptado)

Desarrollé Lumapse de forma iterativa e incremental: construí funcionalidades acotadas, revisé su comportamiento y ajusté prioridades y decisiones a medida que avanzaba el proyecto. Para gestionar ese trabajo adopté un sistema basado en Kanban, adaptado a un desarrollo individual y formalizado en ADR-003. El enfoque incremental describe la evolución del producto; Kanban organiza el flujo de las unidades de trabajo.

Los hitos funcionaron como puntos académicos de revisión, entrega y establecimiento de líneas base, no como Sprints. El cronograma inicial y las fechas de cierre registran planificación y evolución del proyecto, sin convertir los hitos en iteraciones de duración fija.

Complementé la gestión con artefactos de Design Thinking para organizar la comprensión del contexto, la definición del problema y las alternativas de solución. Como marco para interpretar esas actividades, Doorley et al. (2018) distinguen empatizar, definir, idear, prototipar y probar, sin imponer un recorrido lineal. En Lumapse, las personas y la encuesta ayudaron a formular y contrastar necesidades; el planteo del problema, el análisis competitivo y el Lean Canvas permitieron delimitar la propuesta. El prototipo evolucionó hacia las betas y la versión 0.6.0 RC1; esa evolución técnica no demuestra que se haya completado una validación sistemática de uso con el público objetivo.

### 2.1.1. Justificación frente a Scrum y RUP

La elección no se basó en una prohibición numérica de Scrum para proyectos individuales. Schwaber y Sutherland (2020) describen equipos de diez personas o menos como situación típica, sin fijar un mínimo explícito. Sin embargo, Scrum define responsabilidades, Sprints, eventos, artefactos y compromisos que deben reconocerse en su aplicación. No organicé Lumapse mediante ese conjunto: utilizar historias de usuario o estimaciones relativas no basta para afirmar que apliqué Scrum.

Tampoco seguí Rational Unified Process —RUP—, que organiza el ciclo de desarrollo en Inicio, Elaboración, Construcción y Transición, con disciplinas y artefactos adaptables (IBM, s. f.). Produje requisitos, casos de uso y modelos de arquitectura por su utilidad técnica y académica, pero no estructuré la gestión según esas fases. La presencia de diagramas UML no identifica por sí sola el proceso utilizado.

Coleman y Vacanti (2025) presentan Kanban como una estrategia de optimización del flujo de valor que combina definición y visualización del flujo, gestión activa de los elementos y mejora del sistema. Esa orientación resultó compatible con reordenar prioridades y terminar unidades pequeñas sin simular responsabilidades o ceremonias de un equipo inexistente. Es una elección contextual, no una afirmación de superioridad general.

### 2.1.2. Sistema de trabajo aplicado

La definición de flujo formalizada en Hito 06 establece cuatro estados:

> Backlog → En Curso → En Revisión → Hecho

Un elemento representa un objetivo concreto con salida verificable, dependencias y criterio de cierre. Comienza cuando pasa a En Curso y termina cuando satisface ese criterio; permanecer En Revisión significa que todavía consume capacidad. Una funcionalidad redactada o implementada no se considera terminada sólo por existir un commit.

El límite global de trabajo en curso —WIP— es de dos elementos entre En Curso y En Revisión, con una política más restrictiva de una sola rama de tarea activa. Seleccioné trabajo mediante un sistema de arrastre o *pull*, priorizando cerrar lo iniciado. Un bloqueo conserva su condición de trabajo en curso, sin liberar capacidad artificialmente.

La prioridad atiende riesgos de pérdida de datos, bloqueos de entrega, evidencia necesaria, dependencias y valor funcional. La definición asigna a GitHub Projects la vista del flujo; los tableros, ADR, informes de hito y el historial Git conservan evidencia complementaria. Un commit o PR permite rastrear cambios, pero no sustituye aceptación ni acredita pruebas por sí solo.

### 2.1.3. Medición y límite de la evidencia

Para la estimación y el seguimiento utilicé como apoyo la obra de Gómez (2014) y la guía didáctica de Parada (2026), elaborada por el Ing. Mauricio Parada, profesor responsable de la cátedra Prácticas Profesionalizantes III. Distingo la obra publicada de ese material de enseñanza, que relaciona la bibliografía con las actividades del proyecto.

Estimé las historias mediante tamaño relativo en Story Points —SP—, utilizando juicio individual y una escala de Fibonacci. Tomé HU-001, crear una nota rápida, como referencia de 2 SP. En comparación, asigné 8 SP a HU-017, organización por materias y secciones, porque reúne jerarquía, validaciones, asociación de notas y filtrado. Los puntos expresan complejidad relativa, no horas de trabajo ni una proporción comprobada entre las duraciones de desarrollo.

Para los riesgos de integración de Capacitor y migración a SQLite documenté escenarios optimista —O—, más probable —M— y pesimista —P—. Para combinarlos utilicé la ponderación PERT, que da mayor peso al escenario más probable: `E = (O + 4 × M + P) / 6`. En Capacitor, los escenarios de 3, 7 y 14 días producen una estimación de 7,5 días; en SQLite, los de 2, 5 y 10 producen aproximadamente 5,33 días. El cronograma registra 8 y 6 días tras redondear cada módulo hacia arriba: los 14 días resultantes son planificación, no duración real observada. La sección 7.2.2 retoma las limitaciones de este registro al evaluar lo aprendido.

El seguimiento por hitos registra Story Points asociados al alcance entregado e incorpora reclasificaciones de historias. Por esas modificaciones, no lo presento como una comparación inalterada entre el plan inicial y lo entregado. Tampoco equiparo los puntos con el *throughput* de Kanban, que cuenta elementos terminados, ni con el tiempo de ciclo. Los escenarios de estimación no son intervalos empíricos de cumplimiento.

La guía de Kanban identifica cuatro métricas mínimas: WIP, cantidad de elementos terminados por unidad de tiempo, edad de los elementos aún activos y tiempo de ciclo de los finalizados (Coleman y Vacanti, 2025). No dispongo de fechas completas y confiables para calcularlas retrospectivamente sobre todo el proyecto. La formalización de su registro en Hito 06 no demuestra que se hayan medido durante las etapas anteriores.

La definición de flujo incorpora una expectativa de nivel de servicio provisional: 85 % de los elementos en siete días calendario o menos, a recalibrar con al menos cinco elementos con fechas confiables. No es cumplimiento observado. Por estas limitaciones, describo el proceso como basado en Kanban y adaptado al contexto individual, sin afirmar conformidad histórica completa.

### 2.1.4. Asistencia de inteligencia artificial

Me apoyé en herramientas de inteligencia artificial durante el desarrollo incremental: inicialmente utilicé Antigravity y posteriormente modelos de OpenAI. Esa asistencia acompañó el trabajo sobre funcionalidades, correcciones y scripts de automatización; no constituye una metodología independiente ni una garantía de corrección. La definición del problema, el alcance y las decisiones aceptadas permanecen bajo mi responsabilidad. No considero validada una propuesta por provenir de un modelo: su fundamento debe examinarse mediante los requisitos, las decisiones y las verificaciones documentadas en los capítulos 4 a 6.

## 2.2. Análisis de Personas de Usuario

Formulé tres personas a partir de mi experiencia en el contexto académico, la observación y conversaciones informales. Son arquetipos de diseño, no participantes identificados en una investigación ni entrevistas sistemáticas. Sus nombres, biografías y citas sintéticas ayudan a representar necesidades; no deben interpretarse como testimonios recolectados.

**Tabla 2-1. Arquetipos y necesidades consideradas en el diseño**

| Arquetipo | Papel en el análisis | Necesidad que orienta el diseño |
|---|---|---|
| Lucía, estudiante organizada | Usuaria primaria, sin exigir conocimientos técnicos | Capturar y recuperar apuntes, disponer de ellos sin red y organizarlos por materia |
| Martín, estudiante práctico | Perfil con familiaridad técnica | Trabajar con Markdown y conservar control y portabilidad de sus contenidos |
| Prof. Ramos, docente evaluador | Parte interesada académica, no segmento comercial demostrado | Comprender el proceso y examinar una entrega identificable con decisiones y evidencia |

*Nota.* Elaboración propia a partir de las personas de diseño del proyecto; no representa testimonios ni perfiles validados mediante entrevistas.

Utilicé los perfiles como preguntas de diseño: si puede escribirse sin aprender Markdown, cómo recuperar un apunte o qué evidencia necesita quien evalúa la entrega. El relevamiento permitió contrastar atributos generales, como preferencia móvil y organización por materia, pero no valida cada biografía ni la satisfacción de los arquetipos mediante uso del prototipo.

## 2.3. Análisis Competitivo

El análisis competitivo documentado incluyó herramientas como Google Keep, Notion, Obsidian, OneNote, Simplenote y Joplin, entre otras. Comparó disponibilidad sin red, necesidad de cuenta, portabilidad, formato de notas, tamaño, costo, alcance entre dispositivos y rapidez de acceso. Esos criterios permitieron ordenar alternativas relevantes para el contexto de diseño.

La matriz conserva apreciaciones del relevamiento competitivo original, sin una revalidación actual de las versiones, planes o dispositivos comparados. Por ello, no reproduzco sus precios, tamaños y tiempos de arranque como mediciones vigentes, ni utilizo sus calificaciones para afirmar que las demás herramientas requieren conexión permanente. Existen alternativas locales y con Markdown; su presencia impide justificar Lumapse por una supuesta ausencia de soluciones.

El posicionamiento buscado es una combinación acotada: captura de apuntes, organización académica, almacenamiento local, ausencia de cuenta obligatoria y respaldo manual. No equivale a mayor potencia, mejor rendimiento o superioridad de usabilidad frente a productos maduros. La distribución vigente es Android; una interfaz adaptable y una base de código web no constituyen una entrega soportada para escritorio o para múltiples plataformas.

El contraste me permitió delimitar qué conservar y qué no intentar reproducir: prioricé la captura local y la salida de los datos, una organización por materias y secciones y un alcance sin colaboración ni sincronización automática. Desarrollar una solución propia respondió también al objetivo formativo de recorrer el proceso completo de ingeniería, no a haber demostrado que ninguna herramienta existente pudiera utilizarse para estudiar.

## 2.4. Lean Canvas

El Lean Canvas, creado por Ash Maurya como adaptación del Business Model Canvas, permite representar en una página los supuestos principales de una propuesta de producto (Maurya, 2024). Su utilidad reside en hacerlos explícitos para examinarlos, no en convertirlos en hechos por completar el esquema.

Elaboré el Lean Canvas como ejercicio de diseño de producto previo al relevamiento. Su función fue relacionar problema, destinatarios, propuesta de valor, solución y condiciones de sostenibilidad, no acreditar un negocio validado. La formulación inicial contemplaba PWA, IndexedDB y un posible empaquetado mediante TWA; esos elementos quedaron reemplazados por las decisiones técnicas ADR-005 y ADR-006.

La tabla 2-2 sintetiza esos supuestos y su relación con el alcance actual; no reproduce el canvas inicial como si todas sus decisiones siguieran vigentes.

**Tabla 2-2. Síntesis de los bloques del Lean Canvas y su evolución en Lumapse**

| Bloque | Aplicación y límite en Lumapse |
|---|---|
| Problema | Pérdida, desorganización y conectividad como cuestiones investigadas; la encuesta describe la muestra, no demuestra causalidad |
| Segmentos | Público estudiantil institucional; extensión a otros contextos todavía hipotética |
| Propuesta de valor | Notas locales sin cuenta; sin garantía absoluta de privacidad o conservación |
| Solución | Captura, organización y consulta en Android con Capacitor y SQLite, dentro del alcance delimitado |
| Canales | APK publicado en GitHub Releases; aceptación del canal por nuevos estudiantes no medida |
| Métricas clave | Primera nota, satisfacción y retención propuestas, sin resultados de uso sostenido acreditados |
| Costos | Menor dependencia de servidores; desarrollo, mantenimiento y distribución no se vuelven gratuitos por ello |
| Ingresos | Modalidades y precios hipotéticos, sin ventas, disposición a pagar o rentabilidad demostradas |
| Ventaja propuesta | Cercanía al contexto como acceso inicial al problema, no como barrera competitiva demostrada |

*Nota.* Elaboración propia a partir del canvas inicial y las decisiones posteriores de producto y arquitectura; canales, ingresos y metas no constituyen resultados comerciales.

La síntesis «Tus notas. En tu equipo. Sin cuenta. Sin internet.» expresa esa orientación con los límites del capítulo 1: el respaldo externo requiere una acción deliberada y la pérdida del dispositivo o la desinstalación siguen siendo riesgos. Portabilidad no equivale a sincronización ni a recuperación garantizada de todo el estado.

El canvas hace visibles los supuestos; no presento una validación económica integral ni un estudio de retención. Sus metas iniciales no reemplazan requisitos medibles ni resultados de usuario.

### 2.4.1. Recursos y costos del desarrollo

Distingo los desembolsos personales, los accesos bonificados y el trabajo no valorizado. Utilicé una suscripción personal de ChatGPT de USD 20 mensuales, cuyo inicio sitúo aproximadamente en abril de 2026. La destiné en gran medida a Lumapse y su mantenimiento, pero también a otros proyectos; por ello, la cuota no representa un costo mensual exclusivo de Lumapse.

Durante el primer mes de desarrollo utilicé Antigravity, una herramienta de programación del ecosistema de Google, mediante el acceso al plan Google AI Pro. Su valor de referencia era de aproximadamente USD 20 mensuales, pero recibí una bonificación por un año por mi condición de estudiante y no realicé ese desembolso.

Google AI Pro es un plan de acceso a servicios del ecosistema de Google, no una licencia exclusiva de Antigravity. Distingo así las suscripciones de las herramientas de programación y de los modelos que estas utilizan. La modalidad gratuita de Antigravity tiene mayores restricciones que los planes de pago; la disponibilidad concreta de modelos y las cuotas dependen del plan y de las condiciones de acceso, incluidas las promociones.

**Tabla 2-3. Recursos utilizados y condiciones del desembolso personal**

| Recurso | Desembolso personal | Condición de uso |
|---|---|---|
| Suscripción de ChatGPT (OpenAI) | USD 20 mensuales | Suscripción compartida con otros proyectos, sin un porcentaje de imputación registrado |
| Google AI Pro | USD 0 | Plan bonificado por un año mediante una promoción estudiantil personal; Antigravity utilizado durante el primer mes de desarrollo |
| Dominio `.tech` | USD 0 | Beneficio personal de GitHub Student Developer Pack, no una compra del proyecto |

*Nota.* Registro propio de recursos y desembolsos declarados; no es una valoración del costo total ni una imputación exclusiva a Lumapse.

Estos recursos apoyan el desarrollo y la difusión; su contratación no es un requisito para utilizar el núcleo local del APK. El trabajo se realizó sin horario fijo y no dispongo de un registro completo de horas para valorizarlo, como explico en la sección 7.2.2. El cuadro no constituye un presupuesto integral: no calculo un total exclusivo a partir de cuotas compartidas ni sumo precios comerciales de recursos que recibí bonificados. Un desembolso nulo tampoco demuestra que su continuidad esté financiada, cuestión retomada en la sección 7.3.2.

## 2.5. Historias de Usuario como Hipótesis de Valor (Lean UX)

Las historias expresan una necesidad y un beneficio esperado desde la perspectiva del usuario. Contienen supuestos de valor, mientras sus criterios de aceptación delimitan comportamientos verificables. Una historia no es, por sí sola, un experimento ni una hipótesis contrastada.

Esta separación es coherente con la orientación de Lean UX hacia supuestos, hipótesis, experimentación y aprendizaje a partir de usuarios, desarrollada por Gothelf y Seiden (2013). En Lumapse distingo el contraste exploratorio de necesidades, las decisiones de diseño y la verificación del software. No presento la existencia de esos artefactos como demostración de haber aplicado íntegramente un programa experimental de Lean UX.

Los apartados siguientes organizan el razonamiento aplicado en Lumapse, desde el supuesto hasta su implementación. No constituyen fases prescritas de Lean UX ni implican que cada actividad se haya realizado una única vez y en ese orden.

### 2.5.1. Formulación de historias como supuestos de diseño

Las personas, el contexto y las restricciones sirvieron para formular necesidades con la estructura «Como [rol], quiero [acción], para [beneficio]». Organizar apuntes por materia expresa una necesidad; elegir una tabla relacional o limitar la profundidad son decisiones de solución. Esta separación permitió revisar supuestos, como priorizar etiquetas, sin tratar las primeras historias como compromisos inmodificables.

### 2.5.2. Contraste exploratorio de necesidades mediante la encuesta

El relevamiento reunió 121 respuestas y permitió analizar 120 después de aplicar el criterio de exclusión. Su selección fue no probabilística por conveniencia. La unidad de análisis es la respuesta registrada, sin comprobar identidades únicas. Los resultados siguientes describen esa base y orientan decisiones; no prueban eficacia del prototipo ni representan una estimación inferencial de toda la población. El capítulo 3 desarrolla el instrumento y sus limitaciones.

**Tabla 2-4. Resultados del relevamiento que orientaron decisiones de producto**

| Cuestión examinada | Evidencia declarada, base de 120 respuestas | Implicación y límite |
|---|---|---|
| Disponibilidad de conexión | En P6, 98 respuestas fueron «A veces», «Raramente» o «Nunca» (81,7 %); en P8, el funcionamiento sin internet recibió 89 selecciones (74,2 %) | Priorizar operaciones locales y su verificación; no es una medición técnica de la red |
| Dispositivo preferido | En P9, el celular recibió 87 selecciones (72,5 %) | Priorizar el diseño móvil; no decide entre PWA y APK |
| Organización principal | En P11, las carpetas por materia recibieron 83 selecciones (69,2 %) y las etiquetas, 24 (20,0 %) | Priorizar materias sin afirmar que las etiquetas carezcan de valor |
| Protección de la escritura | En P8, la opción de guardado automático recibió 63 selecciones (52,5 %) | Investigar continuidad del trabajo; no demuestra preferencia por guardar notas definitivas sin confirmación |

*Nota.* Elaboración propia a partir del relevamiento de mayo de 2026 (Sandoval, 2026b). Cada porcentaje usa como denominador las 120 respuestas analizadas; P8 admite selección múltiple.

P8 indicaba un máximo de tres opciones, pero se registraron 371 marcas y 37 respuestas con cuatro a seis selecciones. Sus porcentajes son frecuencias descriptivas sobre las respuestas analizadas, no un ranking de elección forzada uniforme. La tabla no transforma esas selecciones en requisitos aprobados automáticamente.

La pregunta sobre utilidad combinaba aplicación web, gratuidad, ausencia de cuenta y toma de notas: 97 de las 120 respuestas la valoraron con cuatro o cinco puntos (80,8 %). No permite aislar el atractivo de un atributo ni demostrar intención de pago, adopción real o aceptación de un APK. La disposición declarada a probar un prototipo tampoco equivale a participación efectiva.

### 2.5.3. Revisión de decisiones a partir de necesidades y restricciones técnicas

La preferencia por materias llevó a revisar el protagonismo inicial de las etiquetas y quedó reflejada en DP-002 y DP-004. La solución incorpora Entrada, Materias y Archivo, con materias y secciones opcionales. La encuesta no evaluó esa nomenclatura, el límite de dos niveles ni el recorrido: son decisiones de diseño, no resultados de P11.

La prioridad móvil y offline orientó también la comparación de alternativas técnicas. Adopté Android con Capacitor para reutilizar la interfaz web existente sin una reescritura completa, y SQLite nativo para separar la persistencia del almacenamiento administrado por el navegador. A cambio, asumí la configuración y el mantenimiento del entorno de compilación Android y una distribución mediante APK cuya aceptación por usuarios nuevos no estaba medida; el navegador quedó como entorno auxiliar, no como canal de producto soportado. ADR-005 y ADR-006 registran ese análisis, desarrollado en el capítulo 4. El cuestionario no comparó motores de base de datos ni canales de instalación: no atribuyo a los estudiantes una elección de SQLite o del formato APK.

Otra revisión relevante fue la de RF-005: la protección del trabajo en curso se concretó como borrador persistente, manteniendo una acción explícita para crear o actualizar la nota definitiva. El criterio fue conservar la escritura en curso sin confundirla con una nota confirmada ni sobrescribir silenciosamente la versión guardada durante una edición. Esta solución distingue una necesidad de continuidad de una interpretación literal de «guardado automático». La encuesta no demuestra que el mecanismo elegido resulte comprendido por todos los usuarios.

### 2.5.4. Materialización en requisitos y código

La trazabilidad relaciona necesidad, decisión, historia, requisito, criterio de aceptación, implementación y evidencia. Una prueba o restricción técnica puede obligar a revisar esa relación, como permite examinar el caso de organización por materias.

**Tabla 2-5. Ejemplo de trazabilidad de la organización por materias y secciones**

| Eslabón | Correspondencia documentada |
|---|---|
| Necesidad | Preferencia de P11 por carpetas por materia |
| Decisiones | DP-002 define la navegación; DP-004 delimita materias y secciones |
| Historia y requisito | HU-017 reúne creación, asociación y filtrado; RF-014 identifica el filtrado por materia y sección |
| Criterios de aceptación | HU-017: creación hasta dos niveles (CA-01), filtrado (CA-03), asociación de notas (CA-04) y persistencia de la jerarquía (CA-05) |
| Implementación | Servicio de materias, estado de notas, interfaz de organización y acceso SQLite |
| Evidencia técnica | Pruebas existentes de validación de profundidad y operaciones de materias, junto con los controles documentados |

*Nota.* Elaboración propia a partir de P11, DP-002/004, HU-017, RF-014 y la implementación; la correspondencia no acredita por sí sola validación de uso.

La prueba de profundidad comprueba una regla del software, no su preferencia entre estudiantes. La auditoría documental detecta referencias incoherentes, pero no verifica facilidad de uso ni cobertura completa de un binario. El diseño corresponde al capítulo 4; la implementación, al 5; las pruebas, al 6.

## 2.6. Requisitos del Sistema

Organicé los requisitos en funcionales —qué debe permitir el sistema— y no funcionales —qué atributos y condiciones de calidad deben verificarse—. Sus identificadores permiten seguir cambios de alcance sin borrar la formulación histórica. La prioridad expresa importancia para la entrega, no evidencia de cumplimiento.

### 2.6.1. Requisitos Funcionales

El catálogo conserva 28 RF. En el corte documental vigente, 21 figuran implementados, uno verificado, cuatro postergados y dos obsoletos por el cambio de arquitectura. Mantener esas categorías evita contar una función excluida como pendiente accidental o presentar como implementado un requisito de la antigua PWA.

Los RF abarcan notas y borradores, persistencia, Markdown, organización, fechas puntuales, interfaz e identificación y respaldo/importación ZIP. La sección 1.4.2 delimita esas funciones; no incluyen sincronización, agenda completa ni una copia exacta de todo el estado del dispositivo.

Los cuatro RF postergados son conteo de palabras y caracteres (RF-006), compartir o exportar una nota individual (RF-016), bienvenida inicial (RF-022) e indicador global de conexión (RF-024). Service Workers (RF-009) e instalación PWA (RF-021) quedaron obsoletos. En cambio, el ZIP del espacio de trabajo (RF-017 y RF-018) es distinto del flujo individual postergado. Los estados de implementación no certifican todos los recorridos de la versión 0.6.0 RC1 publicada.

### 2.6.2. Requisitos No Funcionales

El catálogo reúne 26 RNF sobre rendimiento, usabilidad, disponibilidad y confiabilidad, seguridad y privacidad, portabilidad, accesibilidad y mantenibilidad. Cada requisito debe relacionarse con una métrica, un método y evidencia identificable; una propiedad deseada no se demuestra mediante una descripción de arquitectura.

La revisión distingue evidencia verificada en su alcance, evidencia parcial, mediciones pendientes y criterios obsoletos o no aplicables al APK. Por ejemplo, una comprobación de disponibilidad en un debug identificado no se atribuye automáticamente a otro binario; los controles de HTTPS del hosting tampoco equivalen a controles del runtime local Android.

Tres métricas conservan su estado pendiente y sus umbrales:

**Tabla 2-6. Métricas no funcionales pendientes y límites de su evidencia**

| Requisito | Criterio | Límite actual |
|---|---|---|
| RNF-002 | Latencia de crear, editar o eliminar notas ≤ 200 ms | Sin muestras temporales aceptadas; medición diferida a después de la presentación |
| RNF-004 | Fluidez de desplazamiento ≥ 55 FPS con 500 notas | La importación funcional de ese volumen no acredita la tasa de cuadros; medición diferida |
| RNF-005 | Primera nota de un usuario nuevo ≤ 10 s | Sin medición específica con participantes nuevos; evaluación posterior al corte, no bloqueante |

*Nota.* Síntesis del catálogo de requisitos no funcionales y de las decisiones de postergación; no presenta nuevas mediciones ni modifica los umbrales.

La aceptación de esas limitaciones no rebaja los criterios ni convierte una opinión favorable en medición. La navegación por teclado mantiene evidencia parcial y las verificaciones acotadas de accesibilidad no se presentan como certificación exhaustiva.

El corte de presentación es la versión 0.6.0/600 RC1, publicada con validación parcial y desarrollo congelado hasta después de la presentación. Las betas y los builds de prueba conservan identidad y cobertura propias; los recorridos restantes de la versión 0.6.0 RC1 siguen diferidos, no aprobados. Publicar el candidato no equivale a cumplimiento global.

En conjunto, este marco permite seguir el razonamiento desde los supuestos iniciales hasta requisitos y decisiones verificables. El capítulo 3 desarrolla la evidencia del relevamiento; los capítulos 4 a 6 explican cómo se tradujo en diseño, implementación y pruebas. La relación entre esas etapas sostiene la evaluación del proyecto, sin sustituir los resultados que cada una debe demostrar.
