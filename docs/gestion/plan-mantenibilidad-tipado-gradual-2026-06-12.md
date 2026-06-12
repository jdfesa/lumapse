# Plan de Mantenibilidad y Tipado Gradual

> Estado: activo desde 2026-06-12.  
> Alcance: mejorar mantenibilidad, cohesion y escalabilidad del codigo sin reescrituras grandes.  
> Relacion: Hito 05, `TODO`, `BACKLOG.md`, ADR-007.

---

## 1. Objetivo

Preparar Lumapse para crecer de forma ordenada, legible para humanos y facil de asistir por IA. La meta no es "pasar todo a TypeScript" de una vez, sino introducir contratos y limites de modulo que reduzcan errores al refactorizar.

El trabajo debe preservar la prioridad del Hito 05: estabilizar, validar en Android real y preparar distribucion. Las mejoras estructurales entran solo cuando son pequenas, verificables y no agregan features nuevas.

---

## 2. Lectura Actual

- `src/components/` ya esta organizado por feature folders, pero `tests/unit/components/` todavia esta plano.
- El proyecto usa JavaScript ES modules, Vite, Vitest y ESLint. No hay toolchain TypeScript instalado todavia.
- Hay buenos candidatos de bajo riesgo para tipado o migracion gradual: `noteFilters`, `NoteTitleService`, `AcademicEventRules`, validaciones de materias y formato de backup.
- El store todavia conoce feedback visual mediante imports a `Toast`, lo que mezcla orquestacion de estado con UI.
- Los componentes grandes (`NoteEditor`, `NoteList`, `Heatmap`, `BackupView`) conviene dejarlos para el final, despues de separar responsabilidades internas y estabilizar contratos.

---

## 3. Principios

1. **Contratos antes que conversion masiva.** Primero se documentan shapes de dominio y entradas/salidas; despues se migran archivos.
2. **Modulos puros primero.** Funciones sin DOM, sin SQLite directo y con tests existentes son las mejores candidatas.
3. **Cambios chicos y reversibles.** Cada fase debe poder revisarse sola, con diff claro y verificacion local.
4. **Capas explicitas.** Persistencia, servicios de dominio, store y UI no deben mezclar responsabilidades.
5. **Bajo acoplamiento.** El store no deberia importar componentes UI; debe exponer resultados o eventos que la UI traduzca a toasts, dialogos o estados visuales.
6. **Alta cohesion.** Cada carpeta debe reunir piezas de un mismo flujo funcional, no piezas agrupadas por comodidad.
7. **Sin framework nuevo por ahora.** Svelte u otro framework queda fuera de alcance hasta que exista evidencia de que el DOM manual es el cuello de botella real.
8. **Validacion sin servidor visual.** Para estas fases bastan tests, lint, build y chequeos documentales; la prueba visual/manual queda en dispositivo real.

---

## 4. Fuera de Alcance

- Reescribir toda la app en TypeScript.
- Migrar primero componentes DOM grandes.
- Cambiar SQLite, schema o formato de backup solo por tipado.
- Introducir un framework UI nuevo.
- Agregar features durante refactors estructurales.
- Levantar servidor local como criterio de cierre de estas tareas.

---

## 5. Reglas de Convivencia JS/TS

Cuando se introduzca TypeScript, la convivencia debe ser gradual:

- JavaScript sigue siendo valido durante toda la transicion.
- TypeScript entra primero en archivos pequenos, puros y con tests.
- El typecheck debe correr sin emitir archivos (`tsc --noEmit`).
- Los tipos compartidos deben vivir cerca del dominio, no dentro de componentes UI.
- Los tipos no deben crear imports circulares ni barrels globales que oculten dependencias.
- Los componentes JS pueden consumir modulos TS a traves de imports ESM normales.
- No se debe renombrar un archivo a `.ts` si antes no hay tests que cubran su comportamiento central.

Toolchain sugerido cuando se ejecute la fase:

- Agregar `typescript` como dependencia de desarrollo.
- Crear `tsconfig.json` con `allowJs: true`, `noEmit: true`, `strict: true` y `checkJs: false` al inicio.
- Agregar script `typecheck`.
- Ampliar ESLint/Vitest para incluir `.ts` solo despues de tener el primer modulo migrado.

---

## 6. Contratos de Dominio

Primeros contratos candidatos:

| Contrato | Ubicacion sugerida | Motivo |
|---|---|---|
| `Note` | `src/domain/notes.ts` | Usado por filtros, store, SQLite, feed y editor |
| `Subject` / `SubjectTree` | `src/domain/subjects.ts` | Evita ambiguedades entre materia raiz, seccion y arbol con conteos |
| `AcademicEvent` | `src/domain/academicEvents.ts` | Conecta SQLite, servicio, store, Heatmap y listas |
| `AppState` | `src/domain/store.ts` | Documenta el shape real del estado reactivo |
| `BackupManifest` | `src/domain/backup.ts` | Hace estable el contrato restaurable del ZIP |
| `StoreErrorEvent` | `src/domain/storeErrors.ts` | Permite desacoplar errores del store y feedback UI |

Estos contratos pueden empezar como TypeScript o, si se decide postergar toolchain, como JSDoc bien ubicado. La recomendacion es sumar TypeScript cuando tambien se agregue `typecheck`, para que los contratos sean verificables y no solo decorativos.

---

## 7. Fases Propuestas

### Fase 0 - Estrategia

Estado: completada con este documento.

Criterio de cierre:

- Plan operativo documentado.
- `TODO`, `BACKLOG.md` y `CHANGELOG.md` apuntan a la estrategia.
- Las fases posteriores quedan separadas en unidades pequenas.

### Fase 1 - Espejar Tests por Feature

Estado: completada el 2026-06-12.

Reorganizar `tests/unit/components/` para reflejar `src/components/`:

```txt
tests/unit/components/
+-- academic-events/
+-- backup/
+-- common/
+-- feed/
+-- note-editor/
```

Distribucion sugerida:

- `academic-events/`: `AcademicEventTypes`, `AcademicEventDialog`, `UpcomingAcademicEvents`, `Heatmap`.
- `backup/`: `BackupView`.
- `common/`: `ConfirmDialog`.
- `feed/`: `NoteList`, `TrashView`, `FeedActionRouter`, `NoteStatus`.
- `note-editor/`: `NoteEditor`, `SlashCommandHandler`, `editorCommandRegistry`.

Criterio de cierre:

- [x] Imports relativos corregidos.
- [x] `npm test` pasa.
- [x] `npm run lint` pasa sin errores.

### Fase 2 - Desacoplar Store de Toast

Extraer el feedback visual fuera de `NoteStore.*`.

Direccion sugerida:

- Crear un emisor liviano de errores de store, por ejemplo `src/store/NoteStore.errors.js`.
- El store emite un evento de dominio con `operation`, `message` y `cause`.
- `src/main.js` o la capa de layout se suscribe y decide si muestra `showErrorToast`.
- Los tests del store verifican el evento/error emitido, no el componente `Toast`.

Criterio de cierre:

- `rg "components/common/Toast" src/store tests/unit/store` no encuentra imports directos desde store.
- Tests actuales del store adaptados.
- `npm test`, `npm run lint` y `npm run build` pasan.

### Fase 3 - Toolchain y Contratos

Introducir TypeScript sin migrar logica compleja.

Tareas:

- Agregar `typescript`.
- Crear `tsconfig.json`.
- Agregar `npm run typecheck`.
- Definir contratos de dominio iniciales.
- Documentar reglas de importacion entre `domain`, `services`, `store` y `components`.

Criterio de cierre:

- `npm run typecheck` pasa.
- No hay cambios de comportamiento.
- Los contratos cubren al menos `Note`, `Subject`, `AcademicEvent`, `AppState` y `BackupManifest`.

### Fase 4 - Migrar Modulos Puros

Migrar archivos pequenos donde TypeScript aporta claridad inmediata:

1. `src/services/AcademicEventRules.js`
2. `src/services/NoteTitleService.js`
3. `src/services/SubjectService.validation.js`
4. `src/services/backup/BackupFormat.js`
5. `src/store/noteFilters.js`
6. `src/components/academic-events/AcademicEventTypes.js`
7. `src/components/note-editor/editorTextTransforms.js`

Criterio de cierre por archivo:

- El archivo tiene tests existentes o tests agregados en la misma fase.
- No se cambia API publica salvo que el cambio este documentado.
- `npm test`, `npm run typecheck`, `npm run lint` y `npm run build` pasan.

### Fase 5 - Servicios de Dominio

Migrar servicios donde los contratos reducen errores reales:

- `AcademicEventService`.
- Servicios de backup que transforman datos.
- Capa SQLite por tabla, solo si los tipos ya estan claros.
- `SubjectService.*` despues de estabilizar contratos de arbol y cascadas.

Criterio de cierre:

- Las funciones publicas declaran entradas y salidas.
- Los errores de dominio se distinguen de errores de infraestructura.
- Tests de servicios pasan sin depender de UI.

### Fase 6 - Store

Migrar el store despues de tener servicios tipados.

Tareas:

- Tipar `AppState`.
- Separar mejor acciones, selectores y efectos.
- Evitar imports dinamicos innecesarios si ya existen limites claros.
- Mantener `NoteStore.js` como barrel si ayuda a preservar API publica.

Criterio de cierre:

- Componentes no necesitan conocer detalles internos del store.
- Las acciones del store tienen contratos estables.
- Los tests de store cubren errores y estados derivados.

### Fase 7 - Componentes Grandes

Dejar para el final:

- `NoteEditor`.
- `NoteList`.
- `Heatmap`.
- `BackupView`.

Antes de migrarlos conviene extraer helpers puros, reducir props/estado implicito y reforzar tests. TypeScript en componentes grandes debe llegar cuando el componente ya tenga fronteras internas claras.

---

## 8. Checklist para Elegir el Proximo Archivo

Un archivo es buen candidato si cumple la mayoria:

- Tiene responsabilidad unica.
- No manipula DOM directamente.
- No depende de Capacitor o SQLite directo.
- Tiene tests existentes o faciles de agregar.
- Exporta funciones estables consumidas por varios modulos.
- Sus datos tienen shape repetido en mas de una capa.
- El cambio no exige modificar UI visible.

Senales de pausa:

- Componente grande con muchas responsabilidades mezcladas.
- Archivo con efectos secundarios al importar.
- Dependencia circular posible.
- Falta de tests alrededor del comportamiento central.
- Cambio que obligaria a tocar schema, Android o UI en la misma fase.

---

## 9. Verificacion

Para cambios documentales:

```bash
npm run check:docs
npm run check:traceability
```

Para reorganizacion de tests o imports:

```bash
npm test
npm run lint
```

Para migraciones TS o cambios de codigo compartido:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Para cambios que toquen docs, rutas o ADRs:

```bash
npm run check:docs
npm run check:traceability
```

No hace falta levantar servidor local como parte de estas fases. La validacion visual/manual queda para el dispositivo Android de pruebas.

---

## 10. Orden Recomendado Inmediato

1. Desacoplar `NoteStore.*` de `Toast`.
2. Introducir toolchain TypeScript con `typecheck`.
3. Crear contratos de dominio.
4. Migrar modulos puros, uno por vez.

El mapa de tests por feature ya quedo alineado. El proximo paso reduce acoplamiento antes de tocar el store con tipos y deja los componentes grandes para cuando la base este mas clara.
