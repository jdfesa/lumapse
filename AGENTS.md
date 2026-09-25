# Instrucciones para agentes — Lumapse

Leer este archivo antes de modificar el repositorio, independientemente del equipo o
de la memoria disponible. Es una entrada operativa; [CONTRIBUTING.md](CONTRIBUTING.md)
contiene la guía completa. No convertirlo en un historial de sesiones o versiones.

## 1. Sincronizar antes de trabajar

**GitHub (`origin`) es la fuente de verdad del trabajo compartido.** Antes de iniciar
cambios, comprobar el estado local, las ramas y los PR; no confiar solo en Engram.

1. Inspeccionar `git status --short --branch`, `git branch -vv` y `git remote -v`.
2. Ejecutar `git fetch --prune origin` y comprobar en GitHub qué PR siguen abiertos
   y qué ramas ya fueron integradas.
3. Si hay cambios locales, commits sin publicar, divergencias o conflictos, informar
   y acordar cómo preservarlos. No usar `reset --hard`, `clean`, stash automático
   ni force-push para imponer el estado remoto sobre trabajo local.
4. Si existe una tarea/PR pendiente, retomar su rama cuando corresponda al pedido,
   sincronizando su upstream con `git pull --ff-only`; no abrir una segunda tarea.
   Si el pedido corresponde a otro frente, consultar antes de cambiar de rama.
5. Para una tarea nueva, con el árbol limpio y sin otro frente activo, ejecutar
   `git switch main` y `git pull --ff-only origin main`. Verificar que `main`
   coincida con `origin/main` antes de crear la rama de trabajo.
6. Limpiar únicamente las ramas locales/remotas cuya integración esté comprobada
   y que no contengan trabajo pendiente. Una rama remota ausente no prueba un merge;
   ante un squash o dudas, verificar el PR y sus cambios antes de borrar.

Si no se puede consultar GitHub o completar el pull, informar la limitación y pedir
instrucciones antes de iniciar cambios nuevos. No afirmar que el checkout está al día.

## 2. Ciclo de rama, commits, PR y aprobación

- Mantener **una sola rama de tarea activa**, incluida la etapa de revisión. No
  desarrollar directamente en `main` ni iniciar otro frente mientras el PR esté abierto.
- Crear la rama desde `main` actualizado: `feat/<descripcion-en-ingles>` o
  `fix/<descripcion-en-ingles>`; usar `docs/`, `refactor/`, `test/` o `chore/` cuando
  describan mejor la tarea. Usar nombres breves en inglés y kebab-case.
- Hacer commits incrementales por unidad verificable, con **Conventional Commits
  en inglés**, por ejemplo `fix(editor): preserve draft on save failure`.
- Al completar el alcance, ejecutar las verificaciones pertinentes, hacer push y
  abrir un PR hacia `main`. Título y descripción del PR en inglés; comunicación
  con el autor y documentación del proyecto en español.
- El PR debe explicar alcance, pruebas ejecutadas, limitaciones, pendientes y pasos
  para la revisión/validación Android. No presentar pruebas previstas como realizadas.
- **No hacer merge ni habilitar auto-merge sin autorización explícita del autor.**
  Esperar su revisión del PR y su confirmación de la prueba en el dispositivo cuando
  corresponda al cambio. CI verde, ausencia de comentarios o una prueba exitosa
  no constituyen por sí solos autorización de merge.
- El teléfono puede estar conectado a otro equipo. No asumir acceso local ni sustituir
  la confirmación del autor por tests web. Si falta validación, dejarla pendiente.
- Tras la autorización explícita, verificar el estado actual del PR y sus checks,
  integrar a `main`, actualizar el checkout con fetch/pull y eliminar su rama local
  y remota ya integradas. Si el autor hizo el merge, verificarlo y completar la limpieza.
  Cerrar con árbol limpio, `main` sincronizado y sin ramas residuales de esa tarea.

## 3. Qué leer y dónde registrar cada cosa

Después de sincronizar, leer [CONTRIBUTING.md](CONTRIBUTING.md), el mapa de
[docs/README.md](docs/README.md), [TODO](TODO) y las secciones pertinentes de
[BACKLOG.md](BACKLOG.md). Seguir desde allí el hito y el plan vigentes; consultar
el detalle técnico solo según el alcance de la tarea.

| Información | Fuente que consultar y actualizar cuando corresponda |
|---|---|
| Producto, alcance, RF/RNF e historias de usuario | [docs/producto/](docs/producto/README.md) |
| Decisiones de arquitectura y sus motivos | [docs/adr/](docs/adr/README.md); crear un ADR para decisiones nuevas relevantes |
| Tareas inmediatas | [TODO](TODO), sin convertirlo en un historial |
| Deuda, límites de alcance e ideas futuras | [BACKLOG.md](BACKLOG.md); una idea no equivale a una tarea aprobada |
| Planes, evidencia y aceptación del autor | [docs/gestion/](docs/gestion/README.md), el checklist/plan pertinente y [validación del núcleo](docs/beta-core-validation/README.md) |
| Cambios y versiones | [CHANGELOG.md](CHANGELOG.md), solo cuando el cambio lo amerite |
| Comandos, herramientas y flujo nativo | [scripts/README.md](scripts/README.md) y [flujo Android](docs/flujo-desarrollo-android.md) |
| Reglas estables para contribuir | [CONTRIBUTING.md](CONTRIBUTING.md); este archivo conserva solo las instrucciones esenciales y sus enlaces |

- Registrar cada hecho en su fuente canónica dentro del mismo cambio que lo origina.
  No crear documentos paralelos ni copiar estados de PR, versiones o conteos aquí.
- Consultar Engram al comenzar o retomar: contexto reciente y búsqueda específica
  cuando haga falta. Guardar decisiones, hallazgos y un resumen al cerrar la sesión.
  No asumir que la memoria de otro equipo está sincronizada: los acuerdos importantes
  también deben quedar en la documentación versionada, no únicamente en Engram.
- Contrastar recuerdos con GitHub, código y documentación vigente. Los ADR reemplazados
  y documentos históricos explican la evolución, no la arquitectura actual. Informar
  contradicciones; no inventar decisiones ni reescribir evidencia histórica.

## 4. Límites y verificación

- Lumapse es una aplicación Android offline-first con Capacitor, SQLite, módulos ES
  y TypeScript gradual. PWA/IndexedDB son antecedentes, no el producto vigente.
- Respetar el alcance del hito activo. No abrir refactors amplios, migraciones, nuevas
  dependencias o funciones postergadas sin justificar y acordar el cambio. El backup
  vigente es ZIP manual; no incorporar OAuth, Drive API ni sincronización automática
  sin una nueva decisión explícita.
- Leer [.nvmrc](.nvmrc), [package.json](package.json) y
  [ADR-010](docs/adr/ADR-010-gate-portable-y-entorno-canonico.md) antes de instalar o
  validar. Usar el runtime canónico; no modificar el runtime global para resolver
  diferencias entre equipos sin autorización.
- Para cambios de código, usar tests focalizados y `npm run verify`. Para documentación
  pura, como mínimo `npm run check:docs` y `npm run check:traceability`; comprobar también
  los enlaces de archivos nuevos si el descubrimiento del auditor no los incluye.
- Distinguir evidencia local, CI y Android. Registrar comando, resultado, limitaciones
  y, para pruebas nativas, dispositivo/artefacto y confirmación del autor. No declarar
  cerrado un requisito con métricas inferidas o con un dispositivo no probado.
- No instalar APK, reemplazar/borrar datos del teléfono, publicar releases ni manejar
  claves de firma sin autorización específica. No versionar secretos, bases personales,
  logs privados o artefactos temporales; usar las fuentes y herramientas existentes.
- Mantener estas instrucciones portables: rutas relativas al repositorio, sin nombres
  de usuario, IP, rutas de un equipo ni dependencia obligatoria de herramientas personales.
