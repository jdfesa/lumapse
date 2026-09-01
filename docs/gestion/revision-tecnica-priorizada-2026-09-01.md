# Revisión Técnica Priorizada — 2026-09-01

**Estado:** Vigente — línea de base para remediación incremental  
**Rama original de auditoría:** `fix/note-save-integrity`  
**Commit base original revisado:** `cd60c0e` (`main`)  
**Versión de producto documentada:** `0.4.8` (Beta)  
**Alcance:** arquitectura, modularidad, seguridad, persistencia, estado, asincronía, pruebas, dependencias y tooling

---

## 1. Objetivo

Registrar la revisión técnica realizada sobre el código vigente de Lumapse y convertir sus
resultados en un backlog verificable. El análisis prioriza correcciones con impacto directo en
integridad de datos, seguridad y confiabilidad antes de abordar optimizaciones o refactors
estructurales.

Este documento representa la fase de análisis. Su incorporación a la rama no implica que todos
los hallazgos deban resolverse en un único Pull Request. Cada frente debe conservar bajo
acoplamiento, alta cohesión y una superficie de revisión acotada.

## 2. Restricciones de trabajo

- No reescribir código de producción antes de aprobar el alcance correspondiente.
- Corregir bugs reales en ramas `fix/xxx` y mejoras arquitectónicas en ramas `refactor/xxx`.
- Usar Conventional Commits exclusivamente en inglés.
- Evitar mezclar seguridad, persistencia, tooling y refactors amplios en un mismo PR.
- Mantener la arquitectura actual salvo evidencia que justifique una decisión mayor mediante ADR.
- Finalizar cada frente con pruebas, validación reproducible y una descripción de PR trazable.

## 3. Fuentes revisadas

La evaluación se realizó después de leer la documentación técnica y de producto relevante:

- [ADR-004 — Estructura de carpetas](../adr/ADR-004-estructura-carpetas.md).
- [ADR-006 — Arquitectura de persistencia SQLite](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).
- [ADR-007 — Organización por feature](../adr/ADR-007-organizacion-componentes-por-feature.md).
- [ADR-008 — Arquitectura modular y patrones](../adr/ADR-008-arquitectura-modular-y-patrones.md).
- [Arquitectura de componentes](../diagramas/arquitectura-componentes.md).
- [Secuencia de creación/edición de notas](../diagramas/secuencia-crear-nota.md).
- [Requisitos no funcionales](../producto/requisitos-no-funcionales.md).
- [Plan de mantenibilidad y tipado gradual](./plan-mantenibilidad-tipado-gradual-2026-06-12.md).
- [`BACKLOG.md`](../../BACKLOG.md), [`TODO`](../../TODO), `README.md`, guía de contribución,
  scripts de calidad y workflow de CI.

## 4. Evaluación arquitectónica

La arquitectura vigente es un **monolito cliente modular pragmático**:

1. `src/main.js` funciona como composition root.
2. `src/components/` y `src/layout/` contienen presentación y coordinación visual.
3. `src/store/` coordina estado compartido y acciones.
4. `src/services/` contiene reglas de aplicación, dominio y adaptadores.
5. `src/services/sqlite/` encapsula persistencia local.
6. `src/domain/` concentra contratos TypeScript graduales.

La dirección general de dependencias activas es razonable y no se detectó una inversión masiva
desde servicios o persistencia hacia UI. Por ello **no se recomienda** migrar a otro framework,
introducir microservicios, crear un monorepo ni imponer Clean Architecture estricta. El retorno
está en reforzar los límites ya existentes de forma incremental.

## 5. Línea de base técnica

| Verificación | Resultado de la revisión |
|---|---|
| Estado Git inicial | `main` limpio en `cd60c0e` |
| Fuentes JS/TS/CSS | 112 archivos; aproximadamente 15.473 líneas |
| ESLint | 0 errores; 4 warnings |
| TypeScript | `npm run typecheck` pasa |
| Tests | 53 archivos y 775 tests pasan con el workaround de Node 26 |
| Cobertura | 93,21% statements en el scope configurado |
| Build | Pasa con Vite 6.4.2 |
| Bundle JS gzip | 203,77 kB de 220 kB permitidos (93%) |
| Auditoría offline fallback | Falla por dos falsos positivos de `http://localhost` en el CSP |
| Dependencias | 7 vulnerabilidades reportadas por `npm audit` |

### 5.1 Advertencias ESLint vigentes

- `NoteEditor.onStateChange`: complejidad 20, máximo configurado 15.
- `NoteEditor.js`: excede el límite de líneas configurado.
- `BackupImportPlanService.ts`: excede el límite de líneas configurado.
- `BackupImportZipService.ts`: excede el límite de líneas configurado.

### 5.2 Alcance real de coverage

La medición excluye `src/main.js`, `src/components/**`, `src/layout/**`, `src/utils/**`, el servicio
legado `ImportService.js` y el barrel `NoteStore.js`. Existen tests de componentes y layout, pero
su ejecución no se refleja en el porcentaje global. El valor actual es útil para servicios y
store, no como métrica integral de toda la aplicación.

## 6. Registro priorizado de hallazgos

| ID | Prioridad | Hallazgo | Naturaleza | Estado |
|---|---|---|---|---|
| AUD-001 | P0 | Pérdida de borrador ante error SQLite | Bug confirmado | Resuelto en PR #2 |
| AUD-002 | P0 | Guardados duplicados por taps concurrentes | Bug confirmado | Resuelto en PR #2 |
| AUD-003 | P0 | Inyección HTML persistente desde campos de backup | Seguridad confirmada | Análisis revalidado; implementación pendiente |
| AUD-004 | P0 | Dependencias vulnerables, incluida DOMPurify en producción | Seguridad/tooling | Pendiente |
| AUD-005 | P1 | Propiedad global de transacciones y migraciones permisivas | Confiabilidad | Pendiente |
| AUD-006 | P1 | Resultados async obsoletos sobrescriben vista/cache reciente | Bug de concurrencia | Pendiente |
| AUD-007 | P1 | Contratos incompatibles para errores de mutaciones | Diseño/confiabilidad | Pendiente |
| AUD-008 | P1 | Gate canónico no portable y CI desalineada | Tooling | Pendiente |
| AUD-009 | P1 | Suite no reproducible en toda la versión Node declarada | Tooling | Pendiente |
| AUD-010 | P2 | Broadcasts globales y refreshes no atómicos | Escalabilidad | Pendiente de medición |
| AUD-011 | P2 | Conteos N+1 y posibles índices faltantes | Rendimiento | Pendiente de medición |
| AUD-012 | P2 | Deriva de cohesión entre features de presentación | Arquitectura | Pendiente |
| AUD-013 | P2 | Poco margen de bundle y visibilidad parcial de coverage UI | Mantenibilidad | Monitorear |

## 7. Hallazgos detallados

### AUD-001 — Pérdida de borrador ante error SQLite

**Evidencia**

- `src/store/NoteStore.errors.js:36-52`: `runStoreAction()` emite un evento de error y retorna
  `undefined` cuando recibe `DatabaseError`.
- `src/store/NoteStore.data.js:49-81`: los callbacks exitosos de `createNote()` y `updateNote()`
  tampoco retornan la nota persistida, por lo que también resuelven `undefined`.
- `src/components/note-editor/NoteEditor.js:241-285`: el editor trata cualquier resolución como
  éxito, ejecuta `draftCapture.discard()`, vacía inputs, resetea la edición y sale del modo foco.
- `src/components/note-editor/NoteEditorDrafts.js:50-58`: `discard()` elimina el borrador de
  `localStorage`.

**Impacto**

Si SQLite no guarda una creación o actualización, el usuario ve un toast pero pierde la copia
visible y el borrador persistente. Esto contradice RNF-010 y la decisión documentada en
[secuencia-crear-nota.md](../diagramas/secuencia-crear-nota.md): limpiar el borrador solo después
de persistencia definitiva exitosa.

**Recomendación**

- Hacer que `createNote()` y `updateNote()` retornen la entidad efectivamente persistida.
- Condicionar selección, limpieza y descarte del borrador a una respuesta exitosa.
- Mantener campos, contexto de edición, modo foco y botón disponible ante fallo.
- Agregar regresiones para creación y actualización fallidas.

### AUD-002 — Guardados duplicados por taps concurrentes

**Evidencia**

`NoteEditor.handleSave()` asigna `isSaving = true`, pero no comprueba el flag al entrar ni
deshabilita el botón mientras espera al store. Dos eventos rápidos pueden ejecutar dos inserts o
updates en paralelo.

**Impacto**

En móvil, una persistencia con latencia visible puede inducir al usuario a tocar nuevamente el
botón y crear notas duplicadas o actualizaciones fuera de orden.

**Recomendación**

- Aplicar single-flight mediante guard de entrada.
- Deshabilitar el botón y mostrar un estado `Guardando...` durante la operación.
- Restaurar correctamente label/estado después de error.
- Probar con una promesa controlada que dos invocaciones concurrentes producen una sola mutación.

### AUD-003 — Inyección HTML persistente desde backups

> **Revalidación vigente:** el hallazgo se volvió a comprobar sobre `main` en `376f7b6` y quedó
> desarrollado en [AUD-003 — Análisis de seguridad de importación de backups](./analisis-aud-003-seguridad-importacion-backups-2026-09-01.md).
> La evidencia confirma inyección DOM, atributos, CSS y consumo no acotado; no demostró ejecución
> JavaScript. También refuta inyección SQL, Markdown crudo y ZIP Slip con escritura arbitraria en
> el flujo actual. La implementación permanece pendiente en `fix/backup-import-security`.

**Evidencia**

- `src/domain/primitives.ts` define `EntityId`, `HexColor` y fechas como alias directos de
  `string`; los tipos no agregan validación en runtime.
- `src/services/backup/BackupImportZipService.ts:60-96` acepta cualquier texto no vacío como ID,
  fecha-hora o color.
- IDs y colores se interpolan directamente en atributos o estilos en
  `drawerSubjectsRender.js`, `drawerArchivedSubjects.js`, `TrashView.js` y `NoteList.js`.
- Una prueba jsdom temporal con un color manipulado creó un elemento HTML controlado por la
  entrada. El archivo temporal se eliminó después de obtener la evidencia.

**Impacto**

Existe inyección HTML almacenada y XSS potencial. El CSP actual reduce algunos mecanismos de
ejecución inline, pero no sustituye validación ni escape contextual. También son posibles
alteraciones visuales o del árbol DOM.

El importador carga ZIP y JSON completos en memoria sin límites de tamaño, entradas, entidades o
longitud, lo que habilita consumo excesivo de memoria mediante archivos especialmente preparados.

**Recomendación**

- Validar formato y longitud de IDs.
- Aceptar únicamente colores hexadecimales soportados.
- Validar fechas reales y longitudes de texto.
- Definir límites explícitos para archivo, tamaño descomprimido, entradas y entidades.
- Escapar todas las interpolaciones según contexto HTML/atributo/CSS.
- Agregar pruebas de seguridad en el parser y renderizadores.

### AUD-004 — Dependencias vulnerables

La auditoría encontró:

- `dompurify@3.4.2`: dependencia directa de producción con advisories de sanitización/XSS.
- `vite@6.4.2`: dependencia directa de desarrollo.
- `tar@7.5.15`, `postcss@8.5.10`, `nanoid@3.3.11`, `undici@7.25.0` y
  `brace-expansion@5.0.5`: dependencias transitivas.

Todas reportaron una corrección disponible al momento del análisis. La actualización debe hacerse
en un PR separado, revisando changelogs, lockfile, build y tests de sanitización.

### AUD-005 — Coordinación SQLite y arranque

**Transacciones**

`src/services/sqlite/connection.js:18-86` representa propiedad transaccional mediante el global
`transactionDepth`. Una operación async independiente que se intercale mientras otra transacción
está abierta puede considerarse anidada, incorporarse a esa transacción y resolver antes de un
commit o rollback que no controla.

**Migraciones**

`runMigrations()` solo diferencia el mensaje para decidir si registra warning, pero suprime tanto
errores esperados como inesperados. La aplicación puede continuar con un schema incompleto.

**Arranque**

`src/main.js` invoca `initApp()` sin manejar el rechazo. Como el shell se renderiza después de
`initDatabase()`, un error crítico puede dejar una pantalla vacía sin recuperación visible.

**Recomendación**

- Serializar escrituras de nivel superior o modelar ownership transaccional explícito.
- Conservar reutilización solo para llamadas realmente anidadas del mismo contexto.
- Fallar inicialización ante migraciones inesperadas.
- Agregar tests de operaciones intercaladas y migración fallida.
- Renderizar un estado de error de inicio con opción de reintento/diagnóstico.

### AUD-006 — Resultados async obsoletos

- `renderTrashView()` espera `getTrashItems()` y luego escribe `innerHTML` sin comprobar que la
  vista siga activa. Una respuesta tardía puede sobrescribir backup, about o feed.
- `loadAcademicEventsByMonth()` acepta cualquier respuesta completada como el mes vigente. Cambios
  rápidos del Heatmap pueden resolver fuera de orden y mostrar eventos del mes anterior.
- Las notificaciones globales aumentan la posibilidad de lecturas superpuestas de la papelera.

Aplicar tokens de request, contadores de versión o comprobaciones de vista/mes antes de mutar DOM o
estado compartido. `BackupView` ya contiene guards de destrucción que sirven como referencia.

### AUD-007 — Política inconsistente de errores

Actualmente conviven tres comportamientos:

1. `runStoreAction`: emite error y resuelve `undefined` para `DatabaseError`.
2. `updateNoteSilent`: emite error y vuelve a lanzar la excepción.
3. `NoteStore.ui`: pin/archive/status llaman SQLite directamente, rechazan sin emitir y sus promesas
   se lanzan desde `FeedActionRouter` sin `await` ni `catch`.

Después del fix prioritario debe definirse un único contrato, preferentemente un resultado
discriminado tipado o una política consistente de emitir y propagar. Adaptar todos los consumidores
en el mismo PR evita falsos éxitos y rechazos no manejados.

### AUD-008 — Gate canónico y CI

`npm run verify` delega primero en `scripts/quality.sh`. Cuando el binario Rust ignorado no está
disponible, el fallback `scripts/check-offline.sh` clasifica como dependencias externas las dos
entradas `http://localhost` requeridas por el CSP de Capacitor en `index.html`.

La CI ejecuta checks seleccionados en lugar del comando canónico y omite:

- `npm run typecheck`;
- auditoría offline;
- `check:toolchain`;
- `check:db-smoke`.

Se debe agregar una allowlist explícita y comprobable para orígenes locales, cubrirla con una
regresión y alinear CI con un único gate reproducible.

### AUD-009 — Compatibilidad Node 26

README declara Node `v22+`, mientras CI fija Node 22 y no existe archivo de versión. Con Node
`v26.7.0`, el `localStorage` experimental de Node interfiere con jsdom y el comando normal falla
48 tests. Con `NODE_OPTIONS=--no-experimental-webstorage`, los 775 tests pasan.

Opciones válidas:

- declarar y fijar Node 22 como toolchain soportado; o
- hacer el setup de Vitest independiente del global experimental y agregar Node 26 a la matriz.

La decisión debe reflejarse en README, `package.json`, archivo de versión y CI.

### AUD-010 — Broadcasts globales y refresh no atómico

El store mantiene seis suscriptores de runtime. Cada `notify()` entrega el estado mutable completo,
sin selector, comparación, batching ni transacción de estado. Feed, editor, Heatmap, próximos
eventos, drawer y alerta de papelera reaccionan aunque su slice no haya cambiado.

Inicio y restore de backup llaman secuencialmente múltiples loaders que notifican por separado.
Además, `createNote`, `moveNote` y `deleteNote` llaman loaders notificantes y luego vuelven a
notificar, generando estados intermedios y trabajo repetido.

Estrategia incremental recomendada:

1. medir renders/callbacks por flujo;
2. agregar refresh compuesto y batching atómico;
3. eliminar notificaciones redundantes;
4. introducir suscripciones por selector con igualdad;
5. evitar reemplazar el store completo sin evidencia.

### AUD-011 — N+1 e índices candidatos

`SubjectService.getSubjectTree()`, el árbol archivado y `getTrashItems()` ejecutan un conteo
secuencial por raíz/sección. También filtran la lista completa de hijos por cada raíz. Como estos
flujos se recargan después de mutaciones comunes, el costo crece con la cantidad de materias y
cruza repetidamente el bridge de Capacitor.

El schema solo define índices para fecha y materia de eventos académicos. Consultas frecuentes
filtran u ordenan por `notes.subjectId`, `notes.deletedAt`, `notes.archived`, `notes.updatedAt`,
`subjects.parentSubjectId`, `subjects.archived` y `subjects.deletedAt`.

Antes de modificar schema:

- crear un dataset reproducible de al menos 500 notas;
- medir RNF-002 y RNF-004 sobre Android;
- ejecutar `EXPLAIN QUERY PLAN`;
- reemplazar conteos por queries agrupadas y mapas;
- agregar solo los índices respaldados por medición.

### AUD-012 — Cohesión y fronteras de features

- `NoteList` funciona como renderer del feed y como router/lifecycle owner de trash, backup y about.
- `AboutView` importa `escapeHtml` desde `feed/NoteCardRenderer`.
- Existen al menos seis implementaciones de escape HTML.
- `src/services/ImportService.js` no tiene consumidor activo, está excluido de coverage e importa el
  store desde servicios, dirección contraria a la responsabilidad esperada.
- Las reglas de imports están documentadas pero no tienen verificación automatizada.

Después de los bugs prioritarios:

- extraer el routing de vistas desde el feature feed hacia layout/composición;
- centralizar helpers de presentación con escape contextual, no una sanitización universal;
- retirar el importador legado con evidencia de ausencia de consumidores;
- agregar un test liviano de fronteras de módulos.

### AUD-013 — Bundle, archivos grandes y coverage

- El JS está al 93% del presupuesto configurado; no es un fallo actual, pero deja poco margen.
- `jeep-sqlite`/WASM agrega chunks relevantes para desarrollo web aunque el producto sea Android.
- Los cuatro warnings de ESLint se concentran en editor e importación de backups.
- Coverage oculta componentes/layout/main del porcentaje, por lo que no sirve como indicador único
  de regresiones de UI.

Monitorear presupuesto por PR, mantener carga lazy donde corresponda y mejorar la visibilidad de
coverage sin convertir el porcentaje en un objetivo que incentive tests artificiales.

## 8. Primer PR recomendado y preparado

### Rama

`fix/note-save-integrity`

### Alcance propuesto

1. Retornar la nota persistida desde `NoteStore.createNote()` y `NoteStore.updateNote()`.
2. Limpiar el editor y el borrador únicamente cuando exista confirmación de éxito.
3. Preservar campos, borrador, contexto de edición y modo foco ante error.
4. Implementar single-flight y estado visual del botón.
5. Agregar regresiones de creación, actualización y concurrencia.

### Archivos previstos

- `src/components/note-editor/NoteEditor.js`.
- `src/store/NoteStore.data.js`.
- `tests/unit/components/note-editor/NoteEditor.test.js`.
- `tests/unit/store/NoteStore.data.test.js`.

### Fuera de alcance

No incluir en este PR hardening de backup, actualización de dependencias, rediseño global de
errores, transacciones SQLite, gate de calidad, batching ni refactor de NoteList.

### Criterios de aceptación

- Un fallo SQLite no elimina inputs ni borrador persistente.
- La edición permanece activa y reintentable.
- El toast se mantiene sin duplicación.
- Dos taps durante una operación pendiente generan una sola mutación.
- El flujo exitoso conserva su comportamiento.
- Lint, typecheck, tests, coverage y build pasan.
- Todo fallo basal ajeno al diff queda documentado en el PR.

### Commits sugeridos

```text
fix(editor): preserve drafts and serialize note saves
test(editor): cover failed and concurrent note saves
```

## 9. Secuencia recomendada de PRs

| Orden | Rama sugerida | Resultado esperado |
|---:|---|---|
| 1 | `fix/note-save-integrity` | Cerrado en PR #2: AUD-001 y AUD-002 |
| 2 | `fix/backup-import-security` | Revalidar y corregir AUD-003 con checkpoints aprobados |
| 3 | `fix/dependency-security` | Actualizar DOMPurify y dependencias auditadas |
| 4 | `fix/store-action-contract` | Unificar semántica de errores de mutaciones |
| 5 | `fix/sqlite-write-coordination` | Aislar transacciones y endurecer migraciones/arranque |
| 6 | `fix/async-request-ownership` | Evitar resultados obsoletos en trash y Heatmap |
| 7 | `fix/quality-gate-portability` | Unificar gate local/CI y resolver matriz Node |
| 8 | `refactor/store-batched-updates` | Refresh atómico y suscripciones más selectivas |
| 9 | `refactor/subject-query-aggregation` | Eliminar N+1 con evidencia de rendimiento |
| 10 | `refactor/content-view-routing` | Recuperar cohesión del feed y fronteras de features |

El orden puede ajustarse por riesgo operativo, pero cada rama debe preservar un alcance revisable.

## 10. Comandos y evidencia de validación

Comandos ejecutados durante la revisión:

```bash
npm ci
npm run lint
npm run typecheck
NODE_OPTIONS=--no-experimental-webstorage npm test
npm run test:coverage
npm run build
npm run check:size
npm run check:toolchain
npm run check:db-smoke
npm run check:native-dialogs
npm run check:a11y
npm run check:dbml
npm run check:docs
npm run check:traceability
npm audit
npm audit --omit=dev
bash scripts/check-offline.sh
```

Resultado consolidado:

- lint, typecheck, tests con workaround, build y checks individuales pasan;
- el fallback offline falla solo por las entradas localhost del CSP;
- el test normal en Node 26 falla por la colisión de Web Storage descrita en AUD-009;
- el working tree permaneció limpio durante el análisis;
- la rama `fix/note-save-integrity` fue publicada inicialmente en el mismo commit que `main` y este
  documento constituye su primer cambio representativo.

## 11. Limitaciones de la revisión

- No se ejecutó benchmark en dispositivo Android ni medición FPS con 500 notas.
- No se realizó una auditoría de seguridad externa o pentest completo.
- La prueba de inyección fue un caso jsdom focalizado, no una explotación end-to-end en WebView.
- Las carreras async y transaccionales se derivaron del flujo de control y necesitan regresiones
  deterministas al abordar cada fix.
- Los advisories de dependencias reflejan el lockfile y la auditoría del 2026-09-01; deben repetirse
  antes de cada actualización o release.

## 12. Decisión de cierre del análisis

Lumapse no necesita una nueva arquitectura base. Necesita cerrar primero integridad de guardado,
límites de confianza y coordinación de persistencia; después puede optimizar reactividad, queries y
cohesión de features con cambios pequeños y medidos.

La revisión inicial quedó vinculada al primer fix porque AUD-001 y AUD-002 afectaban el flujo
central del producto y presentaban la mejor relación entre impacto, riesgo y tamaño de cambio.
Ambos hallazgos se cerraron posteriormente en la PR #2. La remediación activa continúa con la
revalidación de AUD-003 en `fix/backup-import-security`; su implementación permanece pendiente de
aprobación.
