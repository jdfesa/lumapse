# Decisiones de Producto — Lumapse

> **Documento vivo** — Se actualiza a medida que se toman decisiones de producto y se incorporan datos del relevamiento.  
> **Última actualización:** 2026-05-31

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
- **Estado:** `Confirmada` | `Pendiente de validación` | `Revisada`

---

## DP-001: Título unificado al estilo Typora

**Fecha:** 2026-05-05  
**Actualización:** 2026-05-30
**Estado:** ✅ Implementada

### Contexto

Lumapse tenía un campo de título separado (un `<input>` en la cabecera del editor) y el contenido Markdown en un `<textarea>` debajo. Esto generaba una experiencia donde el usuario debía mantener dos cosas: el "nombre" de la nota y su contenido, sin relación directa entre ambos. En Markdown puro, el título de un documento puede expresarse con `# Título`, pero exigir esa sintaxis desde el primer uso contradice el objetivo de captura rápida.

### Decisión

Eliminar el campo de título separado. Si la nota contiene una línea `# Título`, se usa como título explícito. Si no contiene encabezado Markdown, Lumapse toma la primera línea no vacía como título implícito, la muestra con jerarquía visual en la tarjeta y conserva el resto como cuerpo. Si no hay contenido útil, se usa el título por defecto ("Sin título").

### Justificación

- **Reduce la fricción:** El usuario escribe en un solo lugar, no tiene que decidir qué va en el título y qué va en el contenido.
- **Consistencia progresiva con Markdown:** El estándar Markdown ya define `# ` como encabezado principal. Lumapse respeta esa convención para quien la conozca, pero no la exige para empezar.
- **Señal visual sin fricción:** La primera línea se diferencia en la tarjeta como título implícito, evitando un segundo campo y evitando instrucciones obligatorias.
- **Precedente:** Aplicaciones exitosas como Typora, Bear y iA Writer siguen este patrón.
- **Público objetivo:** Estudiantes universitarios que buscan velocidad y mínima fricción al tomar notas. Un campo extra es un paso extra.

### Datos de soporte

- Observación directa durante el desarrollo: el campo de título generaba confusión sobre su relación con el contenido.
- **Pendiente:** P8 de la encuesta ("Que sea rápida" como característica prioritaria) reforzaría esta decisión si aparece entre las 3 más votadas.

### Condición de pivote

Si la encuesta revela que los usuarios valoran la organización manual más que la velocidad (P8: "Organizar por materia" >> "Que sea rápida"), podría reconsiderarse mantener un campo de título explícito para facilitar la nomenclatura manual.

---

## DP-002: Estructura de navegación Entrada / Materias / Archivo

**Fecha:** 2026-05-05  
**Actualización:** 2026-05-14  
**Estado:** ✅ Confirmada (con datos del relevamiento)

### Contexto

La versión actual de Lumapse presenta una lista plana de notas sin ninguna jerarquía. A medida que un estudiante acumula notas de múltiples materias a lo largo del cuatrimestre, esta lista se vuelve inmanejable. Necesitamos una estructura que organice sin abrumar.

### Decisión

Implementar una navegación con tres secciones predefinidas, con nomenclatura en español para mantener consistencia con el idioma de los usuarios:

- **📥 Entrada:** Destino por defecto de toda nota nueva. La bandeja de captura rápida. El usuario no piensa en dónde guardar, solo escribe.
- **📚 Materias:** Carpetas que el usuario crea manualmente, una por cada materia que cursa. Las notas se mueven desde Entrada cuando el usuario tiene tiempo de organizarlas.
- **📦 Archivo:** Notas que ya no son activas pero que el usuario quiere conservar (ej: apuntes de materias ya aprobadas).

### Justificación

- **Opinionada pero no rígida:** La app le da al estudiante una estructura predefinida que tiene sentido para su contexto (materias → parciales → aprobadas → archivadas), sin obligarlo a diseñarla desde cero como en Notion u Obsidian.
- **Reduce la parálisis de decisión:** "¿Dónde guardo esta nota?" → En Entrada. Siempre. Después la organizás.
- **Flujo natural:** Captura rápida → Organización cuando hay tiempo → Archivo cuando ya no se necesita.
- **Nomenclatura en español:** Los usuarios son estudiantes de un instituto argentino. Términos como "Inbox" o "Subjects" no aportan claridad; "Entrada", "Materias" y "Archivo" son palabras familiares que cualquier estudiante entiende sin explicación.

### Datos de soporte (validación empírica)

Resultados del [relevamiento de datos](resultados-relevamiento.md) (n=120):

- **P11:** El **69.2% prefiere carpetas por materia** como modelo de organización → **decisión validada directamente**.
- **P8:** El **73.3% prioriza "organizar por materia"** como feature → refuerza la estructura de Materias.
- **P5b:** El **58.9% reporta desorganización rápida** como dificultad → refuerza la necesidad de estructura predefinida.
- **Cruce P9×P11:** Quienes prefieren celular eligen carpetas por materia en el 71% de los casos → el modelo funciona para mobile.
- **Tags (20%):** Una minoría significativa prefiere etiquetas. Se evaluará como sistema complementario (ver DP-004).

### Condición de pivote

No aplica — la decisión fue validada empíricamente. Si en futuras iteraciones el feedback de uso real muestra que los usuarios no utilizan la estructura, se simplificará.

---

## DP-003: Mobile-first

**Fecha:** 2026-05-05  
**Actualización:** 2026-05-14  
**Estado:** ✅ Confirmada (con datos del relevamiento)

### Contexto

Lumapse debe funcionar bien en múltiples dispositivos. Sin embargo, el enfoque de diseño (¿diseñamos primero para celular y adaptamos a desktop, o viceversa?) impacta la arquitectura de la interfaz, los gestos, el tamaño de los elementos interactivos y la disposición del layout.

### Decisión

**Mobile-first.** La interfaz se diseña y optimiza primero para pantallas de celular, con adaptación posterior a pantallas más grandes si el tiempo lo permite.

Esta decisión se complementa con el [ADR-005](../adr/ADR-005-pivote-app-nativa.md) que documenta el pivote de PWA a app nativa empaquetada con Capacitor.

### Justificación

- El **72.5%** de los encuestados usaría la app desde el celular (P9).
- Sumando "Cualquiera por igual", el **95%** incluye celular como dispositivo de uso.
- El celular domina en **todas las carreras** sin excepción, incluso en Sistemas (70%).
- El **88.3%** toma notas en cuaderno/papel — la migración a digital requiere mínima fricción, y el celular es el dispositivo que ya llevan al aula.

### Datos de soporte (validación empírica)

Resultados del [relevamiento de datos](resultados-relevamiento.md) (n=120):

- **P9:** Celular 72.5%, Cualquiera 22.5%, Notebook/PC 4.2%, Tablet 0.8%.
- **P4:** El 88.3% usa cuaderno/papel → el celular no compite con otra app sino con el cuaderno.
- **Cruce P4×P9:** De los 106 que usan cuaderno, el 74.5% elegiría celular → brecha entre hábito actual y aspiración tecnológica.
- **Cruce P2×P9:** El celular domina en todas las carreras → no hay segmento que requiera desktop-first.

### Condición de pivote

No aplica — la evidencia es inequívoca. Mobile-first es la dirección correcta.

---

## Decisiones futuras por registrar

Las siguientes decisiones se documentarán formalmente a medida que avance el desarrollo:

| ID | Tema | Disparador |
|---|---|---|
| DP-008 | Ayuda ampliada o tutoriales | Feedback post-release que demuestre fricción real de uso |

---

## DP-006: Ayuda Contextual sin Fricción

**Fecha:** 2026-06-01
**Estado:** ✅ Confirmada para cierre de Hito 04
**Refs:** RF-006, RF-022, RF-024, RF-023, Hito 04

### Contexto

Al cerrar el Hito 04 quedaron pendientes varias ideas de ayuda o información secundaria: contador de palabras/caracteres, onboarding, indicador offline/online, coach marks y guía Markdown. Todas podían aportar valor en escenarios puntuales, pero también podían sumar ruido visual o sugerir capacidades que Lumapse todavía no ofrece, especialmente sincronización.

Lumapse se define como un tomador de notas mobile-first, offline-first y sin fricción. En esta etapa no busca competir como editor académico avanzado ni como plataforma sincronizada. La primera release debe validar si estudiantes reales entienden la app a partir de su interfaz actual.

### Decisión

Cerrar Hito 04 sin agregar onboarding obligatorio, contador permanente, chip online/offline ni guía Markdown dedicada.

En su lugar:

- Mantener la interfaz principal enfocada en escribir, organizar y recuperar notas.
- Pulir los empty states para orientar sin interrumpir.
- Postergar la ayuda ampliada hasta contar con feedback real post-release.
- Integrar información institucional mínima en `RF-023 — Acerca de` durante Hito 05 sin comprometer la simplicidad.

### Justificación

- **Sin fricción:** cualquier elemento que el usuario deba leer antes de escribir retrasa la captura.
- **Offline-first:** mostrar “online/offline” sin sincronización o backup puede crear una expectativa falsa.
- **Mobile-first:** tooltips y coach marks consumen espacio y atención en pantallas pequeñas.
- **Markdown opcional:** Lumapse permite escribir texto plano; no debe insinuar que aprender Markdown es requisito.
- **Evidencia futura:** si la comunidad estudiantil adopta el producto y pide métricas, ayuda o sincronización, esas mejoras podrán priorizarse con datos reales.

### Consecuencias

- `RF-006`, `RF-022` y `RF-024` pasan a estado **Postergado**.
- `RF-023` se implementa como sección informativa mínima: versión, autor, licencia, propósito y alcance offline/local.
- Los coach marks se descartan para Hito 04.
- La guía Markdown se fusiona conceptualmente con una futura sección `Acerca de/Ayuda` si el feedback la justifica.
- El cierre de Hito 04 se considera coherente con la propuesta de producto, no una omisión funcional.

---

## DP-004: Estructura de Información Opinionada — Materia › Sección › Nota

**Fecha:** 2026-05-20  
**Estado:** ✅ Confirmada  
**Refs:** [database/](../diagramas/database/), RF-013, RF-014  

### Contexto

Las aplicaciones de notas existentes en el mercado (Notion, Obsidian, Bear, Joplin) adoptan una filosofía de "lienzo en blanco": el usuario define su propia arquitectura de información desde cero. Para un estudiante que llega a una clase de 2 horas con 20 minutos libres, esta flexibilidad es en realidad un obstáculo: necesita decidir cómo organizar, dónde crear la nota, qué jerarquía usar.

Lumapse está diseñada para un público concreto (estudiantes de nivel superior, 17-35 años, con celular como dispositivo principal) con un contexto de uso muy específico: **capturar conocimiento académico durante o después de una clase**.

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

**Regla de profundidad máxima:** Una Sección no puede contener sub-secciones. Esta restricción se valida en código (`SqliteService.js`) y en la interfaz de usuario.

### Justificación

- **Elimina la parálisis de decisión:** El estudiante sabe exactamente dónde irá su nota sin pensar. Si no tiene tiempo de organizar, va a Entrada. Si quiere organizar, arrastra a su Materia.
- **Refleja el modelo mental real:** El árbol `Materia → Sección → Nota` replica el sistema de organización que los estudiantes ya usan en herramientas de archivo digital (Dropbox, Google Drive) con estructura `Materia → Subcarpeta → Archivo`.
- **Mobile-first:** Más de 3 interacciones para llegar a una nota en pantalla de celular genera fricción y abandono. La profundidad máxima de 3 niveles garantiza que el usuario nunca necesita más de 2 taps para llegar a cualquier nota desde la pantalla principal.
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

- **P11 del relevamiento (n=120):** El 69.2% prefiere organizar por carpetas por materia → valida la estructura de Materias como nivel raíz.
- **Análisis del sistema de archivos académico real del autor:** La jerarquía observada en `Dropbox/20_Academic/` refleja exactamente el patrón `Institución → Materia → [Subcarpeta tipo: teoria/, tps/, U1/]` — confirmando que 2 niveles de carpetas son suficientes y naturales para el contexto académico.
- **Principio de diseño mobile-first (DP-003):** El 72.5% usará la app desde celular, donde la navegación profunda (>3 niveles) es incómoda e incompatible con patrones de UX móvil modernos.

### Condición de pivote

Si el feedback de uso real (post-lanzamiento) muestra que los usuarios crean consistentemente más de 2 niveles de carpetas y que la restricción genera fricción significativa, se evaluará agregar un tercer nivel opcional de anidamiento. Esta decisión requiere evidencia empírica de uso, no se revisará por consideraciones teóricas.

---

## DP-005: Marcadores de estado académico con emojis curados

**Fecha:** 2026-05-22  
**Estado:** ✅ Implementada  
**Refs:** RF-025, HU-015

### Contexto

Las aplicaciones de notas colaborativas (Google Keep, Memos) permiten "reacciones" con emojis sobre las notas. En un contexto personal y offline como Lumapse, las reacciones no tienen destinatario — el estudiante reacciona a sus propias notas sin propósito funcional claro.

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
- Los emojis curados ya actúan como un Kanban implícito (📖 → ❓ → 🔥 → ✅) sin la rigidez de columnas.
- Agregar ambos sistemas crearía redundancia y confusión.
- Lumapse es una app de notas, no un gestor de tareas.

### Justificación

- **1 toque:** Seleccionar un emoji es más rápido que elegir un estado de un dropdown.
- **Visualmente instantáneo:** El estudiante abre el feed y sabe qué necesita atención antes de un parcial.
- **Minimalista:** 4 opciones curadas evitan la parálisis de un picker de emojis libre.
- **Toggle natural:** Tocar el mismo emoji lo quita, sin necesidad de un botón "Quitar" separado.

### Implementación técnica

- Columna `statusEmoji TEXT` en la tabla `notes` de SQLite (migración idempotente).
- Badge visual en la tarjeta del feed.
- Botón dedicado (ícono de carita) junto al menú de opciones, que despliega un submenú horizontal (flyout) solo con los emojis (estilo Memos).

### Condición de pivote

Si el testing con usuarios reales muestra que los marcadores no se usan o generan confusión, se evaluará reemplazarlos por un sistema de etiquetas de texto. La columna de base de datos es reutilizable para cualquier variante.

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

- **Contexto natural:** El estudiante que toma notas de una materia también necesita recordar cuándo rinde, entrega o expone en esa materia.
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

*Este documento se actualiza con cada decisión de producto relevante. Los resultados de la encuesta se incorporarán en `docs/producto/resultados-relevamiento.md` y se referenciarán desde aquí para mantener la trazabilidad.*
