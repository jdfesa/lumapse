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

Después de acordar artefacto/espacio seguro y capturar **manualmente** las trazas de
Chrome DevTools Performance del WebView según el [protocolo](./protocolo.md), copiar las
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
dispositivo. `PASS` exige muestras completas, funcionalidad confirmada y umbral cumplido;
`FAIL` refleja al menos una muestra válida fuera de umbral o fallo funcional;
`PENDING` refleja evidencia insuficiente. Los errores de integridad producen exit no
cero; `FAIL`/`PENDING` estructuralmente válidos producen exit cero. La CLI **no**
captura latencias/FPS, identifica límites de traza ni cierra RNF-002/RNF-004 por sí
sola. El autor debe revisar, adjuntar evidencia y aprobar o comunicar fallas.
**No se ejecutó medición Android en este PR.**

## Qué no se afirma

No hay latencias Android, FPS, prueba de bloqueo/terminación ni APK nuevo en esta entrega.
No se accedió al teléfono ni a bases personales. El host Linux no tiene `adb`/Java
en PATH. RNF-002/RNF-004 siguen **pendientes**; RNF-009/RNF-010 no mejoran de estado
por generar datos o ejecutar SQLite en memoria.

La revisión de esta preparación puede hacerse ahora. Para continuar las mediciones se
necesita acordar con el autor dispositivo, APK identificable y espacio de prueba seguro.
Si hace falta otro binario, acordar antes versión/code nuevos y firma compatible;
no reutilizar `0.5.0/500` para código distinto. El PR no autoriza instalación,
reemplazo de datos, merge, tag o publicación automáticos.

Una vez recibida la evidencia del teléfono, acordar un PR de seguimiento desde `main`
actualizado, solo después de cerrar la tarea que esté en revisión; no reutilizar la rama
eliminada ni abrir un segundo frente. Un fallo RNF se registra con sus muestras y cualquier
corrección se prioriza por separado. La deuda de filtro de fecha oculto permanece en backlog.
