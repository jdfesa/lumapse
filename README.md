# Lumapse

> PWA minimalista de captura de notas y gestión del conocimiento personal.  
> Offline-first · Markdown · Sin cuentas · Sin servidores.

[![Estado del proyecto](https://img.shields.io/badge/estado-en%20desarrollo-a3e635?style=flat-square)](https://github.com/jdfesa/lumapse)
[![Hito actual](https://img.shields.io/badge/hito-02%20core%20del%20editor-a3e635?style=flat-square)](./docs/hitos/hito-02-junio.md)
[![Licencia](https://img.shields.io/badge/licencia-MIT-737373?style=flat-square)](./LICENSE)
[![Conventional Commits](https://img.shields.io/badge/commits-conventional-a3e635?style=flat-square)](https://www.conventionalcommits.org)

---

## ¿Qué es Lumapse?

Lumapse es una herramienta web progresiva (PWA) diseñada para que los estudiantes universitarios puedan capturar, organizar y recuperar sus notas de estudio de forma rápida, sin fricciones y completamente offline.

El problema que resuelve: las aplicaciones de notas existentes requieren cuenta, conexión a internet, o son demasiado complejas para el uso diario en el aula. Lumapse vive en el navegador, se instala como una app nativa y guarda todo localmente.

---

## Stack Tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| Build | [Vite 6](https://vite.dev) | Estándar de la industria, HMR, configuración mínima |
| Lenguaje | JavaScript (ES2022+) | Sin transpilación adicional, módulos nativos |
| Persistencia | IndexedDB (via `idb`) | Capacidad superior a localStorage, transaccional, offline |
| Estilos | CSS nativo / Custom Properties | Sin dependencias externas, máximo control |
| PWA | Web App Manifest + Service Worker | Instalable, offline-first |
| Tests | Vitest | Integrado con Vite, misma configuración |
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
├── src/                    # Código fuente de la PWA
│   ├── components/         # Componentes UI reutilizables
│   ├── services/           # Lógica de negocio (IndexedDB, sync)
│   ├── store/              # Estado de la aplicación
│   ├── styles/             # CSS modular
│   └── main.js             # Punto de entrada
├── public/                 # Assets estáticos
│   ├── icons/              # Iconos PWA (múltiples tamaños)
│   └── manifest.json       # Web App Manifest
├── docs/                   # Documentación del proyecto
│   ├── adr/                # Architecture Decision Records
│   ├── diagramas/          # Diagramas UML (Mermaid)
│   ├── hitos/              # Informes de avance mensuales
│   └── producto/           # Design Thinking, requisitos, HU
├── .github/                # Templates de GitHub
├── README.md
├── CHANGELOG.md
└── package.json
```

---

## Roadmap

### ✅ Hito 01 — Fundación (Mayo 2026) → [Informe](./docs/hitos/hito-01-mayo.md)

Establecer los cimientos técnicos y organizativos del proyecto.

- Inicialización del repositorio Git con estructura profesional
- Configuración de Vite 6 como build tool
- Sistema de diseño base: design tokens, tipografía, paleta de colores
- Web App Manifest (PWA shell) e `index.html` con meta tags
- Architecture Decision Records (ADR-001 a ADR-004)
- Documentación de producto: personas, requisitos, historias de usuario, Lean Canvas

### 🔄 Hito 02 — Core del Editor (Junio 2026) → [Informe](./docs/hitos/hito-02-junio.md)

Construir el corazón funcional de la aplicación: editor de notas con persistencia local.

- `NoteService`: capa de persistencia CRUD con IndexedDB (vía `idb`)
- `NoteStore`: gestor de estado reactivo (patrón Observer)
- Componente `NoteList`: barra lateral con listado de notas
- Componente `NoteEditor`: editor de título y contenido
- Auto-guardado automático con debounce (800ms)
- Eliminación de notas con confirmación de seguridad

### ⏳ Hito 03 — MVP Completo (Julio 2026)

Convertir el editor en un producto mínimo viable con Markdown y capacidad offline real.

- Renderizado de Markdown en tiempo real (preview)
- Soporte de sintaxis básica: encabezados, negritas, listas, código, enlaces
- Modo edición / modo lectura (toggle)
- Exportar nota individual como `.md`
- Exportar todas las notas como `.zip`
- Importar archivos `.md`
- Service Worker para funcionamiento offline completo
- PWA instalable desde el navegador

### ⏳ Hito 04 — Organización y UX (Agosto 2026)

Mejorar la experiencia de uso con herramientas de organización y pulido visual.

- Sistema de etiquetas (tags) por nota
- Filtrado de notas por etiqueta
- Búsqueda por texto en tiempo real (título y contenido)
- Modo oscuro / modo claro con toggle
- Diseño responsive (320px a 1920px)
- Conteo de palabras y caracteres
- Pantalla de bienvenida (onboarding) en primer uso
- Indicador de estado offline/online

### ⏳ Hito 05 — Testing y Robustez (Septiembre 2026)

Garantizar la calidad del código y la experiencia del usuario.

- Suite de tests unitarios con Vitest
- Auditoría Lighthouse (Performance, Accessibility, PWA)
- Corrección de bugs y edge cases
- Sección "Acerca de" con información del sistema

### ⏳ Hito 06 — Entrega Final (Octubre 2026)

Cerrar el proyecto con documentación completa y presentación.

- Documentación técnica final
- Demo funcional desplegada
- Informe de cierre del proyecto
- Presentación académica

---

## Investigación de Producto

Paralelamente al desarrollo, se lleva a cabo un proceso de validación con usuarios reales para verificar las hipótesis del producto y ajustar los requisitos.

| Actividad | Estado | Documentación |
|---|---|---|
| Diseño de la encuesta | ✅ Completado | [relevamiento-datos.md](./docs/producto/relevamiento-datos.md) |
| Metodología muestral y cálculo de muestra | ✅ Completado | [metodologia-muestral.md](./docs/producto/metodologia-muestral.md) |
| Ejecución de la encuesta (recolección de respuestas) | ⏳ Pendiente | — |
| Análisis de resultados y conclusiones | ⏳ Pendiente | — |

> **Nota:** Los resultados de la encuesta podrán retroalimentar los requisitos funcionales y las prioridades del roadmap en hitos futuros.

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
