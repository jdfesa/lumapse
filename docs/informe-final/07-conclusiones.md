# Capítulo 7: Conclusiones

En este capítulo evalúo los resultados de Lumapse respecto de los objetivos formulados en la sección 1.3, recupero aprendizajes del proceso y delimito el trabajo que permanece abierto. El corte de presentación es **0.6.0/600 — Release Candidate 1 (RC1)**, publicado el 22 de octubre de 2026 y aceptado con validación parcial. Las conclusiones se apoyan en la implementación y en la evidencia existente, no en nuevas comprobaciones del APK ni en la expectativa de que toda mejora pendiente llegue a realizarse.

## 7.1. Cumplimiento de los objetivos y alcance del resultado

El resultado central es una aplicación Android de notas con almacenamiento local, organización académica y mecanismos de continuidad y portabilidad manual, acompañada por evidencia versionada de su construcción. Con ello materialicé el núcleo técnico del objetivo general y documenté las decisiones y verificaciones, aunque el cierre editorial de la entrega continúa pendiente. No equivale a demostrar que la aplicación mejora el aprendizaje, que fue adoptada de forma sostenida por estudiantes o que satisface universalmente todos los atributos de calidad.

La tabla 7-1 conserva la correspondencia con los siete objetivos específicos de la sección 1.3.2. Distingo lo realizado del alcance de su comprobación, en lugar de asignar un cumplimiento global a partir de la existencia del programa.

**Tabla 7-1. Síntesis de resultados respecto de los objetivos específicos**

| Objetivo | Resultado alcanzado | Alcance y límite |
|---|---|---|
| 1. Relevar y analizar hábitos, dificultades y preferencias | Encuesta con 121 respuestas recolectadas y 120 analizadas; instrumento, procesamiento y bases de cálculo explicitados en el capítulo 3 | Describe una muestra por conveniencia; no representa una prueba de uso ni una estimación inferencial de toda la población |
| 2. Traducir necesidades y restricciones en requisitos trazables | Requisitos, historias de usuario, criterios de aceptación y decisiones de producto relacionados en el capítulo 2 | Un requisito implementado o una preferencia declarada no acreditan satisfacción ni validación completa de un binario |
| 3. Diseñar y justificar una arquitectura modular local | Arquitectura Android/Capacitor con SQLite y separación pragmática de responsabilidades, fundamentada en el capítulo 4 y los ADR | Es una solución contextual, no una demostración de superioridad frente a todas las alternativas ni una arquitectura de capas estricta |
| 4. Implementar creación, edición, lectura, búsqueda y organización | Núcleo de notas en texto plano y Markdown, materias y secciones, búsqueda y controles asociados, descrito en el capítulo 5 | La presencia de las funciones no demuestra por sí sola rapidez, facilidad de uso ni todos los recorridos de la RC1 |
| 5. Incorporar continuidad y recuperación | Borrador persistente, guardado explícito, archivo, papelera y respaldo/importación ZIP, con mecanismos y evidencia delimitados en las secciones 5.4 y 6.3 | No garantizan recuperación ante toda interrupción o pérdida del dispositivo; el ZIP excluye borradores y papelera |
| 6. Distribuir un artefacto identificable y documentar sus verificaciones | RC1 firmada y publicada; fuente, identidad binaria, controles y actualizaciones distinguidos en la sección 6.3.3 | Aceptación con cobertura parcial; las pruebas de otros debugs y las métricas pendientes no se transfieren al APK publicado |
| 7. Mantener evidencia versionada de la evolución | Requisitos, decisiones, hitos, código, pruebas y capítulos fuente permiten reconstruir cambios y resultados | El corpus existe, pero el cierre editorial global, la matriz RNF final y la preparación de la defensa permanecen abiertos |

La pregunta del problema planteado en la sección 1.2 encuentra así una respuesta de diseño e implementación: relacioné necesidades declaradas con un núcleo local de captura, organización y consulta, y construí mecanismos para conservar trabajo y extraer datos sin depender de una sincronización propia. La encuesta fundamentó prioridades, mientras que la plataforma y la persistencia se eligieron mediante análisis técnico. No atribuyo a las personas participantes una elección de SQLite, del formato APK o de cada comportamiento de la interfaz.

El capítulo 6 establece hasta dónde llega la comprobación. Los casos offline y de continuidad tienen dispositivos y debugs identificados; la RC1 posee controles de fuente e identidad, apertura y actualizaciones acotadas. Permanecen pendientes las métricas de RNF-002, RNF-004 y RNF-005; se conservan la evidencia parcial de teclado y los recorridos diferidos sobre el binario exacto. Por ello, el resultado es un **prototipo Android con alcance y evidencia delimitados**, no una versión estable certificada ni una validación integral de experiencia de uso, accesibilidad, seguridad o rendimiento. El Hito 06 continúa abierto para los entregables documentales y la defensa.

## 7.2. Lecciones aprendidas

### 7.2.1. Relacionar necesidades con decisiones sin confundir sus evidencias

El relevamiento me permitió revisar la dirección del producto: prioricé el uso móvil, las operaciones sin conexión y la organización por materias. El aprendizaje no consiste en afirmar que los datos determinan automáticamente una tecnología. La encuesta no comparó motores de base de datos ni canales de distribución; esa elección exigió considerar persistencia, reutilización de la interfaz y restricciones del proyecto, como expliqué en las secciones 2.5.3 y 4.1.

La continuidad del editor muestra la misma distinción. La necesidad era proteger el trabajo en curso, pero no obligaba a guardar silenciosamente cada modificación como nota definitiva. La solución de borrador persistente y confirmación explícita conserva esa necesidad mediante un contrato diferente. Aprendí a separar problema, alternativa de solución y criterio de verificación: una preferencia puede orientar el diseño sin demostrar que la implementación elegida ya resulta comprensible o eficaz para todos sus usuarios.

### 7.2.2. Usar estimaciones como hipótesis y registros como evidencia

Para la integración de Capacitor y la migración de IndexedDB a SQLite documenté escenarios optimista, más probable y pesimista, tratados en la sección 2.1.3. Para Capacitor, los valores eran 3, 7 y 14 días; para SQLite, 2, 5 y 10. Esos valores hacían explícitos supuestos y riesgos. Los 14 días del cronograma consolidado, en cambio, sumaban 8 y 6 días tras redondear las estimaciones de cada módulo, no una duración real observada ni el escenario pesimista del conjunto. No puedo atribuir a la estimación un desvío evitado o una holgura efectiva que no medí.

El seguimiento de Story Points también exige interpretar qué se está contando. Sus tablas normalizan el alcance entregado e incorporan reclasificaciones de historias; una igualdad entre puntos planificados y entregados no demuestra ausencia de desvíos temporales ni precisión de la predicción original. Distingo una estimación previa de una reconstrucción posterior, sin afirmar una cronología de adopción que los registros no permiten comprobar. Los puntos no se convierten en horas, productividad ni métricas de flujo Kanban.

La principal lección de gestión es conservar desde el inicio los supuestos, cambios de alcance y registros temporales que permitan contrastarlos. No dispongo de horas completas y confiables para calcular un factor de ajuste real entre esfuerzo total y desarrollo puro; tampoco reconstruyo tiempos de ciclo a partir de commits. Las proporciones usadas en la planificación no sustituyen esa medición. La falta de datos debe quedar como límite, no resolverse con una cifra retrospectiva que sólo aparente exactitud.

### 7.2.3. Adaptar el entorno sin volver prescindibles los datos de prueba

El uso de un dispositivo dedicado con pantalla dañada y control remoto mediante scrcpy y ADB permitió sostener el trabajo Android con los recursos disponibles. Ese flujo quedó documentado y facilitó separar las pruebas del entorno de uso personal. No presento, sin embargo, una interacción desde la computadora como prueba de ergonomía con el dedo o como una sesión autónoma con estudiantes.

La separación del entorno tampoco convierte sus datos en desechables. El incidente de despliegue del precorte, desarrollado en la sección 6.3.3, mostró que un intermediario podía desinstalar ante una firma incompatible aunque el flujo anunciara conservación de datos. La recuperación comprobada y la protección posterior del instalador, formalizada en ADR-013, fueron parte del tratamiento, no una razón para ocultar el fallo.

Aprendí que reproducibilidad no significa sólo poder compilar: también implica identificar el artefacto, conocer los efectos del procedimiento y disponer de una referencia recuperable. Un dispositivo de pruebas no elimina la necesidad de proteger borradores y papelera; el ZIP de producto no contiene ese estado completo. La adaptación técnica resulta útil cuando conserva esas fronteras, no cuando consigue que una operación termine a cualquier costo.

### 7.2.4. Separar implementación, verificación y aceptación

El diagnóstico del borrador mostró que ver el texto en la interfaz y en `localStorage` no bastaba para acreditar su recuperación tras terminar el proceso. La corrección requirió cambiar la persistencia y el límite de confirmación, y volver a comprobar los casos afectados. Como se expuso en la sección 6.3.2, incluso el resultado favorable con SQLite conserva el límite anterior al commit; no lo transformo en una garantía absoluta de conservación.

Las comprobaciones de accesibilidad enseñaron algo equivalente: una puntuación favorable puede coexistir con hallazgos o comprobaciones manuales pendientes. Aumentar el número de tests, obtener una compilación correcta o superar el umbral de un instrumento no autoriza a extender el resultado más allá de su alcance. Por eso mantuve separados los controles automatizados, los recorridos Android y la aceptación de cada entrega.

La lección es definir qué observación acredita cada afirmación y qué resultado la haría fallar. Identificar fuente, binario, entorno y método evita confundir la evolución de `main` con una APK publicada, o una actualización de datos acotados con todas las migraciones posibles. La aceptación parcial de la RC1 es una decisión de alcance que conserva límites, no una prueba adicional que los elimina.

### 7.2.5. Mantener trazabilidad sin confundir documentación con validación

Mantener las fuentes en Markdown junto al código permitió seguir decisiones y correcciones mediante el historial de Git. Los ADR explican cambios como el pivote de plataforma, el borrador SQLite y el despliegue conservador; los requisitos y reportes permiten relacionarlos con necesidades y resultados. Ese corpus facilita examinar el trabajo, en lugar de depender únicamente de la aplicación funcionando durante una demostración.

La proximidad entre código y documentación no impide que un texto quede desactualizado. La evolución desde las betas hasta la RC1 mostró la necesidad de distinguir el registro histórico, la fuente vigente y el informe ensamblado. Un checkpoint reproducible puede seguir siendo históricamente correcto sin describir el corte actual. Corregir una conclusión tampoco justifica reescribir pruebas anteriores para atribuirles otro artefacto.

La recomendación que extraigo para otros proyectos individuales es registrar decisiones, cambios y límites al producirlos, y revisar su coherencia al cerrar una unidad. Ni un enlace válido verifica la veracidad de una afirmación ni un repositorio extenso sustituye la revisión editorial. La trazabilidad aporta valor cuando permite reconstruir por qué se decidió algo y con qué evidencia, no cuando sólo acumula documentos.

## 7.3. Trabajo futuro y posibles mejoras

Distingo tres horizontes: terminar los entregables académicos con la evidencia disponible, decidir la eventual reanudación de validaciones y mantenimiento después de la presentación, y evaluar nuevas capacidades. Esta separación evita que el backlog se convierta en una obligación de ampliar el producto antes de entregar. La congelación del 22 de octubre sigue vigente: no se recompila ni sustituye la RC1 ni se generan nuevas comprobaciones de app para completar el informe.

### 7.3.1. Cierre documental y defensa

El trabajo inmediato es documental y conserva los límites del candidato publicado:

- Completar las referencias y contrastar los metadatos incompletos de Gómez (2014) y Parada (2026) con los originales de cátedra, sin rellenarlos por suposición.
- Consolidar la matriz RNF final con método, fecha, artefacto, resultado y limitaciones, utilizando los registros existentes. La síntesis del capítulo 6 no convierte en verificadas las métricas pendientes.
- Completar la revisión final del manual de usuario 0.6.0 ya incorporado y publicado, manteniendo claras las diferencias entre nota, borrador, papelera y respaldo.
- Una vez revisadas las unidades fuente y las referencias, realizar la revisión transversal, actualizar metadatos y acordar el ensamblado. Después corresponde la maquetación LaTeX/PDF y la comprobación de tablas, citas y legibilidad de figuras.
- Preparar presentación, guion de demostración, respuestas y contingencia sobre el mismo corte identificado, con sus resultados y límites. La preparación de la defensa no sustituye pruebas faltantes ni exige otra APK.

El análisis final de gestión debe conservar la limitación de los registros de esfuerzo y de flujo. La actualización del tablero y las recomendaciones para proyectos futuros no requieren fabricar tiempos históricos o un factor de ajuste. Tampoco es necesario esperar respuestas de una encuesta voluntaria para cerrar los entregables; el feedback que se incorpore debe atribuirse a la versión efectivamente utilizada, sin inferir adopción ni abrir correcciones automáticamente.

### 7.3.2. Validación y mantenimiento después de la presentación

La reanudación técnica requiere un acuerdo propio, no se deduce de esta lista. Los frentes ya identificados incluyen:

- Decidir cómo retomar los recorridos diferidos de núcleo offline, organización/búsqueda, fechas, ZIP y tráfico/trackers sobre un binario inequívoco, sin heredar resultados de debugs anteriores.
- Resolver un método proporcionado y verificable para RNF-002 y RNF-004, manteniendo sus umbrales de **≤ 200 ms por operación CRUD** y **≥ 55 FPS durante el desplazamiento con al menos 500 notas**. La ausencia actual de métricas no se interpreta como un defecto de rendimiento demostrado ni como cumplimiento.
- Evaluar el uso con participantes nuevos, incluido RNF-005, cuyo límite de primera nota es **10 segundos o menos**. Las opiniones voluntarias posteriores al corte no reemplazan esa medición ni un estudio de uso sostenido.
- Priorizar mantenimiento de dependencias, comprobaciones de actualización y deuda técnica según riesgos y cambios concretos. Los componentes grandes, las mutaciones vecinas y la cobertura parcial de herramientas requieren su propio alcance y pruebas; no justifican refactors amplios por rutina.

La cobertura parcial de teclado y los límites de accesibilidad conservan el tratamiento del capítulo 6. Ampliar dispositivos, estados y tecnologías de asistencia sería otra validación, no una reinterpretación de los resultados existentes. Del mismo modo, una auditoría de dependencias de una fecha no demuestra que el grafo permanezca sin vulnerabilidades conocidas en futuros cortes.

### 7.3.3. Opciones de evolución, no compromisos de entrega

Las capacidades postergadas pueden revisarse si aparecen necesidades y evidencia que las justifiquen. Entre ellas están compartir e importar notas individuales, adjuntos, búsqueda especializada y mecanismos más avanzados de restauración. No son equivalentes al ZIP manual ya disponible: extender la portabilidad exige definir qué datos y conflictos se resuelven, no sólo agregar otro botón.

La integración directa con servicios externos, la sincronización multidispositivo, la colaboración, otros canales de distribución o el soporte de otras plataformas implican decisiones nuevas sobre privacidad, identidad, conflictos, costos y mantenimiento. No considero que estén aprobadas ni que su demanda se haya demostrado mediante la encuesta inicial. Antes de incorporarlas sería necesario contrastar su valor y sus consecuencias para el uso offline.

El criterio de evolución no es equiparar Lumapse con una plataforma generalista, sino preservar una captura y organización comprensibles para el contexto de estudio. Añadir funciones o migrar tecnologías sólo tendría sentido si resuelve un problema identificado y puede sostenerse sin debilitar la conservación y portabilidad del trabajo.

## 7.4. Cierre

Lumapse concreta una respuesta técnica acotada al problema de capturar, organizar y recuperar apuntes sin depender de una conexión permanente. Su aporte comprende el prototipo Android, el análisis que orientó su alcance y la evidencia que permite examinar decisiones y resultados. No demuestra por sí solo una mejora del aprendizaje, superioridad frente a otras herramientas ni adopción real.

La RC1 0.6.0/600 constituye el corte de presentación, con identidad registrada y validación parcial aceptada. Las betas previas conservan su lugar en la evolución, sin sustituir la evidencia del candidato. Cerrar responsablemente este desarrollo no significa vaciar el backlog o anunciar una versión estable: significa identificar lo construido, sostener sus afirmaciones con resultados y reconocer lo que falta comprobar.

En mi formación, el aprendizaje principal fue relacionar análisis, decisiones técnicas, implementación y verificación sin confundir sus alcances. El trabajo deja fuentes y registros que pueden estudiarse y continuarse, junto con límites que no desaparecen por el plazo de entrega. La consolidación documental y la defensa deben preservar esa misma coherencia entre lo que el sistema ofrece, lo que se comprobó y lo que permanece abierto.
