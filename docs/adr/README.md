# Architecture Decision Records — Lumapse

Los ADR conservan decisiones importantes, sus alternativas y consecuencias. Un ADR reemplazado se mantiene como evidencia histórica, pero no define la arquitectura vigente.

## Registro

| ADR | Decisión | Estado |
|---|---|---|
| [ADR-001](./ADR-001-stack-tecnologico.md) | Stack base web y Vite | Aceptado, revisado |
| [ADR-002](./ADR-002-persistencia-indexeddb.md) | Persistencia IndexedDB original | Reemplazado por ADR-005 y ADR-006 |
| [ADR-003](./ADR-003-metodologia-kanban.md) | Gestión del trabajo con Kanban | Aceptado |
| [ADR-004](./ADR-004-estructura-carpetas.md) | Estructura del repositorio | Aceptado, revisado |
| [ADR-005](./ADR-005-pivote-app-nativa.md) | Pivote a aplicación Android híbrida con Capacitor | Aceptado y validado técnicamente |
| [ADR-006](./ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md) | Persistencia SQLite multiplataforma | Aceptado y validado |
| [ADR-007](./ADR-007-organizacion-componentes-por-feature.md) | Componentes UI organizados por feature | Aceptado |
| [ADR-008](./ADR-008-arquitectura-modular-y-patrones.md) | Arquitectura modular y patrones aplicados | Aceptado |

## Decisiones vigentes en una frase

Lumapse es un monolito modular cliente, offline-first, desarrollado con módulos ES y TypeScript gradual sobre Vite, empaquetado para Android con Capacitor y persistido en SQLite. La arquitectura se organiza por capas de responsabilidad y componentes por feature.

La vista detallada y sus evidencias están en [`../diagramas/arquitectura-componentes.md`](../diagramas/arquitectura-componentes.md).
