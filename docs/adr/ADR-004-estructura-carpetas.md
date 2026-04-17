# ADR-004: Estructura de Carpetas del Proyecto

**Fecha:** 2026-05-01  
**Estado:** Aceptado  
**Autores:** Jose David Sandoval

---

## Contexto

Al inicializar el proyecto era necesario definir cómo organizar los archivos del repositorio. La estructura debía: separar claramente el código fuente de la documentación académica, ser comprensible para el profesor al revisar el repo, seguir convenciones de la industria, y escalar bien durante los 6 meses de desarrollo.

## Decisión

```
lumapse/
├── src/                    # Código fuente de la PWA
│   ├── components/         # Componentes UI reutilizables
│   ├── services/           # Lógica de negocio (IndexedDB, parsers)
│   ├── store/              # Estado de la aplicación (patrón observable)
│   ├── styles/             # CSS modular (main.css + partials)
│   └── main.js             # Punto de entrada de la aplicación
│
├── public/                 # Assets estáticos (no procesados por Vite)
│   ├── icons/              # Iconos PWA en múltiples tamaños
│   └── manifest.json       # Web App Manifest
│
├── docs/                   # Documentación viva del proyecto
│   ├── adr/                # Architecture Decision Records (este documento)
│   ├── anteproyecto/       # PDF y documentos formales del anteproyecto
│   ├── hitos/              # Informes de avance por hito mensual
│   └── diagramas/          # Diagramas de arquitectura y flujo
│
├── .github/                # Configuración de GitHub
│   ├── ISSUE_TEMPLATE/     # Templates para issues (feature, bug)
│   └── PULL_REQUEST_TEMPLATE.md
│
├── index.html              # Punto de entrada HTML (requerido por Vite)
├── vite.config.js          # Configuración del build tool
├── package.json            # Dependencias y scripts
├── .gitignore              # Archivos ignorados por Git
├── README.md               # Portal de entrada del proyecto
└── CHANGELOG.md            # Historial de cambios por hito
```

## Principios que guiaron esta decisión

1. **Separación de responsabilidades:** `src/` es solo código; `docs/` es solo documentación. El profesor puede ir directamente a `docs/` para ver la evolución académica.
2. **Convención de industria:** La estructura `src/` + `public/` es estándar en proyectos Vite/webpack.
3. **Escalabilidad:** La modularización en `components/`, `services/` y `store/` permite crecer sin refactorizaciones drásticas.
4. **Visibilidad del proceso:** Los ADRs en `docs/adr/` documentan el razonamiento detrás del código.

## Consecuencias

**Positivas:**
- El historial de commits refleja claramente en qué área se trabajó (`src/`, `docs/`, etc.)
- Los prefijos de commit (`feat:`, `docs:`) mapean naturalmente a las carpetas
- Facilita la generación de un CHANGELOG automatizado en el futuro

**Negativas:**
- Requiere disciplina para mantener la separación (no mezclar código y documentación)

## Revisión

Este ADR es permanente. Solo se revisaría si el proyecto migra a un monorepo o cambia de build tool.
