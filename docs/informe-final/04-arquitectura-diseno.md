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
    *   **Capa de Presentación (UI):** (`src/components/`, `src/layout/`) Encargada de manipular el DOM y gestionar eventos de usuario de forma aislada.
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
