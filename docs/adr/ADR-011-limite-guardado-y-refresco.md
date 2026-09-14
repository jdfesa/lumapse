# ADR-011: Límite entre guardado confirmado y refresco

**Fecha:** 2026-09-13

**Estado:** Implementado en F2 conforme al plan aceptado; pendiente de revisión, prueba Android y aprobación del PR.

**Alcance:** AUD-014, exclusivamente creación de notas y fechas académicas. No modifica esquema, coordinador SQLite ni el contrato global de mutaciones/suscripciones.

## Contexto

`createNote` y `createAcademicEvent` esperaban una lectura secundaria dentro de la misma
frontera de error que la escritura. Si fallaba esa lectura, el formulario interpretaba
como fallida una creación ya persistida y permitía repetir el `INSERT` con otro ID.
Las reproducciones sobre el DDL real en SQLite en memoria están registradas en el
[plan inmediato](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md).

## Decisión

- Limitar `runStoreAction` al servicio que confirma la escritura. Un fallo allí sigue
  rechazando; un `DatabaseError` conserva su única emisión de error y el formulario/borrador.
- Mantener el resultado público como **entidad persistida**, sin cambiarlo a un booleano
  ni envolver todos los retornos del store. Aplicar la entidad a los caches conocidos.
- Ejecutar la lectura secundaria con `refreshAfterWrite`. Su fallo publica el estado
  ya persistido y emite un evento inmutable por creación con operación, ID, mensaje,
  causa y recuperación. Ni una lectura ni un consumidor del aviso reclasifican la escritura.
- La recuperación capturada solo recibe loaders: `loadSubjects` para notas y el
  refresco de próximas fechas para fechas. Comparte una promesa en curso, devuelve
  `false` si falla/se descarta por ownership y permite repetir; tras éxito devuelve
  `true` sin volver a leer. No contiene una acción de escritura ni emite avisos nuevos.
- Conservar las versiones de solicitudes y la revisión de mutaciones de AUD-006.
  Una recuperación académica obsoleta no se cuenta como actualización aplicada.
- Conectar el canal en `main` con un aviso persistente de UI, distinto del error:
  **Actualizar** repite lecturas y **Cerrar aviso** solo retira el mensaje. El store
  no importa `Toast`. El arranque normal vuelve a leer datos si se cerró el aviso.
- `NoteEditor` ya limpia el borrador después de recibir una entidad. El diálogo usa
  además un guard explícito de guardado/cierre, no solo un botón deshabilitado;
  no acepta otro submit ni cancelación durante el guardado.

## Alternativas descartadas

- Rechazar igualmente o pedir que se guarde otra vez: mantiene la ambigüedad y duplicados.
- Silenciar la recarga: deja conteos/caches pendientes sin feedback ni recuperación.
- Borrar la entidad como compensación: deshace datos confirmados para acomodar la UI.
- Reescribir todas las mutaciones, suscripciones o resultados: excede el alcance aceptado.
- Reintentos automáticos de escritura o recargas sin fin: agregan riesgo y trabajo oculto.

## Consecuencias y límites

Los conteos/próximas fechas pueden quedar temporalmente desactualizados; la entidad
confirmada y su ID siguen disponibles, y el aviso permite converger sin otro `INSERT`.
Cada aviso pertenece a una creación; cerrar un aviso no prueba que se recuperó la lectura.
Una recarga normal puede actualizar datos antes de pulsar el aviso: repetir la lectura
sigue siendo seguro, sin una nueva escritura. No se cambia el orden global de loaders.

El límite se aplica solo a los dos caminos cubiertos. Crear materias y editar/eliminar
fechas conservan ambigüedades confirmadas, documentadas como seguimiento separado en
el [reporte F2](../gestion/validacion-f2-guardado-y-refresco-2026-09-13.md). Otras acciones
vecinas solo fueron inspeccionadas estáticamente, no se declaran corregidas.

Los tests de UI con store/SQLite reales en memoria no validan el plugin nativo. La
prueba en el teléfono y la aprobación explícita siguen siendo condición del merge.
