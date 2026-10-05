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

**Pendiente de la misma rama:** acordar la corrección de persistencia durable y
limpieza Android; cualquier cambio de backend/arquitectura requiere decisión y ADR
antes de implementarlo. Después, regresiones, CON-01–04 y Guardar/Descartar sobre
APK identificada y revisión del autor. **RNF-010 conserva evidencia parcial con
fallos abiertos**, sin cierre del requisito/rama; RNF-009/OFF-01–05 siguen separados.
