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

## Seguimiento de la sesión 1

**2026-10-03:** inicio autorizado de RNF-002/RNF-004 en
`test/android-performance-evidence`, desde `main` limpio y sincronizado en
`8215541f66572f286d016e6a18f07d9cbc82aaf6`. GitHub confirma PR #21 y #22 integrados;
la rama local residual de PR #21 se limpió después de probar pertenencia de sus
commits al PR y ausencia de trabajo sin publicar. No se reabre la preparación PR #16.

El APK aceptado conserva la fuente
`e5becc96b032007f587fb564c7b6afd790c5faf9` y su identidad registrada en la
[checklist Android](../gestion/checklist-validacion-android.md#identificación-de-build--smoke-aceptado-de-pr-22).
El commit posterior de PR #22 solo añade documentación y su árbol coincide con el
merge actual; esto no atribuye otro origen al APK ni genera un binario nuevo.

En el entorno remoto canónico pasaron **25 regresiones Python** de fixtures/analizador
y **6 pruebas de integración SQLite en memoria**. Los dos ZIP sintéticos necesarios
se reprodujeron fuera del repositorio con los hashes históricos, sin importar al
teléfono ni modificar generador, analizador o producto. La ejecución sobre plantillas
vacías sale 0 con estado **PENDING**, no aporta latencias ni FPS.

**Lectura física aportada por el operador (2026-10-03):** Samsung SM-G965F,
Android 10/API 29, WebView 153.0.8010.36; hash del APK instalado y certificado
coinciden con el debug privado aceptado. Acerca de no se reabrió en esta lectura:
fuente/canal se apoyan en la observación anterior y el mismo hash binario. No hubo
instalación, lectura de bases personales, importación ni medición cuantitativa.

**Dependencia física pendiente:** acreditar espacio separado para 50/500, respaldo
recuperable completo y procedimiento acordado que preserve datos actuales,
borradores y papelera; comprobar inspector, opciones/overhead y límites/frames del
WebView en el equipo operador. El permiso de aislamiento y respaldo no demuestra
que esos prerrequisitos ya estén disponibles. No se adopta un cambio adicional de
sistema ni un método de captura distinto sin revisión previa.

El operador no encontró un espacio separado existente; propuso dos usuarios de
prueba y habilitar el APK existente por usuario, **sin aplicarlo** y pendiente de
aprobación del método/impacto. No se creó ni verificó un respaldo completo ni se
acordó su recuperación. Se observó un socket de depuración WebView, pero no se pudo
verificar el inspector manual: la política del navegador bloqueó la apertura de
`chrome://inspect`. No se usan superficies alternativas, CDP ni ejecución indirecta
para evitar ese rechazo. Se requiere comprobación manual del propietario; el socket
no acredita captura fiable ni identifica límites/frames.

No se recibieron trazas, calentamientos ni muestras físicas para esta sesión.
RNF-002/RNF-004 siguen **PENDING**; no hay otro PR de preparación ni cierre F3.
La sesión 2 RNF-009/RNF-010 no se inicia. La próxima acción es aportar la comprobación
de esos prerrequisitos y, solo si pasan, la captura manual del protocolo existente.

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
las muestras/dispositivo F3 siguen **PENDING**.
