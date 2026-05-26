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
| Margen de error estimado | Aproximadamente 8.5% |
| Instrumento | Google Forms, 12 preguntas + 1 condicional |
| Período de recolección | 11/05/2026 al 13/05/2026 |

El cálculo muestral se fundamentó con fórmula para poblaciones finitas, dado que la población era conocida y acotada. La justificación estadística completa se encuentra en [metodologia-muestral.md](../producto/metodologia-muestral.md), donde se documentan los escenarios de confianza, margen de error y contingencia.

## 3.2. Análisis Demográfico

La distribución demográfica permitió verificar que la muestra incluyera distintos turnos, carreras y rangos etarios relevantes para el proyecto.

En cuanto al turno de cursada, la muestra se concentró principalmente en los turnos tarde y noche:

| Turno | n | Porcentaje |
|---|---:|---:|
| Tarde | 56 | 46.7% |
| Noche | 47 | 39.2% |
| Mañana | 17 | 14.2% |

Respecto de las carreras, participaron estudiantes de las principales ofertas académicas activas. Las carreras con mayor presencia fueron Educación Primaria, Educación Especial, Sistemas y Lengua y Literatura, que en conjunto representan el 87.5% de la muestra.

| Carrera | n | Porcentaje |
|---|---:|---:|
| Educación Primaria | 35 | 29.2% |
| Educación Especial | 26 | 21.7% |
| Sistemas | 23 | 19.2% |
| Lengua y Literatura | 21 | 17.5% |
| Danzas | 9 | 7.5% |
| Turismo | 6 | 5.0% |

La distribución por edad mostró una mayoría de estudiantes jóvenes: el 75.8% se ubicó entre 18 y 27 años. Este dato resulta relevante porque confirma afinidad potencial con dispositivos móviles, aunque no implica necesariamente adopción previa de herramientas digitales para tomar notas.

## 3.3. Resultados sobre Hábitos de Estudio y Toma de Notas

El primer hallazgo significativo fue que el cuaderno o papel continúa siendo el método dominante de toma de notas. El 88.3% de los encuestados declaró usarlo como medio principal, mientras que solo el 7.5% utiliza algún dispositivo digital (celular, notebook o tablet).

| Método principal | n | Porcentaje |
|---|---:|---:|
| Cuaderno/papel | 106 | 88.3% |
| Celular | 7 | 5.8% |
| No tomo notas | 5 | 4.2% |
| Notebook/PC | 1 | 0.8% |
| Tablet | 1 | 0.8% |

Este resultado modifica la lectura del problema: Lumapse no compite principalmente contra otras aplicaciones, sino contra un hábito analógico consolidado. Para que una herramienta digital sea adoptada, debe ofrecer una ventaja clara sin introducir fricción adicional.

Entre quienes toman notas, el 48.7% reconoció dificultades con su método actual. Las dificultades principales fueron pérdida de notas y desorganización rápida, ambas con 58.9% entre quienes reportaron problemas.

| Dificultad reportada | n | Porcentaje sobre quienes reportaron dificultad |
|---|---:|---:|
| Pierdo notas con frecuencia | 33 | 58.9% |
| Se desorganizan rápido | 33 | 58.9% |
| Me cuesta organizar el formato | 22 | 39.3% |
| No encuentro lo que busco | 13 | 23.2% |
| No puedo acceder desde otro dispositivo | 3 | 5.4% |

La conectividad institucional fue otro hallazgo crítico. El 81.7% de los estudiantes percibió conectividad deficiente, sumando las respuestas "A veces", "Raramente" y "Nunca". Este dato convierte al funcionamiento offline en un requisito central, no en una mejora opcional.

En cuanto a la propuesta de valor, el 80.8% calificó como útil o muy útil una app que ayudara a organizar notas desde el celular. Además, el 99.2% manifestó que probaría o tal vez probaría un prototipo. Estos datos validan que existe interés suficiente para continuar el desarrollo y planificar una futura prueba con usuarios reales.

La priorización de funcionalidades mostró cuatro demandas principales:

| Funcionalidad | Porcentaje |
|---|---:|
| Que funcione sin internet | 74.2% |
| Que permita organizar por materia | 73.3% |
| Que funcione en celular y PC | 53.3% |
| Que guarde automáticamente | 52.5% |

El dispositivo preferido fue el celular, elegido por el 72.5% de los encuestados. Si se suma la opción "cualquiera por igual", el 95% incluye al celular como dispositivo aceptable. Este resultado fundamentó la prioridad mobile-first y el pivote a APK nativa.

## 3.4. Análisis Cualitativo (Puntos de Dolor)

La encuesta incluyó una pregunta abierta opcional, respondida por 41 estudiantes. Esta tasa de participación, equivalente al 34.2% de la muestra, aportó indicios cualitativos valiosos para comprender necesidades no capturadas completamente por las preguntas cerradas.

Los comentarios se agruparon por categorías temáticas. Entre las más relevantes aparecieron:

| Categoría | Menciones | Interpretación |
|---|---:|---|
| Comentarios positivos o de apoyo | 7 | Indican apertura hacia la idea del producto. |
| Planificaciones docentes | 7 | Necesidad específica de profesorados. |
| Organización avanzada | 6 | Mapas mentales, esquemas, cuadros sinópticos. |
| Multimedia | 5 | Interés en fotos de pizarrón y audios. |
| Velocidad de captura | 4 | Necesidad de escribir rápido durante la clase. |
| Fórmulas o contenido técnico | 4 | Requisitos especializados por carrera. |
| Conectividad | 3 | Refuerzo cualitativo de la necesidad offline. |
| Recuperación o historial | 3 | Interés en no perder información. |
| Agenda o calendario | 3 | Posible línea futura de integración académica. |

Las necesidades emergentes varían por carrera. En los profesorados aparecen demandas vinculadas a planificaciones, imágenes y materiales didácticos; en Lengua y Literatura, estructuras textuales y grabación de audio; en Sistemas, diagramas, herramientas más técnicas y fechas de parciales. Estas diferencias no cambian el núcleo del MVP, pero sí ofrecen insumos para trabajo futuro.

El análisis cualitativo confirma que la velocidad, la organización y el acceso offline son preocupaciones reales. También muestra que funcionalidades como multimedia, plantillas o calendarios deben tratarse como extensiones futuras, porque podrían ampliar demasiado el alcance del MVP si se implementan prematuramente.

## 3.5. Conclusiones del Relevamiento e Impacto en el Producto

El relevamiento tuvo impacto directo en las decisiones del proyecto. Los resultados validaron algunas hipótesis iniciales, refutaron otras y justificaron pivotes significativos.

Las conclusiones principales fueron:

1. El problema existe y es percibido por una parte significativa de los estudiantes.
2. La demanda potencial es real: la propuesta fue considerada útil o muy útil por el 80.8%.
3. El celular es el dispositivo dominante para una futura app de notas.
4. La conectividad deficiente convierte al offline-first en requisito esencial.
5. La organización por materia es el modelo mental preferido por la mayoría.
6. El cuaderno físico es el competidor principal del producto, no otra app.

El impacto en el producto se materializó en cuatro decisiones centrales:

| Evidencia | Decisión tomada |
|---|---|
| 72.5% usaría la app desde el celular | Diseño mobile-first y empaquetado Android. |
| 81.7% reporta conectividad deficiente | Prioridad absoluta al funcionamiento offline. |
| 74.2% prioriza offline | Persistencia local robusta y sin dependencia de red. |
| 69.2% prefiere carpetas por materia | Pivote desde etiquetas hacia materias y secciones. |

De esta manera, el relevamiento no quedó como un anexo aislado, sino que funcionó como insumo metodológico para las decisiones de arquitectura, producto, UX y alcance. La trazabilidad entre datos y decisiones queda registrada en los documentos de producto, ADRs, requisitos y capítulos técnicos del presente informe.
