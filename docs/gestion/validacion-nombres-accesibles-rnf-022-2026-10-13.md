# Validación acotada de nombres accesibles — RNF-022

**Inicio:** 2026-10-13 (Argentina)<br>
**Rama:** `test/rnf-022-accessible-names`<br>
**Base:** `21624e0`<br>
**Estado:** RNF-022 verificado técnicamente en el alcance registrado del debug
`b7c3d31`; [PR #38](https://github.com/jdfesa/lumapse/pull/38) aceptado por el autor,
con integración y limpieza autorizadas. El estado de integración se comprueba en GitHub.

## Objetivo y alcance acordados

Comprobar nombres accesibles de controles sin texto visible y alternativas de
imágenes informativas en las superficies existentes de Lumapse. Corregir solo
fallos demostrados de RNF-022, sin rediseño ni cambios de comportamiento funcional.
El autor autorizó rama, commits Conventional Commits en inglés, push y PR para
revisión. La autorización inicial no comprendía merge, APK final ni publicación;
la autorización posterior de integración se registra al final de este reporte.

El autor confirmó teléfono de pruebas conectado a este equipo, con notas de prueba,
desbloqueado y root; permite su uso y despertar la pantalla. Se preservan notas,
borradores, papelera y preferencias. Un debug privado necesario para comprobar
correcciones utiliza el script habitual, sin `--clean`, bump ni firma de release.

Se revisarán principal/editor/feed, menús, organización/búsqueda, fechas, Backup,
Acerca de, Papelera y diálogos disponibles, separando recorridos reales de pruebas
aisladas. Contenido arbitrario del usuario y destinos externos no se certifican.
Quedan fuera teclado/foco (RNF-020), Lighthouse (RNF-019), contraste, rendimiento,
nuevas funciones y otros cambios de producto.

## Método, pruebas y aceptación

1. Identificar dispositivo, fuente/canal, versión/code, hash APK y certificado.
2. Inventariar controles e imágenes; contrastar DOM con nombres calculados del
   árbol de accesibilidad del WebView y revisar manualmente propósito/contexto.
   No equiparar presencia de `title`/`aria-label` a nombre correcto.
3. Distinguir imágenes decorativas de informativas, estados ocultos y controles
   que aparecen al abrir menús/diálogos. Registrar cobertura y ausencias explícitas.
4. Corregir solo incumplimientos reproducidos y agregar regresiones focalizadas.
   Si cambia la app, repetir revisión sobre debug identificado y firma compatible.
5. Ejecutar tests focalizados y `npm run verify`, controles de enlaces/trazabilidad
   y actualizar las fuentes canónicas con resultados reales.

La aceptación requiere **cero elementos relevantes sin nombre accesible en el
alcance revisado**, alternativas que describan su propósito, evidencia reproducible
y límites visibles. Si la cobertura es incompleta no se declara cumplimiento
global. La aceptación posterior del autor se registra al final; no se infiere del
gate ni de las mediciones.

Referencias: [WCAG 2.2 — alternativas de contenido no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
[nombres de controles](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)
y [protocolo Accessibility de Chromium](https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/).
No es una certificación WCAG exhaustiva ni una prueba de TalkBack.

## Preparación comprobada

- `main` limpio y sincronizado con `origin/main` en `21624e0`, divergencia 0/0;
  GitHub sin PR abiertos, PR #37 integrado. Rama creada desde esa base.
- `npm run check:runtime`: exit 0, Node 22.20.0/npm 10.9.3 existentes;
  sin instalaciones ni cambios globales.
- `npm run check:docs`: exit 0, 106 archivos/915 enlaces, cero errores.
- `npm run check:traceability`: exit 0, cero advertencias.
- `npm run check:a11y`: exit 0, cero avisos. Es estático, no verifica RNF-022.
- `npm run doctor:android`: primer diagnóstico sin SDK/JDK en PATH dio tres
  advertencias ambientales. Seleccionados los existentes, exit 0 sin advertencias:
  un Samsung SM-G965F conectado, app y SQLite presentes. Sin modificar datos.

## Resultados

### Artefacto y entorno

| Campo | APK previa | Debug definitivo |
|---|---|---|
| Fuente | `803947e`, referencia de contraste | `b7c3d313fd253f1d0128263bd211fc340225de4c` |
| Versión / código | `0.5.0` / `500` | `0.5.0` / `500` |
| SHA-256 APK | `8b6e02263493343438d171fedd9d1ffd11f01cbfaf282d8ef4fb83dd878214a9` | `041a30a1e14e01cbde33007b42afc7a5ec0f39bbf7103c8b5c23753f28775fe2` |

- Samsung SM-G965F, Android 10/API 29, WebView `154.0.8037.106`.
- Acerca de confirma **Android debug · prueba privada**, origen completo de la tabla
  y **sin cambios locales**. No es el asset firmado/publicado de GitHub.
- Hash de la APK compilada igual al de la copia instalada. Certificado SHA-256
  conservado: `5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`.
- `npm run deploy:android -- --target <dispositivo confirmado>`: exit 0, script
  habitual sin `--clean`. Se reutilizaron runtime, SDK, JDK, cachés y firma debug
  existentes; sin instalaciones de herramientas ni acceso a firma de release.

### Fallos comprobados y corrección mínima

| Elemento | Referencia anterior | Resultado definitivo |
|---|---|---|
| Cerrar drawer | Nombre AX vacío | `Cerrar menú de notas` |
| Nueva materia | Nombre AX `+`, pese a `title="Nueva materia"` | `Nueva materia` |
| Renombrado inline | `textbox` sin nombre; el valor no lo etiqueta | `Nuevo nombre de materia o sección` |
| Dos casillas de las notas sintéticas | Nombres AX vacíos | `Completar el ejercicio pendiente.` / `Ordenar los apuntes de la clase.` |
| Ocho muestras de color | Nombre calculado solo `#hex`, sin describir la acción | `Elegir color #hex` |
| Cerrar aviso de papelera | Símbolo `✕` en plantilla, sin medición nativa previa | `Cerrar aviso de papelera` en estado DOM aislado |
| SVG decorativos de ocho plantillas | Imágenes anónimas expuestas en el AX | `aria-hidden="true"`; nombres del control/texto contenedor conservados |

Las casillas se nombran desde el texto **ya sanitizado** de su item, sin incluir
tareas hijas; se incluye el `alt` de imágenes locales. Un item sin texto usa
`Tarea de la línea N`. `setAttribute` escapa el nombre; la reconstrucción conserva
`data-line` y `checked`, sin ampliar la allowlist ni cambiar el handler de guardado.
No se modificaron CSS, servicios de persistencia, schema, versión o dependencias.

### Inventario reproducible del WebView

Se capturaron `Accessibility.getFullAXTree` y `DOM.getDocument({depth:-1,
pierce:true})` por CDP sobre el **APK instalado**. El helper versionado
[`rnf-022-names.mjs`](../../tests/tooling/fixtures/rnf-022-names.mjs) cruza cada
`backendDOMNodeId` con el DOM; rechaza correspondencias ausentes, excluye nodos
ignorados y conserva los nombres **calculados por Chromium**, no un algoritmo
propio ni un fallback al atributo `title`.

Para repetir: identificar el inspector del WebView por ADB, abrir una conexión CDP,
habilitar `Accessibility`, recorrer las escenas de la tabla y pasar `nodes`/`root`
al helper. Antes de cada captura exigir `document.visibilityState === 'visible'`.
No pulsar Guardar, Crear, restaurar, eliminar, vaciar ni seleccionar un ZIP.
Cancelar renombrado con Escape **antes** de perder foco: el blur puede persistirlo.
Cancelar los diálogos y restaurar filtros, plegado, tema y contexto al terminar.

El [CSV derivado](./evidencia-nombres-accesibles-rnf-022-2026-10-13.csv) conserva
**2188 muestras en 24 escenas**, con rol, tag, identificador UI, nombre y atributos
pertinentes. Son observaciones repetidas de nodos, incluidos elementos fuera del
viewport pero expuestos en el AX: **no son 2188 controles únicos ni 2188 taps**.
En todas las escenas hubo **0 nombres vacíos y 0 nombres de símbolo solo**.

| Escena | Muestras AX |
|---|---:|
| Principal/editor/feed | 100 |
| Insertar | 121 |
| Formato | 106 |
| Selector de materia del editor | 132 |
| Modo Enfoque | 8 |
| Menú de nota | 106 |
| Mover a | 137 |
| Estados académicos de nota | 104 |
| Calendario | 113 |
| Diálogo de fecha | 9 |
| Drawer | 100 |
| Nueva materia | 111 |
| Menú de materia | 103 |
| Renombrado | 101 |
| Nueva sección | 103 |
| Archivadas | 60 |
| Búsqueda | 97 |
| Opciones de Lumapse | 106 |
| Backup: exportar | 86 |
| Backup: importar | 85 |
| Acerca de | 82 |
| Papelera | 107 |
| Confirmación de vaciado, cancelada | 2 |
| Aviso de papelera, DOM aislado | 109 |

Se revisaron manualmente los nombres y su propósito/contexto, no solo su presencia:
esto motivó describir la acción de los colores. Logos informativos del drawer y
opciones tienen nombre `Lumapse`; los logos redundantes del botón de opciones y
Acerca de son decorativos. Los SVG revisados tienen alternativa en el control,
texto o etiqueta contenedora; no se ocultaron imágenes informativas sin alternativa.

Se inspeccionaron visualmente las capturas **del debug definitivo** de principal,
nueva materia, renombrado, menú de estados, Backup/importar y Acerca de. Las
capturas complementan el inventario, no acreditan una prueba de lector de pantalla.
El menú de estados se expuso con foco programático para `:focus-within`, sin probar
navegación por teclado. El aviso se mostró cambiando temporalmente su `display`,
sin forzar una papelera grande; no se presenta como flujo disparado por el producto.

Los intentos con pantalla apagada/bloqueada, una captura que excedió el buffer y
errores de navegación del runner se descartaron del recorrido final. Se repitió
con pantalla visible y buffer suficiente. El primer checkpoint `f57d36c` no se
reutiliza como validación del ajuste de colores: el recorrido completo se repitió
sobre `b7c3d31`.

### Controles y conservación

| Comando / control | Resultado ejecutado |
|---|---|
| Regresiones nuevas antes de corregir | 4 fallos / 58 PASS; nombres ausentes reproducidos |
| `npm test -- --maxWorkers=1 tests/unit/layout/drawerSubjects.test.js tests/unit/layout/appShell.test.js tests/unit/services/MarkdownService.test.js tests/unit/services/MarkdownService.security.test.js` | Exit 0, 86 tests focalizados |
| `node --test tests/tooling/rnf-022-names.test.js` | Exit 0, 5 tests de helper/decoración |
| `npm run verify` del código definitivo | Exit 0, 78 archivos/1194 tests de app y 92 de tooling; build, tipos y controles completos |
| `npm run verify` con reporte y CSV incorporados | Exit 0, mismos 78 archivos/1194 tests de app y 92 de tooling; controles completos repetidos sobre el cambio |
| `npm run check:docs` / `npm run check:traceability`, después del registro final | Exit 0, 107 archivos/923 enlaces sin errores; cero advertencias de trazabilidad |
| Deploy habitual y firma/hash | Exit 0; certificado compatible y APK compilada/instalada iguales |
| Inventario definitivo | 24 escenas / 2188 muestras, 0 nombres vacíos o de símbolo solo |
| Copias locales de SQLite, lectura y `integrity_check` | `ok`; contenido exacto de 85 notas, 30 materias/secciones, 20 fechas y 2 filas de metadata con hashes iguales antes/después |
| Estado del editor y contexto | Hash del borrador y de cuatro contenidos visibles iguales; tema/preferencia de tema y modo Enfoque conservados; materia original y plegado visible de las 10 materias restaurados |

Se conservan tres warnings de lint y los avisos de tamaño preexistentes, fuera de
alcance. Las copias SQLite, APK, capturas y logs quedan locales e ignorados; no se
versionan valores de campos, bases ni IDs de datos en el CSV derivado.

El suplemento de enlaces de `TODO.md` comprobó 37 enlaces, cero errores. El CSV
se comprobó por conteo, identidad escena/muestra y nombres no vacíos, sin símbolos
solos ni duplicados; la matriz RNF suma 26 (14 verificados, 2 parciales, 4 pendientes,
3 obsoletos y 3 no aplicables). Los controles documentales se repiten tras registrar
el resultado del gate; no se presentan las verificaciones iniciales como finales.

La pantalla se mantuvo despierta temporalmente durante las capturas; la opción
`stay_on_while_plugged_in` se restauró al valor original **0**, comprobado después.
El forward ADB temporal se retiró. Abrir Nueva sección expande su materia: se
restauraron y compararon las 10 etiquetas de plegado originales. No se afirma un
snapshot inicial byte a byte de todas las preferencias ni restauración del caret.
No se guardó, descartó, exportó, importó, restauró ni borró una nota/fecha/materia.

## Límites y aceptación

- Verifica nombres/alternativas en las superficies, estados y contenido sintético
  registrados, en este dispositivo/WebView/debug. No certifica contenido arbitrario,
  todos los estados posibles, otros dispositivos, TalkBack o accesibilidad completa.
- El inventario de roles se detalla en el helper: no verifica semántica/operabilidad
  de todos los elementos genéricos ni completa teclado/foco, RNF-019 o RNF-020.
- El criterio de nombre vacío se complementó con revisión manual de propósito;
  no es un score Lighthouse ni una prueba de adopción/rendimiento.
- RNF-022 queda **verificado técnicamente en este alcance**, sin transferir la
  evidencia al asset publicado ni al futuro APK final. La documentación posterior
  no cambia la app instalada; no se generó una nueva versión entregable.
- El autor aceptó PR #38 y autorizó integración y limpieza como se registra abajo.
  No comunicó nuevas pruebas por caso ni resultados Android adicionales; esta
  aceptación general no amplía los resultados ni elimina los límites anteriores.

### Aceptación del autor — 2026-10-13

El autor aceptó expresamente [PR #38](https://github.com/jdfesa/lumapse/pull/38) y
autorizó unir la rama a `main` y eliminar su rama local y remota **solo después de
comprobar la integración**. Es aceptación general del PR, sin nuevas pruebas
manuales por caso ni confirmación adicional de recorridos en el teléfono.

Este cierre es exclusivamente documental: conserva la evidencia del debug
`b7c3d31`, no modifica la app instalada ni autoriza una versión, APK final o
publicación. HEAD y checks del PR se vuelven a comprobar antes de integrar; no se
infiere el merge de que desaparezca la rama. Los otros RNF y el corte de
presentación siguen el plan vigente, sin abrir otro frente automáticamente.
