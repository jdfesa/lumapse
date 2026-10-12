# Validación acotada de contraste — RNF-021

**Inicio:** 2026-10-12 (Argentina)<br>
**Rama:** `test/rnf-021-contrast`<br>
**Base:** `81c438f7c5d0c82c55e8ef0d8d0055cc4f872c9e`<br>
**Estado:** contraste verificado técnicamente en el alcance registrado;
[PR #37](https://github.com/jdfesa/lumapse/pull/37) aceptado por el autor, con
integración y limpieza autorizadas. El estado de integración se comprueba en GitHub.

## Objetivo y alcance acordados

El autor aceptó comprobar el contraste del texto en los temas claro y oscuro y
corregir únicamente incumplimientos demostrados de `RNF-021` (ratio **≥4,5:1**).
Esta es la única unidad activa: no se abren otros frentes ni se rediseña la app.
La autorización inicial comprendía commits Conventional Commits en inglés, push
final y preparación de un PR, sin merge ni publicación. La autorización posterior
de integración se registra en el cierre de este reporte; no habilita una APK nueva.

El recorte incluye texto de lectura/edición, etiquetas, metadatos, placeholders,
menús, avisos y diálogos existentes. Los fondos con transparencia y las opacidades
se deben componer antes de calcular el ratio. Los colores elegidos para materias
o tipos de fechas se revisan cuando aparecen como texto; no se cambian los datos.

Quedan fuera teclado/foco, nombres accesibles, Lighthouse, adopción, rendimiento,
dependencias, persistencia y funciones nuevas. Una prueba de contraste no acredita
los demás RNF ni una certificación exhaustiva de accesibilidad.

## Método y aceptación

1. Identificar dispositivo, APK instalada, fuente, canal, hash y certificado;
   registrar el estado de prueba y preservar notas/borrador/tema.
2. Obtener colores computados del WebView y sus fondos efectivos en ambos temas,
   con recorrido de las superficies y fixtures transitorios para los estados no
   presentes en las notas de prueba. Distinguir esos fixtures del flujo real.
3. Calcular luminancia relativa sRGB y ratio `(Lmayor + 0,05)/(Lmenor + 0,05)`;
   comparar sin redondear con 4,5. La revisión visual complementa la medición.
4. Corregir solo los fallos medidos y agregar regresiones focalizadas; repetir la
   medición sobre el debug identificado si cambia el código.
5. Ejecutar `npm run verify` sobre el cambio final, revisar evidencia y límites,
   actualizar RNF y tablero con resultados reales y preparar el PR para el autor.

Referencia del método: [WCAG 2.2 — luminancia relativa](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance)
y [contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
Se conserva el umbral del proyecto incluso para títulos; se distinguen los controles
inactivos y los iconos/decoraciones sin texto, no evaluados como texto normal.

La aceptación requiere pares de colores, ratios, superficies/estados y artefacto
reproducibles, con cobertura y límites explícitos. Si la cobertura es parcial,
no se declara cumplimiento global. La aceptación y la autorización de merge
requieren confirmación expresa; el acuerdo recibido se registra al final.

## Preparación comprobada

- `main` limpio y sincronizado, divergencia 0/0; GitHub sin PR abiertos.
- `check:runtime`: exit 0, Node 22.20.0/npm 10.9.3 existentes, sin instalar ni
  modificar el runtime global.
- `check:docs`: exit 0, 105 archivos/901 enlaces, sin errores ni anclas pendientes.
- `check:traceability`: exit 0, sin advertencias.
- Regresiones fuente RNF-007/RNF-008: exit 0, 8 casos; no son mediciones Android.
  El runner se reejecutó fuera del sandbox para confirmar los casos completos.
- El autor confirmó Samsung conectado a este equipo, desbloqueado, con root y
  únicamente notas de prueba; autoriza inspección y debug habitual si hace falta,
  preservando datos, sin `--clean` ni publicación. La identidad se verificará antes
  de intervenir.

## Artefactos identificados

| Campo | Referencia anterior | Debug corregido |
|---|---|---|
| Fuente incrustada | `f2beef739a686d44a2d378657ccdc660e0896d20` | `803947edd1edef03a29bc4e60a50927da193d455` |
| Canal / estado | `android-debug`, limpio | `android-debug`, limpio |
| Versión / código | `0.5.0` / `500` | `0.5.0` / `500` |
| SHA-256 APK | `c4cda1f1a1166c95cbdd4d06f00a45b39a8b9dceef23a33c940dc2cc2bace461` | `8b6e02263493343438d171fedd9d1ffd11f01cbfaf282d8ef4fb83dd878214a9` |

- Samsung `SM-G965F`, Android 10/API 29, WebView `154.0.8037.106`.
- Viewport: 411×707 CSS px; paquete: `com.lumapse.app`.
- Certificado SHA-256 conservado:
  `5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`.
- Hash de la APK compilada igual al de la copia instalada; certificado verificado
  con `apksigner`. No se utilizó firma de release ni se publicó otro artefacto.
- Deploy habitual autorizado, sin `--clean`, desinstalación ni bump. Se reutilizaron
  Node/npm, JDK 21 y cachés locales existentes, sin alterar el entorno global.
  El aviso inicial de Java se resolvió seleccionando el JDK existente en `PATH`.

## Medición reproducible

Se usó un forward ADB temporal al inspector del WebView y `Runtime.evaluate`.
Los helpers y los casos sintéticos están versionados en
[`rnf-021-contrast.mjs`](../../tests/tooling/fixtures/rnf-021-contrast.mjs) y
[`rnf-021-cases.mjs`](../../tests/tooling/fixtures/rnf-021-cases.mjs).
Son herramientas de prueba, no código añadido a la app ni datos persistidos.

El fixture inserta una sección DOM con los estilos **del APK instalado**, sin
invocar servicios ni eventos de guardado. Se cambió temporalmente `data-theme` y
se esperó a que terminaran las transiciones antes de obtener `getComputedStyle`.
Se compusieron fondos, alfa del texto y opacidades de grupo desde el elemento hasta
el fondo opaco del documento. Los gradientes uniformes de los toasts se compusieron
como otra capa; imágenes, filtros o fondos no resueltos producen un error, no PASS.

**Estados declarados:** 11 casos por tema reproducen reglas `:hover` del CSS real
sustituyendo ese pseudoselector por `[data-hover]` únicamente en el fixture.
`hoverFixtureRules` encontró **58 reglas** y se comprobó el cambio al color
`--color-on-accent`/`--color-on-danger` en los botones rellenos. No son interacciones
hover físicas ni una prueba de teclado/foco. El estado deshabilitado de un control
no se presenta como texto normal activo.

Los intentos con `CSS.enable` y eventos de puntero no establecieron todos los
estados de forma reproducible y **no se contabilizan como pruebas aprobadas**.
Una primera recolección de reglas omitía los selectores porque `CSSStyleRule`
también expone `cssRules` vacío en este WebView. Se invalidó esa corrida para los
estados, se corrigió el helper y se añadió una regresión; los resultados siguientes
corresponden a la repetición con las reglas efectivamente aplicadas.

El [CSV de evidencia](./evidencia-contraste-rnf-021-2026-10-12.csv) conserva **208
muestras**: 104 casos por tema, colores CSS, RGB efectivos, ratio completo y
resultado. Los campos previos de los estados declarados quedan vacíos porque no
se obtuvo una referencia anterior equivalente. No se reutiliza un estado normal
como si fuera una medición hover previa.

### Resultados de los fixtures y placeholders

| Grupo | Oscuro | Claro | Resultado |
|---|---:|---:|---|
| 104 casos DOM por tema, incluidos estados declarados | mínimo 4,9291876348:1 | mínimo 5,1202262673:1 | Todos ≥4,5:1 |
| 14 placeholders montados por tema | mínimo 7,5939144670:1 | mínimo 5,3009752455:1 | Todos ≥4,5:1 |

Los placeholders incluyen campos de formularios montados pero ocultos; se midió
su estilo computado, sin atribuirles un recorrido visual ejecutado. Otras 93
muestras DOM por tema, incluidas superficies fuera del viewport, no presentaron
fallos: mínimos 5,0941623565:1 oscuro y 5,0461221704:1 claro. No se confunden con
los recorridos visibles que se detallan abajo.

Ejemplos comparables de estado normal; valores resumidos, sin redondear antes de
decidir PASS:

| Caso | Oscuro antes → después | Claro antes → después |
|---|---:|---:|
| Texto secundario sobre superficie | 4,377 → 7,594 | 2,863 → 5,301 |
| Guardar | 2,983 → 8,819 | 4,467 → 6,288 |
| Contador de caracteres | 1,963 → 7,594 | 1,545 → 5,301 |
| Contador de papelera | 2,766 → 6,356 | 3,763 → 6,470 |
| Título de callout Info | 7,732 → 13,973 | 1,667 → 16,219 |
| Enlace Markdown | 1,871 → 8,819 | 9,398 → 6,288 |
| Mensaje de éxito del backup | 6,590 → 6,590 | 2,092 → 6,547 |

### Superficies reales y revisión visual

Se navegaron controles reales mediante clics DOM, sin ejecutar escrituras. En cada
tema se obtuvieron muestras del viewport y capturas de principal, drawer, menú de
opciones, vista Backup, Acerca de y Papelera: **12 escenas / 174 muestras**.

| Superficie | Muestras por tema | Mínimo oscuro | Mínimo claro |
|---|---:|---:|---:|
| Principal: editor/feed visible | 11 | 5,094:1 | 5,301:1 |
| Drawer: búsqueda/materias | 28 | 6,458:1 | 5,046:1 |
| Opciones de Lumapse | 5 | 7,594:1 | 5,301:1 |
| Backup, sin exportar/importar | 10 | 7,594:1 | 5,301:1 |
| Acerca de | 16 | 7,707:1 | 5,343:1 |
| Papelera, sin acciones destructivas | 17 | 6,356:1 | 5,449:1 |

Las 174 muestras superaron el umbral, sin controles deshabilitados contabilizados.
Se inspeccionaron visualmente las capturas de principal oscuro/claro, drawer claro,
backup claro y papelera oscura. La medición es el criterio de contraste; esas
capturas no certifican todas las pantallas ni sustituyen la revisión del autor.

## Corrección y controles

- Texto secundario: alfa 0,65 en ambos temas, sin otra reducción de opacidad en
  contadores, fechas y etiquetas archivadas que fallaban.
- Acento oscuro `#a5b4fc`, claro `#4f46e5`; peligro claro `#b91c1c`.
  Texto sobre rellenos con tokens `--color-on-accent` y `--color-on-danger`.
- Mensajes de éxito con `--color-success` adaptado al tema.
- Texto de materia/tipo independiente de su color decorativo; fondos, puntos,
  iconos y datos conservan sus colores. Títulos de callout legibles, con indicador
  de color; enlaces Markdown usan el acento en lugar del azul del navegador.
- Solo colores/opacidades en 13 CSS y pruebas. Sin cambios de tamaños, layout,
  servicios, schema, versión, dependencias ni funciones nuevas.

| Control | Resultado real |
|---|---|
| Caracterización definitiva del CSS anterior | 9 tests: 2 PASS de cálculo y 7 fallos de regresiones de contraste |
| Regresión posterior del enlace, antes de corregirlo | Fallo detectado; ratio Android oscuro 1,871:1 |
| Regresiones finales RNF-021 y guardias RNF-007/RNF-008 | Exit 0, 19 tests: 11 de contraste/helpers y 8 previos |
| `npm run verify` del código `803947e` | Exit 0, 78 archivos/1190 tests de app y 86 de tooling |
| `npm run verify` final con helper de estados y evidencia documental | Exit 0, 78 archivos/1190 tests de app y 87 de tooling; build, tipos y controles completos |
| Enlaces y trazabilidad del registro final | Exit 0, 106 archivos/911 enlaces, sin errores ni advertencias de trazabilidad; suplemento TODO: 34 enlaces válidos |
| `npm run deploy:android -- --target <dispositivo confirmado>` | Exit 0, script habitual y debug instalado conservando datos |
| Verificación de firma/hash y mediciones WebView | Certificado preservado, hashes iguales, grupos anteriores PASS |

El helper de estados se reforzó después en `741b5de`, sin modificar el código de
la app instalada. Los controles documentales se repitieron después de incorporar
el registro del resultado del gate, sin presentar la ejecución inicial como
validación final.
Se conservan tres warnings de lint y los avisos de tamaño preexistentes, fuera de
alcance. Las limitaciones del inspector no son fallos de producto.

## Conservación, límites y aceptación

- Borrador y cuatro contenidos visibles conservaron sus hashes antes del deploy
  y después de los recorridos. Tema y preferencia almacenada originales (sin
  valor explícito), foco normal y viewport restaurados; fixtures/globals y forward
  temporal retirados. No se guardó, descartó, exportó, importó ni borró una nota.
- Es una comparación del estado visible, no un snapshot ni una auditoría de toda
  SQLite. Las APK, capturas y logs se mantienen locales, no versionados.
- Resultado de texto en los temas/superficies/estados registrados. Excluye iconos,
  gráficos, logos, controles inactivos, contenido con estilos arbitrarios ajenos
  a los fixtures, otros dispositivos y configuraciones. No equivale a certificar
  WCAG completa ni a verificar RNF-019/RNF-020/RNF-022.
- RNF-021 queda verificado **en este alcance y debug**, no globalmente para todo
  contenido posible ni para el candidato final. La aceptación general del PR no
  agrega pruebas manuales por caso ni nuevas mediciones Android.
- El corte APK de presentación se decidirá después de los imprescindibles;
  informe, manual y defensa conservan el [recorte vigente](../../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa).

### Aceptación del autor — 2026-10-12

El autor aceptó expresamente PR #37 y autorizó integrar la rama a `main` y eliminar
las ramas locales/remotas cuya integración esté comprobada. Es aceptación general
del PR: no se comunicaron nuevas pruebas por caso ni confirmación adicional de
recorridos en el teléfono. Se conservan los resultados y límites anteriores.

La actualización de cierre es documental, sin cambios adicionales en la app. El
estado de integración se consulta en el PR antes de borrar las ramas; no se infiere
de su desaparición. Después del cierre se continúa la conversación sobre el último
APK y la congelación antes del manual y el informe; este acuerdo no autoriza otro
frente, una compilación nueva ni comenzar esos entregables.
