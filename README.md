# Lumapse

> PWA minimalista de captura de notas y gestión del conocimiento personal.  
> Offline-first · Markdown · Sin cuentas · Sin servidores.

[![Estado del proyecto](https://img.shields.io/badge/estado-en%20desarrollo-a3e635?style=flat-square)](https://github.com/jdfesa/lumapse)
[![Hito actual](https://img.shields.io/badge/hito-01%20fundaci%C3%B3n-a3e635?style=flat-square)](./docs/hitos/hito-01-mayo.md)
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

| Hito | Mes | Objetivo principal |
|---|---|---|
| **01** | Mayo 2026 | Fundación: repo, estructura, documentación base |
| **02** | Junio 2026 | Editor core: crear/editar/eliminar notas + IndexedDB |
| **03** | Julio 2026 | MVP completo: Markdown, export/import, PWA instalable |
| **04** | Agosto 2026 | Organización y UX: etiquetas, modo oscuro, responsive |
| **05** | Septiembre 2026 | Testing y robustez: Vitest, Lighthouse, correcciones |
| **06** | Octubre 2026 | Entrega final: documentación completa, demo |

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
