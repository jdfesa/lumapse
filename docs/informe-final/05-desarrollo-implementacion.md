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
