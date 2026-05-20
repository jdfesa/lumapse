# Informe Final — Lumapse
**Alumno:** José David Sandoval  
**Carrera:** Tecnicatura en Análisis de Sistemas y Desarrollo de Software  
**Institución:** IES 6023 "Dr. Alfredo Loutaif"  
**Materia:** Prácticas Profesionalizantes III  
**Año:** 2026  
**Generado automáticamente:** 2026-05-20

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
- [2.5. Requisitos del Sistema](#25-requisitos-del-sistema)
  - [2.5.1. Requisitos Funcionales](#251-requisitos-funcionales)
  - [2.5.2. Requisitos No Funcionales](#252-requisitos-no-funcionales)
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
- [5.1. Estructura del Repositorio y Entorno](#51-estructura-del-repositorio-y-entorno)
- [5.2. Capa de Presentación (Componentes UI)](#52-capa-de-presentación-componentes-ui)
- [5.3. Gestión de Estado Reactivo](#53-gestión-de-estado-reactivo)
- [5.4. Capa de Persistencia (Evolución de IndexedDB a SQLite)](#54-capa-de-persistencia-evolución-de-indexeddb-a-sqlite)
- [5.5. Procesamiento de Markdown y Seguridad (XSS)](#55-procesamiento-de-markdown-y-seguridad-xss)
- [5.6. Empaquetado Nativo (Capacitor)](#56-empaquetado-nativo-capacitor)
- [5.7. Licenciamiento de Software y Filosofía Open Source](#57-licenciamiento-de-software-y-filosofía-open-source)
- [5.8. Integración Continua (CI) — Automatización de Calidad de Código](#58-integración-continua-ci-automatización-de-calidad-de-código)
  - [5.8.1. ¿Qué es la Integración Continua?](#581-qué-es-la-integración-continua)
  - [5.8.2. Herramientas utilizadas](#582-herramientas-utilizadas)
  - [5.8.3. Implementación en Lumapse](#583-implementación-en-lumapse)
  - [5.8.4. Flujo de trabajo resultante](#584-flujo-de-trabajo-resultante)
  - [5.8.5. Resultado de la primera ejecución](#585-resultado-de-la-primera-ejecución)
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

## 1.2. Planteo del Problema

## 1.3. Objetivos
### 1.3.1. Objetivo General
### 1.3.2. Objetivos Específicos

## 1.4. Justificación y Alcance

---

# Capítulo 2: Marco Metodológico y Modelo de Negocio

## 2.1. Metodología de Desarrollo (Agile/Kanban)

## 2.2. Análisis de Personas de Usuario

## 2.3. Análisis Competitivo

## 2.4. Lean Canvas

## 2.5. Requisitos del Sistema
### 2.5.1. Requisitos Funcionales
### 2.5.2. Requisitos No Funcionales

---

# Capítulo 3: Relevamiento y Análisis de Datos

## 3.1. Metodología de Recolección (Población y Muestra)

## 3.2. Análisis Demográfico

## 3.3. Resultados sobre Hábitos de Estudio y Toma de Notas

## 3.4. Análisis Cualitativo (Puntos de Dolor)

## 3.5. Conclusiones del Relevamiento e Impacto en el Producto

---

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

---

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

---

# Capítulo 6: Pruebas y Validación

## 6.1. Estrategia de Testing

## 6.2. Pruebas Unitarias

## 6.3. Pruebas de Integración y Funcionamiento Offline

## 6.4. Validación de Rendimiento y UX

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
