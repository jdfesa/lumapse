# Capítulo 2: Marco Metodológico y Modelo de Negocio

## 2.1. Metodología de Desarrollo (Agile/Kanban)

El desarrollo de Lumapse se organizó de manera incremental por hitos mensuales, combinando prácticas ágiles, tablero Kanban, control de versiones y documentación viva. Cada hito agrupa un objetivo funcional o técnico claro: investigación inicial, fundación del proyecto, editor principal, MVP con Markdown y offline, organización/UX móvil, calidad/distribución y cierre final.

El enfoque Kanban se eligió por su adecuación a un proyecto individual con alcance académico y evolución progresiva. En lugar de trabajar con iteraciones cerradas de equipo, el proyecto mantiene un flujo continuo de tareas visibles en `TODO`, [BACKLOG.md](../../BACKLOG.md), [CHANGELOG.md](../../CHANGELOG.md) e informes de hito. Esta forma de trabajo permite priorizar tareas según valor, riesgo y dependencia técnica, sin perder trazabilidad histórica.

Las prácticas de gestión aplicadas son:

- Descomposición del trabajo por hitos y tareas pequeñas.
- Priorización de tareas según impacto en el MVP, riesgo técnico y valor académico.
- Registro de decisiones significativas mediante ADRs.
- Commits atómicos con convención semántica.
- Actualización del changelog y backlog para reflejar el estado real del proyecto.
- Validaciones automatizadas antes de cerrar cambios relevantes.

La estimación se complementó con Story Points para historias de usuario y estimación PERT para riesgos técnicos mayores, como la migración hacia Capacitor y SQLite. Esta combinación permitió diferenciar tareas rutinarias de decisiones con mayor incertidumbre.

## 2.2. Análisis de Personas de Usuario

Las personas de usuario se construyeron inicialmente a partir de observación directa, experiencia institucional y conversaciones informales dentro del contexto académico. Luego fueron contrastadas con los resultados del relevamiento cuantitativo, lo que permitió confirmar o matizar los supuestos iniciales.

Las tres personas principales documentadas en [personas.md](../producto/personas.md) son:

| Persona | Rol dentro del proyecto | Necesidad principal |
|---|---|---|
| Lucía, estudiante organizada | Usuario primario no técnico | Capturar notas rápido, acceder offline y organizar por materia. |
| Martín, estudiante práctico | Usuario técnico / early adopter | Usar Markdown, controlar sus datos y evitar vendor lock-in. |
| Prof. Ramos, docente evaluador | Stakeholder académico | Ver evidencia de proceso, documentación y decisiones justificadas. |

El relevamiento validó varios atributos centrales de estas personas: predominio del celular como dispositivo de uso, conectividad deficiente, necesidad de organización por materia y valoración de una herramienta simple. En consecuencia, las personas funcionan como puente entre la observación inicial y las decisiones de diseño implementadas.

## 2.3. Análisis Competitivo

El análisis competitivo comparó a Lumapse con herramientas de notas existentes como Google Keep, Notion, Obsidian, OneNote, Simplenote, Evernote, Standard Notes y Joplin. Los criterios de comparación surgieron de las necesidades detectadas en las personas: funcionamiento offline real, ausencia de cuenta obligatoria, tamaño liviano, soporte Markdown, gratuidad, uso multiplataforma y velocidad de arranque.

La conclusión principal del análisis es que el mercado está polarizado. Por un lado, existen herramientas simples pero dependientes de cuentas o ecosistemas propietarios; por otro, herramientas potentes pero más pesadas, complejas o con barreras económicas. Lumapse busca ocupar un espacio específico: baja complejidad, almacenamiento local, sin cuenta, offline real, Markdown y foco académico.

Este análisis no se utiliza para afirmar que Lumapse compite con plataformas maduras en amplitud funcional, sino para justificar una estrategia de diferenciación: resolver muy bien un problema acotado y real antes que replicar suites generales de productividad.

## 2.4. Lean Canvas

El Lean Canvas de Lumapse documenta la lógica de producto en una sola vista: problema, solución, propuesta de valor, ventaja injusta, segmento de clientes, métricas, canales, costos e ingresos potenciales. Fue elaborado antes del relevamiento y luego recontextualizado a la luz de los datos obtenidos.

La propuesta de valor inicial puede sintetizarse como: "Tus notas. En tu equipo. Sin cuenta. Sin internet. Sin excusas". Esta formulación se mantiene vigente, aunque la solución técnica evolucionó: de una PWA offline-first con IndexedDB hacia una app Android con Capacitor y SQLite.

El canvas cumple una función metodológica: obliga a vincular las decisiones técnicas con la viabilidad del producto. En Lumapse, decisiones como no usar backend, no exigir cuenta y priorizar almacenamiento local no son solo preferencias técnicas; responden a una propuesta de valor, a una estructura de costos baja y a un canal de distribución posible dentro del alcance académico.

## 2.5. Historias de Usuario como Hipótesis de Valor (Lean UX)

El proyecto Lumapse adoptó el marco de Lean UX (Gothelf & Seiden, 2013) para el diseño centrado en el usuario. Bajo este enfoque, las historias de usuario no se conciben como especificaciones definitivas escritas al final del análisis, sino como hipótesis de valor que se formulan tempranamente y se someten a validación empírica. Este ciclo de hipótesis, validación e iteración conecta la fase de ideación con la implementación técnica.

El historial del proyecto refleja este proceso: las primeras historias de usuario fueron redactadas antes del relevamiento de campo. Esto no constituye una anomalía metodológica, sino la aplicación deliberada del ciclo Lean UX: formular una hipótesis razonable, diseñar una forma de validarla y ajustar el producto cuando los datos contradicen el supuesto inicial.

### 2.5.1. Fase 1 — La Historia de Usuario como supuesto de diseño

Una historia de usuario es una descripción breve de una funcionalidad del software escrita desde la perspectiva del usuario final, con el formato:

> Como [rol], quiero [funcionalidad], para [beneficio].

Su propósito no es detallar la implementación técnica, sino capturar qué problema quiere resolver el usuario y por qué le interesa. En la terminología de Lean UX, cada historia funciona como una hipótesis de valor: una apuesta informada sobre lo que el usuario necesita, basada en empatía y análisis inicial, pero todavía sin validación empírica.

En las etapas iniciales, las historias se formularon a partir de:

- Empatía con el contexto del autor como estudiante del IES 6023.
- Personas de usuario construidas desde observación institucional.
- Benchmarking competitivo de herramientas existentes.
- Restricciones técnicas y académicas del proyecto.

En esa fase, las historias eran supuestos educados. Por ejemplo, se consideró inicialmente que los estudiantes podrían organizar sus notas mediante etiquetas, patrón habitual en herramientas de productividad general.

### 2.5.2. Fase 2 — La encuesta como instrumento de validación

Para transformar los supuestos en decisiones fundamentadas, se diseñó y ejecutó una encuesta de relevamiento sobre 121 estudiantes, con 120 respuestas válidas. La encuesta no se diseñó de manera aislada: sus preguntas se formularon para validar o refutar hipótesis contenidas en las historias de usuario y decisiones iniciales de producto.

| Hipótesis | Pregunta de validación | Resultado | Decisión |
|---|---|---|---|
| Los estudiantes necesitan una app que funcione sin internet en el aula. | P6: calidad de conectividad en el instituto. | 81.7% reporta conectividad deficiente. | Hipótesis validada: se mantiene offline-first. |
| Los estudiantes prefieren usar el celular para tomar notas. | P9: dispositivo preferido para una app de notas. | 72.5% elige celular. | Hipótesis validada: se prioriza mobile-first y APK. |
| Los estudiantes organizarían sus notas con etiquetas. | P11: modelo de organización preferido. | 69.2% prefiere carpetas por materia. | Hipótesis refutada: pivote a materias y secciones. |
| Los estudiantes valoran offline por encima de otras características. | P8: funcionalidades más valoradas. | 74.2% prioriza offline. | Hipótesis validada: persistencia local robusta. |

### 2.5.3. Fase 3 — El pivote fundamentado en datos

Cuando la encuesta refutó una hipótesis inicial, se ejecutó un pivote de producto documentado y trazable.

El supuesto original indicaba que los estudiantes organizarían notas con etiquetas. La evidencia empírica mostró otra cosa: el 69.2% de los 120 encuestados prefirió organizar por carpetas por materia. Como resultado, se descartó el sistema de etiquetas como eje principal y se diseñó una jerarquía de Materias y Secciones con profundidad máxima de dos niveles. Esta decisión quedó formalizada en [DP-002](../producto/decisiones-producto.md) y [DP-004](../producto/decisiones-producto.md), y se materializó en el modelo SQLite mediante la tabla `subjects` y la auto-referencia `parentSubjectId`.

Este pivote demuestra que las historias de usuario no son compromisos irrevocables. Su valor metodológico no consiste en acertar desde el inicio, sino en crear un marco que permita detectar y corregir supuestos antes de invertir más desarrollo en una dirección equivocada.

### 2.5.4. Fase 4 — Materialización en requisitos y código

Una vez validadas o ajustadas las historias, se estableció una cadena de trazabilidad:

```text
Historia de usuario
        |
        v
Requisito funcional
        |
        v
Criterios de aceptación
        |
        v
Código
        |
        v
Tests y validaciones
```

Por ejemplo, la necesidad de organizar por materias se trazó desde el relevamiento hasta la implementación:

- HU vinculada a crear materias, secciones y asignar notas.
- RF-014: filtrado de notas por materia y sección.
- DP-002 y DP-004: estructura Entrada / Materias / Archivo y jerarquía Materia -> Sección -> Nota.
- Código en `SubjectService`, `drawerSubjects`, `NoteStore.data` y servicios SQLite.
- Tests unitarios y auditorías de jerarquía de materias.

La trazabilidad completa puede consultarse en [historias de usuario](../producto/historias-de-usuario.md), [requisitos funcionales](../producto/requisitos-funcionales.md), [decisiones de producto](../producto/decisiones-producto.md) y los scripts de auditoría documentados en [scripts/README.md](../../scripts/README.md).

## 2.6. Requisitos del Sistema

Los requisitos del sistema se documentan como artefactos vivos, separados en requisitos funcionales (RF) y no funcionales (RNF). Esta separación permite diferenciar qué debe hacer el sistema de cómo debe comportarse en términos de calidad, rendimiento, seguridad, usabilidad y mantenibilidad.

### 2.6.1. Requisitos Funcionales

Los requisitos funcionales cubren los módulos principales del producto: gestión de notas, persistencia local, Markdown, organización, portabilidad local, experiencia de usuario e información del sistema. En el estado actual del proyecto, el documento [requisitos-funcionales.md](../producto/requisitos-funcionales.md) registra 27 requisitos.

El núcleo del MVP ya implementado incluye:

- Creación, edición, listado, búsqueda y eliminación de notas.
- Auto-guardado.
- Persistencia local.
- Renderizado Markdown y modos de lectura/escritura.
- Organización por materias, secciones, archivo y papelera.
- Tema claro/oscuro y marcadores visuales de estado académico.

Al cierre formal del Hito 04 (2026-06-01), los pendientes opcionales de UX se reclasificaron con justificación de producto: contador de palabras/caracteres, onboarding e indicador offline/online pasan a estado postergado para evitar ruido visual o falsas expectativas de sincronización. La exportación/importación local también se revisa: existen servicios base, pero no un flujo visible actual. Compartir una nota individual se posterga hasta contar con share sheet nativo de Android validado; backup `.zip` e importación quedan postergados por complejidad. La sección "Acerca de" queda prevista para Hito 05.

### 2.6.2. Requisitos No Funcionales

Los requisitos no funcionales se agrupan según criterios de rendimiento, usabilidad, disponibilidad, seguridad, portabilidad, accesibilidad y mantenibilidad. En el estado actual, el documento [requisitos-no-funcionales.md](../producto/requisitos-no-funcionales.md) registra 26 RNF.

Entre los RNF centrales del proyecto se destacan:

- Carga rápida y bundle liviano.
- Funcionamiento offline.
- Persistencia confiable ante cierres inesperados.
- Ausencia de tracking y envío de datos del usuario a servidores externos.
- Accesibilidad básica en elementos interactivos.
- Estructura modular mantenible.
- Verificación automatizada mediante tests, build, lint y auditorías documentales.

Varios RNF todavía requieren evidencia final de validación en dispositivo real, especialmente rendimiento percibido, accesibilidad con auditorías completas, funcionamiento offline en escenarios de usuario y métricas de usabilidad. Esos puntos se abordan en el Capítulo 6 como parte de la estrategia de pruebas y validación.
