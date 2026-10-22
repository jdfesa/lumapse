# Revisión de preparación del corte — 2026-10-22

**Rama:** `test/pre-cut-acceptance`<br>
**Base:** `7adea77dd9f9b4a009c4b9d90440bee3af6b48f8`<br>
**Estado:** el autor aceptó el [PR #41](https://github.com/jdfesa/lumapse/pull/41) y
ordenó merge a `main` y posterior eliminación de sus ramas local/remota. Aceptación
general con los límites documentados, sin nuevos resultados manuales por caso.
La integración efectiva se comprueba en GitHub; el corte APK sigue pendiente.

## Objetivo, alcance y aceptación

Preparar una decisión finita de corte, no iniciar otro ciclo de mejoras. El autor
autorizó esta rama, Conventional Commits en inglés, push final y PR; confirmó
teléfono local de pruebas con root y datos eliminables si hiciera falta. Se
prioriza conservarlos. Al retomar pidió continuar con los dos tratamientos
mínimos presentados: contraste de «Agregar fecha» y parches de Vite/Vitest.

Se revisan las observaciones pendientes de Lighthouse, los límites de teclado,
la trazabilidad ADR y los controles técnicos del precorte. Las correcciones no
cambian funciones, layout, arquitectura, schema ni `0.5.0/500`. Quedan fuera las
tareas ya diferidas, refactors, estudios extensos, manual/informe finales,
publicación y generación del APK de presentación.

**Ampliación autorizada por el incidente:** el autor pidió recuperar los datos
antes de seguir y autorizó corregir los scripts utilizados, explicando la causa.
Se añade la protección de despliegue PC-11 y la prueba de actualización compatible;
no se acepta como normal una pérdida involuntaria por tratarse de una beta.
La decisión de tooling adicional queda en [ADR-013](../adr/ADR-013-despliegue-android-sin-desinstalacion-implicita.md).

Pruebas: reproducción y regresiones rojo/verde, auditorías actuales, gate completo,
coverage de servicios y revisión Android proporcional sobre debug identificado.
El autor revisa el PR, el teléfono y los límites propuestos al final. Una prueba
automatizada no sustituye esa aceptación ni valida un candidato futuro.

## Preparación comprobada

- GitHub sin PR abiertos al iniciar; PR #40 integrado. `main` coincidía con
  `origin/main`, sin cambios locales; rama creada desde la base indicada. Al
  retomar se conservaron las regresiones propias sin stash ni cambios de rama.
- Node 22.20.0/npm 10.9.3 existentes: `check:runtime` pasa. Enlaces iniciales:
  109 Markdown/941 enlaces, cero errores; trazabilidad sin advertencias.
- Samsung SM-G965F, Android 10/API 29, root y SQLite comprobados. Doctor Android
  pasa seleccionando SDK/JDK existentes, sin instalaciones ni cambios globales.
- APK inicial: debug privado `92deffdbde07b5ac6a5e9430167970bc9089de5b`,
  `0.5.0/500`; SHA-256
  `bd0f33c69e779e4623d2f5e747bf5f251778a08f49f4b7c10ef7738a94b29b41`.
  Su código de producto coincide con la base de esta rama. Certificado SHA-256:
  `5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`.
- Referencia inicial: 82 notas, 30 materias/secciones, 20 fechas y 2 filas de
  metadata, con borrador existente. Se comparan hashes de tablas y campos del
  editor, no solo conteos. Los temporales contienen datos y no se publican.

## Clasificación de observaciones

Se conserva la [medición original RNF-019](validacion-lighthouse-rnf-019-2026-10-20.md):
40 snapshots, 96–100/100. No se reescriben sus informes ni se equipara `incomplete`
a aprobado. Esta tabla distingue reproducción, impacto y decisión pendiente.

| ID | Observación y comprobación | Tratamiento para el corte |
|---|---|---|
| PC-01 | `color-contrast`, «Agregar fecha», L07: el hover persiste **visible** tras cerrar el diálogo con Escape; no es solo contenido de fondo. Ratio inicial oscuro 1,99:1 y claro 2,80:1. | Defecto concreto a corregir en esta rama; usar el token existente de texto sobre acento, sin rediseño. |
| PC-02 | `target-size`, L13/L14: el menú abierto de una tarjeta cubre el botón de la siguiente. Sin menús abiertos ambos botones miden 28×28 CSS px y los nueve puntos muestreados están libres; con menú abierto el segundo queda cubierto. Escape cierra submenú y menú; una vez estabilizado el cierre se recupera el acceso y abre el segundo menú. | Observación contextual menor propuesta para aceptación, **no** cumplimiento general de 44×44. No se amplía el alcance histórico de RNF-008 ni se rediseñan tarjetas. |
| PC-03 | `aria-allowed-role`: los paneles usan `aside role="dialog"`. Cerrados están `inert`/`aria-hidden` y no se exponen como diálogos en AX; abiertos AX expone un diálogo con nombre correcto. | Advertencia semántica conservada, sin bloqueo funcional reproducido. Propuesta de aceptación del límite; no se declara conformidad ARIA/WCAG ni compatibilidad TalkBack. |
| PC-04 | `aria-valid-attr-value`: el selector del editor referencia un único `composer-subject-menu` existente, `role="listbox"`; al abrir/cerrar cambian coherentemente `hidden` y `aria-expanded`. | No se reprodujo referencia rota. La revisión manual global de tecnologías de asistencia continúa fuera de la evidencia; propuesta de aceptación del límite. |
| PC-05 | `label-content-name-mismatch` incompleto en símbolos `Aa`/`+`: los controles tienen nombres de propósito; no se ejecutó control por voz. | Límite menor propuesto para aceptación, no fallo de nombre vacío ni prueba de voz aprobada. Conservar evidencia de RNF-022. |
| PC-06 | `color-contrast` incompleto por texto recortado/solapado en drawer, estado de borrador, submenú y confirmación. El instrumento no pudo resolver esos casos; PC-01 se separó y reprodujo como defecto real. | No se inventa un ratio ni se descarta como falso positivo. Revisión exhaustiva no demostrada, propuesta de aceptación explícita como límite de cobertura. |
| PC-07 | `aria-prohibited-attr`: el contenedor `span` de acciones académicas tiene `aria-label` sin rol de agrupación; los botones hijos tienen nombres individuales de editar/eliminar. | Observación semántica menor propuesta para aceptación; no se atribuye significado accesible al contenedor ni se certifica lectura en TalkBack. |
| PC-08 | RNF-020: los 16 casos registrados usan entrada ADB/CDP; no hubo teclado físico ni ensayo completo de mutaciones. En esta revisión 12 Tab por tema permanecieron dentro del diálogo y Escape devolvió foco a «Agregar fecha». | Mantener **Evidencia parcial**. Propuesta de aceptar ese alcance para presentación Android, sin afirmar teclado completo ni abrir más pilotos. |
| PC-09 | RNF-026: inventario de decisiones, código e historia contrastados, con ADR retrospectivos identificados. | Revisión documental completada en el [índice ADR](../adr/README.md#revisión-de-trazabilidad-precorte--2026-10-22); no crea decisiones ni reconstruye fechas. |
| PC-10 | Auditoría actual: cuatro paquetes de tooling afectados (tres moderados/un alto); producción en cero. | Parche mínimo de Vite/Vitest en esta rama; no presentar estos advisories de desarrollo como explotación del APK. |
| PC-11 | El despliegue anterior delegaba en `native-run`, que desinstala/reinstala ante firma distinta o downgrade. El debug nuevo tenía otra firma y desaparecieron los datos locales. | Bloqueo operativo confirmado: Instalador protegido y recuperación/actualización compatible verificadas con hashes conservados. Cierre técnico comprobado y aceptación general del autor en PR #41; actualización de release pendiente. No es una observación menor aceptable. |

Las propuestas se presentaron para aceptación, no como postergaciones aprobadas
por silencio. El autor aceptó el PR con esos límites documentados; la aceptación
es general, no una nueva medición ni certificación por caso. No se deriva de ellas
una tarea automática, otro RNF diferido ni un cambio de umbral. El candidato final
requiere todavía sus propios controles y aceptación.

## Correcciones y regresiones

### Contraste localizado

`.heatmap-add-event:hover` usaba `--color-text-bright` sobre `--color-accent`:
blanco sobre violeta claro en oscuro y texto oscuro sobre violeta oscuro en claro.
Se sustituye únicamente por `--color-on-accent`. Las dos regresiones numéricas por
tema y el guard de token fallaron antes; pasan después. No cambia tamaño, foco,
diálogo ni persistencia. La evidencia anterior de RNF-021 conserva su alcance;
este caso adicional no estaba acreditado por sus fixtures.

### Dependencias de desarrollo

Vite 6.4.3 → **6.4.4**; Vitest y los ocho paquetes `@vitest/*` 4.1.11 →
**4.1.12**. Cambian diez nodos de desarrollo y tres mínimos directos; las 356
entradas del lockfile se conservan y el grafo productivo es idéntico. Sin majors,
dependencias nuevas, overrides permanentes ni cambios de runtime.

Referencias primarias consultadas:

- [Vite: rutas fuera de `server.fs.allow`](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22),
  condicionado a servidor de desarrollo alcanzable y coincidencia de rutas en
  hosts no Windows.
- [Vitest: URL de mock manual como código](https://github.com/vitest-dev/vitest/security/advisories/GHSA-qxg6-89mg-rqv8)
  y [bypass por backslash en Windows](https://github.com/vitest-dev/vitest/security/advisories/GHSA-xp26-3454-mjgp).
  Lumapse no registra esos plugins como servidor de la app; el APK no los ejecuta.

La auditoría inicial también listaba los demás avisos de Vite corregidos por
6.4.4; sus condiciones no se prueban aquí. La configuración del proyecto no
declara `server.host` ni middleware personalizado. Esto limita aplicabilidad,
no justifica conservar dependencias afectadas.

Tres regresiones nuevas usan solo fixtures: permiso de archivo externo en Vite,
normalización de redirect y URL manual tratada como dato en Vitest. Fallaron en
las versiones iniciales; las cuatro regresiones anteriores del mocker siguen
pasando. No se abren puertos, no se leen archivos reales externos ni se simula
una ejecución nativa Windows. En POSIX el bypass inicial intenta leer un nombre
literal con backslash y falla con ENOENT: eso no es prueba de exfiltración Windows.

npm 10.9.3 reprodujo el fallo previo de Arborist (`edgesOut`) al explorar peers
opcionales fuera del objetivo. Se generó el candidato en un temporal con pins
exactos y override temporal de Vite; se retiró el override, restauraron rangos,
validó instalación normal del lock y exigió la diferencia estructural mínima
antes de adoptarlo. `npm ci` normal y `npm ls --all --json` pasan. No se usaron
`audit fix`, `--force`, `--legacy-peer-deps` ni otro npm.

## Verificación del cambio

Con Node/npm canónicos:

```bash
npm ci
npm ls --all --json
node --test tests/tooling/rnf-021-contrast.test.js tests/tooling/vitest-mocker.test.js tests/tooling/vite-file-allowlist.test.js
npm audit --json
npm audit --omit=dev --json
npm run verify
npm run test:coverage -- --maxWorkers=1 --allowOnly=false
git diff --check
```

| Control | Resultado |
|---|---|
| Regresiones focalizadas antes → después | 14 PASS/6 FAIL → **20/20 PASS**; incluye el guard existente ampliado y cinco casos nuevos |
| Auditoría completa antes → después | 4 paquetes afectados → **0** |
| Auditoría de producción antes → después | **0 → 0** |
| Gate completo inicial, antes de las regresiones nuevas | PASS; no sustituye el gate final |
| Gate completo con protección de despliegue | PASS, 79 archivos/1211 tests de app y **105 de tooling**; tres warnings previos de lint, cero errores. Repetido al cierre con el mismo resultado; enlaces 111 Markdown/1006 referencias y trazabilidad sin errores |
| Coverage de servicios | **96,06% statements (2095/2181)** en 42 archivos de `src/services/**`, JS/TS y subdirectorios incluidos; supera el 70%. Suite 1211/1211 PASS |
| Android del debug corregido | Actualización compatible y recorrido en ambos temas PASS en el binario identificado abajo; datos/borrador/preferencias conservados tras recuperación |

## Incidente de despliegue y recuperación

El primer despliegue de esta rama (`6254495`) usó el script habitual sin
`--clean`, terminó en exit 0 e instaló `0.5.0/500`, SHA-256
`c7bcd98475ac11a61b1b476934939223105719cbd51e06c5f9bed70dc6ef568a`.
Su certificado era `c03d6fa99cbce0709aa711e2ae95b7f81e0eae17e1aff0c788bf7270b9d8d093`,
distinto del inicial. Debió verificarse **antes** de invocar el instalador.
Después había 0 notas/0 materias/0 fechas y borrador vacío: no se conservó el estado.

El código instalado de `native-run 2.0.3`,
`dist/android/utils/run.js:installApkToDevice`, captura
`ERR_INCOMPATIBLE_UPDATE`/`ERR_VERSION_DOWNGRADE`, llama `uninstallApp` y reintenta.
La firma distinta, la nueva `firstInstallTime` y el estado vacío concuerdan con
ese fallback; el log resumido de Capacitor no expuso la operación intermedia.
No se atribuye la eliminación a la corrección CSS, a una migración SQLite ni al
instalador normal de APK del usuario. Tampoco se utiliza el permiso sobre datos
de prueba para presentar como intencional lo sucedido.

El autor autorizó la recuperación antes de continuar. Se revisó una copia SQLite
íntegra del 2026-10-13 (85 notas); excluyendo las tres notas de papelera ya
ausentes en el estado inicial, **el conjunto de 82 notas coincide exactamente
con su hash previo**. Materias, fechas y metadata ya coincidían. No se restauró
un estado aproximado: las cuatro tablas se compararon antes de escribir.
Se insertaron en una transacción sobre la base vacía; `integrity_check=ok` y
`foreign_key_check` sin filas. Se recuperaron también preferencias y borrador.

Durante la rehidratación se recargó la WebView sin cerrar antes el estado nativo,
lo que produjo `CreateConnection: Connection lumapse-db already exists` y la
pantalla segura de fallo de arranque. Las 82 notas seguían presentes y la base
íntegra. Se cerró esa conexión y se usó Reintentar: la app volvió a montar el
editor. **Las cuatro tablas, campos del borrador y localStorage coinciden por
hash/valor con la referencia anterior al incidente.** No se borró ni recreó la
base para resolver ese error; no se añade una corrección de producto no acordada
por una recarga externa del procedimiento.

El recorrido inicial posterior al despliegue alcanzó tres snapshots oscuros de
100/100 y ratio hover 8,82:1, pero falló después al buscar tarjetas inexistentes
en la base vacía; exit 1. No se presenta como validación final en ambos temas.
Se conserva separado de la repetición posterior a recuperar los datos.

**Corrección autorizada:** Gradle construye sin `native-run`; `apksigner` verifica
firmantes del APK candidato y del instalado y exige igualdad antes de actualizar.
Si no puede comprobarlos, aborta. La instalación directa `adb install -r -t`
no tiene fallback; rechazos, downgrade y `Failure` incluso con exit 0 detienen
el script. `--clean` continúa siendo destructivo y explícito, pero no ocurre
antes de compilar/verificar. No se gestionaron claves privadas ni se firmó una release.
Ocho regresiones sintéticas fallaron con el flujo anterior y pasan con el nuevo.
Un harness adicional usa los dos APK reales (firmas distintas), `apksigner` real
y ADB limitado a lectura; el script aborta por incompatibilidad **sin emitir
ninguna llamada install/uninstall**. El build de ese harness usa el APK anterior
como fixture y no se presenta como una instalación real. La comprobación nativa
compatible posterior pasa y se identifica a continuación.

## Debug definitivo y comprobación posterior a la recuperación

- **Fuente limpia:** `e0700f6c36c5a3187a9f0b9ef4c14d8c0e781127`, confirmada en
  Acerca de como Android debug · prueba privada, sin cambios locales.
- **Versión/code:** `0.5.0/500`; no es el asset de GitHub ni un candidato de release.
- **SHA-256 compilado e instalado, iguales:**
  `0fd3f92922b4cebb93d338c20f4fc7d82f7b21476aa712685ffcb051fdb85542`.
- **Certificado SHA-256:**
  `c03d6fa99cbce0709aa711e2ae95b7f81e0eae17e1aff0c788bf7270b9d8d093`.
  Es el certificado del debug nuevo del incidente, **no** el original ni una
  identidad de firma aprobada para distribución.
- **Actualización real con script corregido:** exit 0, Gradle/ADB sin `--clean`,
  sin desinstalación; `firstInstallTime` permanece `2026-10-22 12:26:07` y
  `lastUpdateTime` pasa a `12:48:28` (Argentina). Antes/después coinciden hashes
  de las cuatro tablas, borrador y preferencias; 82/30/20/2 filas conservadas.
  Esto verifica actualización debug compatible, no desde la beta firmada pública.

Se repitieron calendario, diálogo, retorno con Escape y menús en ambos temas
sobre ese binario. Se midió contraste con colores computados y composición alfa,
con el helper sRGB ya probado; Lighthouse usa las mismas versiones y opciones
sin emulación, recarga ni limpieza de storage del [método RNF-019](validacion-lighthouse-rnf-019-2026-10-20.md#método-ejecutado-y-reproducción).
Los snapshots son **seis nuevos**, no una repetición de las cuarenta escenas.

| Tema | Escena | Ratio «Agregar fecha» | Lighthouse | Puntos libres del botón |
|---|---|---:|---:|---:|
| Oscuro | Antes de abrir diálogo | 6,50:1 | 100 | 9/9 |
| Oscuro | Diálogo abierto, botón subyacente | 8,82:1 | 100 | 0/9 |
| Oscuro | Diálogo cerrado con Escape, hover/foco persistentes | 8,82:1 | 100 | 9/9 |
| Claro | Antes de abrir diálogo | 5,19:1 | 100 | 9/9 |
| Claro | Diálogo abierto, botón subyacente | 6,29:1 | 100 | 0/9 |
| Claro | Diálogo cerrado con Escape, hover/foco persistentes | 6,29:1 | 100 | 9/9 |

Sin errores de runtime/auditoría ni avisos Lighthouse en los seis snapshots.
Se revisaron visualmente las dos capturas tras Escape. Doce Tab por tema
permanecieron dentro del diálogo y Escape retornó a «Agregar fecha». Tras cerrar
los menús y esperar su transición, los dos botones de tarjeta recuperan 9/9
puntos libres en ambos temas; no cambia su geometría de 28×28 ni se ejecutan
mutaciones de notas/fechas. PC-02 a PC-08 conservan los límites propuestos.

El runner definitivo terminó en exit 0. Al finalizar se retiró únicamente la
preferencia de tema introducida por la prueba y el forward ADB propio; Entrada,
tema oscuro y posición inicial restaurados. Tras consultar Acerca de y volver,
se comprobó otra vez igualdad completa con la referencia **anterior al incidente**
de tablas, borrador y localStorage. No queda pantalla de error de arranque.

Una ejecución intermedia del gate rechazó la aserción histórica que exigía
literalmente `cap run` en la prueba de metadata. Se actualizó para exigir canal
debug, ADB sin fallback y ausencia de release; los controles no se omitieron.
La suite de instalador/metadata pasa 15/15 y el gate completo posterior 105/1211.
Las evidencias privadas permanecen ignoradas bajo `tmp/pre-cut-acceptance-2026-10-22/`;
no se versionan bases, borradores, claves, APK ni capturas con contenido.

Se confirmaron también, contra ADR-005/006 y el canal APK actual, los RNF obsoletos
001/011/017 y no aplicables al APK 014/015/016; no se cambiaron criterios ni se
reutilizaron pruebas de hosting/PWA. La matriz final se emitirá sobre el candidato.

## No negociables y decisión de corte

La propuesta para que esta sea la última rama técnica antes del corte se limita a:

1. **Sin bloqueantes confirmados** de pérdidas, corrupción, duplicación, núcleo
   offline, seguridad o privacidad abiertos. No equivale a ausencia universal de bugs.
2. **Controles sobre la fuente candidata:** `verify` completo, auditorías completa
   y productiva sin vulnerabilidades conocidas pendientes y coverage de servicios
   ≥70%; repetir en el corte, sin heredar cifras como nuevas.
3. **Límites explícitos:** aceptar PC-02 a PC-08 con su impacto visible, sin
   marcar RNF-020 como verificado ni certificar accesibilidad exhaustiva.
4. **APK nuevo autorizado e inequívoco:** acordar versión/code nuevos, fuente,
   canal, firma de distribución compatible con la beta publicada y SHA-256;
   preservar las betas publicadas. Sin identidad compatible se detiene la entrega,
   no se pide al usuario desinstalar. Este PR no genera ese corte.
5. **Validar y aceptar ese binario exacto:** actualización compatible desde la
   beta firmada con notas/borrador, **sin desinstalación y con datos conservados**;
   abortar ante firma incompatible, sin pedir borrar como solución. Además,
   instalación/apertura, núcleo offline,
   conservación de datos/borrador, organización/búsqueda, fechas y ZIP local;
   repetir tráfico/trackers de RNF-012/013 y los casos afectados por cambios.
   Registrar la aceptación del autor; no repetir investigaciones de tareas cerradas.

**Recomendación técnica:** esta puede ser la última rama de correcciones previa
al corte. PC-01, PC-10 y PC-11 tienen tratamiento técnico verificado; no se
identificó otro bloqueante confirmado en el alcance revisado. Esto no sustituye
la aceptación de límites ni los controles/actualización del candidato firmado.

Tras eso corresponde congelar desarrollo y trabajar en manual, matriz, informe y
defensa sobre el mismo APK. No hace falta abrir otra rama de mejoras por rutina.
Las métricas CRUD/FPS y RNF-005 conservan sus tratamientos ya acordados; ninguna
otra ausencia se considera diferida por silencio.

### Aceptación y continuidad

- [x] El autor acepta el PR #41 en su alcance y con los límites PC-02 a PC-08 y
  criterios de corte documentados. Aceptación general; no se recibieron nuevos
  resultados manuales de «Agregar fecha», teclado, TalkBack u otros casos.
- [x] El autor ordena merge a `main` y, una vez comprobado, eliminar las ramas
  local y remota. El HEAD y sus checks deben verificarse antes de integrar;
  el estado efectivo de integración es el del PR en GitHub.
- [ ] Tras comprobar el cierre, acordar versión y autorizar la preparación del
  candidato firmado, incluyendo actualización con datos desde la beta publicada.

Esta aceptación no autoriza APK final, publicación ni congelación y no transforma
la evidencia parcial de RNF-020 en verificación completa. No se rellenan pruebas
manuales por deducción ni se repiten mediciones ya cerradas.
