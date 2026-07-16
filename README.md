# Lumapse

> App móvil minimalista de captura de notas y gestión del conocimiento personal.  
> Offline-first · Markdown · SQLite · Sin fricción.

[![Estado del proyecto](https://img.shields.io/badge/estado-en%20desarrollo-a3e635?style=flat-square)](https://github.com/jdfesa/lumapse)
[![Hito actual](https://img.shields.io/badge/hito-06%20entrega%20final-3b82f6?style=flat-square)](./BACKLOG.md)
[![Licencia](https://img.shields.io/badge/licencia-GPLv3-737373?style=flat-square)](./LICENSE)
[![Conventional Commits](https://img.shields.io/badge/commits-conventional-a3e635?style=flat-square)](https://www.conventionalcommits.org)

---

## ¿Qué es Lumapse?

Lumapse es una aplicación móvil Android empaquetada con Capacitor, diseñada para que estudiantes de nivel superior puedan capturar, organizar y recuperar notas de estudio de forma rápida y offline-first.

Lumapse se enfoca en una fricción concreta: para parte del público relevado, las herramientas disponibles resultan demasiado complejas, dependen de una cuenta o no se adaptan bien al uso cotidiano con conectividad irregular. La beta se distribuye como APK Android, guarda los datos localmente con SQLite y prioriza los flujos sin conexión.

> **¿Por qué "Lumapse"?** El nombre es un neologismo que fusiona *Lumen* (claridad, captura sin fricción) y *Synapse* (conexión, conocimiento interconectado). [Leer la historia completa →](./docs/producto/origen-del-nombre.md)

> **Nota sobre la arquitectura:** Lumapse fue concebida inicialmente como una PWA. El [relevamiento con 120 respuestas válidas](./docs/producto/resultados-relevamiento.md) respaldó las prioridades **mobile-first** y **offline-first**: el 72.5% eligió el celular y el 81.7% respondió “A veces”, “Raramente” o “Nunca” ante la pregunta por acceso estable a internet en el instituto. La encuesta no comparó PWA con APK. El empaquetado Android con Capacitor y la migración a SQLite se resolvieron mediante el análisis técnico documentado en [ADR-005](./docs/adr/ADR-005-pivote-app-nativa.md) y [ADR-006](./docs/adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

---

## Stack Tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| Build | [Vite 6](https://vite.dev) | Estándar de la industria, HMR, configuración mínima |
| Lenguaje | JavaScript (ES2022+) + TypeScript gradual | JS sigue siendo la base; TypeScript entra por contratos y módulos puros para mejorar mantenibilidad |
| Persistencia actual | SQLite (vía `@capacitor-community/sqlite`) | Robusta, relacional, offline-first y alineada con [ADR-006](./docs/adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md) |
| Simulación web SQLite | `sql.js` + `jeep-sqlite` | Permite desarrollo y tests locales manteniendo el mismo modelo de datos |
| Empaquetado Android | [Capacitor](https://capacitorjs.com/) + Android | Distribuye la UI web en un contenedor Android híbrido y expone plugins nativos |
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

`v0.4.8` es la beta/candidata operativa congelada. `main` contiene trabajo documental y refactors posteriores al tag, pero no existe una release `0.4.9` ni otro APK publicado.

SHA-256 del APK publicado:

```text
cad122d0329e1761816ac7ad07938673389c859a252d9cc63504359355db3d10
```

### Requisitos previos — Web (desarrollo y contribución)

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| **Node.js** | v22+ | `node --version` |
| **npm** | Incluido con Node 22 | `npm --version` |
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

### Compilación Android (APK)

Para compilar el `.apk` con el corte actual se requiere Android Studio, JDK 21 y Android SDK 36.
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
│   ├── config/             # Metadatos/configuración de aplicación
│   ├── domain/             # Contratos y tipos de dominio
│   ├── layout/             # Shell, drawer y navegación
│   ├── services/           # Reglas, flujos, adaptadores y SQLite
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
│   ├── adr/                # Architecture Decision Records (8 ADRs)
│   ├── diagramas/          # Diagramas UML (Mermaid)
│   ├── gestion/            # Estimación, planificación y control de avance
│   ├── hitos/              # Informes de avance mensuales
│   ├── informe-final/      # Capítulos fuente del informe académico final (PP3)
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
- Relevamiento de datos: diseño de encuesta, metodología muestral, 121 respuestas recolectadas y 120 válidas
- Análisis cuantitativo y cualitativo de resultados ([informe](./docs/producto/resultados-relevamiento.md))
- Decisión de pivote de PWA a aplicación Android híbrida con Capacitor + SQLite ([ADR-005](./docs/adr/ADR-005-pivote-app-nativa.md))

### ✅ Hito 02 — Core del Editor (Junio 2026) → [Informe](./docs/hitos/hito-02-junio.md)

Construir el corazón funcional de la aplicación: editor de notas con persistencia local.

- `NoteService`: capa de persistencia CRUD con IndexedDB (vía `idb`)
- `NoteStore`: gestor de estado reactivo (patrón Observer)
- Componente `NoteList`: barra lateral con listado de notas
- Componente `NoteEditor`: editor de título y contenido
- Auto-guardado final del corte original, reemplazado después por borradores locales y confirmación explícita (`RF-005`)
- Eliminación de notas con confirmación de seguridad

> **Nota:** Este hito se implementó con IndexedDB como capa de persistencia inicial. La migración a SQLite se ejecuta posteriormente durante el Hito 04, tras el pivote documentado en [ADR-005](./docs/adr/ADR-005-pivote-app-nativa.md) y formalizado técnicamente en [ADR-006](./docs/adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

### ✅ Hito 03 — Markdown, Offline y MVP Inicial (Julio 2026) → [Informe](./docs/hitos/hito-03-julio.md)

Completar el producto mínimo viable de captura y lectura de notas con Markdown y funcionamiento offline.

- Renderizado de Markdown en tiempo real (`marked` + `DOMPurify`)
- Soporte de sintaxis: encabezados, negritas, listas, código, enlaces
- Modo edición / modo lectura (toggle)
- Servicios base de exportación/importación Markdown; la portabilidad verificable se separa luego entre nota individual futura y backups ZIP de workspace
- Funcionamiento offline bajo la arquitectura original PWA/IndexedDB

### ✅ Hito 04 — Organización y UX Móvil (Agosto 2026) → [Informe](./docs/hitos/hito-04-agosto.md)

Implementar el modelo de organización respaldado por el relevamiento y optimizar la experiencia móvil.

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

### ✅ Hito 05 — Testing, Calidad y Distribución (planificado para Septiembre 2026, cerrado) → [Informe de cierre](./docs/hitos/hito-05-septiembre.md)

Garantizó la calidad del código y preparó la primera distribución controlada del producto.

- Suite de tests unitarios con Vitest y quality gate local
- GitHub Actions `CI — Quality Gate`
- Smoke tests nativos Android bajo `com.lumapse.app`
- Borradores persistentes del editor para continuar notas tras cambiar de app o consultar PDFs (`RF-005`)
- Backup manual `.zip` externo con salida por share sheet/gestor de archivos (`RF-017`)
- Importación de backup `.zip` generado por Lumapse con preview y política no destructiva (`RF-018`)
- Sección "Acerca de" con versión, autor, licencia y alcance offline/local (`RF-023`)
- Fechas académicas discretas integradas al calendario existente (`RF-027`)
- Editor enriquecido con slash commands, botón `+`, formato `Aa`, callouts y modo enfoque dedicado (`RF-028`)
- Validación inicial en Samsung Galaxy S20 FE con Android 13
- Generación, firma y publicación de `lumapse-v0.4.8.apk`
- Cierre sin bugs bloqueantes; `Mover a` y rendimiento con más notas quedan como observaciones menores para la validación final

### 🔄 Hito 06 — Entrega Final (planificado para Octubre 2026, activo) → [Informe inicial](./docs/hitos/hito-06-octubre.md)

Cerrar el proyecto con documentación coherente, evidencia final y presentación académica, sin ampliar el producto.

- Revisión editorial y congelamiento de la documentación técnica y académica
- Gráficos de base de datos regenerados y verificados contra el schema real; resta validar su maquetación en PDF y diapositivas
- Quality gate y validación Android final con un conjunto de datos definido y reproducible
- Decisión explícita sobre artefacto, versión y línea base final; no se crea `0.4.9` de forma anticipada
- Preparación de presentación, demo y respuestas para el tribunal evaluador

> **Nota sobre la planificación:** Los meses asociados a cada hito constituyen estimaciones formuladas al inicio del proyecto. El desarrollo es iterativo: los plazos pueden ajustarse al profundizar la complejidad o aparecer hallazgos que cambian el alcance. El relevamiento por conveniencia aportó evidencia para priorizar móvil, offline y organización por materias; las decisiones de plataforma se justifican por separado en los ADR técnicos. El avance real se registra en los [informes de hito](./docs/hitos/), el [Changelog](./CHANGELOG.md) y el historial de commits.

---

## Investigación de Producto

Paralelamente al desarrollo se realizó un relevamiento con potenciales usuarios para contrastar hipótesis y ajustar requisitos. La encuesta aporta evidencia declarativa; la validación directa del prototipo con usuarios permanece en Hito 06.

| Actividad | Estado | Documentación |
|---|---|---|
| Diseño de la encuesta | ✅ Completado | [relevamiento-datos.md](./docs/producto/relevamiento-datos.md) |
| Metodología muestral y cálculo de muestra | ✅ Completado | [metodologia-muestral.md](./docs/producto/metodologia-muestral.md) |
| Ejecución de la encuesta (recolección de respuestas) | ✅ Completado | [encuesta/README.md](./docs/producto/encuesta/README.md) |
| Análisis de resultados y conclusiones | ✅ Completado | [resultados-relevamiento.md](./docs/producto/resultados-relevamiento.md) |

> **Nota:** Los resultados de la encuesta retroalimentaron los requisitos funcionales y las prioridades del roadmap. Ver las [conclusiones y recomendaciones](./docs/producto/resultados-relevamiento.md#14-conclusiones-y-recomendaciones) para un resumen de los hallazgos principales.

---

## Documentación técnica

- [Portal documental](./docs/README.md) — Jerarquía, fuentes canónicas y criterio editorial
- [Informe final ensamblado](./docs/informe-final/INFORME-FINAL-COMPLETO.md) — Checkpoint académico generado desde los capítulos fuente
- [Hito 06 — Entrega Final](./docs/hitos/hito-06-octubre.md) — Alcance y criterios de cierre vigentes
- [Cheat sheet de defensa](./docs/gestion/cheatsheet-defensa.md) — Métricas y respuestas verificables para la presentación
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

- **Materia:** Prácticas Profesionalizantes III
- **Alumno:** Sandoval, José David Fernando
- **Profesor:** Ing. Parada, Mauricio
- **Tutora:** Prof. Jaquet, Melina Daiana
- **Institución:** IES 6023 'Dr. Alfredo Loutaif'
- **Año:** 2026

---

*Desarrollado en el marco de la materia Prácticas Profesionalizantes III · IES 6023 'Dr. Alfredo Loutaif' · 2026*
