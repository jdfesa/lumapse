# ADR-001: Elección del Stack Tecnológico

**Fecha:** 2026-05-01  
**Estado:** Aceptado  
**Autores:** Jose David Sandoval

---

## Contexto

Al iniciar el proyecto Lumapse, fue necesario decidir qué tecnologías usar para el desarrollo de la PWA. Existían múltiples opciones (React, Vue, Angular, Svelte o Vanilla JS) y distintas herramientas de build. La elección debía equilibrar: productividad, curva de aprendizaje, rendimiento en producción, y defendibilidad en un contexto académico profesional.

## Opciones consideradas

| Opción | Pros | Contras |
|---|---|---|
| React + Vite | Ecosistema amplio, demanda laboral | Overhead para una PWA simple, JSX agrega complejidad |
| Vue 3 + Vite | Reactivo, fácil de aprender | Agrega capa de abstracción innecesaria para este scope |
| Svelte + Vite | Rendimiento excelente, sin runtime | Menos adoptado en contexto académico local |
| **Vanilla JS + Vite** | Máximo control, sin runtime, módulos nativos | Más verboso en UI compleja |

## Decisión

**Vanilla JavaScript (ES2022+) con Vite 6** como build tool.

Vite proporciona: servidor de desarrollo con HMR, resolución de módulos ES, optimización de build, y soporte nativo de PWA mediante plugins. Usar Vanilla JS evita dependencias de runtime y permite demostrar dominio del lenguaje directamente.

## Consecuencias

**Positivas:**
- Bundle de producción mínimo, sin runtime de framework
- El código es explícito y directamente auditable por el profesor
- Patrón de componentes implementado a medida (sin magia de framework)
- Fácil migración futura a TypeScript o a cualquier framework

**Negativas:**
- Más código boilerplate para UI reactiva
- Gestión de estado manual (se mitiga en Hito 04 con un store simple)

## Revisión

Este ADR se revisa al cierre del Hito 03. Si la complejidad del estado justifica un cambio, se documentará en ADR-005.
