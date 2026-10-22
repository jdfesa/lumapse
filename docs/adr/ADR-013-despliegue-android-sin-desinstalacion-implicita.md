# ADR-013: Despliegue Android sin desinstalación implícita

**Fecha:** 2026-10-22<br>
**Estado:** aceptación general del autor en [PR #41](https://github.com/jdfesa/lumapse/pull/41); merge y limpieza autorizados. Integración efectiva verificable en GitHub.<br>
**Alcance:** tooling de debug, PC-11 del [precorte](../gestion/revision-precorte-2026-10-22.md#incidente-de-despliegue-y-recuperación).

## Contexto

El script anunciaba conservación de datos sin `--clean`, pero delegaba en
`cap run`/`native-run`. `native-run 2.0.3` reintenta una firma incompatible o un
downgrade mediante desinstalación previa. Ese fallback borró el workspace y el
borrador de pruebas; se recuperaron exactamente y el autor autorizó proteger el
script. El permiso sobre datos de prueba no convierte la pérdida en intencional.

## Decisión

- Compilar con Gradle y sincronizar con Capacitor, sin delegar la instalación en
  `cap run`/`native-run`.
- Verificar el APK y, si la app existe, su APK instalado con `apksigner`; comparar
  los conjuntos de SHA-256 de firmantes. Si faltan herramientas, no se puede
  leer/verificar o difieren, abortar antes de instalar en el modo normal.
- Instalar con `adb install -r -t`, comprobar éxito explícito y abrir la actividad.
  Ningún rechazo autoriza desinstalación, downgrade forzado o segundo intento.
- Mantener `--clean` como elección destructiva explícita, sujeta a permiso y
  recuperación acordados; ejecutarla solo después de compilar y verificar el APK.
- No instalar herramientas, gestionar claves privadas ni cambiar versión por
  una prueba debug. Java y Android SDK Build-Tools son requisitos comprobables.

## Alternativas descartadas

- Mantener `native-run` con una comprobación de firma previa: su fallback de
  downgrade seguiría siendo destructivo, incluso con certificados iguales.
- Modificar código dentro de `node_modules`: no es reproducible mediante `npm ci`.
- Cambiar claves o usar `--clean` para que el deploy siempre termine: amenaza
  continuidad y confunde una instalación nueva con una actualización.

## Consecuencias y límites

La instalación falla de forma conservadora en vez de intentar reparar diferencias
destructivamente. La igualdad estricta no implementa rotación de certificados ni
linajes; esos cambios requieren un flujo específico, nunca un bypass automático.
El script es tooling de desarrollo, no un actualizador incluido en el APK.

La distribución debe preservar su identidad de firma y validar actualización real
desde la beta publicada con datos/borrador. [Android documenta la continuidad de
firma requerida para actualizar](https://developer.android.com/studio/publish/app-signing).
La prueba debug no certifica ese futuro candidato ni sus migraciones.

## Verificación

[`android-deploy.test.js`](../../tests/tooling/android-deploy.test.js) caracteriza
ocho escenarios con ejecutables simulados y datos sintéticos; forma parte del gate.
El [reporte](../gestion/revision-precorte-2026-10-22.md) conserva el incidente,
recuperación, rechazo con certificados reales en un harness de solo lectura y
la actualización nativa compatible. No se ensaya un borrado sobre datos reales.
