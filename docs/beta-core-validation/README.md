# F3 — Validación del núcleo de la beta

**Inicio:** 2026-09-14. **Estado:** preparación aceptada e integrada en [PR #16](https://github.com/jdfesa/lumapse/pull/16), `90fd21e`; F3 **sin cierre cuantitativo**, mediciones Android pendientes.
**Rama de preparación:** `docs/beta-core-validation`, eliminada local y remotamente tras el merge autorizado. No hay nueva release ni cambios productivos de esta preparación.

El 2026-09-15 el autor informó que probó en el dispositivo y aparentemente todo funciona
bien; autorizó el merge y la limpieza. Esta confirmación general no aporta muestras CRUD/FPS,
identidad/hash del APK ni resultados detallados por caso. No se completan las plantillas ni
se mejora el estado de los RNF por inferencia. El gate local y el CI de `main` integrado pasaron.

F2 fue aceptada por el autor tras probar su funcionamiento y quedó integrada en
[PR #15](https://github.com/jdfesa/lumapse/pull/15), `8e25dcd`. Se actualizó `main` a
`f9c8de0` y se eliminó su rama local; la remota ya estaba eliminada. Esta fase sigue
el [plan aceptado](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md), sin optimizar
consultas/notificaciones por intuición ni sustituir la validación del teléfono por CI.

## Evidencia de la sesión 1

**2026-10-03, hechos suministrados y cotejados en el host USB Mac:** RNF-002/RNF-004
iniciados, **sin muestras cuantitativas aceptadas**. Arch no inspeccionó los originales
ni operó el teléfono. Este PR entrega evidencia breve y retira los experimentos; no cierra F3.

### Artefacto y datos

- Samsung SM-G965F, Android 10/API 29, WebView 153.0.8010.36, usuario 0.
- Principal `com.lumapse.app`, debug `0.5.0/500`, fuente
  `e5becc96b032007f587fb564c7b6afd790c5faf9`; APK SHA-256
  `599d507f9e2e2b70f90921ec1d9459458f522f6f566d93ee8e29e2c8e15a4f57`.
- Auxiliar SDK externo de pruebas: APK SHA-256
  `43e1eb3e34669468932d2d2a0baa19d4e0ae74e5a5049deb1eafb5c8e8b81827`, fuente
  `e4bef6b5d8eca564eb48719702e0938882d67d6e`; no es producto ni un binario inferido del HEAD actual.
- La aceptación general de la APK publicada `v0.5.0` en al menos tres dispositivos
  [ya está registrada](../gestion/checklist-validacion-android.md#aceptación-general-de-la-apk-publicada-v050); no se reabre.
- Se preparó el perfil pequeño con datos sintéticos y respaldo SQLite/WAL/SHM/journal
  privado; no es backup completo de preferencias/WebStorage/borradores. **Conteo actual
  no reconsultado; perfil 500 no cargado** en esta sesión. No se presume restauración.

### Observaciones y experimentos retirados

Hubo cuatro pilotos SDK: fallos de preparación/reparaciones host y luego una captura
estructuralmente exitosa, **sin métricas aceptadas**. El sondeo readonly posterior de
SurfaceFlinger devolvió **127 triples cero en cada una de dos superficies**; no aporta
presentación ni FPS. Artemis directo observó UI sintética y guardó una nota; postguard
principal/auxiliar sin cambios de hash. Ese control funcional no certifica latencia/FPS.

Con aprobación del autor se retiran de esta entrega el capturador SDK, coordinadores,
tests experimentales y ADR de Artemis. Detalle recuperable en Git; no quedan instrucciones
activas de ese método. El launcher se preservó privadamente en Mac antes del retiro;
la instalación privada puede continuar, sin convertir Artemis en dependencia del producto.

### Exportación DevTools/WebView comprobada

Chrome no produjo exportación para el autor; **causa desconocida**, no un fallo de
seguridad demostrado. **Microsoft Edge 154.0.4258.53 sí exportó** el WebView Android;
la ausencia de vista espejo no impidió exportar. Es el método ya previsto en el [protocolo](./protocolo.md).

- Diagnóstico idle: gzip CRC/JSON PASS, **158121 B** comprimidos, SHA-256
  `bdfea13b9a4fc01dab7498beef58eaf94b08e3551d12f8b42310b9aa82039e69`;
  decodificado **763493 B / 693 eventos**, sin acciones: prueba exportación, no mediciones.
- Diagnóstico Guardar/scroll: nota preparada **antes** de Record; un Guardar, scroll y
  Stop/export. gzip CRC/JSON PASS, **3636227 B** comprimidos, SHA-256
  `614bf9f8379e26a457c4f0aa15943e99416c5e1956136729867e211e0d1e32d2`;
  decodificado **15774304 B**, SHA-256
  `413244055ca2e300ac2778a8b457b388d6088fc99a06b64937296f11c5639aa7`.
  Imágenes originales revisadas **en Mac** muestran nota sintética preparada,
  «Guardando…» y luego formulario limpio/Guardar deshabilitado/nota correcta visible.

Lo anterior corrobora Guardar funcional y exportación. Las parejas de eventos, identidades
frame/surface y capturas presentes no establecen aún entrada→**primer frame realmente
presentado con contenido correcto**, relojes/offsets, deduplicación, pérdida/completitud
ni clasificación full/partial/lost calibrada. No se usan offsets de screenshots como
latencia física ni se declara fallo de 200 ms por ellos. No se inventan timestamps de
acciones/conteo final ni se calculan FPS desde reportes o duración de captura.

**Pendiente:** 30 calentamientos + 180 CRUD a 50/500, **cada muestra ≤ 200 ms**;
3 × 10 tramos de 1 s a 500 resultados, **cada tramo ≥ 55 FPS**. Originales/hashes,
relojes/offsets/alcance/pérdidas/dedup/calibración, CSV/JSON y cotejo del autor, según
§4–5 del protocolo; no sustitutos, umbrales menores ni outliers descartados.
Originales, imágenes, contenido, seriales/IDs, DB y config permanecen privados en Mac;
no se transfirieron a Arch/Git. RNF-002/RNF-004 **PENDING**, RNF-009/RNF-010 **no iniciados**.
Revisión de este PR no autoriza otra captura, código, frente, ready, merge ni release.

## Entrega revisable

- [Protocolo](./protocolo.md): fixtures, seguridad del dispositivo, CRUD/FPS, offline y borradores.
- [Resultados y matriz incremental](./resultados-2026-09-14.md): solo hechos ejecutados; pendientes identificados.
- Plantillas vacías: [sesión](./sesion.template.json), [muestras CRUD](./crud.template.csv)
  y [frames por tramo](./frames.template.csv). Copiarlas a `tmp/` para completar la evidencia.
- [Analizador F3](../../scripts/summarize-f3-results.py): valida CSV ingresados a mano
  y resume `PASS`/`FAIL`/`PENDING`; no produce trazas ni mide el dispositivo.
- Generador existente ampliado con `f3-small` y `f3-500`; `beta-500` sigue siendo el valor por defecto.
- ZIP v1 determinista y pruebas de importación real, repetición sin duplicados, conteos y papelera separada.

## Primer análisis de una sesión física — pendiente del autor

Con el artefacto/espacio seguro acordados, revisar las trazas capturadas **manualmente**
con DevTools Performance del WebView según el [protocolo](./protocolo.md); solo con
límites de medición identificables, copiar las
plantillas sin sobreescribir evidencia existente, completar las filas y ejecutar:

```bash
mkdir -p tmp/f3/sesion-1
cp -n docs/beta-core-validation/crud.template.csv tmp/f3/sesion-1/crud.csv
cp -n docs/beta-core-validation/frames.template.csv tmp/f3/sesion-1/frames.csv
cp -n docs/beta-core-validation/sesion.template.json tmp/f3/sesion-1/sesion.json
python3 scripts/summarize-f3-results.py --crud tmp/f3/sesion-1/crud.csv --frames tmp/f3/sesion-1/frames.csv --session tmp/f3/sesion-1/sesion.json --json-output tmp/f3/sesion-1/resumen.json
```

Se puede analizar solo `--crud` o solo `--frames`; la ausencia del otro conjunto no
constituye un cero medido ni cierre F3. Conservar archivos de traza originales y sus
SHA-256, offsets, fuente de frames, CSV y JSON junto a la identidad del APK, fuente y
dispositivo. Para CRUD, `PASS` exige cinco calentamientos completos registrados por
perfil/operación además de 30 muestras válidas medidas, funcionalidad confirmada y
umbral cumplido; los calentamientos no integran las estadísticas temporales.
`calentamiento=true`, `valida=true`, `resultado_funcional=ok` y ambos conteos de notas
visibles presentes definen un calentamiento completo, sin exigir tiempo ni traza.
Las muestras medidas válidas también deben tener ambos conteos de notas visibles;
si falta cualquiera, el grupo queda `PENDING` salvo fallo medido. El resumen cuenta
las filas afectadas sin excluir sus tiempos ni ocultar fallos.
`FAIL` refleja al menos una muestra válida fuera de umbral o fallo funcional;
`PENDING` refleja evidencia insuficiente, incluidos calentamientos ausentes o
incompletos. Los errores de integridad producen exit no
cero; `FAIL`/`PENDING` estructuralmente válidos producen exit cero. La CLI **no**
captura latencias/FPS, identifica límites de traza ni cierra RNF-002/RNF-004 por sí
sola. El autor debe revisar, adjuntar evidencia y aprobar o comunicar fallas.
**No se ejecutó medición Android en este PR.**

## Qué no se afirma

Este apartado conserva los límites de la preparación original PR #16; los controles
posteriores del host USB se distinguen en la evidencia de la sesión 1.

No hay latencias Android, FPS, prueba de bloqueo/terminación ni APK nuevo en esta entrega.
No se accedió al teléfono ni a bases personales. El host Linux no tiene `adb`/Java
en PATH. RNF-002/RNF-004 siguen **pendientes**; RNF-009/RNF-010 no mejoran de estado
por generar datos o ejecutar SQLite en memoria.

La revisión de esta preparación puede hacerse ahora. Para continuar las mediciones se
necesita acordar con el autor dispositivo, APK identificable y espacio de prueba seguro.
Para un debug privado autorizado usar el deploy habitual e identificar canal/origen
y hash del APK, sin bump por cada prueba. Un candidato/entrega posterior requiere
versión/code nuevos y firma compatible; no reemplazar el asset publicado. Ver el
[flujo Android](../flujo-desarrollo-android.md#identificación-de-compilaciones-en-acerca-de).
El PR no autoriza instalación,
reemplazo de datos, merge, tag o publicación automáticos.

Una vez recibida la evidencia del teléfono, acordar un PR de seguimiento desde `main`
actualizado, solo después de cerrar la tarea que esté en revisión; no reutilizar la rama
eliminada ni abrir un segundo frente. Un fallo RNF se registra con sus muestras y cualquier
corrección se prioriza por separado. El filtro oculto quedó resuelto por PR #18
(`3898db8`); quitar los filtros visibles activos y verificar 50/500 resultados antes
de medir. El reporte de septiembre conserva la observación histórica, no reabre esa deuda.

Las próximas dos sesiones aprobadas son **RNF-002/004** y después **RNF-009/010**,
con revisión, autorización, integración y limpieza entre frentes. Seguir el
[plan vigente](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md#continuidad-aprobada--2026-10-02);
las muestras cuantitativas F3 siguen **PENDING**.
