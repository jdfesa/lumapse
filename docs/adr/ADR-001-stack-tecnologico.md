# ADR-001: Elección del Stack Base y Build Tool

**Fecha:** 2026-05-01  
**Estado:** Aceptado — revisado el 2026-07-15
**Autor:** Jose David Sandoval

## Contexto

Al iniciar Lumapse como una PWA, fue necesario decidir qué tecnologías usar para su capa web. Existían múltiples opciones (React, Vue, Angular, Svelte o Vanilla JS) y distintas herramientas de build. La elección debía equilibrar productividad, curva de aprendizaje, rendimiento y defendibilidad académica. El pivote posterior a Android no invalida esta decisión base porque Capacitor reutiliza la aplicación web dentro del contenedor nativo.

## Opciones consideradas

| Opción | Pros | Contras |
|---|---|---|
| React + Vite | Ecosistema amplio, demanda laboral | Runtime y JSX innecesarios para el alcance inicial |
| Vue 3 + Vite | Reactividad integrada, curva accesible | Capa de abstracción adicional |
| Svelte + Vite | Runtime reducido y buena experiencia de desarrollo | Menor adopción en el contexto académico local |
| **Vanilla JS + Vite** | Control directo, módulos nativos, sin runtime de UI | Mayor responsabilidad manual en componentes y estado |

## Decisión original

Adoptar **Vanilla JavaScript con módulos ES y Vite 6** como base de la aplicación.

Vite proporciona servidor de desarrollo con HMR, resolución de módulos, integración con TypeScript y build optimizado. Usar módulos nativos sin un framework de UI evita una dependencia de runtime y mantiene explícito el funcionamiento de los componentes.

## Estado vigente del stack

La revisión realizada sobre la beta `0.4.8` confirma y amplía la decisión original:

- Vite 6 continúa como servidor de desarrollo y herramienta de build.
- La interfaz sigue sin framework y combina JavaScript maduro con una migración gradual a TypeScript.
- Capacitor agrega el contenedor Android y los plugins nativos; esta ampliación se decide en [ADR-005](ADR-005-pivote-app-nativa.md).
- SQLite reemplaza IndexedDB como persistencia del producto; la arquitectura se detalla en [ADR-006](ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).
- No existe un Service Worker ni un manifiesto que conviertan el build actual en PWA. El modo web se conserva para desarrollo y pruebas, no como canal funcional comprometido.
- La arquitectura y el criterio para migraciones TypeScript se formalizan en [ADR-008](ADR-008-arquitectura-modular-y-patrones.md).

## Consecuencias

**Positivas:**

- Sin runtime de framework de UI.
- Código explícito y directamente auditable.
- Componentes implementados con APIs estándar del navegador.
- TypeScript puede incorporarse módulo por módulo sin reescritura total.
- La misma base se empaqueta para Android mediante Capacitor.

**Negativas:**

- Más código propio para componentes, renderizado y ciclo de vida.
- La gestión de estado y las convenciones arquitectónicas requieren disciplina explícita.
- La convivencia temporal de JavaScript y TypeScript aumenta el costo de mantener contratos consistentes.

## Revisión

La revisión prevista al cierre de los primeros hitos se completó. No se justifica migrar a un framework antes de la presentación: el stack actual sostiene la beta funcional. Un cambio de framework o build tool requeriría un nuevo ADR; las conversiones graduales a TypeScript no reemplazan esta decisión.
