# ADR-010: Gate portable y entorno canónico

**Fecha:** 2026-09-12

**Estado:** Aceptado e integrado en F1 mediante PR #14 (`7d4ceda`, 2026-09-13); evidencia de ejecución y aceptación separadas en el reporte de F1.

**Alcance:** AUD-008/AUD-009; aplica el [plan inmediato aceptado](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md), sin modificar producto, schema, dependencias ni versión.

## Contexto

El gate local y CI tenían listas distintas. Un binario Rust ignorado podía reemplazar
auditorías con otro alcance; sin él, el scanner offline rechazaba los orígenes locales
requeridos por la CSP. Además, `quality.sh` aceptaba exit 139 si encontraba un resumen
textual exitoso. Node 26 producía fallos engañosos de Web Storage, aunque el entorno
canónico registrado era Node 22.20.0/npm 10.9.3.

## Decisión

- Fijar las versiones exactas en `.nvmrc`, `engines` y `packageManager`. CI lee `.nvmrc`;
  un guardia sin dependencias verifica Node y el npm que ejecuta el lifecycle. Un
  desvío se rechaza antes de los tests. No se cambia el Node global ni se usa un workaround.
- Hacer de `scripts/quality.sh` la única lista de aceptación. `verify` delega en `quality`
  y CI llama `npm run verify`, preservando la unión de controles local/CI, incluido DBML.
- Exigir exit 0 **y** un reporte Vitest completo generado en un temporal nuevo. Comparar
  archivos con `tests/unit/**/*.test.js`, verificar aserciones y totales, rechazar omisiones,
  pendientes y `.only`. No fijar el número histórico de tests ni analizar texto para aceptar crashes.
- Usar un worker de Vitest en el gate para acotar memoria sin reducir la suite. Los tests
  de tooling usan el runner incluido en Node y fixtures temporales; no necesitan jsdom.
- Ejecutar siempre los scripts portables. Mantener Rust solo como diagnóstico externo;
  no reescribirlo ni permitir que su presencia cambie criterios o esconda controles.
- Analizar HTML con la biblioteca estándar de Python para exceptuar únicamente tokens
  `http://localhost` en `default-src`/`img-src` de una meta CSP real. Conservar el entrypoint
  Shell y detectar por separado URLs remotas, incluso en la misma línea.

## Alternativas descartadas

- Ampliar soporte a Node 26 o normalizar `NODE_OPTIONS`: amplía la matriz sin necesidad.
- Instalar Rust obligatoriamente, confiar en binarios locales o reescribir el auditor:
  añade dependencia ambiental y superficie sin resolver la lista única de controles.
- Ignorar `index.html`, toda línea con `localhost` o todos los códigos 139: oculta fallos reales.
- Docker, cambios de framework o actualizaciones de dependencias por arrastre: fuera de F1.

## Consecuencias y límites

Un pin exacto requiere actualizar deliberadamente los metadatos y su evidencia en otro
cambio revisable. Cambiar el patrón de descubrimiento de Vitest requiere actualizar también
el validador y su regresión de paridad. Los avisos históricos de lint/tamaño siguen siendo
avisos; los errores de los controles obligatorios y crashes nunca se degradan a warnings.

El scanner es estático: no reemplaza la medición de tráfico ni una prueba Android.
La aceptación del PR sigue requiriendo revisión del autor, verificación en la Mac y prueba
en el teléfono; ninguna aprobación de CI autoriza un merge automático.
