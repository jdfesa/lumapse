# ADR-009: Propiedad transaccional explícita en SQLite

**Fecha:** 2026-09-04  
**Estado:** Propuesto; implementado en `fix/sqlite-write-coordination`, pendiente de validación Android e integración  
**Alcance:** AUD-005; complementa ADR-006 y ADR-008 sin cambiar motor, schema final ni plataforma

## Contexto

El contador global `transactionDepth` confundía operaciones async independientes con anidamiento.
Una escritura CRUD podía incorporarse a una cascada ajena, informar éxito antes de persistir y
desaparecer con el rollback de otra operación. Una cola aplicada solo a `runTransaction` no cerraba
esa entrada lateral. `persistWeb` también absorbía errores de almacenamiento.

## Decisión

- Una cola de promesas por conexión serializa transacciones independientes, escrituras CRUD y
  lecturas externas. Estas últimas no observan cambios sin confirmar de otra operación.
- `getDb()` expone una fachada limitada a `query` y `run`, nunca el objeto nativo. Cada `run`
  independiente comprende begin, escritura, commit y persistencia web dentro del mismo turno.
- `runTransaction(async scope => …)` entrega una capacidad opaca ligada a esa transacción.
  Para componer, el consumidor pasa `scope` al CRUD, a `getDb(scope)` o como segundo argumento de
  `runTransaction(action, scope)`. Las cascadas de materias aceptan `parentScope` opcional.
- Sin capacidad, la operación es independiente: no se infiere propiedad por tiempo, contador,
  pila síncrona ni estado global. Todos los consumidores actuales se adaptan explícitamente.
- Las operaciones internas deben esperarse con `await`; sus resultados son provisionales hasta
  que resuelva la propietaria. No hay commits internos. Un fallo interno, incluso capturado por
  el callback, impide confirmar parcialmente. Las capacidades expiran al terminar el callback.
- El resultado externo solo resuelve después de commit y `saveToStore` en web. El coordinador
  conserva la excepción original; el CRUD mantiene su `DatabaseError` con `originalError`, sin
  modificar el contrato emit-and-rethrow ni el canal de feedback de AUD-007.
- Un rollback exitoso tras un fallo de escritura libera la cola. Un fallo de begin, commit,
  rollback o persistencia pone la conexión en cuarentena: las operaciones pendientes rechazan
  y no reutilizan silenciosamente ese estado.
- La recuperación ocurre mediante `initDatabase`, single-flight. Antes de cerrar/reabrir,
  comprueba si la base está abierta y si hay una transacción; revierte y verifica su fin.
  Un estado no comprobable bloquea la recuperación. Esto es importante porque `jeep-sqlite`
  persiste al cerrar. No se elimina ni se recrea la base de usuario.

## Migraciones y arranque

Las migraciones consultan `PRAGMA table_info` antes de agregar columnas. La existencia comprobada
permite omitir el ALTER; cualquier fallo inesperado aborta con nombre de migración y `cause`.
Los CREATE idempotentes se conservan. El SQL permanece en `connection.js` para los checks de
schema/DBML; el modelo final no cambia.

La migración legada distingue ausencia comprobada de errores de IndexedDB. Notas y marcador se
confirman en una sola transacción; un reintento no reemplaza notas SQLite existentes.

`main.js` sigue siendo el composition root: primero prepara persistencia y datos, después monta
componentes/listeners. Un límite pequeño muestra estado accesible en español y permite reintentar
la preparación sin montar dos veces. Si falla el montaje síncrono parcial, el botón recarga la
WebView en lugar de reinstalar listeners en el mismo documento. El mensaje visible no incluye SQL,
contenidos de notas ni detalles de excepciones.

## Alternativas descartadas

- **Cola únicamente en `runTransaction`:** deja el CRUD externo dentro de la transacción ajena.
- **Contador/bandera ambiental:** no identifica a un propietario async.
- **Contexto async exclusivo de Node:** incompatible con WebView/Capacitor.
- **Conexión por operación o framework de unidad de trabajo:** mayor costo y superficie sin
  necesidad para esta aplicación local.
- **Recrear la base o ignorar errores de migración:** amenaza datos o permite iniciar con schema incompleto.

## Consecuencias y verificación

La capacidad debe propagarse explícitamente al componer operaciones. Las lecturas externas pueden
esperar a una transacción larga; no se introduce batching ni optimización N+1. Un fallo después del
commit pero antes de persistir tiene resultado incierto: se rechaza y se exige recuperación, nunca
se promete que la escritura no ocurrió ni se repite automáticamente.

Las regresiones usan promesas controladas y SQLite real en memoria, sin sleeps ni bases personales.
La evidencia y las pausas de aprobación se registran en el
[informe de AUD-005](../gestion/analisis-aud-005-coordinacion-sqlite-2026-09-04.md).
