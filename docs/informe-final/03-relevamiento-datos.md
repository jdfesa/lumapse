# Capítulo 3: Relevamiento y Análisis de Datos

## 3.1. Metodología de Recolección (Población y Muestra)

El relevamiento de datos tuvo como objetivo validar necesidades, hábitos y problemas de estudiantes del IES 6023 en relación con la toma de notas. Se diseñó como una encuesta autoadministrada mediante Google Forms, distribuida por canales institucionales e informales: WhatsApp, difusión en aulas y código QR.

La población objetivo estuvo compuesta por estudiantes regulares del IES 6023 "Dr. Alfredo Loutaif" durante el ciclo lectivo 2026. El tamaño de población registrado fue de 1.239 estudiantes, distribuidos en turnos mañana, tarde y noche, y en carreras de formación docente y tecnicaturas.

La muestra final quedó compuesta por 120 respuestas válidas sobre 121 recolectadas. Se excluyó un registro correspondiente a una persona que indicó asistir únicamente a rendir, criterio de exclusión definido previamente en el diseño del relevamiento. La recolección se realizó entre el 11/05/2026 y el 13/05/2026, con cierre anticipado al superar el objetivo mínimo de respuestas.

| Parámetro | Valor |
|---|---|
| Población objetivo | Estudiantes regulares del IES 6023 |
| Tamaño de población | 1.239 estudiantes |
| Respuestas válidas | 120 |
| Tipo de muestreo | No probabilístico por conveniencia |
| Nivel de confianza de referencia | 95% |
| Margen nominal de referencia | Aproximadamente 8.5% bajo muestreo aleatorio simple; no es un intervalo efectivo para la muestra por conveniencia |
| Instrumento | Google Forms, 12 preguntas + 1 condicional |
| Período de recolección | 11/05/2026 al 13/05/2026 |

El cálculo muestral se fundamentó con fórmula para poblaciones finitas, dado que la población era conocida y acotada. La justificación estadística completa se encuentra en [metodologia-muestral.md](../producto/metodologia-muestral.md), donde se documentan los escenarios de confianza, margen de error y contingencia.

El nivel de confianza y el margen de error se utilizan como referencia para dimensionar la muestra, no como garantía de inferencia probabilística. Al tratarse de un muestreo por conveniencia, los resultados describen a las personas participantes y aportan evidencia útil para decisiones de producto, pero no permiten afirmar representatividad estadística perfecta de toda la población institucional.

## 3.2. Análisis Demográfico

La distribución demográfica permitió verificar que la muestra incluyera distintos turnos, carreras y rangos etarios relevantes para el proyecto.

En cuanto al turno de cursada, la muestra se concentró principalmente en los turnos tarde y noche:

| Turno | n | Porcentaje |
|---|---:|---:|
| Tarde | 56 | 46.7% |
| Noche | 47 | 39.2% |
| Mañana | 17 | 14.2% |

Respecto de las carreras, la muestra cubrió seis de las siete ofertas con matrícula activa; no hubo respuesta válida del Profesorado en Física. Las carreras con mayor presencia fueron Educación Primaria, Educación Especial, Sistemas y Lengua y Literatura, que en conjunto representan el 86.7% de la muestra. La selección por conveniencia y la ausencia de una tabla institucional por carrera impiden afirmar proporcionalidad con la matrícula.

| Carrera | n | Porcentaje |
|---|---:|---:|
| Educación Primaria | 35 | 29.2% |
| Educación Especial | 26 | 21.7% |
| Sistemas | 22 | 18.3% |
| Lengua y Literatura | 21 | 17.5% |
| Danzas | 9 | 7.5% |
| Turismo | 7 | 5.8% |

La distribución por edad mostró una mayoría de estudiantes jóvenes: el 75.8% se ubicó entre 18 y 27 años. El dato describe la composición de la muestra, pero la edad por sí sola no permite inferir afinidad tecnológica ni adopción previa de herramientas digitales para tomar notas.

## 3.3. Resultados sobre Hábitos de Estudio y Toma de Notas

El primer hallazgo significativo fue que el cuaderno o papel continúa siendo el método dominante de toma de notas. El 88.3% de los encuestados declaró usarlo como medio principal, mientras que solo el 7.5% utiliza algún dispositivo digital (celular, notebook o tablet).

| Método principal | n | Porcentaje |
|---|---:|---:|
| Cuaderno/papel | 106 | 88.3% |
| Celular | 7 | 5.8% |
| No tomo notas | 5 | 4.2% |
| Notebook/PC | 1 | 0.8% |
| Tablet | 1 | 0.8% |

Este resultado identifica al papel como hábito de partida predominante. La encuesta preguntó por el método principal, no por el conjunto de herramientas utilizadas ni por competidores percibidos; por ello no permite concluir que Lumapse compita exclusivamente o principalmente contra el cuaderno. Sí sugiere que el prototipo debe demostrar una ventaja clara sin introducir fricción adicional.

Entre quienes toman notas, el 48.7% reconoció dificultades con su método actual. Las dificultades principales fueron pérdida de notas y desorganización rápida, ambas con 58.9% entre quienes reportaron problemas.

| Dificultad reportada | n | Porcentaje sobre quienes reportaron dificultad |
|---|---:|---:|
| Pierdo notas con frecuencia | 33 | 58.9% |
| Se desorganizan rápido | 33 | 58.9% |
| Me cuesta organizar el formato | 22 | 39.3% |
| No encuentro lo que busco | 13 | 23.2% |
| No puedo acceder sin internet | 3 | 5.4% |

También se registraron seis formulaciones libres diferentes, con una mención cada una; no se fusionan en una categoría artificial. La consigna pedía hasta tres opciones, pero una respuesta contiene cuatro marcas, limitación que se conserva en el análisis.

Ante la pregunta por acceso estable a internet, el 81.7% respondió "A veces", "Raramente" o "Nunca". La pregunta no mide uptime ni calidad técnica, pero respalda priorizar y comprobar el funcionamiento offline en el contexto relevado.

En cuanto a la propuesta de valor, el 80.8% calificó como útil o muy útil la formulación aplicada: "una app web gratuita, sin cuenta, para tomar notas de estudio". La pregunta combina varios atributos y no permite atribuir el resultado a uno solo. En P10, el 100% respondió "Sí" o "Tal vez" ante una futura prueba; esa intención declarada facilita planificar reclutamiento, pero no garantiza participación, adopción ni uso sostenido.

La priorización de funcionalidades mostró cuatro demandas principales:

| Funcionalidad | Porcentaje |
|---|---:|
| Que funcione sin internet | 74.2% |
| Que permita organizar por materia | 73.3% |
| Que funcione en celular y PC | 53.3% |
| Que guarde automáticamente | 52.5% |

La consigna de P8 pedía hasta tres opciones, pero el CSV contiene 371 marcas y 37 respuestas con cuatro a seis selecciones. Por lo tanto, estas cifras se leen como frecuencias descriptivas sobre 120 personas, no como un ranking de elección forzada aplicado de manera uniforme.

El dispositivo preferido fue el celular, elegido por el 72.5% de los encuestados. Si se suma la opción "cualquiera por igual", el 95% incluye al celular como dispositivo aceptable. Este resultado fundamentó la prioridad mobile-first. La encuesta no comparó PWA y APK ni midió la disposición a instalar aplicaciones por un canal específico; el empaquetado Android y SQLite se definieron después mediante el análisis técnico de ADR-005 y ADR-006.

## 3.4. Análisis Cualitativo (Puntos de Dolor)

La encuesta incluyó una pregunta abierta opcional, respondida por 41 estudiantes. Esta tasa de participación, equivalente al 34.2% de la muestra, aportó indicios cualitativos valiosos para comprender necesidades no capturadas completamente por las preguntas cerradas.

Los comentarios se agruparon por categorías temáticas. Entre las más relevantes aparecieron:

| Categoría | Menciones | Interpretación |
|---|---:|---|
| Comentarios positivos o de apoyo | 7 | Expresiones favorables; no equivalen a conducta de adopción. |
| Planificaciones docentes | 7 | Necesidad específica de profesorados. |
| Organización avanzada | 6 | Mapas mentales, esquemas, cuadros sinópticos. |
| Multimedia | 5 | Interés en fotos de pizarrón y audios. |
| Velocidad de captura | 4 | Necesidad de escribir rápido durante la clase. |
| Fórmulas o contenido técnico | 4 | Requisitos especializados por carrera. |
| Conectividad | 3 | Refuerzo cualitativo de la necesidad offline. |
| Recuperación o historial | 3 | Interés en no perder información. |
| Agenda o calendario | 3 | Las fechas académicas discretas ya fueron implementadas; una agenda/calendario completo queda como posible extensión. |

Las necesidades emergentes varían por carrera. En los profesorados aparecen demandas vinculadas a planificaciones, imágenes y materiales didácticos; en Lengua y Literatura, estructuras textuales y grabación de audio; en Sistemas, diagramas, herramientas más técnicas y fechas de parciales. Estas diferencias no cambian el núcleo del MVP, pero sí ofrecen insumos para trabajo futuro.

El análisis cualitativo aporta respaldo adicional a velocidad, organización y acceso offline como preocupaciones de las personas participantes. También sugiere que funcionalidades como multimedia, plantillas o una agenda/calendario completo deben tratarse como extensiones futuras. La beta ya implementa fechas académicas discretas (`RF-027`), sin recurrencias, horarios ni planificación integral.

## 3.5. Conclusiones del Relevamiento e Impacto en el Producto

El relevamiento tuvo impacto directo en las decisiones del proyecto. Dentro de la muestra, los resultados respaldaron algunas hipótesis iniciales, contradijeron otras y aportaron evidencia para pivotes significativos.

Las conclusiones principales fueron:

1. Una parte relevante de la muestra declara dificultades al tomar y organizar notas.
2. El interés declarado es alto en la muestra: la propuesta fue considerada útil o muy útil por el 80.8%.
3. El celular es el dispositivo preferido en la muestra para una futura app de notas.
4. La disponibilidad de red no permanente y la selección de P8 respaldan priorizar offline-first.
5. La organización por materia es el modelo preferido por la mayoría de la muestra.
6. El cuaderno físico es el hábito principal declarado; la encuesta no identificó un competidor único ni midió el uso secundario de otras aplicaciones.

El impacto en el producto se materializó en cuatro decisiones centrales:

| Evidencia | Decisión tomada |
|---|---|
| 72.5% usaría la app desde el celular | Diseño mobile-first; el empaquetado Android se decidió después mediante análisis técnico. |
| 81.7% responde "A veces", "Raramente" o "Nunca" sobre acceso estable | Prioridad al funcionamiento offline. |
| 74.2% prioriza offline | Persistencia local robusta y sin dependencia de red. |
| 69.2% prefiere carpetas por materia | Pivote desde etiquetas hacia materias y secciones. |

En consecuencia, el relevamiento determina necesidades y prioridades de uso, pero no demuestra preferencia por un formato de distribución ni por una tecnología de persistencia. Esas decisiones corresponden a la evaluación arquitectónica documentada en [ADR-005](../adr/ADR-005-pivote-app-nativa.md) y [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

De esta manera, el relevamiento no quedó como un anexo aislado, sino que funcionó como insumo metodológico para las decisiones de arquitectura, producto, UX y alcance. La trazabilidad entre datos y decisiones queda registrada en los documentos de producto, ADRs, requisitos y capítulos técnicos del presente informe.
