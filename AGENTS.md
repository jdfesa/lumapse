# Instrucciones para agentes — Lumapse

**Primera acción obligatoria: leer este archivo completo.** Antes de editar código,
documentación o configuración, completar las secciones 1 a 4, en ese orden. Este
procedimiento se aplica al iniciar y al retomar una tarea, independientemente del
equipo o de la memoria disponible.

Este archivo define el inicio operativo. [CONTRIBUTING.md](CONTRIBUTING.md) reúne las
reglas de contribución; [scripts/README.md](scripts/README.md), el uso y los límites
de las herramientas. Consultar esas fuentes en lugar de duplicar sus instrucciones.

## 1. Comprobar y sincronizar el repositorio

**GitHub (`origin`) es la fuente de verdad del trabajo compartido.** Desde la raíz
del repositorio:

1. Inspeccionar `git status --short --branch`, `git branch -vv` y `git remote -v`.
2. Ejecutar `git fetch --prune origin` y consultar en GitHub los PR abiertos y el
   estado de integración de las ramas relacionadas con la tarea.
3. Ante cambios locales, commits sin publicar, divergencias o conflictos, informar
   y acordar cómo preservarlos antes de continuar. No usar `reset --hard`, `clean`,
   stash automático ni force-push para imponer el estado remoto.
4. Si existe una rama/PR pendiente del mismo objetivo, retomarla y sincronizar su
   upstream con `git pull --ff-only`. Si el pedido corresponde a otro frente,
   consultar antes de cambiar de rama.
5. Para una tarea nueva, solo con árbol limpio y sin otro frente activo, ejecutar
   `git switch main` y `git pull --ff-only origin main`. Comprobar que `main` y
   `origin/main` coincidan; crear la rama de tarea recién en la
   [sección 4](#4-acordar-el-objetivo-y-habilitar-la-edición).

Si no se puede consultar GitHub o completar la sincronización, informar la
limitación y pedir instrucciones antes de editar. No declarar actualizado un
checkout que no se pudo verificar.

## 2. Recuperar el contexto y localizar las fuentes vigentes

1. Consultar Engram al comenzar o retomar; buscar antecedentes específicos si hace
   falta. Contrastar la memoria con GitHub, código y documentación: no asumir que
   la memoria de otro equipo está sincronizada.
2. Leer [CONTRIBUTING.md](CONTRIBUTING.md), el mapa de
   [docs/README.md](docs/README.md), [TODO](TODO) y las secciones pertinentes de
   [BACKLOG.md](BACKLOG.md).
3. Seguir desde allí el hito y el plan aceptados. Leer requisitos, ADR y evidencia
   técnica según el objetivo; no interpretar una idea del backlog como tarea aprobada.
   Ante contradicciones, informar y resolver cuál es la fuente vigente antes de actuar.

## 3. Verificar las condiciones iniciales

Leer [.nvmrc](.nvmrc), [package.json](package.json) y
[ADR-010](docs/adr/ADR-010-gate-portable-y-entorno-canonico.md). Luego seleccionar y
ejecutar los controles pertinentes de la
[guía de verificaciones iniciales](scripts/README.md#verificaciones-iniciales),
antes de editar. Comprobar la [vigencia](scripts/README.md#estado-de-las-herramientas)
y los efectos del script antes de invocarlo; no ejecutar todo el catálogo
indiscriminadamente ni usar herramientas retiradas del flujo vigente.

Registrar comando, resultado y limitaciones de cada control, distinguiendo defectos
previos de problemas del entorno. Si falla una condición necesaria para la tarea,
informar el bloqueo y acordar cómo resolverlo; no omitirlo ni ampliar el alcance para
corregirlo automáticamente. Un dashboard informativo no sustituye la comprobación de
GitHub, los controles obligatorios ni la autorización del autor.

## 4. Acordar el objetivo y habilitar la edición

Presentar al autor el estado comprobado y el
[plan acotado de la rama](CONTRIBUTING.md#plan-acotado-por-rama). Si ya existe un plan
aceptado, confirmar que el pedido sigue dentro de sus límites; no crear otro plan
paralelo ni solicitar de nuevo decisiones que no cambiaron.

Solo comenzar a editar cuando:

- El trabajo local esté preservado y la rama/base correspondiente, sincronizada.
- Las fuentes vigentes y las verificaciones iniciales necesarias estén revisadas;
  cualquier limitación relevante tenga un tratamiento acordado.
- El objetivo puntual, las exclusiones, las pruebas y la aceptación estén acordados.
- Se esté en la única rama de tarea, nunca en `main`. Para una tarea nueva, crearla
  desde la base verificada, conforme a [Flujo de trabajo](CONTRIBUTING.md#2-flujo-de-trabajo).

La preparación inicial no autoriza instalaciones, cambios de datos o publicaciones.
Respetar los [límites operativos](CONTRIBUTING.md#límites-operativos) también durante
el diagnóstico.

## 5. Ejecutar y entregar la unidad acordada

Aplicar las reglas de [commits](CONTRIBUTING.md#3-commits),
[verificación](CONTRIBUTING.md#5-verificación) y
[PR, aprobación e integración](CONTRIBUTING.md#6-pull-request).
Actualizar cada hecho en su [fuente canónica](docs/README.md#cómo-leer-la-documentación)
dentro del mismo cambio, sin reescribir evidencia histórica ni crear registros paralelos.

Al cerrar, informar cambios, pruebas realizadas, limitaciones, estado de la rama/PR y
siguiente paso pendiente. Guardar decisiones, hallazgos y resumen en Engram; los
acuerdos compartidos deben quedar también en la documentación versionada pertinente.

Mantener estas instrucciones estables y portables: no agregar historiales de sesiones,
estados de PR, versiones, rutas de un equipo, datos privados ni herramientas personales
obligatorias.
