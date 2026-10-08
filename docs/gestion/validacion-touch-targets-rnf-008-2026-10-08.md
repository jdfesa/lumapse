# Validación acotada de touch targets — RNF-008

**Fecha:** 2026-10-08 (Argentina)  
**Rama:** `fix/rnf-008-touch-targets`  
**Commits:** `1c41425` (ajuste inicial) y `9056ab2` (evita shrink del toolbar)  
**Alcance:** controles principales de crear, buscar y organizar; no es una auditoría general de accesibilidad.

## Objetivo y límites

Se verificó que los controles principales del flujo móvil tengan un área renderizada
de al menos **44×44 CSS px**, incluyendo el selector de materia y sus opciones. La
medición no cubre tipografía, contraste, foco, nombres accesibles, teclado ni los
criterios de `RNF-007` y `RNF-019` a `RNF-022`.

## Artefacto y entorno

| Campo | Valor |
|---|---|
| Paquete | `com.lumapse.app` |
| Versión base | `0.5.0` (`versionCode 500`) |
| Variante | Android debug privada, despliegue normal (sin `--clean`) |
| Fuente incrustada | `9056ab262323c0b34be19068b6858db68351247f` |
| Dispositivo | Samsung `SM-G965F` (`ad071603088c2172aa`) |
| Android / API | Android 10 / API 29 |
| Viewport WebView | 720×1238 CSS px (pantalla 720×1280, barra de estado excluida) |

El despliegue terminó con `✅ ¡Despliegue completado con éxito!` y conservó los
datos locales. La aplicación ya contenía notas, materias y un borrador de pruebas;
no se guardó, movió, importó, exportó, borró ni descartó contenido.

## Método y resultados

Se abrió el inspector local del WebView mediante `adb forward` y se midieron los
`getBoundingClientRect()` de los selectores renderizados. Se abrieron el drawer y
el selector de materia para medir también las opciones visibles.

| Superficie | Selector(es) | Resultado observado |
|---|---|---|
| Encabezado | `#btn-open-drawer`, `#btn-toggle-calendar` | 44.000×44.000 CSS px |
| Buscar y navegación | `#drawer-search-input`, `.drawer__nav-btn` | 44.000 px de alto; ancho ≥ 287 px |
| Materias | `#btn-add-subject`, `.drawer__subject-btn`, `.drawer__subject-collapse`, `.drawer__subject-action` | 44.000 px de alto; controles cuadrados 44.000×44.000 |
| Composer | `.composer__tool-btn` | 44.000×44.000 CSS px en las tres herramientas |
| Guardar y materia actual | `.composer__save-btn`, `.composer__subject-trigger` | 44.000 px de alto |
| Opciones de materia | `.composer__subject-option` (31 opciones visibles) | 262.857×44.000 CSS px cada una |

La segunda medición fue necesaria porque el `width: 44px` del toolbar podía
reducirse por `flex-shrink`; `flex: 0 0 44px` dejó el ancho efectivo en 44 px.

## Smoke manual Android

- `Menú` abrió y cerró el drawer.
- El buscador quedó visible dentro del drawer.
- El selector de materia abrió y cerró sus opciones.
- La captura final mostró el drawer y sus controles sin bloqueo ni crash.

## Resultado

**RNF-008: Verificado** para el alcance de controles principales documentado arriba.
La evidencia se limita al debug indicado y a las superficies medidas; no se extrapola
a otros controles ni a los requisitos de accesibilidad restantes.

## Limitación del navegador de escritorio

La pestaña `http://127.0.0.1:3000/` permanece en «Iniciando Lumapse…» en el navegador
de escritorio. La consola reporta un `LinkError` de `jeep-sqlite.entry.js`
(`WebAssembly.instantiate(): Import #34 "a" "I" function import requires a callable`)
durante la inicialización de SQLite. La ruta Android validada no presenta ese fallo;
la limitación del navegador queda fuera de esta corrección táctil y requiere una tarea
separada si se desea recuperar el smoke web.

## Comandos y evidencia de apoyo

- `npm run deploy:android -- --target ad071603088c2172aa` — build, sync, Gradle e instalación PASS.
- `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>` — inspector WebView.
- `getBoundingClientRect()` vía CDP — mediciones de la tabla.
- `adb shell input` / `adb exec-out screencap -p` — smoke y captura visual local; las imágenes no se versionan.
- `npm run verify` — PASS (warnings de lint y guardia de tamaño preexistentes, sin fallos).
