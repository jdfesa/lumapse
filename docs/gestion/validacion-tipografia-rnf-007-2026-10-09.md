# Validación acotada de tipografía — RNF-007

**Fecha:** 2026-10-09 (Argentina)  
**Rama:** `test/rnf-007-typography`  
**Fuente del ajuste y del debug probado:** `f2beef739a686d44a2d378657ccdc660e0896d20`  
**Resultado:** RNF-007 verificado en el alcance de lectura y edición descrito aquí; el autor aceptó PR #36 y autorizó su merge y limpieza de ramas.

## Objetivo, alcance y exclusiones

Comprobar el mínimo de **16 CSS px** para el cuerpo de las notas al escribir y
leer: editor normal/enfoque, tarjetas y elementos Markdown. Corregir solo los
tamaños inferiores al criterio, sin rediseñar la interfaz.

Se incluyen párrafos, énfasis, listas, citas, callouts, encabezados `h1`–`h6`,
código inline/en bloque y celdas/encabezados de tablas. No se cambian los tamaños
de botones, etiquetas, fechas, badges, iconos decorativos ni mensajes auxiliares;
este resultado no declara toda la interfaz de al menos 16 px. Tampoco verifica
contraste, nombres accesibles, teclado, Lighthouse ni pruebas con usuarios nuevos.

`MarkdownPreview` se conserva como componente, pero `src/main.js` no lo instancia
en el flujo actual. Se protege su CSS y se mide un fixture aislado con sus estilos;
**no se añadió una vista nueva ni se atribuye un recorrido de usuario inexistente**.

## Artefactos y entorno

| Campo | Referencia anterior | Debug del ajuste |
|---|---|---|
| Fuente incrustada | `9056ab262323c0b34be19068b6858db68351247f` | `f2beef739a686d44a2d378657ccdc660e0896d20` |
| Canal / estado | `android-debug`, sin cambios locales | `android-debug`, sin cambios locales |
| Versión / código | `0.5.0` / `500` | `0.5.0` / `500` |
| SHA-256 APK | `784a35f38cd95267477e6ebcfbaa356138b7abebea2b8b66176e22c39c111646` | `c4cda1f1a1166c95cbdd4d06f00a45b39a8b9dceef23a33c940dc2cc2bace461` |

- Paquete: `com.lumapse.app`; dispositivo: Samsung `SM-G965F`.
- Android 10 / API 29; WebView `154.0.8037.106`.
- Viewport medido: **411×707 CSS px**; fuente raíz computada: **16 px**.
- Certificado SHA-256 conservado: `5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`.
- El hash del APK generado coincide con la copia de la APK instalada. La metadata
  incrustada identifica la fuente limpia y el canal, no una release publicada.

El autor confirmó el teléfono conectado, con root y datos de prueba. El debug se
instaló mediante el script habitual, **sin `--clean`**, bump ni publicación. Las
betas publicadas no se reemplazaron. El desbloqueo por el autor permitió completar
las capturas finales con el WebView visible; la referencia inicial de estilos
computados no se presenta como revisión visual anterior.

## Método

1. Copiar la APK instalada para identificar fuente, canal, hash y certificado.
2. Abrir el inspector WebView mediante un forward ADB local; medir
   `getComputedStyle(element).fontSize` y la fuente raíz.
3. Medir el editor y las cuatro tarjetas existentes, sin modificar su contenido.
4. Para Markdown no presente en esas notas, insertar un nodo DOM sintético con
   las clases de tarjeta y el CSS de la APK. Retirarlo sin llamar a servicios,
   eventos de edición ni SQLite. No es una prueba de creación/guardado de notas.
5. Repetir 18 casos por superficie y tema: tarjeta con CSS de la APK y componente
   preview aislado en Shadow DOM con `MarkdownPreview.css`, `markdown-elements.css`
   y `callout.css` de la fuente probada. Son **72 tamaños computados**; todos ≥16 px.
   El fixture del preview no equivale a una vista activa del APK.
6. Entrar/salir del modo enfoque por sus controles reales, medir y capturar el
   editor. Revisar las capturas del editor/feed y de los fixtures claro/oscuro.
7. Restaurar tema/modo, retirar fixtures y comparar hashes del borrador y de los
   contenidos visibles; eliminar únicamente el forward creado para esta sesión.

Las reglas fuente inferiores a `1rem` no se usaron como sustituto de la medición
Android. Las regresiones de Node son guardias de CSS, no un motor de layout.

## Resultados antes y después

Valores computados en el WebView; los casos Markdown corresponden al fixture de
tarjeta, no a notas nuevas persistidas.

| Caso | Antes | Después |
|---|---:|---:|
| Cuerpo del editor normal | 15,68 px | 16 px |
| Contenido de las cuatro tarjetas existentes | 15,36 px | 16 px |
| Código inline / bloque de código | 13,824 px | 16 px |
| Encabezado de tabla | 12,8 px | 16 px |
| Celda de tabla | 14,4 px | 16 px |
| Código dentro de una celda | 12,96 px | 16 px |
| `h4` | 15,36 px | 16 px |
| `h5` | 12,7488 px | 16 px |
| `h6` | 10,2912 px | 16 px |
| Párrafos, énfasis, listas, citas y texto de callouts | 15,36 px | 16 px |
| Código dentro de `h1` | 23,04 px | 23,04 px |

En la APK ajustada:

- Título del editor normal: **17,28 px**; enfoque: título **18,88 px**, cuerpo **16 px**.
- Tarjeta: `h1` **25,6 px**, `h2` **21,6 px**, `h3` **18,4 px**.
- Fixture preview: cuerpo, código, tablas y `h4`–`h6` **16 px**; `h1` **25,6 px**,
  `h2` **20,8 px**, `h3` **18,72 px** y código dentro de `h1` **21,76 px**.
- Los casos en ambos temas alcanzan el mínimo. La revisión visual de los ejemplos
  no mostró texto recortado; tablas y bloques conservan `overflow-x: auto`.

## Cambios y regresiones

- Cuerpos del editor, tarjeta y preview: `1rem`; tablas y sus encabezados: `1rem`.
- `h4`–`h6`: piso compartido de `1rem`, evitando las reducciones de los estilos del navegador.
- Código: `max(1rem, 0.85em)` en preview y `max(1rem, 0.9em)` en tarjeta. Se conserva
  la proporción en títulos grandes, sin reducir el texto de cuerpo/tablas.
- Se mantienen controles, metadatos, persistencia, dependencias y versión.
- Siete guardias nuevas en `tests/tooling/rnf-007-typography.test.js`, descubiertas
  por el runner existente, sin nuevos scripts, dependencias ni entrypoints.

| Control ejecutado | Resultado y límite |
|---|---|
| Inicio: `check:runtime`, `check:docs`, `check:traceability` | Exit 0; Node 22.20.0/npm 10.9.3, enlaces y trazabilidad válidos |
| Tests iniciales `NoteEditor.test.js`, `NoteList.test.js`, un worker | Exit 0; 2 archivos / 81 tests |
| Primeras seis guardias RNF-007 contra CSS anterior | Exit 1; 4 fallos esperados y 2 aprobados; luego se añadió el caso `h4`–`h6` |
| `node --test tests/tooling/rnf-007-typography.test.js tests/tooling/rnf-008-touch-targets.test.js` | Exit 0; 8 tests; guardia RNF-008 conservada, no nueva certificación táctil |
| `npm run verify` sobre el ajuste | Exit 0; 78 archivos / 1190 tests de app y 76 de tooling; build, tipos y controles completos |
| `npm run deploy:android -- --target <dispositivo confirmado>` | Exit 0; script habitual, Gradle e instalación, modo preservando datos |
| `apksigner verify --print-certs`, hash de APK generada/instalada | Certificado anterior conservado, hashes iguales |
| Mediciones y capturas CDP del debug | Tamaños mínimos PASS; límites de fixtures y componente preview descritos arriba |

El gate conserva tres warnings de lint y los avisos diagnósticos de tamaño
preexistentes. No se corrigen ni se ocultan en este objetivo. Los fallos de procesos
en sandbox se separaron de los fallos CSS: el runner y ADB se ejecutaron fuera de
ese límite, sin modificar el runtime global.

## Conservación del estado y límites

- El borrador de ocho caracteres y los cuatro contenidos visibles conservaron
  sus hashes antes de instalar y después de todas las pruebas. No se guardó,
  descartó, importó ni borró una nota.
- Tema oscuro y modo normal originales restaurados; nodos/globals temporales
  retirados y forward de la sesión eliminado. No se cambió la red ni la escala
  tipográfica del sistema.
- Esta comparación no es un snapshot ni un chequeo exhaustivo de integridad de
  toda SQLite. Las capturas, APK y auxiliares se mantienen locales, no versionados.
- Resultado para este dispositivo, artefacto, configuración y superficies: no
  acredita contraste, adopción, todo tamaño de la UI, otros dispositivos/escala
  del sistema ni el APK candidato final.
- La validación pertinente del candidato final se acuerda sobre su propio binario;
  la aceptación de esta unidad no acredita ese artefacto posterior.

## Aceptación del autor y cierre de la unidad

El 2026-10-09 (Argentina), el autor aceptó [PR #36](https://github.com/jdfesa/lumapse/pull/36)
y autorizó explícitamente merge a `main` y eliminación de la rama local/remota
`test/rnf-007-typography`. Es una aceptación general del PR y de la evidencia
registrada, no un nuevo resultado manual por caso ni una repetición de las mediciones.
El estado de integración se comprueba en GitHub; este registro no anticipa su SHA.
No cambia versión, no publica otra APK ni acepta automáticamente otros RNF.
