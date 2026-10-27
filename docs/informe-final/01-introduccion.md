# Capítulo 1: Introducción y Planteo del Problema

## 1.1. Contexto del Proyecto

Desarrollé Lumapse, una aplicación de captura, organización y recuperación de notas de estudio, como proyecto integrador de Prácticas Profesionalizantes III de la Tecnicatura en Análisis de Sistemas y Desarrollo de Software del IES 6023 «Dr. Alfredo Loutaif». En este informe presento el análisis del problema, el relevamiento de necesidades, la definición de requisitos, el diseño de la solución, su implementación y las verificaciones documentadas. Mi propósito académico fue integrar esas actividades en un producto de software cuyo proceso de construcción y decisiones pudieran examinarse con evidencia.

Tomé como contexto inicial la comunidad estudiantil del instituto. Mi experiencia como estudiante y las conversaciones exploratorias con compañeros me llevaron a formular una primera hipótesis: capturar información durante la cursada no es suficiente si luego resulta difícil conservarla, organizarla o recuperarla cuando se necesita. Utilicé esos antecedentes para orientar el relevamiento, no como entrevistas sistemáticas ni como una medición de la frecuencia del problema. Por ello, distingo la observación inicial de los resultados de la encuesta posterior.

Delimité la propuesta al ciclo de capturar, organizar y volver a consultar apuntes. No busqué sustituir todas las herramientas de estudio ni demostrar, por la sola existencia de la aplicación, una mejora del aprendizaje. Prioricé el uso desde el celular, el almacenamiento local y la disponibilidad del núcleo funcional sin conexión. La rapidez de interacción y la facilidad de uso son objetivos sujetos a verificación, no propiedades que puedan presumirse a partir del diseño.

En el anteproyecto propuse una aplicación web progresiva —PWA, por sus siglas en inglés— con persistencia en IndexedDB, una tecnología de almacenamiento del navegador. Posteriormente adopté una aplicación Android híbrida: la interfaz, construida con tecnologías web, se ejecuta en una WebView dentro de un contenedor Capacitor y utiliza SQLite como base de datos local. El relevamiento respaldó las prioridades móvil y offline, pero no comparó PWA con APK ni evaluó motores de persistencia. Fundamenté la elección de la plataforma y del almacenamiento mediante el análisis técnico de alternativas registrado en las decisiones arquitectónicas ADR-005 y ADR-006, cuyo tratamiento corresponde al capítulo 4.

Para organizar el trabajo combiné prácticas de diseño centrado en las necesidades del usuario, hipótesis de producto y desarrollo iterativo e incremental. Utilicé Design Thinking para organizar los artefactos de comprensión y definición del problema; Lean UX para tratar los supuestos de valor; y un sistema basado en Kanban, adaptado al trabajo individual, para gestionar el flujo por unidades y revisar resultados por hitos. Estas prácticas cumplen funciones distintas y no las considero metodologías intercambiables. En el capítulo 2 desarrollo su aplicación y sus límites.

## 1.2. Planteo del Problema

El problema abordado es la dificultad declarada por una parte del público relevado para conservar y organizar sus notas de estudio, en un contexto donde el acceso estable a internet no está disponible de manera permanente para todas las personas participantes. La oportunidad no se fundamenta en la inexistencia de aplicaciones de notas: existen alternativas con diferentes combinaciones de almacenamiento local, sincronización, organización y complejidad. Lumapse explora una combinación deliberadamente limitada para el contexto institucional estudiado, sin afirmar superioridad general frente a esas herramientas.

Para contrastar los supuestos iniciales realicé un relevamiento mediante una encuesta autoadministrada entre el 11 y el 13 de mayo de 2026. Analicé 120 de las 121 respuestas recolectadas, tras excluir un registro que no cumplía el criterio poblacional definido. La selección fue no probabilística por conveniencia. Por tanto, los porcentajes siguientes describen a las personas participantes; no estiman con un margen de error efectivo la situación de todo el instituto ni de los estudiantes de nivel superior en general. En el capítulo 3 expongo el instrumento, el procesamiento y las limitaciones del relevamiento sobre hábitos y necesidades de toma de notas.

El cuaderno o papel fue el método principal de toma de notas para 106 de las 120 personas participantes (88,3 %). Entre las 115 que declararon tomar notas, 56 manifestaron dificultades con su método actual (48,7 %). Dentro de ese subgrupo de 56, la pérdida de notas y la desorganización fueron seleccionadas por 33 personas cada una (58,9 % en ambos casos). Son respuestas a una pregunta de selección múltiple: los dos porcentajes no describen grupos necesariamente distintos ni prueban una relación causal entre pérdida y desorganización.

La conectividad y el dispositivo preferido delimitan otras condiciones de diseño. Ante la pregunta por acceso estable a internet en el instituto, 98 de 120 personas respondieron «A veces», «Raramente» o «Nunca» (81,7 %). Esto expresa una frecuencia declarada de disponibilidad, no una medición técnica de la red. Por otra parte, 87 eligieron el celular como dispositivo de uso preferido para una aplicación de notas (72,5 %) y 83 prefirieron organizar sus apuntes en carpetas por materia (69,2 %). Estos resultados respaldan priorizar una interfaz móvil, operaciones locales y organización académica por materias; no demuestran que una implementación concreta ya satisfaga esas necesidades.

En términos de análisis de sistemas, el desafío consiste en conectar tres momentos: registrar información durante la cursada, conservar el trabajo y localizarlo posteriormente mediante una organización comprensible. El diseño debe reducir la dependencia de conectividad para ese ciclo y proporcionar una salida de los datos que no obligue a permanecer en la aplicación. En consecuencia, planteé la siguiente pregunta como guía del proyecto:

> ¿Cómo diseñar e implementar una aplicación móvil de notas que permita capturar, organizar y recuperar información de estudio sin depender de una conexión permanente, atendiendo las necesidades declaradas por los estudiantes relevados y las restricciones de un proyecto académico individual?

El relevamiento aporta un fundamento para desarrollar y examinar esa propuesta, no una prueba de adopción ni de eficacia del producto terminado. Tampoco permite atribuir a toda la población una preferencia por Markdown, por SQLite o por la instalación directa de un APK. Esas decisiones pertenecen al diseño técnico; su viabilidad y las condiciones de uso deben distinguirse del interés declarado en una encuesta.

## 1.3. Objetivos

Formulé los objetivos siguientes a partir del propósito de captura y gestión local de notas del anteproyecto, ajustándolos al alcance resultante de las decisiones documentadas. Con esta formulación explicito la evolución desde la propuesta PWA inicial hacia Android con SQLite, sin reemplazar retroactivamente el anteproyecto presentado. Los objetivos indican qué procuré obtener; su grado de cumplimiento debe juzgarse mediante los resultados y limitaciones de los capítulos de implementación, validación y conclusiones.

### 1.3.1. Objetivo General

Diseñar, implementar y documentar una aplicación Android de captura, organización y recuperación de notas de estudio, con funcionamiento prioritariamente local y sin conexión, fundamentada en el relevamiento del contexto estudiantil del IES 6023 y en un proceso trazable de análisis, diseño, desarrollo y verificación de software.

### 1.3.2. Objetivos Específicos

1. Relevar y analizar hábitos, dificultades y preferencias de los estudiantes participantes, explicitando el instrumento, las bases de cálculo y los límites de la evidencia obtenida.
2. Traducir las necesidades y restricciones identificadas en requisitos funcionales, atributos de calidad, historias de usuario y decisiones de producto con criterios de aceptación rastreables.
3. Diseñar y justificar una arquitectura modular con persistencia local, diferenciando las necesidades respaldadas por el relevamiento de las decisiones técnicas de plataforma y almacenamiento.
4. Implementar la creación, edición, lectura, búsqueda y organización de notas en texto plano y Markdown, con materias y secciones como estructura académica principal.
5. Incorporar mecanismos de continuidad y recuperación: borradores persistentes, guardado explícito, archivo, papelera y respaldo e importación manual del espacio de trabajo, con límites definidos para cada mecanismo.
6. Empaquetar y distribuir un artefacto Android identificable, y documentar las verificaciones automatizadas y en dispositivo con sus métodos, resultados, versiones y cobertura, sin presentar como cumplidos los criterios no medidos.
7. Mantener evidencia versionada de la evolución del proyecto —requisitos, decisiones, hitos, código, pruebas e informe— que permita reconstruir y evaluar el trabajo realizado.

## 1.4. Justificación y Alcance

### 1.4.1. Justificación académica y de producto

La justificación académica reside en abordar un problema de software de manera integral, en lugar de limitar la entrega a una interfaz funcional. Relacioné necesidades de usuarios con requisitos, modelos, decisiones arquitectónicas, persistencia, implementación, pruebas y documentación. En los registros de decisiones arquitectónicas —ADR— documenté las razones y consecuencias de las elecciones técnicas; los requisitos, informes de hito y el historial de versiones permiten contrastar lo planificado con lo implementado y verificado.

Desde la perspectiva de producto, el valor propuesto es disponer de apuntes organizados para su consulta en el contexto relevado, sin exigir una cuenta ni una conexión para las operaciones locales principales. La ausencia de backend propio y el almacenamiento en el dispositivo acotan las dependencias del núcleo de la aplicación. No constituyen, sin embargo, una garantía absoluta de privacidad o conservación: la pérdida del teléfono, la desinstalación y la gestión de copias externas siguen siendo riesgos que deben comunicarse. Una exportación iniciada por el usuario puede entregar el archivo a otra aplicación o servicio elegido por él.

La organización por materias responde a una preferencia declarada de la muestra; la persistencia local y el respaldo atienden la necesidad de conservar información. Markdown se utiliza como texto plano con marcas de formato y permite incluir notas legibles fuera de Lumapse dentro del respaldo. Estas decisiones buscan mantener un alcance comprensible y portabilidad de los contenidos. Su pertinencia no demuestra por sí sola satisfacción sostenida, demanda comercial o una mejora del desempeño académico.

### 1.4.2. Alcance funcional implementado

Definí el alcance mediante requisitos funcionales y criterios de aceptación, cuyo análisis presento en la sección 2.6.1 y cuya implementación desarrollo en el capítulo 5. Las funcionalidades implementadas comprenden:

- **Captura y lectura de notas:** creación y edición de título y contenido, texto plano o Markdown, previsualización sanitizada y herramientas opcionales de formato e inserción. Markdown no es un requisito para comenzar a escribir.
- **Continuidad del trabajo:** conservación local de un borrador del editor, diferenciada de la nota confirmada. Crear o actualizar una nota requiere una acción explícita; recuperar un borrador no equivale a haber guardado una nueva nota definitiva.
- **Organización y recuperación:** materias y secciones, búsqueda por título y contenido, fijación, archivo, marcadores visuales de estado académico y papelera con restauración y eliminación permanente. La papelera no reemplaza a una copia de seguridad externa.
- **Fechas académicas puntuales:** registro de parciales, finales, trabajos prácticos y exposiciones, con asociación opcional a materia o sección. Son recordatorios visuales pasivos, no una agenda con horarios, recurrencias o notificaciones.
- **Respaldo y portabilidad manual:** exportación del espacio de trabajo en ZIP con manifiesto, datos estructurados y notas Markdown legibles; importación de ZIP generado por Lumapse, con validación previa, vista de los elementos a importar, tratamiento no destructivo de duplicados y escritura transaccional. El ZIP no incluye borradores ni elementos en papelera y no es una imagen completa de todo el estado de la aplicación.
- **Interfaz e identificación:** temas claro y oscuro y una sección «Acerca de» con información del producto y de la compilación, además de los controles de navegación asociados a los flujos anteriores.

Esta enumeración describe funcionalidades presentes, no certifica que cada recorrido haya sido probado sobre todo dispositivo o sobre cada binario distribuido. La separación entre implementación y verificación es necesaria para interpretar el alcance de la entrega.

### 1.4.3. Delimitaciones técnicas y funcionales

El producto presentado es una aplicación Android distribuida como paquete instalable APK. Adopté un monolito modular cliente con separación pragmática de responsabilidades, no un sistema cliente-servidor ni una aplicación completamente escrita con interfaces nativas de Android. El entorno web con SQLite/WebAssembly se conserva para desarrollo y pruebas auxiliares; no constituye un canal PWA soportado ni una entrega para escritorio o iOS. Formalicé esta clasificación y sus límites en ADR-008; en la sección 4.8 analizo los patrones y las fronteras de la arquitectura.

Quedan fuera del corte la sincronización automática entre dispositivos, el backend multiusuario, la colaboración en tiempo real, el respaldo automático en la nube, la integración directa con la API de Google Drive, los adjuntos multimedia y una agenda académica completa. También se encuentran postergadas la acción de compartir una nota individual y la importación individual de archivos Markdown. La existencia de notas legibles dentro del ZIP no implica que esos flujos individuales estén disponibles.

La distribución mediante tiendas de aplicaciones, el uso autónomo del canal de instalación por nuevos estudiantes y la extensión a otras instituciones requieren decisiones o validaciones propias. No los considero demostrados por la viabilidad técnica del APK ni por la intención declarada de probar el prototipo. Mantengo los trabajos excluidos y sus condiciones de eventual revisión como trabajo futuro, tratado en la sección 7.3, sin incorporarlos automáticamente a esta entrega.

### 1.4.4. Corte de presentación y límites de la evidencia

Fijé como corte de presentación **Lumapse 0.6.0, código Android 600, Release Candidate 1 (RC1)**, publicado como versión preliminar el 22 de octubre de 2026. Adopté este candidato con validación parcial y con las limitaciones de cobertura expresamente reconocidas. El APK procede del commit de código fuente `bcefe6a`; la etiqueta de versión `v0.6.0` apunta a `ac2a747`, que incluye la integración posterior. No son identificadores intercambiables. La firma, la huella criptográfica y las comprobaciones del binario forman parte de su registro de identificación y de la evidencia que corresponde desarrollar en el capítulo 6. Conservo las betas `v0.4.8` y `v0.5.0` como antecedentes, sin atribuir automáticamente sus resultados a la RC1.

Al evaluar la evidencia, distingo controles sobre el código fuente, pruebas automatizadas y recorridos en un dispositivo y artefacto identificados. La existencia de una funcionalidad, una compilación correcta o una aceptación general de la entrega no equivalen a una verificación exhaustiva. Las métricas de latencia de operaciones, fluidez con 500 notas y tiempo de primera nota de un usuario nuevo conservan sus estados pendientes: corresponden a los requisitos no funcionales RNF-002, RNF-004 y RNF-005, respectivamente. En el capítulo 6 se trata el alcance de su verificación. No considero demostrado un rendimiento óptimo ni facilidad de uso sin las mediciones correspondientes.

Para acotar el cierre académico, decidí congelar el desarrollo y las nuevas comprobaciones de la aplicación hasta después de la presentación. Diferí los recorridos restantes del núcleo offline, organización y búsqueda, fechas, ZIP y tráfico sobre el APK exacto, sin considerarlos aprobados. En este informe utilizo la evidencia existente con sus límites; no presento la entrega como una versión estable ni supongo ausencia de defectos. Esta delimitación permite evaluar el trabajo efectivamente realizado, las decisiones que fundamenté y los aspectos que todavía requieren evidencia.
