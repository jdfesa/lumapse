# RNF-010 — Continuidad del borrador, 2026-10-04

**Unidad autorizada:** CON-01–04 en creación/edición, captura inmediata y regresiones,
en `test/android-draft-continuity`, desde `b646571`. Sin auto-guardado de notas,
cambio de schema/dependencias/versión, mediciones CRUD/FPS ni release.

## Diagnóstico físico — APK anterior a la corrección

Host Linux conectado por USB al Samsung SM-G965F, Android 10/API 29, WebView
`153.0.8010.36`, root autorizado. APK debug privada `0.5.0/500`, fuente en Acerca
`e5becc96b032007f587fb564c7b6afd790c5faf9`, sin cambios locales; **no es el HEAD
de esta rama**. Identidad reconsultada:

- APK SHA-256: `599d507f9e2e2b70f90921ec1d9459458f522f6f566d93ee8e29e2c8e15a4f57`.
- Certificado SHA-256: `5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`.

Modo avión, Wi-Fi/datos apagados. Entradas y botones mediante DOM del WebView
inspeccionado, sin llamar servicios ni escribir SQL; repetición crítica adicional
mediante `adb shell input text Z`, evento nativo `isTrusted=true`. Terminación:
SIGKILL root al PID principal, cmdline comprobado, proceso ausente y nuevo PID al
reabrir. **Simulación abrupta deliberada**, no prueba de apagado ni de todos los LMK.

| Caso en el APK anterior | Creación | Edición | Observación |
|---|---|---|---|
| CON-01: otra app y volver | PASS | PASS | Ajustes en primer plano; WebView oculto/visible comprobado |
| CON-02: bloquear/desbloquear | PASS | PASS | Pantalla OFF y WebView oculto comprobados |
| CON-03: esperar 1 s, terminar/reabrir | PASS | PASS | Texto, sección e identidad del borrador recuperados; nota sin guardar |
| CON-04: terminar antes de 500 ms | FAIL | FAIL | Recuperó el borrador BASE anterior, no la última escritura |
| Guardar/descartar, terminar/reabrir poco después | FAIL | FAIL | UI/localStorage limpios inmediatamente; borrador reapareció al reabrir |

CON-04 registró 195/174 ms desde entrada DOM hasta el timestamp inmediatamente
anterior al SIGKILL. La repetición **nativa** registró 281 ms: `Native baselineZ`
volvió como `Native baseline`. Estos intervalos delimitan el caso, **no son latencia
CRUD ni metrología calibrada**. Se perdió la última modificación todavía en espera
del debounce; **no las notas guardadas ni el borrador BASE ya persistido**.

Guardar creó/actualizó correctamente las notas auxiliares en SQLite. Las **80 notas
previas permanecen idénticas**, `integrity_check=ok`; quedaron dos notas sintéticas
adicionales. Red restaurada a su estado inicial y borrador de prueba descartado.
Un descarte con espera de 10 s antes del SIGKILL sí permaneció limpio; la causa de
la reaparición inmediata sigue sin confirmar. No se atribuye automáticamente al debounce.

Originales privados, sin seriales/IDs/DB/capturas en Git. SHA-256 de los resultados:
serie de 12 casos `dde3376214b823d6cc8943666fbc835ba0eff6f55c10cccb0ed3acd36cc77810`;
confirmación nativa `ac1f264abcf31283ec418c514f54d6fa0568de2247014ef42a641f1fde898f02`.

## Corrección y verificación

`EditorDraftCapture` llama al servicio existente en cada cambio, sin timer de
500 ms. Conserva las protecciones de aplicación de estado/guardado, identidad de
edición y descarte. No crea ni actualiza automáticamente la nota definitiva.
Esto elimina la espera **en la captura de la app**; no demuestra por sí solo
durabilidad física inmediata de WebStorage ni resuelve el control de reaparición.

- Referencia previa: 67 tests focalizados aprobados. Nuevas regresiones fallaron
  antes de corregir la captura (4/7); tras la corrección: **74/74** en tres archivos,
  incluyendo almacenamiento real en DOM simulado. No sustituyen Android.
- `npm run verify` pasó completo sobre esta corrección/documentación, Node
  `22.20.0`/npm `10.9.3`, con avisos preexistentes de lint/tamaño. No es CI ni Android.

## Revalidación de la captura inmediata — 2026-10-04

El autor autorizó recuperar por SSH la clave debug original; certificado compatible
comprobado. JDK 21 y caché/configuración Gradle aislados bajo `tmp/`, sin cambiar
Java global ni configuración de firma versionada. `signingReport` confirmó la firma
debug; release sin configurar. Script habitual `npm run deploy:android -- --target
<dispositivo-test>`, **sin `--clean`**, exit 0; hubo que despertar el teléfono para
completar el lanzamiento. Sin desinstalación ni borrado.

- APK debug generada e instalada, SHA-256 coincidente:
  `2ae64f9ff24e165bcf900ccc0201262c92db817503ea62327875a7df13f89699`.
- `0.5.0/500`, canal Android debug; fuente `b646571db63f66e3339908d5015d270b9822d212`
  con **cambios locales**. Certificado igual al debug anterior. Al iniciar este deploy
  ya había una APK con ese mismo hash; no se atribuye su instalación previa a esta ejecución.
- Archivo de captura probado, SHA-256:
  `6d8c739a85de31944a5acc3e9d001c59a9f9afb0363faabe7c6087ef183d00bf`.
- **CON-04 nativo, creación: FAIL**. `input text Z`, `isTrusted=true`, timestamp
  previo al SIGKILL a 255 ms del input. Antes de terminar, UI **y localStorage**
  contenían `Native baselineZ`; al reabrir ambos volvieron a `Native baseline`.
  La captura inmediata funciona, pero **no garantiza conservar el último cambio
  ante esta terminación**. No es ya una escritura esperando el debounce.
- Descarte con espera de 10 s y reapertura: PASS. Las **83 notas presentes antes
  del deploy permanecen idénticas**, `integrity_check=ok`; red restaurada y borrador
  de prueba limpio. El resto de CON/controles de limpieza no se repitió en este APK;
  los PASS de la tabla anterior pertenecen al artefacto anterior.
- Resultado privado SHA-256:
  `0ed82a51c844ce276862207ee46492428568473cdf1bc6c924b43a83fc8980b2`.

## Persistencia SQLite autorizada — 2026-10-05

El autor aprobó completar la misma unidad con SQLite, migración segura y guardado
atómico de nota/limpieza; decisión en [ADR-012](../adr/ADR-012-borrador-sqlite-y-guardado-atomico.md).
Se conserva la tabla `metadata` existente, sin nuevas dependencias ni versión.

## Revalidación SQLite — 2026-10-05

`npm run verify`: **PASS**, Node 22.20.0/npm 10.9.3, **1189 tests en 78 archivos**,
build, tipos y controles completos; avisos de complejidad/tamaño, sin errores.
Las regresiones cubren orden de capturas, migración/reintento, marcador vacío,
rollback de nota/limpieza, aviso de error y bloqueo temporal del editor.
El primer gate detectó mocks de arranque desactualizados; corregidos y gate repetido.
No se presenta este resultado local como CI ni como evidencia Android.

Deploy habitual **exit 0**, sin `--clean`, desinstalación, cambio global de runtime,
versión ni release. Mismo Samsung/Android/WebView y certificado debug del diagnóstico.
Acerca identifica `0.5.0/500`, **Android debug · prueba privada**, fuente
`dbc8940e9b46bb19f145d9c090cf506dd6ae2aaa`, **sin cambios locales**.
APK generada e instalada con SHA-256 coincidente:
`50bb5ee2f7670ddf7a6efeb9bddd470eba0be87f92691f7103ed7009ff173a71`.
Los cambios posteriores a ese commit son documentación, no otro binario.

| Caso sobre esta APK | Creación | Edición |
|---|---|---|
| CON-01: otra app y volver | PASS | PASS |
| CON-02: bloquear/desbloquear | PASS | PASS |
| CON-03: esperar 1 s, SIGKILL/reabrir | PASS | PASS |
| CON-04: última escritura, SIGKILL/reabrir | PASS (217 ms) | PASS (209 ms) |
| Descartar, SIGKILL/reabrir tras UI limpia | PASS | PASS |
| Guardar/Actualizar, SIGKILL/reabrir tras UI limpia | PASS | PASS |

- **Migración real PASS:** borrador sintético preparado en la APK anterior, restaurado
  exactamente desde SQLite al instalar encima; legacy eliminado, sin crear nota final.
  Las **83 notas previas al deploy permanecieron idénticas** en ese control.
- Serie de **12 casos PASS** en modo avión, Wi-Fi/datos apagados. Verificación de
  texto, materia/sección, identidad de edición, fila SQLite y ausencia de auto-guardado.
  Los controles de limpieza terminaron el proceso 109–192 ms después de observar UI
  limpia; fila `null` y editor limpio al reabrir, sin duplicar la nota guardada.
- Repetición **nativa PASS**, `adb shell input text Z`, `isTrusted=true`: el timestamp
  anterior al SIGKILL fue **285 ms** después de la entrada; recuperó `Native baselineZ`
  tanto en UI como en SQLite. Descarte final y nueva reapertura limpios.
- Una primera repetición nativa también recuperó el texto (216 ms), pero su runner
  terminó con error al comprobar el descarte tras una espera fija de 200 ms. La
  inspección posterior encontró UI limpia. Se corrigió **solo el runner privado**
  para esperar confirmación observable; repetición completa anterior, exit 0.
- Estado final: **84 notas**, una nueva sintética y la nota de control actualizada;
  las **82 notas no seleccionadas para edición siguen idénticas**. `integrity_check=ok`,
  borrador vacío, red restaurada. No se borraron notas para limpiar las pruebas.

Originales privados/ignorados, sin bases, capturas, seriales ni claves en Git.
SHA-256: migración `dacdb17266535dc700349cd3d4c459158f8294d0abb56a08ee10106720b5503d`;
matriz `93bb0bfa3fb5970e61968eced5d7fcb57faf54016416f41f49c4c1010471a87f`;
nativa completa `baf0d76b9d0308b772286594cdd4de787811dd29afcdc87c695c1c4ce9366e58`;
control final `73e1581c0e154449827abe99a95e2a49db999b0d934aec0c20f3f89696eaebc0`.

**Aceptación pendiente:** revisión del autor en esta APK (crear/editar, salir/bloquear,
volver, guardar/descartar y reabrir) y autorización explícita de merge del PR.
Los fallos reproducidos están corregidos en los casos ejecutados; RNF-010 conserva
estado de evidencia parcial hasta esa aceptación. No se garantiza la última tecla
si el proceso muere antes del commit: SIGKILL en estas ventanas no equivale a apagado
físico, todos los LMK ni medición CRUD. RNF-009/OFF-01–05 siguen separados.
