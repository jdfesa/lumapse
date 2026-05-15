# Lumapse

> App móvil minimalista de captura de notas y gestión del conocimiento personal.  
> Offline-first · Markdown · SQLite · Sin fricción.

[![Estado del proyecto](https://img.shields.io/badge/estado-en%20desarrollo-a3e635?style=flat-square)](https://github.com/jdfesa/lumapse)
[![Hito actual](https://img.shields.io/badge/hito-03%20MVP%20completo-a3e635?style=flat-square)](./docs/hitos/hito-03-julio.md)
[![Licencia](https://img.shields.io/badge/licencia-MIT-737373?style=flat-square)](./LICENSE)
[![Conventional Commits](https://img.shields.io/badge/commits-conventional-a3e635?style=flat-square)](https://www.conventionalcommits.org)

---

## ¿Qué es Lumapse?

Lumapse es una aplicación móvil nativa diseñada para que los estudiantes de nivel superior puedan capturar, organizar y recuperar sus notas de estudio de forma rápida, sin fricciones y completamente offline.

El problema que resuelve: las aplicaciones de notas existentes requieren cuenta, conexión a internet, o son demasiado complejas para el uso diario en el aula. Lumapse se instala como cualquier otra app, guarda todo localmente con SQLite y funciona sin conexión.

> **Nota sobre la arquitectura:** Lumapse fue concebida inicialmente como una PWA. Tras un [relevamiento de datos con 120 estudiantes](./docs/producto/resultados-relevamiento.md), la evidencia empírica mostró que el 72.5% usaría la app desde el celular y el 81.7% tiene conectividad deficiente. Esto fundamentó el [pivote a app nativa](./docs/adr/ADR-005-pivote-app-nativa.md) empaquetada con Capacitor.

---

## Stack Tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| Build | [Vite 6](https://vite.dev) | Estándar de la industria, HMR, configuración mínima |
| Lenguaje | JavaScript (ES2022+) | Sin transpilación adicional, módulos nativos |
| Persistencia actual | IndexedDB (vía `idb`) | Implementación inicial; migración a SQLite aprobada en [ADR-005](./docs/adr/ADR-005-pivote-app-nativa.md) |
| Persistencia objetivo | SQLite (vía `@capacitor-community/sqlite`) | Robusta, sin riesgo de purga, estándar móvil |
| Empaquetado nativo (objetivo) | [Capacitor](https://capacitorjs.com/) | Envuelve la web app en contenedor Android nativo |
| Markdown | `marked` + `DOMPurify` | Renderizado de texto enriquecido con sanitización XSS |
| Estilos | CSS nativo / Custom Properties | Sin dependencias externas, máximo control |
| Tests (planificado) | Vitest | Integrado con Vite, misma configuración (Hito 05) |
| Control de versiones | Git + GitHub | Seguimiento del proyecto, GitHub Projects |
| Commits | [Conventional Commits](https://www.conventionalcommits.org) | Historial legible y estandarizado |

---

## Levantar el entorno de desarrollo

**Requisitos previos:** Node.js v18+ y npm.

```bash
# 1. Clonar el repositorio
git clone https://github.com/jdfesa/lumapse.git
cd lumapse

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

El servidor corre en `http://localhost:3000` con Hot Module Replacement activo.

---

## Estructura del proyecto

```
lumapse/
├── src/                    # Código fuente de la aplicación
│   ├── components/         # Componentes UI (NoteEditor, NoteList, MarkdownPreview)
│   ├── services/           # Lógica de negocio (NoteService, MarkdownService, Export/Import)
│   ├── store/              # Estado de la aplicación (NoteStore)
│   ├── styles/             # CSS modular
│   └── main.js             # Punto de entrada
├── public/                 # Assets estáticos
│   └── icons/              # Iconos de la aplicación
├── analisis-relevamiento/  # Análisis de datos del relevamiento (Python)
│   ├── datos/              # CSV con respuestas crudas
│   ├── scripts/            # Pipeline modular de análisis
│   └── graficos/           # Gráficos generados (12 archivos)
├── docs/                   # Documentación del proyecto
│   ├── adr/                # Architecture Decision Records (5 ADRs)
│   ├── diagramas/          # Diagramas UML (Mermaid)
│   ├── hitos/              # Informes de avance mensuales
│   └── producto/           # Design Thinking, requisitos, HU
├── .github/                # Templates de GitHub
├── README.md               # Documentación principal
├── CONTRIBUTING.md         # Reglas de contribución, ramas y estándares
├── CHANGELOG.md            # Registro histórico de cambios y versiones
├── BACKLOG.md              # Deuda técnica y tareas pendientes por hacer
├── LICENSE                 # Licencia legal de código abierto (MIT)
└── package.json
```

---

## Roadmap

### ✅ Hito 01 — Fundación (Mayo 2026) → [Informe](./docs/hitos/hito-01-mayo.md)

Establecer los cimientos técnicos, organizativos y de investigación del proyecto.

- Inicialización del repositorio Git con estructura profesional
- Configuración de Vite 6 como build tool
- Sistema de diseño base: design tokens, tipografía, paleta de colores
- `index.html` con meta tags y configuración inicial
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
- Auto-guardado automático con debounce (800ms)
- Eliminación de notas con confirmación de seguridad

> **Nota:** Este hito se implementó con IndexedDB como capa de persistencia inicial. La migración a SQLite se realiza como parte del Hito 03 tras la decisión documentada en [ADR-005](./docs/adr/ADR-005-pivote-app-nativa.md).

### 🔄 Hito 03 — Pivote a App Nativa y MVP (Julio 2026) → [Informe](./docs/hitos/hito-03-julio.md)

Migrar la arquitectura a app nativa y completar el producto mínimo viable.

- Integración de Capacitor: generación del proyecto Android
- Migración de persistencia: IndexedDB → SQLite (`@capacitor-community/sqlite`)
- Renderizado de Markdown en tiempo real (`markdown-it`)
- Soporte de sintaxis: encabezados, negritas, listas, código, enlaces
- Soporte opcional de fórmulas LaTeX (`KaTeX`)
- Toolbar de edición (negrita, cursiva, encabezado, lista) para usuarios no técnicos
- Modo edición / modo lectura (toggle)
- Generación del primer `.apk` funcional

### ⏳ Hito 04 — Organización y UX Móvil (Agosto 2026)

Implementar el modelo de organización validado por el relevamiento y optimizar la experiencia móvil.

- Estructura de navegación: Entrada / Materias / Archivo
- Creación de carpetas por materia
- Mover notas entre Entrada y Materias
- Archivar materias aprobadas
- Búsqueda por texto en tiempo real (título y contenido)
- Modo oscuro / modo claro con toggle
- Diseño mobile-first optimizado (gestos, tamaños táctiles)
- Pantalla de bienvenida (onboarding) en primer uso

### ⏳ Hito 05 — Testing y Distribución (Septiembre 2026)

Garantizar la calidad del código y preparar la distribución del producto.

- Suite de tests unitarios con Vitest
- Testing en dispositivos Android reales
- Generación del APK firmado para distribución
- Publicación del APK en GitHub Releases
- Corrección de bugs y edge cases
- Sección "Acerca de" con información del sistema

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
- **Alumno:** José David Sandoval
- **Profesor:** Ing. Mauricio Parada
- **Institución:** IES 6023 'Dr. Alfredo Loutaif'
- **Año:** 2026

---

*Desarrollado en el marco de la materia Práctica Profesionalizante III · IES 6023 'Dr. Alfredo Loutaif' · 2026*
