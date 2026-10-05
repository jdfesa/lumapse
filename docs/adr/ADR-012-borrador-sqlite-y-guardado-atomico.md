# ADR-012: Borrador SQLite y guardado atómico

**Fecha:** 2026-10-05

**Estado:** Aceptado; gate y Android PASS. El autor confirmó funcionamiento en el teléfono y autorizó el cierre de [PR #29](https://github.com/jdfesa/lumapse/pull/29) el 2026-10-05.

## Contexto

La [prueba de continuidad](../beta-core-validation/continuidad-2026-10-04.md)
perdió la última modificación del borrador ante SIGKILL incluso después de quitar
el debounce: `localStorage` había aceptado el texto, pero no lo recuperó al reabrir.
También reaparecieron borradores ya descartados/guardados. No se perdieron notas
finales SQLite. No se atribuye una latencia de flush calibrada a WebStorage.

## Decisión

- Guardar el único borrador del editor en `metadata`, clave
  `lumapse-editor-draft-v1`, sobre la conexión SQLite existente, en Android y web.
  Sin dependencias, cambio de schema, versión ni auto-guardado de notas finales.
- Capturar un snapshot en cada cambio, sin debounce. Reutilizar la cola y el scope
  explícito de [ADR-009](./ADR-009-propiedad-transaccional-sqlite.md); no crear otra
  conexión ni ejecutar SQL desde UI. Una promesa resuelta acredita el commit, no
  el mero envío al bridge. Fallos conservan el texto y muestran aviso; un flush
  puede reintentar el último snapshot fallido, sin duplicar escrituras pendientes.
- Antes de montar componentes, hidratar el cache desde SQLite. Solo si falta la
  fila, migrar el borrador legacy de `localStorage`; eliminarlo únicamente después
  del commit. Un error de lectura/migración bloquea el arranque recuperable. Legacy
  malformado conserva la política anterior de descartarse; SQLite inválido falla
  cerrado, sin sobrescribirlo.
- Conservar JSON `null` como marcador durable de borrador vacío. Distinguirlo de
  fila ausente evita reimportar legacy si WebStorage resucita o falla su limpieza.
  Tras migrar, SQLite es la única autoridad; no hay fallback a `localStorage`.
- Al guardar/actualizar desde el editor, confirmar nota y marcador vacío en **una
  transacción**. Si falla cualquiera de las escrituras, rollback conserva ambos.
  Otros consumidores del CRUD no limpian borradores. El refresco secundario mantiene
  el límite de [ADR-011](./ADR-011-limite-guardado-y-refresco.md).
- Guardar/descartar bloquea temporalmente los controles del editor, espera el commit
  y recién entonces limpia la UI. Un fallo conserva los campos y permite reintentar.

## Alternativas y límites

Mantener WebStorage, esperar un tiempo fijo o confiar solo en eventos de salida no
resuelve la evidencia física. Separar guardado y limpieza deja una ventana de
resurrección/duplicado; auto-guardar la nota definitiva viola RF-005.

SQLite agrega escrituras por input: se prioriza continuidad y se reutiliza la cola,
no se promete latencia CRUD ni rendimiento medido. Ningún bridge asíncrono garantiza
la última tecla si el proceso muere **antes del commit**. CON-04 debe registrar su
ventana real; SIGKILL no prueba apagado físico ni todos los cierres del sistema.
El backup ZIP sigue sin incluir borradores. La validación automatizada en SQLite en
memoria no sustituye el plugin nativo ni la aceptación del autor.
