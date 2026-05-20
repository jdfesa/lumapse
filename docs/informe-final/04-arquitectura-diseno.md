# Capítulo 4: Arquitectura y Diseño

## 4.1. Decisiones Arquitectónicas Iniciales (ADRs)

## 4.2. Stack Tecnológico

## 4.3. Modelo de Dominio

## 4.4. Diagramas de Casos de Uso

## 4.5. Diagramas de Secuencia

## 4.6. Diseño de Interfaz (UI/UX y Mobile-First)

## 4.7. Diseño de Base de Datos

### 4.7.1. Motor de persistencia

Lumapse utiliza **SQLite** como motor de base de datos, accedido a través del plugin `@capacitor-community/sqlite` en el entorno nativo Android y simulado con `sql.js` (WebAssembly) + `jeep-sqlite` durante el desarrollo web local. Esta decisión se documenta en [ADR-005](../adr/ADR-005-pivote-app-nativa.md) y [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

### 4.7.2. Metodología de diseño

El diseño de la base de datos sigue la metodología académica de tres niveles de abstracción:

1. **Modelo Conceptual** — Diagrama Entidad-Relación con notación Chen (Graphviz DOT, renderizado en [edotor.net](https://edotor.net)).
2. **Normalización** — Verificación de Primera, Segunda y Tercera Forma Normal sobre cada entidad.
3. **Modelo Lógico** — Esquema de tablas relacionales con PKs, FKs, tipos y restricciones (dbdiagram.io, sintaxis DBML).
4. **Modelo Físico** — Sentencias DDL SQL implementadas en `SqliteService.js`.

Los diagramas y la documentación de cada nivel se encuentran en [`docs/diagramas/database/`](../diagramas/database/).

### 4.7.3. Entidades del dominio

El modelo contempla dos entidades de dominio y una tabla técnica:

- **MATERIA** (`subjects`): Modela tanto las Materias (carpetas raíz) como las Secciones (subcarpetas) mediante auto-referencia. Si `parentSubjectId` es `NULL`, es una Materia; si tiene un valor, es una Sección hija de esa Materia. Profundidad máxima: 2 niveles ([DP-004](../producto/decisiones-producto.md)).
- **NOTA** (`notes`): Representa el contenido Markdown creado por el estudiante. Una nota puede vivir en la **Entrada** (`subjectId = NULL`), en una **Materia** o en una **Sección**.
- **METADATA** (`metadata`): Tabla técnica de clave-valor para control de migraciones y flags internos del sistema.

### 4.7.4. Estructura de información opinionada (DP-004)

La estructura de navegación de Lumapse es **opinionada** — no le da al usuario un lienzo en blanco como Notion u Obsidian, sino una jerarquía predefinida que refleja el flujo de trabajo natural de un estudiante universitario:

- 📥 **Entrada:** Destino por defecto de toda nota nueva. Captura rápida sin fricción.
- 📚 **Materias:** Carpetas creadas por el usuario, con opción de sub-secciones dentro de cada una.
- 📦 **Archivo:** Materias aprobadas y notas archivadas.

Esta decisión fue validada con datos empíricos: el 69.2% de los 120 encuestados prefiere organizar por carpetas por materia (P11 del relevamiento).

### 4.7.5. Normalización y desnormalización intencional

El modelo se verificó contra las tres primeras formas normales (ver [02-normalizacion.md](../diagramas/database/02-normalizacion.md)):

- **1FN:** ✅ Todos los atributos son atómicos, sin grupos repetidos.
- **2FN:** ✅ Todas las PKs son simples (UUID), eliminando la posibilidad de dependencias parciales.
- **3FN:** ✅ Con una excepción documentada e intencional.

**Desnormalización intencional del campo `título`:**

El atributo `título` en la entidad NOTA presenta una dependencia transitiva respecto de `contenido`: el título se extrae automáticamente de la primera línea `# ` del texto Markdown (decisión de producto [DP-001](../producto/decisiones-producto.md)). En un modelo estrictamente normalizado en 3FN, este campo debería calcularse en tiempo de ejecución y no almacenarse.

Sin embargo, se decidió mantenerlo como **campo calculado desnormalizado** por las siguientes razones:

1. **Rendimiento en contexto mobile-first:** Para mostrar el listado de notas en la pantalla principal, sería necesario cargar y parsear el contenido Markdown completo de cada nota para extraer el título. En un dispositivo móvil con recursos limitados y potencialmente cientos de notas, esta operación es costosa.
2. **Consultas SQL eficientes:** Almacenar el título permite ejecutar `SELECT id, title, updatedAt FROM notes ORDER BY updatedAt DESC` sin cargar el campo `content`, que puede contener textos extensos.
3. **Consistencia automática:** El campo se recalcula y actualiza en cada operación de guardado (`updateNote`), garantizando que siempre refleja el estado actual del contenido.

Esta desnormalización está documentada en el análisis de normalización y es defendible ante el tribunal como una **decisión técnica fundamentada** en las restricciones del entorno de ejecución.

