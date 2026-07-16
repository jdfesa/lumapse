# Decisiones de Producto — Lumapse

> **Documento vivo** — Se actualiza a medida que se toman decisiones de producto y se incorporan datos del relevamiento.  
> **Última actualización:** 2026-07-15

---

## Propósito de este documento

Este documento registra las decisiones de diseño y producto que se toman durante el desarrollo de Lumapse, junto con su **justificación**, la **evidencia** que las respalda (o que se espera recopilar), y las **condiciones de pivote** en caso de que los datos contradigan los supuestos.

El objetivo es doble:

1. **Para el desarrollo:** Proporcionar una guía clara de hacia dónde va el producto y por qué, evitando decisiones arbitrarias o basadas únicamente en la intuición del diseñador.
2. **Para la defensa académica:** Demostrar un proceso de toma de decisiones fundamentado, trazable y abierto a la validación empírica.

---

## Formato de registro

Cada decisión sigue esta estructura:

- **Contexto:** ¿Qué problema o disyuntiva nos llevó a esta decisión?
- **Decisión:** ¿Qué se decidió?
- **Justificación:** ¿Por qué se tomó esta decisión y no otra?
- **Datos de soporte:** ¿Qué evidencia la respalda? (puede ser datos ya recopilados, investigación de mercado, o datos pendientes de la encuesta)
- **Condición de pivote:** ¿Bajo qué resultado de la encuesta revisaríamos esta decisión?
- **Estado:** distingue si la decisión está propuesta, implementada, revisada o postergada; el grado de evidencia se declara por separado para no confundir implementación con validación de uso.

---

## DP-001: Política de título flexible

**Fecha:** 2026-05-05  
**Actualización:** 2026-07-15
**Estado:** ✅ Implementada y revisada

### Contexto

Durante Hito 04 se ensayó un editor al estilo Typora en el que el título se obtenía del contenido. La evolución posterior mostró que esa formulación era demasiado rígida: un usuario puede querer un título claro sin escribir sintaxis Markdown, mientras que otro puede comenzar directamente con un encabezado `#`.

### Decisión

Mantener un campo de título visible pero opcional y aplicar una política de resolución única al guardar:

1. si existe título explícito, se normaliza y se conserva;
2. si está vacío y la primera línea no vacía del contenido es un encabezado `# `, se usa ese texto;
3. en cualquier otro caso, se guarda `Sin título`;
4. si el contenido comienza repitiendo el título resuelto, la presentación evita mostrarlo dos veces.

El atributo `title` se persiste en SQLite como un dato propio de la nota. No se modela como un valor obligatoriamente derivado de `content`.

### Justificación

- **Uso inmediato:** Se puede escribir un título común sin conocer Markdown.
- **Compatibilidad con Markdown:** Quien empieza con `# Título` obtiene el mismo resultado sin completar dos veces la información.
- **Separación semántica:** El listado puede mostrar `title` sin interpretar el cuerpo Markdown para descubrir un nombre.
- **Portabilidad:** El contenido sigue siendo Markdown legible y el backup conserva ambos campos de forma explícita.
- **Presentación sin duplicados:** La política reconoce una primera línea redundante cuando coincide con el título.

### Datos de soporte

- La implementación está centralizada en `NoteTitleService.ts` y cubierta por pruebas unitarias.
- El relevamiento mostró que 45% seleccionó “Que sea rápida” en P8. Ese dato respalda reducir fricción en general, pero no valida directamente una política de título.
- `scripts/run-load-tests.py` compara de forma sintética parsear encabezados con leer una columna, pero no mide CPU Android ni demuestra un porcentaje universal de mejora.

### Condición de pivote

La decisión ya fue revisada y la beta restauró el título explícito opcional. Su comprensión y velocidad de uso deben validarse con usuarios durante Hito 06; si el campo provoca fricción observable, podrá ajustarse la presentación sin cambiar el contrato persistido.

---

## DP-002: Estructura de navegación Entrada / Materias / Archivo

**Fecha:** 2026-05-05  
**Actualización:** 2026-05-14  
**Estado:** ✅ Implementada; respaldada exploratoriamente; prueba de uso pendiente

### Contexto

En el momento de esta decisión, Lumapse presentaba una lista plana de notas sin ninguna jerarquía. A medida que un estudiante acumula notas de múltiples materias a lo largo del cuatrimestre, esa lista se vuelve inmanejable. Se necesitaba una estructura que organizara sin abrumar.

### Decisión

Implementar una navegación con tres secciones predefinidas, con nomenclatura en español para mantener consistencia con el idioma de los usuarios:

- **📥 Entrada:** Destino por defecto de toda nota nueva. La bandeja de captura rápida. El usuario no piensa en dónde guardar, solo escribe.
- **📚 Materias:** Carpetas que el usuario crea manualmente, una por cada materia que cursa. Las notas se mueven desde Entrada cuando el usuario tiene tiempo de organizarlas.
- **📦 Archivo:** Notas que ya no son activas pero que el usuario quiere conservar (ej: apuntes de materias ya aprobadas).

### Justificación

- **Opinionada pero no rígida:** La app le da al estudiante una estructura predefinida que tiene sentido para su contexto (materias → parciales → aprobadas → archivadas), sin obligarlo a diseñarla desde cero como en Notion u Obsidian.
- **Reduce la parálisis de decisión:** "¿Dónde guardo esta nota?" → En Entrada. Siempre. Después la organizás.
- **Flujo natural:** Captura rápida → Organización cuando hay tiempo → Archivo cuando ya no se necesita.
- **Nomenclatura en español:** El público inicial pertenece a un instituto argentino. Usar "Entrada", "Materias" y "Archivo" mantiene la interfaz consistente con su idioma; su comprensión deberá confirmarse en pruebas de uso.

### Datos de soporte (validación empírica)

Resultados del [relevamiento de datos](resultados-relevamiento.md) (n=120):

- **P11:** El **69.2% prefiere carpetas por materia** como modelo de organización → **decisión respaldada directamente dentro de la muestra**.
- **P8:** El **73.3% selecciona "organizar por materia"** → refuerza la estructura de Materias, con la limitación documentada de que el máximo de tres opciones no quedó aplicado en todas las respuestas.
- **P5b:** El **58.9% reporta desorganización rápida** como dificultad → refuerza la necesidad de estructura predefinida.
- **Cruce P9×P11:** Entre quienes prefieren celular, 59 de 87 (67.8%) eligen carpetas por materia → el resultado respalda ensayar este modelo en la interfaz móvil.
- **Tags (20%):** Una minoría significativa prefiere etiquetas. Se evaluará como sistema complementario (ver DP-004).

### Condición de pivote

La estructura se mantiene en el corte vigente porque la encuesta exploratoria respalda organizar por materias. Se revisará si las pruebas de uso muestran que la nomenclatura, la ubicación inicial o el flujo de archivo generan confusión.

---

## DP-003: Mobile-first

**Fecha:** 2026-05-05  
**Actualización:** 2026-05-14  
**Estado:** ✅ Implementada; respaldada exploratoriamente; prueba de uso pendiente

### Contexto

Lumapse debe funcionar bien en múltiples dispositivos. Sin embargo, el enfoque de diseño (¿diseñamos primero para celular y adaptamos a desktop, o viceversa?) impacta la arquitectura de la interfaz, los gestos, el tamaño de los elementos interactivos y la disposición del layout.

### Decisión

**Mobile-first.** La interfaz se diseña y optimiza primero para pantallas de celular, con adaptación posterior a pantallas más grandes si el tiempo lo permite.

Esta decisión se complementa con el [ADR-005](../adr/ADR-005-pivote-app-nativa.md), que documenta el pivote de PWA a aplicación Android híbrida empaquetada con Capacitor.

### Justificación

- El **72.5%** de los encuestados usaría la app desde el celular (P9).
- Sumando "Cualquiera por igual", el **95%** incluye celular como dispositivo de uso.
- El celular fue la opción individual más frecuente en las seis carreras observadas; Física no quedó representada, los tamaños de los subgrupos son desiguales y el resultado se limita a la muestra.
- El **88.3%** toma notas en cuaderno/papel. Esto refuerza la conveniencia de reducir la fricción de captura, aunque la encuesta no identifica por sí sola sus causas ni demuestra que el celular reemplace ese hábito.

### Datos de soporte (validación empírica)

Resultados del [relevamiento de datos](resultados-relevamiento.md) (n=120):

- **P9:** Celular 72.5%, Cualquiera 22.5%, Notebook/PC 4.2%, Tablet 0.8%.
- **P4:** El 88.3% usa cuaderno/papel → describe el hábito predominante de la muestra, pero no permite atribuir por qué se elegiría o no una aplicación.
- **Cruce P4×P9:** De los 106 que usan cuaderno, el 74.5% declaró que elegiría celular para Lumapse → diferencia entre el hábito observado y la preferencia declarada para el prototipo, sin inferir causalidad.
- **Cruce P2×P9:** En la muestra no aparece evidencia suficiente para justificar que el primer diseño sea desktop-first.

### Condición de pivote

Mobile-first se mantiene como hipótesis de diseño respaldada para el prototipo. Se revisará si las pruebas de uso muestran fricción en pantallas pequeñas o si una ampliación del público introduce necesidades desktop-first.

---

## DP-004: Estructura de Información Opinionada — Materia › Sección › Nota

**Fecha:** 2026-05-20  
**Estado:** ✅ Implementada; validación de uso pendiente
**Refs:** [database/](../diagramas/database/), RF-013, RF-014  

### Contexto

Varias herramientas generalistas de notas —entre ellas Notion, Obsidian, Bear y Joplin— ofrecen estructuras muy flexibles que la persona usuaria debe configurar. Esa flexibilidad puede resultar valiosa, pero también agrega decisiones antes de capturar una nota. Lumapse ensaya una alternativa más acotada para el uso académico: ofrecer una estructura inicial comprensible sin impedir la organización por materias y secciones.

Lumapse está diseñada para estudiantes de nivel superior del contexto relevado, con prioridad mobile-first y un caso de uso específico: **capturar conocimiento académico durante o después de una clase**. La muestra orienta esta decisión, pero no limita el producto a un rango etario rígido.

### Decisión

Implementar una estructura de información **predefinida y opinionada** con exactamente **3 secciones fijas** en la navegación principal y **máximo 2 niveles de carpetas creadas por el usuario**:

**Secciones fijas del sistema (no modificables):**
- 📥 **Entrada:** Destino por defecto de toda nota nueva. Actúa como bandeja de entrada. El usuario no piensa dónde guardar — escribe.
- 📚 **Materias:** Área de organización estructurada. El usuario crea sus propias carpetas (Materias) y opcionalmente sub-carpetas (Secciones) dentro de cada una.
- 📦 **Archivo:** Vista de materias y notas archivadas. Las materias aprobadas se mueven aquí.

**Jerarquía de contenido (creada por el usuario):**
```
Materia (ej. "Base de Datos")        ← Nivel 1 — creado por el usuario
  └── Sección (ej. "TPs", "U1")      ← Nivel 2 — creado por el usuario
        └── Nota                      ← Nivel 3 — el contenido
```

**Regla de profundidad máxima:** Una Sección no puede contener sub-secciones. La validación vigente reside en `src/services/SubjectService.validation.ts`, se aplica desde el servicio de materias y está cubierta por tests específicos; la interfaz solo ofrece crear secciones bajo materias raíz.

### Justificación

- **Reduce decisiones iniciales:** Entrada ofrece un destino por defecto y Materias permite clasificar después. La reducción efectiva de fricción debe comprobarse en pruebas de uso.
- **Se aproxima a una organización académica reconocible:** El árbol `Materia → Sección → Nota` adapta una estructura frecuente de archivos (`Materia → Subcarpeta → Archivo`) sin asumir que sea el único modelo mental posible.
- **Mobile-first:** Limitar la jerarquía reduce navegación y carga de decisión en pantallas pequeñas. El criterio cuantitativo de máximo 2 taps se conserva en RNF-006, pero su verificación completa sobre la interfaz vigente continúa pendiente.
- **Diferenciación de producto:** La estructura opinionada es la característica definitoria de Lumapse. Es la respuesta directa a "¿por qué no usar Notion?" que el tribunal evaluador puede plantear en la defensa académica.

### Implementación en base de datos

La tabla `subjects` modela tanto Materias como Secciones mediante auto-referencia:
- `parentSubjectId = NULL` → es una **Materia** (raíz)
- `parentSubjectId = {uuid}` → es una **Sección** (hija de esa Materia)

La tabla `notes` referencia a `subjects(id)` mediante `subjectId`:
- `subjectId = NULL` → la nota está en **Entrada**
- `subjectId = {uuid de Materia}` → la nota está directamente en esa Materia
- `subjectId = {uuid de Sección}` → la nota está dentro de una Sección de una Materia

Ver [docs/diagramas/database/](../diagramas/database/) para el DER completo, la normalización y el DDL SQL.

### Datos de soporte

- **P11 del relevamiento (n=120):** El 69.2% prefiere organizar por carpetas por materia → respalda Materias como nivel raíz dentro de la muestra.
- **Referencia cualitativa del autor:** La jerarquía observada en su sistema de archivos académico (`Institución → Materia → [Subcarpeta temática]`) sirvió como ejemplo de dominio. No demuestra que dos niveles sean universales ni suficientes para todos los usuarios.
- **Principio de diseño mobile-first (DP-003):** El 72.5% declaró que elegiría el celular. Limitar inicialmente la profundidad es una hipótesis de diseño orientada a reducir pasos de navegación y deberá comprobarse mediante pruebas de uso.

### Condición de pivote

Si el feedback de uso real (post-lanzamiento) muestra que los usuarios crean consistentemente más de 2 niveles de carpetas y que la restricción genera fricción significativa, se evaluará agregar un tercer nivel opcional de anidamiento. Esta decisión requiere evidencia empírica de uso, no se revisará por consideraciones teóricas.

---

## DP-005: Marcadores de estado académico con emojis curados

**Fecha:** 2026-05-22  
**Estado:** ✅ Implementada  
**Refs:** RF-025, HU-015

### Contexto

Algunas aplicaciones colaborativas permiten reacciones con emojis sobre el contenido. En un contexto personal y offline como Lumapse, esa semántica social no aporta por sí sola un propósito funcional claro.

Sin embargo, la idea de un marcador visual rápido tiene valor si se reorienta: en lugar de reacciones sociales, un **set curado de emojis con significado académico** permite al estudiante clasificar el estado de comprensión de cada nota de un vistazo.

### Decisión

Implementar un sistema de **marcado rápido por estado académico** con 4 emojis curados:

| Emoji | Label | Significado |
|---|---|---|
| 📖 | Por completar | "Tengo que ampliar esto" |
| ❓ | Tengo dudas | "Preguntar al profe" |
| 🔥 | Importante | "Cae en el parcial" |
| ✅ | Repasado | "Ya lo entendí" |

**Se descartó** un sistema Kanban clásico (Pendiente → En proceso → Terminado) porque:
- Los emojis curados ofrecen un vocabulario liviano de estado sin introducir columnas ni un flujo Kanban obligatorio.
- Agregar ambos sistemas crearía redundancia y confusión.
- Lumapse es una app de notas, no un gestor de tareas.

### Justificación

- **1 toque:** Seleccionar un emoji es más rápido que elegir un estado de un dropdown.
- **Lectura de un vistazo:** El estudiante abre el feed y puede distinguir qué necesita atención antes de un parcial.
- **Minimalista:** 4 opciones curadas evitan la parálisis de un picker de emojis libre.
- **Toggle natural:** Tocar el mismo emoji lo quita, sin necesidad de un botón "Quitar" separado.

### Implementación técnica

- Columna `statusEmoji TEXT` en la tabla `notes` de SQLite (migración idempotente).
- Badge visual en la tarjeta del feed.
- Botón dedicado (ícono de carita) junto al menú de opciones, que despliega un submenú horizontal (flyout) solo con los emojis (estilo Memos).

### Condición de pivote

Si el testing con usuarios reales muestra que los marcadores no se usan o generan confusión, se evaluará reemplazarlos por un sistema de etiquetas de texto. La columna de base de datos es reutilizable para cualquier variante.

---

## DP-006: Ayuda Contextual sin Fricción

**Fecha:** 2026-06-01
**Estado:** ✅ Confirmada para cierre de Hito 04
**Refs:** RF-006, RF-022, RF-024, RF-023, Hito 04

### Contexto

Al cerrar el Hito 04 quedaron pendientes varias ideas de ayuda o información secundaria: contador de palabras/caracteres, onboarding, indicador offline/online, coach marks y guía Markdown. Todas podían aportar valor en escenarios puntuales, pero también podían sumar ruido visual o sugerir capacidades que Lumapse todavía no ofrece, especialmente sincronización.

Lumapse se define como un tomador de notas mobile-first, offline-first y sin fricción. En el corte de esta decisión no buscaba competir como editor académico avanzado ni como plataforma sincronizada. La entonces futura beta debía permitir validar si estudiantes reales entendían la app a partir de su interfaz.

### Decisión

Cerrar Hito 04 sin agregar onboarding obligatorio, contador permanente, chip online/offline ni guía Markdown dedicada.

En su lugar:

- Mantener la interfaz principal enfocada en escribir, organizar y recuperar notas.
- Pulir los empty states para orientar sin interrumpir.
- Postergar la ayuda ampliada hasta contar con feedback real post-release.
- Integrar información institucional mínima en `RF-023 — Acerca de` durante Hito 05 sin comprometer la simplicidad.

### Justificación

- **Sin fricción:** cualquier elemento que el usuario deba leer antes de escribir retrasa la captura.
- **Offline-first:** el núcleo local no cambia de comportamiento según la red. Un chip global “online/offline” sugeriría una sincronización inexistente; el backup comunica la conectividad de forma contextual solo cuando ese flujo la necesita.
- **Mobile-first:** tooltips y coach marks consumen espacio y atención en pantallas pequeñas.
- **Markdown opcional:** Lumapse permite escribir texto plano; no debe insinuar que aprender Markdown es requisito.
- **Evidencia futura:** si la comunidad estudiantil adopta el producto y pide métricas, ayuda o sincronización, esas mejoras podrán priorizarse con datos reales.

### Consecuencias

- `RF-006`, `RF-022` y `RF-024` pasan a estado **Postergado**.
- `RF-023` se implementa como sección informativa mínima: versión, autor, licencia, propósito y alcance offline/local.
- El backup ofrece feedback contextual de conectividad dentro de su vista; esto no convierte el estado de red en información global del producto ni reactiva `RF-024`.
- Los coach marks se descartan para Hito 04.
- La guía Markdown se fusiona conceptualmente con una futura sección `Acerca de/Ayuda` si el feedback la justifica.
- El cierre de Hito 04 se considera coherente con la propuesta de producto, no una omisión funcional.

> **Resultado al 2026-07-15:** La beta `v0.4.8` ya fue publicada y validada técnicamente en Android. La prueba directa con estudiantes sigue pendiente para Hito 06, por lo que `RF-006`, `RF-022` y `RF-024` permanecen postergados.

---

## DP-007: Fechas académicas como recordatorio visual pasivo

**Fecha:** 2026-05-31
**Estado:** ✅ Implementada
**Refs:** RF-027, HU-027

### Contexto

El relevamiento con 120 estudiantes registró una necesidad emergente vinculada a agenda/calendario en los comentarios abiertos: fechas de parciales, horarios de materias y recordatorios académicos. No fue una categoría masiva, pero apareció de forma espontánea en una pregunta abierta; eso la vuelve una señal cualitativa útil para una evolución posterior del producto.

Lumapse ya cuenta con un calendario mensual (`Heatmap`) que muestra actividad de notas y permite filtrar por fecha. También cuenta con materias/secciones como entidades del modelo. En ese contexto, permitir marcar fechas académicas puntuales no exige convertir la aplicación en una agenda completa: puede funcionar como una capa visual discreta sobre una infraestructura ya existente.

### Decisión

Implementar una funcionalidad de **fechas académicas puntuales** integrada al Heatmap, limitada a cuatro tipos:

| Tipo | Uso |
|---|---|
| Parcial | Exámenes durante la cursada. |
| Final | Mesas finales o instancias de examen final. |
| Trabajo práctico | Entregas de TP, informes o proyectos escritos. |
| Exposición | Presentaciones orales, defensas o coloquios. |

Cada fecha podrá tener:

- tipo obligatorio;
- fecha obligatoria;
- descripción breve opcional;
- materia/sección opcional.

La interfaz deberá mostrar indicadores mínimos en el Heatmap y una lista compacta de próximas fechas. La funcionalidad será 100% local en SQLite y no requerirá cuentas, internet ni servicios externos.

### Límites explícitos

Lumapse **no** se convierte en Google Calendar ni en una agenda semanal. Para preservar el foco en la toma de notas, quedan fuera de la v1:

- notificaciones push;
- alarmas;
- horarios de inicio/fin;
- recurrencia;
- horarios de cursado;
- sincronización con Google Calendar, iCal u otros servicios;
- invitaciones o eventos compartidos;
- vistas semanales/diarias complejas.

### Justificación

- **Contexto relacionado:** Una persona que toma notas de una materia puede necesitar registrar cuándo rinde, entrega o expone en esa misma materia.
- **Bajo cambio de contexto:** La fecha vive junto a las notas académicas, no en una app separada.
- **Infraestructura existente:** El Heatmap ya ofrece una base visual mensual; agregar dots o indicadores es evolución, no reescritura.
- **Asociación con materias:** Las fechas académicas se vinculan naturalmente con `subjects`, entidad ya implementada.
- **Offline-first:** La funcionalidad se puede persistir en SQLite local, sin APIs externas.
- **Diferenciación:** Aporta valor académico específico sin caer en la complejidad de Notion ni en el alcance de Google Calendar.

### Datos de soporte

- [Resultados del relevamiento](resultados-relevamiento.md): la categoría cualitativa "Agenda / calendario" aparece con menciones espontáneas sobre fechas de parciales y horarios de materias.
- [Informe final / relevamiento](../informe-final/03-relevamiento-datos.md): se registran necesidades emergentes por carrera, incluyendo fechas de parciales en perfiles más orientados a herramientas.
- Observación de producto: Lumapse ya tiene Heatmap, materias y SQLite local; la funcionalidad se apoya en capacidades existentes.

### Condición de pivote

Si durante testing con usuarios reales la funcionalidad desplaza la atención de la toma de notas, genera expectativa de agenda completa o dispara pedidos reiterados de notificaciones/recurrencia/horarios, se mantendrá como recordatorio visual básico o se postergará. La señal de éxito no es que reemplace un calendario, sino que ayude a recordar fechas académicas sin agregar fricción.

### Resultado de implementación

La v1 se implementó como una capa discreta sobre el Heatmap existente: dots por día, detalle compacto al seleccionar fecha, modal accesible para crear/editar, lista colapsable de próximas fechas y eliminación con confirmación accesible. Las fechas se persisten en SQLite local (`academic_events`) y se integran al store sin agregar notificaciones, recurrencias, horarios ni dependencias externas.

---

## Decisiones futuras por registrar

Las siguientes decisiones se documentarán formalmente solo cuando exista evidencia que justifique reabrirlas:

| ID | Tema | Disparador |
|---|---|---|
| DP-008 | Ayuda ampliada o tutoriales | Feedback post-release que demuestre fricción real de uso |

---

*Este documento se actualiza con cada decisión de producto relevante. Los resultados de la encuesta se incorporarán en `docs/producto/resultados-relevamiento.md` y se referenciarán desde aquí para mantener la trazabilidad.*
