# Revisión acotada de Lighthouse Accessibility — RNF-019

**Inicio:** 2026-10-20 (Argentina)<br>
**Rama:** `test/rnf-019-lighthouse-accessibility`<br>
**Base:** `ee55b2684c8dc94389c4d61abe1b3c9102380583`<br>
**Estado:** en preparación; no hay una medición nueva ni aceptación de resultados.

## Objetivo y alcance acordados

Resolver el tratamiento de [RNF-019](../producto/requisitos-no-funcionales.md#accesibilidad)
antes del corte de presentación, conforme al
[recorte de cierre](../../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa).
La métrica vigente es **Lighthouse Accessibility ≥90/100**. Se intentará obtener
una medición real, sin deducir un score de los controles estáticos o de las
revisiones anteriores. Si el método no es aplicable, se presentará un tratamiento
alternativo para aprobación expresa antes de reformular el requisito.

El autor autorizó esta única rama, commits Conventional Commits en inglés,
pushes y PR después de verificar. Confirmó teléfono conectado, desbloqueado,
root y datos de prueba, con permiso para probar y borrar si fuera necesario.
Se prioriza conservar el estado existente; el ZIP no recupera borradores ni
papelera. No se autorizaron merge, APK final ni publicación.

Quedan fuera nuevas funciones, rediseños, cambios de arquitectura, las métricas
CRUD/FPS, la reapertura de RNF-020 y una certificación exhaustiva de accesibilidad.
Los hallazgos se clasificarán y consultarán antes de ampliar el alcance a
correcciones de producto.

## Método previsto, pruebas y aceptación

1. Identificar la APK instalada, su fuente, canal, versión/code, hash y firma;
   contrastar su código con la rama y confirmar el dispositivo.
2. Evaluar Lighthouse real sobre la superficie existente, preferentemente con
   snapshots del WebView para conservar estado y revisar pantallas de la SPA.
   No navegar, limpiar storage ni alterar el viewport del teléfono para obtener
   un resultado favorable. Distinguir un fallo del instrumento de una barrera real.
3. Registrar escenas y temas revisados, versión de herramienta, configuración,
   scores, auditorías fallidas/incompletas, fecha y límites. No promediar escenas
   para ocultar una que no alcance el umbral.
4. Comprobar conservación de datos y borrador; restaurar las preferencias que
   cambien durante los recorridos y retirar conexiones auxiliares propias.
5. Actualizar las fuentes canónicas y repetir enlaces/trazabilidad. Si se acuerda
   un cambio de código, agregar regresiones focalizadas, ejecutar `npm run verify`
   y validar el debug correspondiente por el script habitual.

La aceptación de la medición requiere informes Lighthouse válidos, sin errores
de ejecución ocultos, y ≥90 en cada escena incluida; el score no acredita
auditorías manuales, TalkBack, interoperabilidad de teclado ni otro binario.
El tratamiento alternativo, si fuera necesario, requiere decisión del autor.
La aceptación del PR y del futuro corte no se infiere de estos controles.

Referencias primarias: [modos y snapshots de Lighthouse](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md)
y [cálculo y límites del score de accesibilidad](https://developer.chrome.com/docs/lighthouse/accessibility/scoring).

## Preparación comprobada

- GitHub sin PR abiertos; PR #39 integrado. `main` limpio y 0/0 con `origin/main`
  después de fetch/pull; rama creada desde la base indicada.
- `npm run check:runtime`: exit 0, Node 22.20.0/npm 10.9.3 existentes, sin cambiar
  el runtime global.
- `npm run check:docs`: exit 0, 108 Markdown/930 enlaces, sin errores.
- `npm run check:traceability`: exit 0, sin advertencias.
- `npm run check:a11y`: exit 0, sin avisos; no mide Lighthouse.
- `npm run doctor:android`: selección inicial sin SDK/JDK produjo dos avisos;
  seleccionados los existentes, exit 0 sin avisos. Samsung SM-G965F, Android 10,
  WebView `155.0.8059.43`, app/SQLite presentes y root comprobado.
- Lighthouse no está instalado en el entorno revisado. Se solicitó autorización
  para herramientas temporales sin modificar dependencias ni lockfile de Lumapse;
  todavía no se ejecutó la instalación.

## Resultados y aceptación

Pendientes. No se modifica todavía el estado canónico de RNF-019 ni se atribuyen
pruebas al asset publicado o al APK final.
