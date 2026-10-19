# Validación acotada de navegación por teclado — RNF-020

**Inicio:** 2026-10-19 (Argentina)<br>
**Rama:** `test/rnf-020-keyboard-navigation`<br>
**Base:** `af974459976534570af399116d24253c6fc08e2e`<br>
**Estado:** en preparación; RNF-020 conserva evidencia parcial hasta completar
los recorridos y revisar sus resultados. No hay aceptación ni merge anticipados.

## Objetivo y alcance acordados

Comprobar navegación por teclado en los flujos existentes de Lumapse: entrada y
edición, búsqueda, organización, menús, calendario/fechas, Backup, Acerca de y
Papelera/confirmación sin ejecutar operaciones destructivas. Revisar Tab y
Shift+Tab, activación con Enter, Escape, foco visible, entrada/salida de paneles y
retorno del foco. Corregir únicamente barreras reproducidas, con regresiones.

El autor aprobó esta unidad, una rama, commits Conventional Commits en inglés,
push y PR para revisión. Confirmó teléfono de pruebas conectado a este equipo,
root y sin contraseña, y autorizó inspección y recorrido ADB. No dispone de teclado
físico: se registrará esa limitación, sin certificar USB/Bluetooth ni TalkBack.
Si hay correcciones, autorizó debug privado mediante el script habitual, solo con
firma compatible y datos preservados; sin desinstalar, borrar ni publicar.

Tras consultar la pertinencia para una app principalmente táctil, el autor
ratificó terminar esta unidad ya iniciada. El teclado externo se considera uso
posible y ocasional, no el modo principal ni una certificación de toda la app.

Quedan fuera RNF-019/Lighthouse, nuevas funciones, rediseños, refactors ajenos,
rendimiento, APK final y merge. No se modifican bases personales ni se importa un
fixture para obtener evidencia. Las pruebas canceladas no acreditan mutaciones.

## Método, pruebas y aceptación

1. Identificar teléfono, Android/WebView, fuente/canal, versión/code, APK y firma.
2. Registrar foco antes/después de eventos reales de teclado inyectados mediante
   ADB. La lectura del DOM por CDP sirve para observar, no sustituye Tab por
   llamadas a `focus()` ni clicks sintéticos en un recorrido acreditado.
3. Recorrer las superficies disponibles, distinguiendo preparación, recorridos
   nativos y regresiones en DOM simulado. No activar borrados ni compartir datos.
4. Reproducir cada barrera antes de corregirla y repetir su caso después. Si cambia
   la app, probar el debug autorizado identificado con firma compatible.
5. Ejecutar regresiones focalizadas, `npm run verify` si cambia la app y controles
   documentales finales; registrar resultados y límites en fuentes canónicas.

La aceptación requiere recorridos aplicables sin barreras reproducidas pendientes
en el alcance registrado, evidencia por caso y revisión del autor. Una cobertura
incompleta conserva estado parcial: no se infiere cumplimiento de un auditor
estático ni se transfiere evidencia al futuro APK final.

## Preparación comprobada

- GitHub: sin PR abiertos; PR #38 integrado. `main` limpio y sincronizado 0/0
  sobre la base indicada; rama creada desde esa base.
- Runtime existente Node 22.20.0/npm 10.9.3: `check:runtime` exit 0, sin instalación
  ni cambios globales.
- `check:docs`: exit 0, 107 Markdown/923 enlaces, cero errores.
- `check:traceability`: exit 0, cero advertencias.
- `check:a11y`: exit 0, cero avisos; no demuestra navegación por teclado.
- Diagnóstico Android inicial: un Samsung SM-G965F conectado, app debug
  `0.5.0/500` y SQLite presentes. Dos avisos de entorno por SDK/JDK no seleccionados;
  no son defectos del producto ni autorizan instalaciones.

## Resultados

Pendientes de ejecución. Este plan no acredita todavía RNF-020.
