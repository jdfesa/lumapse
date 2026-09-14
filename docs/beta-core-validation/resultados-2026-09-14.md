# Resultados F3 — Preparación local, 2026-09-14

**Estado:** evidencia local reproducible; dispositivo/artefacto y mediciones Android
pendientes. **F3 sin cerrar.** No se asignan tiempos o FPS a pruebas no ejecutadas.

## Identidad y alcance

- Base sincronizada: `f9c8de04c35c54505fb9eb1e7c5215e5c830b7c1`.
- F2 integrada por el autor: [PR #15](https://github.com/jdfesa/lumapse/pull/15),
  `8e25dcd5d6209dbe594cf1446dc7294e0048cd88`, 2026-09-14. Rama anterior eliminada.
- Checkpoints de fixtures/integración: `72b9c9b` y `f625e59` (volumen accesible por búsqueda
  y rutas explícitas); validación final de la rama se registra
  abajo y en el PR. Generador/materialización existentes de `634afd9` se reutilizan.
- Host Linux x64, Node **22.20.0**, npm **10.9.3**, sin `NODE_OPTIONS`.
  Runtime oficial aislado en `tmp/toolchains/node-v22.20.0-linux-x64`, ignorado por Git;
  no se modificó/desinstaló Node global. El archivo oficial se comprobó contra
  `SHASUMS256.txt`: `00bbd05e306ea68b6e13e17360d0e2f680b493ef95f2fea1c4296ff7437530bc`.
- El sandbox impide al guardia consultar npm mediante subproceso: fuera de esa
  restricción el entorno canónico se verificó correctamente. No es interferencia de Node 26.
- Sin ADB/Java en PATH, acceso a Mac/dispositivo, instalación, lectura de SQLite personal,
  APK, versión nueva, tag o release. `0.5.0/500` permanece sin cambios.

## Fixtures reproducidos

Semilla `20260913`, fecha base `2026-09-13`, ZIP STORE y atributos/orden fijos.
Generar en destinos nuevos siguiendo el [protocolo](./protocolo.md). Los hashes no
incluyen ruta del checkout, reloj de ejecución ni zona horaria del host.

| Perfil / archivo | Bytes ZIP | SHA-256 |
|---|---:|---|
| Pequeño — `dataset.json` | — | `47d8a7f3f1cfefdd3711748fc55e74813688dc1b4e482dfda18755c16e97bb08` |
| Pequeño — ZIP | 79.627 | `8c225aa5779cad6f3ef305183bddaa1c7a2ecb340948588b7f7cf6ccd645e097` |
| 500 — `dataset.json` | — | `8e0779d56655cafd012ecde4d732d3fcc1cbadf624216a811365b11704add6a2` |
| 500 — ZIP | 547.091 | `4f331b1f96766d190dbd44125b6d43bbf9add68d5e7c8f420748be85cf4218f9` |
| `beta-500` anterior — `dataset.json`, sin cambio | — | `23b0ac9328019fd183ca8d995c1cb61f0f65202bff227ae212ec05f8bd0748d8` |

En ambos F3 hay 10 materias, dos secciones por materia y 20 fechas; 50/500 activas,
18 archivadas y 12 eliminadas adicionales en el JSON. Los ZIP contienen 68/518 notas,
no las eliminadas. Las pruebas de integración generan la papelera por el store con
12 auxiliares distintas y conservan 50/500 activas. No se confunde ese camino con
restauración exacta del snapshot ni con evidencia de importación Android.

## Verificaciones ejecutadas

| Comando / evidencia | Resultado | Qué demuestra / límite |
|---|---|---|
| `python3 -m unittest discover -s scripts/tests -p 'test_fixture_scripts.py' -v` | **6 tests aprobados** | Determinismo, cuatro semillas por perfil, conteos, materialización, ZIP, rechazo de sobreescritura/fechas/dataset inválidos, ruta explícita; incluye regresión previa |
| `npm run test:tooling` | **57 tests aprobados**, también en el gate final | El wrapper ejecuta las seis regresiones Python; CI las ejecuta dentro del mismo `verify`, no un chequeo opcional |
| `npm test -- --maxWorkers=1 tests/unit/services/backup/BetaCoreFixture.integration.test.js` | **6 tests aprobados** en el checkpoint de preparación | Importador, servicios, store, coordinador y DDL productivos con SQLite en memoria; sin UI/bridge nativo |
| Generación de ambos perfiles/ZIP | **Aprobada**, hashes arriba | Carga sintética revisable, sin sobrescribir backups ni llamar ADB |
| `git diff --check` | **Aprobado** en el checkpoint | Higiene del diff, no validación funcional |

La integración comprueba preview sin advertencias, importación, reimportación sin
escrituras, filtros, fijadas, archivo y exportación productiva sin papelera. La prueba
del filtro exige 50/500 resultados también desde Entrada buscando `#` y muestra que
una fecha no coincidente los oculta hasta limpiarla. Esa precondición de UI no corrige
la deuda del filtro oculto.

El self-test Python heredado usa una copia de DDL. **No** se presenta como schema
productivo: ese límite queda cubierto adicionalmente por la integración JS, que
inicializa la conexión real contra `sql.js` y sustituye solo el plugin nativo.

### Gate completo

Primera ejecución de `npm run verify`: **exit 0**, 57 tests de tooling y **72 archivos /
1104 tests de aplicación**; reporte estructurado completo, build, typecheck y todos los
controles obligatorios aprobados. Conserva **3 warnings de lint anteriores**, sin errores.
Log: `tmp/f3-2026-09-14/verify.log`. No equivale a prueba Mac/teléfono ni a `npm ci` local
nuevo; no cambiaron dependencias o lockfile.

**Segunda ejecución, código final `f625e59` y documentación candidata:** `npm run verify`
también terminó **exit 0**, con los mismos 57 tests de tooling (ahora seis regresiones
Python dentro del wrapper), 72 archivos / 1104 tests de aplicación y todos los controles.
Log: `tmp/f3-2026-09-14/verify-final.log`. La CI del HEAD final se enlaza en el PR;
la documentación de resultados no transforma esas ejecuciones en evidencia Android.

## Conteos diagnósticos ejecutados — no latencias

Mismo resultado para perfiles pequeño y grande; medición de **una ejecución por
operación y perfil**, no las 30 muestras temporales del protocolo. Setup/importación y
callback inicial de `subscribe` excluidos. Cada fila cuenta consultas `db.query`,
escrituras `db.run` y callbacks a un suscriptor pasivo; no llamadas internas de SQLite.

| Acción aislada | Consultas | Escrituras | Notificaciones al suscriptor |
|---|---:|---:|---:|
| Crear nota | 33 | 1 | 2 |
| Editar nota | 1 | 1 | 1 |
| Mover nota | 34 | 1 | 2 |
| Enviar nota a papelera | 35 | 1 | 3 |
| `loadSubjects` | 33 | 0 | 1 |
| `getTrashItems` | 5 | 0 | 0 |

El test imprime los conteos y los verifica con aserciones; la salida local está en
`tmp/f3-2026-09-14/fixture-integration.log` y puede regenerarse con el comando anterior.
`loadSubjects`: árbol de 30 contenedores con conteos secuenciales, conteo de Entrada y
lectura de archivadas. `getTrashItems`: una nota suelta eliminada, **ninguna materia
eliminada**; su valor no caracteriza otros árboles de papelera. Los 12 casos de
papelera se comprueban en otro test independiente.

Los conteos son iguales porque se conservan 30 contenedores; **no significa igual
duración**, ni demuestra un cuello de botella, ni mide renderizado o costo del bridge.
Confirman los caminos candidatos de AUD-010/AUD-011 sin justificar todavía una
optimización. No se ejecutó `EXPLAIN QUERY PLAN` ni se añadieron índices/batching.

## Matriz incremental — Android

Fecha de revisión de pendientes: 2026-09-14. Cada fila debe completarse con fecha de
ejecución, dispositivo, SHA fuente/APK, evidencia y valor real antes de cambiar estado.
`—` significa **sin dato**, nunca cero. Los valores del host no se trasladan a esta tabla.

| Caso / requisito | Método | Dispositivo / fecha de ejecución | SHA / APK | Valor | Umbral | Estado / dependencia | Evidencia |
|---|---|---|---|---|---|---|---|
| PRE — fixture Android | Importar/reimportar y verificar conjunto filtrado (§3) | — | — | — | 50/500 visibles, sin duplicados | Pendiente: espacio de prueba autorizado | — |
| CRUD — RNF-002 | 30 muestras × 3 operaciones × 2 perfiles (§4) | — | — | — | Todas ≤ 200 ms; mediana, p95, máximo y excedencias | Pendiente: APK/dispositivo y límites temporales fiables | — |
| FPS — RNF-004 | 3 recorridos × 10 s, 500 resultados (§5) | — | — | — | ≥ 55 FPS por tramo | Pendiente: captura de frames atribuible al WebView | — |
| SQL — AUD-010/AUD-011 | Trazar consultas/notificaciones y UI (§6) | — | — | — | Diagnóstico, sin umbral inventado | Pendiente: trazas nativas; conteos Linux separados arriba | — |
| OFF-01 — RNF-009 | Crear/editar/reabrir offline (§7) | — | — | — | Sin pérdida/duplicados | Pendiente: teléfono | — |
| OFF-02 — RNF-009 | Buscar/organizar/fijar/archivar offline | — | — | — | Datos/conteos correctos | Pendiente: teléfono | — |
| OFF-03 — RNF-009 | Papelera/restauración offline | — | — | — | Auxiliares conservadas/restauradas | Pendiente: teléfono | — |
| OFF-04 — RNF-009 | Fechas offline | — | — | — | Fecha y relación correctas | Pendiente: teléfono | — |
| OFF-05 — RNF-009 | Backup/importación local sin red | — | — | — | Sin duplicados, ZIP legible | Pendiente: espacio autorizado | — |
| CON-01 — RNF-010 | Borradores nuevo/edición, cambio de app | — | — | — | Pérdida = 0 | Pendiente: teléfono | — |
| CON-02 — RNF-010 | Borradores nuevo/edición, bloqueo | — | — | — | Pérdida = 0 | Pendiente: teléfono | — |
| CON-03 — RNF-010 | Borradores nuevo/edición, terminar tras 1 s | — | — | — | Pérdida = 0 | Pendiente: método/autorización | — |
| CON-04 — RNF-010 | Terminación inmediata tras tecleo | — | — | — | Pérdida = 0; registrar ventana observada | Pendiente: método/autorización | — |

## Handoff y decisión pendiente

1. Revisar el PR y sus pruebas; no atribuir a esta entrega una APK inexistente.
2. Acordar dispositivo/espacio seguro, artefacto y versión/code/firma si hay nuevo build.
3. Ejecutar el protocolo, adjuntar muestras/trazas con hash y completar esta matriz en
   la misma rama. Conservar fallos y límites, sin optimizar sobre suposiciones.
4. El autor prueba/valida y autoriza expresamente el merge; después sincronizar `main`
   y eliminar solo la rama integrada. Hasta entonces no abrir otra rama.

El cierre editorial/visual, las pruebas con estudiantes y los demás RNF siguen fuera
del alcance de esta preparación. La deuda UX de fecha oculta y las ambigüedades de
refresco vecinas registradas en F2 siguen abiertas y no se declaran resueltas.
