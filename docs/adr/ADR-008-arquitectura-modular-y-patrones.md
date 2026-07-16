# ADR-008: Arquitectura Modular por Capas y Patrones de Coordinación

> **Frontera de versión:** Esta clasificación se auditó sobre `main` el 2026-07-15. Describe la arquitectura que sostiene el alcance funcional de `v0.4.8`, pero cita también nombres `.ts` resultantes de refactors posteriores al tag que todavía no pertenecen a una release publicada.

**Fecha:** 2026-07-15  
**Estado:** Aceptado  
**Autor:** Jose David Sandoval

## Contexto

Después del pivote a Android con Capacitor, la incorporación de SQLite, la organización de componentes por feature y los refactors graduales a TypeScript, la arquitectura real de Lumapse ya puede describirse a partir de límites estables. Era necesario formalizarla para evitar tres ambigüedades en el informe y la defensa:

1. confundir el origen PWA con el producto Android vigente;
2. afirmar una arquitectura teórica que el código no implementa, como MVC estricto o microservicios;
3. nombrar patrones sin evidencia concreta o exagerar su grado de implementación.

## Opciones consideradas

| Opción | Evaluación |
|---|---|
| MVC estricto | No coincide con el código: no existen controladores formales y las responsabilidades se coordinan entre componentes, store y servicios. |
| Clean Architecture estricta | La dirección general de dependencias es compatible, pero algunos componentes consumen servicios directamente y no existe un sistema completo de puertos/casos de uso. |
| Microservicios | Inadecuado para una aplicación local, unipersonal y offline; agregaría despliegue y comunicación innecesarios. |
| **Monolito modular cliente por capas** | Describe el artefacto desplegado y los límites reales sin atribuir propiedades inexistentes. |

## Decisión

Definir Lumapse como un **monolito modular cliente, offline-first, con arquitectura por capas pragmática y organización de UI por feature**.

La aplicación se entrega como una unidad Android, pero separa las siguientes responsabilidades:

1. **Composición:** `src/main.js` inicializa persistencia, crea vistas y conecta dependencias.
2. **Presentación:** `src/components/`, `src/layout/` y `src/styles/` implementan interacción y renderizado.
3. **Estado:** `src/store/` centraliza estado observable y coordinación de la interfaz.
4. **Aplicación y dominio:** `src/services/` y `src/domain/` contienen flujos, reglas, validaciones y contratos.
5. **Persistencia:** `src/services/sqlite/` encapsula conexión, esquema, transacciones y acceso SQL.
6. **Integraciones nativas:** adaptadores específicos traducen plugins Capacitor a operaciones del producto.

La infraestructura no debe depender de la UI. La UI puede usar el store o un servicio de aplicación cuando el flujo no requiere estado global. A su vez, el store combina dos rutas vigentes: accede directamente a módulos SQLite para las operaciones centrales de notas y utiliza servicios para materias y fechas académicas. Esta concesión es deliberada y describe una arquitectura por capas pragmática, no una regla estricta que el código todavía no cumple.

## Inventario canónico de patrones y enfoques

La clasificación distingue patrones aplicados con evidencia directa de analogías parciales o enfoques de organización. Este inventario es la referencia canónica para el diagrama de componentes, el informe y la defensa.

| Patrón o enfoque | Clasificación | Decisión de uso |
|---|---|---|
| Composition Root | Aplicado | Concentrar inicialización y cableado principal en `src/main.js`. |
| Observer / Publish-Subscribe | Aplicado | Propagar cambios del store a los componentes mediante suscripción y desuscripción explícitas. |
| Service Layer | Aplicado | Extraer validaciones, reglas y orquestación de los componentes y del acceso SQL. |
| Adapter | Aplicado | Aislar plugins nativos y fallbacks web detrás de operaciones entendibles por el producto. |
| Dependency Injection explícita | Aplicada en servicios seleccionados | Reemplazar efectos externos por funciones controladas durante las pruebas, sin contenedor global. |
| Fachada modular / *barrel* | Analogía parcial | Mantener puntos de entrada estables mientras responsabilidades grandes se dividen en módulos; no oculta por sí sola toda la complejidad de una fachada GoF. |
| Data Access similar a Repository | Analogía parcial | Aislar SQL y mapeo de filas sin afirmar repositorios intercambiables entre motores. |
| Command Registry | Inspirado en Command | Compartir un catálogo declarativo de acciones del editor; no implementa objetos uniformes con `execute/undo`. |
| Strategy/Policy funcional | Enfoque funcional | Seleccionar reglas mediante funciones y discriminantes, sin jerarquía de objetos Strategy. |
| Component | Enfoque de UI | Encapsular renderizado y eventos por feature, sin imponer un ciclo de vida uniforme de framework. |

Los refactors no crearon estos patrones: hicieron más explícitos contratos, dependencias y límites que ya eran observables, facilitando su identificación y verificación. Por eso la evidencia se atribuye al diseño resultante y a sus responsabilidades, no al mero cambio de extensión de JavaScript a TypeScript.

## TypeScript gradual

TypeScript se adopta de forma incremental en dominio, servicios y módulos con contratos de datos relevantes. Los módulos JavaScript maduros no se convierten solo para aumentar un porcentaje. Cada migración debe reducir un riesgo concreto, conservar comportamiento y superar la verificación automatizada. Esta política es compatible con ADR-001 y no cambia la clasificación arquitectónica.

## Consecuencias

**Positivas:**

- La descripción puede demostrarse mediante rutas y dependencias reales.
- Los límites facilitan pruebas unitarias y refactors localizados.
- Capacitor, SQLite y los servicios nativos quedan separados de la presentación.
- La terminología es precisa y defendible en un contexto académico y profesional.
- La adopción gradual de TypeScript no obliga a una reescritura de bajo valor.

**Costos y límites:**

- El store y algunas fachadas pueden crecer si no se siguen dividiendo por responsabilidad.
- La separación es convencional, no impuesta por un framework o verificador arquitectónico.
- La convivencia de JavaScript y TypeScript requiere disciplina en contratos e imports.
- La capa web existe para desarrollo y pruebas; no debe confundirse con un canal PWA soportado.

## Verificación

La correspondencia entre esta decisión y el código se documenta en [`../diagramas/arquitectura-componentes.md`](../diagramas/arquitectura-componentes.md). Toda modificación futura que altere la dirección de dependencias, introduzca un backend o cambie la unidad de despliegue requiere revisar este ADR o crear uno que lo reemplace.
