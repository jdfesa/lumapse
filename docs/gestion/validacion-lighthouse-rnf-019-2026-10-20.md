# Revisión acotada de Lighthouse Accessibility — RNF-019

**Inicio:** 2026-10-20 (Argentina)<br>
**Rama:** `test/rnf-019-lighthouse-accessibility`<br>
**Base:** `ee55b2684c8dc94389c4d61abe1b3c9102380583`<br>
**Estado:** RNF-019 verificado técnicamente para la métrica y el alcance registrados;
aceptación del PR y clasificación de las observaciones pendientes.

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
Los hallazgos se clasifican y consultan antes de ampliar el alcance a correcciones
de producto. El autor autorizó expresamente las etiquetas de los días y del
encabezado Próximas fechas, después el selector de materia de la fecha, y por
último Mover a y las dos pestañas ZIP, con regresiones y nueva validación debug.
No habilitó otras correcciones ni cambios geométricos o de estilos.

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

Referencias primarias: [modos y snapshots de Lighthouse](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md),
[cálculo y límites del score de accesibilidad](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)
y [texto visible incluido en el nombre accesible](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html).

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
- El autor autorizó herramientas temporales: Lighthouse `13.5.0` y
  `puppeteer-core 25.9.0`, instalados de forma aislada con scripts de instalación
  desactivados. No se descargó otro navegador ni se modificaron las dependencias
  o el lockfile de Lumapse.

## Método ejecutado y reproducción

Se conserva la métrica original. La API Node de Lighthouse admite snapshots de
la página actual, adecuados para pantallas y menús de una SPA. Puppeteer se conecta
al **WebView real del APK**, no a una réplica ni a un navegador de escritorio.
Las escenas definitivas se preparan mediante controles existentes y toques CDP
del WebView; la limpieza/cancelación usa los manejadores existentes. No se
presenta ese recorrido como una prueba de ergonomía o de teclado físico.

Configuración explícita: categoría `accessibility`, `defaultViewport: null`,
`screenEmulation.disabled: true`, `emulatedUserAgent: false`,
`disableStorageReset: true`, `formFactor: mobile` y `throttlingMethod: provided`.
No se navega ni se recarga la app. La altura disponible puede cambiar por el
teclado nativo; se registra, sin forzar un viewport para favorecer el score.

Reproducción con permiso del responsable del dispositivo:

1. Identificar APK, fuente, hash, certificado y WebView; guardar una referencia
   recuperable del estado. Las herramientas no forman parte del proyecto:
   instalarlas en un directorio temporal con Node/npm canónicos y las versiones
   fijadas arriba, por ejemplo `npm install --prefix ./tools --ignore-scripts
   lighthouse@13.5.0 puppeteer-core@25.9.0` dentro de ese directorio.
2. Despertar/desbloquear y poner Lumapse en primer plano. Consultar su PID y crear
   un forward ADB propio: `adb -s <dispositivo> forward tcp:9231
   localabstract:webview_devtools_remote_<PID>`. Verificar `/json/version` y
   `/json/list` en `http://127.0.0.1:9231` antes de conectar.
3. Preparar cada escena en la app, esperar su renderizado y aplicar el siguiente
   núcleo desde un `.mjs` del directorio temporal. Guardar los resultados completos
   localmente; contienen capturas, snippets y contenido, no aptos para publicarse
   sin revisión.

```js
import fs from 'node:fs'
import puppeteer from './tools/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js'
import { startFlow } from './tools/node_modules/lighthouse/core/index.js'

const browser = await puppeteer.connect({
  browserURL: 'http://127.0.0.1:9231', defaultViewport: null,
})
try {
  const page = (await browser.pages()).find(p => p.url() === 'https://localhost/')
  if (!page) throw new Error('WebView de Lumapse no encontrada')
  const flow = await startFlow(page, { flags: {
    onlyCategories: ['accessibility'], screenEmulation: { disabled: true },
    emulatedUserAgent: false, disableStorageReset: true,
    formFactor: 'mobile', throttlingMethod: 'provided',
  } })
  await flow.snapshot({ name: 'Escena y tema preparados en el dispositivo' })
  fs.writeFileSync('resultado.json', JSON.stringify(await flow.createFlowResult(), null, 2))
  fs.writeFileSync('artefactos.json', JSON.stringify(flow.createArtifactsJson(), null, 2))
} finally {
  browser.disconnect() // No cerrar el WebView ni la app.
}
```

4. Revisar `runtimeError`, errores/avisos de cada auditoría, `runWarnings`, scores
   y los resultados `Accessibility.incomplete` de los artefactos. No equiparar
   `notApplicable`, `manual` o `incomplete` con pruebas aprobadas.
5. Restaurar preferencias y vista, comparar datos/borrador y retirar únicamente
   el forward propio. El score de otra escena/binario no sustituye esta ejecución.

## Resultados

### Artefacto y entorno

| Campo | Debug previo | Debug corregido |
|---|---|---|
| Fuente | `538c906a66e9d8902596b14c260ac8544bd934c4` | `92deffdbde07b5ac6a5e9430167970bc9089de5b` |
| Versión / código | `0.5.0` / `500` | `0.5.0` / `500` |
| SHA-256 APK | `74f1d79f1e0d595fe4837851f6428faca0152c3dac07f4189c2dab221fd2c352` | `bd0f33c69e779e4623d2f5e747bf5f251778a08f49f4b7c10ef7738a94b29b41` |

- Samsung SM-G965F, Android 10/API 29, WebView `155.0.8059.43`.
- Acerca de confirma **Android debug · prueba privada**, fuente completa del debug
  corregido y **sin cambios locales**. No es el asset publicado ni el APK final.
- Hash de la APK compilada idéntico al de la copia instalada; certificado SHA-256
  conservado: `5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`.
- `npm run deploy:android -- --target <dispositivo confirmado>`: exit 0, sin
  `--clean`, bump ni publicación. SDK/JDK, caché Gradle y firma debug originales
  existentes; no se accedió a la firma de release.

### Hallazgo reproducido y corrección autorizada

La muestra previa del calendario obtuvo **100/100**, pero
`label-content-name-mismatch` falló en diez nodos: días 1–9 con texto visible
sin cero frente a una fecha ISO en el nombre, y el encabezado Próximas fechas
sin su contador visible. La auditoría tenía **peso cero** en esa versión de
Lighthouse; el score no ocultó ni descartó el hallazgo.

El autor autorizó corregir únicamente esas etiquetas. Los días incluyen ahora
el número visible y la fecha completa; el encabezado incluye título, conteo y
acción Mostrar/Ocultar. No cambian apariencia, filtros, datos ni interacciones.
Dos regresiones fallaron antes del arreglo (29 restantes pasaban) y después
pasaron los **31 tests** de los dos archivos; cubren días con/sin cero, plegado
y actualización del conteo. Commit `18cd8cc`, enviado a la rama remota.

Al ampliar los estados se confirmaron otros casos de la misma auditoría:

- Selector académico: `Sin materia` no estaba en `Seleccionar materia`.
  El nombre incluye ahora la selección visible, conservando su actualización.
  La regresión falló antes; 43 tests de tres archivos pasaron después.
  Commit `1fbe135`, enviado a la rama remota.
- `Mover a` no estaba en `Elegir destino de la nota`; las pestañas mostraban
  `Exportar ZIP`/`Importar ZIP` frente a nombres que intercalaban `backup`.
  Se conservan las frases visibles y se agrega el contexto sin interrumpirlas.
  Dos regresiones fallaron antes; **82 tests de cinco archivos** pasaron después.
  Commit `92deffd`, enviado a la rama remota.

Son cinco regresiones nuevas, sin cambiar acciones, apariencia ni persistencia.

Los intentos parciales previos no se presentan como matriz final: se corrigieron
precondiciones del guion (seleccionar un día antes de Agregar fecha), despertar
la pantalla y registrar el cambio natural de altura por el teclado. No eran
fallos funcionales de la app ni se modificó el producto para adaptar esos supuestos.
Un setup inicial con `.click()` DOM abrió menús sin reproducir el estado de
hover/foco de la interacción real. El contraste señalado allí no se reprodujo
con toques CDP sobre los mismos menús en ambos temas, sin cambiar CSS. La matriz
definitiva no mezcla esos estados con el recorrido táctil. Un selector de guion
que esperaba `is-open` en la paleta de estados también se corrigió: esa paleta
se expone por hover/foco, no por esa clase. La cancelación del diálogo se ejecuta
antes de cambiar de tema para evitar que intercepte el siguiente toque.

### Controles automáticos

- Gate previo: exit 0, 79 archivos/1206 tests de app y 92 de tooling.
- Gate del código definitivo `92deffd`: `npm run verify`, exit 0, **79 archivos/1211 tests
  de app y 92 de tooling**. Tres avisos de lint preexistentes, cero errores;
  controles de build, tipos, versión, SQLite y documentación incluidos.
- Se ejecutó el deploy definitivo después de terminar ese gate; Acerca de,
  certificado y hashes compilado/instalado corresponden al mismo debug.
- La referencia inicial no sustituye los controles finales de los documentos.
- Controles documentales finales: `npm run check:docs`, exit 0, 109 Markdown/941
  enlaces; `npm run check:traceability`, exit 0 sin advertencias. Auditoría
  suplementaria de 69 enlaces de AGENTS/CONTRIBUTING/TODO, sin problemas;
  `git diff --check`, sin errores. CSV cotejados contra los LHR y sus hashes.

### Medición definitiva

**40 snapshots válidos**, 20 escenas en cada tema, entre
`2026-10-20T04:38:07.773Z` y `2026-10-20T04:44:07.524Z` (UTC), sobre el debug
identificado: **34 scores de 100/100 y seis de 96/100**. Todos alcanzan el umbral
original de ≥90; no se promedian escenas. Lighthouse `13.5.0`, créditos de axe-core
`4.14.0`, ancho observado 411 CSS px/DPR 1,75 y altura nativa variable por el IME,
sin emulación de pantalla o agente de usuario.

| Caso | Escena | Oscuro | Claro |
|---|---|---:|---:|
| L01 | Principal: editor y feed | 100 | 100 |
| L02 | Materias y búsqueda | 100 | 100 |
| L03 | Resultados de búsqueda | 100 | 100 |
| L04 | Nueva materia, sin guardar | 100 | 100 |
| L05 | Opciones de Lumapse | 100 | 100 |
| L06 | Calendario | 100 | 100 |
| L07 | Formulario de fecha, sin guardar | 96 | 96 |
| L08 | Selector de materia de fecha | 100 | 100 |
| L09 | Selector de materia del editor | 100 | 100 |
| L10 | Menú Insertar | 100 | 100 |
| L11 | Menú Formato | 100 | 100 |
| L12 | Modo enfoque | 100 | 100 |
| L13 | Opciones de nota | 96 | 96 |
| L14 | Destinos de Mover a, sin mover | 96 | 96 |
| L15 | Selector de estado, sin cambiarlo | 100 | 100 |
| L16 | Backup: exportación inicial | 100 | 100 |
| L17 | Backup: importación inicial | 100 | 100 |
| L18 | Acerca de | 100 | 100 |
| L19 | Papelera | 100 | 100 |
| L20 | Confirmación de vaciado, sin confirmar | 100 | 100 |

Evidencia pública sin contenido de notas:

- [Resumen de las 40 escenas](./evidencia-lighthouse-rnf-019-2026-10-20.csv):
  fecha, score, umbral, viewport observado, fallos, revisión incompleta y SHA-256
  de los informes/artefactos crudos locales. `PASS` significa **solo score ≥90**.
- [3040 registros de auditoría](./auditorias-lighthouse-rnf-019-2026-10-20.csv):
  identificador, `scoreDisplayMode`, score, peso y cantidad de nodos que requieren
  revisión. Son 76 entradas por escena, no 3040 pruebas humanas: 1654
  `notApplicable`, 946 `binary`, 40 `informative` y 400 `manual`.

Los 40 LHR no tienen `runtimeError`, auditorías con modo `error` ni avisos de
ejecución. **Eso no significa cero hallazgos:** seis auditorías ponderadas fallan,
como se detalla abajo. No quedan fallos automáticos de
`label-content-name-mismatch` en las escenas definitivas.

Los informes íntegros, artefactos y PNG se conservan localmente fuera de Git porque
incluyen snippets, datos y capturas. Sus hashes identifican esas copias; no se
presentan como archivos descargables desde el repositorio. Los CSV son derivados
revisables, no reemplazos íntegros de los LHR. Se inspeccionaron visualmente cuatro
capturas: L07/L13 oscuros y L01/L20 claros; no es una revisión visual exhaustiva.

### Observaciones y revisión incompleta

| Observación | Evidencia y tratamiento en esta unidad |
|---|---|
| `color-contrast`, L07 en ambos temas | Lighthouse señala el texto de **Agregar fecha** del calendario subyacente, después del toque que abre el diálogo; en oscuro informa 1,99:1. Se registra como observación para clasificar en su contexto, no como un fallo de etiqueta ni como cumplimiento de contraste. No se modifican estilos ni se la descarta automáticamente por quedar detrás del diálogo. |
| `target-size`, L13/L14 en ambos temas | Lighthouse señala controles de tarjetas subyacentes parcialmente cubiertos por el menú abierto; por ejemplo, espacio disponible 4,6×28 CSS px. El score queda en 96. Se conserva la observación, sin redimensionar controles ni equipararla a una nueva medición de los controles principales de RNF-008. Su aceptación para el corte requiere revisión expresa. |
| `Accessibility.incomplete` | Cinco familias aparecen en alguna escena: `aria-allowed-role`, `aria-valid-attr-value`, `label-content-name-mismatch`, `color-contrast` y `aria-prohibited-attr`. Incluyen roles de paneles ocultos, una referencia ARIA al listbox, símbolos `+`/`Aa`, contraste que el motor no decide y acciones de fechas. Los nodos pendientes se cuentan en el CSV; no se convierten en pruebas aprobadas ni en defectos confirmados sin revisión contextual. |
| Auditorías manuales | Las diez entradas manuales de Lighthouse por escena siguen sin ejecutarse como parte del instrumento. El score no certifica navegación completa, TalkBack, control por voz, interoperabilidad de hardware o WCAG exhaustiva. Las revisiones previas conservan sus propios artefactos y límites. |

El diagnóstico auxiliar por capas no llegó a completarse por precondiciones del
guion; no se usa para aceptar o descartar los hallazgos. Estas observaciones no
abren por sí solas otro frente ni quedan aceptadas por el calendario. Se mantiene
pendiente la clasificación general del [tablero](../../TODO.md#antes-del-corte-apk-final--núcleo-y-riesgos)
antes del corte, sin postergar otros RNF por esta medición.

### Conservación y cierre operativo

- Después de todos los recorridos y del diagnóstico auxiliar, los conteos y hashes
  de **82 notas, 30 materias/secciones, 20 fechas y dos metadata** coinciden con la
  referencia inicial. Los valores del borrador —contenido de ocho caracteres— y
  `localStorage` también coinciden. No se guardó, descartó, movió, importó ni borró.
- Vista Entrada, tema oscuro original, paneles/diálogos cerrados, sin filtros ni
  `inert` residual en el área principal. El forward ADB propio fue retirado.
- El runner de escenas recopiló los 40 LHR válidos y terminó con **exit 1 en la
  limpieza posterior**, al intentar tocar Entrada durante la transición de cierre
  de una confirmación. No se presenta esa ejecución como exit 0. Se completó la
  restauración por separado y se comprobaron los hashes y preferencias anteriores;
  el exportador de los 40 resultados válidos terminó en 0.
- No se midieron coverage nuevo, tráfico, seguridad de dependencias, CRUD/FPS ni
  otros requisitos como parte de este cierre. Corresponden los controles acordados
  sobre el futuro candidato, no la reutilización de cifras históricas.

## Aceptación y siguiente paso

RNF-019 queda **verificado técnicamente para la métrica Lighthouse ≥90 y estas
escenas del debug `92deffd`**; no se reemplazó ni rebajó el umbral. Las autorizaciones
del autor cubren ejecución y correcciones de etiquetas, **no aceptación de los
resultados, de las observaciones, del PR o del APK final**.

Corresponde revisar el PR, los CSV, las etiquetas en el teléfono y los límites
anteriores. La autorización de merge sigue pendiente; no se publica una APK, no
se congela el desarrollo ni se inicia otra tarea automáticamente.
