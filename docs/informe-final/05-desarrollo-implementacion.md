# Capítulo 5: Desarrollo e Implementación

## 5.1. Estructura del Repositorio y Entorno

El repositorio está organizado para que código, documentación, scripts, análisis de datos y configuración nativa convivan en una misma base versionada. Esta decisión permite que el proyecto sea auditable desde Git: cada cambio de código puede relacionarse con documentación, requisitos, decisiones y evidencia.

Las carpetas principales son:

| Carpeta | Propósito |
|---|---|
| `src/` | Código fuente de la aplicación web empaquetada. |
| `src/components/` | Componentes de interfaz: editor, listado, tarjetas, diálogos, papelera y preview Markdown. |
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
| `NoteEditor` | Edición de contenido Markdown, borradores persistentes y modos de trabajo. |
| `MarkdownPreview` | Renderizado seguro del Markdown. |
| `NoteList` y `NoteCardRenderer` | Listado y representación visual de notas. |
| `TrashView` | Papelera, restauración y eliminación definitiva. |
| `ConfirmDialog` | Confirmaciones personalizadas para reemplazar diálogos nativos. |
| `Toast` | Mensajes breves de estado y feedback. |
| `drawerSubjects` | Navegación por materias y secciones. |
| `drawerController` | Coordinación del drawer lateral. |

La capa de presentación no accede directamente a la base de datos. Interactúa con el store y los servicios, respetando una separación entre UI, estado y persistencia.

## 5.3. Gestión de Estado Reactivo

La gestión de estado se implementa con un store propio basado en el patrón Observer. El estado central mantiene notas, materias, vista activa, búsqueda, nota seleccionada, materia seleccionada y banderas de UI. Cuando una operación modifica datos o filtros, el store notifica a los componentes suscriptores para que actualicen la pantalla.

El store se dividió en módulos para reducir acoplamiento:

| Archivo | Responsabilidad |
|---|---|
| `NoteStore.state.js` | Estado base y suscripciones. |
| `NoteStore.data.js` | Carga, creación, actualización y eliminación de datos. |
| `NoteStore.ui.js` | Acciones de UI y coordinación de vistas. |
| `noteFilters.js` | Reglas de filtrado y visibilidad de notas. |

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
