# Capítulo 5: Desarrollo e Implementación

## 5.1. Estructura del Repositorio y Entorno

## 5.2. Capa de Presentación (Componentes UI)

## 5.3. Gestión de Estado Reactivo

## 5.4. Capa de Persistencia (Evolución de IndexedDB a SQLite)

## 5.5. Procesamiento de Markdown y Seguridad (XSS)

## 5.6. Empaquetado Nativo (Capacitor)

## 5.7. Licenciamiento de Software y Filosofía Open Source
> **Nota para redacción (Mayo 2026):** Explicar en esta sección la decisión de usar Copyleft.  
> *Argumento a desarrollar:* "Se eligió la licencia GNU GPLv3 porque este proyecto nace en un entorno educativo público (IES 6023). La filosofía es que el código sirva como guía para futuras cohortes. Esta licencia asegura legalmente que cualquier estudiante que construya sobre este trabajo tenga que devolverle su propio código abierto a la comunidad, evitando que se privatice el conocimiento generado dentro de la institución."

## 5.8. Integración Continua (CI) — Automatización de Calidad de Código

### 5.8.1. ¿Qué es la Integración Continua?

La **Integración Continua** (CI, del inglés *Continuous Integration*) es una práctica de ingeniería de software mediante la cual cada modificación del código fuente se verifica automáticamente mediante una serie de comprobaciones definidas por el equipo de desarrollo. El objetivo es detectar problemas lo antes posible en el ciclo de vida del software, reduciendo el costo de corrección y aumentando la confianza en el código que se entrega.

En entornos profesionales, un pipeline de CI suele incluir: análisis estático de código, ejecución de tests unitarios, compilación del proyecto y, eventualmente, despliegue automático. Para Lumapse, se implementó la primera y más fundamental de estas etapas: el **análisis estático de código con un linter**.

### 5.8.2. Herramientas utilizadas

| Herramienta | Rol | Versión |
|---|---|---|
| **ESLint** | Linter: analiza el código JavaScript en busca de errores y malas prácticas | v9.x (flat config) |
| **GitHub Actions** | Plataforma de CI integrada en GitHub que ejecuta el workflow automáticamente | N/A (servicio cloud) |

#### ¿Qué es un Linter?

Un linter es una herramienta que lee el código fuente de forma estática —sin ejecutarlo— y reporta:

- **Errores:** uso de variables no definidas, imports duplicados, construcciones inválidas.
- **Advertencias:** uso de `var` en lugar de `const`/`let`, comparaciones con `==` en vez de `===`, variables declaradas pero nunca utilizadas.

El linter **nunca modifica el código ni afecta la ejecución de la aplicación**. Su único efecto es generar un reporte que el desarrollador puede consultar para mejorar la calidad del código.

### 5.8.3. Implementación en Lumapse

Se crearon dos artefactos de configuración:

**`eslint.config.js` (raíz del proyecto):** Define el alcance del análisis (únicamente `src/`), las variables globales del entorno del navegador permitidas (`window`, `document`, `alert`, `crypto`, etc.) y el conjunto de reglas activas:

```javascript
// Reglas clave configuradas:
"no-unused-vars": "warn"    // Variables declaradas pero no usadas → advertencia
"no-undef":       "error"   // Variables no definidas              → error
"prefer-const":   "warn"    // Preferir const sobre let            → advertencia
"no-var":         "warn"    // Evitar var (obsoleto en ES6+)       → advertencia
"eqeqeq":         "warn"    // Usar === en lugar de ==             → advertencia
```

**`.github/workflows/lint.yml`:** Define el workflow de GitHub Actions que se ejecuta automáticamente ante cada `push` o `pull request` a la rama `main`:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "22" }
      - run: npm ci
      - run: npm run lint
```

El script `npm run lint` fue incorporado a `package.json`, lo que permite al desarrollador ejecutar la misma verificación localmente antes de cada commit:

```bash
npm run lint
```

### 5.8.4. Flujo de trabajo resultante

```
git push origin main
        │
        ▼
GitHub recibe el commit
        │
        ▼
GitHub Actions activa el workflow "CI — Lint"
        │
        ├─ Checkout del código
        ├─ Instalación de dependencias (npm ci)
        └─ Ejecución de ESLint sobre src/
               │
               ├─ Sin problemas → ✅ Badge verde en GitHub
               └─ Con problemas → ❌ Badge rojo + reporte con archivo, línea y descripción
```

> **Nota importante:** el workflow es **no bloqueante**. El código llega al repositorio independientemente del resultado. El badge actúa como indicador visual de salud del código, no como barrera de acceso.

### 5.8.5. Resultado de la primera ejecución

Al implementar ESLint sobre el código existente de Lumapse, se detectaron **4 falsos positivos** (variables globales del navegador no declaradas en la configuración): `alert` en `NoteEditor.js` y `NoteList.js`, y `crypto` en `NoteService.js`. Estos no representaban errores reales en el código sino ausencias en el archivo de configuración del linter, que fueron corregidas de inmediato. La suite pasó a **0 errores y 0 advertencias** antes del primer commit del workflow.

### 5.8.6. Justificación de la práctica

Incorporar CI desde las etapas tempranas del proyecto responde a uno de los principios fundamentales de la ingeniería de software moderna: **"fail fast"** (detectar y corregir problemas cuanto antes). El costo de corregir un error aumenta exponencialmente a medida que avanza el ciclo de desarrollo; un linter que detecta una variable mal declarada en el momento del commit es incomparablemente más barato que encontrarla en producción.

Adicionalmente, la presencia de un workflow de CI en el repositorio es una señal de madurez técnica reconocible por cualquier evaluador externo: indica que el proyecto no depende exclusivamente del criterio subjetivo del desarrollador, sino que cuenta con comprobaciones objetivas y automatizadas sobre la calidad del código.

> **Referencia:** `.github/workflows/lint.yml` · `eslint.config.js` · commit `59dfa74`
