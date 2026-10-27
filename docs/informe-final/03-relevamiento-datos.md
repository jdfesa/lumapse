# Capítulo 3: Relevamiento y Análisis de Datos

En este capítulo presento el relevamiento de mayo de 2026 y explico cómo pasé de las respuestas a los hallazgos que orientaron Lumapse. El propósito fue contrastar hábitos, dificultades y preferencias del contexto estudiantil, no demostrar la eficacia de una aplicación terminada. Distingo los datos observados, su interpretación y las decisiones posteriores.

Las tablas son de elaboración propia a partir de las 120 respuestas válidas. En cada caso indico la base de cálculo; los porcentajes se redondean a una cifra decimal. Las diferencias de redondeo y las preguntas de selección múltiple impiden suponer que toda tabla deba sumar exactamente 100 %.

## 3.1. Metodología de Recolección (Población y Muestra)

### 3.1.1. Población de referencia y selección

Definí como población objetivo a estudiantes regulares del IES 6023 «Dr. Alfredo Loutaif» durante el ciclo lectivo 2026, excluyendo a quienes asistían únicamente a rendir exámenes. El diseño registra 1.239 estudiantes, tres turnos y siete carreras con matrícula activa como población de referencia. No utilicé una lista nominal para seleccionar participantes al azar.

Distribuí una encuesta autoadministrada en Google Forms mediante grupos de WhatsApp, pósteres con código QR en aulas y colaboración para difundir el enlace. La selección fue no probabilística por conveniencia: dependió del acceso al formulario y de la decisión de responder. Procurar cobertura de distintos turnos no equivale a aplicar cuotas proporcionales ni probabilidades de inclusión conocidas.

| Característica | Registro del estudio |
|---|---|
| Población de referencia consignada en el diseño | 1.239 estudiantes regulares |
| Recolección | 11 al 13 de mayo de 2026 |
| Respuestas recolectadas | 121 |
| Exclusión aplicada | Un registro que indicó asistir sólo a rendir |
| Base analítica | 120 respuestas válidas |
| Selección | No probabilística por conveniencia |
| Instrumento | Doce preguntas numeradas P1–P12 y una adicional condicional, P5b |

La meta operativa mínima fue reunir 90 respuestas. Para dimensionarla utilicé como referencia la fórmula de población finita:

$$
n^* = \frac{N Z^2 p(1-p)}{e^2(N-1)+Z^2p(1-p)}
$$

En la fórmula, N es la población de referencia; Z, el valor normal asociado al nivel nominal de confianza; p, la proporción supuesta, y e, el error tolerado en ese escenario. Con N = 1.239, Z = 1,96, p = 0,5 —máxima variabilidad— y e = 0,10, el objetivo nominal redondeado hacia arriba es 90. Para 120 respuestas, el cálculo hipotético arroja aproximadamente 8,5 % al nivel nominal de 95 %. Esos valores suponen selección aleatoria simple: describen el escenario de planificación, no un margen efectivo de este estudio. Superar la meta no corrige el sesgo de selección ni convierte la muestra por conveniencia en probabilística.

La bitácora documenta cierre anticipado al superar el mínimo. Utilizo el intervalo de fechas comprobable, 11–13 de mayo; la correspondencia horaria entre esa bitácora y las marcas del CSV permanece pendiente de reconciliación. No atribuyo al archivo una duración exacta ni una tasa horaria de respuesta.

### 3.1.2. Instrumento y ramificaciones

El formulario combinó perfil demográfico, método principal de toma de notas, dificultades, conectividad, utilidad percibida y preferencias de funcionalidades, dispositivo y organización. P12 fue una pregunta abierta opcional. Las preguntas cerradas usaron respuesta única, una valoración de cinco puntos o selección múltiple, según el caso.

La ramificación evitó preguntar por dificultades de una actividad que la persona había declarado no realizar:

- Quienes eligieron «No tomo notas» en P4 pasaron a P6, sin responder P5 ni P5b.
- Quienes tomaban notas respondieron P5 sobre dificultad percibida.
- Sólo quienes respondieron afirmativamente a P5 detallaron dificultades en P5b.
- P6–P12 correspondían al conjunto de participantes, con P12 opcional.

Comprobé que las bases resultantes respetan ese recorrido: cinco registros sin toma de notas, 115 a los que aplica P5 y 56 con dificultad declarada a los que aplica P5b. Los saltos son ausencia prevista por diseño, no respuestas que deban completarse artificialmente.

P7 preguntó por una propuesta conjunta: «una app web gratuita, sin cuenta, para tomar notas de estudio». No aisló el efecto de cada atributo. P8 solicitó elegir hasta tres características; la exportación demuestra que ese máximo no quedó asegurado. Estas propiedades del instrumento delimitan las interpretaciones posteriores.

### 3.1.3. Tratamiento y control de los datos

Conservé el CSV original y contrasté las frecuencias con las reglas del análisis documentado en Python. El proceso normaliza finales de línea, identifica las columnas y aplica la exclusión poblacional. Además, reclasifica un registro de doble turno a Tarde y una respuesta de doble carrera a Lengua y Literatura. Son convenciones del tratamiento, no asignaciones aleatorias ni cambios en la composición de la matrícula.

Las marcas temporales se interpretan en orden mes/día/año. El archivo no explicita por sí solo la zona horaria necesaria para reconciliarlas con la bitácora. Los conteos de este capítulo dependen del criterio poblacional y de las respuestas, no de seleccionar registros mediante una ventana horaria supuesta.

Para separar respuestas múltiples, el análisis distingue comas fuera de paréntesis. Esa regla preserva opciones como «formato (títulos, listas, tablas, fórmulas)», pero una coma dentro de texto libre puede generar fragmentos adicionales. Por ello diferencio respuestas, opciones predefinidas y fragmentos del procesamiento; no los considero unidades intercambiables.

Los scripts conservados separan limpieza, frecuencias, cruces, clasificación de comentarios y gráficos. Esa estructura permite rastrear operaciones, pero no garantiza calidad semántica ni elimina sesgos del instrumento. Las comprobaciones de este informe no implican una nueva recolección ni validan automáticamente todas las interpretaciones del análisis inicial.

## 3.2. Análisis Demográfico

Los tres turnos estuvieron presentes, con mayor cantidad de respuestas en tarde y noche. La base es de 120 registros después de las reclasificaciones indicadas.

| Turno | Respuestas | Porcentaje |
|---|---:|---:|
| Tarde | 56 | 46,7 % |
| Noche | 47 | 39,2 % |
| Mañana | 17 | 14,2 % |

Se observaron seis de las siete carreras consignadas en la población de referencia. No hubo una respuesta válida del Profesorado en Física.

| Carrera | Respuestas | Porcentaje |
|---|---:|---:|
| Educación Primaria | 35 | 29,2 % |
| Educación Especial | 26 | 21,7 % |
| Sistemas | 22 | 18,3 % |
| Lengua y Literatura | 21 | 17,5 % |
| Danzas | 9 | 7,5 % |
| Turismo | 7 | 5,8 % |

Las cuatro carreras con más respuestas reúnen 104 de 120 registros (86,7 %). No dispongo en este análisis de una distribución institucional por turno y carrera que permita evaluar proporcionalidad; la diversidad observada no demuestra representatividad de la matrícula.

En P3, 56 respuestas correspondieron a 18–22 años, 35 a 23–27, 23 a 28–35, cinco a 36–45 y una a 46 o más. Los dos primeros grupos suman 91 de 120 (75,8 %). La edad describe la muestra, no alfabetización digital; el único registro del tramo mayor tampoco permite comparaciones de ese grupo.

## 3.3. Resultados sobre Hábitos de Estudio y Toma de Notas

### 3.3.1. Método principal y dificultades

P4 preguntó por el método principal utilizado en clase, no por todas las herramientas que cada participante pudiera emplear.

| Método principal | Respuestas, base 120 | Porcentaje |
|---|---:|---:|
| Cuaderno o papel | 106 | 88,3 % |
| Celular | 7 | 5,8 % |
| No toma notas | 5 | 4,2 % |
| Notebook o PC | 1 | 0,8 % |
| Tablet | 1 | 0,8 % |

Los dispositivos digitales suman nueve respuestas (7,5 %). El predominio del papel caracteriza el hábito de partida, pero no indica por qué se lo prefiere ni permite afirmar que nunca se utilicen aplicaciones como recurso secundario. Tampoco identifica un competidor único de Lumapse.

Entre las 115 respuestas a las que aplica P5, 56 declaran dificultad (48,7 %) y 59 no la declaran (51,3 %). P5b utiliza exclusivamente las 56 afirmativas como denominador:

| Dificultad predefinida | Respuestas que la incluyen, base 56 | Porcentaje |
|---|---:|---:|
| Pérdida de notas | 33 | 58,9 % |
| Desorganización rápida | 33 | 58,9 % |
| Dificultad para organizar el formato | 22 | 39,3 % |
| No encontrar lo buscado | 13 | 23,2 % |
| No poder acceder sin internet | 3 | 5,4 % |

Son selecciones múltiples: una respuesta puede aparecer en varias filas y los porcentajes no deben sumarse como grupos disjuntos. Pérdida y desorganización tienen igual frecuencia, sin que ello demuestre causalidad, gravedad equivalente o que afecten a personas diferentes.

Cinco respuestas contienen formulaciones libres adicionales. El separador automático produce seis fragmentos de esos textos: la única salida de cuatro fragmentos reúne dos opciones cerradas y una formulación libre con coma. No constituye evidencia suficiente de cuatro opciones seleccionadas ni permite atribuir esos fragmentos a seis personas. Reporto las cinco categorías predefinidas por separado, sin crear una categoría homogénea a partir de fragmentos de redacción.

### 3.3.2. Conectividad y características seleccionadas

P6 recoge frecuencia declarada de acceso estable a internet en el instituto:

| Frecuencia | Respuestas, base 120 | Porcentaje |
|---|---:|---:|
| Siempre | 7 | 5,8 % |
| Casi siempre | 15 | 12,5 % |
| A veces | 42 | 35,0 % |
| Raramente | 29 | 24,2 % |
| Nunca | 27 | 22,5 % |

Las tres últimas categorías suman 98 respuestas (81,7 %). Es una declaración sobre disponibilidad, no una medición de cobertura, velocidad o tiempo de actividad de la red. Orienta priorizar operaciones locales, sin demostrar todavía el funcionamiento offline de una implementación.

P8 registra las siguientes frecuencias:

| Característica | Respuestas que la seleccionan, base 120 | Porcentaje |
|---|---:|---:|
| Funcionar sin internet | 89 | 74,2 % |
| Organizar por materia | 88 | 73,3 % |
| Funcionar en celular y PC | 64 | 53,3 % |
| Guardar automáticamente | 63 | 52,5 % |
| Ser rápida | 54 | 45,0 % |
| No pedir cuenta | 13 | 10,8 % |

A diferencia del texto libre de P5b, P8 contiene seis opciones cerradas. Se observan 371 selecciones y 37 respuestas con cuatro a seis opciones, aunque la consigna pedía un máximo de tres. Por eso interpreto la tabla como frecuencia descriptiva sobre las 120 respuestas, no como un ranking de elección forzada uniforme. El total no es una muestra de 371 participantes.

Que «no pedir cuenta» tenga menos selecciones no demuestra aceptación de un registro obligatorio. Del mismo modo, elegir rapidez no mide latencia y seleccionar guardado automático no define por sí solo cuándo debe confirmarse una nota definitiva.

### 3.3.3. Utilidad percibida y disposición a una prueba

La valoración de la propuesta conjunta de P7 se distribuyó así:

| Valoración | Respuestas, base 120 | Porcentaje |
|---|---:|---:|
| 5 — Muy útil | 61 | 50,8 % |
| 4 — Útil | 36 | 30,0 % |
| 3 — Algo útil | 17 | 14,2 % |
| 2 — Poco útil | 4 | 3,3 % |
| 1 — Nada útil | 2 | 1,7 % |

Las valoraciones cuatro y cinco suman 97 respuestas (80,8 %). La media descriptiva de las puntuaciones es 4,25 y la mediana, cinco; no son una medición de satisfacción después de usar Lumapse. La pregunta combinó web, gratuidad, ausencia de cuenta y toma de notas, de modo que no permite atribuir la valoración a un componente aislado.

En P10 hubo 97 respuestas «Sí» y 23 «Tal vez» a una posible prueba, sin respuestas negativas. La suma de ambas categorías es 100 %, pero una disposición condicional no equivale a compromiso de participación. Estos datos no prueban uso efectivo, retención, intención de pago ni demanda comercial.

### 3.3.4. Dispositivo y organización preferidos

En P9, 87 respuestas eligieron celular (72,5 %), 27 «Cualquiera por igual» (22,5 %), cinco notebook o PC (4,2 %) y una tablet (0,8 %). Celular y «Cualquiera por igual» suman 114 de 120 (95,0 %): es una combinación de preferencias declaradas, no prueba de posesión, compatibilidad o disponibilidad permanente de esos dispositivos.

P11 permite contrastar el supuesto inicial de organización por etiquetas:

| Organización preferida | Respuestas, base 120 | Porcentaje |
|---|---:|---:|
| Carpetas por materia | 83 | 69,2 % |
| Etiquetas | 24 | 20,0 % |
| Indiferente si puede encontrar las notas | 9 | 7,5 % |
| Lista simple | 4 | 3,3 % |

El resultado respalda priorizar materias dentro de la muestra, sin demostrar que las etiquetas carezcan de valor. La pregunta no probó nombres de navegación, profundidad de carpetas ni recorridos de una interfaz. Esas decisiones requieren una justificación de diseño distinta de la frecuencia observada.

### 3.3.5. Cruces descriptivos

El análisis documentado contempla seis cruces entre turno y dificultades, carrera y dispositivo, dispositivo y organización, edad y método, edad y características, y método actual y dispositivo deseado. Sus tablas son descriptivas; no se presentan pruebas inferenciales de diferencias ni causalidad.

Dos ejemplos muestran su utilidad y su límite. Entre las 106 respuestas cuyo método principal es papel, 79 eligen celular para una aplicación de notas (74,5 %). El contraste distingue hábito actual y preferencia hipotética, sin explicar por qué todavía no usan ese dispositivo como medio principal. Entre quienes prefieren celular, 59 de 87 eligen materias (67,8 %); esto orienta ensayar una organización común, no demuestra que funcione sin dificultad.

Los grupos por carrera y edad son desiguales y algunos muy pequeños. Que una opción lidere en las seis carreras observadas no permite extender el resultado a Física ni afirmar equivalencia estadística entre carreras. Tampoco sumo los márgenes de cruces multirrespuesta como si fueran personas diferentes.

## 3.4. Análisis Cualitativo (Puntos de Dolor)

P12 recibió 41 respuestas no vacías, equivalentes al 34,2 % de la base de 120. Respondieron voluntariamente a una pregunta opcional; esa proporción no mide compromiso sostenido ni convierte sus temas en representativos del conjunto.

La clasificación conservada busca palabras o fragmentos de palabras en el texto convertido a minúsculas. Cada comentario puede recibir varias etiquetas; si no coincide con ninguna, se asigna a «Otros». El recuento reproducible es:

| Etiqueta del clasificador | Comentarios asignados |
|---|---:|
| Otros | 10 |
| Positivos o apoyo | 7 |
| Planificaciones docentes | 7 |
| Organización avanzada | 6 |
| Multimedia: fotos o audio | 5 |
| Velocidad de captura | 4 |
| Fórmulas o contenido técnico | 4 |
| Conectividad | 3 |
| Recuperación o historial | 3 |
| Agenda o calendario | 3 |

Los 41 comentarios generan 52 asignaciones y ocho reciben más de una etiqueta. No son 52 personas ni categorías excluyentes. «Otros» significa ausencia de coincidencia con las palabras previstas, no ausencia de una necesidad. Incluso la etiqueta de apoyo es una coincidencia léxica, no una medición validada de intención positiva.

Esta clasificación permite localizar temas para lectura contextual, pero no sustituye una interpretación semántica exhaustiva ni acredita acuerdo entre evaluadores. La propia pregunta ofrecía ejemplos de necesidades por carrera, lo que también pudo orientar las respuestas. No infiero prevalencia de necesidades ni diferencias firmes entre carreras a partir de esos grupos pequeños.

Los temas incluyen recursos de planificación docente, esquemas, contenido técnico, imágenes o audio y recuperación. Su aparición amplía las preguntas de producto, sin convertir cada comentario en un requisito obligatorio. Las fechas académicas puntuales implementadas son distintas de una agenda completa; multimedia y otras extensiones conservan su delimitación como trabajo futuro.

## 3.5. Conclusiones del Relevamiento e Impacto en el Producto

El relevamiento aportó evidencia exploratoria donde antes existían principalmente supuestos. La muestra describe un predominio del papel, dificultades de una parte de quienes toman notas, disponibilidad de conexión no permanente y preferencia declarada por celular y materias. Esas observaciones permiten orientar el prototipo, no certificar resultados de uso.

| Evidencia | Decisión informada | Lo que la encuesta no demuestra |
|---|---|---|
| P6 y selección de offline en P8 | Prioridad de operaciones locales y su comprobación | Disponibilidad real de todos los flujos del software sin red |
| Preferencia móvil en P9 | Diseño mobile-first, registrado en DP-003 | Preferencia por PWA o APK, aceptación de descarga directa o elección de SQLite |
| Carpetas por materia en P11 | Organización por materias, desarrollada en DP-002 y DP-004 | Validación de nombres, límite de dos niveles o recorridos de navegación |
| Pérdida declarada en P5b y protección de escritura en P8 | Conservación del trabajo; revisión posterior de RF-005 como borrador persistente | Preferencia por crear o actualizar notas definitivas sin confirmación |

La combinación de necesidades y restricciones técnicas dio lugar a decisiones de arquitectura registradas en ADR-005 y ADR-006, no a una elección tecnológica realizada por las personas encuestadas. La preferencia por uso en celular y PC permanece como señal de interés, no como entrega multiplataforma terminada.

Los principales límites son la selección por conveniencia y autoselección, cobertura incompleta y proporcionalidad no comprobada, duración horaria sin reconciliar, formulación conjunta de P7, máximo no asegurado en P8 y clasificación léxica de una pregunta abierta opcional. La exportación tampoco acredita por sí sola unicidad de participantes. Conocer esos límites evita atribuir al tamaño de muestra una precisión o un control que el procedimiento no documenta.

La encuesta evaluó una propuesta inicial, no una sesión de uso de la RC1. No midió tiempos de primera nota, latencia, fluidez, comprensión de la instalación ni adopción sostenida. El capítulo 4 desarrolla las elecciones de diseño; los capítulos 5 y 6 distinguen su implementación y la evidencia de verificación. Esta separación mantiene una historia trazable desde las necesidades declaradas hasta el producto, sin convertir intención en resultado.
