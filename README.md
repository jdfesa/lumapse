# Lumapse

> App móvil minimalista de captura de notas y gestión del conocimiento personal.  
> Offline-first · Markdown · SQLite · Sin fricción.

[![Estado del proyecto](https://img.shields.io/badge/estado-en%20desarrollo-a3e635?style=flat-square)](https://github.com/jdfesa/lumapse)
[![Hito actual](https://img.shields.io/badge/hito-05%20testing%20y%20distribuci%C3%B3n-3b82f6?style=flat-square)](./BACKLOG.md)
[![Licencia](https://img.shields.io/badge/licencia-GPLv3-737373?style=flat-square)](./LICENSE)
[![Conventional Commits](https://img.shields.io/badge/commits-conventional-a3e635?style=flat-square)](https://www.conventionalcommits.org)

---

## ¿Qué es Lumapse?

Lumapse es una aplicación móvil nativa diseñada para que los estudiantes de nivel superior puedan capturar, organizar y recuperar sus notas de estudio de forma rápida, sin fricciones y completamente offline.

El problema que resuelve: las aplicaciones de notas existentes requieren cuenta, conexión a internet, o son demasiado complejas para el uso diario en el aula. Lumapse se instala como cualquier otra app, guarda todo localmente con SQLite y funciona sin conexión.

> **¿Por qué "Lumapse"?** El nombre es un neologismo que fusiona *Lumen* (claridad, captura sin fricción) y *Synapse* (conexión, conocimiento interconectado). [Leer la historia completa →](./docs/producto/origen-del-nombre.md)

> **Nota sobre la arquitectura:** Lumapse fue concebida inicialmente como una PWA. Tras un [relevamiento de datos con 120 estudiantes](./docs/producto/resultados-relevamiento.md), la evidencia empírica mostró que el 72.5% usaría la app desde el celular y el 81.7% tiene conectividad deficiente. Esto fundamentó el [pivote a app nativa](./docs/adr/ADR-005-pivote-app-nativa.md) empaquetada con Capacitor.

---

## Stack Tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| Build | [Vite 6](https://vite.dev) | Estándar de la industria, HMR, configuración mínima |
| Lenguaje | JavaScript (ES2022+) + TypeScript gradual | JS sigue siendo la base; TypeScript entra por contratos y módulos puros para mejorar mantenibilidad |
| Persistencia actual | SQLite (vía `@capacitor-community/sqlite`) | Robusta, relacional, offline-first y alineada con [ADR-006](./docs/adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md) |
| Simulación web SQLite | `sql.js` + `jeep-sqlite` | Permite desarrollo y tests locales manteniendo el mismo modelo de datos |
| Empaquetado nativo | [Capacitor](https://capacitorjs.com/) + Android | Envuelve la web app en contenedor Android nativo |
| Markdown | `marked` + `DOMPurify` | Renderizado de texto enriquecido con sanitización XSS |
| Estilos | CSS nativo / Custom Properties | Sin dependencias externas, máximo control |
| Tests | Vitest | Suite unitaria implementada para servicios, store y componentes críticos |
| CI / Quality Gate | GitHub Actions + scripts locales | Lint, tests, build, bundle budget, trazabilidad, schema, DBML, links, jerarquía, a11y y guardia contra diálogos nativos |
| Control de versiones | Git + GitHub | Seguimiento del proyecto, GitHub Projects |
| Commits | [Conventional Commits](https://www.conventionalcommits.org) | Historial legible y estandarizado |

---

## Levantar el entorno de desarrollo

### Descargar beta Android

La beta controlada actual esta publicada en GitHub Releases:

> [`Lumapse v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8)

Descargar el asset firmado `lumapse-v0.4.8.apk`. No usar el artefacto `unsigned`, que solo se conserva como evidencia tecnica local.

SHA-256 del APK publicado:

```text
cad122d0329e1761816ac7ad07938673389c859a252d9cc63504359355db3d10
```

### Requisitos previos — Web (desarrollo y contribución)

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| **Node.js** | v18+ | `node --version` |
| **npm** | v9+ | `npm --version` |
| **Git** | v2+ | `git --version` |

```bash
# 1. Clonar el repositorio
git clone https://github.com/jdfesa/lumapse.git
cd lumapse

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. (Opcional) Verificar calidad del código
npm run verify
```

El servidor corre en `http://localhost:5173` con Hot Module Replacement activo.

### Compilación Android (APK nativo)

Para compilar el `.apk` con Capacitor se requiere Android Studio, JDK 17+ y el Android SDK.
La guía completa de instalación, dispositivos de prueba y flujo de trabajo está en:

> 📱 [`docs/flujo-desarrollo-android.md`](./docs/flujo-desarrollo-android.md)

---

## Estructura del proyecto

```
lumapse/
├── src/                    # Código fuente de la aplicación
│   ├── components/         # Componentes UI organizados por feature
│   │   ├── academic-events/ # Calendario, heatmap y fechas académicas
│   │   ├── about/           # Sección Acerca de
│   │   ├── backup/         # Vista UI del backup manual
│   │   ├── common/         # ConfirmDialog, Toast y piezas transversales
│   │   ├── feed/           # Listado, tarjetas, acciones y papelera
│   │   ├── markdown/       # Preview y estilos Markdown compartidos
│   │   └── note-editor/    # Editor, borradores, comandos y popups
│   ├── services/           # Lógica de negocio (notas, Markdown, temas, materias, SQLite)
│   ├── store/              # Estado de la aplicación (NoteStore)
│   ├── styles/             # CSS modular
│   └── main.js             # Punto de entrada
├── android/                # Proyecto Android nativo (generado por Capacitor)
├── public/                 # Assets estáticos
│   └── icons/              # Iconos de la aplicación
├── scripts/                # Scripts utilitarios y de automatización local
├── analisis-relevamiento/  # Análisis de datos del relevamiento (Python)
│   ├── datos/              # CSV con respuestas crudas
│   ├── scripts/            # Pipeline modular de análisis
│   └── graficos/           # Gráficos generados (12 archivos)
├── docs/                   # Documentación del proyecto
│   ├── adr/                # Architecture Decision Records (7 ADRs)
│   ├── diagramas/          # Diagramas UML (Mermaid)
│   ├── gestion/            # Estimación, planificación y control de avance
│   ├── hitos/              # Informes de avance mensuales
│   ├── informe-final/      # Esqueleto del informe académico final (PP3)
│   ├── inspiracion/        # Benchmarking e ideas UX/UI externas
│   ├── producto/           # Design Thinking, requisitos, HU y encuesta
│   └── flujo-desarrollo-android.md  # Guía operativa: build, deploy, scrcpy
├── .github/                # Automatización y templates de GitHub
│   ├── workflows/          # CI: Quality Gate en cada push/PR
│   ├── ISSUE_TEMPLATE/     # Templates para issues (features y bugs)
│   └── PULL_REQUEST_TEMPLATE.md
├── index.html              # Punto de entrada HTML de la aplicación
├── capacitor.config.json   # Configuración de Capacitor (appId, webDir)
├── vite.config.js          # Configuración de Vite (build tool)
├── eslint.config.js        # Configuración de ESLint (reglas de calidad)
├── package.json            # Dependencias y scripts del proyecto
├── README.md               # Documentación principal
├── CONTRIBUTING.md         # Reglas de contribución, ramas y estándares
├── CHANGELOG.md            # Registro histórico de cambios y versiones
├── BACKLOG.md              # Deuda técnica y tareas pendientes por hacer
└── LICENSE                 # Licencia legal Copyleft (GNU GPLv3)
```

---

## Roadmap

### ✅ Hito 00 — Investigación y Anteproyecto (Abril 2026) → [Informe](./docs/hitos/hito-00-abril.md)

Concepción del proyecto, investigación académica y diseño de los instrumentos de relevamiento.

- Inicialización del repositorio Git con identidad académica
- Anteproyecto formal para PP3
- Documentación de producto: personas, lean canvas (Design Thinking)
- Historias de usuario iniciales (HU-001 a HU-005)
- Diagramas UML: casos de uso, secuencia, modelo de dominio
- Plan de recolección de datos y metodología estadística
- Diseño y refinamiento de la encuesta de relevamiento

### ✅ Hito 01 — Fundación (Mayo 2026) → [Informe](./docs/hitos/hito-01-mayo.md)

Establecer los cimientos técnicos, organizativos y de investigación del proyecto.

- Inicialización del repositorio Git con estructura profesional
- Configuración de Vite 6 como build tool
- Sistema de diseño base: design tokens, tipografía, paleta de colores
- `index.html` — punto de entrada con meta tags y theme-color
- `src/main.js` — bootstrap de la aplicación
- `src/styles/main.css` — estilos base con CSS Custom Properties
- Architecture Decision Records: ADR-001 a ADR-004
- Documentación de producto: personas, requisitos funcionales y no funcionales, historias de usuario, Lean Canvas, análisis competitivo
- Relevamiento de datos: diseño de encuesta, metodología muestral, recolección de 120 respuestas
- Análisis cuantitativo y cualitativo de resultados ([informe](./docs/producto/resultados-relevamiento.md))
- Decisión de pivote de PWA a app nativa con Capacitor + SQLite ([ADR-005](./docs/adr/ADR-005-pivote-app-nativa.md))

### ✅ Hito 02 — Core del Editor (Junio 2026) → [Informe](./docs/hitos/hito-02-junio.md)

Construir el corazón funcional de la aplicación: editor de notas con persistencia local.

- `NoteService`: capa de persistencia CRUD con IndexedDB (vía `idb`)
- `NoteStore`: gestor de estado reactivo (patrón Observer)
- Componente `NoteList`: barra lateral con listado de notas
- Componente `NoteEditor`: editor de título y contenido
- Guardado explícito de notas con persistencia local
- Eliminación de notas con confirmación de seguridad

> **Nota:** Este hito se implementó con IndexedDB como capa de persistencia inicial. La migración a SQLite se ejecuta posteriormente durante el Hito 04, tras el pivote documentado en [ADR-005](./docs/adr/ADR-005-pivote-app-nativa.md) y formalizado técnicamente en [ADR-006](./docs/adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

### ✅ Hito 03 — Markdown, Offline y MVP Inicial (Julio 2026) → [Informe](./docs/hitos/hito-03-julio.md)

Completar el producto mínimo viable de captura y lectura de notas con Markdown y funcionamiento offline.

- Renderizado de Markdown en tiempo real (`marked` + `DOMPurify`)
- Soporte de sintaxis: encabezados, negritas, listas, código, enlaces
- Toolbar de edición (negrita, cursiva, encabezado, lista) para usuarios no técnicos
- Modo edición / modo lectura (toggle)
- Servicios base de exportación/importación Markdown; la portabilidad verificable se separa luego entre nota individual futura y backups ZIP de workspace
- Funcionamiento offline bajo la arquitectura original PWA/IndexedDB

### ✅ Hito 04 — Organización y UX Móvil (Agosto 2026) → [Informe](./docs/hitos/hito-04-agosto.md)

Implementar el modelo de organización validado por el relevamiento y optimizar la experiencia móvil.

- Integración Capacitor y generación del proyecto Android
- Migración de persistencia: IndexedDB → SQLite (`@capacitor-community/sqlite`)
- Estructura de navegación: Entrada / Materias / Archivo / Papelera
- Creación y edición de materias y secciones
- Asignación y movimiento de notas entre Entrada y Materias
- Archivado/restauración de materias y secciones con cascadas transaccionales
- Búsqueda por texto, modo claro/oscuro, focus mode y diálogos personalizados
- Empty states pulidos para feed, materias, búsqueda, archivo y fechas sin notas
- Cierre formal 2026-06-01: RF-006, RF-022, RF-024, coach marks y guía Markdown se postergan o descartan para MVP por decisión de diseño, evitando ruido visual y falsas expectativas de sincronización
- Tarea diferida para el cierre documental final: actualización de gráficos de base de datos

### 🔄 Hito 05 — Testing, Calidad y Distribución (Septiembre 2026, en curso) → [Informe inicial](./docs/hitos/hito-05-septiembre.md)

Garantizar la calidad del código y preparar la distribución del producto.

- Suite de tests unitarios con Vitest (implementada)
- GitHub Actions `CI — Quality Gate` (implementado)
- Smoke tests nativos Android bajo `com.lumapse.app` (implementados)
- Borradores persistentes del editor para continuar notas tras cambiar de app o consultar PDFs (`RF-005`)
- Backup manual `.zip` externo con salida por share sheet/gestor de archivos (`RF-017`)
- Importación de backup `.zip` generado por Lumapse con preview y política no destructiva (`RF-018`)
- Sección "Acerca de" con versión, autor, licencia y alcance offline/local (`RF-023`)
- Fechas académicas discretas integradas al calendario existente (`RF-027`)
- Editor enriquecido con slash commands, botón `+`, formato `Aa`, callouts y modo enfoque dedicado (`RF-028`)
- Testing en dispositivos Android reales
- Generación del APK firmado para distribución
- Publicación del APK en GitHub Releases
- Corrección de bugs y edge cases

### ⏳ Hito 06 — Entrega Final (Octubre 2026)

Cerrar el proyecto con documentación completa y presentación académica.

- Documentación técnica final
- APK estable disponible para descarga
- Informe de cierre del proyecto
- Presentación ante tribunal evaluador

> **Nota sobre la planificación:** Los meses asociados a cada hito constituyen estimaciones formuladas al inicio del proyecto. El desarrollo de software es, por naturaleza, un proceso iterativo e incremental: los plazos pueden ajustarse conforme se profundiza en la complejidad técnica o surgen hallazgos que modifican el alcance —como el pivote de arquitectura documentado en [ADR-005](./docs/adr/ADR-005-pivote-app-nativa.md), fundamentado en evidencia empírica de 120 usuarios. El avance real se registra de forma transparente en los [informes de hito](./docs/hitos/), el [Changelog](./CHANGELOG.md) y el historial de commits del repositorio.

---

## Investigación de Producto

Paralelamente al desarrollo, se lleva a cabo un proceso de validación con usuarios reales para verificar las hipótesis del producto y ajustar los requisitos.

| Actividad | Estado | Documentación |
|---|---|---|
| Diseño de la encuesta | ✅ Completado | [relevamiento-datos.md](./docs/producto/relevamiento-datos.md) |
| Metodología muestral y cálculo de muestra | ✅ Completado | [metodologia-muestral.md](./docs/producto/metodologia-muestral.md) |
| Ejecución de la encuesta (recolección de respuestas) | ✅ Completado | [encuesta/README.md](./docs/producto/encuesta/README.md) |
| Análisis de resultados y conclusiones | ✅ Completado | [resultados-relevamiento.md](./docs/producto/resultados-relevamiento.md) |

> **Nota:** Los resultados de la encuesta retroalimentaron los requisitos funcionales y las prioridades del roadmap. Ver las [conclusiones y recomendaciones](./docs/producto/resultados-relevamiento.md#14-conclusiones-y-recomendaciones) para un resumen de los hallazgos principales.

---

## Documentación técnica

- [Architecture Decision Records](./docs/adr/) — Decisiones técnicas justificadas
- [Diagramas UML](./docs/diagramas/) — Casos de Uso, Secuencia, Modelo de Dominio (Mermaid)
- [Informes de hito](./docs/hitos/) — Avance mensual del proyecto
- [Documentación de producto](./docs/producto/) — Personas, requisitos, historias de usuario, análisis competitivo, Lean Canvas (Design Thinking)
- [Anteproyecto](./docs/anteproyecto/) — Documento formal de definición

---

## Metodología

El proyecto se gestiona con **Kanban** (sin sprints fijos), usando el tablero de GitHub Projects como herramienta de seguimiento. El flujo de trabajo es:

`Backlog → En Curso (WIP: máx. 2) → En Revisión → Hecho`

Cada tarea se registra como un Issue con la etiqueta correspondiente.  
El historial de commits sigue el estándar **Conventional Commits**.

---

## Información Académica

- **Materia:** Práctica Profesionalizante III
- **Alumno:** Sandoval, José David Fernando
- **Profesor:** Ing. Parada, Mauricio
- **Tutora:** Prof. Jaquet, Melina Daiana
- **Institución:** IES 6023 'Dr. Alfredo Loutaif'
- **Año:** 2026

---

*Desarrollado en el marco de la materia Práctica Profesionalizante III · IES 6023 'Dr. Alfredo Loutaif' · 2026*
