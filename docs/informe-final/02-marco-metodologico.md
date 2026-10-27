# Capítulo 2: Marco Metodológico y Modelo de Negocio

En este capítulo explico cómo organicé el desarrollo y cómo relacioné las necesidades iniciales con las decisiones de producto y los requisitos. Distingo la gestión del trabajo, el análisis de usuarios y las hipótesis de valor: cumplen funciones complementarias, pero no constituyen una única metodología ni producen el mismo tipo de evidencia.

## 2.1. Enfoque de Desarrollo y Gestión del Flujo (Kanban Adaptado)

Desarrollé Lumapse de forma iterativa e incremental: construí funcionalidades acotadas, revisé su comportamiento y ajusté prioridades y decisiones a medida que avanzaba el proyecto. Para gestionar ese trabajo adopté un sistema basado en Kanban, adaptado a un desarrollo individual y formalizado en ADR-003. El enfoque incremental describe la evolución del producto; Kanban organiza el flujo de las unidades de trabajo.

Los hitos funcionaron como puntos académicos de revisión, entrega y establecimiento de líneas base, no como Sprints. El cronograma inicial y las fechas de cierre registran planificación y evolución del proyecto, sin convertir los hitos en iteraciones de duración fija.

Complementé la gestión con artefactos de Design Thinking para organizar la comprensión del contexto, la definición del problema y las alternativas de solución. Las personas, la encuesta, el análisis competitivo y el Lean Canvas aportaron insumos para esas actividades. El prototipo evolucionó hacia las betas y la RC1; esa evolución técnica no demuestra que se haya completado una validación sistemática de uso con el público objetivo.

### 2.1.1. Justificación frente a Scrum y RUP

La elección no se basó en una prohibición numérica de Scrum para proyectos individuales. Schwaber y Sutherland (2020) describen equipos de diez personas o menos como situación típica, sin fijar un mínimo explícito. Sin embargo, Scrum define responsabilidades, Sprints, eventos, artefactos y compromisos que deben reconocerse en su aplicación. No organicé Lumapse mediante ese conjunto: utilizar historias de usuario o estimaciones relativas no basta para afirmar que apliqué Scrum.

Tampoco seguí Rational Unified Process —RUP—, que organiza el ciclo de desarrollo en Inicio, Elaboración, Construcción y Transición, con disciplinas y artefactos adaptables (IBM, s. f.). Produje requisitos, casos de uso y modelos de arquitectura por su utilidad técnica y académica, pero no estructuré la gestión según esas fases. La presencia de diagramas UML no identifica por sí sola el proceso utilizado.

Kanban Guides (2025) presenta Kanban como una estrategia de optimización del flujo de valor que combina definición y visualización del flujo, gestión activa de los elementos y mejora del sistema. Esa orientación resultó compatible con reordenar prioridades y terminar unidades pequeñas sin simular responsabilidades o ceremonias de un equipo inexistente. Es una elección contextual, no una afirmación de superioridad general.

### 2.1.2. Sistema de trabajo aplicado

La definición de flujo formalizada en Hito 06 establece cuatro estados:

> Backlog → En Curso → En Revisión → Hecho

Un elemento representa un objetivo concreto con salida verificable, dependencias y criterio de cierre. Comienza cuando pasa a En Curso y termina cuando satisface ese criterio; permanecer En Revisión significa que todavía consume capacidad. Una funcionalidad redactada o implementada no se considera terminada sólo por existir un commit.

El límite global de trabajo en curso —WIP— es de dos elementos entre En Curso y En Revisión, con una política más restrictiva de una sola rama de tarea activa. Seleccioné trabajo mediante un sistema de arrastre o *pull*, priorizando cerrar lo iniciado. Un bloqueo conserva su condición de trabajo en curso, sin liberar capacidad artificialmente.

La prioridad atiende riesgos de pérdida de datos, bloqueos de entrega, evidencia necesaria, dependencias y valor funcional. La definición asigna a GitHub Projects la vista del flujo; los tableros, ADR, informes de hito y el historial Git conservan evidencia complementaria. Un commit o PR permite rastrear cambios, pero no sustituye aceptación ni acredita pruebas por sí solo.

### 2.1.3. Medición y límite de la evidencia

Estimé las historias mediante tamaño relativo en Story Points, utilizando juicio individual y una historia de referencia. Para los riesgos de integración de Capacitor y migración a SQLite documenté escenarios optimista, más probable y pesimista mediante estimación de tres puntos. Son instrumentos de planificación: no equivalen a horas efectivas, productividad observada ni duraciones reales demostradas.

El seguimiento por hitos registra Story Points asociados al alcance entregado. No los interpreto como *throughput* de Kanban, que cuenta elementos terminados, ni como tiempo de ciclo. Tampoco presento los escenarios de estimación como intervalos empíricos de cumplimiento.

La guía de Kanban identifica cuatro métricas mínimas: WIP, cantidad de elementos terminados por unidad de tiempo, edad de los elementos aún activos y tiempo de ciclo de los finalizados (Kanban Guides, 2025). No dispongo de fechas completas y confiables para calcularlas retrospectivamente sobre todo el proyecto. La formalización de su registro en Hito 06 no demuestra que se hayan medido durante las etapas anteriores.

La definición de flujo incorpora una expectativa de nivel de servicio provisional: 85 % de los elementos en siete días calendario o menos, a recalibrar con al menos cinco elementos con fechas confiables. No es cumplimiento observado. Por estas limitaciones, describo el proceso como basado en Kanban y adaptado al contexto individual, sin afirmar conformidad histórica completa.

## 2.2. Análisis de Personas de Usuario

Formulé tres personas a partir de mi experiencia en el contexto académico, la observación y conversaciones informales. Son arquetipos de diseño, no participantes identificados en una investigación ni entrevistas sistemáticas. Sus nombres, biografías y citas sintéticas ayudan a representar necesidades; no deben interpretarse como testimonios recolectados.

| Arquetipo | Papel en el análisis | Necesidad que orienta el diseño |
|---|---|---|
| Lucía, estudiante organizada | Usuaria primaria, sin exigir conocimientos técnicos | Capturar y recuperar apuntes, disponer de ellos sin red y organizarlos por materia |
| Martín, estudiante práctico | Perfil con familiaridad técnica | Trabajar con Markdown y conservar control y portabilidad de sus contenidos |
| Prof. Ramos, docente evaluador | Parte interesada académica, no segmento comercial demostrado | Comprender el proceso y examinar una entrega identificable con decisiones y evidencia |

Utilicé los perfiles como preguntas de diseño: si puede escribirse sin aprender Markdown, cómo recuperar un apunte o qué evidencia necesita quien evalúa la entrega. El relevamiento permitió contrastar atributos generales, como preferencia móvil y organización por materia, pero no valida cada biografía ni la satisfacción de los arquetipos mediante uso del prototipo.

## 2.3. Análisis Competitivo

El análisis competitivo documentado incluyó herramientas como Google Keep, Notion, Obsidian, OneNote, Simplenote y Joplin, entre otras. Comparó disponibilidad sin red, necesidad de cuenta, portabilidad, formato de notas, tamaño, costo, alcance entre dispositivos y rapidez de acceso. Esos criterios permitieron ordenar alternativas relevantes para el contexto de diseño.

La matriz conserva apreciaciones del relevamiento competitivo original, sin una revalidación actual de las versiones, planes o dispositivos comparados. Por ello, no reproduzco sus precios, tamaños y tiempos de arranque como mediciones vigentes, ni utilizo sus calificaciones para afirmar que las demás herramientas requieren conexión permanente. Existen alternativas locales y con Markdown; su presencia impide justificar Lumapse por una supuesta ausencia de soluciones.

El posicionamiento buscado es una combinación acotada: captura de apuntes, organización académica, almacenamiento local, ausencia de cuenta obligatoria y respaldo manual. No equivale a mayor potencia, mejor rendimiento o superioridad de usabilidad frente a productos maduros. La distribución vigente es Android; una interfaz adaptable y una base de código web no constituyen una entrega soportada para escritorio o para múltiples plataformas.

## 2.4. Lean Canvas

Elaboré el Lean Canvas como ejercicio de diseño de producto previo al relevamiento. Su función fue relacionar problema, destinatarios, propuesta de valor, solución y condiciones de sostenibilidad, no acreditar un negocio validado. La formulación inicial contemplaba PWA, IndexedDB y un posible empaquetado mediante TWA; esos elementos quedaron reemplazados por las decisiones técnicas ADR-005 y ADR-006.

La tabla distingue la contribución de cada bloque de aquello que aún no constituye un resultado demostrado.

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

La síntesis «Tus notas. En tu equipo. Sin cuenta. Sin internet.» expresa esa orientación con los límites del capítulo 1: el respaldo externo requiere una acción deliberada y la pérdida del dispositivo o la desinstalación siguen siendo riesgos. Portabilidad no equivale a sincronización ni a recuperación garantizada de todo el estado.

El canvas hace visibles los supuestos; no presento una validación económica integral ni un estudio de retención. Sus metas iniciales no reemplazan requisitos medibles ni resultados de usuario.

## 2.5. Historias de Usuario como Hipótesis de Valor (Lean UX)

Las historias expresan una necesidad y un beneficio esperado desde la perspectiva del usuario. Contienen supuestos de valor, mientras sus criterios de aceptación delimitan comportamientos verificables. Una historia no es, por sí sola, un experimento ni una hipótesis contrastada.

Esta separación es coherente con la orientación de Lean UX hacia supuestos, hipótesis, experimentación y aprendizaje a partir de usuarios, desarrollada por Gothelf y Seiden (2013). En Lumapse distingo el contraste exploratorio de necesidades, las decisiones de diseño y la verificación del software. No presento la existencia de esos artefactos como demostración de haber aplicado íntegramente un programa experimental de Lean UX.

### 2.5.1. Fase 1 — La Historia de Usuario como supuesto de diseño

Las personas, el contexto y las restricciones sirvieron para formular necesidades con la estructura «Como [rol], quiero [acción], para [beneficio]». Organizar apuntes por materia expresa una necesidad; elegir una tabla relacional o limitar la profundidad son decisiones de solución. Esta separación permitió revisar supuestos, como priorizar etiquetas, sin tratar las primeras historias como compromisos inmodificables.

### 2.5.2. Fase 2 — La encuesta como instrumento de validación

El relevamiento reunió 121 respuestas y permitió analizar 120 después de aplicar el criterio de exclusión. Su selección fue no probabilística por conveniencia. Los resultados siguientes describen esa muestra y orientan decisiones; no prueban eficacia del prototipo ni representan una estimación inferencial de toda la población. El capítulo 3 desarrolla el instrumento y sus limitaciones.

| Cuestión examinada | Evidencia declarada, base de 120 respuestas | Implicación y límite |
|---|---|---|
| Disponibilidad de conexión | En P6, 98 personas eligieron «A veces», «Raramente» o «Nunca» (81,7 %); en P8, 89 seleccionaron funcionamiento sin internet (74,2 %) | Priorizar operaciones locales y su verificación; no es una medición técnica de la red |
| Dispositivo preferido | En P9, 87 eligieron celular (72,5 %) | Priorizar el diseño móvil; no decide entre PWA y APK |
| Organización principal | En P11, 83 prefirieron carpetas por materia (69,2 %) frente a 24 que eligieron etiquetas (20,0 %) | Priorizar materias sin afirmar que las etiquetas carezcan de valor |
| Protección de la escritura | En P8, 63 seleccionaron la formulación de guardado automático (52,5 %) | Investigar continuidad del trabajo; no demuestra preferencia por guardar notas definitivas sin confirmación |

P8 indicaba un máximo de tres opciones, pero se registraron 371 marcas y 37 respuestas con cuatro a seis selecciones. Sus porcentajes son frecuencias descriptivas con personas como denominador, no un ranking de elección forzada uniforme. La tabla no transforma esas selecciones en requisitos aprobados automáticamente.

La pregunta sobre utilidad combinaba aplicación web, gratuidad, ausencia de cuenta y toma de notas: 97 de 120 participantes la valoraron con cuatro o cinco puntos (80,8 %). No permite aislar el atractivo de un atributo ni demostrar intención de pago, adopción real o aceptación de un APK. La disposición declarada a probar un prototipo tampoco equivale a participación efectiva.

### 2.5.3. Fase 3 — El pivote fundamentado en datos

La preferencia por materias llevó a revisar el protagonismo inicial de las etiquetas y quedó reflejada en DP-002 y DP-004. La solución incorpora Entrada, Materias y Archivo, con materias y secciones opcionales. La encuesta no evaluó esa nomenclatura, el límite de dos niveles ni el recorrido: son decisiones de diseño, no resultados de P11.

La prioridad móvil y offline orientó también la comparación de alternativas técnicas. Adopté Android con Capacitor y SQLite por el análisis documentado en ADR-005 y ADR-006, considerando persistencia, reutilización de la interfaz y alcance del desarrollo. El cuestionario no comparó motores de base de datos ni canales de instalación: no atribuyo a los estudiantes una elección de SQLite o del formato APK.

Otra revisión relevante fue la de RF-005: la protección del trabajo en curso se concretó como borrador persistente, manteniendo una acción explícita para crear o actualizar la nota definitiva. Esta solución distingue una necesidad de continuidad de una interpretación literal de «guardado automático». La encuesta no demuestra que el mecanismo elegido resulte comprendido por todos los usuarios.

### 2.5.4. Fase 4 — Materialización en requisitos y código

La trazabilidad relaciona necesidad, decisión, historia, requisito, criterio de aceptación, implementación y evidencia. Una prueba o restricción técnica puede obligar a revisar esa relación, como permite examinar el caso de organización por materias.

| Eslabón | Correspondencia documentada |
|---|---|
| Necesidad | Preferencia de P11 por carpetas por materia |
| Decisiones | DP-002 define la navegación; DP-004 delimita materias y secciones |
| Historia y requisito | HU-017 reúne creación, asociación y filtrado; RF-014 identifica el filtrado por materia y sección |
| Criterios de aceptación | Creación de la jerarquía, asociación de notas, filtrado y persistencia |
| Implementación | Servicio de materias, estado de notas, interfaz de organización y acceso SQLite |
| Evidencia técnica | Pruebas existentes de validación de profundidad y operaciones de materias, junto con los controles documentados |

La prueba de profundidad comprueba una regla del software, no su preferencia entre estudiantes. La auditoría documental detecta referencias incoherentes, pero no verifica facilidad de uso ni cobertura completa de un binario. El diseño corresponde al capítulo 4; la implementación, al 5; las pruebas, al 6.

## 2.6. Requisitos del Sistema

Organicé los requisitos en funcionales —qué debe permitir el sistema— y no funcionales —qué atributos y condiciones de calidad deben verificarse—. Sus identificadores permiten seguir cambios de alcance sin borrar la formulación histórica. La prioridad expresa importancia para la entrega, no evidencia de cumplimiento.

### 2.6.1. Requisitos Funcionales

El catálogo conserva 28 RF. En el corte documental vigente, 21 figuran implementados, uno verificado, cuatro postergados y dos obsoletos por el cambio de arquitectura. Mantener esas categorías evita contar una función excluida como pendiente accidental o presentar como implementado un requisito de la antigua PWA.

Los RF abarcan notas y borradores, persistencia, Markdown, organización, fechas puntuales, interfaz e identificación y respaldo/importación ZIP. La sección 1.4.2 delimita esas funciones; no incluyen sincronización, agenda completa ni una copia exacta de todo el estado del dispositivo.

Los cuatro RF postergados son conteo de palabras y caracteres (RF-006), compartir o exportar una nota individual (RF-016), bienvenida inicial (RF-022) e indicador global de conexión (RF-024). Service Workers (RF-009) e instalación PWA (RF-021) quedaron obsoletos. En cambio, el ZIP del espacio de trabajo (RF-017 y RF-018) es distinto del flujo individual postergado. Los estados de implementación no certifican todos los recorridos de la RC1 publicada.

### 2.6.2. Requisitos No Funcionales

El catálogo reúne 26 RNF sobre rendimiento, usabilidad, disponibilidad y confiabilidad, seguridad y privacidad, portabilidad, accesibilidad y mantenibilidad. Cada requisito debe relacionarse con una métrica, un método y evidencia identificable; una propiedad deseada no se demuestra mediante una descripción de arquitectura.

La revisión distingue evidencia verificada en su alcance, evidencia parcial, mediciones pendientes y criterios obsoletos o no aplicables al APK. Por ejemplo, una comprobación de disponibilidad en un debug identificado no se atribuye automáticamente a otro binario; los controles de HTTPS del hosting tampoco equivalen a controles del runtime local Android.

Tres métricas conservan su estado pendiente y sus umbrales:

| Requisito | Criterio | Límite actual |
|---|---|---|
| RNF-002 | Latencia de crear, editar o eliminar notas ≤ 200 ms | Sin muestras temporales aceptadas; medición diferida a después de la presentación |
| RNF-004 | Fluidez de desplazamiento ≥ 55 FPS con 500 notas | La importación funcional de ese volumen no acredita la tasa de cuadros; medición diferida |
| RNF-005 | Primera nota de un usuario nuevo ≤ 10 s | Sin medición específica con participantes nuevos; evaluación posterior al corte, no bloqueante |

La aceptación de esas limitaciones no rebaja los criterios ni convierte una opinión favorable en medición. La navegación por teclado mantiene evidencia parcial y las verificaciones acotadas de accesibilidad no se presentan como certificación exhaustiva.

El corte de presentación es la RC1 0.6.0/600, publicada con validación parcial y desarrollo congelado hasta después de la presentación. Las betas y los builds de prueba conservan identidad y cobertura propias; los recorridos restantes de la RC1 siguen diferidos, no aprobados. Publicar el candidato no equivale a cumplimiento global.

En conjunto, este marco permite seguir el razonamiento desde los supuestos iniciales hasta requisitos y decisiones verificables. El capítulo 3 desarrolla la evidencia del relevamiento; los capítulos 4 a 6 explican cómo se tradujo en diseño, implementación y pruebas. La relación entre esas etapas sostiene la evaluación del proyecto, sin sustituir los resultados que cada una debe demostrar.
