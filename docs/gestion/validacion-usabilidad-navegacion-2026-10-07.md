# Validación acotada de usabilidad y navegación — RNF-005/RNF-006

**Fecha:** 2026-10-07  
**Rama:** `test/rnf-usability-navigation`  
**Alcance:** revisión técnica de profundidad de navegación (`RNF-006`) y preparación de la prueba con usuarios (`RNF-005`)

## Objetivo y límites

Se revisó la superficie Android vigente para comprobar si las funciones principales
se alcanzan en un máximo de dos taps desde la pantalla principal. La inspección no
pretende medir adopción, éxito de uso ni tiempo a primera nota: esos resultados
requieren participantes que no fueron incorporados en esta sesión. No se cambió
el código, la versión, la firma, la instalación ni los datos de la aplicación.

## Artefacto y entorno

| Campo | Valor |
|---|---|
| Paquete | `com.lumapse.app` |
| Versión base | `0.5.0` (`versionCode 500`) |
| Compilación | Android debug · prueba privada |
| Origen mostrado en Acerca de | `348da88c89466917b1d057a5bd53a1cd0d524642` · sin cambios locales |
| Dispositivo | Samsung SM-G965F (`ad071603088c2172aa`) |
| Android / API | Android 10 / API 29 |
| Resolución de prueba | 720×1280 (override del dispositivo) |
| Densidad | 280 dpi (override del dispositivo) |

La aplicación ya contenía un borrador recuperado y notas sintéticas de validaciones
anteriores. Se conservaron sin guardar, descartar, mover, importar, exportar o
borrar. Solo se despertó la pantalla y se navegó por superficies de lectura.

## Casos ejecutados

| Caso | Ruta observada | Taps hasta el objetivo | Resultado |
|---|---|---:|---|
| NAV-01 — Crear | La pantalla principal muestra inmediatamente el editor, los campos de título/contenido y `Guardar`. | 0 | La entrada para crear está visible sin navegación adicional. No se guardó una nota nueva. |
| NAV-02 — Buscar | `Menú` → campo `Buscar notas…`; el campo recibió foco y mostró el teclado. | 2 | Acceso confirmado dentro del umbral. No se introdujo una consulta. |
| NAV-03 — Organizar por materia/sección | `Menú` → `Base de Datos`; el feed mostró la ruta `Base de Datos > Modelo relacional`. | 2 | Acceso a la organización confirmado dentro del umbral. No se modificó ninguna nota. |
| NAV-04 — Mover una nota | Menú `Opciones` de una nota → `Mover a`; se abrió la lista de destinos y quedó seleccionado visualmente el destino actual. | 2 | La acción de organización es accesible dentro del umbral. No se confirmó ningún movimiento. |

## Resultado por requisito

### RNF-006 — Evidencia de profundidad de navegación

**Resultado:** `Verificado` para el criterio de acceso a las funciones principales.
Las entradas de crear, buscar y organizar quedaron visibles o alcanzables en cero,
dos y dos taps respectivamente. Esta validación cubre la profundidad de entrada,
no la corrección completa de cada mutación ni la satisfacción de un usuario nuevo.

### RNF-005 — Tiempo a primera nota

**Resultado:** `Pendiente`. No se ejecutó una prueba con estudiantes o usuarios
nuevos y no se infiere un tiempo a partir de la navegación técnica ni de las
pruebas del autor. La métrica de ≤10 segundos permanece sin evidencia.

## Comandos y evidencia de apoyo

- `adb devices -l` — dispositivo conectado y autorizado.
- `adb shell dumpsys package com.lumapse.app` — versión `0.5.0` / `500`.
- `adb shell getprop ro.build.version.release` y `ro.build.version.sdk` — Android 10 / API 29.
- `adb shell uiautomator dump` — identificadores y textos visibles de `Menú`, `Buscar notas…`, materias y acciones de nota.
- `adb exec-out screencap -p` — capturas locales de la pantalla principal, drawer, buscador, `Acerca de` y menús de organización; no se versionan por contener estado de prueba.

## Limitaciones y siguiente paso

- La prueba no sustituye una sesión con participantes ni acredita adopción real.
- La navegación se observó sobre un debug `0.5.0/500`, no sobre un APK candidato nuevo.
- La tarea restante de este frente es coordinar la prueba acotada con estudiantes
  para `RNF-005`; no se abre otra rama hasta cerrar y revisar este PR.
