# Informe Final — Lumapse

| Campo | Valor |
|---|---|
| Alumno | José David Sandoval |
| Carrera | Tecnicatura en Análisis de Sistemas y Desarrollo de Software |
| Institución | IES 6023 "Dr. Alfredo Loutaif" |
| Materia | Prácticas Profesionalizantes III |
| Año | 2026 |
| Estado | Checkpoint documental — Hito 06 activo |
| Alcance funcional | v0.4.8 (`v0.4.8` / `a808de7`) |
| Fuente técnica auditada | `main` @ `5db64de` |
| Corte documental | 2026-07-15 |
| Ensamblado automáticamente | 2026-07-15 |

---

## Tabla de Contenidos

- [Capítulo 1: Introducción y Planteo del Problema](#capítulo-1-introducción-y-planteo-del-problema)
  - [1.1. Contexto del Proyecto](#11-contexto-del-proyecto)
  - [1.2. Planteo del Problema](#12-planteo-del-problema)
  - [1.3. Objetivos](#13-objetivos)
    - [1.3.1. Objetivo General](#131-objetivo-general)
    - [1.3.2. Objetivos Específicos](#132-objetivos-específicos)
  - [1.4. Justificación y Alcance](#14-justificación-y-alcance)
- [Capítulo 2: Marco Metodológico y Modelo de Negocio](#capítulo-2-marco-metodológico-y-modelo-de-negocio)
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
- [Capítulo 3: Relevamiento y Análisis de Datos](#capítulo-3-relevamiento-y-análisis-de-datos)
  - [3.1. Metodología de Recolección (Población y Muestra)](#31-metodología-de-recolección-población-y-muestra)
  - [3.2. Análisis Demográfico](#32-análisis-demográfico)
  - [3.3. Resultados sobre Hábitos de Estudio y Toma de Notas](#33-resultados-sobre-hábitos-de-estudio-y-toma-de-notas)
  - [3.4. Análisis Cualitativo (Puntos de Dolor)](#34-análisis-cualitativo-puntos-de-dolor)
  - [3.5. Conclusiones del Relevamiento e Impacto en el Producto](#35-conclusiones-del-relevamiento-e-impacto-en-el-producto)
- [Capítulo 4: Arquitectura y Diseño](#capítulo-4-arquitectura-y-diseño)
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
    - [4.7.5. Normalización y decisión de persistencia del título](#475-normalización-y-decisión-de-persistencia-del-título)
  - [4.8. Patrones de Arquitectura y Diseño de Software](#48-patrones-de-arquitectura-y-diseño-de-software)
    - [4.8.1. Organización modular y flujo de dependencias](#481-organización-modular-y-flujo-de-dependencias)
    - [4.8.2. Patrones identificados en el código](#482-patrones-identificados-en-el-código)
    - [4.8.3. Relación con MVC y límites de la clasificación](#483-relación-con-mvc-y-límites-de-la-clasificación)
- [Capítulo 5: Desarrollo e Implementación](#capítulo-5-desarrollo-e-implementación)
  - [5.1. Estructura del Repositorio y Entorno](#51-estructura-del-repositorio-y-entorno)
  - [5.2. Capa de Presentación (Componentes UI)](#52-capa-de-presentación-componentes-ui)
  - [5.3. Gestión de Estado Reactivo](#53-gestión-de-estado-reactivo)
  - [5.4. Capa de Persistencia (Evolución de IndexedDB a SQLite)](#54-capa-de-persistencia-evolución-de-indexeddb-a-sqlite)
  - [5.5. Procesamiento de Markdown y Seguridad (XSS)](#55-procesamiento-de-markdown-y-seguridad-xss)
  - [5.6. Empaquetado Android Híbrido (Capacitor)](#56-empaquetado-android-híbrido-capacitor)
  - [5.7. Licenciamiento de Software y Filosofía Open Source](#57-licenciamiento-de-software-y-filosofía-open-source)
  - [5.8. Integración Continua (CI) — Automatización de Calidad de Código](#58-integración-continua-ci--automatización-de-calidad-de-código)
    - [5.8.1. ¿Qué es la Integración Continua?](#581-qué-es-la-integración-continua)
    - [5.8.2. Herramientas utilizadas](#582-herramientas-utilizadas)
    - [5.8.3. Implementación en Lumapse](#583-implementación-en-lumapse)
    - [5.8.4. Flujo de trabajo resultante](#584-flujo-de-trabajo-resultante)
    - [5.8.5. Resultado actual](#585-resultado-actual)
    - [5.8.6. Justificación de la práctica](#586-justificación-de-la-práctica)
- [Capítulo 6: Pruebas y Validación](#capítulo-6-pruebas-y-validación)
  - [6.1. Estrategia de Testing](#61-estrategia-de-testing)
  - [6.2. Pruebas Unitarias](#62-pruebas-unitarias)
  - [6.3. Pruebas de Integración y Funcionamiento Offline](#63-pruebas-de-integración-y-funcionamiento-offline)
  - [6.4. Validación de Rendimiento y UX](#64-validación-de-rendimiento-y-ux)
  - [6.5. Alcance de la Evidencia y Validación Pendiente](#65-alcance-de-la-evidencia-y-validación-pendiente)
- [Capítulo 7: Conclusiones](#capítulo-7-conclusiones)
  - [7.1. Cumplimiento de Objetivos](#71-cumplimiento-de-objetivos)
  - [7.2. Lecciones Aprendidas](#72-lecciones-aprendidas)
    - [7.2.1. Gestión de riesgos técnicos: la estimación PERT como herramienta de decisión](#721-gestión-de-riesgos-técnicos-la-estimación-pert-como-herramienta-de-decisión)
    - [7.2.2. Adaptación del entorno de pruebas: hardware limitado como oportunidad](#722-adaptación-del-entorno-de-pruebas-hardware-limitado-como-oportunidad)
    - [7.2.3. Estimación retroactiva vs. prospectiva: el sesgo de confirmación](#723-estimación-retroactiva-vs-prospectiva-el-sesgo-de-confirmación)
    - [7.2.4. Documentación viva vs. documentación muerta](#724-documentación-viva-vs-documentación-muerta)
  - [7.3. Trabajo Futuro y Posibles Mejoras](#73-trabajo-futuro-y-posibles-mejoras)
    - [7.3.1. Cierre documental y de calidad](#731-cierre-documental-y-de-calidad)
    - [7.3.2. Mejoras posteriores a la beta](#732-mejoras-posteriores-a-la-beta)
    - [7.3.3. Evolución de largo plazo](#733-evolución-de-largo-plazo)
  - [7.4. Cierre](#74-cierre)
- [Referencias](#referencias)
  - [8.1. Bibliografía metodológica](#81-bibliografía-metodológica)
  - [8.2. Normas y documentación técnica oficial](#82-normas-y-documentación-técnica-oficial)
  - [8.3. Fuentes primarias del proyecto](#83-fuentes-primarias-del-proyecto)

---

# Capítulo 1: Introducción y Planteo del Problema

## 1.1. Contexto del Proyecto

Lumapse es una aplicación móvil de captura, organización y recuperación de notas de estudio, desarrollada como proyecto integrador para la materia Prácticas Profesionalizantes III de la Tecnicatura en Análisis de Sistemas y Desarrollo de Software del IES 6023 "Dr. Alfredo Loutaif".

El proyecto surge a partir de una necesidad observada en el contexto académico local: contar con una herramienta simple, rápida y confiable para tomar apuntes durante la cursada. Las alternativas existentes resuelven partes de esa necesidad, pero combinan de maneras diferentes cuentas, sincronización, complejidad funcional y almacenamiento local; Lumapse explora una combinación deliberadamente acotada para el contexto relevado.

La primera definición del producto fue una aplicación web progresiva (PWA) con persistencia local. El relevamiento realizado sobre estudiantes del IES 6023 respaldó dos prioridades: uso mobile-first y funcionamiento offline. La encuesta no comparó tecnologías de distribución; el paso a una aplicación Android empaquetada con Capacitor y persistencia SQLite se decidió después mediante el análisis técnico documentado en [ADR-005](../adr/ADR-005-pivote-app-nativa.md) y [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

Desde el punto de vista técnico, Lumapse combina tecnologías web modernas (Vite, JavaScript modular y una adopción gradual de TypeScript, CSS nativo), empaquetado Android mediante Capacitor, persistencia local con SQLite, renderizado Markdown seguro y automatización de calidad con GitHub Actions y scripts locales. Desde el punto de vista metodológico, el proyecto se apoya en Design Thinking, Lean UX, gestión incremental por hitos, documentación viva en Markdown y trazabilidad entre necesidades, requisitos, decisiones y código.

## 1.2. Planteo del Problema

El problema central no es la inexistencia de aplicaciones de notas, sino explorar una solución acotada para el contexto relevado: estudiantes de nivel superior, prioridad declarada por el celular, disponibilidad de red no permanente y necesidad de capturar y organizar información sin agregar complejidad innecesaria. El peso tolerable de instalación y la velocidad real de captura siguen siendo hipótesis a validar con el prototipo.

El relevamiento de datos respaldó este diagnóstico dentro de la muestra. Sobre 120 respuestas válidas, el 88.3% declaró tomar notas principalmente en cuaderno o papel; el 48.7% de quienes toman notas reconoció dificultades en su forma actual de trabajo; y las dificultades más repetidas fueron pérdida de notas y desorganización, ambas con 58.9% entre quienes reportaron problemas. Además, el 81.7% eligió "A veces", "Raramente" o "Nunca" al responder por acceso estable a internet y el 72.5% usaría una app de notas desde el celular ([resultados del relevamiento](../producto/resultados-relevamiento.md)).

Las herramientas existentes cubren partes del problema, pero no el conjunto completo de restricciones. Google Keep y OneNote requieren cuentas y dependen de ecosistemas externos; Notion resulta potente pero pesado y orientado a flujos más complejos; Obsidian y Joplin son más cercanas a una filosofía local-first, pero pueden resultar técnicas o pesadas para el usuario promedio. Lumapse se posiciona en un espacio deliberadamente acotado: una app de notas académicas, offline-first, sin cuenta, ligera, local y centrada en el flujo real de estudiar.

## 1.3. Objetivos

### 1.3.1. Objetivo General

Desarrollar y documentar una aplicación móvil offline-first para que estudiantes de nivel superior puedan capturar, organizar y recuperar notas de estudio de forma rápida y confiable, utilizando evidencia empírica del público objetivo y prácticas profesionales de análisis, diseño, implementación, validación y documentación de software.

### 1.3.2. Objetivos Específicos

- Relevar necesidades, hábitos y problemas de estudiantes reales del IES 6023 mediante una encuesta estructurada.
- Analizar los datos obtenidos para validar o ajustar las hipótesis iniciales del producto.
- Definir personas de usuario, requisitos funcionales, requisitos no funcionales, historias de usuario y decisiones de producto trazables.
- Diseñar una arquitectura local-first que priorice funcionamiento offline, privacidad y persistencia robusta.
- Implementar un editor de notas con soporte Markdown, borradores persistentes, búsqueda y organización por materias y secciones, junto con un mecanismo manual de respaldo e importación local del espacio de trabajo.
- Migrar la persistencia desde IndexedDB hacia SQLite de acuerdo con las decisiones arquitectónicas aprobadas, preservando las prioridades mobile-first y offline-first respaldadas por el relevamiento.
- Empaquetar la aplicación como APK Android mediante Capacitor.
- Incorporar pruebas unitarias, validaciones documentales y un quality gate automatizado para sostener la calidad del código y la documentación.
- Mantener documentación viva y versionada que permita reconstruir el proceso de decisión, desarrollo y validación.

## 1.4. Justificación y Alcance

La justificación académica del proyecto reside en que Lumapse permite integrar de manera concreta los contenidos centrales de la carrera: análisis de usuarios, diseño de requisitos, modelado de dominio, arquitectura de software, desarrollo frontend, persistencia local, pruebas, automatización, control de versiones y documentación técnica. El proyecto no se limita a construir una interfaz funcional, sino que documenta las decisiones y evidencia la evolución del producto a través de hitos, ADRs, backlog, changelog y commits.

La justificación social y de producto se relaciona con el contexto de uso. La evidencia disponible sugiere valor en una alternativa que abra rápido, funcione sin conexión, no exija una cuenta y respete la organización académica por materias. Por eso, el alcance funcional prioriza captura y recuperación de notas, guardado local y simplicidad, sin asumir que deba reemplazar a todas las herramientas generalistas.

El alcance verificado en la beta controlada `v0.4.8` incluye una app Android empaquetada con Capacitor, persistencia SQLite, editor Markdown con comandos opcionales y borradores persistentes, previsualización segura, búsqueda, materias y secciones, archivo, papelera, fechas académicas discretas, tema claro/oscuro, sección Acerca de y automatización de calidad. También incorpora un flujo manual de respaldo `.zip` mediante el selector o la hoja de compartir del sistema y una importación no destructiva de respaldos generados por Lumapse, con validación previa y escritura transaccional.

Compartir una nota individual continúa fuera del alcance actual: solo se retomará si utiliza la hoja de compartir nativa de Android y aporta una utilidad distinta de la acción Copiar. También quedan fuera del MVP la sincronización automática en la nube, la colaboración en tiempo real, el backend multiusuario, la inteligencia artificial generativa y la publicación formal en tiendas de aplicaciones. Estas posibilidades se mantienen como trabajo futuro y solo deberían incorporarse si nueva evidencia de uso justifica ampliar el alcance.

---

# Capítulo 2: Marco Metodológico y Modelo de Negocio

## 2.1. Metodología de Desarrollo (Agile/Kanban)

El desarrollo de Lumapse se organizó de manera incremental por hitos mensuales, combinando prácticas ágiles, tablero Kanban, control de versiones y documentación viva. Cada hito agrupa un objetivo funcional o técnico claro: investigación inicial, fundación del proyecto, editor principal, MVP con Markdown y offline, organización/UX móvil, calidad/distribución y cierre final.

El Hito 05 quedó cerrado con la beta controlada `v0.4.8` firmada, validada inicialmente y publicada. El Hito 06 se encuentra activo para completar el cierre académico, revisar evidencias y preparar los materiales de defensa sin reabrir por defecto el alcance funcional de la beta.

El enfoque Kanban se eligió por su adecuación a un proyecto individual con alcance académico y evolución progresiva. En lugar de trabajar con iteraciones cerradas de equipo, el proyecto mantiene un flujo continuo de tareas visibles en `TODO`, [BACKLOG.md](../../BACKLOG.md), [CHANGELOG.md](../../CHANGELOG.md) e informes de hito. Esta forma de trabajo permite priorizar tareas según valor, riesgo y dependencia técnica, sin perder trazabilidad histórica.

Las prácticas de gestión aplicadas son:

- Descomposición del trabajo por hitos y tareas pequeñas.
- Priorización de tareas según impacto en el MVP, riesgo técnico y valor académico.
- Registro de decisiones significativas mediante ADRs.
- Commits atómicos con convención semántica.
- Actualización del changelog y backlog para reflejar el estado real del proyecto.
- Validaciones automatizadas antes de cerrar cambios relevantes.

La estimación se complementó con Story Points para historias de usuario y estimación PERT para riesgos técnicos mayores, como la migración hacia Capacitor y SQLite, siguiendo el material de consulta de la cátedra (Gómez, 2014; Parada, 2026). Esta combinación permitió diferenciar tareas rutinarias de decisiones con mayor incertidumbre.

## 2.2. Análisis de Personas de Usuario

Las personas de usuario se construyeron inicialmente a partir de observación directa, experiencia institucional y conversaciones informales dentro del contexto académico. Luego fueron contrastadas con los resultados del relevamiento cuantitativo, lo que permitió confirmar o matizar los supuestos iniciales.

Las tres personas principales documentadas en [personas.md](../producto/personas.md) son:

| Persona | Rol dentro del proyecto | Necesidad principal |
|---|---|---|
| Lucía, estudiante organizada | Usuario primario no técnico | Capturar notas rápido, acceder offline y organizar por materia. |
| Martín, estudiante práctico | Usuario técnico / early adopter | Usar Markdown, controlar sus datos y evitar vendor lock-in. |
| Prof. Ramos, docente evaluador | Stakeholder académico | Ver evidencia de proceso, documentación y decisiones justificadas. |

El relevamiento respaldó varios atributos centrales de estas personas dentro del contexto estudiado: preferencia declarada por el celular, disponibilidad de red no permanente, organización por materia y valoración de una propuesta simple. En consecuencia, las personas funcionan como puente entre la observación inicial y las decisiones de diseño implementadas, sin reemplazar una validación directa de los arquetipos con el prototipo.

## 2.3. Análisis Competitivo

El análisis competitivo comparó a Lumapse con herramientas de notas existentes como Google Keep, Notion, Obsidian, OneNote, Simplenote, Evernote, Standard Notes y Joplin. Los criterios de comparación surgieron de las necesidades detectadas en las personas: funcionamiento offline real, ausencia de cuenta obligatoria, tamaño liviano, soporte Markdown, gratuidad, uso multiplataforma y velocidad de arranque.

El análisis competitivo original propuso una lectura cualitativa: algunas herramientas simples dependen de cuentas o ecosistemas propietarios, mientras otras ofrecen más potencia con mayor complejidad, peso o costo. No demuestra que el mercado esté vacío ni sustituye una revisión actual de cada producto. Lumapse busca diferenciarse mediante baja complejidad, almacenamiento local, ausencia de cuenta, núcleo offline-first, Markdown y foco académico.

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
| Los estudiantes necesitan una app que funcione sin internet en el aula. | P6: frecuencia declarada de acceso estable; P8: prioridades. | 81.7% responde "A veces", "Raramente" o "Nunca"; 74.2% selecciona offline. | Hipótesis respaldada en la muestra: se mantiene y debe probarse offline-first. |
| Los estudiantes prefieren usar el celular para una app de notas. | P9: dispositivo preferido para una app de notas. | 72.5% elige celular. | Hipótesis respaldada en la muestra: se prioriza el diseño mobile-first. |
| Los estudiantes organizarían sus notas con etiquetas. | P11: modelo de organización preferido. | 69.2% prefiere carpetas por materia. | Hipótesis contradicha en la muestra: pivote a materias y secciones. |
| Offline aparece entre las características más seleccionadas. | P8: frecuencia de selección de funcionalidades. | 74.2% selecciona offline. | Hipótesis respaldada de forma descriptiva: persistencia local robusta. |

P8 declaraba un máximo de tres opciones, pero el CSV contiene 371 marcas y 37 respuestas con cuatro a seis. Por ello sus porcentajes se usan como frecuencias descriptivas, no como un ranking de elección forzada uniforme ni como evidencia inferencial.

La encuesta respaldó las restricciones **mobile-first** y **offline-first**, pero no comparó PWA frente a APK, no preguntó por instalación desde fuentes externas y tampoco evaluó motores de persistencia. La elección de Capacitor/APK y SQLite se realizó posteriormente mediante el análisis técnico documentado en [ADR-005](../adr/ADR-005-pivote-app-nativa.md) y [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

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
| [ADR-005](../adr/ADR-005-pivote-app-nativa.md) | Pivote de PWA a aplicación Android híbrida con Capacitor. | Aceptado |
| [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md) | Arquitectura SQLite para web de desarrollo y entorno nativo. | Aceptado |
| [ADR-007](../adr/ADR-007-organizacion-componentes-por-feature.md) | Organización de componentes UI por feature folders. | Aceptado |
| [ADR-008](../adr/ADR-008-arquitectura-modular-y-patrones.md) | Arquitectura modular por capas pragmáticas y patrones aplicados. | Aceptado |

La evolución más importante fue el pivote desde una PWA con IndexedDB hacia una app Android empaquetada con Capacitor y persistencia SQLite. Este cambio no elimina el valor de las decisiones iniciales: las conserva como antecedentes y muestra cómo el proyecto respondió a evidencia empírica nueva.

## 4.2. Stack Tecnológico

El stack se eligió buscando equilibrio entre simplicidad, rendimiento, defendibilidad académica y capacidad de evolucionar hacia un entorno móvil nativo.

| Capa | Tecnología | Justificación |
|---|---|---|
| Build | Vite 6 | Servidor de desarrollo rápido, build optimizado y configuración mínima. |
| Lenguaje | JavaScript ES2022+ y TypeScript gradual | Mantiene módulos nativos y permite tipar primero contratos y lógica pura sin reescribir la UI en bloque. |
| UI | Componentes propios con DOM + CSS nativo | Máximo control sobre rendimiento y estructura. |
| Persistencia | SQLite mediante `@capacitor-community/sqlite` | Persistencia local robusta en Android. |
| Simulación web | `sql.js` + `jeep-sqlite` | Mantiene el flujo de desarrollo web sin cambiar la capa de servicios. |
| Markdown | `marked` + `DOMPurify` | Renderizado Markdown con sanitización contra XSS. |
| Empaquetado | Capacitor + Android | Reutiliza la web app y genera una experiencia instalable como APK. |
| Testing | Vitest + smoke tests básicos de Gradle/JUnit | Pruebas unitarias de lógica JavaScript/TypeScript y verificación mínima del paquete nativo. |
| Calidad | GitHub Actions + scripts locales | Automatización de lint, tests, build, trazabilidad y auditorías. |

La decisión de no usar un framework frontend como React o Vue fue deliberada. Para el alcance del proyecto, Vanilla JS reduce dependencias de runtime, permite un bundle liviano y deja visible la arquitectura del código ante la evaluación académica.

## 4.3. Modelo de Dominio

El modelo de dominio actual se centra en cuatro conceptos principales: Nota, Materia/Sección, Evento Académico y Estado de Aplicación. La entidad `Note` representa el contenido escrito por el estudiante; `Subject` modela materias y secciones mediante una auto-referencia; `AcademicEvent` representa fechas discretas vinculadas opcionalmente con una materia; y el estado de aplicación mantiene los datos cargados, la selección actual, los filtros y la vista activa. Además, el subsistema de portabilidad define contratos para el manifiesto, los datos y el plan de importación de un respaldo, mientras que los borradores del editor se conservan de forma local y separada de la nota definitiva.

La decisión de modelar materias y secciones con una sola entidad responde a la estructura de información definida en [DP-004](../producto/decisiones-producto.md): una Materia es un `Subject` raíz y una Sección es un `Subject` con `parentSubjectId`. Esta solución evita duplicar tablas y permite expresar la jerarquía con una relación relacional simple.

El modelo completo se documenta en [modelo-dominio.md](../diagramas/modelo-dominio.md). Desde el punto de vista del informe, su aporte principal es mostrar cómo las decisiones de producto se traducen en entidades persistentes, contratos de dominio, servicios de aplicación y estado de UI.

## 4.4. Diagramas de Casos de Uso

Los casos de uso describen el sistema desde la perspectiva del estudiante. El actor principal puede crear, editar, buscar, eliminar, fijar, archivar y previsualizar notas. Además, interactúa con funciones de organización, fechas académicas, tema visual, papelera y portabilidad del espacio de trabajo. El respaldo manual `.zip` y su importación no destructiva ya forman parte de la UI de la beta; compartir una nota individual permanece como trabajo futuro porque debe aportar un flujo nativo distinto de la acción Copiar.

El diagrama documentado en [casos-de-uso.md](../diagramas/casos-de-uso.md) agrupa las funcionalidades en seis áreas:

- Gestión de notas.
- Organización.
- Fechas académicas.
- Markdown.
- Datos y portabilidad.
- Sistema y personalización.

La relación `include` se usa para expresar que crear o editar una nota incluye siempre la protección del borrador persistente del editor. La relación `extend` se utiliza para acciones opcionales, como gestionar la papelera después de una eliminación. En portabilidad local, el respaldo `.zip` y la importación del formato propio ya están integrados; la exportación de notas individuales y la importación genérica de archivos Markdown quedan como deuda posterior separada.

## 4.5. Diagramas de Secuencia

Los diagramas de secuencia permiten representar el flujo temporal entre UI, estado y persistencia. El flujo más importante del producto es crear una nota protegida por borrador persistente mientras el estudiante escribe.

El diagrama documentado en [secuencia-crear-nota.md](../diagramas/secuencia-crear-nota.md) modela el comportamiento vigente: el usuario abre el editor, la UI conserva el borrador localmente mientras escribe, el store persiste la nota definitiva solo cuando el usuario confirma con `Guardar` o `Actualizar`, y el borrador se limpia después del éxito.

Como criterio de documentación viva, los diagramas deben actualizarse cuando el flujo técnico cambie de manera sustancial. En el estado actual, el diagrama ya refleja la separación entre borrador local y persistencia definitiva en SQLite.

## 4.6. Diseño de Interfaz (UI/UX y Mobile-First)

La interfaz se diseñó con enfoque mobile-first, prioridad respaldada por el relevamiento: el 72.5% de la muestra usaría la app desde el celular y el 95% incluye celular como dispositivo aceptable. Esto implica priorizar navegación compacta, acciones de bajo número de toques, tipografía legible y componentes que funcionen en pantallas pequeñas.

La estructura principal se compone de:

- Un shell de aplicación con drawer lateral.
- Un feed de notas filtrable por vista, búsqueda y materia.
- Un editor Markdown con modos de edición y lectura.
- Acciones contextuales para fijar, archivar, mover, eliminar y restaurar.
- Papelera con eliminación lógica y restauración.
- Fechas académicas discretas con calendario y próximos eventos.
- Respaldo/importación manual y una vista Acerca de.
- Tema claro/oscuro persistente.

La UX se apoya en decisiones de producto específicas: Entrada como destino por defecto, Materias como organización principal, Archivo para contenido inactivo y Papelera para evitar pérdidas accidentales. Estas decisiones reducen la carga cognitiva del estudiante y privilegian capturar rápido antes que configurar estructuras complejas.

## 4.7. Diseño de Base de Datos

### 4.7.1. Motor de persistencia

Lumapse utiliza **SQLite** como motor de base de datos, accedido a través del plugin `@capacitor-community/sqlite` en el entorno nativo Android y simulado con `sql.js` (WebAssembly) + `jeep-sqlite` durante el desarrollo web local. Las claves foráneas y sus acciones se interpretan de acuerdo con la documentación oficial de SQLite (SQLite Project, s. f.). La decisión del proyecto se documenta en [ADR-005](../adr/ADR-005-pivote-app-nativa.md) y [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

### 4.7.2. Metodología de diseño

El diseño de la base de datos sigue una metodología académica de tres niveles de abstracción, complementada por una verificación de normalización:

1. **Modelo Conceptual** — Diagrama Entidad-Relación con notación Chen (Graphviz DOT, renderizado en [edotor.net](https://edotor.net)).
2. **Normalización** — Verificación de Primera, Segunda y Tercera Forma Normal sobre cada entidad.
3. **Modelo Lógico** — Esquema de tablas relacionales con PKs, FKs, tipos y restricciones (dbdiagram.io, sintaxis DBML).
4. **Modelo Físico** — Sentencias DDL SQL implementadas en `src/services/sqlite/connection.js`.

Los diagramas y la documentación de cada nivel se encuentran en [`docs/diagramas/database/`](../diagramas/database/).

Los archivos fuente del modelo conceptual (`.dot`), lógico (`.dbml`) y físico (DDL) permanecen versionados en el repositorio. Las imágenes conceptual y lógica fueron regeneradas externamente, reemplazadas y revisadas el 2026-07-15 contra esas fuentes y el esquema ejecutable. El control pendiente se limita a su legibilidad dentro de la maquetación definitiva del informe y la presentación.

#### 4.7.2.1. Modelo conceptual

![Modelo conceptual de Lumapse en notación Chen](../diagramas/database/01-modelo-conceptual-der-chen.png)

*Figura 4-1. Modelo conceptual de Lumapse. Fuente: elaboración propia a partir del modelo DOT vigente, exportado con Graphviz/edotor.net el 2026-07-15.*

El nivel conceptual representa las tres entidades académicas: Materia/Sección, Nota y Evento Académico. `metadata` se excluye deliberadamente porque es una estructura técnica para migraciones y flags internos, no un concepto del dominio estudiantil.

#### 4.7.2.2. Modelo lógico relacional

![Modelo lógico relacional de Lumapse](../diagramas/database/03-modelo-logico-relacional.png)

*Figura 4-2. Modelo lógico relacional de Lumapse. Fuente: elaboración propia a partir del DBML vigente, exportado con dbdiagram.io el 2026-07-15.*

El nivel lógico incorpora las cuatro tablas implementadas, sus 26 columnas y las tres claves foráneas: la autorreferencia de `subjects`, la relación opcional de `notes` con `subjects` y la relación opcional de `academic_events` con `subjects`. La correspondencia física se detalla en el DDL documentado y en `src/services/sqlite/connection.js`.

### 4.7.3. Entidades del dominio

El modelo contempla tres entidades persistentes de dominio y una tabla técnica:

- **MATERIA** (`subjects`): Modela tanto las Materias (carpetas raíz) como las Secciones (subcarpetas) mediante auto-referencia. Si `parentSubjectId` es `NULL`, es una Materia; si tiene un valor, es una Sección hija de esa Materia. Profundidad máxima: 2 niveles ([DP-004](../producto/decisiones-producto.md)).
- **NOTA** (`notes`): Representa el contenido Markdown creado por el estudiante. Una nota puede vivir en la **Entrada** (`subjectId = NULL`), en una **Materia** o en una **Sección**.
- **EVENTO ACADÉMICO** (`academic_events`): Representa una fecha académica discreta y puede asociarse opcionalmente con una Materia o Sección. Si la organización vinculada deja de existir, el evento puede conservarse sin esa referencia.
- **METADATA** (`metadata`): Tabla técnica de clave-valor para control de migraciones y flags internos del sistema.

### 4.7.4. Estructura de información opinionada (DP-004)

La estructura de navegación de Lumapse es **opinionada**: no le da al usuario un lienzo en blanco como Notion u Obsidian, sino una jerarquía predefinida que refleja el flujo de trabajo natural de un estudiante universitario:

- **Entrada:** Destino por defecto de toda nota nueva. Captura rápida sin fricción.
- **Materias:** Carpetas creadas por el usuario, con opción de secciones dentro de cada una.
- **Archivo:** Materias aprobadas y notas archivadas.

Esta decisión fue respaldada dentro de la muestra: el 69.2% de las 120 respuestas válidas prefiere organizar por carpetas por materia (P11 del relevamiento).

### 4.7.5. Normalización y decisión de persistencia del título

El modelo se verificó contra las tres primeras formas normales (ver [02-normalizacion.md](../diagramas/database/02-normalizacion.md)):

- **1FN:** ✅ Todos los atributos son atómicos, sin grupos repetidos.
- **2FN:** ✅ Todas las PKs son simples (UUID), eliminando la posibilidad de dependencias parciales.
- **3FN:** ✅ Las tablas separan entidades y evitan dependencias parciales o transitivas dentro del diseño vigente.

**Aclaración sobre el campo `title`:**

En una etapa anterior se describió el título como un valor siempre derivado del contenido Markdown. La implementación vigente de la beta es más precisa: el editor admite un título explícito y la política de guardado solo toma un encabezado `# ` del contenido como alternativa cuando el campo está vacío. Si tampoco existe ese encabezado, utiliza el valor `Sin título`. Por lo tanto, en el modelo actual `title` es un atributo propio de `Note` y no una dependencia transitiva obligatoria de `content`.

Persistir el título sigue aportando ventajas operativas:

1. **Contrato de presentación:** El listado y el backup disponen de un título resuelto sin reinterpretar el Markdown cada vez. La prueba de carga de `scripts/run-load-tests.py` compara sintéticamente lectura de columna con extracción mediante expresión regular; sus resultados varían por entorno y no equivalen a una medición de CPU Android ni a un RNF validado.
2. **Evolución posible de consultas:** Almacenar el título permitiría proyectar `id`, `title` y fechas sin cargar el cuerpo completo. La implementación actual todavía carga filas completas para sostener búsqueda por contenido, por lo que esa optimización no se afirma como aplicada.
3. **Política centralizada:** `NoteTitleService` concentra la normalización, la alternativa basada en encabezado y la presentación del título, evitando que cada componente reconstruya reglas diferentes.

Las imágenes vigentes respetan esta decisión: `title` se representa como atributo propio y opcional, no como un valor derivado obligatorio, porque la UI permite editarlo explícitamente.

## 4.8. Patrones de Arquitectura y Diseño de Software

Lumapse se clasifica como un **monolito modular cliente, offline-first, con capas pragmáticas y UI organizada por feature**. Combina una unidad de despliegue Android con módulos separados por responsabilidades y patrones aplicados en puntos concretos. La descripción se formula en función del código vigente y no presupone una implementación canónica de todos los patrones. La decisión se formaliza en [ADR-008](../adr/ADR-008-arquitectura-modular-y-patrones.md) y su vista de componentes se documenta en [arquitectura-componentes.md](../diagramas/arquitectura-componentes.md).

La frontera de versión se declara de forma explícita: el comportamiento y el dominio corresponden a la beta publicada `v0.4.8`, mientras los nombres de archivo usados como evidencia fueron auditados sobre `main` el 2026-07-15. El trabajo posterior al tag incluye refactors JS→TS que no están en la APK; por ello una referencia actual a `.ts` demuestra la estructura de la fuente vigente, no la composición literal del artefacto publicado. El checkpoint anterior a esta revisión registró 12 commits, pero el número no se presenta como propiedad permanente de una rama viva.

### 4.8.1. Organización modular y flujo de dependencias

| Área | Responsabilidad principal | Dependencias predominantes | Límite observado |
|---|---|---|---|
| Presentación (`src/components/`, `src/layout/`) | Renderizar DOM, capturar eventos y mostrar feedback. Los componentes se agrupan por feature. | Store y servicios de aplicación. | No emite sentencias SQL; algunos flujos especializados, como backup, consumen servicios directamente. |
| Estado y coordinación (`src/store/`) | Mantener el estado compartido, aplicar filtros y coordinar operaciones centrales de notas y materias. | Servicios de dominio y acceso a datos. | No es una capa de persistencia y no debería decidir cómo se presenta un error al usuario. |
| Servicios y dominio (`src/services/`, `src/domain/`) | Aplicar reglas, validar contratos y orquestar casos de uso. | Funciones puras, fuentes de datos y adaptadores. | No todos los servicios son puros: los adaptadores nativos encapsulan efectos externos de manera explícita. |
| Datos e integración (`src/services/sqlite/` y adaptadores Capacitor) | Ejecutar operaciones SQLite y traducir capacidades del dispositivo. | SQLite, Filesystem, Share y Network de Capacitor. | Su API se consume a través de servicios o del store; la UI no contiene SQL. |

El flujo predominante es **UI → store/servicios → acceso SQLite o adaptadores Capacitor**. Se trata de una separación pragmática, no de capas estrictamente aisladas: la coordinación central pasa por `NoteStore` para el dominio principal, mientras que features autocontenidas pueden invocar un servicio de aplicación sin atravesar el store.

La cualidad **offline-first** atraviesa estas áreas: SQLite es la fuente persistente primaria y la red no es necesaria para crear, editar, buscar u organizar notas. No se la clasifica como patrón GoF, sino como una decisión arquitectónica y de producto.

### 4.8.2. Patrones identificados en el código

| Patrón o enfoque | Clasificación | Evidencia representativa | Función y alcance real |
|---|---|---|---|
| Composition Root | Aplicado | `src/main.js` | Inicializa persistencia, construye vistas y conecta dependencias principales; centraliza el arranque, no todas las decisiones posteriores. |
| Observer / publicador-suscriptor | Aplicado | `NoteStore.state.js` y `NoteStore.errors.js` | Notifica estado y errores mediante suscripción/desuscripción manual dentro del proceso; no es un bus distribuido. |
| Service Layer | Aplicado | `SubjectService.crud.ts`, `BackupService.ts`, `MarkdownService.ts` | Centraliza validaciones, reglas y orquestación fuera de componentes y SQL; combina servicios puros con coordinadores de efectos. |
| Adapter | Aplicado | `BackupNativeNetworkService.js`, `BackupShareService.js` | Traduce APIs de Capacitor a contratos propios, con alternativas web donde corresponde; no toda dependencia externa tiene adaptador formal. |
| Inyección de dependencias explícita | Aplicada en servicios seleccionados | `BackupFlowService.ts` | Sustituye funciones de red, creación, almacenamiento y compartición en pruebas, sin contenedor global. |
| Fachada modular / *barrel* | Analogía parcial | `NoteStore.js`, `SubjectService.js`, `ExportService.ts` | Ofrece entradas estables sobre módulos especializados; un *barrel* no oculta por sí solo toda la complejidad de una fachada GoF. |
| Data Access similar a Repository | Analogía parcial | módulos de `src/services/sqlite/` | Encapsula consultas y mapeo de filas, sin interfaz Repository genérica ni intercambio transparente entre motores. |
| Command Registry | Inspirado en Command | `editorCommandRegistry.ts`, handlers y transformaciones del editor | Comparte catálogo, metadatos y snippets; no implementa objetos uniformes con `execute/undo`. |
| Strategy/Policy funcional | Enfoque funcional | `noteFilters.ts`, `BackupNetworkService.ts`, plan de importación | Selecciona reglas mediante funciones y discriminantes, no con jerarquías de objetos Strategy. |
| Component | Enfoque de UI | clases y módulos de `src/components/` | Encapsula renderizado y eventos por feature sin ciclo de vida uniforme de framework. |

Los refactors no crearon estos patrones: hicieron más explícitos contratos, dependencias y límites que ya eran observables, facilitando su identificación y verificación. ADR-008 mantiene el inventario canónico y separa las implementaciones directas de las analogías parciales.

### 4.8.3. Relación con MVC y límites de la clasificación

Lumapse **no implementa un MVC de libro**. No existen clases formales `Model`, `View` y `Controller`, ni controladores que concentren todo el flujo de entrada. La UI cumple el rol de presentación; `NoteStore` mantiene estado y coordina parte de los casos de uso; los servicios contienen reglas; y los módulos SQLite realizan acceso a datos. Esta distribución puede recordar responsabilidades de MVC, pero describirla como MVC completo ocultaría sus dependencias reales.

Tampoco corresponde presentar cada módulo ES como un Singleton. Los módulos garantizan una instancia de evaluación por grafo de imports, pero muchos servicios exportan funciones puras y no mantienen identidad ni estado global. La arquitectura se defiende mejor por la separación observable de responsabilidades, las fronteras de efectos y las pruebas de cada módulo que por asignar etiquetas de patrones donde el código no las implementa de forma completa.

---

# Capítulo 5: Desarrollo e Implementación

## 5.1. Estructura del Repositorio y Entorno

El repositorio está organizado para que código, documentación, scripts, análisis de datos y configuración nativa convivan en una misma base versionada. Esta decisión permite que el proyecto sea auditable desde Git: cada cambio de código puede relacionarse con documentación, requisitos, decisiones y evidencia.

Las carpetas principales son:

| Carpeta | Propósito |
|---|---|
| `src/` | Código fuente de la aplicación web empaquetada. |
| `src/components/` | Componentes de interfaz organizados por feature: editor, feed, fechas académicas, backup, Markdown y piezas comunes. |
| `src/services/` | Servicios de dominio y aplicación: Markdown, temas, materias, eventos académicos, persistencia SQLite, respaldo e importación local. Parte de la lógica pura adopta TypeScript de forma gradual. |
| `src/store/` | Estado de aplicación, filtros y coordinación entre datos y UI. |
| `android/` | Proyecto Android generado y mantenido por Capacitor. |
| `docs/` | Documentación técnica, producto, gestión, hitos e informe final. |
| `scripts/` | Automatización local: quality gate, auditorías, deploy Android y ensamblado del informe. |
| `tests/` | Suite de tests unitarios con Vitest. |
| `.github/` | Workflows de GitHub Actions, plantillas de issues y pull requests. |

El entorno de desarrollo usa Node.js, npm y Vite para levantar la aplicación en navegador. Para la compilación Android se requiere Android Studio, JDK y SDK Android. La guía operativa se documenta en [flujo-desarrollo-android.md](../flujo-desarrollo-android.md).

## 5.2. Capa de Presentación (Componentes UI)

La interfaz está implementada con componentes propios en JavaScript, algunos auxiliares tipados en TypeScript y CSS, sin framework de UI. Esta decisión exige más trabajo manual que una solución basada en React o Vue, pero mantiene el bundle liviano y hace explícito el flujo de eventos, renderizado y estado.

Los componentes principales son:

| Componente | Responsabilidad |
|---|---|
| `note-editor/NoteEditor` y auxiliares | Edición de título y contenido Markdown, borradores persistentes, comandos opcionales y modos de trabajo. |
| `feed/NoteList` y `feed/NoteCardRenderer` | Listado y representación visual de notas. |
| `feed/TrashView` | Papelera, restauración y eliminación definitiva. |
| `academic-events/Heatmap` y `academic-events/UpcomingAcademicEvents` | Calendario, fechas académicas discretas y recordatorios próximos. |
| `backup/BackupView` y controladores auxiliares | Exportación manual e importación no destructiva de respaldos `.zip`. |
| `about/AboutView` | Información mínima de versión, autoría, licencia y alcance local/offline. |
| `common/ConfirmDialog` | Confirmaciones personalizadas para reemplazar diálogos nativos. |
| `common/Toast` | Mensajes breves de estado y feedback. |
| `drawerSubjects` | Navegación por materias y secciones. |
| `drawerController` | Coordinación del drawer lateral. |

La capa de presentación no emite sentencias SQL. Interactúa principalmente con el store para el dominio central y, en features autocontenidas como backup, con servicios de aplicación explícitos. Esta separación mantiene fuera de los componentes los detalles de SQLite y de los plugins nativos, aunque no constituye un sistema de capas rígidas. La organización por carpetas de feature se documenta en [ADR-007](../adr/ADR-007-organizacion-componentes-por-feature.md) y evita que `src/components/` se convierta en una carpeta plana difícil de mantener.

## 5.3. Gestión de Estado Reactivo

La gestión de estado se implementa con un store propio basado en el patrón Observer. El estado central mantiene notas, materias, vista activa, búsqueda, nota seleccionada, materia seleccionada y banderas de UI. Cuando una operación modifica datos o filtros, el store notifica a los componentes suscriptores para que actualicen la pantalla.

El store se dividió en módulos para reducir acoplamiento:

| Archivo | Responsabilidad |
|---|---|
| `NoteStore.state.js` | Estado base y suscripciones. |
| `NoteStore.errors.js` | Canal de errores de dominio desacoplado del mecanismo visual de feedback. |
| `NoteStore.data.js` | Carga, creación, actualización y eliminación de datos. |
| `NoteStore.ui.js` | Acciones de UI y coordinación de vistas. |
| `noteFilters.ts` | Reglas de filtrado y visibilidad de notas. |

Esta división permite testear reglas de negocio sin renderizar toda la interfaz. También facilita mantener invariantes importantes, como ocultar notas eliminadas del feed, mostrar notas fijadas al tope y respetar el filtro por materia o sección. El canal separado de errores permite que el store comunique el problema y que la capa de presentación decida si corresponde mostrar un toast, un diálogo u otra respuesta.

## 5.4. Capa de Persistencia (Evolución de IndexedDB a SQLite)

La persistencia tuvo dos etapas. En la fase inicial del MVP se implementó almacenamiento local con IndexedDB, suficiente para validar el editor y el funcionamiento offline en navegador. Luego, tras el relevamiento de datos y el pivote a aplicación Android híbrida, se decidió migrar a SQLite. La protección actual del trabajo en curso se resuelve con borradores persistentes locales del editor, separados del guardado definitivo de notas.

La motivación del cambio fue doble:

- El relevamiento respaldó una experiencia mobile-first y offline-first; no comparó PWA, APK ni canales de instalación.
- El análisis técnico seleccionó Capacitor y SQLite para reutilizar la base web, disponer de persistencia local fuera de la política de almacenamiento del navegador e integrar capacidades nativas en Android. La aceptación de instalar un APK por parte del público objetivo se valida por separado.

La arquitectura actual utiliza `@capacitor-community/sqlite` en Android. Para desarrollo web local se incorporó `sql.js` y `jeep-sqlite`, permitiendo simular SQLite en navegador sin modificar los componentes ni el store. La configuración se automatiza con el script `copy-wasm`, ejecutado antes de `npm run dev`, `npm run build` y después de instalar dependencias.

La capa SQLite se encuentra en `src/services/sqlite/` y separa conexión, manejo de errores y operaciones de notas, materias y eventos académicos. Estos módulos cumplen una función de acceso a datos orientada a SQLite: ejecutan consultas y traducen filas, sin pretender una interfaz Repository genérica. Por encima, servicios como `SubjectService` aplican validaciones y coordinan transacciones; en los límites nativos, servicios específicos adaptan Filesystem, Share y Network de Capacitor. Esta separación permite auditar el schema, generar DBML desde código y validar la jerarquía de materias con scripts automatizados.

## 5.5. Procesamiento de Markdown y Seguridad (XSS)

Markdown es el formato base de las notas. Esta decisión aporta portabilidad, simplicidad y compatibilidad con herramientas externas. Sin embargo, renderizar Markdown como HTML introduce un riesgo de seguridad: el contenido escrito por el usuario podría convertirse en HTML ejecutable si no se sanitiza correctamente.

Para resolverlo, Lumapse usa:

- `marked` para convertir Markdown a HTML.
- `DOMPurify` para sanitizar el HTML resultante antes de insertarlo en el DOM.

La responsabilidad está encapsulada en `MarkdownService`, con tests unitarios que verifican comportamiento esperado y prevención de inyección básica. De esta forma, la UI consume HTML ya procesado y no replica lógica de sanitización en múltiples componentes.

## 5.6. Empaquetado Android Híbrido (Capacitor)

Capacitor permite empaquetar la aplicación web como una aplicación Android híbrida, reutilizando el código existente en `src/` y generando un proyecto Android en `android/`. La UI continúa ejecutándose en una WebView y accede a capacidades de plataforma mediante el puente y los plugins de Capacitor (Ionic, s. f.). Esta estrategia evita reescribir la interfaz en Kotlin o React Native y conserva la inversión realizada en la arquitectura web.

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

La decisión de usar Capacitor se fundamenta en [ADR-005](../adr/ADR-005-pivote-app-nativa.md): el relevamiento respaldó las prioridades mobile-first y offline-first, mientras el ADR comparó las alternativas técnicas. La encuesta no midió tolerancia al *sideload* ni familiaridad con la instalación de APK.

## 5.7. Licenciamiento de Software y Filosofía Open Source

Lumapse se publica bajo licencia GNU GPLv3. Esta elección responde a una decisión ética y académica: el proyecto nace en un entorno educativo público y se desarrolla como evidencia de aprendizaje profesionalizante. Por lo tanto, el código no solo cumple una función de producto, sino también de material de estudio, referencia y posible punto de partida para futuras cohortes.

La GPLv3 permite usar, estudiar y modificar el programa. Cuando una persona distribuye copias o una obra derivada cubierta por la licencia, debe ofrecer el código fuente correspondiente bajo GPLv3 y conservar los avisos aplicables; las modificaciones de uso estrictamente privado no activan por sí solas esa obligación de distribución. En el contexto del proyecto, esta elección favorece que las versiones redistribuidas continúen siendo auditables y que las mejoras compartidas regresen a la comunidad bajo las mismas libertades.

La licencia también refuerza la transparencia del proyecto: cualquier evaluador puede revisar cómo se implementó la aplicación, cómo se tomaron decisiones y cómo evolucionó la solución.

## 5.8. Integración Continua (CI) — Automatización de Calidad de Código

### 5.8.1. ¿Qué es la Integración Continua?

La **Integración Continua** (CI, del inglés *Continuous Integration*) es una práctica de ingeniería de software mediante la cual cada modificación del código fuente se verifica automáticamente mediante una serie de comprobaciones definidas por el equipo de desarrollo. El objetivo es detectar problemas lo antes posible en el ciclo de vida del software, reduciendo el costo de corrección y aumentando la confianza en el código que se entrega.

En entornos profesionales, un pipeline de CI suele incluir análisis estático de código, ejecución de tests unitarios, compilación del proyecto y, eventualmente, despliegue automático. Para Lumapse, el workflow evolucionó desde un chequeo inicial de lint hacia una verificación remota que combina lint, tests, build, presupuesto de bundle y auditorías documentales/técnicas. El comando local `npm run verify` amplía ese conjunto con typecheck, revisión de toolchain y smoke test de base de datos, entre otras guardias.

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

En Lumapse, `npm run lint` se ejecuta sin la opción `--fix`: no modifica el código ni afecta la ejecución de la aplicación, sino que genera un reporte para revisar la calidad del código.

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

**`package.json`:** Expone comandos reutilizables tanto localmente como desde CI. El comando principal de verificación local es:

```bash
npm run verify
```

El workflow remoto no ejecuta literalmente `npm run verify`: invoca de manera explícita el subconjunto portable que figura en el YAML. En el corte actual, `typecheck`, `check:toolchain` y `check:db-smoke` pertenecen al gate local, por lo que CI y verificación local son complementarios, pero todavía no equivalentes.

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

> **Nota importante:** el workflow es una verificación remota de calidad. Localmente, `npm run verify` se ejecuta de manera explícita antes de cortes y publicaciones; el repositorio ofrece scripts para instalar hooks, pero su presencia debe verificarse en cada entorno y no puede darse por supuesta.

### 5.8.5. Resultado actual

Al corte documental actual, `npm run verify` completa lint, typecheck, 773 tests unitarios distribuidos en 53 archivos, build de producción, smoke test de base de datos, presupuesto de bundle, trazabilidad, links internos, schema SQLite, jerarquía de materias, accesibilidad estática y ausencia de diálogos nativos fuera del seeder. El workflow remoto verifica además el DBML mediante un paso explícito. Esta evidencia automatizada es amplia, pero no reemplaza las pruebas manuales en Android ni implica que ambos recorridos cubran exactamente los mismos pasos.

### 5.8.6. Justificación de la práctica

Incorporar CI desde las etapas tempranas del proyecto responde a uno de los principios fundamentales de la ingeniería de software moderna: **"fail fast"** (detectar y corregir problemas cuanto antes). El costo de corregir un error suele aumentar a medida que avanza el ciclo de desarrollo; un linter que detecta una variable mal declarada antes de integrar un cambio reduce el costo frente a encontrarla después de distribuir la aplicación.

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
| Unit tests | Verificar servicios, store, filtros y componentes críticos en JavaScript y TypeScript gradual. | Vitest |
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

Al corte `v0.4.8`, y nuevamente sobre la fuente documental actual, la suite local registra 773 tests unitarios distribuidos en 53 archivos y pasando dentro del flujo `npm run verify`.

El repositorio dispone de `npm run test:coverage`, pero la configuración vigente toma como línea base únicamente archivos `src/**/*.js` y no define umbrales bloqueantes. Por ello, el número de tests aporta evidencia de amplitud y regresión, pero no debe confundirse con una cobertura completa de la migración gradual a TypeScript. Incorporar archivos `.ts`, registrar una línea base estable y recién después decidir umbrales permanece como mejora de calidad.

## 6.3. Pruebas de Integración y Funcionamiento Offline

El funcionamiento offline se valida desde varias perspectivas:

- Los assets principales se empaquetan dentro del APK, por lo que la app instalada no depende de red para abrir.
- Las notas y materias se persisten localmente en SQLite.
- El proyecto incluye auditorías para detectar dependencias externas no deseadas o diálogos nativos no permitidos.
- La persistencia se verifica con pruebas unitarias sobre servicios SQLite y con pruebas manuales en dispositivo.

En Android se reemplazaron los smoke tests de plantilla por pruebas bajo el paquete real `com.lumapse.app`. Estas pruebas no validan todavía toda la UI, pero sí evitan conservar referencias de plantilla y confirman que el paquete nativo básico corresponde al proyecto.

Además, los scripts `check:schema`, `check:dbml` y `check:subjects` cumplen una función de integración documental y técnica: comparan tablas, columnas, tipos y relaciones configuradas, y validan las reglas de jerarquía de materias. No sustituyen una revisión exhaustiva de índices, restricciones `CHECK`, acciones referenciales ni comportamiento real en Android. El smoke test ejecuta el DDL completo, pero sus aserciones explícitas de columnas y relaciones todavía se concentran en `subjects`, `notes` y `metadata`; `academic_events` debe incorporarse a esa cobertura antes de presentar el smoke como exhaustivo.

Las pruebas manuales en dispositivo siguen siendo necesarias para validar escenarios que no se capturan completamente en Node o en CI: instalación del APK, primer uso, modo avión, persistencia tras cerrar la app, restauración desde papelera, archivado, navegación táctil y rendimiento percibido.

La beta `v0.4.8` fue validada inicialmente el 2026-07-01 en un Samsung Galaxy S20 FE (`SM-G780G`) con Android 13. Esa ejecución cubrió instalación limpia, apertura offline, creación/edición/persistencia de notas, materias y secciones, búsqueda, pin/archivo, estados académicos, fechas discretas, papelera, tema, rotación/responsivo y rendimiento percibido (VM-01 a VM-14). El resultado fue apto para beta controlada, con observaciones UX menores.

Exportar e importar ZIP cuenta con una ejecución Android separada del 2026-06-18 sobre un Samsung `SM-G965F`, Android 10 y un build previo de la rama `feature/importar-backup-zip` (`a1be7c9`, `versionName=1.0`). Esa evidencia confirma el flujo en un corte anterior, pero no se atribuye al S20 FE ni al APK firmado `v0.4.8`. Hito 06 exige repetirlo dentro de la checklist del artefacto final elegido.

## 6.4. Validación de Rendimiento y UX

La validación de rendimiento y UX se apoya en métricas objetivas y revisión manual. En el estado actual del proyecto se verifican automáticamente el build de producción y el presupuesto de bundle, ya que el tamaño final impacta directamente en una app orientada a celulares con recursos limitados.

Las validaciones actuales incluyen:

- `npm run build`: confirma que la aplicación compila sin errores bloqueantes.
- `npm run check:size`: controla que el bundle no exceda presupuestos definidos.
- `npm run check:a11y`: ejecuta auditoría estática de accesibilidad.
- `npm run check:native-dialogs`: bloquea `alert`, `confirm` y `prompt` nativos fuera del seeder.
- Revisión manual de flujos mobile-first en dispositivo Android.
- Publicación de `v0.4.8` como beta controlada con APK firmado y SHA-256 documentado.

Quedan pendientes para el cierre documental final y Hito 06 pruebas más cercanas al usuario final: medición de tiempo hasta crear la primera nota, revisión fina de contraste y navegación táctil, comportamiento con mayor volumen real de notas y feedback de estudiantes sobre el prototipo instalado.

El build vigente finaliza con código 0, por lo que satisface el criterio explícito de `RNF-025` (construcción sin errores). Vite informa advertencias no bloqueantes sobre módulos importados de forma estática y dinámica; se registran como deuda de empaquetado y deben revisarse, pero no se reinterpretan como errores ni cambian retroactivamente el criterio del requisito.

## 6.5. Alcance de la Evidencia y Validación Pendiente

La evidencia reunida permite calificar `v0.4.8` como beta controlada instalable y funcional en el dispositivo probado. No permite generalizar todavía el mismo resultado a todo el parque Android ni afirmar una validación integral de accesibilidad, seguridad, rendimiento y experiencia de usuario.

Los límites principales son:

- La auditoría `check:a11y` es estática; no sustituye Lighthouse, lector de pantalla, navegación táctil real ni revisión manual completa de contraste. La evaluación final debe tomar WCAG 2.2 como referencia, sin declarar conformidad hasta comprobar los criterios aplicables con métodos automáticos y humanos (World Wide Web Consortium [W3C], 2024).
- Los smoke tests Gradle verifican el paquete y el contexto nativo básico, no los flujos completos de UI ni una prueba end-to-end del APK.
- La prueba Python con 5.000 notas es sintética, compara dos estrategias aisladas y no mide CPU ni renderizado Android. La revisión en dispositivo se realizó con un volumen acotado; falta una medición reproducible con un conjunto realista y criterios temporales definidos.
- El reporte de cobertura todavía excluye TypeScript y no existe un umbral acordado para convertirlo en gate.
- El workflow remoto y `npm run verify` no ejecutan exactamente los mismos pasos; conviene alinear al menos typecheck y smoke test de base de datos cuando sean portables en CI.
- `quality.sh` puede usar un binario Rust compilado para la plataforma y, si no está disponible, recurrir a scripts de compatibilidad. Un resultado exitoso en macOS no prueba por sí solo ambos caminos; la portabilidad requiere compilar o distribuir el auditor por plataforma y verificar el fallback en un checkout limpio.
- La revisión periódica de dependencias y vulnerabilidades debe conservar evidencia propia; sanitizar Markdown reduce el riesgo XSS, pero no reemplaza el mantenimiento de las bibliotecas involucradas.

Estos puntos no reabren el alcance funcional de la beta: delimitan con precisión qué está validado y qué debe cerrarse como evidencia técnica o prueba de usuario en el siguiente hito.

La validación final no debe limitarse a que el código compile. Para que Lumapse cumpla su objetivo, debe demostrar que una persona puede instalarla, abrirla sin conexión, crear una nota rápidamente, encontrarla después, organizarla por materia y confiar en que no se pierde.

---

# Capítulo 7: Conclusiones

## 7.1. Cumplimiento de Objetivos

El objetivo general se considera **cumplido para el alcance de una beta controlada**: Lumapse materializa una aplicación móvil offline-first que permite capturar, organizar y recuperar notas de estudio sin cuenta ni conexión obligatoria, y el proceso queda respaldado por relevamiento, requisitos, decisiones arquitectónicas, código versionado, pruebas y documentación. Esta conclusión no equivale todavía al cierre académico definitivo ni a declarar una versión estable para todo público.

| Objetivo específico | Evidencia alcanzada | Evaluación |
|---|---|---|
| Relevar necesidades del público objetivo y revisar las hipótesis iniciales. | Encuesta con 120 respuestas válidas, análisis cuantitativo y pivote documentado de PWA a aplicación Android local-first. | Cumplido. |
| Formalizar alcance, usuarios, requisitos y decisiones trazables. | Personas, problem statement, RF/RNF, historias de usuario, decisiones de producto, ADRs, backlog y changelog versionados. | Cumplido, con revisión documental final en curso. |
| Diseñar una solución offline y orientada al uso móvil. | Arquitectura Capacitor + SQLite, UI mobile-first, persistencia local y funcionamiento sin red para los flujos principales. | Cumplido para el dispositivo y los escenarios validados. |
| Implementar el núcleo de captura y organización académica. | Editor Markdown, borradores persistentes, búsqueda, materias/secciones, archivo, papelera, fechas académicas, tema, Acerca de y portabilidad manual mediante backup/importación `.zip`. | Cumplido para `v0.4.8`. |
| Preparar una distribución Android verificable. | APK firmado, hash SHA-256, pre-release publicada y validación inicial en un Samsung Galaxy S20 FE con Android 13. | Cumplido como beta controlada. |
| Incorporar calidad automatizada y validación reproducible. | `npm run verify`, 773 tests unitarios, typecheck, build, auditorías técnicas/documentales y checklist manual Android. | Cumplido parcialmente: quedan límites de cobertura, accesibilidad, rendimiento, seguridad y equivalencia CI/local explicitados en el Capítulo 6. |
| Producir documentación académica defendible. | Documentación viva por capítulos, diagramas fuente y trazabilidad dentro del repositorio. | Cumplido como corpus versionado, con gráficos DB incorporados; el Hito 06 completa revisión editorial, consolidación de evidencias y maquetación. |

En términos del Hito 05, las fases de congelamiento de la versión, generación y firma del APK, validación en Android, publicación y sincronización documental de la beta quedaron completadas. El hito se considera cerrado. En Hito 06 ya se incorporaron los gráficos finales de base de datos; el hito continúa activo para la revisión editorial y de maquetación, la consolidación de evidencias no funcionales y la preparación de la defensa, sin reabrir por defecto el alcance funcional de `v0.4.8`.

## 7.2. Lecciones Aprendidas

A lo largo del desarrollo de Lumapse, se produjeron situaciones no planificadas que
obligaron a tomar decisiones técnicas y metodológicas que, en retrospectiva, resultaron
ser las experiencias de aprendizaje más valiosas del proyecto. A continuación se
documentan las más significativas.

### 7.2.1. Gestión de riesgos técnicos: la estimación PERT como herramienta de decisión

La migración de la aplicación web (PWA) a una aplicación Android híbrida con Capacitor fue una decisión
de alto riesgo técnico. No se trataba de agregar una funcionalidad nueva, sino de cambiar
la base sobre la cual el sistema entero se ejecutaba. Para gestionar este riesgo se
aplicó la técnica de estimación PERT (Program Evaluation and Review Technique), según el material metodológico utilizado por la cátedra (Gómez, 2014; Parada, 2026), asignando
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
debugging dedicada, aislada de los datos personales del teléfono principal, que podía ser formateada y
reinstalada sin afectar ese entorno personal. Esta restricción forzó a documentar exhaustivamente el
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
- **Mantenimiento:** Al vivir junto al código, la documentación puede actualizarse en el
  mismo flujo de trabajo. Esto reduce el riesgo de desincronización entre "lo que dice el
  documento" y "lo que hace el código", aunque no elimina la necesidad de revisiones
  periódicas, como demuestra la corrección de métricas y estados realizada en este corte.

**Lección:** La documentación más completa del mundo es inútil si nadie la mantiene.
Al integrar la documentación en el flujo de Git (commit → push → review), se reduce
la fricción y se conserva la historia de los cambios. El costo de documentar también
disminuye cuando el trabajo se realiza incrementalmente, aunque antes de cada corte sigue
siendo necesaria una revisión transversal de métricas, alcance y evidencias.

## 7.3. Trabajo Futuro y Posibles Mejoras

El trabajo futuro se organiza por prioridad para evitar que una lista abierta de ideas impida cerrar incrementos terminados. El Hito 05 ya está cerrado: algunos puntos corresponden al Hito 06 documental y otros al backlog post-beta; ninguno debe convertirse automáticamente en una nueva funcionalidad.

### 7.3.1. Cierre documental y de calidad

Las tareas inmediatas corresponden al cierre del trabajo ya realizado:

- Tras la reconciliación transversal y la incorporación de las figuras DB completadas el 2026-07-15, consolidar la evidencia final, verificar los metadatos pendientes de los materiales de cátedra, ejecutar la revisión de congelamiento y regenerar el informe ensamblado.
- Confirmar en la maquetación PDF y en las diapositivas que las imágenes conceptual y lógica ya verificadas sean legibles, especialmente el formato panorámico del modelo conceptual; el DDL y la representación del campo `title` ya coinciden con la implementación vigente.
- Alinear los requisitos no funcionales con evidencia reproducible: revisar las advertencias no bloqueantes del build como deuda separada de `RNF-025`, ampliar coverage a TypeScript antes de fijar umbrales, verificar la portabilidad del auditor local y acercar el workflow remoto al alcance de `npm run verify`.
- Mantener evidencia de revisión de dependencias y seguridad, y completar pruebas de accesibilidad, rendimiento con volumen realista y uso con estudiantes. Estas pruebas deben distinguir resultados automáticos, sintéticos y manuales.
- Preparar materiales de defensa y, cuando el contenido quede congelado, convertir Markdown a LaTeX/PDF como capa de presentación, sin crear una segunda fuente de verdad.
- Calcular el factor de ajuste real entre estimación y esfuerzo registrado, y convertir sus desvíos en recomendaciones concretas para futuros proyectos individuales; esta medición permanece pendiente hasta consolidar la evidencia temporal del cierre.

### 7.3.2. Mejoras posteriores a la beta

Las observaciones de la validación Android sugieren revisar primero la interacción **Mover a** si la fricción vuelve a reproducirse y medir el comportamiento con feeds más extensos. También pueden evaluarse, con evidencia de uso:

- Compartir una nota individual mediante la hoja nativa; el backup vigente ya exporta contenido legible organizado por materia o sección.
- Importar archivos Markdown individuales sin confundir ese flujo con la restauración completa de un respaldo.
- Incorporar búsqueda FTS5, estadísticas académicas mínimas, contador de palabras o una ayuda breve, siempre que aporten valor sin volver pesada la experiencia de captura.
- Extender el backup hacia Drive API directa o restauración/merge avanzado; la beta ya ofrece salida a destinos externos mediante share sheet/gestor de archivos y un recordatorio local acotado.
- Continuar la migración gradual a TypeScript archivo por archivo, priorizando contratos y módulos puros; el store y los componentes DOM grandes deben abordarse solo con un plan incremental y pruebas focalizadas.

### 7.3.3. Evolución de largo plazo

La sincronización multidispositivo, un backend, la colaboración o la publicación en tiendas requieren otra etapa de investigación. Antes de implementarlas se debería validar demanda real, política de privacidad, resolución de conflictos, costos de infraestructura y experiencia offline. El principio rector es preservar la propuesta que originó Lumapse: una herramienta local, rápida y comprensible para estudiantes, no una plataforma generalista de productividad.

## 7.4. Cierre

Lumapse demuestra que un proyecto académico puede producir a la vez un incremento de software utilizable y evidencia profesional del proceso que lo originó. Su aporte no reside solamente en el APK: incluye el relevamiento que modificó la dirección del producto, las decisiones registradas, la arquitectura local-first, la disciplina de pruebas y la capacidad de reconocer límites sin ocultarlos.

La beta `v0.4.8` constituye un punto de cierre concreto: está empaquetada, firmada, publicada y validada inicialmente en Android real. El producto todavía admite mejoras y la entrega académica conserva tareas editoriales, pero esas tareas ya pueden separarse del núcleo funcional y priorizarse en un hito posterior. Concluir de forma responsable no significa vaciar el backlog, sino congelar un alcance coherente, demostrar qué funciona, documentar qué falta y evitar que nuevas ideas diluyan una entrega verificable.

En ese sentido, el resultado principal del proyecto es doble. Para el estudiante usuario, Lumapse ofrece una herramienta simple y disponible sin conexión para conservar y organizar conocimiento. Para la formación profesional, deja una experiencia completa de análisis, adaptación, diseño, implementación, validación y cierre incremental que puede ser auditada y continuada sobre evidencia versionada.

---

# Referencias

Este capítulo consolida las fuentes citadas o utilizadas como fundamento metodológico y técnico. Se aplica un criterio compatible con APA 7; los enlaces se mantienen para facilitar la verificación durante el checkpoint documental.

## 8.1. Bibliografía metodológica

- Gómez, J. (2014). *Guía práctica de estimación y medición de proyectos software* [Material de consulta provisto por la cátedra].
- Gothelf, J., & Seiden, J. (2013). *Lean UX: Applying Lean Principles to Improve User Experience*. O’Reilly Media. https://www.oreilly.com/library/view/lean-ux/9781449366834/
- Parada, M. (2026). *Guía de estudio de Prácticas Profesionalizantes III* [Material de cátedra]. IES 6023 “Dr. Alfredo Loutaif”.

> **Control bibliográfico pendiente:** Antes del congelamiento final deben contrastarse autoría, título, edición y entidad editora de Gómez (2014) y del material de Parada (2026) contra los originales conservados por la cátedra. El repositorio no contiene metadatos suficientes para completar esos campos sin inventarlos.

## 8.2. Normas y documentación técnica oficial

- Ionic. (s. f.). *Capacitor documentation*. Recuperado el 15 de julio de 2026, de https://capacitorjs.com/docs
- SQLite Project. (s. f.). *SQLite foreign key support*. Recuperado el 15 de julio de 2026, de https://www.sqlite.org/foreignkeys.html
- World Wide Web Consortium. (2024, 12 de diciembre). *Web Content Accessibility Guidelines (WCAG) 2.2* (W3C Recommendation). https://www.w3.org/TR/WCAG22/

## 8.3. Fuentes primarias del proyecto

- Sandoval, J. D. F. (2026). *Relevamiento sobre hábitos y necesidades de toma de notas en estudiantes del IES 6023* [Conjunto de datos; 121 respuestas recolectadas, 120 válidas]. Lumapse. [`analisis-relevamiento/datos/respuestas_relevamiento_2026_05.csv`](../../analisis-relevamiento/datos/respuestas_relevamiento_2026_05.csv)
- Sandoval, J. D. F. (2026). *Lumapse v0.4.8* [Software y APK Android, beta controlada]. GitHub. https://github.com/jdfesa/lumapse/releases/tag/v0.4.8
- Sandoval, J. D. F. (2026). *Registros de decisiones arquitectónicas de Lumapse* [ADR-001 a ADR-008]. [`docs/adr/`](../adr/)

Los documentos internos, commits, scripts y checklists se citan mediante enlaces relativos porque funcionan como evidencia primaria versionada del proyecto, no como bibliografía externa.
