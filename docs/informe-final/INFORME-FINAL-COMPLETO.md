# Informe Final — Lumapse
**Alumno:** José David Sandoval  
**Carrera:** Tecnicatura en Análisis de Sistemas y Desarrollo de Software  
**Institución:** IES 6023 "Dr. Alfredo Loutaif"  
**Materia:** Prácticas Profesionalizantes III  
**Año:** 2026  
**Generado automáticamente:** 2026-07-02

---

## Tabla de Contenidos

- [1.1. Contexto del Proyecto](#11-contexto-del-proyecto)
- [1.2. Planteo del Problema](#12-planteo-del-problema)
- [1.3. Objetivos](#13-objetivos)
  - [1.3.1. Objetivo General](#131-objetivo-general)
  - [1.3.2. Objetivos Específicos](#132-objetivos-específicos)
- [1.4. Justificación y Alcance](#14-justificación-y-alcance)
- [2.1. Metodología de Desarrollo (Agile/Kanban)](#21-metodología-de-desarrollo-agilekanban)
- [2.2. Análisis de Personas de Usuario](#22-análisis-de-personas-de-usuario)
- [2.3. Análisis Competitivo](#23-análisis-competitivo)
- [2.4. Lean Canvas](#24-lean-canvas)
- [2.5. Historias de Usuario como Hipótesis de Valor (Lean UX)](#25-historias-de-usuario-como-hipótesis-de-valor-lean-ux)
  - [2.5.1. Fase 1 — La Historia de Usuario como supuesto de diseño](#251-fase-1--la-historia-de-usuario-como-supuesto-de-diseño)
  - [2.5.2. Fase 2 — La encuesta como instrumento de validación](#252-fase-2--la-encuesta-como-instrumento-de-validación)
  - [2.5.3. Fase 3 — El pivote fundamentado en datos](#253-fase-3--el-pivote-fundamentado-en-datos)
  - [2.5.4. Fase 4 — Materialización en requisitos y código](#254-fase-4--materialización-en-requisitos-y-código)
- [2.6. Requisitos del Sistema](#26-requisitos-del-sistema)
  - [2.6.1. Requisitos Funcionales](#261-requisitos-funcionales)
  - [2.6.2. Requisitos No Funcionales](#262-requisitos-no-funcionales)
- [3.1. Metodología de Recolección (Población y Muestra)](#31-metodología-de-recolección-población-y-muestra)
- [3.2. Análisis Demográfico](#32-análisis-demográfico)
- [3.3. Resultados sobre Hábitos de Estudio y Toma de Notas](#33-resultados-sobre-hábitos-de-estudio-y-toma-de-notas)
- [3.4. Análisis Cualitativo (Puntos de Dolor)](#34-análisis-cualitativo-puntos-de-dolor)
- [3.5. Conclusiones del Relevamiento e Impacto en el Producto](#35-conclusiones-del-relevamiento-e-impacto-en-el-producto)
- [4.1. Decisiones Arquitectónicas Iniciales (ADRs)](#41-decisiones-arquitectónicas-iniciales-adrs)
- [4.2. Stack Tecnológico](#42-stack-tecnológico)
- [4.3. Modelo de Dominio](#43-modelo-de-dominio)
- [4.4. Diagramas de Casos de Uso](#44-diagramas-de-casos-de-uso)
- [4.5. Diagramas de Secuencia](#45-diagramas-de-secuencia)
- [4.6. Diseño de Interfaz (UI/UX y Mobile-First)](#46-diseño-de-interfaz-uiux-y-mobile-first)
- [4.7. Diseño de Base de Datos](#47-diseño-de-base-de-datos)
  - [4.7.1. Motor de persistencia](#471-motor-de-persistencia)
  - [4.7.2. Metodología de diseño](#472-metodología-de-diseño)
  - [4.7.3. Entidades del dominio](#473-entidades-del-dominio)
  - [4.7.4. Estructura de información opinionada (DP-004)](#474-estructura-de-información-opinionada-dp-004)
  - [4.7.5. Normalización y desnormalización intencional](#475-normalización-y-desnormalización-intencional)
- [4.8. Patrones de Arquitectura y Diseño de Software](#48-patrones-de-arquitectura-y-diseño-de-software)
  - [Patrones Arquitectónicos](#patrones-arquitectónicos)
  - [Patrones de Diseño (GoF y UI)](#patrones-de-diseño-gof-y-ui)
- [5.1. Estructura del Repositorio y Entorno](#51-estructura-del-repositorio-y-entorno)
- [5.2. Capa de Presentación (Componentes UI)](#52-capa-de-presentación-componentes-ui)
- [5.3. Gestión de Estado Reactivo](#53-gestión-de-estado-reactivo)
- [5.4. Capa de Persistencia (Evolución de IndexedDB a SQLite)](#54-capa-de-persistencia-evolución-de-indexeddb-a-sqlite)
- [5.5. Procesamiento de Markdown y Seguridad (XSS)](#55-procesamiento-de-markdown-y-seguridad-xss)
- [5.6. Empaquetado Nativo (Capacitor)](#56-empaquetado-nativo-capacitor)
- [5.7. Licenciamiento de Software y Filosofía Open Source](#57-licenciamiento-de-software-y-filosofía-open-source)
- [5.8. Integración Continua (CI) — Automatización de Calidad de Código](#58-integración-continua-ci--automatización-de-calidad-de-código)
  - [5.8.1. ¿Qué es la Integración Continua?](#581-qué-es-la-integración-continua)
  - [5.8.2. Herramientas utilizadas](#582-herramientas-utilizadas)
  - [5.8.3. Implementación en Lumapse](#583-implementación-en-lumapse)
  - [5.8.4. Flujo de trabajo resultante](#584-flujo-de-trabajo-resultante)
  - [5.8.5. Resultado actual](#585-resultado-actual)
  - [5.8.6. Justificación de la práctica](#586-justificación-de-la-práctica)
- [6.1. Estrategia de Testing](#61-estrategia-de-testing)
- [6.2. Pruebas Unitarias](#62-pruebas-unitarias)
- [6.3. Pruebas de Integración y Funcionamiento Offline](#63-pruebas-de-integración-y-funcionamiento-offline)
- [6.4. Validación de Rendimiento y UX](#64-validación-de-rendimiento-y-ux)
- [7.1. Cumplimiento de Objetivos](#71-cumplimiento-de-objetivos)
- [7.2. Lecciones Aprendidas](#72-lecciones-aprendidas)
  - [7.2.1. Gestión de riesgos técnicos: la estimación PERT como herramienta de decisión](#721-gestión-de-riesgos-técnicos-la-estimación-pert-como-herramienta-de-decisión)
  - [7.2.2. Adaptación del entorno de pruebas: hardware limitado como oportunidad](#722-adaptación-del-entorno-de-pruebas-hardware-limitado-como-oportunidad)
  - [7.2.3. Estimación retroactiva vs. prospectiva: el sesgo de confirmación](#723-estimación-retroactiva-vs-prospectiva-el-sesgo-de-confirmación)
  - [7.2.4. Documentación viva vs. documentación muerta](#724-documentación-viva-vs-documentación-muerta)
- [7.3. Trabajo Futuro y Posibles Mejoras](#73-trabajo-futuro-y-posibles-mejoras)
- [7.4. Cierre](#74-cierre)

---

# Capítulo 1: Introducción y Planteo del Problema

## 1.1. Contexto del Proyecto

Lumapse es una aplicación móvil de captura, organización y recuperación de notas de estudio, desarrollada como proyecto integrador para la materia Prácticas Profesionalizantes III de la Tecnicatura en Análisis de Sistemas y Desarrollo de Software del IES 6023 "Dr. Alfredo Loutaif".

El proyecto surge a partir de una necesidad observada en el contexto académico local: los estudiantes requieren una herramienta simple, rápida y confiable para tomar apuntes durante la cursada, pero las alternativas disponibles suelen depender de conexión a internet, cuentas obligatorias, sincronización en la nube o interfaces pensadas para usuarios con mayor disponibilidad de recursos técnicos.

La primera definición del producto fue una aplicación web progresiva (PWA) con persistencia local. Sin embargo, el relevamiento realizado sobre estudiantes del IES 6023 evidenció que el celular es el dispositivo dominante y que la conectividad institucional es deficiente. Esta evidencia motivó el pivote a una aplicación móvil nativa empaquetada con Capacitor y persistencia SQLite, decisión documentada en [ADR-005](../adr/ADR-005-pivote-app-nativa.md) y [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

Desde el punto de vista técnico, Lumapse combina tecnologías web modernas (Vite, JavaScript modular, CSS nativo), empaquetado Android mediante Capacitor, persistencia local con SQLite, renderizado Markdown seguro y automatización de calidad con GitHub Actions y scripts locales. Desde el punto de vista metodológico, el proyecto se apoya en Design Thinking, Lean UX, gestión incremental por hitos, documentación viva en Markdown y trazabilidad entre necesidades, requisitos, decisiones y código.

## 1.2. Planteo del Problema

El problema central no es la inexistencia de aplicaciones de notas, sino la ausencia de una solución que responda simultáneamente a las restricciones reales del público objetivo: estudiantes de nivel superior, con uso intensivo del celular, conectividad limitada, bajo margen para instalar herramientas pesadas y necesidad de capturar información rápidamente durante la clase.

El relevamiento de datos confirmó este diagnóstico. Sobre 120 respuestas válidas, el 88.3% de los estudiantes declaró tomar notas principalmente en cuaderno o papel; el 48.7% de quienes toman notas reconoció dificultades en su forma actual de trabajo; y las dificultades más repetidas fueron pérdida de notas y desorganización, ambas con 58.9% entre quienes reportaron problemas. Además, el 81.7% percibe conectividad deficiente en el instituto y el 72.5% usaría una app de notas desde el celular ([resultados del relevamiento](../producto/resultados-relevamiento.md)).

Las herramientas existentes cubren partes del problema, pero no el conjunto completo de restricciones. Google Keep y OneNote requieren cuentas y dependen de ecosistemas externos; Notion resulta potente pero pesado y orientado a flujos más complejos; Obsidian y Joplin son más cercanas a una filosofía local-first, pero pueden resultar técnicas o pesadas para el usuario promedio. Lumapse se posiciona en un espacio deliberadamente acotado: una app de notas académicas, offline-first, sin cuenta, ligera, local y centrada en el flujo real de estudiar.

## 1.3. Objetivos

### 1.3.1. Objetivo General

Desarrollar y documentar una aplicación móvil offline-first para que estudiantes de nivel superior puedan capturar, organizar y recuperar notas de estudio de forma rápida y confiable, utilizando evidencia empírica del público objetivo y prácticas profesionales de análisis, diseño, implementación, validación y documentación de software.

### 1.3.2. Objetivos Específicos

- Relevar necesidades, hábitos y problemas de estudiantes reales del IES 6023 mediante una encuesta estructurada.
- Analizar los datos obtenidos para validar o ajustar las hipótesis iniciales del producto.
- Definir personas de usuario, requisitos funcionales, requisitos no funcionales, historias de usuario y decisiones de producto trazables.
- Diseñar una arquitectura local-first que priorice funcionamiento offline, privacidad y persistencia robusta.
- Implementar un editor de notas con soporte Markdown, borradores persistentes, búsqueda y organización por materias y secciones, dejando la portabilidad local de notas como decisión explícita de alcance.
- Migrar la persistencia desde IndexedDB hacia SQLite, de acuerdo con la evidencia recolectada y las decisiones arquitectónicas aprobadas.
- Empaquetar la aplicación como APK Android mediante Capacitor.
- Incorporar pruebas unitarias, validaciones documentales y un quality gate automatizado para sostener la calidad del código y la documentación.
- Mantener documentación viva y versionada que permita reconstruir el proceso de decisión, desarrollo y validación.

## 1.4. Justificación y Alcance

La justificación académica del proyecto reside en que Lumapse permite integrar de manera concreta los contenidos centrales de la carrera: análisis de usuarios, diseño de requisitos, modelado de dominio, arquitectura de software, desarrollo frontend, persistencia local, pruebas, automatización, control de versiones y documentación técnica. El proyecto no se limita a construir una interfaz funcional, sino que documenta las decisiones y evidencia la evolución del producto a través de hitos, ADRs, backlog, changelog y commits.

La justificación social y de producto se relaciona con el contexto de uso. El público objetivo no necesita una plataforma de productividad empresarial ni una base de conocimiento compleja; necesita una herramienta que abra rápido, funcione sin conexión, no exija una cuenta y respete la forma en que los estudiantes ya organizan su vida académica. Por eso, el alcance funcional prioriza la captura y recuperación de notas, la organización por materias, el guardado local y la simplicidad de uso.

El alcance actual incluye una app Android empaquetada con Capacitor, persistencia SQLite, editor Markdown, preview seguro, búsqueda, materias y secciones, archivo, papelera, tema claro/oscuro y automatización de calidad. La exportación/importación local conserva servicios base, pero no está expuesta como flujo de usuario en la UI actual. Compartir una nota individual solo se retomará si usa share sheet nativo de Android y no duplica la acción Copiar; backup `.zip` e importación quedan como trabajo futuro. Quedan fuera del alcance del MVP la sincronización en la nube, la colaboración en tiempo real, el backend multiusuario, la inteligencia artificial generativa y la publicación formal en tiendas de aplicaciones. Estas posibilidades se consideran trabajo futuro y solo deberían incorporarse si nueva evidencia de uso justifica ampliar el alcance.

---

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

Los requisitos funcionales cubren los módulos principales del producto: gestión de notas, persistencia local, Markdown, organización, portabilidad local, experiencia de usuario e información del sistema. En el estado actual del proyecto, el documento [requisitos-funcionales.md](../producto/requisitos-funcionales.md) registra 28 requisitos.

El núcleo del MVP ya implementado incluye:

- Creación, edición, listado, búsqueda y eliminación de notas.
- Borradores persistentes del editor.
- Persistencia local.
- Renderizado Markdown y modos de lectura/escritura.
- Organización por materias, secciones, archivo y papelera.
- Tema claro/oscuro y marcadores visuales de estado académico.
- Fechas académicas discretas.
- Backup manual `.zip` e importación no destructiva de backups generados por Lumapse.
- Sección "Acerca de" y ayudas opcionales de formato dentro del editor.

Al cierre formal del Hito 04 (2026-06-01), los pendientes opcionales de UX se reclasificaron con justificación de producto: contador de palabras/caracteres, onboarding e indicador offline/online pasan a estado postergado para evitar ruido visual o falsas expectativas de sincronización. Durante Hito 05 se resolvió la portabilidad de workspace con backup manual `.zip` e importación no destructiva de backups generados por Lumapse, además de incorporar la sección "Acerca de". Compartir/exportar una nota individual sigue postergado hasta contar con share sheet nativo de Android validado y evidencia de que no duplica la acción existente de copiar.

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

La beta `v0.4.8` aporta evidencia inicial de validación en dispositivo real: instalación de APK firmada, apertura offline, persistencia, navegación principal y flujos críticos sin crashes. La validación final de defensa debe completar esa evidencia con feedback de estudiantes, contraste visual y comportamiento con mayor volumen real de notas. Esos puntos se abordan en el Capítulo 6 como parte de la estrategia de pruebas y validación.

---

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

---

# Capítulo 4: Arquitectura y Diseño

## 4.1. Decisiones Arquitectónicas Iniciales (ADRs)

Las decisiones arquitectónicas significativas de Lumapse se documentan mediante Architecture Decision Records (ADRs). Este formato permite registrar el contexto, las alternativas evaluadas, la decisión tomada y sus consecuencias. En un proyecto académico, los ADRs cumplen además una función de defensa: muestran que la arquitectura no surge de preferencias arbitrarias, sino de restricciones, evidencia y análisis.

Los ADRs vigentes cubren:

| ADR | Tema | Estado |
|---|---|---|
| [ADR-001](../adr/ADR-001-stack-tecnologico.md) | Elección del stack tecnológico: Vanilla JS + Vite. | Aceptado |
| [ADR-002](../adr/ADR-002-persistencia-indexeddb.md) | Persistencia inicial con IndexedDB. | Superado por ADR-005 |
| [ADR-003](../adr/ADR-003-metodologia-kanban.md) | Metodología Kanban para gestión del trabajo. | Aceptado |
| [ADR-004](../adr/ADR-004-estructura-carpetas.md) | Estructura de carpetas del proyecto. | Aceptado |
| [ADR-005](../adr/ADR-005-pivote-app-nativa.md) | Pivote de PWA a aplicación móvil nativa con Capacitor. | Aceptado |
| [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md) | Arquitectura SQLite para web de desarrollo y entorno nativo. | Aceptado |
| [ADR-007](../adr/ADR-007-organizacion-componentes-por-feature.md) | Organización de componentes UI por feature folders. | Aceptado |

La evolución más importante fue el pivote desde una PWA con IndexedDB hacia una app Android empaquetada con Capacitor y persistencia SQLite. Este cambio no elimina el valor de las decisiones iniciales: las conserva como antecedentes y muestra cómo el proyecto respondió a evidencia empírica nueva.

## 4.2. Stack Tecnológico

El stack se eligió buscando equilibrio entre simplicidad, rendimiento, defendibilidad académica y capacidad de evolucionar hacia un entorno móvil nativo.

| Capa | Tecnología | Justificación |
|---|---|---|
| Build | Vite 6 | Servidor de desarrollo rápido, build optimizado y configuración mínima. |
| Lenguaje | JavaScript ES2022+ | Permite trabajar con módulos nativos sin introducir un framework de UI. |
| UI | Componentes propios con DOM + CSS nativo | Máximo control sobre rendimiento y estructura. |
| Persistencia | SQLite mediante `@capacitor-community/sqlite` | Persistencia local robusta en Android. |
| Simulación web | `sql.js` + `jeep-sqlite` | Mantiene el flujo de desarrollo web sin cambiar la capa de servicios. |
| Markdown | `marked` + `DOMPurify` | Renderizado Markdown con sanitización contra XSS. |
| Empaquetado | Capacitor + Android | Reutiliza la web app y genera una experiencia instalable como APK. |
| Testing | Vitest + Gradle Android tests | Pruebas unitarias de lógica JS y smoke tests nativos. |
| Calidad | GitHub Actions + scripts locales | Automatización de lint, tests, build, trazabilidad y auditorías. |

La decisión de no usar un framework frontend como React o Vue fue deliberada. Para el alcance del proyecto, Vanilla JS reduce dependencias de runtime, permite un bundle liviano y deja visible la arquitectura del código ante la evaluación académica.

## 4.3. Modelo de Dominio

El modelo de dominio actual se centra en tres conceptos principales: Nota, Materia/Sección y Estado de Aplicación. La entidad `Note` representa el contenido escrito por el estudiante; `Subject` modela materias y secciones mediante una auto-referencia; y el estado de aplicación mantiene la selección actual, filtros, vista activa y datos cargados desde la persistencia.

La decisión de modelar materias y secciones con una sola entidad responde a la estructura de información definida en [DP-004](../producto/decisiones-producto.md): una Materia es un `Subject` raíz y una Sección es un `Subject` con `parentSubjectId`. Esta solución evita duplicar tablas y permite expresar la jerarquía con una relación relacional simple.

El modelo completo se documenta en [modelo-dominio.md](../diagramas/modelo-dominio.md). Desde el punto de vista del informe, su aporte principal es mostrar cómo las decisiones de producto se traducen en entidades persistentes, servicios de negocio y estado de UI.

## 4.4. Diagramas de Casos de Uso

Los casos de uso describen el sistema desde la perspectiva del estudiante. El actor principal puede crear, editar, buscar, eliminar, fijar, archivar y previsualizar notas. Además, interactúa con funciones de organización, tema visual y papelera. Los casos de portabilidad local quedan documentados como trabajo futuro porque requieren share sheet nativo, formato de backup o política de importación antes de exponerse en la UI.

El diagrama documentado en [casos-de-uso.md](../diagramas/casos-de-uso.md) agrupa las funcionalidades en cinco áreas:

- Gestión de notas.
- Organización.
- Markdown.
- Datos y portabilidad.
- Sistema y personalización.

La relación `include` se usa para expresar que crear o editar una nota incluye siempre la protección del borrador persistente del editor. La relación `extend` se utiliza para acciones opcionales, como gestionar la papelera después de una eliminación. En portabilidad local, el backup `.zip` ya está integrado como salida manual, mientras que compartir notas individuales e importar contenido quedan como deuda posterior.

## 4.5. Diagramas de Secuencia

Los diagramas de secuencia permiten representar el flujo temporal entre UI, estado y persistencia. El flujo más importante del producto es crear una nota protegida por borrador persistente mientras el estudiante escribe.

El diagrama documentado en [secuencia-crear-nota.md](../diagramas/secuencia-crear-nota.md) modela el comportamiento vigente: el usuario abre el editor, la UI conserva el borrador localmente mientras escribe, el store persiste la nota definitiva solo cuando el usuario confirma con `Guardar` o `Actualizar`, y el borrador se limpia después del éxito.

Como criterio de documentación viva, los diagramas deben actualizarse cuando el flujo técnico cambie de manera sustancial. En el estado actual, el diagrama ya refleja la separación entre borrador local y persistencia definitiva en SQLite.

## 4.6. Diseño de Interfaz (UI/UX y Mobile-First)

La interfaz se diseñó con enfoque mobile-first, decisión validada por el relevamiento: el 72.5% de los estudiantes usaría la app desde el celular y el 95% incluye celular como dispositivo aceptable. Esto implica priorizar navegación compacta, acciones de bajo número de toques, tipografía legible y componentes que funcionen en pantallas pequeñas.

La estructura principal se compone de:

- Un shell de aplicación con drawer lateral.
- Un feed de notas filtrable por vista, búsqueda y materia.
- Un editor Markdown con modos de edición y lectura.
- Acciones contextuales para fijar, archivar, mover, eliminar y restaurar.
- Papelera con eliminación lógica y restauración.
- Tema claro/oscuro persistente.

La UX se apoya en decisiones de producto específicas: Entrada como destino por defecto, Materias como organización principal, Archivo para contenido inactivo y Papelera para evitar pérdidas accidentales. Estas decisiones reducen la carga cognitiva del estudiante y privilegian capturar rápido antes que configurar estructuras complejas.

## 4.7. Diseño de Base de Datos

### 4.7.1. Motor de persistencia

Lumapse utiliza **SQLite** como motor de base de datos, accedido a través del plugin `@capacitor-community/sqlite` en el entorno nativo Android y simulado con `sql.js` (WebAssembly) + `jeep-sqlite` durante el desarrollo web local. Esta decisión se documenta en [ADR-005](../adr/ADR-005-pivote-app-nativa.md) y [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

### 4.7.2. Metodología de diseño

El diseño de la base de datos sigue la metodología académica de tres niveles de abstracción:

1. **Modelo Conceptual** — Diagrama Entidad-Relación con notación Chen (Graphviz DOT, renderizado en [edotor.net](https://edotor.net)).
2. **Normalización** — Verificación de Primera, Segunda y Tercera Forma Normal sobre cada entidad.
3. **Modelo Lógico** — Esquema de tablas relacionales con PKs, FKs, tipos y restricciones (dbdiagram.io, sintaxis DBML).
4. **Modelo Físico** — Sentencias DDL SQL implementadas en `src/services/sqlite/connection.js`.

Los diagramas y la documentación de cada nivel se encuentran en [`docs/diagramas/database/`](../diagramas/database/).

### 4.7.3. Entidades del dominio

El modelo contempla dos entidades de dominio y una tabla técnica:

- **MATERIA** (`subjects`): Modela tanto las Materias (carpetas raíz) como las Secciones (subcarpetas) mediante auto-referencia. Si `parentSubjectId` es `NULL`, es una Materia; si tiene un valor, es una Sección hija de esa Materia. Profundidad máxima: 2 niveles ([DP-004](../producto/decisiones-producto.md)).
- **NOTA** (`notes`): Representa el contenido Markdown creado por el estudiante. Una nota puede vivir en la **Entrada** (`subjectId = NULL`), en una **Materia** o en una **Sección**.
- **METADATA** (`metadata`): Tabla técnica de clave-valor para control de migraciones y flags internos del sistema.

### 4.7.4. Estructura de información opinionada (DP-004)

La estructura de navegación de Lumapse es **opinionada**: no le da al usuario un lienzo en blanco como Notion u Obsidian, sino una jerarquía predefinida que refleja el flujo de trabajo natural de un estudiante universitario:

- **Entrada:** Destino por defecto de toda nota nueva. Captura rápida sin fricción.
- **Materias:** Carpetas creadas por el usuario, con opción de secciones dentro de cada una.
- **Archivo:** Materias aprobadas y notas archivadas.

Esta decisión fue validada con datos empíricos: el 69.2% de los 120 encuestados prefiere organizar por carpetas por materia (P11 del relevamiento).

### 4.7.5. Normalización y desnormalización intencional

El modelo se verificó contra las tres primeras formas normales (ver [02-normalizacion.md](../diagramas/database/02-normalizacion.md)):

- **1FN:** ✅ Todos los atributos son atómicos, sin grupos repetidos.
- **2FN:** ✅ Todas las PKs son simples (UUID), eliminando la posibilidad de dependencias parciales.
- **3FN:** ✅ Con una excepción documentada e intencional.

**Desnormalización intencional del campo `título`:**

El atributo `título` en la entidad NOTA presenta una dependencia transitiva respecto de `contenido`: el título se extrae automáticamente de la primera línea `# ` del texto Markdown (decisión de producto [DP-001](../producto/decisiones-producto.md)). En un modelo estrictamente normalizado en 3FN, este campo debería calcularse en tiempo de ejecución y no almacenarse.

Sin embargo, se decidió mantenerlo como **campo calculado desnormalizado** por las siguientes razones:

1. **Rendimiento en contexto mobile-first:** Para mostrar el listado de notas en la pantalla principal, sería necesario cargar y parsear el contenido Markdown completo de cada nota para extraer el título. Mediante una prueba de carga empírica simulando 5.000 notas (`scripts/run-load-tests.py`), se demostró que leer el campo desnormalizado es 2.2 veces más rápido que parsear el Markdown en tiempo real, logrando una reducción del 55.17% en el tiempo de procesamiento de CPU. En un dispositivo móvil con recursos limitados y batería finita, esta optimización es crítica.
2. **Consultas SQL eficientes:** Almacenar el título permite ejecutar `SELECT id, title, updatedAt FROM notes ORDER BY updatedAt DESC` sin cargar el campo `content`, que puede contener textos extensos.
3. **Consistencia automática:** El campo se recalcula y actualiza en cada operación de guardado (`updateNote`), garantizando que siempre refleja el estado actual del contenido.

Esta desnormalización está documentada en el análisis de normalización y es defendible ante el tribunal como una **decisión técnica fundamentada** en las restricciones del entorno de ejecución.

## 4.8. Patrones de Arquitectura y Diseño de Software

Lumapse no utiliza un único patrón de diseño, sino una combinación de **patrones arquitectónicos** y **patrones de diseño de software (GoF)** para mantener la base de código en Vanilla JS estructurada, escalable y mantenible.

### Patrones Arquitectónicos

*   **Arquitectura en Capas (Layered Architecture):**
    El proyecto aplica una separación estricta de responsabilidades a través de su estructura de directorios:
    *   **Capa de Presentación (UI):** (`src/components/`, `src/layout/`) Encargada de manipular el DOM y gestionar eventos de usuario de forma aislada. Dentro de `src/components/`, los archivos se agrupan por feature (`note-editor/`, `feed/`, `academic-events/`, `backup/`, `markdown/`, `common/`) para sostener la mantenibilidad a medida que crece la UI.
    *   **Capa de Negocio / Lógica:** (`src/services/`) Contiene la lógica de aplicación pura (e.g., `MarkdownService`, `ExportService`), completamente agnóstica de la interfaz gráfica.
    *   **Capa de Datos:** (`src/store/`, `src/services/sqlite/`) Responsable del estado global de la aplicación y la persistencia local.
*   **Arquitectura Offline-First:**
    La fuente de verdad primaria es la base de datos local (SQLite). Esto garantiza resiliencia, disponibilidad sin conexión y rendimiento óptimo, alineándose con las necesidades de gestión de conocimiento personal (PKM).

### Patrones de Diseño (GoF y UI)

Al carecer de un framework reactivo como React o Vue, la aplicación implementa patrones manuales para la reactividad y la estructura de componentes:

*   **Patrón Observer (Publicador/Suscriptor):**
    Utilizado extensamente para el manejo del estado global. El almacén central (`NoteStore`) actúa como publicador, permitiendo que múltiples componentes de la UI (suscriptores) reaccionen automáticamente a los cambios de estado (mediante `NoteStore.subscribe`) sin acoplar fuertemente la lógica de presentación con la de negocio.
*   **Patrón Component (UI Components):**
    La interfaz gráfica se descompone en clases encapsuladas. Cada componente (e.g., `NoteEditor`) recibe un contenedor del DOM, renderiza su propia plantilla HTML, gestiona sus *event listeners* internamente y expone un método de limpieza (`destroy()`), imitando el ciclo de vida de componentes de frameworks modernos.
*   **Patrón Command (y Command Registry):**
    Implementado en la interacción del editor (e.g., `editorCommandRegistry.js`, `SlashCommandHandler.js`). Encapsula acciones del usuario como comandos independientes registrados centralmente. Esto desacopla a quien invoca la acción (un atajo de teclado o botón) del receptor (la lógica del editor), facilitando agregar nuevas funciones sin modificar el código base del componente.
*   **Patrón Singleton / Module:**
    Aplicado en servicios esenciales (como `MarkdownService`) que exportan funciones puras o instancias únicas a lo largo del ciclo de vida de la aplicación, optimizando la huella de memoria y asegurando un comportamiento consistente en todo el sistema.

---

# Capítulo 5: Desarrollo e Implementación

## 5.1. Estructura del Repositorio y Entorno

El repositorio está organizado para que código, documentación, scripts, análisis de datos y configuración nativa convivan en una misma base versionada. Esta decisión permite que el proyecto sea auditable desde Git: cada cambio de código puede relacionarse con documentación, requisitos, decisiones y evidencia.

Las carpetas principales son:

| Carpeta | Propósito |
|---|---|
| `src/` | Código fuente de la aplicación web empaquetada. |
| `src/components/` | Componentes de interfaz organizados por feature: editor, feed, fechas académicas, backup, Markdown y piezas comunes. |
| `src/services/` | Servicios de negocio: Markdown, temas, materias, persistencia SQLite y base técnica de portabilidad local en revisión. |
| `src/store/` | Estado de aplicación, filtros y coordinación entre datos y UI. |
| `android/` | Proyecto Android generado y mantenido por Capacitor. |
| `docs/` | Documentación técnica, producto, gestión, hitos e informe final. |
| `scripts/` | Automatización local: quality gate, auditorías, deploy Android y ensamblado del informe. |
| `tests/` | Suite de tests unitarios con Vitest. |
| `.github/` | Workflows de GitHub Actions, plantillas de issues y pull requests. |

El entorno de desarrollo usa Node.js, npm y Vite para levantar la aplicación en navegador. Para la compilación Android se requiere Android Studio, JDK y SDK Android. La guía operativa se documenta en [flujo-desarrollo-android.md](../flujo-desarrollo-android.md).

## 5.2. Capa de Presentación (Componentes UI)

La interfaz está implementada con componentes propios en JavaScript y CSS, sin framework de UI. Esta decisión exige más trabajo manual que una solución basada en React o Vue, pero mantiene el bundle liviano y hace explícito el flujo de eventos, renderizado y estado.

Los componentes principales son:

| Componente | Responsabilidad |
|---|---|
| `note-editor/NoteEditor` | Edición de contenido Markdown, borradores persistentes y modos de trabajo. |
| `markdown/MarkdownPreview` | Renderizado seguro del Markdown. |
| `feed/NoteList` y `feed/NoteCardRenderer` | Listado y representación visual de notas. |
| `feed/TrashView` | Papelera, restauración y eliminación definitiva. |
| `academic-events/Heatmap` y `academic-events/UpcomingAcademicEvents` | Calendario, fechas académicas discretas y recordatorios próximos. |
| `backup/BackupView` | Vista del flujo manual de backup externo. |
| `common/ConfirmDialog` | Confirmaciones personalizadas para reemplazar diálogos nativos. |
| `common/Toast` | Mensajes breves de estado y feedback. |
| `drawerSubjects` | Navegación por materias y secciones. |
| `drawerController` | Coordinación del drawer lateral. |

La capa de presentación no accede directamente a la base de datos. Interactúa con el store y los servicios, respetando una separación entre UI, estado y persistencia. La organización por carpetas de feature se documenta en [ADR-007](../adr/ADR-007-organizacion-componentes-por-feature.md) y evita que `src/components/` se convierta en una carpeta plana difícil de mantener.

## 5.3. Gestión de Estado Reactivo

La gestión de estado se implementa con un store propio basado en el patrón Observer. El estado central mantiene notas, materias, vista activa, búsqueda, nota seleccionada, materia seleccionada y banderas de UI. Cuando una operación modifica datos o filtros, el store notifica a los componentes suscriptores para que actualicen la pantalla.

El store se dividió en módulos para reducir acoplamiento:

| Archivo | Responsabilidad |
|---|---|
| `NoteStore.state.js` | Estado base y suscripciones. |
| `NoteStore.data.js` | Carga, creación, actualización y eliminación de datos. |
| `NoteStore.ui.js` | Acciones de UI y coordinación de vistas. |
| `noteFilters.ts` | Reglas de filtrado y visibilidad de notas. |

Esta división permite testear reglas de negocio sin renderizar toda la interfaz. También facilita mantener invariantes importantes, como ocultar notas eliminadas del feed, mostrar notas fijadas al tope y respetar el filtro por materia o sección.

## 5.4. Capa de Persistencia (Evolución de IndexedDB a SQLite)

La persistencia tuvo dos etapas. En la fase inicial del MVP se implementó almacenamiento local con IndexedDB, suficiente para validar el editor y el funcionamiento offline en navegador. Luego, tras el relevamiento de datos y el pivote a app nativa, se decidió migrar a SQLite. La protección actual del trabajo en curso se resuelve con borradores persistentes locales del editor, separados del guardado definitivo de notas.

La motivación del cambio fue doble:

- El público objetivo usará principalmente celular, por lo que la distribución como APK resulta más familiar.
- SQLite ofrece persistencia local más robusta que IndexedDB en el contexto de una app Android instalada.

La arquitectura actual utiliza `@capacitor-community/sqlite` en Android. Para desarrollo web local se incorporó `sql.js` y `jeep-sqlite`, permitiendo simular SQLite en navegador sin modificar los componentes ni el store. La configuración se automatiza con el script `copy-wasm`, ejecutado antes de `npm run dev`, `npm run build` y después de instalar dependencias.

La capa SQLite se encuentra en `src/services/sqlite/` y separa conexión, manejo de errores, operaciones de notas y operaciones de materias. Esta separación permite auditar el schema, generar DBML desde código y validar la jerarquía de materias con scripts automatizados.

## 5.5. Procesamiento de Markdown y Seguridad (XSS)

Markdown es el formato base de las notas. Esta decisión aporta portabilidad, simplicidad y compatibilidad con herramientas externas. Sin embargo, renderizar Markdown como HTML introduce un riesgo de seguridad: el contenido escrito por el usuario podría convertirse en HTML ejecutable si no se sanitiza correctamente.

Para resolverlo, Lumapse usa:

- `marked` para convertir Markdown a HTML.
- `DOMPurify` para sanitizar el HTML resultante antes de insertarlo en el DOM.

La responsabilidad está encapsulada en `MarkdownService`, con tests unitarios que verifican comportamiento esperado y prevención de inyección básica. De esta forma, la UI consume HTML ya procesado y no replica lógica de sanitización en múltiples componentes.

## 5.6. Empaquetado Nativo (Capacitor)

Capacitor permite empaquetar la aplicación web como una app Android nativa, reutilizando el código existente en `src/` y generando un proyecto Android en `android/`. Esta estrategia evita reescribir la aplicación en Kotlin o React Native, y conserva la inversión realizada en la arquitectura web.

El flujo general es:

```text
npm run build
        |
        v
npx cap sync
        |
        v
Gradle compila el proyecto Android
        |
        v
APK instalable en dispositivo
```

El script [deploy-android.sh](../../scripts/deploy-android.sh) automatiza este proceso. En su modo normal conserva los datos locales de la app para no borrar SQLite durante pruebas; y con `--clean` permite una instalación limpia cuando se necesita simular el primer uso o descartar estado local.

La decisión de usar Capacitor se fundamenta en [ADR-005](../adr/ADR-005-pivote-app-nativa.md): el relevamiento mostró preferencia clara por celular, necesidad offline y baja tolerancia a fricción técnica.

## 5.7. Licenciamiento de Software y Filosofía Open Source

Lumapse se publica bajo licencia GNU GPLv3. Esta elección responde a una decisión ética y académica: el proyecto nace en un entorno educativo público y se desarrolla como evidencia de aprendizaje profesionalizante. Por lo tanto, el código no solo cumple una función de producto, sino también de material de estudio, referencia y posible punto de partida para futuras cohortes.

La GPLv3 garantiza que las obras derivadas mantengan la misma libertad de uso, estudio, modificación y redistribución. En términos prácticos, si otra persona toma Lumapse como base para continuar el proyecto, debe preservar el carácter abierto del código. Esto evita que conocimiento producido dentro de una institución educativa sea privatizado sin devolver mejoras a la comunidad.

La licencia también refuerza la transparencia del proyecto: cualquier evaluador puede revisar cómo se implementó la aplicación, cómo se tomaron decisiones y cómo evolucionó la solución.

## 5.8. Integración Continua (CI) — Automatización de Calidad de Código

### 5.8.1. ¿Qué es la Integración Continua?

La **Integración Continua** (CI, del inglés *Continuous Integration*) es una práctica de ingeniería de software mediante la cual cada modificación del código fuente se verifica automáticamente mediante una serie de comprobaciones definidas por el equipo de desarrollo. El objetivo es detectar problemas lo antes posible en el ciclo de vida del software, reduciendo el costo de corrección y aumentando la confianza en el código que se entrega.

En entornos profesionales, un pipeline de CI suele incluir: análisis estático de código, ejecución de tests unitarios, compilación del proyecto y, eventualmente, despliegue automático. Para Lumapse, el workflow evolucionó desde un chequeo inicial de lint hacia un **Quality Gate** integral que combina lint, tests, build, presupuestos de bundle y auditorías documentales/técnicas.

### 5.8.2. Herramientas utilizadas

| Herramienta | Rol | Versión |
|---|---|---|
| **ESLint** | Linter: analiza el código JavaScript en busca de errores y malas prácticas | v10.x (flat config) |
| **Vitest** | Ejecución de tests unitarios automatizados | v4.x |
| **GitHub Actions** | Plataforma de CI integrada en GitHub que ejecuta el workflow automáticamente | N/A (servicio cloud) |
| **Scripts de auditoría** | Trazabilidad, links, schema SQLite, DBML, jerarquía de materias, a11y y diálogos nativos | Scripts locales del repositorio |

#### ¿Qué es un Linter?

Un linter es una herramienta que lee el código fuente de forma estática —sin ejecutarlo— y reporta:

- **Errores:** uso de variables no definidas, imports duplicados, construcciones inválidas.
- **Advertencias:** uso de `var` en lugar de `const`/`let`, comparaciones con `==` en vez de `===`, variables declaradas pero nunca utilizadas.

El linter **nunca modifica el código ni afecta la ejecución de la aplicación**. Su único efecto es generar un reporte que el desarrollador puede consultar para mejorar la calidad del código.

### 5.8.3. Implementación en Lumapse

Se crearon y consolidaron tres grupos de configuración:

**`eslint.config.js` (raíz del proyecto):** Define el alcance del análisis (únicamente `src/`), las variables globales del entorno del navegador permitidas (`window`, `document`, `alert`, `crypto`, etc.) y el conjunto de reglas activas:

```javascript
// Reglas clave configuradas:
"no-unused-vars": "warn"    // Variables declaradas pero no usadas → advertencia
"no-undef":       "error"   // Variables no definidas              → error
"prefer-const":   "warn"    // Preferir const sobre let            → advertencia
"no-var":         "warn"    // Evitar var (obsoleto en ES6+)       → advertencia
"eqeqeq":         "warn"    // Usar === en lugar de ==             → advertencia
```

**`.github/workflows/lint.yml`:** Define el workflow `CI — Quality Gate`, ejecutado automáticamente ante cada `push` o `pull request` a la rama `main`:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "22" }
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - run: npm run check:size
      - run: npm run check:native-dialogs
      - run: npm run check:traceability
      - run: npm run check:docs
      - run: npm run check:schema
      - run: npm run check:dbml
      - run: npm run check:subjects
      - run: npm run check:a11y
```

**`package.json`:** Expone los mismos entrypoints para uso local y CI. El comando principal de verificación local es:

```bash
npm run verify
```

### 5.8.4. Flujo de trabajo resultante

```
git push origin main
        │
        ▼
GitHub recibe el commit
        │
        ▼
GitHub Actions activa el workflow "CI — Quality Gate"
        │
        ├─ Checkout del código
        ├─ Instalación de dependencias (npm ci)
        ├─ Lint + tests + build
        ├─ Bundle budget
        └─ Auditorías documentales y técnicas
               │
               ├─ Sin problemas → ✅ Badge verde en GitHub
               └─ Con problemas → ❌ Badge rojo + reporte con archivo, línea y descripción
```

> **Nota importante:** el workflow es una verificación remota de calidad. Localmente, los hooks de Git ejecutan un quality gate antes de commit/push para reducir la probabilidad de enviar cambios rotos.

### 5.8.5. Resultado actual

Al cierre de la preparación técnica inicial del Hito 05, el quality gate local verifica lint, 371 tests unitarios, build de producción, bundle budget, trazabilidad, links internos, schema SQLite, DBML, jerarquía de materias, accesibilidad estática y ausencia de diálogos nativos fuera del seeder.

### 5.8.6. Justificación de la práctica

Incorporar CI desde las etapas tempranas del proyecto responde a uno de los principios fundamentales de la ingeniería de software moderna: **"fail fast"** (detectar y corregir problemas cuanto antes). El costo de corregir un error aumenta exponencialmente a medida que avanza el ciclo de desarrollo; un linter que detecta una variable mal declarada en el momento del commit es incomparablemente más barato que encontrarla en producción.

Adicionalmente, la presencia de un workflow de CI en el repositorio es una señal de madurez técnica reconocible por cualquier evaluador externo: indica que el proyecto no depende exclusivamente del criterio subjetivo del desarrollador, sino que cuenta con comprobaciones objetivas y automatizadas sobre la calidad del código.

> **Referencia:** `.github/workflows/lint.yml` · `package.json` · `eslint.config.js` · `scripts/quality.sh`

---

# Capítulo 6: Pruebas y Validación

## 6.1. Estrategia de Testing

La estrategia de pruebas de Lumapse combina validaciones automatizadas, pruebas unitarias, smoke tests nativos, auditorías documentales y pruebas manuales en dispositivo. Dado que el proyecto tiene alcance académico y una sola persona desarrolladora, la estrategia prioriza alto impacto y reproducibilidad por encima de una cobertura exhaustiva difícil de sostener.

El enfoque se organiza en capas:

| Capa | Objetivo | Herramientas |
|---|---|---|
| Lint | Detectar errores sintácticos, variables no definidas y malas prácticas. | ESLint |
| Unit tests | Verificar servicios, store, filtros y componentes críticos. | Vitest |
| Build | Confirmar que el proyecto compila para producción. | Vite |
| Auditorías técnicas | Validar bundle, a11y estática, schema, DBML y jerarquía. | Scripts locales |
| Auditorías documentales | Validar links internos y trazabilidad RF/HU/ADR. | Scripts Python |
| Android smoke tests | Confirmar paquete nativo y contexto básico. | Gradle/JUnit |
| Pruebas manuales | Verificar flujos reales en dispositivo. | Android físico, scrcpy |

El comando principal de verificación local es `npm run verify`, que encadena el quality gate y auditorías adicionales. En CI, GitHub Actions ejecuta el workflow `CI — Quality Gate` ante cada push o pull request sobre `main`.

Para la beta controlada `v0.4.8`, el gate final se ejecutó sin fallos bloqueantes antes de publicar el APK firmado en GitHub Releases. La evidencia operativa queda registrada en `CHANGELOG.md`, `TODO`, `docs/hitos/hito-05-septiembre.md` y `docs/gestion/checklist-validacion-android.md`.

## 6.2. Pruebas Unitarias

Las pruebas unitarias se implementan con Vitest. Cubren principalmente lógica de negocio y reglas de estado, porque son las zonas donde un error puede afectar datos del usuario o romper flujos centrales.

Los módulos actualmente cubiertos incluyen:

- `MarkdownService`: renderizado y sanitización de Markdown.
- `ThemeService`: persistencia y alternancia de tema visual.
- Servicios SQLite: conexión, errores, notas y materias.
- `SubjectService`: validaciones de jerarquía, nombres, CRUD y papelera.
- `NoteStore`: carga, mutación de datos y acciones de UI.
- `noteFilters`: reglas de visibilidad y filtrado.
- Componentes críticos: confirmación, routing de acciones de feed y papelera.

La suite unitaria permite sostener cambios internos sin depender exclusivamente de pruebas manuales. Esto fue especialmente importante durante la migración a SQLite, la implementación de papelera y la consolidación de materias/secciones, porque esas áreas afectan persistencia, visibilidad y recuperación de datos.

Al corte `v0.4.8`, la suite local registra 773 tests unitarios pasando dentro del flujo `npm run verify`.

## 6.3. Pruebas de Integración y Funcionamiento Offline

El funcionamiento offline se valida desde varias perspectivas:

- Los assets principales se empaquetan dentro del APK, por lo que la app instalada no depende de red para abrir.
- Las notas y materias se persisten localmente en SQLite.
- El proyecto incluye auditorías para detectar dependencias externas no deseadas o diálogos nativos no permitidos.
- La persistencia se verifica con pruebas unitarias sobre servicios SQLite y con pruebas manuales en dispositivo.

En Android se reemplazaron los smoke tests de plantilla por pruebas bajo el paquete real `com.lumapse.app`. Estas pruebas no validan todavía toda la UI, pero sí evitan conservar referencias de plantilla y confirman que el paquete nativo básico corresponde al proyecto.

Además, los scripts `check:schema`, `check:dbml` y `check:subjects` cumplen una función de integración documental y técnica: verifican que el schema SQLite documentado, el DBML derivado del código y las reglas de jerarquía de materias no diverjan.

Las pruebas manuales en dispositivo siguen siendo necesarias para validar escenarios que no se capturan completamente en Node o en CI: instalación del APK, primer uso, modo avión, persistencia tras cerrar la app, restauración desde papelera, archivado, navegación táctil y rendimiento percibido.

La beta `v0.4.8` fue validada inicialmente el 2026-07-01 en un Samsung Galaxy S20 FE (`SM-G780G`) con Android 13. La checklist cubrió instalación limpia, apertura offline, creación/edición/persistencia de notas, materias y secciones, búsqueda, pin/archivo, estados académicos, fechas discretas, papelera, tema, rotación/responsivo, rendimiento percibido y exportación/importación ZIP. El resultado fue apto para beta controlada, con observaciones UX menores.

## 6.4. Validación de Rendimiento y UX

La validación de rendimiento y UX se apoya en métricas objetivas y revisión manual. En el estado actual del proyecto se verifican automáticamente el build de producción y el presupuesto de bundle, ya que el tamaño final impacta directamente en una app orientada a celulares con recursos limitados.

Las validaciones actuales incluyen:

- `npm run build`: confirma que la aplicación compila sin errores.
- `npm run check:size`: controla que el bundle no exceda presupuestos definidos.
- `npm run check:a11y`: ejecuta auditoría estática de accesibilidad.
- `npm run check:native-dialogs`: bloquea `alert`, `confirm` y `prompt` nativos fuera del seeder.
- Revisión manual de flujos mobile-first en dispositivo Android.
- Publicación de `v0.4.8` como beta controlada con APK firmada y SHA-256 documentado.

Quedan pendientes para el cierre documental final y Hito 06 pruebas más cercanas al usuario final: medición de tiempo hasta crear la primera nota, revisión fina de contraste y navegación táctil, comportamiento con mayor volumen real de notas y feedback de estudiantes sobre el prototipo instalado.

La validación final no debe limitarse a que el código compile. Para que Lumapse cumpla su objetivo, debe demostrar que una persona puede instalarla, abrirla sin conexión, crear una nota rápidamente, encontrarla después, organizarla por materia y confiar en que no se pierde.

---

# Capítulo 7: Conclusiones

## 7.1. Cumplimiento de Objetivos

## 7.2. Lecciones Aprendidas

A lo largo del desarrollo de Lumapse, se produjeron situaciones no planificadas que
obligaron a tomar decisiones técnicas y metodológicas que, en retrospectiva, resultaron
ser las experiencias de aprendizaje más valiosas del proyecto. A continuación se
documentan las más significativas.

### 7.2.1. Gestión de riesgos técnicos: la estimación PERT como herramienta de decisión

La migración de la aplicación web (PWA) a una app nativa con Capacitor fue una decisión
de alto riesgo técnico. No se trataba de agregar una funcionalidad nueva, sino de cambiar
la base sobre la cual el sistema entero se ejecutaba. Para gestionar este riesgo se
aplicó la técnica de estimación PERT (Program Evaluation and Review Technique), asignando
tres escenarios —optimista, más probable y pesimista— exclusivamente a los módulos
críticos: la integración de Capacitor y la migración de IndexedDB a SQLite.

**Lección:** La estimación formal no es solo un requisito académico; es una herramienta
que obliga a pensar en los escenarios de fracaso antes de escribir la primera línea de
código. Gracias a la estimación PERT, se identificó que la integración de Capacitor
podía extenderse hasta 14 días en el peor caso, lo que permitió planificar el hito
con holgura suficiente. Sin esta estimación, el desvío habría sido una sorpresa.

> **Referencia:** [`docs/gestion/estimacion-pert.md`](../gestion/estimacion-pert.md)

### 7.2.2. Adaptación del entorno de pruebas: hardware limitado como oportunidad

El dispositivo principal de desarrollo (Samsung Galaxy S7 Edge) tenía el módulo de
pantalla dañado: no mostraba imagen alguna. En lugar de descartarlo, se configuró un
flujo de trabajo alternativo utilizando **scrcpy**, una herramienta open source que
proyecta la pantalla del dispositivo Android en la computadora de desarrollo a través
de USB.

El comando utilizado (`scrcpy --turn-screen-off -K`) permitía:

- Ver la pantalla del celular en una ventana de macOS.
- Enviar toques y texto desde el teclado de la computadora.
- Apagar la pantalla física del dispositivo para ahorrar batería.

**Lección:** Los recursos limitados no son un impedimento si se buscan soluciones
creativas. Un dispositivo con la pantalla rota se convirtió en una estación de
debugging dedicada, aislada de datos personales, que podía ser formateada y
reinstalada sin riesgo. Esta restricción forzó a documentar exhaustivamente el
flujo de trabajo de compilación y despliegue
([`docs/flujo-desarrollo-android.md`](../flujo-desarrollo-android.md)),
lo cual terminó beneficiando la reproducibilidad del proyecto.

### 7.2.3. Estimación retroactiva vs. prospectiva: el sesgo de confirmación

Durante los Hitos 02 y 03, la estimación de Story Points se realizó de forma
**retroactiva**: primero se desarrollaron las funcionalidades y luego se les asignó
un valor en puntos. Este enfoque, si bien es pragmático para proyectos en marcha,
introduce un sesgo de confirmación: se tiende a asignar valores que confirman la
velocidad deseada, en lugar de reflejar la complejidad real.

A partir del Hito 04, se adoptó la práctica de estimar **antes** del inicio del
desarrollo, lo que permite contrastar la estimación con la realidad y generar datos
de velocidad realmente útiles para la planificación futura.

**Lección:** La estimación que no puede equivocarse no sirve. El valor de estimar
no está en acertar, sino en poder medir cuánto nos desviamos y por qué. La honestidad
en la documentación de los desvíos es más valiosa que un reporte "perfecto" que no
refleje la realidad.

> **Referencia:** [`docs/gestion/seguimiento-velocidad.md`](../gestion/seguimiento-velocidad.md)

### 7.2.4. Documentación viva vs. documentación muerta

Una de las decisiones más importantes del proyecto fue mantener toda la documentación
en formato Markdown dentro del repositorio Git, en lugar de escribirla en documentos
Word o PDF separados. Esto tuvo consecuencias profundas:

- **Versionamiento:** Cada cambio en la documentación tiene un commit asociado con
  fecha, autor y motivo. Es posible ver cómo evolucionó cualquier decisión en el tiempo.
- **Trazabilidad:** Los documentos se referencian entre sí mediante enlaces relativos
  (`[ver ADR-005](../adr/ADR-005-pivote-app-nativa.md)`), lo que permite navegar la
  documentación como un sistema interconectado.
- **Mantenimiento:** Al vivir junto al código, la documentación se actualiza en el
  mismo flujo de trabajo. No existe la desincronización entre "lo que dice el documento"
  y "lo que hace el código".

**Lección:** La documentación más completa del mundo es inútil si nadie la mantiene.
Al integrar la documentación en el flujo de Git (commit → push → review), se elimina
la fricción de mantenerla actualizada. El costo de documentar se reduce porque se hace
incrementalmente, no como un esfuerzo monolítico al final del proyecto.

## 7.3. Trabajo Futuro y Posibles Mejoras

## 7.4. Cierre
