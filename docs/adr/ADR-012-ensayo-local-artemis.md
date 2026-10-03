# ADR-012: Ensayo local de control Android con Artemis

**Fecha:** 2026-10-03

**Estado:** Ensayo de instalación autorizado por el autor. No se acepta Artemis como
método de medición ni se declara validado su control del teléfono.

**Alcance:** Tooling externo y aislado para la sesión 1 de F3; sin dependencias nuevas
de Lumapse, cambios de producto, APK, datos, umbrales o runtime global.

## Contexto

El autor propuso [google/artemis](https://github.com/google/artemis) para automatizar
el Samsung y luego autorizó instalarlo. Eligió **primero verificar localmente, sin API
ni envío de capturas**. El bloqueo de las métricas sigue siendo la correlación entre
input, resultado correcto y primera presentación real, descrita en la
[evaluación de F3](../beta-core-validation/README.md#evaluación-del-ajuste-mínimo--frontera-de-presentación).
Automatizar un toque no demuestra esa correlación.

## Decisión para el ensayo

- Fijar el checkout oficial a `351ca8422f7b5b54e80a9c1ce03a222e02415b6b`, con su
  `uv.lock` intacto. Checkout, entorno Python, cachés y evidencia quedan en `tmp/`,
  ignorado; no se incorporan dependencias instaladas ni artefactos privados a Git.
- Usar el Python 3.14.6 **ya existente** y uv 0.12.23 en un bootstrap aislado;
  `uv sync --frozen --no-dev --no-python-downloads`. El primer intento falló al
  compilar `cryptography==50.0.0` (`rustc` SIGBUS). Un único reintento, con
  `CARGO_BUILD_JOBS=1` y `CARGO_PROFILE_RELEASE_OPT_LEVEL=1`, completó la instalación
  sin modificar el lockfile ni rebajar dependencias. El Node canónico de
  [ADR-010](./ADR-010-gate-portable-y-entorno-canonico.md) no cambia.
- No ejecutar `start.sh`: su flujo puede instalar herramientas y configurar reglas
  globales. No copiar las reglas externas a AGENTS ni reemplazar aprobaciones.
- Separar los servidores: `mcp_server` ofrece el **agente autónomo** y requiere
  proveedor/API para sus tareas; `artemis.mcp.adb_server` publica herramientas
  **directas** de interacción. Su arranque y catálogo se comprobaron sin claves,
  sin iniciar agentes y sin llamar herramientas del dispositivo. No se exige otra
  API para ese handshake; tampoco se ha probado aún una interacción real.
- Registrar solo el servidor directo en `.codex/config.toml` **local e ignorado**,
  con nueve herramientas permitidas y aprobación `prompt` para cada llamada.
  No se modifican otros servidores ni la configuración global. Los paths de cada
  host no pertenecen al repositorio; el formato sigue la
  [documentación de MCP de Codex](https://developers.openai.com/codex/mcp/).
- El launcher local limpia el entorno heredado, usa HOME/estado temporal aislados
  y arranca el servicio stdio sin inicializar el servicio awake. Fija
  `ARTEMIS_HELPER_AUTO_INSTALL=false` y `ARTEMIS_HIERARCHY_BACKEND=helper`:
  desactivar solo auto-install **no** impide el fallback UIAutomator2, cuyo factory
  advierte que puede instalar APK propios y desinstalar Maestro. No se permite ese
  fallback en este ensayo. No se usan root, trazado global ni ADB remoto.

## Verificación efectuada en el host USB

- Instalación aislada: exit 0, 176 paquetes; compilación de cryptography en 2 min
  18 s. `uv pip check` con caché local: exit 0, 176 paquetes compatibles.
- `artemis --help` con entorno aislado: exit 0. El checkout y lockfile oficial
  permanecen sin diferencias.
- SDK MCP: `initialize` y `list_tools` de ambos servidores, exit 0. Catálogos de
  13 herramientas directas y 5 del agente; **cero llamadas a herramientas**.
  Segundo handshake del servidor directo utiliza el launcher registrado y confirma
  que las nueve herramientas permitidas existen.
- Configuración local con modo 0600; estado privado 0700. Configuración, launcher,
  logs y resultados de instalación/handshake están ignorados, no en el PR.
- `codex mcp get artemis_direct --json`: exit 0; reconoce registro stdio habilitado
  y las nueve herramientas permitidas. No prueba carga en el chat ni un diálogo
  real de aprobación, porque no se llamó ninguna herramienta; comprobar ambos
  antes de operar.
- Auditorías del repositorio con Node 22.20.0/npm 10.9.3: `npm run check:docs`
  (97 archivos / 830 enlaces), `npm run check:traceability` y `git diff --check`:
  exit 0. No equivalen a validación Android.
- `npm run verify`: exit 0, 77 archivos / 1167 tests de aplicación y 68 tests de
  tooling PASS; gate completo con sus avisos no bloqueantes. No se añadieron tests
  de producto ni se usó ese resultado para aceptar las métricas.

Esto prueba instalación e inicialización del protocolo, **no** helper instalado,
pantallas observadas, control del Samsung, pruebas funcionales ni métricas Android.
Registrar un servidor tampoco garantiza que el catálogo del chat actual ya lo haya
cargado: comprobar su conexión en el cliente antes de usarlo.

## Siguiente paso y límites

Comprobar la conexión MCP del cliente y acordar una única prueba de observación/control
sobre una pantalla sintética. Si requiere instalar/activar el APK de accesibilidad de
Artemis, identificar ese artefacto y pedir autorización específica antes de hacerlo;
no reemplazar el APK principal ni el helper de trazas de Lumapse. La instalación host
no autoriza nuevas capturas F3, CRUD, series o alteración de datos.

El checkout incluye `ArtemisAccessibilityHelper.apk`, 37 353 bytes. Su SHA-256 real
`133e373fe03615c251cd74b03a38539c844d09a074954bca2d2dde6684561969` coincide con
`helper_manifest.json`, que declara `com.artemis.helper`, 1.2.0/código 6. No se ha
validado aún su firma/permisos ni su instalación/compatibilidad en el Samsung.
Antes de cualquier operación, confirmar el dispositivo conectado y fijarlo
explícitamente en la configuración privada; no operar por selección del primer
dispositivo si hay varios.

La eventual ejecución autónoma requiere elegir proveedor, límites de pasos/coste y
destino de las capturas; no reutilizar credenciales de Codex ni asumir que su cuota
cubre esa API. El inspector de Artemis registra pasos del agente, no la traza original
de Chromium ni una prueba del primer frame presentado. RNF-002/RNF-004 permanecen
**PENDING** con el [protocolo vigente](../beta-core-validation/protocolo.md) intacto.

## Alternativas descartadas

Instalador global automático, fallback Android no revisado, tareas ilimitadas del
agente y aceptar sus duraciones como latencia CRUD/FPS. Ninguna de esas opciones
resuelve el extremo metrológico pendiente y todas amplían el impacto del ensayo.
