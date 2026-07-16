# ADR-004: Estructura de Carpetas del Proyecto

**Fecha:** 2026-05-01  
**Estado:** Aceptado — revisado el 2026-07-15
**Autor:** Jose David Sandoval

## Contexto

Al inicializar el proyecto era necesario organizar el repositorio de forma comprensible, separar código y documentación académica y permitir que la solución creciera sin mezclar responsabilidades. El pivote nativo y los refactors posteriores agregaron nuevas áreas, pero conservaron ese principio.

## Decisión

Mantener una única aplicación con separación explícita entre código fuente, plataforma Android, pruebas, automatización y documentación:

```text
lumapse/
├── src/                    # Código fuente de la aplicación
│   ├── components/         # UI por feature (editor, feed, backup, etc.)
│   ├── config/             # Metadatos y configuración de aplicación
│   ├── domain/             # Contratos y tipos del dominio
│   ├── layout/             # Shell, drawer y navegación
│   ├── services/           # Reglas, flujos, adaptadores y persistencia
│   │   ├── backup/         # Caso de uso de respaldo/importación
│   │   └── sqlite/         # Conexión, migraciones y acceso a datos
│   ├── store/              # Estado observable y coordinación de UI
│   ├── styles/             # Tokens y estilos globales
│   ├── utils/              # Utilidades acotadas
│   └── main.js             # Composition Root y punto de entrada
│
├── android/                # Proyecto Android integrado por Capacitor
├── public/                 # Assets estáticos para Vite y SQLite web
├── tests/unit/             # Pruebas unitarias por capa y feature
├── scripts/                # Verificadores, métricas y automatización
│
├── docs/                   # Documentación viva del proyecto
│   ├── adr/                # Decisiones de arquitectura
│   ├── anteproyecto/       # Definición académica inicial
│   ├── producto/           # Requisitos, HU y relevamiento
│   ├── gestion/            # Planificación, métricas y trazabilidad
│   ├── hitos/              # Informes de avance mensual
│   ├── informe-final/      # Capítulos fuente del informe
│   └── diagramas/          # Arquitectura, comportamiento y datos
│
├── .github/                # CI, templates y configuración de GitHub
├── releases/               # Artefactos y metadatos de entrega
├── index.html              # Punto de entrada HTML de Vite
├── capacitor.config.json   # Configuración del contenedor nativo
├── vite.config.js          # Configuración de Vite
├── tsconfig.json           # Chequeo y migración gradual a TypeScript
├── package.json            # Dependencias y scripts
├── README.md               # Portal de entrada
├── BACKLOG.md              # Trabajo planificado y priorizado
├── TODO                    # Próximas acciones operativas
└── CHANGELOG.md            # Historial por versión
```

No se consideran parte de la estructura fuente los directorios generados o locales como `node_modules/`, `dist/`, coberturas, entornos virtuales y temporales.

## Principios

1. **Separación de responsabilidades:** código, plataforma, pruebas y documentación tienen límites visibles.
2. **Organización por feature en UI:** la navegación se hace por flujo funcional, según [ADR-007](ADR-007-organizacion-componentes-por-feature.md).
3. **Capas en lógica e infraestructura:** servicios, store, dominio y SQLite no se mezclan con estilos o plantillas.
4. **Documentación como fuente versionada:** decisiones, alcance y evidencias se revisan junto con la evolución del producto.
5. **Automatización visible:** verificadores y tareas repetibles viven en `scripts/` y `package.json`.

## Evolución registrada

- **2026-06-11:** `src/components/` se reorganizó por feature, sin alterar las capas principales. Véase [ADR-007](ADR-007-organizacion-componentes-por-feature.md).
- **2026-07-15:** se documentaron `android/`, persistencia SQLite modular, contratos de dominio TypeScript, automatización, pruebas y capítulos del informe. La relación entre capas se formaliza en [ADR-008](ADR-008-arquitectura-modular-y-patrones.md).

## Consecuencias

**Positivas:**

- Cada área tiene una ubicación predecible.
- Facilita revisión académica, onboarding y refactors localizados.
- La estructura refleja la arquitectura que se explica en el informe.
- Las pruebas y herramientas no quedan mezcladas con el producto.

**Negativas:**

- Requiere actualizar rutas y documentación al mover módulos.
- La separación es una convención del equipo y debe sostenerse mediante revisión y verificadores.

## Revisión

Este ADR se mantiene vigente mientras el proyecto conserve una única aplicación y estas capas principales. Una migración a monorepo, backend independiente o nuevo build tool requeriría revisarlo o reemplazarlo.
