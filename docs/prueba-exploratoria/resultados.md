# Resultados de la prueba exploratoria de Lumapse

> **Cierre:** 22 de noviembre de 2026. **Base:** 22 respuestas.
> **Finalidad:** primeras experiencias y barreras de inicio entre voluntarios.
> Análisis descriptivo, sin pretensión de representatividad ni validación técnica del APK.

## Síntesis

- **13 de 22 respuestas (59,1 %)** declaran haber usado Lumapse: seis de manera
  parcial y siete con el recorrido sugerido. Nueve declaran no haberla usado.
- Entre las 13 respuestas con uso, **nueve (69,2 %)** califican la experiencia
  como fácil o muy fácil y cuatro como ni fácil ni difícil. Ninguna eligió
  difícil o muy difícil.
- Diez de esas 13 respuestas señalan «Ninguna» como dificultad principal.
  Las otras tres se distribuyen entre organización/búsqueda, errores o cierres
  y otra dificultad, con una respuesta en cada opción.
- Entre las nueve respuestas sin uso, los motivos principales son falta de
  tiempo (tres), otro motivo (tres), descarga/instalación (dos) y orientación
  para empezar (una). **«Otro motivo» no identifica un dispositivo ni permite
  contar usuarios de iPhone.**

## 1. Procedencia, propósito y alcance

El [instrumento y su árbol](./README.md#las-cinco-preguntas) distinguen dos
recorridos: experiencia y dificultades para quien declaró uso, y motivos para
no empezar para quien no lo declaró. La invitación propuso probar
**Lumapse v0.6.0 RC1**, crear unas cinco notas, organizar y buscar, y explorar el
calendario durante unos diez minutos. Era una orientación flexible, no una
condición de inclusión ni un protocolo observado de cumplimiento de tareas.

La convocatoria se dirigió a estudiantes dispuestos a colaborar voluntariamente.
El objetivo fue conocer primeras impresiones, utilidad percibida y posibles
fricciones, no estimar su frecuencia en la población estudiantil. No hubo un
objetivo de tamaño representativo, selección aleatoria ni medición controlada.
El CSV tampoco verifica condición de estudiante, identidad, dispositivo o
versión instalada.

Se conserva del [relevamiento de mayo](../../analisis-relevamiento/README.md)
la separación entre datos originales, cálculo e interpretación. Aquel
relevamiento de hábitos y necesidades también se describe como una muestra por
conveniencia; esta prueba posterior al corte tiene otra finalidad y otro
instrumento. Sus porcentajes no son comparaciones antes/después ni evidencia de
mejora respecto de aquella encuesta.

### Fuente y calidad de los datos

El [CSV crudo público](./datos/respuestas_experiencia_2026_11.csv) contiene las
22 respuestas conservadas al cerrar Google Forms. Su exportación, integridad y
procedencia están documentadas en el [registro del cierre](./README.md#cierre-y-datos-originales).
Las respuestas son anónimas respecto de la identificación directa: no se
recopilaron nombres ni correos. Se mantienen las marcas temporales y los textos
libres originales, sin prometer anonimato absoluto o unicidad de participantes.

| Hecho comprobado | Resultado |
|---|---|
| Apertura documentada | 10/11/2026 |
| Cierre de recepción y exportación | 22/11/2026 |
| Fechas de los envíos registrados | 10–20/11/2026, con offset explícito GMT-3 |
| Filas de respuestas / columnas | 22 / 6 |
| Filas excluidas | 0 |
| Filas exactamente duplicadas, incluida la marca temporal | 0 |
| Coherencia con los saltos de P1 | Las 22 filas respetan su recorrido |

La ausencia de filas idénticas **no demuestra 22 personas distintas**. No se
recopilaron identificadores y no se activó el límite de una respuesta por cuenta.
Tampoco se conoce aquí el total de personas invitadas o que abrieron el
formulario; por eso no se calcula tasa de respuesta, conversión de la invitación
ni abandono del formulario.

### Bases y tratamiento

P1 usa las 22 respuestas. P2, P3 y P4 usan las **13 con uso declarado**. P5 usa
las **nueve sin uso declarado**, incluidas dos que sí declararon instalación.
Los nueve blancos de cada una de P2/P3/P4 y los trece de P5 corresponden a
preguntas no mostradas por el recorrido; no se imputaron como respuestas
negativas ni se eliminaron esas filas.

Las tablas incluyen opciones con frecuencia cero. Los porcentajes se calculan
sobre la base indicada y se redondean a un decimal; pueden no sumar exactamente
100 %. Se priorizan los recuentos absolutos por el tamaño reducido de las bases.
El [recuento reproducible](./resumen.json) y sus
[instrucciones](./README.md#reproducción-del-recuento) permiten contrastar tablas,
cruces y textos. La interpretación cualitativa de la sección 4 es una lectura
descriptiva, sin clasificador automático de sentimiento ni prueba inferencial.

## 2. Participación declarada — P1

**Base: 22 respuestas.**

| ¿Hasta dónde llegaste con la prueba? | n | % |
|---|---:|---:|
| No llegué a instalarla. | 7 | 31,8 |
| La instalé, pero no llegué a usarla. | 2 | 9,1 |
| La usé y realicé sólo una parte del recorrido sugerido. | 6 | 27,3 |
| La usé y realicé el recorrido sugerido. | 7 | 31,8 |
| **Total** | **22** | **100,0** |

El uso declarado reúne 13 respuestas (59,1 %) y la ausencia de uso nueve
(40,9 %). No haber instalado y haber instalado sin usar son etapas distintas;
no corresponde describir las nueve respuestas como fallos de instalación.
Las siete que declaran el recorrido completo no acreditan por sí mismas una
prueba observada de cada función. Tampoco prueban uso sostenido o adopción.

## 3. Facilidad percibida y dificultades de uso

### P2. ¿Qué tan fácil o difícil te resultó usar Lumapse?

**Base: 13 respuestas con uso declarado.**

| Opción | n | % |
|---|---:|---:|
| Muy fácil. | 4 | 30,8 |
| Fácil. | 5 | 38,5 |
| Ni fácil ni difícil. | 4 | 30,8 |
| Difícil. | 0 | 0,0 |
| Muy difícil. | 0 | 0,0 |
| **Total** | **13** | **100,0** |

Nueve respuestas (69,2 %) valoran el uso como fácil o muy fácil. Las cuatro
neutrales no se suman a ese grupo ni se interpretan como rechazo. El resultado
describe la percepción de quienes llegaron a usar la app y respondieron;
no debe trasladarse a quienes no empezaron ni a todos los estudiantes.

### P4. ¿Cuál fue tu principal dificultad al usar Lumapse?

**Base: 13 respuestas con uso declarado.**

| Opción | n | % |
|---|---:|---:|
| Ninguna. | 10 | 76,9 |
| Crear o guardar notas. | 0 | 0,0 |
| Organizar o encontrar mis notas. | 1 | 7,7 |
| Usar el calendario o las fechas. | 0 | 0,0 |
| Errores o cierres de la app. | 1 | 7,7 |
| Otra dificultad. | 1 | 7,7 |
| **Total** | **13** | **100,0** |

Tres respuestas (23,1 %) señalan una dificultad principal. La fila R02 menciona
organización/búsqueda, R17 errores o cierres y R12 otra dificultad. Se conservan
como **fricciones autoinformadas**, no como tres defectos técnicos confirmados.
P4 no solicita acción exacta, mensaje, frecuencia, condiciones o diagnóstico;
«Otra dificultad» tampoco ofrece texto adicional.

La única respuesta que eligió errores o cierres calificó el uso como «Ni fácil
ni difícil» y valoró favorablemente la idea en P3. Una valoración favorable
puede coexistir con una dificultad: no corresponde descartar esa señal ni
convertir la opinión positiva en ausencia de errores.

«Ninguna» identifica la opción principal elegida, no una certificación de
ausencia de fallos. El cero en calendario o guardado tampoco demuestra que
todas las personas probaran esos flujos sin problemas.

## 4. Utilidad percibida — P3

**Base: 13 textos de quienes declararon uso.** Se reproducen completos, sin
corregir ortografía y omitiendo sólo espacios exteriores para presentarlos.
Los identificadores corresponden al orden de las filas del CSV, no a personas.

| Fila | Respuesta original |
|---|---|
| R01 | Es practica |
| R02 | cambiar la fuente y tamaño |
| R05 | Me resultó útil |
| R07 | me resultó útil al momento de poder hacer y organizar los apuntes de manera mucho mas fácil además de poder fijarlos o editarlos una vez ya guardado. |
| R08 | Útil |
| R09 | Me dió resultados positivos |
| R10 | Es rapido para tomar apuntes y se puede guardar con un título aparte de los apuntes anotado abajo |
| R12 | Archivar notas |
| R13 | Ah la hora de buscar y acomodar mis ideas de forma más prolija y los archivos también |
| R15 | Es útil para tomar nota de algo que tengas en un día, como parciales, lección oral como recordatorio en resúmen |
| R17 | Me parece que la idea está buenísima |
| R19 | Si me resultó útil para organizar las materia |
| R20 | Nuevo a conocer |

La lectura permite distinguir estos aportes, sin convertirlos en categorías
excluyentes o porcentajes de satisfacción:

- **Captura y organización:** R07, R10, R13 y R19 describen hacer, guardar,
  ordenar o encontrar apuntes e ideas. R07 menciona además fijar y editar.
  Son ejemplos de utilidad percibida, no mediciones de rapidez o de calidad
  del aprendizaje. La referencia a «archivos» de R13 no identifica un flujo
  concreto ni demuestra soporte de adjuntos.
- **Notas para actividades académicas:** R15 menciona parciales y lecciones
  como recordatorio. No permite determinar si utilizó el calendario ni
  demuestra notificaciones o recordatorios automáticos.
- **Menciones de funciones sin contexto suficiente:** R12 nombra archivar
  notas y R02 fuente/tamaño. No detallan el beneficio, el control usado o la
  dificultad concreta; no se transforman en pruebas funcionales.
- **Valoraciones generales:** R01, R05, R08, R09 y R17 expresan apreciaciones
  favorables sin describir un caso de uso verificable.
- **Respuesta indeterminada:** «Nuevo a conocer» (R20) no permite establecer
  un beneficio concreto ni una valoración positiva o negativa. No se fuerza
  su interpretación como satisfacción.

No aparece la frase «No me resultó útil», pero su ausencia no convierte los
trece textos en evidencia inequívoca de utilidad. La pregunta y la brevedad de
las respuestas limitan la profundidad del análisis.

## 5. Motivos para no empezar — P5

**Base: nueve respuestas sin uso declarado.**

| Opción | n | % |
|---|---:|---:|
| Falta de tiempo. | 3 | 33,3 |
| Dudas sobre la seguridad o la procedencia de la APK. | 0 | 0,0 |
| Dificultades con la descarga o la instalación. | 2 | 22,2 |
| Falta de orientación para empezar. | 1 | 11,1 |
| Falta de interés en continuar con la prueba. | 0 | 0,0 |
| Otro motivo. | 3 | 33,3 |
| **Total** | **9** | **100,0** |

### Distinción entre no instalar y no usar después de instalar

| Motivo principal | No instaló (n=7) | Instaló, sin uso (n=2) | Total (n=9) |
|---|---:|---:|---:|
| Falta de tiempo. | 2 | 1 | 3 |
| Dudas sobre la seguridad o la procedencia de la APK. | 0 | 0 | 0 |
| Dificultades con la descarga o la instalación. | 2 | 0 | 2 |
| Falta de orientación para empezar. | 1 | 0 | 1 |
| Falta de interés en continuar con la prueba. | 0 | 0 | 0 |
| Otro motivo. | 2 | 1 | 3 |
| **Total** | **7** | **2** | **9** |

La falta de tiempo aparece en ambas etapas. Las dos menciones a descarga o
instalación pertenecen a respuestas que no llegaron a instalar. Son barreras
de inicio declaradas, sin información para distinguir incompatibilidad,
problema de descarga, configuración u otra causa técnica.

**«Otro motivo» permanece sin especificar.** El instrumento ofrece una opción
cerrada, no pregunta por sistema operativo o modelo y no permite ampliar ese
motivo. Además, dos de esas respuestas declaran no haber instalado y una
declara instalación sin uso. No se recodifican como iPhone/iOS, incompatibilidad
o falta de interés ni se incorporan al conteo de problemas de instalación.

Nadie eligió seguridad/procedencia o falta de interés como motivo principal.
Esto no demuestra confianza general en la APK ni ausencia de desinterés: sólo
se preguntó un motivo principal a quienes respondieron, no a todas las personas
invitadas ni por todos los motivos posibles.

## 6. Interpretación y límites de la evidencia

La prueba aporta **una señal favorable de facilidad percibida entre quienes
declararon uso**, ejemplos concretos de utilidad para apuntes y organización,
y tres fricciones de uso que deben conservarse con sus límites. La participación
sin uso aporta información propia: tiempo, descarga/instalación, orientación
y motivos no especificados. No debe mezclarse con la evaluación de facilidad.

Las respuestas permiten describir esa experiencia inicial, pero no concluir:

1. **Representatividad o precisión poblacional:** la participación fue voluntaria
   y las probabilidades de inclusión son desconocidas. No se calculan márgenes
   de error, intervalos de confianza ni significación estadística.
2. **Personas únicas o tasas de participación:** se cuentan envíos, sin identidad
   verificada ni denominador de invitaciones o visitas.
3. **Adopción o eficacia educativa:** no se midieron continuidad de uso, retención,
   rendimiento académico o mejora respecto de otro método.
4. **Cumplimiento técnico de la versión 0.6.0 RC1:** ésa fue la versión invitada,
   pero no se registró la instalada en cada respuesta ni se observaron sus tareas.
   Las opiniones no reemplazan pruebas del APK, mediciones CRUD/FPS, accesibilidad
   o la medición ≤10 s de primera nota de `RNF-005`.
5. **Causas técnicas o dispositivos:** los motivos cerrados y el autoinforme de
   errores no permiten diagnosticar fallos, atribuirlos a una plataforma o
   cuantificar iPhone. No hay reproducción ni severidad comprobadas.

Estos resultados **no modifican los estados RNF ni reabren el desarrollo**.
Se conserva la [congelación académica](../../BACKLOG.md#congelación-académica--2026-10-22).
Cualquier seguimiento técnico posterior requerirá un acuerdo específico;
no se genera otra APK ni se corrigen funciones a partir de esta encuesta.
