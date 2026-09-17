# Plan y evidencia — refrescos vecinos de escrituras confirmadas

**Estado:** en implementación en `fix/confirmed-subject-event-mutations`; pendiente de
prueba Android y aprobación del autor. **Base verificada:** `1c316cc` (`main` =
`origin/main`, árbol limpio tras `fetch`, 2026-09-16).

Este seguimiento corrige una sola familia ya caracterizada en la sección 3 de la
[validación F2](./validacion-f2-guardado-y-refresco-2026-09-13.md): SQLite confirma
una escritura, pero una lectura secundaria rechaza y la UI recibe un falso fallo de
la mutación. Reutiliza la frontera de [ADR-011](../adr/ADR-011-limite-guardado-y-refresco.md)
sin ampliar el alcance histórico de F2 ni declarar una F4 retroactiva.

## Alcance y contrato

Solo se modifican estos tres caminos:

1. `createSubject(name, color, parentSubjectId)`: después de un `INSERT` confirmado,
   devuelve la misma entidad persistida y su ID aunque `loadSubjects` falle. Esto cubre
   tanto materia raíz como sección y preserva nombre único, padre, color y forma de retorno.
2. `updateAcademicEvent(id, changes)`: después de un `UPDATE` confirmado, devuelve la
   entidad actualizada, conserva su identidad y reconcilia los caches conocidos aunque
   falle la lectura de próximas fechas.
3. `deleteAcademicEvent(id)`: después de un `DELETE` confirmado, conserva su retorno
   público actual, retira el evento de los caches conocidos y no reclasifica la eliminación.

Cada fallo de lectura deja un único aviso persistente. **Actualizar** repite solo el
loader; comparte una recuperación en curso, permite reintentar si falla o si ownership
descarta una respuesta obsoleta, y no vuelve a leer tras converger. Ninguna recuperación
repite `INSERT`, `UPDATE` ni `DELETE`. Un consumidor defectuoso del aviso tampoco cambia
el éxito de la escritura. Un fallo real de escritura mantiene el rechazo, el contrato de
error y el feedback existentes, con cero cambios persistidos.

No se fabricará un árbol parcial tras crear una materia o sección: hasta recuperar,
árbol y conteos pueden quedar pendientes de forma explícita. La reproducción histórica
de materia observó **una fila** y luego rechazo del mismo nombre por unicidad; no demostró
duplicación y no se documentará como tal.

## Matriz de pruebas

Todas las regresiones de persistencia usan una fixture SQLite en memoria fresca y cerrada
por caso, DDL/servicios/coordinador reales y consultas directas de filas/valores. Los logs
RED/GREEN quedan ignorados en `tmp/remote-codex-20260916/`.

| Camino | Normal | Escritura confirmada + lectura fallida | Escritura fallida | Recuperación y ownership | Consumidor/UI |
|---|---|---|---|---|---|
| Materia raíz | Entidad/ID, árbol y conteo | Una fila con nombre/color/padre; resuelve y avisa | Cero filas; rechazo y un error | Falla y luego converge sin otro `INSERT`; single-flight | Formulario cierra sin falso error ni reenvío |
| Sección | Entidad/ID y relación padre | Una fila hija; árbol pendiente explícito | Cero filas; contrato vigente | Recupera árbol/conteos sin otro `INSERT` | Formulario inline finaliza como confirmado |
| Editar fecha | Misma identidad, valores y caches | Fila actualizada; resuelve y avisa | Valores anteriores intactos; rechazo | Falla y converge sin otro `UPDATE`; lectura vieja no pisa caches ni cuenta como éxito | Diálogo cierra y no permite submit concurrente |
| Eliminar fecha | Retorno actual y caches sin evento | Cero filas; resuelve y avisa | Fila/caches intactos; rechazo | Falla y converge sin otro `DELETE`; lectura vieja no resucita el evento | Acción no muestra falso error |

Además deben seguir verdes las regresiones F2 de `createNote` y
`createAcademicEvent`, el canal de aviso, los consumidores directos y AUD-006.

## Fases y evidencia a completar

- [x] Preflight: `fetch`, limpieza y coincidencia de `HEAD`/`origin/main` verificadas;
  rama única creada desde `1c316cc`.
- [ ] Runtime canónico y `npm run verify` de línea base.
- [ ] Regresiones RED de los tres fallos confirmados, guardadas sin publicar un commit roto.
- [ ] `createSubject` GREEN y commit propio.
- [ ] `updateAcademicEvent` GREEN y commit propio.
- [ ] `deleteAcademicEvent` GREEN y commit propio.
- [ ] Suite focalizada, `npm run verify` completo, `git diff --check` y auditoría no
  mutante exigida por el flujo, con SHA, códigos de salida, conteos y warnings.
- [ ] CI del SHA final revisada.
- [ ] Prueba Android y aprobación del autor. Este trabajo no cierra F3 ni publica release.

## Exclusiones

No se corrigen `updateSubject`, archive/unarchive, `moveNote`, `deleteNote`, papelera ni
otras mutaciones vecinas. No cambian schema/migraciones, servicios SQLite, backup,
conteos, routing, filtros de PR #18, dependencias/lockfile, configuración o thresholds de
tests/CI, versión, arquitectura ni TypeScript. Tampoco hay optimización, instalación APK,
Android Studio, tag, release, merge o auto-merge.

## Handoff manual pendiente

Sobre el dispositivo y artefacto que acuerde el autor, sin borrar datos ni inyectar fallos
en una base real:

- [ ] Crear una materia y una sección con nombres identificables; reabrir el drawer y
  verificar jerarquía, color y conteos.
- [ ] Editar una fecha y reabrir calendario/próximas fechas; verificar mismo ID y cambios.
- [ ] Eliminar una fecha y reabrir calendario/próximas fechas; verificar que no reaparece.
- [ ] Registrar SHA de código, identidad del APK, dispositivo/Android y resultado.

La falla controlada de lectura, el aviso persistente y la recuperación de solo lectura se
validan automáticamente; un smoke normal en Android no se presenta como reproducción de
esa inyección. El merge queda a decisión del autor.
