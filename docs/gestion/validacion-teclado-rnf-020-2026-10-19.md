# Validación acotada de navegación por teclado — RNF-020

**Inicio:** 2026-10-19 (Argentina)<br>
**Rama:** `test/rnf-020-keyboard-navigation`<br>
**Base:** `af974459976534570af399116d24253c6fc08e2e`<br>
**Estado:** revisión técnica completada en el alcance registrado: 16 casos PASS
sobre el debug identificado. RNF-020 conserva **evidencia parcial**, sin certificar
teclado físico ni mutaciones completas. Revisión y aceptación del autor pendientes;
no hay autorización de merge ni APK final.

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
  Al seleccionar SDK/JDK existentes, `doctor:android` pasó sin advertencias.

## Barreras reproducidas y correcciones

- **Paneles de notas y opciones:** Enter los abría sin mover foco dentro; Tab
  alcanzaba el editor/calendario del fondo y Escape no retornaba al disparador.
  Se añade foco inicial/retorno, `inert` al cerrar y contención Tab/Shift+Tab solo
  en paneles modales. Se preservan apertura/cierre táctiles y fondos existentes.
- **Menú de materia:** Enter dejaba el foco en la fila y Tab saltaba al siguiente
  control del drawer. El menú enfoca sus opciones, cicla y consume Escape antes
  de retornar al disparador, sin cerrar el panel padre.
- **Formularios de materia, sección y renombrado:** Escape cancelaba sin retorno
  y podía cerrar también el drawer. Se consume el evento y retorna al botón que
  permite abrir de nuevo la misma operación, sin escribir datos al cancelar.
- **Selector de materia del editor y menú de notas/Mover a:** Escape no consumido
  podía enviar Lumapse al fondo mediante la navegación nativa de Android. Se
  cierra la superficie más interna y se conserva un destino de foco visible.
- **Modo Enfoque:** al ocultar el botón Salir, el foco terminaba en `body`.
  Se retorna a Ampliar editor solo si realmente se estaba en modo ampliado;
  no se cambia el foco del guardado normal.
- **Calendario:** sus días eran `div` con `tabIndex=-1`, no alcanzables con Tab.
  Se usan botones nativos, se conserva foco tras el render de filtros/mes y se
  retorna a Mes anterior cuando desaparece el botón Limpiar filtro enfocado.
  Interactuar con un diálogo no oculta el calendario que deberá recuperar foco.
- **Foco visible:** se incorpora un indicador base para controles/campos que
  no tenían uno; se conservan los indicadores específicos de los componentes.

Se conservaron fallos previos de las regresiones de paneles, calendario, menú
contextual, cancelaciones, selector, Modo Enfoque y menús anidados. Los casos de
campo fecha se ajustaron a su implementación real: texto `name="date"` y orden de
Tab desde el tipo seleccionado, sin cambiar el producto para satisfacer el guion.
Los intentos con WebView oculto, preparación incompleta o interferencia se
descartaron; los recorridos definitivos se ejecutan serialmente y con exclusión
mutua. No se contabilizan esos intentos como incumplimientos ni resultados finales.

## Artefactos identificados

| Campo | Debug previo | Debug definitivo |
|---|---|---|
| Fuente | `b7c3d313fd253f1d0128263bd211fc340225de4c` | `538c906a66e9d8902596b14c260ac8544bd934c4` |
| Versión / código | `0.5.0` / `500` | `0.5.0` / `500` |
| SHA-256 APK | `041a30a1e14e01cbde33007b42afc7a5ec0f39bbf7103c8b5c23753f28775fe2` | `74f1d79f1e0d595fe4837851f6428faca0152c3dac07f4189c2dab221fd2c352` |

Samsung SM-G965F, Android 10/API 29, WebView `155.0.8059.43`. El hash del debug
definitivo compilado coincide con la copia instalada. Certificado SHA-256
conservado: `5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`.
`deploy:android -- --target <dispositivo confirmado>` terminó con exit 0, sin
`--clean`, bump ni publicación. No es el asset de GitHub ni el APK de presentación.

## Resultados

### Método ejecutado

Se preparó cada caso en Entrada, sin filtros, con paneles/diálogos cerrados. Esa
preparación por UI/CDP no se cuenta como recorrido de teclado. Desde ese punto se
alcanzaron los controles mediante Tab, sin sustituir pasos por `focus()` o clicks
sintéticos. Se observaron foco, visibilidad, estado de menús y nombres de controles.

- Tab, Enter, Escape y flecha abajo se inyectaron por ADB (`input keyevent`
  `61`, `66`, `111` y `20`). La consulta de búsqueda se escribió y retiró con
  entrada nativa; no se escribió en el borrador.
- Android 10 no ofrece combinaciones de modificadores en su comando `input`.
  Shift+Tab se comprobó complementariamente con `Input.dispatchKeyEvent` de CDP
  y modificador Shift (`8`), según el [protocolo de Chromium](https://github.com/ChromeDevTools/devtools-protocol/blob/master/pdl/domains/Input.pdl).
  No se presenta como prueba USB/Bluetooth ni como entrada a través de ADB.
- Los eventos observados de ambos métodos tuvieron `isTrusted=true`; eso no los
  convierte en un teclado físico ni demuestra interoperabilidad de hardware.
- En este WebView el selector del editor admite una parada Tab en su contenedor
  desplazable antes de las opciones. K09 se repitió en el mismo APK permitiendo
  esa parada real, sin modificar el producto para imponer otro orden. Los otros
  quince casos corresponden al recorrido definitivo; el CSV distingue sesiones.

El [CSV de evidencia](./evidencia-teclado-rnf-020-2026-10-19.csv) contiene **16 casos
únicos PASS y 268 pasos de navegación registrados**. Los conteos no incluyen la
escritura/borrado de la consulta de búsqueda ni acreditan tiempos de respuesta.

| Caso | Recorrido comprobado | Resultado |
|---|---|---|
| K01 | Panel de notas: entrada, ciclo Tab/Shift+Tab y Escape con retorno | PASS |
| K02 | Opciones de Lumapse: entrada, ciclo y retorno | PASS |
| K03 | Buscar `RNF010`, retirar la consulta y cerrar el panel | PASS |
| K04 | Opciones de materia: foco inicial, ciclo y Escape sin cerrar el drawer | PASS |
| K05 | Abrir Nueva materia y cancelar con Escape al disparador | PASS |
| K06 | Abrir sección y cancelar con retorno, sin crearla | PASS |
| K07 | Abrir renombrado y cancelar sin guardar | PASS |
| K08 | Seleccionar día, abrir fecha, recorrer diálogo/selector y cancelar con retorno | PASS |
| K09 | Título/contenido, foco visible y selector del editor con Escape | PASS |
| K10 | Menús Insertar/Formato: apertura, flecha y Escape, sin aplicar comandos | PASS |
| K11 | Entrar/salir de Modo Enfoque y retornar a Ampliar editor | PASS |
| K12 | Opciones de nota/Mover a: dos Escape cierran primero el submenú y luego el menú | PASS |
| K13 | Acceder a Backup y cambiar a Importar ZIP, sin seleccionar archivos | PASS |
| K14 | Acceder a Acerca de e identificar fuente/canal | PASS |
| K15 | Abrir confirmación de vaciado, ciclar y cancelar; no se vació la papelera | PASS |
| K16 | Limpiar filtro de fecha, conservar foco en calendario y cerrar con retorno | PASS |

Se revisaron cinco capturas del debug definitivo: panel de notas, retorno del
calendario, selector del editor, Backup y confirmación de Papelera. Acerca de
mostró **Android debug · prueba privada**, la fuente completa de la tabla y
**sin cambios locales**. Las capturas permanecen locales porque muestran contenido
preexistente; no se publican bases, borradores ni APK en el repositorio.

Como smoke complementario se ejecutaron **cuatro recorridos táctiles con diez
toques ADB** (`input tap`, coordenadas del render observado): abrir/cerrar panel
de notas, abrir/cerrar opciones, seleccionar/limpiar día y cerrar calendario,
y abrir/cerrar el selector del editor. Todos pasaron sin escrituras. No son una
prueba de ergonomía con el dedo ni un recorrido táctil exhaustivo.

### Conservación de datos y entorno

Antes de probar se identificó un borrador recuperado preexistente. No se guardó,
editó ni descartó. Tampoco se crearon, movieron, archivaron o eliminaron notas,
materias, secciones o fechas; no se importó/exportó un ZIP ni se compartieron datos.
Las cancelaciones y navegación no se presentan como éxito de esas mutaciones.

Al finalizar se compararon hashes SHA-256 del contenido ordenado de las tablas:
**82 notas, 30 materias/secciones, 20 fechas y 2 filas de metadata**, idénticos al
estado previo. También coincidieron valores del borrador y `localStorage` completo,
tras restaurar la preferencia original de plegado. Se dejó Entrada sin filtros,
se restauró `stay_on_while_plugged_in` al valor original `0` y se retiró el forward
ADB temporal y los dos observadores de teclado de la prueba. Tras el smoke táctil
se repitió la comparación, también idéntica. No se borraron datos ni se restauró
una base para aparentar igualdad.

### Verificación automática

| Control ejecutado | Resultado y límite |
|---|---|
| Referencia focal inicial: layout, editor, fechas, feed y ConfirmDialog | 22 archivos / 261 tests PASS, antes de agregar regresiones |
| Regresiones de cancelación/editor/selector | 3 archivos / 89 tests PASS; grupos solapados, no sumar a otras suites |
| Heatmap, main, NoteList y paneles de teclado | 4 archivos / 49 tests PASS sobre los arreglos finales |
| `npm run verify` del código definitivo | Exit 0; 79 archivos / 1206 tests de app, 92 de tooling, build, tipos y controles PASS |
| Lint del código definitivo | Exit 0; tres avisos previos, sin nuevos avisos ni errores |
| `npm run check:docs` sobre la evidencia final | Exit 0; 108 Markdown / 930 enlaces, sin errores |
| `npm run check:traceability` sobre la evidencia final | Exit 0; cero advertencias |
| Suplemento de enlaces de AGENTS, CONTRIBUTING y TODO reutilizando el auditor | 3 archivos / 67 enlaces, cero incidencias |

La verificación automática no sustituye los recorridos Android anteriores ni
acredita hardware de teclado. No se midieron coverage nuevo, tráfico ni rendimiento
como parte de esta unidad; se conservan los controles propios del corte candidato.

## Límites y revisión pendiente

- **RNF-020 permanece en evidencia parcial:** la navegación observada pasa en
  este debug con entrada inyectada, pero no hubo teclado físico, ensayo completo
  de mutaciones, TalkBack, contenido arbitrario ni prueba de otro dispositivo.
- No se extrapola al asset publicado `v0.5.0`, al futuro APK final ni a RNF-019.
  No se obtiene un score Lighthouse ni certificación exhaustiva de accesibilidad.
- La revisión técnica de esta unidad terminó; falta que el autor revise el PR,
  los cambios y estos límites y decida si acepta su integración. Los PASS y el
  gate no sustituyen su aceptación ni postergan automáticamente otros requisitos.
