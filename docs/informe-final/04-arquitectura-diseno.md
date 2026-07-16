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
